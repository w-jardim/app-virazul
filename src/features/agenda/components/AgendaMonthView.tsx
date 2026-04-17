import AgendaDayBlock from './AgendaDayBlock'
import AgendaState from './AgendaState'
import type { AgendaMonthPayload } from '../types/agenda.types'
import type { OrdinaryScheduleEntry } from '@/features/ordinary-schedule/utils/ordinary-schedule-calendar'

type AgendaMonthViewProps = {
  data: AgendaMonthPayload
  onDaySelect?: (date: string) => void
  ordinaryMap?: Record<string, OrdinaryScheduleEntry>
}

const AgendaMonthView = ({ data, onDaySelect, ordinaryMap }: AgendaMonthViewProps) => {
  if (data.days.length === 0) {
    return (
      <AgendaState
        title="Sem serviços no mês selecionado."
        description="Tente outro período ou cadastre um novo serviço."
      />
    )
  }

  return (
    <div className="space-y-3">
      {data.days.map((day) => (
        <AgendaDayBlock
          key={day.date}
          date={day.date}
          dateLabel={new Intl.DateTimeFormat('pt-BR', { dateStyle: 'full' }).format(new Date(`${day.date}T12:00:00Z`))}
          confirmed={day.confirmed}
          reservations={day.reservations}
          onDaySelect={onDaySelect}
          isOrdinary={ordinaryMap ? Boolean(ordinaryMap[day.date]) : false}
          ordinaryEntry={ordinaryMap?.[day.date] ?? null}
        />
      ))}
    </div>
  )
}

export default AgendaMonthView
