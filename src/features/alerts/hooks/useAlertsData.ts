import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { alertsApi } from '../api/alerts.api'
import type { AlertListFilters } from '../types/alerts.types'

export const ALERTS_QUERY_KEY = ['alerts']

export function useAlerts(filters: AlertListFilters = {}) {
  return useQuery({
    queryKey: [...ALERTS_QUERY_KEY, filters],
    queryFn: () => alertsApi.list(filters),
    staleTime: 15_000,
  })
}

export function useMarkAlertRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => alertsApi.markRead(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ALERTS_QUERY_KEY })
      void queryClient.invalidateQueries({ queryKey: ['dashboard', 'alerts'] })
    },
  })
}

export function useDismissAlert() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => alertsApi.dismiss(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ALERTS_QUERY_KEY })
      void queryClient.invalidateQueries({ queryKey: ['dashboard', 'alerts'] })
    },
  })
}
