"use client";

import { useState } from "react";
import type { OperacaoRow } from "@/lib/operacoes-actions";
import NovaOperacaoForm from "./NovaOperacaoForm";
import OperacoesTable from "./OperacoesTable";
import EditarOperacaoModal from "./EditarOperacaoModal";

export default function LancamentoClient({
  operacoes,
  data,
  path,
}: {
  operacoes: OperacaoRow[];
  data: string;
  path: string;
}) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selected = operacoes.find((op) => op.id === selectedId) ?? null;

  return (
    <div className="space-y-5">
      <NovaOperacaoForm data={data} path={path} />
      <OperacoesTable operacoes={operacoes} onSelect={setSelectedId} />
      <p className="text-xs text-slate-400">
        Clique num veículo lançado pra corrigir algum campo. Horário de início, saída e serviços adicionais
        continuam sendo fechados no <b>Painel</b>, não aqui.
      </p>
      {selected && <EditarOperacaoModal operacao={selected} path={path} onClose={() => setSelectedId(null)} />}
    </div>
  );
}
