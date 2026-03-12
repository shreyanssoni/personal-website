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
    <footer className="bg-[#0A0C0F] border-t border-white/[0.05]">
      <div className="mx-auto max-w-2xl px-6 py-16">
        {/* CTA Section */}
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-3xl p-8 sm:p-12 mb-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#8B8FC7]/10 blur-[80px] -mr-20 -mt-20 rounded-full" />
          <div className="relative z-10 text-center">
            <h2 className="font-[family-name:var(--font-display)] text-3xl sm:text-5xl tracking-wider text-white leading-none mb-3">
              STAY IN THE <span className="text-[#8B8FC7] italic">LOOP</span>
            </h2>
            <p className="font-[family-name:var(--font-mono)] text-[10px] tracking-[0.3em] uppercase text-slate-500 font-bold mb-8">
              Daily AI signals · No spam · Just signal
            </p>

            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row max-w-md mx-auto mb-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@visionary.com"
                className="flex-1 bg-white/[0.05] border border-white/[0.1] rounded-full sm:rounded-r-none px-5 py-3 font-[family-name:var(--font-mono)] text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-[#8B8FC7]/40 transition-colors"
              />
              <button
                type="submit"
                className="bg-[#8B8FC7] text-white font-[family-name:var(--font-mono)] text-[10px] font-bold tracking-[0.2em] uppercase px-6 py-3 rounded-full sm:rounded-l-none hover:bg-[#7A7EB8] transition-colors mt-2 sm:mt-0"
              >
                Subscribe
              </button>
            </form>
            <p className="text-[10px] text-slate-600 uppercase tracking-widest font-bold">No Spam. Just Alpha.</p>
          </div>
        </div>

        {message && (
          <p className={`text-center font-[family-name:var(--font-mono)] text-xs mb-6 ${isError ? "text-red-400" : "text-emerald-400"}`}>
            {message}
          </p>
        )}

        <div className="border-t border-white/[0.05] pt-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="https://x.com/abitofsoni" target="_blank" rel="noopener noreferrer" className="text-slate-700 hover:text-[#8B8FC7] transition-colors" aria-label="Twitter">
              <X size={16} />
            </a>
            <a href="/api/news/rss" target="_blank" rel="noopener noreferrer" className="text-slate-700 hover:text-orange-400 transition-colors" aria-label="RSS Feed">
              <Rss size={16} />
            </a>
          </div>
          <div className="text-right">
            <p className="font-[family-name:var(--font-mono)] text-[9px] text-slate-600 tracking-[0.2em] uppercase">
              The Daily Vibe Code
            </p>
            <p className="font-[family-name:var(--font-mono)] text-[9px] text-slate-700 tracking-wider">
              by{" "}
              <a href="https://shreyanssoni.vercel.app" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-[#8B8FC7] transition-colors">
                Shreyans Soni
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
