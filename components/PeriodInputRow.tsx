"use client";

import { useState, useTransition } from "react";
import { saveMetric } from "@/lib/actions";
import clsx from "clsx";

export interface Period {
  label: string; // shown as column header, e.g. "1", "S05"
  metricKey: string; // e.g. "dia_01", "ag_week_05"
}

interface PeriodInputRowProps {
  label: string;
  indicator: string;
  year: number;
  month: number; // constant for every cell in this row — the "month" column just anchors where the row is stored
  periods: Period[];
  initialValues: (number | null)[]; // same length/order as periods
  path: string;
  suffix?: string;
}

export default function PeriodInputRow({
  label,
  indicator,
  year,
  month,
  periods,
  initialValues,
  path,
  suffix,
}: PeriodInputRowProps) {
  const [values, setValues] = useState(initialValues);
  const [, startTransition] = useTransition();
  const [savedIdx, setSavedIdx] = useState<number | null>(null);

  function handleBlur(i: number) {
    const raw = values[i];
    startTransition(async () => {
      await saveMetric(
        {
          year,
          month,
          indicator,
          metricKey: periods[i].metricKey,
          value: raw === null || Number.isNaN(raw) ? null : raw,
        },
        path
      );
      setSavedIdx(i);
      setTimeout(() => setSavedIdx(null), 900);
    });
  }

  return (
    <tr className="border-b border-navy-50 last:border-0">
      <th scope="row" className="sticky left-0 bg-white text-left text-sm font-medium text-slate-700 py-2 pr-4 whitespace-nowrap">
        {label}
      </th>
      {periods.map((p, i) => (
        <td key={p.metricKey} className="px-1 py-1.5">
          <div className="relative">
            <input
              type="number"
              inputMode="decimal"
              aria-label={`${label} — ${p.label}`}
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
                savedIdx === i && "bg-emerald-50 border-emerald-200"
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
