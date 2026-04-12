export type ApiEnvelope<T> = {
  data: T
  meta: unknown | null
  errors: Array<{ code: string; message: string }> | null
}

export type FinanceSummary = {
  total_expected: number
  total_received: number
  total_pending: number
  total_overdue: number
  by_status: Record<string, number>
}

export type FinanceReportItem = {
  id: number
  start_at: string
  service_type: string
  service_type_name: string
  financial_status: string
  amount_total: number
  amount_paid: number
  amount_balance: number
  payment_due_date: string | null
}

export type FinanceReportByServiceType = {
  service_type: string
  service_type_name: string
  total_expected: number
  total_received: number
  total_pending: number
  total_overdue: number
}

/** Shape real retornado pelo GET /api/v1/finance/report */
export type FinanceReport = {
  filters: {
    start_date: string | null
    end_date: string | null
    service_type: string | null
    financial_status: string | null
  }
  summary: FinanceSummary
  by_service_type: FinanceReportByServiceType[]
  items: FinanceReportItem[]
}

export type FinanceReportFilters = {
  start_date?: string
  end_date?: string
  service_type?: string
  financial_status?: string
}
