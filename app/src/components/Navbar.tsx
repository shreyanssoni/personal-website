"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/blog", label: "Blog" },
  { href: "/garden", label: "Garden" },
  { href: "/contact", label: "Contact" },
  { href: "/chat", label: "Chat" },
];

// Pages that start with a light/cream background
const LIGHT_PAGES = ["/about"];

function isLightPage(pathname: string) {
  if (LIGHT_PAGES.includes(pathname)) return true;
  // Blog detail pages have cream bg
  if (pathname.startsWith("/blog/") && pathname !== "/blog") return true;
  return false;
}

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const lightTop = isLightPage(pathname);
  // Use dark text on light pages when not scrolled (no dark backdrop yet)
  const useDarkText = lightTop && !scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-midnight/80 backdrop-blur-md border-b border-white/5"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className={`font-display text-2xl tracking-wider transition-colors ${
            useDarkText
              ? "text-text-dark hover:text-accent-coral"
              : "text-text-primary hover:text-accent-electric"
          }`}
        >
          SHREYANS
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`font-mono text-xs tracking-[0.15em] uppercase transition-colors ${
                  pathname === link.href
                    ? "text-accent-electric"
                    : useDarkText
                      ? "text-text-dark/60 hover:text-text-dark"
                      : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Mobile toggle */}
        <button
          className={`md:hidden z-50 transition-colors ${
            useDarkText && !open ? "text-text-dark" : "text-text-primary"
          }`}
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-40 bg-midnight/95 backdrop-blur-lg flex items-center justify-center md:hidden">
          <ul className="flex flex-col items-center gap-8">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`font-display text-4xl tracking-wider transition-colors ${
                    pathname === link.href
                      ? "text-accent-electric"
                      : "text-text-primary hover:text-accent-electric"
                  }`}
                  onClick={() => setOpen(false)}
                >
                  {link.label.toUpperCase()}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
}
