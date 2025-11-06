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
