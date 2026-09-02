"use client";

import { useState, type FormEvent } from "react";
import clsx from "clsx";
import { CLIENTES_OPERACAO, TIPOS_OPERACAO } from "@/lib/operacionalConfig";
import type { OperacaoRow } from "@/lib/operacoes-actions";

export interface OperacaoFormValues {
  cliente: string;
  clienteOutro: string;
  nf: string;
  qtdeNf: string;
  placa: string;
  transportadora: string;
  tipoOperacao: string;
  horaChegada: string;
  horaLiberacao: string;
}

export function emptyOperacaoForm(): OperacaoFormValues {
  return {
    cliente: CLIENTES_OPERACAO[0],
    clienteOutro: "",
    nf: "",
    qtdeNf: "",
    placa: "",
    transportadora: "",
    tipoOperacao: TIPOS_OPERACAO[0],
    horaChegada: "",
    horaLiberacao: "",
  };
}

export function operacaoFormFromRow(op: OperacaoRow): OperacaoFormValues {
  const conhecido = (CLIENTES_OPERACAO as readonly string[]).includes(op.cliente);
  return {
    cliente: conhecido ? op.cliente : "Outro",
    clienteOutro: conhecido ? "" : op.cliente,
    nf: op.nf ?? "",
    qtdeNf: op.qtdeNf != null ? String(op.qtdeNf) : "",
    placa: op.placa,
    transportadora: op.transportadora ?? "",
    tipoOperacao: op.tipoOperacao,
    horaChegada: op.horaChegada ?? "",
    horaLiberacao: op.horaLiberacao ?? "",
  };
}

const inputClasses =
  "w-full rounded-md border border-navy-50 px-3 py-2 text-sm focus:border-brand-blue focus:ring-1 focus:ring-brand-blue focus:outline-none";

export default function OperacaoForm({
  initial,
  submitLabel,
  pending,
  onSubmit,
  onCancel,
}: {
  initial: OperacaoFormValues;
  submitLabel: string;
  pending: boolean;
  onSubmit: (values: OperacaoFormValues) => void;
  onCancel?: () => void;
}) {
  const [form, setForm] = useState(initial);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof OperacaoFormValues>(key: K, value: OperacaoFormValues[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const cliente = form.cliente === "Outro" ? form.clienteOutro.trim() : form.cliente;
    if (!cliente) return setError("Informe o cliente.");
    if (!form.nf.trim()) return setError("Informe a NF.");
    if (!form.qtdeNf.trim()) return setError("Informe a quantidade de NF.");
    if (!form.placa.trim()) return setError("Informe a placa.");
    if (!form.transportadora.trim()) return setError("Informe a transportadora.");
    if (!form.horaChegada) return setError("Informe o horário de chegada.");
    if (!form.horaLiberacao) return setError("Informe o horário de liberação.");

    setError(null);
    onSubmit({ ...form, cliente });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="col-span-2 md:col-span-1">
          <label className="text-xs text-slate-500 mb-1 block">Cliente *</label>
          <select value={form.cliente} onChange={(e) => update("cliente", e.target.value)} className={inputClasses}>
            {CLIENTES_OPERACAO.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {form.cliente === "Outro" && (
          <div className="col-span-2 md:col-span-1">
            <label className="text-xs text-slate-500 mb-1 block">Nome do cliente *</label>
            <input
              type="text"
              value={form.clienteOutro}
              onChange={(e) => update("clienteOutro", e.target.value)}
              className={inputClasses}
              placeholder="Nome"
            />
          </div>
        )}

        <div>
          <label className="text-xs text-slate-500 mb-1 block">NF *</label>
          <input
            type="text"
            value={form.nf}
            onChange={(e) => update("nf", e.target.value)}
            className={inputClasses}
            placeholder="Nº da nota"
          />
        </div>

        <div>
          <label className="text-xs text-slate-500 mb-1 block">Qtde NF *</label>
          <input
            type="number"
            min={0}
            value={form.qtdeNf}
            onChange={(e) => update("qtdeNf", e.target.value)}
            className={inputClasses}
          />
        </div>

        <div>
          <label className="text-xs text-slate-500 mb-1 block">Placa *</label>
          <input
            type="text"
            value={form.placa}
            onChange={(e) => update("placa", e.target.value.toUpperCase())}
            className={clsx(inputClasses, "uppercase")}
            placeholder="ABC1D23"
          />
        </div>

        <div>
          <label className="text-xs text-slate-500 mb-1 block">Transportadora / Motorista *</label>
          <input
            type="text"
            value={form.transportadora}
            onChange={(e) => update("transportadora", e.target.value)}
            className={inputClasses}
          />
        </div>

        <div>
          <label className="text-xs text-slate-500 mb-1 block">Tipo de operação *</label>
          <select
            value={form.tipoOperacao}
            onChange={(e) => update("tipoOperacao", e.target.value)}
            className={inputClasses}
          >
            {TIPOS_OPERACAO.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs text-slate-500 mb-1 block">Horário de chegada *</label>
          <input
            type="time"
            value={form.horaChegada}
            onChange={(e) => update("horaChegada", e.target.value)}
            className={inputClasses}
          />
        </div>

        <div>
          <label className="text-xs text-slate-500 mb-1 block">Horário de liberação *</label>
          <input
            type="time"
            value={form.horaLiberacao}
            onChange={(e) => update("horaLiberacao", e.target.value)}
            className={inputClasses}
          />
        </div>
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      <div className="flex items-center gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm text-slate-500 border border-navy-50 hover:bg-mist"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={pending}
          className="bg-brand-blue text-white text-sm font-medium rounded-lg px-4 py-2 hover:bg-brand-blueDark transition-colors disabled:opacity-60"
        >
          {pending ? "Salvando…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
