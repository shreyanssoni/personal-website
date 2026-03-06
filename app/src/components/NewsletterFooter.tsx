"use client";

import { useState, useEffect } from "react";
import { Twitter, Rss } from "lucide-react";

export default function NewsletterFooter() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(true);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(""), 5000);
    return () => clearTimeout(timer);
  }, [message]);

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email) {
      setMessage("Please enter a valid email");
      setIsError(true);
      return;
    }
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setEmail("");
        setIsError(false);
        setMessage("You're in! First issue hits tomorrow.");
      } else {
        setIsError(true);
        setMessage("Something went wrong. Try again!");
      }
    } catch {
      setIsError(true);
      setMessage("Network error. Try again!");
    }
  }

  return (
    <footer className="bg-[#FAFAF8] border-t border-stone-200/40">
      <div className="mx-auto max-w-2xl px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl tracking-wider text-stone-800 mb-3">
            STAY IN THE LOOP
          </h2>
          <p className="font-[family-name:var(--font-soft)] text-sm text-stone-400">
            Daily AI signals delivered to your inbox. No spam, just signal.
          </p>
        </div>

        <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto mb-8">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="flex-1 bg-white border border-stone-200 rounded-xl px-4 py-3 font-[family-name:var(--font-mono)] text-sm text-stone-700 placeholder:text-stone-300 focus:outline-none focus:border-[#4F8CFF]/50 transition-colors"
          />
          <button
            type="submit"
            className="bg-stone-800 text-white font-[family-name:var(--font-mono)] text-xs font-semibold tracking-wider uppercase px-6 py-3 rounded-xl hover:bg-stone-700 transition-colors"
          >
            Subscribe
          </button>
        </form>
        {message && (
          <p className={`text-center font-[family-name:var(--font-mono)] text-xs mb-6 ${isError ? "text-red-500" : "text-emerald-600"}`}>
            {message}
          </p>
        )}

        <div className="flex items-center justify-center gap-6 mb-8">
          <a
            href="https://x.com/abitofsoni"
            target="_blank"
            rel="noopener noreferrer"
            className="text-stone-300 hover:text-stone-600 transition-colors"
            aria-label="Twitter"
          >
            <Twitter size={18} />
          </a>
          <a
            href="/api/news/rss"
            target="_blank"
            rel="noopener noreferrer"
            className="text-stone-300 hover:text-orange-500 transition-colors"
            aria-label="RSS Feed"
          >
            <Rss size={18} />
          </a>
        </div>

        <div className="text-center space-y-1.5">
          <p className="font-[family-name:var(--font-mono)] text-[10px] text-stone-300 tracking-wider">
            The Daily Vibe Code &middot; Curated AI intelligence for builders
          </p>
          <p className="font-[family-name:var(--font-mono)] text-[10px] text-stone-300/60 tracking-wider">
            by{" "}
            <a
              href="https://shreyanssoni.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-stone-400/80 hover:text-[#4F8CFF] transition-colors underline underline-offset-2 decoration-stone-200/50"
            >
              Shreyans Soni
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
