// src/components/WeightGoalsPanel.tsx
"use client";

import * as React from "react";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Target, TrendingDown, TrendingUp, Minus, AlertCircle } from "lucide-react";
import { useWeightGoals } from "@/contexts/WeightGoalsContext";
import {
  type GoalType,
  type ActivityLevel,
  type Sex,
  type WeightUnit,
  type HeightUnit,
  ACTIVITY_DESCRIPTIONS,
  estimateTimeToGoal,
  validateWeightGoals,
  convertWeight,
  calculateBMI,
  convertHeightToCm
} from "@/lib/weight-goals";

export function WeightGoalsPanel() {
  const { weightGoals, calculateGoals, clearWeightGoals } = useWeightGoals();

  // Form state
  const [currentWeight, setCurrentWeight] = useState(weightGoals?.currentWeight?.toString() || "");
  const [targetWeight, setTargetWeight] = useState(weightGoals?.targetWeight?.toString() || "");
  const [weightUnit, setWeightUnit] = useState<WeightUnit>(weightGoals?.weightUnit || "lbs");
  const [goalType, setGoalType] = useState<GoalType>(weightGoals?.goalType || "maintain");
  const [age, setAge] = useState(weightGoals?.age?.toString() || "");
  const [heightValue, setHeightValue] = useState(weightGoals?.heightValue?.toString() || "");
  const [heightUnit, setHeightUnit] = useState<HeightUnit>(weightGoals?.heightUnit || "inches");
  const [sex, setSex] = useState<Sex>(weightGoals?.sex || "female");
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(weightGoals?.activityLevel || "moderately-active");

  // Macro split
  const [proteinPercent, setProteinPercent] = useState(weightGoals?.macros?.proteinPercent?.toString() || "30");
  const [carbsPercent, setCarbsPercent] = useState(weightGoals?.macros?.carbsPercent?.toString() || "40");
  const [fatsPercent, setFatsPercent] = useState(weightGoals?.macros?.fatsPercent?.toString() || "30");

  // Validation
  const [errors, setErrors] = useState<string[]>([]);
  const [calculated, setCalculated] = useState(false);

  // Calculate goals
  const handleCalculate = () => {
    setErrors([]);

    // Validation
    const newErrors: string[] = [];

    if (!currentWeight || isNaN(parseFloat(currentWeight))) {
      newErrors.push("Current weight is required");
    }
    if (!targetWeight || isNaN(parseFloat(targetWeight))) {
      newErrors.push("Target weight is required");
    }
    if (!age || isNaN(parseInt(age)) || parseInt(age) < 18 || parseInt(age) > 120) {
      newErrors.push("Age must be between 18 and 120");
    }
    if (!heightValue || isNaN(parseFloat(heightValue))) {
      newErrors.push("Height is required");
    }

    // Validate macro split adds to 100%
    const totalMacros = parseInt(proteinPercent) + parseInt(carbsPercent) + parseInt(fatsPercent);
    if (totalMacros !== 100) {
      newErrors.push(`Macro percentages must add to 100% (currently ${totalMacros}%)`);
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const goals = calculateGoals({
        currentWeight: parseFloat(currentWeight),
        targetWeight: parseFloat(targetWeight),
        weightUnit,
        goalType,
        age: parseInt(age),
        heightValue: parseFloat(heightValue),
        heightUnit,
        sex,
        activityLevel,
        macros: {
          proteinPercent: parseInt(proteinPercent),
          carbsPercent: parseInt(carbsPercent),
          fatsPercent: parseInt(fatsPercent)
        },
        startDate: new Date()
      });

      // Validate safety
      const validation = validateWeightGoals(goals);
      if (validation.warnings.length > 0) {
        setErrors(validation.warnings);
      }

      setCalculated(true);
    } catch (error) {
      setErrors(["Failed to calculate goals. Please check your inputs."]);
    }
  };

  // Clear/reset
  const handleClear = () => {
    if (confirm("Are you sure you want to clear your weight goals?")) {
      clearWeightGoals();
      setCurrentWeight("");
      setTargetWeight("");
      setAge("");
      setHeightValue("");
      setCalculated(false);
      setErrors([]);
    }
  };

  // Calculate time to goal if goals exist
  const timeToGoal = weightGoals
    ? estimateTimeToGoal(
        weightGoals.currentWeight,
        weightGoals.targetWeight,
        weightGoals.weightUnit,
        weightGoals.dailyDeficitSurplus
      )
    : null;

  // Calculate BMI if weight and height entered
  const currentBMI = currentWeight && heightValue
    ? calculateBMI(
        convertWeight(parseFloat(currentWeight), weightUnit, 'kg'),
        convertHeightToCm(parseFloat(heightValue), heightUnit)
      ).toFixed(1)
    : null;

  return (
    <div className="grid gap-6">
      {/* GOAL SETUP FORM */}
      <section>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Target className="w-5 h-5" />
          Weight & Calorie Goals
        </h3>

        <Card className="rounded-xl">
          <CardContent className="p-4 grid gap-4">
            {/* Current & Target Weight */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium block mb-1">Current Weight</label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={currentWeight}
                    onChange={(e) => setCurrentWeight(e.target.value)}
                    placeholder="180"
                    className="flex-1"
                  />
                  <Select value={weightUnit} onValueChange={(v: WeightUnit) => setWeightUnit(v)}>
                    <SelectTrigger className="w-[80px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lbs">lbs</SelectItem>
                      <SelectItem value="kg">kg</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {currentBMI && (
                  <div className="text-xs text-gray-500 mt-1">BMI: {currentBMI}</div>
                )}
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">Target Weight</label>
                <Input
                  type="number"
                  value={targetWeight}
                  onChange={(e) => setTargetWeight(e.target.value)}
                  placeholder="165"
                />
              </div>
            </div>

            {/* Goal Type */}
            <div>
              <label className="text-sm font-medium block mb-2">Goal</label>
              <div className="flex gap-2">
                <Button
                  variant={goalType === 'lose' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setGoalType('lose')}
                  className="flex-1"
                >
                  <TrendingDown className="w-4 h-4 mr-2" />
                  Lose Weight
                </Button>
                <Button
                  variant={goalType === 'maintain' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setGoalType('maintain')}
                  className="flex-1"
                >
                  <Minus className="w-4 h-4 mr-2" />
                  Maintain
                </Button>
                <Button
                  variant={goalType === 'gain' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setGoalType('gain')}
                  className="flex-1"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Gain Weight
                </Button>
              </div>
            </div>

            <div className="border-t pt-4 mt-2">
              <h4 className="text-sm font-semibold mb-3">Your Profile</h4>

              {/* Age, Height, Sex */}
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div>
                  <label className="text-sm font-medium block mb-1">Age</label>
                  <Input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="45"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium block mb-1">Height</label>
                  <div className="flex gap-1">
                    <Input
                      type="number"
                      value={heightValue}
                      onChange={(e) => setHeightValue(e.target.value)}
                      placeholder={heightUnit === 'inches' ? "69" : "175"}
                      className="flex-1"
                    />
                    <Select value={heightUnit} onValueChange={(v: HeightUnit) => setHeightUnit(v)}>
                      <SelectTrigger className="w-[70px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inches">in</SelectItem>
                        <SelectItem value="cm">cm</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium block mb-1">Sex</label>
                  <Select value={sex} onValueChange={(v: Sex) => setSex(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Activity Level */}
              <div>
                <label className="text-sm font-medium block mb-1">Activity Level</label>
                <Select value={activityLevel} onValueChange={(v: ActivityLevel) => setActivityLevel(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ACTIVITY_DESCRIPTIONS).map(([key, desc]) => (
                      <SelectItem key={key} value={key}>
                        {desc}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Macro Split */}
            <div className="border-t pt-4 mt-2">
              <h4 className="text-sm font-semibold mb-2">Macronutrient Distribution</h4>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-gray-600 block mb-1">Protein %</label>
                  <Input
                    type="number"
                    value={proteinPercent}
                    onChange={(e) => setProteinPercent(e.target.value)}
                    min="10"
                    max="50"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 block mb-1">Carbs %</label>
                  <Input
                    type="number"
                    value={carbsPercent}
                    onChange={(e) => setCarbsPercent(e.target.value)}
                    min="20"
                    max="60"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 block mb-1">Fats %</label>
                  <Input
                    type="number"
                    value={fatsPercent}
                    onChange={(e) => setFatsPercent(e.target.value)}
                    min="15"
                    max="50"
                  />
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Total: {parseInt(proteinPercent || "0") + parseInt(carbsPercent || "0") + parseInt(fatsPercent || "0")}% (must equal 100%)
              </div>
            </div>

            {/* Errors */}
            {errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-red-700">
                    {errors.map((err, i) => (
                      <div key={i}>{err}</div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Calculate Button */}
            <div className="flex gap-2">
              <Button onClick={handleCalculate} className="flex-1">
                Calculate Targets
              </Button>
              {weightGoals && (
                <Button onClick={handleClear} variant="outline">
                  Clear
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* CALCULATED TARGETS */}
      {calculated && weightGoals && (
        <section>
          <h3 className="text-lg font-semibold mb-3">Your Daily Targets</h3>

          <Card className="rounded-xl border-2 border-blue-200 bg-blue-50">
            <CardContent className="p-4 grid gap-4">
              {/* Calorie Targets */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">TDEE (Maintenance)</div>
                  <div className="text-2xl font-bold">{weightGoals.tdee.toLocaleString()} cal/day</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Target Calories</div>
                  <div className="text-2xl font-bold text-blue-600">{weightGoals.targetCalories.toLocaleString()} cal/day</div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t pt-3">
                <div className="text-sm">
                  <span className="font-medium">Daily {goalType === 'lose' ? 'Deficit' : goalType === 'gain' ? 'Surplus' : 'Balance'}:</span>
                  <span className={`ml-2 font-bold ${goalType === 'lose' ? 'text-red-600' : goalType === 'gain' ? 'text-green-600' : 'text-gray-600'}`}>
                    {weightGoals.dailyDeficitSurplus > 0 ? '+' : ''}{weightGoals.dailyDeficitSurplus} cal
                  </span>
                </div>
                {timeToGoal && goalType !== 'maintain' && (
                  <Badge variant="outline">
                    ⏱️ ~{timeToGoal.weeks} weeks to goal
                  </Badge>
                )}
              </div>

              {/* Macro Targets */}
              <div className="border-t pt-3">
                <div className="text-sm font-semibold mb-2">Macronutrient Targets</div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white rounded-lg p-2 text-center">
                    <div className="text-xs text-gray-600">Protein</div>
                    <div className="text-lg font-bold">{weightGoals.macroGrams.protein}g</div>
                    <div className="text-xs text-gray-500">{weightGoals.macros.proteinPercent}%</div>
                  </div>
                  <div className="bg-white rounded-lg p-2 text-center">
                    <div className="text-xs text-gray-600">Carbs</div>
                    <div className="text-lg font-bold">{weightGoals.macroGrams.carbs}g</div>
                    <div className="text-xs text-gray-500">{weightGoals.macros.carbsPercent}%</div>
                  </div>
                  <div className="bg-white rounded-lg p-2 text-center">
                    <div className="text-xs text-gray-600">Fats</div>
                    <div className="text-lg font-bold">{weightGoals.macroGrams.fats}g</div>
                    <div className="text-xs text-gray-500">{weightGoals.macros.fatsPercent}%</div>
                  </div>
                </div>
              </div>

              {/* Info Note */}
              <div className="bg-white border border-blue-200 rounded-lg p-3 text-sm text-gray-700">
                <strong>Note:</strong> These are estimates based on standard formulas. Individual needs vary. Consult with a healthcare provider or registered dietitian for personalized guidance, especially if you have medical conditions.
              </div>
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}
