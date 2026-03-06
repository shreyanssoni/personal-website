import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { getLatestSocialPosts } from "@/lib/newsletter";

export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const posts = await getLatestSocialPosts();
    return NextResponse.json({ posts });
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to fetch social posts", details: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
