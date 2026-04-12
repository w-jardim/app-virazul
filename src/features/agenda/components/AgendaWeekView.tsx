import AgendaDayBlock from './AgendaDayBlock'
import type { AgendaWeekPayload } from '../types/agenda.types'

const AgendaWeekView = ({ data }: { data: AgendaWeekPayload }) => {
  return (
    <div className="space-y-3">
      {data.days.map((day) => (
        <AgendaDayBlock
          key={day.date}
          dateLabel={new Intl.DateTimeFormat('pt-BR', { dateStyle: 'full' }).format(new Date(`${day.date}T12:00:00Z`))}
          confirmed={day.confirmed}
          reservations={day.reservations}
        />
      ))}
    </div>
  )
}

export default AgendaWeekView
