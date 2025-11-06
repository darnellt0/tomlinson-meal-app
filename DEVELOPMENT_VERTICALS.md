# Development Verticals - Tomlinson Meal App

This document outlines independent feature verticals that can be developed in parallel by multiple agents.

## Overview

**Current Version:** 0.1.0 (MVP complete with 7 views + search)

**Architecture:** Next.js 15, React 19, TypeScript, Google Sheets backend

---

## 🎯 Vertical 1: Health Analytics & Visualization

### Owner
Agent working on branch: `feature/health-analytics`

### Scope
Add interactive charts and trend analysis for health metrics tracking.

### Components to Create
- `src/components/charts/GlucoseChart.tsx` - Line chart for CGM readings
- `src/components/charts/BloodPressureChart.tsx` - BP trends over time
- `src/components/charts/CorrelationView.tsx` - Meal → glucose correlations
- `src/components/charts/ProgressDashboard.tsx` - Summary cards
- `src/components/views/AnalyticsView.tsx` - New analytics tab

### Dependencies
```bash
npm install recharts
# OR
npm install chart.js react-chartjs-2
```

### Data Sources
- Existing: `loadTracking()` from tracking sheet
- Existing: `loadMetricsWeekly()` from metrics sheet
- Existing: Calendar data for meal correlations

### Integration Points
- Add new tab "Analytics" to `NavTabs.tsx`
- Import `AnalyticsView` in `src/app/page.tsx`

### Tasks
- [ ] Install charting library (Recharts recommended)
- [ ] Create GlucoseChart component with 7-day and 30-day views
- [ ] Create BloodPressureChart with high/low trends
- [ ] Build CorrelationView linking meals to glucose spikes
- [ ] Design ProgressDashboard with metric cards
- [ ] Create main AnalyticsView container
- [ ] Add "Analytics" tab to navigation
- [ ] Implement date range selector
- [ ] Add export chart as image feature

### API Contract
```typescript
// Export from src/lib/analytics.ts
export type GlucoseReading = {
  date: string;
  fasting: number | null;
  postBreakfast: number | null;
  postLunch: number | null;
  postDinner: number | null;
  bedtime: number | null;
};

export type BPReading = {
  date: string;
  systolic: number | null;
  diastolic: number | null;
};

export function parseTrackingForCharts(rows: TrackingRow[]): {
  glucose: GlucoseReading[];
  bp: BPReading[];
};
```

### Priority
**High** - Provides immediate value for health tracking

---

## 🛒 Vertical 2: Grocery Management Enhancement

### Owner
Agent working on branch: `feature/grocery-enhancements`

### Scope
Enhanced grocery features: export, organization, pantry tracking, shopping mode.

### Components to Modify
- `src/components/views/GroceriesView.tsx` - Add new features
- Create `src/components/grocery/ExportMenu.tsx`
- Create `src/components/grocery/PantryManager.tsx`
- Create `src/components/grocery/ShoppingMode.tsx`

### New Files
- `src/lib/grocery-export.ts` - PDF/text export utilities
- `src/lib/pantry-storage.ts` - LocalStorage management for pantry

### Dependencies
```bash
npm install jspdf
npm install @react-pdf/renderer
```

### Features

#### 2.1: Export Functionality
- PDF export with formatted list
- Plain text for SMS/notes apps
- Email-ready format
- Print-optimized view

#### 2.2: Store Organization
- Reorder items by store sections
- Save custom store layouts to localStorage
- Common layouts: Produce → Dairy → Meat → Pantry → Frozen

#### 2.3: Pantry Inventory
- Mark items as "in pantry"
- Filter out already-owned items from list
- Expiration warnings (optional)
- Quick-add common staples

#### 2.4: Shopping Mode
- Full-screen mobile checklist
- Large touch targets
- "Check all in category" button
- Running total (if prices added)

### Tasks
- [ ] Create export menu with PDF/text/email options
- [ ] Implement jsPDF export with nice formatting
- [ ] Build store organization UI with drag-drop reordering
- [ ] Create pantry storage system using localStorage
- [ ] Add "In Pantry" toggle to grocery items
- [ ] Build shopping mode fullscreen view
- [ ] Add quantity editing inline
- [ ] Implement store layout presets
- [ ] Add optional price tracking per item

