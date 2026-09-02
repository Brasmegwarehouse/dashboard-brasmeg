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

export function minutesSince(hhmm: string, agora: Date): number {
  const [h, m] = hhmm.split(":").map(Number);
  const inicio = new Date(agora);
  inicio.setHours(h, m, 0, 0);
  return Math.round((agora.getTime() - inicio.getTime()) / 60000);
}

export function computeStatus(op: HorariosOperacao, agora: Date = new Date()): StatusOperacao {
  if (!op.horaChegada) return "aguardando";

  if (!op.horaSaida) {
    const minutos = minutesSince(op.horaChegada, agora);
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

export function formatMinutos(mins: number): string {
  const total = Math.max(0, mins);
  const h = Math.floor(total / 60);
  const m = total % 60;
  return h > 0 ? `${h}h ${m}min` : `${m}min`;
}

export function minutosEntre(inicioHHMM: string, fimHHMM: string): number {
  const [h1, m1] = inicioHHMM.split(":").map(Number);
  const [h2, m2] = fimHHMM.split(":").map(Number);
  return h2 * 60 + m2 - (h1 * 60 + m1);
}

export const STATUS_META: Record<StatusOperacao, { label: string; classes: string; dot: string }> = {
  aguardando: { label: "Aguardando", classes: "bg-slate-100 text-slate-500", dot: "bg-slate-400" },
  em_operacao: { label: "Em Operação", classes: "bg-amber-50 text-amber-700", dot: "bg-amber-500" },
  atencao: { label: "Atenção", classes: "bg-red-50 text-red-700", dot: "bg-red-500" },
  atrasado: { label: "Atrasado", classes: "bg-red-100 text-red-800", dot: "bg-red-700" },
  finalizado: { label: "Finalizado", classes: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
};
