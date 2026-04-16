import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useServiceTypes } from '@/features/services/hooks/useServicesData'
import { useFinanceSummary } from '@/features/finance/hooks/useFinanceData'
import { useOperationalReport } from '@/features/reports/hooks/useReportsData'
import { usePlanningSummary } from '@/features/planning/hooks/usePlanningData'
import { currentMonthLocal, startOfMonthLocal, todayLocal } from '@/utils/date-period'
import { servicesApi } from '@/features/services/api/services.api'
import { simulatePlan, buildHistoricalData, validatePlanningInput } from '../engine/simulate-plan'
import { toSafePositive } from '../utils/safe-number'
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
  const [targetHours, setTargetHoursState] = useState<number>(0)
  const [targetServices, setTargetServicesState] = useState<number>(0)
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>([])
  const [selectedDurations, setSelectedDurations] = useState<number[]>([])

  const setTargetHours = (value: number) => setTargetHoursState(toSafeNonNegative(value, 0))
  const setTargetServices = (value: number) => setTargetServicesState(toSafeNonNegative(value, 0))

  const serviceTypesQuery = useServiceTypes()
  const planningSummaryQuery = usePlanningSummary()
  const financeQuery = useFinanceSummary(period.month)
  const operationalQuery = useOperationalReport({
    start_date: period.start_date,
    end_date: period.end_date,
  })

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
    ],
  )

  const failedSources = sourceStatuses.filter((s) => s.isError)
  const isAllError = sourceStatuses.length > 0 && failedSources.length === sourceStatuses.length
  const hasPartialError = failedSources.length > 0 && !isAllError

  const isLoading = sourceStatuses.some((s) => s.isLoading)

  const availableTypes = useMemo(() => serviceTypesQuery.data ?? [], [serviceTypesQuery.data])

  const hasHistoryData = Array.isArray(servicesQuery.data) && servicesQuery.data.length > 0

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

  const planInput: PlanningInput = useMemo(() => {
    // derive period from selectedMonth when provided
    let start = period.start_date
    let end = period.end_date
    if (selectedMonth && /^\d{4}-\d{2}$/.test(selectedMonth)) {
      const [yStr, mStr] = selectedMonth.split('-')
      const y = Number(yStr)
      const m = Number(mStr)
      if (Number.isFinite(y) && Number.isFinite(m) && m >= 1 && m <= 12) {
        start = `${y}-${String(m).padStart(2, '0')}-01`
        // last day of month: create Date of next month day 0
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
      // If user selected a different month than current, use full monthly goal (fresh month)
      cap_hours: (function() {
        const sel = selectedMonth
        const current = currentMonthLocal()
        if (sel && sel !== current) {
          // plan for a future month: use configured monthly goal when available, else 120h
          return planningSummaryQuery.data?.goal ?? 120
        }
        // default: current month, respect remaining_hours
        return planningSummaryQuery.data?.remaining_hours
      })(),
      preferred_durations: selectedDurations.length > 0
        ? selectedDurations
        : planningSummaryQuery.data?.preferences.preferred_durations,
      preferred_work_days: selectedWeekdays,
    }
  }, [mode, targetHours, targetServices, selectedTypes, availableTypes, period, planningSummaryQuery.data, selectedDurations, selectedWeekdays, selectedMonth])

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
    selectedDurations,
    setSelectedDurations,
    selectedDurations,
    setSelectedDurations,

    isLoading,
    isAllError,
    hasPartialError,
    failedSources,
    sourceStatuses,
    hasInsufficientInput,
    inputValidationMessage,
  }
}
