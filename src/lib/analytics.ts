// src/lib/analytics.ts
import type { TrackingRow } from "./types";

export type GlucoseReading = {
  date: string;
  fasting: number | null;
  postBreakfast: number | null;
  postLunch: number | null;
  postDinner: number | null;
  bedtime: number | null;
};

export type BPReading = {
  date: string;
  systolic: number | null;
  diastolic: number | null;
};

export type ChartData = {
  glucose: GlucoseReading[];
  bp: BPReading[];
};

/**
 * Parse tracking data for chart visualization
 */
export function parseTrackingForCharts(rows: TrackingRow[]): ChartData {
  const glucose: GlucoseReading[] = [];
  const bp: BPReading[] = [];

  rows.forEach((row) => {
    const date = row.Date || "";
    if (!date) return;

    // Parse glucose readings
    const preMeal = parseFloat(row["Pre-Meal Glucose"] || "");
    const oneHr = parseFloat(row["1hr Post Glucose"] || "");
    const twoHr = parseFloat(row["2hr Post Glucose"] || "");
    const highest = parseFloat(row["Highest Reading"] || "");

    // Create glucose reading entry
    glucose.push({
      date,
      fasting: isNaN(preMeal) ? null : preMeal,
      postBreakfast: isNaN(oneHr) ? null : oneHr,
      postLunch: isNaN(twoHr) ? null : twoHr,
      postDinner: isNaN(highest) ? null : highest,
      bedtime: null, // Not in current schema, placeholder for future
    });

    // Parse BP reading (format: "120/80")
    const bpStr = row["BP Reading"] || "";
    if (bpStr && bpStr.includes("/")) {
      const [sys, dia] = bpStr.split("/").map((s) => parseFloat(s.trim()));
      bp.push({
        date,
        systolic: isNaN(sys) ? null : sys,
        diastolic: isNaN(dia) ? null : dia,
      });
    } else {
      bp.push({
        date,
        systolic: null,
        diastolic: null,
      });
    }
  });

  return { glucose, bp };
}

/**
 * Filter data by date range (last N days)
 */
export function filterByDays<T extends { date: string }>(
  data: T[],
  days: number
): T[] {
  if (days === 0) return data; // Return all data

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  return data.filter((item) => {
    const itemDate = new Date(item.date);
    return itemDate >= cutoffDate;
  });
}

/**
 * Calculate average glucose reading
 */
export function calculateAverageGlucose(readings: GlucoseReading[]): number {
  const allValues: number[] = [];

  readings.forEach((r) => {
    if (r.fasting !== null) allValues.push(r.fasting);
    if (r.postBreakfast !== null) allValues.push(r.postBreakfast);
    if (r.postLunch !== null) allValues.push(r.postLunch);
    if (r.postDinner !== null) allValues.push(r.postDinner);
    if (r.bedtime !== null) allValues.push(r.bedtime);
  });

  if (allValues.length === 0) return 0;
  return allValues.reduce((sum, val) => sum + val, 0) / allValues.length;
}

/**
 * Calculate average blood pressure
 */
export function calculateAverageBP(readings: BPReading[]): {
  systolic: number;
  diastolic: number;
} {
  const validReadings = readings.filter(
    (r) => r.systolic !== null && r.diastolic !== null
  );

  if (validReadings.length === 0) {
    return { systolic: 0, diastolic: 0 };
  }

  const systolicSum = validReadings.reduce(
    (sum, r) => sum + (r.systolic || 0),
    0
  );
  const diastolicSum = validReadings.reduce(
    (sum, r) => sum + (r.diastolic || 0),
    0
  );

  return {
    systolic: Math.round(systolicSum / validReadings.length),
    diastolic: Math.round(diastolicSum / validReadings.length),
  };
}

/**
 * Find glucose spikes (readings above threshold)
 */
export function findGlucoseSpikes(
  readings: GlucoseReading[],
  threshold: number = 140
): Array<{ date: string; value: number; type: string }> {
  const spikes: Array<{ date: string; value: number; type: string }> = [];

  readings.forEach((r) => {
    if (r.fasting !== null && r.fasting > threshold) {
      spikes.push({ date: r.date, value: r.fasting, type: "Fasting" });
    }
    if (r.postBreakfast !== null && r.postBreakfast > threshold) {
      spikes.push({
        date: r.date,
        value: r.postBreakfast,
        type: "Post-Breakfast",
      });
    }
    if (r.postLunch !== null && r.postLunch > threshold) {
      spikes.push({ date: r.date, value: r.postLunch, type: "Post-Lunch" });
    }
    if (r.postDinner !== null && r.postDinner > threshold) {
      spikes.push({ date: r.date, value: r.postDinner, type: "Post-Dinner" });
    }
    if (r.bedtime !== null && r.bedtime > threshold) {
      spikes.push({ date: r.date, value: r.bedtime, type: "Bedtime" });
    }
  });

  return spikes;
}
