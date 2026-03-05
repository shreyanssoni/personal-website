import type { Metadata } from "next";
import Link from "next/link";
import {
  getLatestIssues,
  getSignalsByIssue,
  type NewsletterIssue,
  type NewsletterSignal,
} from "@/lib/newsletter";
import SignalCard from "@/components/SignalCard";

/** Postgres DATE columns come back as JS Date objects via Neon driver. */
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

/* ─── Decorative Illustrations ─── */

/** Cozy desk scene — monitor, coffee, plant */
function DeskIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 100" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* Desk */}
      <rect x="20" y="70" width="160" height="4" rx="2" fill="#D5D0C8"/>
      {/* Monitor */}
      <rect x="55" y="28" width="50" height="36" rx="4" fill="#E8E5DE"/>
      <rect x="58" y="31" width="44" height="28" rx="2" fill="#F7F6F2"/>
      <rect x="75" y="64" width="10" height="6" fill="#D5D0C8"/>
      <rect x="68" y="68" width="24" height="3" rx="1.5" fill="#D5D0C8"/>
      {/* Screen content lines */}
      <rect x="63" y="36" width="20" height="2" rx="1" fill="#4F8CFF" opacity="0.4"/>
      <rect x="63" y="41" width="34" height="1.5" rx="0.75" fill="#C8C4BC" opacity="0.5"/>
      <rect x="63" y="45" width="28" height="1.5" rx="0.75" fill="#C8C4BC" opacity="0.3"/>
      <rect x="63" y="49" width="32" height="1.5" rx="0.75" fill="#C8C4BC" opacity="0.4"/>
      {/* Signal dot on screen */}
      <circle cx="92" cy="36" r="2" fill="#2ECC71" opacity="0.6"/>
      {/* Coffee cup */}
      <path d="M130 52 L130 66 Q130 70 134 70 L142 70 Q146 70 146 66 L146 52Z" fill="#E8E5DE"/>
      <path d="M146 56 Q152 56 152 60 Q152 64 146 64" stroke="#D5D0C8" strokeWidth="2" fill="none"/>
      <path d="M133 48 Q135 44 137 48" stroke="#C8C4BC" strokeWidth="1" opacity="0.4" fill="none"/>
      <path d="M137 46 Q139 42 141 46" stroke="#C8C4BC" strokeWidth="1" opacity="0.3" fill="none"/>
      {/* Plant */}
      <rect x="28" y="58" width="14" height="12" rx="2" fill="#E8E5DE"/>
      <path d="M35 58 Q35 48 30 42" stroke="#2ECC71" strokeWidth="1.5" fill="none" opacity="0.5"/>
      <path d="M35 58 Q35 46 40 40" stroke="#2ECC71" strokeWidth="1.5" fill="none" opacity="0.5"/>
      <path d="M35 58 Q33 50 28 46" stroke="#1ABC9C" strokeWidth="1.5" fill="none" opacity="0.4"/>
      <circle cx="30" cy="41" r="3" fill="#2ECC71" opacity="0.25"/>
      <circle cx="40" cy="39" r="3.5" fill="#2ECC71" opacity="0.2"/>
      <circle cx="27" cy="45" r="2.5" fill="#1ABC9C" opacity="0.2"/>
      {/* Notebook */}
      <rect x="155" y="54" width="18" height="16" rx="1" fill="#F4B942" opacity="0.25" transform="rotate(-8 164 62)"/>
      <rect x="156" y="55" width="18" height="16" rx="1" fill="#FEF3C7" transform="rotate(-8 165 63)"/>
      <line x1="160" y1="60" x2="170" y2="58" stroke="#D5D0C8" strokeWidth="0.8" opacity="0.5"/>
      <line x1="160" y1="63" x2="172" y2="61" stroke="#D5D0C8" strokeWidth="0.8" opacity="0.4"/>
    </svg>
  );
}

