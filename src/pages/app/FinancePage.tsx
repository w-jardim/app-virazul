import React, { useState } from 'react'
import { useFinanceSummary, useFinanceReport } from '@/features/finance/hooks/useFinanceData'
import {
  FinanceSummaryCards,
  FinanceByStatusChart,
  FinanceByServiceTypeTable
} from '@/features/finance/components/FinanceComponents'
import { PageLoadingState, PageErrorState } from '@/components/shared/PageStates'
import { currentMonthLocal } from '@/utils/date-period'

const FinancePage: React.FC = () => {
  const [month, setMonth] = useState(currentMonthLocal)

  const summaryQuery = useFinanceSummary(month)
  const reportQuery = useFinanceReport({})

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Financeiro</h1>
          <p className="text-sm text-slate-600">Acompanhe recebimentos, pendências e valores por tipo de serviço.</p>
        </div>
        <label className="block text-xs font-medium text-slate-600">
          Mês de referência
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="mt-1 block rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
      </header>

      {summaryQuery.isLoading ? (
        <PageLoadingState />
      ) : summaryQuery.isError || !summaryQuery.data ? (
        <PageErrorState title="Falha ao carregar dados financeiros" description="Verifique o mês selecionado e tente novamente." />
      ) : (
        <div className="space-y-4">
          <FinanceSummaryCards summary={summaryQuery.data} />

          <div className="grid gap-4 xl:grid-cols-2">
            <FinanceByStatusChart summary={summaryQuery.data} />
            <FinanceByServiceTypeTable rows={reportQuery.data?.by_service_type ?? []} />
          </div>
        </div>
      )}
    </div>
  )
}

export default FinancePage

