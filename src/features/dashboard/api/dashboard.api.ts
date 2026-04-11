import api from '@/lib/api/axios'
import type {
  AgendaDay,
  AlertItem,
  ApiEnvelope,
  DashboardSummary,
  FinanceSummary,
  PlanningSummary
} from '../types/dashboard.types'

export const dashboardApi = {
  async getSummary(): Promise<DashboardSummary> {
    const response = await api.get<ApiEnvelope<DashboardSummary>>('/api/v1/dashboard/summary')
    return response.data.data
  },

  async getAlerts(): Promise<AlertItem[]> {
    const response = await api.get<ApiEnvelope<AlertItem[]>>('/api/v1/alerts', {
      params: { status: 'ACTIVE' }
    })
    return response.data.data
  },

  async getAgendaDay(date: string): Promise<AgendaDay> {
    const response = await api.get<ApiEnvelope<AgendaDay>>('/api/v1/agenda/day', {
      params: { date }
    })
    return response.data.data
  },

  async getPlanningSummary(): Promise<PlanningSummary> {
    const response = await api.get<ApiEnvelope<PlanningSummary>>('/api/v1/planning/summary')
    return response.data.data
  },

  async getFinanceSummary(month: string): Promise<FinanceSummary> {
    const response = await api.get<ApiEnvelope<FinanceSummary>>('/api/v1/finance/summary', {
      params: { month }
    })
    return response.data.data
  }
}
