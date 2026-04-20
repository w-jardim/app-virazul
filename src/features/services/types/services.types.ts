export type ApiEnvelope<T> = {
  data: T
  meta: unknown | null
  errors: Array<{ code: string; message: string }> | null
}

export type ServiceType = {
  id: number
  key: string
  name: string
  category: string
  allows_reservation: boolean
  counts_in_financial: boolean
}

export type ServiceDateRange = {
  start_date: string | null
  end_date: string | null
}

export type ServiceScope =
  | 'ORDINARY'
  | 'RAS_VOLUNTARY'
  | 'RAS_COMPULSORY'
  | 'PROEIS'
  | 'SEGURANCA_PRESENTE'
  | 'OTHER'

export type InitialOperationalStatus = 'TITULAR' | 'RESERVA'

export type FinancialPreview = {
  base_amount: number
  transport_amount: number
  meal_amount: number
  total_amount: number
}

export type ServiceItem = {
  id: number
  user_id: number
  service_type_id: number
  service_type_key?: string
  service_type_name?: string
  rank_group?: string | null
  start_at: string
  duration_hours: number
  operational_status: string
  financial_status: string
  reservation_expires_at?: string | null
  performed_at?: string | null
  notes?: string | null
  amount_base: number
  amount_paid: number
  amount_balance: number
  amount_meal: number
  amount_transport: number
  amount_additional: number
  amount_discount: number
  amount_total: number
  payment_due_date?: string | null
  payment_at?: string | null
  created_at?: string
  updated_at?: string
  deleted_at?: string | null
}

export type ServiceListFilters = {
  serviceTypeId?: number
  periodStart?: string
  periodEnd?: string
  operationalStatus?: string
  financialStatus?: string
}

export type CreateServiceInput = {
  service_type_id: number
  start_at: string
  duration_hours: number
  operational_status: string
  financial_status: string
  rank_group?: string
  notes?: string | null
  amount_base?: number
  amount_paid?: number
  amount_meal?: number
  amount_transport?: number
  amount_additional?: number
  force?: boolean
}

export type UpdateServiceInput = Partial<CreateServiceInput>

export type ServiceTransitionInput = {
  transition_type: string
  target_operational_status?: string
  target_financial_status?: string
  reason?: string | null
}
