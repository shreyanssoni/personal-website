"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ExternalLink, Save, SkipForward, BarChart3 } from "lucide-react";

interface SocialPost {
  id: number;
  issue_id: number;
  signal_id: number | null;
  format: string;
  post_text: string;
  hook_curiosity: string | null;
  hook_contrarian: string | null;
  hook_prediction: string | null;
  thesis: string | null;
  topic_cluster: string | null;
  signal_url: string | null;
  posting_order: number;
  status: string;
  shared_at: string | null;
  posted_url: string | null;
  impressions: number | null;
  likes: number | null;
  reposts: number | null;
  replies: number | null;
  clicks: number | null;
  subs_gained: number | null;
  format_score: number | null;
  signal_title?: string;
  signal_category?: string;
}

interface Analytics {
  formatPerf: { format: string; post_count: number; avg_score: number | null; total_impressions: number | null; total_subs: number | null }[];
  clusterPerf: { topic_cluster: string; post_count: number; avg_score: number | null; total_subs: number | null }[];
  topPosts: (SocialPost & { signal_title?: string })[];
}

const FORMAT_COLORS: Record<string, string> = {
  insight: "text-accent-electric border-accent-electric/30 bg-accent-electric/5",
  contrarian: "text-accent-coral border-accent-coral/30 bg-accent-coral/5",
  thread: "text-accent-teal border-accent-teal/30 bg-accent-teal/5",
  question: "text-accent-sunny border-accent-sunny/30 bg-accent-sunny/5",
};

