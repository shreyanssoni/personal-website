import { createServerClient } from "./supabase";

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
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("published", true)
    .order("published_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch posts:", error);
    return [];
  }
  return data || [];
}

export async function getRecentPosts(limit = 3): Promise<BlogPost[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("published", true)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Failed to fetch recent posts:", error);
    return [];
  }
  return data || [];
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (error) {
    console.error("Failed to fetch post:", error);
    return null;
  }
  return data;
}

export async function getFeaturedPosts(limit = 3): Promise<BlogPost[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("published", true)
    .eq("featured", true)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Failed to fetch featured posts:", error);
    return [];
  }

  // If we have enough featured posts, return them
  if (data.length >= limit) {
    return data;
  }

  // Fill remaining slots with recent non-featured posts
  let query = supabase
    .from("blog_posts")
    .select("*")
    .eq("published", true)
    .order("published_at", { ascending: false })
    .limit(limit - data.length);

  if (data.length > 0) {
    const featuredIds = data.map((p) => p.id);
    query = query.not("id", "in", `(${featuredIds.join(",")})`);
  }

  const { data: filler } = await query;
  return [...data, ...(filler || [])];
}

// Admin: get all posts including drafts
export async function getAllPosts(): Promise<BlogPost[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch all posts:", error);
    return [];
  }
  return data || [];
}

// Admin: get single post by ID (including drafts)
export async function getPostById(id: string): Promise<BlogPost | null> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Failed to fetch post by id:", error);
    return null;
  }
  return data;
}
