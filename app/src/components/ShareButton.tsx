"use client";

import { useState, useRef, useEffect } from "react";
import { Share2, Link2, Check, X, Download, Image as ImageIcon } from "lucide-react";

interface ShareButtonProps {
  signalId: number;
  title: string;
  compact?: boolean;
  dropUp?: boolean;
}

const PLATFORMS = [
  {
    key: "copy" as const,
    label: "Copy link",
    icon: Link2,
    color: "hover:bg-stone-100 hover:text-stone-700",
  },
  {
    key: "twitter" as const,
    label: "Twitter / X",
    icon: ({ size, className }: { size: number; className?: string }) => (
      <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    color: "hover:bg-stone-900 hover:text-white",
    getUrl: (url: string, text: string) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
  },
  {
    key: "whatsapp" as const,
    label: "WhatsApp",
    icon: ({ size, className }: { size: number; className?: string }) => (
      <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    ),
    color: "hover:bg-[#25D366] hover:text-white",
    getUrl: (url: string, text: string) =>
      `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`,
  },
  {
    key: "linkedin" as const,
    label: "LinkedIn",
    icon: ({ size, className }: { size: number; className?: string }) => (
      <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
    color: "hover:bg-[#0A66C2] hover:text-white",
    getUrl: (url: string) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
];

/** Fetch the OG image and return as a shareable File */
async function fetchOgImage(ogUrl: string, name: string): Promise<File | null> {
  try {
    const res = await fetch(ogUrl);
    if (!res.ok) return null;
    const blob = await res.blob();
    const safeName = name.replace(/[^a-zA-Z0-9]/g, "-").slice(0, 40);
    return new File([blob], `${safeName}.png`, { type: "image/png" });
  } catch {
    return null;
  }
}

export default function ShareButton({ signalId, title, compact, dropUp }: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== "undefined" ? window.location.origin : "")).replace(/\/+$/, "");
  const shareUrl = `${siteUrl}/news/signal/${signalId}`;
  const ogImageUrl = `${siteUrl}/api/og/signal/${signalId}`;
  const shareText = `${title} — The Daily Signal`;

  // Toggle share-open class on nearest signal-card for z-index stacking
  useEffect(() => {
    const card = menuRef.current?.closest(".signal-card");
    if (open) card?.classList.add("share-open");
    else card?.classList.remove("share-open");
    return () => { card?.classList.remove("share-open"); };
  }, [open]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  function trackShare(platform: string) {
    fetch("/api/share/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ signal_id: signalId, platform }),
    }).catch(() => {});
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      const input = document.createElement("input");
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
    }
    setCopied(true);
    trackShare("copy");
    setTimeout(() => setCopied(false), 2000);
  }

  /** Share with image via native share sheet (mobile) */
  async function handleNativeShareWithImage() {
    setBusy(true);
    try {
      const file = await fetchOgImage(ogImageUrl, title);
      if (file && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: title,
          text: `${shareText}\n${shareUrl}`,
        });
        trackShare("native_image");
        setOpen(false);
        return true;
      }
      // File sharing not supported — share URL only via native sheet
      await navigator.share({ title, text: shareText, url: shareUrl });
      trackShare("native");
      setOpen(false);
      return true;
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") return true;
      return false;
    } finally {
      setBusy(false);
    }
  }

  /** Download image to device */
  async function handleDownloadImage() {
    setBusy(true);
    try {
      const res = await fetch(ogImageUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `signal-${signalId}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      trackShare("download");
    } catch { /* silent */ } finally {
      setBusy(false);
    }
  }

  /** Desktop: open platform URL in popup */
  function handlePlatformUrl(platform: typeof PLATFORMS[number]) {
    if (platform.key === "copy") { handleCopy(); return; }
    trackShare(platform.key);
    const url = platform.getUrl?.(shareUrl, shareText);
    if (url) window.open(url, "_blank", "noopener,noreferrer,width=600,height=500");
    setOpen(false);
  }

  /** Primary share button click */
  async function handleButtonClick(e: React.MouseEvent) {
    e.stopPropagation();
    setOpen(!open);
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={handleButtonClick}
        disabled={busy}
        className={`inline-flex items-center gap-1.5 transition-all cursor-pointer ${
          compact
            ? "p-1.5 rounded-lg text-stone-300 hover:text-stone-500 hover:bg-stone-100"
            : "px-2.5 py-1.5 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-50 border border-transparent hover:border-stone-200"
        } ${busy ? "opacity-50" : ""}`}
        title="Share this signal"
      >
        <Share2 size={compact ? 13 : 14} className={busy ? "animate-pulse" : ""} />
        {!compact && (
          <span className="font-[family-name:var(--font-mono)] text-[9px] tracking-wider uppercase font-medium">
            {busy ? "..." : "Share"}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className={`absolute right-0 z-50 w-52 py-1.5 rounded-xl bg-white border border-stone-200/80 shadow-xl shadow-stone-200/30 ${
            dropUp ? "bottom-full mb-2" : "top-full mt-2"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-3 py-1.5 mb-1">
            <span className="font-[family-name:var(--font-mono)] text-[8px] tracking-[0.2em] uppercase text-stone-400 font-bold">
              Share signal
            </span>
            <button
              onClick={() => setOpen(false)}
              className="text-stone-300 hover:text-stone-500 transition-colors"
            >
              <X size={12} />
            </button>
          </div>

          {/* Share with image — primary action on mobile */}
          {typeof navigator !== "undefined" && !!navigator.share && (
            <button
              onClick={handleNativeShareWithImage}
              disabled={busy}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-all bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-700 border-b border-stone-100"
            >
              <ImageIcon size={15} className={busy ? "animate-pulse" : ""} />
              <div className="flex flex-col">
                <span className="font-[family-name:var(--font-soft)] text-[13px] font-semibold">
                  {busy ? "Loading image..." : "Share with image"}
                </span>
                <span className="font-[family-name:var(--font-mono)] text-[8px] text-blue-500 tracking-wider">
                  Opens native share
                </span>
              </div>
            </button>
          )}

          {/* Save / download image */}
          <button
            onClick={handleDownloadImage}
            disabled={busy}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-stone-600 transition-all hover:bg-stone-50 hover:text-stone-700"
          >
            <Download size={14} className={busy ? "animate-pulse" : ""} />
            <span className="font-[family-name:var(--font-soft)] text-[13px]">
              {busy ? "Downloading..." : "Save image"}
            </span>
          </button>

          <div className="h-px bg-stone-100 my-1" />

          {/* Platform links */}
          {PLATFORMS.map((platform) => (
            <button
              key={platform.key}
              onClick={() => handlePlatformUrl(platform)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-stone-600 transition-all ${platform.color}`}
            >
              {platform.key === "copy" && copied ? (
                <>
                  <Check size={14} className="text-emerald-500" />
                  <span className="font-[family-name:var(--font-soft)] text-[13px] text-emerald-600">Copied!</span>
                </>
              ) : (
                <>
                  <platform.icon size={14} className="" />
                  <span className="font-[family-name:var(--font-soft)] text-[13px]">{platform.label}</span>
                </>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
