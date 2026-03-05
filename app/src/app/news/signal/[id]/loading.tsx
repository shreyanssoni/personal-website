export default function SignalLoading() {
  return (
    <div className="news-page min-h-screen relative">
      {/* Hero gradient skeleton */}
      <div className="relative pt-24 sm:pt-32 pb-14 sm:pb-20 overflow-hidden bg-gradient-to-b from-stone-100/50 to-transparent">
        {/* Decorative blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-stone-200/20 blur-[80px]" />
          <div className="absolute top-1/2 -left-24 w-48 h-48 rounded-full bg-stone-200/10 blur-[60px]" />
        </div>

        <div className="relative mx-auto max-w-2xl px-4 sm:px-6">
          {/* Back nav */}
          <div className="flex items-center gap-2 mb-8 sm:mb-10">
            <div className="w-3.5 h-3.5 rounded bg-stone-200/40 animate-pulse" />
            <div className="h-2.5 w-32 rounded bg-stone-200/40 animate-pulse" />
          </div>

          {/* Tags */}
          <div className="flex items-center gap-2 mb-5">
            <div className="h-7 w-24 rounded-full bg-stone-200/30 animate-pulse" />
            <div className="h-7 w-20 rounded-full bg-stone-200/20 animate-pulse" style={{ animationDelay: "80ms" }} />
          </div>

          {/* Date */}
          <div className="h-3 w-44 rounded bg-stone-200/30 animate-pulse mb-4" style={{ animationDelay: "120ms" }} />

          {/* Title lines */}
          <div className="space-y-3 mb-5">
            <div className="h-9 sm:h-12 w-full rounded-lg bg-stone-200/35 animate-pulse" style={{ animationDelay: "160ms" }} />
            <div className="h-9 sm:h-12 w-3/4 rounded-lg bg-stone-200/25 animate-pulse" style={{ animationDelay: "220ms" }} />
          </div>

          {/* So what */}
          <div className="space-y-2 max-w-xl">
            <div className="h-4 w-full rounded bg-stone-200/25 animate-pulse" style={{ animationDelay: "280ms" }} />
            <div className="h-4 w-2/3 rounded bg-stone-200/20 animate-pulse" style={{ animationDelay: "340ms" }} />
          </div>
        </div>
      </div>

      {/* Content body */}
      <div className="mx-auto max-w-2xl px-4 sm:px-6 pb-16 sm:pb-24">
        {/* Floating meta bar */}
        <div className="-mt-7 mb-10 sm:mb-12 p-4 sm:p-5 rounded-2xl bg-white/80 border border-stone-200/50 shadow-sm">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {/* Impact meter */}
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded bg-stone-200/40 animate-pulse" />
              <div className="flex gap-[3px]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="w-5 h-1.5 rounded-full bg-stone-200/40 animate-pulse" style={{ animationDelay: `${i * 60}ms` }} />
                ))}
              </div>
            </div>
            <span className="w-px h-4 bg-stone-200/60 hidden sm:block" />
            <div className="h-3 w-12 rounded bg-stone-200/30 animate-pulse" />
            <span className="w-px h-4 bg-stone-200/60 hidden sm:block" />
            <div className="h-3 w-36 rounded bg-stone-200/30 animate-pulse" />
            <div className="ml-auto h-7 w-16 rounded-lg bg-stone-200/30 animate-pulse" />
          </div>
        </div>

        {/* Content cards */}
        <div className="space-y-4 mb-12 sm:mb-14">
          {/* Two side-by-side cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="relative p-5 sm:p-6 rounded-2xl bg-white/70 border border-stone-200/40 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[3px] rounded-t-2xl bg-gradient-to-r from-stone-200/40 to-transparent" />
                <div className="flex items-center gap-1.5 mb-3">
                  <div className="w-2.5 h-2.5 rounded bg-stone-200/50 animate-pulse" />
                  <div className="h-2 w-24 rounded bg-stone-200/40 animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
                </div>
                <div className="space-y-2">
                  <div className="h-3.5 w-full rounded bg-stone-200/30 animate-pulse" style={{ animationDelay: `${i * 100 + 50}ms` }} />
                  <div className="h-3.5 w-4/5 rounded bg-stone-200/20 animate-pulse" style={{ animationDelay: `${i * 100 + 100}ms` }} />
                </div>
              </div>
            ))}
          </div>

          {/* Builder opportunity card */}
          <div className="p-5 sm:p-6 rounded-2xl bg-stone-50/50 border border-stone-200/30">
            <div className="flex items-center gap-1.5 mb-3">
              <div className="h-3 w-3 rounded bg-stone-200/40 animate-pulse" />
              <div className="h-2 w-32 rounded bg-stone-200/40 animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-full rounded bg-stone-200/25 animate-pulse" style={{ animationDelay: "200ms" }} />
              <div className="h-4 w-3/4 rounded bg-stone-200/20 animate-pulse" style={{ animationDelay: "260ms" }} />
            </div>
          </div>

          {/* Action step card */}
          <div className="p-5 sm:p-6 rounded-2xl bg-amber-50/30 border border-amber-200/20">
            <div className="h-2 w-20 rounded bg-amber-200/40 animate-pulse mb-3" />
            <div className="h-4 w-4/5 rounded bg-amber-200/25 animate-pulse" style={{ animationDelay: "300ms" }} />
          </div>
        </div>

        {/* Sources skeleton */}
        <div className="mb-10 sm:mb-12">
          <div className="h-2 w-16 rounded bg-stone-200/40 animate-pulse mb-3" />
          <div className="space-y-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3.5 rounded-xl bg-white/70 border border-stone-200/40">
                <div className="w-8 h-8 rounded-lg bg-stone-100/60 animate-pulse shrink-0" style={{ animationDelay: `${i * 80}ms` }} />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-32 rounded bg-stone-200/30 animate-pulse" style={{ animationDelay: `${i * 80 + 40}ms` }} />
                  <div className="h-2 w-48 rounded bg-stone-200/20 animate-pulse" style={{ animationDelay: `${i * 80 + 80}ms` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer skeleton */}
        <div className="flex justify-center my-8">
          <div className="w-40 h-4 rounded bg-stone-200/20 animate-pulse" />
        </div>
        <div className="text-center">
          <div className="h-2 w-20 mx-auto rounded bg-stone-200/30 animate-pulse mb-2" />
          <div className="h-3 w-52 mx-auto rounded bg-stone-200/20 animate-pulse mb-6" />
          <div className="flex items-center justify-center gap-3">
            <div className="h-10 w-44 rounded-xl bg-stone-200/30 animate-pulse" />
            <div className="h-10 w-32 rounded-xl bg-stone-200/20 animate-pulse" style={{ animationDelay: "80ms" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
