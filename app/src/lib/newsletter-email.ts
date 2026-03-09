import type { InterpretedSignal } from "./newsletter-ai";
import type { NewsletterMeta } from "./newsletter-ai";

const SIGNAL_COLORS: Record<string, string> = {
  launch: "#FF6B6B",
  shift: "#4F8CFF",
  tool: "#2ECC71",
  research: "#8E7CFF",
  funding: "#F4B942",
  open_source: "#1ABC9C",
};

export function buildNewsletterHtml(
  meta: NewsletterMeta,
  signals: InterpretedSignal[],
  issueDate: string,
  unsubscribeUrl?: string
): string {
  const top3 = signals
    .sort((a, b) => a.display_order - b.display_order)
    .slice(0, 3);

  const siteUrl = process.env.NEXT_PUBLIC_NEWS_SITE_URL || "https://shreyanssoni.vercel.app";

  const signalCards = top3
    .map((s) => {
      const color = SIGNAL_COLORS[s.category] || "#888";
      const dots = Array.from({ length: 5 }, (_, i) =>
        i < s.impact_score
          ? `<span style="display:inline-block;width:12px;height:5px;border-radius:2px;background:${s.impact_score >= 4 ? "#FF6B6B" : s.impact_score >= 3 ? "#F4B942" : "#CCC"};margin-right:2px;"></span>`
          : `<span style="display:inline-block;width:12px;height:5px;border-radius:2px;background:#E8E5DE;margin-right:2px;"></span>`
      ).join("");

      return `
      <tr><td style="padding:0 0 16px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#FFFFFF;border-radius:12px;border:1px solid #ECEAE4;overflow:hidden;">
          <tr><td style="border-top:3px solid ${color};padding:20px 24px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td><span style="font-family:'Courier New',monospace;font-size:9px;letter-spacing:2px;color:${color};text-transform:uppercase;font-weight:700;">${esc(s.category.replace("_", " "))}</span></td>
                <td style="text-align:right;">${dots}</td>
              </tr>
            </table>
            <h3 style="font-family:Georgia,'Times New Roman',serif;font-size:17px;color:#2D2A26;margin:10px 0 6px;line-height:1.3;font-weight:700;">${esc(s.title)}</h3>
            <p style="font-family:-apple-system,sans-serif;font-size:14px;color:#4F8CFF;margin:0 0 8px;font-weight:600;">${esc(s.so_what)}</p>
            <p style="font-family:-apple-system,sans-serif;font-size:12px;color:#7A756C;line-height:1.6;margin:0;">${esc(s.delta)}</p>
          </td></tr>
        </table>
      </td></tr>`;
    })
    .join("\n");

  const radarSection = `
    <tr><td style="padding:20px 0 12px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#FFFFFF;border-radius:12px;border:1px solid #ECEAE4;">
        <tr><td style="padding:20px 24px;">
          <p style="font-family:'Courier New',monospace;font-size:10px;letter-spacing:3px;color:#A09B91;margin:0 0 16px;text-transform:uppercase;font-weight:700;">Builder Radar</p>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="vertical-align:top;padding-right:16px;">
                <p style="font-family:'Courier New',monospace;font-size:9px;color:#2ECC71;margin:0 0 6px;font-weight:700;">▲ RISING</p>
                ${(meta.radar_rising || []).map((t) => `<p style="font-family:-apple-system,sans-serif;font-size:12px;color:#4A453C;margin:0 0 3px;line-height:1.5;">· ${esc(t)}</p>`).join("")}
              </td>
              <td style="vertical-align:top;padding-right:16px;">
                <p style="font-family:'Courier New',monospace;font-size:9px;color:#A09B91;margin:0 0 6px;font-weight:700;">— STABLE</p>
                ${(meta.radar_stable || []).map((t) => `<p style="font-family:-apple-system,sans-serif;font-size:12px;color:#A09B91;margin:0 0 3px;line-height:1.5;">· ${esc(t)}</p>`).join("")}
              </td>
              <td style="vertical-align:top;">
                <p style="font-family:'Courier New',monospace;font-size:9px;color:#FF6B6B;margin:0 0 6px;font-weight:700;">▼ COOLING</p>
                ${(meta.radar_declining || []).map((t) => `<p style="font-family:-apple-system,sans-serif;font-size:12px;color:#A09B91;margin:0 0 3px;line-height:1.5;">· ${esc(t)}</p>`).join("")}
              </td>
            </tr>
          </table>
        </td></tr>
      </table>
    </td></tr>`;

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#F7F6F2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F6F2;">
    <tr><td align="center" style="padding:40px 16px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">

        <!-- Masthead -->
        <tr><td style="text-align:center;padding-bottom:24px;">
          <p style="font-family:'Courier New',monospace;font-size:9px;letter-spacing:4px;color:#A09B91;margin:0 0 12px;text-transform:uppercase;">The MicroBits</p>
          <table width="100%" cellpadding="0" cellspacing="0"><tr>
            <td style="height:1px;background:linear-gradient(90deg,transparent,#D5D0C8,transparent);"></td>
          </tr></table>
          <p style="font-family:Georgia,'Times New Roman',serif;font-size:28px;color:#2D2A26;margin:16px 0 4px;letter-spacing:4px;font-weight:700;">THE DAILY VIBE CODE</p>
          <p style="font-family:-apple-system,sans-serif;font-size:11px;color:#A09B91;letter-spacing:1px;margin:0 0 12px;">Scanning the AI ecosystem so builders don't have to</p>
          <table width="100%" cellpadding="0" cellspacing="0"><tr>
            <td style="height:1px;background:linear-gradient(90deg,transparent,#D5D0C8,transparent);"></td>
          </tr></table>
          <p style="font-family:'Courier New',monospace;font-size:10px;color:#C8C4BC;margin:12px 0 0;">${issueDate}</p>
        </td></tr>

        <!-- Intro -->
        <tr><td style="padding:16px 0 20px;">
          <p style="font-family:Georgia,serif;font-size:15px;color:#5C574E;line-height:1.7;margin:0;font-style:italic;">${esc(meta.intro)}</p>
        </td></tr>

        <!-- Main Insight -->
        <tr><td style="padding:0 0 28px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#FFFFFF;border-radius:12px;border:1px solid #ECEAE4;border-left:3px solid #4F8CFF;">
            <tr><td style="padding:16px 20px;">
              <p style="font-family:'Courier New',monospace;font-size:8px;letter-spacing:2px;color:#4F8CFF;margin:0 0 8px;text-transform:uppercase;font-weight:700;">If you read one thing today</p>
              <p style="font-family:Georgia,serif;font-size:16px;color:#2D2A26;line-height:1.5;margin:0;font-weight:700;">${esc(meta.main_insight)}</p>
            </td></tr>
          </table>
        </td></tr>

        <!-- Top 3 Signals -->
        ${signalCards}

        <!-- Radar -->
        ${radarSection}

        <!-- Curiosity Hook + CTA -->
        <tr><td style="padding:28px 0;text-align:center;">
          <p style="font-family:Georgia,serif;font-size:13px;color:#7A756C;font-style:italic;line-height:1.6;margin:0 0 20px;">${esc(meta.curiosity_hook)}</p>
          <a href="${siteUrl}/news" style="display:inline-block;padding:12px 32px;background:#2D2A26;color:#F7F6F2;font-family:'Courier New',monospace;font-size:10px;letter-spacing:2px;text-decoration:none;text-transform:uppercase;border-radius:6px;font-weight:700;">
            Explore all signals &rarr;
          </a>
        </td></tr>

        <!-- Closing thought -->
        <tr><td style="padding:16px 0;">
          <table width="100%" cellpadding="0" cellspacing="0"><tr>
            <td style="height:1px;background:linear-gradient(90deg,transparent,#D5D0C8,transparent);"></td>
          </tr></table>
          <p style="font-family:Georgia,serif;font-size:13px;color:#A09B91;font-style:italic;line-height:1.6;margin:16px 0 0;text-align:center;">${esc(meta.closing_thought)}</p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:16px 0 0;text-align:center;">
          <p style="font-family:'Courier New',monospace;font-size:9px;color:#C8C4BC;margin:0;">The Daily Vibe Code by The MicroBits</p>
          ${unsubscribeUrl ? `<p style="font-family:'Courier New',monospace;font-size:9px;color:#C8C4BC;margin:6px 0 0;"><a href="${unsubscribeUrl}" style="color:#A09B91;text-decoration:underline;">unsubscribe</a></p>` : ""}
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function esc(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
