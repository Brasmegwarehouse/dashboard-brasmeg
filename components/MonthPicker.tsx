"use client";

import { useRouter } from "next/navigation";
import { months } from "@/lib/indicators";

export default function MonthPicker({ basePath, selected }: { basePath: string; selected: number }) {
  const router = useRouter();
  return (
    <div className="flex items-center gap-2 bg-white border border-navy-50 rounded-lg px-3 py-1.5 shadow-card">
      <span className="text-xs text-slate-400">Mês</span>
      <select
        value={selected}
        onChange={(e) => router.push(`${basePath}?month=${e.target.value}`)}
        className="font-display font-semibold text-navy-700 text-sm bg-transparent focus:outline-none"
      >
        {months.map((m, i) => (
          <option key={m} value={i + 1}>
            {m}
          </option>
        ))}
      </select>
    </div>
  );
}
