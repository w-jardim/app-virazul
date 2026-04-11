import React, { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/store/useAuthStore'
import { isAdminMaster } from '@/features/auth/utils/roles'

type NavItem = {
  to: string
  label: string
  roles?: Array<'POLICE' | 'ADMIN_MASTER'>
}

const navItems: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/agenda', label: 'Agenda' },
  { to: '/services', label: 'Servicos' },
  { to: '/alerts', label: 'Alertas' },
  { to: '/planning', label: 'Planejamento' },
  { to: '/finance', label: 'Financeiro' },
  { to: '/reports', label: 'Relatorios' },
  { to: '/admin', label: 'Administracao', roles: ['ADMIN_MASTER'] }
]

const AppShell: React.FC = () => {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const clearSession = useAuthStore((state) => state.clearSession)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const onLogout = () => {
    clearSession()
    setMobileMenuOpen(false)
    navigate('/login', { replace: true })
  }

  const renderNav = (onNavigate?: () => void) => (
    <nav className="space-y-2">
      {navItems.map((item) => {
        if (item.roles && user && !item.roles.includes(user.role)) {
          return null
        }

        return (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={({ isActive }) =>
              [
                'block rounded-lg px-3 py-2 text-sm transition',
                isActive ? 'bg-sky-50 text-sky-700' : 'text-slate-600 hover:bg-slate-100'
              ].join(' ')
            }
          >
            {item.label}
          </NavLink>
        )
      })}
    </nav>
  )

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      {mobileMenuOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden" aria-modal="true" role="dialog">
          <button
            type="button"
            aria-label="Fechar menu"
            onClick={() => setMobileMenuOpen(false)}
            className="absolute inset-0 bg-black/30"
          />
          <div className="relative h-full w-72 bg-white p-5 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-sky-700">Menu</h2>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-600"
              >
                Fechar
              </button>
            </div>
            {renderNav(() => setMobileMenuOpen(false))}
          </div>
        </div>
      ) : null}

      <div className="mx-auto flex min-h-screen max-w-[1400px]">
        <aside className="hidden w-72 border-r border-slate-200 bg-white p-6 lg:block">
          <div>
            <h1 className="text-xl font-semibold text-sky-700">ViraAzul</h1>
            <p className="mt-2 text-xs text-slate-500">Operacao diaria</p>
          </div>

          <div className="mt-8">{renderNav()}</div>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="border-b border-slate-200 bg-white px-5 py-4 sm:px-8">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  aria-label="Abrir menu"
                  onClick={() => setMobileMenuOpen(true)}
                  className="rounded-md border border-slate-300 px-2.5 py-2 text-xs text-slate-600 lg:hidden"
                >
                  Menu
                </button>
                <div>
                  <p className="text-sm font-medium text-slate-800">{user?.name}</p>
                  <p className="text-xs text-slate-500">{user?.email}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-800">Perfil</p>
                <p className="text-xs text-slate-500">
                  {isAdminMaster(user) ? 'ADMIN_MASTER' : 'POLICE'}
                </p>
              </div>

              <button
                type="button"
                onClick={onLogout}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
              >
                Sair
              </button>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 sm:px-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}

export default AppShell
