import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import InsightsPage from '@/pages/app/InsightsPage'

vi.mock('@/features/insights/hooks/useInsights', () => ({
  useInsights: vi.fn(),
}))

import { useInsights } from '@/features/insights/hooks/useInsights'

const mockUseInsights = vi.mocked(useInsights)

const basePeriod = { month: '2026-04', start_date: '2026-04-01', end_date: '2026-04-11' }

const noFailures = [] as any[]

const loadingState = {
  isLoading: true,
  isAllError: false,
  hasPartialError: false,
  failedSources: noFailures,
  sourceStatuses: [],
  period: basePeriod,
  insights: [],
  byCategory: { alert: [], opportunity: [], recommendation: [], trend: [] },
}

const allErrorState = {
  isLoading: false,
  isAllError: true,
  hasPartialError: false,
  failedSources: [
    { name: 'planning' as const, label: 'Planejamento', isError: true, isLoading: false },
    { name: 'finance' as const, label: 'Financeiro', isError: true, isLoading: false },
    { name: 'operational' as const, label: 'Operacional', isError: true, isLoading: false },
    { name: 'financial_report' as const, label: 'Financeiro (rel.)', isError: true, isLoading: false },
  ],
  sourceStatuses: [],
  period: basePeriod,
  insights: [],
  byCategory: { alert: [], opportunity: [], recommendation: [], trend: [] },
}

const partialErrorState = {
  isLoading: false,
  isAllError: false,
  hasPartialError: true,
  failedSources: [
    { name: 'finance' as const, label: 'Financeiro', isError: true, isLoading: false },
  ],
  sourceStatuses: [],
  period: basePeriod,
  insights: [
    { id: 'a1', category: 'alert' as const, severity: 'warning' as const, title: 'Produtividade abaixo do esperado', description: 'Apenas 10% da meta mensal', metric: '10h / 100h', action: { label: 'Abrir planejamento', to: '/planning' } },
  ],
  byCategory: {
    alert: [{ id: 'a1', category: 'alert' as const, severity: 'warning' as const, title: 'Produtividade abaixo do esperado', description: 'Apenas 10% da meta mensal', metric: '10h / 100h', action: { label: 'Abrir planejamento', to: '/planning' } }],
    opportunity: [],
    recommendation: [],
    trend: [],
  },
}

const emptyState = {
  isLoading: false,
  isAllError: false,
  hasPartialError: false,
  failedSources: noFailures,
  sourceStatuses: [],
  period: basePeriod,
  insights: [],
  byCategory: { alert: [], opportunity: [], recommendation: [], trend: [] },
}

const fullState = {
  isLoading: false,
  isAllError: false,
  hasPartialError: false,
  failedSources: noFailures,
  sourceStatuses: [],
  period: basePeriod,
  insights: [
    { id: 'a1', category: 'alert' as const, severity: 'critical' as const, title: 'Valores financeiros em atraso', description: 'Existem R$ 300 em atraso', metric: 'R$ 300,00', action: { label: 'Revisar financeiro', to: '/finance' } },
    { id: 'o1', category: 'opportunity' as const, severity: 'positive' as const, title: 'Meta quase atingida', description: 'Faltam apenas 20h', metric: '20h restantes', action: { label: 'Abrir planejamento', to: '/planning' } },
    { id: 'r1', category: 'recommendation' as const, severity: 'info' as const, title: 'Combinação ideal de serviços', description: 'Para fechar 20h restantes', metric: '20h', action: { label: 'Abrir planejamento', to: '/planning' } },
    { id: 't1', category: 'trend' as const, severity: 'positive' as const, title: 'Taxa de realização', description: '90% das horas realizadas', metric: '90%' },
  ],
  byCategory: {
    alert: [{ id: 'a1', category: 'alert' as const, severity: 'critical' as const, title: 'Valores financeiros em atraso', description: 'Existem R$ 300 em atraso', metric: 'R$ 300,00', action: { label: 'Revisar financeiro', to: '/finance' } }],
    opportunity: [{ id: 'o1', category: 'opportunity' as const, severity: 'positive' as const, title: 'Meta quase atingida', description: 'Faltam apenas 20h', metric: '20h restantes', action: { label: 'Abrir planejamento', to: '/planning' } }],
    recommendation: [{ id: 'r1', category: 'recommendation' as const, severity: 'info' as const, title: 'Combinação ideal de serviços', description: 'Para fechar 20h restantes', metric: '20h', action: { label: 'Abrir planejamento', to: '/planning' } }],
    trend: [{ id: 't1', category: 'trend' as const, severity: 'positive' as const, title: 'Taxa de realização', description: '90% das horas realizadas', metric: '90%' }],
  },
}

