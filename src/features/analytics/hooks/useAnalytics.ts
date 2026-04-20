import { useQuery } from '@tanstack/react-query'
import { analyticsApi } from '../api/analytics.api'
import type { AxiosError } from 'axios'

export function useUserAnalytics(filters: Record<string, any>) {
  return useQuery({
    queryKey: ['analytics', 'user', filters],
    queryFn: () => analyticsApi.getUserAnalytics(filters),
    staleTime: 60_000,
    retry: (failureCount, error: AxiosError) => failureCount < 2,
  })
}
