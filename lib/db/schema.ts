import {
  pgTable,
  serial,
  integer,
  smallint,
  text,
  numeric,
  timestamp,
  varchar,
  unique,
  date,
} from "drizzle-orm/pg-core";

/**
 * metrics
 * ---------------------------------------------------------------
 * One row per (year, month, indicator, metricKey).
 * This mirrors the "Base Dados" tab of the original spreadsheet:
 * every number William types in — NF's Recebidas, Avarias,
 * Posições PP Ocupadas, HHT, Faturamento Armazém, etc — lives here
 * as a single flexible table instead of one column per month.
 * That's what lets every report page (Recebimento & Expedição,
 * Ocupação PP, Volumetria...) just query by `indicator` and pivot
 * months into columns/charts, the same way the spreadsheet's
 * formulas pulled from "Base Dados" into each report tab.
 */
export const metrics = pgTable(
  "metrics",
  {
    id: serial("id").primaryKey(),
    year: smallint("year").notNull(),
    month: smallint("month").notNull(), // 1-12
    indicator: varchar("indicator", { length: 64 }).notNull(), // e.g. "recebimento_expedicao"
    metricKey: varchar("metric_key", { length: 96 }).notNull(), // e.g. "nfs_recebidas"
    value: numeric("value"),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    uniqueEntry: unique().on(t.year, t.month, t.indicator, t.metricKey),
  })
);

/**
 * monthly_notes
 * ---------------------------------------------------------------
 * The "Análise do indicador" / "Observações mensais" free-text
 * block that appears at the bottom of every report tab.
 */
export const monthlyNotes = pgTable(
  "monthly_notes",
  {
    id: serial("id").primaryKey(),
    year: smallint("year").notNull(),
    month: smallint("month").notNull(),
    indicator: varchar("indicator", { length: 64 }).notNull(),
    note: text("note"),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    uniqueEntry: unique().on(t.year, t.month, t.indicator),
  })
);

/**
 * action_plan
 * ---------------------------------------------------------------
 * The "Plano de Ação" table (Ação / Responsável / Prazo / Status)
 * that appears at the bottom of report tabs.
 */
export const actionPlan = pgTable("action_plan", {
  id: serial("id").primaryKey(),
  indicator: varchar("indicator", { length: 64 }).notNull(),
  action: text("action").notNull(),
  owner: varchar("owner", { length: 120 }),
  dueDate: varchar("due_date", { length: 20 }),
  status: varchar("status", { length: 24 }).default("Não Iniciado"),
  effective: varchar("effective", { length: 8 }), // "Sim" | "Não"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * operacoes
 * ---------------------------------------------------------------
 * One row per veículo atendido no pátio — substitui a aba "Registro"
 * da planilha de Controle Operacional Carga & Descarga.
 * Preenchimento em duas etapas, pelos dois times:
 *   1) Portaria/ADM lança o veículo até a liberação (data..horaLiberacao)
 *   2) Operação completa horaInicioOperacao + horaSaida ao final,
 *      junto com os serviços adicionais usados (tabela abaixo).
 * Status ("Aguardando" / "Em Operação" / "Atrasado" / "Finalizado")
 * é derivado dos horários em tempo real, não fica salvo aqui.
 */
export const operacoes = pgTable("operacoes", {
  id: serial("id").primaryKey(),
  data: date("data", { mode: "string" }).notNull(),
  cliente: varchar("cliente", { length: 120 }).notNull(),
  nf: varchar("nf", { length: 40 }),
  qtdeNf: integer("qtde_nf"),
  placa: varchar("placa", { length: 40 }).notNull(),
  transportadora: varchar("transportadora", { length: 160 }),
  tipoOperacao: varchar("tipo_operacao", { length: 40 }).notNull(),
  horaChegada: varchar("hora_chegada", { length: 5 }), // "HH:MM" — preenchido pela Portaria/ADM
  horaLiberacao: varchar("hora_liberacao", { length: 5 }), // idem
  horaInicioOperacao: varchar("hora_inicio_operacao", { length: 5 }), // preenchido pela Operação
  horaSaida: varchar("hora_saida", { length: 5 }), // idem — presença deste campo = "Finalizado"
  observacoes: text("observacoes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * operacao_servicos
 * ---------------------------------------------------------------
 * Serviços adicionais usados numa operação (Stretch, Pallet,
 * Etiquetagem, Outro...), só os marcados "Sim" ficam salvos aqui.
 * É essa tabela que alimenta a aba de Faturamento: cliente + NF +
 * serviços usados, pronto pra cobrança.
 */
export const operacaoServicos = pgTable("operacao_servicos", {
  id: serial("id").primaryKey(),
  operacaoId: integer("operacao_id")
    .notNull()
    .references(() => operacoes.id, { onDelete: "cascade" }),
  servico: varchar("servico", { length: 80 }).notNull(),
  quantidade: numeric("quantidade"),
  descricao: text("descricao"), // usado pelo serviço "Outro"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
