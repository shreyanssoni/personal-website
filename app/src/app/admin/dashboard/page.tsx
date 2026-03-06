"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit, Trash2, Eye, EyeOff, ArrowLeft, Flower, Star, Briefcase, Share2, GitBranch } from "lucide-react";

interface Post {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  featured: boolean;
  published_at: string | null;
  updated_at: string;
  tags: string[];
}

interface GardenPiece {
  id: string;
  type: string;
  title: string;
  published: boolean;
  display_order: number;
  updated_at: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  codelink: string;
  websitelink: string;
  tags: string[];
  featured: boolean;
  display_order: number;
  published: boolean;
  updated_at: string;
}

const TYPE_COLORS: Record<string, string> = {
  hero: "text-accent-electric border-accent-electric/30 bg-accent-electric/5",
  fragment: "text-accent-pink border-accent-pink/30 bg-accent-pink/5",
  featured: "text-accent-orange border-accent-orange/30 bg-accent-orange/5",
  artifact: "text-accent-teal border-accent-teal/30 bg-accent-teal/5",
};

export default function AdminDashboard() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [gardenPieces, setGardenPieces] = useState<GardenPiece[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const [postsRes, gardenRes, portfolioRes] = await Promise.all([
      fetch("/api/admin/posts"),
      fetch("/api/admin/garden"),
      fetch("/api/admin/portfolio"),
    ]);

    if (postsRes.status === 401 || gardenRes.status === 401 || portfolioRes.status === 401) {
      router.push("/admin");
      return;
    }

    const postsData = await postsRes.json();
    const gardenData = await gardenRes.json();
    const portfolioData = await portfolioRes.json();
    setPosts(postsData.posts || []);
    setGardenPieces(gardenData.pieces || []);
    setProjects(portfolioData.projects || []);
    setLoading(false);
  }

  async function handleDeletePost(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/posts/${id}`, { method: "DELETE" });
    if (res.ok) {
      setPosts((prev) => prev.filter((p) => p.id !== id));
    }
  }

  async function togglePublishPost(post: Post) {
    const res = await fetch(`/api/admin/posts/${post.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...post, published: !post.published }),
    });
    if (res.ok) fetchData();
  }

  async function toggleFeaturedPost(post: Post) {
    const res = await fetch(`/api/admin/posts/${post.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...post, featured: !post.featured }),
    });
    if (res.ok) fetchData();
  }

  async function handleDeleteGarden(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/garden/${id}`, { method: "DELETE" });
    if (res.ok) {
      setGardenPieces((prev) => prev.filter((p) => p.id !== id));
    }
  }

  async function togglePublishGarden(piece: GardenPiece) {
    const res = await fetch(`/api/admin/garden/${piece.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...piece, published: !piece.published }),
    });
    if (res.ok) fetchData();
  }

  async function handleDeleteProject(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/portfolio/${id}`, { method: "DELETE" });
    if (res.ok) {
      setProjects((prev) => prev.filter((p) => p.id !== id));
    }
  }

  async function togglePublishProject(project: Project) {
    const res = await fetch(`/api/admin/portfolio/${project.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...project, published: !project.published }),
    });
    if (res.ok) fetchData();
  }

  async function toggleFeaturedProject(project: Project) {
    const res = await fetch(`/api/admin/portfolio/${project.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...project, featured: !project.featured }),
    });
    if (res.ok) fetchData();
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  return (
    <div className="min-h-screen bg-midnight">
      {/* Header */}
      <div className="border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6 py-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/")}
              className="text-text-secondary hover:text-accent-electric transition-colors cursor-pointer"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="font-display text-2xl text-text-primary tracking-wide">
                DASHBOARD
              </h1>
              <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-text-secondary">
                {posts.length} post{posts.length !== 1 ? "s" : ""} &middot; {gardenPieces.length} garden piece{gardenPieces.length !== 1 ? "s" : ""} &middot; {projects.length} project{projects.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 ml-10 sm:ml-0">
            <button
              onClick={() => router.push("/admin/threads")}
              className="flex items-center gap-2 px-4 py-2.5 bg-accent-lime/10 border border-accent-lime/30 text-accent-lime rounded-xl font-mono text-[10px] sm:text-xs tracking-[0.1em] uppercase hover:bg-accent-lime/20 hover:border-accent-lime/50 transition-all cursor-pointer"
            >
              <GitBranch size={14} />
              Threads
            </button>
            <button
              onClick={() => router.push("/admin/social")}
              className="flex items-center gap-2 px-4 py-2.5 bg-accent-electric/10 border border-accent-electric/30 text-accent-electric rounded-xl font-mono text-[10px] sm:text-xs tracking-[0.1em] uppercase hover:bg-accent-electric/20 hover:border-accent-electric/50 transition-all cursor-pointer"
            >
              <Share2 size={14} />
              Social
            </button>
            <button
              onClick={() => router.push("/admin/portfolio/new")}
              className="flex items-center gap-2 px-4 py-2.5 bg-accent-orange/10 border border-accent-orange/30 text-accent-orange rounded-xl font-mono text-[10px] sm:text-xs tracking-[0.1em] uppercase hover:bg-accent-orange/20 hover:border-accent-orange/50 transition-all cursor-pointer"
            >
              <Briefcase size={14} />
              <span className="hidden sm:inline">New</span> Project
            </button>
            <button
              onClick={() => router.push("/admin/garden/new")}
              className="flex items-center gap-2 px-4 py-2.5 bg-accent-teal/10 border border-accent-teal/30 text-accent-teal rounded-xl font-mono text-[10px] sm:text-xs tracking-[0.1em] uppercase hover:bg-accent-teal/20 hover:border-accent-teal/50 transition-all cursor-pointer"
            >
              <Flower size={14} />
              <span className="hidden sm:inline">New</span> Garden
            </button>
            <button
              onClick={() => router.push("/admin/posts/new")}
              className="flex items-center gap-2 px-4 py-2.5 bg-accent-pink/10 border border-accent-pink/30 text-accent-pink rounded-xl font-mono text-[10px] sm:text-xs tracking-[0.1em] uppercase hover:bg-accent-pink/20 hover:border-accent-pink/50 transition-all cursor-pointer"
            >
              <Plus size={14} />
              <span className="hidden sm:inline">New</span> Post
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <span className="font-mono text-xs text-text-secondary tracking-wider">
              Loading...
            </span>
          </div>
        ) : (
          <>
            {/* ===== BLOG POSTS ===== */}
            <div className="mb-12">
              <h2 className="font-display text-lg text-text-primary tracking-wide mb-4">
                BLOG POSTS
              </h2>
              {posts.length === 0 ? (
                <div className="glass-card rounded-2xl p-12 text-center">
                  <p className="font-body text-text-secondary mb-4">No posts yet</p>
                  <button
                    onClick={() => router.push("/admin/posts/new")}
                    className="font-mono text-xs tracking-wider text-accent-electric hover:text-accent-electric/80 transition-colors cursor-pointer"
                  >
                    Create your first post &rarr;
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {posts.map((post) => (
                    <div
                      key={post.id}
                      className="glass-card rounded-xl px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 hover:border-white/10 transition-all group"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-serif text-base font-bold text-text-primary truncate">
                            {post.title}
                          </h3>
                          <span
                            className={`shrink-0 font-mono text-[9px] tracking-[0.15em] uppercase px-2.5 py-0.5 rounded-full border ${
                              post.published
                                ? "text-accent-teal border-accent-teal/30 bg-accent-teal/5"
                                : "text-accent-sunny border-accent-sunny/30 bg-accent-sunny/5"
                            }`}
                          >
                            {post.published ? "Live" : "Draft"}
                          </span>
                          {post.featured && (
                            <span className="shrink-0 font-mono text-[9px] tracking-[0.15em] uppercase px-2.5 py-0.5 rounded-full border text-accent-orange border-accent-orange/30 bg-accent-orange/5">
                              Featured
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-text-secondary">
                          <span className="font-mono text-[11px]">/{post.slug}</span>
                          <span className="text-white/10">&middot;</span>
                          <span className="font-mono text-[11px]">
                            {formatDate(post.updated_at)}
                          </span>
                          {post.tags?.length > 0 && (
                            <>
                              <span className="text-white/10">&middot;</span>
                              <span className="font-mono text-[11px] text-accent-pink/60">
                                {post.tags.slice(0, 3).join(", ")}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 sm:ml-4 sm:opacity-50 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => toggleFeaturedPost(post)}
                          title={post.featured ? "Remove from featured" : "Mark as featured"}
                          className={`p-2 rounded-lg border transition-all cursor-pointer ${
                            post.featured
                              ? "border-accent-orange/30 bg-accent-orange/10 text-accent-orange"
                              : "border-white/5 hover:border-accent-orange/30 hover:bg-accent-orange/5 text-text-secondary hover:text-accent-orange"
                          }`}
                        >
                          <Star size={14} fill={post.featured ? "currentColor" : "none"} />
                        </button>
                        <button
                          onClick={() => togglePublishPost(post)}
                          title={post.published ? "Unpublish" : "Publish"}
                          className="p-2 rounded-lg border border-white/5 hover:border-white/15 hover:bg-white/5 text-text-secondary hover:text-text-primary transition-all cursor-pointer"
                        >
                          {post.published ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                        <button
                          onClick={() => router.push(`/admin/posts/${post.id}/edit`)}
                          title="Edit"
                          className="p-2 rounded-lg border border-white/5 hover:border-accent-electric/30 hover:bg-accent-electric/5 text-text-secondary hover:text-accent-electric transition-all cursor-pointer"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDeletePost(post.id, post.title)}
                          title="Delete"
                          className="p-2 rounded-lg border border-white/5 hover:border-accent-coral/30 hover:bg-accent-coral/5 text-text-secondary hover:text-accent-coral transition-all cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ===== PORTFOLIO PROJECTS ===== */}
            <div className="mb-12">
              <h2 className="font-display text-lg text-text-primary tracking-wide mb-4">
                PORTFOLIO PROJECTS
              </h2>
              {projects.length === 0 ? (
                <div className="glass-card rounded-2xl p-12 text-center">
                  <p className="font-body text-text-secondary mb-4">No projects yet</p>
                  <button
                    onClick={() => router.push("/admin/portfolio/new")}
                    className="font-mono text-xs tracking-wider text-accent-orange hover:text-accent-orange/80 transition-colors cursor-pointer"
                  >
                    Create your first project &rarr;
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      className="glass-card rounded-xl px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 hover:border-white/10 transition-all group"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-serif text-base font-bold text-text-primary truncate">
                            {project.title}
                          </h3>
                          <span
                            className={`shrink-0 font-mono text-[9px] tracking-[0.15em] uppercase px-2.5 py-0.5 rounded-full border ${
                              project.published
                                ? "text-accent-teal border-accent-teal/30 bg-accent-teal/5"
                                : "text-accent-sunny border-accent-sunny/30 bg-accent-sunny/5"
                            }`}
                          >
                            {project.published ? "Live" : "Draft"}
                          </span>
                          {project.featured && (
                            <span className="shrink-0 font-mono text-[9px] tracking-[0.15em] uppercase px-2.5 py-0.5 rounded-full border text-accent-orange border-accent-orange/30 bg-accent-orange/5">
                              Featured
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-text-secondary">
                          <span className="font-mono text-[11px]">
                            Order: {project.display_order}
                          </span>
                          <span className="text-white/10">&middot;</span>
                          <span className="font-mono text-[11px]">
                            {formatDate(project.updated_at)}
                          </span>
                          {project.tags?.length > 0 && (
                            <>
                              <span className="text-white/10">&middot;</span>
                              <span className="font-mono text-[11px] text-accent-orange/60">
                                {project.tags.slice(0, 3).join(", ")}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 sm:ml-4 sm:opacity-50 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => toggleFeaturedProject(project)}
                          title={project.featured ? "Remove from featured" : "Mark as featured"}
                          className={`p-2 rounded-lg border transition-all cursor-pointer ${
                            project.featured
                              ? "border-accent-orange/30 bg-accent-orange/10 text-accent-orange"
                              : "border-white/5 hover:border-accent-orange/30 hover:bg-accent-orange/5 text-text-secondary hover:text-accent-orange"
                          }`}
                        >
                          <Star size={14} fill={project.featured ? "currentColor" : "none"} />
                        </button>
                        <button
                          onClick={() => togglePublishProject(project)}
                          title={project.published ? "Unpublish" : "Publish"}
                          className="p-2 rounded-lg border border-white/5 hover:border-white/15 hover:bg-white/5 text-text-secondary hover:text-text-primary transition-all cursor-pointer"
                        >
                          {project.published ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                        <button
                          onClick={() => router.push(`/admin/portfolio/${project.id}/edit`)}
                          title="Edit"
                          className="p-2 rounded-lg border border-white/5 hover:border-accent-electric/30 hover:bg-accent-electric/5 text-text-secondary hover:text-accent-electric transition-all cursor-pointer"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteProject(project.id, project.title)}
                          title="Delete"
                          className="p-2 rounded-lg border border-white/5 hover:border-accent-coral/30 hover:bg-accent-coral/5 text-text-secondary hover:text-accent-coral transition-all cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ===== GARDEN PIECES ===== */}
            <div>
              <h2 className="font-display text-lg text-text-primary tracking-wide mb-4">
                GARDEN PIECES
              </h2>
              {gardenPieces.length === 0 ? (
                <div className="glass-card rounded-2xl p-12 text-center">
                  <p className="font-body text-text-secondary mb-4">No garden pieces yet</p>
                  <button
                    onClick={() => router.push("/admin/garden/new")}
                    className="font-mono text-xs tracking-wider text-accent-teal hover:text-accent-teal/80 transition-colors cursor-pointer"
                  >
                    Create your first piece &rarr;
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {gardenPieces.map((piece) => (
                    <div
                      key={piece.id}
                      className="glass-card rounded-xl px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 hover:border-white/10 transition-all group"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-serif text-base font-bold text-text-primary truncate">
                            {piece.title}
                          </h3>
                          <span
                            className={`shrink-0 font-mono text-[9px] tracking-[0.15em] uppercase px-2.5 py-0.5 rounded-full border ${
                              TYPE_COLORS[piece.type] || "text-text-secondary border-white/10"
                            }`}
                          >
                            {piece.type}
                          </span>
                          <span
                            className={`shrink-0 font-mono text-[9px] tracking-[0.15em] uppercase px-2.5 py-0.5 rounded-full border ${
                              piece.published
                                ? "text-accent-teal border-accent-teal/30 bg-accent-teal/5"
                                : "text-accent-sunny border-accent-sunny/30 bg-accent-sunny/5"
                            }`}
                          >
                            {piece.published ? "Live" : "Draft"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-text-secondary">
                          <span className="font-mono text-[11px]">
                            Order: {piece.display_order}
                          </span>
                          <span className="text-white/10">&middot;</span>
                          <span className="font-mono text-[11px]">
                            {formatDate(piece.updated_at)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 sm:ml-4 sm:opacity-50 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => togglePublishGarden(piece)}
                          title={piece.published ? "Unpublish" : "Publish"}
                          className="p-2 rounded-lg border border-white/5 hover:border-white/15 hover:bg-white/5 text-text-secondary hover:text-text-primary transition-all cursor-pointer"
                        >
                          {piece.published ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                        <button
                          onClick={() => router.push(`/admin/garden/${piece.id}/edit`)}
                          title="Edit"
                          className="p-2 rounded-lg border border-white/5 hover:border-accent-electric/30 hover:bg-accent-electric/5 text-text-secondary hover:text-accent-electric transition-all cursor-pointer"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteGarden(piece.id, piece.title)}
                          title="Delete"
                          className="p-2 rounded-lg border border-white/5 hover:border-accent-coral/30 hover:bg-accent-coral/5 text-text-secondary hover:text-accent-coral transition-all cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
