import { createServerClient } from "./supabase";

export interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  codelink: string;
  websitelink: string;
  tags: string[];
  featured: boolean;
  display_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export async function getProjects(): Promise<Project[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("portfolio_projects")
    .select("*")
    .eq("published", true)
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Failed to fetch projects:", error);
    return [];
  }
  return data || [];
}

export async function getFeaturedProjects(limit = 3): Promise<Project[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("portfolio_projects")
    .select("*")
    .eq("published", true)
    .eq("featured", true)
    .order("display_order", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("Failed to fetch featured projects:", error);
    return [];
  }

  if (data.length >= limit) {
    return data;
  }

  // Fill remaining slots with recent non-featured projects
  let query = supabase
    .from("portfolio_projects")
    .select("*")
    .eq("published", true)
    .order("display_order", { ascending: true })
    .limit(limit - data.length);

  if (data.length > 0) {
    const featuredIds = data.map((p) => p.id);
    query = query.not("id", "in", `(${featuredIds.join(",")})`);
  }

  const { data: filler } = await query;
  return [...data, ...(filler || [])];
}

// Admin: get all projects including unpublished
export async function getAllProjects(): Promise<Project[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("portfolio_projects")
    .select("*")
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Failed to fetch all projects:", error);
    return [];
  }
  return data || [];
}

// Admin: get single project by ID
export async function getProjectById(id: string): Promise<Project | null> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("portfolio_projects")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Failed to fetch project by id:", error);
    return null;
  }
  return data;
}
