import React, { useEffect, useMemo, useState } from 'react'
import { money, pct, escapeHtml } from '@/utils/format'
import html2pdf from 'html2pdf.js'
import api from '@/lib/api/axios'
import PlanningPage from './PlanningPage'
import ReportsPage from './ReportsPage'
import { startOfMonthLocal, todayLocal } from '@/utils/date-period'
import { useServiceDateRange, useServiceTypes } from '@/features/services/hooks/useServicesData'
import { useFinanceReport, useFinanceSummary } from '@/features/finance/hooks/useFinanceData'
import {
  FinanceSummaryCards,
  FinanceByStatusChart,
  FinanceByServiceTypeTable,
} from '@/features/finance/components/FinanceComponents'
import { usePlanningSummary } from '@/features/planning/hooks/usePlanningData'
import { useFinancialReport, useOperationalReport } from '@/features/reports/hooks/useReportsData'
import { PageEmptyState, PageErrorState, PageLoadingState } from '@/components/shared/PageStates'

type ConsolidatedTab = 'finance' | 'planning' | 'reports'

type ConsolidatedFinancePanelProps = {
  startDate: string
  endDate: string
  serviceTypeLabel: string
  isLoading: boolean
  isError: boolean
  data: {
    summary: {
      total_expected: number
      total_received: number
      total_pending: number
      total_overdue: number
      by_status: Record<string, number>
    }
    by_service_type: Array<{
      service_type: string
      service_type_name: string
      total_expected: number
      total_received: number
      total_pending: number
      total_overdue: number
    }>
  } | undefined
}

function hasFinanceData(data: ConsolidatedFinancePanelProps['data']) {
  if (!data) return false

  const summary = data.summary
  const total =
    (summary.total_expected || 0) +
    (summary.total_received || 0) +
    (summary.total_pending || 0) +
    (summary.total_overdue || 0)

  return total > 0 || data.by_service_type.length > 0
}

function ConsolidatedFinancePanel({
  startDate,
  endDate,
  serviceTypeLabel,
  isLoading,
  isError,
  data,
}: ConsolidatedFinancePanelProps) {
  if (isLoading) {
    return <PageLoadingState />
  }

  if (isError || !data) {
    return (
      <PageErrorState
        title="Falha ao carregar financeiro consolidado"
        description="Revise os filtros aplicados e tente novamente."
      />
    )
  }

  if (!hasFinanceData(data)) {
    return (
      <PageEmptyState
        title="Sem dados financeiros no consolidado"
        description="Ajuste o período ou o tipo de serviço para visualizar valores financeiros neste painel."
      />
    )
  }

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">Financeiro consolidado</h2>
        <p className="mt-0.5 text-sm text-slate-500">
          Este painel usa os filtros da página consolidada: {startDate || '-'} a {endDate || '-'} | Tipo: {serviceTypeLabel}.
        </p>
      </section>

      <FinanceSummaryCards summary={data.summary} />

      <div className="grid gap-4 xl:grid-cols-2">
        <FinanceByStatusChart summary={data.summary} />
        <FinanceByServiceTypeTable rows={data.by_service_type} />
      </div>
    </div>
  )
}

