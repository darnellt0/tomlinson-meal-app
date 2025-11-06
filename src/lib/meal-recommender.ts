// src/lib/meal-recommender.ts
import type { CalendarRow, TrackingRow } from "./types";
import type { Recipe } from "./recipes";

export type MealRecommendation = {
  recipe: Recipe;
  score: number;
  reasons: string[];
};

export type RecommendationContext = {
  recentMeals: CalendarRow[];
  glucoseHistory: TrackingRow[];
  date: string;
  profile?: {
    favoriteRecipes?: string[];
    dietaryRestrictions?: string[];
  };
};

function getDaysSinceLastUse(recipeId: string, recentMeals: CalendarRow[]): number {
  let daysSince = 999;
  for (let i = 0; i < recentMeals.length; i++) {
    const meal = recentMeals[i];
    const meals = [meal.Breakfast, meal.Lunch, meal.Dinner].filter(Boolean).join(" ");
    if (meals.includes(recipeId)) {
      daysSince = i;
      break;
    }
  }
  return daysSince;
}

function getUsageCount(recipeId: string, recentMeals: CalendarRow[]): number {
  let count = 0;
  for (const meal of recentMeals) {
    const meals = [meal.Breakfast, meal.Lunch, meal.Dinner].filter(Boolean).join(" ");
    if (meals.includes(recipeId)) {
      count++;
    }
  }
  return count;
}

function getProteinTypes(recentMeals: CalendarRow[]): string[] {
  const proteins = new Set<string>();
  for (const meal of recentMeals) {
    const meals = [meal.Breakfast, meal.Lunch, meal.Dinner].filter(Boolean).join(" ").toLowerCase();
    if (meals.includes("chicken")) proteins.add("chicken");
    if (meals.includes("beef") || meals.includes("steak")) proteins.add("beef");
    if (meals.includes("pork")) proteins.add("pork");
    if (meals.includes("fish") || meals.includes("salmon") || meals.includes("tuna")) proteins.add("fish");
    if (meals.includes("egg")) proteins.add("egg");
    if (meals.includes("turkey")) proteins.add("turkey");
    if (meals.includes("tofu") || meals.includes("tempeh")) proteins.add("plant");
  }
  return Array.from(proteins);
}

function getRecipeProtein(recipe: Recipe): string | null {
  const ingredients = recipe.ingredients.join(" ").toLowerCase();
  if (ingredients.includes("chicken")) return "chicken";
  if (ingredients.includes("beef") || ingredients.includes("steak")) return "beef";
  if (ingredients.includes("pork")) return "pork";
  if (ingredients.includes("fish") || ingredients.includes("salmon") || ingredients.includes("tuna")) return "fish";
  if (ingredients.includes("egg")) return "egg";
  if (ingredients.includes("turkey")) return "turkey";
  if (ingredients.includes("tofu") || ingredients.includes("tempeh")) return "plant";
  return null;
}

function scoreRecipe(recipe: Recipe, context: RecommendationContext): { score: number; reasons: string[] } {
  let score = 50;
  const reasons: string[] = [];
  const daysSince = getDaysSinceLastUse(recipe.id, context.recentMeals);
  if (daysSince > 14) {
    score += 30;
    reasons.push("Haven't had in over 2 weeks");
  } else if (daysSince > 7) {
    score += 20;
    reasons.push("Haven't had in over a week");
  } else if (daysSince < 3) {
    score -= 40;
    reasons.push("Had very recently");
  }
  const usageCount = getUsageCount(recipe.id, context.recentMeals);
  if (usageCount >= 3 && usageCount <= 5) {
    score += 15;
    reasons.push("Popular favorite");
  } else if (usageCount > 5) {
    score -= 10;
    reasons.push("May be overused");
  }
  const recentProteins = getProteinTypes(context.recentMeals.slice(0, 7));
  const recipeProtein = getRecipeProtein(recipe);
  if (recipeProtein && !recentProteins.includes(recipeProtein)) {
    score += 25;
    reasons.push(`Adds protein variety (${recipeProtein})`);
  }
  if (recipe.health?.includes("CGM-friendly") || recipe.health?.includes("Low-Glycemic")) {
    score += 15;
    reasons.push("CGM-friendly");
  }
  if (context.profile?.favoriteRecipes?.includes(recipe.id)) {
    score += 20;
    reasons.push("Personal favorite");
  }
  return { score, reasons };
}

export function recommendMeals(context: RecommendationContext, allRecipes: Record<string, Recipe>, count: number = 5): MealRecommendation[] {
  const recommendations: MealRecommendation[] = [];
  for (const recipe of Object.values(allRecipes)) {
    const { score, reasons } = scoreRecipe(recipe, context);
    recommendations.push({ recipe, score, reasons });
  }
  recommendations.sort((a, b) => b.score - a.score);
  return recommendations.slice(0, count);
}

export function getMealFrequency(recentMeals: CalendarRow[], allRecipes: Record<string, Recipe>): Array<{ recipe: Recipe; count: number; lastUsed: string }> {
  const frequency = new Map<string, { count: number; lastUsed: string }>();
  for (const meal of recentMeals) {
    const date = meal.Date || "";
    const meals = [meal.Breakfast, meal.Lunch, meal.Dinner].filter((m): m is string => Boolean(m));
    for (const mealId of meals) {
      if (allRecipes[mealId]) {
        const current = frequency.get(mealId) || { count: 0, lastUsed: date };
        frequency.set(mealId, { count: current.count + 1, lastUsed: date > current.lastUsed ? date : current.lastUsed });
      }
    }
  }
  return Array.from(frequency.entries()).map(([recipeId, data]) => ({ recipe: allRecipes[recipeId], count: data.count, lastUsed: data.lastUsed })).sort((a, b) => b.count - a.count);
}
