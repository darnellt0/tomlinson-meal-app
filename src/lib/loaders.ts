// src/lib/loaders.ts
import { fetchCsvObjects } from "@/lib/sheets";
import type { CalendarRow, GroceryRow, TrackingRow, PrepRow, ReflectionRow, MetricsBaselineRow, MetricsWeeklyRow, MetricsFinalRow } from "./types";

export async function loadCalendar(url: string): Promise<CalendarRow[]> {
  const rows = await fetchCsvObjects(url);
  return rows as CalendarRow[];
}

export async function loadGroceries(url: string): Promise<GroceryRow[]> {
  const rows = await fetchCsvObjects(url);
  return rows as GroceryRow[];
}

// Repeat for others as needed:
export async function loadTracking(url: string): Promise<TrackingRow[]> { /* ... */ return await fetchCsvObjects(url) as TrackingRow[]; }
export async function loadPrep(url: string): Promise<PrepRow[]> { /* ... */ return await fetchCsvObjects(url) as PrepRow[]; }
export async function loadReflection(url: string): Promise<ReflectionRow[]> { /* ... */ return await fetchCsvObjects(url) as ReflectionRow[]; }
export async function loadMetricsBaseline(url: string): Promise<MetricsBaselineRow[]> { /* ... */ return await fetchCsvObjects(url) as MetricsBaselineRow[]; }
export async function loadMetricsWeekly(url: string): Promise<MetricsWeeklyRow[]> { /* ... */ return await fetchCsvObjects(url) as MetricsWeeklyRow[]; }
export async function loadMetricsFinal(url: string): Promise<MetricsFinalRow[]> { /* ... */ return await fetchCsvObjects(url) as MetricsFinalRow[]; }
