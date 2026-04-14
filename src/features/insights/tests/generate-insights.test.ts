import { describe, expect, it } from 'vitest'
import { generateInsights, prioritizeInsights } from '../engine/generate-insights'
import { INSIGHT_THRESHOLDS as T, INSIGHT_LIMITS } from '../engine/thresholds'
import type { Insight, InsightSources } from '../types/insights.types'

const empty: InsightSources = {
  planning: null,
  finance: null,
  operational: null,
  financial_report: null,
}

describe('generateInsights', () => {
  it('returns empty array when all sources are null', () => {
    const result = generateInsights(empty)
    expect(result).toEqual([])
  })

  // ── Alerts ────────────────────────────────────────────────────────────

  it('generates overdue finance alert (warning)', () => {
    const sources: InsightSources = {
      ...empty,
      finance: {
        total_expected: 1000,
        total_received: 500,
        total_pending: 200,
        total_overdue: 300,
        by_status: { PAGO: 500, NAO_PAGO: 200 },
      },
    }
    const insights = generateInsights(sources)
    const alert = insights.find((i) => i.category === 'alert' && i.title.includes('atraso'))
    expect(alert).toBeDefined()
    expect(alert!.severity).toBe('warning') // 30% = exactly threshold, not above
    expect(alert!.action).toEqual({ label: 'Revisar financeiro', to: '/finance' })
  })

  it('generates critical overdue alert when ratio > threshold', () => {
    const sources: InsightSources = {
      ...empty,
      finance: {
        total_expected: 1000,
        total_received: 200,
        total_pending: 200,
        total_overdue: 400,
        by_status: { PAGO: 200 },
      },
    }
    const insights = generateInsights(sources)
    const alert = insights.find((i) => i.category === 'alert' && i.title.includes('atraso'))
    expect(alert!.severity).toBe('critical')
  })

  it('generates warning overdue alert when ratio <= threshold', () => {
    const sources: InsightSources = {
      ...empty,
      finance: {
        total_expected: 1000,
        total_received: 700,
        total_pending: 200,
        total_overdue: 100,
        by_status: { PAGO: 700 },
      },
    }
    const insights = generateInsights(sources)
    const alert = insights.find((i) => i.category === 'alert' && i.title.includes('atraso'))
    expect(alert!.severity).toBe('warning')
  })

  it('generates faults/cancellations alert with action', () => {
    const sources: InsightSources = {
      ...empty,
      operational: {
        total_services: 10,
        confirmed_hours: 20,
        realized_hours: 10,
        waiting_hours: 5,
        by_operational_status: { FALTOU: 2, CANCELADO: 1, TITULAR: 7 },
        reservation_metrics: {
          total_reservations: 0,
          converted_reservations: 0,
          non_converted_reservations: 0,
          conversion_rate: 0,
        },
      },
    }
    const insights = generateInsights(sources)
    const alert = insights.find((i) => i.title.includes('cancelamento'))
    expect(alert).toBeDefined()
    expect(alert!.metric).toBe('3')
    expect(alert!.action).toEqual({ label: 'Ver agenda', to: '/agenda' })
  })

  it('generates low conversion alert when rate < threshold', () => {
    const sources: InsightSources = {
      ...empty,
      operational: {
        total_services: 10,
        confirmed_hours: 20,
        realized_hours: 10,
        waiting_hours: 5,
        by_operational_status: { TITULAR: 7, RESERVA: 3 },
        reservation_metrics: {
          total_reservations: 5,
          converted_reservations: 1,
          non_converted_reservations: 4,
          conversion_rate: 20,
        },
      },
    }
    const insights = generateInsights(sources)
    const alert = insights.find((i) => i.title.includes('reservas') && i.category === 'alert')
    expect(alert).toBeDefined()
    expect(alert!.severity).toBe('warning')
  })

  it('does NOT generate low conversion alert when reservations < minimum', () => {
    const sources: InsightSources = {
      ...empty,
      operational: {
        total_services: 10,
        confirmed_hours: 20,
        realized_hours: 10,
        waiting_hours: 5,
        by_operational_status: { TITULAR: 10 },
        reservation_metrics: {
          total_reservations: 2,
          converted_reservations: 0,
          non_converted_reservations: 2,
          conversion_rate: 0,
        },
      },
    }
    const insights = generateInsights(sources)
    const alert = insights.find((i) => i.title.includes('reservas') && i.category === 'alert')
    expect(alert).toBeUndefined()
  })

  it('generates low productivity alert', () => {
    const sources: InsightSources = {
      ...empty,
      planning: {
        goal: 100,
        confirmed_hours: 10,
        waiting_hours: 5,
        remaining_hours: 90,
        combinations: 3,
      },
    }
    const insights = generateInsights(sources)
    const alert = insights.find((i) => i.title.includes('Produtividade'))
    expect(alert).toBeDefined()
    expect(alert!.action).toEqual({ label: 'Abrir planejamento', to: '/planning' })
  })

  // ── Opportunities ─────────────────────────────────────────────────────

  it('generates near-goal opportunity with CTA', () => {
    const sources: InsightSources = {
      ...empty,
      planning: {
        goal: 100,
        confirmed_hours: 80,
        waiting_hours: 5,
        remaining_hours: 20,
        combinations: 2,
      },
    }
    const insights = generateInsights(sources)
    const opp = insights.find((i) => i.title === 'Meta quase atingida')
    expect(opp).toBeDefined()
    expect(opp!.severity).toBe('positive')
    expect(opp!.action).toEqual({ label: 'Abrir planejamento', to: '/planning' })
  })

  it('generates good receipt rate opportunity', () => {
    const sources: InsightSources = {
      ...empty,
      financial_report: {
        total_expected: 1000,
        total_received: 850,
        total_pending: 100,
        total_overdue: 50,
        received_percentage: 85,
      },
    }
    const insights = generateInsights(sources)
    const opp = insights.find((i) => i.title.includes('recebimento'))
    expect(opp).toBeDefined()
    expect(opp!.action).toBeUndefined() // informational, no CTA
  })

  // ── Recommendations ───────────────────────────────────────────────────

  it('generates ideal combination recommendation with planning CTA', () => {
    const sources: InsightSources = {
      ...empty,
      planning: {
        goal: 120,
        confirmed_hours: 60,
        waiting_hours: 10,
        remaining_hours: 60,
        combinations: 5,
      },
    }
    const insights = generateInsights(sources)
    const rec = insights.find((i) => i.title.includes('ideal'))
    expect(rec).toBeDefined()
    expect(rec!.description).toContain('60h')
    expect(rec!.action).toEqual({ label: 'Abrir planejamento', to: '/planning' })
  })

  it('generates high pending recommendation with finance CTA', () => {
    const sources: InsightSources = {
      ...empty,
      finance: {
        total_expected: 1000,
        total_received: 200,
        total_pending: 600,
        total_overdue: 200,
        by_status: { PAGO: 200, NAO_PAGO: 600 },
      },
    }
    const insights = generateInsights(sources)
    const rec = insights.find((i) => i.title.includes('pendência'))
    expect(rec).toBeDefined()
    expect(rec!.action).toEqual({ label: 'Revisar financeiro', to: '/finance' })
  })

  // ── Trends ────────────────────────────────────────────────────────────

  it('generates realization rate trend', () => {
    const sources: InsightSources = {
      ...empty,
      operational: {
        total_services: 10,
        confirmed_hours: 40,
        realized_hours: 36,
        waiting_hours: 4,
        by_operational_status: { TITULAR: 10 },
        reservation_metrics: {
          total_reservations: 0,
          converted_reservations: 0,
          non_converted_reservations: 0,
          conversion_rate: 0,
        },
      },
    }
    const insights = generateInsights(sources)
    const trend = insights.find((i) => i.title.includes('realização'))
    expect(trend).toBeDefined()
    expect(trend!.severity).toBe('positive')
  })

  it('generates financial evolution trend', () => {
    const sources: InsightSources = {
      ...empty,
      financial_report: {
        total_expected: 2000,
        total_received: 1500,
        total_pending: 300,
        total_overdue: 200,
        received_percentage: 75,
      },
    }
    const insights = generateInsights(sources)
    const trend = insights.find((i) => i.title.includes('financeira'))
    expect(trend).toBeDefined()
    expect(trend!.severity).toBe('positive')
  })

  // ── PT-BR text correctness ────────────────────────────────────────────

  it('generates PT-BR text without mojibake', () => {
    const sources: InsightSources = {
      ...empty,
      planning: {
        goal: 100,
        confirmed_hours: 80,
        waiting_hours: 5,
        remaining_hours: 20,
        combinations: 3,
      },
      operational: {
        total_services: 10,
        confirmed_hours: 30,
        realized_hours: 25,
        waiting_hours: 5,
        by_operational_status: { TITULAR: 8, RESERVA: 2 },
        reservation_metrics: {
          total_reservations: 5,
          converted_reservations: 4,
          non_converted_reservations: 1,
          conversion_rate: 80,
        },
      },
    }
    const insights = generateInsights(sources)
    const allText = insights.map((i) => `${i.title} ${i.description}`).join(' ')
    expect(allText).not.toMatch(/Ã/)
    expect(allText).not.toMatch(/\\u00/)
  })

  // ── Mixed scenario ────────────────────────────────────────────────────

  it('generates multiple insights from all sources', () => {
    const sources: InsightSources = {
      planning: {
        goal: 120,
        confirmed_hours: 100,
        waiting_hours: 10,
        remaining_hours: 20,
        combinations: 4,
      },
      finance: {
        total_expected: 3000,
        total_received: 1500,
        total_pending: 1200,
        total_overdue: 300,
        by_status: { PAGO: 1500, NAO_PAGO: 1200 },
      },
      operational: {
        total_services: 15,
        confirmed_hours: 50,
        realized_hours: 45,
        waiting_hours: 5,
        by_operational_status: { TITULAR: 10, RESERVA: 4, FALTOU: 1 },
        reservation_metrics: {
          total_reservations: 4,
          converted_reservations: 3,
          non_converted_reservations: 1,
          conversion_rate: 75,
        },
      },
      financial_report: {
        total_expected: 3000,
        total_received: 1500,
        total_pending: 1200,
        total_overdue: 300,
        received_percentage: 50,
      },
    }
    const insights = generateInsights(sources)
    expect(insights.length).toBeGreaterThanOrEqual(5)

    const categories = new Set(insights.map((i) => i.category))
    expect(categories.has('alert')).toBe(true)
    expect(categories.has('opportunity')).toBe(true)
    expect(categories.has('recommendation')).toBe(true)
    expect(categories.has('trend')).toBe(true)
  })
})