### API Contract
```typescript
// Export from src/lib/grocery-export.ts
export async function exportGroceriesToPDF(
  items: GroceryRow[],
  week: string
): Promise<Blob>;

export function exportGroceriesToText(items: GroceryRow[]): string;

// Export from src/lib/pantry-storage.ts
export type PantryItem = {
  item: string;
  quantity: string;
  addedDate: string;
  expirationDate?: string;
};

export function getPantryItems(): PantryItem[];
export function addToPantry(item: PantryItem): void;
export function removeFromPantry(itemName: string): void;
```

### Priority
**High** - Quick wins with immediate UX improvements

---

## 🍳 Vertical 3: Recipe Intelligence

### Owner
Agent working on branch: `feature/recipe-intelligence`

### Scope
Smart recipe features: substitutions, scaling, variations, nutrition info.

### Components to Modify
- `src/components/RecipeModal.tsx` (currently in TodayView, should extract)
- `src/lib/recipes.ts` - Extend Recipe type

### New Components
- `src/components/recipe/SubstitutionSuggester.tsx`
- `src/components/recipe/ServingScaler.tsx`
- `src/components/recipe/NutritionPanel.tsx`
- `src/components/recipe/VariationsTab.tsx`

### Dependencies
```bash
npm install fraction.js  # For scaling fractions like "1/2 cup"
# Optional: nutrition API integration
```

### Features

#### 3.1: Ingredient Substitutions
- Common substitutions database
- Allergy-safe alternatives
- Dietary restriction filters
- "Why this sub?" explanations

#### 3.2: Serving Scaler
- Adjust recipe from 4 to 2, 6, 8, etc.
- Smart fraction conversion (1/2 cup × 2 = 1 cup)
- Preserve measurement units
- Scale cooking times (approximate)

#### 3.3: Recipe Variations
- Same base, different cuisines
- "Leftover ideas" section
- "Make it faster" options
- "Extra veggies" suggestions

#### 3.4: Nutrition Information
- Calories per serving
- Macros (protein, carbs, fat, fiber)
- Sodium content (important for BP)
- Glycemic load estimate

### Tasks
- [ ] Extract RecipeModal to standalone component
- [ ] Create substitutions database (JSON/TypeScript map)
- [ ] Build SubstitutionSuggester UI
- [ ] Implement ServingScaler with Fraction.js
- [ ] Add scaler UI to recipe modal
- [ ] Create nutrition calculator (manual or API)
- [ ] Design NutritionPanel component
- [ ] Add recipe variations field to Recipe type
- [ ] Build VariationsTab in modal
- [ ] Extend Google Sheet schema for variations (optional)

### API Contract
```typescript
// Extend src/lib/recipes.ts
export type Recipe = {
  id: string;
  title: string;
  serves: number;
  ingredients: string[];
  steps: string[];
  health: string[];
  cuisine?: string;
  tags?: string[];

  // NEW FIELDS
  substitutions?: Record<string, string[]>; // "chicken" → ["tofu", "tempeh"]
  variations?: RecipeVariation[];
  nutrition?: NutritionInfo;
};

export type RecipeVariation = {
  name: string; // "Italian Style"
  changes: string[]; // ["Add basil", "Use olive oil"]
};

export type NutritionInfo = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sodium: number;
};

export function scaleRecipe(
  recipe: Recipe,
  newServings: number
): Recipe;

export function getSubstitutions(
  ingredient: string
): string[];
```

### Priority
**Medium** - Valuable but non-blocking

---

## 👥 Vertical 4: User Profiles & Personalization

### Owner
Agent working on branch: `feature/user-profiles`

### Scope
Multi-user support with individual preferences, goals, and views.

### Components to Create
- `src/components/profiles/ProfileSelector.tsx` - Header dropdown
- `src/components/profiles/ProfileManager.tsx` - Settings page
- `src/components/profiles/GoalsPanel.tsx` - Individual health goals
- `src/components/modals/ProfileSetupModal.tsx` - First-time setup

### New Files
- `src/lib/profiles.ts` - Profile management
- `src/lib/profile-storage.ts` - LocalStorage CRUD
- `src/contexts/ProfileContext.tsx` - React Context for active profile

### Features

#### 4.1: Profile System
- Create/edit/delete profiles
- Profile properties: name, role (adult/child), avatar
- Health goals per profile
- Dietary restrictions
- Favorite recipes

#### 4.2: Personalized Views
- Filter tracking data by profile
- "My Tasks" vs "All Tasks" in Prep view
- Recipe recommendations based on favorites
- Customizable dashboard

