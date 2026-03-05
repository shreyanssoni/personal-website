import type { MetadataRoute } from "next";
import { getLatestIssues } from "@/lib/newsletter";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://themicrobits.com";

  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1.0 },
    { url: `${siteUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/portfolio`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}/garden`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${siteUrl}/news`, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${siteUrl}/contact`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.5 },
    { url: `${siteUrl}/chat`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  ];

  // Add each news issue as its own URL for deep indexing
  let newsPages: MetadataRoute.Sitemap = [];
  try {
    const issues = await getLatestIssues(90);
    newsPages = issues.map((issue) => {
      const dateStr = String(
        typeof issue.issue_date === "object" && issue.issue_date !== null && "toISOString" in issue.issue_date
          ? (issue.issue_date as Date).toISOString()
          : issue.issue_date
      ).slice(0, 10);
      return {
        url: `${siteUrl}/news?date=${dateStr}`,
        lastModified: new Date(dateStr + "T12:00:00Z"),
        changeFrequency: "daily" as const,
        priority: 0.9,
      };
    });
  } catch {}

  return [...staticPages, ...newsPages];
}
