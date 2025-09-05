// src/components/views/MetricsView.tsx
"use client";
import * as React from "react";
import {
  loadMetricsBaseline, loadMetricsWeekly, loadMetricsFinal
} from "@/lib/loaders";
import type {
  MetricsBaselineRow, MetricsWeeklyRow, MetricsFinalRow
} from "@/lib/types";
import {
  METRICS_BASELINE_CSV_URL, METRICS_WEEKLY_CSV_URL, METRICS_FINAL_CSV_URL
} from "@/lib/sheets";

export default function MetricsView() {
  const [baseline, setBaseline] = React.useState<MetricsBaselineRow[]>([]);
  const [weekly, setWeekly] = React.useState<MetricsWeeklyRow[]>([]);
  const [finalRows, setFinalRows] = React.useState<MetricsFinalRow[]>([]);

  React.useEffect(() => {
    loadMetricsBaseline(METRICS_BASELINE_CSV_URL).then(setBaseline);
    loadMetricsWeekly(METRICS_WEEKLY_CSV_URL).then(setWeekly);
    loadMetricsFinal(METRICS_FINAL_CSV_URL).then(setFinalRows);
  }, []);

  return (
    <div className="grid gap-8">
      <section>
        <h3 className="text-lg font-semibold mb-2">Baseline</h3>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {["Metric","Value","Date","Notes"].map(h => <th key={h} className="border px-2 py-1 text-left">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {baseline.map((r, i) => (
              <tr key={i}>
                <td className="border px-2 py-1">{r.Metric}</td>
                <td className="border px-2 py-1">{r.Value}</td>
                <td className="border px-2 py-1">{r.Date}</td>
                <td className="border px-2 py-1">{r.Notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">Weekly Check-ins</h3>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {["Week","Weight","BP","Energy","Sleep","Mood","Digestion","CGM Avg","Notes"].map(h => <th key={h} className="border px-2 py-1 text-left">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {weekly.map((r, i) => (
              <tr key={i}>
                <td className="border px-2 py-1">{r.Week}</td>
                <td className="border px-2 py-1">{r.Weight}</td>
                <td className="border px-2 py-1">{r.BP}</td>
                <td className="border px-2 py-1">{r.Energy}</td>
                <td className="border px-2 py-1">{r.Sleep}</td>
                <td className="border px-2 py-1">{r.Mood}</td>
                <td className="border px-2 py-1">{r.Digestion}</td>
                <td className="border px-2 py-1">{r["CGM Avg"]}</td>
                <td className="border px-2 py-1">{r.Notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">Final</h3>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {["Metric","Baseline","Final","Change","Percentage"].map(h => <th key={h} className="border px-2 py-1 text-left">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {finalRows.map((r, i) => (
              <tr key={i}>
                <td className="border px-2 py-1">{r.Metric}</td>
                <td className="border px-2 py-1">{r.Baseline}</td>
                <td className="border px-2 py-1">{r.Final}</td>
                <td className="border px-2 py-1">{r.Change}</td>
                <td className="border px-2 py-1">{r.Percentage}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
