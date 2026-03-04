"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push("/admin/dashboard");
    } else {
      setError("Invalid password");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-midnight relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-1/4 -left-32 w-64 h-64 bg-accent-electric/10 rounded-full blur-3xl animate-blob-float" />
      <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-accent-pink/10 rounded-full blur-3xl animate-blob-float-delayed" />

      <form
        onSubmit={handleSubmit}
        className="glass-card rounded-2xl p-10 w-[380px] relative z-10"
      >
        <div className="mb-1">
          <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-accent-electric">
            Admin Access
          </span>
        </div>
        <h1 className="font-display text-4xl text-text-primary mb-2 tracking-wide">
          THE MICROBITS
        </h1>
        <p className="font-body text-sm text-text-secondary mb-8">
          Enter your password to continue
        </p>

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 bg-surface border border-white/10 rounded-xl text-text-primary font-body text-sm placeholder:text-text-secondary/50 focus:outline-none focus:border-accent-electric/50 focus:ring-1 focus:ring-accent-electric/20 transition-all mb-4"
          autoFocus
        />

        {error && (
          <p className="text-accent-coral text-xs font-mono mb-3">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-accent-electric/10 border border-accent-electric/30 text-accent-electric rounded-xl font-mono text-xs tracking-[0.15em] uppercase hover:bg-accent-electric/20 hover:border-accent-electric/50 transition-all disabled:opacity-50 cursor-pointer"
        >
          {loading ? "Authenticating..." : "Login"}
        </button>
      </form>
    </div>
  );
}
