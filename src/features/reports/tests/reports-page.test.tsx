import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import ReportsPage from '@/pages/app/ReportsPage'
import type { OperationalReport, FinancialReport } from '@/features/reports/types/reports.types'

vi.mock('@/features/reports/hooks/useReportsData', () => ({
  useOperationalReport: vi.fn(),
  useFinancialReport: vi.fn()
}))

vi.mock('@/features/services/hooks/useServicesData', () => ({
  useServiceTypes: vi.fn().mockReturnValue({ data: [], isLoading: false, isError: false })
}))

import { useOperationalReport, useFinancialReport } from '@/features/reports/hooks/useReportsData'

const mockOperational = vi.mocked(useOperationalReport)
const mockFinancial = vi.mocked(useFinancialReport)

const baseOperational: OperationalReport = {
  summary: {
    total_services: 12,
    confirmed_hours: 18,
    realized_hours: 10,
    waiting_hours: 4,
  },
  by_operational_status: { TITULAR: 8, RESERVA: 4 },
  reservation_metrics: {
    total_reservations: 5,
    converted_reservations: 3,
    non_converted_reservations: 2,
    conversion_rate: 60
  }
}

const baseFinancial: FinancialReport = {
  summary: {
    total_expected: 2400,
    total_received: 1200,
    total_pending: 900,
    total_overdue: 300,
    received_percentage: 50,
    pending_percentage: 37.5,
    top_service_type: 'ras_voluntary',
  },
  by_financial_status: { PAGO: 1200, NAO_PAGO: 900, PREVISTO: 300 },
  by_service_type: { ras_voluntary: 1500, proeis: 900 }
}

function successOp(data: OperationalReport) {
  return { isLoading: false, isError: false, data } as unknown as ReturnType<typeof useOperationalReport>
}

function successFin(data: FinancialReport) {
  return { isLoading: false, isError: false, data } as unknown as ReturnType<typeof useFinancialReport>
}

const loadingOp = { isLoading: true, isError: false, data: undefined } as ReturnType<typeof useOperationalReport>
const errorOp = { isLoading: false, isError: true, data: undefined } as ReturnType<typeof useOperationalReport>
const loadingFin = { isLoading: true, isError: false, data: undefined } as ReturnType<typeof useFinancialReport>
const errorFin = { isLoading: false, isError: true, data: undefined } as ReturnType<typeof useFinancialReport>

describe('ReportsPage', () => {
  beforeEach(() => {
    mockOperational.mockReset()
    mockFinancial.mockReset()
  })

  it('renders page title', () => {
    mockOperational.mockReturnValue(loadingOp)
    mockFinancial.mockReturnValue(loadingFin)
    render(<ReportsPage />)
    expect(screen.getByText('Relatórios')).toBeInTheDocument()
  })

  it('renders base filters', () => {
    mockOperational.mockReturnValue(loadingOp)
    mockFinancial.mockReturnValue(loadingFin)
    render(<ReportsPage />)
    const dateInputs = document.querySelectorAll('input[type="date"]')
    expect(dateInputs.length).toBe(2)
    expect(screen.getByText('Tipo de serviço')).toBeInTheDocument()
  })

  it('renders loading skeletons while any query is loading', () => {
    mockOperational.mockReturnValue(loadingOp)
    mockFinancial.mockReturnValue(successFin(baseFinancial))
    render(<ReportsPage />)
    const skeletons = document.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('renders generic error when operational report fails', () => {
    mockOperational.mockReturnValue(errorOp)
    mockFinancial.mockReturnValue(successFin(baseFinancial))
    render(<ReportsPage />)
    expect(screen.getByText('Falha ao carregar relatórios')).toBeInTheDocument()
  })

  it('renders generic error when financial report fails', () => {
    mockOperational.mockReturnValue(successOp(baseOperational))
    mockFinancial.mockReturnValue(errorFin)
    render(<ReportsPage />)
    expect(screen.getByText('Falha ao carregar relatórios')).toBeInTheDocument()
  })

  it('renders summary cards and charts when both reports load', () => {
    mockOperational.mockReturnValue(successOp(baseOperational))
    mockFinancial.mockReturnValue(successFin(baseFinancial))
    render(<ReportsPage />)
    expect(screen.getByText('Serviços')).toBeInTheDocument()
    expect(screen.getByText('Horas confirmadas')).toBeInTheDocument()
    expect(screen.getByText('Serviços por situação')).toBeInTheDocument()
    expect(screen.getByText('Situação financeira')).toBeInTheDocument()
  })

  it('renders reservation metrics block', () => {
    mockOperational.mockReturnValue(successOp(baseOperational))
    mockFinancial.mockReturnValue(successFin(baseFinancial))
    render(<ReportsPage />)
    expect(screen.getByText('Reservas')).toBeInTheDocument()
    expect(screen.getByText('Taxa de conversão')).toBeInTheDocument()
  })

  it('renders empty operational chart state gracefully', () => {
    const emptyOp: OperationalReport = {
      ...baseOperational,
      by_operational_status: {}
    }
    mockOperational.mockReturnValue(successOp(emptyOp))
    mockFinancial.mockReturnValue(successFin(baseFinancial))
    render(<ReportsPage />)
    expect(screen.getByText('Nenhum serviço registrado no período.')).toBeInTheDocument()
  })

  it('does not render service type breakdown when empty', () => {
    const emptyFin: FinancialReport = {
      ...baseFinancial,
      by_service_type: {}
    }
    mockOperational.mockReturnValue(successOp(baseOperational))
    mockFinancial.mockReturnValue(successFin(emptyFin))
    render(<ReportsPage />)
    expect(screen.queryByText('Receita por tipo de serviço')).not.toBeInTheDocument()
  })
})
