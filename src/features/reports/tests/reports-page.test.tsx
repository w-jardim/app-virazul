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
    expect(screen.getByText('Relat\u00f3rios')).toBeInTheDocument()
  })

  it('renders date and extra filter inputs', () => {
    mockOperational.mockReturnValue(loadingOp)
    mockFinancial.mockReturnValue(loadingFin)
    render(<ReportsPage />)
    const dateInputs = document.querySelectorAll('input[type="date"]')
    expect(dateInputs.length).toBe(2)
    expect(screen.getByText('Tipo de servi\u00e7o')).toBeInTheDocument()
    expect(screen.getByText('Situa\u00e7\u00e3o operacional')).toBeInTheDocument()
    expect(screen.getByText('Situa\u00e7\u00e3o financeira')).toBeInTheDocument()
  })

  it('renders loading skeletons for both sections', () => {
    mockOperational.mockReturnValue(loadingOp)
    mockFinancial.mockReturnValue(loadingFin)
    render(<ReportsPage />)
    const skeletons = document.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('renders operational error message', () => {
    mockOperational.mockReturnValue(errorOp)
    mockFinancial.mockReturnValue(loadingFin)
    render(<ReportsPage />)
    expect(screen.getByText(/Falha ao carregar relat\u00f3rio operacional/i)).toBeInTheDocument()
  })

  it('renders financial error message', () => {
    mockOperational.mockReturnValue(successOp(baseOperational))
    mockFinancial.mockReturnValue(errorFin)
    render(<ReportsPage />)
    expect(screen.getByText(/Falha ao carregar relat\u00f3rio financeiro/i)).toBeInTheDocument()
  })

  it('renders operational summary from nested shape', () => {
    mockOperational.mockReturnValue(successOp(baseOperational))
    mockFinancial.mockReturnValue(loadingFin)
    render(<ReportsPage />)
    expect(screen.getByText('Total de servi\u00e7os')).toBeInTheDocument()
    expect(screen.getByText('Horas confirmadas')).toBeInTheDocument()
  })

  it('renders reservation metrics block', () => {
    mockOperational.mockReturnValue(successOp(baseOperational))
    mockFinancial.mockReturnValue(loadingFin)
    render(<ReportsPage />)
    expect(screen.getByText('M\u00e9tricas de reserva')).toBeInTheDocument()
  })

  it('renders financial summary from nested shape', () => {
    mockOperational.mockReturnValue(loadingOp)
    mockFinancial.mockReturnValue(successFin(baseFinancial))
    render(<ReportsPage />)
    expect(screen.getByText('Total esperado')).toBeInTheDocument()
    expect(screen.getByText('Total recebido')).toBeInTheDocument()
  })

  it('renders received percentage', () => {
    mockOperational.mockReturnValue(loadingOp)
    mockFinancial.mockReturnValue(successFin(baseFinancial))
    render(<ReportsPage />)
    expect(screen.getByText(/% recebido/i)).toBeInTheDocument()
  })

  it('renders empty operational chart gracefully', () => {
    const emptyOp: OperationalReport = {
      ...baseOperational,
      by_operational_status: {}
    }
    mockOperational.mockReturnValue(successOp(emptyOp))
    mockFinancial.mockReturnValue(loadingFin)
    render(<ReportsPage />)
    expect(screen.getByText(/Nenhum servi\u00e7o com situa\u00e7\u00e3o operacional/i)).toBeInTheDocument()
  })

  it('renders empty financial by_service_type gracefully', () => {
    const emptyFin: FinancialReport = {
      ...baseFinancial,
      by_service_type: {}
    }
    mockOperational.mockReturnValue(loadingOp)
    mockFinancial.mockReturnValue(successFin(emptyFin))
    render(<ReportsPage />)
    expect(screen.getByText(/Nenhum valor registrado por tipo de servi\u00e7o/i)).toBeInTheDocument()
  })
})
