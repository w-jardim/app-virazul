import React, { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/store/useAuthStore'
import SubscriptionBanner from '@/features/auth/components/SubscriptionBanner'
import NotificationBell from '@/features/alerts/components/NotificationBell'

// ─── Icons ───────────────────────────────────────────────────────────────────

const IconDashboard = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
)
const IconOperation = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
)
const IconFinance = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)
const IconPlanning = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
)
const IconOrdinarySchedule = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M6 6h12a2 2 0 012 2v10a2 2 0 01-2 2H9l-5 1V8a2 2 0 012-2z" />
  </svg>
)
const IconReports = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
)
const IconProfile = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)
const IconLogout = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
)
const IconChevronLeft = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
    <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 0 1-.02 1.06L8.832 10l3.938 3.71a.75.75 0 1 1-1.04 1.08l-4.5-4.25a.75.75 0 0 1 0-1.08l4.5-4.25a.75.75 0 0 1 1.06.02Z" clipRule="evenodd" />
  </svg>
)
const IconChevronRight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 0 1 .02-1.06L11.168 10 7.23 6.29a.75.75 0 1 1 1.04-1.08l4.5 4.25a.75.75 0 0 1 0 1.08l-4.5 4.25a.75.75 0 0 1-1.06-.02Z" clipRule="evenodd" />
  </svg>
)

// ─── Nav config ───────────────────────────────────────────────────────────────

type NavItem = { to: string; label: string; icon: React.ReactNode }
type NavGroup = { label: string; items: NavItem[] }

const navGroups: NavGroup[] = [
  {
    label: 'Principal',
    items: [
      { to: '/dashboard', label: 'Dashboard',  icon: <IconDashboard /> },
      { to: '/operation', label: 'Operação',   icon: <IconOperation /> },
    ],
  },
  {
    label: 'Gestão',
    items: [
      { to: '/finance',           label: 'Financeiro',      icon: <IconFinance /> },
      { to: '/planning',          label: 'Planejamento',    icon: <IconPlanning /> },
      { to: '/ordinary-schedule', label: 'Escala Ordinária', icon: <IconOrdinarySchedule /> },
      { to: '/reports',           label: 'Relatórios',      icon: <IconReports /> },
    ],
  },
]

// ─── NavItemLink ──────────────────────────────────────────────────────────────

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
          'group relative flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] font-medium transition-all duration-150',
          collapsed ? 'justify-center px-0 py-2' : '',
          isActive
            ? 'bg-white/10 text-white'
            : 'text-slate-400 hover:bg-white/5 hover:text-slate-200',
        ].join(' ')
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-r-full bg-sky-400" />
          )}
          <span className={isActive ? 'text-sky-400' : ''}>{item.icon}</span>
          {!collapsed && <span className="truncate">{item.label}</span>}
        </>
      )}
    </NavLink>
  )
}

// ─── NavGroupSection ──────────────────────────────────────────────────────────

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
        <p className="mb-1.5 px-2.5 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
          {group.label}
        </p>
      )}
      {collapsed && <div className="my-2 mx-auto h-px w-6 bg-slate-800" />}
      {group.items.map((item) => (
        <NavItemLink key={item.to} item={item} collapsed={collapsed} onClick={onClick} />
      ))}
    </div>
  )
}

