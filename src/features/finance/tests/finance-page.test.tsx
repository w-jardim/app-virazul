import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import FinancePage from '@/pages/app/FinancePage'
import type { FinanceSummary, FinanceReport } from '@/features/finance/types/finance.types'

vi.mock('@/features/finance/hooks/useFinanceData', () => ({
  useFinanceSummary: vi.fn(),
  useFinanceReport: vi.fn()
}))

import { useFinanceSummary, useFinanceReport } from '@/features/finance/hooks/useFinanceData'

const mockSummary = vi.mocked(useFinanceSummary)
const mockReport = vi.mocked(useFinanceReport)

const baseSummary: FinanceSummary = {
  total_expected: 945,
  total_received: 630,
  total_pending: 315,
  total_overdue: 0,
  by_status: {
    PAGO: 630,
    NAO_PAGO: 315,
    PREVISTO: 0,
    PAGO_PARCIAL: 0,
  }
}

const emptyReport: FinanceReport = {
  filters: { start_date: null, end_date: null, service_type: null, financial_status: null },
  summary: baseSummary,
  by_service_type: [],
  items: [],
}

function successSummary(data: FinanceSummary) {
  return { isLoading: false, isError: false, data } as unknown as ReturnType<typeof useFinanceSummary>
}

function successReport(data: FinanceReport) {
  return { isLoading: false, isError: false, data } as unknown as ReturnType<typeof useFinanceReport>
}

const loadingState = { isLoading: true, isError: false, data: undefined } as ReturnType<typeof useFinanceSummary>
const errorState = { isLoading: false, isError: true, data: undefined } as ReturnType<typeof useFinanceSummary>

describe('FinancePage', () => {
  beforeEach(() => {
    mockSummary.mockReset()
    mockReport.mockReset()
    mockReport.mockReturnValue(successReport(emptyReport) as unknown as ReturnType<typeof useFinanceReport>)
  })

  it('renders page title', () => {
    mockSummary.mockReturnValue(loadingState)
    render(<FinancePage />)
    expect(screen.getByText('Financeiro')).toBeInTheDocument()
  })

  it('renders loading skeletons', () => {
    mockSummary.mockReturnValue(loadingState)
    render(<FinancePage />)
    const skeletons = document.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('renders error message', () => {
    mockSummary.mockReturnValue(errorState)
    render(<FinancePage />)
    expect(screen.getByText(/Falha ao carregar dados financeiros/i)).toBeInTheDocument()
  })

  it('renders summary cards with values', () => {
    mockSummary.mockReturnValue(successSummary(baseSummary))
    render(<FinancePage />)
    expect(screen.getByText('Resumo financeiro')).toBeInTheDocument()
    expect(screen.getByText('Esperado')).toBeInTheDocument()
    expect(screen.getByText('Recebido')).toBeInTheDocument()
    expect(screen.getByText('Pendente')).toBeInTheDocument()
    expect(screen.getByText('Em atraso')).toBeInTheDocument()
  })

  it('renders pie chart section', () => {
    mockSummary.mockReturnValue(successSummary(baseSummary))
    render(<FinancePage />)
    expect(screen.getByText('Distribuição por status')).toBeInTheDocument()
  })

  it('renders empty by_service_type table gracefully', () => {
    mockSummary.mockReturnValue(successSummary(baseSummary))
    render(<FinancePage />)
    expect(screen.getByText(/Sem registros financeiros/i)).toBeInTheDocument()
  })

  it('renders by_service_type rows when data exists', () => {
    const reportWithRows: FinanceReport = {
      ...emptyReport,
      by_service_type: [{
        service_type: 'ras_voluntary',
        service_type_name: 'RAS Voluntário',
        total_expected: 500,
        total_received: 300,
        total_pending: 200,
        total_overdue: 0,
      }],
    }
    mockSummary.mockReturnValue(successSummary(baseSummary))
    mockReport.mockReturnValue(successReport(reportWithRows) as unknown as ReturnType<typeof useFinanceReport>)
    render(<FinancePage />)
    expect(screen.getByText('RAS Voluntário')).toBeInTheDocument()
  })
})
})
