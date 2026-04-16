import type {
  PlanningInput,
  PlanningResult,
  HistoricalData,
  Feasibility,
  StrategyStep,
} from '../types/planning-operational.types'
import { toSafeInt, toSafeNonNegative, toSafeNumber } from '../utils/safe-number'

const DEFAULT_AVG_HOURS_PER_SERVICE = 8
const DEFAULT_AVG_INCOME_PER_HOUR = 25
const DEFAULT_AVG_HOURS_PER_MONTH = 96

export const FEASIBILITY_THRESHOLDS = {
  highMax: 1.2,
  mediumMax: 1.6,
} as const

const NEUTRAL_RESULT: PlanningResult = {
  required_services: 0,
  estimated_hours: 0,
  estimated_income: 0,
  distribution_by_type: {},
  feasibility: 'MEDIUM',
  cap_exceeded: false,
  cap_available_hours: 0,
  effective_hours: 0,
  strategy: [],
}

type InputValidation = {
  isValid: boolean
  reason: 'INVALID_PERIOD' | 'NO_SERVICE_TYPES' | 'INVALID_TARGET' | null
}

function isValidDateInput(value: string): boolean {
  if (typeof value !== 'string') return false
  const trimmed = value.trim()
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return false
  const parsed = new Date(`${trimmed}T00:00:00`)
  return Number.isFinite(parsed.getTime())
}

function normalizeServiceTypes(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return Array.from(
    new Set(
      value
        .map((v) => (typeof v === 'string' ? v.trim() : ''))
        .filter((v) => v.length > 0),
    ),
  )
}

export function validatePlanningInput(input: PlanningInput): InputValidation {
  const selectedTypes = normalizeServiceTypes(input.service_types)

  if (selectedTypes.length < 1) {
    return { isValid: false, reason: 'NO_SERVICE_TYPES' }
  }

  const start = input.period?.start_date ?? ''
  const end = input.period?.end_date ?? ''
  if (!isValidDateInput(start) || !isValidDateInput(end)) {
    return { isValid: false, reason: 'INVALID_PERIOD' }
  }

  if (input.mode === 'HOURS') {
    const target = toSafeNonNegative(input.target_hours, 0)
    if (target <= 0) return { isValid: false, reason: 'INVALID_TARGET' }
  } else {
    const target = toSafeInt(toSafeNonNegative(input.target_services, 0), 0)
    if (target <= 0) return { isValid: false, reason: 'INVALID_TARGET' }
  }

  return { isValid: true, reason: null }
}

function computeFeasibility(targetHours: number, avgHoursPerMonth: number): Feasibility {
  const safeTargetHours = toSafeNonNegative(targetHours, 0)
  const safeAvgHoursPerMonth = toSafeNonNegative(avgHoursPerMonth, 0)

  if (safeAvgHoursPerMonth <= 0) return 'MEDIUM'

  const ratio = safeTargetHours / safeAvgHoursPerMonth
  if (ratio <= FEASIBILITY_THRESHOLDS.highMax) return 'HIGH'
  if (ratio <= FEASIBILITY_THRESHOLDS.mediumMax) return 'MEDIUM'
  return 'LOW'
}

function buildStrategy(effectiveHours: number, preferredDurations: number[]): StrategyStep[] {
  const FALLBACK = [12, 8, 6, 4]
  const sorted = (preferredDurations.length > 0 ? preferredDurations : FALLBACK)
    .filter((d) => Number.isFinite(d) && d > 0)
    .sort((a, b) => b - a)

  if (sorted.length === 0) return []

  let remaining = Math.floor(toSafeNonNegative(effectiveHours, 0))
  const steps: StrategyStep[] = []

  for (const dur of sorted) {
    if (remaining <= 0) break
    const count = Math.floor(remaining / dur)
    if (count > 0) {
      steps.push({ duration_hours: dur, count, hours: count * dur })
      remaining -= count * dur
    }
  }

  return steps
}

