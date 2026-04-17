import api from '@/lib/api/axios'
import type { Alert, AlertListFilters } from '../types/alerts.types'

type ApiEnvelope<T> = {
  data: T
  meta: unknown | null
  errors: Array<{ code: string; message: string }> | null
}

export const alertsApi = {
  async list(filters: AlertListFilters = {}): Promise<Alert[]> {
    const params: Record<string, string> = {}
    if (filters.type) params.type = filters.type
    if (filters.status) params.status = filters.status

    const response = await api.get<ApiEnvelope<Alert[]>>('/api/v1/alerts', { params })
    return response.data.data
  },

  async markRead(id: number): Promise<Alert> {
    const response = await api.post<ApiEnvelope<Alert>>(`/api/v1/alerts/${id}/read`)
    return response.data.data
  },

  async dismiss(id: number): Promise<Alert> {
    const response = await api.post<ApiEnvelope<Alert>>(`/api/v1/alerts/${id}/dismiss`)
    return response.data.data
  },
}
