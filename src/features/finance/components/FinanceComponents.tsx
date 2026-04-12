import type { FinanceSummary, FinanceReportByServiceType } from '../types/finance.types'
import MetricCard from '@/features/dashboard/components/MetricCard'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'

const FINANCIAL_LABELS: Record<string, string> = {
  PREVISTO: 'Previsto',
  PAGO: 'Pago',
  NAO_PAGO: 'Não pago',
  PAGO_PARCIAL: 'Parcial pago',
}

const STATUS_COLORS: Record<string, string> = {
  PAGO: '#22c55e',
  NAO_PAGO: '#f97316',
  PAGO_PARCIAL: '#facc15',
  PREVISTO: '#38bdf8',
}

function money(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0)
}

// ── Summary Cards ──────────────────────────────────────────────────────────────

export function FinanceSummaryCards({ summary }: { summary: FinanceSummary }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-base font-semibold text-slate-900">Resumo financeiro</h3>
      <p className="mt-0.5 text-sm text-slate-500">Consolidado de serviços financeiramente relevantes no período.</p>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricCard label="Esperado" value={money(summary.total_expected)} />
        <MetricCard label="Recebido" value={money(summary.total_received)} tone="success" />
        <MetricCard label="Pendente" value={money(summary.total_pending)} tone="warning" />
        <MetricCard label="Em atraso" value={money(summary.total_overdue)} tone="danger" />
      </div>
    </section>
  )
}

// ── By Status Chart ───────────────────────────────────────────────────────────

export function FinanceByStatusChart({ summary }: { summary: FinanceSummary }) {
  const entries = Object.entries(summary.by_status)
    .filter(([, value]) => value > 0)
    .map(([status, value]) => ({
      name: FINANCIAL_LABELS[status] ?? status,
      value,
      status
    }))

  if (entries.length === 0) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-base font-semibold text-slate-900">Distribuição por status</h3>
        <p className="mt-2 text-sm text-slate-500">Sem dados financeiros para o período selecionado.</p>
      </section>
    )
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-base font-semibold text-slate-900">Distribuição por status</h3>
      <p className="mt-0.5 text-sm text-slate-500">Valor total agregado por situação financeira.</p>
      <div className="mt-4 h-56">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={entries}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {entries.map((entry) => (
                <Cell key={entry.status} fill={STATUS_COLORS[entry.status] ?? '#94a3b8'} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => money(value)} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}

// ── By Service Type Table ─────────────────────────────────────────────────────

export function FinanceByServiceTypeTable({ rows }: { rows: FinanceReportByServiceType[] }) {
  if (rows.length === 0) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-base font-semibold text-slate-900">Por tipo de serviço</h3>
        <p className="mt-2 text-sm text-slate-500">Sem registros financeiros por tipo de serviço no período.</p>
      </section>
    )
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-base font-semibold text-slate-900">Por tipo de serviço</h3>
      <p className="mt-0.5 text-sm text-slate-500">Agrupamento de valores por categoria de serviço.</p>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="pb-2 font-medium">Tipo</th>
              <th className="pb-2 text-right font-medium">Esperado</th>
              <th className="pb-2 text-right font-medium">Recebido</th>
              <th className="pb-2 text-right font-medium">Pendente</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr key={row.service_type}>
                <td className="py-2 font-medium text-slate-800">
                  {row.service_type_name ?? row.service_type}
                </td>
                <td className="py-2 text-right text-slate-700">{money(row.total_expected)}</td>
                <td className="py-2 text-right text-emerald-700">{money(row.total_received)}</td>
                <td className="py-2 text-right text-amber-700">{money(row.total_pending)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
