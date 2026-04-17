import { useEffect, useMemo, useState } from 'react'
import type {
  PlanningResult,
  PlanningMode,
  Feasibility,
  HistoricalData,
  PlanningSourceStatus,
} from '../types/planning-operational.types'
import type { ServiceType } from '@/features/services/types/services.types'
import MetricCard from '@/features/dashboard/components/MetricCard'
import {
  toSafeCount,
  toSafeCurrency,
  toSafeHours,
  toSafeInt,
  toSafeNonNegative,
} from '../utils/safe-number'

type ModeSelectorProps = {
  mode: PlanningMode
  onChangeMode: (m: PlanningMode) => void
}

const FALLBACK_DURATION_OPTIONS = [6, 8, 12, 24]

function normalizeDurationOptions(preferredDurations?: number[]) {
  const values = Array.isArray(preferredDurations) ? preferredDurations : []
  const normalized = Array.from(new Set(values.filter((value) => Number.isFinite(value) && value > 0))).sort((a, b) => a - b)
  return normalized.length > 0 ? normalized : FALLBACK_DURATION_OPTIONS
}

function getDefaultDayHours(options: number[]) {
  if (options.includes(12)) return 12
  return options[options.length - 1] ?? 8
}

function formatCalendarDate(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function formatSelectedDate(isoDate: string) {
  const date = new Date(`${isoDate}T00:00:00`)
  if (!Number.isFinite(date.getTime())) return isoDate
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  }).format(date)
}

export function PlanModeSelector({ mode, onChangeMode }: ModeSelectorProps) {
  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => onChangeMode('HOURS')}
        className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
          mode === 'HOURS'
            ? 'bg-sky-600 text-white shadow-sm'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
        }`}
      >
        Por horas
      </button>
      <button
        type="button"
        onClick={() => onChangeMode('COUNT')}
        className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
          mode === 'COUNT'
            ? 'bg-sky-600 text-white shadow-sm'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
        }`}
      >
        Por quantidade
      </button>
    </div>
  )
}

type TypePickerProps = {
  available: ServiceType[]
  selected: string[]
  onChangeSelected: (v: string[]) => void
}

