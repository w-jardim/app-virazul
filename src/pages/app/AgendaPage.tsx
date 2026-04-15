import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import AgendaDayBlock from '@/features/agenda/components/AgendaDayBlock'
import AgendaMonthView from '@/features/agenda/components/AgendaMonthView'
import AgendaState from '@/features/agenda/components/AgendaState'
import AgendaToolbar from '@/features/agenda/components/AgendaToolbar'
import AgendaWeekView from '@/features/agenda/components/AgendaWeekView'
import {
  getDateKey,
  getMonthKey,
  useAgendaDay,
  useAgendaMonth,
  useAgendaWeek
} from '@/features/agenda/hooks/useAgendaData'
import type { AgendaViewMode } from '@/features/agenda/types/agenda.types'

const AgendaPage: React.FC = () => {
  const [mode, setMode] = useState<AgendaViewMode>('day')
  const [day, setDay] = useState(getDateKey())
  const [weekStart, setWeekStart] = useState(getDateKey())
  const [month, setMonth] = useState(getMonthKey())

  const dayQuery = useAgendaDay(day)
  const weekQuery = useAgendaWeek(weekStart)
  const monthQuery = useAgendaMonth(month)

  const currentQuery = useMemo(() => {
    if (mode === 'week') {
      return weekQuery
    }
    if (mode === 'month') {
      return monthQuery
    }
    return dayQuery
  }, [dayQuery, mode, monthQuery, weekQuery])

  return (
    <div className="space-y-4" data-testid="agenda-page">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Agenda operacional</h1>
          <p className="text-sm text-slate-600">Visualize escala ordinaria e servicos por dia, semana ou mes.</p>
        </div>
        <Link
          to="/services/new"
          className="inline-flex items-center justify-center rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700"
        >
          Novo servico
        </Link>
      </header>

      <AgendaToolbar
        mode={mode}
        day={day}
        weekStart={weekStart}
        month={month}
        onModeChange={setMode}
        onDayChange={setDay}
        onWeekStartChange={setWeekStart}
        onMonthChange={setMonth}
      />

      {currentQuery.isLoading ? (
        <AgendaState title="Carregando agenda..." description="Buscando dados atualizados do periodo selecionado." />
      ) : currentQuery.isError ? (
        <AgendaState
          tone="error"
          title="Falha ao carregar agenda"
          description="Nao foi possivel obter os dados. Tente novamente."
        />
      ) : mode === 'day' && dayQuery.data ? (
        <AgendaDayBlock
          dateLabel={new Intl.DateTimeFormat('pt-BR', { dateStyle: 'full' }).format(new Date(`${day}T12:00:00Z`))}
          confirmed={dayQuery.data.confirmed}
          reservations={dayQuery.data.reservations}
        />
      ) : mode === 'week' && weekQuery.data ? (
        <AgendaWeekView data={weekQuery.data} />
      ) : mode === 'month' && monthQuery.data ? (
        <AgendaMonthView data={monthQuery.data} />
      ) : (
        <AgendaState title="Sem dados de agenda para o periodo." />
      )}
    </div>
  )
}

export default AgendaPage
