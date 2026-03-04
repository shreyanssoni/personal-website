"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";

interface Post {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  published_at: string | null;
  updated_at: string;
}

export default function AdminDashboard() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    const res = await fetch("/api/admin/posts");
    if (res.status === 401) {
      router.push("/admin");
      return;
    }
    const data = await res.json();
    setPosts(data.posts || []);
    setLoading(false);
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;

    const res = await fetch(`/api/admin/posts/${id}`, { method: "DELETE" });
    if (res.ok) {
      setPosts((prev) => prev.filter((p) => p.id !== id));
    }
  }

  async function togglePublish(post: Post) {
    const res = await fetch(`/api/admin/posts/${post.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...post, published: !post.published }),
    });
    if (res.ok) {
      fetchPosts();
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5" }}>
      {/* Header */}
      <div
        style={{
          background: "#1e383b",
          color: "white",
          padding: "16px 32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1
          style={{
            fontSize: "20px",
            fontWeight: "bold",
            fontFamily: "var(--font-josefin)",
          }}
        >
          The MicroBits — Admin
        </h1>
        <button
          onClick={() => router.push("/admin/posts/new")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            background: "#dc7561",
            color: "white",
            border: "none",
            padding: "8px 16px",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "14px",
            fontFamily: "var(--font-josefin)",
          }}
        >
          <Plus size={16} />
          New Post
        </button>
      </div>

      {/* Content */}
      <div style={{ maxWidth: "900px", margin: "32px auto", padding: "0 16px" }}>
        <h2
          style={{
            fontSize: "18px",
            fontWeight: "600",
            marginBottom: "16px",
            fontFamily: "var(--font-montserrat)",
          }}
        >
          Blog Posts ({posts.length})
        </h2>

        {loading ? (
          <p>Loading...</p>
        ) : posts.length === 0 ? (
          <div
            style={{
              background: "white",
              padding: "40px",
              borderRadius: "12px",
              textAlign: "center",
              color: "#666",
            }}
          >
            <p>No posts yet. Create your first post!</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {posts.map((post) => (
              <div
                key={post.id}
                style={{
                  background: "white",
                  padding: "16px 20px",
                  borderRadius: "10px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <h3
                      style={{
                        fontSize: "16px",
                        fontWeight: "600",
                        fontFamily: "var(--font-josefin)",
                      }}
                    >
                      {post.title}
                    </h3>
                    <span
                      style={{
                        fontSize: "11px",
                        padding: "2px 8px",
                        borderRadius: "10px",
                        background: post.published ? "#dcfce7" : "#fef3c7",
                        color: post.published ? "#166534" : "#92400e",
                        fontWeight: "600",
                      }}
                    >
                      {post.published ? "Published" : "Draft"}
                    </span>
                  </div>
                  <p style={{ fontSize: "13px", color: "#888", marginTop: "4px" }}>
                    /{post.slug} · Updated {formatDate(post.updated_at)}
                  </p>
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => togglePublish(post)}
                    title={post.published ? "Unpublish" : "Publish"}
                    style={{
                      background: "none",
                      border: "1px solid #ddd",
                      borderRadius: "6px",
                      padding: "6px",
                      cursor: "pointer",
                      display: "flex",
                    }}
                  >
                    {post.published ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  <button
                    onClick={() => router.push(`/admin/posts/${post.id}/edit`)}
                    title="Edit"
                    style={{
                      background: "none",
                      border: "1px solid #ddd",
                      borderRadius: "6px",
                      padding: "6px",
                      cursor: "pointer",
                      display: "flex",
                    }}
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(post.id, post.title)}
                    title="Delete"
                    style={{
                      background: "none",
                      border: "1px solid #fca5a5",
                      borderRadius: "6px",
                      padding: "6px",
                      cursor: "pointer",
                      display: "flex",
                      color: "#dc2626",
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
