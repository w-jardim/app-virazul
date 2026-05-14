import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AdminUsersPage, {
  formatAdminDueDate,
  getAdminPaymentBadgeLabel,
  isBillingExemptAdminUser,
  shouldSendPaymentFields,
} from '@/pages/admin/AdminUsersPage'
import type { AdminUser } from '@/features/admin/types/admin.types'

const createUserMutateAsync = vi.fn()
const updateUserMutateAsync = vi.fn()
const deleteUserMutateAsync = vi.fn()

const baseUsers: AdminUser[] = [
  {
    id: 1,
    name: 'Usuario Pago',
    email: 'pago@virazul.com',
    role: 'POLICE',
    status: 'active',
    subscription: 'plan_starter',
    payment_status: 'paid',
    payment_due_date: '2026-05-20',
    rank_group: 'CABO_SOLDADO',
    created_at: '2026-05-01T00:00:00.000Z',
  },
]

vi.mock('@/features/admin/hooks/useAdmin', () => ({
  useAdminUsers: () => ({
    data: baseUsers,
    isLoading: false,
    isError: false,
  }),
  useCreateUser: () => ({
    mutateAsync: createUserMutateAsync,
    isPending: false,
  }),
  useUpdateUser: () => ({
    mutateAsync: updateUserMutateAsync,
    isPending: false,
  }),
  useDeleteUser: () => ({
    mutateAsync: deleteUserMutateAsync,
    isPending: false,
  }),
}))

function getModal() {
  const heading = screen.getByRole('heading', { name: 'Novo usuario' })
  const modal = heading.parentElement?.parentElement
  if (!modal) {
    throw new Error('Modal de usuario nao encontrado')
  }
  return modal
}

function getFieldContainer(label: string) {
  const fieldLabel = within(getModal()).getByText(label, { selector: 'label' })
  const container = fieldLabel.parentElement
  if (!container) {
    throw new Error(`Campo "${label}" nao encontrado`)
  }
  return container
}

function getSelect(label: string) {
  const select = getFieldContainer(label).querySelector('select')
  if (!(select instanceof HTMLSelectElement)) {
    throw new Error(`Select "${label}" nao encontrado`)
  }
  return select
}

function getDateInput(label: string) {
  const input = getFieldContainer(label).querySelector('input[type="date"]')
  if (!(input instanceof HTMLInputElement)) {
    throw new Error(`Input de data "${label}" nao encontrado`)
  }
  return input
}

async function fillRequiredCreateFields(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByPlaceholderText('Nome completo'), 'Novo Usuario')
  await user.type(screen.getByPlaceholderText('email@exemplo.com'), 'novo@virazul.com')
  await user.type(screen.getByPlaceholderText('Senha'), 'senha-segura')
}

