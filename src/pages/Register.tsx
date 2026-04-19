import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { authApi } from '@/features/auth/api/auth.api'
import { useAuthStore } from '@/features/auth/store/useAuthStore'
import { AuthCard } from '@/features/auth/components/AuthUI'

const RANK_GROUP_OPTIONS = [
  { value: 'OFICIAIS_SUPERIORES', label: 'Oficiais Superiores' },
  { value: 'CAPITAO_TENENTE',     label: 'Capitão / Tenente' },
  { value: 'SUBTENENTE_SARGENTO', label: 'Subtenente / Sargento' },
  { value: 'CABO_SOLDADO',        label: 'Cabo / Soldado' },
] as const

const schema = z
  .object({
    name:             z.string().min(1, 'Informe seu nome.'),
    email:            z.string().email('Informe um e-mail válido.'),
    rank_group:       z.string().min(1, 'Selecione seu posto/graduação.'),
    password:         z.string().min(6, 'A senha deve ter pelo menos 6 caracteres.'),
    password_confirm: z.string().min(1, 'Confirme sua senha.'),
  })
  .superRefine(({ password, password_confirm }, ctx) => {
    if (password_confirm && password !== password_confirm) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'As senhas não correspondem.',
        path: ['password_confirm'],
      })
    }
  })

type RegisterValues = z.infer<typeof schema>

const inputClass = (hasError?: boolean) =>
  [
    'w-full rounded-lg border bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition',
    'placeholder-slate-400 focus:bg-white focus:ring-2',
    hasError
      ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
      : 'border-slate-300 focus:border-blue-500 focus:ring-blue-100',
  ].join(' ')

const RegisterPage: React.FC = () => {
  const navigate = useNavigate()
  const setSession = useAuthStore((s) => s.setSession)
  const [formError, setFormError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', rank_group: '', password: '', password_confirm: '' },
  })

  const onSubmit = async (values: RegisterValues) => {
    setFormError(null)
    try {
      const result = await authApi.register({
        name: values.name,
        email: values.email,
        rank_group: values.rank_group || null,
        password: values.password,
        password_confirm: values.password_confirm,
      })
      setSession({ token: result.token, user: result.user })
      navigate('/dashboard', { replace: true })
    } catch (err: any) {
      const msg =
        err?.response?.data?.errors?.[0]?.message ||
        err?.response?.data?.message ||
        'Erro ao criar conta. Tente novamente.'
      setFormError(msg)
    }
  }

  const EyeToggle = ({ show, onToggle }: { show: boolean; onToggle: () => void }) => (
    <button
      type="button"
      tabIndex={-1}
      onClick={onToggle}
      className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600"
      aria-label={show ? 'Ocultar senha' : 'Mostrar senha'}
    >
      {show ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.956 9.956 0 012.223-3.592M6.53 6.53A9.956 9.956 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.96 9.96 0 01-4.67 5.328M3 3l18 18" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      )}
    </button>
  )

  return (
    <AuthCard>
      <div className="mb-7">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Crie sua conta</h1>
        <p className="mt-1.5 text-sm text-slate-500">
          30 dias grátis, sem cartão. Depois R$ 9,90/mês.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        {formError && (
          <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            {formError}
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Nome completo</label>
          <input
            autoComplete="name"
            placeholder="Seu nome"
            className={inputClass(!!errors.name)}
            {...register('name')}
          />
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">E-mail</label>
          <input
            type="email"
            autoComplete="email"
            placeholder="seu@email.com"
            className={inputClass(!!errors.email)}
            {...register('email')}
          />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Categoria / Posto</label>
          <select
            className={inputClass(!!errors.rank_group)}
            {...register('rank_group')}
          >
            <option value="">Selecione sua categoria...</option>
            {RANK_GROUP_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {errors.rank_group && <p className="mt-1 text-xs text-red-600">{errors.rank_group.message}</p>}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Senha</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Mínimo 6 caracteres"
              className={inputClass(!!errors.password) + ' pr-10'}
              {...register('password')}
            />
            <EyeToggle show={showPassword} onToggle={() => setShowPassword((v) => !v)} />
          </div>
          {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Confirmar senha</label>
          <div className="relative">
            <input
              type={showConfirm ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Repita a senha"
              className={inputClass(!!errors.password_confirm) + ' pr-10'}
              {...register('password_confirm')}
            />
            <EyeToggle show={showConfirm} onToggle={() => setShowConfirm((v) => !v)} />
          </div>
          {errors.password_confirm && <p className="mt-1 text-xs text-red-600">{errors.password_confirm.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-blue-700 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:opacity-60"
        >
          {isSubmitting ? 'Criando conta...' : 'Criar conta gratuita'}
        </button>

        <p className="text-center text-[12px] text-slate-400">
          Ao criar sua conta, você concorda com os{' '}
          <Link to="/termos" className="text-blue-500 hover:underline">Termos de Uso</Link>
          {' '}e a{' '}
          <Link to="/privacidade" className="text-blue-500 hover:underline">Política de Privacidade</Link>.
        </p>

        <p className="text-center text-sm text-slate-500">
          Já tem uma conta?{' '}
          <Link to="/login" className="font-medium text-blue-600 hover:underline">
            Entrar
          </Link>
        </p>
      </form>
    </AuthCard>
  )
}

export default RegisterPage
