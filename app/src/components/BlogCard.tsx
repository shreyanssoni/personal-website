import Link from "next/link";
import type { BlogPost } from "@/lib/blog";

function formatDate(dateStr: string | null) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const month = date.toLocaleString("default", { month: "short" });
  const day = date.getUTCDate();
  const year = date.getFullYear();
  return `${day} ${month}, ${year}`;
}

export default function BlogCard({ post }: { post: BlogPost }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <div className="glass-card rounded-2xl overflow-hidden transition-all duration-500 hover:border-accent-pink/20">
        {/* Image */}
        <div className="relative h-48 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center transition-all duration-700 saturate-[0.8] brightness-95 group-hover:saturate-100 group-hover:brightness-100 group-hover:scale-105"
            style={{
              backgroundImage: `url(${post.feature_image || "/assets/img/post-01.png"})`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent" />
        </div>

        {/* Content */}
        <div className="p-5">
          <span className="inline-block font-mono text-[10px] tracking-[0.15em] uppercase text-accent-pink mb-3">
            {formatDate(post.published_at)}
          </span>
          <h3 className="font-serif text-lg font-bold text-text-primary group-hover:text-accent-pink transition-colors leading-tight mb-2">
            {post.title}
          </h3>
          <p className="font-body text-sm text-text-secondary leading-relaxed line-clamp-2">
            {post.excerpt?.substring(0, 120)}...
          </p>
        </div>
      </div>
    </Link>
  );
}
