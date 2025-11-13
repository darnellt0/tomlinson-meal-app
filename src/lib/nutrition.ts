// src/lib/nutrition.ts
// Nutrition API integration scaffolding
// Mock implementations for Phase 1, easy to swap with real APIs later

import type { NutritionInfo, DetectedFoodItem } from "./types";

// ============================================
// API REQUEST/RESPONSE TYPES
// ============================================

/**
 * Request to analyze a photo of food
 * Future: Send to vision AI service (e.g., Clarifai, Google Vision, custom model)
 */
export type PhotoNutritionRequest = {
  imageUrl?: string; // URL to uploaded image
  imageBase64?: string; // Or base64-encoded image data
  userId?: string; // For personalization/history
  mealType?: "breakfast" | "lunch" | "dinner" | "snack";
};

/**
 * Response from photo nutrition analysis
 * Future: Returned by vision AI + nutrition lookup service
 */
export type PhotoNutritionResponse = {
  success: boolean;
  detectedItems: DetectedFoodItem[];
  totalNutrition: NutritionInfo;
  confidence: number; // 0-1, overall confidence in detection
  processingTimeMs?: number;
  error?: string;
};

/**
 * Request to get nutrition info for a recipe by text
 * Future: Send to Edamam, USDA, or recipe scraper
 */
export type RecipeNutritionRequest = {
  recipeText?: string; // Full recipe text (ingredients + instructions)
  ingredientsList?: string[]; // Or just ingredients
  servings: number;
  recipeId?: string; // For caching
};

/**
 * Response from recipe nutrition analysis
 */
export type RecipeNutritionResponse = {
  success: boolean;
  nutrition: NutritionInfo;
  perServing: NutritionInfo;
  ingredients: {
    name: string;
    quantity: string;
    nutrition?: NutritionInfo;
  }[];
  error?: string;
};

/**
 * Simple food search request
 * Future: USDA FoodData Central, Edamam Food Database
 */
export type FoodSearchRequest = {
  query: string; // e.g., "grilled chicken breast"
  maxResults?: number;
};

/**
 * Food search result item
 */
export type FoodSearchResult = {
  id: string;
  name: string;
  brand?: string;
  servingSize: string;
  nutrition: NutritionInfo;
  source: "usda" | "edamam" | "custom";
};

// ============================================
// MOCK IMPLEMENTATIONS (Phase 1)
// ============================================

/**
 * Mock photo nutrition analysis
 * Returns realistic example data for development/testing
 *
 * TODO Phase 2: Replace with actual vision AI integration
 * Candidates:
 * - Clarifai Food Recognition API
 * - Google Cloud Vision + custom nutrition lookup
 * - Logmeal Food Recognition API
 * - Custom TensorFlow/PyTorch model
 */
export async function analyzeMealPhoto(
  request: PhotoNutritionRequest
): Promise<PhotoNutritionResponse> {
  // Simulate API delay
  await delay(800);

  // Mock detected items (realistic examples)
  const mockItems: DetectedFoodItem[] = [
    {
      name: "Grilled chicken breast",
      amount: "6 oz (170g)",
      confidence: 0.92,
      nutrition: {
        calories: 284,
        protein: 53,
        fat: 6,
        carbs: 0,
        fiber: 0,
        whole30Compliant: true,
      },
    },
    {
      name: "Roasted broccoli",
      amount: "1 cup (156g)",
      confidence: 0.87,
      nutrition: {
        calories: 55,
        protein: 4,
        fat: 1,
        carbs: 11,
        fiber: 5,
        whole30Compliant: true,
      },
    },
    {
      name: "Baked sweet potato",
      amount: "1 medium (114g)",
      confidence: 0.81,
      nutrition: {
        calories: 103,
        protein: 2,
        fat: 0,
        carbs: 24,
        fiber: 4,
        whole30Compliant: true,
      },
    },
  ];

  // Aggregate total nutrition
  const totalNutrition: NutritionInfo = mockItems.reduce<NutritionInfo>(
    (acc, item) => ({
      calories: acc.calories + (item.nutrition?.calories || 0),
      protein: acc.protein + (item.nutrition?.protein || 0),
      fat: acc.fat + (item.nutrition?.fat || 0),
      carbs: acc.carbs + (item.nutrition?.carbs || 0),
      fiber: (acc.fiber || 0) + (item.nutrition?.fiber || 0),
      whole30Compliant:
        (acc.whole30Compliant ?? true) && (item.nutrition?.whole30Compliant ?? false),
    }),
    {
      calories: 0,
      protein: 0,
      fat: 0,
      carbs: 0,
      fiber: 0,
      whole30Compliant: true,
    }
  );

  return {
    success: true,
    detectedItems: mockItems,
    totalNutrition,
    confidence: 0.87,
    processingTimeMs: 782,
  };
}

/**
 * Mock recipe nutrition analysis
 * Returns example nutrition for a recipe
 *
 * TODO Phase 2: Replace with Edamam Recipe Analysis API or USDA integration
 * Edamam API: https://www.edamam.com/
 * USDA FoodData Central: https://fdc.nal.usda.gov/
 */