describe('AdminUsersPage billing behavior', () => {
  beforeEach(() => {
    createUserMutateAsync.mockReset()
    updateUserMutateAsync.mockReset()
    deleteUserMutateAsync.mockReset()
    createUserMutateAsync.mockResolvedValue({})
    updateUserMutateAsync.mockResolvedValue({})
    deleteUserMutateAsync.mockResolvedValue({})
    Object.assign(baseUsers[0], {
      id: 1,
      name: 'Usuario Pago',
      email: 'pago@virazul.com',
      role: 'POLICE',
      status: 'active',
      subscription: 'plan_starter',
      payment_status: 'paid',
      payment_due_date: '2026-05-20',
      payment_state: undefined,
      partner_active: undefined,
      entitlements: undefined,
      rank_group: 'CABO_SOLDADO',
      created_at: '2026-05-01T00:00:00.000Z',
    } satisfies AdminUser)
  })

  it('mantem a classificacao de isencao de cobranca', () => {
    expect(isBillingExemptAdminUser({ subscription: 'plan_free', role: 'POLICE' })).toBe(true)
    expect(isBillingExemptAdminUser({ subscription: 'plan_partner', role: 'POLICE' })).toBe(true)
    expect(isBillingExemptAdminUser({ subscription: 'plan_starter', role: 'ADMIN_MASTER' })).toBe(true)
    expect(isBillingExemptAdminUser({ subscription: 'plan_pro', role: 'POLICE' })).toBe(false)

    expect(shouldSendPaymentFields({ subscription: 'plan_free', role: 'POLICE' })).toBe(false)
    expect(shouldSendPaymentFields({ subscription: 'plan_partner', role: 'POLICE' })).toBe(false)
    expect(shouldSendPaymentFields({ subscription: 'plan_starter', role: 'ADMIN_MASTER' })).toBe(false)
    expect(shouldSendPaymentFields({ subscription: 'plan_starter', role: 'POLICE' })).toBe(true)
  })

  it('mantem a formatacao de vencimento para usuarios isentos e pagos', () => {
    expect(
      formatAdminDueDate({
        ...baseUsers[0],
        subscription: 'plan_partner',
        payment_due_date: '2026-05-20',
      })
    ).toBe('—')

    expect(
      formatAdminDueDate({
        ...baseUsers[0],
        subscription: 'plan_starter',
        payment_due_date: '2026-05-20',
      })
    ).toBe(new Date('2026-05-20').toLocaleDateString('pt-BR'))

    expect(
      formatAdminDueDate({
        ...baseUsers[0],
        subscription: 'plan_pro',
        payment_due_date: null,
      })
    ).toBe('—')
  })

  it('prefere payment_state e partner_active para exibir cobranca quando disponiveis', () => {
    expect(
      formatAdminDueDate({
        ...baseUsers[0],
        subscription: 'plan_starter',
        payment_status: 'paid',
        payment_due_date: '2026-05-20',
        payment_state: 'payment_exempt',
        partner_active: true,
      })
    ).toBe('—')

    expect(
      getAdminPaymentBadgeLabel({
        ...baseUsers[0],
        subscription: 'plan_starter',
        payment_status: 'paid',
        payment_due_date: '2026-05-20',
        payment_state: 'payment_pending',
        partner_active: false,
      })
    ).toBe('Pendente')

    expect(
      getAdminPaymentBadgeLabel({
        ...baseUsers[0],
        subscription: 'plan_starter',
        payment_status: 'paid',
        payment_due_date: '2026-05-20',
        payment_state: 'payment_blocked',
        partner_active: false,
      })
    ).toBe('Atrasado')
  })

  it('omite campos de cobranca ao criar usuario free', async () => {
    const user = userEvent.setup()
    render(<AdminUsersPage />)

    await user.click(screen.getByRole('button', { name: 'Novo usuario' }))
    const modal = getModal()
    expect(within(modal).getByText('Plano de cortesia sem cobranca.')).toBeInTheDocument()
    expect(within(modal).queryByText('Status de pagamento')).not.toBeInTheDocument()
    expect(within(modal).queryByText('Vencimento')).not.toBeInTheDocument()

    await fillRequiredCreateFields(user)
    await user.click(screen.getByRole('button', { name: 'Criar usuario' }))
    await waitFor(() => expect(screen.queryByRole('heading', { name: 'Novo usuario' })).not.toBeInTheDocument())

    expect(createUserMutateAsync).toHaveBeenCalledWith({
      name: 'Novo Usuario',
      email: 'novo@virazul.com',
      password: 'senha-segura',
      role: 'POLICE',
      status: 'active',
      subscription: 'plan_free',
      payment_status: undefined,
      payment_due_date: undefined,
      rank_group: undefined,
    })
  })

  it('envia campos de cobranca ao criar usuario pago', async () => {
    const user = userEvent.setup()
    render(<AdminUsersPage />)

    await user.click(screen.getByRole('button', { name: 'Novo usuario' }))
    await fillRequiredCreateFields(user)

    await user.selectOptions(getSelect('Plano'), 'plan_starter')

    const paymentStatusSelect = getSelect('Status de pagamento')
    const dueDateInput = getDateInput('Vencimento')

    await user.selectOptions(paymentStatusSelect, 'overdue')
    await user.type(dueDateInput, '2026-05-25')
    await user.click(screen.getByRole('button', { name: 'Criar usuario' }))
    await waitFor(() => expect(screen.queryByRole('heading', { name: 'Novo usuario' })).not.toBeInTheDocument())

    expect(createUserMutateAsync).toHaveBeenCalledWith({
      name: 'Novo Usuario',
      email: 'novo@virazul.com',
      password: 'senha-segura',
      role: 'POLICE',
      status: 'active',
      subscription: 'plan_starter',
      payment_status: 'overdue',
      payment_due_date: '2026-05-25',
      rank_group: undefined,
    })
  })

  it('oculta cobranca para administrador master', async () => {
    const user = userEvent.setup()
    render(<AdminUsersPage />)

    await user.click(screen.getByRole('button', { name: 'Novo usuario' }))
    await user.selectOptions(getSelect('Categoria (ADMIN_MASTER)'), 'ADMIN_MASTER')
    const modal = getModal()

    expect(within(modal).getByText('Categoria Administrador Master nao possui cobranca.')).toBeInTheDocument()
    expect(within(modal).queryByText('Status de pagamento')).not.toBeInTheDocument()
    expect(within(modal).queryByText('Vencimento')).not.toBeInTheDocument()

    const planSelect = getSelect('Plano')
    expect(planSelect).toBeDisabled()
    expect(within(getFieldContainer('Plano')).getByRole('combobox')).toHaveValue('plan_free')
  })
})
