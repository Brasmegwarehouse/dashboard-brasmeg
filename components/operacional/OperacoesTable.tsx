"use client";

import { useEffect, useState } from "react";
import type { OperacaoRow } from "@/lib/operacoes-actions";
import { computeStatus, STATUS_META, minutesSince, minutosEntre, formatMinutos } from "@/lib/operacionalStatus";

function ServicosResumo({ servicos }: { servicos: OperacaoRow["servicos"] }) {
  if (servicos.length === 0) return <span className="text-slate-300 text-xs">—</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {servicos.map((s) => (
        <span
          key={s.id}
          className="inline-block bg-navy-50 text-navy-700 text-[10.5px] px-1.5 py-0.5 rounded"
        >
          {s.servico}
          {s.quantidade ? ` · ${s.quantidade}` : ""}
        </span>
      ))}
    </div>
  );
}

function TipoBadge({ tipo }: { tipo: string }) {
  const classes = tipo.startsWith("Carga")
    ? "bg-sky-50 text-sky-700"
    : tipo.startsWith("Descarga")
    ? "bg-purple-50 text-purple-700"
    : "bg-emerald-50 text-emerald-700"; // Entrega
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap ${classes}`}>
      {tipo}
    </span>
  );
}

/**
 * Tempo aguardando desde a liberação (Portaria/ADM). Enquanto a
 * operação não é finalizada, conta ao vivo — atualiza sozinho, sem
 * precisar mexer em nada, diferente da planilha antiga que só
 * recalculava quando alguém editava uma célula.
 */
function TempoAguardando({ op, now }: { op: OperacaoRow; now: Date }) {
  if (!op.horaLiberacao) return <span className="text-slate-300 text-xs">—</span>;

  if (op.horaSaida) {
    const total = minutosEntre(op.horaLiberacao, op.horaSaida);
    return <span className="text-xs text-slate-400">{formatMinutos(total)} (total)</span>;
  }

  const mins = minutesSince(op.horaLiberacao, now);
  const cor = mins > 60 ? "text-red-600" : mins > 30 ? "text-amber-600" : "text-slate-600";
  return <span className={`text-sm font-medium tabular-nums ${cor}`}>{formatMinutos(mins)}</span>;
}

function NfCell({ nf }: { nf: string | null }) {
  if (!nf) return <span className="text-slate-300">—</span>;
  // Várias notas separadas por vírgula/espaço — quebra em várias linhas
  // dentro da própria coluna, em vez de esticar a coluna pros lados.
  const notas = nf
    .split(/[,;/]+/)
    .map((n) => n.trim())
    .filter(Boolean);
  if (notas.length <= 1) return <span className="tabular-nums break-words">{nf}</span>;
  return (
    <div className="flex flex-col gap-0.5">
      {notas.map((n, i) => (
        <span key={i} className="tabular-nums leading-tight">
          {n}
        </span>
      ))}
    </div>
  );
}

export default function OperacoesTable({
  operacoes,
  onSelect,
  readOnly = false,
}: {
  operacoes: OperacaoRow[];
  onSelect?: (id: number) => void;
  readOnly?: boolean;
}) {
  // Recalcula status e contador a cada 20s — atualiza sozinho, sem
  // precisar de nenhuma ação da tela.
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 20_000);
    return () => clearInterval(t);
  }, []);

  if (operacoes.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-card border border-navy-50 p-10 text-center text-sm text-slate-400">
        Nenhum veículo lançado para esta data ainda.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-card border border-navy-50 overflow-x-auto scrollbar-thin">
      <table className="w-full table-fixed border-separate border-spacing-0">
        <colgroup>
          <col className="w-[13%]" /> {/* Cliente */}
          <col className="w-[9%]" /> {/* Tipo */}
          <col className="w-[9%]" /> {/* NF */}
          <col className="w-[9%]" /> {/* Placa */}
          <col className="w-[13%]" /> {/* Transportadora */}
          <col className="w-[7%]" /> {/* Chegada */}
          <col className="w-[7%]" /> {/* Liberação */}
          <col className="w-[9%]" /> {/* Aguardando */}
          <col className="w-[10%]" /> {/* Status */}
          <col className="w-[14%]" /> {/* Serviços */}
        </colgroup>
        <thead>
          <tr>
            {["Cliente", "Tipo", "NF", "Placa", "Transportadora", "Chegada", "Liberação", "Aguardando", "Status", "Serviços"].map(
              (h) => (
                <th
                  key={h}
                  className="text-left text-[11px] font-medium uppercase tracking-wide text-slate-400 px-3 py-2.5 border-b border-navy-50 truncate"
                >
                  {h}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody>
          {operacoes.map((op) => {
            const status = computeStatus(op, now);
            const meta = STATUS_META[status];
            return (
              <tr
                key={op.id}
                onClick={readOnly ? undefined : () => onSelect?.(op.id)}
                className={
                  readOnly ? "" : "cursor-pointer hover:bg-mist/60 transition-colors align-top"
                }
              >
                <td className="px-3 py-3 text-sm border-b border-navy-50 break-words">{op.cliente}</td>
                <td className="px-3 py-3 border-b border-navy-50">
                  <TipoBadge tipo={op.tipoOperacao} />
                </td>
                <td className="px-3 py-3 text-sm border-b border-navy-50">
                  <NfCell nf={op.nf} />
                </td>
                <td className="px-3 py-3 text-sm border-b border-navy-50 font-medium break-words">{op.placa}</td>
                <td className="px-3 py-3 text-sm border-b border-navy-50 text-slate-500 break-words">
                  {op.transportadora ?? "—"}
                </td>
                <td className="px-3 py-3 text-sm border-b border-navy-50 tabular-nums">
                  {op.horaChegada ?? "—"}
                </td>
                <td className="px-3 py-3 text-sm border-b border-navy-50 tabular-nums">
                  {op.horaLiberacao ?? "—"}
                </td>
                <td className="px-3 py-3 border-b border-navy-50">
                  <TempoAguardando op={op} now={now} />
                </td>
                <td className="px-3 py-3 border-b border-navy-50">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium ${meta.classes}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                    {meta.label}
                  </span>
                </td>
                <td className="px-3 py-3 border-b border-navy-50">
                  <ServicosResumo servicos={op.servicos} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
