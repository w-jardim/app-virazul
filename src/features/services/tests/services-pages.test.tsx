import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
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
    service_type_name: 'RAS Volunt\u00e1rio',
    start_at: '2026-04-11T10:00:00.000Z',
    duration_hours: 12,
    operational_status: 'TITULAR',
    financial_status: 'PREVISTO',
    amount_base: 383.05,
    amount_paid: 0,
    amount_balance: 400.15,
    amount_meal: 0,
    amount_transport: 17.10,
    amount_additional: 0,
    amount_total: 400.15
  },
  {
    id: 2,
    user_id: 1,
    service_type_id: 2,
    service_type_key: 'ras_voluntary',
    service_type_name: 'RAS Volunt\u00e1rio',
    start_at: '2026-04-12T10:00:00.000Z',
    duration_hours: 12,
    operational_status: 'RESERVA',
    financial_status: 'PENDENTE',
    amount_base: 383.05,
    amount_paid: 0,
    amount_balance: 400.15,
    amount_meal: 0,
    amount_transport: 17.10,
    amount_additional: 0,
    amount_total: 400.15
  }
]

const typeData = [
  {
    id: 1,
    key: 'ordinary_shift',
    name: 'Escala Ordin\u00e1ria',
    category: 'ORDINARY',
    allows_reservation: false,
    counts_in_financial: false,
    accounting_rules: { service_scope: 'ORDINARY' }
  },
  {
    id: 2,
    key: 'ras_voluntary',
    name: 'RAS Volunt\u00e1rio',
    category: 'RAS',
    allows_reservation: true,
    counts_in_financial: true,
    accounting_rules: { service_scope: 'RAS_VOLUNTARY' }
  },
  {
    id: 3,
    key: 'ras_compulsory',
    name: 'RAS Compuls\u00f3rio',
    category: 'RAS',
    allows_reservation: false,
    counts_in_financial: true,
    accounting_rules: { service_scope: 'RAS_COMPULSORY' }
  },
  {
    id: 4,
    key: 'seguranca_presente',
    name: 'Seguran\u00e7a Presente',
    category: 'SEGURANCA_PRESENTE',
    allows_reservation: true,
    counts_in_financial: true,
    accounting_rules: { service_scope: 'SEGURANCA_PRESENTE' }
  },
  {
    id: 5,
    key: 'proeis',
    name: 'PROEIS',
    category: 'PROEIS',
    allows_reservation: true,
    counts_in_financial: true,
    accounting_rules: { service_scope: 'PROEIS' }
  }
]

const createMutateAsync = vi.fn()
const updateMutateAsync = vi.fn()
const deleteMutateAsync = vi.fn()
const confirmPaymentMutateAsync = vi.fn()
const promoteReservationMutateAsync = vi.fn()

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
  useConfirmPaymentService: () => ({
    isPending: false,
    mutateAsync: confirmPaymentMutateAsync
  }),
  usePromoteReservationService: () => ({
    isPending: false,
    mutateAsync: promoteReservationMutateAsync
  }),
  useDeleteService: () => ({
    isPending: false,
    mutateAsync: deleteMutateAsync
  })
}))

