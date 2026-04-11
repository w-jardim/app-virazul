import api from '@/lib/api/axios'
import type { AuthApiResponse, AuthUser, LoginInput, LoginResponse } from '../types/auth.types'

export const authApi = {
  async login(payload: LoginInput): Promise<LoginResponse> {
    const response = await api.post<AuthApiResponse<LoginResponse>>('/api/v1/auth/login', payload)
    return response.data.data
  },

  async me(): Promise<AuthUser> {
    const response = await api.get<AuthApiResponse<AuthUser>>('/api/v1/auth/me')
    return response.data.data
  }
}

