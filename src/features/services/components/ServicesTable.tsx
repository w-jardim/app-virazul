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
  if (Number.isNaN(parsed.getTime())) {
    return '--'
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short'
  }).format(parsed)
}

const ServicesTable = ({ items, onConfirmPayment, onPromoteReservation, busy }: ServicesTableProps) => {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3 text-left">Data/Hora</th>
            <th className="px-4 py-3 text-left">Tipo</th>
            <th className="px-4 py-3 text-left">Operacional</th>
            <th className="px-4 py-3 text-left">Financeiro</th>
            <th className="px-4 py-3 text-left">Valor total</th>
            <th className="px-4 py-3 text-right">Ações</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-t border-slate-200">
              <td className="px-4 py-3 text-slate-700">
                {formatDateTime(item.start_at)}
                <div className="text-xs text-slate-500">{item.duration_hours}h</div>
              </td>
              <td className="px-4 py-3 text-slate-700">{item.service_type_name || item.service_type_key || '--'}</td>
              <td className="px-4 py-3">
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                  {item.operational_status}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                  {item.financial_status}
                </span>
              </td>
              <td className="px-4 py-3 text-slate-700">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.amount_total || 0)}
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex justify-end gap-2">
                  {item.financial_status !== 'PAGO' ? (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => onConfirmPayment?.(item.id)}
                      className="rounded-md border border-emerald-300 bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
                    >
                      Pago
                    </button>
                  ) : null}

                  {item.operational_status === 'RESERVA' ? (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => onPromoteReservation?.(item.id)}
                      className="rounded-md border border-sky-300 bg-sky-50 px-2 py-1 text-xs font-semibold text-sky-700 hover:bg-sky-100 disabled:opacity-50"
                    >
                      Virou titular
                    </button>
                  ) : null}

                  <Link to={`/services/${item.id}`} className="text-xs font-semibold text-sky-700 hover:text-sky-800">
                    Ver detalhes
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ServicesTable
