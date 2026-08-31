"use client";

import { useState, useTransition } from "react";
import { addActionPlanRow, updateActionPlanStatus, deleteActionPlanRow } from "@/lib/actions";
import clsx from "clsx";

interface Row {
  id: number;
  action: string;
  owner: string | null;
  dueDate: string | null;
  status: string | null;
  effective: string | null;
}

const STATUS_OPTIONS = ["Não Iniciado", "Em Andamento", "Concluído", "Atrasado"];

const statusStyles: Record<string, string> = {
  "Não Iniciado": "bg-slate-100 text-slate-600",
  "Em Andamento": "bg-amber-100 text-amber-700",
  "Concluído": "bg-emerald-100 text-emerald-700",
  "Atrasado": "bg-red-100 text-red-600",
};

export default function ActionPlanTable({ indicator, initialRows, path }: { indicator: string; initialRows: Row[]; path: string }) {
  const [rows, setRows] = useState(initialRows);
  const [action, setAction] = useState("");
  const [owner, setOwner] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [isPending, startTransition] = useTransition();
  const [savedId, setSavedId] = useState<number | null>(null);

  function handleAdd() {
    if (!action.trim()) return;
    startTransition(async () => {
      const newRow = await addActionPlanRow(indicator, action, owner, dueDate, path);
      if (newRow) setRows((prev) => [...prev, newRow as Row]);
      setAction("");
      setOwner("");
      setDueDate("");
    });
  }

  function handleStatusChange(id: number, status: string) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    startTransition(async () => {
      await updateActionPlanStatus(id, status, path);
      setSavedId(id);
      setTimeout(() => setSavedId((cur) => (cur === id ? null : cur)), 900);
    });
  }

  function handleDelete(id: number) {
    setRows((prev) => prev.filter((r) => r.id !== id));
    startTransition(async () => {
      await deleteActionPlanRow(id, path);
    });
  }

  return (
    <div className="bg-white rounded-xl shadow-card border border-navy-50 p-5">
      <h2 className="font-display font-semibold text-navy-700 text-sm mb-3">Plano de Ação</h2>

      <div className="overflow-x-auto scrollbar-thin">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-[11px] uppercase tracking-wide text-slate-400 text-left">
              <th className="pb-2 pr-4">Ação</th>
              <th className="pb-2 pr-4">Responsável</th>
              <th className="pb-2 pr-4">Prazo</th>
              <th className="pb-2 pr-4">Status</th>
              <th className="pb-2 w-8" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-navy-50">
                <td className="py-2 pr-4 text-slate-700">{r.action}</td>
                <td className="py-2 pr-4 text-slate-500">{r.owner || "—"}</td>
                <td className="py-2 pr-4 text-slate-500">{r.dueDate || "—"}</td>
                <td className="py-2 pr-4">
                  <select
                    value={r.status ?? "Não Iniciado"}
                    onChange={(e) => handleStatusChange(r.id, e.target.value)}
                    className={clsx(
                      "text-xs font-medium rounded-full pl-2.5 pr-6 py-0.5 border-0 appearance-none cursor-pointer transition-colors",
                      "bg-[length:14px] bg-[right_4px_center] bg-no-repeat",
                      statusStyles[r.status ?? ""] ?? "bg-slate-100 text-slate-600",
                      savedId === r.id && "ring-2 ring-emerald-300"
                    )}
                    style={{
                      backgroundImage:
                        "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%2364748B' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")",
                    }}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="py-2">
                  <button
                    onClick={() => handleDelete(r.id)}
                    aria-label="Excluir ação"
                    title="Excluir ação"
                    className="text-slate-300 hover:text-red-500 transition-colors p-1"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="py-4 text-center text-slate-400 text-sm">
                  Nenhuma ação cadastrada ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 pt-4 border-t border-navy-50 grid grid-cols-1 sm:grid-cols-[1fr_180px_140px_auto] gap-2">
        <input
          value={action}
          onChange={(e) => setAction(e.target.value)}
          placeholder="Nova ação…"
          className="text-sm rounded-md border border-navy-50 px-3 py-2 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue"
        />
        <input
          value={owner}
          onChange={(e) => setOwner(e.target.value)}
          placeholder="Responsável"
          className="text-sm rounded-md border border-navy-50 px-3 py-2 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue"
        />
        <input
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          placeholder="Prazo"
          className="text-sm rounded-md border border-navy-50 px-3 py-2 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue"
        />
        <button
          onClick={handleAdd}
          disabled={isPending}
          className="text-sm font-medium rounded-md bg-brand-orange text-white px-4 py-2 hover:bg-brand-orangeDark transition-colors disabled:opacity-50"
        >
          Adicionar
        </button>
      </div>
    </div>
  );
}
