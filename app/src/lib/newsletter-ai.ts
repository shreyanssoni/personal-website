import { GoogleGenerativeAI } from "@google/generative-ai";
import type { RawFeedItem, NewsletterSignal } from "./newsletter";

const genAI = new GoogleGenerativeAI(
  process.env.NEWSLETTER_GEMINI_API_KEY || process.env.GOOGLE_API_KEY || ""
);

function getModel() {
  return genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
}

/* ─── Signal Selection (Call 1) ─── */

export interface SelectedSignal {
  title: string;
  category: string;
  source_urls: string[];
  summary: string;
  raw_titles: string[];
}

export async function selectSignals(
  rawItems: RawFeedItem[]
): Promise<SelectedSignal[]> {
  const model = getModel();

  // Pre-filter: cap per source (avoid arxiv/HN flooding), dedupe by title similarity
  const perSourceCap = 8;
  const sourceCounts: Record<string, number> = {};
  const seenTitles = new Set<string>();
  const filtered: RawFeedItem[] = [];

  for (const item of rawItems) {
    sourceCounts[item.source] = (sourceCounts[item.source] || 0) + 1;
    if (sourceCounts[item.source] > perSourceCap) continue;

    // Simple dedupe: skip if a very similar title already seen
    const normalized = item.title.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 60);
    if (seenTitles.has(normalized)) continue;
    seenTitles.add(normalized);

    filtered.push(item);
  }

  // Hard cap at 120 items to keep prompt under Gemini's sweet spot
  const capped = filtered.slice(0, 120);

  const grouped: Record<string, { title: string; url: string; desc: string }[]> = {};
  for (const item of capped) {
    if (!grouped[item.source]) grouped[item.source] = [];
    grouped[item.source].push({
      title: item.title,
      url: item.url,
      desc: (item.description || "").substring(0, 120),
    });
  }

  const feedSummary = Object.entries(grouped)
    .map(
      ([source, items]) =>
        `## ${source}\n${items.map((i) => `- ${i.title} | ${i.url} | ${i.desc}`).join("\n")}`
    )
    .join("\n\n");

  console.log(`[Newsletter AI] Selecting from ${capped.length}/${rawItems.length} items (filtered)`);

  const prompt = `You are a senior AI/tech intelligence analyst. Pick the 10-15 MOST IMPORTANT signals from today's feed for an AI engineer/builder.

PRIORITIES:
1. New launches/releases (models, tools, frameworks, APIs)
2. Paradigm shifts (how we build is changing)
3. Builder tools & infra
4. Open source milestones
5. Funding/acquisitions signaling market direction
6. Research with practical near-term implications

SKIP: opinion pieces, minor bumps, PR fluff, regulatory unless it hits builders, incremental arxiv papers, generic AI news.

MERGE duplicate coverage into single signals.

NOTE: Items that overlap with signals published in the last 3 days have already been filtered out. If you still notice similar themes, merge them or skip — prioritize genuinely NEW developments.

Feed (${rawItems.length} items):

${feedSummary}

Return JSON array:
{
  "title": "Specific signal title",
  "category": "launch" | "research" | "tool" | "shift" | "funding" | "open_source",
  "source_urls": ["url1", "url2"],
  "summary": "1-2 sentence factual summary",
  "raw_titles": ["source titles merged"]
}

JSON only, no fences.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();

  try {
    const cleaned = text.replace(/^```json?\n?/i, "").replace(/\n?```$/i, "");
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("[Newsletter AI] Failed to parse signal selection:", e);
    return [];
  }
}

/* ─── Scored Interpretation (Call 2) ─── */

export interface InterpretedSignal extends SelectedSignal {
  so_what: string;
  delta: string;
  impact: string;
  who_should_care: string;
  hype_or_real: string;
  builder_opportunities: string;
  how_to_use: string;
  impact_score: number;
  confidence: string;
  time_horizon: string;
  display_order: number;
}

export async function interpretSignals(
  signals: SelectedSignal[]
): Promise<InterpretedSignal[]> {
  const model = getModel();

  const signalList = signals
    .map(
      (s, i) =>
        `Signal ${i + 1}: ${s.title}\nCategory: ${s.category}\nSummary: ${s.summary}`
    )
    .join("\n\n");

  const prompt = `You're a sharp builder-mentor writing signal cards for a daily tech dashboard. Each card should be scannable in 4 seconds. NO paragraphs. Short punchy fragments. Think terminal output, not blog post.

For each signal:

"so_what" - THE single insight line. What this means in plain english. Max 12 words. (e.g. "Agents can now reason across entire codebases.")
"delta" - What changed, before→after. One line. (e.g. "100K context → 1M context. Entire repos fit in one call.")
"impact" - Who cares and why, as a fragment. (e.g. "Agent builders get 10x more workspace per call.")
"who_should_care" - Roles as tags. (e.g. "agent devs, infra teams, startups")
"hype_or_real" - One of: "Real Shift", "Mostly Real", "Mixed", "Mostly Hype", "Pure Hype"
"builder_opportunities" - One specific thing to build. One line. (e.g. "Build repo-wide refactoring agents.")
"how_to_use" - One actionable step. (e.g. "Swap your context-chunking pipeline for single-pass.")
"impact_score" - 1 to 5 integer. 5 = industry-shifting, 1 = niche.
"confidence" - "high", "medium", or "low"
"time_horizon" - "now", "weeks", "months", or "long-term"

${signals.length} signals:

${signalList}

Return JSON array with ALL original fields + the above + "display_order" (1-indexed, highest impact first).
JSON only.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();

  try {
    const cleaned = text.replace(/^```json?\n?/i, "").replace(/\n?```$/i, "");
    const parsed: InterpretedSignal[] = JSON.parse(cleaned);

    return parsed.map((item, i) => {
      const original = signals[i] || signals[0];
      return {
        ...original,
        ...item,
        title: item.title || original?.title || "Untitled",
        category: item.category || original?.category || "tool",
        source_urls: item.source_urls || original?.source_urls || [],
        summary: item.summary || original?.summary || "",
        so_what: item.so_what || item.summary || "",
        delta: item.delta || "",
        impact: item.impact || "",
        who_should_care: item.who_should_care || "",
        hype_or_real: item.hype_or_real || "Mixed",
        builder_opportunities: item.builder_opportunities || "",
        how_to_use: item.how_to_use || "",
        impact_score: item.impact_score || 3,
        confidence: item.confidence || "medium",
        time_horizon: item.time_horizon || "now",
        display_order: item.display_order || i + 1,
      };
    });
  } catch (e) {
    console.error("[Newsletter AI] Failed to parse interpretation:", e);
    return [];
  }
}

