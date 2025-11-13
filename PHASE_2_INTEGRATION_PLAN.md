# Phase 2: UI Integration Plan
## 🔍 Review & Approval Required Before Integration

**Status:** ⏸️ AWAITING APPROVAL
**New Components Created:** ✅ 3 components (all compile successfully)
**Existing Files to Modify:** 📝 3 files (shown below)

---

## ✨ New Components Created (Ready to Use)

### 1. HealthView.tsx ✅
**Location:** `src/components/views/HealthView.tsx`
**Lines:** 283
**Purpose:** Complete Health tab with eating mode, calorie goals, weight tracking, device connections

**Features:**
- Profile switcher (Mom, Shria, Darnell)
- Eating mode toggle (Whole30 ↔ Post-Whole30)
- Calorie & macro goals display
- Weight tracking card
- Connected devices (Libre, Fitbit)
- Health disclaimer

**Status:** ✅ Complete, compiles, ready to integrate

---

### 2. HealthSummaryBanner.tsx ✅
**Location:** `src/components/health/HealthSummaryBanner.tsx`
**Lines:** 229
**Purpose:** Collapsible health summary banner for TodayView

**Features:**
- Collapsed: Single-line summary (calories progress)
- Expanded: Full breakdown with macros
- Whole30 mode: Shows day counter instead of calories
- Dismissible: User can hide permanently
- Mode-aware: Only shows in Post-Whole30 mode

**Status:** ✅ Complete, compiles, ready to integrate

---

### 3. RecipeNutritionSection.tsx ✅
**Location:** `src/components/health/RecipeNutritionSection.tsx`
**Lines:** 148
**Purpose:** Expandable nutrition section for recipe modals

**Features:**
- Collapsed by default (progressive disclosure)
- Shows per-serving nutrition breakdown
- Whole30 compliance badge
- Only renders if nutrition data available
- Graceful degradation

**Status:** ✅ Complete, compiles, ready to integrate

---

## 📝 Existing Files That Need Changes

### Change 1: Add "Health" Tab to Navigation

**File:** `src/components/NavTabs.tsx`

**Current Code (lines 5-6):**
```typescript
type TabKey = "today" | "calendar" | "groceries";
```

**New Code:**
```typescript
type TabKey = "today" | "calendar" | "groceries" | "health";
```

**Current Code (lines 15-18):**
```typescript
  const tabs: { key: TabKey; label: string }[] = [
    { key: "today", label: "Today" },
    { key: "calendar", label: "Calendar" },
    { key: "groceries", label: "Groceries" },
  ];
```

**New Code:**
```typescript
  const tabs: { key: TabKey; label: string }[] = [
    { key: "today", label: "Today" },
    { key: "calendar", label: "Calendar" },
    { key: "groceries", label: "Groceries" },
    { key: "health", label: "Health" },
  ];
```

**Impact:** ✅ Low risk - Just adding a new tab option
**Lines Changed:** 2 lines

---

### Change 2: Wire Health Tab in Main App

**File:** `src/app/page.tsx`

**Step 2a: Update tab state type (line 23)**

**Current:**
```typescript
const [tab, setTab] = useState<"today" | "calendar" | "groceries">("today");
```

**New:**
```typescript
const [tab, setTab] = useState<"today" | "calendar" | "groceries" | "health">("today");
```

**Step 2b: Import HealthView (add to imports at top)**

**Current imports (lines 8-16):**
```typescript
import { NavTabs } from "@/components/NavTabs";
import { TodayView } from "@/components/views/TodayView";
import CalendarView from "@/components/views/CalendarView";
import GroceriesView from "@/components/views/GroceriesView";
//import TrackingView from "@/components/views/TrackingView";
//import PrepView from "@/components/views/PrepView";
//import ReflectionView from "@/components/views/ReflectionView";
//import MetricsView from "@/components/views/MetricsView";
import { fetchRecipesFromCsv, type Recipe } from "@/lib/recipes";
```

**New imports:**
```typescript
import { NavTabs } from "@/components/NavTabs";
import { TodayView } from "@/components/views/TodayView";
import CalendarView from "@/components/views/CalendarView";
import GroceriesView from "@/components/views/GroceriesView";
import HealthView from "@/components/views/HealthView"; // NEW
//import TrackingView from "@/components/views/TrackingView";
//import PrepView from "@/components/views/PrepView";
//import ReflectionView from "@/components/views/ReflectionView";
//import MetricsView from "@/components/views/MetricsView";
import { fetchRecipesFromCsv, type Recipe } from "@/lib/recipes";
```

