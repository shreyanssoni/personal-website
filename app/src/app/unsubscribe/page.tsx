export default function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ done?: string }>;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <h1 className="font-display text-4xl tracking-wider text-text-primary mb-4">
          UNSUBSCRIBED
        </h1>
        <p className="font-body text-sm text-text-secondary/60 mb-6">
          You&apos;ve been removed from The Daily Vibe Code. No more emails from us.
        </p>
        <a
          href="/news"
          className="font-mono text-xs text-text-secondary/40 hover:text-text-primary transition-colors underline underline-offset-4"
        >
          You can still read it on the web &rarr;
        </a>
      </div>
    </div>
  );
}
