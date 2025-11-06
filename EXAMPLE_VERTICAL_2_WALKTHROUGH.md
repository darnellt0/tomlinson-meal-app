# Example: Vertical 2 Walkthrough

## 🛒 Grocery Management Enhancement - Step-by-Step Guide

This document shows exactly how an agent would implement Vertical 2 from start to finish.

**Why start here?**
- Fewest dependencies
- Clear, focused scope
- Quick wins
- Least conflict risk

---

## Step 1: Setup (5 minutes)

```bash
# Create and switch to feature branch
git checkout -b feature/grocery-enhancements

# Install dependencies
npm install jspdf

# Verify setup
npm run dev  # (may fail due to Google Fonts - that's OK)
npx tsc --noEmit  # Should pass
```

---

## Step 2: Understand Current State (10 minutes)

### Read Existing GroceriesView
```bash
cat src/components/views/GroceriesView.tsx
```

**Key observations:**
- Uses `loadGroceries()` from loaders
- Has week selector (Week 1-4)
- Groups items by category
- Has checkbox state management
- Already mobile responsive

**Current structure:**
```typescript
export default function GroceriesView({ searchQuery = "" }: { searchQuery?: string }) {
  const [week, setWeek] = useState<string>("Week 1");
  const [rows, setRows] = useState<GroceryRow[]>([]);
  const [checked, setChecked] = useState<Record<number, boolean>>({});

  // Fetches data, filters by search, groups by category
  // Renders: Week selector + Category cards with checkboxes
}
```

---

## Step 3: Create Export Functionality (1-2 hours)

### 3.1: Create export utility file

Create `src/lib/grocery-export.ts`:

```typescript
// src/lib/grocery-export.ts
import { jsPDF } from "jspdf";
import type { GroceryRow } from "./types";

/**
 * Export groceries to PDF format
 */
export async function exportGroceriesToPDF(
  items: GroceryRow[],
  week: string
): Promise<Blob> {
  const doc = new jsPDF();

  // Title
  doc.setFontSize(20);
  doc.text(`Grocery List - ${week}`, 20, 20);

  // Group by category
  const grouped: Record<string, GroceryRow[]> = {};
  items.forEach((item) => {
    const cat = item.Category || "Other";
    grouped[cat] = grouped[cat] || [];
    grouped[cat].push(item);
  });

  let y = 40;

  // Render each category
  Object.entries(grouped).forEach(([category, catItems]) => {
    // Category header
    doc.setFontSize(14);
    doc.setFont(undefined, "bold");
    doc.text(category, 20, y);
    y += 8;

    // Items
    doc.setFontSize(10);
    doc.setFont(undefined, "normal");
    catItems.forEach((item) => {
      const line = `☐ ${item.Item} ${item.Quantity || ""}`;
      doc.text(line, 25, y);
      y += 6;

      // Add notes if present
      if (item.Notes) {
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.text(`    ${item.Notes}`, 25, y);
        y += 5;
        doc.setFontSize(10);
        doc.setTextColor(0);
      }

      // New page if needed
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
    });

    y += 10; // Space between categories
  });

  return doc.output("blob");
}

/**
 * Export groceries to plain text format
 */
export function exportGroceriesToText(items: GroceryRow[]): string {
  const grouped: Record<string, GroceryRow[]> = {};
  items.forEach((item) => {
    const cat = item.Category || "Other";
    grouped[cat] = grouped[cat] || [];
    grouped[cat].push(item);
  });

  let text = "GROCERY LIST\n\n";

  Object.entries(grouped).forEach(([category, catItems]) => {
    text += `${category.toUpperCase()}\n`;
    text += "─".repeat(category.length) + "\n";

    catItems.forEach((item) => {
      text += `☐ ${item.Item}`;
      if (item.Quantity) text += ` - ${item.Quantity}`;
      text += "\n";
      if (item.Notes) text += `  Note: ${item.Notes}\n`;
    });

    text += "\n";
  });

  return text;
}

/**
 * Export groceries for email (formatted HTML)
 */
export function exportGroceriesToEmail(items: GroceryRow[]): string {
  const grouped: Record<string, GroceryRow[]> = {};
  items.forEach((item) => {
    const cat = item.Category || "Other";
    grouped[cat] = grouped[cat] || [];
    grouped[cat].push(item);
  });

  let html = '<div style="font-family: sans-serif; max-width: 600px;">';
  html += '<h2>Grocery List</h2>';

  Object.entries(grouped).forEach(([category, catItems]) => {
    html += `<h3 style="margin-top: 20px; border-bottom: 2px solid #333;">${category}</h3>`;
    html += '<ul style="list-style: none; padding-left: 0;">';

    catItems.forEach((item) => {
      html += '<li style="margin: 8px 0;">';
      html += `<input type="checkbox" style="margin-right: 8px;">`;
      html += `<strong>${item.Item}</strong>`;
      if (item.Quantity) html += ` - ${item.Quantity}`;
      if (item.Notes) html += `<br><small style="color: #666; margin-left: 24px;">${item.Notes}</small>`;
      html += '</li>';
    });

    html += '</ul>';
  });

  html += '</div>';
  return html;
}
```

