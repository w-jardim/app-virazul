import React, { useState } from 'react'
import { RANK_GROUPS } from '@/features/pricing/types/pricing.types'
import {
  useAdminUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser
} from '@/features/admin/hooks/useAdmin'
import type { AdminUser, CreateUserPayload, UserStatus, SubscriptionPlan, PaymentStatus } from '@/features/admin/types/admin.types'

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

const planLabel: Record<SubscriptionPlan, string> = {
  plan_free: 'Free',
  plan_starter: 'Starter',
  plan_pro: 'Pro',
  plan_partner: 'Partner',
}

const planColor: Record<SubscriptionPlan, string> = {
  plan_free: 'bg-slate-100 text-slate-600',
  plan_starter: 'bg-blue-100 text-blue-700',
  plan_pro: 'bg-emerald-100 text-emerald-700',
  plan_partner: 'bg-violet-100 text-violet-700',
}

type FormState = {
  name: string
  email: string
  password: string
  rank_group: string
  status: UserStatus
  subscription: SubscriptionPlan
  payment_status: PaymentStatus
  payment_due_date: string
  role: 'POLICE' | 'ADMIN_MASTER'
}

const defaultForm: FormState = {
  name: '',
  email: '',
  password: '',
  rank_group: '',
  status: 'active',
  subscription: 'plan_free',
  payment_status: 'pending',
  payment_due_date: '',
  role: 'POLICE'
}

const Field: React.FC<{ label: string; children: React.ReactNode; required?: boolean }> = ({ label, children, required }) => (
  <div>
    <label className="mb-1 block text-xs font-medium text-slate-600">
      {label}
      {required && <span className="ml-0.5 text-red-500">*</span>}
    </label>
    {children}
  </div>
)

const inputClass = 'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-300'
const selectClass = 'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-300 bg-white'

type UserModalProps = {
  editing: AdminUser | null
  onClose: () => void
}

