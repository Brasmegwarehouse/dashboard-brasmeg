"use client";

import { useState } from "react";
import type { OperacaoRow } from "@/lib/operacoes-actions";
import OperacoesTable from "./OperacoesTable";
import OperacaoModal from "./OperacaoModal";

export default function PainelClient({ operacoes, path }: { operacoes: OperacaoRow[]; path: string }) {
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

      <OperacoesTable operacoes={operacoes} onSelect={setSelectedId} />

      <p className="text-xs text-slate-400">
        Clique num veículo lançado pra registrar o horário de início, a saída e os serviços adicionais —
        assim que a saída é preenchida, ele vira <b>Finalizado</b>.
      </p>

      {selected && <OperacaoModal operacao={selected} path={path} onClose={() => setSelectedId(null)} />}
    </main>
  );
}
