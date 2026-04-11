import { useAuthStore } from '../store/useAuthStore'

export const useAuth = () => {
  const token = useAuthStore((state) => state.token)
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isBootstrapping = useAuthStore((state) => state.isBootstrapping)
  const clearSession = useAuthStore((state) => state.clearSession)

  return {
    token,
    user,
    isAuthenticated,
    isBootstrapping,
    clearSession
  }
}

