"use client";

import { ArrowLeft } from "lucide-react";

export default function BlogBackButton() {
  return (
    <button
      className="inline-flex items-center gap-2 font-mono text-xs tracking-wider uppercase text-text-dark/40 hover:text-accent-pink transition-colors"
      onClick={() => history.back()}
    >
      <ArrowLeft size={16} />
      Back
    </button>
  );
}
