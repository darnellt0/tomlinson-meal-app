# Whole30 Mode Implementation Guide

This document explains the new Whole30 Mode toggle system implemented in the Tomlinson Meal Planning App.

## Overview

The app now supports two eating modes:

1. **Whole30 Mode** - Strict Whole30 compliance (no grains, dairy, legumes, added sugar, alcohol, processed foods)
2. **Post-Whole30 Mode** - Health-conscious eating that allows reintroduction of some foods while maintaining diabetes & high blood pressure considerations

## Features Implemented

### ✅ Health Settings System

**Files:**
- `src/lib/health-settings.ts` - Core types and logic
- `src/contexts/HealthSettingsContext.tsx` - React Context for global state
- `src/components/HealthSettingsPanel.tsx` - Settings UI component

**Key Types:**

```typescript
export type EatingMode = 'whole30' | 'postWhole30';

export interface HealthSettings {
  mode: EatingMode;
  familyMembers: FamilyMember[];
  avoidIngredients: string[];
  prefersInstantPot: boolean;
  diabeticFriendly: boolean;
  lowSodium: boolean;
  showHealthScores: boolean;
  showDeviceData: boolean;
}

export interface RecipeCompliance {
  isWhole30: boolean;
  nonCompliantReasons?: string[];
  isDiabeticFriendly: boolean;
  isLowSodium: boolean;
  estimatedGlucoseImpact: 'low' | 'medium' | 'high';
  sodiumLevel: 'low' | 'medium' | 'high';
  isInstantPot: boolean;
  flavorProfile?: ('bold' | 'mild' | 'spicy' | 'savory' | 'comfort-food')[];
  keyIngredients?: string[];
}
```

### ✅ Family Health Profiles

Default family members configured:
- **Mom** - Diabetic, uses Freestyle Libre glucose monitor
- **Shria** - High blood pressure, uses Fitbit
- **Darnell** - No specific conditions

### ✅ Ingredient Exclusion

Users can add ingredients to avoid (e.g., "plantains"). The system will check recipes against this list.

### ✅ Recipe Compliance Framework

Functions to:
- Check if recipe is allowed: `isRecipeAllowed(compliance, settings)`
- Calculate health score: `calculateHealthScore(compliance, settings)`
- Get mode descriptions and guidance

### ✅ Device Integration Stubs

**File:** `src/lib/device-integration.ts`

Interfaces ready for future integration:
- **Freestyle Libre** - `GlucoseReading`, `GlucoseTrend`, `MealGlucoseProfile`
- **Fitbit** - `FitbitDailySummary`, `FitbitWeeklySummary`
- **Blood Pressure** - `BPReading`, `BPTrend`

Stub functions created:
- `fetchFreestyleLibreData(userId, startDate, endDate)`
- `fetchFitbitData(userId, startDate, endDate)`
- `getMealPlanningInsights(weeklyData)`

### ✅ Settings UI

Click "Health Settings" button in the header to:
- Toggle between Whole30 and Post-Whole30 modes
- View family health profiles
- Add/remove avoided ingredients
- Set cooking preferences (Instant Pot)
- Configure health priorities (diabetic-friendly, low-sodium)

Settings persist to localStorage.

## How to Use

### As a User

1. **Open the app** at http://localhost:3000
2. **Click "Health Settings"** button in the top-right header
3. **Toggle eating mode:**
   - Start with "Whole30 Mode" for strict compliance
   - Switch to "Post-Whole30 Mode" when ready to reintroduce foods
4. **Manage avoided ingredients:**
   - Default: "plantains" is already excluded
   - Add more with the input field and "Add" button
   - Remove by clicking the X on any badge
5. **Adjust preferences:**
   - Check "Prefer Instant Pot recipes"
   - Check "Prioritize diabetic-friendly meals"
   - Check "Prioritize low-sodium meals"

### As a Developer

#### 1. Access Health Settings in Components

```typescript
import { useHealthSettings } from '@/contexts/HealthSettingsContext';

function MyComponent() {
  const { settings, updateMode, updateSettings } = useHealthSettings();

  // Check current mode
  if (settings.mode === 'whole30') {
    // Show only Whole30-compliant recipes
  }

  // Update mode
  const handleToggle = () => {
    const newMode = settings.mode === 'whole30' ? 'postWhole30' : 'whole30';
    updateMode(newMode);
  };

  // Update other settings
  const handlePreferenceChange = () => {
    updateSettings({ prefersInstantPot: true });
  };
}
```

#### 2. Filter Recipes by Compliance

