import type { OperationalReport, FinancialReport } from '../types/reports.types'
import type { ServiceType } from '@/features/services/types/services.types'
import MetricCard from '@/features/dashboard/components/MetricCard'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

function money(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0)
}

function pct(part: number, total: number) {
  if (!total || total <= 0) return 0
  return Math.max(0, Math.min(100, Math.round((part / total) * 100)))
}

const OPERATIONAL_LABELS: Record<string, string> = {
  TITULAR: 'Titular',
  RESERVA: 'Reserva',
  REALIZADO: 'Realizado',
  CONVERTIDO_TITULAR: 'Convertido',
  FALTOU: 'Faltou',
  CANCELADO: 'Cancelado',
  NAO_CONVERTIDO: 'Não convertido',
}

const OPERATIONAL_COLORS: Record<string, string> = {
  TITULAR: '#0ea5e9',
  RESERVA: '#a855f7',
  REALIZADO: '#22c55e',
  CONVERTIDO_TITULAR: '#10b981',
  FALTOU: '#f43f5e',
  CANCELADO: '#94a3b8',
  NAO_CONVERTIDO: '#f97316',
}

// ── Summary cards ─────────────────────────────────────────────────────────────

export function ReportSummaryCards({
  operational,
  financial,
}: {
  operational: OperationalReport
  financial: FinancialReport
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <MetricCard label="Serviços" value={operational.summary.total_services} />
      <MetricCard label="Horas confirmadas" value={`${operational.summary.confirmed_hours}h`} />
      <MetricCard label="Recebido" value={money(financial.summary.total_received)} tone="success" />
      <MetricCard label="A receber" value={money(financial.summary.total_pending + financial.summary.total_overdue)} tone="warning" />
    </div>
  )
}

// ── Operational status — horizontal bar chart ─────────────────────────────────

export function OperationalStatusChart({ report }: { report: OperationalReport }) {
  const entries = Object.entries(report.by_operational_status ?? {})
    .filter(([, count]) => count > 0)
    .map(([status, count]) => ({
      name: OPERATIONAL_LABELS[status] ?? status,
      count,
      color: OPERATIONAL_COLORS[status] ?? '#94a3b8',
    }))
    .sort((a, b) => b.count - a.count)

  if (entries.length === 0) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-base font-semibold text-slate-900">Serviços por situação</h3>
        <p className="mt-3 text-sm text-slate-500">Nenhum serviço registrado no período.</p>
      </section>
    )
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-base font-semibold text-slate-900">Serviços por situação</h3>
      <div style={{ height: entries.length * 44 + 16 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={entries}
            layout="vertical"
            barCategoryGap="25%"
            margin={{ left: 8, right: 24, top: 0, bottom: 0 }}
          >
            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
            <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} />
            <Tooltip
              formatter={(v: number) => [`${v} serviço${v !== 1 ? 's' : ''}`, '']}
              contentStyle={{ fontSize: 12 }}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
              {entries.map((entry, idx) => (
                <Cell key={idx} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {report.reservation_metrics && report.reservation_metrics.total_reservations > 0 && (
        <div className="mt-4 flex flex-wrap gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
          <div>
            <p className="font-semibold text-slate-900">{report.reservation_metrics.total_reservations}</p>
            <p className="text-xs text-slate-500">Reservas</p>
          </div>
          <div>
            <p className="font-semibold text-emerald-700">{report.reservation_metrics.converted_reservations}</p>
            <p className="text-xs text-slate-500">Convertidas</p>
          </div>
          <div>
            <p className="font-semibold text-sky-700">{report.reservation_metrics.conversion_rate}%</p>
            <p className="text-xs text-slate-500">Taxa de conversão</p>
          </div>
        </div>
      )}
    </section>
  )
}

// ── Financial split — stacked progress bar ────────────────────────────────────

export function FinancialSplitBar({ report }: { report: FinancialReport }) {
  const { summary } = report
  const total = summary.total_expected
  const receivedPct = pct(summary.total_received, total)
  const pendingPct = pct(summary.total_pending, total)
  const overduePct = pct(summary.total_overdue, total)

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-4">
        <h3 className="text-base font-semibold text-slate-900">Situação financeira</h3>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
          {receivedPct}% recebido
        </span>
      </div>

      {total > 0 ? (
        <>
          <div className="mb-4 flex h-5 w-full overflow-hidden rounded-full bg-slate-100">
            {receivedPct > 0 && (
              <div
                className="h-full bg-emerald-500 transition-all"
                style={{ width: `${receivedPct}%` }}
                title={`Recebido: ${money(summary.total_received)}`}
              />
            )}
            {pendingPct > 0 && (
              <div
                className="h-full bg-amber-400 transition-all"
                style={{ width: `${pendingPct}%` }}
                title={`Pendente: ${money(summary.total_pending)}`}
              />
            )}
            {overduePct > 0 && (
              <div
                className="h-full bg-rose-500 transition-all"
                style={{ width: `${overduePct}%` }}
                title={`Em atraso: ${money(summary.total_overdue)}`}
              />
            )}
          </div>

          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 flex-shrink-0 rounded-full bg-emerald-500" />
              <div>
                <p className="font-medium text-slate-800">{money(summary.total_received)}</p>
                <p className="text-xs text-slate-500">Recebido</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 flex-shrink-0 rounded-full bg-amber-400" />
              <div>
                <p className="font-medium text-slate-800">{money(summary.total_pending)}</p>
                <p className="text-xs text-slate-500">Pendente</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 flex-shrink-0 rounded-full bg-rose-500" />
              <div>
                <p className="font-medium text-slate-800">{money(summary.total_overdue)}</p>
                <p className="text-xs text-slate-500">Em atraso</p>
              </div>
            </div>
          </div>

          <p className="mt-3 text-xs text-slate-400">
            Total esperado: <span className="font-medium text-slate-600">{money(total)}</span>
          </p>
        </>
      ) : (
        <p className="text-sm text-slate-500">Nenhum valor financeiro registrado no período.</p>
      )}
    </section>
  )
}

// ── Service type breakdown — horizontal bars ──────────────────────────────────

export function ServiceTypeBreakdown({
  report,
  serviceTypes,
}: {
  report: FinancialReport
  serviceTypes: ServiceType[]
}) {
  const nameMap = Object.fromEntries(serviceTypes.map((t) => [t.key, t.name]))
  const entries = Object.entries(report.by_service_type ?? {})
    .filter(([, v]) => v > 0)
    .map(([key, value]) => ({ key, name: nameMap[key] ?? key, value }))
    .sort((a, b) => b.value - a.value)

  if (entries.length === 0) return null

  const max = entries[0].value

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-base font-semibold text-slate-900">Receita por tipo de serviço</h3>
      <div className="space-y-3">
        {entries.map(({ key, name, value }) => (
          <div key={key}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="font-medium text-slate-700">{name}</span>
              <span className="text-slate-500">{money(value)}</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-sky-500 transition-all duration-500"
                style={{ width: `${pct(value, max)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
