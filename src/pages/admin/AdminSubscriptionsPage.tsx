import React, { useState } from 'react'
import { useAdminUsers, useChangeSubscription } from '@/features/admin/hooks/useAdmin'
import type { SubscriptionPlan, UserStatus } from '@/features/admin/types/admin.types'

const userPlans: SubscriptionPlan[] = ['plan_free', 'plan_starter', 'plan_pro', 'plan_partner', 'trial', 'premium', 'free']

const planLabel: Record<SubscriptionPlan, string> = {
  plan_free: 'Free',
  plan_starter: 'Starter',
  plan_pro: 'Pro',
  plan_partner: 'Partner',
  free: 'Free',
  trial: 'Periodo de Teste',
  premium: 'Premium'
}

const planColor: Record<SubscriptionPlan, string> = {
  plan_free: 'bg-slate-100 text-slate-600',
  plan_starter: 'bg-blue-100 text-blue-700',
  plan_pro: 'bg-emerald-100 text-emerald-700',
  plan_partner: 'bg-violet-100 text-violet-700',
  free: 'bg-slate-100 text-slate-600',
  trial: 'bg-amber-100 text-amber-700',
  premium: 'bg-emerald-100 text-emerald-700'
}

const statusLabel: Record<UserStatus, string> = {
  active: 'Ativo',
  inactive: 'Inativo',
  suspended: 'Suspenso'
}

const statusColor: Record<UserStatus, string> = {
  active: 'bg-emerald-100 text-emerald-700',
  inactive: 'bg-slate-100 text-slate-500',
  suspended: 'bg-red-100 text-red-600'
}

const planButtonClass = (current: SubscriptionPlan, target: SubscriptionPlan) =>
  [
    'rounded-lg px-3 py-1.5 text-xs font-medium border transition-colors',
    current === target
      ? 'bg-blue-700 border-blue-700 text-white cursor-default'
      : 'border-slate-300 text-slate-600 hover:bg-slate-50 hover:border-slate-400'
  ].join(' ')

