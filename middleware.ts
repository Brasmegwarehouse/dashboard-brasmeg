import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Let the login page, its API, and Next's own asset routes through
  // untouched — everything else needs a valid session cookie.
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/api/login") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/logo.png") ||
    pathname.startsWith("/favicon.ico")
  ) {
    return NextResponse.next();
  }

  const expected = process.env.APP_PASSWORD;
  // If APP_PASSWORD isn't configured at all, don't lock the owner out —
  // just let requests through (matches the "no login yet" state).
  if (!expected) return NextResponse.next();

  const cookie = req.cookies.get("brasmeg_session")?.value;
  if (cookie === expected) return NextResponse.next();

  const loginUrl = new URL("/login", req.url);
  loginUrl.searchParams.set("from", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
