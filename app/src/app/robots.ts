import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://shreyanssoni.vercel.app").replace(/\/+$/, "");
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/api/og/", "/api/news/rss"],
        disallow: ["/api/", "/admin/"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
