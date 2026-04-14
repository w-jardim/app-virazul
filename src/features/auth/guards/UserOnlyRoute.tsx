import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { isAdminMaster } from '../utils/roles'

const UserOnlyRoute = () => {
  const user = useAuthStore((state) => state.user)

  if (isAdminMaster(user)) {
    return <Navigate to="/admin" replace />
  }

  return <Outlet />
}

export default UserOnlyRoute
