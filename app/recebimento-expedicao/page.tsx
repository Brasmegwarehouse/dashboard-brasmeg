import PageHeader from "@/components/PageHeader";
import KpiCard from "@/components/KpiCard";
import MonthlyBarChart from "@/components/MonthlyBarChart";
import NotesEditor from "@/components/NotesEditor";
import ActionPlanTable from "@/components/ActionPlanTable";
import { months } from "@/lib/indicators";
import { getMetricsForYear, getMonthlyNotes, getActionPlan } from "@/lib/actions";

export const dynamic = "force-dynamic";

const YEAR = 2026;
const INDICATOR = "recebimento_expedicao";
const PATH = "/recebimento-expedicao";

export default async function RecebimentoExpedicaoPage() {
  const [rows, notesRows, actionRows] = await Promise.all([
    getMetricsForYear(INDICATOR, YEAR),
    getMonthlyNotes(INDICATOR, YEAR),
    getActionPlan(INDICATOR),
  ]);

  const byKey = (key: string) => {
    const arr = Array(12).fill(null) as (number | null)[];
    rows.filter((r) => r.metricKey === key).forEach((r) => (arr[r.month - 1] = r.value === null ? null : Number(r.value)));
    return arr;
  };

  const recebidas = byKey("nfs_recebidas");
  const expedidas = byKey("nfs_expedidas");
  // "Transporte" isn't captured on the Base Dados prototype form yet —
  // shown as zero until that section is added, same flexible-table pattern.
  const transporte = byKey("transporte");

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
  const currentMonthLabel = lastIdx >= 0 ? months[lastIdx] : "—";

  const notesByMonth: Record<number, string> = {};
  notesRows.forEach((n) => (notesByMonth[n.month] = n.note ?? ""));

  return (
    <>
      <PageHeader
        title="NF's Recebimento e Expedição pelo WMS"
        objective="Quantificar NF's de recebimento e expedição de mercadorias através do WMS e Transporte (LTL Impo, EXPO e DI's)."
        year={YEAR}
      />

      <main className="px-6 lg:px-10 py-8 space-y-6 max-w-6xl">
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KpiCard
            label={`Recebimento — ${currentMonthLabel}`}
            value={lastIdx >= 0 ? String(recebidas[lastIdx] ?? 0) : "—"}
            hint="NF's recebidas no mês"
          />
          <KpiCard
            label={`Expedição — ${currentMonthLabel}`}
            value={lastIdx >= 0 ? String(expedidas[lastIdx] ?? 0) : "—"}
            hint="NF's expedidas no mês"
          />
          <KpiCard label="Média anual · Recebimento" value={avg(recebidas).toFixed(0)} hint="Jan–Dez 2026" />
          <KpiCard label="Média anual · Expedição" value={avg(expedidas).toFixed(0)} hint="Jan–Dez 2026" />
        </section>

        <section className="bg-white rounded-xl shadow-card border border-navy-50 p-5">
          <h2 className="font-display font-semibold text-navy-700 text-sm mb-4">Processos por mês</h2>
          <MonthlyBarChart
            data={chartData}
            series={[
              { key: "Recebimento", label: "Recebimento", color: "#1B4F8C" },
              { key: "Expedição", label: "Expedição", color: "#F2792B" },
              { key: "Transporte", label: "Transporte", color: "#94A9C2" },
            ]}
          />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <NotesEditor
            indicator={INDICATOR}
            year={YEAR}
            initialNotes={notesByMonth}
            path={PATH}
            defaultMonth={lastIdx >= 0 ? lastIdx + 1 : 1}
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
