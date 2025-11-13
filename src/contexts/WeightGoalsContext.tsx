// src/contexts/WeightGoalsContext.tsx
"use client";

import * as React from "react";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type {
  WeightGoals,
  WeightEntry,
  DailyCalorieLog,
  MealLog,
  WeightProgress
} from "@/lib/weight-goals";
import {
  calculateWeightGoals,
  calculateDailyTotals,
  calculateProgress
} from "@/lib/weight-goals";

interface WeightGoalsContextType {
  // Weight goals
  weightGoals: WeightGoals | null;
  setWeightGoals: (goals: Partial<WeightGoals>) => void;
  calculateGoals: (input: Parameters<typeof calculateWeightGoals>[0]) => WeightGoals;
  clearWeightGoals: () => void;

  // Weight tracking
  weightHistory: WeightEntry[];
  addWeightEntry: (entry: Omit<WeightEntry, 'date'> & { date?: Date }) => void;
  removeWeightEntry: (date: Date) => void;
  getProgress: () => WeightProgress | null;

  // Daily calorie logging
  dailyLogs: Record<string, DailyCalorieLog>; // key: YYYY-MM-DD
  getTodayLog: () => DailyCalorieLog | null;
  logMeal: (meal: Omit<MealLog, 'id' | 'timestamp'> & { date?: Date }) => void;
  removeMeal: (mealId: string, date?: Date) => void;
  updateMeal: (mealId: string, updates: Partial<MealLog>, date?: Date) => void;
  getRemainingCalories: (date?: Date) => number;
  getRemainingMacros: (date?: Date) => { protein: number; carbs: number; fats: number } | null;

  // View preferences
  showCalorieTracking: boolean;
  setShowCalorieTracking: (show: boolean) => void;
  detailedView: boolean;
  setDetailedView: (detailed: boolean) => void;
}

const WeightGoalsContext = createContext<WeightGoalsContextType | undefined>(undefined);

const STORAGE_KEY_GOALS = "tomlinson_weight_goals";
const STORAGE_KEY_HISTORY = "tomlinson_weight_history";
const STORAGE_KEY_LOGS = "tomlinson_calorie_logs";
const STORAGE_KEY_PREFS = "tomlinson_calorie_prefs";

