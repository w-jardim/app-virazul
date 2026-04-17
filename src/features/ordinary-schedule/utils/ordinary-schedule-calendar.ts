import type { WorkDay } from '../types/schedule.types'
import type { AgendaMonthPayload, AgendaServiceItem, AgendaWeekDayPayload } from '@/features/agenda/types/agenda.types'

export type OrdinaryScheduleEntry = {
  date: string
  start_time: string
  duration_hours: number
}

export function buildOrdinaryScheduleMap(workDays?: WorkDay[] | null): Record<string, OrdinaryScheduleEntry> {
  if (!Array.isArray(workDays)) return {}

  return workDays.reduce<Record<string, OrdinaryScheduleEntry>>((acc, workDay) => {
    if (!workDay?.date) return acc
    acc[workDay.date] = {
      date: workDay.date,
      start_time: workDay.start_time,
      duration_hours: workDay.duration_hours,
    }
    return acc
  }, {})
}

export function mergeAgendaMonthWithOrdinarySchedule(
  month: string,
  agendaMonth: AgendaMonthPayload | undefined,
  workDays?: WorkDay[] | null,
): AgendaMonthPayload {
  const agendaByDate = new Map<string, AgendaWeekDayPayload>()
  for (const day of agendaMonth?.days ?? []) {
    agendaByDate.set(day.date, day)
  }

  const dates = new Set<string>([
    ...(agendaMonth?.days ?? []).map((day) => day.date),
    ...(workDays ?? []).map((workDay) => workDay.date),
  ].filter(Boolean))

  const days = Array.from(dates)
    .sort()
    .map<AgendaWeekDayPayload>((date) => {
      const existing = agendaByDate.get(date)
      return {
        date,
        confirmed: existing?.confirmed ?? [],
        reservations: existing?.reservations ?? [],
      }
    })

  return {
    month,
    days,
  }
}

export function hasExtraServices(items: AgendaServiceItem[]): boolean {
  return items.length > 0
}
