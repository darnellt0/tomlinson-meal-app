// src/components/health/RecognitionReview.tsx
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Check, Edit, X, Image as ImageIcon } from "lucide-react";
import type { PhotoNutritionResponse } from "@/lib/nutrition";
import { formatNutrition } from "@/lib/nutrition";

type RecognitionReviewProps = {
  photoUrl: string;
  result: PhotoNutritionResponse;
  onConfirm: () => void;
  onEdit: () => void;
  onCancel: () => void;
};

/**
 * Recognition Review screen
 * Shows detected foods and nutrition estimate
 * User can confirm or edit before logging
 */
export function RecognitionReview({
  photoUrl,
  result,
  onConfirm,
  onEdit,
  onCancel,
}: RecognitionReviewProps) {
  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-xl font-semibold flex items-center gap-2">
          <ImageIcon className="w-5 h-5" />
          Review Your Meal
        </DialogTitle>
      </DialogHeader>

      <div className="grid gap-6 py-4">
        {/* Photo thumbnail */}
        <div className="flex justify-center">
          <img
            src={photoUrl}
            alt="Your meal"
            className="max-w-full max-h-48 rounded-lg border-2 border-gray-200 object-cover"
          />
        </div>

        {/* Detected foods */}
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            Detected Foods
            <Badge variant="secondary" className="text-xs">
              {Math.round(result.confidence * 100)}% confident
            </Badge>
          </h3>
          <div className="space-y-2">
            {result.detectedItems.map((item, idx) => (
              <div
                key={idx}
                className="flex items-start justify-between p-3 bg-gray-50 rounded-lg border"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="font-medium">{item.name}</span>
                  </div>
                  <div className="text-sm text-gray-600 ml-6">{item.amount}</div>
                  {item.nutrition && (
                    <div className="text-xs text-gray-500 ml-6 mt-1">
                      {formatNutrition(item.nutrition)}
                    </div>
                  )}
                </div>
                {item.confidence && (
                  <Badge variant="outline" className="text-xs ml-2">
                    {Math.round(item.confidence * 100)}%
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Total nutrition estimate */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold mb-2 text-blue-900">Estimated Nutrition</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-2xl font-bold text-blue-900">
                {result.totalNutrition.calories}
              </div>
              <div className="text-sm text-blue-700">calories</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-900">
                {result.totalNutrition.protein}g
              </div>
              <div className="text-sm text-blue-700">protein</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-blue-900">
                {result.totalNutrition.fat}g
              </div>
              <div className="text-sm text-blue-700">fat</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-blue-900">
                {result.totalNutrition.carbs}g
              </div>
              <div className="text-sm text-blue-700">carbs</div>
            </div>
          </div>
          {result.totalNutrition.whole30Compliant && (
            <Badge variant="secondary" className="mt-3">
              Whole30 Compliant ✓
            </Badge>
          )}
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-gray-500 text-center">
          Nutrition estimates are approximate. Edit if needed for accuracy.
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end pt-2">
        <Button variant="outline" onClick={onCancel}>
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
        <Button variant="outline" onClick={onEdit}>
          <Edit className="w-4 h-4 mr-2" />
          Edit Foods
        </Button>
        <Button onClick={onConfirm}>
          <Check className="w-4 h-4 mr-2" />
          Looks Good
        </Button>
      </div>
    </>
  );
}
