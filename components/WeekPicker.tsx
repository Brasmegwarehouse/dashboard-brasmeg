"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export default function WeekPicker({ selected, weekCount }: { selected: number; weekCount: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("week", value);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-2 bg-white border border-navy-50 rounded-lg px-3 py-1.5 shadow-card">
      <span className="text-xs text-slate-400">Semana</span>
      <select
        value={selected}
        onChange={(e) => handleChange(e.target.value)}
        className="font-display font-semibold text-navy-700 text-sm bg-transparent focus:outline-none"
      >
        {Array.from({ length: weekCount }, (_, i) => i + 1).map((w) => (
          <option key={w} value={w}>
            S{pad(w)}
          </option>
        ))}
      </select>
    </div>
  );
}
