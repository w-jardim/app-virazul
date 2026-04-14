import React, { useState } from 'react'
import { useAdminUsers, useChangePaymentStatus } from '@/features/admin/hooks/useAdmin'
import type { AdminUser, PaymentStatus } from '@/features/admin/types/admin.types'

const paymentLabels: Record<PaymentStatus, string> = {
  paid: 'Pago',
  pending: 'Pendente',
  overdue: 'Atrasado'
}

const paymentColors: Record<PaymentStatus, string> = {
  paid: 'bg-emerald-100 text-emerald-700',
  pending: 'bg-amber-100 text-amber-700',
  overdue: 'bg-red-100 text-red-600'
}

const PaymentStatusButton: React.FC<{
  status: PaymentStatus
  current: PaymentStatus
  disabled?: boolean
  onClick: () => void
}> = ({ status, current, disabled, onClick }) => (
  <button
    type="button"
    disabled={disabled || status === current}
    onClick={onClick}
    className={[
      'rounded-full px-3 py-1 text-xs font-semibold transition',
      status === current
        ? 'bg-slate-800 text-white cursor-default'
        : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
    ].join(' ')}
  >
    {paymentLabels[status]}
  </button>
)

const AdminPaymentsPage: React.FC = () => {
  const { data: users = [], isLoading, isError } = useAdminUsers()
  const changePaymentStatus = useChangePaymentStatus()
  const [selectedFilter, setSelectedFilter] = useState<'all' | PaymentStatus>('all')

  const filteredUsers = users.filter((user) =>
    selectedFilter === 'all' ? true : user.payment_status === selectedFilter
  )

  const handleStatusChange = async (user: AdminUser, status: PaymentStatus) => {
    await changePaymentStatus.mutateAsync({ id: user.id, paymentStatus: status })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Pagamentos</h1>
          <p className="mt-1 text-sm text-slate-500">
            Controle de status de pagamento dos usuarios e vencimento de assinaturas.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {(['all', 'pending', 'paid', 'overdue'] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setSelectedFilter(filter)}
              className={[
                'rounded-full px-3 py-2 text-xs font-semibold transition',
                selectedFilter === filter
                  ? 'bg-indigo-600 text-white'
                  : 'border border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
              ].join(' ')}
            >
              {filter === 'all' ? 'Todos' : paymentLabels[filter]}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {isLoading && (
          <div className="px-4 py-12 text-center text-sm text-slate-400">Carregando...</div>
        )}

        {isError && (
          <div className="px-4 py-6 text-center text-sm text-red-500">
            Erro ao carregar os dados de pagamentos.
          </div>
        )}

        {!isLoading && !isError && (
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-slate-500">Usuario</th>
                <th className="px-4 py-3 text-left font-medium text-slate-500 hidden md:table-cell">Plano</th>
                <th className="px-4 py-3 text-left font-medium text-slate-500">Status</th>
                <th className="px-4 py-3 text-left font-medium text-slate-500">Vencimento</th>
                <th className="px-4 py-3 text-right font-medium text-slate-500">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-slate-400">
                    Nenhum registro de pagamento encontrado para esse filtro.
                  </td>
                </tr>
              )}
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                      {user.subscription}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${paymentColors[user.payment_status]}`}>
                      {paymentLabels[user.payment_status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {user.payment_due_date ? new Date(user.payment_due_date).toLocaleDateString('pt-BR') : '—'}
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    {(['paid', 'pending', 'overdue'] as PaymentStatus[]).map((status) => (
                      <PaymentStatusButton
                        key={status}
                        status={status}
                        current={user.payment_status}
                        disabled={changePaymentStatus.isPending}
                        onClick={() => handleStatusChange(user, status)}
                      />
                    ))}
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

export default AdminPaymentsPage
