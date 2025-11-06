// src/components/charts/CorrelationView.tsx
"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { GlucoseReading } from "@/lib/analytics";
import type { TrackingRow } from "@/lib/types";

type MealCorrelation = {
  meal: string;
  date: string;
  glucoseReading: number;
  spike: boolean;
};

export function CorrelationView({
  trackingData,
  glucoseData,
}: {
  trackingData: TrackingRow[];
  glucoseData: GlucoseReading[];
}) {
  // Correlate meals with glucose readings
  const correlations = React.useMemo(() => {
    const results: MealCorrelation[] = [];
    const SPIKE_THRESHOLD = 140;

    trackingData.forEach((row) => {
      const date = row.Date || "";
      const glucoseReading = glucoseData.find((g) => g.date === date);

      if (!glucoseReading) return;

      // Check breakfast correlation
      if (row.Breakfast && glucoseReading.postBreakfast !== null) {
        results.push({
          meal: row.Breakfast,
          date,
          glucoseReading: glucoseReading.postBreakfast,
          spike: glucoseReading.postBreakfast > SPIKE_THRESHOLD,
        });
      }

      // Check lunch correlation
      if (row.Lunch && glucoseReading.postLunch !== null) {
        results.push({
          meal: row.Lunch,
          date,
          glucoseReading: glucoseReading.postLunch,
          spike: glucoseReading.postLunch > SPIKE_THRESHOLD,
        });
      }

      // Check dinner correlation
      if (row.Dinner && glucoseReading.postDinner !== null) {
        results.push({
          meal: row.Dinner,
          date,
          glucoseReading: glucoseReading.postDinner,
          spike: glucoseReading.postDinner > SPIKE_THRESHOLD,
        });
      }
    });

    // Sort by glucose reading (highest first)
    return results.sort((a, b) => b.glucoseReading - a.glucoseReading);
  }, [trackingData, glucoseData]);

  // Get meals with spikes
  const spikeMeals = correlations.filter((c) => c.spike);

  // Get meals without spikes (good responses)
  const goodMeals = correlations.filter((c) => !c.spike).slice(0, 10);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Meal-Glucose Correlations</CardTitle>
        <p className="text-sm text-gray-600">
          Understanding which meals impact your glucose levels
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Meals with spikes */}
          <div>
            <h3 className="font-semibold text-red-600 mb-3 flex items-center gap-2">
              <span>Meals with Elevated Glucose (140+ mg/dL)</span>
              <Badge variant="destructive">{spikeMeals.length}</Badge>
            </h3>
            {spikeMeals.length === 0 ? (
              <p className="text-sm text-gray-500 italic">
                No glucose spikes detected! Great job!
              </p>
            ) : (
              <div className="space-y-2">
                {spikeMeals.slice(0, 8).map((correlation, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm">{correlation.meal}</p>
                      <p className="text-xs text-gray-600">{correlation.date}</p>
                    </div>
                    <Badge variant="destructive" className="ml-2">
                      {correlation.glucoseReading} mg/dL
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Meals with good response */}
          <div>
            <h3 className="font-semibold text-green-600 mb-3 flex items-center gap-2">
              <span>Meals with Good Glucose Response (&lt;140 mg/dL)</span>
              <Badge className="bg-green-600">{goodMeals.length}</Badge>
            </h3>
            {goodMeals.length === 0 ? (
              <p className="text-sm text-gray-500 italic">
                No data available yet
              </p>
            ) : (
              <div className="space-y-2">
                {goodMeals.map((correlation, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm">{correlation.meal}</p>
                      <p className="text-xs text-gray-600">{correlation.date}</p>
                    </div>
                    <Badge className="ml-2 bg-green-600">
                      {correlation.glucoseReading} mg/dL
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <strong>Tip:</strong> Track which meals consistently give you good
              glucose responses. Consider these your &quot;safe&quot; meals and
              increase their frequency in your rotation.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
