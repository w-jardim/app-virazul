import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { scheduleApi } from '../api/schedule.api'
import type { ScheduleTemplate } from '../types/schedule.types'

export const SCHEDULE_TEMPLATE_KEY = ['schedule', 'template']
export const scheduleCalendarKey = (month: string) => ['schedule', 'calendar', month]

export function useScheduleTemplate() {
  return useQuery({
    queryKey: SCHEDULE_TEMPLATE_KEY,
    queryFn: scheduleApi.getTemplate,
    staleTime: 60_000,
  })
}

export function useScheduleCalendar(month: string) {
  return useQuery({
    queryKey: scheduleCalendarKey(month),
    queryFn: () => scheduleApi.getCalendar(month),
    staleTime: 30_000,
    enabled: Boolean(month),
  })
}

export function useSaveScheduleTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (template: ScheduleTemplate) => scheduleApi.saveTemplate(template),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['schedule'] })
    },
  })
}

export function useDeleteScheduleTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: scheduleApi.deleteTemplate,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['schedule'] })
    },
  })
}
