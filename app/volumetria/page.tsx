import PageHeader from "@/components/PageHeader";
import KpiCard from "@/components/KpiCard";
import MonthlyBarChart, { ReferenceLineConfig } from "@/components/MonthlyBarChart";
import MonthlyInputRow from "@/components/MonthlyInputRow";
import NotesEditor from "@/components/NotesEditor";
import ActionPlanTable from "@/components/ActionPlanTable";
import MonthPicker from "@/components/MonthPicker";
import { months, availableYears, DEFAULT_YEAR } from "@/lib/indicators";
import { getMetricsForYear, getMonthlyNotes, getActionPlan } from "@/lib/actions";

export const dynamic = "force-dynamic";

const INDICATOR = "volumetria";
const PATH = "/volumetria";

function fmtCurrency(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}
function fmtNumber(v: number) {
  return v.toLocaleString("pt-BR", { maximumFractionDigits: 0 });
}

const fields = [
  { label: "Total de Processos", key: "processos" },
  { label: "Peso Total (kg)", key: "peso_kg" },
  { label: "Volumetria Acumulada (m³)", key: "volume_m3" },
  { label: "M³ Total — Digital Armazém", key: "m3_digital" },
  { label: "CIF Total de Entrada (R$)", key: "cif_entrada" },
];

