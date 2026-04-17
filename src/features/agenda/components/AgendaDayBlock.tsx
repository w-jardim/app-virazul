import AgendaServiceList from './AgendaServiceList'
import AgendaState from './AgendaState'
import type { AgendaServiceItem } from '../types/agenda.types'
import type { OrdinaryScheduleEntry } from '@/features/ordinary-schedule/utils/ordinary-schedule-calendar'

type AgendaDayBlockProps = {
  dateLabel: string
  date?: string
  confirmed: AgendaServiceItem[]
  reservations: AgendaServiceItem[]
  onDaySelect?: (date: string) => void
  isOrdinary?: boolean
  ordinaryEntry?: OrdinaryScheduleEntry | null
}

const AgendaDayBlock = ({ date, dateLabel, confirmed, reservations, onDaySelect, isOrdinary, ordinaryEntry }: AgendaDayBlockProps) => {
  const isEmpty = confirmed.length === 0 && reservations.length === 0 && !isOrdinary

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
          {isOrdinary && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Escala ordinária</p>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-sm font-semibold text-slate-800">Escala ordinária</p>
                <p className="mt-1 text-xs text-slate-600">
                  {ordinaryEntry?.start_time ?? '--'} · {ordinaryEntry?.duration_hours ?? '--'}h · ORDINARIO
                </p>
              </div>
            </div>
          )}
          <AgendaServiceList title="Confirmados" badgeLabel="Confirmado" items={confirmed} />
          <AgendaServiceList title="Reservas" badgeLabel="Reserva" items={reservations} />
        </div>
      )}
    </section>
  )
}

export default AgendaDayBlock
