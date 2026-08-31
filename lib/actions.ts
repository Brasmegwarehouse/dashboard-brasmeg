"use server";

import { db } from "./db";
import { metrics, monthlyNotes, actionPlan } from "./db/schema";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export interface MetricInput {
  year: number;
  month: number;
  indicator: string;
  metricKey: string;
  value: number | null;
}

// Drizzle's `numeric` column type maps to string in/out (avoids float
// rounding surprises on money fields). Convert at the boundary here so
// every caller can keep working with plain numbers.
function toDbValue(value: number | null) {
  return value === null ? null : String(value);
}

/** Upserts a single (year, month, indicator, metricKey) value. */
export async function saveMetric(input: MetricInput, path: string) {
  await db
    .insert(metrics)
    .values({ ...input, value: toDbValue(input.value) })
    .onConflictDoUpdate({
      target: [metrics.year, metrics.month, metrics.indicator, metrics.metricKey],
      set: { value: toDbValue(input.value), updatedAt: new Date() },
    });
  revalidatePath(path);
}

/** Saves many metrics from one form submit in a single round trip. */
export async function saveMetrics(inputs: MetricInput[], path: string) {
  for (const input of inputs) {
    await db
      .insert(metrics)
      .values({ ...input, value: toDbValue(input.value) })
      .onConflictDoUpdate({
        target: [metrics.year, metrics.month, metrics.indicator, metrics.metricKey],
        set: { value: toDbValue(input.value), updatedAt: new Date() },
      });
  }
  revalidatePath(path);
}

export async function getMetricsForYear(indicator: string, year: number) {
  return db
    .select()
    .from(metrics)
    .where(and(eq(metrics.indicator, indicator), eq(metrics.year, year)));
}

export async function saveMonthlyNote(
  year: number,
  month: number,
  indicator: string,
  note: string,
  path: string
) {
  await db
    .insert(monthlyNotes)
    .values({ year, month, indicator, note })
    .onConflictDoUpdate({
      target: [monthlyNotes.year, monthlyNotes.month, monthlyNotes.indicator],
      set: { note, updatedAt: new Date() },
    });
  revalidatePath(path);
}

export async function getMonthlyNotes(indicator: string, year: number) {
  return db
    .select()
    .from(monthlyNotes)
    .where(and(eq(monthlyNotes.indicator, indicator), eq(monthlyNotes.year, year)));
}

export async function getActionPlan(indicator: string) {
  return db.select().from(actionPlan).where(eq(actionPlan.indicator, indicator));
}

export async function addActionPlanRow(
  indicator: string,
  action: string,
  owner: string,
  dueDate: string,
  path: string
) {
  const [row] = await db.insert(actionPlan).values({ indicator, action, owner, dueDate }).returning();
  revalidatePath(path);
  return row;
}

export async function updateActionPlanStatus(id: number, status: string, path: string) {
  await db.update(actionPlan).set({ status }).where(eq(actionPlan.id, id));
  revalidatePath(path);
}

export async function deleteActionPlanRow(id: number, path: string) {
  await db.delete(actionPlan).where(eq(actionPlan.id, id));
  revalidatePath(path);
}
