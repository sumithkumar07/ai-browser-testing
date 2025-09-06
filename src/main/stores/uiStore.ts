// src/main/stores/uiStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface UITheme {
  name: string
  primaryColor: string
  backgroundColor: string
  textColor: string
  accentColor: string
}

export interface UISettings {
  theme: UITheme
  fontSize: 'small' | 'medium' | 'large'
  sidebarWidth: number
  showSidebar: boolean
  showTabBar: boolean
  showNavigationBar: boolean
  animationsEnabled: boolean
  soundEnabled: boolean
  notificationsEnabled: boolean
}

export interface UIState {
  settings: UISettings
  isFullscreen: boolean
  isMinimized: boolean
  windowBounds: {
    x: number
    y: number
    width: number
    height: number
  }
  activeModal: string | null
  activeDropdown: string | null
  isLoading: boolean
  error: string | null
}

export interface UIActions {
  updateSettings: (settings: Partial<UISettings>) => void
  setTheme: (theme: UITheme) => void
  setFontSize: (size: 'small' | 'medium' | 'large') => void
  setSidebarWidth: (width: number) => void
  toggleSidebar: () => void
  toggleTabBar: () => void
  toggleNavigationBar: () => void
  toggleAnimations: () => void
  toggleSound: () => void
  toggleNotifications: () => void
  setFullscreen: (fullscreen: boolean) => void
  setMinimized: (minimized: boolean) => void
  setWindowBounds: (bounds: { x: number; y: number; width: number; height: number }) => void
  openModal: (modalId: string) => void
  closeModal: () => void
  openDropdown: (dropdownId: string) => void
  closeDropdown: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  resetSettings: () => void
}

const defaultTheme: UITheme = {
  name: 'Dark',
  primaryColor: '#667eea',
  backgroundColor: '#1a1a1a',
  textColor: '#ffffff',
  accentColor: '#4ade80'
}

const defaultSettings: UISettings = {
  theme: defaultTheme,
  fontSize: 'medium',
  sidebarWidth: 300,
  showSidebar: true,
  showTabBar: true,
  showNavigationBar: true,
  animationsEnabled: true,
  soundEnabled: true,
  notificationsEnabled: true
}

export const useUIStore = create<UIState & UIActions>()(
  persist(
    (set, get) => ({
      // State
      settings: defaultSettings,
      isFullscreen: false,
      isMinimized: false,
      windowBounds: {
        x: 100,
        y: 100,
        width: 1200,
        height: 800
      },
      activeModal: null,
      activeDropdown: null,
      isLoading: false,
      error: null,

      // Actions
      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings }
        }))
      },

      setTheme: (theme) => {
        set((state) => ({
          settings: { ...state.settings, theme }
        }))
      },

      setFontSize: (fontSize) => {
        set((state) => ({
          settings: { ...state.settings, fontSize }
        }))
      },

      setSidebarWidth: (sidebarWidth) => {
        set((state) => ({
          settings: { ...state.settings, sidebarWidth }
        }))
      },

      toggleSidebar: () => {
        set((state) => ({
          settings: { ...state.settings, showSidebar: !state.settings.showSidebar }
        }))
      },

      toggleTabBar: () => {
        set((state) => ({
          settings: { ...state.settings, showTabBar: !state.settings.showTabBar }
        }))
      },

      toggleNavigationBar: () => {
        set((state) => ({
          settings: { ...state.settings, showNavigationBar: !state.settings.showNavigationBar }
        }))
      },

      toggleAnimations: () => {
        set((state) => ({
          settings: { ...state.settings, animationsEnabled: !state.settings.animationsEnabled }
        }))
      },

      toggleSound: () => {
        set((state) => ({
          settings: { ...state.settings, soundEnabled: !state.settings.soundEnabled }
        }))
      },

      toggleNotifications: () => {
        set((state) => ({
          settings: { ...state.settings, notificationsEnabled: !state.settings.notificationsEnabled }
        }))
      },

      setFullscreen: (isFullscreen) => {
        set({ isFullscreen })
      },

      setMinimized: (isMinimized) => {
        set({ isMinimized })
      },

      setWindowBounds: (windowBounds) => {
        set({ windowBounds })
      },

      openModal: (modalId) => {
        set({ activeModal: modalId })
      },

      closeModal: () => {
        set({ activeModal: null })
      },

      openDropdown: (dropdownId) => {
        set({ activeDropdown: dropdownId })
      },

      closeDropdown: () => {
        set({ activeDropdown: null })
      },

      setLoading: (isLoading) => {
        set({ isLoading })
      },

      setError: (error) => {
        set({ error })
      },

      resetSettings: () => {
        set({ settings: defaultSettings })
      }
    }),
    {
      name: 'ui-store',
      partialize: (state) => ({
        settings: state.settings,
        windowBounds: state.windowBounds
      })
    }
  )
)
