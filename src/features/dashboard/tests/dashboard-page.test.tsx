import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import DashboardPage from '@/pages/DashboardPage'
import { useAuthStore } from '@/features/auth/store/useAuthStore'
import { resetAuthStore } from '@/test/auth-test-utils'
import type { DashboardDataBundle } from '../types/dashboard.types'

vi.mock('../hooks/useDashboardData', () => ({
  useDashboardData: vi.fn()
}))

vi.mock('@/features/insights/hooks/useInsights', () => ({
  useInsights: vi.fn()
}))

import { useDashboardData } from '../hooks/useDashboardData'
import { useInsights } from '@/features/insights/hooks/useInsights'

const mockUseDashboardData = vi.mocked(useDashboardData)
const mockUseInsights = vi.mocked(useInsights)

const baseData: DashboardDataBundle = {
  summary: {
    today: {
      confirmed: [
        {
          id: 1,
          start_at: '2026-04-11T09:00:00.000Z',
          duration_hours: 12,
          operational_status: 'TITULAR',
          service_type_name: 'RAS Voluntario',
          service_type_key: 'ras_voluntary'
        }
      ],
      reservations: [
        {
          id: 2,
          start_at: '2026-04-11T13:00:00.000Z',
          duration_hours: 8,
          operational_status: 'RESERVA',
          service_type_name: 'PROEIS',
          service_type_key: 'proeis'
        }
      ]
    },
    counts: {
      alerts_active: 3,
      operational_pending: 2,
      financial_pending: 1
    },
    hours: {
      confirmed: 80,
      waiting: 16
    }
  },
  alerts: [
    {
      id: 11,
      alert_type: 'OPERATIONAL',
      status: 'ACTIVE',
      payload: {
        service_type_name: 'RAS Voluntario',
        alert_context: 'OPERATIONAL'
      },
      created_at: '2026-04-11T11:00:00.000Z'
    },
    {
      id: 12,
      alert_type: 'FINANCIAL',
      status: 'ACTIVE',
      payload: {
        service_type_name: 'PROEIS',
        alert_context: 'FINANCIAL'
      },
      created_at: '2026-04-11T10:00:00.000Z'
    }
  ],
  agendaDay: {
    date: '2026-04-11',
    confirmed: [
      {
        id: 1,
        start_at: '2026-04-11T09:00:00.000Z',
        duration_hours: 12,
        operational_status: 'TITULAR',
        service_type_name: 'RAS Voluntario',
        service_type_key: 'ras_voluntary'
      }
    ],
    reservations: [
      {
        id: 2,
        start_at: '2026-04-11T13:00:00.000Z',
        duration_hours: 8,
        operational_status: 'RESERVA',
        service_type_name: 'PROEIS',
        service_type_key: 'proeis'
      }
    ]
  },
  planning: {
    goal: 120,
    confirmed_hours: 72,
    waiting_hours: 16,
    remaining_hours: 48
  },
  finance: {
    total_expected: 3500,
    total_received: 2800,
    total_pending: 700,
    total_overdue: 200,
    by_status: {
      PAGO: 2800,
      PREVISTO: 500,
      PAGO_PARCIAL: 200,
      NAO_PAGO: 0
    }
  }
}

function createHookState(overrides?: Partial<ReturnType<typeof useDashboardData>>) {
  return {
    data: baseData,
    queries: {
      summaryQuery: { isLoading: false, isError: false, data: baseData.summary },
      alertsQuery: { isLoading: false, isError: false, data: baseData.alerts },
      agendaQuery: { isLoading: false, isError: false, data: baseData.agendaDay },
      planningQuery: { isLoading: false, isError: false, data: baseData.planning },
      financeQuery: { isLoading: false, isError: false, data: baseData.finance }
    },
    isInitialLoading: false,
    hasError: false,
    refetchAll: vi.fn(),
    ...overrides
  } as ReturnType<typeof useDashboardData>
}

