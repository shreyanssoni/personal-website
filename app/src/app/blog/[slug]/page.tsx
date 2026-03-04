import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPosts, getPostBySlug } from "@/lib/blog";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import styles from "@/styles/Blog.module.css";
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
  const month = date.toLocaleString("default", { month: "short" });
  const day = date.getUTCDate();
  const year = date.getFullYear();
  return `${day} ${month}, ${year}`;
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
    <>
      <Navbar color="black" />
      <div className={styles.blogmaindiv} style={{ background: "#ffeddf" }}>
        <div className={styles.pagecontent}>
          <BlogBackButton />

          <div className={styles.blogdate}>
            {formatDate(post.published_at)} &#183; Shreyans Soni
          </div>

          <div className={styles.blogtitle}>{post.title}</div>

          {post.tags && post.tags.length > 0 && (
            <div>
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontFamily: "var(--font-montserrat)",
                    background: "#dc7561",
                  }}
                  className="py-0.5 px-2 mr-0.5 text-[11px] text-white rounded-xl inline-block"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className={styles.metadesc}>{post.excerpt}</div>

          {post.feature_image && (
            <div className={styles.blogimage}>
              <img src={post.feature_image} alt={post.title} />
            </div>
          )}

          <div
            className={`${styles.blogcontent} prose prose-lg max-w-none`}
            dangerouslySetInnerHTML={{ __html: post.content_html }}
          />
        </div>
      </div>
      <Footer />
    </>
  );
}
