import { cookies } from "next/headers";

export type Role = "geral" | "operacional" | null;

/**
 * Lê o cookie de sessão e diz qual login foi usado. Mesmo esquema do
 * middleware: o valor do cookie é a própria senha (nunca lido por JS
 * do cliente, httpOnly), só compara contra as duas senhas esperadas.
 */
export function getRole(): Role {
  const cookie = cookies().get("brasmeg_session")?.value;
  if (!cookie) return null;

  const geral = process.env.APP_PASSWORD;
  const operacional = process.env.APP_PASSWORD_OPERACIONAL;

  if (geral && cookie === geral) return "geral";
  if (operacional && cookie === operacional) return "operacional";
  return null;
}
