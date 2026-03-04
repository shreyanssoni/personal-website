"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
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

export default function PostEditor({ initialData, onSave }: PostEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({ openOnClick: false }),
    ],
    content: initialData?.content_html || "<p>Start writing...</p>",
    editorProps: {
      attributes: {
        style:
          "min-height: 400px; outline: none; padding: 16px; font-family: var(--font-nunito); font-size: 16px; line-height: 1.7;",
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
    const url = prompt("Image URL:");
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
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

  const btnStyle = {
    background: "none",
    border: "1px solid #ddd",
    borderRadius: "4px",
    padding: "4px 6px",
    cursor: "pointer",
    display: "flex" as const,
    alignItems: "center" as const,
  };

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "20px 16px" }}>
      {/* Title */}
      <input
        id="post-title"
        type="text"
        placeholder="Post title"
        defaultValue={initialData?.title || ""}
        onChange={handleTitleChange}
        style={{
          width: "100%",
          fontSize: "28px",
          fontWeight: "bold",
          border: "none",
          outline: "none",
          marginBottom: "8px",
          fontFamily: "var(--font-josefin)",
          boxSizing: "border-box",
        }}
      />

      {/* Slug */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
        <span style={{ fontSize: "14px", color: "#888" }}>/blog/</span>
        <input
          id="post-slug"
          type="text"
          placeholder="post-slug"
          defaultValue={initialData?.slug || ""}
          style={{
            fontSize: "14px",
            border: "1px solid #ddd",
            borderRadius: "4px",
            padding: "4px 8px",
            flex: 1,
            color: "#555",
          }}
        />
      </div>

      {/* Meta fields */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
        <div>
          <label style={{ fontSize: "13px", color: "#666", display: "block", marginBottom: "4px" }}>
            Feature Image URL
          </label>
          <input
            id="post-image"
            type="text"
            placeholder="https://..."
            defaultValue={initialData?.feature_image || ""}
            style={{
              width: "100%",
              padding: "6px 10px",
              border: "1px solid #ddd",
              borderRadius: "6px",
              fontSize: "14px",
              boxSizing: "border-box",
            }}
          />
        </div>
        <div>
          <label style={{ fontSize: "13px", color: "#666", display: "block", marginBottom: "4px" }}>
            Tags (comma separated)
          </label>
          <input
            id="post-tags"
            type="text"
            placeholder="tech, ai, web"
            defaultValue={initialData?.tags?.join(", ") || ""}
            style={{
              width: "100%",
              padding: "6px 10px",
              border: "1px solid #ddd",
              borderRadius: "6px",
              fontSize: "14px",
              boxSizing: "border-box",
            }}
          />
        </div>
      </div>

      <div style={{ marginBottom: "16px" }}>
        <label style={{ fontSize: "13px", color: "#666", display: "block", marginBottom: "4px" }}>
          Excerpt
        </label>
        <textarea
          id="post-excerpt"
          placeholder="Brief description for SEO and previews..."
          defaultValue={initialData?.excerpt || ""}
          rows={2}
          style={{
            width: "100%",
            padding: "6px 10px",
            border: "1px solid #ddd",
            borderRadius: "6px",
            fontSize: "14px",
            resize: "vertical",
            boxSizing: "border-box",
          }}
        />
      </div>

      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          gap: "4px",
          flexWrap: "wrap",
          padding: "8px",
          borderBottom: "1px solid #ddd",
          background: "#fafafa",
          borderRadius: "8px 8px 0 0",
          border: "1px solid #ddd",
        }}
      >
        <button style={btnStyle} onClick={() => editor?.chain().focus().toggleBold().run()} title="Bold">
          <Bold size={16} />
        </button>
        <button style={btnStyle} onClick={() => editor?.chain().focus().toggleItalic().run()} title="Italic">
          <Italic size={16} />
        </button>
        <button style={btnStyle} onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()} title="H1">
          <Heading1 size={16} />
        </button>
        <button style={btnStyle} onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} title="H2">
          <Heading2 size={16} />
        </button>
        <button style={btnStyle} onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} title="H3">
          <Heading3 size={16} />
        </button>
        <button style={btnStyle} onClick={() => editor?.chain().focus().toggleBulletList().run()} title="Bullet List">
          <List size={16} />
        </button>
        <button style={btnStyle} onClick={() => editor?.chain().focus().toggleOrderedList().run()} title="Ordered List">
          <ListOrdered size={16} />
        </button>
        <button style={btnStyle} onClick={() => editor?.chain().focus().toggleBlockquote().run()} title="Quote">
          <Quote size={16} />
        </button>
        <button style={btnStyle} onClick={() => editor?.chain().focus().toggleCodeBlock().run()} title="Code Block">
          <Code size={16} />
        </button>
        <button style={btnStyle} onClick={() => editor?.chain().focus().setHorizontalRule().run()} title="Divider">
          <Minus size={16} />
        </button>
        <button style={btnStyle} onClick={addImage} title="Image">
          <ImageIcon size={16} />
        </button>
        <button style={btnStyle} onClick={addLink} title="Link">
          <LinkIcon size={16} />
        </button>
        <button style={btnStyle} onClick={() => editor?.chain().focus().undo().run()} title="Undo">
          <Undo size={16} />
        </button>
        <button style={btnStyle} onClick={() => editor?.chain().focus().redo().run()} title="Redo">
          <Redo size={16} />
        </button>
      </div>

      {/* Editor */}
      <div
        style={{
          border: "1px solid #ddd",
          borderTop: "none",
          borderRadius: "0 0 8px 8px",
          background: "white",
          minHeight: "400px",
        }}
      >
        <EditorContent editor={editor} />
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: "12px", marginTop: "20px", justifyContent: "flex-end" }}>
        <button
          onClick={() => handleSubmit(false)}
          style={{
            padding: "10px 20px",
            border: "1px solid #ddd",
            borderRadius: "8px",
            background: "white",
            cursor: "pointer",
            fontSize: "14px",
            fontFamily: "var(--font-josefin)",
          }}
        >
          Save Draft
        </button>
        <button
          onClick={() => handleSubmit(true)}
          style={{
            padding: "10px 20px",
            border: "none",
            borderRadius: "8px",
            background: "#1e383b",
            color: "white",
            cursor: "pointer",
            fontSize: "14px",
            fontFamily: "var(--font-josefin)",
          }}
        >
          {initialData?.published ? "Update & Publish" : "Publish"}
        </button>
      </div>
    </div>
  );
}
