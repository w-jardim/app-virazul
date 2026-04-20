import api from '@/lib/api/axios'

export const analyticsApi = {
  getUserAnalytics: (params?: Record<string, any>) =>
    api.get('/api/v1/analytics/user', { params }).then((r) => r.data.data),
  getAdminUserAnalyticsOverview: (params?: Record<string, any>) =>
    api.get('/api/v1/user-analytics/overview', { params }).then((r) => r.data.data),
}
