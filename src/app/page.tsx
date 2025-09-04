"use client";

import React, { useMemo, useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, CalendarDays, ChefHat, HeartPulse, Apple } from "lucide-react";

/**
 * Tomlinson Meal App – Whole30 Cultural Plan
 * - Tablet-friendly, offline-capable (static)
 * - Today’s menu + week at a glance
 * - Tap a meal to view recipe & health notes
 */

// ---- 7-Day Cultural Plan (repeat weekly) ----
const PLAN = [
  {
    day: "Day 1",
    focus: "American + Soul",
    meals: {
      Breakfast:
        "Sweet Potato & Turkey Hash (½ cup sweet potato, collards, onion) + Fried Egg",
      Lunch:
        "Grilled Chicken Salad (¼ avocado, mustard vinaigrette, cucumber, tomato)",
      Dinner:
        "Whole30 No-Bean Chili (ground turkey, zucchini, peppers) + Roasted Broccoli",
    },
  },
  {
    day: "Day 2",
    focus: "Indian + Soul",
    meals: {
      Breakfast:
        "Masala Veggie Omelet (spinach, tomato, onion, turmeric) + Collards",
      Lunch: "Tandoori Chicken Collard Wraps + Coconut Yogurt Mint Dip",
      Dinner:
        "Cauliflower-Carrot Curry (small carrot portion) + Garlic Roasted Okra",
    },
  },
  {
    day: "Day 3",
    focus: "Mexican",
    meals: {
      Breakfast:
        "NutriBullet Smoothie (Spinach, berries, ¼ avocado, almond milk)",
      Lunch: "Chicken Fajita Bowl (cauli rice, peppers, ½ avocado, lime)",
      Dinner: "Carne Asada (lean cut) + Grilled Cabbage Steaks + Chimichurri",
    },
  },
  {
    day: "Day 4",
    focus: "Italian",
    meals: {
      Breakfast: "Tomato-Basil Egg Cups + Sautéed Spinach",
      Lunch: "Zoodle Pesto Bowl with Grilled Chicken (walnut pesto)",
      Dinner: "Whole30 Zuppa Toscana (turkey sausage, kale, cauliflower)",
    },
  },
  {
    day: "Day 5",
    focus: "Soul + Mexican",
    meals: {
      Breakfast: "Egg Muffins with Turkey Sausage, Spinach, Jalapeño",
      Lunch: "Shrimp Ceviche Salad (lime, cucumber, tomato, avocado slice)",
      Dinner:
        "Turkey Meatballs in Smoky Chipotle Tomato Sauce + Zoodles",
    },
  },
  {
    day: "Day 6",
    focus: "Indian + Chinese",
    meals: {
      Breakfast: "Cauliflower-Turkey Hash + Ginger Spinach",
      Lunch:
        "Crispy Tuna Cakes + Asian Cabbage Slaw (lime, coconut aminos)",
      Dinner:
        "Chicken Korma Stew (coconut milk, ginger, turmeric) + Roasted Carrots + Zoodles",
    },
  },
  {
    day: "Day 7",
    focus: "Greek + Chinese",
    meals: {
      Breakfast:
        "NutriBullet Smoothie (Cucumber, avocado, lemon, mint)",
      Lunch:
        "Greek Chicken Salad (tomato, cucumber, red onion, olives, arugula)",
      Dinner:
        "Ginger-Garlic Stir-Fry (lean beef or chicken, broccoli, bok choy) + Cauli Rice",
    },
  },
] as const;

