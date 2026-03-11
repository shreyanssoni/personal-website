"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, Rocket, TrendingUp, Wrench, FlaskConical, DollarSign, Package, BookOpen } from "lucide-react";
import type { NewsletterSignal } from "@/lib/newsletter";
import ShareButton from "@/components/ShareButton";

/* ─── Color System ─── */

const SIGNAL_COLORS: Record<string, { bg: string; text: string; icon: string; dot: string; hex: string }> = {
  launch:      { bg: "bg-[#FF6B6B]/10", text: "text-[#D94848]", icon: "text-[#FF6B6B]", dot: "bg-[#FF6B6B]", hex: "#FF6B6B" },
  shift:       { bg: "bg-[#4F8CFF]/10", text: "text-[#3A6FD8]", icon: "text-[#4F8CFF]", dot: "bg-[#4F8CFF]", hex: "#4F8CFF" },
  tool:        { bg: "bg-[#2ECC71]/10", text: "text-[#219A52]", icon: "text-[#2ECC71]", dot: "bg-[#2ECC71]", hex: "#2ECC71" },
  research:    { bg: "bg-[#8E7CFF]/10", text: "text-[#6B5CD4]", icon: "text-[#8E7CFF]", dot: "bg-[#8E7CFF]", hex: "#8E7CFF" },
  funding:     { bg: "bg-[#F4B942]/10", text: "text-[#C4942E]", icon: "text-[#F4B942]", dot: "bg-[#F4B942]", hex: "#F4B942" },
  open_source: { bg: "bg-[#1ABC9C]/10", text: "text-[#148F76]", icon: "text-[#1ABC9C]", dot: "bg-[#1ABC9C]", hex: "#1ABC9C" },
};

const SIGNAL_ICONS: Record<string, typeof Rocket> = {
  launch: Rocket,
  shift: TrendingUp,
  tool: Wrench,
  research: FlaskConical,
  funding: DollarSign,
  open_source: Package,
};

const HYPE_CONFIG: Record<string, { label: string; color: string }> = {
  "real shift":  { label: "Real",  color: "bg-emerald-100 text-emerald-700" },
  "mostly real": { label: "Solid", color: "bg-emerald-50 text-emerald-600" },
  "mixed":       { label: "Mixed", color: "bg-amber-50 text-amber-700" },
  "mostly hype": { label: "Hype?", color: "bg-orange-50 text-orange-700" },
  "pure hype":   { label: "Hype",  color: "bg-red-50 text-red-600" },
};

function getHype(hype: string) {
  const h = hype.toLowerCase();
  for (const [key, val] of Object.entries(HYPE_CONFIG)) {
    if (h.includes(key)) return val;
  }
  return { label: "TBD", color: "bg-stone-100 text-stone-500" };
}

function ImpactMeter({ score }: { score: number }) {
  const labels = ["", "LOW", "MED", "MED", "HIGH", "HIGH"];
  const colors = ["", "bg-stone-300", "bg-stone-400", "bg-amber-400", "bg-[#FF6B6B]", "bg-[#FF6B6B]"];
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex gap-[3px]">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`w-[14px] h-[5px] transition-colors ${i <= score ? colors[score] : "bg-stone-200"}`}
          />
        ))}
      </div>
      <span className="font-[family-name:var(--font-mono)] text-[8px] tracking-[0.15em] text-stone-400 font-bold uppercase">
        {labels[score] || ""}
      </span>
    </div>
  );
}

