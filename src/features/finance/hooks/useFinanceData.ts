import { useQuery } from '@tanstack/react-query'
import { financeApi } from '../api/finance.api'
import type { FinanceReportFilters } from '../types/finance.types'
import { currentMonthLocal } from '@/utils/date-period'

export function useFinanceSummary(month?: string) {
  const resolvedMonth = month || currentMonthLocal()
  return useQuery({
    queryKey: ['finance', 'summary', resolvedMonth],
    queryFn: () => financeApi.getSummary(resolvedMonth),
    staleTime: 60_000
  })
}

export function useFinanceReport(filters: FinanceReportFilters) {
  return useQuery({
    queryKey: ['finance', 'report', filters],
    queryFn: () => financeApi.getReport(filters),
    staleTime: 60_000
  })
}
