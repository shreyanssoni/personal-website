import type { Metadata } from "next";
import Link from "next/link";
import {
  getLatestIssues,
  getSignalsByIssue,
  type NewsletterIssue,
  type NewsletterSignal,
} from "@/lib/newsletter";
import SignalCard from "@/components/SignalCard";

/** Postgres DATE columns come back as JS Date objects via Neon driver.
 *  This safely converts to a "YYYY-MM-DD" string. */
function toDateStr(d: string | Date): string {
  if (d instanceof Date) return d.toISOString().slice(0, 10);
  if (typeof d === "string" && d.length >= 10) return d.slice(0, 10);
  return String(d);
}

function toDate(d: string | Date): Date {
  return new Date(toDateStr(d) + "T12:00:00Z");
}

export const metadata: Metadata = {
  title: "The Daily Signal",
  description: "Daily AI & tech intelligence. Scannable signals for builders.",
};

export const revalidate = 1800;

/* ─── Quick Scan ─── */

function QuickScan({ issue }: { issue: NewsletterIssue }) {
  const cards = [
    issue.qs_biggest_text && { icon: "◆", label: "Biggest Signal", text: issue.qs_biggest_text, accent: "#FF6B6B" },
    issue.qs_overhyped_text && { icon: "◇", label: "Overhyped", text: issue.qs_overhyped_text, accent: "#F4B942" },
    issue.qs_quiet_text && { icon: "◈", label: "Quiet Trend", text: issue.qs_quiet_text, accent: "#1ABC9C" },
  ].filter(Boolean) as { icon: string; label: string; text: string; accent: string }[];

  if (cards.length === 0) return null;

  return (
    <div className="mb-16">
      <p className="font-[family-name:var(--font-mono)] text-[10px] tracking-[0.3em] uppercase text-stone-400 mb-5 font-semibold">
        Today in 30 seconds
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="signal-card p-5"
            style={{ borderTop: `3px solid ${card.accent}` }}
          >
            <p className="font-[family-name:var(--font-mono)] text-[9px] tracking-[0.15em] uppercase text-stone-400 mb-3 font-bold">
              <span style={{ color: card.accent }}>{card.icon}</span> {card.label}
            </p>
            <p className="font-[family-name:var(--font-serif)] text-[15px] text-stone-700 leading-snug font-semibold">
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
    <div className="mb-16">
      <div className="signal-card p-6 md:p-8 border-l-[3px]" style={{ borderLeftColor: "#4F8CFF" }}>
        <p className="font-[family-name:var(--font-mono)] text-[9px] tracking-[0.3em] uppercase font-bold mb-3" style={{ color: "#4F8CFF" }}>
          If you read one thing today
        </p>
        <p className="font-[family-name:var(--font-serif)] text-xl md:text-[22px] text-stone-800 leading-snug font-bold">
          {text}
        </p>
      </div>
    </div>
  );
}

/* ─── Builder Radar ─── */

