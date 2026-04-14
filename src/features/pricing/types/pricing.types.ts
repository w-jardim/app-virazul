export type BaseValue = {
  id: number
  rank_group: string
  duration_hours: number
  base_amount: number
  valid_from: string
  valid_until: string | null
  created_at: string
}

export type FinancialRule = {
  id: number
  service_scope: string
  allow_transport: boolean
  transport_amount: number
  allow_meal: boolean
  meal_amount: number
  valid_from: string
  valid_until: string | null
  created_at: string
}

export type PricingPreview = {
  base_amount: number
  transport_amount: number
  meal_amount: number
  total_amount: number
  pricing_source: string
}

export type PreviewParams = {
  service_scope: string
  rank_group: string
  duration_hours: number
  date?: string
}

export const RANK_GROUPS = [
  'OFICIAIS_SUPERIORES',
  'CAPITAO_TENENTE',
  'SUBTENENTE_SARGENTO',
  'CABO_SOLDADO',
] as const

export type RankGroup = (typeof RANK_GROUPS)[number]

export const SERVICE_SCOPES = [
  'RAS_VOLUNTARY',
  'RAS_COMPULSORY',
  'PROEIS',
  'SEGURANCA_PRESENTE',
] as const

export type ServiceScope = (typeof SERVICE_SCOPES)[number]
