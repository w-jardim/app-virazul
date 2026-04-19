import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/store/useAuthStore'
import { isAdminMaster } from '@/features/auth/utils/roles'

// Layouts
import PublicLayout from '@/components/layout/public/PublicLayout'
import AppShell from '@/components/layout/authenticated/AppShell'
import AdminShell from '@/components/layout/admin/AdminShell'

// Guards
import ProtectedRoute from '@/features/auth/guards/ProtectedRoute'
import PublicOnlyRoute from '@/features/auth/guards/PublicOnlyRoute'
import AdminOnlyRoute from '@/features/auth/guards/AdminOnlyRoute'
import UserOnlyRoute from '@/features/auth/guards/UserOnlyRoute'

// Public pages
import Home from '@/pages/Home'
import LoginPage from '@/pages/Login'
import RegisterPage from '@/pages/Register'
import Privacidade from '@/pages/Privacidade'
import Termos from '@/pages/Termos'
import Contato from '@/pages/Contato'
import NotFound from '@/pages/NotFound'

// App pages
import DashboardPage from '@/pages/DashboardPage'
import AgendaPage from '@/pages/app/AgendaPage'
import ServicesPage from '@/pages/app/ServicesPage'
import OperationPage from '@/pages/app/OperationPage'
import PlanningPage from '@/pages/app/PlanningPage'
import FinancePage from '@/pages/app/FinancePage'
import ReportsPage from '@/pages/app/ReportsPage'
import ServiceCreatePage from '@/pages/app/ServiceCreatePage'
import ServiceDetailPage from '@/pages/app/ServiceDetailPage'
import ProfilePage from '@/pages/app/ProfilePage'
import AlertsPage from '@/pages/app/AlertsPage'
import InsightsPage from '@/pages/app/InsightsPage'
import OrdinarySchedulePage from '@/pages/app/OrdinarySchedulePage'
import BillingPage from '@/pages/app/BillingPage'

// Admin pages
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage'
import AdminUsersPage from '@/pages/admin/AdminUsersPage'
import AdminSubscriptionsPage from '@/pages/admin/AdminSubscriptionsPage'
import AdminPaymentsPage from '@/pages/admin/AdminPaymentsPage'

const RootRedirect: React.FC = () => {
  const user = useAuthStore((state) => state.user)
  if (isAdminMaster(user)) return <Navigate to="/admin" replace />
  return <Navigate to="/dashboard" replace />
}

const Router: React.FC = () => (
  <Routes>
    <Route element={<PublicLayout />}>
      <Route path="/" element={<Home />} />
      <Route path="/privacidade" element={<Privacidade />} />
      <Route path="/termos" element={<Termos />} />
      <Route path="/contato" element={<Contato />} />
    </Route>

    <Route element={<PublicOnlyRoute />}>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
    </Route>

    <Route element={<ProtectedRoute />}>
      <Route path="/app" element={<RootRedirect />} />

      <Route element={<UserOnlyRoute />}>
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/operation" element={<OperationPage />} />
          <Route path="/agenda" element={<AgendaPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/services/new" element={<ServiceCreatePage />} />
          <Route path="/services/:id" element={<ServiceDetailPage />} />
          <Route path="/planning" element={<PlanningPage />} />
          <Route path="/finance" element={<FinancePage />} />
          <Route path="/billing" element={<BillingPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/ordinary-schedule" element={<OrdinarySchedulePage />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/insights" element={<InsightsPage />} />
        </Route>
      </Route>

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

export default Router