export default async function VolumetriaPage({ searchParams }: { searchParams: { month?: string; year?: string } }) {
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

  const processos = byKey(rows, "processos");
  const pesoKg = byKey(rows, "peso_kg");
  const volumeM3 = byKey(rows, "volume_m3");
  const cif = byKey(rows, "cif_entrada");

  const pesoMedio = months.map((_, i) => (processos[i] && pesoKg[i] ? pesoKg[i]! / processos[i]! : null));
  const cifPorM3 = months.map((_, i) => (volumeM3[i] && cif[i] ? cif[i]! / volumeM3[i]! : null));

  const avg = (arr: (number | null)[]) => {
    const vals = arr.filter((v): v is number => v !== null);
    return vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : null;
  };

  const priorProcessos = byKey(priorRows, "processos");
  const priorVolumeM3 = byKey(priorRows, "volume_m3");
  const priorCif = byKey(priorRows, "cif_entrada");
  const priorCifPorM3 = months.map((_, i) => (priorVolumeM3[i] && priorCif[i] ? priorCif[i]! / priorVolumeM3[i]! : null));
  const priorProcessosAvg = hasPriorYear ? avg(priorProcessos) : null;
  const priorCifPorM3Avg = hasPriorYear ? avg(priorCifPorM3) : null;

  const lastIdx = (() => {
    for (let i = 11; i >= 0; i--) if (processos[i] !== null) return i;
    return -1;
  })();

  const requestedMonth = Number(searchParams?.month);
  const selectedIdx = requestedMonth >= 1 && requestedMonth <= 12 ? requestedMonth - 1 : lastIdx >= 0 ? lastIdx : 0;
  const selectedMonthLabel = months[selectedIdx];

  const chartDataVolume = months.map((m, i) => ({
    month: m,
    "Total de Processos": processos[i] ?? 0,
  }));
  const chartDataCif = months.map((m, i) => ({
    month: m,
    "CIF por M³ (R$)": cifPorM3[i] ?? 0,
  }));

  const volumeReferenceLines: ReferenceLineConfig[] =
    priorProcessosAvg !== null ? [{ label: `Méd. ${priorYear}`, value: priorProcessosAvg, color: "#94A3B8" }] : [];
  const cifReferenceLines: ReferenceLineConfig[] =
    priorCifPorM3Avg !== null ? [{ label: `Méd. ${priorYear}`, value: priorCifPorM3Avg, color: "#94A3B8" }] : [];

  const notesByMonth: Record<number, string> = {};
  notesRows.forEach((n) => (notesByMonth[n.month] = n.note ?? ""));

  const index = new Map<string, (number | null)[]>();
  index.set("processos", processos);
  index.set("peso_kg", pesoKg);
  index.set("volume_m3", volumeM3);
  index.set("m3_digital", byKey(rows, "m3_digital"));
  index.set("cif_entrada", cif);

  return (
    <>
      <PageHeader
        title="Análise de Volumetria"
        objective="Mensurar processos, peso, volume e CIF de entrada do armazém, com produtividade por m³."
        year={year}
      />

      <main className="px-6 lg:px-10 py-8 space-y-6 max-w-6xl">
        <div className="flex justify-end">
          <MonthPicker selected={selectedIdx + 1} />
        </div>

        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KpiCard label={`Processos — ${selectedMonthLabel}`} value={processos[selectedIdx] !== null ? fmtNumber(processos[selectedIdx]!) : "—"} hint={priorProcessosAvg !== null ? `Méd. ${priorYear}: ${fmtNumber(priorProcessosAvg)}` : undefined} />
          <KpiCard label={`Peso Médio/Processo — ${selectedMonthLabel}`} value={pesoMedio[selectedIdx] !== null ? `${fmtNumber(pesoMedio[selectedIdx]!)} kg` : "—"} />
          <KpiCard label={`CIF Total — ${selectedMonthLabel}`} value={cif[selectedIdx] !== null ? fmtCurrency(cif[selectedIdx]!) : "—"} />
          <KpiCard label={`CIF por M³ — ${selectedMonthLabel}`} value={cifPorM3[selectedIdx] !== null ? fmtCurrency(cifPorM3[selectedIdx]!) : "—"} hint={priorCifPorM3Avg !== null ? `Méd. ${priorYear}: ${fmtCurrency(priorCifPorM3Avg)}` : undefined} />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-card border border-navy-50 p-5">
            <h2 className="font-display font-semibold text-navy-700 text-sm mb-4">Processos por mês</h2>
            <MonthlyBarChart data={chartDataVolume} series={[{ key: "Total de Processos", label: "Total de Processos", color: "#324A94" }]} height={260} referenceLines={volumeReferenceLines} />
          </div>
          <div className="bg-white rounded-xl shadow-card border border-navy-50 p-5">
            <h2 className="font-display font-semibold text-navy-700 text-sm mb-4">CIF por M³ (produtividade)</h2>
            <MonthlyBarChart data={chartDataCif} series={[{ key: "CIF por M³ (R$)", label: "CIF por M³ (R$)", color: "#D26E38" }]} height={260} referenceLines={cifReferenceLines} />
          </div>
        </section>

        <div className="bg-white rounded-xl shadow-card border border-navy-50">
          <div className="px-5 py-3 border-b border-navy-50">
            <h2 className="font-display font-semibold text-navy-700 text-sm">Preenchimento mensal</h2>
          </div>
          <div className="overflow-x-auto scrollbar-thin p-4">
            <table className="min-w-full border-separate border-spacing-0">
              <thead>
                <tr>
                  <th className="text-left text-[11px] font-medium uppercase tracking-wide text-slate-400 pb-2 pr-4">Indicador</th>
                  {months.map((m) => (
                    <th key={m} className="text-[11px] font-medium uppercase tracking-wide text-slate-400 pb-2 px-1 text-center min-w-[64px]">
                      {m}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fields.map((f) => (
                  <MonthlyInputRow
                    key={f.key}
                    label={f.label}
                    indicator={INDICATOR}
                    metricKey={f.key}
                    year={year}
                    initialValues={index.get(f.key) ?? Array(12).fill(null)}
                    path={PATH}
                  />
                ))}
              </tbody>
            </table>
          </div>
          <p className="px-4 pb-4 text-xs text-slate-400">
            Peso médio por processo e CIF por m³ são calculados automaticamente a partir dos campos acima.
          </p>
        </div>

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

        <p className="text-xs text-slate-400 pb-4">Área: Mauá · Responsável: Jeyson · Fonte: Base AppSheet</p>
      </main>
    </>
  );
}
