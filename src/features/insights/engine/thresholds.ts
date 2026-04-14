import type { InsightSeverity } from '../types/insights.types'

// ── Thresholds ────────────────────────────────────────────────────────────────
// Centralized configuration for all insight generation rules.
// Values here drive the engine — no magic numbers in the rules themselves.

export const INSIGHT_THRESHOLDS = {
  // Alerts
  overdueFinanceCriticalPct: 30,
  faultsCancellationsCriticalPct: 25,
  lowConversionRate: 40,
  lowGoalProgress: 0.25,
  minReservationsForConversion: 3,

  // Opportunities
  nearGoalRemainingPct: 0.30,
  goodReceiptRate: 80,

  // Recommendations
  highReserveCount: 3,
  goodConversionRate: 70,
  highPendingRatio: 0.50,

  // Trends
  goodRealizationRate: 80,
  goodConversionTrend: 60,
  goodFinancialEvolution: 70,
} as const

// ── Limits ────────────────────────────────────────────────────────────────────

export const INSIGHT_LIMITS = {
  maxPerCategory: 5,
  maxTotal: 12,
} as const

// ── Severity priority (lower = higher priority) ─────────────────────────────

export const SEVERITY_PRIORITY: Record<InsightSeverity, number> = {
  critical: 0,
  warning: 1,
  info: 2,
  positive: 3,
}
