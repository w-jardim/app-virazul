import React from 'react'
import type { WeekdayEntry, WorkDay } from '../types/schedule.types'

// ── constants ─────────────────────────────────────────────────────────────────

export const WEEKDAY_LABELS: Record<number, string> = {
  1: 'Seg', 2: 'Ter', 3: 'Qua', 4: 'Qui', 5: 'Sex', 6: 'Sáb', 7: 'Dom',
}

export const DURATION_OPTIONS = [6, 8, 12, 24]

// ── WeekdayRow — one row per day of the week ──────────────────────────────────

type WeekdayRowProps = {
  weekday: number
  entry: WeekdayEntry | undefined
  onToggle: (weekday: number) => void
  onChange: (weekday: number, field: 'start_time' | 'duration_hours', value: string | number) => void
}

export const WeekdayRow = ({ weekday, entry, onToggle, onChange }: WeekdayRowProps) => {
  const active = Boolean(entry)

  return (
    <div className={`flex items-center gap-3 rounded-lg border px-3 py-2 transition ${active ? 'border-sky-200 bg-sky-50' : 'border-slate-100 bg-white'}`}>
      <button
        type="button"
        onClick={() => onToggle(weekday)}
        className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold transition ${
          active ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
        }`}
      >
        {WEEKDAY_LABELS[weekday]}
      </button>

      {active ? (
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <div className="flex items-center gap-1">
            <label className="text-xs text-slate-500">Início</label>
            <input
              type="time"
              value={entry!.start_time}
              onChange={(e) => onChange(weekday, 'start_time', e.target.value)}
              className="rounded border border-slate-200 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-sky-400"
            />
          </div>
          <div className="flex items-center gap-1">
            <label className="text-xs text-slate-500">Horas</label>
            <select
              value={entry!.duration_hours}
              onChange={(e) => onChange(weekday, 'duration_hours', Number(e.target.value))}
              className="rounded border border-slate-200 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-sky-400"
            >
              {DURATION_OPTIONS.map((h) => (
                <option key={h} value={h}>{h}h</option>
              ))}
            </select>
          </div>
        </div>
      ) : (
        <span className="text-xs text-slate-400">Folga</span>
      )}
    </div>
  )
}

// ── MonthCalendar — shows work days for a month ───────────────────────────────

type MonthCalendarProps = {
  year: number
  month: number  // 1-based
  workDays: WorkDay[]
}

const MONTH_NAMES = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
]
const DAY_INITIALS = ['S','T','Q','Q','S','S','D']

function buildCalendarGrid(year: number, month: number) {
  const firstDay = new Date(year, month - 1, 1)
  const totalDays = new Date(year, month, 0).getDate()

  // isoWeekday of first day (0=Sun → 6 … 1=Mon → 0)
  let startOffset = firstDay.getDay() - 1
  if (startOffset < 0) startOffset = 6 // Sunday → last column

  const cells: Array<number | null> = Array(startOffset).fill(null)
  for (let d = 1; d <= totalDays; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

export const MonthCalendar = ({ year, month, workDays }: MonthCalendarProps) => {
  const cells = buildCalendarGrid(year, month)
  const workSet = new Map<string, WorkDay>()

  for (const wd of workDays) {
    const day = Number(wd.date.split('-')[2])
    workSet.set(String(day), wd)
  }

  return (
    <div>
      <p className="mb-3 text-sm font-semibold text-slate-700">
        {MONTH_NAMES[month - 1]} {year}
      </p>

      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-xl border border-slate-200 bg-slate-200 text-center text-xs">
        {DAY_INITIALS.map((d, i) => (
          <div key={i} className="bg-slate-50 py-1 font-semibold text-slate-400">{d}</div>
        ))}

        {cells.map((day, i) => {
          if (!day) {
            return <div key={`e-${i}`} className="bg-white py-2" />
          }

          const wd = workSet.get(String(day))
          const isWork = Boolean(wd)

          return (
            <div
              key={day}
              className={`flex flex-col items-center justify-center py-1.5 ${
                isWork ? 'bg-sky-50' : 'bg-white'
              }`}
            >
              <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                isWork ? 'bg-sky-600 text-white' : 'text-slate-600'
              }`}>
                {day}
              </span>
              {wd ? (
                <span className="mt-0.5 text-[10px] leading-tight text-sky-600">
                  {wd.start_time} · {wd.duration_hours}h
                </span>
              ) : (
                <span className="mt-0.5 text-[10px] leading-tight text-slate-300">folga</span>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded-full bg-sky-600" /> Plantão ({workDays.length} dias)
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded-full bg-slate-200" /> Folga ({new Date(year, month, 0).getDate() - workDays.length} dias)
        </span>
      </div>
    </div>
  )
}
