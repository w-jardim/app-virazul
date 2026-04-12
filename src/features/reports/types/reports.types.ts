export type ApiEnvelope<T> = {
  data: T
  meta: unknown | null
  errors: Array<{ code: string; message: string }> | null
}

// ── Operational ───────────────────────────────────────────────────────────────

export type OperationalReportReservation = {
  total_reservations: number
  converted_reservations: number
  non_converted_reservations: number
  conversion_rate: number
}

export type OperationalReportSummary = {
  total_services: number
  confirmed_hours: number
  realized_hours: number
  waiting_hours: number
}

/** Shape real retornado pelo GET /api/v1/reports/operational */
export type OperationalReport = {
  summary: OperationalReportSummary
  by_operational_status: Record<string, number>
  reservation_metrics: OperationalReportReservation
}

// ── Financial ─────────────────────────────────────────────────────────────────

export type FinancialReportSummary = {
  total_expected: number
  total_received: number
  total_pending: number
  total_overdue: number
  received_percentage: number
  pending_percentage: number
  top_service_type: string | null
}

/** Shape real retornado pelo GET /api/v1/reports/financial */
export type FinancialReport = {
  summary: FinancialReportSummary
  by_financial_status: Record<string, number>
  by_service_type: Record<string, number>
}

// ── Filters ───────────────────────────────────────────────────────────────────

export type ReportFilters = {
  start_date?: string
  end_date?: string
  service_type?: string
  operational_status?: string
  financial_status?: string
}
