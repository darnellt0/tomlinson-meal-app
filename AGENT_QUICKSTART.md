# Agent Quick Start Guide

## 🎯 Choose Your Vertical

Pick one vertical to work on. Each is independent and can be developed in parallel.

| Vertical | Complexity | Priority | Est. Time |
|----------|-----------|----------|-----------|
| **1. Health Analytics** | Medium | High | 3-5 days |
| **2. Grocery Enhancements** | Low | High | 2-3 days |
| **3. Recipe Intelligence** | Medium | Medium | 4-6 days |
| **4. User Profiles** | High | Medium | 5-7 days |
| **5. Meal Planning AI** | High | Low-Med | 7-10 days |

## ⚡ Quick Start (Any Vertical)

### 1. Set Up Branch
```bash
# Example for Vertical 1
git checkout -b feature/health-analytics

# Ensure dependencies are installed
npm install
```

### 2. Read Your Specification
```bash
# Open the main document
cat DEVELOPMENT_VERTICALS.md
```

### 3. Check Current State
```bash
# See existing views
ls src/components/views/

# See existing types
cat src/lib/types.ts

# See existing loaders
cat src/lib/loaders.ts
```

### 4. Create Your Components
Each vertical has a clear component list. Example:

**Vertical 1:** Create these files:
- `src/components/charts/GlucoseChart.tsx`
- `src/components/charts/BloodPressureChart.tsx`
- `src/components/views/AnalyticsView.tsx`

### 5. Install Dependencies (If Needed)
```bash
# Vertical 1
npm install recharts

# Vertical 2
npm install jspdf

# Vertical 3
npm install fraction.js

# Vertical 5
npm install react-beautiful-dnd
```

### 6. Test Locally
```bash
# Type check
npx tsc --noEmit

# Lint
npx next lint

# Run dev server (requires network for Google Fonts)
npm run dev
```

### 7. Commit & Push
```bash
git add .
git commit -m "Add [feature name]"
git push -u origin feature/your-vertical
```

## 📦 Common Patterns

### Adding a New View

1. **Create view component:**
   ```typescript
   // src/components/views/YourView.tsx
   "use client";

   export default function YourView() {
     return (
       <div>
         <h2>Your View</h2>
       </div>
     );
   }
   ```

2. **Import in page.tsx:**
   ```typescript
   import YourView from "@/components/views/YourView";
   ```

3. **Add to NavTabs:**
   ```typescript
   // src/components/NavTabs.tsx
   type TabKey = "today" | "calendar" | ... | "yourview";

   const tabs = [
     // ... existing tabs
     { key: "yourview", label: "Your View" },
   ];
   ```

4. **Add conditional render:**
   ```typescript
   // src/app/page.tsx
   {tab === "yourview" && <YourView />}
   ```

### Using Existing Data Loaders

```typescript
import { loadCalendar, loadTracking, loadGroceries } from "@/lib/loaders";

// In your component
useEffect(() => {
  loadTracking(CSV_URL).then(setData).catch(console.error);
}, []);
```

### Adding New Types

```typescript
// src/lib/types.ts
export type YourNewType = {
  field1: string;
  field2: number | null;
};
```

### Creating Utility Functions

```typescript
// src/lib/your-utils.ts
export function yourHelper(input: string): number {
  // implementation
  return 42;
}
```

## 🔍 Key Files Reference

| File | Purpose |
|------|---------|
| `src/app/page.tsx` | Main app, tab switching, state |
| `src/components/NavTabs.tsx` | Navigation tabs |
| `src/lib/types.ts` | TypeScript type definitions |
| `src/lib/loaders.ts` | Data loading functions |
| `src/lib/sheets.ts` | CSV parsing utilities |
| `src/lib/recipes.ts` | Recipe type & fetching |

## 🚫 What NOT to Touch

To avoid merge conflicts:

- **Don't modify** `src/app/globals.css` unless necessary
- **Don't change** existing Google Sheets URLs
- **Don't rename** existing types without coordination
- **Don't modify** other vertical's files

## ✅ Checklist Before Committing

- [ ] TypeScript compiles (`npx tsc --noEmit`)
- [ ] ESLint passes (`npx next lint`)
- [ ] No console errors in dev mode
- [ ] Mobile responsive (test at 375px width)
- [ ] Loading states implemented
- [ ] Error handling added
- [ ] Comments for complex logic
- [ ] API contract documented (if applicable)

## 🆘 Common Issues

### "Module not found"
```bash
npm install
```

### "Type errors"
Check `src/lib/types.ts` for correct type definitions

### "Google Fonts error in build"
This is a known issue in the sandbox environment. Use `npx tsc --noEmit` to validate instead.

### "Merge conflicts"
Coordinate with other agents if touching shared files like:
- `src/app/page.tsx`
- `src/components/NavTabs.tsx`
- `src/lib/types.ts`

## 🎨 UI Component Library

The app uses Radix UI primitives. Available components:

- `Button` from `@/components/ui/button`
- `Card`, `CardContent` from `@/components/ui/card`
- `Input` from `@/components/ui/input`
- `Select` from `@/components/ui/select`
- `Dialog` from `@/components/ui/dialog`
- `Badge` from `@/components/ui/badge`

Example:
```typescript
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

<Card className="rounded-2xl">
  <CardContent className="p-4">
    <Button variant="default">Click Me</Button>
  </CardContent>
</Card>
```

## 📈 Example: Adding a Simple Chart (Vertical 1)

```typescript
// src/components/charts/GlucoseChart.tsx
"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function GlucoseChart({ data }: { data: any[] }) {
  return (
    <LineChart width={600} height={300} data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="date" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Line type="monotone" dataKey="fasting" stroke="#8884d8" />
      <Line type="monotone" dataKey="postMeal" stroke="#82ca9d" />
    </LineChart>
  );
}
```

## 🎯 Success Criteria

Your vertical is complete when:

1. ✅ All tasks in your vertical checklist are done
2. ✅ TypeScript compiles without errors
3. ✅ ESLint shows no warnings
4. ✅ UI is mobile responsive
5. ✅ Loading and error states work
6. ✅ Changes are committed and pushed
7. ✅ API contracts are documented
8. ✅ Integration points are clear

## 🤝 Need Help?

1. Check `DEVELOPMENT_VERTICALS.md` for detailed specs
2. Review existing similar components for patterns
3. Check Git history for recent changes: `git log --oneline`
4. Look at types: `cat src/lib/types.ts`

---

**Ready to start?** Pick your vertical and begin! 🚀
