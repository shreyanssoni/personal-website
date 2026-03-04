import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdminRequest } from "@/lib/admin-auth";
import { sql } from "@/lib/db";

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
      SELECT * FROM garden_pieces WHERE id = ${id} LIMIT 1
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ piece: rows[0] });
  } catch (error) {
    console.error("Get garden piece error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

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

    const rows = await sql`
      UPDATE garden_pieces SET
        type = ${type},
        title = ${title},
        subtitle = ${subtitle},
        quote = ${quote},
        description = ${description},
        content_html = ${content_html},
        image_url = ${image_url},
        link_url = ${link_url},
        label = ${label},
        display_order = ${display_order},
        published = ${published},
        updated_at = ${new Date().toISOString()}
      WHERE id = ${id}
      RETURNING *
    `;

    revalidatePath("/", "layout");
    return NextResponse.json({ piece: rows[0] });
  } catch (error) {
    console.error("Update garden piece error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    await sql`DELETE FROM garden_pieces WHERE id = ${id}`;

    revalidatePath("/", "layout");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete garden piece error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
