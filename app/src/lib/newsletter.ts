import { sql } from "./db";

/* ─── Types ─── */

export interface RawFeedItem {
  id: number;
  source: string;
  title: string;
  url: string;
  description: string | null;
  author: string | null;
  source_published_at: string | null;
  fetched_at: string;
  created_at: string;
}

export interface NewsletterIssue {
  id: number;
  issue_date: string;
  subject: string;
  intro_text: string | null;
  main_insight: string | null;
  radar_rising: string[] | null;
  radar_stable: string[] | null;
  radar_declining: string[] | null;
  curiosity_hook: string | null;
  closing_thought: string | null;
  qs_biggest_title: string | null;
  qs_biggest_text: string | null;
  qs_overhyped_title: string | null;
  qs_overhyped_text: string | null;
  qs_quiet_title: string | null;
  qs_quiet_text: string | null;
  raw_count: number;
  signal_count: number;
  sent_at: string | null;
  created_at: string;
}

export interface NewsletterSignal {
  id: number;
  issue_id: number;
  category: string;
  title: string;
  source_urls: string[];
  summary: string;
  delta: string;
  impact: string;
  who_should_care: string;
  hype_or_real: string;
  builder_opportunities: string;
  how_to_use: string;
  impact_score: number;
  confidence: string;
  time_horizon: string;
  so_what: string;
  display_order: number;
  deep_dive: string | null;
  created_at: string;
}

/* ─── Raw Feed ─── */

export async function insertRawFeedItem(item: {
  source: string;
  title: string;
  url: string;
  description?: string;
  author?: string;
  source_published_at?: string;
}) {
  await sql`
    INSERT INTO raw_feed_items (source, title, url, description, author, source_published_at)
    VALUES (${item.source}, ${item.title}, ${item.url}, ${item.description ?? null}, ${item.author ?? null}, ${item.source_published_at ?? null})
    ON CONFLICT (url) WHERE fetched_at >= CURRENT_DATE - INTERVAL '3 days' DO NOTHING
  `;
}

export async function getTodaysRawItems(): Promise<RawFeedItem[]> {
  return sql`
    SELECT r.* FROM raw_feed_items r
    WHERE r.fetched_at = CURRENT_DATE
      AND NOT EXISTS (
        SELECT 1 FROM newsletter_signals s
        JOIN newsletter_issues i ON i.id = s.issue_id
        WHERE i.issue_date >= CURRENT_DATE - 3
          AND i.issue_date < CURRENT_DATE
          AND s.search_vec @@ plainto_tsquery('english', r.title)
      )
    ORDER BY r.source, r.created_at DESC
  ` as unknown as RawFeedItem[];
}

/* ─── Issues ─── */

export async function createIssue(data: {
  date: string;
  subject: string;
  intro_text: string;
  main_insight: string;
  radar_rising: string[];
  radar_stable: string[];
  radar_declining: string[];
  curiosity_hook: string;
  closing_thought: string;
  qs_biggest_title: string;
  qs_biggest_text: string;
  qs_overhyped_title: string;
  qs_overhyped_text: string;
  qs_quiet_title: string;
  qs_quiet_text: string;
  raw_count: number;
  signal_count: number;
}): Promise<number> {
  const rows = await sql`
    INSERT INTO newsletter_issues (issue_date, subject, intro_text, main_insight, radar_rising, radar_stable, radar_declining, curiosity_hook, closing_thought, qs_biggest_title, qs_biggest_text, qs_overhyped_title, qs_overhyped_text, qs_quiet_title, qs_quiet_text, raw_count, signal_count)
    VALUES (${data.date}, ${data.subject}, ${data.intro_text}, ${data.main_insight}, ${data.radar_rising}, ${data.radar_stable}, ${data.radar_declining}, ${data.curiosity_hook}, ${data.closing_thought}, ${data.qs_biggest_title}, ${data.qs_biggest_text}, ${data.qs_overhyped_title}, ${data.qs_overhyped_text}, ${data.qs_quiet_title}, ${data.qs_quiet_text}, ${data.raw_count}, ${data.signal_count})
    ON CONFLICT (issue_date) DO UPDATE SET
      subject = EXCLUDED.subject,
      intro_text = EXCLUDED.intro_text,
      main_insight = EXCLUDED.main_insight,
      radar_rising = EXCLUDED.radar_rising,
      radar_stable = EXCLUDED.radar_stable,
      radar_declining = EXCLUDED.radar_declining,
      curiosity_hook = EXCLUDED.curiosity_hook,
      closing_thought = EXCLUDED.closing_thought,
      qs_biggest_title = EXCLUDED.qs_biggest_title,
      qs_biggest_text = EXCLUDED.qs_biggest_text,
      qs_overhyped_title = EXCLUDED.qs_overhyped_title,
      qs_overhyped_text = EXCLUDED.qs_overhyped_text,
      qs_quiet_title = EXCLUDED.qs_quiet_title,
      qs_quiet_text = EXCLUDED.qs_quiet_text,
      raw_count = EXCLUDED.raw_count,
      signal_count = EXCLUDED.signal_count
    RETURNING id
  `;
  return (rows as unknown as { id: number }[])[0].id;
}

