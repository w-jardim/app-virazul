import React, { useContext, useState } from 'react'
import { QueryClientContext } from '@tanstack/react-query'
import { usePlanningSummary, usePlanningSuggestions } from '@/features/planning/hooks/usePlanningData'
import { usePlanningOperational } from '@/features/planning/hooks/usePlanningOperational'
import { useAuthStore } from '@/features/auth/store/useAuthStore'
import { authApi } from '@/features/auth/api/auth.api'
import {
  PlanningHoursProgress,
  PlanningProjectionChart,
  PlanningCombinations,
  PlanningSuggestionsList,
} from '@/features/planning/components/PlanningComponents'
import {
  PlanModeSelector,
  ServiceTypePicker,
  PlanTargetInput,
  SimulationResultCards,
  CalendarDayPicker,
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

  const summaryQuery = usePlanningSummary()
  const suggestionsQuery = usePlanningSuggestions()

  const operational = usePlanningOperational()
  const queryClient = useContext(QueryClientContext)
  const setUser = useAuthStore((s) => s.setUser)
  const [saveBusy, setSaveBusy] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null)
  const [goalSaveBusy, setGoalSaveBusy] = useState(false)

  async function handleChangeGoal(newGoal: number) {
    setGoalSaveBusy(true)
    try {
      await authApi.updateProfile({ monthly_hour_goal: newGoal })
      await queryClient?.invalidateQueries({ queryKey: ['planning', 'summary'] })
    } catch (err: any) {
      throw new Error(err?.response?.data?.errors?.[0]?.message || 'Erro ao salvar meta')
    } finally {
      setGoalSaveBusy(false)
    }
  }

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">Planejamento</h1>
        <p className="text-sm text-slate-600">Meta mensal, projeções, simulação e planejamento operacional.</p>
        <p className="mt-1 text-xs text-slate-400">
          Período: {operational.period.start_date} a {operational.period.end_date}
        </p>
      </header>

      <nav className="flex gap-1 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setTab('summary')}
          className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition ${
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
          className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition ${
            tab === 'simulator'
              ? 'border-sky-600 text-sky-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Simulador operacional
        </button>
      </nav>

      {tab === 'summary' && (
        <>
          {summaryQuery.isLoading ? (
            <PageLoadingState />
          ) : summaryQuery.isError || !summaryQuery.data ? (
            <PageErrorState title="Falha ao carregar planejamento" description="Tente novamente em instantes." />
          ) : (
            <div className="space-y-4">
              <PlanningHoursProgress summary={summaryQuery.data} onChangeGoal={handleChangeGoal} />
              <PlanningProjectionChart summary={summaryQuery.data} />
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
                <PlanningWarningBanner sources={operational.failedSources ?? []} />
              )}

              <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-base font-semibold text-slate-900">Configurar simulação</h3>

                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="space-y-4">
                    <PlanModeSelector mode={operational.mode} onChangeMode={operational.setMode} />

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

                    <div className="grid grid-cols-3 items-end gap-3">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-slate-600">Mês planejado</label>
                        <input
                          type="month"
                          value={operational.selectedMonth ?? ''}
                          onChange={(e) => operational.setSelectedMonth(e.target.value || null)}
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-medium text-slate-600">Salvar mês</label>
                        <button
                          type="button"
                          disabled={!operational.selectedMonth || saveBusy || goalSaveBusy}
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
                  </div>

                  <div className="space-y-4">
                    <DurationPicker
                      selected={operational.selectedDurations ?? []}
                      onChange={operational.setSelectedDurations}
                    />
                    <CalendarDayPicker
                      month={operational.selectedMonth ?? null}
                      selectedDates={operational.selectedDates ?? []}
                      selectedDateHours={operational.selectedDateHours ?? {}}
                      preferredDurations={operational.durationOptions ?? operational.selectedDurations ?? []}
                      baseWorkDays={Object.keys(operational.ordinaryScheduleMap ?? {})}
                      onChange={operational.setSelectedDates ?? (() => undefined)}
                      onChangeDateHours={operational.setSelectedDateHours ?? (() => undefined)}
                    />
                  </div>
                </div>
              </section>

              {operational.hasInsufficientInput ? (
                <PlanningInputHint message={operational.inputValidationMessage ?? 'Entrada insuficiente para simulação.'} />
              ) : operational.result ? (
                <>
                  <SimulationResultCards result={operational.result} mode={operational.mode} />
                  <DistributionList
                    distribution={operational.result.distribution_by_type}
                    serviceTypes={operational.availableTypes}
                  />
                </>
              ) : null}

              <HistoricalSummary data={operational.historical} hasHistoryData={operational.hasHistoryData} />
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default PlanningPage
