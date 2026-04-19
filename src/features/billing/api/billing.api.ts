import api from '@/lib/api/axios'
import type {
  BillingSubscription,
  CheckoutPremiumResponse,
  PixChargeResponse,
  CancelSubscriptionResponse
} from '../types/billing.types'

export const billingApi = {
  async getSubscription(): Promise<BillingSubscription> {
    const res = await api.get('/api/v1/billing/subscription')
    return res.data.data
  },

  async createCheckoutPremium(): Promise<CheckoutPremiumResponse> {
    const res = await api.post('/api/v1/billing/checkout/premium', {})
    return res.data.data
  },

  async createPixCharge(): Promise<PixChargeResponse> {
    const res = await api.post('/api/v1/billing/pix/charge', {})
    return res.data.data
  },

  async cancel(): Promise<CancelSubscriptionResponse> {
    const res = await api.post('/api/v1/billing/subscription/cancel')
    return res.data.data
  }
}
