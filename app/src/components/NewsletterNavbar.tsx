"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, Rss, Mail } from "lucide-react";

const links = [
  { href: "/news", label: "Today" },
  { href: "/news/threads", label: "Threads" },
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
            <li>
              <button
                onClick={() => {
                  setOpen(false);
                  setTimeout(() => {
                    const footer = document.querySelector("footer");
                    const input = footer?.querySelector("input[type='email']") as HTMLInputElement | null;
                    if (input) { input.scrollIntoView({ behavior: "smooth", block: "center" }); setTimeout(() => input.focus(), 400); }
                  }, 300);
                }}
                className="flex items-center gap-2.5 font-[family-name:var(--font-display)] text-4xl tracking-wider text-stone-800 hover:text-[#4F8CFF] transition-colors"
              >
                SUBSCRIBE
              </button>
            </li>
          </ul>
        </div>
      )}

      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
          scrolled
            ? "bg-[#FAFAF8] border-b-2 border-stone-900"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <Link
            href="/news"
            className="flex items-center gap-1 font-[family-name:var(--font-display)] text-xl tracking-widest text-stone-900 hover:text-[#4F8CFF] transition-colors"
          >
            <Image
              src="/assets/img/cube_logo_dark.png"
              alt=""
              width={100}
              height={100}
              className="shrink-0"
            />
            THE DAILY VIBE CODE
          </Link>

          <div className="hidden md:flex items-center gap-5">
            <Link
              href="/news/threads"
              className={`font-[family-name:var(--font-mono)] text-[10px] tracking-[0.2em] uppercase font-bold transition-colors ${
                pathname.startsWith("/news/threads")
                  ? "text-stone-900"
                  : "text-stone-400 hover:text-stone-900"
              }`}
            >
              Threads
            </Link>
            <a
              href="/api/news/rss"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 font-[family-name:var(--font-mono)] text-[10px] tracking-[0.2em] uppercase font-bold text-stone-400 hover:text-orange-500 transition-colors"
            >
              <Rss size={13} />
              RSS
            </a>
            <button
              onClick={() => {
                const footer = document.querySelector("footer");
                const input = footer?.querySelector("input[type='email']") as HTMLInputElement | null;
                if (input) { input.scrollIntoView({ behavior: "smooth", block: "center" }); setTimeout(() => input.focus(), 400); }
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-stone-900 text-white font-[family-name:var(--font-mono)] text-[10px] tracking-[0.15em] uppercase font-bold hover:bg-stone-700 transition-colors cursor-pointer"
            >
              <Mail size={11} />
              Get daily emails
            </button>
          </div>

          <button
            className="md:hidden text-stone-900 transition-colors"
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
