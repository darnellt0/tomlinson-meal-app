// src/lib/types.ts

// ---- CALENDAR (Sheet: "30-Day Calendar") ----
export type CalendarRow = {
  Week: string;
  Day: string;
  Date?: string;
  "Cuisine Focus"?: string;
  Breakfast?: string;
  Lunch?: string;
  Dinner?: string;
  "Batch Notes"?: string;
  "CGM Focus"?: string;
  // Be tolerant to extra columns / header tweaks
  [key: string]: string | undefined;
};

// ---- GROCERIES (Sheet: "Weekly Grocery Lists") ----
export type GroceryRow = {
  Category?: string;
  Item?: string;
  Quantity?: string;
  Notes?: string;
  Checked?: string; // e.g. "☐" / "☑" or blank
  [key: string]: string | undefined;
};

// ---- DAILY TRACKING (Sheet: "Daily Tracking Template") ----
export type TrackingRow = {
  Date?: string;
  "Day #"?: string;
  Breakfast?: string;
  Lunch?: string;
  Dinner?: string;
  Snacks?: string;
  "Pre-Meal Glucose"?: string;
  "1hr Post Glucose"?: string;
  "2hr Post Glucose"?: string;
  "Highest Reading"?: string;
  "BP Reading"?: string;
  "Energy (1-10)"?: string;
  "Sleep (1-10)"?: string;
  "Mood (1-10)"?: string;
  Notes?: string;
  [key: string]: string | undefined;
};

// ---- MEAL PREP (Sheet: "Meal Prep Schedule & Assignments") ----
export type PrepRow = {
  Week?: string;
  "Sunday Tasks"?: string;
  "Time Estimate"?: string;
  "Weekday Tasks"?: string;
  "Family Assignments"?: string;
  [key: string]: string | undefined;
};

// ---- WEEKLY REFLECTION (Sheet: "Weekly Reflection & Progress") ----
export type ReflectionRow = {
  Week?: string; // ensure your CSV header is exactly "Week"; if not, adjust here and in the component
  Question?: string;
  Response?: string;
  "Action Items"?: string;
  [key: string]: string | undefined;
};

// ---- SUCCESS METRICS (Sheet: "Success Metrics & Measurements") ----
export type MetricsBaselineRow = {
  Metric?: string;
  Value?: string;
  Date?: string;
  Notes?: string;
  [key: string]: string | undefined;
};

export type MetricsWeeklyRow = {
  Week?: string;
  Weight?: string;
  BP?: string;
  Energy?: string;
  Sleep?: string;
  Mood?: string;
  Digestion?: string;
  "CGM Avg"?: string;
  Notes?: string;
  [key: string]: string | undefined;
};

export type MetricsFinalRow = {
  Metric?: string;
  Baseline?: string;
  Final?: string;
  Change?: string;
  Percentage?: string;
  [key: string]: string | undefined;
};