vi.mock('@/features/services/hooks/useServiceFinancialPreview', () => ({
  useServiceFinancialPreview: () => ({
    preview: {
      base_amount: 383.05,
      transport_amount: 17.1,
      meal_amount: 61.26,
      total_amount: 461.41,
      pricing_source: 'seed_default'
    },
    isFetching: false,
    scope: 'PROEIS',
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

function renderCreatePage() {
  return renderInRouter(<ServiceCreatePage />, '/services/new')
}

describe('Services pages', () => {
  beforeEach(() => {
    createMutateAsync.mockReset()
    updateMutateAsync.mockReset()
    deleteMutateAsync.mockReset()
    confirmPaymentMutateAsync.mockReset()
    promoteReservationMutateAsync.mockReset()
  })

  /* ───────── Listagem ───────── */

  it('renderiza listagem e filtros', () => {
    renderInRouter(<ServicesPage />, '/services')

    expect(screen.getByTestId('services-page')).toBeInTheDocument()
    expect(screen.getByText('Servi\u00e7os operacionais')).toBeInTheDocument()
    expect(screen.getAllByText('RAS Volunt\u00e1rio').length).toBeGreaterThan(0)
    expect(screen.getByLabelText('Status operacional')).toBeInTheDocument()
  })

  it('executa ação de confirmar pagamento na listagem', async () => {
    confirmPaymentMutateAsync.mockResolvedValue({})
    const user = userEvent.setup()
    renderInRouter(<ServicesPage />, '/services')

    await user.click(screen.getAllByRole('button', { name: 'Pago' })[0])
    expect(confirmPaymentMutateAsync).toHaveBeenCalledWith(1)
  })

  it('executa ação de virar titular para reserva na listagem', async () => {
    promoteReservationMutateAsync.mockResolvedValue({})
    const user = userEvent.setup()
    renderInRouter(<ServicesPage />, '/services')

    await user.click(screen.getByRole('button', { name: 'Virou titular' }))
    expect(promoteReservationMutateAsync).toHaveBeenCalledWith(2)
  })

  /* ───────── Criar — status ───────── */

  it('nao exibe AGENDADO como opcao de status na criacao', () => {
    renderCreatePage()

    expect(screen.queryByRole('option', { name: 'AGENDADO' })).not.toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Titular' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Reserva' })).toBeInTheDocument()
  })

  it('exibe apenas status iniciais TITULAR e RESERVA quando nenhum tipo selecionado', () => {
    renderCreatePage()

    const statusSelect = screen.getByTestId('select-operational-status')
    const options = statusSelect.querySelectorAll('option')
    const values = Array.from(options).map((o) => o.getAttribute('value'))
    expect(values).toEqual(['TITULAR', 'RESERVA'])
  })

  /* ───────── Criar — escopo / tipo ───────── */

  it('exibe apenas Serviço extra remunerado no seletor de tipo', () => {
    renderCreatePage()

    const typeSelect = screen.getByTestId('select-service-type')
    const groups = typeSelect.querySelectorAll('optgroup')
    const labels = Array.from(groups).map((g) => g.getAttribute('label'))
    expect(labels).toEqual(['Servi\u00e7o extra remunerado'])
  })

  it('exibe bloco financeiro ao selecionar serviço extra', async () => {
    const user = userEvent.setup()
    renderCreatePage()

    await user.selectOptions(screen.getByTestId('select-service-type'), '2')

    expect(screen.getByTestId('block-financial')).toBeInTheDocument()
    expect(screen.getByTestId('financial-summary')).toBeInTheDocument()
  })

  /* ───────── Criar — graduação ───────── */

  it('exibe seletor de graduação dentro do bloco financeiro', async () => {
    const user = userEvent.setup()
    renderCreatePage()

    await user.selectOptions(screen.getByTestId('select-service-type'), '2')

    const rankSelect = screen.getByTestId('select-rank-group')
    expect(rankSelect).toBeInTheDocument()

    const options = within(rankSelect).getAllByRole('option')
    const labels = options.map((o) => o.textContent)
    expect(labels).toContain('Oficiais Superiores')
    expect(labels).toContain('Capit\u00e3o e Tenente')
    expect(labels).toContain('Subtenente e Sargento')
    expect(labels).toContain('Cabo e Soldado')
  })

  it('permite editar manualmente valores quando marcar toggle', async () => {
    const user = userEvent.setup()
    renderCreatePage()

    await user.selectOptions(screen.getByTestId('select-service-type'), '2')
    await user.selectOptions(screen.getByTestId('select-rank-group'), 'CABO_SOLDADO')

    const toggle = screen.getByTestId('toggle-edit-values')
    expect(toggle).toBeInTheDocument()

    // Initially preview values are shown as text (readOnly)
    const baseText = screen.getByRole('textbox', { name: /Valor base/i })
    expect(baseText).toBeInTheDocument()

    await user.click(toggle)

    // After toggling, numeric input should be available (role spinbutton)
    const baseNumber = screen.getByRole('spinbutton', { name: /Valor base/i })
    expect(baseNumber).toBeInTheDocument()
  })

  /* ───────── Criar — alimentação condicional ───────── */

  it('mostra "não se aplica" para alimentação em RAS Voluntário', async () => {
    const user = userEvent.setup()
    renderCreatePage()

    await user.selectOptions(screen.getByTestId('select-service-type'), '2')

    expect(screen.getByTestId('meal-not-applicable')).toBeInTheDocument()
  })

  it('mostra "não se aplica" para alimentação em RAS Compulsório', async () => {
    const user = userEvent.setup()
    renderCreatePage()

    await user.selectOptions(screen.getByTestId('select-service-type'), '3')

    expect(screen.getByTestId('meal-not-applicable')).toBeInTheDocument()
  })

  it('mostra campo de alimentação para PROEIS', async () => {
    const user = userEvent.setup()
    renderCreatePage()

    await user.selectOptions(screen.getByTestId('select-service-type'), '5')

    expect(screen.queryByTestId('meal-not-applicable')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Alimenta\u00e7\u00e3o (R$)')).toBeInTheDocument()
  })

  it('mostra campo de alimentação para Segurança Presente', async () => {
    const user = userEvent.setup()
    renderCreatePage()

    await user.selectOptions(screen.getByTestId('select-service-type'), '4')

    expect(screen.queryByTestId('meal-not-applicable')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Alimenta\u00e7\u00e3o (R$)')).toBeInTheDocument()
  })

  /* ───────── Criar — adicional só compulsório ───────── */

  it('mostra campo Adicional apenas para RAS Compulsório', async () => {
    const user = userEvent.setup()
    renderCreatePage()

    await user.selectOptions(screen.getByTestId('select-service-type'), '3')

    expect(screen.getByLabelText('Adicional (R$)')).toBeInTheDocument()
  })

  it('oculta campo Adicional para RAS Voluntário', async () => {
    const user = userEvent.setup()
    renderCreatePage()

    await user.selectOptions(screen.getByTestId('select-service-type'), '2')

    expect(screen.queryByLabelText('Adicional (R$)')).not.toBeInTheDocument()
  })

  it('oculta campo Adicional para PROEIS', async () => {
    const user = userEvent.setup()
    renderCreatePage()

    await user.selectOptions(screen.getByTestId('select-service-type'), '5')

    expect(screen.queryByLabelText('Adicional (R$)')).not.toBeInTheDocument()
  })

  /* ───────── Criar — RESERVA condicional ───────── */

  it('RAS Compulsório não mostra opção RESERVA', async () => {
    const user = userEvent.setup()
    renderCreatePage()

    await user.selectOptions(screen.getByTestId('select-service-type'), '3')

    const statusSelect = screen.getByTestId('select-operational-status')
    const options = within(statusSelect).getAllByRole('option')
    const values = options.map((o) => o.getAttribute('value'))
    expect(values).toContain('TITULAR')
    expect(values).not.toContain('RESERVA')
  })

  it('RAS Voluntário mostra opção RESERVA', async () => {
    const user = userEvent.setup()
    renderCreatePage()

    await user.selectOptions(screen.getByTestId('select-service-type'), '2')

    const statusSelect = screen.getByTestId('select-operational-status')
    const options = within(statusSelect).getAllByRole('option')
    const values = options.map((o) => o.getAttribute('value'))
    expect(values).toContain('TITULAR')
    expect(values).toContain('RESERVA')
  })

  it('exibe hint de que compulsório não permite reserva', async () => {
    const user = userEvent.setup()
    renderCreatePage()

    await user.selectOptions(screen.getByTestId('select-service-type'), '3')

    expect(screen.getByTestId('no-reservation-hint')).toHaveTextContent('n\u00e3o permite reserva')
  })

  /* ───────── Criar — sem desconto ───────── */

  it('não exibe campo Desconto no formulário', async () => {
    const user = userEvent.setup()
    renderCreatePage()

    await user.selectOptions(screen.getByTestId('select-service-type'), '2')

    expect(screen.queryByLabelText('Desconto (R$)')).not.toBeInTheDocument()
  })

  /* ───────── Criar — durações válidas ───────── */

  it('exibe durações 6, 8, 12 e 24 horas', () => {
    renderCreatePage()

    const durationSelect = screen.getByTestId('select-duration')
    const options = within(durationSelect).getAllByRole('option')
    const values = options.map((o) => o.getAttribute('value'))
    expect(values).toEqual(['6', '8', '12', '24'])
  })

  /* ───────── Criar — submit ───────── */

  it('envia cria\u00e7\u00e3o com payload alinhado ao dom\u00ednio', async () => {
    createMutateAsync.mockResolvedValue({ id: 99 })
    const user = userEvent.setup()
    renderInRouter(
      <Routes>
        <Route path="/services/new" element={<ServiceCreatePage />} />
        <Route path="/services/:id" element={<div>Detalhe aberto</div>} />
      </Routes>,
      '/services/new'
    )

    await user.selectOptions(screen.getByTestId('select-service-type'), '2')
    await user.selectOptions(screen.getByTestId('select-rank-group'), 'CABO_SOLDADO')
    await user.type(screen.getByLabelText('Data/hora'), '2026-04-15T09:00')
    await user.click(screen.getByRole('button', { name: 'Criar servi\u00e7o' }))

    expect(createMutateAsync).toHaveBeenCalledTimes(1)
    expect(createMutateAsync).toHaveBeenCalledWith(expect.objectContaining({
      service_type_id: 2,
      operational_status: 'TITULAR',
      duration_hours: 12,
    }))
    expect(createMutateAsync).toHaveBeenCalledWith(
      expect.not.objectContaining({ amount_discount: expect.anything() })
    )
  })

  /* ───────── Detalhe ───────── */

  it('renderiza detalhe sem painel de transições', async () => {
    renderInRouter(
      <Routes>
        <Route path="/services/:id" element={<ServiceDetailPage />} />
      </Routes>,
      '/services/1'
    )

    expect(screen.getByTestId('service-detail-page')).toBeInTheDocument()
    expect(screen.getByText('Detalhe do servi\u00e7o')).toBeInTheDocument()
    expect(screen.queryByText('Transições de status')).not.toBeInTheDocument()
  })
})
