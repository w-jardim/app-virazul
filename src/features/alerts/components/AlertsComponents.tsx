import React from 'react'
import type { Alert, AlertStatus, AlertType } from '../types/alerts.types'

// ── helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

// ── type badge ────────────────────────────────────────────────────────────────

const TYPE_META: Record<string, { label: string; classes: string }> = {
  DAY: { label: 'Do dia', classes: 'bg-sky-100 text-sky-700' },
  OPERATIONAL: { label: 'Operacional', classes: 'bg-amber-100 text-amber-700' },
  FINANCIAL: { label: 'Financeiro', classes: 'bg-rose-100 text-rose-700' },
}

export const AlertTypeBadge = ({ type }: { type: string }) => {
  const meta = TYPE_META[type] ?? { label: type, classes: 'bg-slate-100 text-slate-600' }
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${meta.classes}`}>
      {meta.label}
    </span>
  )
}

// ── status badge ─────────────────────────────────────────────────────────────

const STATUS_META: Record<string, { label: string; classes: string }> = {
  ACTIVE: { label: 'Ativo', classes: 'bg-emerald-100 text-emerald-700' },
  READ: { label: 'Lido', classes: 'bg-slate-100 text-slate-500' },
  DISMISSED: { label: 'Descartado', classes: 'bg-slate-100 text-slate-400 line-through' },
}

export const AlertStatusBadge = ({ status }: { status: string }) => {
  const meta = STATUS_META[status] ?? { label: status, classes: 'bg-slate-100 text-slate-500' }
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${meta.classes}`}>
      {meta.label}
    </span>
  )
}

// ── single alert card ─────────────────────────────────────────────────────────

type AlertCardProps = {
  alert: Alert
  onMarkRead?: (id: number) => void
  onDismiss?: (id: number) => void
  loadingId?: number | null
}

export const AlertCard = ({ alert, onMarkRead, onDismiss, loadingId }: AlertCardProps) => {
  const isActive = alert.status === 'ACTIVE'
  const busy = loadingId === alert.id

  const serviceInfo = alert.payload?.service_type_name
    ? `${alert.payload.service_type_name}${alert.payload.duration_hours ? ` · ${alert.payload.duration_hours}h` : ''}`
    : null

  const context = alert.payload?.operational_status ?? alert.payload?.financial_status ?? alert.payload?.alert_context ?? null

  return (
    <div
      className={`rounded-xl border p-4 transition ${
        isActive
          ? 'border-slate-200 bg-white shadow-sm'
          : 'border-slate-100 bg-slate-50 opacity-70'
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <AlertTypeBadge type={alert.alert_type} />
          <AlertStatusBadge status={alert.status} />
        </div>
        <span className="text-xs text-slate-400">{formatDate(alert.created_at)}</span>
      </div>

      {(serviceInfo || context) ? (
        <div className="mt-2 space-y-0.5">
          {serviceInfo ? (
            <p className="text-sm font-medium text-slate-800">{serviceInfo}</p>
          ) : null}
          {context ? (
            <p className="text-xs text-slate-500">{context}</p>
          ) : null}
        </div>
      ) : null}

      {isActive ? (
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => onMarkRead?.(alert.id)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            {busy ? '...' : 'Marcar como lido'}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => onDismiss?.(alert.id)}
            className="rounded-lg border border-rose-100 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-100 disabled:opacity-50"
          >
            {busy ? '...' : 'Descartar'}
          </button>
        </div>
      ) : null}
    </div>
  )
}

// ── filter tabs ───────────────────────────────────────────────────────────────

type StatusTab = AlertStatus | 'ALL'

const STATUS_TABS: { key: StatusTab; label: string }[] = [
  { key: 'ALL', label: 'Todos' },
  { key: 'ACTIVE', label: 'Ativos' },
  { key: 'READ', label: 'Lidos' },
  { key: 'DISMISSED', label: 'Descartados' },
]

type FilterTabsProps = {
  active: StatusTab
  onChange: (tab: StatusTab) => void
  counts?: Partial<Record<StatusTab, number>>
}

export const AlertFilterTabs = ({ active, onChange, counts }: FilterTabsProps) => (
  <nav className="flex gap-1 border-b border-slate-200">
    {STATUS_TABS.map(({ key, label }) => (
      <button
        key={key}
        type="button"
        onClick={() => onChange(key)}
        className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition ${
          active === key
            ? 'border-sky-600 text-sky-700'
            : 'border-transparent text-slate-500 hover:text-slate-700'
        }`}
      >
        {label}
        {counts?.[key] !== undefined && counts[key]! > 0 ? (
          <span className="ml-1.5 rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
            {counts[key]}
          </span>
        ) : null}
      </button>
    ))}
  </nav>
)

// ── type filter ───────────────────────────────────────────────────────────────

type TypeFilter = AlertType | 'ALL'

const TYPE_FILTERS: { key: TypeFilter; label: string }[] = [
  { key: 'ALL', label: 'Todos os tipos' },
  { key: 'DAY', label: 'Do dia' },
  { key: 'OPERATIONAL', label: 'Operacional' },
  { key: 'FINANCIAL', label: 'Financeiro' },
]

type TypeFilterSelectProps = {
  value: TypeFilter
  onChange: (value: TypeFilter) => void
}

export const AlertTypeFilterSelect = ({ value, onChange }: TypeFilterSelectProps) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value as TypeFilter)}
    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
  >
    {TYPE_FILTERS.map(({ key, label }) => (
      <option key={key} value={key}>{label}</option>
    ))}
  </select>
)
