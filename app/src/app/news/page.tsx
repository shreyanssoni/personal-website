import type { Metadata } from "next";
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
  let description = "Daily curated AI signals, tool launches, research breakthroughs, and builder opportunities.";
  let canonical = `${siteUrl}/news`;
  try {
    const issues = await getLatestIssues(1);
    if (issues.length > 0) {
      const issue = issues[0];
      const dateStr = params.date || toDateStr(issue.issue_date);
      const d = new Date(dateStr + "T12:00:00Z");
      const formatted = d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
      title = `AI Signals for ${formatted} — The Daily Vibe Code`;
      if (issue.main_insight) description = `${issue.main_insight} Plus ${issue.signal_count} more curated AI signals.`;
      if (params.date) canonical = `${siteUrl}/news/${dateStr}`;
    }
  } catch {}
  return {
    title, description, alternates: { canonical },
    openGraph: { title, description, url: canonical, siteName: "The MicroBits", type: "website", locale: "en_US" },
    twitter: { card: "summary_large_image", title, description },
    robots: { index: true, follow: true },
    keywords: ["AI news","AI signals","tech intelligence","AI tools","developer news","AI launches","machine learning","LLM news","builder tools","AI ecosystem","daily AI briefing","AI research","open source AI","AI funding"],
  };
}

export const revalidate = 1800;

/* ─── Section Divider (reference: h3 + line + right label) ─── */

function SectionDivider({ title, label }: { title: string; label?: string }) {
  return (
    <div className="flex items-center justify-between mb-10 sm:mb-12">
      <h3 className="text-2xl sm:text-3xl font-bold text-white">{title}</h3>
      <div className="h-px flex-1 bg-[#8B8FC7]/20 mx-6 sm:mx-8" />
      {label && (
        <span className="font-mono text-xs sm:text-sm tracking-widest uppercase text-[#8B8FC7]">
          {label}
        </span>
      )}
    </div>
  );
}

/* ─── Quick Scan (reference: 3 glass cards with icon circles) ─── */

const QS_CONFIG = [
  { key: "qs_launched_text", label: "What Launched",   icon: "🚀" },
  { key: "qs_shifting_text", label: "What's Shifting", icon: "🔄" },
  { key: "qs_watch_text",    label: "What to Watch",   icon: "👀" },
] as const;

