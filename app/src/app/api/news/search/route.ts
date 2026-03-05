import { NextRequest, NextResponse } from "next/server";
import { searchNews } from "@/lib/newsletter";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const results = await searchNews(q, 20);
    return NextResponse.json({ results });
  } catch (error) {
    console.error("[News Search] Error:", error);
    return NextResponse.json(
      { results: [], error: "Search failed" },
      { status: 500 }
    );
  }
}
