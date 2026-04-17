import React, { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/store/useAuthStore'
import SubscriptionBanner from '@/features/auth/components/SubscriptionBanner'
import NotificationBell from '@/features/alerts/components/NotificationBell'

// ─── Icons ──────────────────────────────────────────────────────────────────

const IconDashboard = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
)
const IconOperation = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
)
const IconFinance = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)
const IconPlanning = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
)
const IconOrdinarySchedule = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M6 6h12a2 2 0 012 2v10a2 2 0 01-2 2H9l-5 1V8a2 2 0 012-2z" />
  </svg>
)
const IconReports = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
)
const IconAlerts = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
)
const IconInsights = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
)
const IconProfile = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)
const IconLogout = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
)

// ─── Nav config ──────────────────────────────────────────────────────────────

type NavItem = { to: string; label: string; icon: React.ReactNode }
type NavGroup = { label: string; items: NavItem[] }

const navGroups: NavGroup[] = [
  {
    label: 'Principal',
    items: [
      { to: '/dashboard',    label: 'Dashboard',    icon: <IconDashboard /> },
      { to: '/operation',    label: 'Operação',     icon: <IconOperation /> },
    ],
  },
  {
    label: 'Gestão',
    items: [
      { to: '/finance',      label: 'Financeiro',   icon: <IconFinance /> },
      { to: '/planning',     label: 'Planejamento', icon: <IconPlanning /> },
      { to: '/ordinary-schedule', label: 'Escala Ordinaria', icon: <IconOrdinarySchedule /> },
      { to: '/reports',      label: 'Relatórios',   icon: <IconReports /> },
    ],
  },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function NavItemLink({
  item,
  collapsed,
  onClick,
}: {
  item: NavItem
  collapsed: boolean
  onClick?: () => void
}) {
  return (
    <NavLink
      to={item.to}
      title={item.label}
      onClick={onClick}
      className={({ isActive }) =>
        [
          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
          collapsed ? 'justify-center px-0' : '',
          isActive
            ? 'bg-sky-50 text-sky-700'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
        ].join(' ')
      }
    >
      {item.icon}
      {!collapsed && <span className="truncate">{item.label}</span>}
    </NavLink>
  )
}

function NavGroupSection({
  group,
  collapsed,
  onClick,
}: {
  group: NavGroup
  collapsed: boolean
  onClick?: () => void
}) {
  return (
    <div className="space-y-0.5">
      {!collapsed && (
        <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          {group.label}
        </p>
      )}
      {group.items.map((item) => (
        <NavItemLink key={item.to} item={item} collapsed={collapsed} onClick={onClick} />
      ))}
    </div>
  )
}

// ─── AppShell ────────────────────────────────────────────────────────────────

const AppShell: React.FC = () => {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const clearSession = useAuthStore((state) => state.clearSession)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  const onLogout = () => {
    clearSession()
    setMobileMenuOpen(false)
    navigate('/login', { replace: true })
  }

  const closeMobile = () => setMobileMenuOpen(false)

  const initials = user?.name
    ? user.name
        .split(' ')
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : '?'

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">

      {/* ── Mobile overlay ── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" aria-modal="true" role="dialog">
          <button
            type="button"
            aria-label="Fechar menu"
            onClick={closeMobile}
            className="absolute inset-0 bg-black/30"
          />
          <div className="relative flex h-full w-72 flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h2 className="text-base font-bold text-sky-700">ViraAzul</h2>
                <p className="text-xs text-slate-500">Operação diária</p>
              </div>
              <button
                type="button"
                onClick={closeMobile}
                className="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-600"
              >
                Fechar
              </button>
            </div>

            <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
              {navGroups.map((group) => (
                <NavGroupSection key={group.label} group={group} collapsed={false} onClick={closeMobile} />
              ))}
            </nav>

            <div className="space-y-0.5 border-t border-slate-100 px-3 py-3">
              <NavItemLink
                item={{ to: '/profile', label: 'Meu perfil', icon: <IconProfile /> }}
                collapsed={false}
                onClick={closeMobile}
              />
              <button
                type="button"
                onClick={onLogout}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
              >
                <IconLogout />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto flex min-h-screen max-w-[1400px]">

        {/* ── Sidebar desktop ── */}
        <aside
          className={[
            'hidden lg:flex flex-col flex-shrink-0 border-r border-slate-200 bg-white overflow-hidden transition-all duration-300 ease-in-out',
            collapsed ? 'w-16' : 'w-60',
          ].join(' ')}
        >
          {/* Logo + toggle */}
          <div
            className={[
              'flex items-center border-b border-slate-100 py-3',
              collapsed ? 'flex-col gap-2 px-2 pt-4' : 'justify-between px-4',
            ].join(' ')}
          >
            {collapsed ? (
              <span className="select-none text-base font-bold text-sky-700">VA</span>
            ) : (
              <div className="overflow-hidden">
                <h1 className="whitespace-nowrap text-lg font-bold text-sky-700">ViraAzul</h1>
                <p className="whitespace-nowrap text-xs text-slate-500">Operação diária</p>
              </div>
            )}
            <button
              type="button"
              onClick={() => setCollapsed((c) => !c)}
              aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
              className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            >
              {collapsed ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                  <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 0 1 .02-1.06L11.168 10 7.23 6.29a.75.75 0 1 1 1.04-1.08l4.5 4.25a.75.75 0 0 1 0 1.08l-4.5 4.25a.75.75 0 0 1-1.06-.02Z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                  <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 0 1-.02 1.06L8.832 10l3.938 3.71a.75.75 0 1 1-1.04 1.08l-4.5-4.25a.75.75 0 0 1 0-1.08l4.5-4.25a.75.75 0 0 1 1.06.02Z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          </div>

          {/* Nav groups */}
          <div
            className={[
              'flex-1 space-y-5 overflow-y-auto overflow-x-hidden py-4',
              collapsed ? 'px-2' : 'px-3',
            ].join(' ')}
          >
            {navGroups.map((group) => (
              <NavGroupSection key={group.label} group={group} collapsed={collapsed} />
            ))}
          </div>

          {/* Perfil + logout */}
          <div
            className={[
              'space-y-0.5 border-t border-slate-100 py-3',
              collapsed ? 'px-2' : 'px-3',
            ].join(' ')}
          >
            <NavItemLink
              item={{ to: '/profile', label: 'Meu perfil', icon: <IconProfile /> }}
              collapsed={collapsed}
            />
            <button
              type="button"
              onClick={onLogout}
              title="Sair"
              className={[
                'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50',
                collapsed ? 'justify-center px-0' : '',
              ].join(' ')}
            >
              <IconLogout />
              {!collapsed && <span>Sair</span>}
            </button>
          </div>
        </aside>

        {/* ── Main area ── */}
        <div className="flex min-h-screen flex-1 flex-col">

          {/* Header */}
          <header className="border-b border-slate-200 bg-white px-5 py-3 sm:px-8">
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
                <span className="text-base font-bold text-sky-700 lg:hidden">ViraAzul</span>
              </div>

              <div className="ml-auto flex items-center gap-3">
                <NotificationBell />
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-medium leading-tight text-slate-800">{user?.name}</p>
                  <p className="text-xs leading-tight text-slate-500">{user?.email}</p>
                </div>
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-sky-100 text-sm font-semibold text-sky-700 select-none">
                  {initials}
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 sm:px-8">
            <SubscriptionBanner />
            <Outlet />
          </main>

        </div>
      </div>
    </div>
  )
}

export default AppShell
