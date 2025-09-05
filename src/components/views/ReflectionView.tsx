// src/components/views/ReflectionView.tsx
"use client";
import * as React from "react";
import { loadReflection } from "@/lib/loaders";
import type { ReflectionRow } from "@/lib/types";
import { REFLECTION_CSV_URL } from "@/lib/sheets";
import { Card, CardContent } from "@/components/ui/card";

export default function ReflectionView() {
  const [rows, setRows] = React.useState<ReflectionRow[]>([]);
  React.useEffect(() => { loadReflection(REFLECTION_CSV_URL).then(setRows); }, []);

  return (
    <div className="grid gap-4">
      {rows.map((r, i) => (
        <Card key={i}>
          <CardContent className="p-4 grid gap-2">
            {r.Week && <div className="text-xs text-gray-500">{r.Week}</div>}
            <div><span className="font-semibold">Question:</span> {r.Question}</div>
            <div><span className="font-semibold">Response:</span> {r.Response}</div>
            <div><span className="font-semibold">Action Items:</span> {r["Action Items"]}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
