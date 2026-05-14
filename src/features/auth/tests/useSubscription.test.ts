import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { useSubscription } from '../hooks/useSubscription'
import { useAuthStore } from '../store/useAuthStore'
import { resetAuthStore } from '@/test/auth-test-utils'
import type { AuthUser, PlanEntitlements } from '../types/auth.types'

function buildUser(overrides: Partial<AuthUser> = {}): AuthUser {
  return {
    id: 1,
    name: 'User',
    email: 'user@viraazul.local',
    role: 'POLICE',
    rank_group: 'CABO_SOLDADO',
    subscription: 'plan_free',
    payment_due_date: null,
    created_at: '2025-01-01T00:00:00.000Z',
    ...overrides,
  }
}

function buildEntitlements(overrides: Partial<PlanEntitlements> = {}): PlanEntitlements {
  return {
    canView: true,
    canCreate: true,
    canEdit: true,
    canDelete: true,
    canPersistData: true,
    isFullAccess: false,
    hasLimitedTools: true,
    hasAds: true,
    paymentRequired: false,
    isBillingBlocked: false,
    isPreviewMode: false,
    requiresUpgradeCta: true,
    isTemporaryPersistence: true,
    ...overrides,
  }
}

describe('useSubscription', () => {
  beforeEach(() => {
    resetAuthStore()
  })

  it('usa entitlements como fonte principal quando presentes', () => {
    act(() => {
      useAuthStore.setState({
        token: 'token-123',
        user: buildUser({
          subscription: 'plan_partner',
          partner_active: true,
          entitlements: buildEntitlements({
            canCreate: true,
            canEdit: true,
            isBillingBlocked: false,
            hasAds: false,
          }),
        }),
        isAuthenticated: true,
        isBootstrapping: false,
      })
    })

    const { result } = renderHook(() => useSubscription())

    expect(result.current.plan).toBe('plan_partner')
    expect(result.current.canMutate).toBe(true)
    expect(result.current.reason).toBeNull()
  })

  it('bloqueia quando billing esta bloqueado pelos entitlements', () => {
    act(() => {
      useAuthStore.setState({
        token: 'token-123',
        user: buildUser({
          subscription: 'plan_starter',
          payment_state: 'payment_blocked',
          payment_due_date: '2026-12-31T00:00:00.000Z',
          entitlements: buildEntitlements({
            canCreate: true,
            canEdit: true,
            isBillingBlocked: true,
          }),
        }),
        isAuthenticated: true,
        isBootstrapping: false,
      })
    })

    const { result } = renderHook(() => useSubscription())

    expect(result.current.canMutate).toBe(false)
    expect(result.current.reason).toBe('Seu plano precisa de regularizacao para continuar operando.')
    expect(result.current.expiresAt).toEqual(new Date('2026-12-31T00:00:00.000Z'))
  })

  it('bloqueia quando entitlements negam create ou edit sem billing bloqueado', () => {
    act(() => {
      useAuthStore.setState({
        token: 'token-123',
        user: buildUser({
          subscription: 'plan_free',
          payment_state: 'payment_exempt',
          entitlements: buildEntitlements({
            canCreate: true,
            canEdit: false,
            isBillingBlocked: false,
          }),
        }),
        isAuthenticated: true,
        isBootstrapping: false,
      })
    })

    const { result } = renderHook(() => useSubscription())

    expect(result.current.canMutate).toBe(false)
    expect(result.current.reason).toBe('Seu plano atual nao permite esta operacao.')
  })

  it('mantem fallback legado quando entitlements nao existem para plano gratuito', () => {
    act(() => {
      useAuthStore.setState({
        token: 'token-123',
        user: buildUser({
          subscription: 'plan_free',
          entitlements: null,
        }),
        isAuthenticated: true,
        isBootstrapping: false,
      })
    })

    const { result } = renderHook(() => useSubscription())

    expect(result.current.canMutate).toBe(true)
    expect(result.current.reason).toBeNull()
    expect(result.current.expiresAt).toBeNull()
  })

  it('mantem fallback legado quando entitlements nao existem para plano expirado', () => {
    act(() => {
      useAuthStore.setState({
        token: 'token-123',
        user: buildUser({
          subscription: 'plan_pro',
          payment_due_date: '2020-01-01T00:00:00.000Z',
          entitlements: undefined,
        }),
        isAuthenticated: true,
        isBootstrapping: false,
      })
    })

    const { result } = renderHook(() => useSubscription())

    expect(result.current.canMutate).toBe(false)
    expect(result.current.reason).toBe('Seu plano venceu. Renove para continuar operando.')
    expect(result.current.expiresAt).toEqual(new Date('2020-01-01T00:00:00.000Z'))
  })
})
