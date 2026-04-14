import { useMemo } from 'react'
import { usePlanningSummary } from '@/features/planning/hooks/usePlanningData'
import { useFinanceSummary } from '@/features/finance/hooks/useFinanceData'
import { useOperationalReport, useFinancialReport } from '@/features/reports/hooks/useReportsData'
import { currentMonthLocal, startOfMonthLocal, todayLocal } from '@/utils/date-period'
import { generateInsights } from '../engine/generate-insights'
import type { InsightSources, Insight, InsightCategory, SourceStatus } from '../types/insights.types'

export function useInsights() {
  // ── Unified period ────────────────────────────────────────────────────
  // All sources share the same temporal window (current month to today).
  // Planning summary is always current-month by backend design.
  const period = useMemo(() => ({
    month: currentMonthLocal(),
    start_date: startOfMonthLocal(),
    end_date: todayLocal(),
  }), [])

  const planningQuery = usePlanningSummary()
  const financeQuery = useFinanceSummary(period.month)
  const operationalQuery = useOperationalReport({
    start_date: period.start_date,
    end_date: period.end_date,
  })
  const financialReportQuery = useFinancialReport({
    start_date: period.start_date,
    end_date: period.end_date,
  })

  // ── Loading ─────────────────────────────────────────────────────────────
  const isLoading =
    planningQuery.isLoading ||
    financeQuery.isLoading ||
    operationalQuery.isLoading ||
    financialReportQuery.isLoading

  // ── Per-source error tracking ───────────────────────────────────────────
  const sourceStatuses: SourceStatus[] = useMemo(() => [
    { name: 'planning', label: 'Planejamento', isError: planningQuery.isError, isLoading: planningQuery.isLoading },
    { name: 'finance', label: 'Financeiro', isError: financeQuery.isError, isLoading: financeQuery.isLoading },
    { name: 'operational', label: 'Operacional', isError: operationalQuery.isError, isLoading: operationalQuery.isLoading },
    { name: 'financial_report', label: 'Financeiro (rel.)', isError: financialReportQuery.isError, isLoading: financialReportQuery.isLoading },
  ], [
    planningQuery.isError, planningQuery.isLoading,
    financeQuery.isError, financeQuery.isLoading,
    operationalQuery.isError, operationalQuery.isLoading,
    financialReportQuery.isError, financialReportQuery.isLoading,
  ])

  const failedSources = sourceStatuses.filter((s) => s.isError)
  const isAllError = failedSources.length === sourceStatuses.length
  const hasPartialError = failedSources.length > 0 && !isAllError

  // ── Source assembly (nulls for failed/missing) ──────────────────────────
  const sources: InsightSources = useMemo(
    () => ({
      planning: planningQuery.data
        ? {
            goal: planningQuery.data.goal,
            confirmed_hours: planningQuery.data.confirmed_hours,
            waiting_hours: planningQuery.data.waiting_hours,
            remaining_hours: planningQuery.data.remaining_hours,
            combinations: planningQuery.data.projection.combinations.length,
          }
        : null,
      finance: financeQuery.data ?? null,
      operational: operationalQuery.data
        ? {
            total_services: operationalQuery.data.summary.total_services,
            confirmed_hours: operationalQuery.data.summary.confirmed_hours,
            realized_hours: operationalQuery.data.summary.realized_hours,
            waiting_hours: operationalQuery.data.summary.waiting_hours,
            by_operational_status: operationalQuery.data.by_operational_status,
            reservation_metrics: operationalQuery.data.reservation_metrics,
          }
        : null,
      financial_report: financialReportQuery.data
        ? {
            total_expected: financialReportQuery.data.summary.total_expected,
            total_received: financialReportQuery.data.summary.total_received,
            total_pending: financialReportQuery.data.summary.total_pending,
            total_overdue: financialReportQuery.data.summary.total_overdue,
            received_percentage: financialReportQuery.data.summary.received_percentage,
          }
        : null,
    }),
    [planningQuery.data, financeQuery.data, operationalQuery.data, financialReportQuery.data]
  )

  const insights: Insight[] = useMemo(() => generateInsights(sources), [sources])

  const byCategory = useMemo(() => {
    const map: Record<InsightCategory, Insight[]> = {
      alert: [],
      opportunity: [],
      recommendation: [],
      trend: [],
    }
    for (const ins of insights) {
      map[ins.category].push(ins)
    }
    return map
  }, [insights])

  return {
    isLoading,
    isAllError,
    hasPartialError,
    failedSources,
    sourceStatuses,
    period,
    insights,
    byCategory,
  }
}