// ---- Minimal recipe DB (keys matched by substring in meal text) ----
const RECIPES = {
  "No-Bean Chili": {
    title: "Whole30 No-Bean Chili",
    serves: 4,
    ingredients: [
      "1 lb ground turkey or beef (90% lean)",
      "1 onion, diced",
      "2 bell peppers, diced",
      "2 zucchini, diced",
      "2 cloves garlic, minced",
      "1 can (14 oz) diced tomatoes (no sugar)",
      "1 cup bone broth",
      "Spices: chili powder, cumin, smoked paprika, black pepper",
    ],
    steps: [
      "Brown meat; drain if needed.",
      "Sauté onion, peppers, and garlic 3–4 min.",
      "Add zucchini, tomatoes, broth, and spices; simmer 20–30 min.",
    ],
    health: [
      "High protein + veggies; no beans keeps carbs lower.",
      "Diabetes: pair with roasted broccoli.",
      "BP: flavor from spices, not salt.",
    ],
  },
  Zuppa: {
    title: "Whole30 Zuppa Toscana",
    serves: 4,
    ingredients: [
      "½ lb compliant turkey sausage",
      "1 onion, diced",
      "2 cloves garlic, minced",
      "3 cups cauliflower florets",
      "2 cups kale, chopped",
      "2 cups bone broth",
      "1 cup coconut milk",
      "1 tbsp olive oil",
    ],
    steps: [
      "Brown sausage; add onion + garlic to soften.",
      "Add cauliflower + broth; simmer until tender.",
      "Stir in kale + coconut milk; heat through.",
    ],
    health: ["Lower carb; potassium-rich kale.", "Good satiety from protein + fats."],
  },
  "Masala Veggie Omelet": {
    title: "Masala Veggie Omelet",
    serves: 1,
    ingredients: [
      "2 eggs",
      "½ cup spinach",
      "¼ cup tomato, diced",
      "2 tbsp onion, diced",
      "¼ tsp turmeric, pinch cumin",
      "1 tsp olive oil",
    ],
    steps: [
      "Sauté onion + tomato; wilt spinach.",
      "Add whisked eggs with spices; cook to set.",
    ],
    health: ["Low carb, high protein; anti-inflammatory spices."],
  },
  "Fajita Bowl": {
    title: "Chicken Fajita Bowl",
    serves: 2,
    ingredients: [
      "2 small chicken breasts, sliced",
      "1 bell pepper + ½ onion, sliced",
      "2 cups cauliflower rice",
      "½ avocado",
      "Lime, cumin, garlic powder, black pepper",
    ],
    steps: [
      "Sauté chicken with spices; add peppers/onion.",
      "Serve over cauliflower rice; finish with lime + avocado.",
    ],
    health: ["Fiber + protein balance; avocado for steady energy."],
  },
} as const;

type RecipeKey = keyof typeof RECIPES;

const weekdayToDayIndex = (startOffset = 0) => {
  const d = new Date();
  const idx = (d.getDay() + 6) % 7; // Monday=0
  return (idx + startOffset) % 7;
};

