export const revalidate = 3600;

import Link from "next/link";
import { ArrowRight, Code, Cpu, Layers, Sparkles, Rss } from "lucide-react";
import { getFeaturedPosts } from "@/lib/blog";
import { getFeaturedProjects } from "@/lib/portfolio";
import { getLatestIssueWithSignals } from "@/lib/newsletter";
import BlogCard from "@/components/BlogCard";
import GradientBlobs from "@/components/GradientBlobs";
import GlassCard from "@/components/GlassCard";
import SectionLabel from "@/components/SectionLabel";

export default async function Home() {
  let posts: Awaited<ReturnType<typeof getFeaturedPosts>> = [];
  try {
    posts = await getFeaturedPosts(3);
  } catch {
    posts = [];
  }

  let featuredProjects: Awaited<ReturnType<typeof getFeaturedProjects>> = [];
  try {
    featuredProjects = await getFeaturedProjects(3);
  } catch {
    featuredProjects = [];
  }

  let latestNews: Awaited<ReturnType<typeof getLatestIssueWithSignals>> = null;
  try {
    latestNews = await getLatestIssueWithSignals();
  } catch {
    latestNews = null;
  }

  return (
    <>
      {/* ===== HERO ===== */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Faded background image */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-[0.25]"
          style={{ backgroundImage: "url(/assets/img/header-img5.webp)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-midnight/40 via-transparent to-midnight" />

        <GradientBlobs
          color1="rgba(0, 229, 255, 0.12)"
          color2="rgba(255, 45, 133, 0.08)"
          color3="rgba(0, 245, 212, 0.06)"
        />

        <div className="relative mx-auto max-w-7xl px-6 py-32 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8">
              <SectionLabel text="WELCOME" className="mb-6 block" />
              <h1 className="font-display text-6xl sm:text-8xl lg:text-9xl leading-[0.85] tracking-tight text-text-primary">
                hi, it&apos;s me,
                <br />
                <span className="text-accent-electric">SHREYANS</span>
              </h1>
              <div className="mt-6 border-l-2 border-accent-electric/40 pl-6 max-w-lg">
                <p className="font-body text-lg text-text-secondary leading-relaxed">
                  Developer, creator, and tinkerer. Building at the intersection
                  of technology and human experience.
                </p>
              </div>
              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  href="/portfolio"
                  className="inline-flex items-center gap-2 bg-accent-electric text-midnight font-mono text-xs tracking-wider uppercase px-6 py-3 rounded-lg hover:bg-accent-electric/90 transition-colors"
                >
                  View Work <ArrowRight size={14} />
                </Link>
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 border border-white/10 text-text-primary font-mono text-xs tracking-wider uppercase px-6 py-3 rounded-lg hover:border-accent-electric/30 transition-colors"
                >
                  About Me
                </Link>
              </div>
            </div>

            <div className="lg:col-span-4 hidden lg:flex flex-col items-end gap-4">
              <div className="text-right">
                <div className="font-display text-8xl text-accent-electric/10 leading-none">
                  &lt;/&gt;
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="font-mono text-[10px] tracking-[0.2em] text-text-secondary/50 uppercase">
            Scroll
          </span>
          <div className="w-px h-8 bg-gradient-to-b from-accent-electric/50 to-transparent" />
        </div>
      </section>

      {/* ===== PHILOSOPHY ===== */}
      <section className="relative bg-cream py-24 overflow-hidden">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7">
              <SectionLabel text="PHILOSOPHY" className="!text-text-dark/40 mb-6 block" />
              <h2 className="font-display text-5xl sm:text-7xl leading-[0.9] text-text-dark">
                THE DIGITAL
                <br />
                <span className="text-stroke-electric">GARDEN</span>
                <br />
                & THE MACHINE
              </h2>
            </div>
            <div className="lg:col-span-5">
              <p className="font-body text-base text-text-dark/70 leading-relaxed mb-6">
                I believe in building software that feels alive &mdash; organic systems
                that grow and adapt, powered by precise engineering underneath.
              </p>
              <p className="font-hand text-lg text-text-dark/50 leading-relaxed">
                &ldquo;Code with intention, design with soul.&rdquo;
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== RECENT NOTES (Blog Preview) ===== */}
      <section className="relative py-24 overflow-hidden">
        <GradientBlobs
          color1="rgba(255, 45, 133, 0.08)"
          color2="rgba(0, 229, 255, 0.06)"
          color3="rgba(0, 245, 212, 0.04)"
        />
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="flex items-end justify-between mb-12">
            <div>
              <SectionLabel text="RECENT_NOTES" className="mb-3 block" />
              <h2 className="font-display text-4xl sm:text-5xl text-text-primary">
                FRESHLY BAKED
              </h2>
            </div>
            <Link
              href="/blog"
              className="hidden sm:inline-flex items-center gap-2 font-mono text-xs tracking-wider uppercase text-accent-electric hover:text-accent-pink transition-colors"
            >
              View All <ArrowRight size={14} />
            </Link>
          </div>

          {posts.length === 0 ? (
            <p className="font-body text-text-secondary">No posts yet &mdash; check back soon.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {posts.map((post) => (
                <BlogCard key={post.slug} post={post} />
              ))}
            </div>
          )}

          <div className="mt-8 sm:hidden">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 font-mono text-xs tracking-wider uppercase text-accent-electric"
            >
              View All Posts <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== DAILY SIGNAL PREVIEW ===== */}
      {latestNews && (() => {
        const CATEGORY_COLORS: Record<string, { bg: string; text: string; glow: string }> = {
          launch: { bg: "bg-rose-500/10", text: "text-rose-400", glow: "from-rose-500/20" },
          shift: { bg: "bg-blue-500/10", text: "text-blue-400", glow: "from-blue-500/20" },
          tool: { bg: "bg-emerald-500/10", text: "text-emerald-400", glow: "from-emerald-500/20" },
          research: { bg: "bg-violet-500/10", text: "text-violet-400", glow: "from-violet-500/20" },
          funding: { bg: "bg-amber-500/10", text: "text-amber-400", glow: "from-amber-500/20" },
          open_source: { bg: "bg-teal-500/10", text: "text-teal-400", glow: "from-teal-500/20" },
        };
        const topSignals = [...latestNews.signals]
          .sort((a, b) => a.display_order - b.display_order)
          .slice(0, 4);

        return (
          <section className="relative py-28 overflow-hidden">
            {/* Animated background grid */}
            <div className="absolute inset-0 opacity-[0.03]" style={{
              backgroundImage: `linear-gradient(rgba(0,229,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.3) 1px, transparent 1px)`,
              backgroundSize: "60px 60px",
            }} />

            {/* Glowing orbs */}
            <div className="absolute top-10 right-1/4 w-72 h-72 rounded-full bg-accent-electric/5 blur-[100px]" />
            <div className="absolute bottom-10 left-1/4 w-56 h-56 rounded-full bg-accent-pink/5 blur-[80px]" />

            <div className="relative mx-auto max-w-7xl px-6">
              {/* Header with live pulse */}
              <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-14 gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="relative flex items-center gap-2">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                      </span>
                      <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-emerald-400/80">
                        Live
                      </span>
                    </div>
                    <span className="w-px h-3 bg-white/10" />
                    <SectionLabel text="DAILY_SIGNAL" className="!mb-0 block" />
                  </div>
                  <h2 className="font-display text-5xl sm:text-6xl md:text-7xl text-text-primary leading-[0.9]">
                    AI SIGNALS
                    <br />
                    <span className="text-accent-electric">TODAY</span>
                  </h2>
                  <p className="font-body text-sm text-text-secondary mt-4 max-w-md">
                    {latestNews.signals.length} curated signals from across the AI ecosystem.
                    Scanned, filtered, and ready for builders.
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <a
                    href="/api/news/rss"
                    className="inline-flex items-center gap-1.5 border border-white/10 font-mono text-[10px] tracking-wider uppercase text-text-secondary/60 hover:text-accent-orange hover:border-accent-orange/30 px-4 py-2.5 rounded-lg transition-all"
                    title="RSS Feed"
                  >
                    <Rss size={12} /> Feed
                  </a>
                  <Link
                    href="/news"
                    className="inline-flex items-center gap-2 bg-accent-electric text-midnight font-mono text-xs tracking-wider uppercase px-6 py-3 rounded-lg hover:bg-accent-electric/90 transition-colors"
                  >
                    Explore <ArrowRight size={14} />
                  </Link>
                </div>
              </div>

              {/* Bento grid layout */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Main insight — large card */}
                {latestNews.issue.main_insight && (
                  <Link href="/news" className="md:col-span-7 group">
                    <div className="relative h-full p-6 md:p-8 rounded-2xl border border-white/[0.06] bg-surface/50 backdrop-blur-sm overflow-hidden hover:border-accent-electric/20 transition-all">
                      {/* Corner glow */}
                      <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-accent-electric/10 blur-[60px] group-hover:bg-accent-electric/15 transition-colors" />

                      <div className="relative">
                        <div className="flex items-center gap-2 mb-4">
                          <Sparkles size={14} className="text-accent-electric" />
                          <span className="font-mono text-[9px] tracking-[0.3em] uppercase text-accent-electric/70 font-bold">
                            Key Insight
                          </span>
                        </div>
                        <p className="font-body text-xl sm:text-2xl md:text-[26px] text-text-primary leading-relaxed font-light">
                          {latestNews.issue.main_insight}
                        </p>
                        <div className="mt-6 flex items-center gap-2 text-text-secondary/50 group-hover:text-accent-electric/70 transition-colors">
                          <span className="font-mono text-[10px] tracking-wider uppercase">Read full briefing</span>
                          <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </Link>
                )}

                {/* Signal count + radar mini widget */}
                <div className="md:col-span-5 flex flex-col gap-4">
                  {/* Stats card */}
                  <div className="p-5 rounded-2xl border border-white/[0.06] bg-surface/50 backdrop-blur-sm">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="font-display text-4xl text-accent-electric">{latestNews.signals.length}</div>
                        <div className="font-mono text-[8px] tracking-[0.2em] uppercase text-text-secondary/50 mt-1">Signals</div>
                      </div>
                      <div>
                        <div className="font-display text-4xl text-accent-pink">
                          {new Set(latestNews.signals.map(s => s.category)).size}
                        </div>
                        <div className="font-mono text-[8px] tracking-[0.2em] uppercase text-text-secondary/50 mt-1">Categories</div>
                      </div>
                      <div>
                        <div className="font-display text-4xl text-accent-teal">
                          {Math.round(latestNews.signals.reduce((a, s) => a + s.impact_score, 0) / latestNews.signals.length * 10) / 10}
                        </div>
                        <div className="font-mono text-[8px] tracking-[0.2em] uppercase text-text-secondary/50 mt-1">Avg Impact</div>
                      </div>
                    </div>
                  </div>

                  {/* Top 2 signals stacked */}
                  {topSignals.slice(0, 2).map((signal, i) => {
                    const colors = CATEGORY_COLORS[signal.category] || { bg: "bg-white/5", text: "text-text-secondary", glow: "from-white/10" };
                    return (
                      <Link key={signal.id} href="/news" className="group">
                        <div className="relative p-4 rounded-2xl border border-white/[0.06] bg-surface/50 backdrop-blur-sm overflow-hidden hover:border-white/10 transition-all">
                          <div className={`absolute -bottom-6 -right-6 w-20 h-20 rounded-full bg-gradient-to-t ${colors.glow} to-transparent blur-2xl opacity-0 group-hover:opacity-100 transition-opacity`} />
                          <div className="relative flex items-start gap-3">
                            <span className={`mt-0.5 shrink-0 w-1.5 h-1.5 rounded-full ${colors.bg} ring-2 ${colors.text.replace("text-", "ring-")}/30`} style={{ backgroundColor: "currentColor" }}>
                              <span className={`block w-1.5 h-1.5 rounded-full ${colors.text.replace("text-", "bg-")}`} />
                            </span>
                            <div className="min-w-0">
                              <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-bold tracking-[0.15em] uppercase ${colors.bg} ${colors.text} mb-1.5`}>
                                {signal.category.replace("_", " ")}
                              </span>
                              <h3 className="font-body text-[14px] text-text-primary leading-snug group-hover:text-accent-electric transition-colors">
                                {signal.title}
                              </h3>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {/* Bottom row: remaining signals as horizontal cards */}
                {topSignals.slice(2, 4).map((signal) => {
                  const colors = CATEGORY_COLORS[signal.category] || { bg: "bg-white/5", text: "text-text-secondary", glow: "from-white/10" };
                  return (
                    <Link key={signal.id} href="/news" className="md:col-span-6 group">
                      <div className="relative p-5 rounded-2xl border border-white/[0.06] bg-surface/50 backdrop-blur-sm overflow-hidden hover:border-white/10 transition-all">
                        <div className={`absolute -bottom-8 -right-8 w-24 h-24 rounded-full bg-gradient-to-t ${colors.glow} to-transparent blur-2xl opacity-0 group-hover:opacity-100 transition-opacity`} />
                        <div className="relative">
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-bold tracking-[0.15em] uppercase ${colors.bg} ${colors.text} mb-2`}>
                            {signal.category.replace("_", " ")}
                          </span>
                          <h3 className="font-body text-[15px] text-text-primary leading-snug mb-1.5 group-hover:text-accent-electric transition-colors">
                            {signal.title}
                          </h3>
                          <p className="font-body text-[12px] text-text-secondary/60 leading-relaxed line-clamp-2">
                            {signal.so_what || signal.summary}
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Mobile CTA */}
              <div className="mt-8 sm:hidden flex items-center gap-4">
                <Link
                  href="/news"
                  className="inline-flex items-center gap-2 bg-accent-electric text-midnight font-mono text-xs tracking-wider uppercase px-6 py-3 rounded-lg"
                >
                  Explore Signals <ArrowRight size={14} />
                </Link>
                <a
                  href="/api/news/rss"
                  className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-wider uppercase text-text-secondary/50"
                >
                  <Rss size={12} /> Feed
                </a>
              </div>
            </div>
          </section>
        );
      })()}

      {/* ===== PROJECTS PREVIEW ===== */}
      <section className="relative py-24 overflow-hidden">
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="flex items-end justify-between mb-12">
            <div>
              <SectionLabel text="SELECTED_WORK" className="mb-3 block" />
              <h2 className="font-display text-4xl sm:text-5xl text-text-primary">
                PROJECTS
              </h2>
            </div>
            <Link
              href="/portfolio"
              className="hidden sm:inline-flex items-center gap-2 font-mono text-xs tracking-wider uppercase text-accent-electric hover:text-accent-orange transition-colors"
            >
              View All <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Large featured card */}
            {featuredProjects[0] && (
              <div className="md:col-span-8">
                <Link href={featuredProjects[0].websitelink || featuredProjects[0].codelink || "#"} target="_blank" rel="noreferrer">
                  <GlassCard className="group relative h-72 md:h-96 overflow-hidden">
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105 opacity-60 group-hover:opacity-80"
                      style={{ backgroundImage: `url(${featuredProjects[0].image})` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-midnight via-midnight/50 to-transparent" />
                    <div className="relative h-full flex flex-col justify-end p-6 md:p-8">
                      <span className="font-mono text-[10px] tracking-[0.2em] text-accent-orange uppercase mb-2">
                        Featured
                      </span>
                      <h3 className="font-display text-3xl md:text-4xl text-text-primary">
                        {featuredProjects[0].title.toUpperCase()}
                      </h3>
                      <p className="font-body text-sm text-text-secondary mt-2 max-w-md">
                        {featuredProjects[0].description}
                      </p>
                    </div>
                  </GlassCard>
                </Link>
              </div>
            )}

            {/* Two smaller cards */}
            <div className="md:col-span-4 flex flex-col gap-6">
              {featuredProjects.slice(1, 3).map((project) => (
                <Link key={project.id} href={project.websitelink || project.codelink || "#"} target="_blank" rel="noreferrer">
                  <GlassCard className="group relative h-44 overflow-hidden">
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105 opacity-50 group-hover:opacity-70"
                      style={{ backgroundImage: `url(${project.image})` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-midnight via-midnight/60 to-transparent" />
                    <div className="relative h-full flex flex-col justify-end p-5">
                      <h3 className="font-display text-xl text-text-primary">
                        {project.title.toUpperCase()}
                      </h3>
                    </div>
                  </GlassCard>
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-8 sm:hidden">
            <Link
              href="/portfolio"
              className="inline-flex items-center gap-2 font-mono text-xs tracking-wider uppercase text-accent-electric"
            >
              View All Projects <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== STATS BAR ===== */}
      <section className="border-y border-white/5 py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { number: "5+", label: "Projects" },
              { number: "10+", label: "Technologies" },
              { number: "3+", label: "Years Coding" },
              { number: "\u221E", label: "Curiosity" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="font-display text-5xl md:text-6xl text-accent-electric">
                  {stat.number}
                </div>
                <div className="font-mono text-xs tracking-[0.15em] uppercase text-text-secondary mt-2">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="relative py-32 overflow-hidden">
        <GradientBlobs
          color1="rgba(0, 229, 255, 0.08)"
          color2="rgba(255, 210, 63, 0.06)"
        />
        <div className="relative mx-auto max-w-7xl px-6 text-center">
          <h2 className="font-display text-5xl sm:text-7xl md:text-8xl text-text-primary leading-[0.9]">
            LET&apos;S CREATE
            <br />
            SOMETHING <span className="text-accent-electric">REAL.</span>
          </h2>
          <p className="font-body text-text-secondary mt-6 max-w-md mx-auto">
            Got an idea, a project, or just want to say hi?
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-accent-electric text-midnight font-mono text-xs tracking-wider uppercase px-8 py-4 rounded-lg hover:bg-accent-electric/90 transition-colors"
            >
              Get in Touch <ArrowRight size={14} />
            </Link>
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 border border-white/10 text-text-primary font-mono text-xs tracking-wider uppercase px-8 py-4 rounded-lg hover:border-accent-teal/30 transition-colors"
            >
              Chat with AI Me
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
