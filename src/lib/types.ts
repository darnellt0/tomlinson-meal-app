// src/lib/types.ts
export type CalendarRow = {
  Week: string; Day: string; Date: string;
  "Cuisine Focus": string;
  Breakfast: string; Lunch: string; Dinner: string;
  "Batch Notes"?: string; "CGM Focus"?: string;
};

export type GroceryRow = {
  Category: string; Item: string; Quantity: string; Notes: string; Checked: string; // "☐" or "☑" (or empty)
};

export type TrackingRow = {
  Date: string; "Day #": string;
  Breakfast: string; Lunch: string; Dinner: string; Snacks: string;
  "Pre-Meal Glucose": string; "1hr Post Glucose": string; "2hr Post Glucose": string;
  "Highest Reading": string; "BP Reading": string;
  "Energy (1-10)": string; "Sleep (1-10)": string; "Mood (1-10)": string; Notes: string;
};

export type PrepRow = { Week: string; "Sunday Tasks": string; "Time Estimate": string; "Weekday Tasks": string; "Family Assignments": string; };
export type ReflectionRow = { Question: string; Response: string; "Action Items": string; };
export type MetricsBaselineRow = { Metric: string; Value: string; Date: string; Notes: string; };
export type MetricsWeeklyRow = { Week: string; Weight: string; BP: string; Energy: string; Sleep: string; Mood: string; Digestion: string; "CGM Avg": string; Notes: string; };
export type MetricsFinalRow = { Metric: string; Baseline: string; Final: string; Change: string; Percentage: string; };
