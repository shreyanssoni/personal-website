import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPosts, getPostBySlug } from "@/lib/blog";
import BlogBackButton from "./BackButton";

export const revalidate = 3600;

export async function generateStaticParams() {
  try {
    const posts = await getPosts();
    return posts.map((post) => ({ slug: post.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  try {
    const { slug } = await params;
    const post = await getPostBySlug(slug);
    return {
      title: post?.title || "Blog Post",
      description: post?.excerpt || "",
    };
  } catch {
    return { title: "Blog Post" };
  }
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="bg-cream min-h-screen">
      <div className="mx-auto max-w-3xl px-6 py-32">
        <BlogBackButton />

        {/* Meta */}
        <div className="mt-6 mb-8">
          <span className="font-mono text-xs tracking-[0.15em] uppercase text-text-dark/40">
            {formatDate(post.published_at)} &middot; Shreyans Soni
          </span>
        </div>

        {/* Title */}
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-text-dark leading-tight mb-6">
          {post.title}
        </h1>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="font-mono text-[10px] tracking-wider uppercase bg-accent-pink/10 text-accent-pink px-3 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Excerpt */}
        {post.excerpt && (
          <p className="font-body text-lg text-text-dark/60 italic mb-8 border-l-2 border-accent-pink/30 pl-4">
            {post.excerpt}
          </p>
        )}

        {/* Feature image */}
        {post.feature_image && (
          <div className="mb-12 rounded-2xl overflow-hidden">
            <img
              src={post.feature_image}
              alt={post.title}
              className="w-full h-auto"
            />
          </div>
        )}

        {/* Content */}
        <div
          className="prose prose-lg max-w-none prose-custom font-body"
          dangerouslySetInnerHTML={{ __html: post.content_html }}
        />
      </div>
    </article>
  );
}
