import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import OperationPage from '@/pages/app/OperationPage'

vi.mock('@/pages/app/AgendaPage', () => ({
  default: () => <div data-testid="agenda-content">Agenda content</div>
}))

vi.mock('@/pages/app/ServicesPage', () => ({
  default: () => <div data-testid="services-content">Services content</div>
}))

describe('OperationPage', () => {
  it('starts on Agenda tab and switches to Services tab', async () => {
    const user = userEvent.setup()
    render(<OperationPage />)

    expect(screen.getByTestId('agenda-content')).toBeInTheDocument()
    expect(screen.queryByTestId('services-content')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Serviços' }))

    expect(screen.getByTestId('services-content')).toBeInTheDocument()
    expect(screen.queryByTestId('agenda-content')).not.toBeInTheDocument()
  })
})
