import type { OperacaoRow } from "./operacoes-actions";
import { computeStatus, STATUS_META, minutesSince, minutosEntre } from "./operacionalStatus";

export function operacaoParaLinhaExcel(op: OperacaoRow, now: Date = new Date()) {
  const status = computeStatus(op, now);

  const aguardando = op.horaLiberacao
    ? op.horaSaida
      ? minutosEntre(op.horaLiberacao, op.horaSaida)
      : minutesSince(op.horaLiberacao, now)
    : null;

  const servicos = op.servicos.length
    ? op.servicos.map((s) => `${s.servico}${s.quantidade ? ` (${s.quantidade})` : ""}`).join("; ")
    : "";

  return {
    Data: op.data,
    Cliente: op.cliente,
    Tipo: op.tipoOperacao,
    NF: op.nf ?? "",
    "Qtde NF": op.qtdeNf ?? "",
    Placa: op.placa,
    Transportadora: op.transportadora ?? "",
    Chegada: op.horaChegada ?? "",
    Liberação: op.horaLiberacao ?? "",
    "Início Operação": op.horaInicioOperacao ?? "",
    Saída: op.horaSaida ?? "",
    Status: STATUS_META[status].label,
    "Aguardando (min)": aguardando ?? "",
    "Serviços Adicionais": servicos,
  };
}

export function operacoesParaLinhasExcel(ops: OperacaoRow[]) {
  const now = new Date();
  return ops.map((op) => operacaoParaLinhaExcel(op, now));
}
