import PageHeader from "@/components/PageHeader";
import KpiCard from "@/components/KpiCard";
import MonthlyBarChart, { Series, ReferenceLineConfig } from "@/components/MonthlyBarChart";
import NotesEditor from "@/components/NotesEditor";
import ActionPlanTable from "@/components/ActionPlanTable";
import MonthPicker from "@/components/MonthPicker";
import { months, availableYears, DEFAULT_YEAR } from "@/lib/indicators";
import { getMetricsForYear, getMonthlyNotes, getActionPlan } from "@/lib/actions";
import { ReportConfig } from "@/lib/reportConfigs";

function formatValue(v: number, unit?: string) {
  if (unit === "%") return `${v.toFixed(1)}%`;
  if (unit === "R$") return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
  return v.toLocaleString("pt-BR", { maximumFractionDigits: 1 });
}

interface IndicatorReportPageProps {
  config: ReportConfig;
  searchParams?: { month?: string; year?: string };
}

export default async function IndicatorReportPage({ config, searchParams }: IndicatorReportPageProps) {
  const path = `/${config.slug}`;

  const requestedYear = Number(searchParams?.year);
  const year = availableYears.includes(requestedYear) ? requestedYear : DEFAULT_YEAR;
  const priorYear = year - 1;
  const hasPriorYear = availableYears.includes(priorYear);

  const [rows, priorRows, notesRows, actionRows] = await Promise.all([
    getMetricsForYear(config.indicator, year),
    hasPriorYear ? getMetricsForYear(config.indicator, priorYear) : Promise.resolve([]),
    getMonthlyNotes(config.indicator, year),
    getActionPlan(config.indicator),
  ]);

  const byKey = (dataset: typeof rows, key: string) => {
    const arr = Array(12).fill(null) as (number | null)[];
    dataset.filter((r) => r.metricKey === key).forEach((r) => (arr[r.month - 1] = r.value === null ? null : Number(r.value)));
    return arr;
  };

  const seriesValues = config.series.map((s) => ({ ...s, values: byKey(rows, s.key) }));

  const derivedValues = (config.derived ?? []).map((d) => {
    const [aKey, bKey] = d.from;
    const a = byKey(rows, aKey);
    const b = byKey(rows, bKey);
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

  const avg = (arr: (number | null)[]) => {
    const vals = arr.filter((v): v is number => v !== null);
    return vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : null;
  };

  // Prior-year average per raw series — drawn as a dashed reference
  // line on the chart and used for the "vs {priorYear}" comparison on
  // each KPI card. Only computed for raw series (not derived ratios),
  // to keep the comparison easy to read.
  const priorYearAvgByKey = new Map<string, number | null>();
  config.series.forEach((s) => {
    priorYearAvgByKey.set(s.key, hasPriorYear ? avg(byKey(priorRows, s.key)) : null);
  });

  const referenceLines: ReferenceLineConfig[] = hasPriorYear
    ? seriesValues
        .map((s) => {
          const priorAvg = priorYearAvgByKey.get(s.key);
          return priorAvg !== null && priorAvg !== undefined
            ? { label: `Méd. ${priorYear} · ${s.label}`, value: priorAvg, color: "#94A3B8" }
            : null;
        })
        .filter((r): r is ReferenceLineConfig => r !== null)
    : [];

  const lastFilledIndex = (arr: (number | null)[]) => {
    for (let i = 11; i >= 0; i--) if (arr[i] !== null) return i;
    return -1;
  };
  const lastIdx = Math.max(...allPlotted.map((s) => lastFilledIndex(s.values)));

  // The month shown in the KPI cards and pre-selected in "Análise do
  // indicador" — defaults to the most recent filled month, but the
  // person can switch via the picker in the header to review any
  // earlier month without losing the full-year chart below.
  const requestedMonth = Number(searchParams?.month);
  const selectedIdx =
    requestedMonth >= 1 && requestedMonth <= 12 ? requestedMonth - 1 : lastIdx >= 0 ? lastIdx : 0;
  const selectedMonthLabel = months[selectedIdx];

  const notesByMonth: Record<number, string> = {};
  notesRows.forEach((n) => (notesByMonth[n.month] = n.note ?? ""));

  const kpiTargets = allPlotted.slice(0, 4);

  return (
    <>
      <PageHeader title={config.title} objective={config.objective} year={year} />

      <main className="px-6 lg:px-10 py-8 space-y-6 max-w-6xl">
        <div className="flex justify-end">
          <MonthPicker selected={selectedIdx + 1} />
        </div>

        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {kpiTargets.map((s) => {
            const priorAvg = priorYearAvgByKey.get(s.key);
            const currentAvg = avg(s.values);
            return (
              <KpiCard
                key={s.key}
                label={`${s.label} — ${selectedMonthLabel}`}
                value={s.values[selectedIdx] !== null ? formatValue(s.values[selectedIdx]!, config.unit) : "—"}
                hint={
                  priorAvg !== null && priorAvg !== undefined
                    ? `Méd. ${year}: ${formatValue(currentAvg ?? 0, config.unit)} · Méd. ${priorYear}: ${formatValue(priorAvg, config.unit)}`
                    : `Média anual: ${formatValue(currentAvg ?? 0, config.unit)}`
                }
              />
            );
          })}
        </section>

        <section className="bg-white rounded-xl shadow-card border border-navy-50 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-navy-700 text-sm">Evolução mensal</h2>
            {hasPriorYear && (
              <p className="text-[11px] text-slate-400">Linha tracejada = média {priorYear}</p>
            )}
          </div>
          <MonthlyBarChart data={chartData} series={chartSeries} referenceLines={referenceLines} />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <NotesEditor
            indicator={config.indicator}
            year={year}
            initialNotes={notesByMonth}
            path={path}
            defaultMonth={selectedIdx + 1}
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
