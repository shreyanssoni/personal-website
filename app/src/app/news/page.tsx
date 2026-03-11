import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import {
  getLatestIssues,
  getSignalsByIssue,
  getPublishedThreads,
  type NewsletterIssue,
  type NewsletterSignal,
  type NewsletterThread,
} from "@/lib/newsletter";
import SignalCard from "@/components/SignalCard";
import ShareButton from "@/components/ShareButton";
import NewsSearch from "@/components/NewsSearch";

/** Postgres DATE columns come back as JS Date objects via Neon driver. */
function toDateStr(d: string | Date): string {
  if (d instanceof Date) return d.toISOString().slice(0, 10);
  if (typeof d === "string" && d.length >= 10) return d.slice(0, 10);
  return String(d);
}

function toDate(d: string | Date): Date {
  return new Date(toDateStr(d) + "T12:00:00Z");
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}): Promise<Metadata> {
  const params = await searchParams;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://shreyanssoni.vercel.app";

  let title = "The Daily Vibe Code — AI & Tech Intelligence for Builders";
  let description = "Daily curated AI signals, tool launches, research breakthroughs, and builder opportunities. Scannable intelligence for developers and founders.";
  let canonical = `${siteUrl}/news`;

  try {
    const issues = await getLatestIssues(1);
    if (issues.length > 0) {
      const issue = issues[0];
      const dateStr = params.date || toDateStr(issue.issue_date);
      const d = new Date(dateStr + "T12:00:00Z");
      const formatted = d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

      title = `AI Signals for ${formatted} — The Daily Vibe Code`;
      if (issue.main_insight) {
        description = `${issue.main_insight} Plus ${issue.signal_count} more curated AI signals for builders.`;
      }
      if (params.date) {
        canonical = `${siteUrl}/news/${dateStr}`;
      }
    }
  } catch {}

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "The MicroBits",
      type: "website",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
    },
    keywords: [
      "AI news", "AI signals", "tech intelligence", "AI tools", "developer news",
      "AI launches", "machine learning", "LLM news", "builder tools", "AI ecosystem",
      "daily AI briefing", "AI research", "open source AI", "AI funding",
    ],
  };
}

export const revalidate = 1800;

/* ─── Section Rule Header ─── */

function SectionHeader({ label, meta, accentColor }: { label: string; meta?: React.ReactNode; accentColor?: string }) {
  return (
    <div className="mb-4">
      <div
        className="flex items-center justify-between pt-2.5"
        style={{ borderTop: `3px solid ${accentColor || "#1a1a1a"}` }}
      >
        <p className="font-[family-name:var(--font-display)] text-[13px] sm:text-[14px] tracking-[0.3em] uppercase text-stone-900">
          {label}
        </p>
        {meta && (
          <span className="font-[family-name:var(--font-mono)] text-[9px] tracking-[0.2em] uppercase text-stone-400">
            {meta}
          </span>
        )}
      </div>
      <div className="border-b border-stone-300 mt-2" />
    </div>
  );
}

/* ─── Quick Scan ─── */

const QUICK_SCAN_CONFIG = [
  { key: "qs_launched_text",  label: "What Launched",   emoji: "🚀", accent: "#D94848" },
  { key: "qs_shifting_text",  label: "What's Shifting", emoji: "🔄", accent: "#B07D1A" },
  { key: "qs_watch_text",     label: "What to Watch",   emoji: "👀", accent: "#148F76" },
] as const;

