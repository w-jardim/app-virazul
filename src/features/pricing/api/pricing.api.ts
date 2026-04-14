import api from '@/lib/api/axios'
import type { ApiEnvelope } from '@/features/services/types/services.types'
import type { BaseValue, FinancialRule, PricingPreview, PreviewParams } from '../types/pricing.types'

export const pricingApi = {
  async listBaseValues(filters?: { rank_group?: string; duration_hours?: number }): Promise<BaseValue[]> {
    const response = await api.get<ApiEnvelope<BaseValue[]>>('/api/v1/pricing/base-values', { params: filters })
    return response.data.data
  },

  async listFinancialRules(filters?: { service_scope?: string }): Promise<FinancialRule[]> {
    const response = await api.get<ApiEnvelope<FinancialRule[]>>('/api/v1/pricing/financial-rules', { params: filters })
    return response.data.data
  },

  async preview(params: PreviewParams): Promise<PricingPreview> {
    const response = await api.get<ApiEnvelope<PricingPreview>>('/api/v1/pricing/preview', { params })
    return response.data.data
  },
}