/** Small signal/radar illustration */
function RadarIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 80" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <circle cx="40" cy="40" r="30" stroke="#D5D0C8" strokeWidth="0.5" opacity="0.4"/>
      <circle cx="40" cy="40" r="20" stroke="#D5D0C8" strokeWidth="0.5" opacity="0.3"/>
      <circle cx="40" cy="40" r="10" stroke="#D5D0C8" strokeWidth="0.5" opacity="0.2"/>
      <line x1="40" y1="8" x2="40" y2="72" stroke="#D5D0C8" strokeWidth="0.3" opacity="0.2"/>
      <line x1="8" y1="40" x2="72" y2="40" stroke="#D5D0C8" strokeWidth="0.3" opacity="0.2"/>
      {/* Blips */}
      <circle cx="52" cy="28" r="3" fill="#2ECC71" opacity="0.5"/>
      <circle cx="52" cy="28" r="5" stroke="#2ECC71" strokeWidth="0.5" opacity="0.2"/>
      <circle cx="30" cy="35" r="2.5" fill="#4F8CFF" opacity="0.4"/>
      <circle cx="45" cy="50" r="2" fill="#FF6B6B" opacity="0.4"/>
      <circle cx="35" cy="48" r="1.5" fill="#F4B942" opacity="0.35"/>
      {/* Sweep line */}
      <line x1="40" y1="40" x2="58" y2="22" stroke="#4F8CFF" strokeWidth="1" opacity="0.3"/>
    </svg>
  );
}

/** Books/reading illustration for the signals section */
function BooksIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 60" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* Stack of books */}
      <rect x="10" y="35" width="40" height="8" rx="1" fill="#4F8CFF" opacity="0.2"/>
      <rect x="12" y="27" width="36" height="8" rx="1" fill="#FF6B6B" opacity="0.2"/>
      <rect x="8" y="43" width="44" height="8" rx="1" fill="#2ECC71" opacity="0.2"/>
      {/* Open book */}
      <path d="M70 45 Q70 25 90 20 Q110 25 110 45" fill="#F7F6F2" stroke="#D5D0C8" strokeWidth="0.8"/>
      <line x1="90" y1="20" x2="90" y2="45" stroke="#D5D0C8" strokeWidth="0.5"/>
      {/* Page lines */}
      <line x1="75" y1="30" x2="87" y2="27" stroke="#C8C4BC" strokeWidth="0.5" opacity="0.5"/>
      <line x1="75" y1="34" x2="87" y2="31" stroke="#C8C4BC" strokeWidth="0.5" opacity="0.4"/>
      <line x1="75" y1="38" x2="87" y2="35" stroke="#C8C4BC" strokeWidth="0.5" opacity="0.3"/>
      <line x1="93" y1="27" x2="105" y2="30" stroke="#C8C4BC" strokeWidth="0.5" opacity="0.5"/>
      <line x1="93" y1="31" x2="105" y2="34" stroke="#C8C4BC" strokeWidth="0.5" opacity="0.4"/>
      {/* Sparkle on book */}
      <circle cx="100" cy="25" r="1.5" fill="#F4B942" opacity="0.4"/>
      <line x1="100" y1="22" x2="100" y2="28" stroke="#F4B942" strokeWidth="0.5" opacity="0.3"/>
      <line x1="97" y1="25" x2="103" y2="25" stroke="#F4B942" strokeWidth="0.5" opacity="0.3"/>
    </svg>
  );
}

/** Cute plant in pot for closing section */
function PlantIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 80" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* Pot */}
      <path d="M18 50 L15 72 Q15 76 20 76 L40 76 Q45 76 45 72 L42 50Z" fill="#E8E5DE"/>
      <rect x="14" y="48" width="32" height="5" rx="2" fill="#D5D0C8"/>
      {/* Soil */}
      <ellipse cx="30" cy="51" rx="12" ry="2" fill="#B8B3A8" opacity="0.3"/>
      {/* Main stem */}
      <path d="M30 48 Q30 35 28 25" stroke="#2ECC71" strokeWidth="1.5" fill="none" opacity="0.6"/>
      {/* Branches */}
      <path d="M29 38 Q22 34 18 28" stroke="#2ECC71" strokeWidth="1.2" fill="none" opacity="0.5"/>
      <path d="M29 32 Q36 26 42 24" stroke="#1ABC9C" strokeWidth="1.2" fill="none" opacity="0.5"/>
      <path d="M28 26 Q24 18 20 14" stroke="#2ECC71" strokeWidth="1" fill="none" opacity="0.4"/>
      {/* Leaves */}
      <ellipse cx="17" cy="27" rx="6" ry="3.5" fill="#2ECC71" opacity="0.2" transform="rotate(-30 17 27)"/>
      <ellipse cx="43" cy="23" rx="6" ry="3.5" fill="#1ABC9C" opacity="0.2" transform="rotate(20 43 23)"/>
      <ellipse cx="19" cy="13" rx="5" ry="3" fill="#2ECC71" opacity="0.15" transform="rotate(-45 19 13)"/>
      <ellipse cx="28" cy="20" rx="4" ry="2.5" fill="#1ABC9C" opacity="0.15" transform="rotate(10 28 20)"/>
      {/* Small flower */}
      <circle cx="28" cy="24" r="2.5" fill="#FF6B6B" opacity="0.2"/>
      <circle cx="28" cy="24" r="1" fill="#F4B942" opacity="0.3"/>
    </svg>
  );
}

