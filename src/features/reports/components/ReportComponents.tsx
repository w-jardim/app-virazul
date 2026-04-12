import type { OperationalReport, FinancialReport } from '../types/reports.types'
import MetricCard from '@/features/dashboard/components/MetricCard'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts'

const OPERATIONAL_LABELS: Record<string, string> = {
  AGENDADO: 'Agendado',
  TITULAR: 'Titular',
  RESERVA: 'Reserva',
  REALIZADO: 'Realizado',
  FALTOU: 'Faltou',
  CANCELADO: 'Cancelado',
  NAO_CONVERTIDO: 'Não convertido',
  CONVERTIDO_TITULAR: 'Convertido (titular)',
}

const FINANCIAL_LABELS: Record<string, string> = {
  PREVISTO: 'Previsto',
  PAGO: 'Pago',
  NAO_PAGO: 'Não pago',
  PAGO_PARCIAL: 'Parcial pago',
}

const BAR_COLORS = ['#0ea5e9', '#22c55e', '#f97316', '#a855f7', '#f43f5e', '#94a3b8']

function money(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0)
}

// ── Operational Summary ───────────────────────────────────────────────────────

export function OperationalReportSummary({ report }: { report: OperationalReport }) {
  const { summary, reservation_metrics } = report

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-base font-semibold text-slate-900">Relatório operacional</h3>
      <p className="mt-0.5 text-sm text-slate-500">Indicadores de execução e controle no período selecionado.</p>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricCard label="Total de serviços" value={summary.total_services} />
        <MetricCard label="Horas confirmadas" value={`${summary.confirmed_hours}h`} tone="success" />
        <MetricCard label="Horas realizadas" value={`${summary.realized_hours}h`} tone="success" />
        <MetricCard label="Horas em espera" value={`${summary.waiting_hours}h`} />
      </div>

      {reservation_metrics && (
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Métricas de reserva</p>
          <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div>
              <p className="text-2xl font-semibold text-slate-900">{reservation_metrics.total_reservations}</p>
              <p className="text-xs text-slate-500">Total</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-emerald-700">{reservation_metrics.converted_reservations}</p>
              <p className="text-xs text-slate-500">Convertidas</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-rose-700">{reservation_metrics.non_converted_reservations}</p>
              <p className="text-xs text-slate-500">Não convertidas</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-sky-700">{reservation_metrics.conversion_rate}%</p>
              <p className="text-xs text-slate-500">Taxa de conversão</p>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

// ── Operational By Status Chart ───────────────────────────────────────────────

export function OperationalByStatusChart({ report }: { report: OperationalReport }) {
  const entries = Object.entries(report.by_operational_status ?? {})
    .map(([status, count], idx) => ({
      name: OPERATIONAL_LABELS[status] ?? status,
      count,
      color: BAR_COLORS[idx % BAR_COLORS.length]
    }))
    .filter((item) => item.count > 0)

  if (entries.length === 0) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-base font-semibold text-slate-900">Serviços por situação operacional</h3>
        <p className="mt-2 text-sm text-slate-500">Nenhum serviço com situação operacional registrada no período.</p>
      </section>
    )
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-base font-semibold text-slate-900">Serviços por situação operacional</h3>
      <div className="mt-4 h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={entries} barCategoryGap="35%">
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip formatter={(v: number) => [`${v} serviço(s)`, 'Quantidade']} contentStyle={{ fontSize: 12 }} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {entries.map((entry, idx) => (
                <Cell key={idx} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}

// ── Financial Report Summary ──────────────────────────────────────────────────

export function FinancialReportSummary({ report }: { report: FinancialReport }) {
  const { summary } = report

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-base font-semibold text-slate-900">Relatório financeiro</h3>
      <p className="mt-0.5 text-sm text-slate-500">Consolidado de valores no período selecionado.</p>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricCard label="Total esperado" value={money(summary.total_expected)} />
        <MetricCard label="Total recebido" value={money(summary.total_received)} tone="success" />
        <MetricCard label="Pendente" value={money(summary.total_pending)} tone="warning" />
        <MetricCard label="Em atraso" value={money(summary.total_overdue)} tone="danger" />
      </div>

      <div className="mt-4 flex flex-wrap gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div>
          <p className="text-2xl font-semibold text-sky-700">{summary.received_percentage ?? 0}%</p>
          <p className="text-xs text-slate-500">% recebido</p>
        </div>
        {summary.top_service_type && (
          <div>
            <p className="text-base font-semibold text-slate-800">{summary.top_service_type}</p>
            <p className="text-xs text-slate-500">Tipo com maior valor</p>
          </div>
        )}
      </div>
    </section>
  )
}

// ── Financial By Status Chart ─────────────────────────────────────────────────

export function FinancialByStatusChart({ report }: { report: FinancialReport }) {
  const entries = Object.entries(report.by_financial_status ?? {})
    .map(([status, value], idx) => ({
      name: FINANCIAL_LABELS[status] ?? status,
      value,
      color: BAR_COLORS[idx % BAR_COLORS.length]
    }))
    .filter((item) => item.value > 0)

  if (entries.length === 0) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-base font-semibold text-slate-900">Valores por status financeiro</h3>
        <p className="mt-2 text-sm text-slate-500">Nenhum valor financeiro registrado no período.</p>
      </section>
    )
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-base font-semibold text-slate-900">Valores por status financeiro</h3>
      <div className="mt-4 h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={entries} barCategoryGap="35%">
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => `R$${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(v: number) => [money(v), 'Valor']} contentStyle={{ fontSize: 12 }} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {entries.map((entry, idx) => (
                <Cell key={idx} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}

// ── Financial By Service Type (map → table) ──────────────────────────────────

const SERVICE_TYPE_LABELS: Record<string, string> = {
  ras_voluntary: 'RAS Voluntário',
  ras_compulsory: 'RAS Compulsório',
  proeis: 'PROEIS',
  ordinary_shift: 'Plantão Ordinário',
  other: 'Outro',
}

export function FinancialByServiceTypeTable({ report }: { report: FinancialReport }) {
  const entries = Object.entries(report.by_service_type ?? {}).filter(([, v]) => v > 0)

  if (entries.length === 0) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-base font-semibold text-slate-900">Valores por tipo de serviço</h3>
        <p className="mt-2 text-sm text-slate-500">Nenhum valor registrado por tipo de serviço no período.</p>
      </section>
    )
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-base font-semibold text-slate-900">Valores por tipo de serviço</h3>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="pb-2 font-medium">Tipo</th>
              <th className="pb-2 text-right font-medium">Valor total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {entries.map(([key, value]) => (
              <tr key={key}>
                <td className="py-2 font-medium text-slate-800">{SERVICE_TYPE_LABELS[key] ?? key}</td>
                <td className="py-2 text-right text-slate-700">{money(value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