function BuilderRadar({ rising, stable, declining }: { rising: string[]; stable: string[]; declining: string[] }) {
  if (rising.length === 0 && stable.length === 0 && declining.length === 0) return null;

  return (
    <div className="mb-16">
      <div className="signal-card p-6">
        <p className="font-[family-name:var(--font-mono)] text-[10px] tracking-[0.3em] uppercase text-stone-400 mb-6 font-bold">
          Builder Radar
        </p>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-[#2ECC71]" />
              <p className="font-[family-name:var(--font-mono)] text-[10px] tracking-wider text-[#219A52] font-bold uppercase">
                Rising
              </p>
            </div>
            {rising.map((t, i) => (
              <p key={i} className="font-[family-name:var(--font-body)] text-[13px] text-stone-600 mb-2 leading-snug pl-4">
                {t}
              </p>
            ))}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-stone-300" />
              <p className="font-[family-name:var(--font-mono)] text-[10px] tracking-wider text-stone-400 font-bold uppercase">
                Stable
              </p>
            </div>
            {stable.map((t, i) => (
              <p key={i} className="font-[family-name:var(--font-body)] text-[13px] text-stone-400 mb-2 leading-snug pl-4">
                {t}
              </p>
            ))}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-[#FF6B6B]" />
              <p className="font-[family-name:var(--font-mono)] text-[10px] tracking-wider text-[#D94848] font-bold uppercase">
                Cooling
              </p>
            </div>
            {declining.map((t, i) => (
              <p key={i} className="font-[family-name:var(--font-body)] text-[13px] text-stone-400 mb-2 leading-snug pl-4">
                {t}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Garden Divider ─── */

function GardenDivider({ text }: { text?: string }) {
  return (
    <div className="garden-divider my-10">
      <span className="font-[family-name:var(--font-serif)] text-[11px] italic text-stone-400/60 shrink-0 px-1">
        {text || "✦"}
      </span>
    </div>
  );
}

/* ─── Issue Nav ─── */

function IssueNav({ issues, currentDate }: { issues: NewsletterIssue[]; currentDate: string }) {
  return (
    <div className="flex items-center gap-1.5 mb-10 overflow-x-auto pb-2">
      <span className="font-[family-name:var(--font-mono)] text-[9px] tracking-wider text-stone-400/50 uppercase mr-3 shrink-0 font-medium">
        Archive
      </span>
      {issues.map((issue) => {
        const dateStr = toDateStr(issue.issue_date);
        const d = toDate(issue.issue_date);
        const active = dateStr === currentDate;
        return (
          <Link
            key={dateStr}
            href={`/news?date=${dateStr}`}
            className={`font-[family-name:var(--font-mono)] text-[11px] px-3 py-1.5 rounded-full transition-all shrink-0 font-medium ${
              active
                ? "bg-stone-800 text-white shadow-sm"
                : "text-stone-400 hover:text-stone-600 hover:bg-white/80"
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
    <header className="mb-12 text-center">
      <p className="font-[family-name:var(--font-mono)] text-[9px] tracking-[0.5em] uppercase text-stone-400/60 mb-6 font-medium">
        The MicroBits
      </p>

      <div className="garden-divider mb-6"><span className="text-stone-300/40 text-xs px-2">✦</span></div>

      <h1 className="font-[family-name:var(--font-display)] text-6xl sm:text-8xl tracking-wider text-stone-800 leading-none mb-4">
        THE DAILY SIGNAL
      </h1>

      <p className="font-[family-name:var(--font-body)] text-[13px] text-stone-400 tracking-wide mb-6">
        Scanning the AI ecosystem so builders don&apos;t have to
      </p>

      <div className="garden-divider mb-6"><span className="text-stone-300/40 text-xs px-2">✦</span></div>

      <div className="flex items-center justify-center gap-4 mb-8">
        <span className="font-[family-name:var(--font-serif)] text-[15px] text-stone-500">
          {date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </span>
        <span className="w-1 h-1 rounded-full bg-stone-300" />
        <span className="font-[family-name:var(--font-mono)] text-[11px] tracking-wider text-stone-400 font-medium">
          {signalCount} signals curated
        </span>
      </div>

      {issue.intro_text && (
        <p className="font-[family-name:var(--font-serif)] text-lg italic text-stone-500 max-w-lg mx-auto leading-relaxed">
          &ldquo;{issue.intro_text}&rdquo;
        </p>
      )}
    </header>
  );
}

/* ─── Scroll Prompt ─── */

function ScrollPrompt({ count }: { count: number }) {
  return (
    <div className="text-center mb-10">
      <p className="font-[family-name:var(--font-mono)] text-[10px] tracking-[0.3em] uppercase text-stone-400 font-semibold mb-1">
        {count} signals curated today
      </p>
      <p className="font-[family-name:var(--font-serif)] text-xs italic text-stone-400/50">
        scroll to explore ↓
      </p>
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

  try {
    issues = await getLatestIssues(14);
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

  return (
    <div className="news-page min-h-screen pt-28 pb-24">
      <div className="mx-auto max-w-2xl px-6">
        {issues.length > 1 && (
          <IssueNav issues={issues} currentDate={currentIssue ? toDateStr(currentIssue.issue_date) : ""} />
        )}

        {hasContent && currentIssue ? (
          <>
            <Masthead issue={currentIssue} signalCount={signals.length} />

            {/* Layer 1: Quick scan */}
            <QuickScan issue={currentIssue} />

            {/* Main insight */}
            {currentIssue.main_insight && (
              <MainInsight text={currentIssue.main_insight} />
            )}

            {/* Builder Radar */}
            <BuilderRadar
              rising={currentIssue.radar_rising || []}
              stable={currentIssue.radar_stable || []}
              declining={currentIssue.radar_declining || []}
            />

            <GardenDivider />

            {/* Scroll prompt */}
            <ScrollPrompt count={signals.length} />

            {/* Layer 2: All signal cards */}
            <div className="mb-16 space-y-5">
              {sorted.map((signal) => (
                <SignalCard key={signal.id} signal={signal} />
              ))}
            </div>

            {/* Closing */}
            {currentIssue.closing_thought && (
              <>
                <GardenDivider text="fin" />
                <div className="text-center mb-16">
                  <p className="font-[family-name:var(--font-serif)] text-base italic text-stone-400 max-w-md mx-auto leading-relaxed">
                    {currentIssue.closing_thought}
                  </p>
                </div>
              </>
            )}

            {/* Archive calendar */}
            {issues.length > 1 && (
              <div className="text-center">
                <GardenDivider />
                <p className="font-[family-name:var(--font-mono)] text-[9px] tracking-[0.3em] uppercase text-stone-400/40 mb-4 font-medium">
                  Signals Archive
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {issues.map((issue) => {
                    const dateStr = toDateStr(issue.issue_date);
                    const d = toDate(issue.issue_date);
                    const active = currentIssue ? dateStr === toDateStr(currentIssue.issue_date) : false;
                    return (
                      <Link
                        key={dateStr}
                        href={`/news?date=${dateStr}`}
                        className={`signal-card !rounded-lg px-3 py-2 text-center min-w-[60px] transition-all ${
                          active ? "!border-stone-300 !shadow-md" : ""
                        }`}
                      >
                        <p className="font-[family-name:var(--font-mono)] text-[9px] text-stone-400 font-medium">
                          {d.toLocaleDateString("en-US", { month: "short" })}
                        </p>
                        <p className={`font-[family-name:var(--font-display)] text-xl ${active ? "text-stone-800" : "text-stone-400"}`}>
                          {d.getDate()}
                        </p>
                        <p className="font-[family-name:var(--font-mono)] text-[8px] text-stone-300">
                          {issue.signal_count}sig
                        </p>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-32">
            <div className="garden-divider mb-8"><span className="text-stone-300/40 text-xs px-2">✦</span></div>
            <h1 className="font-[family-name:var(--font-display)] text-6xl tracking-wider text-stone-300 mb-4">
              THE DAILY SIGNAL
            </h1>
            <p className="font-[family-name:var(--font-serif)] text-base italic text-stone-400">
              No briefing yet. The first issue appears when the daily cron runs.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
