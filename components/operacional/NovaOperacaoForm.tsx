"use client";

import { useState, useTransition, type FormEvent } from "react";
import clsx from "clsx";
import { createOperacao } from "@/lib/operacoes-actions";
import { CLIENTES_OPERACAO, TIPOS_OPERACAO } from "@/lib/operacionalConfig";

const emptyForm = {
  cliente: CLIENTES_OPERACAO[0] as string,
  clienteOutro: "",
  nf: "",
  qtdeNf: "",
  placa: "",
  transportadora: "",
  tipoOperacao: TIPOS_OPERACAO[0] as string,
  horaChegada: "",
  horaLiberacao: "",
};

const inputClasses =
  "w-full rounded-md border border-navy-50 px-3 py-2 text-sm focus:border-brand-blue focus:ring-1 focus:ring-brand-blue focus:outline-none";

export default function NovaOperacaoForm({ data, path }: { data: string; path: string }) {
  const [form, setForm] = useState(emptyForm);
  const [open, setOpen] = useState(true);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof typeof emptyForm>(key: K, value: (typeof emptyForm)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const cliente = form.cliente === "Outro" ? form.clienteOutro.trim() : form.cliente;
    if (!cliente) return setError("Informe o cliente.");
    if (!form.placa.trim()) return setError("Informe a placa.");
    if (!form.horaChegada) return setError("Informe o horário de chegada.");

    startTransition(async () => {
      await createOperacao(
        {
          data,
          cliente,
          nf: form.nf.trim() || null,
          qtdeNf: form.qtdeNf ? Number(form.qtdeNf) : null,
          placa: form.placa.trim().toUpperCase(),
          transportadora: form.transportadora.trim() || null,
          tipoOperacao: form.tipoOperacao,
          horaChegada: form.horaChegada,
          horaLiberacao: form.horaLiberacao || null,
        },
        path
      );
      setForm(emptyForm);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
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
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="col-span-2 md:col-span-1">
              <label className="text-xs text-slate-500 mb-1 block">Cliente</label>
              <select
                value={form.cliente}
                onChange={(e) => update("cliente", e.target.value)}
                className={inputClasses}
              >
                {CLIENTES_OPERACAO.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {form.cliente === "Outro" && (
              <div className="col-span-2 md:col-span-1">
                <label className="text-xs text-slate-500 mb-1 block">Nome do cliente</label>
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
              <label className="text-xs text-slate-500 mb-1 block">NF</label>
              <input
                type="text"
                value={form.nf}
                onChange={(e) => update("nf", e.target.value)}
                className={inputClasses}
                placeholder="Nº da nota"
              />
            </div>

            <div>
              <label className="text-xs text-slate-500 mb-1 block">Qtde NF</label>
              <input
                type="number"
                min={0}
                value={form.qtdeNf}
                onChange={(e) => update("qtdeNf", e.target.value)}
                className={inputClasses}
              />
            </div>

            <div>
              <label className="text-xs text-slate-500 mb-1 block">Placa</label>
              <input
                type="text"
                value={form.placa}
                onChange={(e) => update("placa", e.target.value.toUpperCase())}
                className={clsx(inputClasses, "uppercase")}
                placeholder="ABC1D23"
              />
            </div>

            <div>
              <label className="text-xs text-slate-500 mb-1 block">Transportadora / Motorista</label>
              <input
                type="text"
                value={form.transportadora}
                onChange={(e) => update("transportadora", e.target.value)}
                className={inputClasses}
              />
            </div>

            <div>
              <label className="text-xs text-slate-500 mb-1 block">Tipo de operação</label>
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
              <label className="text-xs text-slate-500 mb-1 block">Horário de chegada</label>
              <input
                type="time"
                value={form.horaChegada}
                onChange={(e) => update("horaChegada", e.target.value)}
                className={inputClasses}
              />
            </div>

            <div>
              <label className="text-xs text-slate-500 mb-1 block">Horário de liberação</label>
              <input
                type="time"
                value={form.horaLiberacao}
                onChange={(e) => update("horaLiberacao", e.target.value)}
                className={inputClasses}
              />
            </div>
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={pending}
              className="bg-brand-blue text-white text-sm font-medium rounded-lg px-4 py-2 hover:bg-brand-blueDark transition-colors disabled:opacity-60"
            >
              {pending ? "Lançando…" : "Lançar veículo"}
            </button>
            {saved && <span className="text-xs text-emerald-600 font-medium">Lançado ✓</span>}
          </div>
        </form>
      )}
    </div>
  );
}