function WaveDivider() {
  return (
    <div className="my-8 sm:my-12 overflow-hidden opacity-30">
      <svg viewBox="0 0 600 20" fill="none" className="w-full h-5" preserveAspectRatio="none">
        <path d="M0 10 Q 75 0, 150 10 T 300 10 T 450 10 T 600 10" stroke="#C8C4BC" strokeWidth="1" fill="none"/>
      </svg>
    </div>
  );
}

/* ─── Floating Blobs (background decoration) ─── */

function FloatingBlobs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <div className="absolute -top-20 -right-20 w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-gradient-to-br from-rose-200/20 to-amber-100/20 blur-3xl animate-blob-float" />
      <div className="absolute top-1/4 -left-32 w-56 h-56 sm:w-72 sm:h-72 rounded-full bg-gradient-to-br from-sky-200/15 to-indigo-100/15 blur-3xl animate-blob-float-delayed" />
      <div className="absolute bottom-1/4 -right-24 w-48 h-48 sm:w-64 sm:h-64 rounded-full bg-gradient-to-br from-emerald-200/15 to-teal-100/15 blur-3xl animate-blob-float-slow" />
    </div>
  );
}

/* ─── Quick Scan ─── */

const QUICK_SCAN_EMOJIS: Record<string, string> = {
  "Biggest Signal": "🔥",
  "Overhyped": "🫧",
  "Quiet Trend": "🌱",
};