```typescript
import { isRecipeAllowed, calculateHealthScore } from '@/lib/health-settings';

// Assuming you have recipe compliance data
const compliance: RecipeCompliance = {
  isWhole30: true,
  isDiabeticFriendly: true,
  isLowSodium: true,
  estimatedGlucoseImpact: 'low',
  sodiumLevel: 'low',
  isInstantPot: true,
  flavorProfile: ['bold', 'savory'],
  keyIngredients: ['chicken', 'vegetables', 'coconut aminos'],
};

// Check if recipe is allowed
const check = isRecipeAllowed(compliance, settings);
if (check.allowed) {
  // Show recipe
} else {
  // Hide or gray out recipe
  console.log('Not allowed because:', check.reasons);
}

// Calculate health score (1-5)
const score = calculateHealthScore(compliance, settings);
// Display stars or badge based on score
```

## Next Steps for Full Implementation

### 1. Populate Recipe Compliance Data

**Update Google Sheets CSV** to include these columns:

| Column | Type | Example |
|--------|------|---------|
| `isWhole30` | boolean | `TRUE` or `FALSE` |
| `isDiabeticFriendly` | boolean | `TRUE` or `FALSE` |
| `isLowSodium` | boolean | `TRUE` or `FALSE` |
| `estimatedGlucoseImpact` | low\|medium\|high | `low` |
| `sodiumLevel` | low\|medium\|high | `low` |
| `isInstantPot` | boolean | `TRUE` |
| `flavorProfile` | semicolon-separated | `bold; savory; comfort-food` |
| `keyIngredients` | semicolon-separated | `chicken; garlic; coconut aminos` |

**Update `src/lib/recipes.ts`** to parse these fields:

```typescript
export type Recipe = {
  id: string;
  title: string;
  serves: number;
  ingredients: string[];
  steps: string[];
  health: string[];
  cuisine?: string;
  tags?: string[];

  // NEW: Add compliance fields
  isWhole30?: boolean;
  isDiabeticFriendly?: boolean;
  isLowSodium?: boolean;
  estimatedGlucoseImpact?: 'low' | 'medium' | 'high';
  sodiumLevel?: 'low' | 'medium' | 'high';
  isInstantPot?: boolean;
  flavorProfile?: string[];
  keyIngredients?: string[];
};

// Update fetchRecipesFromCsv function to parse these fields
```

### 2. Implement Recipe Filtering in Views

**Update TodayView:**

```typescript
import { useHealthSettings } from '@/contexts/HealthSettingsContext';
import { isRecipeAllowed, calculateHealthScore } from '@/lib/health-settings';

export function TodayView({ recipes }: { recipes: Record<string, Recipe> }) {
  const { settings } = useHealthSettings();

  // ... existing code ...

  const MealCard = ({ type, entry }) => {
    const r = entry.recipeId ? recipes[entry.recipeId] : undefined;

    // NEW: Check compliance
    let compliance = null;
    let isAllowed = true;
    let healthScore = 3;
    if (r) {
      compliance = {
        isWhole30: r.isWhole30 ?? false,
        isDiabeticFriendly: r.isDiabeticFriendly ?? true,
        isLowSodium: r.isLowSodium ?? true,
        estimatedGlucoseImpact: r.estimatedGlucoseImpact ?? 'medium',
        sodiumLevel: r.sodiumLevel ?? 'medium',
        isInstantPot: r.isInstantPot ?? false,
        flavorProfile: r.flavorProfile,
        keyIngredients: r.keyIngredients,
      };

      const check = isRecipeAllowed(compliance, settings);
      isAllowed = check.allowed;
      healthScore = calculateHealthScore(compliance, settings);
    }

    return (
      <Card className={`rounded-2xl ${!isAllowed ? 'opacity-50 border-red-300' : ''}`}>
        {/* ... existing card content ... */}

        {/* NEW: Show health score */}
        {settings.showHealthScores && (
          <Badge variant="outline">
            {'⭐'.repeat(Math.round(healthScore))} {healthScore.toFixed(1)}
          </Badge>
        )}

        {/* NEW: Show non-compliance warning */}
        {!isAllowed && (
          <div className="text-xs text-red-600 mt-2">
            ⚠️ Not compatible with current settings
          </div>
        )}
      </Card>
    );
  };
}
```

### 3. Add Smart Week Planner

Create `src/lib/meal-planner.ts`:

```typescript
import type { Recipe } from './recipes';
import type { HealthSettings } from './health-settings';
import { isRecipeAllowed, calculateHealthScore } from './health-settings';

export function generateWeeklyPlan(
  recipes: Record<string, Recipe>,
  settings: HealthSettings
): { day: string; breakfast: string; lunch: string; dinner: string }[] {
  // Filter allowed recipes
  const allowedRecipes = Object.values(recipes).filter(r => {
    // Build compliance object from recipe
    const compliance = {
      isWhole30: r.isWhole30 ?? false,
      isDiabeticFriendly: r.isDiabeticFriendly ?? true,
      // ... etc
    };
    const check = isRecipeAllowed(compliance, settings);
    return check.allowed;
  });

  // Score and sort recipes
  const scored = allowedRecipes.map(r => {
    // ... build compliance
    const score = calculateHealthScore(compliance, settings);
    return { recipe: r, score };
  }).sort((a, b) => b.score - a.score);

  // Generate 7 days, ensuring variety
  const plan = [];
  for (let i = 0; i < 7; i++) {
    // Select high-scoring recipes
    // Ensure no repeats
    // Balance cuisines
    // ...
  }

  return plan;
}
```