// ── Prioritization & limits ─────────────────────────────────────────────────

describe('prioritizeInsights', () => {
  it('sorts by severity priority (critical first)', () => {
    const raw: Insight[] = [
      { id: '1', category: 'alert', severity: 'info', title: 'Info', description: '' },
      { id: '2', category: 'alert', severity: 'critical', title: 'Critical', description: '' },
      { id: '3', category: 'alert', severity: 'warning', title: 'Warning', description: '' },
    ]
    const result = prioritizeInsights(raw)
    expect(result[0].severity).toBe('critical')
    expect(result[1].severity).toBe('warning')
    expect(result[2].severity).toBe('info')
  })

  it('limits per category', () => {
    const raw: Insight[] = Array.from({ length: 8 }, (_, i) => ({
      id: `a${i}`,
      category: 'alert' as const,
      severity: 'warning' as const,
      title: `Alert ${i}`,
      description: '',
    }))
    const result = prioritizeInsights(raw, { maxPerCategory: 3, maxTotal: 20 })
    expect(result.length).toBe(3)
  })

  it('limits total insights', () => {
    const raw: Insight[] = [
      ...Array.from({ length: 5 }, (_, i) => ({
        id: `a${i}`, category: 'alert' as const, severity: 'critical' as const, title: `A${i}`, description: '',
      })),
      ...Array.from({ length: 5 }, (_, i) => ({
        id: `o${i}`, category: 'opportunity' as const, severity: 'positive' as const, title: `O${i}`, description: '',
      })),
      ...Array.from({ length: 5 }, (_, i) => ({
        id: `r${i}`, category: 'recommendation' as const, severity: 'info' as const, title: `R${i}`, description: '',
      })),
      ...Array.from({ length: 5 }, (_, i) => ({
        id: `t${i}`, category: 'trend' as const, severity: 'positive' as const, title: `T${i}`, description: '',
      })),
    ]
    const result = prioritizeInsights(raw, { maxPerCategory: 5, maxTotal: 12 })
    expect(result.length).toBe(12)
  })

  it('keeps higher severity items when capping per category', () => {
    const raw: Insight[] = [
      { id: '1', category: 'alert', severity: 'info', title: 'Low', description: '' },
      { id: '2', category: 'alert', severity: 'critical', title: 'High', description: '' },
      { id: '3', category: 'alert', severity: 'warning', title: 'Mid', description: '' },
    ]
    const result = prioritizeInsights(raw, { maxPerCategory: 2, maxTotal: 20 })
    expect(result.length).toBe(2)
    expect(result[0].title).toBe('High')
    expect(result[1].title).toBe('Mid')
  })

  it('result from generateInsights is already prioritized', () => {
    const sources: InsightSources = {
      planning: {
        goal: 120,
        confirmed_hours: 100,
        waiting_hours: 10,
        remaining_hours: 20,
        combinations: 4,
      },
      finance: {
        total_expected: 3000,
        total_received: 1500,
        total_pending: 1200,
        total_overdue: 300,
        by_status: { PAGO: 1500, NAO_PAGO: 1200 },
      },
      operational: {
        total_services: 15,
        confirmed_hours: 50,
        realized_hours: 45,
        waiting_hours: 5,
        by_operational_status: { TITULAR: 10, RESERVA: 4, FALTOU: 1 },
        reservation_metrics: {
          total_reservations: 4,
          converted_reservations: 3,
          non_converted_reservations: 1,
          conversion_rate: 75,
        },
      },
      financial_report: {
        total_expected: 3000,
        total_received: 1500,
        total_pending: 1200,
        total_overdue: 300,
        received_percentage: 50,
      },
    }
    const insights = generateInsights(sources)
    expect(insights.length).toBeLessThanOrEqual(INSIGHT_LIMITS.maxTotal)
  })
})
