"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { CalendarDays } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NavTabs } from "@/components/NavTabs";
import { TodayView } from "@/components/views/TodayView";
import CalendarView from "@/components/views/CalendarView";
import GroceriesView from "@/components/views/GroceriesView";
import TrackingView from "@/components/views/TrackingView";
import PrepView from "@/components/views/PrepView";
import ReflectionView from "@/components/views/ReflectionView";
import MetricsView from "@/components/views/MetricsView";
import { fetchRecipesFromCsv, type Recipe } from "@/lib/recipes";

// 🔗 Your live Recipes sheet (already working in your app)
const CSV_RECIPES =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTHgfjP9zXtcbLdDDBjL3eYfF-goQAxryyBYrBy_7RkpboHDG1VRE5_2Mesknl6uR1T0u15d53q2PJK/pub?gid=500862556&single=true&output=csv";

export default function Page() {
  const [tab, setTab] = useState<"today" | "calendar" | "groceries">("today");
  const [startOffset, setStartOffset] = useState<number>(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("tm_startOffset") : null;
    return saved ? Number(saved) : 0;
  });
  const [recipes, setRecipes] = useState<Record<string, Recipe>>({});

  useEffect(() => {
    fetchRecipesFromCsv(CSV_RECIPES).then(setRecipes).catch(console.error);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem("tm_startOffset", String(startOffset));
  }, [startOffset]);

  return (
    <div className="min-h-screen bg-white text-gray-900 p-4 md:p-8 grid gap-6 max-w-6xl mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <CalendarDays className="w-6 h-6" />
          <h1 className="text-2xl md:text-3xl font-bold">Tomlinson Family Meal App</h1>
        </div>
        <div className="flex gap-2 items-center">
          {/* This Select still maps weekday → Day 1 for your older plan flow; keep for now */}
          <Select value={String(startOffset)} onValueChange={(v) => setStartOffset(Number(v))}>
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
          <Input className="max-w-xs" placeholder="(Search coming soon…)" />
        </div>
      </header>

      {/* Tabs */}
      <NavTabs value={tab} onChange={setTab} />

      {/* Content */}
      <main className="grid gap-6">
        {tab === "today" && <TodayView recipes={recipes} />}
        {tab === "calendar" && <CalendarView />}
        {tab === "groceries" && <GroceriesView />}
      </main>

      <footer className="pt-4 text-xs text-gray-500">
        Whole30 • Diabetes &amp; BP friendly • © Tomlinson Family Kitchen
      </footer>
    </div>
  );
}
