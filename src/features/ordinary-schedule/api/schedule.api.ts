import api from '@/lib/api/axios'
import type { ScheduleCalendar, ScheduleTemplate } from '../types/schedule.types'

type ApiEnvelope<T> = {
  data: T
  meta: unknown | null
  errors: Array<{ code: string; message: string }> | null
}

export const scheduleApi = {
  async getTemplate(): Promise<ScheduleTemplate | null> {
    const res = await api.get<ApiEnvelope<{ template: ScheduleTemplate | null }>>('/api/v1/schedules/template')
    return res.data.data.template
  },

  async saveTemplate(template: ScheduleTemplate): Promise<ScheduleTemplate | null> {
    const res = await api.put<ApiEnvelope<{ template: ScheduleTemplate | null }>>('/api/v1/schedules/template', template)
    return res.data.data.template
  },

  async deleteTemplate(): Promise<void> {
    await api.delete('/api/v1/schedules/template')
  },

  async getCalendar(month: string): Promise<ScheduleCalendar> {
    const res = await api.get<ApiEnvelope<ScheduleCalendar>>('/api/v1/schedules/calendar', {
      params: { month },
    })
    return res.data.data
  },
}
