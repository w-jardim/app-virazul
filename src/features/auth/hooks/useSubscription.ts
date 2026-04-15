import { useMemo } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import type { SubscriptionPlan } from '../types/auth.types'

export type SubscriptionStatus = {
  plan: SubscriptionPlan | null
  canMutate: boolean
  reason: string | null
  expiresAt: Date | null
}

export function useSubscription(): SubscriptionStatus {
  const user = useAuthStore((s) => s.user)

  return useMemo(() => {
    if (!user) return { canMutate: false, plan: null, reason: null, expiresAt: null }

    const { subscription, payment_due_date, created_at } = user

    if (subscription === 'free') {
      return { canMutate: true, plan: 'free', reason: null, expiresAt: null }
    }

    if (subscription === 'trial') {
      const created = new Date(created_at)
      const expiry = new Date(created.getTime() + 30 * 24 * 60 * 60 * 1000)
      const isExpired = new Date() > expiry
      return {
        canMutate: !isExpired,
        plan: 'trial',
        reason: isExpired ? 'Seu periodo de teste expirou. Entre em contato para ativar seu plano.' : null,
        expiresAt: expiry,
      }
    }

    if (subscription === 'premium') {
      if (!payment_due_date) {
        return { canMutate: true, plan: 'premium', reason: null, expiresAt: null }
      }
      const due = new Date(payment_due_date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const isExpired = today > due
      return {
        canMutate: !isExpired,
        plan: 'premium',
        reason: isExpired ? 'Seu plano Premium venceu. Renove para continuar operando.' : null,
        expiresAt: due,
      }
    }

    return { canMutate: true, plan: subscription, reason: null, expiresAt: null }
  }, [user])
}
