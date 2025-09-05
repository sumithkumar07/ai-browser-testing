import { create } from 'zustand'

interface UIStore {
  // State
  theme: 'light' | 'dark'
  showNewTabPage: boolean
  
  // Actions
  setTheme: (theme: 'light' | 'dark') => void
  setShowNewTabPage: (show: boolean) => void
}

export const useUIStore = create<UIStore>((set) => ({
  // Initial state
  theme: 'light',
  showNewTabPage: true,
  
  // Actions
  setTheme: (theme) => {
    set({ theme })
  },
  
  setShowNewTabPage: (show) => {
    set({ showNewTabPage: show })
  }
}))
