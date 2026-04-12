import api from '@/lib/api/axios'
import type { ApiEnvelope, PlanningSummary, PlanningSuggestion } from '../types/planning.types'

export const planningApi = {
  async getSummary(): Promise<PlanningSummary> {
    const res = await api.get<ApiEnvelope<PlanningSummary>>('/api/v1/planning/summary')
    return res.data.data
  },

  async getSuggestions(): Promise<PlanningSuggestion[]> {
    const res = await api.get<ApiEnvelope<PlanningSuggestion[]>>('/api/v1/planning/suggestions')
    return res.data.data
  }
}
