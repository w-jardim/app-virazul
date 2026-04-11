import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Router from '@/app/router'
import { useAuthStore } from '../store/useAuthStore'
import { resetAuthStore } from '@/test/auth-test-utils'
import { authApi } from '../api/auth.api'

vi.mock('../api/auth.api', () => ({
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

function renderWithRouter(path: string) {
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

describe('Login flow with auth API', () => {
  beforeEach(() => {
    resetAuthStore()
    act(() => {
      useAuthStore.setState({ isBootstrapping: false })
    })
    vi.clearAllMocks()
  })

  it('logs in successfully and redirects to dashboard', async () => {
    const user = userEvent.setup()
    vi.mocked(authApi.login).mockResolvedValue({
      token: 'jwt-token',
      user: {
        id: 1,
        name: 'Admin Master',
        email: 'admin.master@viraazul.local',
        role: 'ADMIN_MASTER'
      }
    })

    renderWithRouter('/login')

    await user.type(screen.getByLabelText('E-mail'), 'admin.master@viraazul.local')
    await user.type(screen.getByLabelText('Senha'), 'Admin@123456')

    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'Entrar' }))
    })

    expect(authApi.login).toHaveBeenCalledWith({
      email: 'admin.master@viraazul.local',
      password: 'Admin@123456'
    })

    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
    expect(useAuthStore.getState().token).toBe('jwt-token')
    expect(useAuthStore.getState().user?.role).toBe('ADMIN_MASTER')
  })

  it('shows backend error message when login fails', async () => {
    const user = userEvent.setup()
    vi.mocked(authApi.login).mockRejectedValue(new Error('AUTH_INVALID_CREDENTIALS'))

    renderWithRouter('/login')

    await user.type(screen.getByLabelText('E-mail'), 'wrong@viraazul.local')
    await user.type(screen.getByLabelText('Senha'), 'wrong-password')

    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'Entrar' }))
    })

    expect(authApi.login).toHaveBeenCalled()
    expect(
      await screen.findByText('Nao foi possivel autenticar. Verifique suas credenciais.')
    ).toBeInTheDocument()
    expect(useAuthStore.getState().token).toBeNull()
  })
})
