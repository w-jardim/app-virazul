import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

type PreferencesState = {
  insightsEnabled: boolean
  toggleInsights: () => void
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      insightsEnabled: true,
      toggleInsights: () => set((s) => ({ insightsEnabled: !s.insightsEnabled })),
    }),
    {
      name: 'viraazul_preferences',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
