export type ScheduleType = 'WEEKLY' | 'BIWEEKLY' | 'INTERVAL'

export type WeekdayEntry = {
  weekday: number         // 1=Mon … 7=Sun
  start_time: string      // HH:MM
  duration_hours: number  // 6 | 8 | 12 | 24
}

export type WeeklyTemplate = {
  type: 'WEEKLY'
  entries: WeekdayEntry[]
}

export type BiweeklyTemplate = {
  type: 'BIWEEKLY'
  reference_date: string  // YYYY-MM-DD (Monday of a "Week A")
  week_a: WeekdayEntry[]
  week_b: WeekdayEntry[]
}

export type IntervalTemplate = {
  type: 'INTERVAL'
  reference_date: string  // YYYY-MM-DD (first work day)
  start_time: string      // HH:MM
  work_hours: number
  off_hours: number
}

export type ScheduleTemplate = WeeklyTemplate | BiweeklyTemplate | IntervalTemplate

export type WorkDay = {
  date: string            // YYYY-MM-DD
  start_time: string      // HH:MM
  duration_hours: number
  week?: 'A' | 'B'       // only for BIWEEKLY
}

export type ScheduleCalendar = {
  month: string           // YYYY-MM
  template: ScheduleTemplate | null
  work_days: WorkDay[]
}