**Step 2c: Add Health tab render (lines 70-74)**

**Current:**
```typescript
      <main className="grid gap-6">
        {tab === "today" && <TodayView recipes={recipes} />}
        {tab === "calendar" && <CalendarView />}
        {tab === "groceries" && <GroceriesView />}
      </main>
```

**New:**
```typescript
      <main className="grid gap-6">
        {tab === "today" && <TodayView recipes={recipes} />}
        {tab === "calendar" && <CalendarView />}
        {tab === "groceries" && <GroceriesView />}
        {tab === "health" && <HealthView />}
      </main>
```

**Impact:** ✅ Low risk - Standard tab wiring pattern
**Lines Changed:** 3 lines

---

### Change 3: Add Health Banner & Snap Button to TodayView

**File:** `src/components/views/TodayView.tsx`

**Step 3a: Import new components (add to imports at top)**

**Current imports (lines 1-12):**
```typescript
"use client";

import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X, ChefHat, HeartPulse } from "lucide-react";
import type { CalendarRow } from "@/lib/types";
import type { Recipe } from "@/lib/recipes";
import { loadCalendar } from "@/lib/loaders";
```

**New imports:**
```typescript
"use client";

import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X, ChefHat, HeartPulse } from "lucide-react";
import type { CalendarRow } from "@/lib/types";
import type { Recipe } from "@/lib/recipes";
import { loadCalendar } from "@/lib/loaders";
import { HealthSummaryBanner } from "@/components/health/HealthSummaryBanner"; // NEW
import { SnapMealButton } from "@/components/health/SnapMealButton"; // NEW
```

**Step 3b: Add health banner above meal cards (line 87-88)**

**Current JSX:**
```tsx
  return (
    <>
      <div className="grid gap-3 md:grid-cols-3">
        <MealCard type="Breakfast" entry={{ label: meals.Breakfast.label, recipeId: meals.Breakfast.recipeId }} />
        <MealCard type="Lunch" entry={{ label: meals.Lunch.label, recipeId: meals.Lunch.recipeId }} />
        <MealCard type="Dinner" entry={{ label: meals.Dinner.label, recipeId: meals.Dinner.recipeId }} />
      </div>
```

**New JSX:**
```tsx
  return (
    <>
      {/* Health Summary Banner - NEW */}
      <HealthSummaryBanner />

      <div className="grid gap-3 md:grid-cols-3">
        <MealCard type="Breakfast" entry={{ label: meals.Breakfast.label, recipeId: meals.Breakfast.recipeId }} />
        <MealCard type="Lunch" entry={{ label: meals.Lunch.label, recipeId: meals.Lunch.recipeId }} />
        <MealCard type="Dinner" entry={{ label: meals.Dinner.label, recipeId: meals.Dinner.recipeId }} />
      </div>
```

**Step 3c: Add Snap Meal button at end (after Dialog closing tag, line 142)**

**Current ending:**
```tsx
        </DialogContent>
      </Dialog>
    </>
  );
}
```

**New ending:**
```tsx
        </DialogContent>
      </Dialog>

      {/* Snap & Log Floating Button - NEW */}
      <SnapMealButton />
    </>
  );
}
```

**Impact:** ✅ Low risk - Adding components, not modifying existing logic
**Lines Changed:** 4 lines (2 imports + 2 JSX additions)

---

### Optional Change 4: Add Nutrition Section to Recipe Modal

**File:** `src/components/views/TodayView.tsx` (same file as Change 3)

**Note:** This change is OPTIONAL for now since recipes don't have nutrition data yet.
We can add this in a future step when we add nutrition to the Recipe type.

**Where to add:** Inside the recipe modal Dialog, after health notes section (around line 128)

**Current modal structure:**
```tsx
          {rec ? (
            <div className="grid gap-4">
              {/* ... badges, ingredients, steps, health notes ... */}
            </div>
          ) : (
            <div className="text-sm text-gray-600">
              {meals.Notes || "No extra notes for today yet."}
            </div>
          )}
```

**New modal structure (when ready):**
```tsx
          {rec ? (
            <div className="grid gap-4">
              {/* ... badges, ingredients, steps, health notes ... */}

              {/* NEW: Nutrition section */}
              <RecipeNutritionSection
                nutrition={rec.nutrition}
                servings={rec.serves}
              />
            </div>
          ) : (
            <div className="text-sm text-gray-600">
              {meals.Notes || "No extra notes for today yet."}
            </div>
          )}
```