/* ─── Deep Dives (Call 4 — runs after signals are scored) ─── */

export interface DeepDiveResult {
  title: string;
  deep_dive: string;
}

export async function generateDeepDives(
  signals: InterpretedSignal[]
): Promise<DeepDiveResult[]> {
  const model = getModel();

  // Pick top signals by impact (max 5 to keep token cost low)
  const top = [...signals]
    .sort((a, b) => (b.impact_score || 0) - (a.impact_score || 0))
    .slice(0, 5);

  const signalBlock = top
    .map(
      (s, i) =>
        `Signal ${i + 1}: "${s.title}"
Category: ${s.category}
Summary: ${s.summary}
So what: ${s.so_what}
Delta: ${s.delta}
Impact: ${s.impact}
Builder opportunities: ${s.builder_opportunities}
How to use: ${s.how_to_use}
Sources: ${s.source_urls.join(", ")}`
    )
    .join("\n\n");

  const prompt = `You're a senior AI/tech analyst writing extended briefings for builders. For each signal below, write a "deep dive" — a 200-300 word analysis that someone can read in 90 seconds.

STRUCTURE each deep dive as markdown with these sections:
## What Happened
1-2 paragraphs explaining the news clearly. Assume the reader knows the basics but needs context.

## Why It Matters
What does this change for builders? Be specific — mention concrete use cases, workflows, or products affected.

## What To Build
Specific, actionable opportunities. Not vague advice — real things someone could start building this weekend.

## Watch For
What to monitor next — follow-up announcements, risks, or dependencies.

TONE: Direct, analytical, opinionated. Like a smart friend explaining it over coffee. No corporate speak, no "in conclusion", no filler.

${top.length} signals to analyze:

${signalBlock}

Return using this EXACT format — separate each deep dive with the delimiter ===DEEPDIVE=== on its own line:

TITLE: <exact signal title>
---
<full markdown deep dive text>
===DEEPDIVE===
TITLE: <next signal title>
---
<full markdown text>
===DEEPDIVE===

Use this delimiter format ONLY. No JSON, no code fences.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();

  try {
    const blocks = text.split("===DEEPDIVE===").map((b) => b.trim()).filter(Boolean);
    const results: DeepDiveResult[] = [];

    for (const block of blocks) {
      const titleMatch = block.match(/^TITLE:\s*(.+)/);
      if (!titleMatch) continue;
      const title = titleMatch[1].trim();
      const dividerIdx = block.indexOf("---");
      if (dividerIdx === -1) continue;
      const deep_dive = block.slice(dividerIdx + 3).trim();
      if (deep_dive) {
        results.push({ title, deep_dive });
      }
    }

    console.log(`[Newsletter AI] Parsed ${results.length} deep dives`);
    return results;
  } catch (e) {
    console.error("[Newsletter AI] Failed to parse deep dives:", e);
    return [];
  }
}

/* ─── Newsletter Meta (Call 3) ─── */

export interface QuickScanCategory {
  label: string;
  summary: string;
}

export interface NewsletterMeta {
  subject: string;
  intro: string;
  main_insight: string;
  radar_rising: string[];
  radar_stable: string[];
  radar_declining: string[];
  curiosity_hook: string;
  closing_thought: string;
  quick_scan: QuickScanCategory[];
}

export async function generateNewsletterMeta(
  signals: InterpretedSignal[]
): Promise<NewsletterMeta> {
  const model = getModel();

  const signalSummaries = signals
    .slice(0, 8)
    .map((s) => `- ${s.title} (${s.category}, impact:${s.impact_score}) — ${s.so_what}`)
    .join("\n");

  const prompt = `You're writing the framing for a daily AI/tech intelligence briefing. You're a mentor who scanned the entire ecosystem overnight. Tone: direct, opinionated, builder-minded. No corporate speak.

Today's top signals:
${signalSummaries}

Total signals: ${signals.length}

Generate ALL of these:

1. "subject" - Email subject that creates tension/curiosity. NOT "Daily AI Newsletter". More like: "AI agents quietly crossed a line today" or "The ecosystem moved today — here's why". Under 60 chars.

2. "intro" - 2-sentence mentor observation. Set the narrative. What pattern did today reveal? Start like "Morning builders —" or similar. Make it feel like insight, not greeting.

3. "main_insight" - THE one thing to know today. If someone reads nothing else. One powerful sentence. (e.g. "AI agents are moving from demos to production workflows. The tooling layer is wide open.")

4. "radar_rising" - Array of 3 trends gaining momentum. Short fragments. (e.g. ["agent orchestration frameworks", "local inference stacks", "structured output APIs"])

5. "radar_stable" - Array of 2-3 established trends. (e.g. ["copilot-style assistants", "RAG pipelines"])

6. "radar_declining" - Array of 2-3 cooling trends. (e.g. ["single-prompt chatbots", "prompt engineering courses"])

7. "curiosity_hook" - Teaser for the web version. Creates FOMO. (e.g. "12 more signals today including new agent runtimes and a surprising physics result.")

8. "closing_thought" - Opinionated parting thought that leaves the reader thinking. One sentence. (e.g. "The tooling layer around agents is still wide open. Someone will build the Stripe of AI workflows.")

9. "quick_scan" - An array of EXACTLY 3 briefing categories. Each is {"label": "<category>", "summary": "<2-3 sentences>"}. The categories are:
   a) "What Launched" — Summarize ALL new tools, models, APIs, releases, and launches from today's signals. Be specific: name the tools/models. A reader should know what shipped today from this alone.
   b) "What's Shifting" — Synthesize the bigger trends and paradigm shifts visible across today's signals. What patterns are forming? What's changing in how we build? Connect the dots.
   c) "What to Watch" — The quieter signals, upcoming implications, and things to monitor. What did most people miss that builders should care about? What's brewing?
   Each summary should be SELF-CONTAINED — a reader who reads ONLY these 3 blurbs should understand today's AI landscape. Be factual, specific, and scannable. No vague opinions.

