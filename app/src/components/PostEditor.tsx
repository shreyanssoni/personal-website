"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  ImageIcon,
  LinkIcon,
  Undo,
  Redo,
  Minus,
  Upload,
  ArrowLeft,
} from "lucide-react";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

interface PostEditorProps {
  initialData?: {
    id?: string;
    title: string;
    slug: string;
    content_html: string;
    excerpt: string;
    feature_image: string;
    tags: string[];
    published: boolean;
  };
  onSave: (data: {
    title: string;
    slug: string;
    content_html: string;
    excerpt: string;
    feature_image: string;
    tags: string[];
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

export default function PostEditor({ initialData, onSave }: PostEditorProps) {
  const [uploading, setUploading] = useState(false);
  const inlineFileRef = useRef<HTMLInputElement>(null);
  const featureFileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Image,
      Link.configure({ openOnClick: false }),
    ],
    content: initialData?.content_html || "<p>Start writing...</p>",
    editorProps: {
      attributes: {
        class: "prose prose-invert prose-sm max-w-none focus:outline-none min-h-[400px] px-5 py-4",
      },
    },
  });

  function handleSubmit(publish: boolean) {
    const titleEl = document.getElementById("post-title") as HTMLInputElement;
    const slugEl = document.getElementById("post-slug") as HTMLInputElement;
    const excerptEl = document.getElementById("post-excerpt") as HTMLTextAreaElement;
    const imageEl = document.getElementById("post-image") as HTMLInputElement;
    const tagsEl = document.getElementById("post-tags") as HTMLInputElement;

    if (!titleEl.value) {
      alert("Title is required");
      return;
    }

    onSave({
      title: titleEl.value,
      slug: slugEl.value || slugify(titleEl.value),
      content_html: editor?.getHTML() || "",
      excerpt: excerptEl.value,
      feature_image: imageEl.value,
      tags: tagsEl.value
        ? tagsEl.value.split(",").map((t) => t.trim())
        : [],
      published: publish,
    });
  }

  function addImage() {
    inlineFileRef.current?.click();
  }

