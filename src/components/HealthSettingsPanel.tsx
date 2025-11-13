// src/components/HealthSettingsPanel.tsx
"use client";

import * as React from "react";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Settings, X, Plus, Heart, Activity } from "lucide-react";
import { useHealthSettings } from "@/contexts/HealthSettingsContext";
import { getModeDescription, getModeGuidance } from "@/lib/health-settings";

export function HealthSettingsPanel() {
  const { settings, updateMode, updateSettings, addAvoidIngredient, removeAvoidIngredient } = useHealthSettings();
  const [open, setOpen] = useState(false);
  const [newIngredient, setNewIngredient] = useState("");

  const handleModeToggle = () => {
    const newMode = settings.mode === 'whole30' ? 'postWhole30' : 'whole30';
    updateMode(newMode);
  };

  const handleAddIngredient = () => {
    if (newIngredient.trim()) {
      addAvoidIngredient(newIngredient.trim());
      setNewIngredient("");
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-2"
      >
        <Settings className="w-4 h-4" />
        Health Settings
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl overflow-y-auto max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Heart className="w-6 h-6 text-red-500" />
              Family Health Settings
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-6">
            {/* EATING MODE TOGGLE */}
            <section>
              <h3 className="text-lg font-semibold mb-3">Eating Mode</h3>
              <Card className="rounded-xl border-2 border-blue-200 bg-blue-50">
                <CardContent className="p-4 grid gap-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-lg">
                        {settings.mode === 'whole30' ? 'Whole30 Mode' : 'Post-Whole30 Mode'}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {getModeDescription(settings.mode)}
                      </div>
                    </div>
                    <Button
                      onClick={handleModeToggle}
                      variant={settings.mode === 'whole30' ? 'default' : 'outline'}
                      size="lg"
                    >
                      {settings.mode === 'whole30' ? 'Switch to Post-Whole30' : 'Back to Whole30'}
                    </Button>
                  </div>

                  <div className="border-t pt-3 mt-2">
                    <div className="text-sm font-semibold mb-2">Mode Guidance:</div>
                    <ul className="text-sm space-y-1 list-disc ml-5">
                      {getModeGuidance(settings.mode).map((tip, i) => (
                        <li key={i}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* FAMILY HEALTH PROFILES */}
            <section>
              <h3 className="text-lg font-semibold mb-3">Family Health Profiles</h3>
              <div className="grid gap-2">
                {settings.familyMembers.map((member, idx) => (
                  <Card key={idx} className="rounded-xl">
                    <CardContent className="p-3 flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{member.name}</div>
                        <div className="flex gap-2 mt-1 flex-wrap">
                          {member.conditions.map((cond, i) => {
                            if (cond === 'none') return null;
                            return (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {cond === 'diabetic' ? 'Diabetic' : 'High BP'}
                              </Badge>
                            );
                          })}
                          {member.deviceType && member.deviceType !== 'none' && (
                            <Badge variant="outline" className="text-xs">
                              <Activity className="w-3 h-3 mr-1" />
                              {member.deviceType === 'freestyle-libre' ? 'Glucose Monitor' : 'Fitbit'}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* DIETARY CONSTRAINTS */}
            <section>
              <h3 className="text-lg font-semibold mb-3">Avoid Ingredients</h3>
              <div className="flex gap-2 mb-3 flex-wrap">
                {settings.avoidIngredients.map((ing, idx) => (
                  <Badge key={idx} variant="destructive" className="gap-2">
                    {ing}
                    <button
                      onClick={() => removeAvoidIngredient(ing)}
                      className="hover:bg-red-700 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
                {settings.avoidIngredients.length === 0 && (
                  <div className="text-sm text-gray-500">No ingredients avoided</div>
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add ingredient to avoid (e.g., plantains)"
                  value={newIngredient}
                  onChange={(e) => setNewIngredient(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddIngredient()}
                  className="flex-1"
                />
                <Button onClick={handleAddIngredient} size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>
            </section>

            {/* PREFERENCES */}
            <section>
              <h3 className="text-lg font-semibold mb-3">Cooking Preferences</h3>
              <div className="grid gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.prefersInstantPot}
                    onChange={(e) => updateSettings({ prefersInstantPot: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Prefer Instant Pot / Pressure Cooker recipes</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.diabeticFriendly}
                    onChange={(e) => updateSettings({ diabeticFriendly: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Prioritize diabetic-friendly meals</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.lowSodium}
                    onChange={(e) => updateSettings({ lowSodium: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Prioritize low-sodium meals</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.showHealthScores}
                    onChange={(e) => updateSettings({ showHealthScores: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Show health scores on meals</span>
                </label>
              </div>
            </section>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              <X className="w-4 h-4 mr-2" />
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
