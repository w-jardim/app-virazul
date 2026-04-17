import React, { useState } from 'react'
import { useAuthStore } from '@/features/auth/store/useAuthStore'
import { authApi } from '@/features/auth/api/auth.api'
import { RANK_GROUPS } from '@/features/pricing/types/pricing.types'

const inputClass =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-300'
const selectClass =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-300 bg-white'

function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 disabled:opacity-50 ${
        checked ? 'bg-sky-600' : 'bg-slate-300'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  )
}

function Feedback({ error, success }: { error: string | null; success: string | null }) {
  if (error) return <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>
  if (success) return <div className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</div>
  return null
}

// ── Main ─────────────────────────────────────────────────────────────────────

const ProfilePage: React.FC = () => {
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)

  const savedPrefs = (user?.planning_preferences ?? {}) as Record<string, unknown>

  // ── Account form ───────────────────────────────────────────────────────────
  const [form, setForm] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    monthly_hour_goal: String(user?.monthly_hour_goal ?? 120),
    rank_group: user?.rank_group ?? '',
    password: '',
    password_confirm: '',
  })
  const [formBusy, setFormBusy] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [formSuccess, setFormSuccess] = useState<string | null>(null)

  const setField =
    (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((p) => ({ ...p, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setFormSuccess(null)
    if (form.password && form.password !== form.password_confirm) {
      setFormError('Confirmação de senha não corresponde.')
      return
    }
    const goal = Number(form.monthly_hour_goal)
    if (!Number.isFinite(goal) || goal < 0) {
      setFormError('Meta mensal inválida.')
      return
    }
    try {
      setFormBusy(true)
      const payload: any = {
        name: form.name,
        email: form.email,
        rank_group: form.rank_group || null,
        monthly_hour_goal: Math.floor(goal),
      }
      if (form.password) {
        payload.password = form.password
        payload.password_confirm = form.password_confirm
      }
      const updated = await authApi.updateProfile(payload)
      setUser(updated)
      setFormSuccess('Perfil atualizado com sucesso.')
      setForm((p) => ({ ...p, password: '', password_confirm: '' }))
    } catch (err: any) {
      setFormError(err?.response?.data?.errors?.[0]?.message ?? 'Erro ao atualizar perfil.')
    } finally {
      setFormBusy(false)
    }
  }

  // ── Preferences ────────────────────────────────────────────────────────────
  const [minRest, setMinRest] = useState<boolean>(
    savedPrefs.min_rest_enabled !== false,
  )
  const [prefBusy, setPrefBusy] = useState(false)
  const [prefError, setPrefError] = useState<string | null>(null)
  const [prefSuccess, setPrefSuccess] = useState<string | null>(null)

  const savePref = async (key: string, value: unknown) => {
    setPrefError(null)
    setPrefSuccess(null)
    try {
      setPrefBusy(true)
      const updated = await authApi.updateProfile({
        planning_preferences: { ...savedPrefs, [key]: value },
      } as any)
      setUser(updated)
      setPrefSuccess('Preferência salva.')
    } catch (err: any) {
      setPrefError(err?.response?.data?.errors?.[0]?.message ?? 'Erro ao salvar preferência.')
    } finally {
      setPrefBusy(false)
    }
  }

  // ── Initials ───────────────────────────────────────────────────────────────
  const initials = user?.name
    ? user.name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()
    : '?'

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">Meu perfil</h1>
        <p className="text-sm text-slate-600">Gerencie seus dados, graduação e preferências do sistema.</p>
      </header>

      {/* ── Dados da conta ── */}
      <section className="max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-center gap-4">
          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-sky-100 text-xl font-bold text-sky-700 select-none">
            {initials}
          </div>
          <div>
            <p className="font-semibold text-slate-900">{user?.name}</p>
            <p className="text-sm text-slate-500">{user?.email}</p>
            {user?.rank_group && (
              <p className="mt-0.5 text-xs text-slate-400">{user.rank_group}</p>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Nome</label>
              <input className={inputClass} value={form.name} onChange={setField('name')} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">E-mail</label>
              <input type="email" className={inputClass} value={form.email} onChange={setField('email')} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Grupo / Graduação</label>
              <select className={selectClass} value={form.rank_group} onChange={setField('rank_group')}>
                <option value="">Selecione a graduação</option>
                {RANK_GROUPS.map((rg) => (
                  <option key={rg} value={rg}>{rg}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Meta mensal de horas</label>
              <input
                type="number"
                min={0}
                max={744}
                className={inputClass}
                value={form.monthly_hour_goal}
                onChange={setField('monthly_hour_goal')}
              />
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4">
            <p className="mb-3 text-xs font-medium text-slate-500">Alterar senha (opcional)</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Nova senha</label>
                <input type="password" className={inputClass} value={form.password} onChange={setField('password')} placeholder="••••••" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Confirmar senha</label>
                <input type="password" className={inputClass} value={form.password_confirm} onChange={setField('password_confirm')} placeholder="••••••" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Feedback error={formError} success={formSuccess} />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={formBusy}
                className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-50"
              >
                {formBusy ? 'Salvando...' : 'Salvar alterações'}
              </button>
            </div>
          </div>
        </form>
      </section>

      {/* ── Preferências ── */}
      <section className="max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-slate-800">Preferências do sistema</h2>

        <div className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-700">Intervalo mínimo entre serviços</p>
              <p className="text-xs text-slate-500">Bloqueia serviços com menos de 8h de intervalo entre si</p>
            </div>
            <Toggle
              checked={minRest}
              disabled={prefBusy}
              onChange={(v) => {
                setMinRest(v)
                savePref('min_rest_enabled', v)
              }}
            />
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <Feedback error={prefError} success={prefSuccess} />
        </div>
      </section>
    </div>
  )
}

export default ProfilePage
