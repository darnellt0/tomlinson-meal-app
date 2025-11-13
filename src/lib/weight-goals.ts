// src/lib/weight-goals.ts

/**
 * CALORIE & WEIGHT MANAGEMENT SYSTEM
 *
 * Supports weight loss, maintenance, and gain goals with:
 * - BMR/TDEE calculations
 * - Personalized calorie targets
 * - Macro tracking (protein, carbs, fats)
 * - Portion size recommendations
 * - Progress tracking
 */

// ============================================================================
// TYPES
// ============================================================================

export type GoalType = 'lose' | 'maintain' | 'gain';
export type ActivityLevel = 'sedentary' | 'lightly-active' | 'moderately-active' | 'very-active' | 'extra-active';
export type Sex = 'male' | 'female';
export type WeightUnit = 'lbs' | 'kg';
export type HeightUnit = 'inches' | 'cm';

export interface WeightGoals {
  // User identification
  userId?: string;

  // Current & target
  currentWeight: number;        // in selected unit
  targetWeight: number;
  weightUnit: WeightUnit;
  goalType: GoalType;
  targetDate?: Date;

  // User profile for calculations
  age: number;
  heightValue: number;          // numeric value
  heightUnit: HeightUnit;
  sex: Sex;
  activityLevel: ActivityLevel;

  // Calculated values (read-only, computed)
  bmr: number;                  // Basal Metabolic Rate
  tdee: number;                 // Total Daily Energy Expenditure
  targetCalories: number;       // Daily calorie target
  dailyDeficitSurplus: number;  // Negative = deficit, Positive = surplus

  // Macro distribution (percentages)
  macros: {
    proteinPercent: number;     // % of total calories (default: 30%)
    carbsPercent: number;       // default: 40%
    fatsPercent: number;        // default: 30%
  };

  // Computed macro grams
  macroGrams: {
    protein: number;            // grams per day
    carbs: number;
    fats: number;
  };

  // Progress tracking
  startWeight: number;
  startDate: Date;

  // Optional: For diabetes management
  dailyCarbLimit?: number;      // grams

  // Optional: For BP management
  dailySodiumLimit?: number;    // mg (default: 2300mg, or 1500mg for hypertension)
}

export interface WeightEntry {
  date: Date;
  weight: number;
  weightUnit: WeightUnit;
  bmi?: number;
  notes?: string;
}

export interface DailyCalorieLog {
  date: Date;
  targetCalories: number;
  consumedCalories: number;
  meals: MealLog[];

  // Macro totals
  totalProtein: number;         // grams
  totalCarbs: number;
  totalFats: number;

  // Progress metrics
  percentOfTarget: number;      // 0-100+
  caloriesRemaining: number;
  carbsRemaining?: number;      // For diabetes tracking
  sodiumConsumed?: number;      // For BP tracking
}

export interface MealLog {
  id: string;                   // unique ID
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  recipeId?: string;
  recipeName: string;
  timestamp: Date;

  // Nutrition
  calories: number;
  protein: number;              // grams
  carbs: number;
  fats: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;              // mg

  // Portion
  servingSize: number;          // e.g., 1.0 = full serving, 0.75 = 75%, 1.5 = 150%
  notes?: string;
}

export interface RecipeNutrition {
  servings: number;
  perServing: {
    calories: number;
    protein: number;            // grams
    carbs: number;
    fats: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;            // mg

    // Optional detailed breakdown
    saturatedFat?: number;
    transFat?: number;
    cholesterol?: number;
    potassium?: number;
    vitaminA?: number;
    vitaminC?: number;
    calcium?: number;
    iron?: number;
  };

  // Optional: Per-ingredient breakdown
  ingredients?: IngredientNutrition[];
}

