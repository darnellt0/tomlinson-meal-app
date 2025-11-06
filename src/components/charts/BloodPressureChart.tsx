// src/components/charts/BloodPressureChart.tsx
"use client";

import * as React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { BPReading } from "@/lib/analytics";

export function BloodPressureChart({ data }: { data: BPReading[] }) {
  const [dateRange, setDateRange] = React.useState<7 | 30>(7);

  // Filter data based on selected range
  const filteredData = React.useMemo(() => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - dateRange);

    return data
      .filter((item) => {
        const itemDate = new Date(item.date);
        return itemDate >= cutoffDate;
      })
      .filter((item) => item.systolic !== null && item.diastolic !== null)
      .slice(-dateRange);
  }, [data, dateRange]);

  // Transform data for recharts
  const chartData = React.useMemo(() => {
    return filteredData.map((reading) => ({
      date: reading.date,
      Systolic: reading.systolic,
      Diastolic: reading.diastolic,
    }));
  }, [filteredData]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle>Blood Pressure Trends</CardTitle>
          <div className="flex gap-2">
            <Button
              variant={dateRange === 7 ? "default" : "outline"}
              size="sm"
              onClick={() => setDateRange(7)}
            >
              7 Days
            </Button>
            <Button
              variant={dateRange === 30 ? "default" : "outline"}
              size="sm"
              onClick={() => setDateRange(30)}
            >
              30 Days
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No blood pressure data available for the selected period
          </div>
        ) : (
          <div className="space-y-4">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis
                  label={{
                    value: "Pressure (mmHg)",
                    angle: -90,
                    position: "insideLeft",
                  }}
                  domain={[60, 180]}
                />
                <Tooltip />
                <Legend />
                {/* Reference lines for target ranges */}
                <ReferenceLine
                  y={120}
                  stroke="#10b981"
                  strokeDasharray="3 3"
                  label={{ value: "Target Systolic", position: "right" }}
                />
                <ReferenceLine
                  y={80}
                  stroke="#3b82f6"
                  strokeDasharray="3 3"
                  label={{ value: "Target Diastolic", position: "right" }}
                />
                <Line
                  type="monotone"
                  dataKey="Systolic"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Systolic (Top)"
                />
                <Line
                  type="monotone"
                  dataKey="Diastolic"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Diastolic (Bottom)"
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex gap-4 justify-center text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span>Target: 120/80</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                <span>Elevated: 120-129 / &lt;80</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span>High: 130+ / 80+</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