### 3.2: Create Export Menu Component

Create `src/components/grocery/ExportMenu.tsx`:

```typescript
// src/components/grocery/ExportMenu.tsx
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Download, FileText, Mail, Printer } from "lucide-react";
import type { GroceryRow } from "@/lib/types";
import {
  exportGroceriesToPDF,
  exportGroceriesToText,
  exportGroceriesToEmail,
} from "@/lib/grocery-export";

export function ExportMenu({
  items,
  week,
}: {
  items: GroceryRow[];
  week: string;
}) {
  const [loading, setLoading] = React.useState(false);

  const handlePDFExport = async () => {
    setLoading(true);
    try {
      const blob = await exportGroceriesToPDF(items, week);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `grocery-list-${week.toLowerCase().replace(" ", "-")}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF export failed:", err);
      alert("Failed to export PDF. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleTextExport = () => {
    const text = exportGroceriesToText(items);
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `grocery-list-${week.toLowerCase().replace(" ", "-")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleEmailExport = () => {
    const html = exportGroceriesToEmail(items);
    const subject = `Grocery List - ${week}`;
    const body = encodeURIComponent(html);
    window.open(`mailto:?subject=${subject}&body=${body}`, "_blank");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex gap-2 flex-wrap">
      <Button
        variant="outline"
        size="sm"
        onClick={handlePDFExport}
        disabled={loading}
        className="gap-2"
      >
        <Download className="w-4 h-4" />
        PDF
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleTextExport}
        className="gap-2"
      >
        <FileText className="w-4 h-4" />
        Text
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleEmailExport}
        className="gap-2"
      >
        <Mail className="w-4 h-4" />
        Email
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handlePrint}
        className="gap-2"
      >
        <Printer className="w-4 h-4" />
        Print
      </Button>
    </div>
  );
}
```

### 3.3: Add to GroceriesView

Modify `src/components/views/GroceriesView.tsx`:

```typescript
// Add import at top
import { ExportMenu } from "@/components/grocery/ExportMenu";

// Add in the render, after the week selector:
<div className="flex items-center gap-2">
  <div className="text-sm text-gray-600">Select week:</div>
  <Select value={week} onValueChange={setWeek}>
    {/* ... existing code ... */}
  </Select>

  {/* NEW: Export menu */}
  {!loading && !err && rows.length > 0 && (
    <ExportMenu items={filteredRows} week={week} />
  )}
</div>
```

**Test:**
```bash
npx tsc --noEmit  # Should pass
```

---

## Step 4: Add Pantry Management (1-2 hours)

### 4.1: Create pantry storage utility

Create `src/lib/pantry-storage.ts`:

```typescript
// src/lib/pantry-storage.ts

export type PantryItem = {
  item: string;
  quantity: string;
  addedDate: string;
  expirationDate?: string;
};

const STORAGE_KEY = "tomlinson_pantry";

export function getPantryItems(): PantryItem[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function addToPantry(item: PantryItem): void {
  const items = getPantryItems();
  items.push(item);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function removeFromPantry(itemName: string): void {
  const items = getPantryItems().filter((i) => i.item !== itemName);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function isInPantry(itemName: string): boolean {
  return getPantryItems().some(
    (i) => i.item.toLowerCase() === itemName.toLowerCase()
  );
}

export function clearPantry(): void {
  localStorage.removeItem(STORAGE_KEY);
}
```

### 4.2: Add "In Pantry" toggle to GroceriesView

Modify `src/components/views/GroceriesView.tsx`:

```typescript
// Add imports
import { isInPantry, addToPantry, removeFromPantry } from "@/lib/pantry-storage";
import { Package } from "lucide-react";

// Add state
const [showPantryItems, setShowPantryItems] = useState(true);

// Add pantry toggle handler
const handlePantryToggle = (itemName: string) => {
  if (isInPantry(itemName)) {
    removeFromPantry(itemName);
  } else {
    addToPantry({
      item: itemName,
      quantity: "",
      addedDate: new Date().toISOString(),
    });
  }
  // Force re-render
  setChecked({ ...checked });
};

// Filter items based on pantry preference
const displayRows = filteredRows.filter((r) => {
  if (showPantryItems) return true;
  return !isInPantry(r.Item || "");
});

// In render, add toggle before categories
<div className="flex items-center gap-2 mb-4">
  <input
    type="checkbox"
    id="show-pantry"
    checked={showPantryItems}
    onChange={(e) => setShowPantryItems(e.target.checked)}
  />
  <label htmlFor="show-pantry" className="text-sm cursor-pointer">
    Show items already in pantry
  </label>
</div>

// In item rendering, add pantry indicator
<label key={id} className="flex items-start gap-2">
  <input
    type="checkbox"
    checked={checked[idx] || false}
    onChange={(e) => setChecked({ ...checked, [idx]: e.target.checked })}
  />
  <span className={checked[idx] ? "line-through" : ""}>
    {it.Item}
    {it.Quantity && ` - ${it.Quantity}`}
  </span>
  {isInPantry(it.Item || "") && (
    <Package className="w-4 h-4 text-green-600" title="In pantry" />
  )}
  <button
    onClick={() => handlePantryToggle(it.Item || "")}
    className="ml-auto text-xs text-blue-600 hover:underline"
  >
    {isInPantry(it.Item || "") ? "Remove from pantry" : "Add to pantry"}
  </button>
</label>
```

---

## Step 5: Add Shopping Mode (1 hour)

Create `src/components/grocery/ShoppingMode.tsx`:

```typescript
// src/components/grocery/ShoppingMode.tsx
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, Check } from "lucide-react";
import type { GroceryRow } from "@/lib/types";

export function ShoppingMode({
  items,
  week,
  onClose,
}: {
  items: GroceryRow[];
  week: string;
  onClose: () => void;
}) {
  const [checked, setChecked] = React.useState<Record<string, boolean>>({});

  const grouped: Record<string, GroceryRow[]> = {};
  items.forEach((item) => {
    const cat = item.Category || "Other";
    grouped[cat] = grouped[cat] || [];
    grouped[cat].push(item);
  });

  const totalItems = items.length;
  const checkedCount = Object.values(checked).filter(Boolean).length;

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between shadow-sm">
        <div>
          <h2 className="text-xl font-bold">{week} Shopping</h2>
          <p className="text-sm text-gray-600">
            {checkedCount} / {totalItems} items
          </p>
        </div>
        <Button variant="outline" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {Object.entries(grouped).map(([category, catItems]) => (
          <Card key={category}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">{category}</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const newChecked = { ...checked };
                    catItems.forEach((item) => {
                      newChecked[item.Item || ""] = true;
                    });
                    setChecked(newChecked);
                  }}
                >
                  Check All
                </Button>
              </div>

              <div className="space-y-3">
                {catItems.map((item, idx) => {
                  const key = item.Item || `item-${idx}`;
                  const isChecked = checked[key] || false;

                  return (
                    <button
                      key={key}
                      onClick={() =>
                        setChecked({ ...checked, [key]: !isChecked })
                      }
                      className={`
                        w-full text-left p-4 rounded-lg border-2 transition-all
                        ${
                          isChecked
                            ? "bg-green-50 border-green-500"
                            : "bg-white border-gray-200 hover:border-gray-300"
                        }
                      `}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`
                          w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                          ${
                            isChecked
                              ? "bg-green-500 text-white"
                              : "bg-gray-100"
                          }
                        `}
                        >
                          {isChecked && <Check className="w-5 h-5" />}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-base font-medium ${
                              isChecked ? "line-through text-gray-500" : ""
                            }`}
                          >
                            {item.Item}
                          </p>
                          {item.Quantity && (
                            <p className="text-sm text-gray-600 mt-1">
                              {item.Quantity}
                            </p>
                          )}
                          {item.Notes && (
                            <p className="text-xs text-gray-500 mt-1">
                              {item.Notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Progress footer */}
      <div className="sticky bottom-0 bg-white border-t p-4 shadow-lg">
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-green-500 h-3 rounded-full transition-all"
            style={{ width: `${(checkedCount / totalItems) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
```

Add to GroceriesView:

```typescript
// Add import and state
import { ShoppingMode } from "@/components/grocery/ShoppingMode";
const [shoppingMode, setShoppingMode] = useState(false);

// Add button near export menu
<Button onClick={() => setShoppingMode(true)}>
  Shopping Mode
</Button>

// Add at end of component
{shoppingMode && (
  <ShoppingMode
    items={filteredRows}
    week={week}
    onClose={() => setShoppingMode(false)}
  />
)}
```

---

## Step 6: Test Everything (30 minutes)

```bash
# Type check
npx tsc --noEmit

# Lint
npx next lint

# Manual testing checklist:
# [ ] Export to PDF works
# [ ] Export to text works
# [ ] Email export opens mail client
# [ ] Print button triggers print dialog
# [ ] Pantry toggle adds/removes items
# [ ] "Show pantry items" filter works
# [ ] Shopping mode opens fullscreen
# [ ] Shopping mode check items works
# [ ] Shopping mode progress bar updates
# [ ] Shopping mode "Check All" works
# [ ] Mobile responsive (test at 375px)
```

---

## Step 7: Commit & Push (10 minutes)

```bash
# Add all changes
git add .

# Commit with detailed message
git commit -m "Add grocery management enhancements

Features added:
- Export to PDF with formatted lists
- Export to text for notes apps
- Email export with HTML formatting
- Print functionality
- Pantry inventory management with localStorage
- 'In Pantry' toggle for items
- Shopping mode with fullscreen checklist
- Large touch targets for mobile
- Progress tracking in shopping mode
- 'Check all in category' functionality

Technical details:
- Created grocery-export.ts with jsPDF integration
- Created pantry-storage.ts for localStorage management
- Created ExportMenu component
- Created ShoppingMode component
- Enhanced GroceriesView with new features
- All features mobile responsive
- TypeScript strict mode compliant"

# Push to remote
git push -u origin feature/grocery-enhancements
```

---

## Step 8: Create Pull Request

Update `PROJECT_BOARD.md`:

```markdown
### Vertical 2: Grocery Management Enhancement
**Status:** 🟡 Complete - Ready for Review
**Branch:** `feature/grocery-enhancements`
**Owner:** Your-Agent-Name (Completed: 2025-11-06)
**Priority:** High

**Tasks (9/9):** ✅ All complete
```

Commit and push that update.

---

## Estimated Total Time

- **Setup:** 15 min
- **Export functionality:** 1-2 hours
- **Pantry management:** 1-2 hours
- **Shopping mode:** 1 hour
- **Testing:** 30 min
- **Documentation:** 10 min

**Total:** 3-5 hours for a complete, polished vertical

---

## Tips for Success

1. **Test incrementally** - Don't wait until the end
2. **Commit often** - Small, focused commits
3. **Read error messages** - TypeScript errors are helpful
4. **Check mobile** - Use browser dev tools responsive mode
5. **Use existing patterns** - Follow GroceriesView's structure
6. **Ask for help** - If stuck > 30 min, flag it

---

## Next Steps After This Vertical

Once Vertical 2 is complete and merged:
1. Other agents can learn from your patterns
2. You can claim Vertical 3 (Recipe Intelligence)
3. Or help with integration testing

**This vertical serves as a template for how to approach all other verticals!**
