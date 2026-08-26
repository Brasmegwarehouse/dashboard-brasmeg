import PageHeader from "@/components/PageHeader";
import MonthlyBarChart from "@/components/MonthlyBarChart";
import NotesEditor from "@/components/NotesEditor";
import { months } from "@/lib/indicators";
import { getMetricsForYear, getMonthlyNotes } from "@/lib/actions";

export const dynamic = "force-dynamic";

const YEAR = 2026;
// Reuses the "digital_da_unidade" numbers already filled on Base de
// Dados — Receita/Custo/CIF por Mão de Obra are just ratios of those,
// so nothing new needs to be typed for this page to work.
const SOURCE_INDICATOR = "digital_da_unidade";
const NOTES_INDICATOR = "indice_de_resultados";
const PATH = "/indice-de-resultados";

function fmt(v: number) {
  return v.toLocaleString("pt-BR", { maximumFractionDigits: 0 });
}

export default async function IndiceDeResultadosPage() {
  const [rows, notesRows] = await Promise.all([
    getMetricsForYear(SOURCE_INDICATOR, YEAR),
    getMonthlyNotes(NOTES_INDICATOR, YEAR),
  ]);

  const byKey = (key: string) => {
    const arr = Array(12).fill(null) as (number | null)[];
    rows.filter((r) => r.metricKey === key).forEach((r) => (arr[r.month - 1] = r.value === null ? null : Number(r.value)));
    return arr;
  };

  const faturamento = byKey("faturamento_armazem");
  const custo = byKey("custo_armazem");
  const cif = byKey("cif_entrada");
  const mo = byKey("qtd_mo_operacao");

  const div = (a: (number | null)[], b: (number | null)[]) =>
    months.map((_, i) => (a[i] !== null && b[i] !== null && b[i] !== 0 ? a[i]! / b[i]! : null));

  const receitaPorMo = div(faturamento, mo);
  const custoPorMo = div(custo, mo);
  const cifPorMo = div(cif, mo);

  const lastIdx = (() => {
    for (let i = 11; i >= 0; i--) if (mo[i] !== null) return i;
    return -1;
  })();

  const chartData = months.map((m, i) => ({
    month: m,
    "Receita / M.O.": receitaPorMo[i] ?? 0,
    "Custo / M.O.": custoPorMo[i] ?? 0,
  }));

  const notesByMonth: Record<number, string> = {};
  notesRows.forEach((n) => (notesByMonth[n.month] = n.note ?? ""));

  return (
    <>
      <PageHeader
        title="Índice de Resultados"
        objective="Mensurar os resultados de receita e custo do armazém sobre a mão de obra."
        year={YEAR}
      />

      <main className="px-6 lg:px-10 py-8 space-y-6 max-w-6xl">
        <section className="bg-white rounded-xl shadow-card border border-navy-50 p-5">
          <h2 className="font-display font-semibold text-navy-700 text-sm mb-4">Receita e custo por mão de obra</h2>
          <MonthlyBarChart
            data={chartData}
            series={[
              { key: "Receita / M.O.", label: "Receita / M.O.", color: "#324A94" },
              { key: "Custo / M.O.", label: "Custo / M.O.", color: "#D26E38" },
            ]}
          />
        </section>

        <section className="bg-white rounded-xl shadow-card border border-navy-50 p-5 overflow-x-auto">
          <h2 className="font-display font-semibold text-navy-700 text-sm mb-4">Detalhe mensal</h2>
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-[11px] uppercase tracking-wide text-slate-400 text-left">
                <th className="pb-2 pr-4">Mês</th>
                <th className="pb-2 pr-4">Receita / M.O.</th>
                <th className="pb-2 pr-4">Custo / M.O.</th>
                <th className="pb-2">CIF / M.O.</th>
              </tr>
            </thead>
            <tbody>
              {months.map((m, i) => (
                <tr key={m} className="border-t border-navy-50">
                  <td className="py-2 pr-4 font-medium text-slate-700">{m}</td>
                  <td className="py-2 pr-4 text-slate-600">{receitaPorMo[i] !== null ? fmt(receitaPorMo[i]!) : "—"}</td>
                  <td className="py-2 pr-4 text-slate-600">{custoPorMo[i] !== null ? fmt(custoPorMo[i]!) : "—"}</td>
                  <td className="py-2 text-slate-600">{cifPorMo[i] !== null ? fmt(cifPorMo[i]!) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <NotesEditor
          indicator={NOTES_INDICATOR}
          year={YEAR}
          initialNotes={notesByMonth}
          path={PATH}
          defaultMonth={lastIdx >= 0 ? lastIdx + 1 : 1}
        />

        <p className="text-xs text-slate-400 pb-4">
          Área: Mauá · Responsável: Jeyson · Fonte: Excel · Todos os valores vêm automaticamente de Digital da Unidade
        </p>
      </main>
    </>
  );
}
