import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import PlanningPage from '@/pages/app/PlanningPage'
import type { PlanningSummary, PlanningSuggestion } from '@/features/planning/types/planning.types'

vi.mock('@/features/planning/hooks/usePlanningData', () => ({
  usePlanningSummary: vi.fn(),
  usePlanningSuggestions: vi.fn(),
}))

vi.mock('@/features/planning/hooks/usePlanningOperational', () => ({
  usePlanningOperational: vi.fn(),
}))

import { usePlanningSummary, usePlanningSuggestions } from '@/features/planning/hooks/usePlanningData'
import { usePlanningOperational } from '@/features/planning/hooks/usePlanningOperational'

const mockSummary = vi.mocked(usePlanningSummary)
const mockSuggestions = vi.mocked(usePlanningSuggestions)
const mockOperational = vi.mocked(usePlanningOperational)

const baseSummary: PlanningSummary = {
  goal: 120,
  confirmed_hours: 36,
  waiting_hours: 12,
  remaining_hours: 84,
  projection: {
    by_duration: { '24': 4, '12': 7, '8': 11, '6': 14 },
    combinations: [
      { items: [{ duration: 12, count: 7 }], total_hours: 84, pending_hours: 0 },
      { items: [{ duration: 24, count: 3 }], total_hours: 72, pending_hours: 12 },
    ],
  },
  preferences: {
    preferred_durations: [12],
    avoided_durations: [],
    preferred_durations_on_days_off: [],
    preferred_durations_on_work_days: [],
    max_single_shift_hours: null,
  },
}

const baseSuggestions: PlanningSuggestion[] = [
  { date: '2026-04-15', suggested_duration: 12, confidence: 0.85, reason: 'compatível com preferências do usuário' },
]

const basePeriod = { month: '2026-04', start_date: '2026-04-01', end_date: '2026-04-11' }

const operationalLoading = {
  mode: 'HOURS' as const,
  setMode: vi.fn(),
  targetHours: 120,
  setTargetHours: vi.fn(),
  targetServices: 15,
  setTargetServices: vi.fn(),
  selectedTypes: [] as string[],
  setSelectedTypes: vi.fn(),
  availableTypes: [],
  historical: {
    avg_hours_per_service: 8,
    avg_income_per_hour: 25,
    avg_services_per_month: 12,
    avg_hours_per_month: 96,
    by_service_type: {},
  },
  result: null,
  currentProgress: null,
  period: basePeriod,
  hasHistoryData: false,
  isLoading: true,
  isAllError: false,
  hasPartialError: false,
  failedSources: [] as any[],
  sourceStatuses: [],
  hasInsufficientInput: false,
  inputValidationMessage: null,
}

const operationalReady = {
  ...operationalLoading,
  isLoading: false,
  availableTypes: [
    { id: 1, key: 'RAS_VOLUNTARIO', name: 'RAS Voluntário', category: 'RAS', allows_reservation: true, counts_in_financial: true },
    { id: 2, key: 'PROEIS', name: 'PROEIS', category: 'PROEIS', allows_reservation: false, counts_in_financial: true },
  ],
  result: {
    required_services: 15,
    estimated_hours: 120,
    estimated_income: 3000,
    distribution_by_type: { RAS_VOLUNTARIO: 9, PROEIS: 6 },
    feasibility: 'HIGH' as const,
  },
  hasHistoryData: true,
}

const operationalAllError = {
  ...operationalLoading,
  isLoading: false,
  isAllError: true,
}

const operationalPartialError = {
  ...operationalReady,
  hasPartialError: true,
  failedSources: [
    { name: 'finance' as const, label: 'Financeiro', isError: true, isLoading: false },
  ],
}

const operationalInsufficientInput = {
  ...operationalReady,
  result: null,
  hasInsufficientInput: true,
  inputValidationMessage: 'Selecione pelo menos um tipo de serviço para simular.',
}

const loadingState = { isLoading: true, isError: false, data: undefined } as ReturnType<typeof usePlanningSummary>
const errorState = { isLoading: false, isError: true, data: undefined } as ReturnType<typeof usePlanningSummary>

function successState<T>(data: T) {
  return { isLoading: false, isError: false, data } as unknown as ReturnType<typeof usePlanningSummary>
}

function renderPage() {
  const user = userEvent.setup()

  return {
    user,
    ...render(
      <MemoryRouter>
        <PlanningPage />
      </MemoryRouter>,
    ),
  }
}

