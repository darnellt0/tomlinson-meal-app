"use client";

import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X, ChefHat, HeartPulse } from "lucide-react";
import type { CalendarRow } from "@/lib/types";
import type { Recipe } from "@/lib/recipes";
import { loadCalendar } from "@/lib/loaders";

// 👉 Replace with your published CSV for SHEET 1 (Meal Calendar)
const CSV_MEAL_CALENDAR = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTHgfjP9zXtcbLdDDBjL3eYfF-goQAxryyBYrBy_7RkpboHDG1VRE5_2Mesknl6uR1T0u15d53q2PJK/pubhtml?gid=0&single=true";

// Map JS weekday to sheet Day codes
const dayCode = (d: Date) => ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][(d.getDay()+6)%7];

export function TodayView({ recipes }: { recipes: Record<string, Recipe> }) {
  const [rows, setRows] = useState<CalendarRow[]>([]);
  const [open, setOpen] = useState(false);
  const [recipeKey, setRecipeKey] = useState<string | null>(null);

  useEffect(() => {
    loadCalendar(CSV_MEAL_CALENDAR).then(setRows).catch(console.error);
  }, []);

  const todayRow = useMemo(() => {
    const code = dayCode(new Date());
    // Prefer exact Day match; if you fill Date column you can match that too
    return rows.find(r => (r.Day || "").toLowerCase().startsWith(code.toLowerCase())) || null;
  }, [rows]);

  // Helper: detect if a meal cell contains an explicit recipe id "id: something"
  const parseMeal = (cell: string) => {
    // convention examples:
    //  "No-Bean Chili (id: no_bean_chili)"
    //  "no_bean_chili" (just id)
    const idMatch = cell.match(/\bid:\s*([a-z0-9_]+)/i);
    const directId = cell.trim().match(/^[a-z0-9_]+$/i);
    const recipeId = idMatch?.[1] || directId?.[0] || null;
    return { label: cell, recipeId };
  };

  const meals = useMemo(() => {
    if (!todayRow) return null;
    return {
      Breakfast: parseMeal(todayRow.Breakfast || ""),
      Lunch: parseMeal(todayRow.Lunch || ""),
      Dinner: parseMeal(todayRow.Dinner || ""),
      Focus: todayRow["Cuisine Focus"] || "",
      Notes: todayRow["Batch Notes"] || "",
    };
  }, [todayRow]);

  const rec = recipeKey ? recipes[recipeKey] : null;

  if (!meals) {
    return <div className="text-sm text-gray-600">Loading today…</div>;
  }

  const MealCard = ({ type, entry }: { type: "Breakfast"|"Lunch"|"Dinner"; entry: { label: string; recipeId: string | null } }) => {
    const r = entry.recipeId ? recipes[entry.recipeId] : undefined;
    return (
      <Card className="rounded-2xl shadow-sm border p-2">
        <CardContent className="p-4 grid gap-2">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{type}</h3>
            <Badge variant="secondary">{meals.Focus}</Badge>
          </div>
          <p className="text-base leading-snug">{entry.label}</p>
          <div className="flex gap-2 pt-1">
            {r ? (
              <Button size="sm" onClick={() => { setRecipeKey(entry.recipeId); setOpen(true); }}>
                <ChefHat className="w-4 h-4 mr-2" /> View Recipe
              </Button>
            ) : (
              <Button size="sm" variant="outline" onClick={() => setOpen(true)}>Notes</Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <>
      <div className="grid gap-3 md:grid-cols-3">
        <MealCard type="Breakfast" entry={{ label: meals.Breakfast.label, recipeId: meals.Breakfast.recipeId }} />
        <MealCard type="Lunch" entry={{ label: meals.Lunch.label, recipeId: meals.Lunch.recipeId }} />
        <MealCard type="Dinner" entry={{ label: meals.Dinner.label, recipeId: meals.Dinner.recipeId }} />
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl overflow-y-auto max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {rec ? rec.title : "Meal Notes"}
            </DialogTitle>
          </DialogHeader>
          {rec ? (
            <div className="grid gap-4">
              <div className="flex gap-2 flex-wrap">
                <Badge>Serves {rec.serves}</Badge>
                <Badge variant="secondary">
                  <HeartPulse className="w-3.5 h-3.5 mr-1" />
                  Diabetes &amp; BP Friendly
                </Badge>
              </div>
              <section>
                <h4 className="font-semibold mb-2">Ingredients</h4>
                <ul className="list-disc ml-5 space-y-1">
                  {rec.ingredients.map((it, i) => <li key={i}>{it}</li>)}
                </ul>
              </section>
              <section>
                <h4 className="font-semibold mb-2">Steps</h4>
                <ol className="list-decimal ml-5 space-y-1">
                  {rec.steps.map((it, i) => <li key={i}>{it}</li>)}
                </ol>
              </section>
              <section>
                <h4 className="font-semibold mb-2">Health Notes</h4>
                <ul className="list-disc ml-5 space-y-1">
                  {rec.health.map((it, i) => <li key={i}>{it}</li>)}
                </ul>
              </section>
            </div>
          ) : (
            <div className="text-sm text-gray-600">
              {meals.Notes || "No extra notes for today yet."}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              <X className="w-4 h-4 mr-2" /> Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