// ─── AppShell ─────────────────────────────────────────────────────────────────

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
    <div className="min-h-screen bg-slate-50 text-slate-900">

      {/* ── Mobile overlay ── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" aria-modal="true" role="dialog">
          <button
            type="button"
            aria-label="Fechar menu"
            onClick={closeMobile}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />
          <div className="relative flex h-full w-72 flex-col bg-slate-950 shadow-2xl">
            {/* Logo mobile */}
            <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-sky-500 text-xs font-bold text-white">
                  VA
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-white">ViraAzul</h2>
                  <p className="text-[11px] text-slate-500">Operação diária</p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeMobile}
                className="rounded-md p-1.5 text-slate-500 transition hover:bg-white/5 hover:text-slate-300"
                aria-label="Fechar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
              {navGroups.map((group) => (
                <NavGroupSection key={group.label} group={group} collapsed={false} onClick={closeMobile} />
              ))}
            </nav>

            {/* Bottom mobile */}
            <div className="border-t border-white/5 px-3 py-3 space-y-0.5">
              <NavItemLink
                item={{ to: '/profile', label: 'Meu perfil', icon: <IconProfile /> }}
                collapsed={false}
                onClick={closeMobile}
              />
              <button
                type="button"
                onClick={onLogout}
                className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] font-medium text-red-400 transition hover:bg-white/5"
              >
                <IconLogout />
                <span>Sair</span>
              </button>
            </div>

            {/* User mobile */}
            <div className="border-t border-white/5 px-4 py-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-sky-500/20 text-xs font-semibold text-sky-400 select-none">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium text-slate-200">{user?.name}</p>
                  <p className="truncate text-[11px] text-slate-500">{user?.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex min-h-screen">

        {/* ── Sidebar desktop ── */}
        <aside
          className={[
            'hidden lg:flex flex-col flex-shrink-0 bg-slate-950 overflow-hidden transition-all duration-300 ease-in-out',
            collapsed ? 'w-14' : 'w-56',
          ].join(' ')}
        >
          {/* Logo + toggle */}
          <div
            className={[
              'flex items-center border-b border-white/5 py-3',
              collapsed ? 'flex-col gap-3 px-0 pt-4 items-center' : 'justify-between px-4',
            ].join(' ')}
          >
            {collapsed ? (
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-sky-500 text-xs font-bold text-white select-none">
                VA
              </div>
            ) : (
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-sky-500 text-xs font-bold text-white">
                  VA
                </div>
                <div className="overflow-hidden">
                  <h1 className="whitespace-nowrap text-sm font-semibold text-white">ViraAzul</h1>
                  <p className="whitespace-nowrap text-[11px] text-slate-500">Operação diária</p>
                </div>
              </div>
            )}
            <button
              type="button"
              onClick={() => setCollapsed((c) => !c)}
              aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
              className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md text-slate-600 transition hover:bg-white/5 hover:text-slate-400"
            >
              {collapsed ? <IconChevronRight /> : <IconChevronLeft />}
            </button>
          </div>

          {/* Nav groups */}
          <div
            className={[
              'flex-1 space-y-5 overflow-y-auto overflow-x-hidden py-4',
              collapsed ? 'px-1' : 'px-3',
            ].join(' ')}
          >
            {navGroups.map((group) => (
              <NavGroupSection key={group.label} group={group} collapsed={collapsed} />
            ))}
          </div>

          {/* Bottom: profile + logout */}
          <div
            className={[
              'space-y-0.5 border-t border-white/5 py-3',
              collapsed ? 'px-1' : 'px-3',
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
                'flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] font-medium text-red-400 transition hover:bg-white/5',
                collapsed ? 'justify-center px-0 py-2' : '',
              ].join(' ')}
            >
              <IconLogout />
              {!collapsed && <span>Sair</span>}
            </button>
          </div>

          {/* User info */}
          {!collapsed && (
            <div className="border-t border-white/5 px-4 py-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-sky-500/20 text-xs font-semibold text-sky-400 select-none">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium text-slate-300">{user?.name}</p>
                  <p className="truncate text-[11px] text-slate-600">{user?.email}</p>
                </div>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="border-t border-white/5 flex justify-center py-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-500/20 text-xs font-semibold text-sky-400 select-none" title={user?.name}>
                {initials}
              </div>
            </div>
          )}
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
                <span className="text-sm font-semibold text-slate-800 lg:hidden">ViraAzul</span>
              </div>

              <div className="ml-auto flex items-center gap-3">
                <NotificationBell />
                <div className="hidden text-right sm:block">
                  <p className="text-[13px] font-medium leading-tight text-slate-800">{user?.name}</p>
                  <p className="text-[11px] leading-tight text-slate-500">{user?.email}</p>
                </div>
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-sky-500/10 text-xs font-semibold text-sky-600 select-none ring-2 ring-sky-100">
                  {initials}
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 sm:px-6">
            <SubscriptionBanner />
            <Outlet />
          </main>

        </div>
      </div>
    </div>
  )
}

export default AppShell
