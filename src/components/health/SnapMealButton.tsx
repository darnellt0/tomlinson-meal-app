// src/components/health/SnapMealButton.tsx
"use client";

import * as React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import { SnapMealFlow } from "./SnapMealFlow";
import type { PhotoNutritionResponse } from "@/lib/nutrition";
import type { MealLog } from "@/lib/types";

/**
 * Floating button to trigger Snap & Log photo flow
 * Integrates cleanly into TodayView without disrupting meal planning
 */
export function SnapMealButton() {
  const [open, setOpen] = useState(false);

  const handleComplete = (result: PhotoNutritionResponse) => {
    // Create a meal log from the photo analysis
    const mealLog: MealLog = {
      id: `photo_${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      mealType: "snack", // Could be detected or user-selected
      source: "photo-ai",
      detectedItems: result.detectedItems,
      nutrition: result.totalNutrition,
      timestamp: new Date().toISOString(),
    };

    // TODO Phase 2: Save to actual meal log storage
    console.log("Meal logged:", mealLog);

    // For now, just show success (already handled in SnapMealFlow)
    // In Phase 2, this would:
    // - Save to localStorage or database
    // - Update daily totals
    // - Sync with Health tab
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        size="lg"
        className="fixed bottom-6 right-6 rounded-full shadow-lg hover:shadow-xl transition-shadow z-50"
      >
        <Camera className="w-5 h-5 mr-2" />
        Snap a Meal
      </Button>

      <SnapMealFlow
        open={open}
        onClose={() => setOpen(false)}
        onComplete={handleComplete}
      />
    </>
  );
}
