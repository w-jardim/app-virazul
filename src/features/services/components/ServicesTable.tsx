import { Link } from 'react-router-dom'
import type { ServiceItem } from '../types/services.types'

type ServicesTableProps = {
  items: ServiceItem[]
  onConfirmPayment?: (serviceId: number) => void | Promise<void>
  onPromoteReservation?: (serviceId: number) => void | Promise<void>
  busy?: boolean
}

function formatDateTime(value: string) {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return '--'
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(parsed)
}

function formatMoney(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0)
}

function operationalLabel(value: string) {
  const labels: Record<string, string> = {
    TITULAR: 'Titular',
    RESERVA: 'Reserva',
    CONVERTIDO_TITULAR: 'Convertido (titular)',
    REALIZADO: 'Realizado',
    FALTOU: 'Faltou',
    CANCELADO: 'Cancelado',
    NAO_CONVERTIDO: 'Não convertido',
  }
  return labels[value] ?? value
}

function financialLabel(value: string) {
  const labels: Record<string, string> = {
    PREVISTO: 'Previsto',
    PAGO: 'Pago',
    PARCIAL: 'Parcial pago',
    PAGO_PARCIAL: 'Pago parcial',
    PENDENTE: 'Pendente',
    NAO_PAGO: 'Não pago',
    CANCELADO: 'Cancelado',
    ISENTO: 'Isento',
  }
  return labels[value] ?? value
}

const pillClass = 'inline-flex rounded-full px-2 py-0.5 text-xs font-medium'

const ServicesTable = ({ items, onConfirmPayment, onPromoteReservation, busy }: ServicesTableProps) => {
  return (
    <div className="space-y-3">
      <div className="space-y-3 md:hidden">
        {items.map((item) => (
          <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 break-words">
                  {item.service_type_name || item.service_type_key || 'Serviço operacional'}
                </p>
                <p className="mt-1 text-sm text-slate-600">{formatDateTime(item.start_at)}</p>
                <p className="text-xs text-slate-500">{item.duration_hours}h</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">Valor total</p>
                <p className="text-sm font-semibold text-slate-900">{formatMoney(item.amount_total || 0)}</p>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <span className={`${pillClass} bg-slate-100 text-slate-700`}>
                {operationalLabel(item.operational_status)}
              </span>
              <span className={`${pillClass} bg-amber-50 text-amber-700`}>
                {financialLabel(item.financial_status)}
              </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {item.financial_status !== 'PAGO' ? (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => onConfirmPayment?.(item.id)}
                  className="rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
                >
                  Pago
                </button>
              ) : null}

              {item.operational_status === 'RESERVA' ? (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => onPromoteReservation?.(item.id)}
                  className="rounded-md border border-blue-300 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-800 hover:bg-blue-100 disabled:opacity-50"
                >
                  Virou titular
                </button>
              )