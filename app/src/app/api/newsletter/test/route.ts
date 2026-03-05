import { NextRequest, NextResponse } from "next/server";
import { getLatestIssues, getSignalsByIssue } from "@/lib/newsletter";
import { buildNewsletterHtml } from "@/lib/newsletter-email";
import type { NewsletterMeta } from "@/lib/newsletter-ai";
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

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const authParam = req.nextUrl.searchParams.get("key");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}` && authParam !== cronSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const issues = await getLatestIssues(1);
    if (issues.length === 0) {
      return NextResponse.json({ error: "No issues found. Run the cron first." }, { status: 404 });
    }

    const issue = issues[0];
    const signals = await getSignalsByIssue(issue.id);
    if (signals.length === 0) {
      return NextResponse.json({ error: "No signals found for latest issue." }, { status: 404 });
    }

    const meta: NewsletterMeta = {
      subject: issue.subject,
      intro: issue.intro_text || "",
      main_insight: issue.main_insight || "",
      radar_rising: issue.radar_rising || [],
      radar_stable: issue.radar_stable || [],
      radar_declining: issue.radar_declining || [],
      curiosity_hook: issue.curiosity_hook || "",
      closing_thought: issue.closing_thought || "",
      quick_scan_biggest: { signal_title: issue.qs_biggest_title || "", text: issue.qs_biggest_text || "" },
      quick_scan_overhyped: { signal_title: issue.qs_overhyped_title || "", text: issue.qs_overhyped_text || "" },
      quick_scan_quiet: { signal_title: issue.qs_quiet_title || "", text: issue.qs_quiet_text || "" },
    };

    // Map DB signals to InterpretedSignal shape for the email builder
    const interpretedSignals = signals.map((s) => ({
      ...s,
      raw_titles: [] as string[],
    }));

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://shreyanssoni.vercel.app";
    const email = process.env.SUPPORT_EMAIL!;
    const token = Buffer.from(email + (process.env.CRON_SECRET || "")).toString("base64url");
    const unsubscribeUrl = `${baseUrl}/api/newsletter/unsubscribe?email=${encodeURIComponent(email)}&token=${token}`;

    const html = buildNewsletterHtml(meta, interpretedSignals, issue.issue_date, unsubscribeUrl);

    // Send test email
    await transporter.sendMail({
      from: `"The Daily Signal [TEST]" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: `[TEST] ${meta.subject}`,
      html,
    });

    // Also return the HTML so you can preview in browser
    const preview = req.nextUrl.searchParams.get("preview");
    if (preview === "1") {
      return new NextResponse(html, {
        headers: { "Content-Type": "text/html" },
      });
    }

    return NextResponse.json({
      success: true,
      sent_to: email,
      issue_date: issue.issue_date,
      signal_count: signals.length,
    });
  } catch (error) {
    console.error("[Newsletter Test] Error:", error);
    return NextResponse.json(
      { error: "Test failed", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
