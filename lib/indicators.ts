export type IndicatorGroup =
  | "Movimentação"
  | "Ocupação"
  | "Qualidade & Financeiro"
  | "Análises";

export interface IndicatorDef {
  slug: string;
  name: string;
  group: IndicatorGroup;
  ready: boolean; // true = has a built report page in this prototype
}

export const indicators: IndicatorDef[] = [
  { slug: "base-dados", name: "Base de Dados (preenchimento)", group: "Movimentação", ready: true },
  { slug: "recebimento-expedicao", name: "Recebimento & Expedição", group: "Movimentação", ready: true },
  { slug: "picking", name: "Picking", group: "Movimentação", ready: true },
  { slug: "processos-recebidos-expedidos", name: "Processos Recebidos e Expedidos", group: "Movimentação", ready: true },
  { slug: "atendimento-transporte", name: "Atendimento Transporte", group: "Movimentação", ready: true },
  { slug: "processos-por-origem", name: "Processos por Origem", group: "Movimentação", ready: true },
  { slug: "tons-por-origem", name: "TONs por Origem", group: "Movimentação", ready: true },
  { slug: "m3-por-origem", name: "M³ por Origem", group: "Movimentação", ready: true },
  { slug: "movimentacao-mecanica-manual", name: "Movimentação Mecânica x Manual", group: "Movimentação", ready: true },

  { slug: "ocupacao-pp", name: "Ocupação PP", group: "Ocupação", ready: true },
  { slug: "ocupacao-bl", name: "Ocupação BL", group: "Ocupação", ready: true },
  { slug: "posicoes-ocupadas-diario", name: "Posições Ocupadas (diário)", group: "Ocupação", ready: false },

  { slug: "faturamento-vs-orcado", name: "Faturamento vs Orçado", group: "Qualidade & Financeiro", ready: true },
  { slug: "indice-de-resultados", name: "Índice de Resultados", group: "Qualidade & Financeiro", ready: true },
  { slug: "digital-da-unidade", name: "Digital da Unidade", group: "Qualidade & Financeiro", ready: true },
  { slug: "acuracidade-estoque", name: "Acuracidade de Estoque", group: "Qualidade & Financeiro", ready: true },
  { slug: "inconformidades-operacionais", name: "Inconformidades Operacionais", group: "Qualidade & Financeiro", ready: true },
  { slug: "seguro-contratado", name: "Seguro Contratado AG + Activas", group: "Qualidade & Financeiro", ready: false },

  { slug: "volumetria", name: "Volumetria", group: "Análises", ready: false },
];

export const groupOrder: IndicatorGroup[] = [
  "Movimentação",
  "Ocupação",
  "Qualidade & Financeiro",
  "Análises",
];

export const months = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];
