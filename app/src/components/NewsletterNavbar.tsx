"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, Rss, Mail } from "lucide-react";

const links = [
  { href: "/news", label: "Today" },
  { href: "/api/news/rss", label: "RSS", external: true },
];

export default function NewsletterNavbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const isLight = pathname.startsWith("/news");
  const useDarkText = isLight && !scrolled;

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-50 bg-[#FAFAF8] flex items-center justify-center md:hidden">
          <button
            className="absolute top-4 right-6 text-stone-800 z-50"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
          <ul className="flex flex-col items-center gap-8">
            {links.map((link) => (
              <li key={link.href}>
                {link.external ? (
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-[family-name:var(--font-display)] text-4xl tracking-wider text-stone-800 hover:text-[#4F8CFF] transition-colors"
                    onClick={() => setOpen(false)}
                  >
                    {link.label.toUpperCase()}
                  </a>
                ) : (
                  <Link
                    href={link.href}
                    className={`font-[family-name:var(--font-display)] text-4xl tracking-wider transition-colors ${
                      pathname === link.href ? "text-[#4F8CFF]" : "text-stone-800 hover:text-[#4F8CFF]"
                    }`}
                    onClick={() => setOpen(false)}
                  >
                    {link.label.toUpperCase()}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/80 backdrop-blur-md border-b border-stone-200/30 shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link
            href="/news"
            className={`font-[family-name:var(--font-display)] text-2xl tracking-wider transition-colors ${
              useDarkText || scrolled
                ? "text-stone-800 hover:text-[#4F8CFF]"
                : "text-stone-800 hover:text-[#4F8CFF]"
            }`}
          >
            THE DAILY VIBE CODE
          </Link>

          <div className="hidden md:flex items-center gap-5">
            <a
              href="/api/news/rss"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 font-[family-name:var(--font-mono)] text-xs tracking-[0.15em] uppercase text-stone-400 hover:text-orange-500 transition-colors"
            >
              <Rss size={14} />
              RSS
            </a>
            <button
              onClick={() => {
                const footer = document.querySelector("footer");
                const input = footer?.querySelector("input[type='email']") as HTMLInputElement | null;
                if (input) { input.scrollIntoView({ behavior: "smooth", block: "center" }); setTimeout(() => input.focus(), 400); }
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-stone-800 text-white font-[family-name:var(--font-mono)] text-[10px] tracking-[0.12em] uppercase hover:bg-stone-700 transition-colors cursor-pointer"
            >
              <Mail size={12} />
              Get daily emails
            </button>
          </div>

          <button
            className={`md:hidden transition-colors ${useDarkText || scrolled ? "text-stone-800" : "text-stone-800"}`}
            onClick={() => setOpen(!open)}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>
    </>
  );
}
