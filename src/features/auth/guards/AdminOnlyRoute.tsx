import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { isAdminMaster } from '../utils/roles'

const AdminOnlyRoute = () => {
  const user = useAuthStore((state) => state.user)

  if (!isAdminMaster(user)) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}

export default AdminOnlyRoute
