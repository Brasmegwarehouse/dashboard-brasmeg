"use server";

import { db } from "./db";
import { operacoes, operacaoServicos } from "./db/schema";
import { and, eq, gte, inArray, lte } from "drizzle-orm";
import { revalidatePath } from "next/cache";

/** Campos que a Portaria/ADM preenche — todos obrigatórios (bloqueado no formulário e reforçado aqui). */
export interface EditOperacaoInput {
  cliente: string;
  nf: string;
  qtdeNf: number;
  placa: string;
  transportadora: string;
  tipoOperacao: string;
  horaChegada: string; // "HH:MM"
  horaLiberacao: string; // "HH:MM"
}

export interface NovaOperacaoInput extends EditOperacaoInput {
  data: string; // "YYYY-MM-DD"
}

function validarCampos(input: EditOperacaoInput) {
  if (
    !input.cliente?.trim() ||
    !input.nf?.trim() ||
    !input.qtdeNf ||
    !input.placa?.trim() ||
    !input.transportadora?.trim() ||
    !input.tipoOperacao?.trim() ||
    !input.horaChegada ||
    !input.horaLiberacao
  ) {
    throw new Error("Preencha todos os campos antes de salvar.");
  }
}

/** Lançamento inicial do veículo — feito pela Portaria/ADM. */
export async function createOperacao(input: NovaOperacaoInput, path: string) {
  validarCampos(input);
  await db.insert(operacoes).values(input);
  revalidatePath(path);
}

/** Corrige um lançamento já feito (placa, NF, horários...) — não mexe em horário de operação nem serviços. */
export async function updateOperacaoLancamento(id: number, input: EditOperacaoInput, path: string) {
  validarCampos(input);
  await db.update(operacoes).set({ ...input, updatedAt: new Date() }).where(eq(operacoes.id, id));
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

function categoriaTipo(tipo: string): "Carga" | "Descarga" | "Entrega" {
  if (tipo.startsWith("Carga")) return "Carga";
  if (tipo.startsWith("Descarga")) return "Descarga";
  return "Entrega";
}

export interface ResumoOperacional {
  porDia: { dia: string; Carga: number; Descarga: number; Entrega: number }[];
  porTipo: { tipo: string; total: number }[];
  porCliente: { cliente: string; total: number }[];
  totalOperacoes: number;
}

/** Resumo agregado de um mês inteiro, pra alimentar os gráficos de Relatórios. */
export async function getResumoMensal(anoMes: string /* "YYYY-MM" */): Promise<ResumoOperacional> {
  const inicio = `${anoMes}-01`;
  const fim = `${anoMes}-31`;
  const rows = await db.select().from(operacoes).where(and(gte(operacoes.data, inicio), lte(operacoes.data, fim)));

  const porDiaMap = new Map<string, { Carga: number; Descarga: number; Entrega: number }>();
  const porTipoMap = new Map<string, number>();
  const porClienteMap = new Map<string, number>();

  for (const r of rows) {
    const dia = r.data.slice(8, 10);
    const cat = categoriaTipo(r.tipoOperacao);

    if (!porDiaMap.has(dia)) porDiaMap.set(dia, { Carga: 0, Descarga: 0, Entrega: 0 });
    porDiaMap.get(dia)![cat] += 1;

    porTipoMap.set(cat, (porTipoMap.get(cat) ?? 0) + 1);
    porClienteMap.set(r.cliente, (porClienteMap.get(r.cliente) ?? 0) + 1);
  }

  const porDia = Array.from(porDiaMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([dia, v]) => ({ dia, ...v }));

  const porTipo = Array.from(porTipoMap.entries()).map(([tipo, total]) => ({ tipo, total }));

  const porCliente = Array.from(porClienteMap.entries())
    .map(([cliente, total]) => ({ cliente, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 8);

  return { porDia, porTipo, porCliente, totalOperacoes: rows.length };
}
