"use client";

import { useRouter } from "next/navigation";
import PostEditor from "@/components/PostEditor";

export default function NewPostPage() {
  const router = useRouter();

  async function handleSave(data: {
    title: string;
    slug: string;
    content_html: string;
    excerpt: string;
    feature_image: string;
    tags: string[];
    published: boolean;
  }) {
    const res = await fetch("/api/admin/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.status === 401) {
      router.push("/admin");
      return;
    }

    if (res.ok) {
      router.push("/admin/dashboard");
    } else {
      const err = await res.json();
      alert(err.error || "Failed to create post");
    }
  }

  return <PostEditor onSave={handleSave} />;
}
