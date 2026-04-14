import api from '@/lib/api/axios'
import type { AuthApiResponse } from '@/features/auth/types/auth.types'
import type { AdminUser, AdminStats, CreateUserPayload, UpdateUserPayload, PaymentStatus } from '../types/admin.types'

export const adminApi = {
  async getStats(): Promise<AdminStats> {
    const res = await api.get<AuthApiResponse<AdminStats>>('/api/v1/admin/stats')
    return res.data.data
  },

  async getUsers(): Promise<AdminUser[]> {
    const res = await api.get<AuthApiResponse<AdminUser[]>>('/api/v1/admin/users')
    return res.data.data
  },

  async createUser(payload: CreateUserPayload): Promise<AdminUser> {
    const res = await api.post<AuthApiResponse<AdminUser>>('/api/v1/admin/users', payload)
    return res.data.data
  },

  async updateUser(id: number, payload: UpdateUserPayload): Promise<AdminUser> {
    const res = await api.patch<AuthApiResponse<AdminUser>>(`/api/v1/admin/users/${id}`, payload)
    return res.data.data
  },

  async deleteUser(id: number): Promise<void> {
    await api.delete(`/api/v1/admin/users/${id}`)
  },

  async changeSubscription(id: number, subscription: string): Promise<AdminUser> {
    const res = await api.patch<AuthApiResponse<AdminUser>>(`/api/v1/admin/users/${id}/subscription`, { subscription })
    return res.data.data
  },

  async changePaymentStatus(id: number, paymentStatus: PaymentStatus): Promise<AdminUser> {
    const res = await api.patch<AuthApiResponse<AdminUser>>(`/api/v1/admin/users/${id}/payment-status`, { payment_status: paymentStatus })
    return res.data.data
  }
}
