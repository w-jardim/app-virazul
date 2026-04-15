import { useEffect } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, waitFor, act } from '@testing-library/react'
import { useBootstrapSession } from '../hooks/useBootstrapSession'
import { useAuthStore } from '../store/useAuthStore'
import { authApi } from '../api/auth.api'
import { resetAuthStore } from '@/test/auth-test-utils'

vi.mock('../api/auth.api', () => ({
  authApi: {
    login: vi.fn(),
    me: vi.fn()
  }
}))

const BootstrapProbe = () => {
  useBootstrapSession()

  // Keep component mounted for the hook lifecycle.
  useEffect(() => undefined, [])

  return null
}

describe('Session bootstrap flow via /auth/me', () => {
  beforeEach(() => {
    resetAuthStore()
    vi.clearAllMocks()
  })

  it('restores session when token exists and /auth/me is valid', async () => {
    act(() => {
      useAuthStore.setState({
        token: 'persisted-token',
        user: null,
        isAuthenticated: true,
        isBootstrapping: true
      })
    })

    vi.mocked(authApi.me).mockResolvedValue({
      id: 10,
      name: 'Policial Teste',
      email: 'policial.teste@viraazul.local',
      role: 'POLICE',
      rank_group: 'CABO_SOLDADO',
      subscription: 'free' as const,
      payment_due_date: null,
      created_at: '2025-01-01T00:00:00.000Z'
    })

    render(<BootstrapProbe />)

    await waitFor(() => {
      expect(authApi.me).toHaveBeenCalledTimes(1)
      expect(useAuthStore.getState().user?.id).toBe(10)
      expect(useAuthStore.getState().isAuthenticated).toBe(true)
      expect(useAuthStore.getState().isBootstrapping).toBe(false)
    })
  })

  it('clears session when token exists and /auth/me is invalid', async () => {
    act(() => {
      useAuthStore.setState({
        token: 'expired-token',
        user: null,
        isAuthenticated: true,
        isBootstrapping: true
      })
    })

    vi.mocked(authApi.me).mockRejectedValue(new Error('AUTH_INVALID_TOKEN'))

    render(<BootstrapProbe />)

    await waitFor(() => {
      expect(authApi.me).toHaveBeenCalledTimes(1)
      expect(useAuthStore.getState().token).toBeNull()
      expect(useAuthStore.getState().user).toBeNull()
      expect(useAuthStore.getState().isAuthenticated).toBe(false)
      expect(useAuthStore.getState().isBootstrapping).toBe(false)
    })
  })
})
