import { useQuery } from '@tanstack/react-query'
import { pricingApi } from '../api/pricing.api'
import type { PreviewParams } from '../types/pricing.types'

export function useBaseValues(filters?: { rank_group?: string; duration_hours?: number }) {
  return useQuery({
    queryKey: ['pricing', 'base-values', filters],
    queryFn: () => pricingApi.listBaseValues(filters),
    staleTime: 5 * 60_000,
  })
}

export function useFinancialRules(filters?: { service_scope?: string }) {
  return useQuery({
    queryKey: ['pricing', 'financial-rules', filters],
    queryFn: () => pricingApi.listFinancialRules(filters),
    staleTime: 5 * 60_000,
  })
}

export function usePricingPreview(params: PreviewParams | null) {
  return useQuery({
    queryKey: ['pricing', 'preview', params],
    queryFn: () => pricingApi.preview(params!),
    enabled: Boolean(params?.service_scope && params?.rank_group && params?.duration_hours),
    staleTime: 60_000,
  })
}
