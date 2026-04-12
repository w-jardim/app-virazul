import api from '@/lib/api/axios'
import type {
  AgendaDayPayload,
  AgendaMonthPayload,
  AgendaWeekPayload,
  ApiEnvelope
} from '../types/agenda.types'

export const agendaApi = {
  async getDay(date: string): Promise<AgendaDayPayload> {
    const response = await api.get<ApiEnvelope<AgendaDayPayload>>('/api/v1/agenda/day', {
      params: { date }
    })
    return response.data.data
  },

  async getWeek(start: string): Promise<AgendaWeekPayload> {
    const response = await api.get<ApiEnvelope<AgendaWeekPayload>>('/api/v1/agenda/week', {
      params: { start }
    })
    return response.data.data
  },

  async getMonth(month: string): Promise<AgendaMonthPayload> {
    const response = await api.get<ApiEnvelope<AgendaMonthPayload>>('/api/v1/agenda/month', {
      params: { month }
    })
    return response.data.data
  }
}
