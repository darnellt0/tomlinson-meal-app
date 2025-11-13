// src/components/CalorieTracker.tsx
"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, TrendingUp, TrendingDown } from "lucide-react";
import { useWeightGoals } from "@/contexts/WeightGoalsContext";
import { useHealthSettings } from "@/contexts/HealthSettingsContext";

export function CalorieTracker() {
  const { weightGoals, getTodayLog, showCalorieTracking, setShowCalorieTracking, detailedView, setDetailedView } = useWeightGoals();
  const { settings } = useHealthSettings();

  // Don't show if weight goals not set up
  if (!weightGoals) {
    return null;
  }

  // Get today's log
  const todayLog = getTodayLog();
  if (!todayLog) return null;

  const {
    targetCalories,
    consumedCalories,
    caloriesRemaining,
    percentOfTarget,
    totalProtein,
    totalCarbs,
    totalFats
  } = todayLog;

  // Progress bar color
  let barColor = "bg-blue-600";
  if (percentOfTarget > 100) {
    barColor = "bg-red-600";
  } else if (percentOfTarget > 90) {
    barColor = "bg-yellow-600";
  } else if (percentOfTarget > 70) {
    barColor = "bg-green-600";
  }

  // Only show if user has enabled calorie tracking
  // OR if they're in Post-Whole30 mode (where it's more appropriate)
  const shouldShow = showCalorieTracking || settings.mode === 'postWhole30';

  if (!shouldShow) {
    return (
      <Card className="rounded-xl border-dashed border-2 border-gray-300">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              💡 <strong>Tip:</strong> Enable calorie tracking in Health Settings → Weight Goals to monitor your daily intake.
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowCalorieTracking(true)}
            >
              <Eye className="w-4 h-4 mr-2" />
              Enable
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-xl border-2 border-blue-200">
      <CardContent className="p-4">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-lg font-semibold">Daily Calorie Tracker</h3>
            <div className="text-xs text-gray-600">
              {weightGoals.goalType === 'lose' && "Goal: Weight Loss"}
              {weightGoals.goalType === 'maintain' && "Goal: Maintain Weight"}
              {weightGoals.goalType === 'gain' && "Goal: Weight Gain"}
            </div>
          </div>

          <div className="flex gap-2">
            {/* Simple/Detailed Toggle */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => setDetailedView(!detailedView)}
            >
              {detailedView ? "Simple" : "Detailed"}
            </Button>

            {/* Hide Button */}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowCalorieTracking(false)}
            >
              <EyeOff className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* SIMPLE VIEW */}
        {!detailedView && (
          <div className="grid gap-3">
            {/* Calorie Progress */}
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">
                🔥 {consumedCalories.toLocaleString()} / {targetCalories.toLocaleString()} cal
              </span>
              <Badge variant={caloriesRemaining < 0 ? "destructive" : "secondary"}>
                {caloriesRemaining >= 0 ? `${caloriesRemaining} remaining` : `${Math.abs(caloriesRemaining)} over`}
              </Badge>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full ${barColor} transition-all duration-300 rounded-full`}
                style={{ width: `${Math.min(percentOfTarget, 100)}%` }}
              />
            </div>

            <div className="text-xs text-gray-600 text-right">{percentOfTarget}% of target</div>
          </div>
        )}

        {/* DETAILED VIEW */}
        {detailedView && (
          <div className="grid gap-4">
            {/* Calorie Progress */}
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="font-medium">Target:</span>
                <span className="font-bold text-lg">{targetCalories.toLocaleString()} cal</span>
              </div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="font-medium">Logged:</span>
                <span className="font-bold text-lg">{consumedCalories.toLocaleString()} cal</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Remaining:</span>
                <Badge variant={caloriesRemaining < 0 ? "destructive" : "default"} className="text-base">
                  {caloriesRemaining >= 0 ? (
                    <span>{caloriesRemaining} cal</span>
                  ) : (
                    <span>{Math.abs(caloriesRemaining)} cal over</span>
                  )}
                </Badge>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden mt-2">
                <div
                  className={`h-full ${barColor} transition-all duration-300`}
                  style={{ width: `${Math.min(percentOfTarget, 100)}%` }}
                />
              </div>
              <div className="text-xs text-gray-600 text-right mt-1">{percentOfTarget}% of target</div>
            </div>

            {/* Macros */}
            <div className="border-t pt-3">
              <div className="text-sm font-semibold mb-2">Macronutrients</div>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-blue-50 rounded-lg p-2 text-center">
                  <div className="text-xs text-gray-600">Protein</div>
                  <div className="font-bold">{totalProtein}g</div>
                  <div className="text-xs text-gray-500">/ {weightGoals.macroGrams.protein}g</div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-2 text-center">
                  <div className="text-xs text-gray-600">Carbs</div>
                  <div className="font-bold">{totalCarbs}g</div>
                  <div className="text-xs text-gray-500">/ {weightGoals.macroGrams.carbs}g</div>
                </div>
                <div className="bg-green-50 rounded-lg p-2 text-center">
                  <div className="text-xs text-gray-600">Fats</div>
                  <div className="font-bold">{totalFats}g</div>
                  <div className="text-xs text-gray-500">/ {weightGoals.macroGrams.fats}g</div>
                </div>
              </div>
            </div>

            {/* Goal Indicator */}
            <div className="border-t pt-3">
              <div className="flex items-center gap-2 text-sm">
                {weightGoals.goalType === 'lose' && (
                  <>
                    <TrendingDown className="w-4 h-4 text-red-600" />
                    <span>Daily deficit: <strong>{Math.abs(weightGoals.dailyDeficitSurplus)} cal</strong></span>
                  </>
                )}
                {weightGoals.goalType === 'gain' && (
                  <>
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span>Daily surplus: <strong>+{weightGoals.dailyDeficitSurplus} cal</strong></span>
                  </>
                )}
                {weightGoals.goalType === 'maintain' && (
                  <span>Maintenance: <strong>{targetCalories} cal/day</strong></span>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
