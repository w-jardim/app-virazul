import type { ServiceItem } from '../types/services.types'

const OPERATIONAL_LABELS: Record<string, string> = {
  AGENDADO: 'Agendado',
  TITULAR: 'Titular',
  RESERVA: 'Reserva',
  REALIZADO: 'Realizado',
  NAO_CONVERTIDO: 'Não convertido',
  CONVERTIDO_TITULAR: 'Convertido (titular)',
}

const FINANCIAL_LABELS: Record<string, string> = {
  PREVISTO: 'Previsto',
  PAGO: 'Pago',
  PARCIAL: 'Parcial pago',
  PENDENTE: 'Pendente',
  CANCELADO: 'Cancelado',
  ISENTO: 'Isento',
}

function label(map: Record<string, string>, value: string): string {
  return map[value] ?? value
}

function formatDateTime(value?: string | null) {
  if (!value) return '--'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return '--'
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeStyle: 'short' }).format(parsed)
}

function money(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0)
}

type ServiceDetailCardProps = {
  service: ServiceItem
}

const ServiceDetailCard = ({ service }: ServiceDetailCardProps) => {
  // Deduplica: se criado_em === atualizado_em, exibe apenas "Registrado em"
  const sameDate = service.created_at && service.updated_at && service.created_at === service.updated_at

  const historyItems = [
    sameDate
      ? { label: 'Registrado em', value: formatDateTime(service.created_at) }
      : { label: 'Criado em', value: formatDateTime(service.created_at) },
    ...(!sameDate ? [{ label: 'Última atualização', value: formatDateTime(service.updated_at) }] : []),
    { label: 'Realizado em', value: formatDateTime(service.performed_at) },
    { label: 'Pagamento em', value: formatDateTime(service.payment_at) },
  ].filter((item) => item.value !== '--')

  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <header>
        <h2 className="text-xl font-semibold text-slate-900">
          {service.service_type_name || service.service_type_key || `Serviço #${service.id}`}
        </h2>
        <p className="mt-0.5 text-sm text-slate-400">Serviço #{service.id}</p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Situação operacional</p>
          <p className="mt-1 text-sm font-semibold text-slate-800">{label(OPERATIONAL_LABELS, service.operational_status)}</p>
          <p className="mt-2 text-xs text-slate-600">Início: {formatDateTime(service.start_at)}</p>
          <p className="text-xs text-slate-600">Duração: {service.duration_hours}h</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Situação financeira</p>
          <p className="mt-1 text-sm font-semibold text-slate-800">{label(FINANCIAL_LABELS, service.financial_status)}</p>
          <p className="mt-2 text-xs text-slate-600">Total: {money(service.amount_total)}</p>
          <p className="text-xs text-slate-600">Pago: {money(service.amount_paid)}</p>
          <p className="text-xs text-slate-600">Saldo: {money(service.amount_balance)}</p>
        </div>
      </div>

      {historyItems.length > 0 ? (
        <div className="rounded-xl border border-slate-200 p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Linha do tempo</p>
          <ul className="mt-2 space-y-1">
            {historyItems.map((item) => (
              <li key={item.label} className="text-sm text-slate-700">
                <span className="font-medium">{item.label}:</span> {item.value}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {service.notes ? (
        <div className="rounded-xl border border-slate-200 p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Observações</p>
          <p className="mt-1 text-sm text-slate-700">{service.notes}</p>
        </div>
      ) : null}
    </section>
  )
}

export default ServiceDetailCard
