import PageHeader from "@/components/PageHeader";
import KpiCard from "@/components/KpiCard";
import MonthlyBarChart, { ReferenceLineConfig } from "@/components/MonthlyBarChart";
import NotesEditor from "@/components/NotesEditor";
import ActionPlanTable from "@/components/ActionPlanTable";
import MonthPicker from "@/components/MonthPicker";
import { months, availableYears, DEFAULT_YEAR } from "@/lib/indicators";
import { getMetricsForYear, getMonthlyNotes, getActionPlan } from "@/lib/actions";

export const dynamic = "force-dynamic";

const INDICATOR = "recebimento_expedicao";
const PATH = "/recebimento-expedicao";

export default async function RecebimentoExpedicaoPage({
  searchParams,
}: {
  searchParams: { month?: string; year?: string };
}) {
  const requestedYear = Number(searchParams?.year);
  const year = availableYears.includes(requestedYear) ? requestedYear : DEFAULT_YEAR;
  const priorYear = year - 1;
  const hasPriorYear = availableYears.includes(priorYear);

  const [rows, priorRows, notesRows, actionRows] = await Promise.all([
    getMetricsForYear(INDICATOR, year),
    hasPriorYear ? getMetricsForYear(INDICATOR, priorYear) : Promise.resolve([]),
    getMonthlyNotes(INDICATOR, year),
    getActionPlan(INDICATOR),
  ]);

  const byKey = (dataset: typeof rows, key: string) => {
    const arr = Array(12).fill(null) as (number | null)[];
    dataset.filter((r) => r.metricKey === key).forEach((r) => (arr[r.month - 1] = r.value === null ? null : Number(r.value)));
    return arr;
  };

  const recebidas = byKey(rows, "nfs_recebidas");
  const expedidas = byKey(rows, "nfs_expedidas");
  // "Transporte" isn't captured on the Base Dados prototype form yet —
  // shown as zero until that section is added, same flexible-table pattern.
  const transporte = byKey(rows, "transporte");

  const chartData = months.map((m, i) => ({
    month: m,
    Recebimento: recebidas[i] ?? 0,
    Expedição: expedidas[i] ?? 0,
    Transporte: transporte[i] ?? 0,
  }));

  const sum = (arr: (number | null)[]) => arr.reduce((s: number, v) => s + (v ?? 0), 0);
  const count = (arr: (number | null)[]) => arr.filter((v) => v !== null).length;
  const avg = (arr: (number | null)[]) => (count(arr) ? sum(arr) / count(arr) : 0);
  const lastFilledIndex = (arr: (number | null)[]) => {
    for (let i = 11; i >= 0; i--) if (arr[i] !== null) return i;
    return -1;
  };

  const lastIdx = Math.max(lastFilledIndex(recebidas), lastFilledIndex(expedidas));

  // Which month the KPI cards + "Análise do indicador" show — switchable
  // via the picker, defaults to the most recent filled month. The chart
  // below always shows the full Jan–Dez year regardless of this pick.
  const requestedMonth = Number(searchParams?.month);
  const selectedIdx = requestedMonth >= 1 && requestedMonth <= 12 ? requestedMonth - 1 : lastIdx >= 0 ? lastIdx : 0;
  const selectedMonthLabel = months[selectedIdx];

  const recebidasPriorAvg = hasPriorYear ? avg(byKey(priorRows, "nfs_recebidas")) : null;
  const expedidasPriorAvg = hasPriorYear ? avg(byKey(priorRows, "nfs_expedidas")) : null;

  const referenceLines: ReferenceLineConfig[] = hasPriorYear
    ? [
        { label: `Méd. ${priorYear} · Recebimento`, value: recebidasPriorAvg ?? 0, color: "#94A3B8" },
        { label: `Méd. ${priorYear} · Expedição`, value: expedidasPriorAvg ?? 0, color: "#CBD5E1" },
      ]
    : [];

  const notesByMonth: Record<number, string> = {};
  notesRows.forEach((n) => (notesByMonth[n.month] = n.note ?? ""));

  return (
    <>
      <PageHeader
        title="NF's Recebimento e Expedição pelo WMS"
        objective="Quantificar NF's de recebimento e expedição de mercadorias através do WMS e Transporte (LTL Impo, EXPO e DI's)."
        year={year}
      />

      <main className="px-6 lg:px-10 py-8 space-y-6 max-w-6xl">
        <div className="flex justify-end">
          <MonthPicker selected={selectedIdx + 1} />
        </div>

        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KpiCard
            label={`Recebimento — ${selectedMonthLabel}`}
            value={recebidas[selectedIdx] !== null ? String(recebidas[selectedIdx]) : "—"}
            hint="NF's recebidas no mês"
          />
          <KpiCard
            label={`Expedição — ${selectedMonthLabel}`}
            value={expedidas[selectedIdx] !== null ? String(expedidas[selectedIdx]) : "—"}
            hint="NF's expedidas no mês"
          />
          <KpiCard
            label="Média anual · Recebimento"
            value={avg(recebidas).toFixed(0)}
            hint={recebidasPriorAvg !== null ? `Méd. ${priorYear}: ${recebidasPriorAvg.toFixed(0)}` : `Jan–Dez ${year}`}
          />
          <KpiCard
            label="Média anual · Expedição"
            value={avg(expedidas).toFixed(0)}
            hint={expedidasPriorAvg !== null ? `Méd. ${priorYear}: ${expedidasPriorAvg.toFixed(0)}` : `Jan–Dez ${year}`}
          />
        </section>

        <section className="bg-white rounded-xl shadow-card border border-navy-50 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-navy-700 text-sm">Processos por mês</h2>
            {hasPriorYear && <p className="text-[11px] text-slate-400">Linha tracejada = média {priorYear}</p>}
          </div>
          <MonthlyBarChart
            data={chartData}
            series={[
              { key: "Recebimento", label: "Recebimento", color: "#324A94" },
              { key: "Expedição", label: "Expedição", color: "#D26E38" },
              { key: "Transporte", label: "Transporte", color: "#94A9C2" },
            ]}
            referenceLines={referenceLines}
          />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <NotesEditor
            indicator={INDICATOR}
            year={year}
            initialNotes={notesByMonth}
            path={PATH}
            defaultMonth={selectedIdx + 1}
          />
          <ActionPlanTable indicator={INDICATOR} initialRows={actionRows} path={PATH} />
        </section>

        <p className="text-xs text-slate-400 pb-4">
          Área: Mauá · Responsável: Jeyson · Fórmula: soma dos volumes · Fonte: WMS / dados manuais
        </p>
      </main>
    </>
  );
}