export async function analyzeRecipe(
  request: RecipeNutritionRequest
): Promise<RecipeNutritionResponse> {
  await delay(600);

  // Mock total nutrition for the whole recipe
  const totalNutrition: NutritionInfo = {
    calories: 1710,
    protein: 144,
    fat: 66,
    carbs: 90,
    fiber: 24,
    sugar: 12,
    sodium: 1850,
    whole30Compliant: true,
  };

  // Calculate per-serving
  const perServing: NutritionInfo = {
    calories: Math.round(totalNutrition.calories / request.servings),
    protein: Math.round(totalNutrition.protein / request.servings),
    fat: Math.round(totalNutrition.fat / request.servings),
    carbs: Math.round(totalNutrition.carbs / request.servings),
    fiber: totalNutrition.fiber
      ? Math.round(totalNutrition.fiber / request.servings)
      : undefined,
    sugar: totalNutrition.sugar
      ? Math.round(totalNutrition.sugar / request.servings)
      : undefined,
    sodium: totalNutrition.sodium
      ? Math.round(totalNutrition.sodium / request.servings)
      : undefined,
    whole30Compliant: totalNutrition.whole30Compliant,
  };

  return {
    success: true,
    nutrition: totalNutrition,
    perServing,
    ingredients: [
      {
        name: "Ground beef (85/15)",
        quantity: "2 lbs",
        nutrition: { calories: 1120, protein: 96, fat: 80, carbs: 0 },
      },
      {
        name: "Bell peppers",
        quantity: "2 large",
        nutrition: { calories: 74, protein: 3, fat: 1, carbs: 16 },
      },
      // ... more ingredients (abbreviated for mock)
    ],
  };
}

/**
 * Mock food search
 * Returns example search results
 *
 * TODO Phase 2: Integrate with USDA or Edamam Food Database
 */
export async function searchFood(
  request: FoodSearchRequest
): Promise<FoodSearchResult[]> {
  await delay(400);

  const mockResults: FoodSearchResult[] = [
    {
      id: "usda_chicken_001",
      name: "Chicken breast, grilled, skinless",
      servingSize: "100g",
      nutrition: {
        calories: 165,
        protein: 31,
        fat: 4,
        carbs: 0,
        fiber: 0,
        whole30Compliant: true,
      },
      source: "usda",
    },
    {
      id: "usda_chicken_002",
      name: "Chicken breast, raw",
      servingSize: "100g",
      nutrition: {
        calories: 120,
        protein: 23,
        fat: 3,
        carbs: 0,
        whole30Compliant: true,
      },
      source: "usda",
    },
  ];

  return mockResults.slice(0, request.maxResults || 10);
}

// ============================================
// BARCODE LOOKUP (Future Phase)
// ============================================

/**
 * Look up nutrition info by barcode/UPC
 * Future: Use Open Food Facts API or similar
 *
 * Open Food Facts: https://world.openfoodfacts.org/
 * TODO Phase 2+: Add barcode scanning for packaged foods
 */
export async function lookupBarcode(upc: string): Promise<FoodSearchResult | null> {
  await delay(500);

  // Mock implementation
  console.log(`[Mock] Barcode lookup: ${upc}`);
  return null; // Not implemented in Phase 1
}

// ============================================
// HELPERS
// ============================================

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Validate nutrition info has required fields
 */
export function isValidNutrition(nutrition?: NutritionInfo): boolean {
  if (!nutrition) return false;
  return (
    typeof nutrition.calories === "number" &&
    typeof nutrition.protein === "number" &&
    typeof nutrition.fat === "number" &&
    typeof nutrition.carbs === "number"
  );
}

/**
 * Format nutrition info as human-readable string
 */
export function formatNutrition(nutrition: NutritionInfo): string {
  const parts = [
    `${nutrition.calories} cal`,
    `${nutrition.protein}g protein`,
    `${nutrition.fat}g fat`,
    `${nutrition.carbs}g carbs`,
  ];

  if (nutrition.fiber) {
    parts.push(`${nutrition.fiber}g fiber`);
  }

  return parts.join(" • ");
}

// ============================================
// FUTURE API INTEGRATION NOTES
// ============================================

/*
PHASE 2+ INTEGRATION PLAN:

1. PHOTO RECOGNITION:
   - Option A: Clarifai Food Recognition
     - API: https://www.clarifai.com/models/food-recognition
     - Pros: Excellent accuracy, detailed food items
     - Cons: Paid tier needed for high volume

   - Option B: Google Cloud Vision + Custom Nutrition Lookup
     - API: https://cloud.google.com/vision
     - Pros: Robust vision, flexible
     - Cons: Need to build nutrition lookup layer

   - Option C: Logmeal API
     - API: https://logmeal.com/
     - Pros: Built for food logging, nutrition included
     - Cons: Premium pricing

2. RECIPE NUTRITION:
   - Edamam Recipe Analysis API
     - API: https://www.edamam.com/
     - Paid tier ~$50/month for moderate use
     - Excellent accuracy for recipes

   - USDA FoodData Central
     - API: https://fdc.nal.usda.gov/api-guide.html
     - Free, government database
     - Requires manual ingredient matching

3. FOOD DATABASE:
   - USDA FoodData Central (free, comprehensive)
   - Edamam Food Database (paid, cleaned/curated)
   - Nutritionix (paid, good barcode support)

4. IMPLEMENTATION STRATEGY:
   - Replace mock functions with real API calls
   - Add API key management (env vars)
   - Add error handling & retry logic
   - Cache results to reduce API costs
   - Add rate limiting
   - Implement fallback to manual entry if API fails

5. COST ESTIMATES (monthly, moderate use):
   - Edamam: ~$50-100
   - Clarifai: ~$40-80
   - USDA: Free
   - Total estimated: ~$100-200/month for production use
*/
