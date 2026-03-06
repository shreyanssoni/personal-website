import { getLatestIssues, getSignalsByIssue } from "@/lib/newsletter";

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toDateStr(d: string | Date): string {
  if (typeof d === "object" && d !== null && "toISOString" in d) {
    return (d as Date).toISOString().slice(0, 10);
  }
  return String(d).slice(0, 10);
}

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://shreyanssoni.vercel.app";

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>The Daily Vibe Code — AI Intelligence for Builders</title>
  <link>${siteUrl}/news</link>
  <description>Daily curated AI signals, tool launches, research breakthroughs, and builder opportunities from The MicroBits.</description>
  <language>en-us</language>
  <atom:link href="${siteUrl}/api/news/rss" rel="self" type="application/rss+xml"/>
  <image>
    <url>${siteUrl}/assets/img/shreyans1.png</url>
    <title>The Daily Vibe Code</title>
    <link>${siteUrl}/news</link>
  </image>
`;

  try {
    const issues = await getLatestIssues(30);

    for (const issue of issues) {
      const dateStr = toDateStr(issue.issue_date);
      const pubDate = new Date(dateStr + "T12:00:00Z").toUTCString();
      const signals = await getSignalsByIssue(issue.id);
      const sorted = [...signals].sort((a, b) => a.display_order - b.display_order);

      // Build description with signals summary
      let description = "";
      if (issue.main_insight) {
        description += `<p><strong>Key Insight:</strong> ${escapeXml(issue.main_insight)}</p>`;
      }
      description += `<p>${signals.length} AI signals curated today:</p><ul>`;
      for (const s of sorted.slice(0, 10)) {
        description += `<li><strong>${escapeXml(s.title)}</strong> [${escapeXml(s.category)}] — ${escapeXml(s.so_what || s.summary)}</li>`;
      }
      if (sorted.length > 10) {
        description += `<li>...and ${sorted.length - 10} more signals</li>`;
      }
      description += `</ul>`;

      xml += `  <item>
    <title>${escapeXml(issue.subject || `AI Signals for ${dateStr}`)}</title>
    <link>${siteUrl}/news/${dateStr}</link>
    <guid isPermaLink="true">${siteUrl}/news/${dateStr}</guid>
    <pubDate>${pubDate}</pubDate>
    <description><![CDATA[${description}]]></description>
    <category>AI</category>
    <category>Technology</category>
    <category>Developer News</category>
  </item>
`;
    }
  } catch (e) {
    console.error("[RSS] Error generating feed:", e);
  }

  xml += `</channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "s-maxage=1800, stale-while-revalidate",
    },
  });
}
