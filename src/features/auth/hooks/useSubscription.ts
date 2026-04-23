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

    const { subscription, payment_due_date } = user

    if (subscription === 'plan_free' || subscription === 'plan_partner') {
      return { canMutate: true, plan: subscription, reason: null, expiresAt: null }
    }

    if (subscription === 'plan_starter' || subscription === 'plan_pro') {
      if (!payment_due_date) {
        return { canMutate: true, plan: subscription, reason: null, expiresAt: null }
      }
      const due = new Date(payment_due_date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const isExpired = today > due
      return {
        canMutate: !isExpired,
        plan: subscription,
        reason: isExpired ? 'Seu plano venceu. Renove para continuar operando.' : null,
        expiresAt: due,
      }
    }

    return { canMutate: false, plan: subscription, reason: 'Plano invalido ou nao suportado.', expiresAt: null }
  }, [user])
}
