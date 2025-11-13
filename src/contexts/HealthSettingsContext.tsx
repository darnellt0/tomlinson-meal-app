// src/contexts/HealthSettingsContext.tsx
"use client";

import * as React from "react";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { HealthSettings, EatingMode } from "@/lib/health-settings";
import { DEFAULT_HEALTH_SETTINGS } from "@/lib/health-settings";

interface HealthSettingsContextType {
  settings: HealthSettings;
  updateMode: (mode: EatingMode) => void;
  updateSettings: (updates: Partial<HealthSettings>) => void;
  addAvoidIngredient: (ingredient: string) => void;
  removeAvoidIngredient: (ingredient: string) => void;
}

const HealthSettingsContext = createContext<HealthSettingsContextType | undefined>(undefined);

const STORAGE_KEY = "tomlinson_health_settings";

export function HealthSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<HealthSettings>(DEFAULT_HEALTH_SETTINGS);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setSettings({ ...DEFAULT_HEALTH_SETTINGS, ...parsed });
        } catch (e) {
          console.error("Failed to parse health settings:", e);
        }
      }
    }
  }, []);

  // Save to localStorage whenever settings change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }
  }, [settings]);

  const updateMode = (mode: EatingMode) => {
    setSettings((prev) => ({ ...prev, mode }));
  };

  const updateSettings = (updates: Partial<HealthSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  };

  const addAvoidIngredient = (ingredient: string) => {
    setSettings((prev) => ({
      ...prev,
      avoidIngredients: [...prev.avoidIngredients, ingredient],
    }));
  };

  const removeAvoidIngredient = (ingredient: string) => {
    setSettings((prev) => ({
      ...prev,
      avoidIngredients: prev.avoidIngredients.filter((i) => i !== ingredient),
    }));
  };

  return (
    <HealthSettingsContext.Provider
      value={{
        settings,
        updateMode,
        updateSettings,
        addAvoidIngredient,
        removeAvoidIngredient,
      }}
    >
      {children}
    </HealthSettingsContext.Provider>
  );
}

export function useHealthSettings() {
  const context = useContext(HealthSettingsContext);
  if (!context) {
    throw new Error("useHealthSettings must be used within HealthSettingsProvider");
  }
  return context;
}
