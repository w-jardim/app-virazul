// ── Insight model ──────────────────────────────────────────────────────────────

export type InsightCategory = 'alert' | 'opportunity' | 'recommendation' | 'trend'

export type InsightSeverity = 'critical' | 'warning' | 'info' | 'positive'

export type Insight = {
  id: string
  category: InsightCategory
  severity: InsightSeverity
  title: string
  description: string
  metric?: string
  action?: { label: string; to: string }
}

// ── Data sources used by the engine ───────────────────────────────────────────

export type InsightSources = {
  planning: {
    goal: number
    confirmed_hours: number
    waiting_hours: number
    remaining_hours: number
    combinations: number
  } | null
  finance: {
    total_expected: number
    total_received: number
    total_pending: number
    total_overdue: number
    by_status: Record<string, number>
  } | null
  operational: {
    total_services: number
    confirmed_hours: number
    realized_hours: number
    waiting_hours: number
    by_operational_status: Record<string, number>
    reservation_metrics: {
      total_reservations: number
      converted_reservations: number
      non_converted_reservations: number
      conversion_rate: number
    }
  } | null
  financial_report: {
    total_expected: number
    total_received: number
    total_pending: number
    total_overdue: number
    received_percentage: number
  } | null
}

// ── Source status for partial error handling ──────────────────────────────────

export type SourceName = 'planning' | 'finance' | 'operational' | 'financial_report'

export type SourceStatus = {
  name: SourceName
  label: string
  isError: boolean
  isLoading: boolean
}
