import React from 'react'
import { useAdminUsers } from '@/features/admin/hooks/useAdmin'
import type { AdminUser } from '@/features/admin/types/admin.types'

const planLabel: Record<string, string> = {
  plan_free: 'Free',
  plan_starter: 'Inicial',
  plan_pro: 'Pro',
  plan_partner: 'Parceiro'
}

const planColor: Record<string, string> = {
  plan_free: 'bg-slate-100 text-slate-600',
  plan_starter: 'bg-blue-100 text-blue-700',
  plan_pro: 'bg-emerald-100 text-emerald-700',
  plan_partner: 'bg-violet-100 text-violet-700'
}

const statusColor: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700',
  inactive: 'bg-slate-100 text-slate-500',
  suspended: 'bg-red-100 text-red-600'
}

type StatCardProps = {
  label: string
  value: number
  color: string
}

const StatCard: React.FC<StatCardProps> = ({ label, value, color }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
    <p className="text-sm font-medium text-slate-500">{label}</p>
    <p className={`mt-2 text-3xl font-bold ${color}`}>{value}</p>
  </div>
)

const deriveStats = (users: AdminUser[]) => ({
  total: users.length,
  active: users.filter((u) => u.status === 'active').length,
  inactive: users.filter((u) => u.status === 'inactive').length,
  suspended: users.filter((u) => u.status === 'suspended').length,
  plan_free: users.filter((u) => u.subscription === 'plan_free').length,
  plan_starter: users.filter((u) => u.subscription === 'plan_starter').length,
  plan_pro: users.filter((u) => u.subscription === 'plan_pro').length,
  plan_partner: users.filter((u) => u.subscription === 'plan_partner').length
})

const AdminDashboardPage: React.FC = () => {
  const { data: users = [], isLoading, isError } = useAdminUsers()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-400 text-sm">
        Carregando...
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
        Erro ao carregar dados. Verifique a conexao com o servidor.
      </div>
    )
  }

  const stats = deriveStats(users)
  const recentUsers = [...users]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 8)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Visao Geral</h1>
        <p className="mt-1 text-sm text-slate-500">Resumo geral do sistema</p>
      </div>

      {/* Status de usuarios */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Usuarios
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="Total de usuarios" value={stats.total} color="text-slate-800" />
          <StatCard label="Ativos" value={stats.active} color="text-emerald-600" />
          <StatCard label="Inativos" value={stats.inactive} color="text-slate-500" />
          <StatCard label="Suspensos" value={stats.suspended} color="text-red-500" />
        </div>
      </section>

      {/* Assinaturas */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Assinaturas
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="Free" value={stats.plan_free} color="text-slate-700" />
          <StatCard label="Inicial" value={stats.plan_starter} color="text-blue-600" />
          <StatCard label="Pro" value={stats.plan_pro} color="text-emerald-600" />
          <StatCard label="Parceiro" value={stats.plan_partner} color="text-violet-600" />
        </div>
      </section>

      {/* Usuarios recentes */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Cadastros recentes
        </h2>
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-slate-500">Nome</th>
                <th className="px-4 py-3 text-left font-medium text-slate-500">Email</th>
                <th className="px-4 py-3 text-left font-medium text-slate-500">Status</th>
                <th className="px-4 py-3 text-left font-medium text-slate-500">Plano</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentUsers.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                    Nenhum usuario cadastrado ainda.
                  </td>
                </tr>
              )}
              {recentUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-800">{u.name}</td>
                  <td className="px-4 py-3 text-slate-500">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[u.status] ?? ''}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${planColor[u.subscription] ?? ''}`}>
                      {planLabel[u.subscription] ?? u.subscription}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

export default AdminDashboardPage
