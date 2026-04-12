export type ApiEnvelope<T> = {
  data: T
  meta: unknown | null
  errors: Array<{ code: string; message: string }> | null
}

export type AgendaServiceItem = {
  id: number
  user_id: number
  service_type_id: number
  start_at: string
  duration_hours: number
  operational_status: string
  financial_status: string
  notes?: string | null
  service_type_key?: string
  service_type_name?: string
  service_category?: string
}

export type AgendaDayPayload = {
  date: string
  confirmed: AgendaServiceItem[]
  reservations: AgendaServiceItem[]
}

export type AgendaWeekDayPayload = {
  date: string
  confirmed: AgendaServiceItem[]
  reservations: AgendaServiceItem[]
}

export type AgendaWeekPayload = {
  start: string
  end: string
  days: AgendaWeekDayPayload[]
}

export type AgendaMonthPayload = {
  month: string
  days: AgendaWeekDayPayload[]
}

export type AgendaViewMode = 'day' | 'week' | 'month'
