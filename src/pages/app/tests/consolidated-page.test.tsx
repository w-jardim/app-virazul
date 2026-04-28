import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ConsolidatedPage from '@/pages/app/ConsolidatedPage'
import api from '@/lib/api/axios'
import { useFinanceReport, useFinanceSummary } from '@/features/finance/hooks/useFinanceData'

vi.mock('@/pages/app/PlanningPage', () => ({
  default: () => <div data-testid="planning-content">Planning content</div>,
}))

vi.mock('@/pages/app/ReportsPage', () => ({
  default: () => <div data-testid="reports-content">Reports content</div>,
}))

vi.mock('@/lib/api/axios', () => ({
  default: {
    post: vi.fn(),
  },
}))

vi.mock('@/features/services/hooks/useServicesData', () => ({
  useServiceDateRange: () => ({
    data: { start_date: '2026-04-01', end_date: '2026-04-16' },
    isLoading: false,
  }),
  useServiceTypes: () => ({
    data: [{ id: 1, key: 'ras', name: 'RAS Voluntario' }],
    isLoading: false,
  }),
}))

vi.mock('@/features/finance/hooks/useFinanceData', () => ({
  useFinanceSummary: vi.fn(),
  useFinanceReport: vi.fn(),
}))

vi.mock('@/features/planning/hooks/usePlanningData', () => ({
  usePlanningSummary: () => ({
    data: {
      goal: 120,
      confirmed_hours: 80,
      waiting_hours: 20,
      remaining_hours: 20,
      projection: { by_duration: {}, combinations: [] },
      preferences: {
        preferred_durations: [],
        avoided_durations: [],
        preferred_durations_on_days_off: [],
        preferred_durations_on_work_days: [],
        max_single_shift_hours: null,
      },
    },
    isLoading: false,
  }),
}))

vi.mock('@/features/reports/hooks/useReportsData', () => ({
  useOperationalReport: () => ({
    data: {
      summary: { total_services: 12, confirmed_hours: 70, realized_hours: 60, waiting_hours: 10 },
      by_operational_status: {},
      reservation_metrics: {
        total_reservations: 2,
        converted_reservations: 1,
        non_converted_reservations: 1,
        conversion_rate: 50,
      },
    },
    isLoading: false,
  }),
  useFinancialReport: () => ({
    data: {
      summary: {
        total_expected: 1000,
        total_received: 800,
        total_pending: 150,
        total_overdue: 50,
        received_percentage: 80,
        pending_percentage: 15,
        top_service_type: null,
      },
      by_financial_status: {},
      by_service_type: {},
    },
    isLoading: false,
  }),
}))

const mockUseFinanceSummary = vi.mocked(useFinanceSummary)
const mockUseFinanceReport = vi.mocked(useFinanceReport)
const mockApi = vi.mocked(api)

function renderWithQuery(ui: React.ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>)
}

describe('ConsolidatedPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    mockUseFinanceSummary.mockReturnValue({
      data: {
        total_expected: 1000,
        total_received: 800,
        total_pending: 150,
        total_overdue: 50,
        by_status: { PAGO: 800, NAO_PAGO: 150, PREVISTO: 50 },
      },
      isLoading: false,
      isError: false,
    } as never)
    mockUseFinanceReport.mockReturnValue({
      data: {
        summary: {
          total_expected: 1000,
          total_received: 800,
          total_pending: 150,
          total_overdue: 50,
          by_status: { PAGO: 800, NAO_PAGO: 150, PREVISTO: 50 },
        },
        by_service_type: [
          {
            service_type: 'ras',
            service_type_name: 'RAS Voluntario',
            total_expected: 1000,
            total_received: 800,
            total_pending: 150,
            total_overdue: 50,
          },
        ],
        items: [],
        filters: {
          start_date: '2026-04-01',
          end_date: '2026-04-16',
          service_type: null,
          financial_status: null,
        },
      },
      isLoading: false,
      isError: false,
    } as never)
    mockApi.post.mockResolvedValue({ data: new Blob(['pdf'], { type: 'application/pdf' }) } as never)
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn(() => 'blob:mock'),
      revokeObjectURL: vi.fn(),
    })
  })

  it('starts on Finance tab and switches to Planning/Reports', async () => {
    const user = userEvent.setup()
    renderWithQuery(<ConsolidatedPage />)

    expect(screen.getByText(/Resumo financeiro/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Planejamento' }))
    expect(screen.getByTestId('planning-content')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Relatórios' }))
    expect(screen.getByTestId('reports-content')).toBeInTheDocument()
  })

  it('uses first-to-last registered service dates in the finance query by default', async () => {
    renderWithQuery(<ConsolidatedPage />)

    expect(mockUseFinanceReport).toHaveBeenCalledWith(
      expect.objectContaining({
        start_date: '2026-04-01',
        end_date: expect.any(String),
      }),
    )
  })

  it('uses consolidated filters in the finance query', async () => {
    const user = userEvent.setup()
    renderWithQuery(<ConsolidatedPage />)

    await user.selectOptions(screen.getByRole('combobox'), 'ras')

    expect(mockUseFinanceReport).toHaveBeenLastCalledWith(
      expect.objectContaining({
        service_type: 'ras',
      }),
    )
  })

  it('exports consolidated pdf through the backend export endpoint', async () => {
    const user = userEvent.setup()
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)

    renderWithQuery(<ConsolidatedPage />)

    await user.click(screen.getByRole('button', { name: 'Gerar dados consolidados e PDF' }))

    expect(mockApi.post).toHaveBeenCalledWith(
      '/reports/export',
      expect.objectContaining({
        filename: expect.stringContaining('consolidado-'),
        html: expect.stringContaining('Financeiro'),
      }),
      expect.objectContaining({ responseType: 'blob' }),
    )
    expect(openSpy).toHaveBeenCalled()
  })
})