Add button in UI:

```typescript
import { generateWeeklyPlan } from '@/lib/meal-planner';

function CalendarView() {
  const { settings } = useHealthSettings();
  const [recipes, setRecipes] = useState({});

  const handleGeneratePlan = () => {
    const plan = generateWeeklyPlan(recipes, settings);
    // Display or export plan
  };

  return (
    <div>
      <Button onClick={handleGeneratePlan}>
        Generate This Week
      </Button>
      {/* ... */}
    </div>
  );
}
```

### 4. Integrate Device Data (Future)

When ready to integrate Freestyle Libre or Fitbit:

1. Set up OAuth flow for each service
2. Implement actual API calls in `device-integration.ts`
3. Store tokens securely (environment variables, encrypted database)
4. Create dashboard component to display device data
5. Correlate meals with glucose readings or activity levels

## Testing

### Manual Testing Checklist

- [ ] Health Settings panel opens and closes
- [ ] Mode toggle switches between Whole30 and Post-Whole30
- [ ] Mode persists after page refresh (localStorage)
- [ ] Can add avoided ingredient (e.g., "shellfish")
- [ ] Can remove avoided ingredient
- [ ] Preferences checkboxes work
- [ ] Current mode displays in header (🥗 or 🍽️)

### Automated Testing (TODO)

Install Playwright:
```bash
npm install -D @playwright/test
npx playwright install
```

Run tests (once implemented):
```bash
npx playwright test
```

See `QA_REPORT.md` section 7 for test examples.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                   App Layout (layout.tsx)               │
│  ┌───────────────────────────────────────────────────┐  │
│  │      HealthSettingsProvider (Context)             │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │           Main Page (page.tsx)              │  │  │
│  │  │  ┌─────────────────┐  ┌──────────────────┐  │  │  │
│  │  │  │ Health Settings │  │  useHealthSettings │  │  │
│  │  │  │     Panel       │  │      Hook         │  │  │
│  │  │  └─────────────────┘  └──────────────────┘  │  │  │
│  │  │  ┌─────────────────────────────────────┐    │  │  │
│  │  │  │  TodayView / CalendarView           │    │  │  │
│  │  │  │  - Uses settings to filter recipes  │    │  │  │
│  │  │  │  - Shows health scores               │    │  │  │
│  │  │  └─────────────────────────────────────┘    │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
         │
         │ Uses
         ▼
┌─────────────────────────────────────────────────────────┐
│            Health Settings Library                       │
│  ┌────────────────────────────────────────────────────┐ │
│  │  health-settings.ts                                │ │
│  │  - isRecipeAllowed()                               │ │
│  │  - calculateHealthScore()                          │ │
│  │  - getModeDescription()                            │ │
│  └────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────┐ │
│  │  device-integration.ts (stubs)                     │ │
│  │  - Freestyle Libre interfaces                      │ │
│  │  - Fitbit interfaces                               │ │
│  │  - BP tracking interfaces                          │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## FAQ

### Q: Can I change the default family members?

A: Yes! Edit `DEFAULT_HEALTH_SETTINGS` in `src/lib/health-settings.ts`:

```typescript
export const DEFAULT_HEALTH_SETTINGS: HealthSettings = {
  mode: 'whole30',
  familyMembers: [
    { name: 'Your Name', conditions: ['diabetic'], deviceType: 'freestyle-libre' },
    // ... add more
  ],
  // ...
};
```

Or build a UI to manage family members dynamically.

### Q: Where is the recipe compliance data stored?

A: Currently, you need to add these fields to your Google Sheets CSV. See "Next Steps" above.

Alternatively, you can hardcode compliance data in `src/lib/recipes.ts` or create a separate JSON file.

### Q: How do I disable the Whole30 Mode feature?

A: The feature is non-intrusive. If you don't want to use it:
1. Don't click the "Health Settings" button
2. The default mode is Whole30, so all recipes are shown
3. To hide the mode indicator in the header, comment out lines 49-51 in `src/app/page.tsx`

### Q: Can I add more eating modes (e.g., Keto, Paleo)?

A: Yes! Update the `EatingMode` type in `src/lib/health-settings.ts`:

```typescript
export type EatingMode = 'whole30' | 'postWhole30' | 'keto' | 'paleo';
```

Then add filtering logic in `isRecipeAllowed()` and update the UI.

## Support

For issues or questions:
- See `QA_REPORT.md` for detailed bug reports and feature requests
- Create GitHub issues using templates in the QA report
- Contact: [your contact info]

## Credits

**Designed and implemented by:** MealPlan QA Agent
**Date:** 2025-11-13
**For:** Tomlinson Family - Health-first meal planning for diabetes, high BP, and Whole30 journey
