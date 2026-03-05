import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");
  const token = req.nextUrl.searchParams.get("token");

  if (!email || !token) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  // Verify token matches
  const expected = Buffer.from(email + process.env.CRON_SECRET).toString("base64url");
  if (token !== expected) {
    return NextResponse.json({ error: "Invalid token" }, { status: 403 });
  }

  await sql`UPDATE subscribers SET status = 'I' WHERE email = ${email}`;

  // Redirect to confirmation page
  return NextResponse.redirect(new URL("/unsubscribe?done=1", req.url));
}
