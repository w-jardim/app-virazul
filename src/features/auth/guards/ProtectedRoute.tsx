import { Outlet, Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { AuthLoading } from '../components/AuthUI'

const ProtectedRoute = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isBootstrapping = useAuthStore((state) => state.isBootstrapping)
  const location = useLocation()

  if (isBootstrapping) {
    return <AuthLoading label="Validando sessão..." />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}

export default ProtectedRoute

