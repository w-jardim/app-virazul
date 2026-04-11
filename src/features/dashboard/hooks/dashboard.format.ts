const DASHBOARD_TIME_ZONE = 'America/Sao_Paulo'

function formatParts(date: Date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: DASHBOARD_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(date)

  const year = parts.find((item) => item.type === 'year')?.value || '1970'
  const month = parts.find((item) => item.type === 'month')?.value || '01'
  const day = parts.find((item) => item.type === 'day')?.value || '01'

  return { year, month, day }
}

export function getTodayDateKey(date = new Date()): string {
  const { year, month, day } = formatParts(date)
  return `${year}-${month}-${day}`
}

export function getMonthKey(date = new Date()): string {
  const { year, month } = formatParts(date)
  return `${year}-${month}`
}

export function formatDateTime(value: string | undefined): string {
  if (!value) {
    return '--'
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return '--'
  }

  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: DASHBOARD_TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit'
  }).format(parsed)
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2
  }).format(Number(value || 0))
}
