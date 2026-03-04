import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdminRequest } from "@/lib/admin-auth";
import { sql } from "@/lib/db";

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

    const rows = await sql`
      INSERT INTO garden_pieces (type, title, subtitle, quote, description, content_html, image_url, link_url, label, display_order, published)
      VALUES (
        ${type},
        ${title},
        ${subtitle || ""},
        ${quote || ""},
        ${description || ""},
        ${content_html || ""},
        ${image_url || ""},
        ${link_url || ""},
        ${label || ""},
        ${display_order || 0},
        ${published || false}
      )
      RETURNING *
    `;

    revalidatePath("/", "layout");
    return NextResponse.json({ piece: rows[0] });
  } catch (error) {
    console.error("Create garden piece error:", error);
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

  try {
    const rows = await sql`
      SELECT * FROM garden_pieces ORDER BY type ASC, display_order ASC
    `;
    return NextResponse.json({ pieces: rows });
  } catch (error) {
    console.error("List garden pieces error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
