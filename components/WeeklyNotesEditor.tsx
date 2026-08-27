"use client";

import { useState, useTransition } from "react";
import { saveMonthlyNote } from "@/lib/actions";

interface WeeklyNotesEditorProps {
  indicator: string;
  year: number;
  initialNotes: Record<number, string>; // week (1-52) -> note
  path: string;
  weekCount: number;
  defaultWeek: number;
}

export default function WeeklyNotesEditor({ indicator, year, initialNotes, path, weekCount, defaultWeek }: WeeklyNotesEditorProps) {
  const [week, setWeek] = useState(defaultWeek);
  const [notes, setNotes] = useState(initialNotes);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function handleBlur() {
    startTransition(async () => {
      await saveMonthlyNote(year, week, indicator, notes[week] ?? "", path);
      setSaved(true);
      setTimeout(() => setSaved(false), 1200);
    });
  }

  return (
    <div className="bg-white rounded-xl shadow-card border border-navy-50 p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display font-semibold text-navy-700 text-sm">Observações da semana</h2>
        <select
          value={week}
          onChange={(e) => setWeek(Number(e.target.value))}
          className="text-sm border border-navy-50 rounded-md px-2 py-1 bg-mist"
        >
          {Array.from({ length: weekCount }, (_, i) => i + 1).map((w) => (
            <option key={w} value={w}>
              Semana {String(w).padStart(2, "0")}
            </option>
          ))}
        </select>
      </div>
      <textarea
        value={notes[week] ?? ""}
        onChange={(e) => setNotes((prev) => ({ ...prev, [week]: e.target.value }))}
        onBlur={handleBlur}
        rows={4}
        placeholder="Ex.: Fechamos a semana com um pico de estoque de aproximadamente..."
        className="w-full text-sm rounded-md border border-navy-50 p-3 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue resize-none"
      />
      <p className="mt-1.5 text-[11px] text-slate-400 h-4">
        {isPending ? "Salvando…" : saved ? "Salvo ✓" : "Sai do campo para salvar automaticamente"}
      </p>
    </div>
  );
}
