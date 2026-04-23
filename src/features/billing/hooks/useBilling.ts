import { useQuery, useMutation } from '@tanstack/react-query'
import { billingApi } from '../api/billing.api'

export const useBilling = () =>
  useQuery({
    queryKey: ['billing'],
    queryFn: billingApi.getSubscription
  })

export const useCheckoutPremium = () =>
  useMutation({
    mutationFn: billingApi.createCheckoutPremium
  })

export const useCheckoutPro = () =>
  useMutation({
    mutationFn: billingApi.createCheckoutPro
  })

export const usePixCharge = () =>
  useMutation({
    mutationFn: billingApi.createPixCharge
  })

export const useCancelSubscription = () =>
  useMutation({
    mutationFn: billingApi.cancel
  })