export default function Page() {
  const [startOffset, setStartOffset] = useState<number>(() => {
    const saved =
      typeof window !== "undefined"
        ? localStorage.getItem("tm_startOffset")
        : null;
    return saved ? Number(saved) : 0;
  });
  const [activeDay, setActiveDay] = useState<number>(
    weekdayToDayIndex(startOffset)
  );
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [recipeKey, setRecipeKey] = useState<RecipeKey | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("tm_startOffset", String(startOffset));
    }
  }, [startOffset]);

  useEffect(() => {
    setActiveDay(weekdayToDayIndex(startOffset));
  }, [startOffset]);

  const today = PLAN[activeDay];

  const mealCards = useMemo(() => {
    return Object.entries(today.meals).map(([type, text]) => {
      // strong-typed match against known recipe keys
      const matchKey =
        (Object.keys(RECIPES) as RecipeKey[]).find((k) =>
          text.toLowerCase().includes(k.toLowerCase())
        ) || null;

      return (
        <Card key={type} className="rounded-2xl shadow-sm border p-2">
          <CardContent className="p-4 grid gap-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{type}</h3>
              <Badge variant="secondary">{today.focus}</Badge>
            </div>
            <p className="text-base leading-snug">{text}</p>
            <div className="flex gap-2 pt-1">
              {matchKey ? (
                <Button
                  size="sm"
                  onClick={() => {
                    setRecipeKey(matchKey);
                    setOpen(true);
                  }}
                >
                  <ChefHat className="w-4 h-4 mr-2" /> View Recipe
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setRecipeKey(null);
                    setOpen(true);
                  }}
                >
                  <Apple className="w-4 h-4 mr-2" /> Notes
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      );
    });
  }, [today]);

  const filteredDays = useMemo(() => {
    if (!search) return PLAN;
    const q = search.toLowerCase();
    return PLAN.filter(
      (d) =>
        d.day.toLowerCase().includes(q) ||
        d.focus.toLowerCase().includes(q) ||
        Object.values(d.meals).some((m) => m.toLowerCase().includes(q))
    );
  }, [search]);

  const rec = recipeKey ? RECIPES[recipeKey] : null;

  return (
    <div className="min-h-screen bg-white text-gray-900 p-4 md:p-8 grid gap-6 max-w-5xl mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <CalendarDays className="w-6 h-6" />
          <h1 className="text-2xl md:text-3xl font-bold">Today&apos;s Menu</h1>
        </div>
        <div className="flex gap-2 items-center">
          <Select
            value={String(startOffset)}
            onValueChange={(v) => setStartOffset(Number(v))}
          >
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Map weekday → Day 1" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Map Monday → Day 1</SelectItem>
              <SelectItem value="1">Map Tuesday → Day 1</SelectItem>
              <SelectItem value="2">Map Wednesday → Day 1</SelectItem>
              <SelectItem value="3">Map Thursday → Day 1</SelectItem>
              <SelectItem value="4">Map Friday → Day 1</SelectItem>
              <SelectItem value="5">Map Saturday → Day 1</SelectItem>
              <SelectItem value="6">Map Sunday → Day 1</SelectItem>
            </SelectContent>
          </Select>
          <Input
            className="max-w-xs"
            placeholder="Search meals, cuisines, ingredients…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </header>

      {/* Today cards */}
      <div className="grid gap-3 md:grid-cols-3">{mealCards}</div>

      {/* Week at a glance */}
      <section className="grid gap-3">
        <h2 className="text-xl font-semibold">Week at a Glance</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredDays.map((d, idx) => (
            <Card
              key={d.day}
              className={`rounded-2xl border ${
                idx === activeDay ? "ring-2 ring-black" : ""
              }`}
            >
              <CardContent className="p-4 grid gap-1">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500">{d.focus}</div>
                    <div className="text-lg font-semibold">{d.day}</div>
                  </div>
                  <Button
                    size="sm"
                    variant={idx === activeDay ? "default" : "outline"}
                    onClick={() => setActiveDay(idx)}
                  >
                    View
                  </Button>
                </div>
                <div className="text-sm mt-2 space-y-1">
                  <div>
                    <span className="font-semibold">B:</span>{" "}
                    {d.meals.Breakfast}
                  </div>
                  <div>
                    <span className="font-semibold">L:</span> {d.meals.Lunch}
                  </div>
                  <div>
                    <span className="font-semibold">D:</span> {d.meals.Dinner}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Recipe dialog */}
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
                  {rec.ingredients.map((it: string, i: number) => (
                    <li key={i}>{it}</li>
                  ))}
                </ul>
              </section>
              <section>
                <h4 className="font-semibold mb-2">Steps</h4>
                <ol className="list-decimal ml-5 space-y-1">
                  {rec.steps.map((it: string, i: number) => (
                    <li key={i}>{it}</li>
                  ))}
                </ol>
              </section>
              <section>
                <h4 className="font-semibold mb-2">Health Notes</h4>
                <ul className="list-disc ml-5 space-y-1">
                  {rec.health.map((it: string, i: number) => (
                    <li key={i}>{it}</li>
                  ))}
                </ul>
              </section>
            </div>
          ) : (
            <div className="text-sm text-gray-600">
              This meal currently uses a quick description. Tap a different meal
              to see a full recipe.
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              <X className="w-4 h-4 mr-2" /> Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="pt-4 text-xs text-gray-500">
        Whole30 • Diabetes &amp; BP friendly • © Tomlinson Family Kitchen
      </footer>
    </div>
  );
}
