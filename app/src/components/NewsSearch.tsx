"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Search, X, ExternalLink, Sparkles, Rss, ChevronRight } from "lucide-react";
import type { SearchResult } from "@/lib/newsletter";

const CATEGORY_COLORS: Record<string, string> = {
  launch: "bg-[#FF6B6B]/15 text-[#FF6B6B]",
  shift: "bg-[#4F8CFF]/15 text-[#6EA0FF]",
  tool: "bg-[#2ECC71]/15 text-[#2ECC71]",
  research: "bg-[#8E7CFF]/15 text-[#A99AFF]",
  funding: "bg-[#F4B942]/15 text-[#F4B942]",
  open_source: "bg-[#1ABC9C]/15 text-[#1ABC9C]",
};

function toDateStr(d: string | Date): string {
  if (!d) return "";
  const s = d instanceof Date ? d.toISOString() : String(d);
  return s.slice(0, 10);
}

function SignalResult({ result }: { result: SearchResult & { result_type: "signal" } }) {
  const colors = CATEGORY_COLORS[result.category] || "bg-slate-500/15 text-slate-400";
  const dateStr = toDateStr(result.issue_date);

  return (
    <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-4 sm:p-5 hover:border-white/[0.15] transition-all">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 w-8 h-8 rounded-lg bg-[#8B8FC7]/10 flex items-center justify-center shrink-0">
          <Sparkles size={14} className="text-[#8B8FC7]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
            <span className={`px-1.5 py-[2px] rounded-md text-[8px] font-bold tracking-[0.1em] uppercase ${colors}`}>
              {result.category.replace("_", " ")}
            </span>
            <span className="px-1.5 py-[2px] rounded-md text-[8px] font-bold tracking-[0.1em] uppercase bg-[#8B8FC7]/10 text-[#8B8FC7]">
              curated
            </span>
            {dateStr && (
              <span className="font-[family-name:var(--font-mono)] text-[9px] text-slate-500">
                {dateStr}
              </span>
            )}
          </div>
          <h4 className="font-[family-name:var(--font-soft)] text-[15px] text-slate-200 leading-snug mb-1">
            {result.title}
          </h4>
          {result.so_what && (
            <p className="font-[family-name:var(--font-soft)] text-[13px] text-slate-400 leading-snug mb-2">
              {result.so_what}
            </p>
          )}
          {result.delta && (
            <p className="font-[family-name:var(--font-body)] text-[12px] text-slate-500 leading-snug">
              {result.delta}
            </p>
          )}
          {result.source_urls?.length > 0 && (
            <div className="flex gap-2 mt-2">
              {result.source_urls.slice(0, 2).map((url, i) => (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-[family-name:var(--font-mono)] text-[9px] text-slate-500 hover:text-[#8B8FC7] transition-colors"
                >
                  <ExternalLink size={9} />
                  source {i + 1}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RawResult({ result }: { result: SearchResult & { result_type: "raw" } }) {
  const [expanded, setExpanded] = useState(false);
  const dateStr = toDateStr(result.fetched_at);

  return (
    <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-4 sm:p-5 cursor-pointer"
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5 w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center shrink-0">
            <Rss size={14} className="text-slate-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
              <span className="px-1.5 py-[2px] rounded-md text-[8px] font-bold tracking-[0.1em] uppercase bg-white/[0.05] text-slate-400">
                {result.source}
              </span>
              {dateStr && (
                <span className="font-[family-name:var(--font-mono)] text-[9px] text-slate-500">
                  {dateStr}
                </span>
              )}
            </div>
            <h4 className="font-[family-name:var(--font-soft)] text-[14px] text-slate-300 leading-snug">
              {result.title}
            </h4>
          </div>
          <div className="flex items-center gap-2 shrink-0 mt-1">
            <a
              href={result.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-slate-600 hover:text-[#8B8FC7] transition-colors"
            >
              <ExternalLink size={13} />
            </a>
            <ChevronRight
              size={14}
              className={`text-slate-600 transition-transform duration-300 ${expanded ? "rotate-90" : ""}`}
            />
          </div>
        </div>
      </button>

      <div className={`grid transition-all duration-300 ease-out ${expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
        <div className="overflow-hidden">
          <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-0 pl-[60px]">
            <div className="h-px bg-white/10 mb-3" />
            {result.description && (
              <p className="font-[family-name:var(--font-body)] text-[13px] text-slate-400 leading-relaxed mb-3">
                {result.description}
              </p>
            )}
            <a
              href={result.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#8B8FC7] text-white font-[family-name:var(--font-mono)] text-[10px] tracking-wider uppercase hover:bg-[#7A7EB8] transition-colors"
            >
              Read article <ExternalLink size={10} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NewsSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const doSearch = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/news/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.results || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    clearTimeout(timerRef.current);
    if (query.length >= 2) {
      timerRef.current = setTimeout(() => doSearch(query), 300);
    } else {
      setResults([]);
      setSearched(false);
    }
    return () => clearTimeout(timerRef.current);
  }, [query, doSearch]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setQuery("");
        setResults([]);
        setSearched(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const signalResults = results.filter((r): r is SearchResult & { result_type: "signal" } => r.result_type === "signal");
  const rawResults = results.filter((r): r is SearchResult & { result_type: "raw" } => r.result_type === "raw");

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/[0.05] border border-white/[0.1] hover:border-[#8B8FC7]/30 hover:bg-white/[0.08] transition-all cursor-pointer group"
      >
        <Search size={14} className="text-slate-500 group-hover:text-slate-300 transition-colors" />
        <span className="font-[family-name:var(--font-soft)] text-[13px] text-slate-500 group-hover:text-slate-300 transition-colors">
          Search signals...
        </span>
        <kbd className="hidden sm:inline font-[family-name:var(--font-mono)] text-[9px] text-slate-600 bg-white/[0.05] px-1.5 py-0.5 rounded ml-4">
          /
        </kbd>
      </button>
    );
  }

  return (
    <div className="mb-8 sm:mb-10">
      <div className="relative">
        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/[0.05] border border-white/[0.1] focus-within:border-[#8B8FC7]/30 transition-all">
          <Search size={16} className="text-slate-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search AI signals, tools, launches..."
            className="flex-1 bg-transparent font-[family-name:var(--font-soft)] text-[15px] text-slate-200 placeholder:text-slate-600 outline-none"
          />
          {loading && (
            <div className="w-4 h-4 border-2 border-white/10 border-t-[#8B8FC7] rounded-full animate-spin shrink-0" />
          )}
          <button
            onClick={() => {
              setOpen(false);
              setQuery("");
              setResults([]);
              setSearched(false);
            }}
            className="text-slate-600 hover:text-slate-300 transition-colors shrink-0"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {searched && (
        <div className="mt-4">
          {results.length === 0 && !loading && (
            <div className="text-center py-8">
              <p className="font-[family-name:var(--font-soft)] text-sm text-slate-500 italic">
                No signals found for &ldquo;{query}&rdquo;
              </p>
              <p className="font-[family-name:var(--font-mono)] text-[10px] text-slate-600 mt-1">
                Try different keywords or shorter terms
              </p>
            </div>
          )}

          {signalResults.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={12} className="text-[#8B8FC7]" />
                <p className="font-[family-name:var(--font-mono)] text-[9px] tracking-[0.2em] uppercase text-slate-500 font-bold">
                  Curated Signals ({signalResults.length})
                </p>
              </div>
              <div className="space-y-3">
                {signalResults.map((r) => (
                  <SignalResult key={`signal-${r.id}`} result={r} />
                ))}
              </div>
            </div>
          )}

          {rawResults.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Rss size={12} className="text-slate-500" />
                <p className="font-[family-name:var(--font-mono)] text-[9px] tracking-[0.2em] uppercase text-slate-500 font-bold">
                  From the feed ({rawResults.length})
                </p>
              </div>
              <div className="space-y-3">
                {rawResults.map((r) => (
                  <RawResult key={`raw-${r.id}`} result={r} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
