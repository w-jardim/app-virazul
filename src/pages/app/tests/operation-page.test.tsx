import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import OperationPage from '@/pages/app/OperationPage'

vi.mock('@/features/agenda/components/OperationCalendar', () => ({
  default: () => <div data-testid="calendar-content">Calendar content</div>,
}))

vi.mock('@/pages/app/AgendaPage', () => ({
  default: () => <div data-testid="agenda-content">Agenda content</div>,
}))

vi.mock('@/pages/app/ServicesPage', () => ({
  default: () => <div data-testid="services-content">Services content</div>,
}))

describe('OperationPage', () => {
  it('starts on Calendar tab and switches to Services tab', async () => {
    const user = userEvent.setup()
    render(<OperationPage />)

    expect(screen.getByTestId('calendar-content')).toBeInTheDocument()
    expect(screen.queryByTestId('services-content')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Serv/i }))

    expect(screen.getByTestId('services-content')).toBeInTheDocument()
    expect(screen.queryByTestId('calendar-content')).not.toBeInTheDocument()
  })
})


