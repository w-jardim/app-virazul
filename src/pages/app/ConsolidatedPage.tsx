import React, { useMemo, useState } from 'react'
import { money, pct, escapeHtml } from '@/utils/format'
import html2pdf from 'html2pdf.js'
import api from '@/lib/api/axios'
import FinancePage from './FinancePage'
import PlanningPage from './PlanningPage'
import ReportsPage from './ReportsPage'
import { startOfMonthLocal, todayLocal } from '@/utils/date-period'
import { useServiceTypes } from '@/features/services/hooks/useServicesData'
import { useFinanceSummary } from '@/features/finance/hooks/useFinanceData'
import { usePlanningSummary } from '@/features/planning/hooks/usePlanningData'
import { useFinancialReport, useOperationalReport } from '@/features/reports/hooks/useReportsData'

type ConsolidatedTab = 'finance' | 'planning' | 'reports'



const ConsolidatedPage: React.FC = () => {
  const [tab, setTab] = useState<ConsolidatedTab>('finance')
  const [startDate, setStartDate] = useState(startOfMonthLocal)
  const [endDate, setEndDate] = useState(todayLocal)
  const [serviceType, setServiceType] = useState('')
  const [exporting, setExporting] = useState(false)
  const [filterError, setFilterError] = useState<string | null>(null)

  const month = useMemo(() => (startDate || startOfMonthLocal).slice(0, 7), [startDate])
  const reportFilters = useMemo(
    () => ({
      start_date: startDate || undefined,
      end_date: endDate || undefined,
      service_type: serviceType || undefined,
    }),
    [endDate, serviceType, startDate]
  )

  const serviceTypesQuery = useServiceTypes()
  const financeSummaryQuery = useFinanceSummary(month)
  const planningSummaryQuery = usePlanningSummary()
  const operationalReportQuery = useOperationalReport(reportFilters)
  const financialReportQuery = useFinancialReport(reportFilters)

  const anyLoading = (
    serviceTypesQuery.isLoading ||
    financeSummaryQuery.isLoading ||
    planningSummaryQuery.isLoading ||
    operationalReportQuery.isLoading ||
    financialReportQuery.isLoading
  )

  const onExportConsolidatedPdf = async () => {
    // Guard: wait for queries to finish
    if (anyLoading) {
      setFilterError('Aguarde o carregamento dos dados antes de exportar.')
      return
    }

    // Validate date range
    if (startDate && endDate && startDate > endDate) {
      setFilterError('Data de início deve ser anterior ou igual à data de fim.')
      return
    }

    setFilterError(null)
    setExporting(true)

    const finance = financeSummaryQuery.data
    const planning = planningSummaryQuery.data
    const operational = operationalReportQuery.data
    const financial = financialReportQuery.data

    const serviceTypeLabel = serviceTypesQuery.data?.find((s) => s.key === serviceType)?.name || 'Todos'

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
          <div class="muted">Período: ${escapeHtml(startDate || '-') } até ${escapeHtml(endDate || '-')} | Tipo: ${escapeHtml(serviceTypeLabel)}</div>

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
      const resp = await api.post(
        '/reports/export',
        { html, filename },
        { responseType: 'blob' }
      )

      const blob = resp.data as Blob
      const url = URL.createObjectURL(blob)
      try { window.open(url, '_blank') } catch (e) { /* ignore */ }
      setTimeout(() => { try { URL.revokeObjectURL(url) } catch (e) {} }, 60 * 1000)
    } catch (err) {
      // fallback: try client-side generation if server fails
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pdf: any = await html2pdf()
          .from(document.createElement('div'))
          .set({ filename, margin: 12, html2canvas: { scale: 2 } })
          .toPdf()
          .get('pdf')
        const blob: Blob = pdf.output('blob')
        const url = URL.createObjectURL(blob)
        try { window.open(url, '_blank') } catch (e) {}
        setTimeout(() => { try { URL.revokeObjectURL(url) } catch (e) {} }, 60 * 1000)
      } catch (e) {
        // final fallback: no-op
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
          <p className="text-sm text-slate-600">Centralize financeiro, planejamento e relatórios em uma única área.</p>
        </div>

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
      </header>

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
              <option key={st.key} value={st.key}>{st.name}</option>
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

      {tab === 'finance' ? <FinancePage /> : null}
      {tab === 'planning' ? <PlanningPage /> : null}
      {tab === 'reports' ? <ReportsPage /> : null}
    </div>
  )
}

export default ConsolidatedPage
