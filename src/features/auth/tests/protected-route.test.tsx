import { describe, expect, it, beforeEach } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { render, screen, act } from '@testing-library/react'
import ProtectedRoute from '../guards/ProtectedRoute'
import { useAuthStore } from '../store/useAuthStore'
import { resetAuthStore } from '@/test/auth-test-utils'

const setup = (initialPath: string) => {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<div>Dashboard Private</div>} />
        </Route>
        <Route path="/login" element={<div>Login Page</div>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    resetAuthStore()
  })

  it('redirects unauthenticated users to login', () => {
    act(() => {
      useAuthStore.setState({
        token: null,
        user: null,
        isAuthenticated: false,
        isBootstrapping: false
      })
    })

    setup('/dashboard')

    expect(screen.getByText('Login Page')).toBeInTheDocument()
  })

  it('renders protected outlet when authenticated', () => {
    act(() => {
      useAuthStore.setState({
        token: 'valid-token',
        user: {
          id: 1,
          name: 'User',
          email: 'user@viraazul.local',
          role: 'POLICE',
          rank_group: 'CABO_SOLDADO',
          subscription: 'plan_free' as const,
          payment_due_date: null,
          created_at: '2025-01-01T00:00:00.000Z'
        },
        isAuthenticated: true,
        isBootstrapping: false
      })
    })

    setup('/dashboard')

    expect(screen.getByText('Dashboard Private')).toBeInTheDocument()
  })
})
