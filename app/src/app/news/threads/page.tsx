import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedThreads } from "@/lib/newsletter";

export const revalidate = 1800;

export const metadata: Metadata = {
  title: "Story Threads — The Daily Vibe Code",
  description: "Follow evolving AI narratives across days. Curated story arcs from The Daily Vibe Code signal archive.",
};

function toDateStr(d: string | Date): string {
  if (d instanceof Date) return d.toISOString().slice(0, 10);
  if (typeof d === "string" && d.length >= 10) return d.slice(0, 10);
  return String(d);
}

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
      <div className="max-w-3xl mx-auto px-6 pt-32 pb-20">
        <header className="mb-12">
          <h1 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl tracking-wider text-stone-800 mb-3">
            STORY THREADS
          </h1>
          <p className="font-[family-name:var(--font-body)] text-stone-500 text-lg leading-relaxed max-w-xl">
            Follow evolving narratives across days. Each thread groups related signals into a timeline you can track.
          </p>
        </header>

        {threads.length === 0 ? (
          <div className="text-center py-16">
            <p className="font-[family-name:var(--font-body)] text-stone-400">
              No active threads yet. Check back soon.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {threads.map((thread) => (
              <Link
                key={thread.id}
                href={`/news/threads/${thread.slug}`}
                className="block group"
              >
                <div className="border border-stone-200/60 rounded-2xl px-6 py-5 bg-white hover:border-stone-300 hover:shadow-sm transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2.5 mb-2">
                        <span className="text-xl">{thread.emoji}</span>
                        <h2 className="font-[family-name:var(--font-display)] text-lg tracking-wide text-stone-800 group-hover:text-[#4F8CFF] transition-colors">
                          {thread.title}
                        </h2>
                      </div>
                      {thread.description && (
                        <p className="font-[family-name:var(--font-body)] text-stone-500 text-sm leading-relaxed mb-3">
                          {thread.description}
                        </p>
                      )}
                      <span className="font-[family-name:var(--font-mono)] text-[11px] text-stone-400 tracking-wide">
                        Updated {timeAgo(thread.updated_at)}
                      </span>
                    </div>
                    <span className="font-[family-name:var(--font-mono)] text-xs text-stone-400 group-hover:text-[#4F8CFF] transition-colors shrink-0 mt-1">
                      Follow &rarr;
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
