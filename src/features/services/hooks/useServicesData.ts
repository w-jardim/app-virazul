import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getApiErrorMessage,
  servicesApi
} from '../api/services.api'
import type {
  CreateServiceInput,
  ServiceItem,
  ServiceListFilters,
  ServiceTransitionInput,
  UpdateServiceInput
} from '../types/services.types'

function toDateKey(value: string) {
  return new Date(value).toISOString().slice(0, 10)
}

function matchesPeriod(item: ServiceItem, start?: string, end?: string) {
  if (!start && !end) {
    return true
  }

  const dateKey = toDateKey(item.start_at)
  if (start && dateKey < start) {
    return false
  }
  if (end && dateKey > end) {
    return false
  }
  return true
}

export function useServiceTypes() {
  return useQuery({
    queryKey: ['service-types'],
    queryFn: servicesApi.listServiceTypes,
    staleTime: 60_000
  })
}

export function useServiceDateRange() {
  return useQuery({
    queryKey: ['services', 'date-range'],
    queryFn: servicesApi.getDateRange,
    staleTime: 15_000
  })
}

export function useServicesList(filters: ServiceListFilters) {
  const query = useQuery({
    queryKey: ['services', 'list', filters.serviceTypeId || null],
    queryFn: () =>
      servicesApi.list({
        service_type_id: filters.serviceTypeId
      }),
    staleTime: 15_000
  })

  const filteredData = useMemo(() => {
    const list = query.data || []
    return list.filter((item) => {
      if (filters.operationalStatus && item.operational_status !== filters.operationalStatus) {
        return false
      }

      if (filters.financialStatus && item.financial_status !== filters.financialStatus) {
        return false
      }

      return matchesPeriod(item, filters.periodStart, filters.periodEnd)
    })
  }, [filters.financialStatus, filters.operationalStatus, filters.periodEnd, filters.periodStart, query.data])

  return {
    ...query,
    data: filteredData
  }
}

export function useServiceDetail(id?: number) {
  return useQuery({
    queryKey: ['services', 'detail', id],
    queryFn: () => servicesApi.getById(Number(id)),
    enabled: Boolean(id)
  })
}

function invalidateServices(queryClient: ReturnType<typeof useQueryClient>, id?: number) {
  void queryClient.invalidateQueries({ queryKey: ['services', 'list'] })
  void queryClient.invalidateQueries({ queryKey: ['services', 'date-range'] })
  if (id) {
    void queryClient.invalidateQueries({ queryKey: ['services', 'detail', id] })
  }
  void queryClient.invalidateQueries({ queryKey: ['agenda'] })
  void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
  void queryClient.invalidateQueries({ queryKey: ['finance'] })
  void queryClient.invalidateQueries({ queryKey: ['reports'] })
}

export function useCreateService() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateServiceInput) => servicesApi.create(payload),
    onSuccess: () => {
      invalidateServices(queryClient)
    }
  })
}

export function useUpdateService(id: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateServiceInput) => servicesApi.update(id, payload),
    onSuccess: () => {
      invalidateServices(queryClient, id)
    }
  })
}

export function useDeleteService(id: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => servicesApi.remove(id),
    onSuccess: () => {
      invalidateServices(queryClient, id)
    }
  })
}

export function useTransitionService(id: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: ServiceTransitionInput) => servicesApi.transition(id, payload),
    onSuccess: () => {
      invalidateServices(queryClient, id)
    }
  })
}

export function useConfirmPaymentService() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => servicesApi.confirmPayment(id),
    onSuccess: (data) => {
      invalidateServices(queryClient, data.id)
    }
  })
}

export function usePromoteReservationService() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => servicesApi.promoteReservation(id),
    onSuccess: (data) => {
      invalidateServices(queryClient, data.id)
    }
  })
}

export { getApiErrorMessage }