export interface IngredientNutrition {
  name: string;
  amount: string;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface WeightProgress {
  startWeight: number;
  currentWeight: number;
  targetWeight: number;
  weightLost: number;           // can be negative if gaining
  percentComplete: number;      // 0-100

  // Time tracking
  weeksElapsed: number;
  avgWeeklyChange: number;      // lbs/week
  expectedWeeksRemaining: number;

  // Status
  onTrack: boolean;
  status: 'ahead' | 'on-track' | 'behind' | 'goal-reached';

  // History
  entries: WeightEntry[];
}

export interface CalorieRecommendation {
  recipeId: string;
  recipeName: string;
  calories: number;
  fitsGoal: boolean;            // within remaining calories
  healthScore: number;          // 1-5
  reason?: string;              // why recommended
  caloriesDelta: number;        // difference from remaining
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  'sedentary': 1.2,              // Little or no exercise
  'lightly-active': 1.375,       // Light exercise 1-3 days/week
  'moderately-active': 1.55,     // Moderate exercise 3-5 days/week
  'very-active': 1.725,          // Hard exercise 6-7 days/week
  'extra-active': 1.9            // Very hard exercise + physical job
};

export const ACTIVITY_DESCRIPTIONS: Record<ActivityLevel, string> = {
  'sedentary': 'Little or no exercise',
  'lightly-active': 'Light exercise 1-3 days/week',
  'moderately-active': 'Moderate exercise 3-5 days/week',
  'very-active': 'Hard exercise 6-7 days/week',
  'extra-active': 'Very hard exercise & physical job'
};

export const CALORIE_ADJUSTMENTS: Record<GoalType, number> = {
  'lose': -500,                  // 500 cal deficit = ~1 lb/week loss
  'maintain': 0,
  'gain': 400                    // 400 cal surplus = ~0.8 lb/week gain
};

export const DEFAULT_MACRO_SPLIT = {
  proteinPercent: 30,
  carbsPercent: 40,
  fatsPercent: 30
};

// Calories per gram
export const CALORIES_PER_GRAM = {
  protein: 4,
  carbs: 4,
  fats: 9,
  alcohol: 7                     // not used, but FYI
};

// Health limits
export const DEFAULT_SODIUM_LIMIT = 2300;           // mg/day (general population)
export const HYPERTENSION_SODIUM_LIMIT = 1500;     // mg/day (high BP)
export const DEFAULT_CARB_LIMIT_DIABETIC = 135;    // g/day (can be personalized)

// ============================================================================
// CALCULATION FUNCTIONS
// ============================================================================

/**
 * Convert weight between units
 */
export function convertWeight(value: number, from: WeightUnit, to: WeightUnit): number {
  if (from === to) return value;
  if (from === 'lbs' && to === 'kg') return value * 0.453592;
  if (from === 'kg' && to === 'lbs') return value * 2.20462;
  return value;
}

/**
 * Convert height to cm
 */
export function convertHeightToCm(value: number, unit: HeightUnit): number {
  if (unit === 'cm') return value;
  return value * 2.54; // inches to cm
}

/**
 * Calculate BMI
 */
export function calculateBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
}

/**
 * Calculate BMR (Basal Metabolic Rate) using Mifflin-St Jeor Equation
 * This is the most accurate formula for modern populations
 */
export function calculateBMR(
  weightKg: number,
  heightCm: number,
  age: number,
  sex: Sex
): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;

  if (sex === 'male') {
    return base + 5;
  } else {
    return base - 161;
  }
}

/**
 * Calculate TDEE (Total Daily Energy Expenditure)
 * BMR adjusted for activity level
 */
export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  return Math.round(bmr * ACTIVITY_MULTIPLIERS[activityLevel]);
}

/**
 * Calculate target calories based on goal
 */
export function calculateTargetCalories(
  tdee: number,
  goalType: GoalType
): { target: number; deficit: number } {
  const adjustment = CALORIE_ADJUSTMENTS[goalType];
  const target = Math.round(tdee + adjustment);

  return { target, deficit: adjustment };
}

/**
 * Calculate macro grams from percentages and total calories
 */
export function calculateMacroGrams(
  totalCalories: number,
  proteinPercent: number,
  carbsPercent: number,
  fatsPercent: number
): { protein: number; carbs: number; fats: number } {
  return {
    protein: Math.round((totalCalories * (proteinPercent / 100)) / CALORIES_PER_GRAM.protein),
    carbs: Math.round((totalCalories * (carbsPercent / 100)) / CALORIES_PER_GRAM.carbs),
    fats: Math.round((totalCalories * (fatsPercent / 100)) / CALORIES_PER_GRAM.fats)
  };
}

/**
 * Calculate all goals at once
 */
