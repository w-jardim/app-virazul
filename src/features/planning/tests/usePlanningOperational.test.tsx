import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { usePlanningOperational } from '../hooks/usePlanningOperational'
import { servicesApi } from '@/features/services/api/services.api'
import { useServiceTypes } from '@/features/services/hooks/useServicesData'
import { useFinanceSummary } from '@/features/finance/hooks/useFinanceData'
import { useOperationalReport } from '@/features/reports/hooks/useReportsData'
import { usePlanningSummary } from '@/features/planning/hooks/usePlanningData'

vi.mock('@/features/services/hooks/useServicesData', () => ({
  useServiceTypes: vi.fn(),
}))

vi.mock('@/features/finance/hooks/useFinanceData', () => ({
  useFinanceSummary: vi.fn(),
}))

vi.mock('@/features/reports/hooks/useReportsData', () => ({
  useOperationalReport: vi.fn(),
}))

vi.mock('@/features/planning/hooks/usePlanningData', () => ({
  usePlanningSummary: vi.fn(),
}))

const mockUseServiceTypes = vi.mocked(useServiceTypes)
const mockUseFinanceSummary = vi.mocked(useFinanceSummary)
const mockUseOperationalReport = vi.mocked(useOperationalReport)
const mockUsePlanningSummary = vi.mocked(usePlanningSummary)

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

function successState<T>(data: T) {
  return { isLoading: false, isError: false, data } as any
}

describe('usePlanningOperational', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('does not break during loading', () => {
    mockUseServiceTypes.mockReturnValue({ isLoading: true, isError: false, data: undefined } as any)
    mockUseFinanceSummary.mockReturnValue({ isLoading: true, isError: false, data: undefined } as any)
    mockUseOperationalReport.mockReturnValue({ isLoading: true, isError: false, data: undefined } as any)
    mockUsePlanningSummary.mockReturnValue({ isLoading: true, isError: false, data: undefined } as any)
    vi.spyOn(servicesApi, 'list').mockResolvedValue([])

    const { result } = renderHook(() => usePlanningOperational(), { wrapper: createWrapper() })
    expect(result.current.isLoading).toBe(true)
    expect(result.current.result).toBeNull()
  })

  it('does not break with partial error and still returns safe state', async () => {
    mockUseServiceTypes.mockReturnValue(
      successState([{ id: 1, key: 'RAS_VOLUNTARIO', name: 'RAS', category: 'RAS' }]),
    )
    mockUseFinanceSummary.mockReturnValue({ isLoading: false, isError: true, data: undefined } as any)
    mockUseOperationalReport.mockReturnValue(
      successState({ summary: { total_services: 0, confirmed_hours: 0, waiting_hours: 0, realized_hours: 0 } }),
    )
    mockUsePlanningSummary.mockReturnValue(
      successState({ goal: 120, confirmed_hours: 24, waiting_hours: 8, remaining_hours: 96 }),
    )
    vi.spyOn(servicesApi, 'list').mockResolvedValue([])

    const { result } = renderHook(() => usePlanningOperational(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.hasPartialError).toBe(true)
    expect(result.current.isAllError).toBe(false)
  })

  it('does not break without history and keeps finite simulation values', async () => {
    mockUseServiceTypes.mockReturnValue(
      successState([{ id: 1, key: 'RAS_VOLUNTARIO', name: 'RAS', category: 'RAS' }]),
    )
    mockUseFinanceSummary.mockReturnValue(successState({}))
    mockUseOperationalReport.mockReturnValue(successState({}))
    mockUsePlanningSummary.mockReturnValue(
      successState({ goal: 120, confirmed_hours: 24, waiting_hours: 8, remaining_hours: 96 }),
    )
    vi.spyOn(servicesApi, 'list').mockResolvedValue([])

    const { result } = renderHook(() => usePlanningOperational(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.hasHistoryData).toBe(false)
    expect(result.current.result).not.toBeNull()
    expect(Number.isFinite(result.current.result?.estimated_hours ?? Number.NaN)).toBe(true)
    expect(Number.isFinite(result.current.result?.estimated_income ?? Number.NaN)).toBe(true)
  })

  it('switches correctly between HOURS and COUNT modes', async () => {
    mockUseServiceTypes.mockReturnValue(
      successState([{ id: 1, key: 'RAS_VOLUNTARIO', name: 'RAS', category: 'RAS' }]),
    )
    mockUseFinanceSummary.mockReturnValue(successState({}))
    mockUseOperationalReport.mockReturnValue(successState({}))
    mockUsePlanningSummary.mockReturnValue(
      successState({ goal: 120, confirmed_hours: 24, waiting_hours: 8, remaining_hours: 96 }),
    )
    vi.spyOn(servicesApi, 'list').mockResolvedValue([
      {
        id: 1,
        service_type_key: 'RAS_VOLUNTARIO',
        duration_hours: 8,
        amount_total: 200,
        operational_status: 'REALIZADO',
      } as any,
    ])

    const { result } = renderHook(() => usePlanningOperational(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    const hoursResult = result.current.result
    expect(hoursResult?.estimated_hours).toBe(120)

    act(() => {
      result.current.setMode('COUNT')
      result.current.setTargetServices(10)
    })

    await waitFor(() => {
      expect(result.current.mode).toBe('COUNT')
      expect(result.current.result?.required_services).toBe(10)
    })
  })

  it('returns insufficient input state when no service type is available', async () => {
    mockUseServiceTypes.mockReturnValue(successState([]))
    mockUseFinanceSummary.mockReturnValue(successState({}))
    mockUseOperationalReport.mockReturnValue(successState({}))
    mockUsePlanningSummary.mockReturnValue(
      successState({ goal: 120, confirmed_hours: 24, waiting_hours: 8, remaining_hours: 96 }),
    )
    vi.spyOn(servicesApi, 'list').mockResolvedValue([])

    const { result } = renderHook(() => usePlanningOperational(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.hasInsufficientInput).toBe(true)
    expect(result.current.result).toBeNull()
  })

  it('sanitizes invalid target inputs and avoids mode contamination', async () => {
    mockUseServiceTypes.mockReturnValue(
      successState([{ id: 1, key: 'RAS_VOLUNTARIO', name: 'RAS', category: 'RAS' }]),
    )
    mockUseFinanceSummary.mockReturnValue(successState({}))
    mockUseOperationalReport.mockReturnValue(successState({}))
    mockUsePlanningSummary.mockReturnValue(
      successState({ goal: 120, confirmed_hours: 24, waiting_hours: 8, remaining_hours: 96 }),
    )
    vi.spyOn(servicesApi, 'list').mockResolvedValue([])

    const { result } = renderHook(() => usePlanningOperational(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => {
      result.current.setTargetHours(Number.NaN)
      result.current.setMode('COUNT')
      result.current.setTargetServices(Number.NaN)
    })

    await waitFor(() => {
      expect(result.current.targetHours).toBe(1)
      expect(result.current.targetServices).toBe(1)
      expect(result.current.mode).toBe('COUNT')
      expect(result.current.result?.required_services).toBeGreaterThan(0)
    })
  })
})
