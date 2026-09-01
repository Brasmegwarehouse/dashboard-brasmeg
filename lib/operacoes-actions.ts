"use server";

import { db } from "./db";
import { operacoes, operacaoServicos } from "./db/schema";
import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export interface NovaOperacaoInput {
  data: string; // "YYYY-MM-DD"
  cliente: string;
  nf: string | null;
  qtdeNf: number | null;
  placa: string;
  transportadora: string | null;
  tipoOperacao: string;
  horaChegada: string; // "HH:MM"
  horaLiberacao: string | null;
}

/** Lançamento inicial do veículo — feito pela Portaria/ADM. */
export async function createOperacao(input: NovaOperacaoInput, path: string) {
  await db.insert(operacoes).values(input);
  revalidatePath(path);
}

export interface ServicoInput {
  servico: string;
  quantidade: number | null;
  descricao?: string | null;
}

/**
 * Fecha a operação — feito pela Operação: horário de início, saída, e
 * os serviços adicionais usados (só os marcados "Sim" chegam aqui).
 * O status "Finalizado" não é um campo salvo: ele aparece assim que
 * horaSaida está preenchido (ver lib/operacionalStatus.ts).
 */
export async function finalizarOperacao(
  id: number,
  horaInicioOperacao: string,
  horaSaida: string,
  servicos: ServicoInput[],
  path: string
) {
  await db
    .update(operacoes)
    .set({ horaInicioOperacao, horaSaida, updatedAt: new Date() })
    .where(eq(operacoes.id, id));

  await db.delete(operacaoServicos).where(eq(operacaoServicos.operacaoId, id));
  if (servicos.length > 0) {
    await db.insert(operacaoServicos).values(
      servicos.map((s) => ({
        operacaoId: id,
        servico: s.servico,
        quantidade: s.quantidade === null ? null : String(s.quantidade),
        descricao: s.descricao ?? null,
      }))
    );
  }

  revalidatePath(path);
}

export async function updateObservacoes(id: number, observacoes: string, path: string) {
  await db.update(operacoes).set({ observacoes, updatedAt: new Date() }).where(eq(operacoes.id, id));
  revalidatePath(path);
}

export interface OperacaoRow {
  id: number;
  data: string;
  cliente: string;
  nf: string | null;
  qtdeNf: number | null;
  placa: string;
  transportadora: string | null;
  tipoOperacao: string;
  horaChegada: string | null;
  horaLiberacao: string | null;
  horaInicioOperacao: string | null;
  horaSaida: string | null;
  observacoes: string | null;
  servicos: { id: number; servico: string; quantidade: string | null; descricao: string | null }[];
}

/** Todas as operações lançadas numa data, já com os serviços adicionais anexados. */
export async function getOperacoesByData(data: string): Promise<OperacaoRow[]> {
  const rows = await db.select().from(operacoes).where(eq(operacoes.data, data));
  const ids = rows.map((r) => r.id);
  const servicos = ids.length
    ? await db.select().from(operacaoServicos).where(inArray(operacaoServicos.operacaoId, ids))
    : [];

  return rows
    .map((r) => ({
      ...r,
      servicos: servicos
        .filter((s) => s.operacaoId === r.id)
        .map((s) => ({ id: s.id, servico: s.servico, quantidade: s.quantidade, descricao: s.descricao })),
    }))
    .sort((a, b) => (a.horaChegada ?? "99:99").localeCompare(b.horaChegada ?? "99:99"));
}
