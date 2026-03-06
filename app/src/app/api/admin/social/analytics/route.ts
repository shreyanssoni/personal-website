import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { getSocialAnalytics } from "@/lib/newsletter";

export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get("days") || "30", 10);
    const analytics = await getSocialAnalytics(days);
    return NextResponse.json(analytics);
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to fetch analytics", details: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
