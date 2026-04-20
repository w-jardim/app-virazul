import React, { useState } from 'react'
import { DateRangeFilter } from '@/components/shared/DateRangeFilter'
import { PageLoadingState, PageErrorState } from '@/components/shared/PageStates'
import { useServiceTypes } from '@/features/services/hooks/useServicesData'
import { useAuthStore } from '@/features/auth/store/useAuthStore'
import { useAdminUserAnalyticsOverview, useUserAnalytics } from '@/features/analytics/hooks/useAnalytics'
import { startOfMonthLocal, todayLocal } from '@/utils/date-period'

function formatMoney(value: number | string | null | undefined) {
  const amount = Number(value || 0)
  return amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const AnalyticsPage: React.FC = () => {
  const authUser = useAuthStore((state) => state.user)
  const isAdminMaster = authUser?.role === 'ADMIN_MASTER'

  const [startDate, setStartDate] = useState(startOfMonthLocal)
  const [endDate, setEndDate] = useState(todayLocal)
  const [serviceType, setServiceType] = useState('')

  const serviceTypesQuery = useServiceTypes()
  const serviceTypes = serviceTypesQuery.data ?? []

  const filters = {
    start_date: startDate || undefined,
    end_date: endDate || undefined,
    service_type: serviceType || undefined,
  }

  const userAnalyticsQuery = useUserAnalytics(filters, !isAdminMaster)
  const adminAnalyticsQuery = useAdminUserAnalyticsOverview(filters, isAdminMaster)

  const analyticsQuery = isAdminMaster ? adminAnalyticsQuery : userAnalyticsQuery

  if (analyticsQuery.isLoading) return <PageLoadingState />
  if (analyticsQuery.isError || !analyticsQuery.data)
    return <PageErrorState title="Falha ao carregar analytics" description="Tente novamente." />

  const data = analyticsQuery.data

  if (isAdminMaster) {
    return (
      <div className="space-y-5">
        <header>
          <h1 className="text-2xl font-semibold text-slate-900">Analytics de Usuários</h1>
          <p className="text-sm text-slate-600">Visão geral financeira, operacional, serviços e atividade do sistema.</p>
        </header>

        <DateRangeFilter
          startDate={startDate}
          endDate={endDate}
          onStartDate={setStartDate}
          onEndDate={setEndDate}
        >
          <label className="block text-xs font-medium text-slate-600">
            Tipo de serviço
            <select
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              className="mt-1 block rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">Todos</option>
              {serviceTypes.map((st) => (
                <option key={st.key} value={st.key}>{st.name}</option>
              ))}
            </select>
          </label>
        </DateRangeFilter>

        <div className="grid gap-4 lg:grid-cols-4">
          <div className="rounded-lg border border-slate-200 p-4">
            <div className="text-sm text-slate-500">Usuários no escopo</div>
            <div className="text-2xl font-semibold">{data.summary.users_total}</div>
          </div>
          <div className="rounded-lg border border-slate-200 p-4">
            <div className="text-sm text-slate-500">Serviços</div>
            <div className="text-2xl font-semibold">{data.summary.total_services}</div>
          </div>
          <div className="rounded-lg border border-slate-200 p-4">
            <div className="text-sm text-slate-500">Valor esperado</div>
            <div className="text-2xl font-semibold">R$ {formatMoney(data.summary.total_expected)}</div>
          </div>
          <div className="rounded-lg border border-slate-200 p-4">
            <div className="text-sm text-slate-500">Valor em atraso</div>
            <div className="text-2xl font-semibold text-rose-700">R$ {formatMoney(data.summary.total_overdue_balance)}</div>
          </div>
        </div>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-slate-200 p-4">
            <h2 className="text-lg font-medium">Financeiro por status</h2>
            <ul className="mt-3 space-y-2">
              {data.financeiro.by_status.map((item: any) => (
                <li key={item.financial_status} className="flex items-center justify-between rounded bg-slate-50 px-3 py-2 text-sm">
                  <span>{item.financial_status} ({item.services_count})</span>
                  <span>R$ {formatMoney(item.total_expected)}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-slate-200 p-4">
            <h2 className="text-lg font-medium">Operacional por status</h2>
            <ul className="mt-3 space-y-2">
              {data.operacional.by_status.map((item: any) => (
                <li key={item.operational_status} className="flex items-center justify-between rounded bg-slate-50 px-3 py-2 text-sm">
                  <span>{item.operational_status} ({item.services_count})</span>
                  <span>{item.total_hours}h</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-slate-200 p-4">
            <h2 className="text-lg font-medium">Serviços por tipo</h2>
            <ul className="mt-3 space-y-2">
              {data.services.by_type.map((item: any) => (
                <li key={item.service_type_id} className="flex items-center justify-between rounded bg-slate-50 px-3 py-2 text-sm">
                  <span>{item.service_type_name} ({item.services_count})</span>
                  <span>R$ {formatMoney(item.total_expected)}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-slate-200 p-4">
            <h2 className="text-lg font-medium">Top usuários ativos</h2>
            <ul className="mt-3 space-y-2">
              {data.trafego.top_active_users.map((item: any) => (
                <li key={item.id} className="rounded bg-slate-50 px-3 py-2 text-sm">
                  <div className="font-medium text-slate-800">{item.name}</div>
                  <div className="text-xs text-slate-600">{item.email}</div>
                  <div className="mt-1 text-xs text-slate-600">
                    Eventos: {item.activity_events} | Serviços: {item.services_created} | Transições: {item.status_changes}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">Analytics do Usuário</h1>
        <p className="text-sm text-slate-600">Visão agregada dos seus serviços no período.</p>
      </header>

      <DateRangeFilter
        startDate={startDate}
        endDate={endDate}
        onStartDate={setStartDate}
        onEndDate={setEndDate}
      >
        <label className="block text-xs font-medium text-slate-600">
          Tipo de serviço
          <select
            value={serviceType}
            onChange={(e) => setServiceType(e.target.value)}
            className="mt-1 block rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">Todos</option>
            {serviceTypes.map((st) => (
              <option key={st.key} value={st.key}>{st.name}</option>
            ))}
          </select>
        </label>
      </DateRangeFilter>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-lg border border-slate-200 p-4">
          <div className="text-sm text-slate-500">Total de serviços</div>
          <div className="text-2xl font-semibold">{data.summary.total_services}</div>
        </div>
        <div className="rounded-lg border border-slate-200 p-4">
          <div className="text-sm text-slate-500">Horas (total)</div>
          <div className="text-2xl font-semibold">{data.summary.total_hours}</div>
        </div>
        <div className="rounded-lg border border-slate-200 p-4">
          <div className="text-sm text-slate-500">Valor esperado</div>
          <div className="text-2xl font-semibold">R$ {formatMoney(data.summary.total_value_expected)}</div>
        </div>
      </div>

      <section>
        <h2 className="text-lg font-medium">Top serviços por valor</h2>
        <ul className="mt-2 space-y-2">
          {data.top_services_by_value.map((s: any) => (
            <li key={s.id} className="flex justify-between rounded-md bg-slate-50 p-2">
              <span>{s.service_type} — #{s.id}</span>
              <span>R$ {s.amount_total}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

export default AnalyticsPage
