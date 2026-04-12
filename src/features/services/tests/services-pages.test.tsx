import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ServiceCreatePage from '@/pages/app/ServiceCreatePage'
import ServiceDetailPage from '@/pages/app/ServiceDetailPage'
import ServicesPage from '@/pages/app/ServicesPage'

const listData = [
  {
    id: 1,
    user_id: 1,
    service_type_id: 2,
    service_type_key: 'ras_voluntary',
    service_type_name: 'RAS Voluntário',
    start_at: '2026-04-11T10:00:00.000Z',
    duration_hours: 12,
    operational_status: 'TITULAR',
    financial_status: 'PREVISTO',
    amount_base: 200,
    amount_paid: 0,
    amount_balance: 200,
    amount_meal: 0,
    amount_transport: 0,
    amount_additional: 0,
    amount_discount: 0,
    amount_total: 200
  }
]

const typeData = [
  {
    id: 2,
    key: 'ras_voluntary',
    name: 'RAS Voluntário',
    category: 'RAS',
    allows_reservation: true,
    counts_in_financial: true
  }
]

const createMutateAsync = vi.fn()
const updateMutateAsync = vi.fn()
const transitionMutateAsync = vi.fn()
const deleteMutateAsync = vi.fn()

vi.mock('@/features/services/hooks/useServicesData', () => ({
  getApiErrorMessage: () => 'Erro de API',
  useServiceTypes: () => ({
    isLoading: false,
    isError: false,
    data: typeData
  }),
  useServicesList: () => ({
    isLoading: false,
    isError: false,
    data: listData
  }),
  useServiceDetail: () => ({
    isLoading: false,
    isError: false,
    data: {
      ...listData[0],
      created_at: '2026-04-01T09:00:00.000Z',
      updated_at: '2026-04-10T09:00:00.000Z'
    }
  }),
  useCreateService: () => ({
    isPending: false,
    mutateAsync: createMutateAsync
  }),
  useUpdateService: () => ({
    isPending: false,
    mutateAsync: updateMutateAsync
  }),
  useTransitionService: () => ({
    isPending: false,
    mutateAsync: transitionMutateAsync
  }),
  useDeleteService: () => ({
    isPending: false,
    mutateAsync: deleteMutateAsync
  })
}))

function renderInRouter(ui: React.ReactNode, route: string) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false }
    }
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
    </QueryClientProvider>
  )
}

describe('Services pages', () => {
  beforeEach(() => {
    createMutateAsync.mockReset()
    updateMutateAsync.mockReset()
    transitionMutateAsync.mockReset()
    deleteMutateAsync.mockReset()
  })

  it('renderiza listagem e filtros', () => {
    renderInRouter(<ServicesPage />, '/services')

    expect(screen.getByTestId('services-page')).toBeInTheDocument()
    expect(screen.getByText('Serviços operacionais')).toBeInTheDocument()
    expect(screen.getAllByText('RAS Voluntário').length).toBeGreaterThan(0)
    expect(screen.getByLabelText('Status operacional')).toBeInTheDocument()
  })

  it('valida formulário na criação', async () => {
    const user = userEvent.setup()
    renderInRouter(<ServiceCreatePage />, '/services/new')

    await user.click(screen.getByRole('button', { name: 'Criar serviço' }))
    expect(await screen.findByText('Selecione um tipo de serviço.')).toBeInTheDocument()
    expect(await screen.findByText('Informe data e hora.')).toBeInTheDocument()
  })

  it('envia criação com payload válido', async () => {
    createMutateAsync.mockResolvedValue({ id: 99 })
    const user = userEvent.setup()
    renderInRouter(
      <Routes>
        <Route path="/services/new" element={<ServiceCreatePage />} />
        <Route path="/services/:id" element={<div>Detalhe aberto</div>} />
      </Routes>,
      '/services/new'
    )

    await user.selectOptions(screen.getByLabelText('Tipo de serviço'), '2')
    await user.type(screen.getByLabelText('Data/hora'), '2026-04-15T09:00')
    await user.click(screen.getByRole('button', { name: 'Criar serviço' }))

    expect(createMutateAsync).toHaveBeenCalledTimes(1)
  })

  it('renderiza detalhe e executa transição rápida', async () => {
    transitionMutateAsync.mockResolvedValue({})
    const user = userEvent.setup()
    renderInRouter(
      <Routes>
        <Route path="/services/:id" element={<ServiceDetailPage />} />
      </Routes>,
      '/services/1'
    )

    expect(screen.getByTestId('service-detail-page')).toBeInTheDocument()
    expect(screen.getByText('Detalhe do serviço')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Marcar realizado' }))
    expect(transitionMutateAsync).toHaveBeenCalled()
  })
})
