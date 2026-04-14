export function toSafeNumber(value: unknown, fallback = 0): number {
  if (value === null || value === undefined || value === '') {
    return fallback
  }

  const parsed =
    typeof value === 'number'
      ? value
      : typeof value === 'string'
        ? Number(value.trim())
        : Number(value)

  return Number.isFinite(parsed) ? parsed : fallback
}

export function toSafeInt(value: unknown, fallback = 0): number {
  const n = Math.trunc(toSafeNumber(value, fallback))
  return Number.isFinite(n) ? n : fallback
}

export function toSafeNonNegative(value: unknown, fallback = 0): number {
  return Math.max(0, toSafeNumber(value, fallback))
}

export function toSafePositive(value: unknown, fallback = 1): number {
  return Math.max(1, toSafeNumber(value, fallback))
}

export function toSafeCurrency(value: unknown): string {
  const safe = toSafeNonNegative(value, 0)
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(safe)
}

export function toSafeHours(value: unknown, digits = 0): string {
  const safe = toSafeNonNegative(value, 0)
  return `${safe.toFixed(digits)}h`
}

export function toSafeCount(value: unknown): string {
  return `${toSafeInt(toSafeNonNegative(value, 0), 0)}`
}
