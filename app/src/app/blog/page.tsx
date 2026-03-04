import type { Metadata } from "next";
import { getPosts } from "@/lib/blog";
import BlogCard from "@/components/BlogCard";
import GradientBlobs from "@/components/GradientBlobs";
import SectionLabel from "@/components/SectionLabel";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Tech. Entrepreneurship. Electronics. Psychology? Read more about my ideas and thoughts.",
};

export const revalidate = 3600;

export default async function BlogList() {
  let posts: Awaited<ReturnType<typeof getPosts>> = [];
  try {
    posts = await getPosts();
  } catch {
    posts = [];
  }

  const featured = posts[0];
  const rest = posts.slice(1);

  return (
    <>
      {/* ===== HERO ===== */}
      <section className="relative min-h-[60vh] flex items-end overflow-hidden paper-texture">
        <GradientBlobs
          color1="rgba(255, 45, 133, 0.12)"
          color2="rgba(0, 245, 212, 0.08)"
          color3="rgba(0, 229, 255, 0.05)"
        />
        <div className="relative mx-auto max-w-7xl px-6 pb-16 pt-32 w-full">
          <SectionLabel text="THE_GARDEN" className="mb-4 block" />
          <h1 className="font-serif text-5xl sm:text-7xl italic text-text-primary leading-[0.95] mb-6">
            A Walk Through<br />
            <span className="text-accent-pink">Thought</span>
          </h1>
          <p className="font-hand text-lg text-text-secondary/70 max-w-md">
            &ldquo;every word a seed, every page a garden&rdquo;
          </p>
        </div>
      </section>

      {/* ===== FEATURED POST ===== */}
      {featured && (
        <section className="relative py-16 overflow-hidden">
          <div className="mx-auto max-w-7xl px-6">
            <SectionLabel text="FEATURED" className="mb-6 block" />
            <a href={`/blog/${featured.slug}`} className="group block">
              <div className="glass-card rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
                <div className="relative h-64 md:h-auto overflow-hidden">
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-all duration-700 saturate-[0.8] brightness-95 group-hover:saturate-100 group-hover:brightness-100 group-hover:scale-105"
                    style={{
                      backgroundImage: `url(${featured.feature_image || "/assets/img/post-01.png"})`,
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-surface/50 hidden md:block" />
                </div>
                <div className="p-8 md:p-12 flex flex-col justify-center">
                  <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-accent-pink mb-4">
                    Latest Story
                  </span>
                  <h2 className="font-serif text-2xl md:text-3xl font-bold text-text-primary group-hover:text-accent-pink transition-colors leading-tight mb-4">
                    {featured.title}
                  </h2>
                  <p className="font-body text-sm text-text-secondary leading-relaxed mb-4">
                    {featured.excerpt?.substring(0, 200)}...
                  </p>
                  <span className="font-mono text-xs text-accent-teal tracking-wider uppercase">
                    Read More &rarr;
                  </span>
                </div>
              </div>
            </a>
          </div>
        </section>
      )}

      {/* ===== BLOG GRID ===== */}
      <section className="relative py-16 overflow-hidden">
        <div className="mx-auto max-w-7xl px-6">
          {rest.length > 0 && (
            <>
              <SectionLabel text="ALL_POSTS" className="mb-8 block" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rest.map((post) => (
                  <BlogCard key={post.slug} post={post} />
                ))}
              </div>
            </>
          )}

          {posts.length === 0 && (
            <div className="text-center py-20">
              <p className="font-body text-text-secondary text-lg">
                No posts yet &mdash; seeds are being planted.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
