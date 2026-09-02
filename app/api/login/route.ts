import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { password } = await req.json();
  const geral = process.env.APP_PASSWORD;
  const operacional = process.env.APP_PASSWORD_OPERACIONAL;

  if (!geral && !operacional) {
    console.error("[login] Nenhuma senha configurada (APP_PASSWORD / APP_PASSWORD_OPERACIONAL).");
    return NextResponse.json({ error: "Login não configurado." }, { status: 500 });
  }

  const matched = password === geral ? geral : password === operacional ? operacional : null;
  if (!matched) {
    return NextResponse.json({ error: "Senha incorreta." }, { status: 401 });
  }

  // The cookie's value is the password itself. It's never readable by
  // client-side JS (httpOnly) and only ever sent over HTTPS in
  // production (secure), so this is fine for two shared passwords
  // gating an internal tool — not meant to withstand a targeted attack.
  const res = NextResponse.json({ ok: true });
  res.cookies.set("brasmeg_session", matched, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 dias
  });
  return res;
}
