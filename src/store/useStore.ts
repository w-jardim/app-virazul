import create from 'zustand'

type State = {
  sidebarOpen: boolean
  setSidebarOpen: (v: boolean) => void
}

const useStore = create<State>((set) => ({
  sidebarOpen: false,
  setSidebarOpen: (v: boolean) => set({ sidebarOpen: v })
}))

export default useStore
