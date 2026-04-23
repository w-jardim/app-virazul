import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { authApi } from '../api/auth.api'
import { useAuthStore } from '../store/useAuthStore'
import { AuthCard } from './AuthUI'
import GoogleLoginButton from './GoogleLoginButton'

const schema = z.object({
  email: z.string().email('Informe um e-mail válido.'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres.'),
})

type LoginFormValues = z.infer<typeof schema>

const inputClass = (hasError?: boolean) =>
  [
    'w-full rounded-lg border bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition',
    'placeholder-slate-400 focus:bg-white focus:ring-2',
    hasError
      ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
      : 'border-slate-300 focus:border-blue-500 focus:ring-blue-100',
  ].join(' ')

const hasGoogleAuth = !!import.meta.env.VITE_GOOGLE_CLIENT_ID

const LoginForm = () => {
  const navigate = useNavigate()
  const setSession = useAuthStore((state) => state.setSession)
  const finishBootstrap = useAuthStore((state) => state.finishBootstrap)
  const [formError, setFormError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (values: LoginFormValues) => {
    setFormError(null)
    try {
      const session = await authApi.login(values)
      setSession({ token: session.token, user: session.user })
      finishBootstrap()
      navigate('/dashboard', { replace: true })
    } catch {
      setFormError('E-mail ou senha incorretos. Verifique e tente novamente.')
    }
  }

  const onGoogleCredential = async (idToken: string) => {
    setFormError(null)
    try {
      const session = await authApi.loginWithGoogle({ id_token: idToken })
      setSession({ token: session.token, user: session.user })
      finishBootstrap()
      navigate('/dashboard', { replace: true })
    } catch {
      setFormError('Não foi possível autenticar com Google. Tente novamente.')
    }
  }

  return (
    <AuthCard>
      <div className="mb-7">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Entrar na sua conta</h1>
        <p className="mt-1.5 text-sm text-slate-500">Acesse sua área operacional.</p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        {formError && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-100">
            {formError}
          </div>
        )}

        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">E-mail</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="seu@email.com"
            className={inputClass(!!errors.email)}
            {...register('email')}
          />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium text-slate-700">Senha</label>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              className={inputClass(!!errors.password) + ' pr-10'}
              {...register('password')}
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((v) => !v)}
              className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600"
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            >
              {showPassword ? (
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
          </div>
          {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-blue-700 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:opacity-60"
        >
          {isSubmitting ? 'Entrando...' : 'Entrar'}
        </button>

        {hasGoogleAuth && (
          <>
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-xs text-slate-400">ou continue com</span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <div className="flex justify-center">
              <GoogleLoginButton
                disabled={isSubmitting}
                onCredential={onGoogleCredential}
                onError={() => setFormError('Falha ao iniciar o login Google. Verifique a configuração.')}
              />
            </div>
          </>
        )}

        <p className="text-center text-sm text-slate-500">
          Não tem conta?{' '}
          <Link to="/register" className="font-medium text-blue-600 hover:underline">
            Criar conta grátis
          </Link>
        </p>
      </form>
    </AuthCard>
  )
}

export default LoginForm
