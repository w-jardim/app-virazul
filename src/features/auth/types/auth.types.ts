import type { ScheduleTemplate } from '@/features/ordinary-schedule/types/schedule.types'

export type UserRole = 'POLICE' | 'ADMIN_MASTER'
export type SubscriptionPlan =
  | 'plan_free'
  | 'plan_starter'
  | 'plan_pro'
  | 'plan_partner'
export type PaymentState =
  | 'payment_ok'
  | 'payment_pending'
  | 'payment_overdue'
  | 'payment_blocked'
  | 'payment_exempt'
export type RankGroup =
  | 'OFICIAIS_SUPERIORES'
  | 'CAPITAO_TENENTE'
  | 'SUBTENENTE_SARGENTO'
  | 'CABO_SOLDADO'

export type PlanEntitlements = {
  canView: boolean
  canCreate: boolean
  canEdit: boolean
  canDelete: boolean
  canPersistData: boolean
  isFullAccess: boolean
  hasLimitedTools: boolean
  hasAds: boolean
  paymentRequired: boolean
  isBillingBlocked: boolean
  isPreviewMode: boolean
  requiresUpgradeCta: boolean
  isTemporaryPersistence: boolean
}

export type AuthUser = {
  id: number
  name: string
  email: string
  role: UserRole
  rank_group: RankGroup | null
  subscription: SubscriptionPlan
  payment_due_date: string | null
  created_at: string
  session_expires_at?: string | null
  payment_state?: PaymentState | null
  partner_active?: boolean
  entitlements?: PlanEntitlements | null
  monthly_hour_goal?: number | null
  planning_preferences?: Record<string, unknown> | null
  schedule_template?: ScheduleTemplate | null
}

export type LoginInput = {
  email: string
  password: string
}

export type GoogleLoginInput = {
  id_token: string
}

export type RegisterInput = {
  name: string
  email: string
  password: string
  password_confirm?: string
  rank_group?: RankGroup | null
}

export type LoginResponse = {
  token: string
  user: AuthUser
}

export type AuthApiResponse<T> = {
  data: T
  meta: unknown | null
  errors: Array<{ code: string; message: string }> | null
}
