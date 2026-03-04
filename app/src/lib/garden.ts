import { sql } from "./db";

export type GardenPieceType = "hero" | "fragment" | "featured" | "artifact";

export interface GardenPiece {
  id: string;
  type: GardenPieceType;
  title: string;
  subtitle: string;
  quote: string;
  description: string;
  content_html: string;
  image_url: string;
  link_url: string;
  label: string;
  display_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export async function getGardenPieces(): Promise<GardenPiece[]> {
  try {
    const rows = await sql`
      SELECT * FROM garden_pieces
      WHERE published = true
      ORDER BY display_order ASC
    `;
    return rows as GardenPiece[];
  } catch (error) {
    console.error("Failed to fetch garden pieces:", error);
    return [];
  }
}

export async function getGardenPiecesByType(
  type: GardenPieceType
): Promise<GardenPiece[]> {
  try {
    const rows = await sql`
      SELECT * FROM garden_pieces
      WHERE published = true AND type = ${type}
      ORDER BY display_order ASC
    `;
    return rows as GardenPiece[];
  } catch (error) {
    console.error(`Failed to fetch garden ${type}:`, error);
    return [];
  }
}

export async function getAllGardenPieces(): Promise<GardenPiece[]> {
  try {
    const rows = await sql`
      SELECT * FROM garden_pieces
      ORDER BY type ASC, display_order ASC
    `;
    return rows as GardenPiece[];
  } catch (error) {
    console.error("Failed to fetch all garden pieces:", error);
    return [];
  }
}

export async function getGardenPieceById(
  id: string
): Promise<GardenPiece | null> {
  try {
    const rows = await sql`
      SELECT * FROM garden_pieces
      WHERE id = ${id}
      LIMIT 1
    `;
    return (rows[0] as GardenPiece) || null;
  } catch (error) {
    console.error("Failed to fetch garden piece:", error);
    return null;
  }
}
