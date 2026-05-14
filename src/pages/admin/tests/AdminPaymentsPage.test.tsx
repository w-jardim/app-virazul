import { render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import AdminPaymentsPage, {
  formatAdminPaymentDueDate,
  getAdminPaymentColor,
  getAdminPaymentLabel,
} from '@/pages/admin/AdminPaymentsPage'
import type { AdminUser } from '@/features/admin/types/admin.types'

const changePaymentStatusMutateAsync = vi.fn()

const baseUsers: AdminUser[] = [
  {
    id: 1,
    name: 'Parceiro Ativo',
    email: 'partner@virazul.com',
    role: 'POLICE',
    status: 'active',
    subscription: 'plan_starter',
    payment_status: 'paid',
    payment_due_date: '2026-05-20',
    payment_state: 'payment_exempt',
    partner_active: true,
    entitlements: null,
    rank_group: 'CABO_SOLDADO',
    created_at: '2026-05-01T00:00:00.000Z',
  },
  {
    id: 2,
    name: 'Usuario Bloqueado',
    email: 'blocked@virazul.com',
    role: 'POLICE',
    status: 'active',
    subscription: 'plan_pro',
    payment_status: 'paid',
    payment_due_date: '2026-05-25',
    payment_state: 'payment_blocked',
    partner_active: false,
    entitlements: null,
    rank_group: 'CABO_SOLDADO',
    created_at: '2026-05-01T00:00:00.000Z',
  },
  {
    id: 3,
    name: 'Usuario Legado',
    email: 'legacy@virazul.com',
    role: 'POLICE',
    status: 'active',
    subscription: 'plan_starter',
    payment_status: 'pending',
    payment_due_date: '2026-05-30',
    payment_state: undefined,
    partner_active: undefined,
    entitlements: undefined,
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
  useChangePaymentStatus: () => ({
    mutateAsync: changePaymentStatusMutateAsync,
    isPending: false,
  }),
}))

describe('AdminPaymentsPage billing display', () => {
  it('prefere payment_state e partner_active na exibicao quando disponiveis', () => {
    expect(formatAdminPaymentDueDate(baseUsers[0])).toBe('—')
    expect(getAdminPaymentLabel(baseUsers[0])).toBe('—')
    expect(getAdminPaymentColor(baseUsers[0])).toBe('text-slate-300')

    expect(formatAdminPaymentDueDate(baseUsers[1])).toBe(new Date('2026-05-25').toLocaleDateString('pt-BR'))
    expect(getAdminPaymentLabel(baseUsers[1])).toBe('Atrasado')
    expect(getAdminPaymentColor(baseUsers[1])).toBe('bg-red-100 text-red-600')
  })

  it('mantem fallback legado quando payment_state nao existe', () => {
    expect(formatAdminPaymentDueDate(baseUsers[2])).toBe(new Date('2026-05-30').toLocaleDateString('pt-BR'))
    expect(getAdminPaymentLabel(baseUsers[2])).toBe('Pendente')
    expect(getAdminPaymentColor(baseUsers[2])).toBe('bg-amber-100 text-amber-700')
  })

  it('renderiza badge e vencimento usando contrato novo com fallback legado', () => {
    render(<AdminPaymentsPage />)

    const exemptArticle = screen.getAllByText('partner@virazul.com')[0].closest('article')
    const blockedArticle = screen.getAllByText('blocked@virazul.com')[0].closest('article')
    const legacyArticle = screen.getAllByText('legacy@virazul.com')[0].closest('article')

    expect(exemptArticle).not.toBeNull()
    expect(blockedArticle).not.toBeNull()
    expect(legacyArticle).not.toBeNull()

    expect(within(exemptArticle as HTMLElement).getAllByText('—')).toHaveLength(2)
    expect(within(blockedArticle as HTMLElement).getAllByText('Atrasado')).toHaveLength(2)
    expect(
      within(blockedArticle as HTMLElement).getByText(new Date('2026-05-25').toLocaleDateString('pt-BR'))
    ).toBeInTheDocument()
    expect(within(legacyArticle as HTMLElement).getAllByText('Pendente')).toHaveLength(2)
  })
})
