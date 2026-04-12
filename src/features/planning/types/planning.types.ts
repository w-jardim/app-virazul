export type ApiEnvelope<T> = {
  data: T
  meta: unknown | null
  errors: Array<{ code: string; message: string }> | null
}

export type PlanningProjectionItem = {
  duration: number
  count: number
}

export type PlanningCombination = {
  items: PlanningProjectionItem[]
  total_hours: number
}

export type PlanningPreferences = {
  preferred_durations: number[]
  avoided_durations: number[]
  preferred_durations_on_days_off: number[]
  preferred_durations_on_work_days: number[]
  max_single_shift_hours: number | null
}

export type PlanningSummary = {
  goal: number
  confirmed_hours: number
  waiting_hours: number
  remaining_hours: number
  projection: {
    by_duration: Record<string, number>
    combinations: PlanningCombination[]
  }
  preferences: PlanningPreferences
}

export type PlanningSuggestion = {
  date: string
  suggested_duration: number
  confidence: number
  reason: string
}
