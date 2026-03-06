import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getLatestIssues, getIssueByDate, getSignalsByIssue } from "@/lib/newsletter";

function toDateStr(d: string | Date): string {
  if (typeof d === "object" && d !== null && "toISOString" in d) {
    return (d as Date).toISOString().slice(0, 10);
  }
  return String(d).slice(0, 10);
}

interface Props {
  params: Promise<{ date: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { date } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://shreyanssoni.vercel.app";

  // Validate date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return { title: "Not Found" };
  }

  const issue = await getIssueByDate(date);
  if (!issue) {
    return { title: "Not Found" };
  }

  const d = new Date(date + "T12:00:00Z");
  const formatted = d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const title = `AI Signals for ${formatted} — The Daily Vibe Code`;
  const description = issue.main_insight
    ? `${issue.main_insight} Plus ${issue.signal_count} more curated AI signals for builders.`
    : `${issue.signal_count} curated AI signals for developers and founders — ${formatted}`;

  return {
    title,
    description,
    alternates: { canonical: `${siteUrl}/news/${date}` },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/news/${date}`,
      siteName: "The MicroBits",
      type: "article",
      locale: "en_US",
      publishedTime: `${date}T12:00:00Z`,
    },
    twitter: { card: "summary_large_image", title, description },
    robots: { index: true, follow: true },
  };
}

/** Generate static params for the last 90 days of issues */
export async function generateStaticParams() {
  try {
    const issues = await getLatestIssues(90);
    return issues.map((issue) => ({
      date: toDateStr(issue.issue_date),
    }));
  } catch {
    return [];
  }
}

export const revalidate = 1800;

/**
 * /news/[date] → redirects to /news?date=YYYY-MM-DD
 * This route exists for clean URLs and SEO.
 * The actual rendering happens on /news with searchParams.
 */
export default async function NewsDatePage({ params }: Props) {
  const { date } = await params;

  // Validate date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    redirect("/news");
  }

  redirect(`/news?date=${date}`);
}