export function ServiceTypePicker({ available, selected, onChangeSelected }: TypePickerProps) {
  const allSelected = selected.length === 0

  function toggle(key: string) {
    if (selected.includes(key)) {
      onChangeSelected(selected.filter((k) => k !== key))
    } else {
      onChangeSelected([...selected, key])
    }
  }

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-slate-700">Tipos de serviço</p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onChangeSelected([])}
          className={`rounded-full px-3 py-1 text-xs font-medium transition ${
            allSelected
              ? 'bg-sky-100 text-sky-800 ring-1 ring-sky-300'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Todos
        </button>
        {available.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => toggle(t.key)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
              selected.includes(t.key)
                ? 'bg-sky-100 text-sky-800 ring-1 ring-sky-300'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {t.name}
          </button>
        ))}
      </div>
      {allSelected && (
        <p className="mt-1 text-xs text-slate-400">Todos os tipos incluídos na simulação.</p>
      )}
    </div>
  )
}

type CalendarPickerProps = {
  month: string | null
  selectedDates: string[]
  selectedDateHours?: Record<string, number>
  preferredDurations?: number[]
  onChange: (dates: string[]) => void
  onChangeDateHours?: (value: Record<string, number>) => void
}

export function CalendarDayPicker({
  month,
  selectedDates,
  selectedDateHours = {},
  preferredDurations,
  onChange,
  onChangeDateHours,
}: CalendarPickerProps) {
  const durationOptions = useMemo(
    () => normalizeDurationOptions(preferredDurations),
    [preferredDurations],
  )

  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
        <p className="text-sm font-medium text-slate-700">Escolha o mês para liberar o calendário</p>
        <p className="mt-1 text-xs text-slate-500">Depois disso, clique nos dias e defina quantas horas quer trabalhar em cada um.</p>
      </div>
    )
  }

  const [yearStr, monthStr] = month.split('-')
  const year = Number(yearStr)
  const monthNumber = Number(monthStr)
  const totalDays = new Date(year, monthNumber, 0).getDate()
  const firstWeekday = new Date(year, monthNumber - 1, 1).getDay()
  const selectedSet = new Set(selectedDates)
  const labels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  const monthDates = Array.from({ length: totalDays }, (_, index) => formatCalendarDate(year, monthNumber, index + 1))
  const defaultHours = getDefaultDayHours(durationOptions)

    function syncDateHours(nextDates: string[]) {
    if (!onChangeDateHours) return
    const nextHours: Record<string, number> = {}

    for (const date of nextDates) {
      const currentHours = selectedDateHours[date]
      nextHours[date] = durationOptions.includes(currentHours) ? currentHours : defaultHours
    }

    onChangeDateHours(nextHours)
  }

    function toggle(date: string) {
    if (selectedSet.has(date)) {
      const nextDates = selectedDates.filter((value) => value !== date)
      onChange(nextDates)
      syncDateHours(nextDates)
      return
    }

    const nextDates = [...selectedDates, date].sort()
    onChange(nextDates)
    syncDateHours(nextDates)
  }

  function applyToAllDates() {
    onChange(monthDates)
    syncDateHours(monthDates)
  }

  function clearAllDates() {
    onChange([])
    onChangeDateHours?.({})
  }

  function updateHours(date: string, hours: number) {
    if (!selectedSet.has(date)) return
    onChangeDateHours?.({
      ...selectedDateHours,
      [date]: hours,
    })
  }

  const totalConfiguredHours = selectedDates.reduce((sum, date) => {
    const hours = durationOptions.includes(selectedDateHours[date]) ? selectedDateHours[date] : defaultHours
    return sum + hours
  }, 0)

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-700">Dias escolhidos no calendário</p>
          <p className="text-xs text-slate-500">Selecione os dias do mês e escolha a carga de cada dia com base nas durações preferidas.</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={applyToAllDates}
            className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-200"
          >
            Marcar todos
          </button>
          <button
            type="button"
            onClick={clearAllDates}
            className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-200"
          >
            Limpar
          </button>
        </div>
      </div>

      <div className="mb-2 grid grid-cols-7 gap-2">
        {labels.map((label) => (
          <span key={label} className="text-center text-xs font-medium uppercase tracking-wide text-slate-400">
            {label}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: firstWeekday }).map((_, index) => (
          <div key={`empty-${index}`} className="h-10 rounded-lg bg-transparent" />
        ))}
        {monthDates.map((date, index) => {
          const active = selectedSet.has(date)
          const dayHours = durationOptions.includes(selectedDateHours[date]) ? selectedDateHours[date] : defaultHours
          return (
            <button
              key={date}
              type="button"
              onClick={() => toggle(date)}
              className={`flex h-14 flex-col items-center justify-center rounded-lg border text-sm font-medium transition ${
                active
                  ? 'border-sky-500 bg-sky-600 text-white shadow-sm'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-sky-300 hover:bg-sky-50'
              }`}
              title={date}
            >
              <span>{index + 1}</span>
              {active ? <span className="text-[11px] opacity-90">{dayHours}h</span> : null}
            </button>
          )
        })}
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 text-xs text-slate-500">
        <span>{selectedDates.length} dia(s) selecionado(s).</span>
        <span>{totalConfiguredHours}h configuradas no calendário.</span>
      </div>

      {selectedDates.length > 0 && (
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-700">Horas por dia</p>
              <p className="text-xs text-slate-500">Cada dia usa apenas as durações que você deixou ativas.</p>
            </div>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
              {durationOptions.map((duration) => `${duration}h`).join(' • ')}
            </span>
          </div>

          <div className="space-y-3">
            {selectedDates.slice().sort().map((date) => {
              const currentHours = durationOptions.includes(selectedDateHours[date]) ? selectedDateHours[date] : defaultHours
              return (
                <div key={date} className="rounded-lg bg-white p-3 ring-1 ring-slate-200">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-slate-700">{formatSelectedDate(date)}</span>
                    <span className="text-xs text-slate-500">{date}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {durationOptions.map((duration) => (
                      <button
                        key={`${date}-${duration}`}
                        type="button"
                        onClick={() => updateHours(date, duration)}
                        className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                          currentHours === duration
                            ? 'bg-sky-100 text-sky-800 ring-1 ring-sky-300'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {duration}h
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

type WeekdayPickerProps = {
  selected: number[]
  onChange: (days: number[]) => void
}

export function WeekdayPicker({ selected, onChange }: WeekdayPickerProps) {
  const labels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

  function toggle(d: number) {
    if (selected.includes(d)) onChange(selected.filter((x) => x !== d))
    else onChange([...selected, d])
  }

  const allSelected = selected.length === 0

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-slate-700">Dias preferidos para trabalhar</p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onChange([])}
          className={`rounded-full px-3 py-1 text-xs font-medium transition ${
            allSelected ? 'bg-sky-100 text-sky-800 ring-1 ring-sky-300' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Todos
        </button>
        {labels.map((lab, i) => (
          <button
            key={lab}
            type="button"
            onClick={() => toggle(i)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
              selected.includes(i) ? 'bg-sky-100 text-sky-800 ring-1 ring-sky-300' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {lab}
          </button>
        ))}
      </div>
    </div>
  )
}

type DurationPickerProps = {
  selected: number[]
  onChange: (durations: number[]) => void
}

export function DurationPicker({ selected, onChange }: DurationPickerProps) {
  const opts = FALLBACK_DURATION_OPTIONS

  function toggle(d: number) {
    if (selected.includes(d)) onChange(selected.filter((x) => x !== d))
    else onChange([...selected, d].sort((a, b) => a - b))
  }

  const allSelected = selected.length === 0

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-slate-700">Durações preferidas</p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onChange([])}
          className={`rounded-full px-3 py-1 text-xs font-medium transition ${
            allSelected ? 'bg-sky-100 text-sky-800 ring-1 ring-sky-300' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Todos
        </button>
        {opts.map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => toggle(d)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
              selected.includes(d) ? 'bg-sky-100 text-sky-800 ring-1 ring-sky-300' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {d}h
          </button>
        ))}
      </div>
      {allSelected ? (
        <p className="mt-1 text-xs text-slate-400">Sem preferência: todas as durações serão consideradas.</p>
      ) : (
        <p className="mt-1 text-xs text-slate-400">Essas durações também serão usadas para escolher as horas de cada dia no calendário.</p>
      )}
    </div>
  )
}

type TargetInputProps = {
  mode: PlanningMode
  targetHours: number
  targetServices: number
  onChangeHours: (v: number) => void
  onChangeServices: (v: number) => void
}

export function PlanTargetInput({
  mode,
  targetHours,
  targetServices,
  onChangeHours,
  onChangeServices,
}: TargetInputProps) {
  const [hoursStr, setHoursStr] = useState<string>(String(toSafeInt(toSafeNonNegative(targetHours, 0), 0)))
  const [servicesStr, setServicesStr] = useState<string>(String(toSafeInt(toSafeNonNegative(targetServices, 0), 0)))

  useEffect(() => {
    setHoursStr(String(toSafeInt(toSafeNonNegative(targetHours, 0), 0)))
  }, [targetHours])

  useEffect(() => {
    setServicesStr(String(toSafeInt(toSafeNonNegative(targetServices, 0), 0)))
  }, [targetServices])

  function commitHours(value: string) {
    const parsed = Number(value)
    if (!Number.isFinite(parsed) || parsed < 0) {
      onChangeHours(0)
      return
    }
    onChangeHours(Math.floor(parsed))
  }

  function commitServices(value: string) {
    const parsed = Number(value)
    if (!Number.isFinite(parsed) || parsed < 0) {
      onChangeServices(0)
      return
    }
    onChangeServices(Math.floor(parsed))
  }

  return (
    <div>
      {mode === 'HOURS' ? (
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Meta de horas</span>
          <input
            type="number"
            min={0}
            value={hoursStr}
            onChange={(e) => setHoursStr(e.target.value)}
            onBlur={(e) => commitHours(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                commitHours((e.target as HTMLInputElement).value)
                ;(e.target as HTMLInputElement).blur()
              }
            }}
            className="mt-1 block w-full max-w-xs rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
          />
        </label>
      ) : (
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Meta de serviços</span>
          <input
            type="number"
            min={0}
            value={servicesStr}
            onChange={(e) => setServicesStr(e.target.value)}
            onBlur={(e) => commitServices(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                commitServices((e.target as HTMLInputElement).value)
                ;(e.target as HTMLInputElement).blur()
              }
            }}
            className="mt-1 block w-full max-w-xs rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
          />
        </label>
      )}
    </div>
  )
}

const feasibilityConfig: Record<Feasibility, { label: string; color: string; icon: string }> = {
  HIGH: { label: 'Alta viabilidade', color: 'bg-emerald-100 text-emerald-800 border-emerald-300', icon: 'OK' },
  MEDIUM: { label: 'Viabilidade moderada', color: 'bg-amber-100 text-amber-800 border-amber-300', icon: 'AV' },
  LOW: { label: 'Baixa viabilidade', color: 'bg-rose-100 text-rose-800 border-rose-300', icon: 'AT' },
}

export function FeasibilityBadge({ feasibility }: { feasibility: Feasibility }) {
  const cfg = feasibilityConfig[feasibility]
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium ${cfg.color}`}>
      <span>{cfg.icon}</span>
      {cfg.label}
    </span>
  )
}

type SimResultProps = {
  result: PlanningResult
  mode: PlanningMode
}

export function SimulationResultCards({ result, mode }: SimResultProps) {
  const safeRequired = toSafeInt(toSafeNonNegative(result.required_services, 0), 0)
  const safeHours = toSafeNonNegative(result.effective_hours, 0)
  const safeIncome = toSafeNonNegative(result.estimated_income, 0)
  const safeCap = toSafeNonNegative(result.cap_available_hours, 0)
  const safeSelectedDateHours = toSafeNonNegative(result.selected_date_hours_total, 0)
  const totalServices = result.strategy?.reduce((sum, item) => sum + item.count, 0) ?? safeRequired
  const totalStrategyHours = result.strategy?.reduce((sum, item) => sum + item.hours, 0) ?? safeHours

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Resultado da simulação</h3>
          <p className="text-sm text-slate-500">Serviços e valor calculados a partir das escolhas de horas, tipos, datas e durações.</p>
        </div>
        <FeasibilityBadge feasibility={result.feasibility} />
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard
          label={mode === 'COUNT' ? 'Serviços planejados' : 'Serviços sugeridos'}
          value={safeRequired}
          tone="default"
        />
        <MetricCard label="Horas aproveitadas" value={toSafeHours(safeHours)} tone="default" />
        <MetricCard label="Receita estimada" value={toSafeCurrency(safeIncome)} tone="success" />
        <MetricCard
          label="Dias selecionados"
          value={toSafeInt(toSafeNonNegative(result.selected_dates_count ?? result.working_days_count ?? 0, 0), 0)}
          tone="default"
        />
      </div>

      <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-semibold text-slate-900">Estratégia dentro do limite</h4>
            <p className="text-xs text-slate-500">Distribuição final respeitando o limite disponível no mês escolhido.</p>
          </div>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
            {safeCap}h disponíveis
          </span>
        </div>

        {safeSelectedDateHours > 0 && (
          <div className="mb-3 rounded-lg border border-sky-200 bg-sky-50 p-3 text-sm text-sky-900">
            Calendário configurado com <span className="font-semibold">{safeSelectedDateHours}h</span> somadas nos dias escolhidos.
          </div>
        )}

        {result.cap_exceeded && (
          <div className="mb-3 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
            <span className="font-semibold">Meta ajustada:</span> o plano original tinha {result.estimated_hours}h, mas o cálculo final ficou em {result.effective_hours}h para respeitar o limite do mês.
          </div>
        )}

        {result.strategy && result.strategy.length > 0 ? (
          <div className="space-y-2">
            {result.strategy.map((step) => (
              <div key={step.duration_hours} className="flex items-center justify-between rounded-lg bg-white px-3 py-2 ring-1 ring-slate-200">
                <span className="text-sm text-slate-700">
                  <strong>{step.count}</strong> serviço{step.count !== 1 ? 's' : ''} de <strong>{step.duration_hours}h</strong>
                </span>
                <span className="text-sm font-semibold text-slate-900">{step.hours}h</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">Não foi possível montar uma combinação de durações com as escolhas atuais.</p>
        )}

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-3 text-sm">
          <span className="font-semibold text-slate-700">{totalServices} serviço{totalServices !== 1 ? 's' : ''} — {totalStrategyHours}h</span>
        </div>

        {typeof result.working_days_count === 'number' && (
          <p className="mt-2 text-xs text-slate-500">
            {result.working_days_count} dia(s) considerados no cálculo — média de <strong>{result.avg_services_per_day}</strong> serviço(s) por dia.
          </p>
        )}
      </div>
    </section>
  )
}

type DistributionProps = {
  distribution: Record<string, number>
  serviceTypes: ServiceType[]
}

export function DistributionList({ distribution, serviceTypes }: DistributionProps) {
  const entries = Object.entries(distribution)
    .map(([key, count]) => [key, toSafeInt(toSafeNonNegative(count, 0), 0)] as const)
    .filter(([, count]) => count > 0)

  if (entries.length === 0) return null

  const total = entries.reduce((sum, [, c]) => sum + c, 0)
  const typeNameMap = Object.fromEntries(serviceTypes.map((t) => [t.key, t.name]))

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-3 text-base font-semibold text-slate-900">Distribuição por tipo</h3>
      <div className="space-y-2.5">
        {entries.map(([key, count]) => {
          const pct = total > 0 ? Math.max(0, Math.min(100, (count / total) * 100)) : 0
          return (
            <div key={key}>
              <div className="mb-1 flex justify-between text-sm">
                <span className="text-slate-700">{typeNameMap[key] ?? key}</span>
                <span className="font-medium text-slate-500">{toSafeCount(count)} serviço(s)</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-sky-400 transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export function HistoricalSummary({ data, hasHistoryData }: { data: HistoricalData; hasHistoryData?: boolean }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-3 text-base font-semibold text-slate-900">Base histórica (últimos 3 meses)</h3>
      {!hasHistoryData ? (
        <p className="mb-3 text-sm text-slate-500">
          Sem histórico suficiente no período. A simulação está usando médias seguras padrão.
        </p>
      ) : null}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricCard label="Média h/serviço" value={toSafeHours(data.avg_hours_per_service, 1)} />
        <MetricCard label="Média R$/h" value={toSafeCurrency(data.avg_income_per_hour)} />
        <MetricCard label="Serviços/mês" value={toSafeNonNegative(data.avg_services_per_month, 0).toFixed(1)} />
        <MetricCard label="Horas/mês" value={toSafeHours(data.avg_hours_per_month, 1)} />
      </div>
    </section>
  )
}

export function PlanningWarningBanner({ sources }: { sources: PlanningSourceStatus[] }) {
  const failed = sources.filter((s) => s.isError)
  if (failed.length === 0) return null

  return (
    <div className="rounded-xl border border-amber-300 bg-amber-50 p-4" role="alert">
      <p className="text-sm font-medium text-amber-900">
        Algumas fontes de dados não puderam ser carregadas: {failed.map((s) => s.label).join(', ')}.
      </p>
      <p className="mt-1 text-xs text-amber-700">
        A simulação pode estar incompleta e usará médias seguras quando faltar histórico.
      </p>
    </div>
  )
}

export function PlanningInputHint({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4" role="status">
      <p className="text-sm text-slate-700">{message}</p>
    </div>
  )
}

export function StrategyPanel({ result }: { result: PlanningResult }) {
  if (!result.strategy || result.strategy.length === 0) return null

  const totalServices = result.strategy.reduce((s, i) => s + i.count, 0)
  const totalHours = result.strategy.reduce((s, i) => s + i.hours, 0)

  return (
    <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-900">Estratégia dentro do limite</h3>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            {result.cap_available_hours}h disponíveis
          </span>
      </div>
      <div className="flex items-center justify-between border-t border-slate-200 pt-3">
        <span className="text-sm font-semibold text-slate-700">
          {totalServices} serviço{totalServices !== 1 ? 's' : ''} — {totalHours}h
        </span>
        <span className="text-sm font-semibold text-emerald-700">{toSafeCurrency(result.estimated_income)}</span>
      </div>
    </section>
  )
}
