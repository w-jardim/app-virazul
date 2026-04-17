import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAlerts, useDismissAlert, useMarkAlertRead } from '../hooks/useAlertsData'
import { useInsights } from '@/features/insights/hooks/useInsights'
import type { Alert } from '../types/alerts.types'

// ── Local config (localStorage) ───────────────────────────────────────────────

type NotifConfig = {
  showDAY: boolean
  showOPERATIONAL: boolean
  showFINANCIAL: boolean
  showInsights: boolean
}

const CONFIG_KEY = 'viraazul_notif_config'
const DEFAULT_CONFIG: NotifConfig = {
  showDAY: true,
  showOPERATIONAL: true,
  showFINANCIAL: true,
  showInsights: true,
}

function loadConfig(): NotifConfig {
  try {
    const raw = localStorage.getItem(CONFIG_KEY)
    if (raw) return { ...DEFAULT_CONFIG, ...JSON.parse(raw) }
  } catch {}
  return { ...DEFAULT_CONFIG }
}

function saveConfig(cfg: NotifConfig) {
  try { localStorage.setItem(CONFIG_KEY, JSON.stringify(cfg)) } catch {}
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const ALERT_META: Record<string, { label: string; color: string; bg: string }> = {
  DAY:         { label: 'Serviço',     color: 'text-sky-700',   bg: 'bg-sky-100'   },
  OPERATIONAL: { label: 'Operacional', color: 'text-amber-700', bg: 'bg-amber-100' },
  FINANCIAL:   { label: 'Financeiro',  color: 'text-rose-700',  bg: 'bg-rose-100'  },
}

const OP_LABELS: Record<string, string> = {
  TITULAR: 'Titular', RESERVA: 'Reserva', REALIZADO: 'Realizado',
  FALTOU: 'Faltou', CANCELADO: 'Cancelado', CONVERTIDO_TITULAR: 'Convertido',
  NAO_CONVERTIDO: 'Não convertido',
}

const FIN_LABELS: Record<string, string> = {
  PREVISTO: 'Previsto', PAGO: 'Pago', NAO_PAGO: 'Não pago', PAGO_PARCIAL: 'Parcial pago',
}

function alertDescription(alert: Alert): string {
  const p = alert.payload
  if (!p) return 'Alerta do sistema'
  if (p.alert_context) return p.alert_context
  const parts: string[] = []
  if (p.service_type_name) parts.push(p.service_type_name)
  if (p.operational_status) parts.push(OP_LABELS[p.operational_status] ?? p.operational_status)
  if (p.financial_status) parts.push(FIN_LABELS[p.financial_status] ?? p.financial_status)
  if (p.start_at) {
    const d = new Date(`${p.start_at}T12:00:00Z`)
    if (Number.isFinite(d.getTime()))
      parts.push(new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(d))
  }
  return parts.join(' · ') || 'Alerta do sistema'
}

function relativeTime(iso: string): string {
  const d = new Date(iso)
  if (!Number.isFinite(d.getTime())) return ''
  const diff = Math.floor((Date.now() - d.getTime()) / 86_400_000)
  if (diff === 0) return 'hoje'
  if (diff === 1) return 'ontem'
  if (diff < 7) return `há ${diff} dias`
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(d)
}

const SEVERITY_STYLE: Record<string, { dot: string; titleColor: string; bg: string }> = {
  critical: { dot: 'bg-rose-500',    titleColor: 'text-rose-700',    bg: 'bg-rose-50'    },
  warning:  { dot: 'bg-amber-500',   titleColor: 'text-amber-700',   bg: 'bg-amber-50'   },
  info:     { dot: 'bg-sky-400',     titleColor: 'text-sky-700',     bg: 'bg-sky-50'     },
  positive: { dot: 'bg-emerald-500', titleColor: 'text-emerald-700', bg: 'bg-emerald-50' },
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function BellIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  )
}

function GearIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [showConfig, setShowConfig] = useState(false)
  const [config, setConfig] = useState<NotifConfig>(loadConfig)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setShowConfig(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const alertsQuery = useAlerts({ status: 'ACTIVE' })
  const { insights, isLoading: insightsLoading } = useInsights()
  const markRead = useMarkAlertRead()
  const dismiss = useDismissAlert()
  const actionBusy = markRead.isPending || dismiss.isPending

  function updateConfig(key: keyof NotifConfig, value: boolean) {
    const next = { ...config, [key]: value }
    setConfig(next)
    saveConfig(next)
  }

  const visibleAlerts = (alertsQuery.data ?? []).filter((a) => {
    if (a.alert_type === 'DAY') return config.showDAY
    if (a.alert_type === 'OPERATIONAL') return config.showOPERATIONAL
    if (a.alert_type === 'FINANCIAL') return config.showFINANCIAL
    return true
  })

  const criticalInsights = config.showInsights
    ? insights
        .filter((i) => i.category === 'alert' && (i.severity === 'critical' || i.severity === 'warning'))
        .slice(0, 3)
    : []

  const badgeCount = visibleAlerts.length + (criticalInsights.length > 0 ? 1 : 0)

  const CONFIG_ITEMS: { key: keyof NotifConfig; label: string; sub: string }[] = [
    { key: 'showDAY',         label: 'Alertas de serviços',   sub: 'Plantões e escalas do dia' },
    { key: 'showOPERATIONAL', label: 'Alertas operacionais',  sub: 'Status de serviços' },
    { key: 'showFINANCIAL',   label: 'Alertas financeiros',   sub: 'Pagamentos e cobranças' },
    { key: 'showInsights',    label: 'Avisos inteligentes',   sub: 'Gerados automaticamente' },
  ]

  return (
    <div ref={ref} className="relative">
      {/* Bell button */}
      <button
        type="button"
        onClick={() => { setOpen((v) => !v); setShowConfig(false) }}
        title="Notificações"
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
      >
        <BellIcon />
        {badgeCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-rose-500 px-0.5 text-[10px] font-bold leading-none text-white">
            {badgeCount > 9 ? '9+' : badgeCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-2xl border border-slate-200 bg-white shadow-xl">

          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-900">Notificações</span>
              {badgeCount > 0 && (
                <span className="rounded-full bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold text-rose-700">
                  {badgeCount}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setShowConfig((v) => !v)}
              title="Configurar notificações"
              className={`rounded-lg p-1.5 transition ${showConfig ? 'bg-sky-50 text-sky-600' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'}`}
            >
              <GearIcon />
            </button>
          </div>

          {/* Config panel */}
          {showConfig && (
            <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                O que mostrar
              </p>
              <div className="space-y-3">
                {CONFIG_ITEMS.map(({ key, label, sub }) => (
                  <label key={key} className="flex cursor-pointer items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-slate-700">{label}</p>
                      <p className="text-xs text-slate-400">{sub}</p>
                    </div>
                    <div
                      onClick={() => updateConfig(key, !config[key])}
                      className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ${config[key] ? 'bg-sky-600' : 'bg-slate-300'}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 translate-y-0.5 rounded-full bg-white shadow transition-transform duration-200 ${config[key] ? 'translate-x-4' : 'translate-x-0.5'}`}
                      />
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Content */}
          <div className="max-h-[26rem] overflow-y-auto">

            {/* Loading */}
            {alertsQuery.isLoading && (
              <div className="px-4 py-8 text-center text-sm text-slate-400">Carregando...</div>
            )}

            {/* Backend alerts */}
            {!alertsQuery.isLoading && visibleAlerts.length > 0 && (
              <div>
                <p className="px-4 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Alertas
                </p>
                {visibleAlerts.map((alert) => {
                  const meta = ALERT_META[alert.alert_type] ?? ALERT_META.OPERATIONAL
                  return (
                    <div
                      key={alert.id}
                      className="flex items-start gap-2.5 px-4 py-2.5 hover:bg-slate-50"
                    >
                      <span
                        className={`mt-0.5 flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${meta.bg} ${meta.color}`}
                      >
                        {meta.label}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm leading-snug text-slate-800">
                          {alertDescription(alert)}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-400">{relativeTime(alert.created_at)}</p>
                      </div>
                      <div className="flex flex-shrink-0 gap-1">
                        <button
                          type="button"
                          disabled={actionBusy}
                          onClick={() => markRead.mutate(alert.id)}
                          title="Marcar como lido"
                          className="rounded-md p-1 text-slate-400 transition hover:bg-emerald-50 hover:text-emerald-600 disabled:opacity-40"
                        >
                          <CheckIcon />
                        </button>
                        <button
                          type="button"
                          disabled={actionBusy}
                          onClick={() => dismiss.mutate(alert.id)}
                          title="Dispensar"
                          className="rounded-md p-1 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-40"
                        >
                          <XIcon />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Insights */}
            {criticalInsights.length > 0 && (
              <div className={visibleAlerts.length > 0 ? 'border-t border-slate-100' : ''}>
                <p className="px-4 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Avisos
                </p>
                <div className="space-y-2 px-3 pb-2">
                  {criticalInsights.map((insight) => {
                    const s = SEVERITY_STYLE[insight.severity] ?? SEVERITY_STYLE.info
                    return (
                      <div key={insight.id} className={`rounded-xl p-3 ${s.bg}`}>
                        <div className="flex items-start gap-2">
                          <span className={`mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ${s.dot}`} />
                          <div>
                            <p className={`text-sm font-medium ${s.titleColor}`}>{insight.title}</p>
                            <p className="mt-0.5 text-xs text-slate-600">{insight.description}</p>
                            {insight.action && (
                              <Link
                                to={insight.action.to}
                                onClick={() => setOpen(false)}
                                className={`mt-1 inline-block text-xs font-medium underline underline-offset-2 ${s.titleColor}`}
                              >
                                {insight.action.label} →
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Empty state */}
            {!alertsQuery.isLoading && visibleAlerts.length === 0 && criticalInsights.length === 0 && (
              <div className="px-4 py-10 text-center">
                <p className="text-sm font-medium text-slate-700">Tudo em ordem</p>
                <p className="mt-1 text-xs text-slate-400">Nenhuma notificação no momento.</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-100 px-4 py-2.5">
            <Link
              to="/alerts"
              onClick={() => setOpen(false)}
              className="text-xs font-medium text-sky-600 hover:text-sky-700"
            >
              Ver histórico completo de alertas →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