function distributeByType(
  totalServices: number,
  selectedTypes: string[],
  historical: HistoricalData,
): Record<string, number> {
  const safeTotalServices = toSafeInt(toSafeNonNegative(totalServices, 0), 0)
  if (selectedTypes.length === 0 || safeTotalServices <= 0) return {}

  const weights: Record<string, number> = {}
  let totalWeight = 0

  for (const type of selectedTypes) {
    const hist = historical.by_service_type[type]
    const w = Math.max(1, toSafeInt(toSafeNonNegative(hist?.count ?? 1, 1), 1))
    weights[type] = w
    totalWeight += w
  }

  if (totalWeight <= 0) {
    totalWeight = selectedTypes.length
  }

  const distribution: Record<string, number> = {}
  let assigned = 0

  for (let i = 0; i < selectedTypes.length; i++) {
    const type = selectedTypes[i]

    if (i === selectedTypes.length - 1) {
      distribution[type] = Math.max(0, safeTotalServices - assigned)
    } else {
      const share = Math.max(
        0,
        toSafeInt(Math.round((weights[type] / totalWeight) * safeTotalServices), 0),
      )
      distribution[type] = share
      assigned += share
    }
  }

  return distribution
}

function avgIncomePerHour(selectedTypes: string[], historical: HistoricalData): number {
  const typesWithData = selectedTypes.filter((t) => historical.by_service_type[t])
  if (typesWithData.length === 0) {
    return toSafeNonNegative(historical.avg_income_per_hour, DEFAULT_AVG_INCOME_PER_HOUR)
  }

  let totalIncome = 0
  let totalHours = 0

  for (const t of typesWithData) {
    const h = historical.by_service_type[t]
    totalIncome += toSafeNonNegative(h.total_income, 0)
    totalHours += toSafeNonNegative(h.total_hours, 0)
  }

  return totalHours > 0
    ? toSafeNonNegative(totalIncome / totalHours, DEFAULT_AVG_INCOME_PER_HOUR)
    : DEFAULT_AVG_INCOME_PER_HOUR
}

function avgHoursPerService(selectedTypes: string[], historical: HistoricalData): number {
  const typesWithData = selectedTypes.filter((t) => historical.by_service_type[t])
  if (typesWithData.length === 0) {
    return toSafeNonNegative(historical.avg_hours_per_service, DEFAULT_AVG_HOURS_PER_SERVICE)
  }

  let totalHours = 0
  let totalCount = 0

  for (const t of typesWithData) {
    const h = historical.by_service_type[t]
    totalHours += toSafeNonNegative(h.total_hours, 0)
    totalCount += toSafeNonNegative(h.count, 0)
  }

  return totalCount > 0
    ? toSafeNonNegative(totalHours / totalCount, DEFAULT_AVG_HOURS_PER_SERVICE)
    : DEFAULT_AVG_HOURS_PER_SERVICE
}

function countWorkingDays(startIso: string, endIso: string, preferredWeekdays?: number[]): number {
  const start = new Date(`${startIso}T00:00:00`)
  const end = new Date(`${endIso}T00:00:00`)
  if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime()) || end < start) return 0

  const preferred = Array.isArray(preferredWeekdays) && preferredWeekdays.length > 0
    ? new Set(preferredWeekdays.map((d) => Number(d)).filter((d) => Number.isFinite(d) && d >= 0 && d <= 6))
    : null

  let count = 0
  const cur = new Date(start)
  while (cur <= end) {
    const w = cur.getDay()
    if (!preferred || preferred.has(w)) count += 1
    cur.setDate(cur.getDate() + 1)
  }
  return count
}

