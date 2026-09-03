"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { OperacaoRow } from "@/lib/operacoes-actions";
import OperacoesTable from "./OperacoesTable";
import OperacaoModal from "./OperacaoModal";

export default function PainelClient({
  operacoes,
  path,
  isHoje,
}: {
  operacoes: OperacaoRow[];
  path: string;
  isHoje: boolean;
}) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selected = operacoes.find((op) => op.id === selectedId) ?? null;

  // Painel é uma tela pra ficar aberta o dia todo (celular da operação,
  // TV do galpão etc.) — então busca dados novos sozinho a cada 15s,
  // sem precisar de F5. Pausa o refresh enquanto o modal de fechamento
  // está aberto (pra não sumir com o que a pessoa está digitando) e
  // enquanto está olhando um dia passado (não tem por que recarregar).
  useEffect(() => {
    if (selectedId !== null || !isHoje) return;
    const t = setInterval(() => router.refresh(), 15_000);
    return () => clearInterval(t);
  }, [router, selectedId, isHoje]);

  const finalizados = operacoes.filter((op) => op.horaSaida).length;
  const emOperacao = operacoes.filter((op) => op.horaChegada && !op.horaSaida).length;

  return (
    <main className="px-4 sm:px-6 lg:px-10 py-6 lg:py-8 space-y-5 lg:space-y-6 max-w-6xl">
      {!isHoje && (
        <div className="flex items-center justify-between gap-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-4 py-2.5 text-sm">
          <span>Mostrando um dia passado — a lista não atualiza sozinha aqui.</span>
          <Link href="/controle-operacional/painel" className="font-medium underline shrink-0">
            Voltar pra hoje
          </Link>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className="bg-white rounded-xl shadow-card border border-navy-50 p-3 sm:p-4">
          <p className="text-[10px] sm:text-xs font-medium uppercase tracking-wide text-slate-500">
            Veículos
          </p>
          <p className="mt-1 sm:mt-1.5 font-display text-lg sm:text-xl font-semibold text-navy-700">
            {operacoes.length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-card border border-navy-50 p-3 sm:p-4">
          <p className="text-[10px] sm:text-xs font-medium uppercase tracking-wide text-slate-500">
            Em operação
          </p>
          <p className="mt-1 sm:mt-1.5 font-display text-lg sm:text-xl font-semibold text-navy-700">
            {emOperacao}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-card border border-navy-50 p-3 sm:p-4">
          <p className="text-[10px] sm:text-xs font-medium uppercase tracking-wide text-slate-500">
            Finalizados
          </p>
          <p className="mt-1 sm:mt-1.5 font-display text-lg sm:text-xl font-semibold text-navy-700">
            {finalizados}
          </p>
        </div>
      </div>

      <OperacoesTable operacoes={operacoes} onSelect={setSelectedId} />

      <p className="text-xs text-slate-400 hidden md:block">
        Clique num veículo lançado pra registrar o horário de início, a saída e os serviços adicionais —
        assim que a saída é preenchida, ele vira <b>Finalizado</b>.
      </p>

      {selected && <OperacaoModal operacao={selected} path={path} onClose={() => setSelectedId(null)} />}
    </main>
  );
}
