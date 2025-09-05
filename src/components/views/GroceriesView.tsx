"use client";

import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import type { GroceryRow } from "@/lib/types";
import { loadGroceries } from "@/lib/loaders";
import { Card, CardContent } from "@/components/ui/card";
//import { Checkbox } from "@/components/ui/checkbox"; // if you don't have it, use a simple input
import { Badge } from "@/components/ui/badge";

// 👉 Replace with your published CSV for SHEET 3 (WEEK 1)
const CSV_GROCERIES_W1 = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTHgfjP9zXtcbLdDDBjL3eYfF-goQAxryyBYrBy_7RkpboHDG1VRE5_2Mesknl6uR1T0u15d53q2PJK/pub?gid=1104201051&single=true&output=csv";

export function GroceriesView() {
  const [rows, setRows] = useState<GroceryRow[]>([]);
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadGroceries(CSV_GROCERIES_W1).then(setRows).catch(console.error);
  }, []);

  // Group by Category
  const groups = useMemo(() => {
    const map = new Map<string, GroceryRow[]>();
    rows.forEach(r => {
      const key = r.Category || "Other";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    });
    return Array.from(map.entries());
  }, [rows]);

  const toggle = (key: string) => setChecked(prev => ({ ...prev, [key]: !prev[key] }));

  if (!rows.length) return <div className="text-sm text-gray-600">Loading grocery list…</div>;

  return (
    <div className="grid gap-4">
      {groups.map(([cat, items]) => (
        <Card key={cat} className="rounded-2xl border">
          <CardContent className="p-4 grid gap-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{cat}</h3>
              <Badge variant="secondary">{items.length} items</Badge>
            </div>
            <ul className="grid gap-2">
              {items.map((it, idx) => {
                const key = `${cat}__${it.Item}__${idx}`;
                const isChecked = checked[key] || (it.Checked || "").includes("☑");
                return (
                  <li key={key} className="flex items-center justify-between gap-3">
                    <label className="flex items-center gap-3">
                      {/* if you don't have a Checkbox component, swap with <input type="checkbox" /> */}
                      <input
                        type="checkbox"
                        checked={!!isChecked}
                        onChange={() => toggle(key)}
                        className="size-4"
                      />
                      <span className={isChecked ? "line-through text-gray-400" : ""}>
                        {it.Item} {it.Quantity ? <em className="text-gray-500">({it.Quantity})</em> : null}
                      </span>
                    </label>
                    {it.Notes ? <span className="text-xs text-gray-500">{it.Notes}</span> : null}
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
