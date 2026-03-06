import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { sql } from "@/lib/db";
import { suggestThreads } from "@/lib/newsletter-ai";

export const maxDuration = 60;

export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const signals = await sql`
      SELECT s.id, s.title, s.category, s.so_what, i.issue_date
      FROM newsletter_signals s
      JOIN newsletter_issues i ON i.id = s.issue_id
      WHERE i.issue_date >= CURRENT_DATE - INTERVAL '30 days'
      ORDER BY i.issue_date DESC
    ` as unknown as { id: number; title: string; category: string; so_what: string; issue_date: string }[];

    if (signals.length === 0) {
      return NextResponse.json({ suggestions: [], message: "No signals in the last 30 days" });
    }

    const suggestions = await suggestThreads(signals);
    return NextResponse.json({ suggestions });
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to generate suggestions", details: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
