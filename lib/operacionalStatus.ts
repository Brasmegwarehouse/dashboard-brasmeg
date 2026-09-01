// Deriva o status do veículo a partir dos horários — mesma lógica da
// coluna STATUS da planilha original (Aguardando / Em Operação /
// Atenção / Atrasado / Finalizado). Nada disso é salvo no banco: é
// recalculado a cada render a partir dos horários já lançados.

export type StatusOperacao = "aguardando" | "em_operacao" | "atencao" | "atrasado" | "finalizado";

export interface HorariosOperacao {
  horaChegada: string | null;
  horaLiberacao: string | null;
  horaSaida: string | null;
}

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function minutosDesde(hhmm: string, agora: Date): number {
  const [h, m] = hhmm.split(":").map(Number);
  const inicio = new Date(agora);
  inicio.setHours(h, m, 0, 0);
  return Math.round((agora.getTime() - inicio.getTime()) / 60000);
}

export function computeStatus(op: HorariosOperacao, agora: Date = new Date()): StatusOperacao {
  if (!op.horaChegada) return "aguardando";

  if (!op.horaSaida) {
    const minutos = minutosDesde(op.horaChegada, agora);
    return minutos > 60 ? "atencao" : "em_operacao";
  }

  // Finalizado — verifica se a chegada em si já veio atrasada em
  // relação à liberação combinada (tolerância de 15 min, igual à
  // planilha).
  if (op.horaLiberacao && toMinutes(op.horaChegada) > toMinutes(op.horaLiberacao) + 15) {
    return "atrasado";
  }
  return "finalizado";
}

export const STATUS_META: Record<StatusOperacao, { label: string; classes: string; dot: string }> = {
  aguardando: { label: "Aguardando", classes: "bg-slate-100 text-slate-500", dot: "bg-slate-400" },
  em_operacao: { label: "Em Operação", classes: "bg-amber-50 text-amber-700", dot: "bg-amber-500" },
  atencao: { label: "Atenção", classes: "bg-orange-50 text-orange-700", dot: "bg-orange-500" },
  atrasado: { label: "Atrasado", classes: "bg-red-50 text-red-600", dot: "bg-red-500" },
  finalizado: { label: "Finalizado", classes: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
};
