import { useMemo } from 'react'
import { useQueries, useQuery } from '@tanstack/react-query'
import { dashboardApi } from '../api/dashboard.api'
import { getTodayDateKey } from './dashboard.format'
import type { DashboardDataBundle } from '../types/dashboard.types'
import { servicesApi } from '@/features/services/api/services.api'
import { financeApi } from '@/features/finance/api/finance.api'

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

  const [summaryQuery, alertsQuery, agendaQuery, planningQuery] = useQueries({
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
      }
    ]
  })

  const serviceDateRangeQuery = useQuery({
    queryKey: ['services', 'date-range'],
    queryFn: servicesApi.getDateRange,
    staleTime: 15_000
  })

  const financeRange = useMemo(() => {
    if (!serviceDateRangeQuery.data?.start_date || !serviceDateRangeQuery.data?.end_date) {
      return null
    }

    return {
      start_date: serviceDateRangeQuery.data.start_date,
      end_date: serviceDateRangeQuery.data.end_date,
    }
  }, [serviceDateRangeQuery.data?.end_date, serviceDateRangeQuery.data?.start_date])

  const financeQuery = useQuery({
    queryKey: ['dashboard', 'finance', 'report', financeRange],
    queryFn: async () => {
      if (!financeRange) {
        return emptyData.finance
      }

      const report = await financeApi.getReport(financeRange)
      return report.summary
    },
    enabled: serviceDateRangeQuery.isSuccess,
    staleTime: 30_000
  })

  const data = useMemo<DashboardDataBundle>(() => {
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
    serviceDateRangeQuery.isLoading ||
    financeQuery.isLoading

  const hasError =
    summaryQuery.isError ||
    alertsQuery.isError ||
    agendaQuery.isError ||
    planningQuery.isError ||
    serviceDateRangeQuery.isError ||
    financeQuery.isError

  return {
    data,
    queries: {
      summaryQuery,
      alertsQuery,
      agendaQuery,
      planningQuery,
      serviceDateRangeQuery,
      financeQuery
    },
    isInitialLoading,
    hasError,
    refetchAll: () => {
      void summaryQuery.refetch()
      void alertsQuery.refetch()
      void agendaQuery.refetch()
      void planningQuery.refetch()
      void serviceDateRangeQuery.refetch()
      void financeQuery.refetch()
    }
  }
}
