import { describe, expect, it } from 'vitest'
import {
  simulatePlan,
  buildHistoricalData,
  FEASIBILITY_THRESHOLDS,
  validatePlanningInput,
} from '../engine/simulate-plan'
import type { HistoricalData, PlanningInput } from '../types/planning-operational.types'

const baseHistorical: HistoricalData = {
  avg_hours_per_service: 8,
  avg_income_per_hour: 25,
  avg_services_per_month: 12,
  avg_hours_per_month: 96,
  by_service_type: {
    RAS_VOLUNTARIO: { count: 6, total_hours: 48, total_income: 1200, avg_duration: 8, avg_income_per_hour: 25 },
    PROEIS: { count: 4, total_hours: 48, total_income: 1440, avg_duration: 12, avg_income_per_hour: 30 },
    RAS_COMPULSORIO: { count: 2, total_hours: 16, total_income: 400, avg_duration: 8, avg_income_per_hour: 25 },
  },
}

const basePeriod = { start_date: '2026-04-01', end_date: '2026-04-30' }

describe('simulatePlan', () => {
  it('runs HOURS mode using target_hours only', () => {
    const input: PlanningInput = {
      mode: 'HOURS',
      target_hours: 96,
      target_services: 999,
      service_types: ['RAS_VOLUNTARIO', 'PROEIS', 'RAS_COMPULSORIO'],
      period: basePeriod,
    }

    const result = simulatePlan(input, baseHistorical)
    expect(result.required_services).toBe(11)
    expect(result.estimated_hours).toBe(96)
  })

  it('runs COUNT mode using target_services only', () => {
    const input: PlanningInput = {
      mode: 'COUNT',
      target_hours: 999,
      target_services: 10,
      service_types: ['RAS_VOLUNTARIO'],
      period: basePeriod,
    }

    const result = simulatePlan(input, baseHistorical)
    expect(result.required_services).toBe(10)
    expect(result.estimated_hours).toBe(80)
  })

  it('never returns NaN with empty historical data', () => {
    const input: PlanningInput = {
      mode: 'HOURS',
      target_hours: 80,
      service_types: ['UNKNOWN_TYPE'],
      period: basePeriod,
    }

    const result = simulatePlan(input, {
      avg_hours_per_service: 0,
      avg_income_per_hour: 0,
      avg_services_per_month: 0,
      avg_hours_per_month: 0,
      by_service_type: {},
    })

    expect(Number.isFinite(result.required_services)).toBe(true)
    expect(Number.isFinite(result.estimated_hours)).toBe(true)
    expect(Number.isFinite(result.estimated_income)).toBe(true)
    expect(Object.values(result.distribution_by_type).every((v) => Number.isFinite(v))).toBe(true)
  })

  it('never returns NaN with partial/invalid input values', () => {
    const input = {
      mode: 'HOURS',
      target_hours: Number.NaN,
      service_types: ['RAS_VOLUNTARIO'],
      period: { start_date: '2026-04-01', end_date: '2026-04-30' },
    } as unknown as PlanningInput

    const result = simulatePlan(input, baseHistorical)
    expect(result).toEqual({
      required_services: 0,
      estimated_hours: 0,
      estimated_income: 0,
      distribution_by_type: {},
      feasibility: 'MEDIUM',
    })
  })

  it('protects division by zero in feasibility', () => {
    const input: PlanningInput = {
      mode: 'HOURS',
      target_hours: 50,
      service_types: ['RAS_VOLUNTARIO'],
      period: basePeriod,
    }

    const hist: HistoricalData = { ...baseHistorical, avg_hours_per_month: 0 }
    const result = simulatePlan(input, hist)
    expect(['LOW', 'MEDIUM', 'HIGH']).toContain(result.feasibility)
    expect(Number.isFinite(result.estimated_hours)).toBe(true)
  })

  it('returns numeric distribution values only', () => {
    const input: PlanningInput = {
      mode: 'COUNT',
      target_services: 7,
      service_types: ['RAS_VOLUNTARIO', 'PROEIS'],
      period: basePeriod,
    }

    const result = simulatePlan(input, baseHistorical)
    const values = Object.values(result.distribution_by_type)
    expect(values.every((v) => Number.isFinite(v) && v >= 0)).toBe(true)
    expect(values.reduce((sum, v) => sum + v, 0)).toBe(7)
  })

  it('returns neutral result when input has no service types', () => {
    const input: PlanningInput = {
      mode: 'COUNT',
      target_services: 5,
      service_types: [],
      period: basePeriod,
    }

    const result = simulatePlan(input, baseHistorical)
    expect(result.required_services).toBe(0)
    expect(result.estimated_hours).toBe(0)
    expect(result.estimated_income).toBe(0)
  })
})

describe('validatePlanningInput', () => {
  it('validates required fields by mode', () => {
    expect(
      validatePlanningInput({
        mode: 'HOURS',
        target_hours: 10,
        service_types: ['RAS_VOLUNTARIO'],
        period: basePeriod,
      }).isValid,
    ).toBe(true)

    expect(
      validatePlanningInput({
        mode: 'COUNT',
        target_services: 3,
        service_types: ['RAS_VOLUNTARIO'],
        period: basePeriod,
      }).isValid,
    ).toBe(true)
  })

  it('rejects invalid period and invalid target', () => {
    expect(
      validatePlanningInput({
        mode: 'HOURS',
        target_hours: 10,
        service_types: ['RAS_VOLUNTARIO'],
        period: { start_date: 'invalid', end_date: '2026-04-30' },
      }).isValid,
    ).toBe(false)

    expect(
      validatePlanningInput({
        mode: 'COUNT',
        target_services: 0,
        service_types: ['RAS_VOLUNTARIO'],
        period: basePeriod,
      }).isValid,
    ).toBe(false)
  })
})

describe('buildHistoricalData', () => {
  it('sanitizes invalid numeric rows and keeps finite aggregates', () => {
    const hist = buildHistoricalData(
      [
        { service_type_key: 'RAS', duration_hours: 8, amount_total: 200, operational_status: 'REALIZADO' },
        { service_type_key: 'RAS', duration_hours: Number.NaN, amount_total: Number.NaN, operational_status: 'REALIZADO' },
        { service_type_key: 'PROEIS', duration_hours: 24, amount_total: 720, operational_status: 'AGENDADO' },
      ],
      3,
    )

    expect(Number.isFinite(hist.avg_hours_per_service)).toBe(true)
    expect(Number.isFinite(hist.avg_income_per_hour)).toBe(true)
    expect(Number.isFinite(hist.avg_services_per_month)).toBe(true)
    expect(Number.isFinite(hist.avg_hours_per_month)).toBe(true)
  })

  it('returns defaults for empty list', () => {
    const hist = buildHistoricalData([], 3)
    expect(hist.avg_hours_per_service).toBe(8)
    expect(hist.avg_income_per_hour).toBe(25)
    expect(hist.avg_services_per_month).toBe(0)
    expect(hist.avg_hours_per_month).toBe(0)
  })
})

describe('FEASIBILITY_THRESHOLDS', () => {
  it('exports threshold constants', () => {
    expect(FEASIBILITY_THRESHOLDS.highMax).toBe(1.2)
    expect(FEASIBILITY_THRESHOLDS.mediumMax).toBe(1.6)
  })
})
