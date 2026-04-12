/**
 * Utilitários de data local para evitar deslocamento UTC.
 * Usa America/Sao_Paulo como referência.
 */

const TZ = 'America/Sao_Paulo'

function localParts(): { year: number; month: number; day: number } {
  const now = new Date()
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  const [year, month, day] = fmt.format(now).split('-').map(Number)
  return { year, month, day }
}

/** Data local no formato YYYY-MM-DD */
export function todayLocal(): string {
  const { year, month, day } = localParts()
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

/** Primeiro dia do mês corrente no formato YYYY-MM-DD */
export function startOfMonthLocal(): string {
  const { year, month } = localParts()
  return `${year}-${String(month).padStart(2, '0')}-01`
}

/** Mês corrente no formato YYYY-MM */
export function currentMonthLocal(): string {
  const { year, month } = localParts()
  return `${year}-${String(month).padStart(2, '0')}`
}
