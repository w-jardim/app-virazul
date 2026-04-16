import React, { useMemo } from 'react'
import { useFinanceReport } from '@/features/finance/hooks/useFinanceData'
import {
  FinanceSummaryCards,
  FinanceByStatusChart,
  FinanceByServiceTypeTable
} from '@/features/finance/components/FinanceComponents'
import { PageLoadingState, PageErrorState, PageEmptyState } from '@/components/shared/PageStates'
import { useServiceDateRange } from '@/features/services/hooks/useServicesData'

const FinancePage: React.FC = () => {
  const dateRangeQuery = useServiceDateRange()

  const reportFilters = useMemo(() => {
    if (!dateRangeQuery.data?.start_date || !dateRangeQuery.data?.end_date) {
      return {}
    }

    return {
      start_date: dateRangeQuery.data.start_date,
      end_date: dateRangeQuery.data.end_date,
    }
  }, [dateRangeQuery.data?.end_date, dateRangeQuery.data?.start_date])

  const reportQuery = useFinanceReport(reportFilters)
  const hasServiceRange = Boolean(dateRangeQuery.data?.start_date && dateRangeQuery.data?.end_date)

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Financeiro</h1>
          <p className="text-sm text-slate-600">Acompanhe recebimentos, pendências e valores do primeiro ao último serviço cadastrado.</p>
          {hasServiceRange ? (
            <p className="mt-1 text-xs text-slate-500">
              Período considerado: {dateRangeQuery.data?.start_date} a {dateRangeQuery.data?.end_date}
            </p>
          ) : null}
        </div>
      </header>

      {dateRangeQuery.isLoading || reportQuery.isLoading ? (
        <PageLoadingState />
      ) : dateRangeQuery.isError || reportQuery.isError ? (
        <PageErrorState title="Falha ao carregar dados financeiros" description="Tente novamente em instantes." />
      ) : !hasServiceRange ? (
        <PageEmptyState title="Sem serviços cadastrados" description="Cadastre serviços para visualizar o consolidado financeiro do período real." />
      ) : !reportQuery.data ? (
        <PageErrorState title="Falha ao carregar dados financeiros" description="Tente novamente em instantes." />
      ) : (
        <div className="space-y-4">
          <FinanceSummaryCards summary={reportQuery.data.summary} />

          <div className="grid gap-4 xl:grid-cols-2">
            <FinanceByStatusChart summary={reportQuery.data.summary} />
            <FinanceByServiceTypeTable rows={reportQuery.data.by_service_type} />
          </div>
        </div>
      )}
    </div>
  )
}

export default FinancePage
