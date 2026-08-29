import PageHeader from "@/components/PageHeader";
import KpiCard from "@/components/KpiCard";
import MonthlyBarChart, { ReferenceLineConfig } from "@/components/MonthlyBarChart";
import NotesEditor from "@/components/NotesEditor";
import MonthPicker from "@/components/MonthPicker";
import { months, availableYears, DEFAULT_YEAR } from "@/lib/indicators";
import { getMetricsForYear, getMonthlyNotes } from "@/lib/actions";

export const dynamic = "force-dynamic";

const INDICATOR = "digital_da_unidade";
const PATH = "/digital-da-unidade";

function fmtCurrency(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

export default async function DigitalDaUnidadePage({ searchParams }: { searchParams: { month?: string; year?: string } }) {
  const requestedYear = Number(searchParams?.year);
  const year = availableYears.includes(requestedYear) ? requestedYear : DEFAULT_YEAR;
  const priorYear = year - 1;
  const hasPriorYear = availableYears.includes(priorYear);

  const [rows, priorRows, notesRows] = await Promise.all([
    getMetricsForYear(INDICATOR, year),
    hasPriorYear ? getMetricsForYear(INDICATOR, priorYear) : Promise.resolve([]),
    getMonthlyNotes(INDICATOR, year),
  ]);

  const byKey = (dataset: typeof rows, key: string) => {
    const arr = Array(12).fill(null) as (number | null)[];
    dataset.filter((r) => r.metricKey === key).forEach((r) => (arr[r.month - 1] = r.value === null ? null : Number(r.value)));
    return arr;
  };

  const cif = byKey(rows, "cif_entrada");
  const m3 = byKey(rows, "m3");
  const cifPorM3 = months.map((_, i) => (cif[i] && m3[i] ? cif[i]! / m3[i]! : null));

  const priorCif = byKey(priorRows, "cif_entrada");
  const priorM3 = byKey(priorRows, "m3");
  const priorCifPorM3 = months.map((_, i) => (priorCif[i] && priorM3[i] ? priorCif[i]! / priorM3[i]! : null));
  const avg = (arr: (number | null)[]) => {
    const vals = arr.filter((v): v is number => v !== null);
    return vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : null;
  };
  const priorCifPorM3Avg = hasPriorYear ? avg(priorCifPorM3) : null;

  const lastIdx = (() => {
    for (let i = 11; i >= 0; i--) if (cif[i] !== null && m3[i] !== null) return i;
    return -1;
  })();

  const requestedMonth = Number(searchParams?.month);
  const selectedIdx = requestedMonth >= 1 && requestedMonth <= 12 ? requestedMonth - 1 : lastIdx >= 0 ? lastIdx : 0;
  const selectedMonthLabel = months[selectedIdx];

  const chartData = months.map((m, i) => ({ month: m, "CIF por M³ (R$)": cifPorM3[i] ?? 0 }));
  const referenceLines: ReferenceLineConfig[] =
    priorCifPorM3Avg !== null ? [{ label: `Méd. ${priorYear}`, value: priorCifPorM3Avg, color: "#94A3B8" }] : [];

  const notesByMonth: Record<number, string> = {};
  notesRows.forEach((n) => (notesByMonth[n.month] = n.note ?? ""));

  return (
    <>
      <PageHeader
        title="Digital da Unidade"
        objective="Mensurar a produtividade do armazém pelo valor CIF de recebimento sobre o M³."
        year={year}
      />

      <main className="px-6 lg:px-10 py-8 space-y-6 max-w-6xl">
        <div className="flex justify-end">
          <MonthPicker selected={selectedIdx + 1} />
        </div>

        <section className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <KpiCard
            label={`CIF de Entrada — ${selectedMonthLabel}`}
            value={cif[selectedIdx] !== null ? fmtCurrency(cif[selectedIdx]!) : "—"}
          />
          <KpiCard label={`M³ — ${selectedMonthLabel}`} value={m3[selectedIdx] !== null ? m3[selectedIdx]!.toLocaleString("pt-BR") : "—"} />
          <KpiCard
            label={`CIF por M³ — ${selectedMonthLabel}`}
            value={cifPorM3[selectedIdx] !== null ? fmtCurrency(cifPorM3[selectedIdx]!) : "—"}
            hint={priorCifPorM3Avg !== null ? `Méd. ${priorYear}: ${fmtCurrency(priorCifPorM3Avg)}` : "Quanto maior, mais valor agregado por m³"}
          />
        </section>

        <section className="bg-white rounded-xl shadow-card border border-navy-50 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-navy-700 text-sm">CIF por M³ ao longo do ano</h2>
            {priorCifPorM3Avg !== null && <p className="text-[11px] text-slate-400">Linha tracejada = média {priorYear}</p>}
          </div>
          <MonthlyBarChart
            data={chartData}
            series={[{ key: "CIF por M³ (R$)", label: "CIF por M³ (R$)", color: "#324A94" }]}
            referenceLines={referenceLines}
          />
        </section>

        <section className="bg-white rounded-xl shadow-card border border-navy-50 p-5 overflow-x-auto">
          <h2 className="font-display font-semibold text-navy-700 text-sm mb-4">Detalhe mensal</h2>
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-[11px] uppercase tracking-wide text-slate-400 text-left">
                <th className="pb-2 pr-4">Mês</th>
                <th className="pb-2 pr-4">CIF de Entrada</th>
                <th className="pb-2 pr-4">M³</th>
                <th className="pb-2">CIF / M³</th>
              </tr>
            </thead>
            <tbody>
              {months.map((m, i) => (
                <tr key={m} className="border-t border-navy-50">
                  <td className="py-2 pr-4 font-medium text-slate-700">{m}</td>
                  <td className="py-2 pr-4 text-slate-600">{cif[i] !== null ? fmtCurrency(cif[i]!) : "—"}</td>
                  <td className="py-2 pr-4 text-slate-600">{m3[i] !== null ? m3[i]!.toLocaleString("pt-BR") : "—"}</td>
                  <td className="py-2 text-slate-600">{cifPorM3[i] !== null ? fmtCurrency(cifPorM3[i]!) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <NotesEditor
          indicator={INDICATOR}
          year={year}
          initialNotes={notesByMonth}
          path={PATH}
          defaultMonth={selectedIdx + 1}
        />

        <p className="text-xs text-slate-400 pb-4">
          Área: Mauá · Responsável: Jeyson · Fonte: Excel · Campos preenchidos em Base de Dados → Digital da Unidade e Índice de Resultados
        </p>
      </main>
    </>
  );
}
