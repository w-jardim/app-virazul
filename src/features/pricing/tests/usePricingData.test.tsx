import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { pricingApi } from '../api/pricing.api'
import { useBaseValues, useFinancialRules, usePricingPreview } from '../hooks/usePricingData'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('usePricingData', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('useBaseValues retorna lista de valores base', async () => {
    vi.spyOn(pricingApi, 'listBaseValues').mockResolvedValue([
      {
        id: 1,
        rank_group: 'CABO_SOLDADO',
        duration_hours: 12,
        base_amount: 383.05,
        valid_from: '2025-01-01',
        valid_until: null,
        created_at: '2025-01-01T00:00:00.000Z',
      },
    ])

    const { result } = renderHook(() => useBaseValues(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toHaveLength(1)
    expect(result.current.data![0].base_amount).toBe(383.05)
  })

  it('useBaseValues aceita filtros de rank_group e duration_hours', async () => {
    const spy = vi.spyOn(pricingApi, 'listBaseValues').mockResolvedValue([])

    const filters = { rank_group: 'CABO_SOLDADO', duration_hours: 12 }
    const { result } = renderHook(() => useBaseValues(filters), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(spy).toHaveBeenCalledWith(filters)
  })

  it('useFinancialRules retorna lista de regras financeiras', async () => {
    vi.spyOn(pricingApi, 'listFinancialRules').mockResolvedValue([
      {
        id: 1,
        service_scope: 'RAS_VOLUNTARY',
        allow_transport: true,
        transport_amount: 17.1,
        allow_meal: false,
        meal_amount: 0,
        valid_from: '2025-01-01',
        valid_until: null,
        created_at: '2025-01-01T00:00:00.000Z',
      },
    ])

    const { result } = renderHook(() => useFinancialRules(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toHaveLength(1)
    expect(result.current.data![0].transport_amount).toBe(17.1)
  })

  it('usePricingPreview retorna preview quando params validos', async () => {
    vi.spyOn(pricingApi, 'preview').mockResolvedValue({
      base_amount: 383.05,
      transport_amount: 17.1,
      meal_amount: 0,
      total_amount: 400.15,
      pricing_source: 'TABLE',
    })

    const params = {
      service_scope: 'RAS_VOLUNTARY' as const,
      rank_group: 'CABO_SOLDADO',
      duration_hours: 12,
    }

    const { result } = renderHook(() => usePricingPreview(params), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data!.total_amount).toBe(400.15)
  })

  it('usePricingPreview nao executa com params null', () => {
    const spy = vi.spyOn(pricingApi, 'preview')

    renderHook(() => usePricingPreview(null), { wrapper: createWrapper() })

    expect(spy).not.toHaveBeenCalled()
  })

  it('usePricingPreview nao executa sem service_scope', () => {
    const spy = vi.spyOn(pricingApi, 'preview')

    const params = { service_scope: '', rank_group: 'CABO_SOLDADO', duration_hours: 12 }
    renderHook(() => usePricingPreview(params), { wrapper: createWrapper() })

    expect(spy).not.toHaveBeenCalled()
  })
})
