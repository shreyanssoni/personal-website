import { insertRawFeedItem } from "./newsletter";

/* ─── RSS Parser (lightweight, no dependency) ─── */

interface FeedEntry {
  title: string;
  url: string;
  description: string;
  author?: string;
  published?: string;
}

async function parseRSS(feedUrl: string): Promise<FeedEntry[]> {
  try {
    const res = await fetch(feedUrl, {
      headers: { "User-Agent": "MicroBitsNewsletter/1.0" },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return [];
    const xml = await res.text();

    const entries: FeedEntry[] = [];

    // Handle both RSS and Atom feeds
    const itemRegex = /<(?:item|entry)[\s>]([\s\S]*?)<\/(?:item|entry)>/gi;
    let match;
    while ((match = itemRegex.exec(xml)) !== null) {
      const block = match[1];
      const title = extractTag(block, "title");
      const link =
        extractTag(block, "link") ||
        extractAttr(block, "link", "href") ||
        extractTag(block, "guid");
      const desc =
        extractTag(block, "description") ||
        extractTag(block, "summary") ||
        extractTag(block, "content");
      const author =
        extractTag(block, "author") ||
        extractTag(block, "dc:creator") ||
        extractTag(block, "name");
      const pubDate =
        extractTag(block, "pubDate") ||
        extractTag(block, "published") ||
        extractTag(block, "updated");

      if (title && link) {
        entries.push({
          title: cleanHtml(title).substring(0, 500),
          url: link.trim(),
          description: cleanHtml(desc || "").substring(0, 1000),
          author: author ? cleanHtml(author).substring(0, 255) : undefined,
          published: pubDate || undefined,
        });
      }
    }
    return entries.slice(0, 30); // cap per source
  } catch (e) {
    console.error(`RSS fetch failed for ${feedUrl}:`, e);
    return [];
  }
}

function extractTag(xml: string, tag: string): string | null {
  // Handle CDATA
  const cdataRegex = new RegExp(
    `<${tag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*</${tag}>`,
    "i"
  );
  const cdataMatch = cdataRegex.exec(xml);
  if (cdataMatch) return cdataMatch[1].trim();

  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i");
  const m = regex.exec(xml);
  return m ? m[1].trim() : null;
}

function extractAttr(xml: string, tag: string, attr: string): string | null {
  const regex = new RegExp(`<${tag}[^>]*${attr}="([^"]*)"`, "i");
  const m = regex.exec(xml);
  return m ? m[1] : null;
}

function cleanHtml(str: string): string {
  return str
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .trim();
}

/* ─── Hacker News ─── */

async function fetchHackerNews(): Promise<FeedEntry[]> {
  try {
    const res = await fetch(
      "https://hacker-news.firebaseio.com/v0/topstories.json",
      { signal: AbortSignal.timeout(10000) }
    );
    if (!res.ok) return [];
    const ids: number[] = await res.json();

    // Fetch top 30 stories in parallel
    const stories = await Promise.all(
      ids.slice(0, 30).map(async (id) => {
        try {
          const r = await fetch(
            `https://hacker-news.firebaseio.com/v0/item/${id}.json`,
            { signal: AbortSignal.timeout(5000) }
          );
          return r.ok ? r.json() : null;
        } catch {
          return null;
        }
      })
    );

    return stories
      .filter(
        (s) =>
          s &&
          s.title &&
          s.url &&
          (s.score > 50 || s.descendants > 20) // only notable stories
      )
      .map((s) => ({
        title: s.title,
        url: s.url,
        description: `HN Score: ${s.score} | ${s.descendants || 0} comments`,
        author: s.by || undefined,
        published: s.time
          ? new Date(s.time * 1000).toISOString()
          : undefined,
      }));
  } catch (e) {
    console.error("HN fetch failed:", e);
    return [];
  }
}

/* ─── GitHub Trending ─── */

async function fetchGitHubTrending(): Promise<FeedEntry[]> {
  try {
    // Use GitHub's search API for recently created repos with high stars
    const res = await fetch(
      "https://api.github.com/search/repositories?q=created:>=" +
        getDateDaysAgo(2) +
        "+stars:>50&sort=stars&order=desc&per_page=15",
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "MicroBitsNewsletter/1.0",
        },
        signal: AbortSignal.timeout(10000),
      }
    );
    if (!res.ok) return [];
    const data = await res.json();

    return (data.items || []).map(
      (repo: {
        full_name: string;
        html_url: string;
        description: string | null;
        stargazers_count: number;
        language: string | null;
        owner: { login: string };
      }) => ({
        title: `${repo.full_name} - ${repo.description || "No description"}`,
        url: repo.html_url,
        description: `Stars: ${repo.stargazers_count} | Language: ${repo.language || "N/A"} | ${repo.description || ""}`,
        author: repo.owner?.login,
      })
    );
  } catch (e) {
    console.error("GitHub trending fetch failed:", e);
    return [];
  }
}

