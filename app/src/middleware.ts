import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const NEWSLETTER_HOST = "thedailyvibecode";

// Paths that are allowed on the newsletter domain
const NEWSLETTER_PATHS = [
  "/news",
  "/api/news",
  "/api/subscribe",
  "/api/newsletter",
  "/api/og/signal",
  "/api/share",
  "/unsubscribe",
  "/api/admin/social",
  "/admin/social",
  "/api/admin/threads",
  "/admin/threads",
];

export function middleware(req: NextRequest) {
  const host = req.headers.get("host") || "";
  if (!host.includes(NEWSLETTER_HOST)) return NextResponse.next();

  const { pathname } = req.nextUrl;

  // Allow static assets, _next, favicon
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/assets") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // Allow newsletter-related paths
  if (NEWSLETTER_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Everything else (including /) → redirect to /news
  return NextResponse.redirect(new URL("/news", req.url));
}

export const config = {
  matcher: ["/", "/((?!_next/static|_next/image).*)"],
};
