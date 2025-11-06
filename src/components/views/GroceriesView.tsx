// src/components/views/GroceriesView.tsx
"use client";

import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Package, ShoppingCart } from "lucide-react";
import type { GroceryRow } from "@/lib/types";
import { loadGroceries } from "@/lib/loaders";
import { ExportMenu } from "@/components/grocery/ExportMenu";
import { ShoppingMode } from "@/components/grocery/ShoppingMode";
import { isInPantry, addToPantry, removeFromPantry } from "@/lib/pantry-storage";

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

export default function GroceriesView({ searchQuery = "" }: { searchQuery?: string }) {
  const [week, setWeek] = useState<string>("Week 1");
  const [rows, setRows] = useState<GroceryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [showPantryItems, setShowPantryItems] = useState(true);
  const [shoppingMode, setShoppingMode] = useState(false);
  const [pantryRefresh, setPantryRefresh] = useState(0);

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

  // Filter rows based on search query
  const filteredRows = useMemo(() => {
    if (!searchQuery.trim()) return rows;

    const query = searchQuery.toLowerCase();
    return rows.filter((r) => {
      const searchableText = [
        r.Item,
        r.Quantity,
        r.Category,
        r.Notes,
      ].filter(Boolean).join(" ").toLowerCase();

      return searchableText.includes(query);
    });
  }, [rows, searchQuery]);

  // Filter based on pantry preference
  const displayRows = useMemo(() => {
    if (showPantryItems) return filteredRows;
    return filteredRows.filter((r) => !isInPantry(r.Item || ""));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredRows, showPantryItems, pantryRefresh]); // pantryRefresh forces re-check when pantry changes

  const grouped = useMemo(() => {
    const byCat: Record<string, GroceryRow[]> = {};
    displayRows.forEach((r) => {
      const cat = r.Category || "Other";
      byCat[cat] = byCat[cat] || [];
      byCat[cat].push(r);
    });
    return byCat;
  }, [displayRows]);

  // Pantry toggle handler
  const handlePantryToggle = (itemName: string) => {
    if (isInPantry(itemName)) {
      removeFromPantry(itemName);
    } else {
      addToPantry({
        item: itemName,
        quantity: "",
        addedDate: new Date().toISOString(),
      });
    }
    setPantryRefresh((prev) => prev + 1); // Force re-render
  };

  return (
    <div className="grid gap-4">
      {/* Header with week selector, export menu, and shopping mode */}
      <div className="flex flex-wrap items-center gap-2">
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

        {/* Export menu */}
        {!loading && !err && rows.length > 0 && (
          <ExportMenu items={displayRows} week={week} />
        )}

        {/* Shopping mode button */}
        {!loading && !err && rows.length > 0 && (
          <Button
            variant="default"
            size="sm"
            onClick={() => setShoppingMode(true)}
            className="gap-2"
          >
            <ShoppingCart className="w-4 h-4" />
            Shopping Mode
          </Button>
        )}
      </div>

      {/* Pantry filter checkbox */}
      {!loading && !err && rows.length > 0 && (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="show-pantry"
            checked={showPantryItems}
            onChange={(e) => setShowPantryItems(e.target.checked)}
            className="cursor-pointer"
          />
          <label htmlFor="show-pantry" className="text-sm cursor-pointer">
            Show items already in pantry
          </label>
        </div>
      )}

      {loading && <div className="text-sm text-gray-500">Loading grocery list…</div>}
      {err && <div className="text-sm text-red-600">{err}</div>}

      {!loading && !err && searchQuery && Object.keys(grouped).length === 0 && (
        <div className="text-sm text-gray-500">No grocery items match your search.</div>
      )}

      {!loading && !err && Object.entries(grouped).map(([cat, items]) => (
        <Card key={cat} className="rounded-2xl border">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2">{cat}</h3>
            <div className="grid gap-2">
              {items.map((it, idx) => {
                const id = `${cat}-${idx}`;
                const inPantry = isInPantry(it.Item || "");
                return (
                  <div key={id} className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={!!checked[idx]}
                      onChange={(e) => setChecked((c) => ({ ...c, [idx]: e.target.checked }))}
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm flex items-center gap-2">
                        <span className="font-medium">{it.Item}</span>
                        {inPantry && (
                          <span title="In pantry">
                            <Package className="w-4 h-4 text-green-600 flex-shrink-0" />
                          </span>
                        )}
                      </span>
                      <div className="text-xs text-gray-600">
                        {it.Quantity ? ` ${it.Quantity}` : ""}
                        {it.Notes ? ` • ${it.Notes}` : ""}
                      </div>
                    </div>
                    <button
                      onClick={() => handlePantryToggle(it.Item || "")}
                      className="text-xs text-blue-600 hover:underline whitespace-nowrap"
                    >
                      {inPantry ? "Remove" : "Add to pantry"}
                    </button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Shopping Mode Modal */}
      {shoppingMode && (
        <ShoppingMode
          items={displayRows}
          week={week}
          onClose={() => setShoppingMode(false)}
        />
      )}
    </div>
  );
}
