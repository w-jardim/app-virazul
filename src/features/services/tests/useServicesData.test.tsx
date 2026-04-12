import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { servicesApi } from '../api/services.api'
import { useServicesList } from '../hooks/useServicesData'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  })

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useServicesList', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('aplica filtros operacionais, financeiros e período no cliente', async () => {
    vi.spyOn(servicesApi, 'list').mockResolvedValue([
      {
        id: 1,
        user_id: 1,
        service_type_id: 2,
        start_at: '2026-04-11T10:00:00.000Z',
        duration_hours: 12,
        operational_status: 'TITULAR',
        financial_status: 'PREVISTO',
        amount_base: 100,
        amount_paid: 0,
        amount_balance: 100,
        amount_meal: 0,
        amount_transport: 0,
        amount_additional: 0,
        amount_discount: 0,
        amount_total: 100
      },
      {
        id: 2,
        user_id: 1,
        service_type_id: 2,
        start_at: '2026-04-12T10:00:00.000Z',
        duration_hours: 12,
        operational_status: 'RESERVA',
        financial_status: 'PREVISTO',
        amount_base: 100,
        amount_paid: 0,
        amount_balance: 100,
        amount_meal: 0,
        amount_transport: 0,
        amount_additional: 0,
        amount_discount: 0,
        amount_total: 100
      }
    ])

    const { result } = renderHook(
      () =>
        useServicesList({
          operationalStatus: 'TITULAR',
          financialStatus: 'PREVISTO',
          periodStart: '2026-04-11',
          periodEnd: '2026-04-11'
        }),
      { wrapper: createWrapper() }
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toHaveLength(1)
    expect(result.current.data?.[0].id).toBe(1)
  })
})
