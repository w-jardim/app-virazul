import api from '@/lib/api/axios'
import type { ApiEnvelope, OperationalReport, FinancialReport, ReportFilters } from '../types/reports.types'

export const reportsApi = {
  async getOperational(filters: ReportFilters): Promise<OperationalReport> {
    const res = await api.get<ApiEnvelope<OperationalReport>>('/api/v1/reports/operational', {
      params: filters
    })
    return res.data.data
  },

  async getFinancial(filters: ReportFilters): Promise<FinancialReport> {
    const res = await api.get<ApiEnvelope<FinancialReport>>('/api/v1/reports/financial', {
      params: filters
    })
    return res.data.data
  }
}
