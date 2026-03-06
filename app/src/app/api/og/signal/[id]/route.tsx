import { ImageResponse } from "next/og";
import { sql } from "@/lib/db";

const CATEGORY_COLORS: Record<string, { bg: string; accent: string; light: string; emoji: string }> = {
  launch:      { bg: "#FFF5F5", accent: "#FF6B6B", light: "#FFE0E0", emoji: "🚀" },
  shift:       { bg: "#F0F4FF", accent: "#4F8CFF", light: "#D6E4FF", emoji: "📈" },
  tool:        { bg: "#F0FFF4", accent: "#2ECC71", light: "#D4EFDF", emoji: "🔧" },
  research:    { bg: "#F5F3FF", accent: "#8E7CFF", light: "#DDD6FE", emoji: "🔬" },
  funding:     { bg: "#FFFBEB", accent: "#F4B942", light: "#FDE68A", emoji: "💰" },
  open_source: { bg: "#F0FFFC", accent: "#1ABC9C", light: "#A7F3D0", emoji: "📦" },
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const signalId = parseInt(id, 10);
    if (isNaN(signalId)) {
      return new Response("Invalid signal ID", { status: 400 });
    }

    const rows = await sql`
      SELECT s.title, s.category, s.so_what, s.impact_score,
             s.deep_dive, s.summary, s.delta,
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
      deep_dive: string | null;
      summary: string;
      delta: string;
      issue_date: string | Date;
    }[])[0];

    const colors = CATEGORY_COLORS[signal.category] || CATEGORY_COLORS.tool;
    const dateStr = typeof signal.issue_date === "object" && signal.issue_date !== null && "toISOString" in signal.issue_date
      ? (signal.issue_date as Date).toISOString().slice(0, 10)
      : String(signal.issue_date).slice(0, 10);

    const title = signal.title.length > 80 ? signal.title.slice(0, 77) + "..." : signal.title;
    const score = signal.impact_score || 3;

    // Build a teaser: prefer deep_dive first paragraph, else combine so_what + delta
    let teaser = "";
    if (signal.deep_dive) {
      // Grab first non-heading, non-empty paragraph from deep dive
      const lines = signal.deep_dive.split("\n").filter(l => l.trim() && !l.startsWith("#"));
      teaser = lines[0] || "";
    }
    if (!teaser && signal.so_what) {
      teaser = signal.so_what;
      if (signal.delta && teaser.length + signal.delta.length < 200) {
        teaser += " " + signal.delta;
      }
    }
    if (!teaser) teaser = signal.summary || "";
    // Truncate to ~150 chars for 2 lines
    if (teaser.length > 150) teaser = teaser.slice(0, 147) + "...";

    return new ImageResponse(
      (
        <div
          style={{
            width: "1200px",
            height: "630px",
            display: "flex",
            flexDirection: "column",
            backgroundColor: colors.bg,
            fontFamily: "system-ui, sans-serif",
            position: "relative",
          }}
        >
          {/* Top accent bar */}
          <div style={{ display: "flex", width: "1200px", height: "6px", backgroundColor: colors.accent }} />

          {/* Decorative circle top-right */}
          <div
            style={{
              display: "flex",
              position: "absolute",
              top: "-100px",
              right: "-100px",
              width: "350px",
              height: "350px",
              borderRadius: "175px",
              backgroundColor: colors.light,
              opacity: 0.3,
            }}
          />

          {/* Decorative circle bottom-left */}
          <div
            style={{
              display: "flex",
              position: "absolute",
              bottom: "-80px",
              left: "-80px",
              width: "250px",
              height: "250px",
              borderRadius: "125px",
              backgroundColor: colors.light,
              opacity: 0.2,
            }}
          />

          {/* Main content */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              padding: "48px 56px 40px",
              position: "relative",
            }}
          >
            {/* Category + Date row */}
            <div style={{ display: "flex", alignItems: "center", marginBottom: "36px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "8px 16px",
                  borderRadius: "20px",
                  backgroundColor: colors.accent,
                }}
              >
                <span style={{ fontSize: "14px", marginRight: "8px" }}>{colors.emoji}</span>
                <span style={{ fontSize: "14px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#FFFFFF" }}>
                  {signal.category.replace("_", " ")}
                </span>
              </div>
              <span style={{ fontSize: "14px", color: "#9CA3AF", marginLeft: "16px", letterSpacing: "0.05em" }}>
                {dateStr}
              </span>
            </div>

            {/* Title */}
            <div style={{ display: "flex", flex: 1, flexDirection: "column", justifyContent: "center" }}>
              <div
                style={{
                  display: "flex",
                  fontSize: title.length > 50 ? "44px" : "54px",
                  fontWeight: 800,
                  color: "#1A1A1A",
                  lineHeight: 1.15,
                  letterSpacing: "-0.02em",
                  maxWidth: "950px",
                }}
              >
                {title}
              </div>

              {teaser ? (
                <div
                  style={{
                    display: "flex",
                    marginTop: "28px",
                    paddingLeft: "20px",
                    borderLeft: `3px solid ${colors.accent}`,
                    maxWidth: "900px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      fontSize: "20px",
                      color: "#6B7280",
                      lineHeight: 1.5,
                      fontStyle: "italic",
                    }}
                  >
                    {teaser}
                  </div>
                </div>
              ) : null}
            </div>

            {/* Bottom bar */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              {/* Impact meter */}
              <div style={{ display: "flex", alignItems: "center" }}>
                <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#9CA3AF", marginRight: "12px" }}>
                  Impact
                </span>
                <div style={{ display: "flex" }}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      style={{
                        width: "28px",
                        height: "10px",
                        borderRadius: "5px",
                        backgroundColor: i <= score ? colors.accent : "#E5E7EB",
                        marginRight: i < 5 ? "4px" : "0px",
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Branding */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                <span style={{ fontSize: "20px", fontWeight: 800, color: "#1A1A1A", letterSpacing: "0.08em" }}>
                  THE DAILY VIBE CODE
                </span>
                <span style={{ fontSize: "13px", color: "#9CA3AF", letterSpacing: "0.08em", marginTop: "2px" }}>
                  thedailyvibecode.vercel.app
                </span>
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
  } catch (e) {
    console.error("[OG Image] Error:", e);
    // Fallback: simple text image
    return new ImageResponse(
      (
        <div
          style={{
            width: "1200px",
            height: "630px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#FAFAF8",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <div style={{ display: "flex", fontSize: "48px", fontWeight: 800, color: "#1A1A1A", letterSpacing: "0.1em" }}>
            THE DAILY VIBE CODE
          </div>
          <div style={{ display: "flex", fontSize: "20px", color: "#9CA3AF", marginTop: "16px" }}>
            Curated AI intelligence for builders
          </div>
          <div style={{ display: "flex", fontSize: "14px", color: "#C8C4BC", marginTop: "8px" }}>
            thedailyvibecode.vercel.app
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }
}
