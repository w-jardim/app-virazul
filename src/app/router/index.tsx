import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/store/useAuthStore'
import { isAdminMaster } from '@/features/auth/utils/roles'
import LoginPage from '@/pages/Login'
import RegisterPage from '@/pages/Register'
import NotFound from '@/pages/NotFound'
import ProtectedRoute from '@/features/auth/guards/ProtectedRoute'
import PublicOnlyRoute from '@/features/auth/guards/PublicOnlyRoute'
import AdminOnlyRoute from '@/features/auth/guards/AdminOnlyRoute'
import UserOnlyRoute from '@/features/auth/guards/UserOnlyRoute'
import AppShell from '@/components/layout/authenticated/AppShell'
import AdminShell from '@/components/layout/admin/AdminShell'
import DashboardPage from '@/pages/DashboardPage'
import AgendaPage from '@/pages/app/AgendaPage'
import ServicesPage from '@/pages/app/ServicesPage'
import OperationPage from '@/pages/app/OperationPage'
import PlanningPage from '@/pages/app/PlanningPage'
import FinancePage from '@/pages/app/FinancePage'
import ReportsPage from '@/pages/app/ReportsPage'
import ConsolidatedPage from '@/pages/app/ConsolidatedPage'
import ServiceCreatePage from '@/pages/app/ServiceCreatePage'
import ServiceDetailPage from '@/pages/app/ServiceDetailPage'
import ProfilePage from '@/pages/app/ProfilePage'
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage'
import AdminUsersPage from '@/pages/admin/AdminUsersPage'
import AdminSubscriptionsPage from '@/pages/admin/AdminSubscriptionsPage'
import AdminPaymentsPage from '@/pages/admin/AdminPaymentsPage'

const RootRedirect: React.FC = () => {
  const user = useAuthStore((state) => state.user)
  if (isAdminMaster(user)) return <Navigate to="/admin" replace />
  return <Navigate to="/dashboard" replace />
}

const Router: React.FC = () => {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<RootRedirect />} />

        {/* Rotas exclusivas de usuarios comuns (POLICE) */}
        <Route element={<UserOnlyRoute />}>
          <Route element={<AppShell />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/operation" element={<OperationPage />} />
            <Route path="/agenda" element={<AgendaPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/services/new" element={<ServiceCreatePage />} />
            <Route path="/services/:id" element={<ServiceDetailPage />} />
            <Route path="/consolidated" element={<ConsolidatedPage />} />
            <Route path="/planning" element={<PlanningPage />} />
            <Route path="/finance" element={<FinancePage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/alerts" element={<Navigate to="/dashboard" replace />} />
            <Route path="/insights" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Route>

        {/* Rotas exclusivas de administradores (ADMIN_MASTER) */}
        <Route element={<AdminOnlyRoute />}>
          <Route element={<AdminShell />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/subscriptions" element={<AdminSubscriptionsPage />} />
            <Route path="/admin/payments" element={<AdminPaymentsPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default Router
