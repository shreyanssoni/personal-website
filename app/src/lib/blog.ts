import { sql } from "./db";

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content_html: string;
  excerpt: string;
  feature_image: string;
  tags: string[];
  published: boolean;
  featured: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export async function getPosts(): Promise<BlogPost[]> {
  try {
    const rows = await sql`
      SELECT * FROM blog_posts
      WHERE published = true
      ORDER BY published_at DESC
    `;
    return rows as BlogPost[];
  } catch (error) {
    console.error("Failed to fetch posts:", error);
    return [];
  }
}

export async function getRecentPosts(limit = 3): Promise<BlogPost[]> {
  try {
    const rows = await sql`
      SELECT * FROM blog_posts
      WHERE published = true
      ORDER BY published_at DESC
      LIMIT ${limit}
    `;
    return rows as BlogPost[];
  } catch (error) {
    console.error("Failed to fetch recent posts:", error);
    return [];
  }
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const rows = await sql`
      SELECT * FROM blog_posts
      WHERE slug = ${slug} AND published = true
      LIMIT 1
    `;
    return (rows[0] as BlogPost) || null;
  } catch (error) {
    console.error("Failed to fetch post:", error);
    return null;
  }
}

export async function getFeaturedPosts(limit = 3): Promise<BlogPost[]> {
  try {
    const featured = await sql`
      SELECT * FROM blog_posts
      WHERE published = true AND featured = true
      ORDER BY published_at DESC
      LIMIT ${limit}
    ` as BlogPost[];

    if (featured.length >= limit) return featured;

    const featuredIds = featured.map((p) => p.id);
    const remaining = limit - featured.length;

    const filler = featuredIds.length > 0
      ? await sql`
          SELECT * FROM blog_posts
          WHERE published = true AND id != ALL(${featuredIds})
          ORDER BY published_at DESC
          LIMIT ${remaining}
        `
      : await sql`
          SELECT * FROM blog_posts
          WHERE published = true
          ORDER BY published_at DESC
          LIMIT ${remaining}
        `;

    return [...featured, ...(filler as BlogPost[])];
  } catch (error) {
    console.error("Failed to fetch featured posts:", error);
    return [];
  }
}

export async function getAllPosts(): Promise<BlogPost[]> {
  try {
    const rows = await sql`
      SELECT * FROM blog_posts
      ORDER BY updated_at DESC
    `;
    return rows as BlogPost[];
  } catch (error) {
    console.error("Failed to fetch all posts:", error);
    return [];
  }
}

export async function getPostById(id: string): Promise<BlogPost | null> {
  try {
    const rows = await sql`
      SELECT * FROM blog_posts
      WHERE id = ${id}
      LIMIT 1
    `;
    return (rows[0] as BlogPost) || null;
  } catch (error) {
    console.error("Failed to fetch post by id:", error);
    return null;
  }
}