  async function handleInlineImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    setUploading(true);
    const url = await uploadImage(file);
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
    setUploading(false);
    e.target.value = "";
  }

  async function handleFeatureImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const url = await uploadImage(file);
    if (url) {
      const imageEl = document.getElementById("post-image") as HTMLInputElement;
      if (imageEl) imageEl.value = url;
    }
    setUploading(false);
    e.target.value = "";
  }

  function addLink() {
    const url = prompt("Link URL:");
    if (url && editor) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  }

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const slugEl = document.getElementById("post-slug") as HTMLInputElement;
    if (slugEl && !initialData?.id) {
      slugEl.value = slugify(e.target.value);
    }
  }

  const toolbarBtn =
    "p-2 rounded-lg border border-white/5 hover:border-white/15 hover:bg-white/5 text-text-secondary hover:text-text-primary transition-all cursor-pointer";

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
              {initialData?.id ? "Edit Post" : "New Post"}
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
              className="px-5 py-2 bg-accent-pink/10 border border-accent-pink/30 text-accent-pink rounded-xl font-mono text-xs tracking-[0.1em] uppercase hover:bg-accent-pink/20 hover:border-accent-pink/50 transition-all cursor-pointer"
            >
              {initialData?.published ? "Update" : "Publish"}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Title */}
        <input
          id="post-title"
          type="text"
          placeholder="Post title"
          defaultValue={initialData?.title || ""}
          onChange={handleTitleChange}
          className="w-full text-3xl font-serif font-bold text-text-primary bg-transparent border-none outline-none placeholder:text-text-secondary/30 mb-3"
        />

        {/* Slug */}
        <div className="flex items-center gap-2 mb-8">
          <span className="font-mono text-xs text-text-secondary/50">/blog/</span>
          <input
            id="post-slug"
            type="text"
            placeholder="post-slug"
            defaultValue={initialData?.slug || ""}
            className="font-mono text-xs text-text-secondary bg-transparent border-b border-white/5 focus:border-accent-electric/30 outline-none py-1 flex-1 transition-colors"
          />
        </div>

        {/* Meta fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="font-mono text-[10px] tracking-[0.15em] uppercase text-text-secondary/60 block mb-2">
              Feature Image
            </label>
            <div className="flex gap-2">
              <input
                id="post-image"
                type="text"
                placeholder="URL or upload"
                defaultValue={initialData?.feature_image || ""}
                className="flex-1 px-3 py-2 bg-surface border border-white/5 rounded-lg text-text-primary font-body text-sm placeholder:text-text-secondary/30 focus:outline-none focus:border-accent-electric/30 transition-colors"
              />
              <button
                type="button"
                onClick={() => featureFileRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-1.5 px-3 py-2 bg-surface border border-white/5 rounded-lg text-text-secondary hover:text-accent-electric hover:border-accent-electric/30 transition-all cursor-pointer text-xs font-mono"
              >
                <Upload size={12} />
                {uploading ? "..." : "Upload"}
              </button>
              <input
                ref={featureFileRef}
                type="file"
                accept="image/*"
                onChange={handleFeatureImageUpload}
                className="hidden"
              />
            </div>
          </div>
          <div>
            <label className="font-mono text-[10px] tracking-[0.15em] uppercase text-text-secondary/60 block mb-2">
              Tags
            </label>
            <input
              id="post-tags"
              type="text"
              placeholder="tech, ai, web"
              defaultValue={initialData?.tags?.join(", ") || ""}
              className="w-full px-3 py-2 bg-surface border border-white/5 rounded-lg text-text-primary font-body text-sm placeholder:text-text-secondary/30 focus:outline-none focus:border-accent-electric/30 transition-colors"
            />
          </div>
        </div>

        <div className="mb-8">
          <label className="font-mono text-[10px] tracking-[0.15em] uppercase text-text-secondary/60 block mb-2">
            Excerpt
          </label>
          <textarea
            id="post-excerpt"
            placeholder="Brief description for SEO and previews..."
            defaultValue={initialData?.excerpt || ""}
            rows={2}
            className="w-full px-3 py-2 bg-surface border border-white/5 rounded-lg text-text-primary font-body text-sm placeholder:text-text-secondary/30 focus:outline-none focus:border-accent-electric/30 resize-y transition-colors"
          />
        </div>

        {/* Hidden file input for inline images */}
        <input
          ref={inlineFileRef}
          type="file"
          accept="image/*"
          onChange={handleInlineImageUpload}
          className="hidden"
        />

        {uploading && (
          <div className="flex items-center gap-2 px-4 py-2.5 bg-accent-sunny/5 border border-accent-sunny/20 rounded-xl mb-3">
            <div className="w-3 h-3 border-2 border-accent-sunny/30 border-t-accent-sunny rounded-full animate-spin" />
            <span className="font-mono text-xs text-accent-sunny">Uploading image...</span>
          </div>
        )}

        {/* Toolbar */}
        <div className="flex gap-1 flex-wrap p-2 glass-card rounded-t-xl border-b-0">
          <button className={toolbarBtn} onClick={() => editor?.chain().focus().toggleBold().run()} title="Bold">
            <Bold size={14} />
          </button>
          <button className={toolbarBtn} onClick={() => editor?.chain().focus().toggleItalic().run()} title="Italic">
            <Italic size={14} />
          </button>

          <div className="w-px bg-white/5 mx-1" />

          <button className={toolbarBtn} onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()} title="H1">
            <Heading1 size={14} />
          </button>
          <button className={toolbarBtn} onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} title="H2">
            <Heading2 size={14} />
          </button>
          <button className={toolbarBtn} onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} title="H3">
            <Heading3 size={14} />
          </button>

          <div className="w-px bg-white/5 mx-1" />

          <button className={toolbarBtn} onClick={() => editor?.chain().focus().toggleBulletList().run()} title="Bullet List">
            <List size={14} />
          </button>
          <button className={toolbarBtn} onClick={() => editor?.chain().focus().toggleOrderedList().run()} title="Ordered List">
            <ListOrdered size={14} />
          </button>
          <button className={toolbarBtn} onClick={() => editor?.chain().focus().toggleBlockquote().run()} title="Quote">
            <Quote size={14} />
          </button>
          <button className={toolbarBtn} onClick={() => editor?.chain().focus().toggleCodeBlock().run()} title="Code Block">
            <Code size={14} />
          </button>

          <div className="w-px bg-white/5 mx-1" />

          <button className={toolbarBtn} onClick={() => editor?.chain().focus().setHorizontalRule().run()} title="Divider">
            <Minus size={14} />
          </button>
          <button className={toolbarBtn} onClick={addImage} title="Upload Image">
            <ImageIcon size={14} />
          </button>
          <button className={toolbarBtn} onClick={addLink} title="Link">
            <LinkIcon size={14} />
          </button>

          <div className="w-px bg-white/5 mx-1" />

          <button className={toolbarBtn} onClick={() => editor?.chain().focus().undo().run()} title="Undo">
            <Undo size={14} />
          </button>
          <button className={toolbarBtn} onClick={() => editor?.chain().focus().redo().run()} title="Redo">
            <Redo size={14} />
          </button>
        </div>

        {/* Editor */}
        <div className="glass-card rounded-t-none rounded-b-xl border-t-0 min-h-[400px] [&_.tiptap]:min-h-[400px] [&_.tiptap]:outline-none [&_.tiptap]:px-5 [&_.tiptap]:py-4 [&_.tiptap]:font-body [&_.tiptap]:text-sm [&_.tiptap]:text-text-primary [&_.tiptap]:leading-relaxed [&_.tiptap_h1]:font-serif [&_.tiptap_h1]:text-2xl [&_.tiptap_h1]:font-bold [&_.tiptap_h1]:mb-4 [&_.tiptap_h2]:font-serif [&_.tiptap_h2]:text-xl [&_.tiptap_h2]:font-bold [&_.tiptap_h2]:mb-3 [&_.tiptap_h3]:font-serif [&_.tiptap_h3]:text-lg [&_.tiptap_h3]:font-bold [&_.tiptap_h3]:mb-2 [&_.tiptap_p]:mb-3 [&_.tiptap_blockquote]:border-l-2 [&_.tiptap_blockquote]:border-accent-electric/30 [&_.tiptap_blockquote]:pl-4 [&_.tiptap_blockquote]:italic [&_.tiptap_blockquote]:text-text-secondary [&_.tiptap_code]:bg-surface [&_.tiptap_code]:px-1.5 [&_.tiptap_code]:py-0.5 [&_.tiptap_code]:rounded [&_.tiptap_code]:font-mono [&_.tiptap_code]:text-accent-electric [&_.tiptap_code]:text-xs [&_.tiptap_pre]:bg-surface [&_.tiptap_pre]:rounded-xl [&_.tiptap_pre]:p-4 [&_.tiptap_pre]:font-mono [&_.tiptap_pre]:text-xs [&_.tiptap_img]:rounded-xl [&_.tiptap_img]:max-w-full [&_.tiptap_a]:text-accent-pink [&_.tiptap_a]:underline [&_.tiptap_hr]:border-white/5 [&_.tiptap_ul]:list-disc [&_.tiptap_ul]:pl-6 [&_.tiptap_ol]:list-decimal [&_.tiptap_ol]:pl-6 [&_.tiptap_li]:mb-1 [&_.tiptap_.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.tiptap_.is-editor-empty:first-child::before]:text-text-secondary/30 [&_.tiptap_.is-editor-empty:first-child::before]:float-left [&_.tiptap_.is-editor-empty:first-child::before]:h-0 [&_.tiptap_.is-editor-empty:first-child::before]:pointer-events-none">
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
}
