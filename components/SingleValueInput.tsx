"use client";

import { useState, useTransition } from "react";
import { saveMetric } from "@/lib/actions";
import clsx from "clsx";

interface SingleValueInputProps {
  label: string;
  hint?: string;
  indicator: string;
  metricKey: string;
  year: number;
  month: number;
  initialValue: number | null;
  path: string;
  suffix?: string;
}

export default function SingleValueInput({
  label,
  hint,
  indicator,
  metricKey,
  year,
  month,
  initialValue,
  path,
  suffix,
}: SingleValueInputProps) {
  const [value, setValue] = useState(initialValue);
  const [, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function handleBlur() {
    startTransition(async () => {
      await saveMetric(
        { year, month, indicator, metricKey, value: value === null || Number.isNaN(value) ? null : value },
        path
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 900);
    });
  }

  return (
    <div className="bg-white rounded-xl shadow-card border border-navy-50 p-4 flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-slate-700">{label}</p>
        {hint && <p className="text-[11px] text-slate-400 mt-0.5">{hint}</p>}
      </div>
      <div className="relative w-36 shrink-0">
        <input
          type="number"
          inputMode="decimal"
          value={value ?? ""}
          onChange={(e) => setValue(e.target.value === "" ? null : Number(e.target.value))}
          onBlur={handleBlur}
          className={clsx(
            "w-full rounded-md border px-3 py-2 text-sm text-right tabular-nums transition-colors",
            "border-navy-50 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue",
            saved && "bg-emerald-50 border-emerald-200"
          )}
        />
        {suffix && value !== null && (
          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}
