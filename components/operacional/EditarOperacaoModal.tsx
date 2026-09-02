"use client";

import { useState, useTransition } from "react";
import type { OperacaoRow } from "@/lib/operacoes-actions";
import { updateOperacaoLancamento } from "@/lib/operacoes-actions";
import OperacaoForm, { operacaoFormFromRow, type OperacaoFormValues } from "./OperacaoForm";

export default function EditarOperacaoModal({
  operacao,
  path,
  onClose,
}: {
  operacao: OperacaoRow;
  path: string;
  onClose: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(values: OperacaoFormValues) {
    setError(null);
    startTransition(async () => {
      try {
        await updateOperacaoLancamento(
          operacao.id,
          {
            cliente: values.cliente,
            nf: values.nf.trim(),
            qtdeNf: Number(values.qtdeNf),
            placa: values.placa.trim().toUpperCase(),
            transportadora: values.transportadora.trim(),
            tipoOperacao: values.tipoOperacao,
            horaChegada: values.horaChegada,
            horaLiberacao: values.horaLiberacao,
          },
          path
        );
        onClose();
      } catch {
        setError("Não consegui salvar — confere os campos e tenta de novo.");
      }
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
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="font-display text-lg font-semibold text-navy-700">Editar lançamento</h2>
            <p className="text-xs text-slate-500 mt-0.5">Corrige o que tiver errado — placa, NF, horários...</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-lg leading-none px-1">
            ✕
          </button>
        </div>

        <OperacaoForm
          initial={operacaoFormFromRow(operacao)}
          submitLabel="Salvar alterações"
          pending={pending}
          onSubmit={handleSubmit}
          onCancel={onClose}
        />

        {error && <p className="text-xs text-red-600 mt-3">{error}</p>}
      </div>
    </div>
  );
}
