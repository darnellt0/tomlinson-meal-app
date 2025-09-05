// src/components/views/GroceriesView.tsx
"use client";
import * as React from "react";
import type { GroceryRow } from "@/lib/types";
import { loadGroceries } from "@/lib/loaders";
import {
  GROCERIES_W1_CSV_URL, GROCERIES_W2_CSV_URL,
  GROCERIES_W3_CSV_URL, GROCERIES_W4_CSV_URL
} from "@/lib/sheets";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox"; // if you want visual checkboxes

const WEEK_URLS: Record<string, string> = {
  "Week 1": GROCERIES_W1_CSV_URL,
  "Week 2": GROCERIES_W2_CSV_URL,
  "Week 3": GROCERIES_W3_CSV_URL,
  "Week 4": GROCERIES_W4_CSV_URL,
};

export default function GroceriesView() {
  const [week, setWeek] = React.useState<keyof typeof WEEK_URLS>("Week 1");
  const [rows, setRows] = React.useState<GroceryRow[]>([]);

  React.useEffect(() => {
    loadGroceries(WEEK_URLS[week]).then(setRows);
  }, [week]);

  const grouped = React.useMemo(() => {
    const map = new Map<string, GroceryRow[]>();
    rows.forEach(r => {
      const key = r.Category || "Other";
      map.set(key, [...(map.get(key) || []), r]);
    });
    return map;
  }, [rows]);

  return (
    <div className="grid gap-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Week:</span>
        <Select value={week} onValueChange={(v) => setWeek(v as any)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Pick week" />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(WEEK_URLS).map(w => <SelectItem key={w} value={w}>{w}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {[...grouped.entries()].map(([cat, items]) => (
        <Card key={cat}>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2">{cat}</h3>
            <ul className="space-y-2">
              {items.map((it, i) => (
                <li key={i} className="flex items-center gap-2">
                  {/* local-only checkbox UI */}
                  <Checkbox />
                  <span className="font-medium">{it.Item}</span>
                  {it.Quantity && <span className="text-sm text-gray-600">— {it.Quantity}</span>}
                  {it.Notes && <span className="text-sm text-gray-500 italic">({it.Notes})</span>}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
