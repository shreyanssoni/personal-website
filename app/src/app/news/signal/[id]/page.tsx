import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, ExternalLink, Clock, Users, Zap } from "lucide-react";
import { sql } from "@/lib/db";
import ShareButton from "@/components/ShareButton";

function toDateStr(d: string | Date): string {
  if (typeof d === "object" && d !== null && "toISOString" in d) {
    return (d as Date).toISOString().slice(0, 10);
  }
  return String(d).slice(0, 10);
}

interface SignalRow {
  id: number;
  title: string;
  category: string;
  so_what: string;
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
  source_urls: string[];
  deep_dive: string | null;
  issue_date: string | Date;
}

interface Props {
  params: Promise<{ id: string }>;
}

async function getSignal(id: number): Promise<SignalRow | null> {
  const rows = await sql`
    SELECT s.*, i.issue_date
    FROM newsletter_signals s
    JOIN newsletter_issues i ON i.id = s.issue_id
    WHERE s.id = ${id}
    LIMIT 1
  `;
  if (!rows || (rows as unknown[]).length === 0) return null;
  return (rows as unknown as SignalRow[])[0];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const signalId = parseInt(id, 10);
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://shreyanssoni.vercel.app").replace(/\/+$/, "");

  if (isNaN(signalId)) return { title: "Signal Not Found" };

  const signal = await getSignal(signalId);
  if (!signal) return { title: "Signal Not Found" };

  const dateStr = toDateStr(signal.issue_date);
  const title = `${signal.title} — The Daily Vibe Code`;
  const description = signal.so_what || signal.summary;
  const ogImage = `${siteUrl}/api/og/signal/${signal.id}`;

  return {
    title,
    description,
    openGraph: {
      title: signal.title,
      description,
      url: `${siteUrl}/news/signal/${signal.id}`,
      siteName: "The MicroBits",
      type: "article",
      locale: "en_US",
      publishedTime: `${dateStr}T12:00:00Z`,
      images: [{
        url: ogImage,
        secureUrl: ogImage,
        width: 1200,
        height: 630,
        alt: signal.title,
        type: "image/png",
      }],
    },
    twitter: {
      card: "summary_large_image",
      title: signal.title,
      description,
      images: [{
        url: ogImage,
        width: 1200,
        height: 630,
        alt: signal.title,
      }],
    },
    robots: { index: true, follow: true },
  };
}

export const revalidate = 3600;

/* ─── Color System ─── */

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string; accent: string; gradFrom: string; gradTo: string }> = {
  launch:      { bg: "bg-[#FF6B6B]/10", text: "text-[#D94848]", border: "border-[#FF6B6B]/20", accent: "#FF6B6B", gradFrom: "from-rose-50", gradTo: "to-orange-50/30" },
  shift:       { bg: "bg-[#4F8CFF]/10", text: "text-[#3A6FD8]", border: "border-[#4F8CFF]/20", accent: "#4F8CFF", gradFrom: "from-blue-50", gradTo: "to-indigo-50/30" },
  tool:        { bg: "bg-[#2ECC71]/10", text: "text-[#219A52]", border: "border-[#2ECC71]/20", accent: "#2ECC71", gradFrom: "from-emerald-50", gradTo: "to-green-50/30" },
  research:    { bg: "bg-[#8E7CFF]/10", text: "text-[#6B5CD4]", border: "border-[#8E7CFF]/20", accent: "#8E7CFF", gradFrom: "from-violet-50", gradTo: "to-purple-50/30" },
  funding:     { bg: "bg-[#F4B942]/10", text: "text-[#C4942E]", border: "border-[#F4B942]/20", accent: "#F4B942", gradFrom: "from-amber-50", gradTo: "to-yellow-50/30" },
  open_source: { bg: "bg-[#1ABC9C]/10", text: "text-[#148F76]", border: "border-[#1ABC9C]/20", accent: "#1ABC9C", gradFrom: "from-teal-50", gradTo: "to-emerald-50/30" },
};

const CATEGORY_EMOJIS: Record<string, string> = {
  launch: "🚀", shift: "📈", tool: "🔧", research: "🔬", funding: "💰", open_source: "📦",
};