describe('PlanningPage', () => {
  beforeEach(() => {
    mockSummary.mockReset()
    mockSuggestions.mockReset()
    mockOperational.mockReset()
    mockOperational.mockReturnValue(operationalLoading as any)
  })

  it('renders page title and period', () => {
    mockSummary.mockReturnValue(loadingState)
    mockSuggestions.mockReturnValue(loadingState as any)
    renderPage()
    expect(screen.getByText('Planejamento')).toBeInTheDocument()
    expect(screen.getByText(/2026-04-01/)).toBeInTheDocument()
  })

  it('renders both tab buttons', () => {
    mockSummary.mockReturnValue(loadingState)
    mockSuggestions.mockReturnValue(loadingState as any)
    renderPage()
    expect(screen.getByText('Resumo mensal')).toBeInTheDocument()
    expect(screen.getByText('Simulador operacional')).toBeInTheDocument()
  })

  it('renders loading state in summary tab', () => {
    mockSummary.mockReturnValue(loadingState)
    mockSuggestions.mockReturnValue(loadingState as any)
    renderPage()
    const skeletons = document.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('renders error state in summary tab', () => {
    mockSummary.mockReturnValue(errorState)
    mockSuggestions.mockReturnValue(loadingState as any)
    renderPage()
    expect(screen.getByText(/Falha ao carregar planejamento/i)).toBeInTheDocument()
  })

  it('renders summary cards', () => {
    mockSummary.mockReturnValue(successState(baseSummary))
    mockSuggestions.mockReturnValue(successState(baseSuggestions) as any)
    renderPage()
    expect(screen.getAllByText('120h').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('36h')).toBeInTheDocument()
    expect(screen.getAllByText('84h').length).toBeGreaterThanOrEqual(1)
  })

  it('renders simplified projection section for lay users', () => {
    mockSummary.mockReturnValue(successState(baseSummary))
    mockSuggestions.mockReturnValue(successState(baseSuggestions) as any)
    renderPage()
    expect(screen.getByRole('heading', { name: 'Jeitos simples de fechar a meta' })).toBeInTheDocument()
    expect(screen.getByText(/4 plantões de 24h/i)).toBeInTheDocument()
  })

  it('renders combinations with exact and pending outcomes', () => {
    mockSummary.mockReturnValue(successState(baseSummary))
    mockSuggestions.mockReturnValue(successState(baseSuggestions) as any)
    renderPage()
    expect(screen.getByRole('heading', { name: 'Cenários de fechamento do mês' })).toBeInTheDocument()
    expect(screen.getByText(/Fecha o mês em 120h/i)).toBeInTheDocument()
    expect(screen.getByText(/12h pendentes/i)).toBeInTheDocument()
  })

  it('renders suggestions list', () => {
    mockSummary.mockReturnValue(successState(baseSummary))
    mockSuggestions.mockReturnValue(successState(baseSuggestions) as any)
    renderPage()
    expect(screen.getByText(/Sugest/i)).toBeInTheDocument()
    expect(screen.getByText(/compatível com preferências/i)).toBeInTheDocument()
  })

  it('renders empty suggestions when goal is met', () => {
    const metGoal = { ...baseSummary, remaining_hours: 0, projection: { by_duration: {}, combinations: [] } }
    mockSummary.mockReturnValue(successState(metGoal))
    mockSuggestions.mockReturnValue(successState([]) as any)
    renderPage()
    expect(screen.getByText(/Meta já/i)).toBeInTheDocument()
  })

  it('switches to simulator tab', async () => {
    mockSummary.mockReturnValue(successState(baseSummary))
    mockSuggestions.mockReturnValue(successState(baseSuggestions) as any)
    mockOperational.mockReturnValue(operationalReady as any)
    const { user } = renderPage()
    await user.click(screen.getByText('Simulador operacional'))
    expect(screen.getByText('Configurar simulação')).toBeInTheDocument()
  })

  it('renders loading state in simulator tab', async () => {
    mockSummary.mockReturnValue(successState(baseSummary))
    mockSuggestions.mockReturnValue(successState(baseSuggestions) as any)
    mockOperational.mockReturnValue(operationalLoading as any)
    const { user } = renderPage()
    await user.click(screen.getByText('Simulador operacional'))
    const skeletons = document.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('renders all-error state in simulator tab', async () => {
    mockSummary.mockReturnValue(successState(baseSummary))
    mockSuggestions.mockReturnValue(successState(baseSuggestions) as any)
    mockOperational.mockReturnValue(operationalAllError as any)
    const { user } = renderPage()
    await user.click(screen.getByText('Simulador operacional'))
    expect(screen.getByText(/Falha ao carregar dados para simulação/i)).toBeInTheDocument()
  })

  it('renders partial error warning banner', async () => {
    mockSummary.mockReturnValue(successState(baseSummary))
    mockSuggestions.mockReturnValue(successState(baseSuggestions) as any)
    mockOperational.mockReturnValue(operationalPartialError as any)
    const { user } = renderPage()
    await user.click(screen.getByText('Simulador operacional'))
    expect(screen.getByText(/Financeiro/)).toBeInTheDocument()
    expect(screen.getByText(/simulação pode estar incompleta/i)).toBeInTheDocument()
  })

  it('renders mode selector buttons', async () => {
    mockSummary.mockReturnValue(successState(baseSummary))
    mockSuggestions.mockReturnValue(successState(baseSuggestions) as any)
    mockOperational.mockReturnValue(operationalReady as any)
    const { user } = renderPage()
    await user.click(screen.getByText('Simulador operacional'))
    expect(screen.getByText('Por horas')).toBeInTheDocument()
    expect(screen.getByText('Por quantidade')).toBeInTheDocument()
  })

  it('renders service type picker', async () => {
    mockSummary.mockReturnValue(successState(baseSummary))
    mockSuggestions.mockReturnValue(successState(baseSuggestions) as any)
    mockOperational.mockReturnValue(operationalReady as any)
    const { user } = renderPage()
    await user.click(screen.getByText('Simulador operacional'))
    expect(screen.getByText('Tipos de serviço')).toBeInTheDocument()
    expect(screen.getAllByText('RAS Voluntário').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('PROEIS').length).toBeGreaterThanOrEqual(1)
  })

  it('renders simulation results with feasibility badge', async () => {
    mockSummary.mockReturnValue(successState(baseSummary))
    mockSuggestions.mockReturnValue(successState(baseSuggestions) as any)
    mockOperational.mockReturnValue(operationalReady as any)
    const { user } = renderPage()
    await user.click(screen.getByText('Simulador operacional'))
    expect(screen.getByText('Resultado da simulação')).toBeInTheDocument()
    expect(screen.getByText('Alta viabilidade')).toBeInTheDocument()
  })

  it('renders distribution by type', async () => {
    mockSummary.mockReturnValue(successState(baseSummary))
    mockSuggestions.mockReturnValue(successState(baseSuggestions) as any)
    mockOperational.mockReturnValue(operationalReady as any)
    const { user } = renderPage()
    await user.click(screen.getByText('Simulador operacional'))
    expect(screen.getByText('Distribuição por tipo')).toBeInTheDocument()
    expect(screen.getByText(/9 serviço/)).toBeInTheDocument()
    expect(screen.getByText(/6 serviço/)).toBeInTheDocument()
  })

  it('renders historical summary section', async () => {
    mockSummary.mockReturnValue(successState(baseSummary))
    mockSuggestions.mockReturnValue(successState(baseSuggestions) as any)
    mockOperational.mockReturnValue(operationalReady as any)
    const { user } = renderPage()
    await user.click(screen.getByText('Simulador operacional'))
    expect(screen.getByText(/Base histórica/)).toBeInTheDocument()
  })

  it('renders estimated income in simulation results', async () => {
    mockSummary.mockReturnValue(successState(baseSummary))
    mockSuggestions.mockReturnValue(successState(baseSuggestions) as any)
    mockOperational.mockReturnValue(operationalReady as any)
    const { user } = renderPage()
    await user.click(screen.getByText('Simulador operacional'))
    expect(screen.getByText('Receita estimada')).toBeInTheDocument()
  })

  it('renders neutral input hint when simulation input is insufficient', async () => {
    mockSummary.mockReturnValue(successState(baseSummary))
    mockSuggestions.mockReturnValue(successState(baseSuggestions) as any)
    mockOperational.mockReturnValue(operationalInsufficientInput as any)
    const { user } = renderPage()
    await user.click(screen.getByText('Simulador operacional'))
    expect(screen.getByText(/Selecione pelo menos um tipo de serviço/i)).toBeInTheDocument()
  })

  it('does not render NaN when simulation result has invalid numeric fields', async () => {
    mockSummary.mockReturnValue(successState(baseSummary))
    mockSuggestions.mockReturnValue(successState(baseSuggestions) as any)
    mockOperational.mockReturnValue({
      ...operationalReady,
      result: {
        required_services: Number.NaN,
        estimated_hours: Number.NaN,
        estimated_income: Number.NaN,
        distribution_by_type: { RAS_VOLUNTARIO: Number.NaN, PROEIS: 2 },
        feasibility: 'MEDIUM',
      },
    } as any)

    const { user } = renderPage()
    await user.click(screen.getByText('Simulador operacional'))

    expect(screen.queryByText(/NaN/)).not.toBeInTheDocument()
    expect(screen.getByText('R$ 0,00')).toBeInTheDocument()
  })
})
