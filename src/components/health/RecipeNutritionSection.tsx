// src/components/health/RecipeNutritionSection.tsx
"use client";

import * as React from "react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { NutritionInfo } from "@/lib/types";

type RecipeNutritionSectionProps = {
  nutrition?: NutritionInfo;
  servings?: number;
  defaultExpanded?: boolean;
};

/**
 * Expandable nutrition section for recipe modals
 * - Only renders if nutrition data is available
 * - Collapsed by default (progressive disclosure)
 * - Expanded by default in Post-Whole30 mode (can be passed as prop)
 * - Shows per-serving nutrition breakdown
 * - Whole30 compliance badge
 */
export function RecipeNutritionSection({
  nutrition,
  servings,
  defaultExpanded = false,
}: RecipeNutritionSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  // Don't render if no nutrition data
  if (!nutrition) {
    return null;
  }

  return (
    <section className="mt-4 pt-4 border-t">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left hover:opacity-80 transition-opacity"
      >
        <h4 className="font-semibold flex items-center gap-2">
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
          Nutrition Info
          {nutrition.whole30Compliant && (
            <Badge variant="secondary" className="ml-2">
              Whole30 ✓
            </Badge>
          )}
        </h4>
        <span className="text-sm text-gray-600">
          {isExpanded ? "Hide" : "Show"}
        </span>
      </button>

      {isExpanded && (
        <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-4">
          {servings && (
            <div className="text-sm text-blue-700 mb-3">
              Per Serving {servings > 1 && `(makes ${servings})`}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {/* Calories */}
            <div className="bg-white p-3 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {nutrition.calories}
              </div>
              <div className="text-sm text-gray-600">Calories</div>
            </div>

            {/* Protein */}
            <div className="bg-white p-3 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {nutrition.protein}g
              </div>
              <div className="text-sm text-gray-600">Protein</div>
            </div>

            {/* Fat */}
            <div className="bg-white p-2 rounded-lg">
              <div className="text-lg font-semibold text-gray-900">
                {nutrition.fat}g
              </div>
              <div className="text-xs text-gray-600">Fat</div>
            </div>

            {/* Carbs */}
            <div className="bg-white p-2 rounded-lg">
              <div className="text-lg font-semibold text-gray-900">
                {nutrition.carbs}g
              </div>
              <div className="text-xs text-gray-600">Carbs</div>
            </div>

            {/* Fiber (if available) */}
            {nutrition.fiber !== undefined && (
              <div className="bg-white p-2 rounded-lg">
                <div className="text-lg font-semibold text-gray-900">
                  {nutrition.fiber}g
                </div>
                <div className="text-xs text-gray-600">Fiber</div>
              </div>
            )}

            {/* Sugar (if available) */}
            {nutrition.sugar !== undefined && (
              <div className="bg-white p-2 rounded-lg">
                <div className="text-lg font-semibold text-gray-900">
                  {nutrition.sugar}g
                </div>
                <div className="text-xs text-gray-600">Sugar</div>
              </div>
            )}

            {/* Sodium (if available) */}
            {nutrition.sodium !== undefined && (
              <div className="bg-white p-2 rounded-lg">
                <div className="text-lg font-semibold text-gray-900">
                  {nutrition.sodium}mg
                </div>
                <div className="text-xs text-gray-600">Sodium</div>
              </div>
            )}
          </div>

          {/* Whole30 compliance note */}
          {nutrition.whole30Compliant && (
            <div className="mt-3 pt-3 border-t border-blue-200 text-sm text-blue-800">
              ✓ This recipe is <strong>Whole30 compliant</strong> - made with approved ingredients
            </div>
          )}

          {/* Disclaimer */}
          <div className="mt-3 text-xs text-gray-500 text-center">
            Nutrition values are estimates based on ingredients.
          </div>
        </div>
      )}
    </section>
  );
}
