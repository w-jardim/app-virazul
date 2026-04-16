import React, { useState } from 'react'
import { usePlanningSummary, usePlanningSuggestions } from '@/features/planning/hooks/usePlanningData'
import { usePlanningOperational } from '@/features/planning/hooks/usePlanningOperational'
import { useAuthStore } from '@/features/auth/store/useAuthStore'
import { authApi } from '@/features/auth/api/auth.api'
import {
  PlanningHoursProgress,
  PlanningCombinations,
  PlanningSuggestionsList
} from '@/features/planning/components/PlanningComponents'
import {
  PlanModeSelector,
  ServiceTypePicker,
  PlanTargetInput,
  SimulationResultCards,
  StrategyPanel,
  WeekdayPicker,
  DurationPicker,
  DistributionList,
  HistoricalSummary,
  PlanningWarningBanner,
  PlanningInputHint,
} from '@/features/planning/components/PlanningOperationalComponents'
import { PageLoadingState, PageErrorState } from '@/components/shared/PageStates'

type Tab = 'summary' | 'simulator'

const PlanningPage: React.FC = () => {
  const [tab, setTab] = useState<Tab>('summary')

  // Legacy summary data
  const summaryQuery = usePlanningSummary()
  const suggestionsQuery = usePlanningSuggestions()

  // Operational planner
  const operational = usePlanningOperational()
  const setUser = useAuthStore((s) => s.setUser)
  const [saveBusy, setSaveBusy] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null)

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">Planejamento</h1>
        <p className="text-sm text-slate-600">Meta mensal, projeções, simulação e planejamento operacional.</p>
        <p className="text-xs text-slate-400 mt-1">
          Período: {operational.period.start_date} a {operational.period.end_date}
        </p>
      </header>

      {/* Tab navigation */}
      <nav className="flex gap-1 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setTab('summary')}
          className={`px-4 py-2 text-sm font-medium transition border-b-2 -mb-px ${
            tab === 'summary'
              ? 'border-sky-600 text-sky-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Resumo mensal
        </button>
        <button
          type="button"
          onClick={() => setTab('simulator')}
          className={`px-4 py-2 text-sm font-medium transition border-b-2 -mb-px ${
            tab === 'simulator'
              ? 'border-sky-600 text-sky-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Simulador operacional
        </button>
      </nav>

      {/* ── Summary Tab ──────────────────────────────────────────────────── */}
      {tab === 'summary' && (
        <>
          {summaryQuery.isLoading ? (
            <PageLoadingState />
          ) : summaryQuery.isError || !summaryQuery.data ? (
            <PageErrorState title="Falha ao carregar planejamento" description="Tente novamente em instantes." />
          ) : (
            <div className="space-y-4">
              <PlanningHoursProgress summary={summaryQuery.data} />

              <PlanningCombinations summary={summaryQuery.data} />

              {suggestionsQuery.isLoading ? (
                <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
              ) : (
                <PlanningSuggestionsList suggestions={suggestionsQuery.data ?? []} />
              )}
            </div>
          )}
        </>
      )}

      {/* ── Simulator Tab ────────────────────────────────────────────────── */}
      {tab === 'simulator' && (
        <>
          {operational.isLoading ? (
            <PageLoadingState />
          ) : operational.isAllError ? (
            <PageErrorState
              title="Falha ao carregar dados para simulação"
              description="Não foi possível acessar as fontes de dados necessárias. Tente novamente."
            />
          ) : (
            <div className="space-y-4">
              {operational.hasPartialError && (
                <PlanningWarningBanner sources={operational.failedSources} />
              )}

              {/* Configuration section */}
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                <h3 className="text-base font-semibold text-slate-900">Configurar simulação</h3>

                <PlanModeSelector
                  mode={operational.mode}
                  onChangeMode={operational.setMode}
                />

                <PlanTargetInput
                  mode={operational.mode}
                  targetHours={operational.targetHours}
                  targetServices={operational.targetServices}
                  onChangeHours={operational.setTargetHours}
                  onChangeServices={operational.setTargetServices}
                />

                <ServiceTypePicker
                  available={operational.availableTypes}
                  selected={operational.selectedTypes}
                  onChangeSelected={operational.setSelectedTypes}
                />

                <div className="pt-2 grid grid-cols-3 gap-3 items-end">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Mês planejado</label>
                    <input
                      type="month"
                      value={operational.selectedMonth ?? ''}
                      onChange={(e) => operational.setSelectedMonth(e.target.value || null)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Salvar mês</label>
                    <button
                      type="button"
                      disabled={!operational.selectedMonth || saveBusy}
                      onClick={async () => {
                        if (!operational.selectedMonth) return
                        setSaveBusy(true)
                        setSaveError(null)
                        setSaveSuccess(null)
                        try {
                          const payload: any = { planning_preferences: { saved_planned_month: operational.selectedMonth } }
                          const updated = await authApi.updateProfile(payload)
                          setUser(updated)
                          setSaveSuccess('Mês salvo como base')
                        } catch (err: any) {
                          setSaveError(err?.response?.data?.errors?.[0]?.message || 'Erro ao salvar mês')
                        } finally {
                          setSaveBusy(false)
                        }
                      }}
                      className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {saveBusy ? 'Salvando...' : 'Salvar como base'}
                    </button>
                  </div>

                  <div>
                    {saveError && <div className="text-xs text-rose-600">{saveError}</div>}
                    {saveSuccess && <div className="text-xs text-emerald-700">{saveSuccess}</div>}
                  </div>
                </div>

                <div className="pt-2 grid grid-cols-2 gap-3">
                  <WeekdayPicker selected={operational.selectedWeekdays} onChange={operational.setSelectedWeekdays} />
                  <DurationPicker selected={operational.selectedDurations} onChange={operational.setSelectedDurations} />
                </div>
              </section>

              {/* Results */}
              {operational.hasInsufficientInput ? (
                <PlanningInputHint message={operational.inputValidationMessage ?? 'Entrada insuficiente para simulação.'} />
              ) : operational.result ? (
                <>
                  <SimulationResultCards
                    result={operational.result}
                    mode={operational.mode}
                  />

                  <StrategyPanel result={operational.result} />

                  <DistributionList
                    distribution={operational.result.distribution_by_type}
                    serviceTypes={operational.availableTypes}
                  />
                </>
              ) : null}

              {/* Historical reference */}
              <HistoricalSummary data={operational.historical} hasHistoryData={operational.hasHistoryData} />
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default PlanningPage
