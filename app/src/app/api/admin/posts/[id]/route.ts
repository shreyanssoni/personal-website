import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdminRequest } from "@/lib/admin-auth";
import { sql } from "@/lib/db";

// Update a post
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const { title, slug, content_html, excerpt, feature_image, tags, published, featured } = body;

    // If publishing for the first time, set published_at
    let publishedAt = undefined;
    if (published) {
      const existing = await sql`
        SELECT published_at FROM blog_posts WHERE id = ${id} LIMIT 1
      `;
      if (!existing[0]?.published_at) {
        publishedAt = new Date().toISOString();
      }
    }

    const rows = publishedAt !== undefined
      ? await sql`
          UPDATE blog_posts SET
            title = ${title},
            slug = ${slug},
            content_html = ${content_html},
            excerpt = ${excerpt},
            feature_image = ${feature_image},
            tags = ${tags},
            published = ${published},
            featured = ${featured ?? false},
            published_at = ${publishedAt},
            updated_at = ${new Date().toISOString()}
          WHERE id = ${id}
          RETURNING *
        `
      : await sql`
          UPDATE blog_posts SET
            title = ${title},
            slug = ${slug},
            content_html = ${content_html},
            excerpt = ${excerpt},
            feature_image = ${feature_image},
            tags = ${tags},
            published = ${published},
            featured = ${featured ?? false},
            updated_at = ${new Date().toISOString()}
          WHERE id = ${id}
          RETURNING *
        `;

    revalidatePath("/", "layout");
    return NextResponse.json({ post: rows[0] });
  } catch (error) {
    console.error("Update post error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Delete a post
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    await sql`DELETE FROM blog_posts WHERE id = ${id}`;

    revalidatePath("/", "layout");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete post error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Get single post
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const rows = await sql`
      SELECT * FROM blog_posts WHERE id = ${id} LIMIT 1
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ post: rows[0] });
  } catch (error) {
    console.error("Get post error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
