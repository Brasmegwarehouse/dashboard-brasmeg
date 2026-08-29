import PageHeader from "@/components/PageHeader";
import MonthlyInputRow from "@/components/MonthlyInputRow";
import { months, availableYears, DEFAULT_YEAR } from "@/lib/indicators";
import { getMetricsForYear } from "@/lib/actions";

export const dynamic = "force-dynamic";

// Every field William used to fill in the "Base Dados" tab, grouped
// exactly like the original sections. Add a new section here and it
// shows up on the page — no schema migration needed since `metrics`
// is a flexible key/value table.
const sections: {
  title: string;
  indicator: string;
  rows: { label: string; key: string; suffix?: string }[];
}[] = [
  {
    title: "Recebimento",
    indicator: "recebimento_expedicao",
    rows: [{ label: "NF's Recebidas", key: "nfs_recebidas" }],
  },
  {
    title: "Não Conformidade",
    indicator: "inconformidades_operacionais",
    rows: [
      { label: "Avarias", key: "avarias" },
      { label: "Outros erros", key: "outros_erros" },
    ],
  },
  {
    title: "Expedição",
    indicator: "recebimento_expedicao",
    rows: [{ label: "NF's Expedidas", key: "nfs_expedidas" }],
  },
  {
    title: "Picking",
    indicator: "picking",
    rows: [
      { label: "Pallets Onda", key: "pallets_onda" },
      { label: "Picking Volumes", key: "picking_volumes" },
    ],
  },
  {
    title: "Acuracidade de Estoque",
    indicator: "acuracidade_estoque",
    rows: [
      { label: "Posições apuradas", key: "posicoes_apuradas" },
      { label: "Faltas", key: "faltas" },
    ],
  },
  {
    title: "Processos Rec/Exp (Veículos)",
    indicator: "processos_recebidos_expedidos",
    rows: [
      { label: "Geral Transporte Brasmeg", key: "geral_transporte" },
      { label: "Descarga Mecânica", key: "descarga_mecanica" },
      { label: "Descarga Manual", key: "descarga_manual" },
    ],
  },
  {
    title: "Digital da Unidade e Índice de Resultados",
    indicator: "digital_da_unidade",
    rows: [
      { label: "HHT (Operação)", key: "hht_operacao" },
      { label: "Faturamento Armazém", key: "faturamento_armazem" },
      { label: "Custo Armazém", key: "custo_armazem" },
      { label: "QTD M.O. (Operação)", key: "qtd_mo_operacao" },
      { label: "CIF $ (Entrada)", key: "cif_entrada" },
      { label: "M3", key: "m3" },
    ],
  },
  {
    title: "Atendimento Transporte",
    indicator: "atendimento_transporte",
    rows: [
      { label: "Descarga", key: "descarga" },
      { label: "Carga", key: "carga" },
    ],
  },
  {
    title: "Processos por Origem",
    indicator: "processos_por_origem",
    rows: [
      { label: "AG", key: "ag" },
      { label: "EXPO", key: "expo" },
      { label: "IMPO", key: "impo" },
      { label: "ACTIVAS", key: "activas" },
    ],
  },
  {
    title: "TONs por Origem",
    indicator: "tons_por_origem",
    rows: [
      { label: "LTL", key: "ltl" },
      { label: "EXPO", key: "expo" },
      { label: "IMPO", key: "impo" },
    ],
  },
  {
    title: "M³ por Origem",
    indicator: "m3_por_origem",
    rows: [
      { label: "LTL", key: "ltl" },
      { label: "EXPO", key: "expo" },
    ],
  },
  {
    title: "Movimentação Mecânica / Manual",
    indicator: "movimentacao_mecanica_manual",
    rows: [
      { label: "Mecânica", key: "mecanica" },
      { label: "Manual", key: "manual" },
    ],
  },
  {
    title: "Faturamento vs Orçado",
    indicator: "faturamento_vs_orcado",
    rows: [
      { label: "Faturamento", key: "faturamento" },
      { label: "Orçado", key: "orcado" },
    ],
  },
  {
    title: "Ocupação PP (%)",
    indicator: "ocupacao_pp",
    rows: [{ label: "Posições PP Ocupadas", key: "ocupadas_pct", suffix: "%" }],
  },
  {
    title: "Ocupação BL (%)",
    indicator: "ocupacao_bl",
    rows: [{ label: "Blocado M² Ocupado", key: "ocupadas_pct", suffix: "%" }],
  },
  {
    title: "Inconformidades Operacionais",
    indicator: "inconformidades_operacionais",
    rows: [
      { label: "AG", key: "ag" },
      { label: "Activas", key: "activas" },
      { label: "Transportes", key: "transportes" },
    ],
  },
];

export default async function BaseDadosPage({ searchParams }: { searchParams: { year?: string } }) {
  const requestedYear = Number(searchParams?.year);
  const YEAR = availableYears.includes(requestedYear) ? requestedYear : DEFAULT_YEAR;

  // Pull every metric already saved this year, one query, then index
  // it in memory so each row just looks up its own 12 values.
  const allIndicators = Array.from(new Set(sections.map((s) => s.indicator)));
  const rowsByIndicator = await Promise.all(
    allIndicators.map((ind) => getMetricsForYear(ind, YEAR))
  );
  const index = new Map<string, (number | null)[]>();
  allIndicators.forEach((ind, i) => {
    for (const row of rowsByIndicator[i]) {
      const arrKey = `${ind}::${row.metricKey}`;
      if (!index.has(arrKey)) index.set(arrKey, Array(12).fill(null));
      index.get(arrKey)![row.month - 1] = row.value === null ? null : Number(row.value);
    }
  });

  return (
    <>
      <PageHeader
        title="Base de Dados"
        objective="Preenchimento mensal único — alimenta automaticamente todos os relatórios de indicador ao lado."
        year={YEAR}
      />

      <main className="px-6 lg:px-10 py-8 space-y-8 max-w-6xl">
        <p className="text-sm text-slate-500 -mt-2">
          Digite os números do mês e saia do campo (Tab ou clique fora) para salvar. Cada linha
          alimenta o gráfico e os cartões da respectiva página de indicador. Use o seletor de{" "}
          <b>Ano</b> no topo para preencher dados de 2025 (histórico) — os relatórios comparam
          automaticamente com a média do ano anterior.
        </p>

        {sections.map((section) => (
          <div key={section.title + section.rows[0].key} className="bg-white rounded-xl shadow-card border border-navy-50">
            <div className="px-5 py-3 border-b border-navy-50">
              <h2 className="font-display font-semibold text-navy-700 text-sm">{section.title}</h2>
            </div>
            <div className="overflow-x-auto scrollbar-thin p-4">
              <table className="min-w-full border-separate border-spacing-0">
                <thead>
                  <tr>
                    <th className="text-left text-[11px] font-medium uppercase tracking-wide text-slate-400 pb-2 pr-4">
                      Indicador
                    </th>
                    {months.map((m) => (
                      <th key={m} className="text-[11px] font-medium uppercase tracking-wide text-slate-400 pb-2 px-1 text-center min-w-[64px]">
                        {m}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {section.rows.map((row) => (
                    <MonthlyInputRow
                      key={row.key}
                      label={row.label}
                      indicator={section.indicator}
                      metricKey={row.key}
                      year={YEAR}
                      initialValues={index.get(`${section.indicator}::${row.key}`) ?? Array(12).fill(null)}
                      path="/base-dados"
                      suffix={row.suffix}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </main>
    </>
  );
}
