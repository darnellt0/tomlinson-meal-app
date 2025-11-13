// src/lib/health-settings.ts

/**
 * WHOLE30 MODE & HEALTH SETTINGS SYSTEM
 *
 * Supports two phases:
 * 1. Whole30 Mode ON: Strict Whole30 compliance
 * 2. Whole30 Mode OFF (Post-Whole30): Health-conscious eating that allows
 *    reintroduction of some foods while maintaining diabetes & BP focus
 */

export type EatingMode = 'whole30' | 'postWhole30';

export interface FamilyMember {
  name: string;
  conditions: ('diabetic' | 'highBP' | 'none')[];
  deviceType?: 'freestyle-libre' | 'fitbit' | 'none';
}

export interface HealthSettings {
  // Current eating mode
  mode: EatingMode;

  // Family health profiles
  familyMembers: FamilyMember[];

  // Dietary constraints
  avoidIngredients: string[]; // e.g., ["plantains", "shellfish"]

  // Cooking preferences
  prefersInstantPot: boolean;

  // Health flags (auto-computed from familyMembers, but can override)
  diabeticFriendly: boolean;
  lowSodium: boolean;

  // Display preferences
  showHealthScores: boolean;
  showDeviceData: boolean;
}

export const DEFAULT_HEALTH_SETTINGS: HealthSettings = {
  mode: 'whole30',
  familyMembers: [
    {
      name: 'Mom',
      conditions: ['diabetic'],
      deviceType: 'freestyle-libre',
    },
    {
      name: 'Shria',
      conditions: ['highBP'],
      deviceType: 'fitbit',
    },
    {
      name: 'Darnell',
      conditions: ['none'],
      deviceType: 'none',
    },
  ],
  avoidIngredients: ['plantains'],
  prefersInstantPot: true,
  diabeticFriendly: true,
  lowSodium: true,
  showHealthScores: true,
  showDeviceData: false, // Off by default until integration is ready
};

/**
 * Recipe compliance tags
 * These would ideally be in the Google Sheet CSV
 */
export interface RecipeCompliance {
  // Whole30 compliance
  isWhole30: boolean;
  nonCompliantReasons?: string[]; // e.g., ["contains dairy", "contains grains"]

  // Health attributes
  isDiabeticFriendly: boolean;
  isLowSodium: boolean;
  estimatedGlucoseImpact: 'low' | 'medium' | 'high';
  sodiumLevel: 'low' | 'medium' | 'high';

  // Cooking attributes
  isInstantPot: boolean;
  prepTime?: number; // minutes
  cookTime?: number; // minutes

  // Flavor profile
  flavorProfile?: ('bold' | 'mild' | 'spicy' | 'savory' | 'comfort-food')[];
  cuisine?: string;

  // Ingredients to check against avoid list
  keyIngredients?: string[];
}

/**
 * Check if a recipe is allowed in the current mode
 */
export function isRecipeAllowed(
  compliance: RecipeCompliance,
  settings: HealthSettings
): { allowed: boolean; reasons?: string[] } {
  const reasons: string[] = [];

  // Check mode compliance
  if (settings.mode === 'whole30' && !compliance.isWhole30) {
    reasons.push('Not Whole30 compliant');
    if (compliance.nonCompliantReasons) {
      reasons.push(...compliance.nonCompliantReasons);
    }
  }

  // Check diabetic-friendly requirement
  if (settings.diabeticFriendly && !compliance.isDiabeticFriendly) {
    reasons.push('Not suitable for diabetic diet');
  }

  // Check low-sodium requirement
  if (settings.lowSodium && compliance.sodiumLevel === 'high') {
    reasons.push('High sodium content');
  }

  // Check avoided ingredients
  if (compliance.keyIngredients && settings.avoidIngredients.length > 0) {
    const avoided = compliance.keyIngredients.filter((ing) =>
      settings.avoidIngredients.some((avoid) =>
        ing.toLowerCase().includes(avoid.toLowerCase())
      )
    );
    if (avoided.length > 0) {
      reasons.push(`Contains avoided ingredient(s): ${avoided.join(', ')}`);
    }
  }

  return {
    allowed: reasons.length === 0,
    reasons: reasons.length > 0 ? reasons : undefined,
  };
}

/**
 * Calculate a health score for a recipe (1-5 scale)
 * Higher is better
 */
export function calculateHealthScore(
  compliance: RecipeCompliance,
  settings: HealthSettings
): number {
  let score = 3; // baseline

  // Whole30 compliance
  if (compliance.isWhole30) score += 1;

  // Diabetic-friendly
  if (compliance.isDiabeticFriendly) score += 0.5;
  if (compliance.estimatedGlucoseImpact === 'low') score += 0.5;

  // Low sodium
  if (compliance.isLowSodium || compliance.sodiumLevel === 'low') score += 0.5;

  // Instant Pot (if preferred)
  if (settings.prefersInstantPot && compliance.isInstantPot) score += 0.3;

  // Comfort food / bold flavors (family preference)
  if (compliance.flavorProfile?.includes('bold') || compliance.flavorProfile?.includes('comfort-food')) {
    score += 0.2;
  }

  // Cap at 5
  return Math.min(5, Math.max(1, score));
}

/**
 * Mode description helper
 */
export function getModeDescription(mode: EatingMode): string {
  switch (mode) {
    case 'whole30':
      return 'Strict Whole30 compliance: No grains, dairy, legumes, added sugar, alcohol, or processed foods.';
    case 'postWhole30':
      return 'Health-conscious eating: Allows whole grains, legumes, and some dairy in moderation. Still diabetes & BP friendly.';
  }
}

/**
 * Get mode-specific guidance
 */
export function getModeGuidance(mode: EatingMode): string[] {
  switch (mode) {
    case 'whole30':
      return [
        'Focus on whole foods: meat, seafood, eggs, vegetables, fruits, healthy fats',
        'Read labels carefully - no sneaky sugars or additives',
        'Emphasize variety and satisfaction to stay on track',
        'Monitor glucose levels closely for optimal meal timing',
      ];
    case 'postWhole30':
      return [
        'Reintroduce foods slowly and mindfully',
        'Prioritize whole grains over refined grains',
        'Choose beans and lentils for fiber and protein',
        'Continue to avoid highly processed foods and excess sugar',
        'Keep monitoring blood pressure and glucose responses',
      ];
  }
}
