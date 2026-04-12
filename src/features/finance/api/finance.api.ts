import api from '@/lib/api/axios'
import type { ApiEnvelope, FinanceSummary, FinanceReport, FinanceReportFilters } from '../types/finance.types'

export const financeApi = {
  async getSummary(month: string): Promise<FinanceSummary> {
    const res = await api.get<ApiEnvelope<FinanceSummary>>('/api/v1/finance/summary', {
      params: { month }
    })
    return res.data.data
  },

  async getReport(filters: FinanceReportFilters): Promise<FinanceReport> {
    const res = await api.get<ApiEnvelope<FinanceReport>>('/api/v1/finance/report', {
      params: filters
    })
    return res.data.data
  }
}
