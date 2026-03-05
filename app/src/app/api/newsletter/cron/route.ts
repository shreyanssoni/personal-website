import { NextRequest, NextResponse } from "next/server";
import { fetchAllSources } from "@/lib/newsletter-sources";
import {
  selectSignals,
  interpretSignals,
  generateNewsletterMeta,
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

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date().toISOString().split("T")[0];

  try {
    const existing = await getIssueByDate(today);
    if (existing?.sent_at) {
      return NextResponse.json({ message: "Already sent today", issue_id: existing.id });
    }

    console.log("[Newsletter] Step 1: Fetching sources...");
    await fetchAllSources();

    console.log("[Newsletter] Step 2: Loading raw items...");
    const rawItems = await getTodaysRawItems();
    if (rawItems.length === 0) {
      return NextResponse.json({ message: "No raw items fetched", raw_count: 0 });
    }

    console.log(`[Newsletter] Step 3: Selecting signals from ${rawItems.length} items...`);
    const selectedSignals = await selectSignals(rawItems);
    if (selectedSignals.length === 0) {
      return NextResponse.json({ message: "No signals selected", raw_count: rawItems.length });
    }

    console.log("[Newsletter] Step 4: Scoring & interpreting...");
    const interpretedSignals = await interpretSignals(selectedSignals);
    if (interpretedSignals.length === 0) {
      return NextResponse.json({ message: "Interpretation failed", raw_count: rawItems.length });
    }

    console.log("[Newsletter] Step 5: Generating meta (subject, radar, insight)...");
    const meta = await generateNewsletterMeta(interpretedSignals);

    console.log("[Newsletter] Step 6: Storing...");
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
      raw_count: rawItems.length,
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
      });
    }

    console.log("[Newsletter] Step 7: Sending emails...");
    const subscribers = await sql`
      SELECT email FROM subscribers WHERE status = 'A'
    ` as unknown as { email: string }[];

    const ownerEmail = process.env.SUPPORT_EMAIL;
    const recipientEmails = new Set(subscribers.map((s) => s.email));
    if (ownerEmail) recipientEmails.add(ownerEmail);

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://themicrobits.com";

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
    console.log("[Newsletter] Done!");

    return NextResponse.json({
      success: true,
      issue_id: issueId,
      date: today,
      raw_count: rawItems.length,
      signal_count: interpretedSignals.length,
      recipients: recipientEmails.size,
      subject: meta.subject,
    });
  } catch (error) {
    console.error("[Newsletter] Pipeline error:", error);
    return NextResponse.json(
      { error: "Newsletter pipeline failed", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
