import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { createServerClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      type,
      title,
      subtitle,
      quote,
      description,
      content_html,
      image_url,
      link_url,
      label,
      display_order,
      published,
    } = body;

    if (!type || !title) {
      return NextResponse.json(
        { error: "Type and title are required" },
        { status: 400 }
      );
    }

    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("garden_pieces")
      .insert({
        type,
        title,
        subtitle: subtitle || "",
        quote: quote || "",
        description: description || "",
        content_html: content_html || "",
        image_url: image_url || "",
        link_url: link_url || "",
        label: label || "",
        display_order: display_order || 0,
        published: published || false,
      })
      .select()
      .single();

    if (error) {
      console.error("Create garden piece error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ piece: data });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("garden_pieces")
    .select("*")
    .order("type", { ascending: true })
    .order("display_order", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ pieces: data });
}
