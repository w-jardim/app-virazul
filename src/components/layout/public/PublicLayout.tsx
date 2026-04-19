import React, { useState } from 'react'
import { Link, Outlet } from 'react-router-dom'

// ─── Navbar ───────────────────────────────────────────────────────────────────

export const PublicNavbar: React.FC = () => {
  const [open, setOpen] = useState(false)

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-blue-950/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500 text-xs font-bold text-white select-none">
            VA
          </div>
          <span className="text-[15px] font-semibold text-white tracking-tight">ViraAzul</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link to="/#funcionalidades" className="text-sm text-blue-200 transition hover:text-white">Funcionalidades</Link>
          <Link to="/#publico" className="text-sm text-blue-200 transition hover:text-white">Para quem é</Link>
          <Link to="/#planos" className="text-sm text-blue-200 transition hover:text-white">Planos</Link>
          <Link to="/contato" className="text-sm text-blue-200 transition hover:text-white">Contato</Link>
        </nav>

        {/* CTA */}
        <div className="hidden items-center gap-3 md:flex">
          <Link to="/login" className="text-sm font-medium text-blue-200 transition hover:text-white">
            Entrar
          </Link>
          <Link
            to="/register"
            className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-400"
          >
            Começar grátis
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="rounded-md p-2 text-blue-300 transition hover:bg-white/5 md:hidden"
          aria-label="Menu"
        >
          {open ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-blue-950 px-5 py-4 md:hidden">
          <nav className="flex flex-col gap-3">
            <Link to="/#funcionalidades" onClick={() => setOpen(false)} className="text-sm text-blue-200 hover:text-white">Funcionalidades</Link>
            <Link to="/#publico"         onClick={() => setOpen(false)} className="text-sm text-blue-200 hover:text-white">Para quem é</Link>
            <Link to="/#planos"          onClick={() => setOpen(false)} className="text-sm text-blue-200 hover:text-white">Planos</Link>
            <Link to="/contato"          onClick={() => setOpen(false)} className="text-sm text-blue-200 hover:text-white">Contato</Link>
            <hr className="border-white/10" />
            <Link to="/login"    className="text-sm font-medium text-blue-200 hover:text-white">Entrar</Link>
            <Link to="/register" className="rounded-lg bg-blue-500 px-4 py-2.5 text-center text-sm font-semibold text-white">Começar grátis</Link>
          </nav>
        </div>
      )}
    </header>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────

export const PublicFooter: React.FC = () => (
  <footer className="border-t border-slate-200 bg-white py-8">
    <div className="mx-auto max-w-5xl px-5">
      <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-900 text-xs font-bold text-white select-none">
            VA
          </div>
          <span className="text-sm font-semibold text-slate-800">ViraAzul</span>
        </Link>

        <p className="text-[12px] text-slate-400 text-center">
          © {new Date().getFullYear()} ViraAzul. Todos os direitos reservados.<br />
          <span className="text-slate-300">Desenvolvido por Plagard Systems</span>
        </p>

        <nav className="flex gap-5">
          <Link to="/privacidade" className="text-[12px] text-slate-400 transition hover:text-slate-600">Privacidade</Link>
          <Link to="/termos"      className="text-[12px] text-slate-400 transition hover:text-slate-600">Termos</Link>
          <Link to="/contato"     className="text-[12px] text-slate-400 transition hover:text-slate-600">Contato</Link>
        </nav>
      </div>
    </div>
  </footer>
)

// ─── Layout wrapper ───────────────────────────────────────────────────────────

const PublicLayout: React.FC = () => (
  <div className="min-h-screen bg-white text-slate-900">
    <PublicNavbar />
    <Outlet />
    <PublicFooter />
  </div>
)

export default PublicLayout