const UserModal: React.FC<UserModalProps> = ({ editing, onClose }) => {
  const [form, setForm] = useState<FormState>(
    editing
      ? {
          name: editing.name,
          email: editing.email,
          password: '',
          rank_group: editing.rank_group ?? '',
          status: editing.status,
          subscription: editing.subscription,
          payment_status: editing.payment_status,
          payment_due_date: editing.payment_due_date ?? '',
          role: editing.role
        }
      : defaultForm
  )
  const [error, setError] = useState<string | null>(null)

  const createUser = useCreateUser()
  const updateUser = useUpdateUser()
  const isPending = createUser.isPending || updateUser.isPending

  const isFreeOrAdmin =
    form.subscription === 'plan_free' ||
    form.subscription === 'plan_partner' ||
    form.role === 'ADMIN_MASTER'

  const set = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!form.name.trim() || !form.email.trim()) {
      setError('Nome e e-mail sao obrigatorios.')
      return
    }
    if (!editing && !form.password.trim()) {
      setError('Senha obrigatoria ao criar usuario.')
      return
    }

    try {
      if (editing) {
        const payload: Record<string, unknown> = {
          name: form.name,
          email: form.email,
          role: form.role,
          status: form.status,
          subscription: form.subscription,
          rank_group: form.rank_group || undefined
        }
        if (form.password.trim()) payload.password = form.password
        if (!isFreeOrAdmin) {
          payload.payment_status = form.payment_status
          payload.payment_due_date = form.payment_due_date || undefined
        }
        await updateUser.mutateAsync({ id: editing.id, ...payload })
      } else {
        const payload: CreateUserPayload = {
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
          status: form.status,
          subscription: form.subscription,
          payment_status: isFreeOrAdmin ? undefined : form.payment_status,
          payment_due_date: isFreeOrAdmin ? undefined : (form.payment_due_date || undefined),
          rank_group: form.rank_group || undefined
        }
        await createUser.mutateAsync(payload)
      }
    } catch {
      setError('Erro ao salvar. Verifique os dados e tente novamente.')
    } finally {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-base font-semibold text-slate-800">{editing ? 'Editar usuario' : 'Novo usuario'}</h2>
          <button type="button" onClick={onClose} className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600" aria-label="Fechar">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          {error ? <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</div> : null}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Nome" required>
              <input className={inputClass} value={form.name} onChange={set('name')} placeholder="Nome completo" />
            </Field>
            <Field label="E-mail" required>
              <input type="email" className={inputClass} value={form.email} onChange={set('email')} placeholder="email@exemplo.com" />
            </Field>
          </div>

          <Field label={editing ? 'Nova senha (deixe em branco para nao alterar)' : 'Senha'} required={!editing}>
            <input type="password" className={inputClass} value={form.password} onChange={set('password')} placeholder={editing ? 'Nova senha (opcional)' : 'Senha'} />
          </Field>

          <Field label="Grupo / Cargo">
            <select className={selectClass} value={form.rank_group} onChange={set('rank_group')}>
              <option value="">Selecione a graduaÃ§Ã£o</option>
              {RANK_GROUPS.map((rg) => (
                <option key={rg} value={rg}>
                  {rg === 'OFICIAIS_SUPERIORES' ? 'Oficiais Superiores' : rg === 'CAPITAO_TENENTE' ? 'CapitÃ£o e Tenente' : rg === 'SUBTENENTE_SARGENTO' ? 'Subtenente e Sargento' : rg === 'CABO_SOLDADO' ? 'Cabo e Soldado' : rg}
                </option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Categoria (ADMIN_MASTER)">
              <select className={selectClass} value={form.role} onChange={set('role')}>
                <option value="POLICE">Usuario Comum</option>
                <option value="ADMIN_MASTER">Administrador Master</option>
              </select>
            </Field>
            <Field label="Status">
              <select className={selectClass} value={form.status} onChange={set('status')}>
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
                <option value="suspended">Suspenso</option>
              </select>
            </Field>
            <Field label="Plano">
              <select className={selectClass} value={form.subscription} onChange={set('subscription')} disabled={form.role === 'ADMIN_MASTER'}>
                <option value="plan_free">Free</option>
                <option value="plan_starter">Starter</option>
                <option value="plan_pro">Pro</option>
                <option value="plan_partner">Partner (Cortesia)</option>
              </select>
            </Field>
          </div>

          {!isFreeOrAdmin && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Status de pagamento">
                <select className={selectClass} value={form.payment_status} onChange={set('payment_status')}>
                  <option value="pending">Pendente</option>
                  <option value="paid">Pago</option>
                  <option value="overdue">Atrasado</option>
                </select>
              </Field>
              <Field label="Vencimento">
                <input type="date" className={inputClass} value={form.payment_due_date} onChange={set('payment_due_date')} />
              </Field>
            </div>
          )}

          {isFreeOrAdmin && (
            <p className="text-xs text-slate-400">
              {form.role === 'ADMIN_MASTER' ? 'Categoria Administrador Master nao possui cobranca.' : 'Plano de cortesia sem cobranca.'}
            </p>
          )}

          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
            <button type="button" onClick={onClose} disabled={isPending} className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50">Cancelar</button>
            <button type="submit" disabled={isPending} className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-50">{isPending ? 'Salvando...' : editing ? 'Salvar alteracoes' : 'Criar usuario'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function formatDueDate(u: AdminUser) {
  if (u.subscription === 'plan_free' || u.subscription === 'plan_partner' || u.role === 'ADMIN_MASTER') return '—'
  if ((u.subscription === 'plan_starter' || u.subscription === 'plan_pro') && u.payment_due_date) {
    return new Date(u.payment_due_date).toLocaleDateString('pt-BR')
  }
  return '—'
}

function paymentBadge(u: AdminUser) {
  if (u.subscription === 'plan_free' || u.subscription === 'plan_partner' || u.role === 'ADMIN_MASTER') {
    return <span className="text-slate-300">—</span>
  }
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${u.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-700' : u.payment_status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-600'}`}>
      {u.payment_status === 'paid' ? 'Pago' : u.payment_status === 'pending' ? 'Pendente' : 'Atrasado'}
    </span>
  )
}

const AdminUsersPage: React.FC = () => {
  const { data: users = [], isLoading, isError } = useAdminUsers()
  const deleteUser = useDeleteUser()

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<AdminUser | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)
  const [search, setSearch] = useState('')

  const filtered = users.filter((u) => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
  const regularUsers = filtered.filter((u) => u.role !== 'ADMIN_MASTER')
  const adminUsers = filtered.filter((u) => u.role === 'ADMIN_MASTER')

  const openCreate = () => {
    setEditing(null)
    setModalOpen(true)
  }

  const openEdit = (user: AdminUser) => {
    setEditing(user)
    setModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteUser.mutateAsync(id)
    } finally {
      setConfirmDeleteId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Usuarios</h1>
          <p className="mt-1 text-sm text-slate-500">Gerencie contas, status e categorias de acesso (somente ADMIN_MASTER).</p>
        </div>
        <button type="button" onClick={openCreate} className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 self-start">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Novo usuario
        </button>
      </div>

      <div className="relative max-w-xs">
        <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
        </svg>
        <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nome ou e-mail..." className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-300" />
      </div>

      {isLoading ? <div className="px-4 py-12 text-center text-sm text-slate-400">Carregando...</div> : null}
      {isError ? <div className="px-4 py-6 text-center text-sm text-red-500">Erro ao carregar usuarios. Verifique a conexao.</div> : null}

      {!isLoading && !isError ? (
        <>
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
                      <button type="button" onClick={() => openEdit(u)} className="text-xs font-medium text-blue-700 hover:underline">Editar</button>
                      {confirmDeleteId === u.id ? (
                        <span className="inline-flex items-center gap-1">
                          <button type="button" onClick={() => handleDelete(u.id)} disabled={deleteUser.isPending} className="text-xs font-medium text-red-600 hover:underline disabled:opacity-50">Sim</button>
                          <button type="button" onClick={() => setConfirmDeleteId(null)} className="text-xs text-slate-400 hover:underline">Nao</button>
                        </span>
                      ) : (
                        <button type="button" onClick={() => setConfirmDeleteId(u.id)} className="text-xs font-medium text-red-500 hover:underline">Excluir</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Usuarios</h2>
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="space-y-3 p-4 md:hidden">
                {regularUsers.length === 0 ? (
                  <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-10 text-center text-slate-400">
                    {search ? 'Nenhum resultado encontrado.' : 'Nenhum usuario cadastrado ainda.'}
                  </div>
                ) : regularUsers.map((u) => (
                  <article key={u.id} className="rounded-xl border border-slate-200 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-slate-800 break-words">{u.name}</p>
                        <p className="text-sm text-slate-500 break-all">{u.email}</p>
                      </div>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[u.status]}`}>{statusLabel[u.status]}</span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-slate-500">Cargo</p>
                        <p className="text-slate-700">{u.rank_group ?? 'â€”'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Plano</p>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${planColor[u.subscription]}`}>{planLabel[u.subscription]}</span>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Pagamento</p>
                        <div className="mt-1">{paymentBadge(u)}</div>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Vencimento</p>
                        <p className="text-slate-700">{formatDueDate(u)}</p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-3">
                      {confirmDeleteId === u.id ? (
                        <>
                          <span className="text-xs text-slate-500">Confirmar exclusÃ£o?</span>
                          <button type="button" onClick={() => handleDelete(u.id)} disabled={deleteUser.isPending} className="text-xs font-medium text-red-600 hover:underline disabled:opacity-50">Sim</button>
                          <button type="button" onClick={() => setConfirmDeleteId(null)} className="text-xs text-slate-500 hover:underline">NÃ£o</button>
                        </>
                      ) : (
                        <>
                          <button type="button" onClick={() => openEdit(u)} className="text-xs font-medium text-blue-700 hover:underline">Editar</button>
                          <button type="button" onClick={() => setConfirmDeleteId(u.id)} className="text-xs font-medium text-red-500 hover:underline">Excluir</button>
                        </>
                      )}
                    </div>
                  </article>
                ))}
              </div>

              <div className="hidden md:block">
                <table className="w-full text-sm">
                  <thead className="border-b border-slate-100 bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-slate-500">Nome</th>
                      <th className="px-4 py-3 text-left font-medium text-slate-500 hidden sm:table-cell">E-mail</th>
                      <th className="px-4 py-3 text-left font-medium text-slate-500 hidden md:table-cell">Cargo</th>
                      <th className="px-4 py-3 text-left font-medium text-slate-500">Status</th>
                      <th className="px-4 py-3 text-left font-medium text-slate-500">Plano</th>
                      <th className="px-4 py-3 text-left font-medium text-slate-500">Pagamento</th>
                      <th className="px-4 py-3 text-left font-medium text-slate-500">Vencimento</th>
                      <th className="px-4 py-3 text-right font-medium text-slate-500">Acoes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {regularUsers.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-4 py-10 text-center text-slate-400">{search ? 'Nenhum resultado encontrado.' : 'Nenhum usuario cadastrado ainda.'}</td>
                      </tr>
                    ) : regularUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-800">{u.name}</div>
                          <div className="text-xs text-slate-500 sm:hidden">{u.email}</div>
                        </td>
                        <td className="px-4 py-3 text-slate-500 hidden sm:table-cell">{u.email}</td>
                        <td className="px-4 py-3 text-slate-500 hidden md:table-cell">{u.rank_group ?? <span className="text-slate-300">â€”</span>}</td>
                        <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[u.status]}`}>{statusLabel[u.status]}</span></td>
                        <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${planColor[u.subscription]}`}>{planLabel[u.subscription]}</span></td>
                        <td className="px-4 py-3">{paymentBadge(u)}</td>
                        <td className="px-4 py-3 text-slate-500">{formatDueDate(u)}</td>
                        <td className="px-4 py-3 text-right">
                          {confirmDeleteId === u.id ? (
                            <span className="inline-flex items-center gap-2">
                              <span className="text-xs text-slate-500">Confirmar?</span>
                              <button type="button" onClick={() => handleDelete(u.id)} disabled={deleteUser.isPending} className="text-xs font-medium text-red-600 hover:underline disabled:opacity-50">Sim</button>
                              <button type="button" onClick={() => setConfirmDeleteId(null)} className="text-xs text-slate-500 hover:underline">Nao</button>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-3">
                              <button type="button" onClick={() => openEdit(u)} className="text-xs font-medium text-blue-700 hover:underline">Editar</button>
                              <button type="button" onClick={() => setConfirmDeleteId(u.id)} className="text-xs font-medium text-red-500 hover:underline">Excluir</button>
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      ) : null}

      {modalOpen && <UserModal editing={editing} onClose={() => setModalOpen(false)} />}
    </div>
  )
}

export default AdminUsersPage

