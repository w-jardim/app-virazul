import React, { useState } from 'react'
import { useAdminUsers, useChangeSubscription } from '@/features/admin/hooks/useAdmin'
import type { SubscriptionPlan, UserStatus } from '@/features/admin/types/admin.types'

const plans: SubscriptionPlan[] = ['free', 'trial', 'premium']

const planLabel: Record<SubscriptionPlan, string> = {
  free: 'Free',
  trial: 'Periodo de Teste',
  premium: 'Premium'
}

const planColor: Record<SubscriptionPlan, string> = {
  free: 'bg-slate-100 text-slate-600',
  trial: 'bg-amber-100 text-amber-700',
  premium: 'bg-emerald-100 text-emerald-700'
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
      ? 'bg-indigo-600 border-indigo-600 text-white cursor-default'
      : 'border-slate-300 text-slate-600 hover:bg-slate-50 hover:border-slate-400'
  ].join(' ')

const AdminSubscriptionsPage: React.FC = () => {
  const { data: users = [], isLoading, isError } = useAdminUsers()
  const changeSubscription = useChangeSubscription()

  const [filterPlan, setFilterPlan] = useState<SubscriptionPlan | 'all'>('all')
  const [changingId, setChangingId] = useState<number | null>(null)

  const filtered = users.filter((u) =>
    filterPlan === 'all' ? true : u.subscription === filterPlan
  )

  const handleChange = async (id: number, subscription: SubscriptionPlan) => {
    setChangingId(id)
    try {
      await changeSubscription.mutateAsync({ id, subscription })
    } finally {
      setChangingId(null)
    }
  }

  // Resumo por plano
  const counts = plans.reduce<Record<SubscriptionPlan, number>>(
    (acc, p) => ({ ...acc, [p]: users.filter((u) => u.subscription === p).length }),
    { free: 0, trial: 0, premium: 0 }
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-800">Assinaturas</h1>
        <p className="mt-1 text-sm text-slate-500">
          Gerencie e altere o plano de cada usuario
        </p>
      </div>

      {/* Cards de resumo = filtro */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <button
          type="button"
          onClick={() => setFilterPlan('all')}
          className={[
            'rounded-xl border p-4 text-left transition-all',
            filterPlan === 'all'
              ? 'border-indigo-300 bg-indigo-50 ring-1 ring-indigo-300'
              : 'border-slate-200 bg-white hover:bg-slate-50'
          ].join(' ')}
        >
          <p className="text-xs font-medium text-slate-500">Todos</p>
          <p className="mt-1 text-2xl font-bold text-slate-800">{users.length}</p>
        </button>
        {plans.map((plan) => (
          <button
            key={plan}
            type="button"
            onClick={() => setFilterPlan(plan)}
            className={[
              'rounded-xl border p-4 text-left transition-all',
              filterPlan === plan
                ? 'border-indigo-300 bg-indigo-50 ring-1 ring-indigo-300'
                : 'border-slate-200 bg-white hover:bg-slate-50'
            ].join(' ')}
          >
            <p className="text-xs font-medium text-slate-500">{planLabel[plan]}</p>
            <p className="mt-1 text-2xl font-bold text-slate-800">{counts[plan]}</p>
          </button>
        ))}
      </div>

      {/* Tabela */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {isLoading && (
          <div className="px-4 py-12 text-center text-sm text-slate-400">Carregando...</div>
        )}
        {isError && (
          <div className="px-4 py-6 text-center text-sm text-red-500">
            Erro ao carregar usuarios. Verifique a conexao.
          </div>
        )}
        {!isLoading && !isError && (
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
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-slate-400">
                    Nenhum usuario neste filtro.
                  </td>
                </tr>
              )}
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-800">{u.name}</div>
                    <div className="text-xs text-slate-500">{u.email}</div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[u.status]}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${planColor[u.subscription]}`}>
                      {planLabel[u.subscription]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      {plans.map((plan) => (
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
        )}
      </div>
    </div>
  )
}

export default AdminSubscriptionsPage
