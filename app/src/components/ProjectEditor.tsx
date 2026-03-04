"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload } from "lucide-react";

interface ProjectEditorProps {
  initialData?: {
    id?: string;
    title: string;
    description: string;
    image: string;
    codelink: string;
    websitelink: string;
    tags: string[];
    featured: boolean;
    display_order: number;
    published: boolean;
  };
  onSave: (data: {
    title: string;
    description: string;
    image: string;
    codelink: string;
    websitelink: string;
    tags: string[];
    featured: boolean;
    display_order: number;
    published: boolean;
  }) => Promise<void>;
}

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

export default function ProjectEditor({ initialData, onSave }: ProjectEditorProps) {
  const [uploading, setUploading] = useState(false);
  const imageFileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  function handleSubmit(publish: boolean) {
    const titleEl = document.getElementById("project-title") as HTMLInputElement;
    const descEl = document.getElementById("project-description") as HTMLTextAreaElement;
    const imageEl = document.getElementById("project-image") as HTMLInputElement;
    const codeEl = document.getElementById("project-codelink") as HTMLInputElement;
    const webEl = document.getElementById("project-websitelink") as HTMLInputElement;
    const tagsEl = document.getElementById("project-tags") as HTMLInputElement;
    const orderEl = document.getElementById("project-order") as HTMLInputElement;
    const featuredEl = document.getElementById("project-featured") as HTMLInputElement;

    if (!titleEl.value) {
      alert("Title is required");
      return;
    }

    onSave({
      title: titleEl.value,
      description: descEl.value || "",
      image: imageEl.value || "",
      codelink: codeEl.value || "",
      websitelink: webEl.value || "",
      tags: tagsEl.value
        ? tagsEl.value.split(",").map((t) => t.trim())
        : [],
      featured: featuredEl.checked,
      display_order: parseInt(orderEl.value) || 0,
      published: publish,
    });
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const url = await uploadImage(file);
    if (url) {
      const imageEl = document.getElementById("project-image") as HTMLInputElement;
      if (imageEl) imageEl.value = url;
    }
    setUploading(false);
    e.target.value = "";
  }

  const inputClass =
    "w-full px-3 py-2 bg-surface border border-white/5 rounded-lg text-text-primary font-body text-sm placeholder:text-text-secondary/30 focus:outline-none focus:border-accent-electric/30 transition-colors";

  return (
    <div className="min-h-screen bg-midnight">
      {/* Header */}
      <div className="border-b border-white/5">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/admin/dashboard")}
              className="text-text-secondary hover:text-accent-electric transition-colors cursor-pointer"
            >
              <ArrowLeft size={18} />
            </button>
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-text-secondary">
              {initialData?.id ? "Edit Project" : "New Project"}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleSubmit(false)}
              className="px-5 py-2 border border-white/10 rounded-xl font-mono text-xs tracking-[0.1em] uppercase text-text-secondary hover:text-text-primary hover:border-white/20 transition-all cursor-pointer"
            >
              Save Draft
            </button>
            <button
              onClick={() => handleSubmit(true)}
              className="px-5 py-2 bg-accent-orange/10 border border-accent-orange/30 text-accent-orange rounded-xl font-mono text-xs tracking-[0.1em] uppercase hover:bg-accent-orange/20 hover:border-accent-orange/50 transition-all cursor-pointer"
            >
              {initialData?.published ? "Update" : "Publish"}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Title */}
        <input
          id="project-title"
          type="text"
          placeholder="Project title"
          defaultValue={initialData?.title || ""}
          className="w-full text-3xl font-serif font-bold text-text-primary bg-transparent border-none outline-none placeholder:text-text-secondary/30 mb-6"
        />

        {/* Description */}
        <div className="mb-6">
          <label className="font-mono text-[10px] tracking-[0.15em] uppercase text-text-secondary/60 block mb-2">
            Description
          </label>
          <textarea
            id="project-description"
            placeholder="Brief description of the project..."
            defaultValue={initialData?.description || ""}
            rows={3}
            className={`${inputClass} resize-y`}
          />
        </div>

        {/* Image */}
        <div className="mb-6">
          <label className="font-mono text-[10px] tracking-[0.15em] uppercase text-text-secondary/60 block mb-2">
            Cover Image
          </label>
          <div className="flex gap-2">
            <input
              id="project-image"
              type="text"
              placeholder="URL or upload"
              defaultValue={initialData?.image || ""}
              className={`flex-1 ${inputClass}`}
            />
            <button
              type="button"
              onClick={() => imageFileRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-1.5 px-3 py-2 bg-surface border border-white/5 rounded-lg text-text-secondary hover:text-accent-electric hover:border-accent-electric/30 transition-all cursor-pointer text-xs font-mono"
            >
              <Upload size={12} />
              {uploading ? "..." : "Upload"}
            </button>
            <input
              ref={imageFileRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
        </div>

        {/* Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="font-mono text-[10px] tracking-[0.15em] uppercase text-text-secondary/60 block mb-2">
              GitHub Link
            </label>
            <input
              id="project-codelink"
              type="text"
              placeholder="https://github.com/..."
              defaultValue={initialData?.codelink || ""}
              className={inputClass}
            />
          </div>
          <div>
            <label className="font-mono text-[10px] tracking-[0.15em] uppercase text-text-secondary/60 block mb-2">
              Website Link
            </label>
            <input
              id="project-websitelink"
              type="text"
              placeholder="https://..."
              defaultValue={initialData?.websitelink || ""}
              className={inputClass}
            />
          </div>
        </div>

        {/* Tags + Order + Featured */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="font-mono text-[10px] tracking-[0.15em] uppercase text-text-secondary/60 block mb-2">
              Tags
            </label>
            <input
              id="project-tags"
              type="text"
              placeholder="react, node, ai"
              defaultValue={initialData?.tags?.join(", ") || ""}
              className={inputClass}
            />
          </div>
          <div>
            <label className="font-mono text-[10px] tracking-[0.15em] uppercase text-text-secondary/60 block mb-2">
              Display Order
            </label>
            <input
              id="project-order"
              type="number"
              placeholder="0"
              defaultValue={initialData?.display_order ?? 0}
              className={inputClass}
            />
          </div>
          <div className="flex items-end pb-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                id="project-featured"
                type="checkbox"
                defaultChecked={initialData?.featured || false}
                className="w-4 h-4 rounded border-white/10 bg-surface text-accent-orange focus:ring-accent-orange/30 cursor-pointer"
              />
              <span className="font-mono text-xs tracking-[0.1em] uppercase text-text-secondary">
                Featured
              </span>
            </label>
          </div>
        </div>

        {uploading && (
          <div className="flex items-center gap-2 px-4 py-2.5 bg-accent-sunny/5 border border-accent-sunny/20 rounded-xl">
            <div className="w-3 h-3 border-2 border-accent-sunny/30 border-t-accent-sunny rounded-full animate-spin" />
            <span className="font-mono text-xs text-accent-sunny">Uploading image...</span>
          </div>
        )}
      </div>
    </div>
  );
}
