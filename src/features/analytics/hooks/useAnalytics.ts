import { useQuery } from '@tanstack/react-query'
import { analyticsApi } from '../api/analytics.api'
import type { AxiosError } from 'axios'

export function useUserAnalytics(filters: Record<string, any>, enabled = true) {
  return useQuery({
    queryKey: ['analytics', 'user', filters],
    queryFn: () => analyticsApi.getUserAnalytics(filters),
    enabled,
    staleTime: 60_000,
    retry: (failureCount, error: AxiosError) => failureCount < 2,
  })
}

export function useAdminUserAnalyticsOverview(filters: Record<string, any>, enabled = true) {
  return useQuery({
    queryKey: ['user-analytics', 'overview', filters],
    queryFn: () => analyticsApi.getAdminUserAnalyticsOverview(filters),
    enabled,
    staleTime: 60_000,
    retry: (failureCount, error: AxiosError) => failureCount < 2,
  })
}
