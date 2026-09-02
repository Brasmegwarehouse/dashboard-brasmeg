import { NextRequest, NextResponse } from "next/server";

// Login "operacional" só pode ver o painel — qualquer outra rota
// (Visão Geral, outros indicadores, lançamento, faturamento) manda
// de volta pra cá.
const OPERACIONAL_HOME = "/controle-operacional/painel";

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

  const geral = process.env.APP_PASSWORD;
  const operacional = process.env.APP_PASSWORD_OPERACIONAL;
  // If neither password is configured, don't lock the owner out —
  // just let requests through (matches the "no login yet" state).
  if (!geral && !operacional) return NextResponse.next();

  const cookie = req.cookies.get("brasmeg_session")?.value;
  let role: "geral" | "operacional" | null = null;
  if (cookie) {
    if (geral && cookie === geral) role = "geral";
    else if (operacional && cookie === operacional) role = "operacional";
  }

  if (!role) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (role === "operacional" && !pathname.startsWith(OPERACIONAL_HOME)) {
    return NextResponse.redirect(new URL(OPERACIONAL_HOME, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
