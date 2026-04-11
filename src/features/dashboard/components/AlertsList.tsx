import type { AlertItem } from '../types/dashboard.types'

function alertLabel(type: string) {
  if (type === 'DAY') {
    return 'Do dia'
  }
  if (type === 'OPERATIONAL') {
    return 'Operacional'
  }
  if (type === 'FINANCIAL') {
    return 'Financeiro'
  }
  return type
}

const AlertsList = ({ items }: { items: AlertItem[] }) => {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item.id} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-slate-800">{alertLabel(item.alert_type)}</p>
            <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
              {item.status}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-600">
            {item.payload?.service_type_name || item.payload?.alert_context || 'Sem detalhe adicional'}
          </p>
        </li>
      ))}
    </ul>
  )
}

export default AlertsList