#### 4.3: Achievements & Streaks
- Track adherence (days on plan)
- Health milestones (glucose in range for 7 days)
- Recipe variety goals
- Hydration streaks

### Tasks
- [ ] Design Profile data structure
- [ ] Create profile storage with localStorage
- [ ] Build ProfileContext provider
- [ ] Wrap app in ProfileContext
- [ ] Create ProfileSelector dropdown in header
- [ ] Build ProfileManager settings page
- [ ] Add "Profiles" tab or modal
- [ ] Implement profile filtering in TrackingView
- [ ] Add "My Tasks" filter to PrepView
- [ ] Create GoalsPanel component
- [ ] Build achievement tracking logic
- [ ] Design achievement badges/UI
- [ ] Add profile setup wizard for first run

### API Contract
```typescript
// Export from src/lib/profiles.ts
export type Profile = {
  id: string;
  name: string;
  role: "adult" | "child";
  avatar?: string;
  healthGoals: {
    glucoseTarget?: { min: number; max: number };
    bpTarget?: { systolic: number; diastolic: number };
    calorieTarget?: number;
  };
  dietaryRestrictions: string[]; // ["dairy-free", "nut-free"]
  favoriteRecipes: string[]; // Recipe IDs
  achievements: Achievement[];
};

export type Achievement = {
  id: string;
  title: string;
  earnedDate: string;
  icon: string;
};

export function getProfiles(): Profile[];
export function addProfile(profile: Profile): void;
export function updateProfile(id: string, updates: Partial<Profile>): void;
export function deleteProfile(id: string): void;
export function getActiveProfile(): Profile | null;
export function setActiveProfile(id: string): void;
```

### Integration Points
- Wrap `src/app/page.tsx` in `<ProfileProvider>`
- Add ProfileSelector to header
- Filter TrackingView, PrepView by active profile

### Priority
**Medium** - Foundational but requires coordination

---

## 🤖 Vertical 5: Meal Planning Intelligence

### Owner
Agent working on branch: `feature/meal-planning-ai`

### Scope
Smart meal suggestions, planning assistant, recipe discovery, CGM awareness.

### Components to Create
- `src/components/views/PlannerView.tsx` - New planning interface
- `src/components/planner/WeeklyPlanner.tsx` - Drag-drop calendar
- `src/components/planner/MealSuggester.tsx` - Recommendation engine
- `src/components/planner/VarietyChecker.tsx` - Nutrition balance widget
- `src/components/planner/IngredientSearch.tsx` - "What can I make with..."

### New Files
- `src/lib/meal-recommender.ts` - Recommendation logic
- `src/lib/variety-analyzer.ts` - Meal diversity scoring
- `src/lib/cgm-correlations.ts` - Glucose response analysis

### Features

#### 5.1: Auto-Suggest Meals
- Based on past favorites (frequency tracking)
- Seasonal ingredient awareness
- Health goal alignment
- Variety enforcement

#### 5.2: Batch Cooking Optimizer
- "Cook Sunday for Mon-Wed" suggestions
- Leftover utilization
- Minimize total cook time
- One-pot meal grouping

#### 5.3: Variety Checker
- Protein diversity score
- Vegetable variety tracker
- Cuisine rotation
- Alert: "Same protein 5 days in a row"

#### 5.4: CGM-Aware Suggestions
- Learn from glucose responses
- "Rice spiked you yesterday, try cauliflower rice"
- Time-of-day patterns
- Meal combination insights

#### 5.5: Recipe Discovery
- Search by ingredients on hand
- "I have chicken and broccoli"
- Filter by prep time
- Exclude allergens

#### 5.6: Planning Mode
- Drag-drop meal rearrangement
- Copy week template
- Bulk assign recipes
- Export to calendar

### Tasks
- [ ] Create PlannerView container
- [ ] Build WeeklyPlanner with react-dnd for drag-drop
- [ ] Implement meal frequency tracking
- [ ] Create recommendation scoring algorithm
- [ ] Build MealSuggester UI with top 5 suggestions
- [ ] Create VarietyChecker analyzer
- [ ] Implement protein/veggie diversity scoring
- [ ] Build CGM correlation analyzer
- [ ] Create glucose response learning system
- [ ] Build IngredientSearch component
- [ ] Implement ingredient-based recipe filtering
- [ ] Add batch cooking optimizer logic
- [ ] Create planning mode calendar editor
- [ ] Add "Save plan to calendar" feature
- [ ] Integrate with existing Calendar view

