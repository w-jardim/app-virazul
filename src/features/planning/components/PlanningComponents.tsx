import React, { useState, useEffect } from 'react'
import type { PlanningSummary, PlanningSuggestion } from '../types/planning.types'
import MetricCard from '@/features/dashboard/components/MetricCard'
import { toSafeCount, toSafeHours, toSafeNonNegative } from '../utils/safe-number'

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

function pluralizeServices(count: number, duration: string) {
  const safeCount = toSafeCount(count)
  const label = safeCount === '1' ? 'plantão' : 'plantões'
  return `${safeCount} ${label} de ${duration}h`
}

export function PlanningHoursProgress({ summary, onChangeGoal }: { summary: PlanningSummary, onChangeGoal?: (n: number) => Promise<void> }) {
  const [editing, setEditing] = useState(false)
  const [valueStr, setValueStr] = useState<string>(String(toSafeNonNegative(summary.goal, 0)))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const goal = toSafeNonNegative(summary.goal, 0)
  useEffect(() => {
    setValueStr(String(goal))
  }, [goal])
  const confirmedHours = toSafeNonNegative(summary.confirmed_hours, 0)
  const waitingHours = toSafeNonNegative(summary.waiting_hours, 0)
  const remainingHours = toSafeNonNegative(summary.remaining_hours, 0)
  const capGapHours = toSafeNonNegative(summary.cap_gap_hours ?? 0, 0)

  const confirmedPct = goal > 0 ? Math.min((confirmedHours / goal) * 100, 100) : 0
  const waitingPct = goal > 0 ? Math.min((waitingHours / goal) * 100, 100 - confirmedPct) : 0

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-900">Progresso do mês</h3>
        <div className="text-sm text-slate-500">
          {editing ? (
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                value={valueStr}
                onChange={(e) => setValueStr(e.target.value)}
                className="w-24 rounded-lg border border-slate-300 px-2 py-1 text-sm"
              />
              <button
                type="button"
                disabled={busy}
                onClick={async () => {
                  if (!onChangeGoal) { setEditing(false); return }
                  setBusy(true)
                  setError(null)
                  try {
                    const parsed = Number(valueStr)
                    if (!Number.isFinite(parsed) || parsed < 0) throw new Error('Valor inválido')
                    await onChangeGoal(Math.floor(parsed))
                    setEditing(false)
                  } catch (err: any) {
                    setError(err?.message || 'Erro ao salvar meta')
                  } finally {
                    setBusy(false)
                  }
                }}
                className="rounded px-2 py-1 bg-sky-600 text-white text-xs"
              >
                Salvar
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false)
                  setValueStr(String(goal))
                  setError(null)
                }}
                className="text-xs text-slate-500"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span>Meta mensal de {toSafeHours(goal)}</span>
              <button type="button" onClick={() => setEditing(true)} className="text-xs text-slate-500 underline">Editar</button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricCard label="Meta mensal" value={toSafeHours(goal)} />
        <MetricCard label="Confirmadas" value={toSafeHours(confirmedHours)} tone="success" />
        <MetricCard label="Em espera" value={toSafeHours(waitingHours)} />
        <MetricCard label="Faltantes" value={toSafeHours(remainingHours)} tone={remainingHours > 0 ? 'warning' : 'success'} />
      </div>

      {capGapHours > 0 && (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <span className="mt-0.5 text-base leading-none">⚠️</span>
          <span>
            <strong>{toSafeHours(capGapHours)}</strong> ficaram de fora este mês — o limite de{' '}
            <strong>{toSafeHours(goal)}</strong> foi atingido antes de completar o próximo plantão disponível.
          </span>
        </div>
      )}

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
  const goal = toSafeNonNegative(summary.goal, 0)
  const remainingHours = toSafeNonNegative(summary.remaining_hours, 0)
  const entries = Object.entries(summary.projection.by_duration)
    .map(([duration, count]) => ({
      duration,
      count: toSafeCount(count),
    }))
    .filter((item) => item.count > 0)
    .sort((a, b) => {
      if (a.count !== b.count) return a.count - b.count
      return Number(b.duration) - Number(a.duration)
    })

  const metaAtingida = remainingHours <= 0

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-base font-semibold text-slate-900">Jeitos simples de fechar a meta</h3>
      {metaAtingida ? (
        <p className="mt-2 text-sm text-slate-500">Meta de {toSafeHours(goal)} atingida este mês.</p>
      ) : (
        <p className="mt-0.5 text-sm text-slate-500">
          Faltam {toSafeHours(remainingHours)} para chegar em {toSafeHours(goal)} neste mês. Veja opções fáceis de entender.
        </p>
      )}
      {entries.length > 0 && (
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {entries.map((item) => (
            <article key={item.duration} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Opção com {item.duration}h</p>
              <p className="mt-2 text-base font-semibold text-slate-900">{pluralizeServices(item.count, item.duration)}</p>
              <p className="mt-1 text-sm text-slate-500">
                {metaAtingida
                  ? `Seriam necessários ${item.count} serviço${item.count === 1 ? '' : 's'} de ${item.duration}h para a meta de ${toSafeHours(goal)}.`
                  : `Fecha as ${toSafeHours(remainingHours)} restantes se você priorizar este tipo de serviço.`}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

export function PlanningCombinations({ summary }: { summary: PlanningSummary }) {
  const { combinations } = summary.projection
  const safeRemaining = toSafeNonNegative(summary.remaining_hours, 0)
  const goal = toSafeNonNegative(summary.goal, 0)
  const confirmedHours = toSafeNonNegative(summary.confirmed_hours, 0)

  const metaAtingidaCombos = safeRemaining <= 0

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-base font-semibold text-slate-900">Cenários de fechamento do mês</h3>
      {metaAtingidaCombos ? (
        <p className="mt-2 text-sm text-slate-500">Meta de {toSafeHours(goal)} atingida. Veja abaixo os cenários que levariam a meta.</p>
      ) : (
        <p className="mt-0.5 text-sm text-slate-500">
          As combinações abaixo respeitam a meta de {toSafeHours(goal)}. Se não fecharem o mês, mostramos o que ainda fica pendente.
        </p>
      )}
      <ul className="mt-3 space-y-3">
        {combinations.map((combo, idx) => {
          const totalHours = toSafeNonNegative(combo.total_hours, 0)
          const pendingHours = toSafeNonNegative(combo.pending_hours, 0)
          const projectedTotal = confirmedHours + totalHours
          const description =
            combo.items.length > 0
              ? combo.items.map((item) => `${toSafeCount(item.count)}×${toSafeCount(item.duration)}h`).join(' + ')
              : 'Sem combinação viável com as durações atuais.'

          return (
            <li
              key={idx}
              className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium text-slate-800">{description}</p>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    pendingHours === 0
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {pendingHours === 0 ? `Fecha o mês em ${toSafeHours(goal)}` : `${toSafeHours(pendingHours)} pendentes`}
                </span>
              </div>
              <p className="mt-1 text-slate-500">
                {totalHours > 0
                  ? `Este cenário adiciona ${toSafeHours(totalHours)} e leva o mês a ${toSafeHours(projectedTotal)}.`
                  : `Com as durações disponíveis, o mês fecharia ainda com ${toSafeHours(safeRemaining)} pendentes.`}
              </p>
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
