import PageHeader from "@/components/PageHeader";
import KpiCard from "@/components/KpiCard";
import MonthlyBarChart, { Series } from "@/components/MonthlyBarChart";
import NotesEditor from "@/components/NotesEditor";
import ActionPlanTable from "@/components/ActionPlanTable";
import { months } from "@/lib/indicators";
import { getMetricsForYear, getMonthlyNotes, getActionPlan } from "@/lib/actions";
import { ReportConfig } from "@/lib/reportConfigs";

const YEAR = 2026;

function formatValue(v: number, unit?: string) {
  if (unit === "%") return `${v.toFixed(1)}%`;
  if (unit === "R$") return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
  return v.toLocaleString("pt-BR", { maximumFractionDigits: 1 });
}

export default async function IndicatorReportPage({ config }: { config: ReportConfig }) {
  const path = `/${config.slug}`;

  const [rows, notesRows, actionRows] = await Promise.all([
    getMetricsForYear(config.indicator, YEAR),
    getMonthlyNotes(config.indicator, YEAR),
    getActionPlan(config.indicator),
  ]);

  const byKey = (key: string) => {
    const arr = Array(12).fill(null) as (number | null)[];
    rows.filter((r) => r.metricKey === key).forEach((r) => (arr[r.month - 1] = r.value === null ? null : Number(r.value)));
    return arr;
  };

  const seriesValues = config.series.map((s) => ({ ...s, values: byKey(s.key) }));

  const derivedValues = (config.derived ?? []).map((d) => {
    const [aKey, bKey] = d.from;
    const a = byKey(aKey);
    const b = byKey(bKey);
    const values = months.map((_, i) => {
      const av = a[i];
      const bv = b[i];
      if (av === null || bv === null || av === 0) return null;
      if (d.op === "accuracy_pct") return ((av - bv) / av) * 100;
      if (d.op === "ratio") return av / bv;
      return null;
    });
    return { ...d, values };
  });

  const allPlotted = [...seriesValues, ...derivedValues];

  const chartData = months.map((m, i) => {
    const row: Record<string, number | string> = { month: m };
    allPlotted.forEach((s) => (row[s.label] = s.values[i] ?? 0));
    return row;
  });

  const chartSeries: Series[] = allPlotted.map((s) => ({ key: s.label, label: s.label, color: s.color }));

  const lastFilledIndex = (arr: (number | null)[]) => {
    for (let i = 11; i >= 0; i--) if (arr[i] !== null) return i;
    return -1;
  };
  const lastIdx = Math.max(...allPlotted.map((s) => lastFilledIndex(s.values)));
  const currentMonthLabel = lastIdx >= 0 ? months[lastIdx] : "—";

  const avg = (arr: (number | null)[]) => {
    const vals = arr.filter((v): v is number => v !== null);
    return vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : 0;
  };

  const notesByMonth: Record<number, string> = {};
  notesRows.forEach((n) => (notesByMonth[n.month] = n.note ?? ""));

  const kpiTargets = allPlotted.slice(0, 4);

  return (
    <>
      <PageHeader title={config.title} objective={config.objective} year={YEAR} />

      <main className="px-6 lg:px-10 py-8 space-y-6 max-w-6xl">
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {kpiTargets.map((s) => (
            <KpiCard
              key={s.key}
              label={`${s.label} — ${currentMonthLabel}`}
              value={lastIdx >= 0 && s.values[lastIdx] !== null ? formatValue(s.values[lastIdx]!, config.unit) : "—"}
              hint={`Média anual: ${formatValue(avg(s.values), config.unit)}`}
            />
          ))}
        </section>

        <section className="bg-white rounded-xl shadow-card border border-navy-50 p-5">
          <h2 className="font-display font-semibold text-navy-700 text-sm mb-4">Evolução mensal</h2>
          <MonthlyBarChart data={chartData} series={chartSeries} />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <NotesEditor
            indicator={config.indicator}
            year={YEAR}
            initialNotes={notesByMonth}
            path={path}
            defaultMonth={lastIdx >= 0 ? lastIdx + 1 : 1}
          />
          <ActionPlanTable indicator={config.indicator} initialRows={actionRows} path={path} />
        </section>

        <p className="text-xs text-slate-400 pb-4">
          Área: {config.area} · Responsável: {config.responsavel}
          {config.formula ? ` · Fórmula: ${config.formula}` : ""}
          {config.fonte ? ` · Fonte: ${config.fonte}` : ""}
        </p>
      </main>
    </>
  );
}
