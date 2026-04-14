import type { Insight, InsightCategory, InsightSources } from '../types/insights.types'
import { INSIGHT_THRESHOLDS as T, INSIGHT_LIMITS, SEVERITY_PRIORITY } from './thresholds'

// ── Helpers ───────────────────────────────────────────────────────────────────

let _seq = 0
function id(prefix: string) {
  return `${prefix}-${++_seq}`
}

function money(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}

function pct(v: number) {
  return `${Math.round(v)}%`
}

// ── Prioritization & limits ──────────────────────────────────────────────────

export function prioritizeInsights(
  raw: Insight[],
  limits = INSIGHT_LIMITS,
): Insight[] {
  const sorted = [...raw].sort(
    (a, b) => SEVERITY_PRIORITY[a.severity] - SEVERITY_PRIORITY[b.severity],
  )

  const buckets: Record<InsightCategory, Insight[]> = {
    alert: [],
    opportunity: [],
    recommendation: [],
    trend: [],
  }

  for (const ins of sorted) {
    if (buckets[ins.category].length < limits.maxPerCategory) {
      buckets[ins.category].push(ins)
    }
  }

  const merged = [
    ...buckets.alert,
    ...buckets.opportunity,
    ...buckets.recommendation,
    ...buckets.trend,
  ]

  return merged.slice(0, limits.maxTotal)
}

// ── Engine ────────────────────────────────────────────────────────────────────