### Dependencies
```bash
npm install react-beautiful-dnd  # Drag and drop
# OR
npm install @dnd-kit/core @dnd-kit/sortable
```

### API Contract
```typescript
// Export from src/lib/meal-recommender.ts
export type MealRecommendation = {
  recipe: Recipe;
  score: number;
  reasons: string[]; // ["Favorite", "Good glucose response", "Haven't had in 2 weeks"]
};

export function recommendMeals(
  context: {
    recentMeals: CalendarRow[];
    glucoseHistory: TrackingRow[];
    profile: Profile;
    date: string;
  },
  count: number
): MealRecommendation[];

// Export from src/lib/variety-analyzer.ts
export type VarietyScore = {
  proteinDiversity: number; // 0-100
  veggieDiversity: number;
  cuisineDiversity: number;
  warnings: string[];
};

export function analyzeWeekVariety(
  week: CalendarRow[]
): VarietyScore;

// Export from src/lib/cgm-correlations.ts
export type GlucoseResponse = {
  meal: string;
  avgSpike: number;
  occurrences: number;
  lastDate: string;
};

export function correlateMealsToGlucose(
  calendar: CalendarRow[],
  tracking: TrackingRow[]
): GlucoseResponse[];
```

### Integration Points
- Add "Planner" tab to NavTabs
- Import PlannerView in page.tsx
- Share recipe data with existing views
- Optionally write back to Google Sheets

### Priority
**Low-Medium** - High value but complex, can build incrementally

---

## 🔧 Cross-Cutting Concerns

### All Verticals Should Consider

#### Testing
- Add unit tests for utility functions
- Component tests for new UI
- Integration tests for data flow

#### Accessibility
- ARIA labels for all interactive elements
- Keyboard navigation
- Screen reader support
- Color contrast compliance

#### Mobile Responsive
- Test on mobile viewports
- Touch-friendly targets (min 44x44px)
- Optimize charts for small screens

#### Performance
- Lazy load heavy components
- Memoize expensive calculations
- Virtualize long lists
- Code splitting for new routes

#### Error Handling
- Graceful degradation
- User-friendly error messages
- Retry logic for network failures
- Loading states

---

## 📋 Integration Plan

### Phase 1: Independent Development (Weeks 1-2)
All agents work in parallel on separate branches:
- `feature/health-analytics`
- `feature/grocery-enhancements`
- `feature/recipe-intelligence`
- `feature/user-profiles`
- `feature/meal-planning-ai`

### Phase 2: Integration (Week 3)
Merge verticals in order:
1. Merge Grocery Enhancements (least dependencies)
2. Merge Recipe Intelligence (no profile dependency)
3. Merge Health Analytics (uses existing data)
4. Merge User Profiles (infrastructure)
5. Merge Meal Planning (uses profiles + analytics)

### Phase 3: Testing & Polish (Week 4)
- End-to-end testing
- Bug fixes
- Performance optimization
- Documentation updates

---

## 🚀 Getting Started

### For Each Agent

1. **Checkout new branch:**
   ```bash
   git checkout -b feature/your-vertical
   ```

2. **Install dependencies if needed:**
   ```bash
   npm install
   ```

3. **Follow your vertical's task list**

4. **Commit frequently:**
   ```bash
   git add .
   git commit -m "descriptive message"
   ```

5. **Push to remote:**
   ```bash
   git push -u origin feature/your-vertical
   ```

6. **Create PR when ready:**
   - Use vertical name as PR title
   - Reference this document in description
   - Tag for review

---

## 📞 Communication Protocol

### Shared Data Structures
If your vertical needs to modify a shared type:
1. Document the change in `API Contract` section
2. Post in team channel before changing
3. Ensure backward compatibility

### Merge Conflicts
- Vertical 4 (Profiles) may conflict with others
- Coordinate ProfileContext integration
- Use feature flags to toggle features

### Questions
- Document assumptions in code comments
- Open issues for blockers
- Update this doc with decisions

---

## 📊 Success Metrics

**Vertical 1 (Analytics):** Users view charts weekly
**Vertical 2 (Grocery):** 50%+ use export or shopping mode
**Vertical 3 (Recipe):** Scaling used in 30%+ recipe views
**Vertical 4 (Profiles):** 2+ profiles created per household
**Vertical 5 (Planner):** 20%+ weekly plan edits via planner

---

**Last Updated:** 2025-11-06
**Version:** 1.0
**Maintainer:** Development Team
