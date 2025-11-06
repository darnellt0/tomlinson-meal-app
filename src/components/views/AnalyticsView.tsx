// src/components/views/AnalyticsView.tsx
"use client";

import * as React from "react";
import { loadTracking } from "@/lib/loaders";
import { parseTrackingForCharts } from "@/lib/analytics";
import { TRACKING_CSV_URL } from "@/lib/sheets";
import type { TrackingRow } from "@/lib/types";
import { GlucoseChart } from "@/components/charts/GlucoseChart";
import { BloodPressureChart } from "@/components/charts/BloodPressureChart";
import { CorrelationView } from "@/components/charts/CorrelationView";
import { ProgressDashboard } from "@/components/charts/ProgressDashboard";

export default function AnalyticsView() {
  const [trackingData, setTrackingData] = React.useState<TrackingRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setLoading(true);
    loadTracking(TRACKING_CSV_URL)
      .then((data) => {
        setTrackingData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load tracking data:", err);
        setError("Failed to load tracking data");
        setLoading(false);
      });
  }, []);

  // Parse data for charts
  const { glucose, bp } = React.useMemo(() => {
    if (trackingData.length === 0) {
      return { glucose: [], bp: [] };
    }
    return parseTrackingForCharts(trackingData);
  }, [trackingData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">Loading analytics data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  if (trackingData.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">
          No tracking data available. Start tracking your health metrics to see
          analytics!
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold mb-2">Health Analytics</h2>
        <p className="text-gray-600">
          Visualize your glucose and blood pressure trends over time
        </p>
      </div>

      {/* Progress Dashboard - Summary Cards */}
      <ProgressDashboard glucoseData={glucose} bpData={bp} />

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <GlucoseChart data={glucose} />
        <BloodPressureChart data={bp} />
      </div>

      {/* Correlation View - Full Width */}
      <CorrelationView trackingData={trackingData} glucoseData={glucose} />
    </div>
  );
}
