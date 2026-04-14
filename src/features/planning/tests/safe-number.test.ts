import { describe, expect, it } from 'vitest'
import {
  toSafeNumber,
  toSafeCurrency,
  toSafeHours,
  toSafeCount,
} from '../utils/safe-number'

describe('safe-number utils', () => {
  it('normalizes invalid values with fallback', () => {
    expect(toSafeNumber(undefined, 7)).toBe(7)
    expect(toSafeNumber(null, 7)).toBe(7)
    expect(toSafeNumber('', 7)).toBe(7)
    expect(toSafeNumber(Number.NaN, 7)).toBe(7)
    expect(toSafeNumber(Number.POSITIVE_INFINITY, 7)).toBe(7)
  })

  it('parses numeric strings and valid numbers', () => {
    expect(toSafeNumber('12')).toBe(12)
    expect(toSafeNumber(' 15.5 ')).toBe(15.5)
    expect(toSafeNumber(3)).toBe(3)
  })

  it('formats invalid values with safe zero fallback', () => {
    expect(toSafeCurrency(Number.NaN)).toBe('R$ 0,00')
    expect(toSafeHours(Number.NaN)).toBe('0h')
    expect(toSafeCount(Number.NaN)).toBe('0')
  })
})