export function calculateWeightGoals(input: {
  currentWeight: number;
  targetWeight: number;
  weightUnit: WeightUnit;
  goalType: GoalType;
  age: number;
  heightValue: number;
  heightUnit: HeightUnit;
  sex: Sex;
  activityLevel: ActivityLevel;
  macros?: { proteinPercent: number; carbsPercent: number; fatsPercent: number };
  targetDate?: Date;
  startDate?: Date;
}): WeightGoals {
  // Convert to standard units (kg, cm)
  const weightKg = convertWeight(input.currentWeight, input.weightUnit, 'kg');
  const heightCm = convertHeightToCm(input.heightValue, input.heightUnit);

  // Calculate BMR and TDEE
  const bmr = calculateBMR(weightKg, heightCm, input.age, input.sex);
  const tdee = calculateTDEE(bmr, input.activityLevel);

  // Calculate target calories
  const { target: targetCalories, deficit: dailyDeficitSurplus } = calculateTargetCalories(tdee, input.goalType);

  // Macro split
  const macros = input.macros || DEFAULT_MACRO_SPLIT;
  const macroGrams = calculateMacroGrams(targetCalories, macros.proteinPercent, macros.carbsPercent, macros.fatsPercent);

  return {
    currentWeight: input.currentWeight,
    targetWeight: input.targetWeight,
    weightUnit: input.weightUnit,
    goalType: input.goalType,
    targetDate: input.targetDate,
    age: input.age,
    heightValue: input.heightValue,
    heightUnit: input.heightUnit,
    sex: input.sex,
    activityLevel: input.activityLevel,
    bmr: Math.round(bmr),
    tdee,
    targetCalories,
    dailyDeficitSurplus,
    macros,
    macroGrams,
    startWeight: input.currentWeight,
    startDate: input.startDate || new Date()
  };
}

/**
 * Estimate time to reach goal
 * Assumes 3500 calories = 1 lb of body weight
 */
export function estimateTimeToGoal(
  currentWeight: number,
  targetWeight: number,
  weightUnit: WeightUnit,
  dailyDeficitSurplus: number
): { weeks: number; daysPerWeek: number } {
  // Convert to lbs for calculation
  const currentLbs = convertWeight(currentWeight, weightUnit, 'lbs');
  const targetLbs = convertWeight(targetWeight, weightUnit, 'lbs');
  const difference = Math.abs(targetLbs - currentLbs);

  // 3500 calories = 1 lb
  const totalCaloriesNeeded = difference * 3500;
  const weeklyDeficit = Math.abs(dailyDeficitSurplus) * 7;
  const weeks = Math.ceil(totalCaloriesNeeded / weeklyDeficit);

  return { weeks, daysPerWeek: 7 };
}

/**
 * Adjust portion nutrition based on serving multiplier
 */
export function adjustPortionNutrition(
  original: RecipeNutrition['perServing'],
  multiplier: number
): RecipeNutrition['perServing'] {
  return {
    calories: Math.round(original.calories * multiplier),
    protein: Math.round(original.protein * multiplier),
    carbs: Math.round(original.carbs * multiplier),
    fats: Math.round(original.fats * multiplier),
    fiber: original.fiber ? Math.round(original.fiber * multiplier) : undefined,
    sugar: original.sugar ? Math.round(original.sugar * multiplier) : undefined,
    sodium: original.sodium ? Math.round(original.sodium * multiplier) : undefined,
  };
}

/**
 * Calculate ideal portion size to hit remaining calories
 */
export function calculateIdealPortion(
  recipeCalories: number,
  targetCalories: number,
  minPortion: number = 0.5,
  maxPortion: number = 2.0
): { portion: number; willFit: boolean } {
  const idealPortion = targetCalories / recipeCalories;

  // Clamp to reasonable range
  const clampedPortion = Math.max(minPortion, Math.min(maxPortion, idealPortion));

  // Round to nearest 0.25 for practical cooking
  const roundedPortion = Math.round(clampedPortion * 4) / 4;

  return {
    portion: roundedPortion,
    willFit: roundedPortion * recipeCalories <= targetCalories * 1.1 // 10% tolerance
  };
}

/**
 * Calculate progress from weight history
 */
