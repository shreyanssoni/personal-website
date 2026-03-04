import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { isAdminRequest } from "@/lib/admin-auth";
import { createServerClient } from "@/lib/supabase";

// Create a new project
export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, description, image, codelink, websitelink, tags, featured, display_order, published } = body;

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("portfolio_projects")
      .insert({
        title,
        description: description || "",
        image: image || "",
        codelink: codelink || "",
        websitelink: websitelink || "",
        tags: tags || [],
        featured: featured || false,
        display_order: display_order ?? 0,
        published: published ?? true,
      })
      .select()
      .single();

    if (error) {
      console.error("Create project error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    revalidateTag("supabase");
    return NextResponse.json({ project: data });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// List all projects (admin)
export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("portfolio_projects")
    .select("*")
    .order("display_order", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ projects: data });
}
