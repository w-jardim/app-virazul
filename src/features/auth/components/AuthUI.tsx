import type { ReactNode } from 'react'

export const AuthLoading = ({ label = 'Carregando sessão...' }: { label?: string }) => {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-600">{label}</p>
      </div>
    </div>
  )
}

export const AuthCard = ({ children }: { children: ReactNode }) => {
  return (
    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      {children}
    </div>
  )
}

