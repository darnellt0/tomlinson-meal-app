// src/lib/health-mock-data.ts
// Mock data and default profiles for the Tomlinson family

import type { UserProfile, HealthSettings, WeightGoals } from "./types";
import { generateCalorieGoals } from "./health";

// ============================================
// FAMILY PROFILES (based on actual context)
// ============================================

export const DEFAULT_PROFILES: {
  mom: UserProfile;
  shria: UserProfile;
  darnell: UserProfile;
} = {
  mom: {
    name: "Mom",
    age: 45, // example
    sex: "female",
    heightCm: 165, // ~5'5" - adjust to actual
    weightKg: 70, // ~154 lbs - adjust to actual
    activityLevel: "light",
    conditions: {
      diabetic: true,
      libreConnected: true,
      highBP: false,
      fitbitConnected: false,
    },
  },
  shria: {
    name: "Shria",
    age: 18, // example
    sex: "female",
    heightCm: 160, // ~5'3" - adjust to actual
    weightKg: 65, // ~143 lbs - adjust to actual
    activityLevel: "moderate",
    conditions: {
      diabetic: false,
      libreConnected: false,
      highBP: true,
      fitbitConnected: true,
    },
  },
  darnell: {
    name: "Darnell",
    age: 45, // example
    sex: "male",
    heightCm: 180, // ~5'11" - adjust to actual
    weightKg: 95, // ~209 lbs - adjust to actual
    activityLevel: "moderate",
    conditions: {
      diabetic: false,
      libreConnected: false,
      highBP: false,
      fitbitConnected: false,
    },
  },
};

// ============================================
// DEFAULT HEALTH SETTINGS
// ============================================

/**
 * Create default health settings for the app
 * Starts in Whole30 mode with no calorie tracking
 */
export function createDefaultHealthSettings(): HealthSettings {
  return {
    eatingMode: "whole30",
    currentProfile: "darnell", // Default active user
    profiles: DEFAULT_PROFILES,
    showCaloriesInPlanner: false, // Hidden during Whole30
    whole30StartDate: new Date().toISOString().split("T")[0], // Today
    whole30DayNumber: 1,
  };
}

/**
 * Switch to Post-Whole30 mode with calorie tracking
 */
export function switchToPostWhole30(
  settings: HealthSettings,
  profile: "mom" | "shria" | "darnell"
): HealthSettings {
  const userProfile = settings.profiles[profile];

  // Generate calorie goals based on profile
  const weightGoals: WeightGoals = getDefaultWeightGoals(profile, userProfile);
  const calorieGoals = generateCalorieGoals(userProfile, weightGoals);

  return {
    ...settings,
    eatingMode: "post-whole30",
    currentProfile: profile,
    showCaloriesInPlanner: true,
    calorieGoals,
    weightGoals,
    // Clear Whole30-specific fields
    whole30StartDate: undefined,
    whole30DayNumber: undefined,
  };
}

/**
 * Get default weight goals for each family member
 * (These are examples - should be customizable in UI)
 */
function getDefaultWeightGoals(
  profile: "mom" | "shria" | "darnell",
  userProfile: UserProfile
): WeightGoals {
  // Example goals - adjust based on actual family preferences
  const goals: Record<string, WeightGoals> = {
    mom: {
      startWeightKg: 72, // ~159 lbs starting weight
      currentWeightKg: userProfile.weightKg,
      targetWeightKg: 65, // ~143 lbs target
      weeklyGoalKg: -0.25, // ~0.5 lbs/week loss (gentle for diabetes management)
    },
    shria: {
      startWeightKg: 68, // ~150 lbs starting weight
      currentWeightKg: userProfile.weightKg,
      targetWeightKg: 60, // ~132 lbs target
      weeklyGoalKg: -0.35, // ~0.75 lbs/week loss
    },
    darnell: {
      startWeightKg: 98, // ~216 lbs starting weight
      currentWeightKg: userProfile.weightKg,
      targetWeightKg: 84, // ~185 lbs target (post-Whole30 sustainable weight)
      weeklyGoalKg: -0.45, // ~1 lb/week loss
    },
  };

  return goals[profile];
}

// ============================================
// MOCK MEAL LOGS (for testing)
// ============================================

import type { MealLog, NutritionInfo } from "./types";

/**
 * Create a mock meal log for testing
 */
export function createMockMealLog(
  mealType: "breakfast" | "lunch" | "dinner" | "snack",
  recipeName: string,
  nutrition: NutritionInfo,
  source: "planned" | "photo-ai" | "manual" = "planned"
): MealLog {
  const today = new Date().toISOString().split("T")[0];
  const timestamp = new Date().toISOString();

  return {
    id: `meal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    date: today,
    mealType,
    source,
    recipeName,
    nutrition,
    timestamp,
  };
}

/**
 * Generate a full day of mock meal logs
 */
export function createMockDailyMeals(): MealLog[] {
  return [
    createMockMealLog("breakfast", "Veggie Egg Scramble with Avocado", {
      calories: 385,
      protein: 24,
      fat: 26,
      carbs: 12,
      fiber: 7,
      whole30Compliant: true,
    }),
    createMockMealLog("lunch", "Grilled Chicken Salad with Olive Oil", {
      calories: 425,
      protein: 38,
      fat: 22,
      carbs: 18,
      fiber: 6,
      whole30Compliant: true,
    }),
    createMockMealLog("dinner", "No-Bean Chili with Sweet Potato", {
      calories: 485,
      protein: 42,
      fat: 18,
      carbs: 35,
      fiber: 9,
      whole30Compliant: true,
    }),
  ];
}

// ============================================
// LOCAL STORAGE HELPERS
// ============================================

const STORAGE_KEY = "tomlinson_health_settings";

/**
 * Load health settings from localStorage
 */
export function loadHealthSettings(): HealthSettings | null {
  if (typeof window === "undefined") return null;

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;

  try {
    return JSON.parse(stored) as HealthSettings;
  } catch {
    return null;
  }
}

/**
 * Save health settings to localStorage
 */
export function saveHealthSettings(settings: HealthSettings): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

/**
 * Get or initialize health settings
 */
export function getOrInitHealthSettings(): HealthSettings {
  const stored = loadHealthSettings();
  if (stored) return stored;

  const defaultSettings = createDefaultHealthSettings();
  saveHealthSettings(defaultSettings);
  return defaultSettings;
}