export async function markIssueSent(issueId: number) {
  await sql`UPDATE newsletter_issues SET sent_at = NOW() WHERE id = ${issueId}`;
}

export async function getLatestIssues(limit = 10): Promise<NewsletterIssue[]> {
  return sql`
    SELECT * FROM newsletter_issues
    ORDER BY issue_date DESC
    LIMIT ${limit}
  ` as unknown as NewsletterIssue[];
}

export async function getIssueByDate(date: string): Promise<NewsletterIssue | null> {
  const rows = await sql`SELECT * FROM newsletter_issues WHERE issue_date = ${date}`;
  return (rows as unknown as NewsletterIssue[]).length > 0 ? (rows as unknown as NewsletterIssue[])[0] : null;
}

/* ─── Signals ─── */

export async function insertSignal(signal: {
  issue_id: number;
  category: string;
  title: string;
  source_urls: string[];
  summary: string;
  delta: string;
  impact: string;
  who_should_care: string;
  hype_or_real: string;
  builder_opportunities: string;
  how_to_use: string;
  impact_score: number;
  confidence: string;
  time_horizon: string;
  so_what: string;
  display_order: number;
  deep_dive?: string;
}) {
  await sql`
    INSERT INTO newsletter_signals (issue_id, category, title, source_urls, summary, delta, impact, who_should_care, hype_or_real, builder_opportunities, how_to_use, impact_score, confidence, time_horizon, so_what, display_order, deep_dive)
    VALUES (${signal.issue_id}, ${signal.category}, ${signal.title}, ${signal.source_urls}, ${signal.summary}, ${signal.delta}, ${signal.impact}, ${signal.who_should_care}, ${signal.hype_or_real}, ${signal.builder_opportunities}, ${signal.how_to_use}, ${signal.impact_score}, ${signal.confidence}, ${signal.time_horizon}, ${signal.so_what}, ${signal.display_order}, ${signal.deep_dive ?? null})
  `;
}

export async function deleteSignalsByIssue(issueId: number) {
  await sql`DELETE FROM newsletter_signals WHERE issue_id = ${issueId}`;
}

export async function getSignalsByIssue(issueId: number): Promise<NewsletterSignal[]> {
  return sql`
    SELECT * FROM newsletter_signals
    WHERE issue_id = ${issueId}
    ORDER BY display_order ASC
  ` as unknown as NewsletterSignal[];
}

export async function getLatestIssueWithSignals(): Promise<{
  issue: NewsletterIssue;
  signals: NewsletterSignal[];
} | null> {
  const issues = await getLatestIssues(1);
  if (issues.length === 0) return null;
  const issue = issues[0];
  const signals = await getSignalsByIssue(issue.id);
  if (signals.length === 0) return null;
  return { issue, signals };
}

export async function getIssueWithSignals(issueDate: string): Promise<{
  issue: NewsletterIssue;
  signals: NewsletterSignal[];
} | null> {
  const issue = await getIssueByDate(issueDate);
  if (!issue) return null;
  const signals = await getSignalsByIssue(issue.id);
  return { issue, signals };
}

/* ─── Search ─── */

export interface SearchResultSignal extends NewsletterSignal {
  rank: number;
  result_type: "signal";
  issue_date: string;
}

export interface SearchResultRaw {
  id: number;
  source: string;
  title: string;
  url: string;
  description: string | null;
  fetched_at: string;
  rank: number;
  result_type: "raw";
}

export type SearchResult = SearchResultSignal | SearchResultRaw;

export async function searchNews(query: string, limit = 20): Promise<SearchResult[]> {
  // websearch_to_tsquery handles natural language: "agent frameworks" → 'agent' & 'framework'
  // Fall back to plainto_tsquery if websearch syntax fails
  const signals = await sql`
    SELECT
      s.*,
      i.issue_date,
      ts_rank(s.search_vec, websearch_to_tsquery('english', ${query})) AS rank
    FROM newsletter_signals s
    JOIN newsletter_issues i ON i.id = s.issue_id
    WHERE s.search_vec @@ websearch_to_tsquery('english', ${query})
    ORDER BY rank DESC, i.issue_date DESC
    LIMIT ${limit}
  ` as unknown as (NewsletterSignal & { rank: number; issue_date: string })[];

  const rawItems = await sql`
    SELECT
      id, source, title, url, description, fetched_at,
      ts_rank(search_vec, websearch_to_tsquery('english', ${query})) AS rank
    FROM raw_feed_items
    WHERE search_vec @@ websearch_to_tsquery('english', ${query})
    ORDER BY rank DESC, fetched_at DESC
    LIMIT ${limit}
  ` as unknown as (SearchResultRaw & { rank: number })[];

  const results: SearchResult[] = [
    ...signals.map((s) => ({ ...s, result_type: "signal" as const })),
    ...rawItems.map((r) => ({ ...r, result_type: "raw" as const })),
  ];

  // Sort: signals first, then by rank, then by recency
  results.sort((a, b) => {
    if (a.result_type !== b.result_type) return a.result_type === "signal" ? -1 : 1;
    if (Math.abs(a.rank - b.rank) > 0.01) return b.rank - a.rank;
    return 0;
  });

  return results.slice(0, limit);
}
