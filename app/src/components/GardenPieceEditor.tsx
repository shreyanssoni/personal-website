"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload } from "lucide-react";
import type { GardenPieceType } from "@/lib/garden";

interface GardenPieceData {
  id?: string;
  type: GardenPieceType;
  title: string;
  subtitle: string;
  quote: string;
  description: string;
  content_html: string;
  image_url: string;
  link_url: string;
  label: string;
  display_order: number;
  published: boolean;
}

export type GardenPieceSaveData = Omit<GardenPieceData, "id">;

interface GardenPieceEditorProps {
  initialData?: GardenPieceData;
  onSave: (data: GardenPieceSaveData) => Promise<void>;
}

const TYPE_OPTIONS: { value: GardenPieceType; label: string }[] = [
  { value: "hero", label: "Hero Section" },
  { value: "fragment", label: "Fragment (Poetic Quote)" },
  { value: "featured", label: "Featured Story/Essay" },
  { value: "artifact", label: "Artifact (Visual Piece)" },
];

const FIELD_MAP: Record<GardenPieceType, string[]> = {
  hero: ["title", "subtitle", "quote", "image_url"],
  fragment: ["title", "quote", "label", "display_order"],
  featured: ["title", "subtitle", "description", "image_url", "link_url", "label", "display_order"],
  artifact: ["title", "description", "image_url", "label", "display_order"],
};

async function uploadImage(file: File): Promise<string | null> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
  if (!res.ok) {
    const err = await res.json();
    alert(err.error || "Upload failed");
    return null;
  }
  const { url } = await res.json();
  return url;
}

export default function GardenPieceEditor({ initialData, onSave }: GardenPieceEditorProps) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const [type, setType] = useState<GardenPieceType>(initialData?.type || "fragment");
  const [title, setTitle] = useState(initialData?.title || "");
  const [subtitle, setSubtitle] = useState(initialData?.subtitle || "");
  const [quote, setQuote] = useState(initialData?.quote || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [imageUrl, setImageUrl] = useState(initialData?.image_url || "");
  const [linkUrl, setLinkUrl] = useState(initialData?.link_url || "");
  const [label, setLabel] = useState(initialData?.label || "");
  const [displayOrder, setDisplayOrder] = useState(initialData?.display_order || 0);

  const fields = FIELD_MAP[type];

  function handleSubmit(publish: boolean) {
    if (!title) {
      alert("Title is required");
      return;
    }
    onSave({
      type,
      title,
      subtitle,
      quote,
      description,
      content_html: "",
      image_url: imageUrl,
      link_url: linkUrl,
      label,
      display_order: displayOrder,
      published: publish,
    });
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const url = await uploadImage(file);
    if (url) setImageUrl(url);
    setUploading(false);
    e.target.value = "";
  }

  const inputClass =
    "w-full px-3 py-2 bg-surface border border-white/5 rounded-lg text-text-primary font-body text-sm placeholder:text-text-secondary/30 focus:outline-none focus:border-accent-electric/30 transition-colors";
  const labelClass =
    "font-mono text-[10px] tracking-[0.15em] uppercase text-text-secondary/60 block mb-2";

  return (
    <div className="min-h-screen bg-midnight">
      {/* Header */}
      <div className="border-b border-white/5">
        <div className="max-w-3xl mx-auto px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/admin/dashboard")}
              className="text-text-secondary hover:text-accent-electric transition-colors cursor-pointer"
            >
              <ArrowLeft size={18} />
            </button>
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-text-secondary">
              {initialData?.id ? "Edit Garden Piece" : "New Garden Piece"}
            </span>
          </div>
          <div className="flex items-center gap-3 ml-10 sm:ml-0">
            <button
              onClick={() => handleSubmit(false)}
              className="px-4 sm:px-5 py-2 border border-white/10 rounded-xl font-mono text-[10px] sm:text-xs tracking-[0.1em] uppercase text-text-secondary hover:text-text-primary hover:border-white/20 transition-all cursor-pointer"
            >
              Save Draft
            </button>
            <button
              onClick={() => handleSubmit(true)}
              className="px-4 sm:px-5 py-2 bg-accent-pink/10 border border-accent-pink/30 text-accent-pink rounded-xl font-mono text-[10px] sm:text-xs tracking-[0.1em] uppercase hover:bg-accent-pink/20 hover:border-accent-pink/50 transition-all cursor-pointer"
            >
              {initialData?.published ? "Update" : "Publish"}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        {/* Type selector */}
        <div>
          <label className={labelClass}>Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as GardenPieceType)}
            disabled={!!initialData?.id}
            className={`${inputClass} ${initialData?.id ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Title — always shown */}
        <div>
          <label className={labelClass}>Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={type === "hero" ? "A Walk Through Thought" : "Piece title"}
            className="w-full text-2xl font-serif font-bold text-text-primary bg-transparent border-b border-white/5 focus:border-accent-electric/30 outline-none pb-2 transition-colors placeholder:text-text-secondary/30"
          />
        </div>

        {/* Subtitle */}
        {fields.includes("subtitle") && (
          <div>
            <label className={labelClass}>Subtitle</label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Subtitle or secondary heading"
              className={inputClass}
            />
          </div>
        )}

        {/* Quote */}
        {fields.includes("quote") && (
          <div>
            <label className={labelClass}>Quote / Poetic Text</label>
            <textarea
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              placeholder="Where the wild things grow in the silence between breaths..."
              rows={3}
              className={`${inputClass} resize-y font-serif italic`}
            />
          </div>
        )}

        {/* Description */}
        {fields.includes("description") && (
          <div>
            <label className={labelClass}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Longer description text..."
              rows={4}
              className={`${inputClass} resize-y`}
            />
          </div>
        )}

        {/* Image URL */}
        {fields.includes("image_url") && (
          <div>
            <label className={labelClass}>Image</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="URL or upload"
                className={`flex-1 ${inputClass}`}
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-1.5 px-3 py-2 bg-surface border border-white/5 rounded-lg text-text-secondary hover:text-accent-electric hover:border-accent-electric/30 transition-all cursor-pointer text-xs font-mono"
              >
                <Upload size={12} />
                {uploading ? "..." : "Upload"}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
            {imageUrl && (
              <div className="mt-3 rounded-lg overflow-hidden border border-white/5 max-h-40">
                <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        )}

        {/* Link URL */}
        {fields.includes("link_url") && (
          <div>
            <label className={labelClass}>Link URL</label>
            <input
              type="text"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="/blog/my-essay or https://..."
              className={inputClass}
            />
          </div>
        )}

        {/* Label */}
        {fields.includes("label") && (
          <div>
            <label className={labelClass}>Label</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder={type === "fragment" ? "Fragment #1" : type === "artifact" ? "Artifact #01" : "ESSAY"}
              className={inputClass}
            />
          </div>
        )}

        {/* Display Order */}
        {fields.includes("display_order") && (
          <div>
            <label className={labelClass}>Display Order</label>
            <input
              type="number"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
              min={0}
              className={`${inputClass} w-32`}
            />
            <p className="font-mono text-[10px] text-text-secondary/40 mt-1">
              Lower numbers appear first
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
