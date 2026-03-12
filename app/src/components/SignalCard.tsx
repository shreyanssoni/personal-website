"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Rocket, TrendingUp, Wrench, FlaskConical, DollarSign, Package, BookOpen } from "lucide-react";
import type { NewsletterSignal } from "@/lib/newsletter";
import ShareButton from "@/components/ShareButton";

/* ─── Color System ─── */

const SIGNAL_COLORS: Record<string, { hex: string }> = {
  launch:      { hex: "#FF6B6B" },
  shift:       { hex: "#4F8CFF" },
  tool:        { hex: "#2ECC71" },
  research:    { hex: "#8E7CFF" },
  funding:     { hex: "#F4B942" },
  open_source: { hex: "#1ABC9C" },
};

const SIGNAL_ICONS: Record<string, typeof Rocket> = {
  launch: Rocket, shift: TrendingUp, tool: Wrench,
  research: FlaskConical, funding: DollarSign, open_source: Package,
};

const IMPACT_BADGES: Record<number, { label: string; classes: string }> = {
  5: { label: "Disruptive",  classes: "bg-red-500/20 text-red-400 border-red-500/30" },
  4: { label: "High Impact", classes: "bg-[#8B8FC7]/10 text-[#8B8FC7] border-[#8B8FC7]/30" },
  3: { label: "Moderate",    classes: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
  2: { label: "Low Impact",  classes: "bg-slate-500/20 text-slate-400 border-slate-500/30" },
  1: { label: "Incremental", classes: "bg-slate-500/20 text-slate-300 border-slate-500/30" },
};

const HYPE_CONFIG: Record<string, { label: string; classes: string }> = {
  "real shift":  { label: "Real",  classes: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  "mostly real": { label: "Solid", classes: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  "mixed":       { label: "Mixed", classes: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
  "mostly hype": { label: "Hype?", classes: "bg-orange-500/15 text-orange-400 border-orange-500/30" },
  "pure hype":   { label: "Hype",  classes: "bg-red-500/15 text-red-400 border-red-500/30" },
};

function getHype(hype: string) {
  const h = hype.toLowerCase();
  for (const [key, val] of Object.entries(HYPE_CONFIG)) {
    if (h.includes(key)) return val;
  }
  return { label: "TBD", classes: "bg-slate-500/15 text-slate-400 border-slate-500/30" };
}

export default function SignalCard({ signal, index }: { signal: NewsletterSignal; index?: number }) {
  const [expanded, setExpanded] = useState(false);
  const colors = SIGNAL_COLORS[signal.category] || SIGNAL_COLORS.tool;
  const Icon = SIGNAL_ICONS[signal.category] || Wrench;
  const hype = getHype(signal.hype_or_real);
  const impact = IMPACT_BADGES[signal.impact_score] || IMPACT_BADGES[3];

  return (
    <article className="news-glass rounded-2xl hover:bg-white/[0.05] transition-all cursor-pointer group border border-white/[0.05]">
      <div
        role="button"
        tabIndex={0}
        onClick={() => setExpanded(!expanded)}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setExpanded(!expanded); } }}
        className="p-6 sm:p-8 lg:px-12"
      >
        <div className="flex flex-wrap items-center justify-between gap-4 sm:gap-6">
          {/* Left: number + content */}
          <div className="flex items-start gap-4 sm:gap-6 flex-1 min-w-0">
            {/* Number */}
            {index && (
              <span className="text-xl sm:text-2xl font-bold text-[#8B8FC7]/30 group-hover:text-[#8B8FC7] transition-colors italic shrink-0 pt-0.5">
                {String(index).padStart(2, "0")}
              </span>
            )}

            <div className="min-w-0 flex-1">
              {/* Category + hype tags */}
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase" style={{ color: colors.hex }}>
                  <Icon size={11} strokeWidth={2.5} />
                  {signal.category.replace("_", " ")}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase border ${hype.classes}`}>
                  {hype.label}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-base sm:text-lg lg:text-xl font-bold text-white leading-snug mb-1.5">
                {signal.title}
              </h3>

              {/* So what */}
              <p className="text-slate-400 text-sm leading-relaxed">{signal.so_what}</p>

              {/* How to use */}
              {signal.how_to_use && (
                <p className="mt-2 font-mono text-[11px] sm:text-xs text-[#8B8FC7] font-medium truncate">
                  → {signal.how_to_use}
                </p>
              )}
            </div>
          </div>

          {/* Right: impact badge + chevron */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <span className={`hidden sm:inline-flex px-4 py-1.5 rounded-full text-xs font-bold border uppercase ${impact.classes}`}>
              {impact.label}
            </span>
            <ShareButton signalId={signal.id} title={signal.title} compact />
            <ChevronDown
              size={18}
              className={`text-slate-500 group-hover:text-[#8B8FC7] transition-all duration-300 ${expanded ? "rotate-180" : ""}`}
            />
          </div>
        </div>
      </div>

      {/* Expanded detail */}
      <div className={`grid transition-all duration-300 ease-out overflow-hidden ${expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
        <div className="min-h-0">
          <div className="px-6 sm:px-8 lg:px-12 pb-6 sm:pb-8">
            <div className="h-px bg-white/[0.05] mb-6" />

            {/* Mobile impact badge */}
            <div className="sm:hidden mb-4">
              <span className={`inline-flex px-4 py-1.5 rounded-full text-xs font-bold border uppercase ${impact.classes}`}>
                {impact.label}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="news-glass rounded-xl p-5">
                <p className="font-mono text-[9px] tracking-widest uppercase text-slate-500 mb-2 font-bold">What Changed</p>
                <p className="text-slate-300 text-sm leading-relaxed">{signal.delta}</p>
              </div>
              <div className="news-glass rounded-xl p-5">
                <p className="font-mono text-[9px] tracking-widest uppercase text-slate-500 mb-2 font-bold">Build This</p>
                <p className="text-slate-300 text-sm leading-relaxed">{signal.builder_opportunities}</p>
              </div>
            </div>

            {signal.how_to_use && (
              <div className="mt-4 bg-[#8B8FC7]/10 border border-[#8B8FC7]/20 rounded-xl px-5 py-4">
                <p className="font-mono text-xs text-[#8B8FC7] font-medium">→ {signal.how_to_use}</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6 pt-5 border-t border-white/[0.05]">
              <Link
                href={`/news/signal/${signal.id}`}
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#8B8FC7] text-white font-mono text-[10px] font-bold tracking-wider uppercase hover:bg-[#7A7EB8] transition-all"
              >
                <BookOpen size={13} /> Read Full Analysis
              </Link>

              <div className="flex items-center gap-4">
                <span className="font-mono text-[10px] text-slate-500">{signal.who_should_care}</span>
                {signal.source_urls.slice(0, 2).map((url, i) => (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-[10px] text-slate-500 hover:text-[#8B8FC7] underline underline-offset-2 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    source {i + 1}
                  </a>
                ))}
                <ShareButton signalId={signal.id} title={signal.title} dropUp />
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
