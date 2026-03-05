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
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://shreyanssoni.vercel.app";

  if (isNaN(signalId)) return { title: "Signal Not Found" };

  const signal = await getSignal(signalId);
  if (!signal) return { title: "Signal Not Found" };

  const dateStr = toDateStr(signal.issue_date);
  const title = `${signal.title} — The Daily Signal`;
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
      images: [{ url: ogImage, width: 1200, height: 630, alt: signal.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: signal.title,
      description,
      images: [ogImage],
    },
    robots: { index: true, follow: true },
  };
}

export const revalidate = 3600;

/* ─── Color System ─── */

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  launch:      { bg: "bg-[#FF6B6B]/10", text: "text-[#D94848]", border: "border-[#FF6B6B]/20" },
  shift:       { bg: "bg-[#4F8CFF]/10", text: "text-[#3A6FD8]", border: "border-[#4F8CFF]/20" },
  tool:        { bg: "bg-[#2ECC71]/10", text: "text-[#219A52]", border: "border-[#2ECC71]/20" },
  research:    { bg: "bg-[#8E7CFF]/10", text: "text-[#6B5CD4]", border: "border-[#8E7CFF]/20" },
  funding:     { bg: "bg-[#F4B942]/10", text: "text-[#C4942E]", border: "border-[#F4B942]/20" },
  open_source: { bg: "bg-[#1ABC9C]/10", text: "text-[#148F76]", border: "border-[#1ABC9C]/20" },
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

  return (
    <div className="news-page min-h-screen pt-20 sm:pt-28 pb-16 sm:pb-24 relative">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
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
          {/* Header */}
          <header className="mb-8 sm:mb-10">
            {/* Tags */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-[0.12em] uppercase ${colors.bg} ${colors.text}`}>
                {emoji} {signal.category.replace("_", " ")}
              </span>
              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-[0.12em] uppercase ${hype.color}`}>
                {hype.label}
              </span>
              <span className="font-[family-name:var(--font-mono)] text-[10px] text-stone-400">
                {formatted}
              </span>
            </div>

            {/* Title */}
            <h1 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl md:text-5xl tracking-wide text-stone-800 leading-[1.1] mb-4">
              {signal.title.toUpperCase()}
            </h1>

            {/* So what — the hook */}
            <p className="font-[family-name:var(--font-soft)] text-lg sm:text-xl text-stone-500 leading-relaxed">
              {signal.so_what}
            </p>

            {/* Share + meta row */}
            <div className="flex flex-wrap items-center gap-4 mt-5 pt-5 border-t border-stone-200/40">
              <div className="flex items-center gap-1.5 text-stone-400">
                <Zap size={13} />
                <span className="font-[family-name:var(--font-mono)] text-[10px] tracking-wider uppercase">
                  Impact {signal.impact_score}/5
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-stone-400">
                <Clock size={13} />
                <span className="font-[family-name:var(--font-mono)] text-[10px] tracking-wider uppercase">
                  {signal.time_horizon}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-stone-400">
                <Users size={13} />
                <span className="font-[family-name:var(--font-mono)] text-[10px] tracking-wider uppercase">
                  {signal.who_should_care}
                </span>
              </div>
              <div className="ml-auto">
                <ShareButton signalId={signal.id} title={signal.title} />
              </div>
            </div>
          </header>

          {/* Deep dive content */}
          {hasDeepDive ? (
            <section className="mb-10 sm:mb-12" aria-label="Deep dive analysis">
              <DeepDiveContent content={signal.deep_dive!} />
            </section>
          ) : (
            /* Fallback: render existing fields in a nice layout */
            <section className="mb-10 sm:mb-12 space-y-4" aria-label="Signal analysis">
              <div className="signal-card p-5 sm:p-6">
                <p className="font-[family-name:var(--font-mono)] text-[9px] tracking-[0.2em] uppercase text-stone-400 mb-2 font-bold">
                  What Changed
                </p>
                <p className="font-[family-name:var(--font-body)] text-[15px] text-stone-600 leading-relaxed">
                  {signal.delta}
                </p>
              </div>
              <div className="signal-card p-5 sm:p-6">
                <p className="font-[family-name:var(--font-mono)] text-[9px] tracking-[0.2em] uppercase text-stone-400 mb-2 font-bold">
                  Why It Matters
                </p>
                <p className="font-[family-name:var(--font-body)] text-[15px] text-stone-600 leading-relaxed">
                  {signal.impact}
                </p>
              </div>
              <div className="signal-card p-5 sm:p-6">
                <p className="font-[family-name:var(--font-mono)] text-[9px] tracking-[0.2em] uppercase text-stone-400 mb-2 font-bold">
                  Builder Opportunity
                </p>
                <p className="font-[family-name:var(--font-body)] text-[15px] text-stone-600 leading-relaxed">
                  {signal.builder_opportunities}
                </p>
              </div>
              {signal.how_to_use && (
                <div className="p-5 sm:p-6 rounded-2xl bg-amber-50/60 border border-amber-100/60">
                  <p className="font-[family-name:var(--font-mono)] text-[9px] tracking-[0.2em] uppercase text-amber-700/60 mb-2 font-bold">
                    Action Step
                  </p>
                  <p className="font-[family-name:var(--font-body)] text-[15px] text-amber-800/80 leading-relaxed font-medium">
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
                Sources
              </p>
              <div className="space-y-2">
                {signal.source_urls.map((url, i) => (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 rounded-xl bg-white/60 border border-stone-200/40 hover:border-stone-300 hover:shadow-sm transition-all group"
                  >
                    <ExternalLink size={13} className="text-stone-300 group-hover:text-[#4F8CFF] shrink-0 transition-colors" />
                    <span className="font-[family-name:var(--font-body)] text-[13px] text-stone-500 group-hover:text-stone-700 truncate transition-colors">
                      {url.replace(/^https?:\/\/(www\.)?/, "").split("/")[0]}
                    </span>
                    <span className="font-[family-name:var(--font-mono)] text-[9px] text-stone-300 ml-auto shrink-0">
                      source {i + 1}
                    </span>
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* Footer CTA */}
          <footer className="text-center pt-8 border-t border-stone-200/30">
            <p className="font-[family-name:var(--font-soft)] text-sm text-stone-400 mb-4">
              Part of The Daily Signal — curated AI intelligence for builders
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link
                href={`/news/${dateStr}`}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-800 text-white font-[family-name:var(--font-mono)] text-[10px] tracking-wider uppercase hover:bg-stone-700 transition-colors"
              >
                <ArrowLeft size={12} />
                All signals for {date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </Link>
              <Link
                href="/news"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-stone-200/60 text-stone-500 font-[family-name:var(--font-mono)] text-[10px] tracking-wider uppercase hover:bg-white hover:shadow-sm transition-all"
              >
                Latest signals
              </Link>
            </div>
          </footer>
        </article>
      </div>
    </div>
  );
}