Return JSON object with all 9 fields. No fences.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();

  try {
    const cleaned = text.replace(/^```json?\n?/i, "").replace(/\n?```$/i, "");
    return JSON.parse(cleaned);
  } catch {
    return {
      subject: `Something shifted in AI today`,
      intro: "Here are today's most important signals for builders.",
      main_insight: signals[0]?.so_what || "The AI ecosystem moved today.",
      radar_rising: ["agent frameworks", "local inference", "structured outputs"],
      radar_stable: ["copilot assistants", "RAG pipelines"],
      radar_declining: ["single-prompt chatbots"],
      curiosity_hook: `${signals.length} signals today including new launches and research.`,
      closing_thought: "The best time to build is when the landscape is shifting.",
      quick_scan: [
        { label: "What Launched", summary: signals.filter(s => s.category === "launch" || s.category === "tool").map(s => s.title).slice(0, 3).join(", ") + "." || "New tools and releases shipped today." },
        { label: "What's Shifting", summary: signals[0]?.so_what || "The AI ecosystem moved today." },
        { label: "What to Watch", summary: signals[signals.length - 1]?.so_what || "Quieter trends worth monitoring." },
      ],
    };
  }
}

/* ─── Thread Suggestions ─── */

export interface ThreadSuggestion {
  title: string;
  slug: string;
  description: string;
  emoji: string;
  signal_ids: number[];
}

