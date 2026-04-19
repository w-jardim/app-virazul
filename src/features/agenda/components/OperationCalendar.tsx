import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAgendaMonth, useAgendaDay, getDateKey, getMonthKey } from '../hooks/useAgendaData'
import { useScheduleCalendar } from '@/features/ordinary-schedule/hooks/useScheduleData'
import { buildOrdinaryScheduleMap } from '@/features/ordinary-schedule/utils/ordinary-schedule-calendar'
import type { AgendaServiceItem, AgendaWeekDayPayload } from '../types/agenda.types'

// ── helpers ──────────────────────────────────────────────────────────────────

function parseLocalDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function prevMonth(ym: string): string {
  const [y, m] = ym.split('-').map(Number)
  const d = new Date(y, m - 1, 1)
  d.setMonth(d.getMonth() - 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function nextMonth(ym: string): string {
  const [y, m] = ym.split('-').map(Number)
  const d = new Date(y, m - 1, 1)
  d.setMonth(d.getMonth() + 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function buildCalendarWeeks(ym: string): Array<Array<string | null>> {
  const [y, m] = ym.split('-').map(Number)
  const firstDay = new Date(y, m - 1, 1)
  const lastDay = new Date(y, m, 0)
  const startDow = firstDay.getDay() // 0=Sun

  const weeks: Array<Array<string | null>> = []
  let week: Array<string | null> = []

  // padding before month start
  for (let i = 0; i < startDow; i++) week.push(null)

  for (let d = 1; d <= lastDay.getDate(); d++) {
    week.push(`${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '00')}`)
    if (week.length === 7) {
      weeks.push(week)
      week = []
    }
  }

  // padding after month end
  if (week.length > 0) {
    while (week.length < 7) week.push(null)
    weeks.push(week)
  }

  return weeks
}

const MONTH_LABELS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

const DOW_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

// ── status badge colors ───────────────────────────────────────────────────────

function dotColor(item: AgendaServiceItem): string {
  const op = item.operational_status
  if (op === 'TITULAR') return 'bg-blue-600'
  if (op === 'RESERVA') return 'bg-amber-400'
  if (op === 'REALIZADO') return 'bg-emerald-500'
  if (op === 'FALTOU') return 'bg-rose-500'
  if (op === 'CANCELADO') return 'bg-slate-300'
  return 'bg-slate-400'
}

// ── Day panel ─────────────────────────────────────────────────────────────────

import type { OrdinaryScheduleEntry } from '@/features/ordinary-schedule/utils/ordinary-schedule-calendar'

const DayPanel: React.FC<{ dateKey: string; isOrdinary?: boolean; ordinaryEntry?: OrdinaryScheduleEntry | null }> = ({ dateKey, isOrdinary, ordinaryEntry }) => {
  const query = useAgendaDay(dateKey)
  const label = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'full' }).format(parseLocalDate(dateKey))

  const all = query.data
    ? [...(query.data.confirmed ?? []), ...(query.data.reservations ?? [])]
    : []

  // if this is an ordinary schedule day, create a synthetic agenda item
  const ordinarySynthetic = isOrdinary
    ? {
        id: `ordinary-${dateKey}`,
        service_type_name: 'Escala ordinária',
        service_type_key: 'ORDINARIA',
        start_at: `${dateKey}T${ordinaryEntry?.start_time ?? '00:00:00'}`,
        duration_hours: ordinaryEntry?.duration_hours ?? 8,
        operational_status: 'ORDINARIO',
      }
    : null

  const formatTime = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }

  const hasContent = all.length > 0 || ordinarySynthetic !== null

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold capitalize text-slate-800">{label}</p>
          {isOrdinary ? (
            <p className="text-xs text-slate-500">Dia ordinário (sua escala base)</p>
          ) : null}
        </div>
        {!isOrdinary && (
          <Link
            to={`/services/new?start_at=${encodeURIComponent(dateKey)}`}
            className="rounded-lg bg-blue-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-800"
          >
            + Novo
          </Link>
        )}
      </div>

      {query.isLoading ? (
        <p className="text-xs text-slate-500">Carregando...</p>
      ) : !hasContent ? (
        <p className="text-xs text-slate-400">Nenhum serviço neste dia.</p>
      ) : (
        <ul className="space-y-2">
          {/* render ordinary synthetic item first when present */}
          {ordinarySynthetic ? (
            <li key={ordinarySynthetic.id} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
              <div>
                <p className="text-xs font-semibold text-slate-800">{ordinarySynthetic.service_type_name}</p>
                <p className="text-xs text-slate-500">
                  {formatTime(ordinarySynthetic.start_at)} · {ordinarySynthetic.duration_hours}h · {ordinarySynthetic.operational_status}
                </p>
              </div>
            </li>
          ) : null}

          {all.map((s) => (
            <li key={s.id} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold text-slate-800">
                    {s.service_type_name ?? s.service_type_key ?? 'Serviço'}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatTime(s.start_at)} · {s.duration_hours}h · {s.operational_status}
                  </p>
                </div>
                <Link
                  to={`/services/${s.id}`}
                  className="text-xs font-medium text-blue-700 hover:underline shrink-0"
                >
                  Ver
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ── Main calendar ─────────────────────────────────────────────────────────────

const OperationCalendar: React.FC = () => {
  const today = getDateKey()
  const [month, setMonth] = useState(getMonthKey())
  const [selectedDay, setSelectedDay] = useState<string | null>(today)

  const monthQuery = useAgendaMonth(month)
  const ordinaryScheduleQuery = useScheduleCalendar(month)

  // index services by date key
  const servicesByDate = useMemo<Record<string, AgendaWeekDayPayload>>(() => {
    if (!monthQuery.data) return {}
    const map: Record<string, AgendaWeekDayPayload> = {}
    for (const day of monthQuery.data.days) {
      map[day.date] = day
    }
    return map
  }, [monthQuery.data])

  const ordinaryMap = useMemo(() => buildOrdinaryScheduleMap(ordinaryScheduleQuery.data?.work_days), [ordinaryScheduleQuery.data?.work_days])
  const ordinarySet = useMemo(() => new Set(Object.keys(ordinaryMap)), [ordinaryMap])

  const weeks = useMemo(() => buildCalendarWeeks(month), [month])
  const [mYear, mMonthIdx] = month.split('-').map(Number)

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_320px]">
      {/* ── Calendar grid ── */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <button
            type="button"
            onClick={() => setMonth(prevMonth(month))}
            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            aria-label="Mês anterior"
          >
            ‹
          </button>
          <p className="text-sm font-semibold text-slate-800">
            {MONTH_LABELS[mMonthIdx - 1]} {mYear}
          </p>
          <button
            type="button"
            onClick={() => setMonth(nextMonth(month))}
            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            aria-label="Próximo mês"
          >
            ›
          </button>
        </div>

        {/* Day-of-week row */}
        <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50">
          {DOW_LABELS.map((d) => (
            <div key={d} className="py-2 text-center text-xs font-semibold text-slate-500">
              {d}
            </div>
          ))}
        </div>

        {/* Weeks */}
        {monthQuery.isLoading ? (
          <div className="flex h-48 items-center justify-center text-sm text-slate-400">
            Carregando...
          </div>
        ) : (
          <div>
            {weeks.map((week, wi) => (
              <div key={wi} className="grid grid-cols-7 divide-x divide-slate-100 border-b border-slate-100 last:border-b-0">
                {week.map((dateKey, di) => {
                  if (!dateKey) {
                    return <div key={di} className="min-h-[72px] bg-slate-50/60" />
                  }

                  const dayData = servicesByDate[dateKey]
                  const confirmed = dayData?.confirmed ?? []
                  const reservations = dayData?.reservations ?? []
                  const allItems = [...confirmed, ...reservations]
                  const isToday = dateKey === today
                  const isSelected = dateKey === selectedDay
                  const dayNum = Number(dateKey.split('-')[2])

                  return (
                    <button
                      key={di}
                      type="button"
                      onClick={() => setSelectedDay(dateKey)}
                      className={[
                        'relative min-h-[72px] p-1.5 text-left transition-colors',
                        // visually indicate ordinary schedule days as a subtle gray background (suggestion only)
                        ordinarySet.has(dateKey) && !isSelected ? 'bg-slate-50' : '',
                        isSelected ? 'bg-blue-50 ring-1 ring-inset ring-blue-300' : 'hover:bg-slate-50',
                      ].join(' ')}
                    >
                      {/* ordinary day badge (visible even when selected) */}
                      {ordinarySet.has(dateKey) ? (
                        <span
                          className={`absolute -top-1 left-1 inline-block h-2 w-2 rounded-full ${
                            isSelected ? 'bg-white ring-1 ring-slate-200' : 'bg-slate-300'
                          }`}
                          aria-hidden
                        />
                      ) : null}

                      <span
                        className={[
                          'mb-1 flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium',
                          isToday ? 'bg-blue-700 text-white' : 'text-slate-700',
                        ].join(' ')}
                      >
                        {dayNum}
                      </span>

                      {/* service dots */}
                      <div className="flex flex-wrap gap-0.5">
                        {allItems.slice(0, 4).map((s) => (
                          <span
                            key={s.id}
                            className={`h-1.5 w-1.5 rounded-full ${dotColor(s)}`}
                            title={s.service_type_name ?? s.operational_status}
                          />
                        ))}
                        {allItems.length > 4 && (
                          <span className="text-[10px] leading-none text-slate-400">+{allItems.length - 4}</span>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        )}

        {/* Legend */}
        <div className="border-t border-slate-100 px-4 py-2 flex flex-col gap-2">
          <div className="flex items-center gap-4 flex-wrap">
          {[
            { label: 'Titular', cls: 'bg-blue-600' },
            { label: 'Reserva', cls: 'bg-amber-400' },
            { label: 'Realizado', cls: 'bg-emerald-500' },
            { label: 'Faltou', cls: 'bg-rose-500' },
            { label: 'Dia ordinário (base)', cls: 'bg-slate-300' },
          ].map(({ label, cls }) => (
            <span key={label} className="flex items-center gap-1 text-xs text-slate-500">
              <span className={`h-2 w-2 rounded-full ${cls}`} />
              {label}
            </span>
          ))}
          </div>
          <p className="text-xs text-slate-400">Dias da escala ordinária: representam sua escala regular de trabalho (base). Você pode agendar serviços extras ou plantões nesses dias — eles são apenas uma indicação visual da sua jornada padrão.</p>
        </div>
      </div>

      {/* ── Day panel ── */}
      {selectedDay ? (
        <DayPanel dateKey={selectedDay} isOrdinary={ordinarySet.has(selectedDay)} ordinaryEntry={ordinaryMap[selectedDay]} />
      ) : (
        <div className="flex items-center justify-center rounded-2xl border border-dashed border-slate-200 p-8 text-sm text-slate-400">
          Clique em um dia para ver os serviços
        </div>
      )}
    </div>
  )
}

export default OperationCalendar
