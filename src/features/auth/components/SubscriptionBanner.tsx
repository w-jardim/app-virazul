import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useSubscription } from '@/features/auth/hooks/useSubscription'

const SubscriptionBanner: React.FC = () => {
  const navigate = useNavigate()
  const { canMutate, reason } = useSubscription()

  if (canMutate) return null

  return (
    <div className="mb-5 flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
      <span><strong>Acesso restrito</strong> — {reason || 'Seu plano atual nao permite operacoes de escrita.'}</span>
      <button
        type="button"
        onClick={() => navigate('/billing')}
        className="whitespace-nowrap rounded-lg bg-blue-700 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-600"
      >
        Ver planos
      </button>
    </div>
  )
}

export default SubscriptionBanner