// Helper to format date as YYYY-MM-DD
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function WeightGoalsProvider({ children }: { children: ReactNode }) {
  const [weightGoals, setWeightGoalsState] = useState<WeightGoals | null>(null);
  const [weightHistory, setWeightHistory] = useState<WeightEntry[]>([]);
  const [dailyLogs, setDailyLogs] = useState<Record<string, DailyCalorieLog>>({});
  const [showCalorieTracking, setShowCalorieTracking] = useState(false);
  const [detailedView, setDetailedView] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Load weight goals
      const storedGoals = localStorage.getItem(STORAGE_KEY_GOALS);
      if (storedGoals) {
        try {
          const parsed = JSON.parse(storedGoals);
          // Convert date strings back to Date objects
          if (parsed.targetDate) parsed.targetDate = new Date(parsed.targetDate);
          if (parsed.startDate) parsed.startDate = new Date(parsed.startDate);
          setWeightGoalsState(parsed);
        } catch (e) {
          console.error("Failed to parse weight goals:", e);
        }
      }

      // Load weight history
      const storedHistory = localStorage.getItem(STORAGE_KEY_HISTORY);
      if (storedHistory) {
        try {
          const parsed = JSON.parse(storedHistory);
          // Convert date strings to Date objects
          const entries = parsed.map((e: WeightEntry) => ({
            ...e,
            date: new Date(e.date)
          }));
          setWeightHistory(entries);
        } catch (e) {
          console.error("Failed to parse weight history:", e);
        }
      }

      // Load daily logs
      const storedLogs = localStorage.getItem(STORAGE_KEY_LOGS);
      if (storedLogs) {
        try {
          const parsed = JSON.parse(storedLogs);
          // Convert date strings to Date objects
          const logs: Record<string, DailyCalorieLog> = {};
          Object.entries(parsed).forEach(([key, log]: [string, any]) => {
            logs[key] = {
              ...log,
              date: new Date(log.date),
              meals: log.meals.map((m: MealLog) => ({
                ...m,
                timestamp: new Date(m.timestamp)
              }))
            };
          });
          setDailyLogs(logs);
        } catch (e) {
          console.error("Failed to parse calorie logs:", e);
        }
      }

      // Load preferences
      const storedPrefs = localStorage.getItem(STORAGE_KEY_PREFS);
      if (storedPrefs) {
        try {
          const parsed = JSON.parse(storedPrefs);
          setShowCalorieTracking(parsed.showCalorieTracking ?? false);
          setDetailedView(parsed.detailedView ?? false);
        } catch (e) {
          console.error("Failed to parse preferences:", e);
        }
      }
    }
  }, []);

  // Save weight goals to localStorage
  useEffect(() => {
    if (typeof window !== "undefined" && weightGoals) {
      localStorage.setItem(STORAGE_KEY_GOALS, JSON.stringify(weightGoals));
    }
  }, [weightGoals]);

  // Save weight history to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(weightHistory));
    }
  }, [weightHistory]);

  // Save daily logs to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(dailyLogs));
    }
  }, [dailyLogs]);

  // Save preferences to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_PREFS, JSON.stringify({
        showCalorieTracking,
        detailedView
      }));
    }
  }, [showCalorieTracking, detailedView]);

  // =========================================================================
  // WEIGHT GOALS
  // =========================================================================

  const setWeightGoals = (updates: Partial<WeightGoals>) => {
    setWeightGoalsState(prev => prev ? { ...prev, ...updates } : null);
  };

  const calculateGoalsWrapper = (input: Parameters<typeof calculateWeightGoals>[0]): WeightGoals => {
    const goals = calculateWeightGoals(input);
    setWeightGoalsState(goals);
    return goals;
  };

  const clearWeightGoals = () => {
    setWeightGoalsState(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY_GOALS);
    }
  };

  // =========================================================================
  // WEIGHT TRACKING
  // =========================================================================

  const addWeightEntry = (entry: Omit<WeightEntry, 'date'> & { date?: Date }) => {
    const newEntry: WeightEntry = {
      ...entry,
      date: entry.date || new Date()
    };

    setWeightHistory(prev => {
      // Remove existing entry for same date if any
      const filtered = prev.filter(e => formatDate(e.date) !== formatDate(newEntry.date));
      // Add new entry and sort by date
      return [...filtered, newEntry].sort((a, b) => a.date.getTime() - b.date.getTime());
    });

    // Update current weight in goals
    if (weightGoals) {
      setWeightGoals({ currentWeight: newEntry.weight });
    }
  };

  const removeWeightEntry = (date: Date) => {
    setWeightHistory(prev => prev.filter(e => formatDate(e.date) !== formatDate(date)));
  };

  const getProgress = (): WeightProgress | null => {
    if (!weightGoals || weightHistory.length === 0) return null;

    return calculateProgress(
      weightGoals.startWeight,
      weightGoals.currentWeight,
      weightGoals.targetWeight,
      weightGoals.weightUnit,
      weightHistory
    );
  };

  // =========================================================================
  // DAILY CALORIE LOGGING
  // =========================================================================

  const getTodayLog = (): DailyCalorieLog | null => {
    if (!weightGoals) return null;

    const today = formatDate(new Date());
    const existing = dailyLogs[today];

    if (existing) return existing;

    // Create empty log for today
    const emptyLog: DailyCalorieLog = {
      date: new Date(),
      targetCalories: weightGoals.targetCalories,
      consumedCalories: 0,
      meals: [],
      totalProtein: 0,
      totalCarbs: 0,
      totalFats: 0,
      percentOfTarget: 0,
      caloriesRemaining: weightGoals.targetCalories
    };

    return emptyLog;
  };

  const logMeal = (meal: Omit<MealLog, 'id' | 'timestamp'> & { date?: Date }) => {
    if (!weightGoals) return;

    const date = meal.date || new Date();
    const dateKey = formatDate(date);

    const newMeal: MealLog = {
      ...meal,
      id: `meal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: date
    };

    setDailyLogs(prev => {
      const existing = prev[dateKey] || {
        date,
        targetCalories: weightGoals.targetCalories,
        consumedCalories: 0,
        meals: [],
        totalProtein: 0,
        totalCarbs: 0,
        totalFats: 0,
        percentOfTarget: 0,
        caloriesRemaining: weightGoals.targetCalories
      };

      const updatedMeals = [...existing.meals, newMeal];
      const totals = calculateDailyTotals(updatedMeals, weightGoals.targetCalories);

      return {
        ...prev,
        [dateKey]: {
          ...existing,
          meals: updatedMeals,
          ...totals
        }
      };
    });
  };

  const removeMeal = (mealId: string, date?: Date) => {
    if (!weightGoals) return;

    const dateKey = formatDate(date || new Date());

    setDailyLogs(prev => {
      const existing = prev[dateKey];
      if (!existing) return prev;

      const updatedMeals = existing.meals.filter(m => m.id !== mealId);
      const totals = calculateDailyTotals(updatedMeals, weightGoals.targetCalories);

      return {
        ...prev,
        [dateKey]: {
          ...existing,
          meals: updatedMeals,
          ...totals
        }
      };
    });
  };

  const updateMeal = (mealId: string, updates: Partial<MealLog>, date?: Date) => {
    if (!weightGoals) return;

    const dateKey = formatDate(date || new Date());

    setDailyLogs(prev => {
      const existing = prev[dateKey];
      if (!existing) return prev;

      const updatedMeals = existing.meals.map(m =>
        m.id === mealId ? { ...m, ...updates } : m
      );
      const totals = calculateDailyTotals(updatedMeals, weightGoals.targetCalories);

      return {
        ...prev,
        [dateKey]: {
          ...existing,
          meals: updatedMeals,
          ...totals
        }
      };
    });
  };

  const getRemainingCalories = (date?: Date): number => {
    if (!weightGoals) return 0;

    const dateKey = formatDate(date || new Date());
    const log = dailyLogs[dateKey];

    if (!log) return weightGoals.targetCalories;

    return log.caloriesRemaining;
  };

  const getRemainingMacros = (date?: Date): { protein: number; carbs: number; fats: number } | null => {
    if (!weightGoals) return null;

    const dateKey = formatDate(date || new Date());
    const log = dailyLogs[dateKey];

    const targetProtein = weightGoals.macroGrams.protein;
    const targetCarbs = weightGoals.macroGrams.carbs;
    const targetFats = weightGoals.macroGrams.fats;

    if (!log) {
      return { protein: targetProtein, carbs: targetCarbs, fats: targetFats };
    }

    return {
      protein: Math.max(0, targetProtein - log.totalProtein),
      carbs: Math.max(0, targetCarbs - log.totalCarbs),
      fats: Math.max(0, targetFats - log.totalFats)
    };
  };

  return (
    <WeightGoalsContext.Provider
      value={{
        weightGoals,
        setWeightGoals,
        calculateGoals: calculateGoalsWrapper,
        clearWeightGoals,
        weightHistory,
        addWeightEntry,
        removeWeightEntry,
        getProgress,
        dailyLogs,
        getTodayLog,
        logMeal,
        removeMeal,
        updateMeal,
        getRemainingCalories,
        getRemainingMacros,
        showCalorieTracking,
        setShowCalorieTracking,
        detailedView,
        setDetailedView
      }}
    >
      {children}
    </WeightGoalsContext.Provider>
  );
}

export function useWeightGoals() {
  const context = useContext(WeightGoalsContext);
  if (!context) {
    throw new Error("useWeightGoals must be used within WeightGoalsProvider");
  }
  return context;
}
