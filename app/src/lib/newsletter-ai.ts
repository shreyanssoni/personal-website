import { GoogleGenerativeAI } from "@google/generative-ai";
import type { RawFeedItem } from "./newsletter";

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

Return JSON array:
[{"title": "<exact signal title>", "deep_dive": "<full markdown text>"}]

JSON only, no fences.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();

  try {
    const cleaned = text.replace(/^```json?\n?/i, "").replace(/\n?```$/i, "");
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("[Newsletter AI] Failed to parse deep dives:", e);
    return [];
  }
}

/* ─── Newsletter Meta (Call 3) ─── */

export interface QuickScanPick {
  signal_title: string;
  text: string;
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
  quick_scan_biggest: QuickScanPick;
  quick_scan_overhyped: QuickScanPick;
  quick_scan_quiet: QuickScanPick;
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

9. "quick_scan_biggest" - The SINGLE most important signal today. NOT just the highest score — think about what a builder HAS to know. Return {"signal_title": "<exact title from signals>", "text": "<one punchy sentence why this is the biggest deal>"}

10. "quick_scan_overhyped" - The signal getting the most buzz but deserves skepticism. Pick one that sounds impressive but may not live up to hype. Return {"signal_title": "<exact title>", "text": "<why it's overhyped, one sentence>"}

11. "quick_scan_quiet" - A signal most people will miss but builders should watch. The sleeper. NOT the biggest, NOT hype — the quiet trend. Return {"signal_title": "<exact title>", "text": "<why this matters more than people think, one sentence>"}

Return JSON object with all 11 fields. No fences.`;

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
      quick_scan_biggest: { signal_title: signals[0]?.title || "", text: signals[0]?.so_what || "The biggest signal today." },
      quick_scan_overhyped: { signal_title: signals.find(s => s.hype_or_real?.toLowerCase().includes("hype"))?.title || signals[1]?.title || "", text: "Worth watching but don't overreact." },
      quick_scan_quiet: { signal_title: signals[signals.length - 1]?.title || "", text: "A quiet trend worth watching." },
    };
  }
}
