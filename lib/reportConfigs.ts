export interface SeriesConfig {
  key: string; // metricKey in the `metrics` table
  label: string;
  color: string;
}

export interface DerivedSeriesConfig {
  key: string;
  label: string;
  color: string;
  from: [string, string]; // [a, b] metricKeys
  op: "accuracy_pct" | "ratio"; // accuracy_pct = (a-b)/a*100 ; ratio = a/b
}

export interface ReportConfig {
  slug: string;
  indicator: string; // matches `metrics.indicator` written from Base de Dados
  title: string;
  objective: string;
  area: string;
  responsavel: string;
  formula?: string;
  fonte?: string;
  series: SeriesConfig[];
  derived?: DerivedSeriesConfig[];
  unit?: "%" | "R$" | "";
}

// One config per indicator that follows the standard Jan-Dez pattern
// from the original spreadsheet. Each `series[].key` must match a
// `metricKey` written on the /base-dados page for the same `indicator`.
export const reportConfigs: Record<string, ReportConfig> = {
  picking: {
    slug: "picking",
    indicator: "picking",
    title: "Movimentação de Picking",
    objective: "Mensurar a movimentação das mercadorias no armazém.",
    area: "Mauá",
    responsavel: "Diogo",
    series: [
      { key: "pallets_onda", label: "Pallets Onda", color: "#324A94" },
      { key: "picking_volumes", label: "Picking Volumes", color: "#D26E38" },
    ],
  },

  "processos-recebidos-expedidos": {
    slug: "processos-recebidos-expedidos",
    indicator: "processos_recebidos_expedidos",
    title: "Processos Recebidos e Expedidos",
    objective:
      "Quantificar recebimentos e expedições de processos relacionados ao transporte Brasmeg (LTL Impo, EXPO e DI's).",
    area: "Mauá",
    responsavel: "Diogo",
    fonte: "Excel",
    series: [
      { key: "geral_transporte", label: "Geral Transporte Brasmeg", color: "#324A94" },
      { key: "descarga_mecanica", label: "Descarga Mecânica", color: "#D26E38" },
      { key: "descarga_manual", label: "Descarga Manual", color: "#94A9C2" },
    ],
  },

  "atendimento-transporte": {
    slug: "atendimento-transporte",
    indicator: "atendimento_transporte",
    title: "Atendimento Transporte Brasmeg",
    objective: "Mensurar veículos do transporte Brasmeg atendidos no período.",
    area: "Mauá",
    responsavel: "Diogo",
    fonte: "Service Desk",
    series: [
      { key: "descarga", label: "Descarga", color: "#324A94" },
      { key: "carga", label: "Carga", color: "#D26E38" },
    ],
  },

  "processos-por-origem": {
    slug: "processos-por-origem",
    indicator: "processos_por_origem",
    title: "Desmembramento de Processos por Origem",
    objective: "Desmembrar quantidade de processos por origem oriundos do transporte Brasmeg.",
    area: "Mauá",
    responsavel: "Diogo",
    fonte: "Excel",
    series: [
      { key: "ag", label: "AG", color: "#324A94" },
      { key: "expo", label: "EXPO", color: "#D26E38" },
      { key: "impo", label: "IMPO", color: "#94A9C2" },
      { key: "activas", label: "ACTIVAS", color: "#7C9070" },
    ],
  },

  "tons-por-origem": {
    slug: "tons-por-origem",
    indicator: "tons_por_origem",
    title: "TONs por Origem",
    objective: "Mensurar TONs por origem oriundos do transporte Brasmeg.",
    area: "Mauá",
    responsavel: "Diogo",
    fonte: "Excel",
    series: [
      { key: "ltl", label: "LTL", color: "#324A94" },
      { key: "expo", label: "EXPO", color: "#D26E38" },
      { key: "impo", label: "IMPO", color: "#94A9C2" },
    ],
  },

  "m3-por-origem": {
    slug: "m3-por-origem",
    indicator: "m3_por_origem",
    title: "M³ por Origem",
    objective: "Mensurar M³ por origem oriundos do transporte Brasmeg.",
    area: "Mauá",
    responsavel: "Diogo",
    fonte: "Excel",
    series: [
      { key: "ltl", label: "LTL", color: "#324A94" },
      { key: "expo", label: "EXPO", color: "#D26E38" },
    ],
  },

  "movimentacao-mecanica-manual": {
    slug: "movimentacao-mecanica-manual",
    indicator: "movimentacao_mecanica_manual",
    title: "Movimentação Mecânica / Manual",
    objective: "Mensurar quantidade de processos do transporte Brasmeg com movimentação mecânica/manual.",
    area: "Mauá",
    responsavel: "Jeyson",
    fonte: "Excel",
    series: [
      { key: "mecanica", label: "Mecânica", color: "#324A94" },
      { key: "manual", label: "Manual", color: "#D26E38" },
    ],
  },

  "faturamento-vs-orcado": {
    slug: "faturamento-vs-orcado",
    indicator: "faturamento_vs_orcado",
    title: "Faturamento AG Realizado vs Orçado",
    objective: "Mensurar o faturamento (R$) realizado vs orçado.",
    area: "Mauá",
    responsavel: "Jeyson",
    fonte: "Excel",
    unit: "R$",
    series: [
      { key: "faturamento", label: "Faturamento", color: "#324A94" },
      { key: "orcado", label: "Orçado", color: "#D26E38" },
    ],
  },

  "ocupacao-pp": {
    slug: "ocupacao-pp",
    indicator: "ocupacao_pp",
    title: "Taxa de Ocupação Porta Pallet",
    objective: "Mensurar o espaço ocupado com volume de mercadorias no armazém.",
    area: "Mauá",
    responsavel: "Jeyson",
    unit: "%",
    series: [{ key: "ocupadas_pct", label: "Posições PP Ocupadas", color: "#324A94" }],
  },

  "ocupacao-bl": {
    slug: "ocupacao-bl",
    indicator: "ocupacao_bl",
    title: "Taxa de Ocupação Blocado",
    objective: "Mensurar o espaço ocupado com volume de mercadorias no armazém.",
    area: "Mauá",
    responsavel: "Jeyson",
    fonte: "Excel",
    unit: "%",
    series: [{ key: "ocupadas_pct", label: "Blocado M² Ocupado", color: "#D26E38" }],
  },

  "acuracidade-estoque": {
    slug: "acuracidade-estoque",
    indicator: "acuracidade_estoque",
    title: "Acuracidade de Estoque",
    objective: "Mensurar o percentual de acuracidade no inventário cíclico do armazém.",
    area: "Mauá",
    responsavel: "Diogo",
    fonte: "Excel",
    unit: "%",
    series: [
      { key: "posicoes_apuradas", label: "Posições Apuradas", color: "#324A94" },
      { key: "faltas", label: "Faltas", color: "#D26E38" },
    ],
    derived: [
      {
        key: "acuracidade",
        label: "Acuracidade",
        color: "#7C9070",
        from: ["posicoes_apuradas", "faltas"],
        op: "accuracy_pct",
      },
    ],
  },

  "inconformidades-operacionais": {
    slug: "inconformidades-operacionais",
    indicator: "inconformidades_operacionais",
    title: "Inconformidades Operacionais",
    objective: "Quantificar inconformidades operacionais relacionadas ao AG, Activas e Transporte.",
    area: "Mauá",
    responsavel: "Jeyson",
    fonte: "Excel",
    series: [
      { key: "ag", label: "AG", color: "#324A94" },
      { key: "activas", label: "Activas", color: "#D26E38" },
      { key: "transportes", label: "Transportes", color: "#94A9C2" },
    ],
  },
};
