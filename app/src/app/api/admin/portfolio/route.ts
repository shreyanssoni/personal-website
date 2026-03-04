import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdminRequest } from "@/lib/admin-auth";
import { sql } from "@/lib/db";

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

    const rows = await sql`
      INSERT INTO portfolio_projects (title, description, image, codelink, websitelink, tags, featured, display_order, published)
      VALUES (
        ${title},
        ${description || ""},
        ${image || ""},
        ${codelink || ""},
        ${websitelink || ""},
        ${tags || []},
        ${featured || false},
        ${display_order ?? 0},
        ${published ?? true}
      )
      RETURNING *
    `;

    revalidatePath("/", "layout");
    return NextResponse.json({ project: rows[0] });
  } catch (error) {
    console.error("Create project error:", error);
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

  try {
    const rows = await sql`
      SELECT * FROM portfolio_projects ORDER BY display_order ASC
    `;
    return NextResponse.json({ projects: rows });
  } catch (error) {
    console.error("List projects error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
