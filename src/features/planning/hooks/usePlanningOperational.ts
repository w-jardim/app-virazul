import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useServiceTypes } from '@/features/services/hooks/useServicesData'
import { useFinanceSummary } from '@/features/finance/hooks/useFinanceData'
import { useOperationalReport } from '@/features/reports/hooks/useReportsData'
import { usePlanningSummary } from '@/features/planning/hooks/usePlanningData'
import { currentMonthLocal, startOfMonthLocal, todayLocal } from '@/utils/date-period'
import { servicesApi } from '@/features/services/api/services.api'
import { simulatePlan, buildHistoricalData, validatePlanningInput } from '../engine/simulate-plan'
import { toSafePositive } from '../utils/safe-number'
import { useScheduleCalendar } from '@/features/ordinary-schedule/hooks/useScheduleData'
import { buildOrdinaryScheduleMap } from '@/features/ordinary-schedule/utils/ordinary-schedule-calendar'
import type {
  PlanningInput,
  PlanningMode,
  PlanningResult,
  HistoricalData,
  PlanningSourceStatus,
} from '../types/planning-operational.types'

function getInputValidationMessage(reason: 'INVALID_PERIOD' | 'NO_SERVICE_TYPES' | 'INVALID_TARGET' | null): string {
  if (reason === 'NO_SERVICE_TYPES') return 'Selecione pelo menos um tipo de serviço para simular.'
  if (reason === 'INVALID_PERIOD') return 'O período da simulação é inválido. Atualize e tente novamente.'
  if (reason === 'INVALID_TARGET') return 'Informe uma meta maior que zero para executar a simulação.'
  return 'Entrada insuficiente para simulação.'
}

const EXCLUDED_SIMULATION_TYPE_TERMS = ['OUTROS', 'ORDINARIA', 'ORDINARY', 'COMPULSORIO', 'COMPULSORY']
const FALLBACK_PREFERRED_DURATIONS = [6, 8, 12, 24]

function isAllowedSimulationType(type: { key?: string | null; name?: string | null }) {
  const haystack = `${type.key ?? ''} ${type.name ?? ''}`.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase()
  return !EXCLUDED_SIMULATION_TYPE_TERMS.some((term) => haystack.includes(term))
}

function normalizeDurations(values?: number[] | null): number[] {
  if (!Array.isArray(values)) return []
  return Array.from(new Set(values.filter((value) => Number.isFinite(value) && value > 0))).sort((a, b) => a - b)
}

function getDefaultDateHours(options: number[]): number {
  if (options.includes(12)) return 12
  return options[options.length - 1] ?? 8
}

