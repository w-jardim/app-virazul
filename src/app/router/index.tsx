import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import LoginPage from '@/pages/Login'
import NotFound from '@/pages/NotFound'
import ProtectedRoute from '@/features/auth/guards/ProtectedRoute'
import PublicOnlyRoute from '@/features/auth/guards/PublicOnlyRoute'
import AdminOnlyRoute from '@/features/auth/guards/AdminOnlyRoute'
import AppShell from '@/components/layout/authenticated/AppShell'
import DashboardPage from '@/pages/DashboardPage'
import AgendaPage from '@/pages/app/AgendaPage'
import ServicesPage from '@/pages/app/ServicesPage'
import AlertsPage from '@/pages/app/AlertsPage'
import PlanningPage from '@/pages/app/PlanningPage'
import FinancePage from '@/pages/app/FinancePage'
import ReportsPage from '@/pages/app/ReportsPage'
import AdminPage from '@/pages/app/AdminPage'
import ServiceCreatePage from '@/pages/app/ServiceCreatePage'
import ServiceDetailPage from '@/pages/app/ServiceDetailPage'

const Router: React.FC = () => {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/agenda" element={<AgendaPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/services/new" element={<ServiceCreatePage />} />
          <Route path="/services/:id" element={<ServiceDetailPage />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/planning" element={<PlanningPage />} />
          <Route path="/finance" element={<FinancePage />} />
          <Route path="/reports" element={<ReportsPage />} />

          <Route element={<AdminOnlyRoute />}>
            <Route path="/admin" element={<AdminPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default Router
