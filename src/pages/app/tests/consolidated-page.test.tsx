import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ConsolidatedPage from '@/pages/app/ConsolidatedPage'

vi.mock('@/pages/app/FinancePage', () => ({
  default: () => <div data-testid="finance-content">Finance content</div>
}))

vi.mock('@/pages/app/PlanningPage', () => ({
  default: () => <div data-testid="planning-content">Planning content</div>
}))

vi.mock('@/pages/app/ReportsPage', () => ({
  default: () => <div data-testid="reports-content">Reports content</div>
}))

vi.mock('@/features/services/hooks/useServicesData', () => ({
  useServiceTypes: () => ({ data: [] })
}))

vi.mock('@/features/finance/hooks/useFinanceData', () => ({
  useFinanceSummary: () => ({
    data: {
      total_expected: 1000,
      total_received: 800,
      total_pending: 150,
      total_overdue: 50,
      by_status: {},
    },
  }),
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
  }),
}))

function renderWithQuery(ui: React.ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>)
}

describe('ConsolidatedPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('starts on Finance tab and switches to Planning/Reports', async () => {
    const user = userEvent.setup()
    renderWithQuery(<ConsolidatedPage />)

    expect(screen.getByTestId('finance-content')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Planejamento' }))
    expect(screen.getByTestId('planning-content')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Relatórios' }))
    expect(screen.getByTestId('reports-content')).toBeInTheDocument()
  })

  it('exports consolidated pdf through print window', async () => {
    const user = userEvent.setup()
    const write = vi.fn()
    const close = vi.fn()
    const focus = vi.fn()
    const print = vi.fn()

    const openSpy = vi.spyOn(window, 'open').mockReturnValue({
      document: { write, close } as unknown as Document,
      focus,
      print,
    } as unknown as Window)

    renderWithQuery(<ConsolidatedPage />)

    await user.click(screen.getByRole('button', { name: 'Gerar dados consolidados e PDF' }))

    expect(openSpy).toHaveBeenCalled()
    expect(write).toHaveBeenCalled()
    expect(print).toHaveBeenCalled()
  })
})
