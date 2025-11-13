// src/lib/types.ts

// ---- CALENDAR (Sheet: "30-Day Calendar") ----
export type CalendarRow = {
  Week: string;
  Day: string;
  Date?: string;
  "Cuisine Focus"?: string;
  Breakfast?: string;
  Lunch?: string;
  Dinner?: string;
  "Batch Notes"?: string;
  "CGM Focus"?: string;
  // Be tolerant to extra columns / header tweaks
  [key: string]: string | undefined;
};

// ---- GROCERIES (Sheet: "Weekly Grocery Lists") ----
export type GroceryRow = {
  Category?: string;
  Item?: string;
  Quantity?: string;
  Notes?: string;
  Checked?: string; // e.g. "☐" / "☑" or blank
  [key: string]: string | undefined;
};

// ---- DAILY TRACKING (Sheet: "Daily Tracking Template") ----
export type TrackingRow = {
  Date?: string;
  "Day #"?: string;
  Breakfast?: string;
  Lunch?: string;
  Dinner?: string;
  Snacks?: string;
  "Pre-Meal Glucose"?: string;
  "1hr Post Glucose"?: string;
  "2hr Post Glucose"?: string;
  "Highest Reading"?: string;
  "BP Reading"?: string;
  "Energy (1-10)"?: string;
  "Sleep (1-10)"?: string;
  "Mood (1-10)"?: string;
  Notes?: string;
  [key: string]: string | undefined;
};

// ---- MEAL PREP (Sheet: "Meal Prep Schedule & Assignments") ----
export type PrepRow = {
  Week?: string;
  "Sunday Tasks"?: string;
  "Time Estimate"?: string;
  "Weekday Tasks"?: string;
  "Family Assignments"?: string;
  [key: string]: string | undefined;
};

// ---- WEEKLY REFLECTION (Sheet: "Weekly Reflection & Progress") ----
export type ReflectionRow = {
  Week?: string; // ensure your CSV header is exactly "Week"; if not, adjust here and in the component
  Question?: string;
  Response?: string;
  "Action Items"?: string;
  [key: string]: string | undefined;
};

// ---- SUCCESS METRICS (Sheet: "Success Metrics & Measurements") ----
export type MetricsBaselineRow = {
  Metric?: string;
  Value?: string;
  Date?: string;
  Notes?: string;
  [key: string]: string | undefined;
};

export type MetricsWeeklyRow = {
  Week?: string;
  Weight?: string;
  BP?: string;
  Energy?: string;
  Sleep?: string;
  Mood?: string;
  Digestion?: string;
  "CGM Avg"?: string;
  Notes?: string;
  [key: string]: string | undefined;
};

export type MetricsFinalRow = {
  Metric?: string;
  Baseline?: string;
  Final?: string;
  Change?: string;
  Percentage?: string;
  [key: string]: string | undefined;
};

// ============================================
// HEALTH & NUTRITION TRACKING TYPES
// ============================================

// ---- EATING MODE ----
export type EatingMode = "whole30" | "post-whole30";

// ---- USER PROFILE & HEALTH SETTINGS ----
export type UserProfile = {
  name: string;
  age: number;
  sex: "male" | "female";
  heightCm: number;
  weightKg: number;
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "very-active";
  // Health conditions
  conditions?: {
    diabetic?: boolean;
    libreConnected?: boolean;
    highBP?: boolean;
    fitbitConnected?: boolean;
  };
};

export type HealthSettings = {
  eatingMode: EatingMode;
  currentProfile: "mom" | "shria" | "darnell";
  profiles: {
    mom: UserProfile;
    shria: UserProfile;
    darnell: UserProfile;
  };
  // Calorie & macro goals
  calorieGoals?: CalorieGoals;
  weightGoals?: WeightGoals;
  // Preferences
  showCaloriesInPlanner: boolean; // false during Whole30
  whole30StartDate?: string; // ISO date
  whole30DayNumber?: number; // 1-30
};

// ---- CALORIE & MACRO GOALS ----
export type CalorieGoals = {
  targetCalories: number; // e.g., 1650
  proteinGrams: number;
  fatGrams: number;
  carbGrams: number;
  // Calculated from profile
  bmr: number;
  tdee: number;
  approach: "maintain" | "deficit" | "surplus";
  weeklyWeightChangeKg?: number; // e.g., -0.5 for 1lb/week loss
};

// ---- WEIGHT GOALS & TRACKING ----
export type WeightGoals = {
  startWeightKg: number;
  currentWeightKg: number;
  targetWeightKg: number;
  targetDate?: string; // ISO date
  weeklyGoalKg: number; // e.g., -0.23 for -0.5 lbs/week
};

export type WeightLog = {
  date: string; // ISO date
  weightKg: number;
  note?: string;
};

// ---- NUTRITION INFO (per recipe or detected food) ----
export type NutritionInfo = {
  servingSize?: string; // e.g., "1 cup", "6 oz"
  calories: number;
  protein: number; // grams
  fat: number; // grams
  carbs: number; // grams
  fiber?: number; // grams
  sugar?: number; // grams
  sodium?: number; // mg
  whole30Compliant?: boolean;
};

export type RecipeNutrition = NutritionInfo & {
  recipeId: string;
  servings: number; // total servings in recipe
};

// ---- MEAL LOG (for tracking actual eaten meals) ----
export type MealLog = {
  id: string; // unique log ID
  date: string; // ISO date
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  source: "planned" | "photo-ai" | "manual";
  // If planned meal
  recipeId?: string;
  recipeName?: string;
  servings?: number; // how many servings eaten
  // If photo-detected meal
  photoUrl?: string;
  detectedItems?: DetectedFoodItem[];
  // If manual entry
  manualDescription?: string;
  // Aggregated nutrition for this log entry
  nutrition?: NutritionInfo;
  timestamp: string; // ISO timestamp
};

export type DetectedFoodItem = {
  name: string;
  amount: string; // e.g., "6 oz", "1 cup"
  confidence?: number; // 0-1 from AI
  nutrition?: NutritionInfo;
};

// ---- DAILY CALORIE LOG (aggregate for one day) ----
export type DailyCalorieLog = {
  date: string; // ISO date
  meals: MealLog[];
  totals: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
  };
  targets: CalorieGoals;
  status: "under" | "on-target" | "over";
};
