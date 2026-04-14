import React from 'react'
import { useInsights } from '@/features/insights/hooks/useInsights'
import { InsightSection, SourceWarningBanner } from '@/features/insights/components/InsightComponents'
import { PageLoadingState, PageErrorState, PageEmptyState } from '@/components/shared/PageStates'

const InsightsPage: React.FC = () => {
  const {
    isLoading,
    isAllError,
    hasPartialError,
    failedSources,
    period,
    insights,
    byCategory,
  } = useInsights()

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">Insights</h1>
        <p className="text-sm text-slate-600">
          Alertas, oportunidades e recomendações geradas automaticamente a partir dos seus dados.
        </p>
        <p className="text-xs text-slate-400 mt-1">
          Período: {period.start_date} a {period.end_date}
        </p>
      </header>

      {isLoading ? (
        <PageLoadingState />
      ) : isAllError ? (
        <PageErrorState
          title="Falha ao carregar insights"
          description="Não foi possível acessar nenhuma fonte de dados. Tente novamente."
        />
      ) : (
        <>
          {hasPartialError && <SourceWarningBanner sources={failedSources} />}

          {insights.length === 0 ? (
            <PageEmptyState
              title="Nenhum insight disponível"
              description="Quando houver dados suficientes, o sistema gerará alertas, oportunidades e recomendações aqui."
            />
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              <InsightSection category="alert" insights={byCategory.alert} />
              <InsightSection category="opportunity" insights={byCategory.opportunity} />
              <InsightSection category="recommendation" insights={byCategory.recommendation} />
              <InsightSection category="trend" insights={byCategory.trend} />
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default InsightsPage
