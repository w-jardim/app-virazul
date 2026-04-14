import type { PlanningSummary, PlanningSuggestion } from '../types/planning.types'
import MetricCard from '@/features/dashboard/components/MetricCard'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { toSafeCount, toSafeHours, toSafeNonNegative } from '../utils/safe-number'

const COLORS = ['#0ea5e9', '#38bdf8', '#7dd3fc', '#bae6fd', '#e0f2fe', '#f0f9ff']

function formatConfidence(value: number) {
  const safe = Math.max(0, Math.min(100, toSafeNonNegative(value, 0) * 100))
  return `${Math.round(safe)}%`
}

function formatDate(dateKey: string) {
  const [year, month, day] = dateKey.split('-').map(Number)
  const parsed = new Date(year, (month || 1) - 1, day || 1)
  if (!Number.isFinite(parsed.getTime())) return '--'
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(parsed)
}

export function PlanningHoursProgress({ summary }: { summary: PlanningSummary }) {
  const goal = toSafeNonNegative(summary.goal, 0)
  const confirmedHours = toSafeNonNegative(summary.confirmed_hours, 0)
  const waitingHours = toSafeNonNegative(summary.waiting_hours, 0)
  const remainingHours = toSafeNonNegative(summary.remaining_hours, 0)

  const confirmedPct = goal > 0 ? Math.min((confirmedHours / goal) * 100, 100) : 0
  const waitingPct = goal > 0 ? Math.min((waitingHours / goal) * 100, 100 - confirmedPct) : 0

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-base font-semibold text-slate-900">Progresso do mês</h3>
      <p className="mt-0.5 text-sm text-slate-500">Meta mensal de {toSafeHours(goal)} — acompanhe sua evolução.</p>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricCard label="Meta mensal" value={toSafeHours(goal)} />
        <MetricCard label="Confirmadas" value={toSafeHours(confirmedHours)} tone="success" />
        <MetricCard label="Em espera" value={toSafeHours(waitingHours)} />
        <MetricCard label="Faltantes" value={toSafeHours(remainingHours)} tone={remainingHours > 0 ? 'warning' : 'success'} />
      </div>

      <div className="mt-4">
        <div className="mb-1 flex justify-between text-xs text-slate-500">
          <span>0h</span>
          <span>{toSafeHours(goal)}</span>
        </div>
        <div className="h-4 w-full overflow-hidden rounded-full bg-slate-100">
          <div className="flex h-full">
            <div
              className="h-full rounded-l-full bg-emerald-400 transition-all duration-500"
              style={{ width: `${Math.max(0, Math.min(100, confirmedPct))}%` }}
              title={`Confirmadas: ${toSafeHours(confirmedHours)}`}
            />
            <div
              className="h-full bg-sky-300 transition-all duration-500"
              style={{ width: `${Math.max(0, Math.min(100, waitingPct))}%` }}
              title={`Em espera: ${toSafeHours(waitingHours)}`}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export function PlanningProjectionChart({ summary }: { summary: PlanningSummary }) {
  const entries = Object.entries(summary.projection.by_duration)
    .map(([duration, count]) => ({
      duration: `${toSafeCount(duration)}h`,
      count: toSafeNonNegative(count, 0),
    }))
    .filter((item) => item.count > 0)
    .sort((a, b) => Number(a.duration.replace('h', '')) - Number(b.duration.replace('h', '')))

  if (entries.length === 0) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-base font-semibold text-slate-900">Projeção por duração</h3>
        <p className="mt-2 text-sm text-slate-500">Meta já atingida. Nenhuma projeção necessária.</p>
      </section>
    )
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-base font-semibold text-slate-900">Projeção por duração</h3>
      <p className="mt-0.5 text-sm text-slate-500">
        Quantos serviços de cada duração seriam necessários para atingir a meta.
      </p>
      <div className="mt-4 h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={entries} barCategoryGap="30%">
            <XAxis dataKey="duration" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip
              formatter={(value: number) => [`${toSafeCount(value)} serviço(s)`, 'Quantidade']}
              contentStyle={{ fontSize: 12 }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {entries.map((_, idx) => (
                <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}

export function PlanningCombinations({ summary }: { summary: PlanningSummary }) {
  const { combinations } = summary.projection
  const safeRemaining = toSafeNonNegative(summary.remaining_hours, 0)

  if (combinations.length === 0) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-base font-semibold text-slate-900">Combinações possíveis</h3>
        <p className="mt-2 text-sm text-slate-500">Meta já atingida ou sem combinações disponíveis para o restante.</p>
      </section>
    )
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-base font-semibold text-slate-900">Combinações possíveis</h3>
      <p className="mt-0.5 text-sm text-slate-500">
        Formas de atingir (ou aproximar) a meta com diferentes combinações de duração.
      </p>
      <ul className="mt-3 space-y-2">
        {combinations.map((combo, idx) => {
          const totalHours = toSafeNonNegative(combo.total_hours, 0)
          return (
            <li
              key={idx}
              className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-2 text-sm"
            >
              <span className="text-slate-700">
                {combo.items
                  .map((item) => `${toSafeCount(item.count)}×${toSafeCount(item.duration)}h`)
                  .join(' + ')}
              </span>
              <span
                className={`font-semibold ${
                  totalHours === safeRemaining ? 'text-emerald-600' : 'text-slate-500'
                }`}
              >
                {toSafeHours(totalHours)} {totalHours === safeRemaining ? '✓' : ''}
              </span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

export function PlanningSuggestionsList({ suggestions }: { suggestions: PlanningSuggestion[] }) {
  if (suggestions.length === 0) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-base font-semibold text-slate-900">Sugestões do sistema</h3>
        <p className="mt-2 text-sm text-slate-500">
          Meta já alcançada ou não há sugestões disponíveis para os próximos dias.
        </p>
      </section>
    )
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-base font-semibold text-slate-900">Sugestões do sistema</h3>
      <p className="mt-0.5 text-sm text-slate-500">
        Datas e durações sugeridas com base nas suas preferências e escala atual.
      </p>
      <ul className="mt-3 divide-y divide-slate-100">
        {suggestions.map((s) => (
          <li key={s.date} className="flex items-start justify-between gap-4 py-2.5">
            <div>
              <p className="text-sm font-medium text-slate-800">
                {formatDate(s.date)} — {toSafeHours(s.suggested_duration)}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">{s.reason}</p>
            </div>
            <span className="mt-0.5 flex-shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-600">
              {formatConfidence(s.confidence)}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