**Prerequisite:** Need to add optional `nutrition?: NutritionInfo` field to Recipe type in `lib/recipes.ts`

**Impact:** ✅ Very low risk - Component only renders if nutrition data exists
**Status:** 🟡 DEFER to Phase 2.5 (after we add nutrition to recipes)

---

## 📊 Summary of Changes

### New Files Created ✅
```
src/components/views/HealthView.tsx              283 lines
src/components/health/HealthSummaryBanner.tsx    229 lines
src/components/health/RecipeNutritionSection.tsx 148 lines
PHASE_2_INTEGRATION_PLAN.md                      (this file)
```

### Existing Files to Modify 📝
```
1. src/components/NavTabs.tsx           2 lines changed
2. src/app/page.tsx                     3 lines changed
3. src/components/views/TodayView.tsx   4 lines changed
```

**Total Lines Changed:** 9 lines across 3 files
**Risk Level:** ✅ LOW - All additive changes, no logic modifications

---

## ✅ Quality Checks Before Integration

### Pre-Integration Checklist
- [x] All new components compile successfully (`npx tsc --noEmit`)
- [x] No breaking changes to existing meal planning code
- [x] All changes are additive (no deletions or logic modifications)
- [x] Health features remain optional (banner is dismissible, tab is optional)
- [x] Mode-aware behavior implemented (Whole30 vs Post-Whole30)
- [x] Graceful degradation (components only render when data available)

### Post-Integration Testing Plan
- [ ] Navigate to Health tab → Should load settings and display profile
- [ ] Toggle Whole30 ↔ Post-Whole30 → Should update banner display
- [ ] Dismiss health banner → Should persist (localStorage)
- [ ] Click Snap Meal button → Should open photo flow dialog
- [ ] View Today tab → Should show 3 meal cards + banner (if Post-Whole30)
- [ ] Check TypeScript compilation → `npx tsc --noEmit` should pass
- [ ] Check app still runs → `npm run dev` should work

---

## 🎯 Integration Steps (When Approved)

### Step 1: Update NavTabs.tsx
```bash
# Edit src/components/NavTabs.tsx
# - Line 5-6: Add "health" to TabKey type
# - Line 18: Add health tab to tabs array
```

### Step 2: Update page.tsx (Main App)
```bash
# Edit src/app/page.tsx
# - Line 23: Add "health" to tab state type
# - Line ~13: Import HealthView
# - Line ~73: Add {tab === "health" && <HealthView />}
```

### Step 3: Update TodayView.tsx
```bash
# Edit src/components/views/TodayView.tsx
# - Top: Import HealthSummaryBanner and SnapMealButton
# - Line ~89: Add <HealthSummaryBanner /> before meal cards grid
# - Line ~143: Add <SnapMealButton /> before closing fragment
```

### Step 4: Verify
```bash
npx tsc --noEmit  # Should pass with no errors
npm run dev       # Should run successfully
```

### Step 5: Test
- [ ] Load app → Should see Health tab
- [ ] Click Health tab → Should show health dashboard
- [ ] Go to Today tab → Should see health banner + Snap button
- [ ] Toggle modes → Should update displays
- [ ] Dismiss banner → Should disappear and stay gone

### Step 6: Commit
```bash
git add -A
git commit -m "Phase 2: UI Integration - Health Tab, Banner, Snap Button"
git push
```

---

## 🚦 Approval Required

**Before proceeding with integration, please review:**

1. **New Components** - Review the 3 new component files for UX/UI approval
2. **Integration Changes** - Review the 9 lines of changes to existing files
3. **Risk Assessment** - All changes are low-risk and additive
4. **Testing Plan** - Review post-integration testing checklist

**Questions to Consider:**
- Is the Health tab placement (4th tab) acceptable?
- Is the health banner design/placement acceptable in TodayView?
- Is the Snap button placement (bottom-right floating) acceptable?
- Should any UI/styling changes be made before integration?

---

## 📋 Reply with Approval

**To proceed with integration, reply with:**
- ✅ "APPROVED" - I'll make all changes automatically
- ✅ "APPROVED WITH CHANGES" - Specify what to modify first
- ⏸️ "HOLD" - I'll wait for further review
- ❌ "REJECT" - I'll revise the plan

---

## 💡 Notes

- All changes preserve meal planning as the primary experience
- Health features are completely optional and dismissible
- No breaking changes to existing code
- TypeScript compilation verified ✅
- Ready to integrate when you approve 🚀
