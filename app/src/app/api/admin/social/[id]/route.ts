import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { updateSocialPost } from "@/lib/newsletter";

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

    // Auto-calculate format_score if performance metrics provided
    if (body.impressions && body.impressions > 0) {
      const replies = body.replies || 0;
      const reposts = body.reposts || 0;
      const likes = body.likes || 0;
      body.format_score = ((replies * 3) + (reposts * 2) + likes) / body.impressions;
    }

    await updateSocialPost(parseInt(id, 10), body);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to update social post", details: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