const ConsolidatedPage: React.FC = () => {
  const [tab, setTab] = useState<ConsolidatedTab>('finance')
  const [startDate, setStartDate] = useState(startOfMonthLocal)
  const [endDate, setEndDate] = useState(todayLocal)
  const [serviceType, setServiceType] = useState('')
  const [exporting, setExporting] = useState(false)
  const [filterError, setFilterError] = useState<string | null>(null)

  const reportFilters = useMemo(
    () => ({
      start_date: startDate || undefined,
      end_date: endDate || undefined,
      service_type: serviceType || undefined,
    }),
    [endDate, serviceType, startDate],
  )

  const month = useMemo(() => (startDate || startOfMonthLocal).slice(0, 7), [startDate])

  const serviceDateRangeQuery = useServiceDateRange()
  const serviceTypesQuery = useServiceTypes()
  const financeSummaryQuery = useFinanceSummary(month)
  const financeReportQuery = useFinanceReport(reportFilters)
  const planningSummaryQuery = usePlanningSummary()
  const operationalReportQuery = useOperationalReport(reportFilters)
  const financialReportQuery = useFinancialReport(reportFilters)

  const anyLoading =
    serviceTypesQuery.isLoading ||
    financeReportQuery.isLoading ||
    planningSummaryQuery.isLoading ||
    operationalReportQuery.isLoading ||
    financialReportQuery.isLoading

  
  useEffect(() => {
    if (!serviceDateRangeQuery.data?.start_date || !serviceDateRangeQuery.data?.end_date) {
      return
    }

    setStartDate((current) => current || serviceDateRangeQuery.data.start_date || '')
    setEndDate((current) => current || serviceDateRangeQuery.data.end_date || '')
  }, [serviceDateRangeQuery.data?.end_date, serviceDateRangeQuery.data?.start_date])
  const serviceTypeLabel = serviceTypesQuery.data?.find((s) => s.key === serviceType)?.name || 'Todos'
  const useMonthlyFinanceSummary = !serviceType && startDate.slice(0, 7) === endDate.slice(0, 7)
  const effectiveFinanceSummary = useMonthlyFinanceSummary
    ? financeSummaryQuery.data
    : financeReportQuery.data?.summary

  const onExportConsolidatedPdf = async () => {
    if (anyLoading) {
      setFilterError('Aguarde o carregamento dos dados antes de exportar.')
      return
    }

    if (startDate && endDate && startDate > endDate) {
      setFilterError('Data de início deve ser anterior ou igual à data de fim.')
      return
    }

    setFilterError(null)
    setExporting(true)

    const finance = effectiveFinanceSummary
    const planning = planningSummaryQuery.data
    const operational = operationalReportQuery.data
    const financial = financialReportQuery.data

    const html = `
      <html>
        <head>
          <title>Consolidado ViraAzul</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 24px; color: #111827; }
            h1 { margin: 0 0 4px; }
            h2 { margin-top: 24px; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; }
            .muted { color: #6b7280; font-size: 12px; }
            .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
            .card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 10px; }
            .k { color: #6b7280; font-size: 12px; margin-bottom: 4px; }
            .v { font-size: 16px; font-weight: 600; }
          </style>
        </head>
        <body>
          <h1>Consolidado Operacional e Financeiro</h1>
          <div class="muted">Período: ${escapeHtml(startDate || '-')} até ${escapeHtml(endDate || '-')} | Tipo: ${escapeHtml(serviceTypeLabel)}</div>

          <h2>Financeiro</h2>
          <div class="grid">
            <div class="card"><div class="k">Total previsto</div><div class="v">${escapeHtml(money(finance?.total_expected || 0))}</div></div>
            <div class="card"><div class="k">Total recebido</div><div class="v">${escapeHtml(money(finance?.total_received || 0))}</div></div>
            <div class="card"><div class="k">Total pendente</div><div class="v">${escapeHtml(money(finance?.total_pending || 0))}</div></div>
            <div class="card"><div class="k">Total em atraso</div><div class="v">${escapeHtml(money(finance?.total_overdue || 0))}</div></div>
          </div>

          <h2>Planejamento</h2>
          <div class="grid">
            <div class="card"><div class="k">Meta mensal (h)</div><div class="v">${escapeHtml(planning?.goal || 0)}</div></div>
            <div class="card"><div class="k">Horas confirmadas</div><div class="v">${escapeHtml(planning?.confirmed_hours || 0)}</div></div>
            <div class="card"><div class="k">Horas em espera</div><div class="v">${escapeHtml(planning?.waiting_hours || 0)}</div></div>
            <div class="card"><div class="k">Horas restantes</div><div class="v">${escapeHtml(planning?.remaining_hours || 0)}</div></div>
          </div>

          <h2>Relatórios</h2>
          <div class="grid">
            <div class="card"><div class="k">Serviços no período</div><div class="v">${escapeHtml(operational?.summary?.total_services || 0)}</div></div>
            <div class="card"><div class="k">Horas realizadas</div><div class="v">${escapeHtml(operational?.summary?.realized_hours || 0)}</div></div>
            <div class="card"><div class="k">Recebimento (%)</div><div class="v">${escapeHtml(pct(financial?.summary?.received_percentage || 0))}</div></div>
            <div class="card"><div class="k">Pendente (%)</div><div class="v">${escapeHtml(pct(financial?.summary?.pending_percentage || 0))}</div></div>
          </div>
        </body>
      </html>
    `

    const filename = `consolidado-${startDate || 'period'}.pdf`

    try {
      const resp = await api.post('/reports/export', { html, filename }, { responseType: 'blob' })
      const blob = resp.data as Blob
      const url = URL.createObjectURL(blob)
      try {
        window.open(url, '_blank')
      } catch {
        // ignore popup blockers
      }
      setTimeout(() => {
        try {
          URL.revokeObjectURL(url)
        } catch {
          // ignore revoke errors
        }
      }, 60 * 1000)
    } catch {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pdf: any = await html2pdf()
          .from(document.createElement('div'))
          .set({ filename, margin: 12, html2canvas: { scale: 2 } })
          .toPdf()
          .get('pdf')
        const blob: Blob = pdf.output('blob')
        const url = URL.createObjectURL(blob)
        try {
          window.open(url, '_blank')
        } catch {
          // ignore popup blockers
        }
        setTimeout(() => {
          try {
            URL.revokeObjectURL(url)
          } catch {
            // ignore revoke errors
          }
        }, 60 * 1000)
      } catch {
        // no-op fallback
      }
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="space-y-4" data-testid="consolidated-page">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Consolidado</h1>
          <p className="text-sm text-slate-600">Centralize financeiro, planejamento e relatórios com os mesmos filtros.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onExportConsolidatedPdf}
            className="inline-flex items-center justify-center rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700"
          >
            {exporting ? 'Gerando...' : 'Gerar dados consolidados e PDF'}
          </button>
          <button
            type="button"
            onClick={() => {
              const qs = new URLSearchParams()
              if (startDate) qs.set('start', startDate)
              if (endDate) qs.set('end', endDate)
              if (serviceType) qs.set('type', serviceType)
              window.open(`/consolidated/print?${qs.toString()}`, '_blank')
            }}
            className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Abrir versão para impressão
          </button>
        </div>
      </header>

      {filterError ? (
        <PageErrorState title="Não foi possível exportar" description={filterError} />
      ) : null}

      <section className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-3">
        <label className="block text-xs font-medium text-slate-600">
          Início
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="block text-xs font-medium text-slate-600">
          Fim
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="block text-xs font-medium text-slate-600">
          Tipo de serviço
          <select
            value={serviceType}
            onChange={(e) => setServiceType(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">Todos</option>
            {(serviceTypesQuery.data || []).map((st) => (
              <option key={st.key} value={st.key}>
                {st.name}
              </option>
            ))}
          </select>
        </label>
      </section>

      <nav className="flex gap-1 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setTab('finance')}
          className={`px-4 py-2 text-sm font-medium transition border-b-2 -mb-px ${
            tab === 'finance'
              ? 'border-sky-600 text-sky-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Financeiro
        </button>
        <button
          type="button"
          onClick={() => setTab('planning')}
          className={`px-4 py-2 text-sm font-medium transition border-b-2 -mb-px ${
            tab === 'planning'
              ? 'border-sky-600 text-sky-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Planejamento
        </button>
        <button
          type="button"
          onClick={() => setTab('reports')}
          className={`px-4 py-2 text-sm font-medium transition border-b-2 -mb-px ${
            tab === 'reports'
              ? 'border-sky-600 text-sky-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Relatórios
        </button>
      </nav>

      {tab === 'finance' ? (
        <ConsolidatedFinancePanel
          startDate={startDate}
          endDate={endDate}
          serviceTypeLabel={serviceTypeLabel}
          isLoading={financeReportQuery.isLoading}
          isError={financeReportQuery.isError}
          data={financeReportQuery.data}
        />
      ) : null}
      {tab === 'planning' ? <PlanningPage /> : null}
      {tab === 'reports' ? <ReportsPage /> : null}
    </div>
  )
}

export default ConsolidatedPage


