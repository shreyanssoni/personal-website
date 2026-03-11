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
  qs_launched_text: string | null;
  qs_shifting_text: string | null;
  qs_watch_text: string | null;
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
    SELECT ${item.source}, ${item.title}, ${item.url}, ${item.description ?? null}, ${item.author ?? null}, ${item.source_published_at ?? null}
    WHERE NOT EXISTS (
      SELECT 1 FROM raw_feed_items
      WHERE url = ${item.url} AND fetched_at >= CURRENT_DATE - INTERVAL '7 days'
    )
  `;
}

export async function getTodaysRawItems(): Promise<RawFeedItem[]> {
  return sql`
    SELECT r.* FROM raw_feed_items r
    WHERE r.fetched_at = CURRENT_DATE
      AND NOT EXISTS (
        SELECT 1 FROM newsletter_signals s
        JOIN newsletter_issues i ON i.id = s.issue_id
        WHERE i.issue_date >= CURRENT_DATE - 7
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
  qs_launched_text: string;
  qs_shifting_text: string;
  qs_watch_text: string;
  raw_count: number;
  signal_count: number;
}): Promise<number> {
  const rows = await sql`
    INSERT INTO newsletter_issues (issue_date, subject, intro_text, main_insight, radar_rising, radar_stable, radar_declining, curiosity_hook, closing_thought, qs_launched_text, qs_shifting_text, qs_watch_text, raw_count, signal_count)
    VALUES (${data.date}, ${data.subject}, ${data.intro_text}, ${data.main_insight}, ${data.radar_rising}, ${data.radar_stable}, ${data.radar_declining}, ${data.curiosity_hook}, ${data.closing_thought}, ${data.qs_launched_text}, ${data.qs_shifting_text}, ${data.qs_watch_text}, ${data.raw_count}, ${data.signal_count})
    ON CONFLICT (issue_date) DO UPDATE SET
      subject = EXCLUDED.subject,
      intro_text = EXCLUDED.intro_text,
      main_insight = EXCLUDED.main_insight,
      radar_rising = EXCLUDED.radar_rising,
      radar_stable = EXCLUDED.radar_stable,
      radar_declining = EXCLUDED.radar_declining,
      curiosity_hook = EXCLUDED.curiosity_hook,
      closing_thought = EXCLUDED.closing_thought,
      qs_launched_text = EXCLUDED.qs_launched_text,
      qs_shifting_text = EXCLUDED.qs_shifting_text,
      qs_watch_text = EXCLUDED.qs_watch_text,
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

/* ─── Social Posts ─── */

export interface SocialPost {
  id: number;
  issue_id: number;
  signal_id: number | null;
  format: string;
  post_text: string;
  hook_curiosity: string | null;
  hook_contrarian: string | null;
  hook_prediction: string | null;
  thesis: string | null;
  topic_cluster: string | null;
  signal_url: string | null;
  posting_order: number;
  status: string;
  shared_at: string | null;
  posted_url: string | null;
  impressions: number | null;
  likes: number | null;
  reposts: number | null;
  replies: number | null;
  clicks: number | null;
  subs_gained: number | null;
  format_score: number | null;
  created_at: string;
  updated_at: string;
}

export async function insertSocialPost(post: {
  issue_id: number;
  signal_id?: number | null;
  format: string;
  post_text: string;
  hook_curiosity?: string;
  hook_contrarian?: string;
  hook_prediction?: string;
  thesis?: string;
  topic_cluster?: string;
  signal_url?: string;
  posting_order?: number;
}) {
  await sql`
    INSERT INTO social_posts (issue_id, signal_id, format, post_text, hook_curiosity, hook_contrarian, hook_prediction, thesis, topic_cluster, signal_url, posting_order)
    VALUES (${post.issue_id}, ${post.signal_id ?? null}, ${post.format}, ${post.post_text}, ${post.hook_curiosity ?? null}, ${post.hook_contrarian ?? null}, ${post.hook_prediction ?? null}, ${post.thesis ?? null}, ${post.topic_cluster ?? null}, ${post.signal_url ?? null}, ${post.posting_order ?? 0})
  `;
}

export async function getLatestSocialPosts(): Promise<(SocialPost & { signal_title?: string; signal_category?: string })[]> {
  return sql`
    SELECT sp.*, ns.title as signal_title, ns.category as signal_category
    FROM social_posts sp
    LEFT JOIN newsletter_signals ns ON ns.id = sp.signal_id
    WHERE sp.issue_id = (SELECT id FROM newsletter_issues ORDER BY issue_date DESC LIMIT 1)
    ORDER BY sp.posting_order ASC
  ` as unknown as (SocialPost & { signal_title?: string; signal_category?: string })[];
}

export async function updateSocialPost(
  id: number,
  fields: Partial<Pick<SocialPost, "post_text" | "status" | "shared_at" | "posted_url" | "hook_curiosity" | "hook_contrarian" | "hook_prediction" | "impressions" | "likes" | "reposts" | "replies" | "clicks" | "subs_gained" | "format_score">>
) {
  await sql`
    UPDATE social_posts SET
      post_text = COALESCE(${fields.post_text ?? null}, post_text),
      status = COALESCE(${fields.status ?? null}, status),
      shared_at = COALESCE(${fields.shared_at ?? null}, shared_at),
      posted_url = COALESCE(${fields.posted_url ?? null}, posted_url),
      hook_curiosity = COALESCE(${fields.hook_curiosity ?? null}, hook_curiosity),
      hook_contrarian = COALESCE(${fields.hook_contrarian ?? null}, hook_contrarian),
      hook_prediction = COALESCE(${fields.hook_prediction ?? null}, hook_prediction),
      impressions = COALESCE(${fields.impressions ?? null}, impressions),
      likes = COALESCE(${fields.likes ?? null}, likes),
      reposts = COALESCE(${fields.reposts ?? null}, reposts),
      replies = COALESCE(${fields.replies ?? null}, replies),
      clicks = COALESCE(${fields.clicks ?? null}, clicks),
      subs_gained = COALESCE(${fields.subs_gained ?? null}, subs_gained),
      format_score = COALESCE(${fields.format_score ?? null}, format_score),
      updated_at = NOW()
    WHERE id = ${id}
  `;
}

export async function getSocialAnalytics(days = 30) {
  const formatPerf = await sql`
    SELECT format,
      COUNT(*) as post_count,
      AVG(format_score) as avg_score,
      SUM(impressions) as total_impressions,
      SUM(subs_gained) as total_subs
    FROM social_posts
    WHERE created_at >= NOW() - INTERVAL '1 day' * ${days}
      AND status = 'shared'
    GROUP BY format
    ORDER BY avg_score DESC NULLS LAST
  ` as unknown as { format: string; post_count: number; avg_score: number | null; total_impressions: number | null; total_subs: number | null }[];

  const clusterPerf = await sql`
    SELECT topic_cluster,
      COUNT(*) as post_count,
      AVG(format_score) as avg_score,
      SUM(subs_gained) as total_subs
    FROM social_posts
    WHERE created_at >= NOW() - INTERVAL '1 day' * ${days}
      AND status = 'shared'
    GROUP BY topic_cluster
    ORDER BY avg_score DESC NULLS LAST
  ` as unknown as { topic_cluster: string; post_count: number; avg_score: number | null; total_subs: number | null }[];

  const topPosts = await sql`
    SELECT sp.*, ns.title as signal_title
    FROM social_posts sp
    LEFT JOIN newsletter_signals ns ON ns.id = sp.signal_id
    WHERE sp.created_at >= NOW() - INTERVAL '1 day' * ${days}
      AND sp.status = 'shared'
      AND sp.subs_gained IS NOT NULL
    ORDER BY sp.subs_gained DESC
    LIMIT 10
  ` as unknown as (SocialPost & { signal_title?: string })[];

  return { formatPerf, clusterPerf, topPosts };
}

export async function deleteSocialPostsByIssue(issueId: number) {
  await sql`DELETE FROM social_posts WHERE issue_id = ${issueId}`;
}

/* ─── Threads ─── */

export interface NewsletterThread {
  id: number;
  slug: string;
  title: string;
  description: string | null;
  emoji: string;
  status: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface ThreadWithSignals extends NewsletterThread {
  signals: (NewsletterSignal & { issue_date: string; sequence_order: number })[];
}

export async function getPublishedThreads(): Promise<NewsletterThread[]> {
  return sql`
    SELECT * FROM newsletter_threads
    WHERE status = 'published'
    ORDER BY display_order ASC, updated_at DESC
  ` as unknown as NewsletterThread[];
}

export async function getAllThreads(): Promise<NewsletterThread[]> {
  return sql`
    SELECT * FROM newsletter_threads
    ORDER BY display_order ASC, updated_at DESC
  ` as unknown as NewsletterThread[];
}

export async function getThreadBySlug(slug: string): Promise<ThreadWithSignals | null> {
  const rows = await sql`SELECT * FROM newsletter_threads WHERE slug = ${slug}`;
  const threads = rows as unknown as NewsletterThread[];
  if (threads.length === 0) return null;

  const thread = threads[0];
  const signals = await sql`
    SELECT s.*, i.issue_date, ts.sequence_order
    FROM thread_signals ts
    JOIN newsletter_signals s ON s.id = ts.signal_id
    JOIN newsletter_issues i ON i.id = s.issue_id
    WHERE ts.thread_id = ${thread.id}
    ORDER BY i.issue_date DESC, ts.sequence_order ASC
  ` as unknown as (NewsletterSignal & { issue_date: string; sequence_order: number })[];

  return { ...thread, signals };
}

export async function getThreadById(id: number): Promise<ThreadWithSignals | null> {
  const rows = await sql`SELECT * FROM newsletter_threads WHERE id = ${id}`;
  const threads = rows as unknown as NewsletterThread[];
  if (threads.length === 0) return null;

  const thread = threads[0];
  const signals = await sql`
    SELECT s.*, i.issue_date, ts.sequence_order
    FROM thread_signals ts
    JOIN newsletter_signals s ON s.id = ts.signal_id
    JOIN newsletter_issues i ON i.id = s.issue_id
    WHERE ts.thread_id = ${thread.id}
    ORDER BY i.issue_date DESC, ts.sequence_order ASC
  ` as unknown as (NewsletterSignal & { issue_date: string; sequence_order: number })[];

  return { ...thread, signals };
}

export async function createThread(data: {
  slug: string;
  title: string;
  description?: string;
  emoji?: string;
  status?: string;
  display_order?: number;
}): Promise<number> {
  const rows = await sql`
    INSERT INTO newsletter_threads (slug, title, description, emoji, status, display_order)
    VALUES (${data.slug}, ${data.title}, ${data.description ?? null}, ${data.emoji ?? '📡'}, ${data.status ?? 'draft'}, ${data.display_order ?? 0})
    RETURNING id
  `;
  return (rows as unknown as { id: number }[])[0].id;
}

export async function updateThread(
  id: number,
  fields: Partial<Pick<NewsletterThread, "title" | "description" | "emoji" | "status" | "display_order" | "slug">>
) {
  await sql`
    UPDATE newsletter_threads SET
      title = COALESCE(${fields.title ?? null}, title),
      description = COALESCE(${fields.description ?? null}, description),
      emoji = COALESCE(${fields.emoji ?? null}, emoji),
      status = COALESCE(${fields.status ?? null}, status),
      display_order = COALESCE(${fields.display_order ?? null}, display_order),
      slug = COALESCE(${fields.slug ?? null}, slug),
      updated_at = NOW()
    WHERE id = ${id}
  `;
}

export async function deleteThread(id: number) {
  await sql`DELETE FROM newsletter_threads WHERE id = ${id}`;
}

export async function addSignalsToThread(threadId: number, signalIds: number[]) {
  for (const signalId of signalIds) {
    await sql`
      INSERT INTO thread_signals (thread_id, signal_id, sequence_order)
      VALUES (${threadId}, ${signalId}, COALESCE((SELECT MAX(sequence_order) + 1 FROM thread_signals WHERE thread_id = ${threadId}), 0))
      ON CONFLICT (thread_id, signal_id) DO NOTHING
    `;
  }
}

export async function removeSignalFromThread(threadId: number, signalId: number) {
  await sql`DELETE FROM thread_signals WHERE thread_id = ${threadId} AND signal_id = ${signalId}`;
}

export async function reorderThreadSignals(threadId: number, signalIds: number[]) {
  for (let i = 0; i < signalIds.length; i++) {
    await sql`
      UPDATE thread_signals SET sequence_order = ${i}
      WHERE thread_id = ${threadId} AND signal_id = ${signalIds[i]}
    `;
  }
}

export async function refreshThreadSignals(threadId: number): Promise<number> {
  const rows = await sql`SELECT * FROM newsletter_threads WHERE id = ${threadId}`;
  const thread = (rows as unknown as NewsletterThread[])[0];
  if (!thread) return 0;

  const searchQuery = `${thread.title} ${thread.description || ""}`.trim();

  const newSignals = await sql`
    SELECT s.id
    FROM newsletter_signals s
    JOIN newsletter_issues i ON i.id = s.issue_id
    WHERE i.issue_date >= CURRENT_DATE - INTERVAL '7 days'
      AND s.search_vec @@ websearch_to_tsquery('english', ${searchQuery})
      AND s.id NOT IN (SELECT signal_id FROM thread_signals WHERE thread_id = ${threadId})
    ORDER BY i.issue_date DESC
  ` as unknown as { id: number }[];

  if (newSignals.length === 0) return 0;

  await addSignalsToThread(threadId, newSignals.map((s) => s.id));
  await sql`UPDATE newsletter_threads SET updated_at = NOW() WHERE id = ${threadId}`;

  return newSignals.length;
}

/** Auto-archive published threads not updated in over 14 days */
export async function archiveStaleThreads(): Promise<number> {
  const result = await sql`
    UPDATE newsletter_threads
    SET status = 'archived', updated_at = NOW()
    WHERE status = 'published'
      AND updated_at < NOW() - INTERVAL '14 days'
    RETURNING id
  `;
  return (result as unknown as { id: number }[]).length;
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
