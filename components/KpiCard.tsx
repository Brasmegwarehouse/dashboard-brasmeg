import clsx from "clsx";

interface KpiCardProps {
  label: string;
  value: string;
  delta?: string;
  deltaDirection?: "up" | "down" | "flat";
  hint?: string;
}

export default function KpiCard({ label, value, delta, deltaDirection = "flat", hint }: KpiCardProps) {
  return (
    <div className="relative bg-white rounded-xl shadow-card border border-navy-50 p-5 overflow-hidden">
      <span className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-brand-blue to-brand-orange" />
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 font-display text-2xl font-semibold text-navy-700">{value}</p>
      {delta && (
        <p
          className={clsx(
            "mt-1.5 inline-flex items-center gap-1 text-xs font-medium",
            deltaDirection === "up" && "text-emerald-600",
            deltaDirection === "down" && "text-red-500",
            deltaDirection === "flat" && "text-slate-400"
          )}
        >
          {deltaDirection === "up" && "▲"}
          {deltaDirection === "down" && "▼"}
          {delta}
        </p>
      )}
      {hint && <p className="mt-2 text-[11px] text-slate-400">{hint}</p>}
    </div>
  );
}
