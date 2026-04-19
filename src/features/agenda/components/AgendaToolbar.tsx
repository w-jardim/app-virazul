import type { AgendaViewMode } from '../types/agenda.types'

type AgendaToolbarProps = {
  mode: AgendaViewMode
  day: string
  weekStart: string
  month: string
  onModeChange: (mode: AgendaViewMode) => void
  onDayChange: (value: string) => void
  onWeekStartChange: (value: string) => void
  onMonthChange: (value: string) => void
}

const tabClass = (active: boolean) =>
  [
    'rounded-lg px-3 py-2 text-sm font-medium transition',
    active ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
  ].join(' ')

const AgendaToolbar = ({
  mode,
  day,
  weekStart,
  month,
  onModeChange,
  onDayChange,
  onWeekStartChange,
  onMonthChange
}: AgendaToolbarProps) => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap gap-2">
        <button type="button" className={tabClass(mode === 'day')} onClick={() => onModeChange('day')}>
          Dia
        </button>
        <button type="button" className={tabClass(mode === 'week')} onClick={() => onModeChange('week')}>
          Semana
        </button>
        <button type="button" className={tabClass(mode === 'month')} onClick={() => onModeChange('month')}>
          Mês
        </button>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <label className="text-xs font-medium text-slate-600">
          Dia
          <input
            type="date"
            value={day}
            onChange={(event) => onDayChange(event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800"
          />
        </label>

        <label className="text-xs font-medium text-slate-600">
          Início da semana
          <input
            type="date"
            value={weekStart}
            onChange={(event) => onWeekStartChange(event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800"
          />
        </label>

        <label className="text-xs font-medium text-slate-600">
          Mês
          <input
            type="month"
            value={month}
            onChange={(event) => onMonthChange(event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800"
          />
        </label>
      </div>
    </section>
  )
}

export default AgendaToolbar
