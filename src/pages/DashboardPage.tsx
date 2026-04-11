import React from 'react'
import { useDashboardData } from '@/features/dashboard/hooks/useDashboardData'
import DashboardSection from '@/features/dashboard/components/DashboardSection'
import MetricCard from '@/features/dashboard/components/MetricCard'
import { EmptyState, ErrorState, LoadingState } from '@/features/dashboard/components/DashboardStates'
import ServiceList from '@/features/dashboard/components/ServiceList'
import AlertsList from '@/features/dashboard/components/AlertsList'
import { formatCurrency } from '@/features/dashboard/hooks/dashboard.format'
import { useAuthStore } from '@/features/auth/store/useAuthStore'
import { isAdminMaster } from '@/features/auth/utils/roles'

const DashboardPage: React.FC = () => {
  const { data, queries, isInitialLoading, hasError, refetchAll } = useDashboardData()
  const user = useAuthStore((state) => state.user)

  if (isInitialLoading) {
    return (
      <div className="space-y-4" data-testid="dashboard-loading">
        <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
        <LoadingState title="Carregando indicadores..." description="Sincronizando dados operacionais e financeiros." />
      </div>
    )
  }

  if (hasError && !queries.summaryQuery.data) {
    return (
      <div className="space-y-4" data-testid="dashboard-error">
        <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
        <ErrorState
          title="Não foi possível carregar a dashboard"
          description="Confira a conexão com o backend e tente novamente."
        />
        <button
          type="button"
          onClick={refetchAll}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  const recentAlerts = data.alerts.slice(0, 5)

  return (
    <div className="space-y-6" data-testid="dashboard-page">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-600">Visão consolidada da operação e financeiro do usuário.</p>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <MetricCard label="Alertas ativos" value={data.summary.counts.alerts_active} />
        <MetricCard label="Pendências operacionais" value={data.summary.counts.operational_pending} tone="warning" />
        <MetricCard label="Pendências financeiras" value={data.summary.counts.financial_pending} tone="danger" />
        <MetricCard label="Horas confirmadas" value={data.summary.hours.confirmed} tone="success" />
        <MetricCard label="Horas em espera" value={data.summary.hours.waiting} />
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <DashboardSection title="Agenda do dia" subtitle="Confirmados e reservas do período atual.">
          {queries.agendaQuery.isLoading ? (
            <LoadingState title="Carregando agenda..." />
          ) : queries.agendaQuery.isError ? (
            <ErrorState title="Falha ao carregar agenda" description="Você pode continuar usando os demais blocos da dashboard." />
          ) : data.agendaDay.confirmed.length === 0 && data.agendaDay.reservations.length === 0 ? (
            <EmptyState title="Sem serviços para hoje" description="Quando houver escala ou serviços, eles aparecerão aqui." />
          ) : (
            <div className="space-y-3">
              {data.agendaDay.confirmed.length > 0 ? (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Confirmados</p>
                  <ServiceList items={data.agendaDay.confirmed} badge="Confirmado" />
                </div>
              ) : null}

              {data.agendaDay.reservations.length > 0 ? (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Reservas</p>
                  <ServiceList items={data.agendaDay.reservations} badge="Reserva" />
                </div>
              ) : null}
            </div>
          )}
        </DashboardSection>

        <DashboardSection title="Alertas recentes" subtitle="Últimos alertas ativos relevantes para sua rotina.">
          {queries.alertsQuery.isLoading ? (
            <LoadingState title="Carregando alertas..." />
          ) : queries.alertsQuery.isError ? (
            <ErrorState title="Falha ao carregar alertas" description="Você pode continuar usando os demais blocos da dashboard." />
          ) : recentAlerts.length === 0 ? (
            <EmptyState title="Sem alertas ativos" description="Novos alertas aparecerão automaticamente." />
          ) : (
            <AlertsList items={recentAlerts} />
          )}
        </DashboardSection>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <DashboardSection title="Planejamento" subtitle="Meta mensal e progresso atual.">
          {queries.planningQuery.isLoading ? (
            <LoadingState title="Carregando planejamento..." />
          ) : queries.planningQuery.isError ? (
            <ErrorState title="Falha ao carregar planejamento" description="Você pode continuar usando os demais blocos da dashboard." />
          ) :
            data.planning.goal === 0 &&
            data.planning.confirmed_hours === 0 &&
            data.planning.waiting_hours === 0 &&
            data.planning.remaining_hours === 0 ? (
            <EmptyState title="Sem dados de planejamento" description="Defina sua meta mensal para acompanhar progresso e projeções." />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <MetricCard label="Meta mensal" value={`${data.planning.goal}h`} />
              <MetricCard label="Confirmadas" value={`${data.planning.confirmed_hours}h`} tone="success" />
              <MetricCard label="Em espera" value={`${data.planning.waiting_hours}h`} />
              <MetricCard label="Faltantes" value={`${data.planning.remaining_hours}h`} tone="warning" />
            </div>
          )}
        </DashboardSection>

        <DashboardSection title="Financeiro" subtitle="Resumo financeiro consolidado no mês atual.">
          {queries.financeQuery.isLoading ? (
            <LoadingState title="Carregando financeiro..." />
          ) : queries.financeQuery.isError ? (
            <ErrorState title="Falha ao carregar financeiro" description="Você pode continuar usando os demais blocos da dashboard." />
          ) :
            data.finance.total_expected === 0 &&
            data.finance.total_received === 0 &&
            data.finance.total_pending === 0 &&
            data.finance.total_overdue === 0 ? (
            <EmptyState title="Sem dados financeiros" description="Quando houver serviços financeiros no período, eles aparecerão aqui." />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <MetricCard label="Esperado" value={formatCurrency(data.finance.total_expected)} />
              <MetricCard label="Recebido" value={formatCurrency(data.finance.total_received)} tone="success" />
              <MetricCard label="Pendente" value={formatCurrency(data.finance.total_pending)} tone="warning" />
              <MetricCard label="Em atraso" value={formatCurrency(data.finance.total_overdue)} tone="danger" />
            </div>
          )}
        </DashboardSection>
      </section>

      {isAdminMaster(user) ? (
        <DashboardSection title="Visão ADMIN_MASTER" subtitle="Base pronta para indicadores administrativos futuros.">
          <p className="text-sm text-slate-600">Perfil administrativo identificado. Bloco reservado para expansão da área admin.</p>
        </DashboardSection>
      ) : null}
    </div>
  )
}

export default DashboardPage
