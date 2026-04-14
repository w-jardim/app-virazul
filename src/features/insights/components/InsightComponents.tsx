import React from 'react'
import { Link } from 'react-router-dom'
import type { Insight, InsightCategory, InsightSeverity, SourceStatus } from '../types/insights.types'

// ── Style maps ────────────────────────────────────────────────────────────────

const SEVERITY_STYLES: Record<InsightSeverity, { border: string; bg: string; icon: string; text: string }> = {
  critical: { border: 'border-rose-300', bg: 'bg-rose-50', icon: 'text-rose-600', text: 'text-rose-900' },
  warning:  { border: 'border-amber-300', bg: 'bg-amber-50', icon: 'text-amber-600', text: 'text-amber-900' },
  positive: { border: 'border-emerald-300', bg: 'bg-emerald-50', icon: 'text-emerald-600', text: 'text-emerald-900' },
  info:     { border: 'border-sky-300', bg: 'bg-sky-50', icon: 'text-sky-600', text: 'text-sky-900' },
}

const CATEGORY_META: Record<InsightCategory, { label: string; emoji: string; color: string }> = {
  alert:          { label: 'Alertas', emoji: '🔴', color: 'text-rose-700' },
  opportunity:    { label: 'Oportunidades', emoji: '🟢', color: 'text-emerald-700' },
  recommendation: { label: 'Recomendações', emoji: '🟡', color: 'text-amber-700' },
  trend:          { label: 'Tendências', emoji: '🔵', color: 'text-sky-700' },
}

// ── Icons ─────────────────────────────────────────────────────────────────────

const IconAlert = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
  </svg>
)

const IconCheck = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const IconBulb = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.674M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
)

const IconTrend = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
)

const CATEGORY_ICON: Record<InsightCategory, React.ReactNode> = {
  alert: <IconAlert />,
  opportunity: <IconCheck />,
  recommendation: <IconBulb />,
  trend: <IconTrend />,
}

// ── InsightCard ───────────────────────────────────────────────────────────────

export function InsightCard({ insight }: { insight: Insight }) {
  const s = SEVERITY_STYLES[insight.severity]

  return (
    <div className={`rounded-xl border ${s.border} ${s.bg} p-4 transition-shadow hover:shadow-sm`}>
      <div className="flex items-start gap-3">
        <span className={`mt-0.5 flex-shrink-0 ${s.icon}`}>
          {CATEGORY_ICON[insight.category]}
        </span>
        <div className="min-w-0 flex-1">
          <p className={`text-sm font-semibold ${s.text}`}>{insight.title}</p>
          <p className="mt-0.5 text-sm text-slate-700">{insight.description}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {insight.metric && (
              <span className="inline-block rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                {insight.metric}
              </span>
            )}
            {insight.action && (
              <Link
                to={insight.action.to}
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${s.text} hover:underline`}
              >
                {insight.action.label} &rarr;
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── InsightList ───────────────────────────────────────────────────────────────

export function InsightList({ insights }: { insights: Insight[] }) {
  if (insights.length === 0) return null

  return (
    <div className="space-y-3">
      {insights.map((ins) => (
        <InsightCard key={ins.id} insight={ins} />
      ))}
    </div>
  )
}

// ── InsightSection ────────────────────────────────────────────────────────────

type InsightSectionProps = {
  category: InsightCategory
  insights: Insight[]
}

export function InsightSection({ category, insights }: InsightSectionProps) {
  const meta = CATEGORY_META[category]

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className={`text-base font-semibold ${meta.color} flex items-center gap-2`}>
        <span>{meta.emoji}</span>
        {meta.label}
      </h3>
      {insights.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">
          Nenhum insight nesta categoria para o período atual.
        </p>
      ) : (
        <div className="mt-3">
          <InsightList insights={insights} />
        </div>
      )}
    </section>
  )
}

// ── SourceWarningBanner ───────────────────────────────────────────────────────

export function SourceWarningBanner({ sources }: { sources: SourceStatus[] }) {
  const failed = sources.filter((s) => s.isError)
  if (failed.length === 0) return null

  return (
    <div className="rounded-xl border border-amber-300 bg-amber-50 p-4" role="alert">
      <p className="text-sm font-medium text-amber-900">
        Algumas fontes de dados não puderam ser carregadas:{' '}
        {failed.map((s) => s.label).join(', ')}.
      </p>
      <p className="mt-1 text-xs text-amber-700">
        Os insights abaixo foram gerados com dados parciais e podem não refletir o cenário completo.
      </p>
    </div>
  )
}
