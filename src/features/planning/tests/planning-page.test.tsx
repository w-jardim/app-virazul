import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import PlanningPage from '@/pages/app/PlanningPage'
import type { PlanningSummary, PlanningSuggestion } from '@/features/planning/types/planning.types'

vi.mock('@/features/planning/hooks/usePlanningData', () => ({
  usePlanningSummary: vi.fn(),
  usePlanningSuggestions: vi.fn()
}))

import { usePlanningSummary, usePlanningSuggestions } from '@/features/planning/hooks/usePlanningData'

const mockSummary = vi.mocked(usePlanningSummary)
const mockSuggestions = vi.mocked(usePlanningSuggestions)

const baseSummary: PlanningSummary = {
  goal: 120,
  confirmed_hours: 36,
  waiting_hours: 12,
  remaining_hours: 84,
  projection: {
    by_duration: { '12': 7, '8': 11 },
    combinations: [
      { items: [{ duration: 12, count: 7 }], total_hours: 84 }
    ]
  },
  preferences: {
    preferred_durations: [12],
    avoided_durations: [],
    preferred_durations_on_days_off: [],
    preferred_durations_on_work_days: [],
    max_single_shift_hours: null
  }
}

const baseSuggestions: PlanningSuggestion[] = [
  {
    date: '2026-04-15',
    suggested_duration: 12,
    confidence: 0.85,
    reason: 'compatível com preferências do usuário'
  }
]

const loadingState = { isLoading: true, isError: false, data: undefined } as ReturnType<typeof usePlanningSummary>
const errorState = { isLoading: false, isError: true, data: undefined } as ReturnType<typeof usePlanningSummary>

function successState<T>(data: T) {
  return { isLoading: false, isError: false, data } as unknown as ReturnType<typeof usePlanningSummary>
}

describe('PlanningPage', () => {
  beforeEach(() => {
    mockSummary.mockReset()
    mockSuggestions.mockReset()
  })

  it('renders loading state', () => {
    mockSummary.mockReturnValue(loadingState)
    mockSuggestions.mockReturnValue(loadingState as unknown as ReturnType<typeof usePlanningSuggestions>)
    render(<PlanningPage />)
    expect(screen.getByText('Planejamento')).toBeInTheDocument()
  })

  it('renders error state', () => {
    mockSummary.mockReturnValue(errorState)
    mockSuggestions.mockReturnValue(loadingState as unknown as ReturnType<typeof usePlanningSuggestions>)
    render(<PlanningPage />)
    expect(screen.getByText(/Falha ao carregar/i)).toBeInTheDocument()
  })

  it('renders summary cards', () => {
    mockSummary.mockReturnValue(successState(baseSummary))
    mockSuggestions.mockReturnValue(successState(baseSuggestions) as unknown as ReturnType<typeof usePlanningSuggestions>)
    render(<PlanningPage />)
    expect(screen.getByText('120h')).toBeInTheDocument()   // goal
    expect(screen.getByText('36h')).toBeInTheDocument()    // confirmed
    expect(screen.getByText('84h')).toBeInTheDocument()    // remaining
  })

  it('renders projection chart section', () => {
    mockSummary.mockReturnValue(successState(baseSummary))
    mockSuggestions.mockReturnValue(successState(baseSuggestions) as unknown as ReturnType<typeof usePlanningSuggestions>)
    render(<PlanningPage />)
    expect(screen.getByText('Projeção por duração')).toBeInTheDocument()
  })

  it('renders combinations section', () => {
    mockSummary.mockReturnValue(successState(baseSummary))
    mockSuggestions.mockReturnValue(successState(baseSuggestions) as unknown as ReturnType<typeof usePlanningSuggestions>)
    render(<PlanningPage />)
    expect(screen.getByText('Combinações possíveis')).toBeInTheDocument()
  })

  it('renders suggestions list', () => {
    mockSummary.mockReturnValue(successState(baseSummary))
    mockSuggestions.mockReturnValue(successState(baseSuggestions) as unknown as ReturnType<typeof usePlanningSuggestions>)
    render(<PlanningPage />)
    expect(screen.getByText('Sugestões do sistema')).toBeInTheDocument()
    expect(screen.getByText(/compatível com preferências/i)).toBeInTheDocument()
  })

  it('renders empty suggestions when goal is met', () => {
    const metGoal = { ...baseSummary, remaining_hours: 0 }
    mockSummary.mockReturnValue(successState(metGoal))
    mockSuggestions.mockReturnValue(successState([]) as unknown as ReturnType<typeof usePlanningSuggestions>)
    render(<PlanningPage />)
    expect(screen.getByText(/Meta já alcançada/i)).toBeInTheDocument()
  })
})
