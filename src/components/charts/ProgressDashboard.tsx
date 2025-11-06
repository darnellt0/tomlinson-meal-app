// src/components/charts/ProgressDashboard.tsx
"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Heart, TrendingDown, TrendingUp, Target } from "lucide-react";
import type { GlucoseReading, BPReading } from "@/lib/analytics";
import {
  calculateAverageGlucose,
  calculateAverageBP,
  findGlucoseSpikes,
} from "@/lib/analytics";

export function ProgressDashboard({
  glucoseData,
  bpData,
}: {
  glucoseData: GlucoseReading[];
  bpData: BPReading[];
}) {
  // Calculate metrics
  const avgGlucose = React.useMemo(
    () => calculateAverageGlucose(glucoseData),
    [glucoseData]
  );

  const avgBP = React.useMemo(() => calculateAverageBP(bpData), [bpData]);

  const spikes = React.useMemo(
    () => findGlucoseSpikes(glucoseData, 140),
    [glucoseData]
  );

  const glucoseInRange = React.useMemo(() => {
    const allReadings: number[] = [];
    glucoseData.forEach((r) => {
      if (r.fasting !== null) allReadings.push(r.fasting);
      if (r.postBreakfast !== null) allReadings.push(r.postBreakfast);
      if (r.postLunch !== null) allReadings.push(r.postLunch);
      if (r.postDinner !== null) allReadings.push(r.postDinner);
      if (r.bedtime !== null) allReadings.push(r.bedtime);
    });

    if (allReadings.length === 0) return 0;

    const inRange = allReadings.filter((r) => r >= 70 && r <= 140);
    return Math.round((inRange.length / allReadings.length) * 100);
  }, [glucoseData]);

  const bpInRange = React.useMemo(() => {
    const validReadings = bpData.filter(
      (r) => r.systolic !== null && r.diastolic !== null
    );

    if (validReadings.length === 0) return 0;

    const inRange = validReadings.filter(
      (r) => (r.systolic || 0) <= 120 && (r.diastolic || 0) <= 80
    );

    return Math.round((inRange.length / validReadings.length) * 100);
  }, [bpData]);

  // Metric cards configuration
  const metrics = [
    {
      title: "Avg Glucose",
      value: avgGlucose > 0 ? `${Math.round(avgGlucose)} mg/dL` : "No data",
      icon: Activity,
      trend: avgGlucose <= 120 ? "good" : avgGlucose <= 140 ? "ok" : "high",
      description: "Target: 70-120 mg/dL",
      color:
        avgGlucose <= 120
          ? "text-green-600"
          : avgGlucose <= 140
          ? "text-yellow-600"
          : "text-red-600",
      bgColor:
        avgGlucose <= 120
          ? "bg-green-50"
          : avgGlucose <= 140
          ? "bg-yellow-50"
          : "bg-red-50",
    },
    {
      title: "Avg Blood Pressure",
      value:
        avgBP.systolic > 0
          ? `${avgBP.systolic}/${avgBP.diastolic}`
          : "No data",
      icon: Heart,
      trend:
        avgBP.systolic <= 120 && avgBP.diastolic <= 80
          ? "good"
          : avgBP.systolic <= 130
          ? "ok"
          : "high",
      description: "Target: 120/80 or below",
      color:
        avgBP.systolic <= 120 && avgBP.diastolic <= 80
          ? "text-green-600"
          : avgBP.systolic <= 130
          ? "text-yellow-600"
          : "text-red-600",
      bgColor:
        avgBP.systolic <= 120 && avgBP.diastolic <= 80
          ? "bg-green-50"
          : avgBP.systolic <= 130
          ? "bg-yellow-50"
          : "bg-red-50",
    },
    {
      title: "Glucose In Range",
      value: `${glucoseInRange}%`,
      icon: Target,
      trend: glucoseInRange >= 70 ? "good" : glucoseInRange >= 50 ? "ok" : "low",
      description: "Readings between 70-140",
      color:
        glucoseInRange >= 70
          ? "text-green-600"
          : glucoseInRange >= 50
          ? "text-yellow-600"
          : "text-red-600",
      bgColor:
        glucoseInRange >= 70
          ? "bg-green-50"
          : glucoseInRange >= 50
          ? "bg-yellow-50"
          : "bg-red-50",
    },
    {
      title: "BP In Range",
      value: `${bpInRange}%`,
      icon: Heart,
      trend: bpInRange >= 70 ? "good" : bpInRange >= 50 ? "ok" : "low",
      description: "Readings at or below 120/80",
      color:
        bpInRange >= 70
          ? "text-green-600"
          : bpInRange >= 50
          ? "text-yellow-600"
          : "text-red-600",
      bgColor:
        bpInRange >= 70
          ? "bg-green-50"
          : bpInRange >= 50
          ? "bg-yellow-50"
          : "bg-red-50",
    },
    {
      title: "Glucose Spikes",
      value: spikes.length.toString(),
      icon: TrendingUp,
      trend: spikes.length === 0 ? "good" : spikes.length <= 3 ? "ok" : "high",
      description: "Readings above 140 mg/dL",
      color:
        spikes.length === 0
          ? "text-green-600"
          : spikes.length <= 3
          ? "text-yellow-600"
          : "text-red-600",
      bgColor:
        spikes.length === 0
          ? "bg-green-50"
          : spikes.length <= 3
          ? "bg-yellow-50"
          : "bg-red-50",
    },
    {
      title: "Total Readings",
      value: glucoseData.length.toString(),
      icon: TrendingDown,
      trend: "neutral",
      description: "Days tracked",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {metrics.map((metric, idx) => {
        const Icon = metric.icon;
        return (
          <Card key={idx} className={metric.bgColor}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">
                {metric.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${metric.color}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${metric.color}`}>
                {metric.value}
              </div>
              <p className="text-xs text-gray-600 mt-1">{metric.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
