// src/components/views/GroceriesView.tsx
"use client";

import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import type { GroceryRow } from "@/lib/types";
import { loadGroceries } from "@/lib/loaders";

const GROCERIES_W1_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTHgfjP9zXtcbLdDDBjL3eYfF-goQAxryyBYrBy_7RkpboHDG1VRE5_2Mesknl6uR1T0u15d53q2PJK/pub?gid=1104201051&single=true&output=csv"; // Week 1 sheet gid
const GROCERIES_W2_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTHgfjP9zXtcbLdDDBjL3eYfF-goQAxryyBYrBy_7RkpboHDG1VRE5_2Mesknl6uR1T0u15d53q2PJK/pub?gid=253250838&single=true&output=csv"; // Week 2
const GROCERIES_W3_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTHgfjP9zXtcbLdDDBjL3eYfF-goQAxryyBYrBy_7RkpboHDG1VRE5_2Mesknl6uR1T0u15d53q2PJK/pub?gid=1304242431&single=true&output=csv"; // Week 3
const GROCERIES_W4_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTHgfjP9zXtcbLdDDBjL3eYfF-goQAxryyBYrBy_7RkpboHDG1VRE5_2Mesknl6uR1T0u15d53q2PJK/pub?gid=1507203300&single=true&output=csv"; // Week 4

const WEEK_URLS: Record<string, string> = {
  "Week 1": GROCERIES_W1_CSV_URL,
  "Week 2": GROCERIES_W2_CSV_URL,
  "Week 3": GROCERIES_W3_CSV_URL,
  "Week 4": GROCERIES_W4_CSV_URL,
};

export default function GroceriesView() {
  const [week, setWeek] = useState<string>("Week 1");
  const [rows, setRows] = useState<GroceryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [checked, setChecked] = useState<Record<number, boolean>>({});

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const data = await loadGroceries(WEEK_URLS[week]);
        setRows(data);
      } catch {
        setErr("Failed to load groceries.");
      } finally {
        setLoading(false);
      }
    })();
  }, [week]);

  const grouped = useMemo(() => {
    const byCat: Record<string, GroceryRow[]> = {};
    rows.forEach((r) => {
      const cat = r.Category || "Other";
      byCat[cat] = byCat[cat] || [];
      byCat[cat].push(r);
    });
    return byCat;
  }, [rows]);

  return (
    <div className="grid gap-4">
      <div className="flex items-center gap-2">
        <div className="text-sm text-gray-600">Select week:</div>
        <Select value={week} onValueChange={setWeek}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Choose week" />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(WEEK_URLS).map((w) => (
              <SelectItem key={w} value={w}>{w}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading && <div className="text-sm text-gray-500">Loading grocery list…</div>}
      {err && <div className="text-sm text-red-600">{err}</div>}

      {!loading && !err && Object.entries(grouped).map(([cat, items]) => (
        <Card key={cat} className="rounded-2xl border">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2">{cat}</h3>
            <div className="grid gap-2">
              {items.map((it, idx) => {
                const id = `${cat}-${idx}`;
                return (
                  <label key={id} className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={!!checked[idx]}
                      onChange={(e) => setChecked((c) => ({ ...c, [idx]: e.target.checked }))}
                    />
                    <span className="text-sm">
                      <span className="font-medium">{it.Item}</span>
                      {it.Quantity ? ` — ${it.Quantity}` : ""}{it.Notes ? ` • ${it.Notes}` : ""}
                    </span>
                  </label>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
