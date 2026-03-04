import { createServerClient } from "./supabase";

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
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("garden_pieces")
    .select("*")
    .eq("published", true)
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Failed to fetch garden pieces:", error);
    return [];
  }
  return data || [];
}

export async function getGardenPiecesByType(
  type: GardenPieceType
): Promise<GardenPiece[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("garden_pieces")
    .select("*")
    .eq("type", type)
    .eq("published", true)
    .order("display_order", { ascending: true });

  if (error) {
    console.error(`Failed to fetch garden ${type}:`, error);
    return [];
  }
  return data || [];
}

export async function getAllGardenPieces(): Promise<GardenPiece[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("garden_pieces")
    .select("*")
    .order("type", { ascending: true })
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Failed to fetch all garden pieces:", error);
    return [];
  }
  return data || [];
}

export async function getGardenPieceById(
  id: string
): Promise<GardenPiece | null> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("garden_pieces")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Failed to fetch garden piece:", error);
    return null;
  }
  return data;
}
