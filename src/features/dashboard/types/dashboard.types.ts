export type ApiEnvelope<T> = {
  data: T
  meta: unknown | null
  errors: Array<{ code: string; message: string }> | null
}

export type ServiceItem = {
  id: number
  start_at: string
  duration_hours: number
  operational_status: string
  financial_status?: string
  service_type_name?: string
  service_type_key?: string
}

export type DashboardSummary = {
  today: {
    confirmed: ServiceItem[]
    reservations: ServiceItem[]
  }
  counts: {
    alerts_active: number
    operational_pending: number
    financial_pending: number
  }
  hours: {
    confirmed: number
    waiting: number
  }
}

export type AlertItem = {
  id: number
  alert_type: 'DAY' | 'OPERATIONAL' | 'FINANCIAL' | string
  status: 'ACTIVE' | 'READ' | 'DISMISSED' | string
  payload?: {
    service_type_name?: string
    alert_context?: string
    operational_status?: string
    financial_status?: string
  } | null
  created_at: string
}

export type AgendaDay = {
  date: string
  confirmed: ServiceItem[]
  reservations: ServiceItem[]
}

export type PlanningSummary = {
  goal: number
  confirmed_hours: number
  waiting_hours: number
  remaining_hours: number
}

export type FinanceSummary = {
  total_expected: number
  total_received: number
  total_pending: number
  total_overdue: number
  by_status: Record<string, number>
}

export type DashboardDataBundle = {
  summary: DashboardSummary
  alerts: AlertItem[]
  agendaDay: AgendaDay
  planning: PlanningSummary
  finance: FinanceSummary
}
