import PageHeader from "@/components/PageHeader";
import KpiCard from "@/components/KpiCard";
import MonthlyBarChart from "@/components/MonthlyBarChart";
import PeriodInputRow, { Period } from "@/components/PeriodInputRow";
import SingleValueInput from "@/components/SingleValueInput";
import WeeklyNotesEditor from "@/components/WeeklyNotesEditor";
import ActionPlanTable from "@/components/ActionPlanTable";
import WeekPicker from "@/components/WeekPicker";
import { availableYears, DEFAULT_YEAR } from "@/lib/indicators";
import { getMetricsForYear, getMonthlyNotes, getActionPlan } from "@/lib/actions";

export const dynamic = "force-dynamic";

const INDICATOR = "seguro_contratado";
const PATH = "/seguro-contratado";
const WEEK_COUNT = 52;
const CONST_MONTH = 1; // weekly data doesn't map to a calendar month — always stored under month=1

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function fmtCurrency(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

export default async function SeguroContratadoPage({ searchParams }: { searchParams: { week?: string; year?: string } }) {
  const requestedYear = Number(searchParams?.year);
  const YEAR = availableYears.includes(requestedYear) ? requestedYear : DEFAULT_YEAR;
  const weekPeriods: Period[] = Array.from({ length: WEEK_COUNT }, (_, i) => ({
    label: `S${pad(i + 1)}`,
    metricKey: `week_${pad(i + 1)}`,
  }));

  const [rows, notesRows, actionRows] = await Promise.all([
    getMetricsForYear(INDICATOR, YEAR),
    getMonthlyNotes(INDICATOR, YEAR),
    getActionPlan(INDICATOR),
  ]);

  const valuesFor = (prefix: string) =>
    weekPeriods.map((p) => {
      const found = rows.find((r) => r.metricKey === `${prefix}_${p.metricKey}`);
      return found && found.value !== null ? Number(found.value) : null;
    });

  const ag = valuesFor("ag");
  const activas = valuesFor("activas");
  const total = weekPeriods.map((_, i) => (ag[i] !== null || activas[i] !== null ? (ag[i] ?? 0) + (activas[i] ?? 0) : null));

  const tetoRow = rows.find((r) => r.metricKey === "teto_seguro");
  const teto = tetoRow && tetoRow.value !== null ? Number(tetoRow.value) : null;

  const lastIdx = (() => {
    for (let i = total.length - 1; i >= 0; i--) if (total[i] !== null) return i;
    return -1;
  })();

  // Which week the KPI cards + observações show — switchable via the
  // picker, defaults to the most recent filled week.
  const requestedWeek = Number(searchParams?.week);
  const selectedIdx = requestedWeek >= 1 && requestedWeek <= WEEK_COUNT ? requestedWeek - 1 : lastIdx >= 0 ? lastIdx : 0;

  const filled = total.filter((v): v is number => v !== null);
  const peak = filled.length ? Math.max(...filled) : null;
  const tetoUsoPct = total[selectedIdx] !== null && teto ? (total[selectedIdx]! / teto) * 100 : null;

  const chartData = weekPeriods.map((p, i) => ({ month: p.label, Total: total[i] ?? 0 }));

  const notesByWeek: Record<number, string> = {};
  notesRows.forEach((n) => (notesByWeek[n.month] = n.note ?? ""));

  return (
    <>
      <PageHeader
        title="Acompanhamento Seguro Contratado x CIF Armazenado"
        objective="Quantificar CIF armazenado (AG + Activas) frente ao seguro contratado, base semanal (segunda-feira)."
        year={YEAR}
      />

      <main className="px-6 lg:px-10 py-8 space-y-6 max-w-6xl">
        <div className="flex justify-end">
          <WeekPicker selected={selectedIdx + 1} weekCount={WEEK_COUNT} />
        </div>

        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KpiCard
            label={`CIF Total — ${weekPeriods[selectedIdx].label}`}
            value={total[selectedIdx] !== null ? fmtCurrency(total[selectedIdx]!) : "—"}
          />
          <KpiCard label="Teto do Seguro" value={teto !== null ? fmtCurrency(teto) : "—"} />
          <KpiCard label="% do teto ocupado" value={tetoUsoPct !== null ? `${tetoUsoPct.toFixed(1)}%` : "—"} />
          <KpiCard label="Pico do ano" value={peak !== null ? fmtCurrency(peak) : "—"} />
        </section>

        <section className="bg-white rounded-xl shadow-card border border-navy-50 p-5">
          <h2 className="font-display font-semibold text-navy-700 text-sm mb-4">CIF armazenado por semana</h2>
          <MonthlyBarChart data={chartData} series={[{ key: "Total", label: "Total (AG + Activas)", color: "#324A94" }]} />
        </section>

        <SingleValueInput
          label="Teto Seguro"
          hint="Valor de referência contratado — vale para o ano"
          indicator={INDICATOR}
          metricKey="teto_seguro"
          year={YEAR}
          month={CONST_MONTH}
          initialValue={teto}
          path={PATH}
          suffix="R$"
        />

        <div className="bg-white rounded-xl shadow-card border border-navy-50">
          <div className="px-5 py-3 border-b border-navy-50">
            <h2 className="font-display font-semibold text-navy-700 text-sm">Preenchimento semanal (R$)</h2>
          </div>
          <div className="overflow-x-auto scrollbar-thin p-4">
            <table className="min-w-full border-separate border-spacing-0">
              <thead>
                <tr>
                  <th className="text-left text-[11px] font-medium uppercase tracking-wide text-slate-400 pb-2 pr-4">Semana</th>
                  {weekPeriods.map((p) => (
                    <th key={p.metricKey} className="text-[11px] font-medium uppercase tracking-wide text-slate-400 pb-2 px-1 text-center min-w-[62px]">
                      {p.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <PeriodInputRow
                  label="AG"
                  indicator={INDICATOR}
                  year={YEAR}
                  month={CONST_MONTH}
                  periods={weekPeriods.map((p) => ({ label: p.label, metricKey: `ag_${p.metricKey}` }))}
                  initialValues={ag}
                  path={PATH}
                />
                <PeriodInputRow
                  label="Activas"
                  indicator={INDICATOR}
                  year={YEAR}
                  month={CONST_MONTH}
                  periods={weekPeriods.map((p) => ({ label: p.label, metricKey: `activas_${p.metricKey}` }))}
                  initialValues={activas}
                  path={PATH}
                />
              </tbody>
            </table>
          </div>
        </div>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <WeeklyNotesEditor
            indicator={INDICATOR}
            year={YEAR}
            initialNotes={notesByWeek}
            path={PATH}
            weekCount={WEEK_COUNT}
            defaultWeek={selectedIdx + 1}
          />
          <ActionPlanTable indicator={INDICATOR} initialRows={actionRows} path={PATH} />
        </section>

        <p className="text-xs text-slate-400 pb-4">Área: Mauá · Responsável: Jeyson · Fórmula: soma dos volumes · Fonte: Excel</p>
      </main>
    </>
  );
}
