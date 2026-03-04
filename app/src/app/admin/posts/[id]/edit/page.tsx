"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import PostEditor from "@/components/PostEditor";

interface PostData {
  id: string;
  title: string;
  slug: string;
  content_html: string;
  excerpt: string;
  feature_image: string;
  tags: string[];
  published: boolean;
}

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [post, setPost] = useState<PostData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPost() {
      const res = await fetch(`/api/admin/posts/${id}`);
      if (res.status === 401) {
        router.push("/admin");
        return;
      }
      const data = await res.json();
      setPost(data.post);
      setLoading(false);
    }
    fetchPost();
  }, [id, router]);

  async function handleSave(data: {
    title: string;
    slug: string;
    content_html: string;
    excerpt: string;
    feature_image: string;
    tags: string[];
    published: boolean;
  }) {
    const res = await fetch(`/api/admin/posts/${id}`, {
      method: "PUT",
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
      alert(err.error || "Failed to update post");
    }
  }

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <p>Loading post...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <p>Post not found.</p>
      </div>
    );
  }

  return <PostEditor initialData={post} onSave={handleSave} />;
}
