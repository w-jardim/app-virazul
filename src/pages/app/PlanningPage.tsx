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
  SimulationResultCards,
  CalendarDayPicker,
  DurationPicker,
  HistoricalSummary,
  PlanningWarningBanner,
  PlanningBalanceCard,
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
  async function handleChangeGoal(newGoal: number) {
    try {
      await authApi.updateProfile({ monthly_hour_goal: newGoal })
      await queryClient?.invalidateQueries({ queryKey: ['planning', 'summary'] })
    } catch (err: any) {
      throw new Error(err?.response?.data?.errors?.[0]?.message || 'Erro ao salvar meta')
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
              ? 'border-blue-700 text-blue-800'
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
              ? 'border-blue-700 text-blue-800'
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

              {/* 1. Saldo disponível */}
              {operational.currentProgress && (
                <PlanningBalanceCard
                  goal={operational.currentProgress.goal}
                  confirmedHours={operational.currentProgress.confirmed_hours}
                  waitingHours={operational.currentProgress.waiting_hours}
                  remainingHours={operational.currentProgress.remaining_hours}
                />
              )}

              {/* 2. Monte seu plano */}
              <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-end gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600">Mês planejado</label>
                    <input
                      type="month"
                      value={operational.selectedMonth ?? ''}
                      onChange={(e) => operational.setSelectedMonth(e.target.value || null)}
                      className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <button
                    type="button"
                    disabled={!operational.selectedMonth || saveBusy}
                    onClick={async () => {
                      if (!operational.selectedMonth) return
                      setSaveBusy(true)
                      setSaveError(null)
                      setSaveSuccess(null)
                      try {
                        const updated = await authApi.updateProfile({
                          planning_preferences: {
                            saved_planned_month: operational.selectedMonth,
                            saved_selected_dates: operational.selectedDates,
                            saved_selected_date_hours: operational.selectedDateHours,
                          },
                        } as any)
                        setUser(updated)
                        setSaveSuccess('Mês salvo como base')
                      } catch (err: any) {
                        setSaveError(err?.response?.data?.errors?.[0]?.message || 'Erro ao salvar mês')
                      } finally {
                        setSaveBusy(false)
                      }
                    }}
                    className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-50"
                  >
                    {saveBusy ? 'Salvando...' : 'Salvar como base'}
                  </button>
                  {saveError && <span className="text-xs text-rose-600">{saveError}</span>}
                  {saveSuccess && <span className="text-xs text-emerald-700">{saveSuccess}</span>}
                </div>

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
              </section>

              {/* 3. Projeção (somente quando dias selecionados) */}
              {!operational.hasInsufficientInput && operational.selectedDates.length > 0 && operational.result && (
                <SimulationResultCards
                  result={operational.result}
                  goal={operational.currentProgress?.goal}
                />
              )}

              {/* 4. Histórico */}
              <HistoricalSummary data={operational.historical} hasHistoryData={operational.hasHistoryData} />
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default PlanningPage
