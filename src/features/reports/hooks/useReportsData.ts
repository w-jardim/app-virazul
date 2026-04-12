import { useQuery } from '@tanstack/react-query'
import { reportsApi } from '../api/reports.api'
import type { ReportFilters } from '../types/reports.types'

export function useOperationalReport(filters: ReportFilters) {
  return useQuery({
    queryKey: ['reports', 'operational', filters],
    queryFn: () => reportsApi.getOperational(filters),
    staleTime: 60_000
  })
}

export function useFinancialReport(filters: ReportFilters) {
  return useQuery({
    queryKey: ['reports', 'financial', filters],
    queryFn: () => reportsApi.getFinancial(filters),
    staleTime: 60_000
  })
}
