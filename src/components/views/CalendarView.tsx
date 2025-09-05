"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import type { CalendarRow } from "@/lib/types";
import { loadCalendar } from "@/lib/loaders";
import { Card, CardContent } from "@/components/ui/card";

// 👉 Replace with your published CSV for SHEET 1 (Meal Calendar)
const CSV_MEAL_CALENDAR = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTHgfjP9zXtcbLdDDBjL3eYfF-goQAxryyBYrBy_7RkpboHDG1VRE5_2Mesknl6uR1T0u15d53q2PJK/pubhtml?gid=0&single=true";

export function CalendarView() {
  const [rows, setRows] = useState<CalendarRow[]>([]);

  useEffect(() => {
    loadCalendar(CSV_MEAL_CALENDAR).then(setRows).catch(console.error);
  }, []);

  if (!rows.length) return <div className="text-sm text-gray-600">Loading calendar…</div>;

  return (
    <div className="grid gap-3">
      <Card className="rounded-2xl border">
        <CardContent className="p-0 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="text-left p-3">Week</th>
                <th className="text-left p-3">Day</th>
                <th className="text-left p-3">Date</th>
                <th className="text-left p-3">Cuisine</th>
                <th className="text-left p-3">Breakfast</th>
                <th className="text-left p-3">Lunch</th>
                <th className="text-left p-3">Dinner</th>
                <th className="text-left p-3">Batch Notes</th>
                <th className="text-left p-3">CGM Focus</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-t">
                  <td className="p-3">{r.Week}</td>
                  <td className="p-3">{r.Day}</td>
                  <td className="p-3">{r.Date}</td>
                  <td className="p-3">{r["Cuisine Focus"]}</td>
                  <td className="p-3">{r.Breakfast}</td>
                  <td className="p-3">{r.Lunch}</td>
                  <td className="p-3">{r.Dinner}</td>
                  <td className="p-3">{r["Batch Notes"]}</td>
                  <td className="p-3">{r["CGM Focus"]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
