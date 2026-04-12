import { useQuery } from '@tanstack/react-query'
import { agendaApi } from '../api/agenda.api'

const TIME_ZONE = 'America/Sao_Paulo'

function formatParts(date: Date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(date)

  const year = parts.find((item) => item.type === 'year')?.value || '1970'
  const month = parts.find((item) => item.type === 'month')?.value || '01'
  const day = parts.find((item) => item.type === 'day')?.value || '01'

  return { year, month, day }
}

export function getDateKey(date = new Date()): string {
  const { year, month, day } = formatParts(date)
  return `${year}-${month}-${day}`
}

export function getMonthKey(date = new Date()): string {
  const { year, month } = formatParts(date)
  return `${year}-${month}`
}

export function useAgendaDay(date: string) {
  return useQuery({
    queryKey: ['agenda', 'day', date],
    queryFn: () => agendaApi.getDay(date),
    enabled: Boolean(date),
    staleTime: 15_000
  })
}

export function useAgendaWeek(start: string) {
  return useQuery({
    queryKey: ['agenda', 'week', start],
    queryFn: () => agendaApi.getWeek(start),
    enabled: Boolean(start),
    staleTime: 15_000
  })
}

export function useAgendaMonth(month: string) {
  return useQuery({
    queryKey: ['agenda', 'month', month],
    queryFn: () => agendaApi.getMonth(month),
    enabled: Boolean(month),
    staleTime: 15_000
  })
}

export function formatTime(value: string | null | undefined): string {
  if (!value) {
    return '--'
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return '--'
  }

  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit'
  }).format(parsed)
}
