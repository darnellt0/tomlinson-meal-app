// src/components/views/PrepView.tsx
"use client";
import * as React from "react";
import { loadPrep } from "@/lib/loaders";
import type { PrepRow } from "@/lib/types";
import { PREP_CSV_URL } from "@/lib/sheets";
import { Card, CardContent } from "@/components/ui/card";

export default function PrepView() {
  const [rows, setRows] = React.useState<PrepRow[]>([]);
  React.useEffect(() => { loadPrep(PREP_CSV_URL).then(setRows); }, []);

  return (
    <div className="grid gap-4">
      {rows.map((r, i) => (
        <Card key={i}>
          <CardContent className="p-4 grid gap-2">
            <div className="text-sm text-gray-600">Week {r.Week}</div>
            <div><span className="font-semibold">Sunday:</span> {r["Sunday Tasks"]}</div>
            <div><span className="font-semibold">Time:</span> {r["Time Estimate"]}</div>
            <div><span className="font-semibold">Weekday Tasks:</span> {r["Weekday Tasks"]}</div>
            <div><span className="font-semibold">Assignments:</span> {r["Family Assignments"]}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
