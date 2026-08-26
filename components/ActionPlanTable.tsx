"use client";

import { useState, useTransition } from "react";
import { addActionPlanRow } from "@/lib/actions";
import clsx from "clsx";

interface Row {
  id: number;
  action: string;
  owner: string | null;
  dueDate: string | null;
  status: string | null;
  effective: string | null;
}

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

  function handleAdd() {
    if (!action.trim()) return;
    startTransition(async () => {
      await addActionPlanRow(indicator, action, owner, dueDate, path);
      setRows((prev) => [
        ...prev,
        { id: Date.now(), action, owner, dueDate, status: "Não Iniciado", effective: null },
      ]);
      setAction("");
      setOwner("");
      setDueDate("");
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
              <th className="pb-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-navy-50">
                <td className="py-2 pr-4 text-slate-700">{r.action}</td>
                <td className="py-2 pr-4 text-slate-500">{r.owner || "—"}</td>
                <td className="py-2 pr-4 text-slate-500">{r.dueDate || "—"}</td>
                <td className="py-2">
                  <span className={clsx("text-xs px-2 py-0.5 rounded-full font-medium", statusStyles[r.status ?? ""] ?? "bg-slate-100 text-slate-600")}>
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="py-4 text-center text-slate-400 text-sm">
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
