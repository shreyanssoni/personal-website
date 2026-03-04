import Link from "next/link";
import { getRecentPosts } from "@/lib/blog";
import BlogCard from "@/components/BlogCard";
import PortfolioGrid from "@/components/PortfolioGrid";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import profile from "@/data/profile.json";
import projects from "@/data/projects.json";
import styles from "@/styles/Home.module.css";

export default async function Home() {
  let posts: Awaited<ReturnType<typeof getRecentPosts>> = [];
  try {
    posts = await getRecentPosts(3);
  } catch {
    posts = [];
  }

  return (
    <>
      <Navbar color="white" />
      <div className={styles.headercontainer}>
        <div className="text-[30px] font-bold mt-auto mx-14">
          hi, I&apos;m <span>{profile.name}</span>
        </div>
        <div className="mx-14 text-[16px]">an Avid Coder | Human</div>
        <button className="mx-14 mt-5 mb-auto">
          <a href={profile.link} rel="noreferrer" target="_blank">
            Download CV
          </a>
        </button>
      </div>

      <div className="flex flex-col items-center">
        <div className={styles.blogconttitle}>
          <h2>Freshly Baked</h2>
        </div>
        <div className={styles.blogcardcontainer}>
          {posts.length === 0 && <span>No Blogs Present :/</span>}
          {posts.map((post) => (
            <BlogCard
              key={post.slug}
              post={post}
              className={styles.blog}
              imgClassName={styles.blogImg}
            />
          ))}
        </div>
        <div className="py-2 bg-slate-800 w-full flex justify-center">
          <Link href="/blog">
            <span className={styles.readmorebutton}>READ MORE</span>
          </Link>
        </div>
      </div>

      <PortfolioGrid projects={projects} limit={3} />
      <Footer />
    </>
  );
}