function QuickScan({ issue }: { issue: NewsletterIssue }) {
  const cards = [
    issue.qs_biggest_text && { icon: "◆", label: "Biggest Signal", text: issue.qs_biggest_text, accent: "#FF6B6B", gradFrom: "from-rose-50", gradTo: "to-orange-50/50" },
    issue.qs_overhyped_text && { icon: "◇", label: "Overhyped", text: issue.qs_overhyped_text, accent: "#F4B942", gradFrom: "from-amber-50", gradTo: "to-yellow-50/50" },
    issue.qs_quiet_text && { icon: "◈", label: "Quiet Trend", text: issue.qs_quiet_text, accent: "#1ABC9C", gradFrom: "from-emerald-50", gradTo: "to-teal-50/50" },
  ].filter(Boolean) as { icon: string; label: string; text: string; accent: string; gradFrom: string; gradTo: string }[];

  if (cards.length === 0) return null;

  return (
    <div className="mb-14 sm:mb-16">
      <div className="flex items-center gap-2 mb-5">
        <span className="text-base">⚡</span>
        <p className="font-[family-name:var(--font-mono)] text-[10px] tracking-[0.3em] uppercase text-stone-400 font-semibold">
          Today in 30 seconds
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className={`relative overflow-hidden rounded-2xl border border-white/60 bg-gradient-to-br ${card.gradFrom} ${card.gradTo} p-4 sm:p-5 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5`}
            style={{ borderTop: `3px solid ${card.accent}` }}
          >
            <div className="flex items-center gap-2 mb-2.5">
              <span className="text-sm">{QUICK_SCAN_EMOJIS[card.label] || "✦"}</span>
              <p className="font-[family-name:var(--font-mono)] text-[9px] tracking-[0.15em] uppercase text-stone-400 font-bold">
                {card.label}
              </p>
            </div>
            <p className="font-[family-name:var(--font-soft)] text-[14px] sm:text-[15px] text-stone-600 leading-relaxed">
              {card.text}
            </p>
            {/* Decorative corner glow */}
            <div className="absolute -bottom-4 -right-4 w-16 h-16 rounded-full blur-2xl pointer-events-none" style={{ background: card.accent, opacity: 0.06 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Main Insight ─── */

function MainInsight({ text }: { text: string }) {
  return (
    <div className="mb-14 sm:mb-16">
      <div className="relative overflow-hidden signal-card p-5 sm:p-6 md:p-8 border-l-[3px]" style={{ borderLeftColor: "#4F8CFF" }}>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm">💡</span>
          <p className="font-[family-name:var(--font-mono)] text-[9px] tracking-[0.3em] uppercase font-bold" style={{ color: "#4F8CFF" }}>
            If you read one thing today
          </p>
        </div>
        <p className="font-[family-name:var(--font-soft)] text-lg sm:text-xl md:text-[22px] text-stone-700 leading-relaxed font-normal">
          {text}
        </p>
        {/* Subtle blue glow */}
        <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-blue-100/30 blur-2xl pointer-events-none" />
      </div>
    </div>
  );
}

/* ─── Builder Radar ─── */

function BuilderRadar({ rising, stable, declining }: { rising: string[]; stable: string[]; declining: string[] }) {
  if (rising.length === 0 && stable.length === 0 && declining.length === 0) return null;

  return (
    <div className="mb-14 sm:mb-16">
      <div className="relative overflow-hidden signal-card p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-5 sm:mb-6">
          <span className="text-sm">📡</span>
          <p className="font-[family-name:var(--font-mono)] text-[10px] tracking-[0.3em] uppercase text-stone-400 font-bold">
            Builder Radar
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <span className="w-2 h-2 rounded-full bg-[#2ECC71] shadow-[0_0_6px_rgba(46,204,113,0.4)]" />
              <p className="font-[family-name:var(--font-mono)] text-[10px] tracking-wider text-[#219A52] font-bold uppercase">
                Rising
              </p>
            </div>
            {rising.map((t, i) => (
              <p key={i} className="font-[family-name:var(--font-body)] text-[13px] text-stone-600 mb-1.5 sm:mb-2 leading-snug pl-4">
                {t}
              </p>
            ))}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2 sm:mb-3 mt-3 sm:mt-0">
              <span className="w-2 h-2 rounded-full bg-stone-300" />
              <p className="font-[family-name:var(--font-mono)] text-[10px] tracking-wider text-stone-400 font-bold uppercase">
                Stable
              </p>
            </div>
            {stable.map((t, i) => (
              <p key={i} className="font-[family-name:var(--font-body)] text-[13px] text-stone-400 mb-1.5 sm:mb-2 leading-snug pl-4">
                {t}
              </p>
            ))}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2 sm:mb-3 mt-3 sm:mt-0">
              <span className="w-2 h-2 rounded-full bg-[#FF6B6B] shadow-[0_0_6px_rgba(255,107,107,0.4)]" />
              <p className="font-[family-name:var(--font-mono)] text-[10px] tracking-wider text-[#D94848] font-bold uppercase">
                Cooling
              </p>
            </div>
            {declining.map((t, i) => (
              <p key={i} className="font-[family-name:var(--font-body)] text-[13px] text-stone-400 mb-1.5 sm:mb-2 leading-snug pl-4">
                {t}
              </p>
            ))}
          </div>
        </div>
        {/* Radar illustration */}
        <RadarIllustration className="absolute -bottom-4 -right-4 w-24 h-24 sm:w-28 sm:h-28 opacity-40 pointer-events-none" />
      </div>
    </div>
  );
}

/* ─── Garden Divider ─── */

function GardenDivider({ text }: { text?: string }) {
  return (
    <div className="garden-divider my-8 sm:my-10">
      <span className="font-[family-name:var(--font-serif)] text-[11px] italic text-stone-400/60 shrink-0 px-1">
        {text || "✦"}
      </span>
    </div>
  );
}

/* ─── Issue Nav ─── */

function IssueNav({ issues, currentDate }: { issues: NewsletterIssue[]; currentDate: string }) {
  return (
    <div className="flex items-center gap-1.5 mb-10 overflow-x-auto pb-2 scrollbar-hide">
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
    <header className="mb-10 sm:mb-12 text-center relative">
      {/* Desk illustration */}
      <DeskIllustration className="w-40 sm:w-52 h-auto mx-auto mb-4 sm:mb-6 opacity-60" />

      <p className="font-[family-name:var(--font-mono)] text-[8px] sm:text-[9px] tracking-[0.5em] uppercase text-stone-400/60 mb-5 sm:mb-6 font-medium">
        The MicroBits
      </p>

      <div className="garden-divider mb-5 sm:mb-6"><span className="text-stone-300/40 text-xs px-2">✦</span></div>

      <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-6xl md:text-8xl tracking-wider text-stone-800 leading-none mb-3 sm:mb-4">
        THE DAILY SIGNAL
      </h1>

      <p className="font-[family-name:var(--font-body)] text-[11px] sm:text-[13px] text-stone-400 tracking-wide mb-5 sm:mb-6">
        Scanning the AI ecosystem so builders don&apos;t have to
      </p>

      <div className="garden-divider mb-5 sm:mb-6"><span className="text-stone-300/40 text-xs px-2">✦</span></div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-4 mb-6 sm:mb-8">
        <span className="font-[family-name:var(--font-serif)] text-[13px] sm:text-[15px] text-stone-500">
          {date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </span>
        <span className="hidden sm:block w-1 h-1 rounded-full bg-stone-300" />
        <span className="font-[family-name:var(--font-mono)] text-[10px] sm:text-[11px] tracking-wider text-stone-400 font-medium">
          {signalCount} signals curated
        </span>
      </div>

      {issue.intro_text && (
        <div className="relative max-w-lg mx-auto px-6">
          <span className="absolute -top-3 -left-0 sm:left-1 text-4xl sm:text-5xl text-stone-200/30 font-serif select-none leading-none" aria-hidden="true">&ldquo;</span>
          <p className="font-[family-name:var(--font-serif)] text-base sm:text-lg italic text-stone-500 leading-relaxed">
            {issue.intro_text}
          </p>
          <span className="absolute -bottom-4 right-2 sm:right-3 text-4xl sm:text-5xl text-stone-200/30 font-serif select-none leading-none" aria-hidden="true">&rdquo;</span>
        </div>
      )}
    </header>
  );
}

/* ─── Scroll Prompt ─── */

function ScrollPrompt({ count }: { count: number }) {
  return (
    <div className="text-center mb-8 sm:mb-10">
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 border border-stone-200/40 shadow-sm">
        <span className="text-xs">🔍</span>
        <p className="font-[family-name:var(--font-mono)] text-[10px] tracking-[0.2em] uppercase text-stone-400 font-semibold">
          {count} signals curated today
        </p>
      </div>
      <p className="font-[family-name:var(--font-serif)] text-xs italic text-stone-400/50 mt-2">
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
    <div className="news-page min-h-screen pt-20 sm:pt-28 pb-16 sm:pb-24 relative">
      <FloatingBlobs />

      <div className="mx-auto max-w-2xl px-4 sm:px-6 relative">
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

            <WaveDivider />

            {/* Scroll prompt with books illustration */}
            <div className="flex flex-col items-center">
              <BooksIllustration className="w-28 sm:w-36 h-auto opacity-40 mb-2" />
              <ScrollPrompt count={signals.length} />
            </div>

            {/* Layer 2: All signal cards */}
            <div className="mb-14 sm:mb-16 space-y-4 sm:space-y-5">
              {sorted.map((signal) => (
                <SignalCard key={signal.id} signal={signal} />
              ))}
            </div>

            {/* Closing */}
            {currentIssue.closing_thought && (
              <>
                <GardenDivider text="fin" />
                <div className="text-center mb-14 sm:mb-16">
                  <PlantIllustration className="w-14 sm:w-16 h-auto mx-auto mb-4 opacity-50" />
                  <p className="font-[family-name:var(--font-serif)] text-sm sm:text-base italic text-stone-400 max-w-md mx-auto leading-relaxed">
                    {currentIssue.closing_thought}
                  </p>
                  <div className="mt-4 flex justify-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-stone-300/50" />
                    <span className="w-1 h-1 rounded-full bg-stone-300/30" />
                    <span className="w-1 h-1 rounded-full bg-stone-300/15" />
                  </div>
                </div>
              </>
            )}

            {/* Archive calendar */}
            {issues.length > 1 && (
              <div className="text-center">
                <GardenDivider />
                <div className="flex items-center justify-center gap-2 mb-4">
                  <span className="text-xs">📅</span>
                  <p className="font-[family-name:var(--font-mono)] text-[9px] tracking-[0.3em] uppercase text-stone-400/40 font-medium">
                    Signals Archive
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  {issues.map((issue) => {
                    const dateStr = toDateStr(issue.issue_date);
                    const d = toDate(issue.issue_date);
                    const active = currentIssue ? dateStr === toDateStr(currentIssue.issue_date) : false;
                    return (
                      <Link
                        key={dateStr}
                        href={`/news?date=${dateStr}`}
                        className={`rounded-xl px-3 py-2 text-center min-w-[56px] sm:min-w-[60px] transition-all border ${
                          active
                            ? "bg-white border-stone-300 shadow-md"
                            : "bg-white/50 border-stone-200/40 hover:bg-white hover:shadow-sm"
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
          <div className="text-center py-24 sm:py-32">
            <PlantIllustration className="w-20 sm:w-24 h-auto mx-auto mb-6 opacity-40" />
            <div className="garden-divider mb-8"><span className="text-stone-300/40 text-xs px-2">✦</span></div>
            <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-6xl tracking-wider text-stone-300 mb-4">
              THE DAILY SIGNAL
            </h1>
            <p className="font-[family-name:var(--font-serif)] text-sm sm:text-base italic text-stone-400">
              No briefing yet. The first issue appears when the daily cron runs.
            </p>
            <DeskIllustration className="w-36 sm:w-44 h-auto mx-auto mt-8 opacity-30" />
          </div>
        )}
      </div>
    </div>
  );
}
