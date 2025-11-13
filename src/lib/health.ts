// src/lib/health.ts
// Health calculations engine: BMR, TDEE, macros, calorie goals
// Pure functions with no UI dependencies

import type {
  UserProfile,
  CalorieGoals,
  DailyCalorieLog,
  MealLog,
  NutritionInfo,
  WeightGoals,
} from "./types";

// ============================================
// BASAL METABOLIC RATE (BMR)
// ============================================

/**
 * Calculate BMR using Mifflin-St Jeor equation (most accurate modern formula)
 * BMR = energy expenditure at complete rest
 */
export function calculateBMR(profile: UserProfile): number {
  const { weightKg, heightCm, age, sex } = profile;

  // Mifflin-St Jeor:
  // Men: (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) + 5
  // Women: (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) - 161

  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  const bmr = sex === "male" ? base + 5 : base - 161;

  return Math.round(bmr);
}

// ============================================
// TOTAL DAILY ENERGY EXPENDITURE (TDEE)
// ============================================

const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2, // little to no exercise
  light: 1.375, // light exercise 1-3 days/week
  moderate: 1.55, // moderate exercise 3-5 days/week
  active: 1.725, // hard exercise 6-7 days/week
  "very-active": 1.9, // very hard exercise, physical job, training 2x/day
};

/**
 * Calculate TDEE = BMR × activity multiplier
 * TDEE = total calories needed to maintain current weight
 */
export function calculateTDEE(profile: UserProfile, bmr?: number): number {
  const basalRate = bmr ?? calculateBMR(profile);
  const multiplier = ACTIVITY_MULTIPLIERS[profile.activityLevel];
  return Math.round(basalRate * multiplier);
}

// ============================================
// CALORIE DEFICIT/SURPLUS CALCULATION
// ============================================

/**
 * Calculate target daily calories based on weight goals
 * Safe deficit: 500 cal/day = ~0.5 kg (1 lb) per week
 * Safe surplus: 300-500 cal/day for muscle gain
 */
export function calculateTargetCalories(
  tdee: number,
  approach: "maintain" | "deficit" | "surplus",
  weeklyWeightChangeKg: number = 0
): number {
  if (approach === "maintain") {
    return tdee;
  }

  // 1 kg fat ≈ 7700 calories
  // Weekly change → daily calorie adjustment
  const dailyCalorieChange = (weeklyWeightChangeKg * 7700) / 7;

  if (approach === "deficit") {
    // Negative weekly change (weight loss)
    const target = tdee + dailyCalorieChange; // dailyChange is negative
    // Safety: never go below 1200 for women, 1500 for men (minimum recommended)
    return Math.max(1200, Math.round(target));
  }

  if (approach === "surplus") {
    // Positive weekly change (weight gain)
    const target = tdee + dailyCalorieChange;
    return Math.round(target);
  }

  return tdee;
}

// ============================================
// MACRO CALCULATION
// ============================================

/**
 * Calculate macro grams from target calories using standard ratios
 * Default ratios:
 * - Protein: 30% (high for satiety, muscle preservation)
 * - Fat: 35% (supports hormone health, Whole30 emphasis)
 * - Carbs: 35% (balanced, moderate)
 *
 * Can be adjusted for specific goals (e.g., lower carb for diabetes management)
 */
export function calculateMacros(
  targetCalories: number,
  ratios: { protein: number; fat: number; carbs: number } = {
    protein: 0.3,
    fat: 0.35,
    carbs: 0.35,
  }
): { proteinGrams: number; fatGrams: number; carbGrams: number } {
  // Validate ratios sum to ~1.0
  const sum = ratios.protein + ratios.fat + ratios.carbs;
  if (Math.abs(sum - 1.0) > 0.01) {
    console.warn(`Macro ratios sum to ${sum}, not 1.0. Adjusting...`);
    // Normalize
    ratios.protein /= sum;
    ratios.fat /= sum;
    ratios.carbs /= sum;
  }

  // Calorie per gram: Protein=4, Fat=9, Carbs=4
  const proteinCalories = targetCalories * ratios.protein;
  const fatCalories = targetCalories * ratios.fat;
  const carbCalories = targetCalories * ratios.carbs;

  return {
    proteinGrams: Math.round(proteinCalories / 4),
    fatGrams: Math.round(fatCalories / 9),
    carbGrams: Math.round(carbCalories / 4),
  };
}

// ============================================
// COMPLETE CALORIE GOALS CALCULATION
// ============================================

/**
 * Generate complete CalorieGoals from user profile and weight goals
 */
export function generateCalorieGoals(
  profile: UserProfile,
  weightGoals?: WeightGoals
): CalorieGoals {
  const bmr = calculateBMR(profile);
  const tdee = calculateTDEE(profile, bmr);

  let approach: "maintain" | "deficit" | "surplus" = "maintain";
  let weeklyWeightChangeKg = 0;

  if (weightGoals) {
    const delta = weightGoals.targetWeightKg - weightGoals.currentWeightKg;
    weeklyWeightChangeKg = weightGoals.weeklyGoalKg;

    if (delta < 0) {
      approach = "deficit";
    } else if (delta > 0) {
      approach = "surplus";
    }
  }

  const targetCalories = calculateTargetCalories(tdee, approach, weeklyWeightChangeKg);
  const macros = calculateMacros(targetCalories);

  return {
    targetCalories,
    bmr,
    tdee,
    approach,
    weeklyWeightChangeKg,
    ...macros,
  };
}

