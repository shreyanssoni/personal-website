"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Sparkles,
  Trash2,
  Eye,
  EyeOff,
  Archive,
  ChevronDown,
  ChevronUp,
  X,
  Plus,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

interface ThreadSignal {
  id: number;
  title: string;
  category: string;
  so_what: string;
  issue_date: string;
  sequence_order: number;
}

interface Thread {
  id: number;
  slug: string;
  title: string;
  description: string | null;
  emoji: string;
  status: string;
  display_order: number;
  created_at: string;
  updated_at: string;
  signals?: ThreadSignal[];
}

interface Suggestion {
  title: string;
  slug: string;
  description: string;
  emoji: string;
  signal_ids: number[];
}

export default function AdminThreadsPage() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [suggesting, setSuggesting] = useState(false);
  const [expandedThread, setExpandedThread] = useState<number | null>(null);
  const [editingThread, setEditingThread] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ title: "", description: "", emoji: "", display_order: 0 });
  const router = useRouter();

  useEffect(() => {
    fetchThreads();
  }, []);

  async function fetchThreads() {
    const res = await fetch("/api/admin/threads");
    if (res.status === 401) {
      router.push("/admin");
      return;
    }
    const data = await res.json();
    setThreads(data.threads || []);
    setLoading(false);
  }

  async function fetchThreadDetail(id: number) {
    if (expandedThread === id) {
      setExpandedThread(null);
      return;
    }
    try {
      const res = await fetch(`/api/admin/threads/${id}`);
      const data = await res.json();
      if (data.thread) {
        setThreads((prev) =>
          prev.map((t) => (t.id === id ? { ...t, signals: data.thread.signals } : t))
        );
      }
    } catch {}
    setExpandedThread(id);
  }

  async function generateSuggestions() {
    setSuggesting(true);
    try {
      const res = await fetch("/api/admin/threads/suggest");
      const data = await res.json();
      setSuggestions(data.suggestions || []);
    } catch {
      alert("Failed to generate suggestions");
    }
    setSuggesting(false);
  }

  async function createFromSuggestion(suggestion: Suggestion) {
    try {
      const res = await fetch("/api/admin/threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: suggestion.slug,
          title: suggestion.title,
          description: suggestion.description,
          emoji: suggestion.emoji,
          signal_ids: suggestion.signal_ids,
        }),
      });
      if (res.ok) {
        setSuggestions((prev) => prev.filter((s) => s.slug !== suggestion.slug));
        fetchThreads();
      }
    } catch {
      alert("Failed to create thread");
    }
  }

  async function toggleStatus(thread: Thread, newStatus: string) {
    await fetch(`/api/admin/threads/${thread.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    fetchThreads();
  }

  async function handleDelete(thread: Thread) {
    if (!confirm(`Delete "${thread.title}"? This cannot be undone.`)) return;
    await fetch(`/api/admin/threads/${thread.id}`, { method: "DELETE" });
    fetchThreads();
  }

  function startEdit(thread: Thread) {
    setEditingThread(thread.id);
    setEditForm({
      title: thread.title,
      description: thread.description || "",
      emoji: thread.emoji,
      display_order: thread.display_order,
    });
  }

  async function saveEdit(id: number) {
    await fetch(`/api/admin/threads/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    setEditingThread(null);
    fetchThreads();
  }

  async function removeSignal(threadId: number, signalId: number) {
    await fetch(`/api/admin/threads/${threadId}/signals`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "remove", signal_id: signalId }),
    });
    fetchThreads();
  }

  async function moveSignal(threadId: number, signals: ThreadSignal[], index: number, direction: "up" | "down") {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= signals.length) return;
    const reordered = [...signals];
    [reordered[index], reordered[newIndex]] = [reordered[newIndex], reordered[index]];
    await fetch(`/api/admin/threads/${threadId}/signals`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reorder", signal_ids: reordered.map((s) => s.id) }),
    });
    fetchThreads();
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  const STATUS_COLORS: Record<string, string> = {
    draft: "text-accent-sunny border-accent-sunny/30 bg-accent-sunny/5",
    published: "text-accent-teal border-accent-teal/30 bg-accent-teal/5",
    archived: "text-text-secondary border-white/10 bg-white/5",
  };

  return (
    <div className="min-h-screen bg-midnight">
      {/* Header */}
      <div className="border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6 py-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/admin/dashboard")}
              className="text-text-secondary hover:text-accent-electric transition-colors cursor-pointer"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="font-display text-2xl text-text-primary tracking-wide">
                THREADS
              </h1>
              <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-text-secondary">
                {threads.length} thread{threads.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
          <button
            onClick={generateSuggestions}
            disabled={suggesting}
            className="flex items-center gap-2 px-4 py-2.5 bg-accent-electric/10 border border-accent-electric/30 text-accent-electric rounded-xl font-mono text-[10px] sm:text-xs tracking-[0.1em] uppercase hover:bg-accent-electric/20 hover:border-accent-electric/50 transition-all cursor-pointer disabled:opacity-50"
          >
            <Sparkles size={14} />
            {suggesting ? "Generating..." : "Generate Suggestions"}
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="mb-12">
            <h2 className="font-display text-lg text-text-primary tracking-wide mb-4">
              AI SUGGESTIONS
            </h2>
            <div className="flex flex-col gap-3">
              {suggestions.map((s) => (
                <div
                  key={s.slug}
                  className="glass-card rounded-xl px-6 py-4 hover:border-white/10 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{s.emoji}</span>
                        <h3 className="font-serif text-base font-bold text-text-primary">
                          {s.title}
                        </h3>
                      </div>
                      <p className="font-body text-sm text-text-secondary mb-2">
                        {s.description}
                      </p>
                      <span className="font-mono text-[11px] text-accent-electric/60">
                        {s.signal_ids.length} matching signals
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => createFromSuggestion(s)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-accent-teal/10 border border-accent-teal/30 text-accent-teal rounded-lg font-mono text-[10px] tracking-[0.1em] uppercase hover:bg-accent-teal/20 transition-all cursor-pointer"
                      >
                        <Plus size={12} />
                        Create
                      </button>
                      <button
                        onClick={() => setSuggestions((prev) => prev.filter((x) => x.slug !== s.slug))}
                        className="p-2 rounded-lg border border-white/5 hover:border-white/15 text-text-secondary hover:text-text-primary transition-all cursor-pointer"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Existing Threads */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <span className="font-mono text-xs text-text-secondary tracking-wider">Loading...</span>
          </div>
        ) : threads.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center">
            <p className="font-body text-text-secondary mb-4">No threads yet</p>
            <p className="font-mono text-xs text-text-secondary">
              Click &ldquo;Generate Suggestions&rdquo; to get AI-powered thread ideas
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <h2 className="font-display text-lg text-text-primary tracking-wide mb-2">
              ALL THREADS
            </h2>
            {threads.map((thread) => (
              <div
                key={thread.id}
                className="glass-card rounded-xl hover:border-white/10 transition-all"
              >
                {editingThread === thread.id ? (
                  <div className="px-6 py-4 space-y-3">
                    <div className="flex gap-3">
                      <input
                        value={editForm.emoji}
                        onChange={(e) => setEditForm({ ...editForm, emoji: e.target.value })}
                        className="w-12 bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-center text-lg text-text-primary"
                        maxLength={4}
                      />
                      <input
                        value={editForm.title}
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 font-serif text-text-primary"
                      />
                    </div>
                    <textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 font-body text-sm text-text-primary resize-none"
                      rows={2}
                    />
                    <div className="flex items-center gap-3">
                      <label className="font-mono text-[11px] text-text-secondary">Order:</label>
                      <input
                        type="number"
                        value={editForm.display_order}
                        onChange={(e) => setEditForm({ ...editForm, display_order: Number(e.target.value) })}
                        className="w-16 bg-white/5 border border-white/10 rounded-lg px-2 py-1 font-mono text-sm text-text-primary"
                      />
                      <div className="flex-1" />
                      <button
                        onClick={() => setEditingThread(null)}
                        className="px-3 py-1.5 font-mono text-[10px] tracking-[0.1em] uppercase text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => saveEdit(thread.id)}
                        className="px-3 py-1.5 bg-accent-electric/10 border border-accent-electric/30 text-accent-electric rounded-lg font-mono text-[10px] tracking-[0.1em] uppercase hover:bg-accent-electric/20 transition-all cursor-pointer"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="px-6 py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                      <div
                        className="flex-1 cursor-pointer"
                        onClick={() => fetchThreadDetail(thread.id)}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{thread.emoji}</span>
                          <h3 className="font-serif text-base font-bold text-text-primary">
                            {thread.title}
                          </h3>
                          <span className={`shrink-0 font-mono text-[9px] tracking-[0.15em] uppercase px-2.5 py-0.5 rounded-full border ${STATUS_COLORS[thread.status] || STATUS_COLORS.draft}`}>
                            {thread.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-text-secondary">
                          <span className="font-mono text-[11px]">/{thread.slug}</span>
                          <span className="text-white/10">&middot;</span>
                          <span className="font-mono text-[11px]">Order: {thread.display_order}</span>
                          <span className="text-white/10">&middot;</span>
                          <span className="font-mono text-[11px]">{formatDate(thread.updated_at)}</span>
                        </div>
                        {thread.description && (
                          <p className="font-body text-sm text-text-secondary mt-1 line-clamp-1">
                            {thread.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {expandedThread === thread.id ? (
                          <ChevronUp size={14} className="text-text-secondary" />
                        ) : (
                          <ChevronDown size={14} className="text-text-secondary" />
                        )}
                        <button
                          onClick={() =>
                            toggleStatus(
                              thread,
                              thread.status === "published" ? "draft" : "published"
                            )
                          }
                          title={thread.status === "published" ? "Unpublish" : "Publish"}
                          className="p-2 rounded-lg border border-white/5 hover:border-white/15 hover:bg-white/5 text-text-secondary hover:text-text-primary transition-all cursor-pointer"
                        >
                          {thread.status === "published" ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                        {thread.status !== "archived" && (
                          <button
                            onClick={() => toggleStatus(thread, "archived")}
                            title="Archive"
                            className="p-2 rounded-lg border border-white/5 hover:border-white/15 hover:bg-white/5 text-text-secondary hover:text-text-primary transition-all cursor-pointer"
                          >
                            <Archive size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => startEdit(thread)}
                          title="Edit"
                          className="p-2 rounded-lg border border-white/5 hover:border-accent-electric/30 hover:bg-accent-electric/5 text-text-secondary hover:text-accent-electric transition-all cursor-pointer"
                        >
                          <ChevronDown size={14} className="hidden" />
                          <span className="font-mono text-[10px]">Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(thread)}
                          title="Delete"
                          className="p-2 rounded-lg border border-white/5 hover:border-accent-coral/30 hover:bg-accent-coral/5 text-text-secondary hover:text-accent-coral transition-all cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Expanded signals */}
                    {expandedThread === thread.id && thread.signals && (
                      <div className="border-t border-white/5 px-6 py-4">
                        {thread.signals.length === 0 ? (
                          <p className="font-mono text-xs text-text-secondary">No signals in this thread</p>
                        ) : (
                          <div className="space-y-2">
                            {thread.signals.map((signal, idx) => (
                              <div
                                key={signal.id}
                                className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                              >
                                <span className="font-mono text-[11px] text-text-secondary w-6 text-right shrink-0">
                                  {idx + 1}.
                                </span>
                                <div className="flex-1 min-w-0">
                                  <span className="font-body text-sm text-text-primary truncate block">
                                    {signal.title}
                                  </span>
                                  <span className="font-mono text-[10px] text-text-secondary">
                                    {formatDate(signal.issue_date)} &middot; {signal.category}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    onClick={() => moveSignal(thread.id, thread.signals!, idx, "up")}
                                    disabled={idx === 0}
                                    className="p-1 text-text-secondary hover:text-text-primary disabled:opacity-20 cursor-pointer disabled:cursor-default transition-colors"
                                  >
                                    <ArrowUp size={12} />
                                  </button>
                                  <button
                                    onClick={() => moveSignal(thread.id, thread.signals!, idx, "down")}
                                    disabled={idx === thread.signals!.length - 1}
                                    className="p-1 text-text-secondary hover:text-text-primary disabled:opacity-20 cursor-pointer disabled:cursor-default transition-colors"
                                  >
                                    <ArrowDown size={12} />
                                  </button>
                                  <button
                                    onClick={() => removeSignal(thread.id, signal.id)}
                                    className="p-1 text-text-secondary hover:text-accent-coral cursor-pointer transition-colors"
                                  >
                                    <X size={12} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
