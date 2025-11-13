// src/components/PortionAdjuster.tsx
"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { X, Check } from "lucide-react";
import { adjustPortionNutrition } from "@/lib/weight-goals";
import type { Recipe } from "@/lib/recipes";

interface PortionAdjusterProps {
  recipe: Recipe;
  remainingCalories?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: (portion: number, adjustedRecipe: Recipe) => void;
}

export function PortionAdjuster({
  recipe,
  remainingCalories,
  open,
  onOpenChange,
  onApply
}: PortionAdjusterProps) {
  const [portion, setPortion] = useState(1.0);

  // Reset portion when recipe changes
  useEffect(() => {
    if (open) {
      setPortion(1.0);
    }
  }, [recipe.id, open]);

  if (!recipe.calories) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nutrition Data Not Available</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            This recipe does not have nutritional information. Cannot adjust portion sizes.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  const baseCalories = recipe.calories;
  const baseProtein = recipe.protein || 0;
  const baseCarbs = recipe.carbs || 0;
  const baseFats = recipe.fats || 0;

  // Adjusted nutrition
  const adjustedCalories = Math.round(baseCalories * portion);
  const adjustedProtein = Math.round(baseProtein * portion);
  const adjustedCarbs = Math.round(baseCarbs * portion);
  const adjustedFats = Math.round(baseFats * portion);

  // Check if it fits goal
  const fitsGoal = remainingCalories ? adjustedCalories <= remainingCalories : true;

  // Handle slider change (value is array from Slider component)
  const handleSliderChange = (value: number[]) => {
    setPortion(value[0] / 100); // Convert from 0-200 to 0-2.0
  };

  // Handle apply
  const handleApply = () => {
    const adjustedRecipe: Recipe = {
      ...recipe,
      calories: adjustedCalories,
      protein: adjustedProtein,
      carbs: adjustedCarbs,
      fats: adjustedFats,
      fiber: recipe.fiber ? Math.round(recipe.fiber * portion) : undefined,
      sugar: recipe.sugar ? Math.round(recipe.sugar * portion) : undefined,
      sodium: recipe.sodium ? Math.round(recipe.sodium * portion) : undefined
    };

    onApply(portion, adjustedRecipe);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Adjust Portion Size</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          {/* Recipe Info */}
          <div>
            <div className="font-semibold">{recipe.title}</div>
            <div className="text-sm text-gray-600">Base Serving: 1 serving</div>
          </div>

          {/* Portion Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Portion Size:</span>
              <Badge variant="outline" className="text-lg font-bold">
                {(portion * 100).toFixed(0)}%
              </Badge>
            </div>

            <Slider
              value={[portion * 100]}
              onValueChange={handleSliderChange}
              min={50}
              max={200}
              step={5}
              className="w-full"
            />

            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>50%</span>
              <span>100%</span>
              <span>200%</span>
            </div>
          </div>

          {/* Adjusted Nutrition */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="text-sm font-semibold mb-2">
              Nutritional Info at {(portion * 100).toFixed(0)}%:
            </div>

            <div className="grid gap-2">
              <div className="flex justify-between">
                <span className="text-sm">🔥 Calories:</span>
                <span className="font-semibold">
                  {adjustedCalories} <span className="text-xs text-gray-500">(was {baseCalories})</span>
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">💪 Protein:</span>
                <span className="font-semibold">
                  {adjustedProtein}g <span className="text-xs text-gray-500">(was {baseProtein}g)</span>
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">🍞 Carbs:</span>
                <span className="font-semibold">
                  {adjustedCarbs}g <span className="text-xs text-gray-500">(was {baseCarbs}g)</span>
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">🥑 Fats:</span>
                <span className="font-semibold">
                  {adjustedFats}g <span className="text-xs text-gray-500">(was {baseFats}g)</span>
                </span>
              </div>
            </div>
          </div>

          {/* Goal Fit Indicator */}
          {remainingCalories !== undefined && (
            <div className={`border rounded-lg p-3 ${fitsGoal ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
              {fitsGoal ? (
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <div className="font-semibold text-green-800">Fits Your Daily Goal:</div>
                    <div className="text-green-700">
                      {remainingCalories} remaining - {adjustedCalories} = {remainingCalories - adjustedCalories} cal left
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-sm">
                  <div className="font-semibold text-yellow-800">Exceeds Remaining Calories:</div>
                  <div className="text-yellow-700">
                    {adjustedCalories} cal ({(adjustedCalories - remainingCalories)} over limit)
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Ingredient Scaling Note */}
          <div className="text-xs text-gray-600 bg-blue-50 border border-blue-200 rounded p-2">
            <strong>Note:</strong> All ingredients should be scaled by {(portion * 100).toFixed(0)}% for this portion size.
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleApply}>
            <Check className="w-4 h-4 mr-2" />
            Apply & Log Meal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
