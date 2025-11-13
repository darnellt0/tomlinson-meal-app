// src/components/health/SnapMealFlow.tsx
"use client";

import * as React from "react";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CameraScreen } from "./CameraScreen";
import { RecognitionReview } from "./RecognitionReview";
import { EditFoods } from "./EditFoods";
import type { DetectedFoodItem } from "@/lib/types";
import type { PhotoNutritionResponse } from "@/lib/nutrition";
import { analyzeMealPhoto } from "@/lib/nutrition";

type FlowStep = "camera" | "review" | "edit" | "complete";

type SnapMealFlowProps = {
  open: boolean;
  onClose: () => void;
  onComplete: (result: PhotoNutritionResponse) => void;
  mealType?: "breakfast" | "lunch" | "dinner" | "snack";
};

/**
 * Main orchestrator for Snap & Log photo meal flow
 * Manages multi-step process: camera → review → (optional) edit → complete
 */
export function SnapMealFlow({ open, onClose, onComplete, mealType }: SnapMealFlowProps) {
  const [step, setStep] = useState<FlowStep>("camera");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<PhotoNutritionResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Reset state when dialog closes
  const handleClose = () => {
    setStep("camera");
    setPhotoUrl(null);
    setPhotoBase64(null);
    setAnalysisResult(null);
    setIsAnalyzing(false);
    onClose();
  };

  // Step 1: Camera screen → upload photo
  const handlePhotoCapture = async (url: string, base64: string) => {
    setPhotoUrl(url);
    setPhotoBase64(base64);
    setIsAnalyzing(true);

    try {
      // Call mock nutrition analysis API
      const result = await analyzeMealPhoto({
        imageBase64: base64,
        mealType,
      });

      setAnalysisResult(result);
      setStep("review");
    } catch (error) {
      console.error("Photo analysis failed:", error);
      alert("Failed to analyze photo. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Step 2: Review screen → confirm or edit
  const handleConfirm = () => {
    if (analysisResult) {
      onComplete(analysisResult);
      setStep("complete");
      setTimeout(handleClose, 1500); // Auto-close after success message
    }
  };

  const handleEdit = () => {
    setStep("edit");
  };

  // Step 3: Edit foods screen → update detected items
  const handleSaveEdits = (updatedItems: DetectedFoodItem[]) => {
    if (!analysisResult) return;

    // Recalculate total nutrition from updated items
    const totalNutrition = updatedItems.reduce(
      (acc, item) => ({
        calories: acc.calories + (item.nutrition?.calories || 0),
        protein: acc.protein + (item.nutrition?.protein || 0),
        fat: acc.fat + (item.nutrition?.fat || 0),
        carbs: acc.carbs + (item.nutrition?.carbs || 0),
        fiber: (acc.fiber || 0) + (item.nutrition?.fiber || 0),
        whole30Compliant: (acc.whole30Compliant ?? true) && (item.nutrition?.whole30Compliant ?? false),
      }),
      { calories: 0, protein: 0, fat: 0, carbs: 0, fiber: 0, whole30Compliant: true }
    );

    const updatedResult: PhotoNutritionResponse = {
      ...analysisResult,
      detectedItems: updatedItems,
      totalNutrition,
    };

    setAnalysisResult(updatedResult);
    setStep("review");
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {step === "camera" && (
          <CameraScreen
            onCapture={handlePhotoCapture}
            onCancel={handleClose}
            isAnalyzing={isAnalyzing}
          />
        )}

        {step === "review" && analysisResult && (
          <RecognitionReview
            photoUrl={photoUrl || ""}
            result={analysisResult}
            onConfirm={handleConfirm}
            onEdit={handleEdit}
            onCancel={handleClose}
          />
        )}

        {step === "edit" && analysisResult && (
          <EditFoods
            items={analysisResult.detectedItems}
            onSave={handleSaveEdits}
            onCancel={() => setStep("review")}
          />
        )}

        {step === "complete" && (
          <div className="py-12 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold mb-2">Meal Logged!</h2>
            <p className="text-gray-600">Your meal has been added to today&apos;s log.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
