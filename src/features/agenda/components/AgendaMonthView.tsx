import AgendaDayBlock from './AgendaDayBlock'
import AgendaState from './AgendaState'
import type { AgendaMonthPayload } from '../types/agenda.types'

const AgendaMonthView = ({ data }: { data: AgendaMonthPayload }) => {
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
          dateLabel={new Intl.DateTimeFormat('pt-BR', { dateStyle: 'full' }).format(new Date(`${day.date}T12:00:00Z`))}
          confirmed={day.confirmed}
          reservations={day.reservations}
        />
      ))}
    </div>
  )
}

export default AgendaMonthView