const HYPE_CONFIG: Record<string, { label: string; color: string }> = {
  "real shift":  { label: "Real Shift",  color: "bg-emerald-100 text-emerald-700" },
  "mostly real": { label: "Mostly Real", color: "bg-emerald-50 text-emerald-600" },
  "mixed":       { label: "Mixed",       color: "bg-amber-50 text-amber-700" },
  "mostly hype": { label: "Mostly Hype", color: "bg-orange-50 text-orange-700" },
  "pure hype":   { label: "Pure Hype",   color: "bg-red-50 text-red-600" },
};

function getHype(h: string) {
  const lower = h.toLowerCase();
  for (const [key, val] of Object.entries(HYPE_CONFIG)) {
    if (lower.includes(key)) return val;
  }
  return { label: "TBD", color: "bg-stone-100 text-stone-500" };
}

/* ─── Markdown-ish renderer (handles ## headings, paragraphs, bold) ─── */

function DeepDiveContent({ content }: { content: string }) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("## ")) {
      elements.push(
        <h3 key={i} className="font-[family-name:var(--font-display)] text-xl sm:text-2xl text-stone-800 tracking-wide mt-8 mb-3 first:mt-0">
          {line.slice(3)}
        </h3>
      );
    } else if (line.trim() === "") {
      // skip empty lines
    } else {
      // Paragraph — collect consecutive non-empty, non-heading lines
      const paraLines = [line];
      while (i + 1 < lines.length && lines[i + 1].trim() !== "" && !lines[i + 1].startsWith("## ")) {
        i++;
        paraLines.push(lines[i]);
      }
      const text = paraLines.join(" ");
      // Simple bold handling: **text** → <strong>
      const parts = text.split(/(\*\*[^*]+\*\*)/g).map((part, j) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={j} className="text-stone-800 font-semibold">{part.slice(2, -2)}</strong>;
        }
        return part;
      });
      elements.push(
        <p key={i} className="font-[family-name:var(--font-body)] text-[15px] sm:text-base text-stone-600 leading-relaxed mb-4">
          {parts}
        </p>
      );
    }
    i++;
  }

  return <div>{elements}</div>;
}

/* ─── Page ─── */

