import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { dashboardApi } from '../api/dashboard.api'
import { getTodayDateKey } from '../hooks/dashboard.format'
import { useDashboardData } from '../hooks/useDashboardData'
import { servicesApi } from '@/features/services/api/services.api'
import { financeApi } from '@/features/finance/api/finance.api'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false
      }
    }
  })

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

describe('useDashboardData integration', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('calls feature endpoints with expected date and first-to-last service range parameters', async () => {
    const getSummarySpy = vi.spyOn(dashboardApi, 'getSummary').mockResolvedValue({
      today: { confirmed: [], reservations: [] },
      counts: { alerts_active: 0, operational_pending: 0, financial_pending: 0 },
      hours: { confirmed: 0, waiting: 0 }
    })
    const getAlertsSpy = vi.spyOn(dashboardApi, 'getAlerts').mockResolvedValue([])
    const getAgendaSpy = vi.spyOn(dashboardApi, 'getAgendaDay').mockResolvedValue({
      date: getTodayDateKey(),
      confirmed: [],
      reservations: []
    })
    const getPlanningSpy = vi.spyOn(dashboardApi, 'getPlanningSummary').mockResolvedValue({
      goal: 0,
      confirmed_hours: 0,
      waiting_hours: 0,
      remaining_hours: 0
    })
    const getDateRangeSpy = vi.spyOn(servicesApi, 'getDateRange').mockResolvedValue({
      start_date: '2026-04-01',
      end_date: '2026-04-16',
    })
    const getFinanceSpy = vi.spyOn(financeApi, 'getReport').mockResolvedValue({
      filters: { start_date: '2026-04-01', end_date: '2026-04-16', service_type: null, financial_status: null },
      summary: {
        total_expected: 0,
        total_received: 0,
        total_pending: 0,
        total_overdue: 0,
        by_status: {}
      },
      by_service_type: [],
      items: []
    })

    const { result } = renderHook(() => useDashboardData(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isInitialLoading).toBe(false))

    expect(getSummarySpy).toHaveBeenCalledTimes(1)
    expect(getAlertsSpy).toHaveBeenCalledTimes(1)
    expect(getPlanningSpy).toHaveBeenCalledTimes(1)
    expect(getAgendaSpy).toHaveBeenCalledWith(getTodayDateKey())
    expect(getDateRangeSpy).toHaveBeenCalledTimes(1)
    expect(getFinanceSpy).toHaveBeenCalledWith({
      start_date: '2026-04-01',
      end_date: '2026-04-16',
    })
  })

  it('keeps available blocks when one query fails', async () => {
    vi.spyOn(dashboardApi, 'getSummary').mockResolvedValue({
      today: { confirmed: [], reservations: [] },
      counts: { alerts_active: 1, operational_pending: 0, financial_pending: 0 },
      hours: { confirmed: 10, waiting: 2 }
    })
    vi.spyOn(dashboardApi, 'getAlerts').mockRejectedValue(new Error('alerts failed'))
    vi.spyOn(dashboardApi, 'getAgendaDay').mockResolvedValue({
      date: getTodayDateKey(),
      confirmed: [],
      reservations: []
    })
    vi.spyOn(dashboardApi, 'getPlanningSummary').mockResolvedValue({
      goal: 120,
      confirmed_hours: 10,
      waiting_hours: 2,
      remaining_hours: 110
    })
    vi.spyOn(servicesApi, 'getDateRange').mockResolvedValue({
      start_date: '2026-04-01',
      end_date: '2026-04-16',
    })
    vi.spyOn(financeApi, 'getReport').mockResolvedValue({
      filters: { start_date: '2026-04-01', end_date: '2026-04-16', service_type: null, financial_status: null },
      summary: {
        total_expected: 1000,
        total_received: 500,
        total_pending: 500,
        total_overdue: 0,
        by_status: {}
      },
      by_service_type: [],
      items: []
    })

    const { result } = renderHook(() => useDashboardData(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isInitialLoading).toBe(false))
    await waitFor(() => expect(result.current.queries.alertsQuery.isError).toBe(true))

    expect(result.current.data.summary.hours.confirmed).toBe(10)
    expect(result.current.data.finance.total_expected).toBe(1000)
    expect(result.current.hasError).toBe(true)
  })
})
