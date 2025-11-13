// src/components/health/HealthSummaryBanner.tsx
"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, X, TrendingUp, Activity } from "lucide-react";
import type { HealthSettings, DailyCalorieLog } from "@/lib/types";
import { getOrInitHealthSettings } from "@/lib/health-mock-data";
import { createMockDailyMeals } from "@/lib/health-mock-data";
import { createDailyLog, getDailyStatusMessage } from "@/lib/health";

const DISMISSED_KEY = "tm_health_banner_dismissed";

type HealthSummaryBannerProps = {
  // Optional: pass in actual meal logs if available
  // For Phase 2, we'll use mock data
  dailyLog?: DailyCalorieLog;
};

/**
 * Health Summary Banner for TodayView
 * - Collapsible: Shows summary when collapsed, details when expanded
 * - Mode-aware: Whole30 shows day counter, Post-Whole30 shows calories
 * - Dismissible: User can permanently hide (stores in localStorage)
 */
export function HealthSummaryBanner({ dailyLog: providedLog }: HealthSummaryBannerProps) {
  const [settings, setSettings] = useState<HealthSettings | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const loaded = getOrInitHealthSettings();
    setSettings(loaded);

    // Check if user has dismissed the banner
    const dismissed = localStorage.getItem(DISMISSED_KEY);
    setIsDismissed(dismissed === "true");
  }, []);

  if (!settings || isDismissed) {
    return null;
  }

  // Don't show if Whole30 mode and showCaloriesInPlanner is false
  if (settings.eatingMode === "whole30" && !settings.showCaloriesInPlanner) {
    // Show simpler Whole30 banner instead
    return (
      <Card className="rounded-2xl border-2 border-green-200 bg-green-50">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-2xl">🥑</div>
              <div>
                <div className="font-semibold text-green-900">
                  Whole30 Mode • Day {settings.whole30DayNumber || 1} of 30
                </div>
                <div className="text-sm text-green-700">
                  Focus on food quality, not calorie counting
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                localStorage.setItem(DISMISSED_KEY, "true");
                setIsDismissed(true);
              }}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Post-Whole30 mode: Show calorie tracking
  if (settings.eatingMode !== "post-whole30" || !settings.calorieGoals) {
    return null;
  }

  // Generate mock daily log if not provided
  const dailyLog =
    providedLog ||
    createDailyLog(
      new Date().toISOString().split("T")[0],
      createMockDailyMeals(),
      settings.calorieGoals
    );

  const statusMessage = getDailyStatusMessage(dailyLog);
  const remaining = dailyLog.targets.targetCalories - dailyLog.totals.calories;

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, "true");
    setIsDismissed(true);
  };

  // Collapsed view
  if (!isExpanded) {
    return (
      <Card className="rounded-2xl border-2 border-blue-200 bg-blue-50">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <Activity className="w-5 h-5 text-blue-600" />
              <div className="flex items-center gap-2 flex-wrap text-sm">
                <span className="font-semibold text-blue-900">
                  {dailyLog.totals.calories} / {dailyLog.targets.targetCalories} cal
                </span>
                <span className="text-blue-700">•</span>
                {dailyLog.status === "on-target" && (
                  <span className="text-blue-700">On track 👍</span>
                )}
                {dailyLog.status === "under" && (
                  <span className="text-blue-700">{remaining} cal remaining</span>
                )}
                {dailyLog.status === "over" && (
                  <span className="text-blue-700">{Math.abs(remaining)} cal over</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(true)}
              >
                <ChevronDown className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Expanded view
  return (
    <Card className="rounded-2xl border-2 border-blue-200 bg-blue-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-blue-900 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Today&apos;s Nutrition Summary
          </h3>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(false)}
            >
              <ChevronUp className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          {/* Calorie progress */}
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-blue-800">Calories</span>
              <span className="font-semibold text-blue-900">
                {dailyLog.totals.calories} / {dailyLog.targets.targetCalories}
              </span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{
                  width: `${Math.min(
                    100,
                    (dailyLog.totals.calories / dailyLog.targets.targetCalories) * 100
                  )}%`,
                }}
              />
            </div>
            {remaining !== 0 && (
              <div className="text-xs text-blue-700 mt-1">
                {remaining > 0 ? `${remaining} cal remaining` : `${Math.abs(remaining)} cal over`}
              </div>
            )}
          </div>

          {/* Macros */}
          <div className="grid grid-cols-3 gap-3 pt-2 border-t border-blue-200">
            <div>
              <div className="text-xs text-blue-700">Protein</div>
              <div className="font-semibold text-blue-900">
                {dailyLog.totals.protein}g
              </div>
              <div className="text-xs text-blue-600">
                / {dailyLog.targets.proteinGrams}g
              </div>
            </div>
            <div>
              <div className="text-xs text-blue-700">Fat</div>
              <div className="font-semibold text-blue-900">
                {dailyLog.totals.fat}g
              </div>
              <div className="text-xs text-blue-600">
                / {dailyLog.targets.fatGrams}g
              </div>
            </div>
            <div>
              <div className="text-xs text-blue-700">Carbs</div>
              <div className="font-semibold text-blue-900">
                {dailyLog.totals.carbs}g
              </div>
              <div className="text-xs text-blue-600">
                / {dailyLog.targets.carbGrams}g
              </div>
            </div>
          </div>

          {/* View full dashboard link */}
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-2 bg-white"
            onClick={() => {
              // TODO: Navigate to Health tab
              alert("Navigate to Health tab - wire up in integration phase");
            }}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            View Full Health Dashboard →
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
