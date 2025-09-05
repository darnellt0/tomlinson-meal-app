// src/components/views/CalendarView.tsx
"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import type { CalendarRow } from "@/lib/types";
import { loadCalendar } from "@/lib/loaders";
import { Card, CardContent } from "@/components/ui/card";

const CSV_MEAL_CALENDAR =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTHgfjP9zXtcbLdDDBjL3eYfF-goQAxryyBYrBy_7RkpboHDG1VRE5_2Mesknl6uR1T0u15d53q2PJK/pub?gid=0&single=true&output=csv";

export default function CalendarView() {
  const [rows, setRows] = useState<CalendarRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

useEffect(() => {
  (async () => {
    try {
      const data = await loadCalendar(CSV_MEAL_CALENDAR);
      setRows(data);
    } catch {
      setErr("Failed to load calendar.");
    } finally {
      setLoading(false);
    }
  })();
}, []);

  if (loading) return <div className="text-sm text-gray-500">Loading calendar…</div>;
  if (err) return <div className="text-sm text-red-600">{err}</div>;

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {rows.map((r, i) => (
        <Card key={i} className="rounded-2xl border">
          <CardContent className="p-4 grid gap-1">
            <div className="text-xs text-gray-500">Week {r.Week} • {r.Day}</div>
            <div className="text-base font-semibold">{r["Cuisine Focus"]}</div>
            <div className="text-sm mt-1"><span className="font-semibold">B:</span> {r.Breakfast}</div>
            <div className="text-sm"><span className="font-semibold">L:</span> {r.Lunch}</div>
            <div className="text-sm"><span className="font-semibold">D:</span> {r.Dinner}</div>
            {r["Batch Notes"] && (
              <div className="text-xs text-gray-600 mt-2">📝 {r["Batch Notes"]}</div>
            )}
            {r["CGM Focus"] && (
              <div className="text-xs text-gray-600">📈 {r["CGM Focus"]}</div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
