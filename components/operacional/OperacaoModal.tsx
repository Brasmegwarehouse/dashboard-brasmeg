"use client";

import { useState, useTransition } from "react";
import type { OperacaoRow, ServicoInput } from "@/lib/operacoes-actions";
import { finalizarOperacao } from "@/lib/operacoes-actions";
import { SERVICOS_FIXOS } from "@/lib/operacionalConfig";

interface ServicoState {
  usado: boolean;
  quantidade: string;
  descricao: string;
}

function buildInitialServicos(op: OperacaoRow): Record<string, ServicoState> {
  const state: Record<string, ServicoState> = {};
  const nomes = [...SERVICOS_FIXOS, "Outro"];
  for (const nome of nomes) {
    const existente = op.servicos.find((s) => s.servico === nome);
    state[nome] = {
      usado: !!existente,
      quantidade: existente?.quantidade ?? "",
      descricao: existente?.descricao ?? "",
    };
  }
  return state;
}

export default function OperacaoModal({
  operacao,
  path,
  onClose,
}: {
  operacao: OperacaoRow;
  path: string;
  onClose: () => void;
}) {
  const [horaInicio, setHoraInicio] = useState(operacao.horaInicioOperacao ?? "");
  const [horaSaida, setHoraSaida] = useState(operacao.horaSaida ?? "");
  const [servicos, setServicos] = useState<Record<string, ServicoState>>(() => buildInitialServicos(operacao));
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function updateServico(nome: string, patch: Partial<ServicoState>) {
    setServicos((s) => ({ ...s, [nome]: { ...s[nome], ...patch } }));
  }

  function handleSave() {
    setError(null);
    if (!horaInicio) return setError("Informe o horário de início da operação.");
    if (!horaSaida) return setError("Informe o horário de saída — é isso que marca como Finalizado.");

    const payload: ServicoInput[] = Object.entries(servicos)
      .filter(([, v]) => v.usado)
      .map(([servico, v]) => ({
        servico,
        quantidade: v.quantidade ? Number(v.quantidade) : null,
        descricao: servico === "Outro" ? v.descricao || null : null,
      }));

    startTransition(async () => {
      await finalizarOperacao(operacao.id, horaInicio, horaSaida, payload, path);
      onClose();
    });
  }

  return (
    <div
      className="fixed inset-0 bg-navy-900/40 flex items-start justify-center p-4 md:p-10 overflow-y-auto z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-xl shadow-card border border-navy-50 w-full max-w-lg p-6">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h2 className="font-display text-lg font-semibold text-navy-700">{operacao.cliente}</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              NF {operacao.nf ?? "—"} · Placa {operacao.placa} · {operacao.transportadora ?? "sem transportadora"}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-lg leading-none px-1">
            ✕
          </button>
        </div>

        <p className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold mt-5 mb-2">
          Horários da operação
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Início da operação</label>
            <input
              type="time"
              value={horaInicio}
              onChange={(e) => setHoraInicio(e.target.value)}
              className="w-full rounded-md border border-navy-50 px-3 py-2 text-sm focus:border-brand-blue focus:ring-1 focus:ring-brand-blue focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Saída / liberação</label>
            <input
              type="time"
              value={horaSaida}
              onChange={(e) => setHoraSaida(e.target.value)}
              className="w-full rounded-md border border-navy-50 px-3 py-2 text-sm focus:border-brand-blue focus:ring-1 focus:ring-brand-blue focus:outline-none"
            />
          </div>
        </div>

        <p className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold mt-5 mb-2">
          Serviços adicionais
        </p>
        <div className="space-y-2">
          {[...SERVICOS_FIXOS, "Outro"].map((nome) => {
            const st = servicos[nome];
            return (
              <div key={nome} className="border border-navy-50 rounded-lg px-3.5 py-2.5 bg-mist/50">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">{nome}</span>
                  <div className="flex bg-white border border-navy-50 rounded-md overflow-hidden">
                    <button
                      type="button"
                      onClick={() => updateServico(nome, { usado: true })}
                      className={`text-xs px-3 py-1 ${
                        st.usado ? "bg-emerald-500 text-white" : "text-slate-500"
                      }`}
                    >
                      Sim
                    </button>
                    <button
                      type="button"
                      onClick={() => updateServico(nome, { usado: false })}
                      className={`text-xs px-3 py-1 ${
                        !st.usado ? "bg-slate-400 text-white" : "text-slate-500"
                      }`}
                    >
                      Não
                    </button>
                  </div>
                </div>

                {st.usado && nome === "Outro" && (
                  <div className="mt-2">
                    <label className="text-[11px] text-slate-500 mb-1 block">Descrição do serviço</label>
                    <input
                      type="text"
                      value={st.descricao}
                      onChange={(e) => updateServico(nome, { descricao: e.target.value })}
                      placeholder="Ex: paletização especial"
                      className="w-full rounded-md border border-navy-50 px-3 py-1.5 text-sm focus:border-brand-blue focus:ring-1 focus:ring-brand-blue focus:outline-none"
                    />
                  </div>
                )}

                {st.usado && (
                  <div className="mt-2 flex items-center gap-2">
                    <label className="text-[11px] text-slate-500 whitespace-nowrap">Quantidade</label>
                    <input
                      type="number"
                      min={0}
                      value={st.quantidade}
                      onChange={(e) => updateServico(nome, { quantidade: e.target.value })}
                      className="w-24 rounded-md border border-navy-50 px-2 py-1 text-sm focus:border-brand-blue focus:ring-1 focus:ring-brand-blue focus:outline-none"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {error && <p className="text-xs text-red-600 mt-3">{error}</p>}

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm text-slate-500 border border-navy-50 hover:bg-mist"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={pending}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-brand-blue hover:bg-brand-blueDark disabled:opacity-60"
          >
            {pending ? "Salvando…" : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}
