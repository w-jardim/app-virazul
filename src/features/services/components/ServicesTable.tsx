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

function formatDate(value?: string | null) {
  if (!value) return '--'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return '--'
  return new Intl.DateTimeFormat('pt-BR').format(parsed)
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
    NAO_CONVERTIDO: 'Nao convertido',
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
    NAO_PAGO: 'Nao pago',
    CANCELADO: 'Cancelado',
    ISENTO: 'Isento',
  }
  return labels[value] ?? value
}

const pillClass = 'inline-flex rounded-full px-2 py-0.5 text-xs font-medium'

const PaymentStatusButton: React.FC<{
  status: string
  current: string
  disabled?: boolean
  onClick: () => void
}> = ({ status, current, disabled, onClick }) => (
  <button
    type="button"
    disabled={disabled || status === current}
    onClick={onClick}
    className={[
      'rounded-md border px-3 py-1.5 text-xs font-semibold transition',
      status === current
        ? 'border-slate-800 bg-slate-800 text-white cursor-default'
        : 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
    ].join(' ')}
  >
    Pago
  </button>
)

const PromoteButton: React.FC<{
  disabled?: boolean
  onClick: () => void
}> = ({ disabled, onClick }) => (
  <button
    type="button"
    disabled={disabled}
    onClick={onClick}
    className="rounded-md border border-blue-300 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-800 transition hover:bg-blue-100 disabled:opacity-50"
  >
    Virou titular
  </button>
)

const ServicesTable = ({ items, onConfirmPayment, onPromoteReservation, busy }: ServicesTableProps) => {
  return (
    <div className="space-y-3">
      <div className="space-y-3 md:hidden">
        {items.map((item) => (
          <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="break-words text-sm font-semibold text-slate-900">
                  {item.service_type_name || item.service_type_key || 'Servico operacional'}
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
              <span className={`${pillClass} bg-slate-100 text-slate-700`}>{operationalLabel(item.operational_status)}</span>
              <span className={`${pillClass} bg-amber-50 text-amber-700`}>{financialLabel(item.financial_status)}</span>
            </div>

            <div className="mt-3 text-xs text-slate-500">
              <span>Vencimento: </span>
              <span className="font-medium text-slate-700">{formatDate(item.payment_due_date)}</span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {item.financial_status !== 'PAGO' ? (
                <PaymentStatusButton
                  status="PAGO"
                  current={item.financial_status}
                  disabled={busy}
                  onClick={() => onConfirmPayment?.(item.id)}
                />
              ) : null}

              {item.operational_status === 'RESERVA' ? (
                <PromoteButton disabled={busy} onClick={() => onPromoteReservation?.(item.id)} />
              ) : null}

              <Link
                to={`/services/${item.id}`}
                className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Detalhes
              </Link>
            </div>
          </article>
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm md:block">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-100 bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-slate-500">Servico</th>
              <th className="px-4 py-3 text-left font-medium text-slate-500">Inicio</th>
              <th className="px-4 py-3 text-left font-medium text-slate-500">Status</th>
              <th className="px-4 py-3 text-left font-medium text-slate-500">Financeiro</th>
              <th className="px-4 py-3 text-left font-medium text-slate-500">Total</th>
              <th className="px-4 py-3 text-left font-medium text-slate-500">Acoes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-800">{item.service_type_name || item.service_type_key || 'Servico operacional'}</div>
                  <div className="text-xs text-slate-500">{item.duration_hours}h</div>
                </td>
                <td className="px-4 py-3 text-slate-600">
                  <div>{formatDateTime(item.start_at)}</div>
                  <div className="text-xs text-slate-500">Venc.: {formatDate(item.payment_due_date)}</div>
                </td>
                <td className="px-4 py-3">
                  <span className={`${pillClass} bg-slate-100 text-slate-700`}>{operationalLabel(item.operational_status)}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`${pillClass} bg-amber-50 text-amber-700`}>{financialLabel(item.financial_status)}</span>
                </td>
                <td className="px-4 py-3 font-medium text-slate-800">{formatMoney(item.amount_total || 0)}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    {item.financial_status !== 'PAGO' ? (
                      <PaymentStatusButton
                        status="PAGO"
                        current={item.financial_status}
                        disabled={busy}
                        onClick={() => onConfirmPayment?.(item.id)}
                      />
                    ) : null}
                    {item.operational_status === 'RESERVA' ? (
                      <PromoteButton disabled={busy} onClick={() => onPromoteReservation?.(item.id)} />
                    ) : null}
                    <Link
                      to={`/services/${item.id}`}
                      className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Detalhes
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ServicesTable
