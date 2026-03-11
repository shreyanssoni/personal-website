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

/** Signal pulse divider — horizontal line with a heartbeat-style spike */
function SignalPulse({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 32" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* Flat line left */}
      <line x1="0" y1="16" x2="70" y2="16" stroke="#C8C4BC" strokeWidth="1" opacity="0.3"/>
      {/* Pulse */}
      <polyline
        points="70,16 80,16 86,6 92,26 98,4 104,28 110,10 116,20 122,16 130,16"
        stroke="#4F8CFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"
      />
      {/* Flat line right */}
      <line x1="130" y1="16" x2="200" y2="16" stroke="#C8C4BC" strokeWidth="1" opacity="0.3"/>
      {/* Signal dot */}
      <circle cx="100" cy="4" r="2" fill="#2ECC71" opacity="0.5"/>
      <circle cx="100" cy="4" r="4" stroke="#2ECC71" strokeWidth="0.5" opacity="0.2"/>
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
  "What Launched": "🚀",
  "What's Shifting": "🔄",
  "What to Watch": "👀",
};

function QuickScan({ issue }: { issue: NewsletterIssue }) {
  const cards = [
    issue.qs_launched_text && { label: "What Launched", text: issue.qs_launched_text, accent: "#FF6B6B", bg: "bg-rose-50/40" },
    issue.qs_shifting_text && { label: "What's Shifting", text: issue.qs_shifting_text, accent: "#F4B942", bg: "bg-amber-50/40" },
    issue.qs_watch_text && { label: "What to Watch", text: issue.qs_watch_text, accent: "#1ABC9C", bg: "bg-emerald-50/40" },
  ].filter(Boolean) as { label: string; text: string; accent: string; bg: string }[];

  if (cards.length === 0) return null;

  return (
    <div className="mb-10 sm:mb-14">
      <div className="flex items-center gap-2 mb-4 sm:mb-5">
        <span className="text-base">⚡</span>
        <p className="font-[family-name:var(--font-mono)] text-[10px] tracking-[0.3em] uppercase text-stone-400 font-semibold">
          Today in 30 seconds
        </p>
      </div>
      {/* Mobile: compact list with left border. Desktop: 3-col cards */}
      <div className="flex flex-col gap-2.5 sm:hidden">
        {cards.map((card) => (
          <div
            key={card.label}
            className={`pl-3.5 pr-3 py-2.5 border-l-[3px] rounded-r-xl ${card.bg}`}
            style={{ borderLeftColor: card.accent }}
          >
            <p className="font-[family-name:var(--font-mono)] text-[9px] tracking-[0.15em] uppercase font-bold mb-0.5" style={{ color: card.accent }}>
              {QUICK_SCAN_EMOJIS[card.label] || "✦"} {card.label}
            </p>
            <p className="font-[family-name:var(--font-soft)] text-[13px] text-stone-600 leading-snug">
              {card.text}
            </p>
          </div>
        ))}
      </div>
      <div className="hidden sm:grid sm:grid-cols-3 gap-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="relative overflow-hidden rounded-2xl border border-white/60 bg-white/50 p-5 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
            style={{ borderTop: `3px solid ${card.accent}` }}
          >
            <div className="flex items-center gap-2 mb-2.5">
              <span className="text-sm">{QUICK_SCAN_EMOJIS[card.label] || "✦"}</span>
              <p className="font-[family-name:var(--font-mono)] text-[9px] tracking-[0.15em] uppercase text-stone-400 font-bold">
                {card.label}
              </p>
            </div>
            <p className="font-[family-name:var(--font-soft)] text-[15px] text-stone-600 leading-relaxed">
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
      {/* Mobile: minimal left-border. Desktop: full card */}
      <div className="border-l-[3px] pl-3.5 pr-3 py-3 rounded-r-xl bg-blue-50/30 sm:hidden" style={{ borderLeftColor: "#4F8CFF" }}>
        <p className="font-[family-name:var(--font-mono)] text-[9px] tracking-[0.3em] uppercase font-bold mb-1.5" style={{ color: "#4F8CFF" }}>
          💡 If you read one thing today
        </p>
        <p className="font-[family-name:var(--font-soft)] text-[15px] text-stone-700 leading-snug">
          {text}
        </p>
      </div>
      <div className="relative overflow-hidden signal-card p-6 md:p-8 border-l-[3px] hidden sm:block" style={{ borderLeftColor: "#4F8CFF" }}>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm">💡</span>
          <p className="font-[family-name:var(--font-mono)] text-[9px] tracking-[0.3em] uppercase font-bold" style={{ color: "#4F8CFF" }}>
            If you read one thing today
          </p>
        </div>
        <p className="font-[family-name:var(--font-soft)] text-xl md:text-[22px] text-stone-700 leading-relaxed font-normal">
          {text}
        </p>
        <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-blue-100/30 blur-2xl pointer-events-none" />
      </div>
    </div>
  );
}

/* ─── Builder Radar ─── */

function BuilderRadar({ rising, stable, declining }: { rising: string[]; stable: string[]; declining: string[] }) {
  if (rising.length === 0 && stable.length === 0 && declining.length === 0) return null;

  const sections = [
    { label: "Rising", items: rising, dotClass: "bg-[#2ECC71] shadow-[0_0_6px_rgba(46,204,113,0.4)]", textClass: "text-[#219A52]", itemClass: "text-stone-600" },
    { label: "Stable", items: stable, dotClass: "bg-stone-300", textClass: "text-stone-400", itemClass: "text-stone-400" },
    { label: "Cooling", items: declining, dotClass: "bg-[#FF6B6B] shadow-[0_0_6px_rgba(255,107,107,0.4)]", textClass: "text-[#D94848]", itemClass: "text-stone-400" },
  ];

  return (
    <div className="mb-10 sm:mb-14">
      {/* Mobile: compact inline layout */}
      <div className="sm:hidden rounded-xl bg-white/40 border border-stone-200/30 p-3.5">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm">📡</span>
          <p className="font-[family-name:var(--font-mono)] text-[10px] tracking-[0.3em] uppercase text-stone-400 font-bold">
            Builder Radar
          </p>
        </div>
        <div className="space-y-2.5">
          {sections.map((s) => s.items.length > 0 && (
            <div key={s.label} className="flex items-start gap-2">
              <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
                <span className={`w-1.5 h-1.5 rounded-full ${s.dotClass}`} />
                <span className={`font-[family-name:var(--font-mono)] text-[8px] tracking-wider uppercase font-bold ${s.textClass}`}>
                  {s.label}
                </span>
              </div>
              <p className="font-[family-name:var(--font-body)] text-[12px] text-stone-500 leading-snug">
                {s.items.join(" · ")}
              </p>
            </div>
          ))}
        </div>
      </div>
      {/* Desktop: card layout */}
      <div className="hidden sm:block relative overflow-hidden signal-card p-6">
        <div className="flex items-center gap-2 mb-6">
          <span className="text-sm">📡</span>
          <p className="font-[family-name:var(--font-mono)] text-[10px] tracking-[0.3em] uppercase text-stone-400 font-bold">
            Builder Radar
          </p>
        </div>
        <div className="grid grid-cols-3 gap-6">
          {sections.map((s) => (
            <div key={s.label}>
              <div className="flex items-center gap-2 mb-3">
                <span className={`w-2 h-2 rounded-full ${s.dotClass}`} />
                <p className={`font-[family-name:var(--font-mono)] text-[10px] tracking-wider font-bold uppercase ${s.textClass}`}>
                  {s.label}
                </p>
              </div>
              {s.items.map((t, i) => (
                <p key={i} className={`font-[family-name:var(--font-body)] text-[13px] mb-2 leading-snug pl-4 ${s.itemClass}`}>
                  {t}
                </p>
              ))}
            </div>
          ))}
        </div>
        <RadarIllustration className="absolute -bottom-4 -right-4 w-28 h-28 opacity-40 pointer-events-none" />
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
            href={`/news/${dateStr}`}
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
        THE DAILY VIBE CODE
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
        <span className="hidden sm:block w-1 h-1 rounded-full bg-stone-300" />
        <ShareButton
          issueId={issue.id}
          issueDate={toDateStr(issue.issue_date)}
          title={date.toLocaleDateString("en-US", { month: "long", day: "numeric" })}
        />
      </div>

      {issue.intro_text && (
        <div className="relative max-w-lg mx-auto px-6">
          <span className="absolute -top-3 -left-0 sm:left-1 text-4xl sm:text-5xl text-stone-200/30 font-serif select-none leading-none" aria-hidden="true">&ldquo;</span>
          <p className="font-[family-name:var(--font-soft)] text-base sm:text-lg italic text-stone-500 leading-relaxed">
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

/* ─── Threads Promo ─── */

function ThreadsPromo({ threads }: { threads: NewsletterThread[] }) {
  if (threads.length === 0) return null;

  return (
    <div className="mb-14 sm:mb-16">
      <div className="relative overflow-hidden rounded-2xl border border-stone-200/50 bg-gradient-to-br from-white via-white to-stone-50 p-6 sm:p-8">
        {/* Decorative bg */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#4F8CFF]/5 to-transparent rounded-bl-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-emerald-100/20 to-transparent rounded-tr-full pointer-events-none" />

        <div className="relative">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-base">🧵</span>
                <h3 className="font-[family-name:var(--font-display)] text-lg tracking-wider text-stone-800">
                  STORY THREADS
                </h3>
              </div>
              <p className="font-[family-name:var(--font-body)] text-[13px] text-stone-400">
                Follow evolving narratives across days — not just single signals
              </p>
            </div>
            <Link
              href="/news/threads"
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-800 text-white font-[family-name:var(--font-mono)] text-[10px] tracking-[0.12em] uppercase hover:bg-stone-700 transition-colors shrink-0"
            >
              View all threads &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {threads.slice(0, 4).map((thread) => (
              <Link
                key={thread.id}
                href={`/news/threads/${thread.slug}`}
                className="group flex items-start gap-3 p-3.5 rounded-xl bg-white/80 border border-stone-200/40 hover:border-stone-300 hover:shadow-sm transition-all"
              >
                <span className="text-lg mt-0.5 shrink-0">{thread.emoji}</span>
                <div className="min-w-0">
                  <h4 className="font-[family-name:var(--font-serif)] text-[14px] font-bold text-stone-700 group-hover:text-[#4F8CFF] transition-colors leading-snug mb-0.5 truncate">
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

          <Link
            href="/news/threads"
            className="sm:hidden flex items-center justify-center gap-1.5 mt-4 py-2.5 rounded-xl bg-stone-800 text-white font-[family-name:var(--font-mono)] text-[10px] tracking-[0.12em] uppercase hover:bg-stone-700 transition-colors"
          >
            View all threads &rarr;
          </Link>
        </div>
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
    <div className="news-page min-h-screen pt-24 sm:pt-28 pb-16 sm:pb-24 relative">
      {/* JSON-LD */}
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}

      <FloatingBlobs />

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

            {/* Scroll prompt with books illustration */}
            <div className="flex flex-col items-center my-4 sm:my-6">
              <SignalPulse className="w-40 sm:w-52 h-auto mb-1" />
              <ScrollPrompt count={signals.length} />
            </div>

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
                  <PlantIllustration className="w-14 sm:w-16 h-auto mx-auto mb-4 opacity-50" />
                  <p className="font-[family-name:var(--font-soft)] text-sm sm:text-base italic text-stone-400 max-w-md mx-auto leading-relaxed">
                    {currentIssue.closing_thought}
                  </p>
                  <div className="mt-4 flex justify-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-stone-300/50" />
                    <span className="w-1 h-1 rounded-full bg-stone-300/30" />
                    <span className="w-1 h-1 rounded-full bg-stone-300/15" />
                  </div>
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
              <nav aria-label="Signals archive calendar" className="text-center">
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
                        href={`/news/${dateStr}`}
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
              </nav>
            )}
          </article>
        ) : (
          <div className="text-center py-24 sm:py-32">
            <PlantIllustration className="w-20 sm:w-24 h-auto mx-auto mb-6 opacity-40" />
            <div className="garden-divider mb-8"><span className="text-stone-300/40 text-xs px-2">✦</span></div>
            <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-6xl tracking-wider text-stone-300 mb-4">
              THE DAILY VIBE CODE
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
