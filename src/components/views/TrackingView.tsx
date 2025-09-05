// src/components/views/TrackingView.tsx
"use client";
import * as React from "react";
import { loadTracking } from "@/lib/loaders";
import type { TrackingRow } from "@/lib/types";
import { TRACKING_CSV_URL } from "@/lib/sheets";

export default function TrackingView() {
  const [rows, setRows] = React.useState<TrackingRow[]>([]);
  React.useEffect(() => { loadTracking(TRACKING_CSV_URL).then(setRows); }, []);

  return (
    <div className="overflow-auto">
      <table className="min-w-[900px] w-full border-collapse">
        <thead>
          <tr>
            {["Date","Day #","Breakfast","Lunch","Dinner","Snacks","Pre-Meal Glucose","1hr Post Glucose","2hr Post Glucose","Highest Reading","BP Reading","Energy (1-10)","Sleep (1-10)","Mood (1-10)","Notes"].map(h => (
              <th key={h} className="border px-2 py-1 text-left">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td className="border px-2 py-1">{r.Date}</td>
              <td className="border px-2 py-1">{r["Day #"]}</td>
              <td className="border px-2 py-1">{r.Breakfast}</td>
              <td className="border px-2 py-1">{r.Lunch}</td>
              <td className="border px-2 py-1">{r.Dinner}</td>
              <td className="border px-2 py-1">{r.Snacks}</td>
              <td className="border px-2 py-1">{r["Pre-Meal Glucose"]}</td>
              <td className="border px-2 py-1">{r["1hr Post Glucose"]}</td>
              <td className="border px-2 py-1">{r["2hr Post Glucose"]}</td>
              <td className="border px-2 py-1">{r["Highest Reading"]}</td>
              <td className="border px-2 py-1">{r["BP Reading"]}</td>
              <td className="border px-2 py-1">{r["Energy (1-10)"]}</td>
              <td className="border px-2 py-1">{r["Sleep (1-10)"]}</td>
              <td className="border px-2 py-1">{r["Mood (1-10)"]}</td>
              <td className="border px-2 py-1">{r.Notes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
