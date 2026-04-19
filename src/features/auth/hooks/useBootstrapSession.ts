import { useEffect } from 'react'
import { authApi } from '../api/auth.api'
import { useAuthStore } from '../store/useAuthStore'

export const useBootstrapSession = () => {
  const token = useAuthStore((state) => state.token)
  const setUser = useAuthStore((state) => state.setUser)
  const clearSession = useAuthStore((state) => state.clearSession)
  const finishBootstrap = useAuthStore((state) => state.finishBootstrap)
  const startBootstrap = useAuthStore((state) => state.startBootstrap)

  useEffect(() => {
    let active = true

    const run = async () => {
      if (!token) {
        finishBootstrap()
        return
      }

      try {
        startBootstrap()
        const user = await authApi.me()
        if (!active) {
          return
        }
        setUser(user)
      } catch {
        if (!active) {
          return
        }
        clearSession()
      } finally {
        if (!active) {
          return
        }
        finishBootstrap()
      }
    }

    void run()

    return () => {
      active = false
    }
  }, [token, setUser, clearSession, finishBootstrap, startBootstrap])

  useEffect(() => {
    if (!token) return

    const refreshUser = async () => {
      try {
        const user = await authApi.me()
        setUser(user)
      } catch {
        clearSession()
      }
    }

    window.addEventListener('focus', refreshUser)
    return () => window.removeEventListener('focus', refreshUser)
  }, [token, setUser, clearSession])
}
