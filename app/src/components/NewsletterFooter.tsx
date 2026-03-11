"use client";

import { useState, useEffect } from "react";
import { X, Rss } from "lucide-react";

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
        setMessage("You're in! The next issue hits tomorrow.");
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
    <footer className="bg-stone-900 border-t-[3px] border-stone-900">
      <div className="mx-auto max-w-2xl px-6 py-14">
        {/* Masthead-style header */}
        <div className="border-b border-stone-700 pb-6 mb-8 text-center">
          <h2 className="font-[family-name:var(--font-display)] text-4xl sm:text-6xl tracking-widest text-white leading-none mb-3">
            STAY IN THE LOOP
          </h2>
          <p className="font-[family-name:var(--font-mono)] text-[10px] tracking-[0.3em] uppercase text-stone-500 font-bold">
            Daily AI signals · No spam · Just signal
          </p>
        </div>

        <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-0 max-w-md mx-auto mb-6">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="flex-1 bg-stone-800 border border-stone-700 px-4 py-3 font-[family-name:var(--font-mono)] text-sm text-white placeholder:text-stone-600 focus:outline-none focus:border-stone-500 transition-colors"
          />
          <button
            type="submit"
            className="bg-white text-stone-900 font-[family-name:var(--font-mono)] text-[10px] font-bold tracking-[0.2em] uppercase px-6 py-3 hover:bg-stone-100 transition-colors"
          >
            Subscribe
          </button>
        </form>

        {message && (
          <p className={`text-center font-[family-name:var(--font-mono)] text-xs mb-6 ${isError ? "text-red-400" : "text-emerald-400"}`}>
            {message}
          </p>
        )}

        <div className="border-t border-stone-800 pt-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="https://x.com/abitofsoni" target="_blank" rel="noopener noreferrer" className="text-stone-600 hover:text-white transition-colors" aria-label="Twitter">
              <X size={16} />
            </a>
            <a href="/api/news/rss" target="_blank" rel="noopener noreferrer" className="text-stone-600 hover:text-orange-400 transition-colors" aria-label="RSS Feed">
              <Rss size={16} />
            </a>
          </div>
          <div className="text-right">
            <p className="font-[family-name:var(--font-mono)] text-[9px] text-stone-600 tracking-[0.2em] uppercase">
              The Daily Vibe Code
            </p>
            <p className="font-[family-name:var(--font-mono)] text-[9px] text-stone-700 tracking-wider">
              by{" "}
              <a href="https://shreyanssoni.vercel.app" target="_blank" rel="noopener noreferrer" className="text-stone-500 hover:text-white transition-colors">
                Shreyans Soni
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
