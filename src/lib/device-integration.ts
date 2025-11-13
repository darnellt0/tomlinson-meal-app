// src/lib/device-integration.ts

/**
 * DEVICE INTEGRATION STUBS
 *
 * These are placeholder types and functions for future integration
 * with Freestyle Libre (glucose monitor) and Fitbit (activity/HR/sleep).
 *
 * NOT IMPLEMENTED: Actual API calls. These would require:
 * - OAuth tokens
 * - API keys
 * - Backend endpoints to handle sensitive data
 *
 * For now, this provides the structure for where device data
 * would flow into the meal planning logic.
 */

// ============================================================================
// FREESTYLE LIBRE (Continuous Glucose Monitor)
// ============================================================================

export interface GlucoseReading {
  timestamp: Date;
  value: number; // mg/dL
  trend?: 'rising-fast' | 'rising' | 'stable' | 'falling' | 'falling-fast';
}

export interface GlucoseTrend {
  date: Date;
  avgGlucose: number;
  minGlucose: number;
  maxGlucose: number;
  timeInRange: number; // percentage (70-180 mg/dL)
  readings: GlucoseReading[];
}

export interface MealGlucoseProfile {
  mealName: string;
  mealTime: Date;
  preGlucose?: number;
  postGlucose1hr?: number;
  postGlucose2hr?: number;
  glucoseSpike?: number; // delta from pre to max
  spikeRating?: 'low' | 'medium' | 'high'; // < 30 mg/dL, 30-50, > 50
}

/**
 * FUTURE: Fetch glucose data from Freestyle Libre API
 *
 * @param userId - User identifier
 * @param startDate - Start of date range
 * @param endDate - End of date range
 * @returns Promise of glucose trends
 */
export async function fetchFreestyleLibreData(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<GlucoseTrend[]> {
  // TODO: Implement actual API call
  // For now, return empty array
  console.warn('Freestyle Libre integration not yet implemented');
  return [];
}

/**
 * FUTURE: Analyze meal impact on glucose
 * This would correlate meal times with glucose spikes
 */
export function analyzeMealGlucoseImpact(
  mealTime: Date,
  readings: GlucoseReading[]
): MealGlucoseProfile | null {
  // TODO: Implement analysis
  console.warn('Meal glucose analysis not yet implemented');
  return null;
}

// ============================================================================
// FITBIT (Activity, Heart Rate, Sleep)
// ============================================================================

export interface FitbitDailySummary {
  date: Date;
  steps: number;
  activeMinutes: number;
  caloriesBurned: number;
  restingHeartRate: number;
  averageHeartRate: number;
  sleepDuration: number; // minutes
  sleepQuality: 'poor' | 'fair' | 'good' | 'excellent';
  stressLevel?: 'low' | 'medium' | 'high'; // derived from HR variability
}

export interface FitbitWeeklySummary {
  weekStart: Date;
  weekEnd: Date;
  avgSteps: number;
  avgActiveMinutes: number;
  avgSleepDuration: number;
  avgRestingHR: number;
  daysWithGoodSleep: number;
  stressfulDays: number;
}

/**
 * FUTURE: Fetch Fitbit data
 *
 * @param userId - User identifier
 * @param startDate - Start of date range
 * @param endDate - End of date range
 * @returns Promise of daily summaries
 */
export async function fetchFitbitData(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<FitbitDailySummary[]> {
  // TODO: Implement actual API call
  console.warn('Fitbit integration not yet implemented');
  return [];
}

/**
 * FUTURE: Get meal planning insights from activity/stress
 *
 * Example logic:
 * - High stress week → suggest simpler, faster meals
 * - Low activity → suggest lighter portions
 * - Poor sleep → suggest energy-boosting breakfast options
 */
export function getMealPlanningInsights(
  weeklyData: FitbitWeeklySummary
): string[] {
  const insights: string[] = [];

  // TODO: Implement actual logic
  // For now, just structure

  if (weeklyData.stressfulDays > 3) {
    insights.push('Consider simpler, quicker meal prep this week due to higher stress levels.');
  }

  if (weeklyData.avgSleepDuration < 360) { // < 6 hours
    insights.push('Focus on energizing breakfasts to help with low sleep quality.');
  }

  if (weeklyData.avgSteps < 5000) {
    insights.push('Lower activity this week - consider lighter portions or more vegetables.');
  }

  return insights;
}

// ============================================================================
// BLOOD PRESSURE TRACKING
// ============================================================================

export interface BPReading {
  timestamp: Date;
  systolic: number;
  diastolic: number;
  heartRate?: number;
  notes?: string;
}

export interface BPTrend {
  date: Date;
  avgSystolic: number;
  avgDiastolic: number;
  readings: BPReading[];
  status: 'normal' | 'elevated' | 'high' | 'very-high';
}

/**
 * Classify BP reading
 * Based on AHA guidelines
 */
export function classifyBP(systolic: number, diastolic: number): BPTrend['status'] {
  if (systolic >= 180 || diastolic >= 120) return 'very-high';
  if (systolic >= 140 || diastolic >= 90) return 'high';
  if (systolic >= 130 || diastolic >= 80) return 'elevated';
  return 'normal';
}

/**
 * FUTURE: Manual BP entry or sync from BP monitor
 */
export async function recordBPReading(reading: BPReading): Promise<void> {
  // TODO: Store in database
  console.warn('BP recording not yet implemented');
}

// ============================================================================
// INTEGRATED HEALTH DASHBOARD DATA
// ============================================================================

export interface HealthDashboard {
  glucose?: GlucoseTrend;
  activity?: FitbitDailySummary;
  bloodPressure?: BPTrend;
  mealInsights?: string[];
}

/**
 * FUTURE: Fetch all health data for dashboard
 */
export async function fetchHealthDashboard(
  userId: string,
  date: Date
): Promise<HealthDashboard> {
  // TODO: Aggregate all sources
  console.warn('Health dashboard aggregation not yet implemented');
  return {};
}