describe('DashboardPage', () => {
  beforeEach(() => {
    mockUseInsights.mockReturnValue({
      isLoading: false,
      isAllError: false,
      hasPartialError: false,
      failedSources: [],
      sourceStatuses: [],
      period: { month: '2026-04', start_date: '2026-04-01', end_date: '2026-04-11' },
      insights: [],
      byCategory: { alert: [], opportunity: [], recommendation: [], trend: [] },
    })

    resetAuthStore()
    useAuthStore.setState({
      user: {
        id: 1,
        name: 'Policial Teste',
        email: 'policial@viraazul.local',
        role: 'POLICE',
        rank_group: 'CABO_SOLDADO',
        subscription: 'free' as const,
        payment_due_date: null,
        created_at: '2025-01-01T00:00:00.000Z'
      },
      isAuthenticated: true,
      isBootstrapping: false,
      token: 'token'
    })
  })

  it('renders dashboard main structure', () => {
    mockUseDashboardData.mockReturnValue(createHookState())

    render(<DashboardPage />)

    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
    expect(screen.getByText('Alertas ativos')).toBeInTheDocument()
    expect(screen.getByText('Agenda do dia')).toBeInTheDocument()
    expect(screen.getByText('Planejamento')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Financeiro' })).toBeInTheDocument()
  })

  it('shows loading state', () => {
    mockUseDashboardData.mockReturnValue(createHookState({ isInitialLoading: true }))

    render(<DashboardPage />)

    expect(screen.getByTestId('dashboard-loading')).toBeInTheDocument()
    expect(screen.getByText('Carregando indicadores...')).toBeInTheDocument()
  })

  it('shows error state', () => {
    mockUseDashboardData.mockReturnValue(
      createHookState({ hasError: true, queries: { ...createHookState().queries, summaryQuery: { isError: true, isLoading: false, data: undefined } as never } })
    )

    render(<DashboardPage />)

    expect(screen.getByTestId('dashboard-error')).toBeInTheDocument()
    expect(screen.getByText('Não foi possível carregar a dashboard')).toBeInTheDocument()
  })

  it('renders metric cards with backend values', () => {
    mockUseDashboardData.mockReturnValue(createHookState())

    render(<DashboardPage />)

    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('80')).toBeInTheDocument()
    expect(screen.getByText('16')).toBeInTheDocument()
  })

  it('renders agenda with confirmed and reservations', () => {
    mockUseDashboardData.mockReturnValue(createHookState())

    render(<DashboardPage />)

    const agendaSection = screen.getByRole('heading', { name: 'Agenda do dia' }).closest('section')
    expect(agendaSection).not.toBeNull()
    const agendaScope = within(agendaSection as HTMLElement)

    expect(agendaScope.getByText('Confirmados')).toBeInTheDocument()
    expect(agendaScope.getByText('Reservas')).toBeInTheDocument()
    expect(agendaScope.getByText('RAS Voluntario')).toBeInTheDocument()
    expect(agendaScope.getByText('PROEIS')).toBeInTheDocument()
  })

  it('renders recent alerts', () => {
    mockUseDashboardData.mockReturnValue(createHookState())

    render(<DashboardPage />)

    const alertsSection = screen.getByRole('heading', { name: 'Alertas recentes' }).closest('section')
    expect(alertsSection).not.toBeNull()
    const alertScope = within(alertsSection as HTMLElement)

    expect(alertScope.getByText('Operacional')).toBeInTheDocument()
    expect(alertScope.getByText('Financeiro')).toBeInTheDocument()
  })

  it('shows admin block for ADMIN_MASTER', () => {
    useAuthStore.setState({
      user: {
        id: 2,
        name: 'Admin Master',
        email: 'admin@viraazul.local',
        role: 'ADMIN_MASTER',
        rank_group: null,
        subscription: 'free' as const,
        payment_due_date: null,
        created_at: '2025-01-01T00:00:00.000Z'
      }
    })

    mockUseDashboardData.mockReturnValue(createHookState())

    render(<DashboardPage />)

    expect(screen.getByText('Visão ADMIN_MASTER')).toBeInTheDocument()
  })

  it('renders empty state for agenda block', () => {
    mockUseDashboardData.mockReturnValue(
      createHookState({
        data: {
          ...baseData,
          agendaDay: {
            date: '2026-04-11',
            confirmed: [],
            reservations: []
          }
        },
        queries: {
          ...createHookState().queries,
          agendaQuery: { isLoading: false, isError: false, data: { date: '2026-04-11', confirmed: [], reservations: [] } as never }
        }
      })
    )

    render(<DashboardPage />)
    expect(screen.getByText('Sem serviços para hoje')).toBeInTheDocument()
  })

  it('renders empty state for alerts block', () => {
    mockUseDashboardData.mockReturnValue(
      createHookState({
        data: {
          ...baseData,
          alerts: []
        },
        queries: {
          ...createHookState().queries,
          alertsQuery: { isLoading: false, isError: false, data: [] as never }
        }
      })
    )

    render(<DashboardPage />)
    expect(screen.getByText('Sem alertas ativos')).toBeInTheDocument()
  })

  it('renders empty state for planning block', () => {
    mockUseDashboardData.mockReturnValue(
      createHookState({
        data: {
          ...baseData,
          planning: {
            goal: 0,
            confirmed_hours: 0,
            waiting_hours: 0,
            remaining_hours: 0
          }
        },
        queries: {
          ...createHookState().queries,
          planningQuery: { isLoading: false, isError: false, data: { goal: 0, confirmed_hours: 0, waiting_hours: 0, remaining_hours: 0 } as never }
        }
      })
    )

    render(<DashboardPage />)
    expect(screen.getByText('Sem dados de planejamento')).toBeInTheDocument()
  })

  it('renders empty state for finance block', () => {
    mockUseDashboardData.mockReturnValue(
      createHookState({
        data: {
          ...baseData,
          finance: {
            total_expected: 0,
            total_received: 0,
            total_pending: 0,
            total_overdue: 0,
            by_status: {}
          }
        },
        queries: {
          ...createHookState().queries,
          financeQuery: {
            isLoading: false,
            isError: false,
            data: { total_expected: 0, total_received: 0, total_pending: 0, total_overdue: 0, by_status: {} } as never
          }
        }
      })
    )

    render(<DashboardPage />)
    expect(screen.getByText('Sem dados financeiros')).toBeInTheDocument()
  })

  it('renders isolated block error without dropping dashboard', () => {
    mockUseDashboardData.mockReturnValue(
      createHookState({
        hasError: true,
        queries: {
          ...createHookState().queries,
          alertsQuery: { isLoading: false, isError: true, data: undefined as never }
        }
      })
    )

    render(<DashboardPage />)
    expect(screen.getByTestId('dashboard-page')).toBeInTheDocument()
    expect(screen.getByText('Falha ao carregar alertas')).toBeInTheDocument()
    expect(screen.getByText('Agenda do dia')).toBeInTheDocument()
  })
})
