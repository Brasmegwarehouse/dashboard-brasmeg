"use client";

import { useEffect, useState } from "react";
import type { OperacaoRow } from "@/lib/operacoes-actions";
import { computeStatus, STATUS_META } from "@/lib/operacionalStatus";

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

export default function OperacoesTable({
  operacoes,
  onSelect,
}: {
  operacoes: OperacaoRow[];
  onSelect: (id: number) => void;
}) {
  // Recalcula o status a cada minuto, pra "Em Operação" virar "Atenção"
  // sozinho quando o tempo de espera passa de 60 min — igual à
  // planilha, que recalcula via NOW() a cada abertura.
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
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
      <table className="min-w-full border-separate border-spacing-0">
        <thead>
          <tr>
            {["Cliente", "NF", "Placa", "Transportadora", "Chegada", "Liberação", "Status", "Serviços"].map(
              (h) => (
                <th
                  key={h}
                  className="text-left text-[11px] font-medium uppercase tracking-wide text-slate-400 px-4 py-2.5 border-b border-navy-50"
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
                onClick={() => onSelect(op.id)}
                className="cursor-pointer hover:bg-mist/60 transition-colors"
              >
                <td className="px-4 py-3 text-sm border-b border-navy-50">{op.cliente}</td>
                <td className="px-4 py-3 text-sm border-b border-navy-50 tabular-nums">{op.nf ?? "—"}</td>
                <td className="px-4 py-3 text-sm border-b border-navy-50 font-medium">{op.placa}</td>
                <td className="px-4 py-3 text-sm border-b border-navy-50 text-slate-500">
                  {op.transportadora ?? "—"}
                </td>
                <td className="px-4 py-3 text-sm border-b border-navy-50 tabular-nums">
                  {op.horaChegada ?? "—"}
                </td>
                <td className="px-4 py-3 text-sm border-b border-navy-50 tabular-nums">
                  {op.horaLiberacao ?? "—"}
                </td>
                <td className="px-4 py-3 border-b border-navy-50">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium ${meta.classes}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                    {meta.label}
                  </span>
                </td>
                <td className="px-4 py-3 border-b border-navy-50">
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
