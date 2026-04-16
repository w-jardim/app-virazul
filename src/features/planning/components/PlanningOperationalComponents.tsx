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
  toSafePositive,
} from '../utils/safe-number'

type ModeSelectorProps = {
  mode: PlanningMode
  onChangeMode: (m: PlanningMode) => void
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
      <p className="text-sm font-medium text-slate-700 mb-2">Tipos de serviço</p>
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
        <p className="text-xs text-slate-400 mt-1">Todos os tipos incluídos na simulação.</p>
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
      <p className="text-sm font-medium text-slate-700 mb-2">Dias preferidos para trabalhar</p>
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
      {allSelected ? (
        <p className="text-xs text-slate-400 mt-1">Sem preferência: todos os dias possíveis serão considerados.</p>
      ) : (
        <p className="text-xs text-slate-400 mt-1">Selecione os dias que prefere trabalhar.</p>
      )}
    </div>
  )
}

type DurationPickerProps = {
  selected: number[]
  onChange: (durations: number[]) => void
}

export function DurationPicker({ selected, onChange }: DurationPickerProps) {
  const opts = [6, 8, 12, 24]

  function toggle(d: number) {
    if (selected.includes(d)) onChange(selected.filter((x) => x !== d))
    else onChange([...selected, d].sort((a, b) => a - b))
  }

  const allSelected = selected.length === 0

  return (
    <div>
      <p className="text-sm font-medium text-slate-700 mb-2">Durações preferidas</p>
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
        <p className="text-xs text-slate-400 mt-1">Sem preferência: todas as durações serão consideradas.</p>
      ) : (
        <p className="text-xs text-slate-400 mt-1">Selecione as durações que prefere ofertar.</p>
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
  return (
    <div>
      {mode === 'HOURS' ? (
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Meta de horas</span>
          <input
            type="number"
            min={1}
            value={toSafeInt(toSafePositive(targetHours, 1), 1)}
            onChange={(e) => onChangeHours(toSafePositive(e.target.value, 1))}
            className="mt-1 block w-full max-w-xs rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
          />
        </label>
      ) : (
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Meta de serviços</span>
          <input
            type="number"
            min={1}
            value={toSafeInt(toSafePositive(targetServices, 1), 1)}
            onChange={(e) => onChangeServices(toSafePositive(e.target.value, 1))}
            className="mt-1 block w-full max-w-xs rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
          />
        </label>
      )}
    </div>
  )
}

const feasibilityConfig: Record<Feasibility, { label: string; color: string; icon: string }> = {
  HIGH: { label: 'Alta viabilidade', color: 'bg-emerald-100 text-emerald-800 border-emerald-300', icon: '🟢' },
  MEDIUM: { label: 'Viabilidade moderada', color: 'bg-amber-100 text-amber-800 border-amber-300', icon: '🟡' },
  LOW: { label: 'Baixa viabilidade', color: 'bg-rose-100 text-rose-800 border-rose-300', icon: '🔴' },
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

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-slate-900">Resultado da simulação</h3>
        <FeasibilityBadge feasibility={result.feasibility} />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <MetricCard
          label={mode === 'HOURS' ? 'Serviços necessários' : 'Horas estimadas'}
          value={mode === 'HOURS' ? safeRequired : toSafeHours(safeHours)}
          tone="default"
        />
        <MetricCard
          label={mode === 'COUNT' ? 'Serviços planejados' : 'Horas-alvo'}
          value={mode === 'COUNT' ? safeRequired : toSafeHours(safeHours)}
          tone="default"
        />
        <MetricCard label="Receita estimada" value={toSafeCurrency(safeIncome)} tone="success" />
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
      <h3 className="text-base font-semibold text-slate-900 mb-3">Distribuição por tipo</h3>
      <div className="space-y-2.5">
        {entries.map(([key, count]) => {
          const pct = total > 0 ? Math.max(0, Math.min(100, (count / total) * 100)) : 0
          return (
            <div key={key}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-700">{typeNameMap[key] ?? key}</span>
                <span className="text-slate-500 font-medium">{toSafeCount(count)} serviço(s)</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
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
      <h3 className="text-base font-semibold text-slate-900 mb-3">Base histórica (últimos 3 meses)</h3>
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
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-900">Estratégia dentro do limite de 120h</h3>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
          {result.cap_available_hours}h disponíveis
        </span>
      </div>

      {result.cap_exceeded && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
          <span className="font-semibold">Meta ajustada:</span> sua meta de {result.estimated_hours}h
          excede o limite disponível ({result.cap_available_hours}h). A estratégia usa as{' '}
          <span className="font-semibold">{result.effective_hours}h</span> restantes.
        </div>
      )}

      <div className="divide-y divide-slate-100">
        {result.strategy.map((step) => (
          <div key={step.duration_hours} className="flex items-center justify-between py-2.5">
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-100 text-xs font-bold text-sky-700">
                {step.count}
              </span>
              <span className="text-sm text-slate-700">
                {step.count === 1 ? 'serviço' : 'serviços'} de{' '}
                <span className="font-semibold">{step.duration_hours}h</span>
              </span>
            </div>
            <span className="text-sm font-semibold text-slate-900">{step.hours}h</span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-slate-200 pt-3">
        <span className="text-sm font-semibold text-slate-700">
          {totalServices} serviço{totalServices !== 1 ? 's' : ''} · {totalHours}h
        </span>
        <span className="text-sm font-semibold text-emerald-700">{toSafeCurrency(result.estimated_income)}</span>
      </div>
          {typeof result.working_days_count === 'number' && (
            <div className="text-xs text-slate-500 mt-2">
              <strong>{result.working_days_count}</strong> dia(s) disponíveis no período • média de <strong>{result.avg_services_per_day}</strong> serviço(s)/dia
            </div>
          )}
    </section>
  )
}
