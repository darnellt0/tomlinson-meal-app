// src/components/views/HealthView.tsx
"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Heart,
  Activity,
  TrendingDown,
  Settings,
  Smartphone,
  Scale,
  Target
} from "lucide-react";
import type { HealthSettings, WeightLog } from "@/lib/types";
import {
  getOrInitHealthSettings,
  saveHealthSettings,
  switchToPostWhole30,
  DEFAULT_PROFILES
} from "@/lib/health-mock-data";
import { calculateBMR, calculateTDEE, projectTargetDate } from "@/lib/health";

/**
 * Health Tab - Central hub for health tracking
 * Shows eating mode, calorie goals, weight tracking, device connections
 */
export default function HealthView() {
  const [settings, setSettings] = useState<HealthSettings | null>(null);
  const [showGoalsEdit, setShowGoalsEdit] = useState(false);

  useEffect(() => {
    const loaded = getOrInitHealthSettings();
    setSettings(loaded);
  }, []);

  if (!settings) {
    return <div className="text-sm text-gray-600">Loading health settings...</div>;
  }

  const currentProfile = settings.profiles[settings.currentProfile];
  const bmr = calculateBMR(currentProfile);
  const tdee = calculateTDEE(currentProfile, bmr);

  const handleModeToggle = () => {
    if (settings.eatingMode === "whole30") {
      // Switch to Post-Whole30 mode
      const updated = switchToPostWhole30(settings, settings.currentProfile);
      setSettings(updated);
      saveHealthSettings(updated);
    } else {
      // Switch back to Whole30 mode
      const updated: HealthSettings = {
        ...settings,
        eatingMode: "whole30",
        showCaloriesInPlanner: false,
        whole30StartDate: new Date().toISOString().split("T")[0],
        whole30DayNumber: 1,
      };
      setSettings(updated);
      saveHealthSettings(updated);
    }
  };

  const handleProfileSwitch = (profile: "mom" | "shria" | "darnell") => {
    const updated: HealthSettings = {
      ...settings,
      currentProfile: profile,
    };
    setSettings(updated);
    saveHealthSettings(updated);
  };

  return (
    <div className="grid gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Health &amp; Wellness</h2>
          <p className="text-sm text-gray-600 mt-1">
            Tracking for {currentProfile.name}
          </p>
        </div>
        <Badge variant={settings.eatingMode === "whole30" ? "default" : "secondary"} className="text-sm">
          {settings.eatingMode === "whole30" ? "🥑 Whole30" : "🎯 Post-Whole30"}
        </Badge>
      </div>

      {/* Profile Selector */}
      <Card className="rounded-2xl border">
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Heart className="w-4 h-4" />
            Active Profile
          </h3>
          <div className="flex gap-2 flex-wrap">
            {(["mom", "shria", "darnell"] as const).map((profile) => (
              <Button
                key={profile}
                variant={settings.currentProfile === profile ? "default" : "outline"}
                onClick={() => handleProfileSwitch(profile)}
                className="capitalize"
              >
                {settings.profiles[profile].name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Eating Mode Toggle */}
      <Card className="rounded-2xl border">
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Eating Mode
          </h3>
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              {settings.eatingMode === "whole30" ? (
                <div>
                  <div className="font-medium">Whole30 Mode</div>
                  <div className="text-sm text-gray-600 mt-1">
                    Day {settings.whole30DayNumber || 1} of 30 • Focus on food quality
                  </div>
                </div>
              ) : (
                <div>
                  <div className="font-medium">Post-Whole30 Mode</div>
                  <div className="text-sm text-gray-600 mt-1">
                    Sustainable nutrition tracking enabled
                  </div>
                </div>
              )}
            </div>
            <Button onClick={handleModeToggle} variant="outline">
              Switch to {settings.eatingMode === "whole30" ? "Post-Whole30" : "Whole30"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Calorie & Macro Goals */}
      {settings.eatingMode === "post-whole30" && settings.calorieGoals && (
        <Card className="rounded-2xl border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Target className="w-4 h-4" />
                Daily Calorie &amp; Macro Goals
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowGoalsEdit(!showGoalsEdit)}
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-3">
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="text-2xl font-bold text-blue-900">
                  {settings.calorieGoals.targetCalories}
                </div>
                <div className="text-sm text-blue-700">calories/day</div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="text-2xl font-bold text-green-900">
                  {settings.calorieGoals.approach === "deficit" ? "Deficit" :
                   settings.calorieGoals.approach === "surplus" ? "Surplus" : "Maintain"}
                </div>
                <div className="text-sm text-green-700">approach</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-sm">
              <div>
                <div className="font-semibold">{settings.calorieGoals.proteinGrams}g</div>
                <div className="text-gray-600">Protein</div>
              </div>
              <div>
                <div className="font-semibold">{settings.calorieGoals.fatGrams}g</div>
                <div className="text-gray-600">Fat</div>
              </div>
              <div>
                <div className="font-semibold">{settings.calorieGoals.carbGrams}g</div>
                <div className="text-gray-600">Carbs</div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t text-xs text-gray-600">
              <div>BMR: {settings.calorieGoals.bmr} kcal • TDEE: {settings.calorieGoals.tdee} kcal</div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Whole30 Mode Message */}
      {settings.eatingMode === "whole30" && (
        <Card className="rounded-2xl border bg-green-50 border-green-200">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2 text-green-900">Whole30 Focus</h3>
            <p className="text-sm text-green-800">
              During Whole30, we focus on food quality over calorie counting.
              Switch to Post-Whole30 mode to enable detailed nutrition tracking.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Weight Tracking */}
      {settings.weightGoals && (
        <Card className="rounded-2xl border">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Scale className="w-4 h-4" />
              Weight Tracking
            </h3>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <div>
                <div className="text-sm text-gray-600">Start</div>
                <div className="font-semibold">{Math.round(settings.weightGoals.startWeightKg * 2.20462)} lbs</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Current</div>
                <div className="font-semibold">{Math.round(settings.weightGoals.currentWeightKg * 2.20462)} lbs</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Goal</div>
                <div className="font-semibold">{Math.round(settings.weightGoals.targetWeightKg * 2.20462)} lbs</div>
              </div>
            </div>

            {settings.weightGoals.targetWeightKg !== settings.weightGoals.currentWeightKg && (
              <div className="bg-gray-50 p-3 rounded-lg text-sm">
                <div className="flex items-center gap-2 text-gray-700">
                  <TrendingDown className="w-4 h-4" />
                  <span>
                    {Math.abs(settings.weightGoals.weeklyGoalKg * 2.20462).toFixed(1)} lbs/week goal
                  </span>
                </div>
                {settings.weightGoals.targetDate && (
                  <div className="text-gray-600 mt-1">
                    Target date: {new Date(settings.weightGoals.targetDate).toLocaleDateString()}
                  </div>
                )}
              </div>
            )}

            <div className="mt-3 flex gap-2">
              <Button size="sm" variant="outline" className="flex-1">
                <Scale className="w-4 h-4 mr-2" />
                Log Weight
              </Button>
              <Button size="sm" variant="outline" className="flex-1">
                View Chart
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Connected Devices */}
      <Card className="rounded-2xl border">
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Smartphone className="w-4 h-4" />
            Connected Devices
          </h3>

          <div className="space-y-2">
            {currentProfile.conditions?.libreConnected && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    🩸
                  </div>
                  <div>
                    <div className="font-medium">Libre CGM</div>
                    <div className="text-xs text-gray-600">Glucose monitoring</div>
                  </div>
                </div>
                <Badge variant="secondary">Connected</Badge>
              </div>
            )}

            {currentProfile.conditions?.fitbitConnected && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    📱
                  </div>
                  <div>
                    <div className="font-medium">Fitbit</div>
                    <div className="text-xs text-gray-600">Activity &amp; heart rate</div>
                  </div>
                </div>
                <Badge variant="secondary">Connected</Badge>
              </div>
            )}

            {!currentProfile.conditions?.libreConnected && !currentProfile.conditions?.fitbitConnected && (
              <div className="text-sm text-gray-600 text-center py-4">
                No devices connected yet.
              </div>
            )}
          </div>

          <Button variant="outline" className="w-full mt-3" size="sm">
            Manage Devices →
          </Button>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <div className="text-xs text-gray-500 text-center p-4 bg-gray-50 rounded-lg">
        <p>
          <strong>Health Disclaimer:</strong> Nutrition estimates are for informational purposes only.
          Consult a healthcare professional before making significant dietary changes or starting a weight loss program.
        </p>
      </div>
    </div>
  );
}