function renderPage() {
  return render(
    <MemoryRouter>
      <InsightsPage />
    </MemoryRouter>,
  )
}

describe('InsightsPage', () => {
  beforeEach(() => {
    mockUseInsights.mockReset()
  })

  it('renders page title and period', () => {
    mockUseInsights.mockReturnValue(loadingState)
    renderPage()
    expect(screen.getByText('Insights')).toBeInTheDocument()
    expect(screen.getByText(/2026-04-01/)).toBeInTheDocument()
  })

  it('renders loading skeletons', () => {
    mockUseInsights.mockReturnValue(loadingState)
    renderPage()
    const skeletons = document.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('renders full error state when all sources fail', () => {
    mockUseInsights.mockReturnValue(allErrorState)
    renderPage()
    expect(screen.getByText(/Falha ao carregar insights/i)).toBeInTheDocument()
  })

  it('renders partial error banner when some sources fail', () => {
    mockUseInsights.mockReturnValue(partialErrorState)
    renderPage()
    expect(screen.getByText(/Financeiro/)).toBeInTheDocument()
    expect(screen.getByText(/dados parciais/)).toBeInTheDocument()
  })

  it('still renders insights alongside partial error banner', () => {
    mockUseInsights.mockReturnValue(partialErrorState)
    renderPage()
    expect(screen.getByText('Produtividade abaixo do esperado')).toBeInTheDocument()
  })

  it('renders empty state when no insights', () => {
    mockUseInsights.mockReturnValue(emptyState)
    renderPage()
    expect(screen.getByText(/Nenhum insight disponível/i)).toBeInTheDocument()
  })

  it('renders all four sections when insights exist', () => {
    mockUseInsights.mockReturnValue(fullState)
    renderPage()
    expect(screen.getByText('Alertas')).toBeInTheDocument()
    expect(screen.getByText('Oportunidades')).toBeInTheDocument()
    expect(screen.getByText('Recomendações')).toBeInTheDocument()
    expect(screen.getByText('Tendências')).toBeInTheDocument()
  })

  it('renders individual insight cards', () => {
    mockUseInsights.mockReturnValue(fullState)
    renderPage()
    expect(screen.getByText('Valores financeiros em atraso')).toBeInTheDocument()
    expect(screen.getByText('Meta quase atingida')).toBeInTheDocument()
    expect(screen.getByText('Combinação ideal de serviços')).toBeInTheDocument()
    expect(screen.getByText('Taxa de realização')).toBeInTheDocument()
  })

  it('renders metric badges on cards', () => {
    mockUseInsights.mockReturnValue(fullState)
    renderPage()
    expect(screen.getByText('R$ 300,00')).toBeInTheDocument()
    expect(screen.getByText('20h restantes')).toBeInTheDocument()
    expect(screen.getByText('90%')).toBeInTheDocument()
  })

  it('renders CTA links on actionable cards', () => {
    mockUseInsights.mockReturnValue(fullState)
    renderPage()
    const links = screen.getAllByRole('link')
    const financeLink = links.find((l) => l.textContent?.includes('Revisar financeiro'))
    const planningLink = links.find((l) => l.textContent?.includes('Abrir planejamento'))
    expect(financeLink).toBeDefined()
    expect(planningLink).toBeDefined()
    expect(financeLink).toHaveAttribute('href', '/finance')
    expect(planningLink).toHaveAttribute('href', '/planning')
  })

  it('renders PT-BR text correctly (no mojibake)', () => {
    mockUseInsights.mockReturnValue(fullState)
    renderPage()
    expect(screen.getByText('Recomendações')).toBeInTheDocument()
    expect(screen.getByText('Tendências')).toBeInTheDocument()
    expect(screen.getByText('Combinação ideal de serviços')).toBeInTheDocument()
    expect(screen.getByText('Taxa de realização')).toBeInTheDocument()
  })
})
