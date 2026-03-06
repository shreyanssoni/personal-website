import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { signal_id, issue_id, platform } = await req.json();

    if ((!signal_id && !issue_id) || !platform) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const validPlatforms = ["copy", "twitter", "whatsapp", "linkedin"];
    if (!validPlatforms.includes(platform)) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    // Simple rate-limit: check if same target+platform was tracked in last 10s
    const recent = signal_id
      ? await sql`
          SELECT 1 FROM share_clicks
          WHERE signal_id = ${signal_id} AND platform = ${platform}
            AND clicked_at > NOW() - INTERVAL '10 seconds'
          LIMIT 1
        `
      : await sql`
          SELECT 1 FROM share_clicks
          WHERE issue_id = ${issue_id} AND signal_id IS NULL AND platform = ${platform}
            AND clicked_at > NOW() - INTERVAL '10 seconds'
          LIMIT 1
        `;

    if ((recent as unknown[]).length === 0) {
      if (signal_id) {
        await sql`
          INSERT INTO share_clicks (signal_id, platform)
          VALUES (${signal_id}, ${platform})
        `;
      } else {
        await sql`
          INSERT INTO share_clicks (issue_id, platform)
          VALUES (${issue_id}, ${platform})
        `;
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[Share Track] Error:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
