import PageHeader from "@/components/PageHeader";
import KpiCard from "@/components/KpiCard";
import MonthlyBarChart from "@/components/MonthlyBarChart";
import PeriodInputRow, { Period } from "@/components/PeriodInputRow";
import SingleValueInput from "@/components/SingleValueInput";
import NotesEditor from "@/components/NotesEditor";
import ActionPlanTable from "@/components/ActionPlanTable";
import MonthPicker from "@/components/MonthPicker";
import { getMetricsForYear, getMonthlyNotes, getActionPlan } from "@/lib/actions";

export const dynamic = "force-dynamic";

const YEAR = 2026;
const INDICATOR = "posicoes_ocupadas_diario";
const PATH = "/posicoes-ocupadas-diario";

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export default async function PosicoesOcupadasDiarioPage({
  searchParams,
}: {
  searchParams: { month?: string };
}) {
  const month = Math.min(12, Math.max(1, Number(searchParams.month) || 8));
  const dayCount = daysInMonth(YEAR, month);
  const periods: Period[] = Array.from({ length: dayCount }, (_, i) => ({
    label: String(i + 1),
    metricKey: `dia_${pad(i + 1)}`,
  }));

  const [rows, notesRows, actionRows] = await Promise.all([
    getMetricsForYear(INDICATOR, YEAR),
    getMonthlyNotes(INDICATOR, YEAR),
    getActionPlan(INDICATOR),
  ]);

  const monthRows = rows.filter((r) => r.month === month);
  const dailyValues = periods.map((p) => {
    const found = monthRows.find((r) => r.metricKey === p.metricKey);
    return found && found.value !== null ? Number(found.value) : null;
  });
  const disponivelRow = monthRows.find((r) => r.metricKey === "disponiveis");
  const disponivel = disponivelRow && disponivelRow.value !== null ? Number(disponivelRow.value) : null;

  const lastIdx = (() => {
    for (let i = dailyValues.length - 1; i >= 0; i--) if (dailyValues[i] !== null) return i;
    return -1;
  })();

  const filled = dailyValues.filter((v): v is number => v !== null);
  const peak = filled.length ? Math.max(...filled) : null;
  const avg = filled.length ? filled.reduce((s, v) => s + v, 0) / filled.length : null;
  const occupancyPct = lastIdx >= 0 && disponivel ? (dailyValues[lastIdx]! / disponivel) * 100 : null;

  const chartData = periods.map((p, i) => ({ month: p.label, "Posições Ocupadas": dailyValues[i] ?? 0 }));

  const notesByMonth: Record<number, string> = {};
  notesRows.forEach((n) => (notesByMonth[n.month] = n.note ?? ""));

  return (
    <>
      <PageHeader
        title="Acompanhamento Posições Ocupadas x Posições Disponíveis"
        objective="Quantificar posições ocupadas em regime AG, dia a dia dentro do mês."
        year={YEAR}
      />

      <main className="px-6 lg:px-10 py-8 space-y-6 max-w-6xl">
        <div className="flex justify-end">
          <MonthPicker basePath={PATH} selected={month} />
        </div>

        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KpiCard label={`Ocupadas — dia ${lastIdx >= 0 ? lastIdx + 1 : "—"}`} value={lastIdx >= 0 ? String(dailyValues[lastIdx]) : "—"} />
          <KpiCard label="Posições Disponíveis" value={disponivel !== null ? disponivel.toLocaleString("pt-BR") : "—"} />
          <KpiCard label="Ocupação %" value={occupancyPct !== null ? `${occupancyPct.toFixed(1)}%` : "—"} />
          <KpiCard label="Pico do mês" value={peak !== null ? peak.toLocaleString("pt-BR") : "—"} hint={avg !== null ? `Média: ${avg.toFixed(0)}` : undefined} />
        </section>

        <section className="bg-white rounded-xl shadow-card border border-navy-50 p-5">
          <h2 className="font-display font-semibold text-navy-700 text-sm mb-4">Ocupação por dia</h2>
          <MonthlyBarChart data={chartData} series={[{ key: "Posições Ocupadas", label: "Posições Ocupadas", color: "#324A94" }]} />
        </section>

        <SingleValueInput
          label="Posições Disponíveis"
          hint="Capacidade total do regime AG — vale para o mês selecionado"
          indicator={INDICATOR}
          metricKey="disponiveis"
          year={YEAR}
          month={month}
          initialValue={disponivel}
          path={PATH}
        />

        <div className="bg-white rounded-xl shadow-card border border-navy-50">
          <div className="px-5 py-3 border-b border-navy-50">
            <h2 className="font-display font-semibold text-navy-700 text-sm">Preenchimento diário</h2>
          </div>
          <div className="overflow-x-auto scrollbar-thin p-4">
            <table className="min-w-full border-separate border-spacing-0">
              <thead>
                <tr>
                  <th className="text-left text-[11px] font-medium uppercase tracking-wide text-slate-400 pb-2 pr-4">Dia</th>
                  {periods.map((p) => (
                    <th key={p.metricKey} className="text-[11px] font-medium uppercase tracking-wide text-slate-400 pb-2 px-1 text-center min-w-[52px]">
                      {p.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <PeriodInputRow
                  label="Posições Ocupadas"
                  indicator={INDICATOR}
                  year={YEAR}
                  month={month}
                  periods={periods}
                  initialValues={dailyValues}
                  path={PATH}
                />
              </tbody>
            </table>
          </div>
        </div>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <NotesEditor indicator={INDICATOR} year={YEAR} initialNotes={notesByMonth} path={PATH} defaultMonth={month} />
          <ActionPlanTable indicator={INDICATOR} initialRows={actionRows} path={PATH} />
        </section>

        <p className="text-xs text-slate-400 pb-4">Área: Mauá · Responsável: Jeyson · Fórmula: soma dos volumes · Fonte: Excel</p>
      </main>
    </>
  );
}
