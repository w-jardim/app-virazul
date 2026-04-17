// Planning Operational

export type PlanningMode = 'HOURS' | 'COUNT'

export type PlanningInput = {
  mode: PlanningMode
  target_hours?: number
  target_services?: number
  service_types: string[]
  period: {
    start_date: string
    end_date: string
  }
  cap_hours?: number
  preferred_durations?: number[]
  /** Specific calendar dates selected by the user in YYYY-MM-DD format */
  preferred_dates?: string[]
  /** Explicit hour choice per selected date. Values should follow preferred_durations when present. */
  preferred_date_hours?: Record<string, number>
  /** Weekdays user prefers to work: 0=Sunday .. 6=Saturday. Empty = all days */
  preferred_work_days?: number[]
}

export type Feasibility = 'LOW' | 'MEDIUM' | 'HIGH'

export type StrategyStep = {
  duration_hours: number
  count: number
  hours: number
}

export type PlanningResult = {
  required_services: number
  estimated_hours: number
  estimated_income: number
  distribution_by_type: Record<string, number>
  feasibility: Feasibility
  cap_exceeded: boolean
  cap_available_hours: number
  effective_hours: number
  strategy: StrategyStep[]
  /** Number of working days in the target period (respecting preferred_work_days) */
  working_days_count?: number
  /** Average planned services per working day (rounded up) */
  avg_services_per_day?: number
  /** Number of specific dates selected in the calendar */
  selected_dates_count?: number
  /** Sum of configured hours across selected dates */
  selected_date_hours_total?: number
}

export type HistoricalData = {
  avg_hours_per_service: number
  avg_income_per_hour: number
  avg_services_per_month: number
  avg_hours_per_month: number
  by_service_type: Record<
    string,
    {
      count: number
      total_hours: number
      total_income: number
      avg_duration: number
      avg_income_per_hour: number
    }
  >
}

export type PlanningSourceName =
  | 'planning'
  | 'finance'
  | 'operational'
  | 'service_types'
  | 'services_history'

export type PlanningSourceStatus = {
  name: PlanningSourceName
  label: string
  isError: boolean
  isLoading: boolean
}
