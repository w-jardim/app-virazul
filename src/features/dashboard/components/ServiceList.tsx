import type { ServiceItem } from '../types/dashboard.types'
import { formatDateTime } from '../hooks/dashboard.format'

type ServiceListProps = {
  items: ServiceItem[]
  badge: 'Confirmado' | 'Reserva'
}

const ServiceList = ({ items, badge }: ServiceListProps) => {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item.id} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-slate-800">{item.service_type_name || item.service_type_key}</p>
            <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
              {badge}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-600">
            {formatDateTime(item.start_at)} • {item.duration_hours}h • {item.operational_status}
          </p>
        </li>
      ))}
    </ul>
  )
}

export default ServiceList