function QuickScan({ issue }: { issue: NewsletterIssue }) {
  const values: Record<string, string | null> = {
    qs_launched_text: issue.qs_launched_text ?? null,
    qs_shifting_text: issue.qs_shifting_text ?? null,
    qs_watch_text:    issue.qs_watch_text ?? null,
  };
  const cards = QUICK_SCAN_CONFIG
    .map((c) => ({ ...c, text: values[c.key] }))
    .filter((c) => c.text);

  if (cards.length === 0) return null;

  return (
    <div className="mb-10 sm:mb-14">
      <SectionHeader label="Today in 30 Seconds" meta="⚡ Briefing" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {cards.map((card) => (
          <div key={card.label} className="bg-white border border-stone-200 p-4 sm:p-5" style={{ borderTop: `3px solid ${card.accent}` }}>
            <p className="font-[family-name:var(--font-mono)] text-[9px] tracking-[0.2em] uppercase font-bold mb-2.5" style={{ color: card.accent }}>
              {card.emoji} {card.label}
            </p>
            <p className="font-body text-[13px] sm:text-[14px] text-stone-700 leading-snug">
              {card.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Main Insight ─── */

function MainInsight({ text }: { text: string }) {
  return (
    <div className="mb-10 sm:mb-14">
      <SectionHeader label="Lead Signal" meta="If you read one thing today" accentColor="#4F8CFF" />
      <div className="relative pl-5 border-l-4 border-[#4F8CFF]">
        <p className="font-serif text-[18px] sm:text-[22px] md:text-[26px] text-stone-900 leading-snug font-bold">
          {text}
        </p>
      </div>
    </div>
  );
}

/* ─── Builder Radar ─── */

function BuilderRadar({ rising, stable, declining }: { rising: string[]; stable: string[]; declining: string[] }) {
  if (rising.length === 0 && stable.length === 0 && declining.length === 0) return null;

  const sections = [
    { label: "Rising",  items: rising,    hex: "#2ECC71", labelClass: "text-[#219A52]", itemClass: "text-stone-700" },
    { label: "Stable",  items: stable,    hex: "#94A3B8", labelClass: "text-stone-400", itemClass: "text-stone-400" },
    { label: "Cooling", items: declining, hex: "#FF6B6B", labelClass: "text-[#D94848]", itemClass: "text-stone-400" },
  ];

  return (
    <div className="mb-10 sm:mb-14">
      <SectionHeader label="📡 Builder Radar" meta="Trends" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        {sections.map((s) => s.items.length > 0 && (
          <div key={s.label}>
            <div className="flex items-center gap-2 mb-2.5">
              <span className="w-2 h-2 shrink-0" style={{ backgroundColor: s.hex }} />
              <p className={`font-[family-name:var(--font-mono)] text-[9px] tracking-[0.2em] font-bold uppercase ${s.labelClass}`}>
                {s.label}
              </p>
            </div>
            {s.items.map((t, i) => (
              <p key={i} className={`font-[family-name:var(--font-body)] text-[12px] sm:text-[13px] mb-1.5 leading-snug pl-4 border-l border-stone-200 ${s.itemClass}`}>
                {t}
              </p>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Garden Divider ─── */

function GardenDivider({ text }: { text?: string }) {
  return (
    <div className="flex items-center gap-3 my-8 sm:my-10">
      <div className="flex-1 h-px bg-stone-300" />
      <span className="font-[family-name:var(--font-mono)] text-[9px] tracking-[0.3em] uppercase text-stone-400 shrink-0">
        {text || "✦"}
      </span>
      <div className="flex-1 h-px bg-stone-300" />
    </div>
  );
}

/* ─── Issue Nav ─── */

function IssueNav({ issues, currentDate }: { issues: NewsletterIssue[]; currentDate: string }) {
  return (
    <div className="flex items-center gap-1.5 mb-8 overflow-x-auto pb-3 scrollbar-hide border-b border-stone-200">
      <span className="font-[family-name:var(--font-mono)] text-[9px] tracking-[0.2em] text-stone-400 uppercase mr-2 shrink-0 font-bold">
        Archive
      </span>
      {issues.map((issue) => {
        const dateStr = toDateStr(issue.issue_date);
        const d = toDate(issue.issue_date);
        const active = dateStr === currentDate;
        return (
          <Link
            key={dateStr}
            href={`/news/${dateStr}`}
            className={`font-[family-name:var(--font-mono)] text-[10px] px-3 py-1.5 shrink-0 font-bold tracking-wider transition-all ${
              active
                ? "bg-stone-900 text-white"
                : "text-stone-400 hover:text-stone-800 hover:bg-stone-100"
            }`}
          >
            {d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </Link>
        );
      })}
    </div>
  );
}

/* ─── Masthead ─── */

function Masthead({ issue, signalCount }: { issue: NewsletterIssue; signalCount: number }) {
  const date = toDate(issue.issue_date);

  return (
    <header className="mb-10 sm:mb-14">
      {/* Top rule + tagline */}
      <div className="border-t-[3px] border-stone-900 pt-3 pb-2.5 flex items-center justify-between">
        <p className="font-[family-name:var(--font-mono)] text-[8px] sm:text-[9px] tracking-[0.4em] uppercase text-stone-500 font-bold">
          The MicroBits · Daily Intelligence Briefing
        </p>
        <span className="bg-[#D94848] text-white font-mono text-[8px] tracking-[0.2em] uppercase font-bold px-2 py-0.5">
          FREE
        </span>
      </div>
      <div className="border-b border-stone-400" />

      {/* Big title */}
      <div className="text-center py-5 sm:py-8 border-b-[3px] border-stone-900">
        <h1 className="font-[family-name:var(--font-display)] text-[52px] sm:text-[76px] md:text-[104px] tracking-widest text-stone-900 leading-[0.9]">
          THE DAILY<br className="sm:hidden" /> VIBE CODE
        </h1>
        <p className="font-mono text-[8px] tracking-[0.4em] uppercase text-stone-400 mt-2 hidden sm:block">
          AI · TOOLS · RESEARCH · FUNDING · OPEN SOURCE
        </p>
      </div>

      {/* Dateline */}
      <div className="border-b border-stone-300 py-2 px-1 flex items-center justify-between">
        <span className="font-[family-name:var(--font-mono)] text-[9px] sm:text-[10px] tracking-[0.15em] uppercase text-stone-600 font-bold">
          {date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
        </span>
        <div className="flex items-center gap-3">
          <span className="font-[family-name:var(--font-mono)] text-[9px] sm:text-[10px] tracking-[0.15em] uppercase text-stone-400 font-bold">
            {signalCount} Signals
          </span>
          <ShareButton
            issueId={issue.id}
            issueDate={toDateStr(issue.issue_date)}
            title={date.toLocaleDateString("en-US", { month: "long", day: "numeric" })}
          />
        </div>
      </div>

      {/* Intro */}
      {issue.intro_text && (
        <div className="mt-6 border-b border-stone-200 pb-6">
          <p className="font-[family-name:var(--font-soft)] text-sm sm:text-base italic text-stone-500 leading-relaxed max-w-xl mx-auto text-center">
            &ldquo;{issue.intro_text}&rdquo;
          </p>
        </div>
      )}
    </header>
  );
}

/* ─── Scroll Prompt ─── */

function ScrollPrompt({ count }: { count: number }) {
  return (
    <div className="mb-6 sm:mb-8 flex items-center justify-between border-t-[3px] border-b border-stone-900 py-2.5">
      <p className="font-[family-name:var(--font-display)] text-[13px] sm:text-[14px] tracking-[0.3em] uppercase text-stone-900">
        Today&apos;s Signals
      </p>
      <p className="font-[family-name:var(--font-mono)] text-[10px] tracking-[0.15em] uppercase text-stone-500 font-bold">
        {count} curated ↓
      </p>
    </div>
  );
}

/* ─── Threads Promo ─── */

function ThreadsPromo({ threads }: { threads: NewsletterThread[] }) {
  if (threads.length === 0) return null;

  return (
    <div className="mb-10 sm:mb-14">
      <SectionHeader
        label="🧵 Ongoing Coverage"
        meta={<Link href="/news/threads" className="font-[family-name:var(--font-mono)] text-[9px] tracking-[0.15em] uppercase text-stone-500 hover:text-stone-900 transition-colors font-bold">All threads →</Link>}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {threads.slice(0, 4).map((thread) => (
          <Link
            key={thread.id}
            href={`/news/threads/${thread.slug}`}
            className="group flex items-start gap-3 p-4 bg-white border border-stone-200 hover:border-stone-400 hover:shadow-sm transition-all"
          >
            <span className="text-xl shrink-0 mt-0.5">{thread.emoji}</span>
            <div className="min-w-0">
              <h4 className="font-[family-name:var(--font-serif)] text-[14px] sm:text-[15px] font-bold text-stone-800 group-hover:text-[#4F8CFF] transition-colors leading-snug mb-0.5 truncate">
                {thread.title}
              </h4>
              {thread.description && (
                <p className="font-[family-name:var(--font-body)] text-[12px] text-stone-400 leading-snug line-clamp-1">
                  {thread.description}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ─── Page ─── */

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const params = await searchParams;
  let issues: NewsletterIssue[] = [];
  let signals: NewsletterSignal[] = [];
  let currentIssue: NewsletterIssue | null = null;
  let threads: NewsletterThread[] = [];

  try {
    [issues, threads] = await Promise.all([
      getLatestIssues(14),
      getPublishedThreads(),
    ]);
    if (issues.length > 0) {
      const targetDate = params.date || toDateStr(issues[0].issue_date);
      currentIssue = issues.find((i) => toDateStr(i.issue_date) === targetDate) || issues[0];
      signals = await getSignalsByIssue(currentIssue.id);
    }
  } catch (e) {
    console.error("News page error:", e);
  }

  const hasContent = currentIssue && signals.length > 0;
  const sorted = [...signals].sort((a, b) => a.display_order - b.display_order);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://shreyanssoni.vercel.app";

  /* ─── JSON-LD Structured Data ─── */
  const jsonLd = hasContent && currentIssue ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `The Daily Vibe Code — ${toDateStr(currentIssue.issue_date)}`,
    description: currentIssue.main_insight || `${signals.length} curated AI signals for builders`,
    url: `${siteUrl}/news${currentIssue ? `?date=${toDateStr(currentIssue.issue_date)}` : ""}`,
    numberOfItems: signals.length,
    datePublished: toDateStr(currentIssue.issue_date),
    publisher: {
      "@type": "Organization",
      name: "The MicroBits",
      url: siteUrl,
    },
    itemListElement: sorted.slice(0, 10).map((signal, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "TechArticle",
        headline: signal.title,
        description: signal.so_what || signal.summary,
        datePublished: toDateStr(currentIssue.issue_date),
        about: signal.category,
        url: signal.source_urls?.[0] || `${siteUrl}/news`,
      },
    })),
  } : null;

  return (
    <div className="news-page min-h-screen pt-24 sm:pt-28 pb-16 sm:pb-24 bg-[#F5F0E8]">
      {/* JSON-LD */}
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}

      <div className="mx-auto max-w-2xl px-4 sm:px-6 relative">
        {issues.length > 1 && (
          <nav aria-label="Issue archive navigation">
            <IssueNav issues={issues} currentDate={currentIssue ? toDateStr(currentIssue.issue_date) : ""} />
          </nav>
        )}

        {/* Search + RSS */}
        <div className="flex items-center justify-center gap-3 mb-6 sm:mb-8">
          <NewsSearch />
          <a
            href="/api/news/rss"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-2xl bg-white/70 border border-stone-200/50 shadow-sm hover:shadow-md hover:bg-white transition-all text-stone-400 hover:text-orange-500"
            title="RSS Feed"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
              <circle cx="6.18" cy="17.82" r="2.18"/>
              <path d="M4 4.44v2.83c7.03 0 12.73 5.7 12.73 12.73h2.83c0-8.59-6.97-15.56-15.56-15.56zm0 5.66v2.83c3.9 0 7.07 3.17 7.07 7.07h2.83c0-5.47-4.43-9.9-9.9-9.9z"/>
            </svg>
            <span className="font-[family-name:var(--font-mono)] text-[9px] tracking-wider uppercase hidden sm:inline">RSS</span>
          </a>
        </div>

        {hasContent && currentIssue ? (
          <article>
            <Masthead issue={currentIssue} signalCount={signals.length} />

            {/* Layer 1: Quick scan */}
            <section aria-label="Quick scan highlights">
              <QuickScan issue={currentIssue} />
            </section>

            {/* Main insight */}
            {currentIssue.main_insight && (
              <section aria-label="Key insight">
                <MainInsight text={currentIssue.main_insight} />
              </section>
            )}

            {/* Threads promo — above signals for discoverability */}
            <ThreadsPromo threads={threads} />

            {/* Builder Radar */}
            <section aria-label="Builder radar trends">
              <BuilderRadar
                rising={currentIssue.radar_rising || []}
                stable={currentIssue.radar_stable || []}
                declining={currentIssue.radar_declining || []}
              />
            </section>

            <ScrollPrompt count={signals.length} />

            {/* Layer 2: All signal cards */}
            <section aria-label="All curated signals">
              <h2 className="sr-only">Today&apos;s AI Signals</h2>
              <div className="mb-14 sm:mb-16 space-y-4 sm:space-y-5">
                {sorted.map((signal) => (
                  <SignalCard key={signal.id} signal={signal} />
                ))}
              </div>
            </section>

            {/* Closing */}
            {currentIssue.closing_thought && (
              <footer>
                <GardenDivider text="fin" />
                <div className="text-center mb-14 sm:mb-16">
                  <p className="font-[family-name:var(--font-soft)] text-sm sm:text-base italic text-stone-500 max-w-md mx-auto leading-relaxed">
                    &ldquo;{currentIssue.closing_thought}&rdquo;
                  </p>
                </div>
              </footer>
            )}

            {/* SEO: crawlable text summary of signals */}
            <div className="sr-only" aria-hidden="false">
              <h2>AI Signal Summary for {toDateStr(currentIssue.issue_date)}</h2>
              <p>{currentIssue.main_insight}</p>
              <ul>
                {sorted.map((s) => (
                  <li key={s.id}>
                    <strong>{s.title}</strong> ({s.category}) — {s.so_what}. {s.delta}. Impact: {s.impact}. Builder opportunity: {s.builder_opportunities}.
                  </li>
                ))}
              </ul>
              {currentIssue.radar_rising && <p>Rising trends: {currentIssue.radar_rising.join(", ")}</p>}
              {currentIssue.radar_stable && <p>Stable trends: {currentIssue.radar_stable.join(", ")}</p>}
              {currentIssue.radar_declining && <p>Cooling trends: {currentIssue.radar_declining.join(", ")}</p>}
            </div>

            {/* Archive calendar */}
            {issues.length > 1 && (
              <nav aria-label="Signals archive calendar">
                <GardenDivider />
                <SectionHeader label="📅 Signals Archive" />
                <div className="flex flex-wrap gap-2">
                  {issues.map((issue) => {
                    const dateStr = toDateStr(issue.issue_date);
                    const d = toDate(issue.issue_date);
                    const active = currentIssue ? dateStr === toDateStr(currentIssue.issue_date) : false;
                    return (
                      <Link
                        key={dateStr}
                        href={`/news/${dateStr}`}
                        className={`px-3 py-2 text-center min-w-[56px] sm:min-w-[64px] border transition-all ${
                          active
                            ? "bg-stone-900 border-stone-900 text-white"
                            : "bg-white border-stone-200 hover:border-stone-400"
                        }`}
                      >
                        <p className="font-mono text-[9px] font-medium text-stone-400">
                          {d.toLocaleDateString("en-US", { month: "short" })}
                        </p>
                        <p className={`font-[family-name:var(--font-display)] text-xl leading-tight ${active ? "text-white" : "text-stone-600"}`}>
                          {d.getDate()}
                        </p>
                        <p className={`font-mono text-[8px] ${active ? "text-stone-400" : "text-stone-300"}`}>
                          {issue.signal_count}sig
                        </p>
                      </Link>
                    );
                  })}
                </div>
              </nav>
            )}
          </article>
        ) : (
          <div className="py-24 sm:py-32">
            <div className="border-t-[3px] border-stone-900 pt-3 pb-2.5 text-center mb-0">
              <p className="font-[family-name:var(--font-mono)] text-[9px] tracking-[0.5em] uppercase text-stone-500 font-bold">
                The MicroBits · Daily Intelligence Briefing
              </p>
            </div>
            <div className="border-b border-stone-300 mb-6" />
            <div className="text-center border-b-[3px] border-stone-900 pb-6 mb-8">
              <h1 className="font-[family-name:var(--font-display)] text-[52px] sm:text-[76px] tracking-widest text-stone-900 leading-[0.9]">
                THE DAILY VIBE CODE
              </h1>
            </div>
            <p className="font-[family-name:var(--font-soft)] text-sm sm:text-base italic text-stone-400 text-center">
              No briefing yet. The first issue appears when the daily cron runs.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
