"use client";

import type { OperacaoRow } from "@/lib/operacoes-actions";
import ExportButton from "@/components/ExportButton";

export default function FaturamentoView({ operacoes }: { operacoes: OperacaoRow[] }) {
  const comServico = operacoes.filter((op) => op.servicos.length > 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Notas com serviço adicional lançado nesta data — cliente, NF e o que foi usado, pronto pra cobrança.
        </p>
        <ExportButton />
      </div>

      {comServico.length === 0 ? (
        <div className="bg-white rounded-xl shadow-card border border-navy-50 p-10 text-center text-sm text-slate-400">
          Nenhum serviço adicional lançado nesta data ainda.
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-card border border-navy-50 overflow-x-auto scrollbar-thin">
          <table className="min-w-full border-separate border-spacing-0">
            <thead>
              <tr>
                {["Cliente", "NF", "Placa", "Serviço", "Quantidade", "Observação"].map((h) => (
                  <th
                    key={h}
                    className="text-left text-[11px] font-medium uppercase tracking-wide text-slate-400 px-4 py-2.5 border-b border-navy-50"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comServico.flatMap((op) =>
                op.servicos.map((s) => (
                  <tr key={s.id}>
                    <td className="px-4 py-3 text-sm border-b border-navy-50">{op.cliente}</td>
                    <td className="px-4 py-3 text-sm border-b border-navy-50 tabular-nums">{op.nf ?? "—"}</td>
                    <td className="px-4 py-3 text-sm border-b border-navy-50">{op.placa}</td>
                    <td className="px-4 py-3 text-sm border-b border-navy-50 font-medium">{s.servico}</td>
                    <td className="px-4 py-3 text-sm border-b border-navy-50 tabular-nums">
                      {s.quantidade ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-sm border-b border-navy-50 text-slate-500">
                      {s.descricao ?? "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