function QuickScan({ issue }: { issue: NewsletterIssue }) {
  const values: Record<string, string | null> = {
    qs_launched_text: issue.qs_launched_text ?? null,
    qs_shifting_text: issue.qs_shifting_text ?? null,
    qs_watch_text:    issue.qs_watch_text ?? null,
  };
  const cards = QS_CONFIG.map((c) => ({ ...c, text: values[c.key] })).filter((c) => c.text);
  if (cards.length === 0) return null;

  return (
    <section className="mb-20 sm:mb-28">
      <SectionDivider title="30-Second TLDR" label="Quick Bites" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-10">
        {cards.map((card) => (
          <div
            key={card.label}
            className="news-glass rounded-2xl p-8 sm:p-10 border-t-2 border-t-[#8B8FC7]/20 hover:border-t-[#8B8FC7] transition-all duration-500"
          >
            <div className="size-12 rounded-full bg-[#8B8FC7]/20 flex items-center justify-center text-xl mb-6">
              {card.icon}
            </div>
            <h4 className="text-lg sm:text-xl font-bold text-white mb-3">{card.label}</h4>
            <p className="text-slate-400 text-sm leading-relaxed">{card.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── Hero / Lead Signal ─── */

function HeroSignal({ text }: { text: string }) {
  return (
    <section className="relative group mb-20 sm:mb-28">
      <div className="relative w-full overflow-hidden rounded-2xl sm:rounded-3xl news-glow-primary">
        <div className="bg-gradient-to-br from-[#8B8FC7]/10 via-[#0F1115] to-[#0F1115] p-8 sm:p-12 lg:p-16">
          <span className="inline-block px-5 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-white/90 text-[10px] font-bold tracking-[0.2em] uppercase mb-6 border border-white/10">
            Lead Signal
          </span>
          <p className="text-2xl sm:text-4xl lg:text-5xl font-bold leading-[1.1] tracking-tight text-white max-w-3xl">
            {text}
          </p>
        </div>
      </div>
    </section>
  );
}

/* ─── Builder Radar ─── */

function BuilderRadar({ rising, stable, declining }: { rising: string[]; stable: string[]; declining: string[] }) {
  if (rising.length === 0 && stable.length === 0 && declining.length === 0) return null;
  const sections = [
    { label: "Rising",  items: rising,    color: "text-emerald-400", dotColor: "bg-emerald-400" },
    { label: "Stable",  items: stable,    color: "text-[#8B8FC7]",  dotColor: "bg-[#8B8FC7]" },
    { label: "Cooling", items: declining, color: "text-red-400",     dotColor: "bg-red-400" },
  ];
  return (
    <section className="mb-20 sm:mb-28">
      <SectionDivider title="Builder Radar" label="Trends" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-10">
        {sections.map((s) => s.items.length > 0 && (
          <div key={s.label} className="news-glass rounded-2xl p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-4">
              <span className={`w-2.5 h-2.5 rounded-full ${s.dotColor}`} />
              <p className={`font-mono text-xs tracking-widest uppercase font-bold ${s.color}`}>{s.label}</p>
            </div>
            {s.items.map((t, i) => (
              <p key={i} className="text-slate-400 text-sm leading-relaxed mb-2 pl-4 border-l border-white/10">
                {t}
              </p>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── Threads Promo ─── */

function ThreadsPromo({ threads }: { threads: NewsletterThread[] }) {
  if (threads.length === 0) return null;
  return (
    <section className="mb-20 sm:mb-28">
      <SectionDivider title="Ongoing Coverage" label="Threads" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {threads.slice(0, 4).map((thread) => (
          <Link
            key={thread.id}
            href={`/news/threads/${thread.slug}`}
            className="group news-glass rounded-2xl p-6 sm:p-8 hover:bg-white/[0.05] border border-transparent hover:border-[#8B8FC7]/20 transition-all duration-300"
          >
            <div className="flex items-start gap-4">
              <span className="text-2xl shrink-0">{thread.emoji}</span>
              <div className="min-w-0">
                <h4 className="text-base sm:text-lg font-bold text-white group-hover:text-[#8B8FC7] transition-colors leading-snug mb-1 truncate">
                  {thread.title}
                </h4>
                {thread.description && (
                  <p className="text-slate-500 text-sm leading-snug line-clamp-2">{thread.description}</p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
      <div className="mt-6 text-center">
        <Link href="/news/threads" className="inline-flex items-center gap-2 text-[#8B8FC7] font-mono text-xs tracking-widest uppercase hover:text-white transition-colors">
          All threads →
        </Link>
      </div>
    </section>
  );
}

/* ─── Issue Nav (archive pills) ─── */

function IssueNav({ issues, currentDate }: { issues: NewsletterIssue[]; currentDate: string }) {
  return (
    <div className="flex items-center gap-2 mb-10 overflow-x-auto pb-3 scrollbar-hide">
      <span className="font-mono text-[10px] tracking-widest text-slate-500 uppercase mr-2 shrink-0 font-bold">Archive</span>
      {issues.map((issue) => {
        const dateStr = toDateStr(issue.issue_date);
        const d = toDate(issue.issue_date);
        const active = dateStr === currentDate;
        return (
          <Link
            key={dateStr}
            href={`/news/${dateStr}`}
            className={`font-mono text-[11px] px-4 py-2 rounded-full shrink-0 font-bold tracking-wider transition-all ${
              active
                ? "bg-[#8B8FC7] text-white news-glow-primary"
                : "text-slate-500 hover:text-white hover:bg-white/[0.05]"
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
    <header className="mb-16 sm:mb-24">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/[0.05]">
        <p className="font-mono text-[9px] sm:text-[10px] tracking-[0.3em] uppercase text-slate-500 font-bold">
          Daily Intelligence Briefing
        </p>
        <span className="bg-[#8B8FC7]/20 text-[#8B8FC7] font-mono text-[9px] tracking-widest uppercase font-bold px-3 py-1 rounded-full border border-[#8B8FC7]/30">
          FREE
        </span>
      </div>

      {/* Big title */}
      <div className="text-center mb-8">
        <h1 className="font-display text-[56px] sm:text-[80px] md:text-[110px] lg:text-[130px] tracking-wider text-white leading-[0.85]">
          THE DAILY<br className="sm:hidden" /> VIBE CODE
        </h1>
      </div>

      {/* Dateline */}
      <div className="flex items-center justify-between py-4 border-t border-b border-white/[0.05]">
        <span className="font-mono text-[10px] sm:text-xs tracking-wider uppercase text-slate-400 font-medium">
          {date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
        </span>
        <div className="flex items-center gap-4">
          <span className="font-mono text-[10px] sm:text-xs tracking-wider uppercase text-slate-500">
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
        <div className="mt-10 max-w-2xl mx-auto text-center">
          <p className="text-base sm:text-lg text-slate-400 font-light leading-relaxed italic">
            &ldquo;{issue.intro_text}&rdquo;
          </p>
        </div>
      )}
    </header>
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
    [issues, threads] = await Promise.all([getLatestIssues(14), getPublishedThreads()]);
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

  const jsonLd = hasContent && currentIssue ? {
    "@context": "https://schema.org", "@type": "ItemList",
    name: `The Daily Vibe Code — ${toDateStr(currentIssue.issue_date)}`,
    description: currentIssue.main_insight || `${signals.length} curated AI signals`,
    url: `${siteUrl}/news${currentIssue ? `?date=${toDateStr(currentIssue.issue_date)}` : ""}`,
    numberOfItems: signals.length, datePublished: toDateStr(currentIssue.issue_date),
    publisher: { "@type": "Organization", name: "The MicroBits", url: siteUrl },
    itemListElement: sorted.slice(0, 10).map((signal, i) => ({
      "@type": "ListItem", position: i + 1,
      item: { "@type": "TechArticle", headline: signal.title, description: signal.so_what || signal.summary,
        datePublished: toDateStr(currentIssue.issue_date), about: signal.category,
        url: signal.source_urls?.[0] || `${siteUrl}/news` },
    })),
  } : null;

  return (
    <div className="news-page min-h-screen pt-28 sm:pt-32 pb-20 sm:pb-32">
      {jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      )}

      <main className="relative z-10 mx-auto max-w-5xl px-6 lg:px-16">
        {/* Archive nav */}
        {issues.length > 1 && (
          <IssueNav issues={issues} currentDate={currentIssue ? toDateStr(currentIssue.issue_date) : ""} />
        )}

        {/* Search + RSS */}
        <div className="flex items-center justify-center gap-3 mb-10 sm:mb-14">
          <NewsSearch />
          <a
            href="/api/news/rss"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full news-glass hover:bg-white/[0.05] transition-all text-slate-500 hover:text-orange-400"
            title="RSS Feed"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
              <circle cx="6.18" cy="17.82" r="2.18"/>
              <path d="M4 4.44v2.83c7.03 0 12.73 5.7 12.73 12.73h2.83c0-8.59-6.97-15.56-15.56-15.56zm0 5.66v2.83c3.9 0 7.07 3.17 7.07 7.07h2.83c0-5.47-4.43-9.9-9.9-9.9z"/>
            </svg>
            <span className="font-mono text-[10px] tracking-wider uppercase hidden sm:inline">RSS</span>
          </a>
        </div>

        {hasContent && currentIssue ? (
          <article>
            <Masthead issue={currentIssue} signalCount={signals.length} />

            {/* Hero: Lead Signal */}
            {currentIssue.main_insight && <HeroSignal text={currentIssue.main_insight} />}

            {/* Quick Scan */}
            <QuickScan issue={currentIssue} />

            {/* Threads */}
            <ThreadsPromo threads={threads} />

            {/* Builder Radar */}
            <BuilderRadar
              rising={currentIssue.radar_rising || []}
              stable={currentIssue.radar_stable || []}
              declining={currentIssue.radar_declining || []}
            />

            {/* Signal Cards */}
            <section className="mb-20 sm:mb-28">
              <SectionDivider title="Today&apos;s Signals" label={`${signals.length} Curated`} />
              <div className="space-y-6 sm:space-y-8">
                {sorted.map((signal, i) => (
                  <SignalCard key={signal.id} signal={signal} index={i + 1} />
                ))}
              </div>
            </section>

            {/* Closing thought */}
            {currentIssue.closing_thought && (
              <div className="text-center mb-20 sm:mb-28 max-w-xl mx-auto">
                <div className="h-px w-16 bg-[#8B8FC7]/30 mx-auto mb-8" />
                <p className="text-base sm:text-lg italic text-slate-500 leading-relaxed">
                  &ldquo;{currentIssue.closing_thought}&rdquo;
                </p>
              </div>
            )}

            {/* SEO */}
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
            </div>

            {/* Archive calendar */}
            {issues.length > 1 && (
              <nav className="mb-10">
                <SectionDivider title="Archive" />
                <div className="flex flex-wrap gap-3">
                  {issues.map((issue) => {
                    const dateStr = toDateStr(issue.issue_date);
                    const d = toDate(issue.issue_date);
                    const active = currentIssue ? dateStr === toDateStr(currentIssue.issue_date) : false;
                    return (
                      <Link
                        key={dateStr}
                        href={`/news/${dateStr}`}
                        className={`px-4 py-3 text-center min-w-[60px] rounded-xl transition-all ${
                          active
                            ? "bg-[#8B8FC7] text-white news-glow-primary"
                            : "news-glass hover:bg-white/[0.05]"
                        }`}
                      >
                        <p className="font-mono text-[9px] font-medium text-slate-500">{d.toLocaleDateString("en-US", { month: "short" })}</p>
                        <p className={`font-display text-xl leading-tight ${active ? "text-white" : "text-slate-300"}`}>{d.getDate()}</p>
                        <p className={`font-mono text-[8px] ${active ? "text-white/70" : "text-slate-600"}`}>{issue.signal_count}sig</p>
                      </Link>
                    );
                  })}
                </div>
              </nav>
            )}
          </article>
        ) : (
          <div className="py-32 sm:py-40 text-center">
            <h1 className="font-display text-[56px] sm:text-[80px] tracking-wider text-white leading-[0.85] mb-8">
              THE DAILY VIBE CODE
            </h1>
            <p className="text-slate-500 italic">No briefing yet. The first issue appears when the daily cron runs.</p>
          </div>
        )}
      </main>
    </div>
  );
}
