import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import {
  addSignalsToThread,
  removeSignalFromThread,
  reorderThreadSignals,
} from "@/lib/newsletter";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const threadId = Number(id);
    const body = await req.json();
    const { action, signal_ids, signal_id } = body;

    switch (action) {
      case "add":
        if (!signal_ids?.length) {
          return NextResponse.json({ error: "signal_ids required" }, { status: 400 });
        }
        await addSignalsToThread(threadId, signal_ids);
        break;
      case "remove":
        if (!signal_id) {
          return NextResponse.json({ error: "signal_id required" }, { status: 400 });
        }
        await removeSignalFromThread(threadId, signal_id);
        break;
      case "reorder":
        if (!signal_ids?.length) {
          return NextResponse.json({ error: "signal_ids required" }, { status: 400 });
        }
        await reorderThreadSignals(threadId, signal_ids);
        break;
      default:
        return NextResponse.json({ error: "Invalid action. Use add, remove, or reorder" }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to manage signals", details: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