export async function suggestThreads(
  signals: { id: number; title: string; category: string; so_what: string; issue_date: string }[]
): Promise<ThreadSuggestion[]> {
  const model = getModel();

  const signalBlock = signals
    .map((s) => `- [id:${s.id}] "${s.title}" (${s.category}, ${s.issue_date}) — ${s.so_what}`)
    .join("\n");

  const prompt = `You're a sharp, opinionated tech writer with a knack for spotting the narratives people actually care about. Given the signals below from the last 30 days, find 3-5 SPECIFIC story threads that developers and builders would genuinely want to follow.

WHAT MAKES A GREAT THREAD:
- SPECIFIC, not generic. "Jobs Claude Has Taken This Month" >> "The AI Revolution". "Google vs OpenAI: The Benchmark Wars" >> "Model Competition".
- Has a NARRATIVE ARC — something is unfolding, escalating, or surprising. Readers should think "wait, what happens next?"
- Named like a podcast episode or a viral tweet, not a Wikipedia article. Punchy, opinionated, maybe funny.
- Tracks a CONCRETE rivalry, product saga, controversy, or trend with real momentum.
- Something people would actually share: "yo follow this thread on Vibe Code"

BAD THREAD NAMES (too generic, boring):
- "The Agentic AI Revolution"
- "Open Source AI Progress"
- "AI Infrastructure Evolution"
- "The Future of Coding"

GOOD THREAD NAMES (specific, compelling, followable):
- "Claude's Body Count: Every Job It Replaced This Month"
- "The Great Vibe Coding Debate"
- "OpenAI vs Anthropic: Benchmark Cage Match"
- "Cursor vs Windsurf: IDE Wars Get Ugly"
- "Open Source Models That Actually Ship"
- "Google's Quiet Gemini Comeback"
- "The Agent Framework Graveyard"
- "Things That Broke When People Used AI in Prod"

Signals from the last 30 days:
${signalBlock}

For each thread:
- "title": punchy, specific, scroll-stopping thread name
- "slug": URL-safe slug
- "description": 1-2 sentences that hook the reader — what's the drama? why should they care? write it like a trailer, not an abstract.
- "emoji": single emoji that fits the vibe
- "signal_ids": array of signal IDs that belong to this thread (minimum 3)

Only suggest threads with at least 3 matching signals. Prefer threads that span multiple days and have a clear narrative tension.

Return JSON array. No fences.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();

  try {
    const cleaned = text.replace(/^```json?\n?/i, "").replace(/\n?```$/i, "");
    const parsed: ThreadSuggestion[] = JSON.parse(cleaned);
    console.log(`[Newsletter AI] Suggested ${parsed.length} threads`);
    return parsed;
  } catch (e) {
    console.error("[Newsletter AI] Failed to parse thread suggestions:", e);
    return [];
  }
}

/* ─── Social Assets (Call 5) ─── */

export interface SocialAsset {
  format: "insight" | "contrarian" | "thread" | "question";
  signal_title: string;
  post_text: string;
  hook_curiosity: string;
  hook_contrarian: string;
  hook_prediction: string;
  thesis: string;
  topic_cluster: string;
  posting_order: number;
  signal_url: string;
}

export async function generateSocialAssets(
  signals: NewsletterSignal[],
  baseUrl: string
): Promise<SocialAsset[]> {
  const model = getModel();

  const top = [...signals]
    .sort((a, b) => (b.impact_score || 0) - (a.impact_score || 0))
    .slice(0, 5);

  const signalBlock = top
    .map(
      (s, i) =>
        `Signal ${i + 1} (id:${s.id}): "${s.title}"
Category: ${s.category}
So what: ${s.so_what}
Delta: ${s.delta}
Impact: ${s.impact}
Builder opportunities: ${s.builder_opportunities}`
    )
    .join("\n\n");

  const prompt = `You're a sharp AI/tech creator building a Twitter presence around daily AI signals. Generate 4 social media assets — one per format — from today's top signals.

FORMATS:
1. "insight" — Pure idea tweet. No link. Builds authority. Statement of what you observed.
2. "contrarian" — Challenges a common belief. Triggers replies/debate.
3. "thread" — 6-tweet thread: hook → signal 1 → signal 2 → signal 3 → takeaway → newsletter link. Separate tweets with \\n---\\n
4. "question" — Open-ended or poll-style. Drives replies.

For the thread format, use "${baseUrl}/news" as the newsletter link in the final tweet.

CONSTRAINTS:
- Max 270 characters per tweet (leave room for links)
- Max 1 hashtag per tweet (only if natural)
- NO emoji walls. Zero or one emoji max.
- Hook-first: opening line must create tension or curiosity
- No "check out our newsletter" energy. Be the signal, not the promoter.
- Thread tweets separated by \\n---\\n

For each asset, also generate:
- "hook_curiosity": an alternative opening using curiosity ("Something strange is happening...")
- "hook_contrarian": an alternative opening that challenges ("The biggest AI shift isn't...")
- "hook_prediction": an alternative opening with prediction ("Within 18 months...")
- "thesis": one bold, memorable, screenshot-worthy one-liner from the insight
- "topic_cluster": one of: "agents", "coding_tools", "local_ai", "models", "infra", "open_source", "research", "market"
- "posting_order": suggested order for the day (1=first to post, 4=last)
- "signal_url": relative URL — use "/news/signal/{id}" for the most relevant signal, or "/news" for general

Today's top ${top.length} signals:

${signalBlock}

Return JSON array of 4 objects:
{
  "format": "insight"|"contrarian"|"thread"|"question",
  "signal_title": "title of primary signal used",
  "post_text": "the tweet or thread text",
  "hook_curiosity": "...",
  "hook_contrarian": "...",
  "hook_prediction": "...",
  "thesis": "...",
  "topic_cluster": "...",
  "posting_order": 1-4,
  "signal_url": "/news/signal/{id}" or "/news"
}

JSON only, no fences.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();

  try {
    const cleaned = text.replace(/^```json?\n?/i, "").replace(/\n?```$/i, "");
    const parsed: SocialAsset[] = JSON.parse(cleaned);
    console.log(`[Newsletter AI] Generated ${parsed.length} social assets`);
    return parsed;
  } catch (e) {
    console.error("[Newsletter AI] Failed to parse social assets:", e);
    return [];
  }
}
