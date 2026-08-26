import PageHeader from "@/components/PageHeader";
import KpiCard from "@/components/KpiCard";
import MonthlyBarChart from "@/components/MonthlyBarChart";
import NotesEditor from "@/components/NotesEditor";
import { months } from "@/lib/indicators";
import { getMetricsForYear, getMonthlyNotes } from "@/lib/actions";

export const dynamic = "force-dynamic";

const YEAR = 2026;
const INDICATOR = "digital_da_unidade";
const PATH = "/digital-da-unidade";

function fmtCurrency(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

export default async function DigitalDaUnidadePage() {
  const [rows, notesRows] = await Promise.all([
    getMetricsForYear(INDICATOR, YEAR),
    getMonthlyNotes(INDICATOR, YEAR),
  ]);

  const byKey = (key: string) => {
    const arr = Array(12).fill(null) as (number | null)[];
    rows.filter((r) => r.metricKey === key).forEach((r) => (arr[r.month - 1] = r.value === null ? null : Number(r.value)));
    return arr;
  };

  const cif = byKey("cif_entrada");
  const m3 = byKey("m3");
  const cifPorM3 = months.map((_, i) => (cif[i] && m3[i] ? cif[i]! / m3[i]! : null));

  const lastIdx = (() => {
    for (let i = 11; i >= 0; i--) if (cif[i] !== null && m3[i] !== null) return i;
    return -1;
  })();
  const currentMonthLabel = lastIdx >= 0 ? months[lastIdx] : "—";

  const chartData = months.map((m, i) => ({ month: m, "CIF por M³ (R$)": cifPorM3[i] ?? 0 }));

  const notesByMonth: Record<number, string> = {};
  notesRows.forEach((n) => (notesByMonth[n.month] = n.note ?? ""));

  return (
    <>
      <PageHeader
        title="Digital da Unidade"
        objective="Mensurar a produtividade do armazém pelo valor CIF de recebimento sobre o M³."
        year={YEAR}
      />

      <main className="px-6 lg:px-10 py-8 space-y-6 max-w-6xl">
        <section className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <KpiCard
            label={`CIF de Entrada — ${currentMonthLabel}`}
            value={lastIdx >= 0 ? fmtCurrency(cif[lastIdx]!) : "—"}
          />
          <KpiCard label={`M³ — ${currentMonthLabel}`} value={lastIdx >= 0 ? m3[lastIdx]!.toLocaleString("pt-BR") : "—"} />
          <KpiCard
            label={`CIF por M³ — ${currentMonthLabel}`}
            value={lastIdx >= 0 && cifPorM3[lastIdx] !== null ? fmtCurrency(cifPorM3[lastIdx]!) : "—"}
            hint="Quanto maior, mais valor agregado por m³ recebido"
          />
        </section>

        <section className="bg-white rounded-xl shadow-card border border-navy-50 p-5">
          <h2 className="font-display font-semibold text-navy-700 text-sm mb-4">CIF por M³ ao longo do ano</h2>
          <MonthlyBarChart data={chartData} series={[{ key: "CIF por M³ (R$)", label: "CIF por M³ (R$)", color: "#324A94" }]} />
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
          year={YEAR}
          initialNotes={notesByMonth}
          path={PATH}
          defaultMonth={lastIdx >= 0 ? lastIdx + 1 : 1}
        />

        <p className="text-xs text-slate-400 pb-4">
          Área: Mauá · Responsável: Jeyson · Fonte: Excel · Campos preenchidos em Base de Dados → Digital da Unidade e Índice de Resultados
        </p>
      </main>
    </>
  );
}
