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

export default function BlogCard({
  post,
  className,
  imgClassName,
}: {
  post: BlogPost;
  className?: string;
  imgClassName?: string;
}) {
  return (
    <Link href={`/blog/${post.slug}`}>
      <div className={className}>
        <div
          style={{
            backgroundImage: `url(${
              post.feature_image || "/assets/img/post-01.png"
            })`,
          }}
          className={imgClassName}
        ></div>
        <div className="py-1 pl-0.5">
          <span
            style={{ fontFamily: "var(--font-josefin)" }}
            className="text-[13px] font-bold bg-white text-black px-1.5 py-0.5 rounded-lg"
          >
            {formatDate(post.published_at)}
          </span>
        </div>
        <h2
          className="font-bold text-[18px] px-1"
          style={{ fontFamily: "var(--font-josefin)" }}
        >
          {post.title}
        </h2>
        <p
          className="pl-1 text-[14px] max-h-[100px] overflow-hidden"
          style={{ fontFamily: "var(--font-josefin)" }}
        >
          {post.excerpt?.substring(0, 150)}...
        </p>
      </div>
    </Link>
  );
}
