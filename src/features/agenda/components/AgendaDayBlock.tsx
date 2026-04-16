import AgendaServiceList from './AgendaServiceList'
import AgendaState from './AgendaState'
import type { AgendaServiceItem } from '../types/agenda.types'

type AgendaDayBlockProps = {
  dateLabel: string
  date?: string
  confirmed: AgendaServiceItem[]
  reservations: AgendaServiceItem[]
  onDaySelect?: (date: string) => void
}

const AgendaDayBlock = ({ date, dateLabel, confirmed, reservations, onDaySelect }: AgendaDayBlockProps) => {
  const isEmpty = confirmed.length === 0 && reservations.length === 0

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <header className="mb-4 flex items-center justify-between">
        {onDaySelect && date ? (
          <button
            type="button"
            onClick={() => onDaySelect(date)}
            className="text-left text-sm font-semibold text-slate-900 hover:underline"
          >
            {dateLabel}
          </button>
        ) : (
          <h3 className="text-sm font-semibold text-slate-900">{dateLabel}</h3>
        )}
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
