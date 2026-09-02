"use client";

import type { ResumoOperacional } from "@/lib/operacoes-actions";
import OperacionalBarChart from "./OperacionalBarChart";

const CORES = { Carga: "#0284C7", Descarga: "#9333EA", Entrega: "#059669" };

export default function RelatoriosCharts({ resumo }: { resumo: ResumoOperacional }) {
  const totalPorTipo = Object.fromEntries(resumo.porTipo.map((t) => [t.tipo, t.total])) as Record<string, number>;
  const maxCliente = resumo.porCliente[0]?.total ?? 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl shadow-card border border-navy-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Total no mês</p>
          <p className="mt-1.5 font-display text-xl font-semibold text-navy-700">{resumo.totalOperacoes}</p>
        </div>
        <div className="bg-white rounded-xl shadow-card border border-navy-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-sky-600">Cargas</p>
          <p className="mt-1.5 font-display text-xl font-semibold text-navy-700">{totalPorTipo.Carga ?? 0}</p>
        </div>
        <div className="bg-white rounded-xl shadow-card border border-navy-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-purple-600">Descargas</p>
          <p className="mt-1.5 font-display text-xl font-semibold text-navy-700">{totalPorTipo.Descarga ?? 0}</p>
        </div>
        <div className="bg-white rounded-xl shadow-card border border-navy-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-emerald-600">Entregas</p>
          <p className="mt-1.5 font-display text-xl font-semibold text-navy-700">{totalPorTipo.Entrega ?? 0}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-card border border-navy-50 p-5">
        <h2 className="font-display text-sm font-semibold text-navy-700 mb-3">Movimentação por dia</h2>
        {resumo.porDia.length === 0 ? (
          <p className="text-sm text-slate-400 py-10 text-center">Sem lançamentos nesse mês ainda.</p>
        ) : (
          <OperacionalBarChart
            data={resumo.porDia}
            xKey="dia"
            series={[
              { key: "Carga", label: "Carga", color: CORES.Carga },
              { key: "Descarga", label: "Descarga", color: CORES.Descarga },
              { key: "Entrega", label: "Entrega", color: CORES.Entrega },
            ]}
          />
        )}
      </div>

      <div className="bg-white rounded-xl shadow-card border border-navy-50 p-5">
        <h2 className="font-display text-sm font-semibold text-navy-700 mb-3">
          Melhores clientes <span className="text-slate-400 font-normal">· por nº de operações</span>
        </h2>
        {resumo.porCliente.length === 0 ? (
          <p className="text-sm text-slate-400 py-10 text-center">Sem lançamentos nesse mês ainda.</p>
        ) : (
          <div className="space-y-2.5">
            {resumo.porCliente.map((c, i) => {
              const pct = maxCliente ? Math.round((c.total / maxCliente) * 100) : 0;
              return (
                <div key={c.cliente} className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 w-5 shrink-0">{i + 1}º</span>
                  <span className="text-sm text-slate-700 w-36 shrink-0 truncate">{c.cliente}</span>
                  <div className="flex-1 bg-navy-50 rounded-full h-2.5">
                    <div className="bg-brand-blue h-2.5 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-sm font-medium text-navy-700 w-8 text-right shrink-0">{c.total}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
