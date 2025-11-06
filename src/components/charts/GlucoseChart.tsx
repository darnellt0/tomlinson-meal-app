// src/components/charts/GlucoseChart.tsx
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
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { GlucoseReading } from "@/lib/analytics";

export function GlucoseChart({ data }: { data: GlucoseReading[] }) {
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
      .slice(-dateRange); // Take last N days
  }, [data, dateRange]);

  // Transform data for recharts (flatten readings)
  const chartData = React.useMemo(() => {
    return filteredData.map((reading) => ({
      date: reading.date,
      Fasting: reading.fasting,
      "Post-Breakfast": reading.postBreakfast,
      "Post-Lunch": reading.postLunch,
      "Post-Dinner": reading.postDinner,
      Bedtime: reading.bedtime,
    }));
  }, [filteredData]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle>Glucose Trends</CardTitle>
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
            No glucose data available for the selected period
          </div>
        ) : (
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
                  value: "Glucose (mg/dL)",
                  angle: -90,
                  position: "insideLeft",
                }}
                domain={[60, 180]}
              />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="Fasting"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{ r: 3 }}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="Post-Breakfast"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 3 }}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="Post-Lunch"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 3 }}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="Post-Dinner"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ r: 3 }}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="Bedtime"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ r: 3 }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
