import React, { useState } from 'react'
import { DateRangeFilter } from '@/components/shared/DateRangeFilter'
import { PageLoadingState, PageErrorState } from '@/components/shared/PageStates'
import { useServiceTypes } from '@/features/services/hooks/useServicesData'
import { useUserAnalytics } from '@/features/analytics/hooks/useAnalytics'
import { startOfMonthLocal, todayLocal } from '@/utils/date-period'

const AnalyticsPage: React.FC = () => {
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

  const analyticsQuery = useUserAnalytics(filters)

  if (analyticsQuery.isLoading) return <PageLoadingState />
  if (analyticsQuery.isError || !analyticsQuery.data)
    return <PageErrorState title="Falha ao carregar analytics" description="Tente novamente." />

  const data = analyticsQuery.data

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
          <div className="text-2xl font-semibold">R$ {data.summary.total_value_expected}</div>
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
