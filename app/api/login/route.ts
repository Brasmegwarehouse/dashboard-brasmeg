import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { password } = await req.json();
  const expected = process.env.APP_PASSWORD;

  if (!expected) {
    console.error("[login] APP_PASSWORD is not set in environment variables.");
    return NextResponse.json({ error: "Login não configurado." }, { status: 500 });
  }

  if (password !== expected) {
    return NextResponse.json({ error: "Senha incorreta." }, { status: 401 });
  }

  // The cookie's value is the password itself. It's never readable by
  // client-side JS (httpOnly) and only ever sent over HTTPS in
  // production (secure), so this is fine for a single shared password
  // gating an internal tool — not meant to withstand a targeted attack.
  const res = NextResponse.json({ ok: true });
  res.cookies.set("brasmeg_session", expected, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 dias
  });
  return res;
}
