import { beforeEach, describe, expect, it } from 'vitest'
import { useAuthStore } from '../store/useAuthStore'
import { resetAuthStore } from '@/test/auth-test-utils'

describe('useAuthStore', () => {
  beforeEach(() => {
    resetAuthStore()
  })

  it('setSession stores token and user as authenticated', () => {
    useAuthStore.getState().setSession({
      token: 'token-123',
      user: {
        id: 1,
        name: 'User',
        email: 'user@viraazul.local',
        role: 'POLICE',
        rank_group: 'CABO_SOLDADO',
        subscription: 'free' as const,
        payment_due_date: null,
        created_at: '2025-01-01T00:00:00.000Z'
      }
    })

    const state = useAuthStore.getState()

    expect(state.token).toBe('token-123')
    expect(state.user?.email).toBe('user@viraazul.local')
    expect(state.isAuthenticated).toBe(true)
  })

  it('clearSession resets auth state', () => {
    useAuthStore.setState({
      token: 'abc',
      user: {
        id: 1,
        name: 'User',
        email: 'user@viraazul.local',
        role: 'POLICE',
        rank_group: 'CABO_SOLDADO',
        subscription: 'free' as const,
        payment_due_date: null,
        created_at: '2025-01-01T00:00:00.000Z'
      },
      isAuthenticated: true,
      isBootstrapping: false
    })

    useAuthStore.getState().clearSession()

    const state = useAuthStore.getState()
    expect(state.token).toBeNull()
    expect(state.user).toBeNull()
    expect(state.isAuthenticated).toBe(false)
    expect(state.isBootstrapping).toBe(false)
  })
})