const AdminSubscriptionsPage: React.FC = () => {
  const { data: users = [], isLoading, isError } = useAdminUsers()
  const changeSubscription = useChangeSubscription()

  const [filterPlan, setFilterPlan] = useState<SubscriptionPlan | 'all'>('all')
  const [changingId, setChangingId] = useState<number | null>(null)
  const [changeError, setChangeError] = useState<string | null>(null)

  const regularUsers = users.filter((u) => u.role !== 'ADMIN_MASTER')
  const adminUsers = users.filter((u) => u.role === 'ADMIN_MASTER')

  const filtered = regularUsers.filter((u) => filterPlan === 'all' ? true : u.subscription === filterPlan)

  const handleChange = async (id: number, subscription: SubscriptionPlan) => {
    setChangingId(id)
    setChangeError(null)
    try {
      await changeSubscription.mutateAsync({ id, subscription })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao alterar plano. Tente novamente.'
      setChangeError(msg)
    } finally {
      setChangingId(null)
    }
  }

  const counts = userPlans.reduce<Record<SubscriptionPlan, number>>(
    (acc, p) => ({ ...acc, [p]: regularUsers.filter((u) => u.subscription === p).length }),
    { plan_free: 0, plan_starter: 0, plan_pro: 0, plan_partner: 0, free: 0, trial: 0, premium: 0 }
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Assinaturas</h1>
        <p className="mt-1 text-sm text-slate-500">Gerencie e altere o plano de cada usuario</p>
      </div>

      {changeError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center justify-between">
          <span>{changeError}</span>
          <button type="button" onClick={() => setChangeError(null)} className="ml-4 text-red-400 hover:text-red-600 text-xs">Fechar</button>
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <button
          type="button"
          onClick={() => setFilterPlan('all')}
          className={[
            'rounded-xl border p-4 text-left transition-all',
            filterPlan === 'all' ? 'border-blue-300 bg-blue-50 ring-1 ring-blue-300' : 'border-slate-200 bg-white hover:bg-slate-50'
          ].join(' ')}
        >
          <p className="text-xs font-medium text-slate-500">Todos</p>
          <p className="mt-1 text-2xl font-bold text-slate-800">{regularUsers.length}</p>
        </button>
        {userPlans.map((plan) => (
          <button
            key={plan}
            type="button"
            onClick={() => setFilterPlan(plan)}
            className={[
              'rounded-xl border p-4 text-left transition-all',
              filterPlan === plan ? 'border-blue-300 bg-blue-50 ring-1 ring-blue-300' : 'border-slate-200 bg-white hover:bg-slate-50'
            ].join(' ')}
          >
            <p className="text-xs font-medium text-slate-500">{planLabel[plan]}</p>
            <p className="mt-1 text-2xl font-bold text-slate-800">{counts[plan]}</p>
          </button>
        ))}
      </div>

      {adminUsers.length > 0 && (
        <div>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Administradores</h2>
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-sm">
            {adminUsers.map((u) => (
              <div key={u.id} className="flex items-center justify-between gap-4 border-b border-slate-100 px-4 py-3 last:border-b-0">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">{u.name}</p>
                  <p className="text-xs text-slate-400 truncate">{u.email}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[u.status]}`}>{statusLabel[u.status]}</span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">Free (sem cobranca)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Usuarios</h2>
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {isLoading ? <div className="px-4 py-12 text-center text-sm text-slate-400">Carregando...</div> : null}
          {isError ? <div className="px-4 py-6 text-center text-sm text-red-500">Erro ao carregar usuarios. Verifique a conexao.</div> : null}
          {!isLoading && !isError ? (
            <>
              <div className="space-y-3 p-4 md:hidden">
                {filtered.length === 0 ? (
                  <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-10 text-center text-slate-400">Nenhum usuario neste filtro.</div>
                ) : filtered.map((u) => (
                  <article key={u.id} className="rounded-xl border border-slate-200 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-slate-800 break-words">{u.name}</p>
                        <p className="text-sm text-slate-500 break-all">{u.email}</p>
                      </div>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[u.status]}`}>{statusLabel[u.status]}</span>
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${planColor[u.subscription]}`}>{planLabel[u.subscription]}</span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {userPlans.map((plan) => (
                        <button
                          key={plan}
                          type="button"
                          disabled={changingId === u.id || u.subscription === plan}
                          onClick={() => handleChange(u.id, plan)}
                          className={planButtonClass(u.subscription, plan)}
                        >
                          {changingId === u.id && u.subscription !== plan ? '...' : planLabel[plan]}
                        </button>
                      ))}
                    </div>
                  </article>
                ))}
              </div>

              <div className="hidden md:block">
                <table className="w-full text-sm">
                  <thead className="border-b border-slate-100 bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-slate-500">Usuario</th>
                      <th className="px-4 py-3 text-left font-medium text-slate-500 hidden sm:table-cell">Status</th>
                      <th className="px-4 py-3 text-left font-medium text-slate-500">Plano atual</th>
                      <th className="px-4 py-3 text-left font-medium text-slate-500">Alterar plano</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-10 text-center text-slate-400">Nenhum usuario neste filtro.</td>
                      </tr>
                    ) : filtered.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-800">{u.name}</div>
                          <div className="text-xs text-slate-500">{u.email}</div>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[u.status]}`}>{statusLabel[u.status]}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${planColor[u.subscription]}`}>{planLabel[u.subscription]}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1.5">
                            {userPlans.map((plan) => (
                              <button
                                key={plan}
                                type="button"
                                disabled={changingId === u.id || u.subscription === plan}
                                onClick={() => handleChange(u.id, plan)}
                                className={planButtonClass(u.subscription, plan)}
                              >
                                {changingId === u.id && u.subscription !== plan ? '...' : planLabel[plan]}
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default AdminSubscriptionsPage
