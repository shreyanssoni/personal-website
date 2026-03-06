import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getThreadBySlug, refreshThreadSignals } from "@/lib/newsletter";
import ShareButton from "@/components/ShareButton";

export const revalidate = 1800;

function toDateStr(d: string | Date): string {
  if (d instanceof Date) return d.toISOString().slice(0, 10);
  if (typeof d === "string" && d.length >= 10) return d.slice(0, 10);
  return String(d);
}

function formatDate(d: string | Date): string {
  const date = new Date(toDateStr(d) + "T12:00:00Z");
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const CATEGORY_COLORS: Record<string, string> = {
  launch: "bg-blue-100 text-blue-700",
  research: "bg-purple-100 text-purple-700",
  tool: "bg-teal-100 text-teal-700",
  shift: "bg-orange-100 text-orange-700",
  funding: "bg-green-100 text-green-700",
  open_source: "bg-pink-100 text-pink-700",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const thread = await getThreadBySlug(slug);
  if (!thread) return { title: "Thread Not Found" };

  return {
    title: `${thread.emoji} ${thread.title} — The Daily Vibe Code`,
    description: thread.description || `Follow the ${thread.title} story arc across daily AI signals.`,
  };
}

export default async function ThreadPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const thread = await getThreadBySlug(slug);
  if (!thread || thread.status !== "published") notFound();

  // Auto-refresh: check for new matching signals on each render
  await refreshThreadSignals(thread.id).catch(() => {});

  // Re-fetch after potential refresh to get updated signals
  const freshThread = await getThreadBySlug(slug);
  const signals = freshThread?.signals || thread.signals;

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <div className="max-w-3xl mx-auto px-6 pt-32 pb-20">
        {/* Back link */}
        <Link
          href="/news/threads"
          className="inline-flex items-center gap-1.5 font-[family-name:var(--font-mono)] text-xs text-stone-400 hover:text-stone-600 tracking-wide mb-8 transition-colors"
        >
          &larr; All Threads
        </Link>

        {/* Header */}
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">{thread.emoji}</span>
            <h1 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl tracking-wider text-stone-800">
              {thread.title}
            </h1>
          </div>
          {thread.description && (
            <p className="font-[family-name:var(--font-body)] text-stone-500 text-lg leading-relaxed max-w-xl">
              {thread.description}
            </p>
          )}
          <div className="mt-3 flex items-center gap-3">
            <span className="font-[family-name:var(--font-mono)] text-[11px] text-stone-400 tracking-wide">
              {signals.length} signal{signals.length !== 1 ? "s" : ""}
            </span>
            <ShareButton threadSlug={thread.slug} title={`${thread.emoji} ${thread.title}`} compact />
          </div>
        </header>

        {/* Timeline */}
        {signals.length === 0 ? (
          <p className="font-[family-name:var(--font-body)] text-stone-400 text-center py-12">
            No signals in this thread yet.
          </p>
        ) : (
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[7px] top-2 bottom-2 w-px bg-stone-200" />

            <div className="space-y-6">
              {signals.map((signal, idx) => {
                const catColor = CATEGORY_COLORS[signal.category] || "bg-stone-100 text-stone-600";
                const showDate =
                  idx === 0 ||
                  toDateStr(signal.issue_date) !== toDateStr(signals[idx - 1].issue_date);

                return (
                  <div key={signal.id} className="relative pl-8">
                    {/* Dot */}
                    <div className="absolute left-0 top-1.5 w-[15px] h-[15px] rounded-full border-2 border-stone-300 bg-[#FAFAF8] z-10" />

                    {/* Date separator */}
                    {showDate && (
                      <div className="font-[family-name:var(--font-mono)] text-[11px] text-stone-400 tracking-wider uppercase mb-1.5">
                        {formatDate(signal.issue_date)}
                      </div>
                    )}

                    {/* Signal card */}
                    <div className="border border-stone-200/60 rounded-xl px-5 py-4 bg-white hover:border-stone-300 hover:shadow-sm transition-all">
                      <div className="flex items-start gap-3 mb-2">
                        <h3 className="font-[family-name:var(--font-display)] text-sm tracking-wide text-stone-800 flex-1">
                          {signal.title}
                        </h3>
                        <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-[family-name:var(--font-mono)] tracking-wide ${catColor}`}>
                          {signal.category}
                        </span>
                      </div>
                      <p className="font-[family-name:var(--font-body)] text-stone-500 text-sm leading-relaxed">
                        {signal.so_what}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
