import { Link } from 'react-router-dom'
import { formatTime } from '../hooks/useAgendaData'
import type { AgendaServiceItem } from '../types/agenda.types'

type AgendaServiceListProps = {
  title: string
  badgeLabel: string
  items: AgendaServiceItem[]
}

const AgendaServiceList = ({ title, badgeLabel, items }: AgendaServiceListProps) => {
  if (items.length === 0) {
    return null
  }

  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  {item.service_type_name || item.service_type_key || 'Serviço'}
                </p>
                <p className="mt-1 text-xs text-slate-600">
                  {formatTime(item.start_at)} • {item.duration_hours}h • {item.operational_status}
                </p>
              </div>
              <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                {badgeLabel}
              </span>
            </div>
            <Link
              to={`/services/${item.id}`}
              className="mt-2 inline-flex text-xs font-medium text-sky-700 hover:text-sky-800"
            >
              Abrir detalhes
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default AgendaServiceList
