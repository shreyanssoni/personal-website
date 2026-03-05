"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Github, Linkedin, Mail, Instagram, Twitter } from "lucide-react";

const socials = [
  { href: "https://github.com/shreyanssoni", icon: Github, label: "GitHub" },
  { href: "https://www.linkedin.com/in/shreyans-soni/", icon: Linkedin, label: "LinkedIn" },
  { href: "mailto:soni21.shreyans@gmail.com", icon: Mail, label: "Email" },
  { href: "https://www.instagram.com/geeeksalad/", icon: Instagram, label: "Instagram" },
  { href: "https://x.com/abitofsoni", icon: Twitter, label: "Twitter" },
];

export default function Footer() {
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
        setMessage("Merci beaucoup!");
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
    <footer className="border-t border-white/5 bg-midnight">
      <div className="mx-auto max-w-7xl px-6 py-16">
        {/* Top: CTA + Newsletter */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="font-display text-5xl md:text-6xl text-text-primary leading-none mb-4">
              LET&apos;S CREATE<br />
              SOMETHING <span className="text-accent-electric">REAL.</span>
            </h2>
            <p className="font-body text-text-secondary text-sm max-w-md">
              Whether it&apos;s a project, an idea, or just a conversation &mdash; I&apos;m always open to connecting.
            </p>
          </div>

          <div className="flex flex-col justify-center">
            <span className="font-mono text-xs tracking-[0.2em] uppercase text-text-secondary mb-4">
              {"// "}STAY UPDATED
            </span>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 bg-surface border border-white/10 rounded-lg px-4 py-3 font-mono text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-accent-electric/50 transition-colors"
              />
              <button
                type="submit"
                className="bg-accent-electric text-midnight font-mono text-xs font-semibold tracking-wider uppercase px-6 py-3 rounded-lg hover:bg-accent-electric/90 transition-colors"
              >
                Subscribe
              </button>
            </form>
            {message && (
              <p className={`mt-2 font-mono text-xs ${isError ? "text-accent-coral" : "text-accent-teal"}`}>
                {message}
              </p>
            )}
          </div>
        </div>

        {/* Bottom: Links + Socials */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-8 border-t border-white/5">
          <div className="flex items-center gap-6">
            {socials.map((s) => (
              <a
                key={s.href}
                href={s.href}
                rel="noreferrer"
                target="_blank"
                className="text-text-secondary hover:text-accent-electric transition-colors"
                aria-label={s.label}
              >
                <s.icon size={18} />
              </a>
            ))}
          </div>

          <nav className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2">
            {["Home", "About", "Portfolio", "Blog", "News", "Garden", "Contact", "Chat"].map((label) => (
              <Link
                key={label}
                href={label === "Home" ? "/" : `/${label.toLowerCase()}`}
                className="font-mono text-[10px] tracking-[0.15em] uppercase text-text-secondary hover:text-text-primary transition-colors"
              >
                {label}
              </Link>
            ))}
          </nav>

          <p className="font-mono text-[10px] text-text-secondary/50 tracking-wider">
            &copy; {new Date().getFullYear()} SHREYANS SONI
          </p>
        </div>
      </div>
    </footer>
  );
}
