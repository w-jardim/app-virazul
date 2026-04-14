import React, { useState } from 'react'
import { useOperationalReport, useFinancialReport } from '@/features/reports/hooks/useReportsData'
import {
  OperationalReportSummary,
  OperationalByStatusChart,
  FinancialReportSummary,
  FinancialByStatusChart,
  FinancialByServiceTypeTable
} from '@/features/reports/components/ReportComponents'
import { DateRangeFilter } from '@/components/shared/DateRangeFilter'
import { PageLoadingState, PageErrorState } from '@/components/shared/PageStates'
import { useServiceTypes } from '@/features/services/hooks/useServicesData'
import { startOfMonthLocal, todayLocal } from '@/utils/date-period'

const OPERATIONAL_OPTIONS = [
  { value: '', label: 'Todas' },
  { value: 'TITULAR', label: 'Titular' },
  { value: 'RESERVA', label: 'Reserva' },
  { value: 'CONVERTIDO_TITULAR', label: 'Convertido (titular)' },
  { value: 'REALIZADO', label: 'Realizado' },
  { value: 'FALTOU', label: 'Faltou' },
  { value: 'CANCELADO', label: 'Cancelado' },
  { value: 'NAO_CONVERTIDO', label: 'Não convertido' },
]

const FINANCIAL_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'PREVISTO', label: 'Previsto' },
  { value: 'PAGO', label: 'Pago' },
  { value: 'PAGO_PARCIAL', label: 'Parcial pago' },
  { value: 'NAO_PAGO', label: 'Não pago' },
]

const ReportsPage: React.FC = () => {
  const [startDate, setStartDate] = useState(startOfMonthLocal)
  const [endDate, setEndDate] = useState(todayLocal)
  const [serviceType, setServiceType] = useState('')
  const [operationalStatus, setOperationalStatus] = useState('')
  const [financialStatus, setFinancialStatus] = useState('')

  const serviceTypesQuery = useServiceTypes()
  const serviceTypes = serviceTypesQuery.data ?? []

  const filters = {
    start_date: startDate || undefined,
    end_date: endDate || undefined,
    service_type: serviceType || undefined,
    operational_status: operationalStatus || undefined,
    financial_status: financialStatus || undefined,
  }

  const operationalQuery = useOperationalReport(filters)
  const financialQuery = useFinancialReport(filters)

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">Relatórios</h1>
        <p className="text-sm text-slate-600">Indicadores operacionais e financeiros do período selecionado.</p>
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
        <label className="block text-xs font-medium text-slate-600">
          Situação operacional
          <select
            value={operationalStatus}
            onChange={(e) => setOperationalStatus(e.target.value)}
            className="mt-1 block rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            {OPERATIONAL_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </label>
        <label className="block text-xs font-medium text-slate-600">
          Situação financeira
          <select
            value={financialStatus}
            onChange={(e) => setFinancialStatus(e.target.value)}
            className="mt-1 block rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            {FINANCIAL_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </label>
      </DateRangeFilter>

      {/* Operational */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-800">Operação</h2>
        {operationalQuery.isLoading ? (
          <PageLoadingState />
        ) : operationalQuery.isError || !operationalQuery.data ? (
          <PageErrorState title="Falha ao carregar relatório operacional" />
        ) : (
          <div className="space-y-4">
            <OperationalReportSummary report={operationalQuery.data} />
            <OperationalByStatusChart report={operationalQuery.data} />
          </div>
        )}
      </div>

      {/* Financial */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-800">Financeiro</h2>
        {financialQuery.isLoading ? (
          <PageLoadingState />
        ) : financialQuery.isError || !financialQuery.data ? (
          <PageErrorState title="Falha ao carregar relatório financeiro" />
        ) : (
          <div className="space-y-4">
            <FinancialReportSummary report={financialQuery.data} />
            <div className="grid gap-4 xl:grid-cols-2">
              <FinancialByStatusChart report={financialQuery.data} />
              <FinancialByServiceTypeTable report={financialQuery.data} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ReportsPage

