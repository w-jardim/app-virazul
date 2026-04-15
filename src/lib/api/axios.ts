import axios, { AxiosError } from 'axios'
import { useAuthStore } from '@/features/auth/store/useAuthStore'

const baseURL = import.meta.env.VITE_API_BASE_URL || ''

type UnauthorizedHandler = () => void
type PlanExpiredHandler = (message: string) => void

let unauthorizedHandler: UnauthorizedHandler | null = null
let planExpiredHandler: PlanExpiredHandler | null = null

export const setUnauthorizedHandler = (handler: UnauthorizedHandler) => {
  unauthorizedHandler = handler
}

export const clearUnauthorizedHandler = () => {
  unauthorizedHandler = null
}

export const setPlanExpiredHandler = (handler: PlanExpiredHandler) => {
  planExpiredHandler = handler
}

export const clearPlanExpiredHandler = () => {
  planExpiredHandler = null
}

function resolveRequestUrl(error: AxiosError): string {
  const raw = error.config?.url || ''
  return String(raw).toLowerCase()
}

function hasAuthTokenInRequest(error: AxiosError): boolean {
  const header = error.config?.headers?.Authorization || error.config?.headers?.authorization
  return Boolean(header)
}

function hasAuthCode(error: AxiosError): boolean {
  const code = (error.response?.data as { errors?: Array<{ code?: string }> } | undefined)?.errors?.[0]
    ?.code
  return Boolean(code && String(code).startsWith('AUTH_'))
}

function shouldClearSessionOnUnauthorized(error: AxiosError): boolean {
  if (error.response?.status !== 401) {
    return false
  }

  const url = resolveRequestUrl(error)
  if (url.includes('/auth/login')) {
    return false
  }

  if (url.includes('/auth/me')) {
    return true
  }

  if (hasAuthCode(error)) {
    return true
  }

  if (hasAuthTokenInRequest(error)) {
    return true
  }

  return false
}

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (shouldClearSessionOnUnauthorized(error)) {
      unauthorizedHandler?.()
    }

    // Handle PLAN_EXPIRED 403 from backend
    if (error.response?.status === 403) {
      const data = error.response.data as { errors?: Array<{ code?: string; message?: string }> } | undefined
      const code = data?.errors?.[0]?.code
      if (code === 'PLAN_EXPIRED') {
        const msg = data?.errors?.[0]?.message || 'Plano expirado. Acesso somente leitura.'
        planExpiredHandler?.(msg)
      }
    }

    return Promise.reject(error)
  }
)

export default api
