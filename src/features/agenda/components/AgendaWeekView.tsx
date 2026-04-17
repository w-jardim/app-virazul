import AgendaDayBlock from './AgendaDayBlock'
import type { AgendaWeekPayload } from '../types/agenda.types'
import type { OrdinaryScheduleEntry } from '@/features/ordinary-schedule/utils/ordinary-schedule-calendar'

type AgendaWeekViewProps = {
  data: AgendaWeekPayload
  ordinaryMap?: Record<string, OrdinaryScheduleEntry>
}

const AgendaWeekView = ({ data, ordinaryMap }: AgendaWeekViewProps) => {
  return (
    <div className="space-y-3">
      {data.days.map((day) => (
        <AgendaDayBlock
          key={day.date}
          date={day.date}
          dateLabel={new Intl.DateTimeFormat('pt-BR', { dateStyle: 'full' }).format(new Date(`${day.date}T12:00:00Z`))}
          confirmed={day.confirmed}
          reservations={day.reservations}
          isOrdinary={ordinaryMap ? Boolean(ordinaryMap[day.date]) : false}
          ordinaryEntry={ordinaryMap?.[day.date] ?? null}
        />
      ))}
    </div>
  )
}

export default AgendaWeekView
