import { useAuthStore } from '@/features/auth/store/useAuthStore'

export const resetAuthStore = () => {
  localStorage.removeItem('viraazul_auth')
  useAuthStore.setState({
    token: null,
    user: null,
    isAuthenticated: false,
    isBootstrapping: false
  })
}