export default async function SignalPage({ params }: Props) {
  const { id } = await params;
  const signalId = parseInt(id, 10);
  if (isNaN(signalId)) notFound();

  const signal = await getSignal(signalId);
  if (!signal) notFound();

  const dateStr = toDateStr(signal.issue_date);
  const date = new Date(dateStr + "T12:00:00Z");
  const formatted = date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  const colors = CATEGORY_COLORS[signal.category] || CATEGORY_COLORS.tool;
  const emoji = CATEGORY_EMOJIS[signal.category] || "✦";
  const hype = getHype(signal.hype_or_real);
  const hasDeepDive = !!signal.deep_dive;

  const impactBars = Array.from({ length: 5 }, (_, i) => i < signal.impact_score);

  return (
    <div className="news-page min-h-screen relative">
      {/* Hero header with category gradient */}
      <div className={`relative pt-24 sm:pt-32 pb-14 sm:pb-20 overflow-hidden bg-gradient-to-b ${colors.gradFrom} ${colors.gradTo} to-transparent`}>
        {/* Decorative blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full blur-[80px] opacity-20" style={{ background: colors.accent }} />
          <div className="absolute top-1/2 -left-24 w-48 h-48 rounded-full blur-[60px] opacity-10" style={{ background: colors.accent }} />
        </div>

        <div className="relative mx-auto max-w-2xl px-4 sm:px-6">
          {/* Back nav */}
          <Link
            href={`/news/${dateStr}`}
            className="inline-flex items-center gap-2 text-stone-400 hover:text-stone-600 transition-colors mb-8 sm:mb-10 group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            <span className="font-[family-name:var(--font-mono)] text-[11px] tracking-wider uppercase">
              Back to {date.toLocaleDateString("en-US", { month: "short", day: "numeric" })} signals
            </span>
          </Link>

          <article>
            <header>
              {/* Tags */}
              <div className="flex flex-wrap items-center gap-2 mb-5">
                <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold tracking-[0.12em] uppercase ${colors.bg} ${colors.text} border ${colors.border}`}>
                  {emoji} {signal.category.replace("_", " ")}
                </span>
                <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold tracking-[0.12em] uppercase ${hype.color}`}>
                  {hype.label}
                </span>
              </div>

              {/* Date */}
              <p className="font-[family-name:var(--font-mono)] text-[11px] text-stone-400 tracking-wider mb-4">
                {formatted}
              </p>

              {/* Title */}
              <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl md:text-6xl tracking-wide text-stone-800 leading-[1.05] mb-5">
                {signal.title.toUpperCase()}
              </h1>

              {/* So what */}
              <p className="font-[family-name:var(--font-soft)] text-lg sm:text-xl text-stone-500 leading-relaxed max-w-xl">
                {signal.so_what}
              </p>
            </header>
          </article>
        </div>
      </div>

      {/* Content body */}
      <div className="mx-auto max-w-2xl px-4 sm:px-6 pb-16 sm:pb-24">
        <article>
          {/* Floating meta bar */}
          <div className="relative -mt-7 mb-10 sm:mb-12 p-4 sm:p-5 rounded-2xl bg-white/80 backdrop-blur-sm border border-stone-200/50 shadow-sm">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              {/* Impact meter */}
              <div className="flex items-center gap-2">
                <Zap size={13} style={{ color: colors.accent }} />
                <div className="flex gap-[3px]">
                  {impactBars.map((filled, i) => (
                    <div
                      key={i}
                      className="w-5 h-1.5 rounded-full transition-colors"
                      style={{ background: filled ? colors.accent : "#E8E5DE" }}
                    />
                  ))}
                </div>
                <span className="font-[family-name:var(--font-mono)] text-[9px] text-stone-400 tracking-wider uppercase font-semibold">
                  {signal.impact_score}/5
                </span>
              </div>
              <span className="w-px h-4 bg-stone-200/60 hidden sm:block" />
              <div className="flex items-center gap-1.5 text-stone-400">
                <Clock size={12} />
                <span className="font-[family-name:var(--font-mono)] text-[10px] tracking-wider uppercase">{signal.time_horizon}</span>
              </div>
              <span className="w-px h-4 bg-stone-200/60 hidden sm:block" />
              <div className="flex items-center gap-1.5 text-stone-400">
                <Users size={12} />
                <span className="font-[family-name:var(--font-mono)] text-[10px] tracking-wider uppercase">{signal.who_should_care}</span>
              </div>
              <div className="ml-auto">
                <ShareButton signalId={signal.id} title={signal.title} />
              </div>
            </div>
          </div>

          {/* Deep dive content */}
          {hasDeepDive ? (
            <section className="mb-12 sm:mb-14" aria-label="Deep dive analysis">
              <DeepDiveContent content={signal.deep_dive!} />
            </section>
          ) : (
            /* Fallback: visual card layout */
            <section className="mb-12 sm:mb-14" aria-label="Signal analysis">
              {/* Delta + Impact side by side */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="relative p-5 sm:p-6 rounded-2xl bg-white/70 border border-stone-200/40 overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-[3px] rounded-t-2xl" style={{ background: `linear-gradient(90deg, ${colors.accent}, transparent)` }} />
                  <p className="font-[family-name:var(--font-mono)] text-[9px] tracking-[0.2em] uppercase text-stone-400 mb-2.5 font-bold flex items-center gap-1.5">
                    <span style={{ color: colors.accent }}>◆</span> What Changed
                  </p>
                  <p className="font-[family-name:var(--font-body)] text-[15px] text-stone-600 leading-relaxed">
                    {signal.delta}
                  </p>
                </div>
                <div className="relative p-5 sm:p-6 rounded-2xl bg-white/70 border border-stone-200/40 overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-[3px] rounded-t-2xl" style={{ background: `linear-gradient(90deg, ${colors.accent}80, transparent)` }} />
                  <p className="font-[family-name:var(--font-mono)] text-[9px] tracking-[0.2em] uppercase text-stone-400 mb-2.5 font-bold flex items-center gap-1.5">
                    <span style={{ color: colors.accent }}>◇</span> Why It Matters
                  </p>
                  <p className="font-[family-name:var(--font-body)] text-[15px] text-stone-600 leading-relaxed">
                    {signal.impact}
                  </p>
                </div>
              </div>

              {/* Builder opportunity — accent card */}
              <div className="relative p-5 sm:p-6 rounded-2xl border overflow-hidden mb-4" style={{ borderColor: `${colors.accent}20`, background: `${colors.accent}06` }}>
                <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full blur-2xl pointer-events-none" style={{ background: colors.accent, opacity: 0.06 }} />
                <p className="font-[family-name:var(--font-mono)] text-[9px] tracking-[0.2em] uppercase mb-2.5 font-bold flex items-center gap-1.5" style={{ color: colors.accent }}>
                  🛠 Builder Opportunity
                </p>
                <p className="font-[family-name:var(--font-soft)] text-[16px] sm:text-[17px] text-stone-700 leading-relaxed">
                  {signal.builder_opportunities}
                </p>
              </div>

              {/* Action step */}
              {signal.how_to_use && (
                <div className="relative p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-amber-50/80 to-orange-50/40 border border-amber-200/30 overflow-hidden">
                  <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-amber-200/20 blur-2xl pointer-events-none" />
                  <p className="font-[family-name:var(--font-mono)] text-[9px] tracking-[0.2em] uppercase text-amber-600/70 mb-2.5 font-bold">
                    ⚡ Next Step
                  </p>
                  <p className="font-[family-name:var(--font-soft)] text-[16px] text-amber-900/70 leading-relaxed font-medium">
                    → {signal.how_to_use}
                  </p>
                </div>
              )}
            </section>
          )}

          {/* Sources */}
          {signal.source_urls?.length > 0 && (
            <section className="mb-10 sm:mb-12" aria-label="Sources">
              <p className="font-[family-name:var(--font-mono)] text-[9px] tracking-[0.2em] uppercase text-stone-400 mb-3 font-bold">
                📎 Sources
              </p>
              <div className="space-y-2">
                {signal.source_urls.map((url, i) => (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3.5 rounded-xl bg-white/70 border border-stone-200/40 hover:border-stone-300 hover:shadow-md hover:-translate-y-px transition-all group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center shrink-0 group-hover:bg-blue-50 transition-colors">
                      <ExternalLink size={13} className="text-stone-400 group-hover:text-[#4F8CFF] transition-colors" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="font-[family-name:var(--font-body)] text-[13px] text-stone-600 group-hover:text-stone-800 truncate block transition-colors">
                        {url.replace(/^https?:\/\/(www\.)?/, "").split("/")[0]}
                      </span>
                      <span className="font-[family-name:var(--font-mono)] text-[9px] text-stone-300 block truncate">
                        {url.replace(/^https?:\/\/(www\.)?/, "").slice(0, 60)}
                      </span>
                    </div>
                    <span className="font-[family-name:var(--font-mono)] text-[9px] text-stone-300 shrink-0 group-hover:text-[#4F8CFF] transition-colors">
                      →
                    </span>
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* Signal pulse divider */}
          <div className="flex justify-center my-8">
            <svg viewBox="0 0 200 32" fill="none" className="w-40 h-auto opacity-30">
              <line x1="0" y1="16" x2="70" y2="16" stroke="#C8C4BC" strokeWidth="1" />
              <polyline points="70,16 80,16 86,6 92,26 98,4 104,28 110,10 116,20 122,16 130,16" stroke={colors.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
              <line x1="130" y1="16" x2="200" y2="16" stroke="#C8C4BC" strokeWidth="1" />
            </svg>
          </div>

          {/* Footer */}
          <footer className="text-center">
            <p className="font-[family-name:var(--font-mono)] text-[8px] tracking-[0.4em] uppercase text-stone-300 mb-2">
              The MicroBits
            </p>
            <p className="font-[family-name:var(--font-soft)] text-sm text-stone-400 mb-6">
              Curated AI intelligence for builders
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href={`/news/${dateStr}`}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-stone-800 text-white font-[family-name:var(--font-mono)] text-[10px] tracking-wider uppercase hover:bg-stone-700 transition-colors shadow-sm"
              >
                <ArrowLeft size={12} />
                All signals for {date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </Link>
              <Link
                href="/news"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-stone-200/60 text-stone-500 font-[family-name:var(--font-mono)] text-[10px] tracking-wider uppercase hover:bg-white hover:shadow-sm transition-all"
              >
                Latest signals
              </Link>
            </div>
            <div className="mt-6 flex justify-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-stone-300/50" />
              <span className="w-1 h-1 rounded-full bg-stone-300/30" />
              <span className="w-1 h-1 rounded-full bg-stone-300/15" />
            </div>
          </footer>
        </article>
      </div>
    </div>
  );
}
