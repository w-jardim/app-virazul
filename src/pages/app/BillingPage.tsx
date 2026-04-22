import React, { useMemo, useState } from 'react'
import {
  useBilling,
  useCheckoutPro,
  usePixCharge,
  useCancelSubscription
} from '@/features/billing/hooks/useBilling'

function formatDate(value?: string | null) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short'
  }).format(date)
}

function formatMoney(valueCents?: number | null) {
  const amount = Number(valueCents || 0) / 100
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(amount)
}

function statusLabel(status?: string | null) {
  switch (status) {
    case 'trialing':
      return 'Período de teste'
    case 'active':
      return 'Ativa'
    case 'pending':
      return 'Pendente'
    case 'past_due':
      return 'Pagamento em atraso'
    case 'expired':
      return 'Expirada'
    case 'canceled':
    case 'cancelled':
      return 'Cancelada'
    default:
      return status || '-'
  }
}

const BillingPage: React.FC = () => {
  const { data, isLoading, isError, refetch } = useBilling()
  const checkout = useCheckoutPro()
  const pix = usePixCharge()
  const cancel = useCancelSubscription()

  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [pixCode, setPixCode] = useState<string | null>(null)
  const [pixTicketUrl, setPixTicketUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const latestPaymentSummary = useMemo(() => {
    if (!data?.latest_payment) return null
    return `${statusLabel(data.latest_payment.status)} · ${formatMoney(data.latest_payment.amount_cents)}${data.latest_payment.payment_method ? ` · ${data.latest_payment.payment_method}` : ''}`
  }, [data])

  const clearFeedback = () => {
    setErrorMessage(null)
    setSuccessMessage(null)
  }

  const handleCheckout = async () => {
    clearFeedback()
    try {
      const res = await checkout.mutateAsync()
      if (!res?.checkout_url) {
        throw new Error('Checkout indisponível no momento.')
      }
      window.location.href = res.checkout_url
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.errors?.[0]?.message || error?.message || 'Não foi possível iniciar o checkout agora.')
    }
  }

  const handlePix = async () => {
    clearFeedback()
    setCopied(false)
    try {
      const res = await pix.mutateAsync()
      setPixCode(res?.qr_code || null)
      setPixTicketUrl(res?.ticket_url || null)
      setSuccessMessage('Cobrança Pix gerada com sucesso.')
      await refetch()
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.errors?.[0]?.message || error?.message || 'Não foi possível gerar o Pix agora.')
    }
  }

  const handleCancel = async () => {
    clearFeedback()
    const confirmed = window.confirm('Deseja realmente cancelar a assinatura atual?')
    if (!confirmed) return

    try {
      await cancel.mutateAsync()
      setPixCode(null)
      setPixTicketUrl(null)
      setSuccessMessage('Assinatura cancelada com sucesso.')
      await refetch()
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.errors?.[0]?.message || error?.message || 'Não foi possível cancelar a assinatura agora.')
    }
  }

  const handleCopyPix = async () => {
    if (!pixCode) return
    try {
      await navigator.clipboard.writeText(pixCode)
      setCopied(true)
      setSuccessMessage('Código Pix copiado.')
    } catch {
      setErrorMessage('Não foi possível copiar o código Pix.')
    }
  }

  if (isLoading) {
    return <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500">Carregando assinatura...</div>
  }

  if (isError || !data) {
    return <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">Não foi possível carregar os dados da assinatura.</div>
  }

  const isBusy = checkout.isPending || pix.isPending || cancel.isPending

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Assinatura</h1>
        <p className="mt-1 text-sm text-slate-500">Gerencie seu plano, pagamento e renovação.</p>
      </div>

      {errorMessage ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}

      {successMessage ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {successMessage}
        </div>
      ) : null}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Plano</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">{data.plan_name}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Status</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">{statusLabel(data.status)}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Próxima cobrança</p>
            <p className="mt-1 text-sm text-slate-700">{formatDate(data.next_billing_at || data.current_period_end || data.trial_ends_at)}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Valor</p>
            <p className="mt-1 text-sm text-slate-700">{formatMoney(data.plan_price_cents)}</p>
          </div>
        </div>

        {latestPaymentSummary ? (
          <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
            <strong>Último pagamento:</strong> {latestPaymentSummary}
          </div>
        ) : null}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={handleCheckout}
          disabled={isBusy}
          className="rounded-xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {checkout.isPending ? 'Abrindo checkout...' : 'Assinar Pro'}
        </button>

        <button
          type="button"
          onClick={handlePix}
          disabled={isBusy}
          className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pix.isPending ? 'Gerando Pix...' : 'Pagar com Pix'}
        </button>

        <button
          type="button"
          onClick={handleCancel}
          disabled={isBusy}
          className="rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {cancel.isPending ? 'Cancelando...' : 'Cancelar'}
        </button>
      </div>

      {pixCode ? (
        <div className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm space-y-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Pix gerado</h2>
            <p className="mt-1 text-sm text-slate-500">Use o código abaixo no app do seu banco.</p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-700 break-all">
            {pixCode}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleCopyPix}
              className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              {copied ? 'Código copiado' : 'Copiar código Pix'}
            </button>

            {pixTicketUrl ? (
              <a
                href={pixTicketUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-blue-300 px-4 py-3 text-center text-sm font-medium text-blue-700 transition hover:bg-blue-50"
              >
                Abrir comprovante / QR
              </a>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default BillingPage
