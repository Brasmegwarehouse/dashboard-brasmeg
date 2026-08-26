"use client";

import { useState, useTransition } from "react";
import { months } from "@/lib/indicators";
import { saveMonthlyNote } from "@/lib/actions";

interface NotesEditorProps {
  indicator: string;
  year: number;
  initialNotes: Record<number, string>; // month (1-12) -> note
  path: string;
  defaultMonth: number;
}

export default function NotesEditor({ indicator, year, initialNotes, path, defaultMonth }: NotesEditorProps) {
  const [month, setMonth] = useState(defaultMonth);
  const [notes, setNotes] = useState(initialNotes);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function handleBlur() {
    startTransition(async () => {
      await saveMonthlyNote(year, month, indicator, notes[month] ?? "", path);
      setSaved(true);
      setTimeout(() => setSaved(false), 1200);
    });
  }

  return (
    <div className="bg-white rounded-xl shadow-card border border-navy-50 p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display font-semibold text-navy-700 text-sm">Análise do indicador</h2>
        <select
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
          className="text-sm border border-navy-50 rounded-md px-2 py-1 bg-mist"
        >
          {months.map((m, i) => (
            <option key={m} value={i + 1}>
              {m}
            </option>
          ))}
        </select>
      </div>
      <textarea
        value={notes[month] ?? ""}
        onChange={(e) => setNotes((prev) => ({ ...prev, [month]: e.target.value }))}
        onBlur={handleBlur}
        rows={4}
        placeholder="Ex.: Armazém Geral fechamos o mês com X processos de entrada e Y de saída..."
        className="w-full text-sm rounded-md border border-navy-50 p-3 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue resize-none"
      />
      <p className="mt-1.5 text-[11px] text-slate-400 h-4">
        {isPending ? "Salvando…" : saved ? "Salvo ✓" : "Sai do campo para salvar automaticamente"}
      </p>
    </div>
  );
}
