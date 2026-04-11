import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { AuthUser } from '../types/auth.types'

type AuthState = {
  token: string | null
  user: AuthUser | null
  isAuthenticated: boolean
  isBootstrapping: boolean
  setSession: (payload: { token: string; user: AuthUser }) => void
  setUser: (user: AuthUser) => void
  clearSession: () => void
  finishBootstrap: () => void
  startBootstrap: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      isBootstrapping: true,
      setSession: ({ token, user }) =>
        set({
          token,
          user,
          isAuthenticated: true
        }),
      setUser: (user) =>
        set((state) => ({
          user,
          isAuthenticated: Boolean(state.token && user)
        })),
      clearSession: () =>
        set({
          token: null,
          user: null,
          isAuthenticated: false,
          isBootstrapping: false
        }),
      startBootstrap: () => set({ isBootstrapping: true }),
      finishBootstrap: () => set({ isBootstrapping: false })
    }),
    {
      name: 'viraazul_auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) {
          return
        }
        state.isAuthenticated = Boolean(state.token)
        state.isBootstrapping = Boolean(state.token)
      }
    }
  )
)

