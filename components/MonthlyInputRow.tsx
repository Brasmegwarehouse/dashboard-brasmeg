"use client";

import { useState, useTransition } from "react";
import { months } from "@/lib/indicators";
import { saveMetric } from "@/lib/actions";
import clsx from "clsx";

interface MonthlyInputRowProps {
  label: string;
  indicator: string;
  metricKey: string;
  year: number;
  initialValues: (number | null)[]; // length 12
  path: string;
  suffix?: string; // e.g. "%"
}

export default function MonthlyInputRow({
  label,
  indicator,
  metricKey,
  year,
  initialValues,
  path,
  suffix,
}: MonthlyInputRowProps) {
  const [values, setValues] = useState(initialValues);
  const [isPending, startTransition] = useTransition();
  const [savedMonth, setSavedMonth] = useState<number | null>(null);

  function handleBlur(monthIndex: number) {
    const raw = values[monthIndex];
    startTransition(async () => {
      await saveMetric(
        {
          year,
          month: monthIndex + 1,
          indicator,
          metricKey,
          value: raw === null || Number.isNaN(raw) ? null : raw,
        },
        path
      );
      setSavedMonth(monthIndex);
      setTimeout(() => setSavedMonth(null), 900);
    });
  }

  return (
    <tr className="border-b border-navy-50 last:border-0">
      <th scope="row" className="sticky left-0 bg-white text-left text-sm font-medium text-slate-700 py-2 pr-4 whitespace-nowrap">
        {label}
      </th>
      {months.map((m, i) => (
        <td key={m} className="px-1 py-1.5">
          <div className="relative">
            <input
              type="number"
              inputMode="decimal"
              aria-label={`${label} — ${m}`}
              value={values[i] ?? ""}
              onChange={(e) => {
                const next = [...values];
                next[i] = e.target.value === "" ? null : Number(e.target.value);
                setValues(next);
              }}
              onBlur={() => handleBlur(i)}
              className={clsx(
                "w-full rounded-md border px-2 py-1.5 text-sm text-right tabular-nums transition-colors",
                "border-navy-50 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue",
                savedMonth === i && "bg-emerald-50 border-emerald-200"
              )}
            />
            {suffix && values[i] !== null && (
              <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">
                {suffix}
              </span>
            )}
          </div>
        </td>
      ))}
    </tr>
  );
}
