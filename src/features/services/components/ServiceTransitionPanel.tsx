import { useMemo, useState } from 'react'
import type { ServiceItem, ServiceTransitionInput } from '../types/services.types'

type ServiceTransitionPanelProps = {
  service: ServiceItem
  busy?: boolean
  onTransition: (payload: ServiceTransitionInput) => void | Promise<void>
}

type QuickTransition = {
  label: string
  transition_type: string
  target_operational_status?: string
  target_financial_status?: string
}

const OPERATIONAL_OPTIONS = [
  { value: '', label: 'Manter situação atual' },
  { value: 'TITULAR', label: 'Titular' },
  { value: 'RESERVA', label: 'Reserva' },
  { value: 'REALIZADO', label: 'Realizado' },
  { value: 'NAO_CONVERTIDO', label: 'Não convertido' },
  { value: 'CONVERTIDO_TITULAR', label: 'Convertido (titular)' },
]

const FINANCIAL_OPTIONS = [
  { value: '', label: 'Manter situação atual' },
  { value: 'PREVISTO', label: 'Previsto' },
  { value: 'PAGO', label: 'Pago' },
  { value: 'PARCIAL', label: 'Parcial pago' },
  { value: 'PENDENTE', label: 'Pendente' },
  { value: 'CANCELADO', label: 'Cancelado' },
  { value: 'ISENTO', label: 'Isento' },
]

function getQuickTransitions(status: string): QuickTransition[] {
  if (status === 'RESERVA') {
    return [
      {
        label: 'Converter para titular',
        transition_type: 'RESERVA_PARA_CONVERTIDO',
        target_operational_status: 'CONVERTIDO_TITULAR'
      },
      {
        label: 'Marcar não convertido',
        transition_type: 'RESERVA_PARA_NAO_CONVERTIDO',
        target_operational_status: 'NAO_CONVERTIDO'
      }
    ]
  }

  if (status === 'TITULAR') {
    return [
      {
        label: 'Marcar realizado',
        transition_type: 'TITULAR_PARA_REALIZADO',
        target_operational_status: 'REALIZADO'
      }
    ]
  }

  if (status === 'CONVERTIDO_TITULAR') {
    return [
      {
        label: 'Marcar realizado',
        transition_type: 'CONVERTIDO_PARA_REALIZADO',
        target_operational_status: 'REALIZADO'
      }
    ]
  }

  return []
}

const ServiceTransitionPanel = ({ service, busy, onTransition }: ServiceTransitionPanelProps) => {
  const [customOperational, setCustomOperational] = useState('')
  const [customFinancial, setCustomFinancial] = useState('')
  const [reason, setReason] = useState('')

  const quickTransitions = useMemo(
    () => getQuickTransitions(service.operational_status),
    [service.operational_status]
  )

  const canApply = !busy && (customOperational !== '' || customFinancial !== '')

  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <h3 className="text-base font-semibold text-slate-900">Transições de status</h3>
        <p className="text-sm text-slate-500">
          Use os atalhos abaixo ou defina manualmente a nova situação do serviço.
        </p>
      </div>

      {quickTransitions.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {quickTransitions.map((item) => (
            <button
              key={item.label}
              type="button"
              disabled={busy}
              onClick={() =>
                onTransition({
                  transition_type: item.transition_type,
                  target_operational_status: item.target_operational_status,
                  target_financial_status: item.target_financial_status
                })
              }
              className="rounded-lg border border-blue-300 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-800 hover:bg-blue-100 disabled:opacity-50"
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}

      <div className="border-t border-slate-100 pt-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Transição manual</p>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-xs font-medium text-slate-600">
            Nova situação operacional
            <select
              value={customOperational}
              onChange={(e) => setCustomOperational(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
            >
              {OPERATIONAL_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </label>

          <label className="block text-xs font-medium text-slate-600">
            Nova situação financeira
            <select
              value={customFinancial}
              onChange={(e) => setCustomFinancial(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
            >
              {FINANCIAL_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </label>

          <label className="block text-xs font-medium text-slate-600 sm:col-span-2">
            Motivo (opcional)
            <input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Descreva o motivo desta alteração..."
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
        </div>

        <div className="mt-3">
          <button
            type="button"
            disabled={!canApply}
            onClick={() =>
              onTransition({
                transition_type: 'TRANSICAO_MANUAL',
                target_operational_status: customOperational || undefined,
                target_financial_status: customFinancial || undefined,
                reason: reason || undefined
              })
            }
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {busy ? 'Aplicando...' : 'Aplicar alteração'}
          </button>
          {!canApply && !busy ? (
            <p className="mt-1.5 text-xs text-slate-400">
              Selecione ao menos uma nova situação para habilitar.
            </p>
          ) : null}
        </div>
      </div>
    </section>
  )
}

export default ServiceTransitionPanel
