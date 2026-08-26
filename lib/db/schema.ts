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
