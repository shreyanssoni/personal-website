import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdminRequest } from "@/lib/admin-auth";
import { sql } from "@/lib/db";

// Update a project
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
    const { title, description, image, codelink, websitelink, tags, featured, display_order, published } = body;

    const rows = await sql`
      UPDATE portfolio_projects SET
        title = ${title},
        description = ${description || ""},
        image = ${image || ""},
        codelink = ${codelink || ""},
        websitelink = ${websitelink || ""},
        tags = ${tags || []},
        featured = ${featured ?? false},
        display_order = ${display_order ?? 0},
        published = ${published ?? true},
        updated_at = ${new Date().toISOString()}
      WHERE id = ${id}
      RETURNING *
    `;

    revalidatePath("/", "layout");
    return NextResponse.json({ project: rows[0] });
  } catch (error) {
    console.error("Update project error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Delete a project
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    await sql`DELETE FROM portfolio_projects WHERE id = ${id}`;

    revalidatePath("/", "layout");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete project error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Get single project
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
      SELECT * FROM portfolio_projects WHERE id = ${id} LIMIT 1
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ project: rows[0] });
  } catch (error) {
    console.error("Get project error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
