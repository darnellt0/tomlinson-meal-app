// src/components/health/CameraScreen.tsx
"use client";

import * as React from "react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Camera, Upload, X, Loader2 } from "lucide-react";

type CameraScreenProps = {
  onCapture: (photoUrl: string, photoBase64: string) => void;
  onCancel: () => void;
  isAnalyzing: boolean;
};

/**
 * Camera / Upload screen for Snap & Log flow
 * Allows taking photo or uploading from device
 */
export function CameraScreen({ onCapture, onCancel, isAnalyzing }: CameraScreenProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("Image too large. Please select an image under 10MB.");
      return;
    }

    // Read file as base64
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      const url = URL.createObjectURL(file);
      onCapture(url, base64);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-xl font-semibold flex items-center gap-2">
          <Camera className="w-5 h-5" />
          Snap Your Meal
        </DialogTitle>
      </DialogHeader>

      <div className="grid gap-6 py-6">
        {/* Photo upload area */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center bg-gray-50">
          <Camera className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium mb-2">Take a photo of your meal</p>
          <p className="text-sm text-gray-600 mb-6">
            We&apos;ll recognize the foods and estimate nutrition automatically
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileSelect}
            disabled={isAnalyzing}
          />

          <div className="flex gap-3 justify-center">
            {/* Mobile: Camera capture */}
            <Button
              size="lg"
              onClick={handleUploadClick}
              disabled={isAnalyzing}
              className="md:hidden"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Camera className="w-5 h-5 mr-2" />
                  Take Photo
                </>
              )}
            </Button>

            {/* Desktop: Upload */}
            <Button
              size="lg"
              onClick={handleUploadClick}
              disabled={isAnalyzing}
              variant="default"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5 mr-2" />
                  Upload Photo
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Help text */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <strong>Tips for best results:</strong>
          </p>
          <ul className="text-sm text-blue-800 mt-2 space-y-1 ml-4 list-disc">
            <li>Take photo from directly above the plate</li>
            <li>Ensure good lighting</li>
            <li>Include the full plate in frame</li>
            <li>Separate foods if possible</li>
          </ul>
        </div>
      </div>

      <div className="flex justify-end">
        <Button variant="outline" onClick={onCancel} disabled={isAnalyzing}>
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
      </div>
    </>
  );
}
