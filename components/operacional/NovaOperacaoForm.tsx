"use client";

import { useState, useTransition } from "react";
import { createOperacao } from "@/lib/operacoes-actions";
import OperacaoForm, { emptyOperacaoForm, type OperacaoFormValues } from "./OperacaoForm";

export default function NovaOperacaoForm({ data, path }: { data: string; path: string }) {
  const [open, setOpen] = useState(true);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [erroServidor, setErroServidor] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(0); // muda pra resetar o formulário depois de salvar

  function handleSubmit(values: OperacaoFormValues) {
    setErroServidor(null);
    startTransition(async () => {
      try {
        await createOperacao(
          {
            data,
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
        setSaved(true);
        setFormKey((k) => k + 1);
        setTimeout(() => setSaved(false), 1500);
      } catch {
        setErroServidor("Não consegui lançar — confere os campos e tenta de novo.");
      }
    });
  }

  return (
    <div className="bg-white rounded-xl shadow-card border border-navy-50">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-3 border-b border-navy-50"
      >
        <h2 className="font-display font-semibold text-navy-700 text-sm">
          Lançar veículo <span className="text-slate-400 font-normal">· Portaria / ADM</span>
        </h2>
        <span className="text-slate-400 text-xs">{open ? "Recolher ▲" : "Expandir ▼"}</span>
      </button>

      {open && (
        <div className="p-5">
          <OperacaoForm
            key={formKey}
            initial={emptyOperacaoForm()}
            submitLabel="Lançar veículo"
            pending={pending}
            onSubmit={handleSubmit}
          />
          {erroServidor && <p className="text-xs text-red-600 mt-2">{erroServidor}</p>}
          {saved && <p className="text-xs text-emerald-600 font-medium mt-2">Lançado ✓</p>}
        </div>
      )}
    </div>
  );
}