/* ─── Source Registry ─── */

const RSS_SOURCES: { name: string; url: string }[] = [
  // AI Lab Blogs
  { name: "openai_blog", url: "https://openai.com/blog/rss.xml" },
  {
    name: "anthropic_blog",
    url: "https://www.anthropic.com/rss.xml",
  },
  {
    name: "google_ai_blog",
    url: "https://blog.google/technology/ai/rss/",
  },
  { name: "meta_ai", url: "https://ai.meta.com/blog/rss/" },
  { name: "huggingface_blog", url: "https://huggingface.co/blog/feed.xml" },

  // Research
  { name: "arxiv_cs_ai", url: "https://rss.arxiv.org/rss/cs.AI" },
  { name: "arxiv_cs_cl", url: "https://rss.arxiv.org/rss/cs.CL" },

  // Tech News
  {
    name: "techcrunch_ai",
    url: "https://techcrunch.com/category/artificial-intelligence/feed/",
  },
  {
    name: "verge_ai",
    url: "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml",
  },
  { name: "ars_technica", url: "https://feeds.arstechnica.com/arstechnica/technology-lab" },

  // Developer / Builder focused
  { name: "github_blog", url: "https://github.blog/feed/" },
  {
    name: "hf_papers",
    url: "https://huggingface.co/papers/rss",
  },

  // AI builders & indie hackers (prolific Twitter posters who also blog)
  { name: "simonwillison", url: "https://simonwillison.net/atom/everything/" },
  { name: "bensbites", url: "https://bensbites.beehiiv.com/feed" },
  { name: "therundownai", url: "https://www.therundown.ai/feed" },
  { name: "latent_space", url: "https://www.latent.space/feed" },
  { name: "aitidbits", url: "https://aibits.substack.com/feed" },

  // Product Hunt AI (new tools daily)
  { name: "producthunt_ai", url: "https://www.producthunt.com/categories/artificial-intelligence/feed" },

  // AI newsletters / aggregators that surface Twitter discourse
  { name: "tldr_ai", url: "https://tldr.tech/ai/rss" },
  { name: "importai", url: "https://importai.substack.com/feed" },
  { name: "alphasignal", url: "https://alphasignal.ai/feed" },
];

/* ─── Main Fetch Orchestrator ─── */

export async function fetchAllSources(): Promise<number> {
  let totalInserted = 0;

  // Fetch RSS sources in parallel
  const rssResults = await Promise.allSettled(
    RSS_SOURCES.map(async ({ name, url }) => {
      const entries = await parseRSS(url);
      for (const entry of entries) {
        await insertRawFeedItem({
          source: name,
          title: entry.title,
          url: entry.url,
          description: entry.description,
          author: entry.author,
          source_published_at: entry.published,
        });
        totalInserted++;
      }
      return entries.length;
    })
  );

  // Fetch HN
  const hnEntries = await fetchHackerNews();
  for (const entry of hnEntries) {
    await insertRawFeedItem({
      source: "hackernews",
      title: entry.title,
      url: entry.url,
      description: entry.description,
      author: entry.author,
      source_published_at: entry.published,
    });
    totalInserted++;
  }

  // Fetch GitHub Trending
  const ghEntries = await fetchGitHubTrending();
  for (const entry of ghEntries) {
    await insertRawFeedItem({
      source: "github_trending",
      title: entry.title,
      url: entry.url,
      description: entry.description,
      author: entry.author,
    });
    totalInserted++;
  }

  // Log results
  const successCount = rssResults.filter(
    (r) => r.status === "fulfilled"
  ).length;
  console.log(
    `[Newsletter] Fetched from ${successCount}/${RSS_SOURCES.length} RSS feeds, HN: ${hnEntries.length}, GitHub: ${ghEntries.length}. Total: ${totalInserted}`
  );

  return totalInserted;
}

function getDateDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split("T")[0];
}
