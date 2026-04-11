import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Router from '../index'
import { resetAuthStore } from '@/test/auth-test-utils'
import { useAuthStore } from '@/features/auth/store/useAuthStore'

vi.mock('@/features/auth/api/auth.api', () => ({
  authApi: {
    login: vi.fn(),
    me: vi.fn()
  }
}))

vi.mock('@/features/dashboard/hooks/useDashboardData', () => ({
  useDashboardData: () => ({
    data: {
      summary: {
        today: { confirmed: [], reservations: [] },
        counts: { alerts_active: 0, operational_pending: 0, financial_pending: 0 },
        hours: { confirmed: 0, waiting: 0 }
      },
      alerts: [],
      agendaDay: { date: '2026-04-11', confirmed: [], reservations: [] },
      planning: { goal: 0, confirmed_hours: 0, waiting_hours: 0, remaining_hours: 0 },
      finance: {
        total_expected: 0,
        total_received: 0,
        total_pending: 0,
        total_overdue: 0,
        by_status: {}
      }
    },
    queries: {
      summaryQuery: { isLoading: false, isError: false, data: {} },
      alertsQuery: { isLoading: false, isError: false, data: [] },
      agendaQuery: { isLoading: false, isError: false, data: { confirmed: [], reservations: [] } },
      planningQuery: { isLoading: false, isError: false, data: {} },
      financeQuery: { isLoading: false, isError: false, data: {} }
    },
    isInitialLoading: false,
    hasError: false,
    refetchAll: vi.fn()
  })
}))

const renderRouterAt = (path: string) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false
      }
    }
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[path]}>
        <Router />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('Auth and App Shell integration', () => {
  beforeEach(() => {
    resetAuthStore()
  })

  it('renders login page', () => {
    act(() => {
      useAuthStore.setState({
        isBootstrapping: false
      })
    })

    renderRouterAt('/login')

    expect(screen.getByText('Entrar no ViraAzul')).toBeInTheDocument()
  })

  it('shows validation errors for invalid login submit', async () => {
    const user = userEvent.setup()
    act(() => {
      useAuthStore.setState({
        isBootstrapping: false
      })
    })

    renderRouterAt('/login')

    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'Entrar' }))
    })

    expect(await screen.findByText('Informe um e-mail válido.')).toBeInTheDocument()
    expect(await screen.findByText('A senha deve ter pelo menos 6 caracteres.')).toBeInTheDocument()
  })

  it('redirects protected route when unauthenticated', () => {
    act(() => {
      useAuthStore.setState({
        token: null,
        user: null,
        isAuthenticated: false,
        isBootstrapping: false
      })
    })

    renderRouterAt('/dashboard')

    expect(screen.getByText('Entrar no ViraAzul')).toBeInTheDocument()
  })

  it('redirects authenticated user away from /login', async () => {
    act(() => {
      useAuthStore.setState({
        token: 'token-1',
        user: {
          id: 1,
          name: 'Policial Teste',
          email: 'policial.teste@viraazul.local',
          role: 'POLICE'
        },
        isAuthenticated: true,
        isBootstrapping: false
      })
    })

    renderRouterAt('/login')

    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
  })

  it('renders authenticated route when session exists', async () => {
    act(() => {
      useAuthStore.setState({
        token: 'token-1',
        user: {
          id: 1,
          name: 'Policial Teste',
          email: 'policial.teste@viraazul.local',
          role: 'POLICE'
        },
        isAuthenticated: true,
        isBootstrapping: false
      })
    })

    renderRouterAt('/dashboard')

    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
    expect(await screen.findByText('Policial Teste')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Administracao' })).not.toBeInTheDocument()
  })

  it('shows admin menu item for ADMIN_MASTER role', async () => {
    act(() => {
      useAuthStore.setState({
        token: 'token-admin',
        user: {
          id: 99,
          name: 'Admin Master',
          email: 'admin.master@viraazul.local',
          role: 'ADMIN_MASTER'
        },
        isAuthenticated: true,
        isBootstrapping: false
      })
    })

    renderRouterAt('/dashboard')

    expect(await screen.findByRole('link', { name: 'Administracao' })).toBeInTheDocument()
  })

  it('logout clears session and redirects to login', async () => {
    const user = userEvent.setup()

    act(() => {
      useAuthStore.setState({
        token: 'token-1',
        user: {
          id: 1,
          name: 'Policial Teste',
          email: 'policial.teste@viraazul.local',
          role: 'POLICE'
        },
        isAuthenticated: true,
        isBootstrapping: false
      })
    })

    renderRouterAt('/dashboard')

    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'Sair' }))
    })

    expect(await screen.findByText('Entrar no ViraAzul')).toBeInTheDocument()
    expect(useAuthStore.getState().token).toBeNull()
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
  })
})
