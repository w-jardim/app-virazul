import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { AuthLoading } from '../components/AuthUI'

const PublicOnlyRoute = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isBootstrapping = useAuthStore((state) => state.isBootstrapping)

  if (isBootstrapping) {
    return <AuthLoading label="Preparando acesso..." />
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}

export default PublicOnlyRoute