export default function AdminSocial() {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [editTexts, setEditTexts] = useState<Record<number, string>>({});
  const [perfInputs, setPerfInputs] = useState<Record<number, Record<string, string>>>({});
  const [saving, setSaving] = useState<Record<number, boolean>>({});
  const [tab, setTab] = useState<"assets" | "analytics">("assets");
  const router = useRouter();

  useEffect(() => {
    fetchPosts();
    fetchAnalytics();
  }, []);

  async function fetchPosts() {
    const res = await fetch("/api/admin/social");
    if (res.status === 401) { router.push("/admin"); return; }
    const data = await res.json();
    setPosts(data.posts || []);
    setLoading(false);
  }

  async function fetchAnalytics() {
    const res = await fetch("/api/admin/social/analytics");
    if (res.ok) {
      setAnalytics(await res.json());
    }
  }

  function getEditText(post: SocialPost) {
    return editTexts[post.id] ?? post.post_text;
  }

  function applyHook(post: SocialPost, hook: string) {
    const current = getEditText(post);
    const lines = current.split("\n");
    lines[0] = hook;
    setEditTexts({ ...editTexts, [post.id]: lines.join("\n") });
  }

  async function savePost(post: SocialPost) {
    setSaving({ ...saving, [post.id]: true });
    const text = editTexts[post.id];
    await fetch(`/api/admin/social/${post.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(text !== undefined ? { post_text: text } : {}),
    });
    setSaving({ ...saving, [post.id]: false });
    fetchPosts();
  }

  async function shareOnTwitter(post: SocialPost) {
    const text = getEditText(post);
    const tweetText = post.format === "thread"
      ? text.split("\n---\n")[0]
      : text;
    const intentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(intentUrl, "_blank");

    const postedUrl = prompt("Paste the tweet URL after posting:");
    if (postedUrl) {
      await fetch(`/api/admin/social/${post.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "shared", shared_at: new Date().toISOString(), posted_url: postedUrl }),
      });
      fetchPosts();
    }
  }

  async function skipPost(post: SocialPost) {
    await fetch(`/api/admin/social/${post.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "skipped" }),
    });
    fetchPosts();
  }

  async function savePerformance(post: SocialPost) {
    const inputs = perfInputs[post.id] || {};
    const body: Record<string, number | null> = {};
    for (const key of ["impressions", "likes", "reposts", "replies", "clicks", "subs_gained"]) {
      if (inputs[key] !== undefined && inputs[key] !== "") {
        body[key] = parseInt(inputs[key], 10);
      }
    }
    setSaving({ ...saving, [post.id]: true });
    await fetch(`/api/admin/social/${post.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSaving({ ...saving, [post.id]: false });
    fetchPosts();
  }

  function getPerfValue(postId: number, field: string, current: number | null) {
    return perfInputs[postId]?.[field] ?? (current !== null ? String(current) : "");
  }

  function setPerfValue(postId: number, field: string, value: string) {
    setPerfInputs({
      ...perfInputs,
      [postId]: { ...(perfInputs[postId] || {}), [field]: value },
    });
  }

  function charCount(text: string) {
    return text.length;
  }

  function maxBarWidth(values: (number | null)[]) {
    return Math.max(...values.map(v => v || 0), 0.001);
  }

  return (
    <div className="min-h-screen bg-midnight">
      {/* Header */}
      <div className="border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6 py-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push("/admin/dashboard")} className="text-text-secondary hover:text-accent-electric transition-colors cursor-pointer">
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="font-display text-2xl text-text-primary tracking-wide">SOCIAL</h1>
              <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-text-secondary">
                {posts.length} asset{posts.length !== 1 ? "s" : ""} &middot; {posts.filter(p => p.status === "shared").length} shared
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setTab("assets")}
              className={`px-4 py-2 rounded-xl font-mono text-xs tracking-[0.1em] uppercase border transition-all cursor-pointer ${tab === "assets" ? "bg-accent-electric/10 border-accent-electric/30 text-accent-electric" : "border-white/5 text-text-secondary hover:border-white/15"}`}
            >
              Assets
            </button>
            <button
              onClick={() => setTab("analytics")}
              className={`px-4 py-2 rounded-xl font-mono text-xs tracking-[0.1em] uppercase border transition-all cursor-pointer flex items-center gap-2 ${tab === "analytics" ? "bg-accent-teal/10 border-accent-teal/30 text-accent-teal" : "border-white/5 text-text-secondary hover:border-white/15"}`}
            >
              <BarChart3 size={14} /> Analytics
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <span className="font-mono text-xs text-text-secondary tracking-wider">Loading...</span>
          </div>
        ) : tab === "assets" ? (
          /* ===== ASSETS TAB ===== */
          <div className="flex flex-col gap-6">
            {posts.length === 0 ? (
              <div className="glass-card rounded-2xl p-12 text-center">
                <p className="font-body text-text-secondary">No social assets yet. They generate automatically with the daily newsletter.</p>
              </div>
            ) : (
              posts.map((post) => (
                <div key={post.id} className="glass-card rounded-2xl p-6">
                  {/* Header row */}
                  <div className="flex items-center gap-3 mb-4 flex-wrap">
                    <span className="font-mono text-xs text-text-secondary">#{post.posting_order}</span>
                    <span className={`font-mono text-[9px] tracking-[0.15em] uppercase px-2.5 py-0.5 rounded-full border ${FORMAT_COLORS[post.format] || "text-text-secondary border-white/10"}`}>
                      {post.format}
                    </span>
                    {post.topic_cluster && (
                      <span className="font-mono text-[9px] tracking-[0.15em] uppercase px-2.5 py-0.5 rounded-full border border-white/10 text-text-secondary">
                        {post.topic_cluster}
                      </span>
                    )}
                    <span className={`font-mono text-[9px] tracking-[0.15em] uppercase px-2.5 py-0.5 rounded-full border ${
                      post.status === "shared" ? "text-accent-teal border-accent-teal/30 bg-accent-teal/5"
                      : post.status === "skipped" ? "text-text-secondary border-white/10 bg-white/5"
                      : "text-accent-sunny border-accent-sunny/30 bg-accent-sunny/5"
                    }`}>
                      {post.status}
                    </span>
                  </div>

                  {/* Hooks */}
                  <div className="mb-4 space-y-2">
                    <p className="font-mono text-[10px] tracking-[0.15em] uppercase text-text-secondary">Hooks (click to apply):</p>
                    {[
                      { label: "curiosity", value: post.hook_curiosity },
                      { label: "contrarian", value: post.hook_contrarian },
                      { label: "prediction", value: post.hook_prediction },
                    ].map(({ label, value }) => value && (
                      <button
                        key={label}
                        onClick={() => applyHook(post, value)}
                        className="block w-full text-left px-3 py-2 rounded-lg border border-white/5 hover:border-accent-electric/30 hover:bg-accent-electric/5 transition-all cursor-pointer"
                      >
                        <span className="font-mono text-[9px] tracking-[0.1em] uppercase text-accent-electric/60 mr-2">{label}:</span>
                        <span className="font-body text-sm text-text-secondary">{value}</span>
                      </button>
                    ))}
                  </div>

                  {/* Post text */}
                  {post.format === "thread" ? (
                    <div className="space-y-3 mb-3">
                      {getEditText(post).split("\n---\n").map((tweet, i) => (
                        <div key={i}>
                          <textarea
                            value={tweet}
                            onChange={(e) => {
                              const tweets = getEditText(post).split("\n---\n");
                              tweets[i] = e.target.value;
                              setEditTexts({ ...editTexts, [post.id]: tweets.join("\n---\n") });
                            }}
                            rows={3}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 font-body text-sm text-text-primary resize-none focus:outline-none focus:border-accent-electric/30"
                          />
                          <span className={`font-mono text-[10px] ${charCount(tweet) > 280 ? "text-accent-coral" : "text-text-secondary"}`}>
                            {charCount(tweet)}/280
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mb-3">
                      <textarea
                        value={getEditText(post)}
                        onChange={(e) => setEditTexts({ ...editTexts, [post.id]: e.target.value })}
                        rows={4}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 font-body text-sm text-text-primary resize-none focus:outline-none focus:border-accent-electric/30"
                      />
                      <span className={`font-mono text-[10px] ${charCount(getEditText(post)) > 280 ? "text-accent-coral" : "text-text-secondary"}`}>
                        {charCount(getEditText(post))}/280
                      </span>
                    </div>
                  )}

                  {/* Thesis */}
                  {post.thesis && (
                    <p className="font-mono text-xs text-accent-electric/80 mb-3 italic">
                      THESIS: &ldquo;{post.thesis}&rdquo;
                    </p>
                  )}

                  {/* Signal link */}
                  {post.signal_title && (
                    <p className="font-mono text-[11px] text-text-secondary mb-4">
                      Signal: {post.signal_title}
                    </p>
                  )}

                  {/* Actions */}
                  {post.status === "draft" && (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => savePost(post)}
                        disabled={saving[post.id]}
                        className="flex items-center gap-2 px-4 py-2 bg-accent-electric/10 border border-accent-electric/30 text-accent-electric rounded-xl font-mono text-[10px] tracking-[0.1em] uppercase hover:bg-accent-electric/20 transition-all cursor-pointer disabled:opacity-50"
                      >
                        <Save size={12} /> {saving[post.id] ? "Saving..." : "Save"}
                      </button>
                      <button
                        onClick={() => shareOnTwitter(post)}
                        className="flex items-center gap-2 px-4 py-2 bg-accent-teal/10 border border-accent-teal/30 text-accent-teal rounded-xl font-mono text-[10px] tracking-[0.1em] uppercase hover:bg-accent-teal/20 transition-all cursor-pointer"
                      >
                        <ExternalLink size={12} /> Share on Twitter
                      </button>
                      <button
                        onClick={() => skipPost(post)}
                        className="flex items-center gap-2 px-4 py-2 border border-white/10 text-text-secondary rounded-xl font-mono text-[10px] tracking-[0.1em] uppercase hover:border-white/20 hover:bg-white/5 transition-all cursor-pointer"
                      >
                        <SkipForward size={12} /> Skip
                      </button>
                    </div>
                  )}

                  {/* Performance section for shared posts */}
                  {post.status === "shared" && (
                    <div className="mt-4 pt-4 border-t border-white/5">
                      <p className="font-mono text-[10px] tracking-[0.15em] uppercase text-text-secondary mb-3">Performance</p>
                      {post.posted_url && (
                        <a href={post.posted_url} target="_blank" rel="noopener noreferrer" className="font-mono text-[11px] text-accent-electric hover:underline mb-3 block">
                          {post.posted_url}
                        </a>
                      )}
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-3">
                        {(["impressions", "likes", "reposts", "replies", "clicks", "subs_gained"] as const).map((field) => (
                          <div key={field}>
                            <label className="font-mono text-[9px] tracking-[0.1em] uppercase text-text-secondary block mb-1">
                              {field === "subs_gained" ? "Subs" : field}
                            </label>
                            <input
                              type="number"
                              value={getPerfValue(post.id, field, post[field])}
                              onChange={(e) => setPerfValue(post.id, field, e.target.value)}
                              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 font-mono text-xs text-text-primary focus:outline-none focus:border-accent-electric/30"
                            />
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => savePerformance(post)}
                          disabled={saving[post.id]}
                          className="flex items-center gap-2 px-4 py-2 bg-accent-electric/10 border border-accent-electric/30 text-accent-electric rounded-xl font-mono text-[10px] tracking-[0.1em] uppercase hover:bg-accent-electric/20 transition-all cursor-pointer disabled:opacity-50"
                        >
                          <Save size={12} /> {saving[post.id] ? "Saving..." : "Save Stats"}
                        </button>
                        {post.format_score !== null && (
                          <span className="font-mono text-xs text-text-secondary">
                            Score: {(post.format_score * 100).toFixed(2)}%
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        ) : (
          /* ===== ANALYTICS TAB ===== */
          <div className="space-y-8">
            {!analytics ? (
              <div className="glass-card rounded-2xl p-12 text-center">
                <p className="font-body text-text-secondary">No analytics data yet. Share some posts first.</p>
              </div>
            ) : (
              <>
                {/* Format Performance */}
                <div className="glass-card rounded-2xl p-6">
                  <h3 className="font-display text-lg text-text-primary tracking-wide mb-4">FORMAT PERFORMANCE</h3>
                  {analytics.formatPerf.length === 0 ? (
                    <p className="font-body text-sm text-text-secondary">No data yet</p>
                  ) : (
                    <div className="space-y-3">
                      {analytics.formatPerf.map((f) => (
                        <div key={f.format} className="flex items-center gap-4">
                          <span className={`font-mono text-[9px] tracking-[0.15em] uppercase w-24 px-2.5 py-0.5 rounded-full border text-center ${FORMAT_COLORS[f.format] || "text-text-secondary border-white/10"}`}>
                            {f.format}
                          </span>
                          <div className="flex-1 h-6 bg-white/5 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-accent-electric/30 rounded-full"
                              style={{ width: `${((f.avg_score || 0) / maxBarWidth(analytics.formatPerf.map(x => x.avg_score))) * 100}%` }}
                            />
                          </div>
                          <span className="font-mono text-xs text-text-secondary w-16 text-right">
                            {f.avg_score ? (f.avg_score * 100).toFixed(1) + "%" : "—"}
                          </span>
                          <span className="font-mono text-[10px] text-text-secondary w-12 text-right">
                            {f.post_count}p
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Topic Clusters */}
                <div className="glass-card rounded-2xl p-6">
                  <h3 className="font-display text-lg text-text-primary tracking-wide mb-4">TOPIC CLUSTERS</h3>
                  {analytics.clusterPerf.length === 0 ? (
                    <p className="font-body text-sm text-text-secondary">No data yet</p>
                  ) : (
                    <div className="space-y-3">
                      {analytics.clusterPerf.map((c) => (
                        <div key={c.topic_cluster} className="flex items-center gap-4">
                          <span className="font-mono text-[10px] text-text-secondary w-28 truncate">{c.topic_cluster}</span>
                          <div className="flex-1 h-6 bg-white/5 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-accent-teal/30 rounded-full"
                              style={{ width: `${((c.avg_score || 0) / maxBarWidth(analytics.clusterPerf.map(x => x.avg_score))) * 100}%` }}
                            />
                          </div>
                          <span className="font-mono text-xs text-text-secondary w-16 text-right">
                            {c.avg_score ? (c.avg_score * 100).toFixed(1) + "%" : "—"}
                          </span>
                          <span className="font-mono text-[10px] text-accent-sunny w-16 text-right">
                            {c.total_subs || 0} subs
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Top Converting Posts */}
                <div className="glass-card rounded-2xl p-6">
                  <h3 className="font-display text-lg text-text-primary tracking-wide mb-4">TOP CONVERTING POSTS</h3>
                  {analytics.topPosts.length === 0 ? (
                    <p className="font-body text-sm text-text-secondary">No data yet</p>
                  ) : (
                    <div className="space-y-3">
                      {analytics.topPosts.map((p) => (
                        <div key={p.id} className="flex items-center gap-4 p-3 rounded-lg bg-white/5">
                          <span className={`shrink-0 font-mono text-[9px] tracking-[0.15em] uppercase px-2 py-0.5 rounded-full border ${FORMAT_COLORS[p.format] || ""}`}>
                            {p.format}
                          </span>
                          <span className="font-body text-sm text-text-primary truncate flex-1">
                            {p.post_text.slice(0, 80)}...
                          </span>
                          <span className="font-mono text-xs text-accent-sunny shrink-0">
                            {p.subs_gained} sub{p.subs_gained !== 1 ? "s" : ""}
                          </span>
                          {p.posted_url && (
                            <a href={p.posted_url} target="_blank" rel="noopener noreferrer" className="text-accent-electric hover:text-accent-electric/80 shrink-0">
                              <ExternalLink size={12} />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
