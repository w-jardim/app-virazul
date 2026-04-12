import { useQuery } from '@tanstack/react-query'
import { planningApi } from '../api/planning.api'

export function usePlanningSummary() {
  return useQuery({
    queryKey: ['planning', 'summary'],
    queryFn: planningApi.getSummary,
    staleTime: 60_000
  })
}

export function usePlanningSuggestions() {
  return useQuery({
    queryKey: ['planning', 'suggestions'],
    queryFn: planningApi.getSuggestions,
    staleTime: 60_000
  })
}
