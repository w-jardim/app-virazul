import { useMemo } from 'react'
import { useQueries } from '@tanstack/react-query'
import { dashboardApi } from '../api/dashboard.api'
import { getMonthKey, getTodayDateKey } from './dashboard.format'
import type { DashboardDataBundle } from '../types/dashboard.types'

const emptyData: DashboardDataBundle = {
  summary: {
    today: {
      confirmed: [],
      reservations: []
    },
    counts: {
      alerts_active: 0,
      operational_pending: 0,
      financial_pending: 0
    },
    hours: {
      confirmed: 0,
      waiting: 0
    }
  },
  alerts: [],
  agendaDay: {
    date: '',
    confirmed: [],
    reservations: []
  },
  planning: {
    goal: 0,
    confirmed_hours: 0,
    waiting_hours: 0,
    remaining_hours: 0
  },
  finance: {
    total_expected: 0,
    total_received: 0,
    total_pending: 0,
    total_overdue: 0,
    by_status: {}
  }
}

export function useDashboardData() {
  const today = getTodayDateKey()
  const month = getMonthKey()

  const [summaryQuery, alertsQuery, agendaQuery, planningQuery, financeQuery] = useQueries({
    queries: [
      {
        queryKey: ['dashboard', 'summary'],
        queryFn: dashboardApi.getSummary,
        staleTime: 30_000
      },
      {
        queryKey: ['dashboard', 'alerts', 'recent'],
        queryFn: dashboardApi.getAlerts,
        staleTime: 15_000
      },
      {
        queryKey: ['dashboard', 'agenda', today],
        queryFn: () => dashboardApi.getAgendaDay(today),
        staleTime: 15_000
      },
      {
        queryKey: ['dashboard', 'planning', 'summary'],
        queryFn: dashboardApi.getPlanningSummary,
        staleTime: 30_000
      },
      {
        queryKey: ['dashboard', 'finance', 'summary', month],
        queryFn: () => dashboardApi.getFinanceSummary(month),
        staleTime: 30_000
      }
    ]
  })

  const data = useMemo<DashboardDataBundle>(() => {
    // Fonte de verdade por bloco:
    // - /dashboard/summary para KPIs consolidados
    // - endpoints dedicados para listas e detalhes (agenda, alertas, planejamento e financeiro)
    // Assim evitamos duplicar agregacoes no frontend e mantemos cada secao com contrato explicito.
    return {
      summary: summaryQuery.data || emptyData.summary,
      alerts: alertsQuery.data || emptyData.alerts,
      agendaDay: agendaQuery.data || { ...emptyData.agendaDay, date: today },
      planning: planningQuery.data || emptyData.planning,
      finance: financeQuery.data || emptyData.finance
    }
  }, [summaryQuery.data, alertsQuery.data, agendaQuery.data, planningQuery.data, financeQuery.data, today])

  const isInitialLoading =
    summaryQuery.isLoading ||
    alertsQuery.isLoading ||
    agendaQuery.isLoading ||
    planningQuery.isLoading ||
    financeQuery.isLoading

  const hasError =
    summaryQuery.isError || alertsQuery.isError || agendaQuery.isError || planningQuery.isError || financeQuery.isError

  return {
    data,
    queries: {
      summaryQuery,
      alertsQuery,
      agendaQuery,
      planningQuery,
      financeQuery
    },
    isInitialLoading,
    hasError,
    refetchAll: () => {
      void summaryQuery.refetch()
      void alertsQuery.refetch()
      void agendaQuery.refetch()
      void planningQuery.refetch()
      void financeQuery.refetch()
    }
  }
}
