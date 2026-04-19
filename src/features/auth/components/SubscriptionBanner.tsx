import React, { useState } from 'react'
import { useSubscription } from '@/features/auth/hooks/useSubscription'
import { useNavigate } from 'react-router-dom'

const TrialConversionPopup: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const navigate = useNavigate()

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl text-center space-y-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-slate-800">Periodo de teste encerrado</h2>
        <p className="text-sm text-slate-500">
          Seu acesso de teste expirou. Voce ainda pode consultar seus dados, mas nao pode criar ou alterar registros.
        </p>
        <p className="text-sm font-medium text-slate-700">
          Ative o plano <span className="text-emerald-600">Premium</span> para ter acesso completo novamente.
        </p>
        <div className="flex flex-col gap-2 pt-2">
          <button
            type="button"
            onClick={() => navigate('/billing')}
            className="block rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition"
          >
            Quero ativar o Premium
          </button>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-slate-400 hover:text-slate-600 transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}

const SubscriptionBanner: React.FC = () => {
  const { canMutate, reason, plan, expiresAt } = useSubscription()
  const [showPopup, setShowPopup] = useState(!canMutate && plan === 'trial')
  const navigate = useNavigate()

  if (canMutate && plan !== 'trial') return null

  if (canMutate && plan === 'trial' && expiresAt) {
    const days = Math.max(0, Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    return (
      <div className="mb-5 flex items-center justify-between gap-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
        <span>
          <strong>Trial gratuito</strong> — Restam <strong>{days} dia{days !== 1 ? 's' : ''}</strong> de acesso completo.
        </span>
        <button
          type="button"
          onClick={() => navigate('/billing')}
          className="whitespace-nowrap rounded-lg bg-blue-700 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-600"
        >
          Ativar Premium — R$ 9,90/mês
        </button>
      </div>
    )
  }

  if (!canMutate && plan === 'trial') {
    return (
      <>
        <div className="mb-5 flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <span><strong>Trial expirado</strong> — Acesso somente leitura. Ative o Premium para continuar.</span>
          <button
            type="button"
            onClick={() => setShowPopup(true)}
            className="whitespace-nowrap rounded-lg bg-blue-700 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-600"
          >
            Ativar Premium
          </button>
        </div>
        {showPopup && <TrialConversionPopup onClose={() => setShowPopup(false)} />}
      </>
    )
  }

  if (!canMutate && reason) {
    return (
      <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
        <strong>Acesso restrito</strong> — {reason}
      </div>
    )
  }

  return null
}

export default SubscriptionBanner
