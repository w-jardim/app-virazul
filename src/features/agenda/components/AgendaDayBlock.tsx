import AgendaServiceList from './AgendaServiceList'
import AgendaState from './AgendaState'
import type { AgendaServiceItem } from '../types/agenda.types'

type AgendaDayBlockProps = {
  dateLabel: string
  confirmed: AgendaServiceItem[]
  reservations: AgendaServiceItem[]
}

const AgendaDayBlock = ({ dateLabel, confirmed, reservations }: AgendaDayBlockProps) => {
  const isEmpty = confirmed.length === 0 && reservations.length === 0

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <header className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">{dateLabel}</h3>
        <span className="text-xs text-slate-500">
          {confirmed.length + reservations.length} item(ns)
        </span>
      </header>

      {isEmpty ? (
        <AgendaState title="Sem serviços neste período." description="Adicione uma escala ou novo serviço para aparecer aqui." />
      ) : (
        <div className="space-y-4">
          <AgendaServiceList title="Confirmados" badgeLabel="Confirmado" items={confirmed} />
          <AgendaServiceList title="Reservas" badgeLabel="Reserva" items={reservations} />
        </div>
      )}
    </section>
  )
}

export default AgendaDayBlock
