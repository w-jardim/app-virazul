export type AlertType = 'DAY' | 'OPERATIONAL' | 'FINANCIAL'
export type AlertStatus = 'ACTIVE' | 'READ' | 'DISMISSED'

export type AlertPayload = {
  service_id?: number
  service_type_id?: number
  service_type_key?: string
  service_type_name?: string
  start_at?: string
  operational_status?: string
  financial_status?: string
  duration_hours?: number
  alert_context?: string
}

export type Alert = {
  id: number
  alert_type: AlertType | string
  status: AlertStatus | string
  related_service_id?: number | null
  payload?: AlertPayload | null
  created_at: string
  read_at?: string | null
}

export type AlertListFilters = {
  type?: AlertType
  status?: AlertStatus
}