export function simulatePlan(input: PlanningInput, historical: HistoricalData): PlanningResult {
  const validation = validatePlanningInput(input)
  if (!validation.isValid) {
    return { ...NEUTRAL_RESULT }
  }

  const selectedTypes = normalizeServiceTypes(input.service_types)
  const avgHPS = Math.max(avgHoursPerService(selectedTypes, historical), 1)
  const avgIPH = toSafeNonNegative(avgIncomePerHour(selectedTypes, historical), DEFAULT_AVG_INCOME_PER_HOUR)
  const avgHPM =
    toSafeNonNegative(historical.avg_hours_per_month, DEFAULT_AVG_HOURS_PER_MONTH) ||
    DEFAULT_AVG_HOURS_PER_MONTH

  let estimatedHours: number
  let requiredServices: number

  if (input.mode === 'HOURS') {
    estimatedHours = toSafeNonNegative(input.target_hours, 0)
    requiredServices = Math.ceil(estimatedHours / avgHPS)
  } else {
    requiredServices = toSafeInt(toSafeNonNegative(input.target_services, 0), 0)
    estimatedHours = toSafeInt(Math.round(requiredServices * avgHPS), 0)
  }

  estimatedHours = toSafeNonNegative(estimatedHours, 0)
  requiredServices = toSafeInt(toSafeNonNegative(requiredServices, 0), 0)

  // Cap logic: respect the 120h monthly cap
  const rawCap = input.cap_hours
  const capAvailable =
    typeof rawCap === 'number' && Number.isFinite(rawCap) && rawCap >= 0
      ? toSafeNonNegative(rawCap, 0)
      : estimatedHours
  const capExceeded = estimatedHours > capAvailable + 0.5
  const effectiveHours = Math.min(estimatedHours, capAvailable)

  // Services count adjusted to effective hours when capped
  const effectiveServices = capExceeded
    ? Math.max(1, Math.ceil(effectiveHours / Math.max(avgHPS, 1)))
    : requiredServices

  // Strategy: fit preferred durations into effective hours greedily
  const preferredDurations =
    Array.isArray(input.preferred_durations) && input.preferred_durations.length > 0
      ? input.preferred_durations
      : [12, 8, 6, 4]
  const strategy = buildStrategy(effectiveHours, preferredDurations)

  // Income and distribution are based on achievable (effective) hours
  const estimatedIncome = toSafeNonNegative(
    Math.round(effectiveHours * avgIPH * 100) / 100,
    0,
  )
  const distribution = distributeByType(effectiveServices, selectedTypes, historical)
  const feasibility = computeFeasibility(effectiveHours, avgHPM)

  // Compute working days and average services/day
  const workingDays = countWorkingDays(input.period.start_date, input.period.end_date, input.preferred_work_days)
  const avgPerDay = workingDays > 0 ? Math.ceil(effectiveServices / workingDays) : effectiveServices

  return {
    required_services: effectiveServices,
    estimated_hours: estimatedHours,
    estimated_income: estimatedIncome,
    distribution_by_type: distribution,
    feasibility,
    cap_exceeded: capExceeded,
    cap_available_hours: capAvailable,
    effective_hours: effectiveHours,
    strategy,
    working_days_count: workingDays,
    avg_services_per_day: avgPerDay,
  }
}

export function buildHistoricalData(
  services: Array<{
    service_type_key?: string
    duration_hours: number
    amount_total: number
    operational_status: string
  }>,
  monthsSpan = 3,
): HistoricalData {
  const countableStatuses = new Set(['REALIZADO', 'TITULAR', 'CONVERTIDO_TITULAR'])

  const relevant = (Array.isArray(services) ? services : []).filter((s) =>
    countableStatuses.has(String(s.operational_status ?? '')),
  )

  const byType: HistoricalData['by_service_type'] = {}
  let totalHours = 0
  let totalIncome = 0

  for (const s of relevant) {
    const key = typeof s.service_type_key === 'string' && s.service_type_key.trim().length > 0
      ? s.service_type_key
      : 'UNKNOWN'

    if (!byType[key]) {
      byType[key] = {
        count: 0,
        total_hours: 0,
        total_income: 0,
        avg_duration: 0,
        avg_income_per_hour: 0,
      }
    }

    const safeDuration = toSafeNonNegative(s.duration_hours, 0)
    const safeIncome = toSafeNonNegative(s.amount_total, 0)

    byType[key].count++
    byType[key].total_hours += safeDuration
    byType[key].total_income += safeIncome
    totalHours += safeDuration
    totalIncome += safeIncome
  }

  for (const key of Object.keys(byType)) {
    const t = byType[key]
    t.avg_duration = t.count > 0 ? toSafeNonNegative(t.total_hours / t.count, 0) : 0
    t.avg_income_per_hour = t.total_hours > 0 ? toSafeNonNegative(t.total_income / t.total_hours, 0) : 0
  }

  const totalCount = relevant.length
  const span = Math.max(toSafeInt(toSafeNumber(monthsSpan, 1), 1), 1)

  return {
    avg_hours_per_service:
      totalCount > 0
        ? toSafeNonNegative(totalHours / totalCount, DEFAULT_AVG_HOURS_PER_SERVICE)
        : DEFAULT_AVG_HOURS_PER_SERVICE,
    avg_income_per_hour:
      totalHours > 0
        ? toSafeNonNegative(totalIncome / totalHours, DEFAULT_AVG_INCOME_PER_HOUR)
        : DEFAULT_AVG_INCOME_PER_HOUR,
    avg_services_per_month: toSafeNonNegative(totalCount / span, 0),
    avg_hours_per_month: toSafeNonNegative(totalHours / span, 0),
    by_service_type: byType,
  }
}
