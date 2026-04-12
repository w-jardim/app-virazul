import React from 'react'
import { usePlanningSummary, usePlanningSuggestions } from '@/features/planning/hooks/usePlanningData'
import {
  PlanningHoursProgress,
  PlanningProjectionChart,
  PlanningCombinations,
  PlanningSuggestionsList
} from '@/features/planning/components/PlanningComponents'
import { PageLoadingState, PageErrorState } from '@/components/shared/PageStates'

const PlanningPage: React.FC = () => {
  const summaryQuery = usePlanningSummary()
  const suggestionsQuery = usePlanningSuggestions()

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">Planejamento</h1>
        <p className="text-sm text-slate-600">Meta mensal, projeções e sugestões de escala.</p>
      </header>

      {summaryQuery.isLoading ? (
        <PageLoadingState />
      ) : summaryQuery.isError || !summaryQuery.data ? (
        <PageErrorState title="Falha ao carregar planejamento" description="Tente novamente em instantes." />
      ) : (
        <div className="space-y-4">
          <PlanningHoursProgress summary={summaryQuery.data} />

          <div className="grid gap-4 xl:grid-cols-2">
            <PlanningProjectionChart summary={summaryQuery.data} />
            <PlanningCombinations summary={summaryQuery.data} />
          </div>

          {suggestionsQuery.isLoading ? (
            <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
          ) : (
            <PlanningSuggestionsList suggestions={suggestionsQuery.data ?? []} />
          )}
        </div>
      )}
    </div>
  )
}

export default PlanningPage

