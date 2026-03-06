import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedThreads } from "@/lib/newsletter";

export const revalidate = 1800;

export const metadata: Metadata = {
  title: "Story Threads — The Daily Vibe Code",
  description: "Follow evolving AI narratives across days. Curated story arcs from The Daily Vibe Code signal archive.",
};

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "yesterday";
  return `${days}d ago`;
}

export default async function ThreadsPage() {
  const threads = await getPublishedThreads();

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-b from-stone-100/80 via-[#FAFAF8] to-[#FAFAF8] pt-28 sm:pt-36 pb-6 sm:pb-10">
        {/* Decorative elements */}
        <div className="absolute top-16 left-1/4 w-64 h-64 bg-gradient-to-br from-[#4F8CFF]/5 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 right-1/4 w-48 h-48 bg-gradient-to-bl from-emerald-100/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl mx-auto px-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🧵</span>
            <span className="font-[family-name:var(--font-mono)] text-[10px] tracking-[0.3em] uppercase text-stone-400 font-medium">
              The Daily Vibe Code
            </span>
          </div>

          <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl md:text-6xl tracking-wider text-stone-800 mb-4">
            STORY THREADS
          </h1>

          <p className="font-[family-name:var(--font-body)] text-stone-500 text-lg sm:text-xl leading-relaxed max-w-xl mb-6">
            AI moves fast. These threads connect the dots across days — rivalries, product sagas, and trends you can actually follow.
          </p>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/70 border border-stone-200/50">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-[family-name:var(--font-mono)] text-[11px] text-stone-500 font-medium">
                {threads.length} active thread{threads.length !== 1 ? "s" : ""}
              </span>
            </div>
            <span className="font-[family-name:var(--font-mono)] text-[11px] text-stone-400">
              Auto-updated with new signals daily
            </span>
          </div>
        </div>
      </div>

      {/* Thread list */}
      <div className="max-w-3xl mx-auto px-6 py-8 sm:py-12">
        {threads.length === 0 ? (
          <div className="text-center py-16 sm:py-24">
            <span className="text-4xl mb-4 block">🧵</span>
            <h2 className="font-[family-name:var(--font-display)] text-2xl tracking-wider text-stone-300 mb-3">
              NO THREADS YET
            </h2>
            <p className="font-[family-name:var(--font-body)] text-stone-400 mb-6 max-w-sm mx-auto">
              Story threads are generated from recurring patterns in daily signals. Check back after a few days of coverage.
            </p>
            <Link
              href="/news"
              className="inline-flex items-center gap-1.5 font-[family-name:var(--font-mono)] text-xs text-[#4F8CFF] hover:text-[#3A6FD8] tracking-wide transition-colors"
            >
              &larr; Back to today&apos;s signals
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {threads.map((thread) => (
              <Link
                key={thread.id}
                href={`/news/threads/${thread.slug}`}
                className="block group"
              >
                <div className="relative overflow-hidden border border-stone-200/60 rounded-2xl px-6 py-6 bg-white hover:border-stone-300 hover:shadow-md transition-all hover:-translate-y-0.5">
                  {/* Subtle accent bar */}
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#4F8CFF]/30 via-emerald-300/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2.5">
                        <span className="text-2xl">{thread.emoji}</span>
                        <div>
                          <h2 className="font-[family-name:var(--font-display)] text-xl tracking-wide text-stone-800 group-hover:text-[#4F8CFF] transition-colors">
                            {thread.title}
                          </h2>
                          <span className="font-[family-name:var(--font-mono)] text-[10px] text-stone-400 tracking-wide">
                            Updated {timeAgo(thread.updated_at)}
                          </span>
                        </div>
                      </div>
                      {thread.description && (
                        <p className="font-[family-name:var(--font-body)] text-stone-500 text-[15px] leading-relaxed pl-[44px]">
                          {thread.description}
                        </p>
                      )}
                    </div>
                    <span className="font-[family-name:var(--font-mono)] text-xs text-stone-300 group-hover:text-[#4F8CFF] transition-colors shrink-0 mt-2">
                      &rarr;
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
