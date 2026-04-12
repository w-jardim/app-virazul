import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import AgendaPage from '@/pages/app/AgendaPage'

let dayError = false

vi.mock('@/features/agenda/hooks/useAgendaData', () => ({
  getDateKey: () => '2026-04-11',
  getMonthKey: () => '2026-04',
  formatTime: () => '09:00',
  useAgendaDay: vi.fn(() => ({
    isLoading: false,
    isError: dayError,
    data: {
      date: '2026-04-11',
      confirmed: [
        {
          id: 10,
          service_type_name: 'RAS Voluntário',
          service_type_key: 'ras_voluntary',
          start_at: '2026-04-11T12:00:00.000Z',
          duration_hours: 12,
          operational_status: 'TITULAR',
          financial_status: 'PREVISTO',
          user_id: 1,
          service_type_id: 2
        }
      ],
      reservations: []
    }
  })),
  useAgendaWeek: vi.fn(() => ({
    isLoading: false,
    isError: false,
    data: {
      start: '2026-04-11',
      end: '2026-04-17',
      days: [
        {
          date: '2026-04-12',
          confirmed: [],
          reservations: [
            {
              id: 11,
              service_type_name: 'PROEIS',
              service_type_key: 'proeis',
              start_at: '2026-04-12T18:00:00.000Z',
              duration_hours: 8,
              operational_status: 'RESERVA',
              financial_status: 'PREVISTO',
              user_id: 1,
              service_type_id: 3
            }
          ]
        }
      ]
    }
  })),
  useAgendaMonth: vi.fn(() => ({
    isLoading: false,
    isError: false,
    data: {
      month: '2026-04',
      days: []
    }
  }))
}))

describe('AgendaPage', () => {
  const renderPage = () =>
    render(
      <MemoryRouter>
        <AgendaPage />
      </MemoryRouter>
    )

  beforeEach(() => {
    dayError = false
  })

  it('renderiza erro quando consulta falha', () => {
    dayError = true
    renderPage()
    expect(screen.getByText('Falha ao carregar agenda')).toBeInTheDocument()
  })

  it('renderiza agenda diária', () => {
    renderPage()

    expect(screen.getByTestId('agenda-page')).toBeInTheDocument()
    expect(screen.getByText('Agenda operacional')).toBeInTheDocument()
    expect(screen.getByText('RAS Voluntário')).toBeInTheDocument()
  })

  it('renderiza agenda semanal ao trocar modo', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: 'Semana' }))

    expect(screen.getByText('PROEIS')).toBeInTheDocument()
  })

  it('renderiza empty state no modo mensal', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: 'Mês' }))

    expect(screen.getByText('Sem serviços no mês selecionado.')).toBeInTheDocument()
  })
})