export function generateInsights(sources: InsightSources): Insight[] {
  _seq = 0
  const insights: Insight[] = []

  // ── Alerts ──────────────────────────────────────────────────────────────

  if (sources.finance) {
    const { total_overdue, total_expected } = sources.finance
    if (total_overdue > 0) {
      const ratio = total_expected > 0 ? (total_overdue / total_expected) * 100 : 0
      insights.push({
        id: id('alert'),
        category: 'alert',
        severity: ratio > T.overdueFinanceCriticalPct ? 'critical' : 'warning',
        title: 'Valores financeiros em atraso',
        description: `Existem ${money(total_overdue)} em atraso, representando ${pct(ratio)} do total esperado.`,
        metric: money(total_overdue),
        action: { label: 'Revisar financeiro', to: '/finance' },
      })
    }
  }

  if (sources.operational) {
    const { by_operational_status, total_services } = sources.operational
    const faltas = (by_operational_status['FALTOU'] ?? 0) + (by_operational_status['CANCELADO'] ?? 0)
    if (faltas > 0 && total_services > 0) {
      const ratio = (faltas / total_services) * 100
      insights.push({
        id: id('alert'),
        category: 'alert',
        severity: ratio > T.faultsCancellationsCriticalPct ? 'critical' : 'warning',
        title: 'Faltas e cancelamentos elevados',
        description: `${faltas} serviço(s) com falta ou cancelamento (${pct(ratio)} do total).`,
        metric: `${faltas}`,
        action: { label: 'Ver agenda', to: '/agenda' },
      })
    }

    const { reservation_metrics } = sources.operational
    if (
      reservation_metrics.total_reservations >= T.minReservationsForConversion &&
      reservation_metrics.conversion_rate < T.lowConversionRate
    ) {
      insights.push({
        id: id('alert'),
        category: 'alert',
        severity: 'warning',
        title: 'Baixa conversão de reservas',
        description: `Apenas ${pct(reservation_metrics.conversion_rate)} das reservas foram convertidas. Priorize serviços como titular.`,
        metric: pct(reservation_metrics.conversion_rate),
        action: { label: 'Ver agenda', to: '/agenda' },
      })
    }
  }

  if (sources.planning) {
    const { goal, confirmed_hours } = sources.planning
    if (goal > 0 && confirmed_hours / goal < T.lowGoalProgress) {
      insights.push({
        id: id('alert'),
        category: 'alert',
        severity: 'warning',
        title: 'Produtividade abaixo do esperado',
        description: `Apenas ${pct((confirmed_hours / goal) * 100)} da meta mensal foi confirmada até agora.`,
        metric: `${confirmed_hours}h / ${goal}h`,
        action: { label: 'Abrir planejamento', to: '/planning' },
      })
    }
  }

  // ── Opportunities ───────────────────────────────────────────────────────

  if (sources.planning) {
    const { remaining_hours, combinations, goal, confirmed_hours } = sources.planning
    if (goal > 0 && remaining_hours > 0 && remaining_hours <= goal * T.nearGoalRemainingPct) {
      insights.push({
        id: id('opp'),
        category: 'opportunity',
        severity: 'positive',
        title: 'Meta quase atingida',
        description: `Faltam apenas ${remaining_hours}h para atingir a meta (${pct((confirmed_hours / goal) * 100)} concluído).`,
        metric: `${remaining_hours}h restantes`,
        action: { label: 'Abrir planejamento', to: '/planning' },
      })
    }

    if (combinations > 0 && remaining_hours > 0) {
      insights.push({
        id: id('opp'),
        category: 'opportunity',
        severity: 'positive',
        title: 'Combinações disponíveis para a meta',
        description: `Existem ${combinations} combinação(ões) de serviços que podem fechar ou aproximar sua meta mensal.`,
        metric: `${combinations}`,
        action: { label: 'Abrir planejamento', to: '/planning' },
      })
    }
  }

  if (sources.financial_report) {
    const { received_percentage } = sources.financial_report
    if (received_percentage >= T.goodReceiptRate) {
      insights.push({
        id: id('opp'),
        category: 'opportunity',
        severity: 'positive',
        title: 'Boa taxa de recebimento',
        description: `${pct(received_percentage)} dos valores esperados já foram recebidos neste período.`,
        metric: pct(received_percentage),
      })
    }
  }

  // ── Recommendations ─────────────────────────────────────────────────────

  if (sources.operational) {
    const { reservation_metrics, by_operational_status } = sources.operational
    const reservas = by_operational_status['RESERVA'] ?? 0
    if (reservas > T.highReserveCount) {
      insights.push({
        id: id('rec'),
        category: 'recommendation',
        severity: 'info',
        title: 'Muitos serviços em reserva',
        description: `Existem ${reservas} serviços como reserva. Priorize serviços como titular para maior estabilidade.`,
        metric: `${reservas}`,
        action: { label: 'Ver agenda', to: '/agenda' },
      })
    }

    if (reservation_metrics.total_reservations > 0 && reservation_metrics.conversion_rate >= T.goodConversionRate) {
      insights.push({
        id: id('rec'),
        category: 'recommendation',
        severity: 'positive',
        title: 'Reservas com boa conversão',
        description: `Taxa de conversão de reservas em ${pct(reservation_metrics.conversion_rate)}. Continue investindo nesse modelo.`,
        metric: pct(reservation_metrics.conversion_rate),
      })
    }
  }

  if (sources.planning) {
    const { remaining_hours } = sources.planning
    if (remaining_hours > 0) {
      const ideal6 = Math.ceil(remaining_hours / 6)
      const ideal8 = Math.ceil(remaining_hours / 8)
      const ideal12 = Math.ceil(remaining_hours / 12)
      insights.push({
        id: id('rec'),
        category: 'recommendation',
        severity: 'info',
        title: 'Combinação ideal de serviços',
        description: `Para fechar ${remaining_hours}h restantes: ${ideal12}x12h, ${ideal8}x8h ou ${ideal6}x6h.`,
        metric: `${remaining_hours}h`,
        action: { label: 'Abrir planejamento', to: '/planning' },
      })
    }
  }

  if (sources.finance) {
    const { total_pending, total_expected } = sources.finance
    if (total_expected > 0 && total_pending / total_expected > T.highPendingRatio) {
      insights.push({
        id: id('rec'),
        category: 'recommendation',
        severity: 'warning',
        title: 'Alto volume de pendências',
        description: `${pct((total_pending / total_expected) * 100)} do valor esperado ainda está pendente. Regularize os pagamentos.`,
        metric: money(total_pending),
        action: { label: 'Revisar financeiro', to: '/finance' },
      })
    }
  }

  // ── Trends ──────────────────────────────────────────────────────────────

  if (sources.operational) {
    const { realized_hours, confirmed_hours } = sources.operational
    if (confirmed_hours > 0) {
      const realizationRate = (realized_hours / confirmed_hours) * 100
      insights.push({
        id: id('trend'),
        category: 'trend',
        severity: realizationRate >= T.goodRealizationRate ? 'positive' : 'info',
        title: 'Taxa de realização',
        description: `${pct(realizationRate)} das horas confirmadas foram efetivamente realizadas no período.`,
        metric: pct(realizationRate),
      })
    }

    const { reservation_metrics } = sources.operational
    if (reservation_metrics.total_reservations > 0) {
      insights.push({
        id: id('trend'),
        category: 'trend',
        severity: reservation_metrics.conversion_rate >= T.goodConversionTrend ? 'positive' : 'info',
        title: 'Conversão de reservas',
        description: `${reservation_metrics.converted_reservations} de ${reservation_metrics.total_reservations} reservas convertidas (${pct(reservation_metrics.conversion_rate)}).`,
        metric: pct(reservation_metrics.conversion_rate),
      })
    }
  }

  if (sources.financial_report) {
    const { received_percentage, total_expected } = sources.financial_report
    if (total_expected > 0) {
      insights.push({
        id: id('trend'),
        category: 'trend',
        severity: received_percentage >= T.goodFinancialEvolution ? 'positive' : 'info',
        title: 'Evolução financeira',
        description: `Percentual de recebimento no período em ${pct(received_percentage)} sobre ${money(total_expected)} esperados.`,
        metric: pct(received_percentage),
      })
    }
  }

  return prioritizeInsights(insights)
}
