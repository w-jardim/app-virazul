import React, { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/store/useAuthStore'

// ─── Icons ───────────────────────────────────────────────────────────────────

const IconGrid = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
)
const IconUsers = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
)
const IconCreditCard = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
)
const IconWallet = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 7h14a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V9a2 2 0 012-2z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11h2a1 1 0 010 2h-2" />
  </svg>
)
const IconAnalytics = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 13v4M12 9v8M17 5v12" />
  </svg>
)
const IconLogout = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
)

// ─── Nav config ───────────────────────────────────────────────────────────────

type NavItem = { to: string; label: string; icon: React.ReactNode; end?: boolean }

const navItems: NavItem[] = [
  { to: '/admin',               label: 'Visão Geral',  icon: <IconGrid />,       end: true },
  { to: '/admin/users',         label: 'Usuários',     icon: <IconUsers />,      end: false },
  { to: '/admin/subscriptions', label: 'Assinaturas',  icon: <IconCreditCard />, end: false },
  { to: '/admin/payments',      label: 'Pagamentos',   icon: <IconWallet />,     end: false },
  { to: '/admin/analytics',     label: 'Analytics',    icon: <IconAnalytics />,  end: false },
]

// ─── NavItemLink ──────────────────────────────────────────────────────────────

function AdminNavLink({ item, onClick }: { item: NavItem; onClick?: () => void }) {
  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onClick}
      title={item.label}
      className={({ isActive }) =>
        [
          'group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-150',
          isActive
            ? 'bg-white/10 text-white'
            : 'text-slate-400 hover:bg-white/5 hover:text-slate-200',
        ].join(' ')
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-r-full bg-indigo-400" />
          )}
          <span className={isActive ? 'text-blue-400' : ''}>{item.icon}</span>
          <span className="truncate">{item.label}</span>
        </>
      )}
    </NavLink>
  )
}

// ─── AdminShell ───────────────────────────────────────────────────────────────

const AdminShell: React.FC = () => {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const clearSession = useAuthStore((state) => state.clearSession)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const onLogout = () => {
    clearSession()
    setMobileMenuOpen(false)
    navigate('/login', { replace: true })
  }

  const initials = user?.name
    ? user.name
        .split(' ')
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : '?'

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">

      {/* ── Mobile overlay ── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" aria-modal="true" role="dialog">
          <button
            type="button"
            aria-label="Fechar menu"
            onClick={() => setMobileMenuOpen(false)}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />
          <div className="relative flex h-full w-72 flex-col bg-slate-950 shadow-2xl">
            {/* Logo mobile */}
            <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-700 text-xs font-bold text-white">
                  VA
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-white">ViraAzul</h2>
                  <p className="text-[11px] text-slate-500">Painel Admin</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-md p-1.5 text-slate-500 transition hover:bg-white/5 hover:text-slate-300"
                aria-label="Fechar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-4">
              <div className="space-y-0.5">
                {navItems.map((item) => (
                  <AdminNavLink key={item.to} item={item} onClick={() => setMobileMenuOpen(false)} />
                ))}
              </div>
            </nav>

            {/* Bottom mobile */}
            <div className="border-t border-white/5 px-3 py-3">
              <button
                type="button"
                onClick={onLogout}
                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-red-400 transition hover:bg-white/5"
              >
                <IconLogout />
                <span>Sair</span>
              </button>
            </div>

            {/* User mobile */}
            <div className="border-t border-white/5 px-4 py-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-blue-700/20 text-xs font-semibold text-blue-400 select-none">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-200">{user?.name}</p>
                  <p className="truncate text-[11px] text-slate-500">{user?.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex min-h-screen">

        {/* ── Sidebar desktop ── */}
        <aside className="hidden lg:flex w-56 flex-col flex-shrink-0 bg-slate-950">
          {/* Logo */}
          <div className="flex items-center gap-2.5 border-b border-white/5 px-4 py-3">
            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-blue-700 text-xs font-bold text-white">
              VA
            </div>
            <div className="overflow-hidden">
              <h1 className="whitespace-nowrap text-sm font-semibold text-white">ViraAzul</h1>
              <p className="whitespace-nowrap text-[11px] text-slate-500">Painel Administrativo</p>
            </div>
          </div>

          {/* Nav */}
          <div className="flex-1 overflow-y-auto px-3 py-4">
            <p className="mb-1.5 px-2.5 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
              Administração
            </p>
            <div className="space-y-0.5">
              {navItems.map((item) => (
                <AdminNavLink key={item.to} item={item} />
              ))}
            </div>
          </div>

          {/* Logout */}
          <div className="border-t border-white/5 px-3 py-3">
            <button
              type="button"
              onClick={onLogout}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-red-400 transition hover:bg-white/5"
            >
              <IconLogout />
              <span>Sair</span>
            </button>
          </div>

          {/* User */}
          <div className="border-t border-white/5 px-4 py-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-blue-700/20 text-xs font-semibold text-blue-400 select-none">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-300">{user?.name}</p>
                <p className="truncate text-[11px] text-slate-600">{user?.email}</p>
              </div>
            </div>
          </div>
        </aside>

        {/* ── Main area ── */}
        <div className="flex min-h-screen flex-1 flex-col min-w-0">

          {/* Header */}
          <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur px-5 py-3 sm:px-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {/* Hamburger mobile */}
                <button
                  type="button"
                  aria-label="Abrir menu"
                  onClick={() => setMobileMenuOpen(true)}
                  className="flex items-center gap-1.5 rounded-md p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 lg:hidden"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>

              <div className="ml-auto flex items-center gap-3">
                <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-500 ring-1 ring-blue-900/30">
                  Administrador
                </span>
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-medium leading-tight text-slate-800">{user?.name}</p>
                  <p className="text-[11px] leading-tight text-slate-500">{user?.email}</p>
                </div>
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-700/10 text-xs font-semibold text-blue-500 select-none ring-2 ring-blue-900/30">
                  {initials}
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 sm:px-6">
            <Outlet />
          </main>

        </div>
      </div>
    </div>
  )
}

export default AdminShell