export function calculateProgress(
  startWeight: number,
  currentWeight: number,
  targetWeight: number,
  weightUnit: WeightUnit,
  entries: WeightEntry[]
): WeightProgress {
  const totalChange = targetWeight - startWeight;
  const currentChange = currentWeight - startWeight;
  const remaining = targetWeight - currentWeight;

  // Percentage complete
  const percentComplete = Math.round((Math.abs(currentChange) / Math.abs(totalChange)) * 100);

  // Time calculations
  const sortedEntries = [...entries].sort((a, b) => a.date.getTime() - b.date.getTime());
  const firstEntry = sortedEntries[0];
  const latestEntry = sortedEntries[sortedEntries.length - 1];

  const weeksElapsed = firstEntry && latestEntry
    ? Math.max(1, Math.round((latestEntry.date.getTime() - firstEntry.date.getTime()) / (7 * 24 * 60 * 60 * 1000)))
    : 1;

  const avgWeeklyChange = (currentWeight - startWeight) / weeksElapsed;

  // Expected weeks remaining
  const expectedWeeksRemaining = avgWeeklyChange !== 0
    ? Math.round(Math.abs(remaining / avgWeeklyChange))
    : 999;

  // Status determination
  let status: WeightProgress['status'];
  let onTrack = true;

  if (Math.abs(remaining) < 1) {
    status = 'goal-reached';
  } else {
    const expectedChange = totalChange > 0 ? 0.5 : -0.5; // expected lb/week
    if (Math.abs(avgWeeklyChange) > Math.abs(expectedChange) * 1.3) {
      status = 'ahead';
    } else if (Math.abs(avgWeeklyChange) < Math.abs(expectedChange) * 0.7) {
      status = 'behind';
      onTrack = false;
    } else {
      status = 'on-track';
    }
  }

  return {
    startWeight,
    currentWeight,
    targetWeight,
    weightLost: startWeight - currentWeight,
    percentComplete,
    weeksElapsed,
    avgWeeklyChange,
    expectedWeeksRemaining,
    onTrack,
    status,
    entries: sortedEntries
  };
}

/**
 * Calculate daily calorie log totals
 */
export function calculateDailyTotals(
  meals: MealLog[],
  targetCalories: number
): Omit<DailyCalorieLog, 'date' | 'targetCalories' | 'meals'> {
  const consumedCalories = meals.reduce((sum, m) => sum + m.calories, 0);
  const totalProtein = meals.reduce((sum, m) => sum + m.protein, 0);
  const totalCarbs = meals.reduce((sum, m) => sum + m.carbs, 0);
  const totalFats = meals.reduce((sum, m) => sum + m.fats, 0);
  const sodiumConsumed = meals.reduce((sum, m) => sum + (m.sodium || 0), 0);

  const percentOfTarget = Math.round((consumedCalories / targetCalories) * 100);
  const caloriesRemaining = targetCalories - consumedCalories;

  return {
    consumedCalories,
    totalProtein: Math.round(totalProtein),
    totalCarbs: Math.round(totalCarbs),
    totalFats: Math.round(totalFats),
    percentOfTarget,
    caloriesRemaining,
    sodiumConsumed: Math.round(sodiumConsumed)
  };
}

/**
 * Validate weight goals for safety
 */
export function validateWeightGoals(goals: WeightGoals): { valid: boolean; warnings: string[] } {
  const warnings: string[] = [];

  // Check minimum calories (safety)
  if (goals.sex === 'female' && goals.targetCalories < 1200) {
    warnings.push('Target calories below 1200/day is not recommended for women without medical supervision');
  }
  if (goals.sex === 'male' && goals.targetCalories < 1500) {
    warnings.push('Target calories below 1500/day is not recommended for men without medical supervision');
  }

  // Check deficit/surplus
  if (Math.abs(goals.dailyDeficitSurplus) > 1000) {
    warnings.push('Daily deficit/surplus over 1000 calories may be too aggressive');
  }

  // Check BMI extremes
  const weightKg = convertWeight(goals.currentWeight, goals.weightUnit, 'kg');
  const heightCm = convertHeightToCm(goals.heightValue, goals.heightUnit);
  const bmi = calculateBMI(weightKg, heightCm);

  if (bmi < 18.5 && goals.goalType === 'lose') {
    warnings.push('BMI is already below healthy range - weight loss not recommended');
  }

  return {
    valid: warnings.length === 0,
    warnings
  };
}
