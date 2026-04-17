import React, { useState } from 'react'
import { useOperationalReport, useFinancialReport } from '@/features/reports/hooks/useReportsData'
import {
  ReportSummaryCards,
  OperationalStatusChart,
  FinancialSplitBar,
  ServiceTypeBreakdown,
} from '@/features/reports/components/ReportComponents'
import { DateRangeFilter } from '@/components/shared/DateRangeFilter'
import { PageLoadingState, PageErrorState } from '@/components/shared/PageStates'
import { useServiceTypes } from '@/features/services/hooks/useServicesData'
import { startOfMonthLocal, todayLocal } from '@/utils/date-period'

const ReportsPage: React.FC = () => {
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

  const operationalQuery = useOperationalReport(filters)
  const financialQuery = useFinancialReport(filters)

  const isLoading = operationalQuery.isLoading || financialQuery.isLoading
  const isError =
    (operationalQuery.isError || !operationalQuery.data) ||
    (financialQuery.isError || !financialQuery.data)

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">Relatórios</h1>
        <p className="text-sm text-slate-600">Desempenho operacional e financeiro do período selecionado.</p>
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

      {isLoading ? (
        <PageLoadingState />
      ) : isError ? (
        <PageErrorState title="Falha ao carregar relatórios" description="Tente novamente em instantes." />
      ) : (
        <div className="space-y-4">
          <ReportSummaryCards
            operational={operationalQuery.data!}
            financial={financialQuery.data!}
          />

          <div className="grid gap-4 lg:grid-cols-2">
            <OperationalStatusChart report={operationalQuery.data!} />
            <FinancialSplitBar report={financialQuery.data!} />
          </div>

          <ServiceTypeBreakdown
            report={financialQuery.data!}
            serviceTypes={serviceTypes}
          />
        </div>
      )}
    </div>
  )
}

export default ReportsPage
