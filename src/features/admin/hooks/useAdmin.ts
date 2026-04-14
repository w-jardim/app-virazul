import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../api/admin.api'
import type { CreateUserPayload, UpdateUserPayload, SubscriptionPlan, PaymentStatus } from '../types/admin.types'

const USERS_KEY = ['admin', 'users'] as const
const STATS_KEY = ['admin', 'stats'] as const

export const useAdminUsers = () =>
  useQuery({ queryKey: USERS_KEY, queryFn: adminApi.getUsers })

export const useAdminStats = () =>
  useQuery({ queryKey: STATS_KEY, queryFn: adminApi.getStats })

export const useCreateUser = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateUserPayload) => adminApi.createUser(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: USERS_KEY })
      qc.invalidateQueries({ queryKey: STATS_KEY })
    }
  })
}

export const useUpdateUser = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: number } & UpdateUserPayload) =>
      adminApi.updateUser(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: USERS_KEY })
      qc.invalidateQueries({ queryKey: STATS_KEY })
    }
  })
}

export const useDeleteUser = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => adminApi.deleteUser(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: USERS_KEY })
      qc.invalidateQueries({ queryKey: STATS_KEY })
    }
  })
}

export const useChangeSubscription = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, subscription }: { id: number; subscription: SubscriptionPlan }) =>
      adminApi.changeSubscription(id, subscription),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: USERS_KEY })
      qc.invalidateQueries({ queryKey: STATS_KEY })
    }
  })
}

export const useChangePaymentStatus = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, paymentStatus }: { id: number; paymentStatus: PaymentStatus }) =>
      adminApi.changePaymentStatus(id, paymentStatus),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: USERS_KEY })
      qc.invalidateQueries({ queryKey: STATS_KEY })
    }
  })
}
