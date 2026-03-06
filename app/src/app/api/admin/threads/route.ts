import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { getAllThreads, createThread } from "@/lib/newsletter";

export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const threads = await getAllThreads();
    return NextResponse.json({ threads });
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to fetch threads", details: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { slug, title, description, emoji, status, display_order, signal_ids } = body;

    if (!slug || !title) {
      return NextResponse.json({ error: "slug and title are required" }, { status: 400 });
    }

    const { addSignalsToThread } = await import("@/lib/newsletter");
    const id = await createThread({ slug, title, description, emoji, status, display_order });

    if (signal_ids?.length > 0) {
      await addSignalsToThread(id, signal_ids);
    }

    return NextResponse.json({ id });
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to create thread", details: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
