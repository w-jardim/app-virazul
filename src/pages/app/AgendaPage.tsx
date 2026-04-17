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
import { useScheduleCalendar } from '@/features/ordinary-schedule/hooks/useScheduleData'
import {
  buildOrdinaryScheduleMap,
  mergeAgendaMonthWithOrdinarySchedule,
} from '@/features/ordinary-schedule/utils/ordinary-schedule-calendar'

const AgendaPage: React.FC = () => {
  const [mode, setMode] = useState<AgendaViewMode>('day')
  const [day, setDay] = useState(getDateKey())
  const [weekStart, setWeekStart] = useState(getDateKey())
  const [month, setMonth] = useState(getMonthKey())

  const dayQuery = useAgendaDay(day)
  const weekQuery = useAgendaWeek(weekStart)
  const monthQuery = useAgendaMonth(month)

  // derive schedule month: for day/week use the month of the reference date, for month mode use month directly
  const scheduleMonth = useMemo(() => {
    if (mode === 'month') return month
    const ref = mode === 'week' ? weekStart : day
    return ref.slice(0, 7) // "YYYY-MM"
  }, [mode, day, weekStart, month])

  const scheduleQuery = useScheduleCalendar(scheduleMonth)
  const ordinaryMap = useMemo(
    () => buildOrdinaryScheduleMap(scheduleQuery.data?.work_days),
    [scheduleQuery.data?.work_days],
  )

  const mergedMonthData = useMemo(
    () => mergeAgendaMonthWithOrdinarySchedule(month, monthQuery.data, scheduleQuery.data?.work_days),
    [month, monthQuery.data, scheduleQuery.data?.work_days],
  )

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
          to={`/services/new?start_at=${encodeURIComponent(day)}`}
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
          date={day}
          dateLabel={new Intl.DateTimeFormat('pt-BR', { dateStyle: 'full' }).format(new Date(`${day}T12:00:00Z`))}
          confirmed={dayQuery.data.confirmed}
          reservations={dayQuery.data.reservations}
          isOrdinary={Boolean(ordinaryMap[day])}
          ordinaryEntry={ordinaryMap[day] ?? null}
        />
      ) : mode === 'week' && weekQuery.data ? (
        <AgendaWeekView data={weekQuery.data} ordinaryMap={ordinaryMap} />
      ) : mode === 'month' ? (
        <AgendaMonthView data={mergedMonthData} onDaySelect={setDay} ordinaryMap={ordinaryMap} />
      ) : (
        <AgendaState title="Sem dados de agenda para o periodo." />
      )}
    </div>
  )
}

export default AgendaPage
