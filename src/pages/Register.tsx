import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { authApi } from '@/features/auth/api/auth.api'
import { useAuthStore } from '@/features/auth/store/useAuthStore'
import Button from '@/components/ui/Button'
import { AuthCard } from '@/features/auth/components/AuthUI'

const schema = z.object({
  name: z.string().min(1, 'Informe seu nome.'),
  email: z.string().email('Informe um e-mail válido.'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres.'),
  password_confirm: z.string().min(6)
})

type RegisterValues = z.infer<typeof schema>

const RegisterPage: React.FC = () => {
  const navigate = useNavigate()
  const setSession = useAuthStore((s) => s.setSession)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', password: '', password_confirm: '' }
  })

  const [formError, setFormError] = React.useState<string | null>(null)

  const onSubmit = async (values: RegisterValues) => {
    setFormError(null)
    if (values.password !== values.password_confirm) {
      setFormError('Confirmação de senha não corresponde.')
      return
    }
    try {
      const result = await authApi.register({ name: values.name, email: values.email, password: values.password })
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
            <input className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" {...register('name')} />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">E-mail</label>
            <input className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" {...register('email')} />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Senha</label>
            <input type="password" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" {...register('password')} />
            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Confirmar senha</label>
            <input type="password" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" {...register('password_confirm')} />
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full rounded-lg bg-sky-600 py-2.5">
            {isSubmitting ? 'Criando...' : 'Criar conta'}
          </Button>
        </form>
      </AuthCard>
    </div>
  )
}

export default RegisterPage
