import { afterEach, describe, expect, it, vi } from 'vitest'
import api from '@/lib/api/axios'
import { dashboardApi } from '../api/dashboard.api'

describe('dashboardApi', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('consumes /dashboard/summary', async () => {
    const getSpy = vi.spyOn(api, 'get').mockResolvedValue({
      data: { data: { counts: {}, hours: {}, today: {} }, meta: null, errors: null }
    } as never)

    await dashboardApi.getSummary()

    expect(getSpy).toHaveBeenCalledWith('/api/v1/dashboard/summary')
  })

  it('consumes /alerts with ACTIVE status filter', async () => {
    const getSpy = vi.spyOn(api, 'get').mockResolvedValue({
      data: { data: [], meta: null, errors: null }
    } as never)

    await dashboardApi.getAlerts()

    expect(getSpy).toHaveBeenCalledWith('/api/v1/alerts', {
      params: { status: 'ACTIVE' }
    })
  })

  it('consumes /agenda/day with date parameter', async () => {
    const getSpy = vi.spyOn(api, 'get').mockResolvedValue({
      data: { data: { date: '2026-04-11', confirmed: [], reservations: [] }, meta: null, errors: null }
    } as never)

    await dashboardApi.getAgendaDay('2026-04-11')

    expect(getSpy).toHaveBeenCalledWith('/api/v1/agenda/day', {
      params: { date: '2026-04-11' }
    })
  })

  it('consumes /finance/summary with month parameter', async () => {
    const getSpy = vi.spyOn(api, 'get').mockResolvedValue({
      data: {
        data: { total_expected: 0, total_received: 0, total_pending: 0, total_overdue: 0, by_status: {} },
        meta: null,
        errors: null
      }
    } as never)

    await dashboardApi.getFinanceSummary('2026-04')

    expect(getSpy).toHaveBeenCalledWith('/api/v1/finance/summary', {
      params: { month: '2026-04' }
    })
  })
})
