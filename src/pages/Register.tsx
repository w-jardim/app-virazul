import React from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { authApi } from '@/features/auth/api/auth.api'
import { useAuthStore } from '@/features/auth/store/useAuthStore'
import Button from '@/components/ui/Button'
import { AuthCard } from '@/features/auth/components/AuthUI'

const RANK_GROUP_OPTIONS = [
  { value: 'OFICIAIS_SUPERIORES', label: 'Oficiais Superiores' },
  { value: 'CAPITAO_TENENTE', label: 'Capitão / Tenente' },
  { value: 'SUBTENENTE_SARGENTO', label: 'Subtenente / Sargento' },
  { value: 'CABO_SOLDADO', label: 'Cabo / Soldado' },
] as const

const schema = z
  .object({
    name: z.string().min(1, 'Informe seu nome.'),
    email: z.string().email('Informe um e-mail válido.'),
    rank_group: z.string().min(1, 'Selecione seu posto/graduação.'),
    password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres.'),
    password_confirm: z.string().min(1, 'Confirme sua senha.')
  })
  .superRefine(({ password, password_confirm }, ctx) => {
    if (password_confirm && password !== password_confirm) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Confirmação de senha não corresponde.',
        path: ['password_confirm']
      })
    }
  })

type RegisterValues = z.infer<typeof schema>

const EyeIcon = ({ open }: { open: boolean }) =>
  open ? (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.956 9.956 0 012.223-3.592M6.53 6.53A9.956 9.956 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.96 9.96 0 01-4.67 5.328M3 3l18 18" />
    </svg>
  )

const RegisterPage: React.FC = () => {
  const navigate = useNavigate()
  const setSession = useAuthStore((s) => s.setSession)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', rank_group: '', password: '', password_confirm: '' }
  })

  const [formError, setFormError] = React.useState<string | null>(null)
  const [showPassword, setShowPassword] = React.useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = React.useState(false)

  const onSubmit = async (values: RegisterValues) => {
    setFormError(null)
    try {
      const result = await authApi.register({ name: values.name, email: values.email, rank_group: values.rank_group || null, password: values.password, password_confirm: values.password_confirm })
      // register returns token + user
      setSession({ token: result.token, user: result.user })
      navigate('/dashboard', { replace: true })
    } catch (err: any) {
      const msg = err?.response?.data?.errors?.[0]?.message || err?.response?.data?.message || 'Erro ao criar conta.'
      setFormError(msg)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-10">
      <AuthCard>
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">Cadastre-se no ViraAzul</h1>
          <p className="mt-2 text-sm text-slate-600">Crie sua conta para acessar a área operacional.</p>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          {formError && <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{formError}</div>}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Nome</label>
            <input
              className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 ${errors.name ? 'border-red-400 focus:border-red-500 focus:ring-red-500' : 'border-slate-300 focus:border-sky-500 focus:ring-sky-500'}`}
              autoComplete="name"
              {...register('name')}
            />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">E-mail</label>
            <input
              type="email"
              className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 ${errors.email ? 'border-red-400 focus:border-red-500 focus:ring-red-500' : 'border-slate-300 focus:border-sky-500 focus:ring-sky-500'}`}
              autoComplete="email"
              {...register('email')}
            />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Posto / Graduação</label>
            <select
              className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 ${errors.rank_group ? 'border-red-400 focus:border-red-500 focus:ring-red-500' : 'border-slate-300 focus:border-sky-500 focus:ring-sky-500'}`}
              {...register('rank_group')}
            >
              <option value="">Selecione...</option>
              {RANK_GROUP_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {errors.rank_group && <p className="mt-1 text-xs text-red-600">{errors.rank_group.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Senha</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className={`w-full rounded-lg border px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-1 ${errors.password ? 'border-red-400 focus:border-red-500 focus:ring-red-500' : 'border-slate-300 focus:border-sky-500 focus:ring-sky-500'}`}
                autoComplete="new-password"
                {...register('password')}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                <EyeIcon open={showPassword} />
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Confirmar senha</label>
            <div className="relative">
              <input
                type={showPasswordConfirm ? 'text' : 'password'}
                className={`w-full rounded-lg border px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-1 ${errors.password_confirm ? 'border-red-400 focus:border-red-500 focus:ring-red-500' : 'border-slate-300 focus:border-sky-500 focus:ring-sky-500'}`}
                autoComplete="new-password"
                {...register('password_confirm')}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600"
                onClick={() => setShowPasswordConfirm((v) => !v)}
                tabIndex={-1}
                aria-label={showPasswordConfirm ? 'Ocultar confirmação' : 'Mostrar confirmação'}
              >
                <EyeIcon open={showPasswordConfirm} />
              </button>
            </div>
            {errors.password_confirm && <p className="mt-1 text-xs text-red-600">{errors.password_confirm.message}</p>}
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full rounded-lg bg-sky-600 py-2.5">
            {isSubmitting ? 'Criando...' : 'Criar conta'}
          </Button>

          <p className="text-center text-sm text-slate-500">
            Já tem uma conta?{' '}
            <Link to="/login" className="font-medium text-sky-600 hover:underline">
              Entrar
            </Link>
          </p>
        </form>
      </AuthCard>
    </div>
  )
}

export default RegisterPage