export function usePlanningOperational() {
  const period = useMemo(
    () => ({
      month: currentMonthLocal(),
      start_date: startOfMonthLocal(),
      end_date: todayLocal(),
    }),
    [],
  )

  const [selectedMonth, setSelectedMonth] = useState<string | null>(null)

  const [mode, setMode] = useState<PlanningMode>('HOURS')
  const [targetHours, setTargetHoursState] = useState<number>(1)
  const [targetServices, setTargetServicesState] = useState<number>(1)
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>([])
  const [selectedDates, setSelectedDates] = useState<string[]>([])
  const [selectedDateHours, setSelectedDateHoursState] = useState<Record<string, number>>({})
  const [selectedDurations, setSelectedDurations] = useState<number[]>([])

  const setTargetHours = (value: number) => setTargetHoursState(toSafePositive(value, 1))
  const setTargetServices = (value: number) => setTargetServicesState(toSafePositive(value, 1))

  const serviceTypesQuery = useServiceTypes()
  const planningSummaryQuery = usePlanningSummary()
  const financeQuery = useFinanceSummary(period.month)
  const operationalQuery = useOperationalReport({
    start_date: period.start_date,
    end_date: period.end_date,
  })

  const ordinaryScheduleMonth = selectedMonth ?? period.month
  const ordinaryScheduleQuery = useScheduleCalendar(ordinaryScheduleMonth)

  const servicesQuery = useQuery({
    queryKey: ['services', 'list-all'],
    queryFn: () => servicesApi.list(),
    staleTime: 60_000,
  })

  const sourceStatuses: PlanningSourceStatus[] = useMemo(
    () => [
      {
        name: 'service_types',
        label: 'Tipos de serviço',
        isError: serviceTypesQuery.isError,
        isLoading: serviceTypesQuery.isLoading,
      },
      {
        name: 'planning',
        label: 'Planejamento',
        isError: planningSummaryQuery.isError,
        isLoading: planningSummaryQuery.isLoading,
      },
      {
        name: 'finance',
        label: 'Financeiro',
        isError: financeQuery.isError,
        isLoading: financeQuery.isLoading,
      },
      {
        name: 'operational',
        label: 'Operacional',
        isError: operationalQuery.isError,
        isLoading: operationalQuery.isLoading,
      },
      {
        name: 'services_history',
        label: 'Histórico de serviços',
        isError: servicesQuery.isError,
        isLoading: servicesQuery.isLoading,
      },
    ],
    [
      serviceTypesQuery.isError,
      serviceTypesQuery.isLoading,
      planningSummaryQuery.isError,
      planningSummaryQuery.isLoading,
      financeQuery.isError,
      financeQuery.isLoading,
      operationalQuery.isError,
      operationalQuery.isLoading,
      servicesQuery.isError,
      servicesQuery.isLoading,
      ordinaryScheduleQuery.isError,
      ordinaryScheduleQuery.isLoading,
    ],
  )

  const failedSources = sourceStatuses.filter((s) => s.isError)
  const isAllError = sourceStatuses.length > 0 && failedSources.length === sourceStatuses.length
  const hasPartialError = failedSources.length > 0 && !isAllError

  const isLoading = sourceStatuses.some((s) => s.isLoading)

  const availableTypes = useMemo(
    () => (serviceTypesQuery.data ?? []).filter((type) => isAllowedSimulationType(type)),
    [serviceTypesQuery.data],
  )

  const hasHistoryData = Array.isArray(servicesQuery.data) && servicesQuery.data.length > 0

  const ordinaryScheduleMap = useMemo(
    () => buildOrdinaryScheduleMap(ordinaryScheduleQuery.data?.work_days),
    [ordinaryScheduleQuery.data?.work_days],
  )

  const ordinaryScheduleBlockedDates = useMemo(
    () => Object.keys(ordinaryScheduleMap).sort(),
    [ordinaryScheduleMap],
  )

  const historical: HistoricalData = useMemo(() => {
    if (!servicesQuery.data || servicesQuery.data.length === 0) {
      return {
        avg_hours_per_service: 8,
        avg_income_per_hour: 25,
        avg_services_per_month: 12,
        avg_hours_per_month: 96,
        by_service_type: {},
      }
    }
    return buildHistoricalData(servicesQuery.data, 3)
  }, [servicesQuery.data])

  const durationOptions = useMemo(() => {
    const fromSelection = normalizeDurations(selectedDurations)
    if (fromSelection.length > 0) return fromSelection

    const fromPreferences = normalizeDurations(planningSummaryQuery.data?.preferences?.preferred_durations)
    if (fromPreferences.length > 0) return fromPreferences

    return FALLBACK_PREFERRED_DURATIONS
  }, [planningSummaryQuery.data?.preferences?.preferred_durations, selectedDurations])

  // The ordinary schedule is used as a base reference (ordinaryScheduleMap/ordinaryScheduleBlockedDates),
  // but we must NOT automatically remove or "block" user-selected dates or hours. Users can schedule
  // extras on the same day after their usual shift. Therefore we intentionally avoid filtering
  // `selectedDates` or `selectedDateHours` when ordinary schedule data changes.

  useEffect(() => {
    const selectedSet = new Set(selectedDates)
    const defaultHours = getDefaultDateHours(durationOptions)

    setSelectedDateHoursState((current) => {
      const next: Record<string, number> = {}
      let changed = false

      for (const date of selectedDates) {
        const currentValue = current[date]
        const normalizedValue = Number.isFinite(currentValue) && durationOptions.includes(currentValue)
          ? currentValue
          : defaultHours

        next[date] = normalizedValue

        if (current[date] !== normalizedValue) {
          changed = true
        }
      }

      if (!changed) {
        const currentKeys = Object.keys(current)
        if (currentKeys.length !== selectedDates.length) {
          changed = true
        } else if (currentKeys.some((key) => !selectedSet.has(key))) {
          changed = true
        }
      }

      return changed ? next : current
    })
  }, [durationOptions, selectedDates])

  const planInput: PlanningInput = useMemo(() => {
    let start = period.start_date
    let end = period.end_date
    if (selectedMonth && /^\d{4}-\d{2}$/.test(selectedMonth)) {
      const [yStr, mStr] = selectedMonth.split('-')
      const y = Number(yStr)
      const m = Number(mStr)
      if (Number.isFinite(y) && Number.isFinite(m) && m >= 1 && m <= 12) {
        start = `${y}-${String(m).padStart(2, '0')}-01`
        const last = new Date(y, m, 0)
        const lastDay = last.getDate()
        end = `${y}-${String(m).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
      }
    }

    return {
      mode,
      target_hours: mode === 'HOURS' ? targetHours : undefined,
      target_services: mode === 'COUNT' ? targetServices : undefined,
      service_types: selectedTypes.length > 0 ? selectedTypes : availableTypes.map((t) => t.key),
      period: {
        start_date: start,
        end_date: end,
      },
      cap_hours: (() => {
        const sel = selectedMonth
        const current = currentMonthLocal()
        if (sel && sel !== current) {
          return planningSummaryQuery.data?.goal ?? 120
        }
        return planningSummaryQuery.data?.remaining_hours
      })(),
      preferred_durations: durationOptions,
      preferred_dates: selectedDates.length > 0 ? selectedDates : undefined,
      preferred_date_hours: selectedDates.length > 0 ? selectedDateHours : undefined,
      preferred_work_days: selectedWeekdays,
    }
  }, [
    mode,
    targetHours,
    targetServices,
    selectedTypes,
    availableTypes,
    period,
    planningSummaryQuery.data,
    selectedDates,
    selectedDateHours,
    selectedWeekdays,
    selectedMonth,
    durationOptions,
  ])

  const inputValidation = useMemo(() => validatePlanningInput(planInput), [planInput])
  const hasInsufficientInput = !isLoading && !inputValidation.isValid
  const inputValidationMessage = hasInsufficientInput
    ? getInputValidationMessage(inputValidation.reason)
    : null

  const result: PlanningResult | null = useMemo(() => {
    if (isLoading || !inputValidation.isValid) return null
    return simulatePlan(planInput, historical)
  }, [historical, inputValidation.isValid, isLoading, planInput])

  const currentProgress = useMemo(() => {
    if (!planningSummaryQuery.data) return null
    return {
      goal: planningSummaryQuery.data.goal,
      confirmed_hours: planningSummaryQuery.data.confirmed_hours,
      waiting_hours: planningSummaryQuery.data.waiting_hours,
      remaining_hours: planningSummaryQuery.data.remaining_hours,
    }
  }, [planningSummaryQuery.data])

  useEffect(() => {
    if (!planningSummaryQuery.data) return
    setTargetHoursState((current) => (current > 1 ? current : toSafePositive(planningSummaryQuery.data.goal, 1)))
    setTargetServicesState((current) => (current > 1 ? current : 1))
  }, [planningSummaryQuery.data])

  const setSelectedDateHours = (value: Record<string, number>) => {
    setSelectedDateHoursState(value)
  }

  return {
    mode,
    setMode,
    targetHours,
    setTargetHours,
    targetServices,
    setTargetServices,
    selectedTypes,
    setSelectedTypes,

    availableTypes,
    historical,
    hasHistoryData,
    result,
    currentProgress,
    period,
    selectedWeekdays,
    setSelectedWeekdays,
    selectedMonth,
    setSelectedMonth,
    selectedDates,
    setSelectedDates,
    selectedDateHours,
    setSelectedDateHours,
    selectedDurations,
    setSelectedDurations,
    durationOptions,
    ordinaryScheduleMonth,
    ordinaryScheduleMap,
    ordinaryScheduleBlockedDates,

    isLoading,
    isAllError,
    hasPartialError,
    failedSources,
    sourceStatuses,
    hasInsufficientInput,
    inputValidationMessage,
  }
}

