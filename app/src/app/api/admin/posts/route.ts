import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdminRequest } from "@/lib/admin-auth";
import { sql } from "@/lib/db";

// Create a new post
export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, slug, content_html, excerpt, feature_image, tags, published } = body;

    if (!title || !slug) {
      return NextResponse.json(
        { error: "Title and slug are required" },
        { status: 400 }
      );
    }

    const rows = await sql`
      INSERT INTO blog_posts (title, slug, content_html, excerpt, feature_image, tags, published, published_at)
      VALUES (
        ${title},
        ${slug},
        ${content_html || ""},
        ${excerpt || ""},
        ${feature_image || ""},
        ${tags || []},
        ${published || false},
        ${published ? new Date().toISOString() : null}
      )
      RETURNING *
    `;

    revalidatePath("/", "layout");
    return NextResponse.json({ post: rows[0] });
  } catch (error) {
    console.error("Create post error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// List all posts (admin)
export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const rows = await sql`
      SELECT * FROM blog_posts ORDER BY updated_at DESC
    `;
    return NextResponse.json({ posts: rows });
  } catch (error) {
    console.error("List posts error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
