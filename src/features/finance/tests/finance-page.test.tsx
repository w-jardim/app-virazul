import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import FinancePage from '@/pages/app/FinancePage'
import type { FinanceReport } from '@/features/finance/types/finance.types'

vi.mock('@/features/finance/hooks/useFinanceData', () => ({
  useFinanceReport: vi.fn()
}))

vi.mock('@/features/services/hooks/useServicesData', () => ({
  useServiceDateRange: vi.fn()
}))

import { useFinanceReport } from '@/features/finance/hooks/useFinanceData'
import { useServiceDateRange } from '@/features/services/hooks/useServicesData'

const mockReport = vi.mocked(useFinanceReport)
const mockDateRange = vi.mocked(useServiceDateRange)

const baseReport: FinanceReport = {
  filters: { start_date: '2026-04-01', end_date: '2026-04-16', service_type: null, financial_status: null },
  summary: {
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
  },
  by_service_type: [],
  items: [],
}

function successReport(data: FinanceReport) {
  return { isLoading: false, isError: false, data } as unknown as ReturnType<typeof useFinanceReport>
}

describe('FinancePage', () => {
  beforeEach(() => {
    mockReport.mockReset()
    mockDateRange.mockReset()
    mockDateRange.mockReturnValue({
      isLoading: false,
      isError: false,
      data: { start_date: '2026-04-01', end_date: '2026-04-16' },
    } as never)
    mockReport.mockReturnValue(successReport(baseReport) as never)
  })

  it('renders page title', () => {
    render(<FinancePage />)
    expect(screen.getByText('Financeiro')).toBeInTheDocument()
  })

  it('renders loading skeletons', () => {
    mockDateRange.mockReturnValue({ isLoading: true, isError: false, data: undefined } as never)
    render(<FinancePage />)
    const skeletons = document.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('renders error message', () => {
    mockReport.mockReturnValue({ isLoading: false, isError: true, data: undefined } as never)
    render(<FinancePage />)
    expect(screen.getByText(/Falha ao carregar dados financeiros/i)).toBeInTheDocument()
  })

  it('renders empty state when there are no services', () => {
    mockDateRange.mockReturnValue({
      isLoading: false,
      isError: false,
      data: { start_date: null, end_date: null },
    } as never)
    render(<FinancePage />)
    expect(screen.getByText('Sem serviços cadastrados')).toBeInTheDocument()
  })

  it('renders summary cards with values', () => {
    render(<FinancePage />)
    expect(screen.getByText('Resumo financeiro')).toBeInTheDocument()
    expect(screen.getByText('Esperado')).toBeInTheDocument()
    expect(screen.getByText('Recebido')).toBeInTheDocument()
    expect(screen.getByText('Pendente')).toBeInTheDocument()
    expect(screen.getByText('Em atraso')).toBeInTheDocument()
  })

  it('renders pie chart section', () => {
    render(<FinancePage />)
    expect(screen.getByText(/Distribui/i)).toBeInTheDocument()
  })

  it('passes first-to-last service dates to the finance report', () => {
    render(<FinancePage />)
    expect(mockReport).toHaveBeenCalledWith({
      start_date: '2026-04-01',
      end_date: '2026-04-16',
    })
  })

  it('renders empty by_service_type table gracefully', () => {
    render(<FinancePage />)
    expect(screen.getByText(/Sem registros financeiros/i)).toBeInTheDocument()
  })

  it('renders by_service_type rows when data exists', () => {
    const reportWithRows: FinanceReport = {
      ...baseReport,
      by_service_type: [{
        service_type: 'ras_voluntary',
        service_type_name: 'RAS Volunt\u00e1rio',
        total_expected: 500,
        total_received: 300,
        total_pending: 200,
        total_overdue: 0,
      }],
    }
    mockReport.mockReturnValue(successReport(reportWithRows) as never)
    render(<FinancePage />)
    expect(screen.getByText('RAS Volunt\u00e1rio')).toBeInTheDocument()
  })
})
