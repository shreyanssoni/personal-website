import { sql } from "./db";

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
  try {
    const rows = await sql`
      SELECT * FROM portfolio_projects
      WHERE published = true
      ORDER BY display_order ASC
    `;
    return rows as Project[];
  } catch (error) {
    console.error("Failed to fetch projects:", error);
    return [];
  }
}

export async function getFeaturedProjects(limit = 3): Promise<Project[]> {
  try {
    const featured = await sql`
      SELECT * FROM portfolio_projects
      WHERE published = true AND featured = true
      ORDER BY display_order ASC
      LIMIT ${limit}
    ` as Project[];

    if (featured.length >= limit) return featured;

    const featuredIds = featured.map((p) => p.id);
    const remaining = limit - featured.length;

    const filler = featuredIds.length > 0
      ? await sql`
          SELECT * FROM portfolio_projects
          WHERE published = true AND id != ALL(${featuredIds})
          ORDER BY display_order ASC
          LIMIT ${remaining}
        `
      : await sql`
          SELECT * FROM portfolio_projects
          WHERE published = true
          ORDER BY display_order ASC
          LIMIT ${remaining}
        `;

    return [...featured, ...(filler as Project[])];
  } catch (error) {
    console.error("Failed to fetch featured projects:", error);
    return [];
  }
}

export async function getAllProjects(): Promise<Project[]> {
  try {
    const rows = await sql`
      SELECT * FROM portfolio_projects
      ORDER BY display_order ASC
    `;
    return rows as Project[];
  } catch (error) {
    console.error("Failed to fetch all projects:", error);
    return [];
  }
}

export async function getProjectById(id: string): Promise<Project | null> {
  try {
    const rows = await sql`
      SELECT * FROM portfolio_projects
      WHERE id = ${id}
      LIMIT 1
    `;
    return (rows[0] as Project) || null;
  } catch (error) {
    console.error("Failed to fetch project by id:", error);
    return null;
  }
}
