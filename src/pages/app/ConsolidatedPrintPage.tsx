import React, { useMemo } from 'react'
import { useServiceTypes } from '@/features/services/hooks/useServicesData'
import { useFinanceSummary } from '@/features/finance/hooks/useFinanceData'
import { usePlanningSummary } from '@/features/planning/hooks/usePlanningData'
import { useFinancialReport, useOperationalReport } from '@/features/reports/hooks/useReportsData'
import { useSearchParams } from 'react-router-dom'
import { money, pct, escapeHtml } from '@/utils/format'

const ConsolidatedPrintPage: React.FC = () => {
  const [params] = useSearchParams()
  const startDate = params.get('start') || ''
  const endDate = params.get('end') || ''
  const serviceType = params.get('type') || ''

  const month = useMemo(() => (startDate || '').slice(0, 7), [startDate])

  const serviceTypesQuery = useServiceTypes()
  const financeSummaryQuery = useFinanceSummary(month)
  const planningSummaryQuery = usePlanningSummary()
  const reportFilters = useMemo(() => ({ start_date: startDate || undefined, end_date: endDate || undefined, service_type: serviceType || undefined }), [startDate, endDate, serviceType])
  const operationalReportQuery = useOperationalReport(reportFilters)
  const financialReportQuery = useFinancialReport(reportFilters)

  const finance = financeSummaryQuery.data
  const planning = planningSummaryQuery.data
  const operational = operationalReportQuery.data
  const financial = financialReportQuery.data

  const serviceTypeLabel = serviceTypesQuery.data?.find((s) => s.key === serviceType)?.name || 'Todos'

  return (
    <div style={{ padding: 24, fontFamily: 'Arial, sans-serif', color: '#111827' }}>
      <h1 style={{ marginBottom: 4 }}>Consolidado Operacional e Financeiro</h1>
      <div style={{ color: '#6b7280', fontSize: 12, marginBottom: 12 }}>Período: {escapeHtml(startDate || '-')} até {escapeHtml(endDate || '-')} | Tipo: {escapeHtml(serviceTypeLabel)}</div>

      <h2 style={{ marginTop: 12, borderBottom: '1px solid #e5e7eb', paddingBottom: 6 }}>Financeiro</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 10 }}><div style={{ color: '#6b7280', fontSize: 12 }}>Total previsto</div><div style={{ fontSize: 16, fontWeight: 600 }}>{money(finance?.total_expected || 0)}</div></div>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 10 }}><div style={{ color: '#6b7280', fontSize: 12 }}>Total recebido</div><div style={{ fontSize: 16, fontWeight: 600 }}>{money(finance?.total_received || 0)}</div></div>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 10 }}><div style={{ color: '#6b7280', fontSize: 12 }}>Total pendente</div><div style={{ fontSize: 16, fontWeight: 600 }}>{money(finance?.total_pending || 0)}</div></div>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 10 }}><div style={{ color: '#6b7280', fontSize: 12 }}>Total em atraso</div><div style={{ fontSize: 16, fontWeight: 600 }}>{money(finance?.total_overdue || 0)}</div></div>
      </div>

      <h2 style={{ marginTop: 20, borderBottom: '1px solid #e5e7eb', paddingBottom: 6 }}>Planejamento</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 10 }}><div style={{ color: '#6b7280', fontSize: 12 }}>Meta mensal (h)</div><div style={{ fontSize: 16, fontWeight: 600 }}>{planning?.goal || 0}</div></div>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 10 }}><div style={{ color: '#6b7280', fontSize: 12 }}>Horas confirmadas</div><div style={{ fontSize: 16, fontWeight: 600 }}>{planning?.confirmed_hours || 0}</div></div>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 10 }}><div style={{ color: '#6b7280', fontSize: 12 }}>Horas em espera</div><div style={{ fontSize: 16, fontWeight: 600 }}>{planning?.waiting_hours || 0}</div></div>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 10 }}><div style={{ color: '#6b7280', fontSize: 12 }}>Horas restantes</div><div style={{ fontSize: 16, fontWeight: 600 }}>{planning?.remaining_hours || 0}</div></div>
      </div>

      <h2 style={{ marginTop: 20, borderBottom: '1px solid #e5e7eb', paddingBottom: 6 }}>Relatórios</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 10 }}><div style={{ color: '#6b7280', fontSize: 12 }}>Serviços no período</div><div style={{ fontSize: 16, fontWeight: 600 }}>{operational?.summary?.total_services || 0}</div></div>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 10 }}><div style={{ color: '#6b7280', fontSize: 12 }}>Horas realizadas</div><div style={{ fontSize: 16, fontWeight: 600 }}>{operational?.summary?.realized_hours || 0}</div></div>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 10 }}><div style={{ color: '#6b7280', fontSize: 12 }}>Recebimento (%)</div><div style={{ fontSize: 16, fontWeight: 600 }}>{pct(financial?.summary?.received_percentage || 0)}</div></div>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 10 }}><div style={{ color: '#6b7280', fontSize: 12 }}>Pendente (%)</div><div style={{ fontSize: 16, fontWeight: 600 }}>{pct(financial?.summary?.pending_percentage || 0)}</div></div>
      </div>
    </div>
  )
}

export default ConsolidatedPrintPage
