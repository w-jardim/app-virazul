export type UserStatus = 'active' | 'inactive' | 'suspended'

export type SubscriptionPlan = 'free' | 'trial' | 'premium'

export type PaymentStatus = 'paid' | 'pending' | 'overdue'

export type AdminUser = {
  id: number
  name: string
  email: string
  role: 'POLICE' | 'ADMIN_MASTER'
  status: UserStatus
  subscription: SubscriptionPlan
  payment_status: PaymentStatus
  payment_due_date: string | null
  rank_group: string | null
  created_at: string
}

export type CreateUserPayload = {
  name: string
  email: string
  password: string
  role: 'POLICE' | 'ADMIN_MASTER'
  status: UserStatus
  subscription: SubscriptionPlan
  payment_status?: PaymentStatus
  payment_due_date?: string
  rank_group?: string
}

export type UpdateUserPayload = Partial<Omit<CreateUserPayload, 'password'>> & {
  password?: string
}

export type AdminStats = {
  total_users: number
  active_users: number
  inactive_users: number
  suspended_users: number
  by_subscription: {
    free: number
    trial: number
    premium: number
  }
}
