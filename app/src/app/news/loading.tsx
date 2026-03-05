export default function NewsLoading() {
  return (
    <div className="news-page min-h-screen pt-20 sm:pt-28 pb-16 sm:pb-24 relative">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -top-20 -right-20 w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-gradient-to-br from-rose-200/20 to-amber-100/20 blur-3xl" />
        <div className="absolute top-1/4 -left-32 w-56 h-56 sm:w-72 sm:h-72 rounded-full bg-gradient-to-br from-sky-200/15 to-indigo-100/15 blur-3xl" />
      </div>

      <div className="mx-auto max-w-2xl px-4 sm:px-6 relative">
        {/* Archive nav skeleton */}
        <div className="flex items-center gap-1.5 mb-10 overflow-hidden">
          <div className="h-3 w-12 rounded bg-stone-200/50 animate-pulse shrink-0" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-8 w-16 rounded-full bg-stone-200/40 animate-pulse shrink-0" style={{ animationDelay: `${i * 80}ms` }} />
          ))}
        </div>

        {/* Search skeleton */}
        <div className="flex justify-center mb-6 sm:mb-8">
          <div className="h-10 w-48 rounded-2xl bg-white/70 border border-stone-200/50 animate-pulse" />
        </div>

        {/* Masthead skeleton */}
        <div className="text-center mb-10 sm:mb-12">
          {/* Desk illustration placeholder */}
          <div className="w-40 sm:w-52 h-20 mx-auto mb-4 sm:mb-6 rounded-xl bg-stone-100/40 animate-pulse" />

          <div className="h-2 w-24 mx-auto rounded bg-stone-200/30 animate-pulse mb-5" />

          <div className="garden-divider mb-5"><span className="text-stone-200/30 text-xs px-2">✦</span></div>

          {/* Title */}
          <div className="flex flex-col items-center gap-2 mb-4">
            <div className="h-10 sm:h-16 w-4/5 rounded-lg bg-stone-200/40 animate-pulse" />
          </div>

          {/* Subtitle */}
          <div className="h-3 w-64 mx-auto rounded bg-stone-200/30 animate-pulse mb-5" />

          <div className="garden-divider mb-5"><span className="text-stone-200/30 text-xs px-2">✦</span></div>

          {/* Date + signal count */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-4 w-40 rounded bg-stone-200/30 animate-pulse" />
            <div className="w-1 h-1 rounded-full bg-stone-200/40" />
            <div className="h-3 w-24 rounded bg-stone-200/30 animate-pulse" />
          </div>

          {/* Intro quote */}
          <div className="max-w-lg mx-auto px-6">
            <div className="h-4 w-full rounded bg-stone-200/20 animate-pulse mb-2" />
            <div className="h-4 w-3/4 mx-auto rounded bg-stone-200/20 animate-pulse" />
          </div>
        </div>

        {/* Quick Scan skeleton */}
        <div className="mb-14 sm:mb-16">
          <div className="flex items-center gap-2 mb-5">
            <div className="h-4 w-4 rounded bg-stone-200/40 animate-pulse" />
            <div className="h-2.5 w-36 rounded bg-stone-200/40 animate-pulse" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-white/60 bg-gradient-to-br from-stone-50 to-white/50 p-4 sm:p-5"
                style={{ animationDelay: `${i * 120}ms` }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-3 w-3 rounded bg-stone-200/50 animate-pulse" />
                  <div className="h-2 w-20 rounded bg-stone-200/40 animate-pulse" />
                </div>
                <div className="space-y-2">
                  <div className="h-3.5 w-full rounded bg-stone-200/30 animate-pulse" />
                  <div className="h-3.5 w-4/5 rounded bg-stone-200/20 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Insight skeleton */}
        <div className="mb-14 sm:mb-16">
          <div className="signal-card p-5 sm:p-6 md:p-8 border-l-[3px] border-l-blue-200/40">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-4 w-4 rounded bg-blue-100 animate-pulse" />
              <div className="h-2 w-40 rounded bg-blue-100/60 animate-pulse" />
            </div>
            <div className="space-y-3">
              <div className="h-5 w-full rounded bg-stone-200/30 animate-pulse" />
              <div className="h-5 w-5/6 rounded bg-stone-200/20 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Signal cards skeleton */}
        <div className="mb-14 sm:mb-16">
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="h-8 w-44 rounded-full bg-white/60 border border-stone-200/40 animate-pulse" />
          </div>

          <div className="space-y-4 sm:space-y-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="signal-card p-4 sm:p-5 md:p-6"
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  {/* Icon */}
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-stone-100/60 animate-pulse shrink-0" style={{ animationDelay: `${i * 100}ms` }} />

                  <div className="flex-1 min-w-0">
                    {/* Tags */}
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-5 w-16 rounded-md bg-stone-100/60 animate-pulse" style={{ animationDelay: `${i * 100 + 50}ms` }} />
                      <div className="h-5 w-12 rounded-md bg-stone-100/40 animate-pulse" style={{ animationDelay: `${i * 100 + 100}ms` }} />
                    </div>

                    {/* Title */}
                    <div className="h-4 w-4/5 rounded bg-stone-200/40 animate-pulse mb-2" style={{ animationDelay: `${i * 100 + 150}ms` }} />

                    {/* Description */}
                    <div className="h-3 w-full rounded bg-stone-200/25 animate-pulse mb-1" style={{ animationDelay: `${i * 100 + 200}ms` }} />
                    <div className="h-3 w-3/5 rounded bg-stone-200/20 animate-pulse" style={{ animationDelay: `${i * 100 + 250}ms` }} />
                  </div>

                  {/* Impact meter */}
                  <div className="hidden sm:flex flex-col items-end gap-3 shrink-0">
                    <div className="flex gap-[3px]">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <div key={j} className="w-[14px] h-[6px] rounded-[2px] bg-stone-200/40 animate-pulse" style={{ animationDelay: `${i * 100 + j * 60}ms` }} />
                      ))}
                    </div>
                    <div className="w-4 h-4 rounded bg-stone-200/30 animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
