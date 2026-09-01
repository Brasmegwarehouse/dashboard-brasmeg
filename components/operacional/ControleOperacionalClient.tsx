"use client";

import { useState } from "react";
import clsx from "clsx";
import type { OperacaoRow } from "@/lib/operacoes-actions";
import NovaOperacaoForm from "./NovaOperacaoForm";
import OperacoesTable from "./OperacoesTable";
import OperacaoModal from "./OperacaoModal";
import FaturamentoView from "./FaturamentoView";

export default function ControleOperacionalClient({
  operacoes,
  data,
  path,
}: {
  operacoes: OperacaoRow[];
  data: string;
  path: string;
}) {
  const [tab, setTab] = useState<"painel" | "faturamento">("painel");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selected = operacoes.find((op) => op.id === selectedId) ?? null;

  const finalizados = operacoes.filter((op) => op.horaSaida).length;
  const emOperacao = operacoes.filter((op) => op.horaChegada && !op.horaSaida).length;

  return (
    <main className="px-6 lg:px-10 py-8 space-y-6 max-w-6xl">
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl shadow-card border border-navy-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Veículos hoje</p>
          <p className="mt-1.5 font-display text-xl font-semibold text-navy-700">{operacoes.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-card border border-navy-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Em operação</p>
          <p className="mt-1.5 font-display text-xl font-semibold text-navy-700">{emOperacao}</p>
        </div>
        <div className="bg-white rounded-xl shadow-card border border-navy-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Finalizados</p>
          <p className="mt-1.5 font-display text-xl font-semibold text-navy-700">{finalizados}</p>
        </div>
      </div>

      <div className="inline-flex bg-white border border-navy-50 rounded-lg p-1 shadow-card">
        {(["painel", "faturamento"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={clsx(
              "px-4 py-1.5 rounded-md text-sm font-medium transition-colors",
              tab === t ? "bg-brand-blue text-white" : "text-slate-500 hover:text-navy-700"
            )}
          >
            {t === "painel" ? "Painel" : "Faturamento"}
          </button>
        ))}
      </div>

      {tab === "painel" ? (
        <div className="space-y-5">
          <NovaOperacaoForm data={data} path={path} />
          <OperacoesTable operacoes={operacoes} onSelect={setSelectedId} />
          <p className="text-xs text-slate-400">
            Clique num veículo lançado pra registrar o horário de início, a saída e os serviços adicionais —
            assim que a saída é preenchida, ele vira <b>Finalizado</b>.
          </p>
        </div>
      ) : (
        <FaturamentoView operacoes={operacoes} />
      )}

      {selected && <OperacaoModal operacao={selected} path={path} onClose={() => setSelectedId(null)} />}
    </main>
  );
}
