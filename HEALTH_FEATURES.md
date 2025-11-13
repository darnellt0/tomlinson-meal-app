# Health & Nutrition Tracking Features

## 🎯 Product Philosophy

**Meal Planning First, Tracking Second**

This app is **primarily a meal planner** to answer "What's for dinner tonight?" for the Tomlinson family. Health tracking features are designed to be:

- ✅ **Supportive** - Enhance meal planning, don't complicate it
- ✅ **Optional** - App works perfectly without using health features
- ✅ **Mode-Aware** - Whole30 mode hides calorie counts, Post-Whole30 shows them
- ✅ **Non-Intrusive** - Health data appears in secondary panels, not on main planning screens

## 📁 File Structure

```
src/
├── lib/
│   ├── types.ts                   # All TypeScript types (including health types)
│   ├── health.ts                  # Health calculation engine (BMR, TDEE, macros)
│   ├── health-mock-data.ts        # Family profiles, mock data, localStorage helpers
│   ├── nutrition.ts               # Nutrition API scaffolding (photo analysis, recipe lookup)
│   └── __tests__/
│       └── health.test.ts         # Unit tests for health calculations
│
├── components/
│   └── health/
│       ├── SnapMealFlow.tsx       # Main photo meal logging flow orchestrator
│       ├── CameraScreen.tsx       # Photo capture/upload screen
│       ├── RecognitionReview.tsx  # AI-detected foods review screen
│       ├── EditFoods.tsx          # Manual food editing screen
│       └── SnapMealButton.tsx     # Floating button to trigger photo flow
```

## 🔧 Core Features

### 1. Health Calculation Engine (`lib/health.ts`)

Pure calculation functions with no UI dependencies:

- **BMR Calculation** - Mifflin-St Jeor equation for basal metabolic rate
- **TDEE Calculation** - Total daily energy expenditure with activity multipliers
- **Calorie Goals** - Target calories for maintain/deficit/surplus
- **Macro Calculation** - Protein/fat/carbs in grams from calorie targets
- **Portion Scaling** - Adjust nutrition for different serving sizes
- **Safety Validation** - Warns about unsafe calorie targets

**Example Usage:**

```typescript
import { calculateBMR, calculateTDEE, generateCalorieGoals } from "@/lib/health";
import { DEFAULT_PROFILES } from "@/lib/health-mock-data";

const profile = DEFAULT_PROFILES.darnell;
const bmr = calculateBMR(profile); // 1780 kcal
const tdee = calculateTDEE(profile, bmr); // 2759 kcal (moderate activity)
const goals = generateCalorieGoals(profile, weightGoals); // Complete calorie & macro goals
```

### 2. Nutrition API Scaffolding (`lib/nutrition.ts`)

Mock implementations ready to swap with real APIs:

- **Photo Analysis** - `analyzeMealPhoto()` - Returns mock detected foods (Phase 1)
- **Recipe Nutrition** - `analyzeRecipe()` - Returns mock nutrition for recipes
- **Food Search** - `searchFood()` - Mock food database search

**Phase 2 Integration Plan:**

- Clarifai / Google Vision for photo recognition
- Edamam / USDA for nutrition lookup
- See detailed API notes in `lib/nutrition.ts`

### 3. Snap & Log Photo Flow (`components/health/`)

Complete UX for photo-based meal logging:

1. **CameraScreen** - Upload photo from device or camera
2. **RecognitionReview** - Show detected foods + nutrition estimate
3. **EditFoods** - Manual adjustment of detected items
4. **Confirmation** - Save meal log

**Integration:**

```tsx
import { SnapMealButton } from "@/components/health/SnapMealButton";

// Add to any view (e.g., TodayView)
<SnapMealButton />
```

## 👤 Family Profiles

Three pre-configured profiles in `lib/health-mock-data.ts`:

### Mom
- Diabetic, Libre CGM connected
- Focus: Blood sugar management
- Whole30 compliant recipes

### Shria
- High blood pressure, Fitbit connected
- Focus: Heart-healthy, low sodium
- Activity tracking

### Darnell
- Whole30 → Post-Whole30 transition
- Focus: Sustainable weight loss, bold flavors
- No plantains, loves Instant Pot recipes

## 🔄 Eating Modes

### Whole30 Mode
- Calorie tracking **hidden** or **soft**
- Focus on food quality, not quantity
- Compliance badges on recipes
- Day counter (Day X of 30)

### Post-Whole30 Mode
- Calorie tracking **visible** and helpful
- Macro breakdowns shown
- Weight goals active
- Messaging: "Maintain your Whole30 wins"

## 🧪 Testing

Run unit tests:

```bash
npm test src/lib/__tests__/health.test.ts
```

**Coverage:**
- BMR/TDEE calculations
- Calorie deficit/surplus logic
- Macro calculations
- Daily nutrition aggregation
- Safety validators

## 🚦 Guardrails & Safety

**Before ANY UI Changes:**

✅ **Check:** Does this keep meal planning as the primary experience?
✅ **Check:** Is health data in a secondary panel / expandable section?
✅ **Check:** Does the app work perfectly if user never opens Health tab?
✅ **Check:** Does Whole30 mode hide/soften calorie emphasis?

**Safety Checks in Code:**

- Minimum safe calories: 1200 (women), 1500 (men)
- Maximum safe deficit: 1 kg/week
- Warnings for aggressive goals
- Disclaimers on all nutrition estimates

## 🚀 Next Steps (Future Phases)

### Phase 2: Real API Integration
- [ ] Connect Edamam Recipe Analysis API
- [ ] Add Clarifai photo recognition
- [ ] Implement USDA food database search
- [ ] Add caching layer to reduce API costs

### Phase 3: Device Integration
- [ ] Libre CGM data sync (Mom's glucose trends)
- [ ] Fitbit data sync (Shria's activity + heart rate)
- [ ] Weight scale Bluetooth integration

### Phase 4: Advanced Features
- [ ] Weekly meal prep optimization
- [ ] Grocery list auto-generation from meal plan
- [ ] Recipe recommendations based on health goals
- [ ] Family meal log sharing

## 📝 Important Notes

1. **All nutrition data is estimates** - Always show disclaimers
2. **Not medical advice** - Include standard health disclaimers
3. **User privacy** - Health data stays local (localStorage) in Phase 1
4. **Graceful degradation** - App works without nutrition data
5. **Mode-aware UI** - Always check `eatingMode` before showing calories

## 🔗 Resources

- Mifflin-St Jeor BMR Equation: [Research](https://pubmed.ncbi.nlm.nih.gov/2305711/)
- USDA FoodData Central: [API Docs](https://fdc.nal.usda.gov/api-guide.html)
- Edamam Nutrition API: [Docs](https://www.edamam.com/)
- Whole30 Program: [Official Site](https://whole30.com/)

---

**Remember:** The best health tracking feature is one the user doesn't notice until they want it. Keep it simple, supportive, and secondary to the core dinner planning experience.
