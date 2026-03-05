import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { sql } from "@/lib/db";

export const runtime = "edge";

const CATEGORY_COLORS: Record<string, { bg: string; accent: string; emoji: string }> = {
  launch:      { bg: "#FFF5F5", accent: "#FF6B6B", emoji: "🚀" },
  shift:       { bg: "#F0F4FF", accent: "#4F8CFF", emoji: "📈" },
  tool:        { bg: "#F0FFF4", accent: "#2ECC71", emoji: "🔧" },
  research:    { bg: "#F5F3FF", accent: "#8E7CFF", emoji: "🔬" },
  funding:     { bg: "#FFFBEB", accent: "#F4B942", emoji: "💰" },
  open_source: { bg: "#F0FFFC", accent: "#1ABC9C", emoji: "📦" },
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const signalId = parseInt(id, 10);
  if (isNaN(signalId)) {
    return new Response("Invalid signal ID", { status: 400 });
  }

  // Fetch signal + issue date
  const rows = await sql`
    SELECT s.title, s.category, s.so_what, s.impact_score, s.hype_or_real,
           i.issue_date
    FROM newsletter_signals s
    JOIN newsletter_issues i ON i.id = s.issue_id
    WHERE s.id = ${signalId}
    LIMIT 1
  `;

  if (!rows || (rows as unknown[]).length === 0) {
    return new Response("Signal not found", { status: 404 });
  }

  const signal = (rows as unknown as {
    title: string;
    category: string;
    so_what: string;
    impact_score: number;
    hype_or_real: string;
    issue_date: string | Date;
  }[])[0];

  const colors = CATEGORY_COLORS[signal.category] || CATEGORY_COLORS.tool;
  const dateStr = typeof signal.issue_date === "object" && signal.issue_date !== null && "toISOString" in signal.issue_date
    ? (signal.issue_date as Date).toISOString().slice(0, 10)
    : String(signal.issue_date).slice(0, 10);

  const impactDots = Array.from({ length: 5 }, (_, i) => i < signal.impact_score);

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          fontFamily: "system-ui, -apple-system, sans-serif",
          background: `linear-gradient(135deg, ${colors.bg} 0%, #FAFAF8 40%, #FFFFFF 100%)`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background decoration */}
        <div
          style={{
            position: "absolute",
            top: "-80px",
            right: "-80px",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${colors.accent}15, transparent 70%)`,
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-60px",
            left: "-60px",
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${colors.accent}10, transparent 70%)`,
            display: "flex",
          }}
        />

        {/* Top bar */}
        <div
          style={{
            height: "6px",
            background: `linear-gradient(90deg, ${colors.accent}, ${colors.accent}80, transparent)`,
            display: "flex",
          }}
        />

        {/* Content */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            padding: "48px 56px 40px",
          }}
        >
          {/* Header row */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "32px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 14px",
                borderRadius: "8px",
                background: `${colors.accent}18`,
                border: `1px solid ${colors.accent}30`,
              }}
            >
              <span style={{ fontSize: "16px" }}>{colors.emoji}</span>
              <span style={{ fontSize: "13px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: colors.accent }}>
                {signal.category.replace("_", " ")}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "13px", color: "#9CA3AF", letterSpacing: "0.05em" }}>
                {dateStr}
              </span>
            </div>
          </div>

          {/* Title */}
          <div style={{ display: "flex", flex: 1, flexDirection: "column", justifyContent: "center", marginBottom: "24px" }}>
            <h1
              style={{
                fontSize: signal.title.length > 60 ? "42px" : "52px",
                fontWeight: 700,
                color: "#1A1A1A",
                lineHeight: 1.15,
                margin: 0,
                letterSpacing: "-0.02em",
                maxWidth: "900px",
              }}
            >
              {signal.title}
            </h1>

            {/* So what */}
            {signal.so_what && (
              <p
                style={{
                  fontSize: "22px",
                  color: "#6B7280",
                  lineHeight: 1.5,
                  marginTop: "20px",
                  maxWidth: "850px",
                  display: signal.so_what.length > 120 ? "none" : "flex",
                }}
              >
                {signal.so_what}
              </p>
            )}
          </div>

          {/* Bottom row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            {/* Impact meter */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase" as const, color: "#9CA3AF" }}>
                Impact
              </span>
              <div style={{ display: "flex", gap: "4px" }}>
                {impactDots.map((filled, i) => (
                  <div
                    key={i}
                    style={{
                      width: "24px",
                      height: "8px",
                      borderRadius: "4px",
                      background: filled ? colors.accent : "#E5E7EB",
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Branding */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                <span style={{ fontSize: "18px", fontWeight: 700, color: "#1A1A1A", letterSpacing: "0.05em" }}>
                  THE DAILY SIGNAL
                </span>
                <span style={{ fontSize: "12px", color: "#9CA3AF", letterSpacing: "0.1em" }}>
                  themicrobits.com/news
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
