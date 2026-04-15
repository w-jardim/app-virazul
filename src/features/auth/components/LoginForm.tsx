import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { authApi } from '../api/auth.api'
import { useAuthStore } from '../store/useAuthStore'
import Button from '@/components/ui/Button'
import { AuthCard } from './AuthUI'
import GoogleLoginButton from './GoogleLoginButton'

const schema = z.object({
  email: z.string().email('Informe um e-mail válido.'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres.')
})

type LoginFormValues = z.infer<typeof schema>

const LoginForm = () => {
  const navigate = useNavigate()
  const setSession = useAuthStore((state) => state.setSession)
  const finishBootstrap = useAuthStore((state) => state.finishBootstrap)
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      password: ''
    }
  })

  const onSubmit = async (values: LoginFormValues) => {
    setFormError(null)
    try {
      const session = await authApi.login(values)
      setSession({ token: session.token, user: session.user })
      finishBootstrap()
      navigate('/dashboard', { replace: true })
    } catch {
      setFormError('Nao foi possivel autenticar. Verifique suas credenciais.')
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
      setFormError('Nao foi possivel autenticar com Google. Tente novamente.')
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-10">
      <AuthCard>
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">Entrar no ViraAzul</h1>
          <p className="mt-2 text-sm text-slate-600">Acesse sua área operacional.</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              {...register('email')}
            />
            {errors.email ? <p className="mt-1 text-xs text-red-600">{errors.email.message}</p> : null}
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
              Senha
            </label>
            <input
              id="password"
              type="password"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              {...register('password')}
            />
            {errors.password ? (
              <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
            ) : null}
          </div>

          {formError ? <p className="text-sm text-red-600">{formError}</p> : null}

          <Button type="submit" disabled={isSubmitting} className="w-full rounded-lg bg-sky-600 py-2.5">
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </Button>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-xs text-slate-500">ou</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <div className="flex justify-center">
            <GoogleLoginButton
              disabled={isSubmitting}
              onCredential={onGoogleCredential}
              onError={() => setFormError('Falha ao iniciar o login Google. Verifique a configuracao.')}
            />
          </div>

          <div className="text-center mt-3">
            <p className="text-sm text-slate-600">Não tem conta? <button type="button" onClick={() => navigate('/register')} className="text-sky-600 underline">Cadastre-se</button></p>
          </div>
        </form>
      </AuthCard>
    </div>
  )
}

export default LoginForm
