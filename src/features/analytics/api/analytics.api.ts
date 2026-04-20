import api from '@/lib/api/axios'

export const analyticsApi = {
  getUserAnalytics: (params?: Record<string, any>) =>
    api.get('/analytics/user', { params }).then((r) => r.data.data),
}