export default function SignalCard({ signal }: { signal: NewsletterSignal }) {
  const [expanded, setExpanded] = useState(false);
  const colors = SIGNAL_COLORS[signal.category] || SIGNAL_COLORS.tool;
  const Icon = SIGNAL_ICONS[signal.category] || Wrench;
  const hype = getHype(signal.hype_or_real);

  return (
    <article
      className="bg-white border border-stone-200 hover:border-stone-400 hover:shadow-md transition-all mb-4"
      style={{ borderLeftWidth: "4px", borderLeftColor: colors.hex }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-4 sm:p-5 cursor-pointer"
      >
        {/* Top row: tags + impact + actions */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`inline-flex items-center gap-1 px-2 py-[3px] text-[9px] font-bold tracking-[0.12em] uppercase ${colors.bg} ${colors.text}`}>
              <Icon size={9} strokeWidth={2.5} />
              {signal.category.replace("_", " ")}
            </span>
            <span className={`px-2 py-[3px] text-[9px] font-bold tracking-[0.1em] uppercase ${hype.color}`}>
              {hype.label}
            </span>
            {signal.time_horizon && signal.time_horizon !== "now" && (
              <span className="font-[family-name:var(--font-mono)] text-[9px] text-stone-400 tracking-wider">
                {signal.time_horizon}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden sm:block"><ImpactMeter score={signal.impact_score} /></span>
            <ShareButton signalId={signal.id} title={signal.title} compact />
            <ChevronRight
              size={15}
              className={`text-stone-400 transition-transform duration-300 ${expanded ? "rotate-90" : ""}`}
            />
          </div>
        </div>

        {/* Title */}
        <h3 className="font-[family-name:var(--font-serif)] text-[16px] sm:text-[18px] md:text-[20px] font-bold text-stone-900 leading-snug mb-2">
          {signal.title}
        </h3>

        {/* So What */}
        <p className="font-[family-name:var(--font-body)] text-[13px] sm:text-[14px] text-stone-500 leading-snug">
          {signal.so_what}
        </p>

        {/* How to use — always visible */}
        {signal.how_to_use && (
          <p className="mt-2 font-[family-name:var(--font-mono)] text-[11px] sm:text-[12px] text-amber-700 font-semibold tracking-wide truncate">
            → {signal.how_to_use}
          </p>
        )}

        {/* Impact meter mobile */}
        <div className="mt-2.5 sm:hidden">
          <ImpactMeter score={signal.impact_score} />
        </div>
      </button>

      {/* Expanded */}
      <div
        className={`grid transition-all duration-300 ease-out overflow-hidden ${
          expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="min-h-0">
          <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-0">
            <div className="h-px bg-stone-100 mb-3 sm:mb-4" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-stone-50 border-l-2 border-stone-300 p-3 sm:p-4">
                <p className="font-[family-name:var(--font-mono)] text-[8px] tracking-[0.25em] uppercase text-stone-400 mb-1.5 font-bold">
                  What changed
                </p>
                <p className="font-[family-name:var(--font-body)] text-[12px] sm:text-[13px] text-stone-600 leading-relaxed">
                  {signal.delta}
                </p>
              </div>
              <div className="bg-stone-50 border-l-2 border-stone-300 p-3 sm:p-4">
                <p className="font-[family-name:var(--font-mono)] text-[8px] tracking-[0.25em] uppercase text-stone-400 mb-1.5 font-bold">
                  Build this
                </p>
                <p className="font-[family-name:var(--font-body)] text-[12px] sm:text-[13px] text-stone-600 leading-relaxed">
                  {signal.builder_opportunities}
                </p>
              </div>
            </div>

            {signal.how_to_use && (
              <div className="mt-3 bg-amber-50 border-l-2 border-amber-500 px-3 sm:px-4 py-2.5">
                <p className="font-[family-name:var(--font-mono)] text-[11px] sm:text-[12px] text-amber-800 font-semibold">
                  → {signal.how_to_use}
                </p>
              </div>
            )}

            <Link
              href={`/news/signal/${signal.id}`}
              onClick={(e) => e.stopPropagation()}
              className="mt-3 sm:mt-4 flex items-center justify-center gap-2 w-full py-2.5 border border-stone-900 text-stone-900 hover:bg-stone-900 hover:text-white transition-all group"
            >
              <BookOpen size={13} />
              <span className="font-[family-name:var(--font-mono)] text-[10px] font-bold tracking-[0.15em] uppercase">
                Read Full Analysis
              </span>
              <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-3 pt-3 border-t border-stone-100">
              <span className="font-[family-name:var(--font-mono)] text-[9px] text-stone-400 font-medium">
                {signal.who_should_care}
              </span>
              <div className="flex items-center gap-3">
                {signal.source_urls.slice(0, 2).map((url, i) => (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-[family-name:var(--font-mono)] text-[9px] text-stone-400 hover:text-[#4F8CFF] underline underline-offset-2 transition-colors font-medium"
                    onClick={(e) => e.stopPropagation()}
                  >
                    source {i + 1}
                  </a>
                ))}
                <span className="w-px h-3 bg-stone-200" />
                <ShareButton signalId={signal.id} title={signal.title} dropUp />
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
