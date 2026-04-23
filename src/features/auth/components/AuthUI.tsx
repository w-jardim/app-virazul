import React from 'react'
import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'

// ─── Loading ──────────────────────────────────────────────────────────────────

export const AuthLoading = ({ label = 'Carregando sessão...' }: { label?: string }) => (
  <div className="min-h-screen bg-blue-950 flex items-center justify-center px-4">
    <div className="flex flex-col items-center gap-3">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-blue-400" />
      <p className="text-sm text-blue-300">{label}</p>
    </div>
  </div>
)

// ─── Branding panel (left side) ───────────────────────────────────────────────

const BrandPanel: React.FC = () => (
  <div className="relative hidden overflow-hidden bg-blue-950 lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
    {/* Fundo decorativo */}
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-blue-700/20 blur-3xl" />
      <div className="absolute bottom-0 -left-20 h-64 w-64 rounded-full bg-blue-800/30 blur-3xl" />
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '28px 28px' }}
      />
    </div>

    {/* Logo */}
    <Link to="/" className="relative flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500 text-sm font-bold text-white">
        VA
      </div>
      <span className="text-lg font-semibold text-white tracking-tight">ViraAzul</span>
    </Link>

    {/* Pitch central */}
    <div className="relative">
      <blockquote className="text-2xl font-semibold leading-snug text-white xl:text-3xl">
        "Organize sua escala, controle seu financeiro e foque no que realmente importa."
      </blockquote>
      <p className="mt-4 text-base text-blue-300/70">
        Plataforma de gestão operacional para PM, PC, BM, GM e Agentes Penitenciários.
      </p>

      <ul className="mt-8 space-y-3">
        {[
          'Plano Free para comecar sem custo',
          'Plano Pro por apenas R$ 2,99/mes',
          'PIX ou cartão — sem burocracia',
          'Cancele quando quiser',
        ].map((item) => (
          <li key={item} className="flex items-center gap-2.5 text-sm text-blue-200/80">
            <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-500 text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
              </svg>
            </span>
            {item}
          </li>
        ))}
      </ul>
    </div>

    {/* Rodapé */}
    <p className="relative text-xs text-blue-400/40">
      © {new Date().getFullYear()} ViraAzul · Plagard Systems
    </p>
  </div>
)

// ─── AuthCard (right panel wrapper) ──────────────────────────────────────────

export const AuthCard = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen bg-white lg:grid lg:grid-cols-2">
    <BrandPanel />
    <div className="flex items-center justify-center px-5 py-12 lg:px-12 xl:px-16">
      <div className="w-full max-w-md">
        {/* Logo mobile */}
        <Link to="/" className="mb-8 flex items-center gap-2.5 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white">
            VA
          </div>
          <span className="text-[15px] font-semibold text-slate-900">ViraAzul</span>
        </Link>
        {children}
      </div>
    </div>
  </div>
)