// ============================================
// DAILY LOG AGGREGATION
// ============================================

/**
 * Aggregate nutrition from multiple meal logs for a single day
 */
export function aggregateDailyNutrition(meals: MealLog[]): {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
} {
  const totals = {
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
  };

  for (const meal of meals) {
    if (meal.nutrition) {
      totals.calories += meal.nutrition.calories;
      totals.protein += meal.nutrition.protein;
      totals.fat += meal.nutrition.fat;
      totals.carbs += meal.nutrition.carbs;
    }
  }

  return {
    calories: Math.round(totals.calories),
    protein: Math.round(totals.protein),
    fat: Math.round(totals.fat),
    carbs: Math.round(totals.carbs),
  };
}

/**
 * Create a DailyCalorieLog from meal logs and targets
 */
export function createDailyLog(
  date: string,
  meals: MealLog[],
  targets: CalorieGoals
): DailyCalorieLog {
  const totals = aggregateDailyNutrition(meals);

  // Determine status: within ±10% of target = on-target
  const variance = totals.calories / targets.targetCalories;
  let status: "under" | "on-target" | "over";
  if (variance < 0.9) {
    status = "under";
  } else if (variance > 1.1) {
    status = "over";
  } else {
    status = "on-target";
  }

  return {
    date,
    meals,
    totals,
    targets,
    status,
  };
}

// ============================================
// PORTION ADJUSTMENT
// ============================================

/**
 * Scale nutrition info for a different portion size
 * Example: Recipe serves 6, user ate 1.5 servings
 */
export function scaleNutrition(
  baseNutrition: NutritionInfo,
  baseServings: number,
  actualServings: number
): NutritionInfo {
  const multiplier = actualServings / baseServings;

  return {
    servingSize: `${actualServings} serving(s)`,
    calories: Math.round(baseNutrition.calories * multiplier),
    protein: Math.round(baseNutrition.protein * multiplier),
    fat: Math.round(baseNutrition.fat * multiplier),
    carbs: Math.round(baseNutrition.carbs * multiplier),
    fiber: baseNutrition.fiber ? Math.round(baseNutrition.fiber * multiplier) : undefined,
    sugar: baseNutrition.sugar ? Math.round(baseNutrition.sugar * multiplier) : undefined,
    sodium: baseNutrition.sodium ? Math.round(baseNutrition.sodium * multiplier) : undefined,
    whole30Compliant: baseNutrition.whole30Compliant,
  };
}

// ============================================
// WEIGHT PROJECTION
// ============================================

/**
 * Calculate estimated date to reach target weight
 */
export function projectTargetDate(
  currentWeightKg: number,
  targetWeightKg: number,
  weeklyChangeKg: number
): { weeksNeeded: number; estimatedDate: Date } {
  const deltaKg = Math.abs(targetWeightKg - currentWeightKg);
  const weeksNeeded = Math.ceil(deltaKg / Math.abs(weeklyChangeKg));

  const estimatedDate = new Date();
  estimatedDate.setDate(estimatedDate.getDate() + weeksNeeded * 7);

  return { weeksNeeded, estimatedDate };
}

// ============================================
// SAFETY VALIDATORS
// ============================================

/**
 * Validate calorie targets are safe (not too low)
 * Returns warnings if targets are concerning
 */
export function validateCalorieGoals(
  goals: CalorieGoals,
  profile: UserProfile
): { safe: boolean; warnings: string[] } {
  const warnings: string[] = [];

  // Minimum safe calories
  const minCalories = profile.sex === "female" ? 1200 : 1500;
  if (goals.targetCalories < minCalories) {
    warnings.push(
      `Target calories (${goals.targetCalories}) are below recommended minimum (${minCalories}). ` +
        `This may slow metabolism and cause nutrient deficiencies.`
    );
  }

  // Too aggressive deficit
  if (goals.approach === "deficit" && goals.weeklyWeightChangeKg && Math.abs(goals.weeklyWeightChangeKg) > 1.0) {
    warnings.push(
      `Weekly weight loss goal (${Math.abs(goals.weeklyWeightChangeKg).toFixed(1)} kg/week) is too aggressive. ` +
        `Recommended: 0.5-1.0 kg/week for sustainable fat loss.`
    );
  }

  return {
    safe: warnings.length === 0,
    warnings,
  };
}

/**
 * Get friendly message for daily log status
 */
export function getDailyStatusMessage(log: DailyCalorieLog): string {
  const remaining = log.targets.targetCalories - log.totals.calories;

  if (log.status === "on-target") {
    return `Target ${log.targets.targetCalories} cal • Logged ${log.totals.calories} cal • Looking good! 👍`;
  }

  if (log.status === "under") {
    return `Target ${log.targets.targetCalories} cal • Logged ${log.totals.calories} cal • ${Math.abs(remaining)} cal remaining`;
  }

  // over
  return `Target ${log.targets.targetCalories} cal • Logged ${log.totals.calories} cal • ${Math.abs(remaining)} cal over (that's okay!)`;
}
