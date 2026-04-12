import axios from 'axios'
import api from '@/lib/api/axios'
import type {
  ApiEnvelope,
  CreateServiceInput,
  ServiceItem,
  ServiceTransitionInput,
  ServiceType,
  UpdateServiceInput
} from '../types/services.types'

export const OPERATIONAL_STATUSES = [
  'AGENDADO',
  'TITULAR',
  'RESERVA',
  'CONVERTIDO_TITULAR',
  'REALIZADO',
  'FALTOU',
  'CANCELADO',
  'NAO_CONVERTIDO'
] as const

export const FINANCIAL_STATUSES = ['PREVISTO', 'PAGO', 'PAGO_PARCIAL', 'NAO_PAGO'] as const
export const DURATION_OPTIONS = [6, 8, 12, 24] as const

type ListQuery = {
  service_type_id?: number
}

function toIsoDateTime(localDateTime: string): string {
  const parsed = new Date(localDateTime)
  if (Number.isNaN(parsed.getTime())) {
    return localDateTime
  }
  return parsed.toISOString()
}

function normalizeServicePayload(
  payload: CreateServiceInput | UpdateServiceInput
): CreateServiceInput | UpdateServiceInput {
  if (!payload.start_at) {
    return payload
  }

  return {
    ...payload,
    start_at: toIsoDateTime(payload.start_at)
  }
}

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const apiMessage = error.response?.data?.errors?.[0]?.message
    if (apiMessage) {
      return String(apiMessage)
    }
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return 'Não foi possível concluir a operação.'
}

export const servicesApi = {
  async list(filters: ListQuery = {}): Promise<ServiceItem[]> {
    const response = await api.get<ApiEnvelope<ServiceItem[]>>('/api/v1/services', {
      params: filters
    })
    return response.data.data
  },

  async getById(id: number): Promise<ServiceItem> {
    const response = await api.get<ApiEnvelope<ServiceItem>>(`/api/v1/services/${id}`)
    return response.data.data
  },

  async create(payload: CreateServiceInput): Promise<ServiceItem> {
    const response = await api.post<ApiEnvelope<ServiceItem>>(
      '/api/v1/services',
      normalizeServicePayload(payload)
    )
    return response.data.data
  },

  async update(id: number, payload: UpdateServiceInput): Promise<ServiceItem> {
    const response = await api.put<ApiEnvelope<ServiceItem>>(
      `/api/v1/services/${id}`,
      normalizeServicePayload(payload)
    )
    return response.data.data
  },

  async remove(id: number): Promise<void> {
    await api.delete(`/api/v1/services/${id}`)
  },

  async transition(id: number, payload: ServiceTransitionInput): Promise<ServiceItem> {
    const response = await api.post<ApiEnvelope<ServiceItem>>(`/api/v1/services/${id}/transition`, payload)
    return response.data.data
  },

  async listServiceTypes(): Promise<ServiceType[]> {
    const response = await api.get<ApiEnvelope<ServiceType[]>>('/api/v1/service-types')
    return response.data.data
  }
}
