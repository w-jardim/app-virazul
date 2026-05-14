import { render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import AdminSubscriptionsPage from '@/pages/admin/AdminSubscriptionsPage'
import type { AdminUser } from '@/features/admin/types/admin.types'

const changeSubscriptionMutateAsync = vi.fn()

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
  useChangeSubscription: () => ({
    mutateAsync: changeSubscriptionMutateAsync,
    isPending: false,
  }),
}))

describe('AdminSubscriptionsPage billing labels', () => {
  it('exibe labels canônicos de billing quando disponiveis', () => {
    render(<AdminSubscriptionsPage />)

    const partnerArticle = screen.getAllByText('partner@virazul.com')[0].closest('article')
    const blockedArticle = screen.getAllByText('blocked@virazul.com')[0].closest('article')
    const legacyArticle = screen.getAllByText('legacy@virazul.com')[0].closest('article')

    expect(partnerArticle).not.toBeNull()
    expect(blockedArticle).not.toBeNull()
    expect(legacyArticle).not.toBeNull()

    // Partner ativo should show 'Parceiro ativo'
    expect(within(partnerArticle as HTMLElement).getByText('Parceiro ativo')).toBeInTheDocument()

    // Blocked should show 'Pagamento bloqueado'
    expect(within(blockedArticle as HTMLElement).getByText('Pagamento bloqueado')).toBeInTheDocument()

    // Legacy user without payment_state/partner_active should not show a canonical label
    const legacyMatches = within(legacyArticle as HTMLElement).queryByText('Isento')
    expect(legacyMatches).toBeNull()
  })
})
