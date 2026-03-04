import type { Metadata } from "next";
import { getPosts } from "@/lib/blog";
import BlogCard from "@/components/BlogCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import styles from "@/styles/Blog.module.css";

export const metadata: Metadata = {
  title: "Blogs",
  description:
    "Tech. Entrepreneurship. Electronics. Psychology? This is Shreyans Soni. Read more about my ideas and thoughts from my published blogs.",
};

export const revalidate = 3600; // ISR: revalidate every hour

export default async function BlogList() {
  let posts: Awaited<ReturnType<typeof getPosts>> = [];
  try {
    posts = await getPosts();
  } catch {
    posts = [];
  }

  return (
    <>
      <Navbar color="white" />
      <div className={styles.blogheader}>
        <div className={styles.innerdivblog}>
          <h2
            style={{ fontFamily: "var(--font-source-code)" }}
            className={styles.headerblogtitle}
          >
            Tech. Entrepreneurship. Electronics. Psychology?
          </h2>
          <p
            className={styles.headerblogtitlep}
            style={{ fontFamily: "var(--font-source-code)" }}
          >
            That&apos;s me. That&apos;s{" "}
            <span
              className="text-[28px]"
              style={{ fontFamily: "var(--font-square-peg)" }}
            >
              Shreyans.
            </span>
          </p>
        </div>
      </div>
      <div className={styles.maindiv}>
        <div className={styles.blogcardcontainer}>
          {posts.map((post) => (
            <BlogCard
              key={post.slug}
              post={post}
              className={styles.blog}
              imgClassName={styles.blogImg}
            />
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
}
