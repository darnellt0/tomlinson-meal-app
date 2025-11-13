// src/components/health/EditFoods.tsx
"use client";

import * as React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Save, X, Trash2, Plus } from "lucide-react";
import type { DetectedFoodItem } from "@/lib/types";

type EditFoodsProps = {
  items: DetectedFoodItem[];
  onSave: (updatedItems: DetectedFoodItem[]) => void;
  onCancel: () => void;
};

/**
 * Edit Foods screen
 * Allows manual adjustment of detected food items
 */
export function EditFoods({ items, onSave, onCancel }: EditFoodsProps) {
  const [editedItems, setEditedItems] = useState<DetectedFoodItem[]>(items);

  const handleUpdateItem = (index: number, field: "name" | "amount", value: string) => {
    const updated = [...editedItems];
    updated[index] = { ...updated[index], [field]: value };
    setEditedItems(updated);
  };

  const handleRemoveItem = (index: number) => {
    const updated = editedItems.filter((_, i) => i !== index);
    setEditedItems(updated);
  };

  const handleAddItem = () => {
    const newItem: DetectedFoodItem = {
      name: "",
      amount: "",
      confidence: 1.0,
      nutrition: {
        calories: 0,
        protein: 0,
        fat: 0,
        carbs: 0,
      },
    };
    setEditedItems([...editedItems, newItem]);
  };

  const handleSave = () => {
    // Filter out empty items
    const validItems = editedItems.filter((item) => item.name.trim() !== "");
    onSave(validItems);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-xl font-semibold flex items-center gap-2">
          <Save className="w-5 h-5" />
          Edit Foods
        </DialogTitle>
      </DialogHeader>

      <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
        {editedItems.map((item, index) => (
          <div key={index} className="flex gap-2 items-start p-3 bg-gray-50 rounded-lg border">
            <div className="flex-1 grid gap-2">
              <Input
                value={item.name}
                onChange={(e) => handleUpdateItem(index, "name", e.target.value)}
                placeholder="Food name"
                className="font-medium"
              />
              <Input
                value={item.amount}
                onChange={(e) => handleUpdateItem(index, "amount", e.target.value)}
                placeholder="Amount (e.g., 6 oz, 1 cup)"
                className="text-sm"
              />
              {item.nutrition && (
                <div className="text-xs text-gray-500 px-2">
                  {item.nutrition.calories} cal • {item.nutrition.protein}g protein •{" "}
                  {item.nutrition.fat}g fat • {item.nutrition.carbs}g carbs
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleRemoveItem(index)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}

        <Button variant="outline" onClick={handleAddItem} className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Add Food Item
        </Button>

        {/* Note about nutrition recalculation */}
        <p className="text-xs text-gray-500 text-center mt-2">
          Note: Nutrition values are estimates. For manual entries, add approximate amounts.
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end pt-2">
        <Button variant="outline" onClick={onCancel}>
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
        <Button onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>
    </>
  );
}
