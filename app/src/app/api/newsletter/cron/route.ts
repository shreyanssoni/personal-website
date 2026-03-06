import { NextRequest, NextResponse, after } from "next/server";
import { fetchAllSources } from "@/lib/newsletter-sources";
import {
  selectSignals,
  interpretSignals,
  generateNewsletterMeta,
  generateDeepDives,
} from "@/lib/newsletter-ai";
import {
  getTodaysRawItems,
  createIssue,
  deleteSignalsByIssue,
  insertSignal,
  markIssueSent,
  getIssueByDate,
} from "@/lib/newsletter";
import { buildNewsletterHtml } from "@/lib/newsletter-email";
import { sql } from "@/lib/db";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const maxDuration = 60;

function getBaseUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || "https://shreyanssoni.vercel.app";
}

function authCheck(req: NextRequest): boolean {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  return !cronSecret || authHeader === `Bearer ${cronSecret}`;
}

/**
 * Pipeline is split into steps to stay under 60s Vercel Hobby limit.
 * cron-job.org hits: /api/newsletter/cron (no step param = full chain)
 * Each step calls the next via fetch to get a fresh 60s window.
 */
export async function GET(req: NextRequest) {
  if (!authCheck(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const step = req.nextUrl.searchParams.get("step") || "1";
  const today = new Date().toISOString().split("T")[0];

  try {
    switch (step) {
      case "1":
        return await step1_fetch(today, req);
      case "2":
        return await step2_select(today, req);
      case "3":
        return await step3_interpret(today, req);
      case "4":
        return await step4_enrich_store(today, req);
      case "5":
        return await step5_email(today, req);
      default:
        return NextResponse.json({ error: "Unknown step" }, { status: 400 });
    }
  } catch (error) {
    console.error(`[Newsletter] Step ${step} error:`, error);
    return NextResponse.json(
      { error: `Step ${step} failed`, details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

/** Fire-and-forget the next step — uses after() to keep the function alive until the request is sent */
function triggerNextStep(step: number, req: NextRequest) {
  const baseUrl = getBaseUrl();
  const authHeader = req.headers.get("authorization");
  after(async () => {
    try {
      await fetch(`${baseUrl}/api/newsletter/cron?step=${step}`, {
        headers: authHeader ? { authorization: authHeader } : {},
      });
    } catch (e) {
      console.error(`[Newsletter] Failed to trigger step ${step}:`, e);
    }
  });
}

/* ─── Step 1: Fetch all sources ─── */
async function step1_fetch(today: string, req: NextRequest) {
  const existing = await getIssueByDate(today);
  if (existing?.sent_at) {
    return NextResponse.json({ message: "Already sent today", issue_id: existing.id });
  }

  console.log("[Newsletter] Step 1: Fetching sources...");
  await fetchAllSources();

  // Fire off step 2 and return immediately
  triggerNextStep(2, req);
  return NextResponse.json({ step: 1, status: "done", next: 2 });
}

/* ─── Step 2: Select signals via AI ─── */
async function step2_select(today: string, req: NextRequest) {
  console.log("[Newsletter] Step 2: Loading raw items & selecting signals...");
  const rawItems = await getTodaysRawItems();
  if (rawItems.length === 0) {
    return NextResponse.json({ message: "No raw items", raw_count: 0 });
  }

  const selectedSignals = await selectSignals(rawItems);
  if (selectedSignals.length === 0) {
    return NextResponse.json({ message: "No signals selected", raw_count: rawItems.length });
  }

  // Store selected signals temporarily in DB for next step
  await sql`
    INSERT INTO newsletter_pipeline_state (date, step, data)
    VALUES (${today}, 'selected', ${JSON.stringify(selectedSignals)}::jsonb)
    ON CONFLICT (date, step) DO UPDATE SET data = EXCLUDED.data, updated_at = now()
  `;

  triggerNextStep(3, req);
  return NextResponse.json({ step: 2, raw_count: rawItems.length, selected: selectedSignals.length, next: 3 });
}

/* ─── Step 3: Interpret & score signals ─── */
async function step3_interpret(today: string, req: NextRequest) {
  console.log("[Newsletter] Step 3: Interpreting signals...");

  const rows = await sql`
    SELECT data FROM newsletter_pipeline_state WHERE date = ${today} AND step = 'selected'
  ` as unknown as { data: string }[];

  if (!rows.length) {
    return NextResponse.json({ error: "No selected signals found for today" }, { status: 400 });
  }

  const selectedSignals = typeof rows[0].data === "string" ? JSON.parse(rows[0].data) : rows[0].data;
  const interpretedSignals = await interpretSignals(selectedSignals);

  if (interpretedSignals.length === 0) {
    return NextResponse.json({ message: "Interpretation failed" });
  }

  await sql`
    INSERT INTO newsletter_pipeline_state (date, step, data)
    VALUES (${today}, 'interpreted', ${JSON.stringify(interpretedSignals)}::jsonb)
    ON CONFLICT (date, step) DO UPDATE SET data = EXCLUDED.data, updated_at = now()
  `;

  triggerNextStep(4, req);
  return NextResponse.json({ step: 3, interpreted: interpretedSignals.length, next: 4 });
}

/* ─── Step 4: Deep dives + meta + store in DB ─── */
async function step4_enrich_store(today: string, req: NextRequest) {
  console.log("[Newsletter] Step 4: Deep dives, meta, storing...");

  const rows = await sql`
    SELECT data FROM newsletter_pipeline_state WHERE date = ${today} AND step = 'interpreted'
  ` as unknown as { data: string }[];

  if (!rows.length) {
    return NextResponse.json({ error: "No interpreted signals found" }, { status: 400 });
  }

  const interpretedSignals = typeof rows[0].data === "string" ? JSON.parse(rows[0].data) : rows[0].data;

  const [meta, deepDives] = await Promise.all([
    generateNewsletterMeta(interpretedSignals),
    generateDeepDives(interpretedSignals),
  ]);

  const deepDiveMap = new Map(deepDives.map((d: { title: string; deep_dive: string }) => [d.title, d.deep_dive]));

  const rawCountRows = await sql`
    SELECT COUNT(*) as count FROM raw_feed_items
    WHERE fetched_at::date = ${today}::date
  ` as unknown as { count: string }[];
  const rawCount = parseInt(rawCountRows[0]?.count || "0", 10);

  const issueId = await createIssue({
    date: today,
    subject: meta.subject,
    intro_text: meta.intro,
    main_insight: meta.main_insight,
    radar_rising: meta.radar_rising || [],
    radar_stable: meta.radar_stable || [],
    radar_declining: meta.radar_declining || [],
    curiosity_hook: meta.curiosity_hook,
    closing_thought: meta.closing_thought,
    qs_biggest_title: meta.quick_scan_biggest?.signal_title || "",
    qs_biggest_text: meta.quick_scan_biggest?.text || "",
    qs_overhyped_title: meta.quick_scan_overhyped?.signal_title || "",
    qs_overhyped_text: meta.quick_scan_overhyped?.text || "",
    qs_quiet_title: meta.quick_scan_quiet?.signal_title || "",
    qs_quiet_text: meta.quick_scan_quiet?.text || "",
    raw_count: rawCount,
    signal_count: interpretedSignals.length,
  });

  await deleteSignalsByIssue(issueId);

  for (const signal of interpretedSignals) {
    await insertSignal({
      issue_id: issueId,
      category: signal.category || "tool",
      title: signal.title || "Untitled Signal",
      source_urls: signal.source_urls || [],
      summary: signal.summary || "",
      delta: signal.delta || "",
      impact: signal.impact || "",
      who_should_care: signal.who_should_care || "",
      hype_or_real: signal.hype_or_real || "Mixed",
      builder_opportunities: signal.builder_opportunities || "",
      how_to_use: signal.how_to_use || "",
      impact_score: signal.impact_score || 3,
      confidence: signal.confidence || "medium",
      time_horizon: signal.time_horizon || "now",
      so_what: signal.so_what || "",
      display_order: signal.display_order || 0,
      deep_dive: deepDiveMap.get(signal.title) || undefined,
    });
  }

  // Store meta + issueId for email step
  await sql`
    INSERT INTO newsletter_pipeline_state (date, step, data)
    VALUES (${today}, 'stored', ${JSON.stringify({ issueId, meta, signalCount: interpretedSignals.length })}::jsonb)
    ON CONFLICT (date, step) DO UPDATE SET data = EXCLUDED.data, updated_at = now()
  `;

  triggerNextStep(5, req);
  return NextResponse.json({ step: 4, issue_id: issueId, signals: interpretedSignals.length, next: 5 });
}

/* ─── Step 5: Send emails ─── */
async function step5_email(today: string, _req: NextRequest) {
  console.log("[Newsletter] Step 5: Sending emails...");

  const rows = await sql`
    SELECT data FROM newsletter_pipeline_state WHERE date = ${today} AND step = 'stored'
  ` as unknown as { data: string }[];

  if (!rows.length) {
    return NextResponse.json({ error: "No stored data found" }, { status: 400 });
  }

  const { issueId, meta, signalCount } = typeof rows[0].data === "string" ? JSON.parse(rows[0].data) : rows[0].data;

  // Re-fetch interpreted signals for email HTML
  const interpretedRows = await sql`
    SELECT data FROM newsletter_pipeline_state WHERE date = ${today} AND step = 'interpreted'
  ` as unknown as { data: string }[];

  const interpretedSignals = interpretedRows.length
    ? (typeof interpretedRows[0].data === "string" ? JSON.parse(interpretedRows[0].data) : interpretedRows[0].data)
    : [];

  const subscribers = await sql`
    SELECT email FROM subscribers WHERE status = 'A'
  ` as unknown as { email: string }[];

  const ownerEmail = process.env.SUPPORT_EMAIL;
  const recipientEmails = new Set(subscribers.map((s: { email: string }) => s.email));
  if (ownerEmail) recipientEmails.add(ownerEmail);

  const baseUrl = getBaseUrl();

  for (const email of recipientEmails) {
    const token = Buffer.from(email + (process.env.CRON_SECRET || "")).toString("base64url");
    const unsubscribeUrl = `${baseUrl}/api/newsletter/unsubscribe?email=${encodeURIComponent(email)}&token=${token}`;
    const html = buildNewsletterHtml(meta, interpretedSignals, today, unsubscribeUrl);

    try {
      await transporter.sendMail({
        from: `"The Daily Signal" <${process.env.EMAIL_FROM}>`,
        to: email,
        subject: meta.subject,
        html,
        headers: {
          "List-Unsubscribe": `<${unsubscribeUrl}>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
      });
    } catch (emailErr) {
      console.error(`[Newsletter] Failed to send to ${email}:`, emailErr);
    }
  }

  await markIssueSent(issueId);

  // Clean up pipeline state
  await sql`DELETE FROM newsletter_pipeline_state WHERE date = ${today}`;

  console.log("[Newsletter] Done!");
  return NextResponse.json({
    step: 5,
    success: true,
    issue_id: issueId,
    date: today,
    signal_count: signalCount,
    recipients: recipientEmails.size,
    subject: meta.subject,
  });
}
