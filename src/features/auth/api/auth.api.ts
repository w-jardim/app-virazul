import api from '@/lib/api/axios'
import type {
  AuthApiResponse,
  AuthUser,
  GoogleLoginInput,
  LoginInput,
  LoginResponse
} from '../types/auth.types'

export const authApi = {
  async login(payload: LoginInput): Promise<LoginResponse> {
    const response = await api.post<AuthApiResponse<LoginResponse>>('/api/v1/auth/login', payload)
    return response.data.data
  },

  async loginWithGoogle(payload: GoogleLoginInput): Promise<LoginResponse> {
    const response = await api.post<AuthApiResponse<LoginResponse>>('/api/v1/auth/google', payload)
    return response.data.data
  },

  async me(): Promise<AuthUser> {
    const response = await api.get<AuthApiResponse<AuthUser>>('/api/v1/auth/me')
    return response.data.data
  },

  async register(payload: { name: string; email: string; password: string; password_confirm?: string; rank_group?: string | null }): Promise<LoginResponse> {
    const response = await api.post<AuthApiResponse<LoginResponse>>('/api/v1/auth/register', payload)
    return response.data.data
  },

  async updateProfile(payload: Partial<AuthUser & { password?: string }>): Promise<AuthUser> {
    const response = await api.patch<AuthApiResponse<AuthUser>>('/api/v1/auth/me', payload)
    return response.data.data
  }
}
