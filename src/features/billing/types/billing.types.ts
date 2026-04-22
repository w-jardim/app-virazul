export type BillingPlan =
  | 'plan_free'
  | 'plan_starter'
  | 'plan_pro'
  | 'plan_partner'
  | 'free'
  | 'trial'
  | 'premium'
export type BillingStatus = 'trialing' | 'active' | 'pending' | 'past_due' | 'expired' | 'canceled' | 'cancelled'

export type BillingLatestPayment = {
  status: string
  amount_cents: number
  payment_method: string | null
  paid_at: string | null
  created_at: string | null
}

export type BillingSubscription = {
  plan: BillingPlan
  plan_name: string
  plan_price_cents: number
  status: BillingStatus | string
  started_at: string | null
  trial_ends_at: string | null
  current_period_start: string | null
  current_period_end: string | null
  next_billing_at: string | null
  canceled_at: string | null
  latest_payment: BillingLatestPayment | null
}

export type CheckoutPremiumResponse = {
  checkout_url: string
  preference_id: string
  payment_id: number
}

export type PixChargeResponse = {
  payment_id: number
  mp_payment_id: number | string
  status: string
  qr_code: string | null
  qr_code_base64: string | null
  ticket_url: string | null
}

export type CancelSubscriptionResponse = {
  canceled: boolean
}
