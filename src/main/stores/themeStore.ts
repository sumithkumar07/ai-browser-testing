import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Theme {
  id: string
  name: string
  description: string
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    surface: string
    text: string
    textSecondary: string
    border: string
    success: string
    warning: string
    error: string
  }
  isDark: boolean
}

export interface ThemeStore {
  currentTheme: string
  themes: Theme[]
  isHighContrast: boolean
  setTheme: (themeId: string) => void
  toggleHighContrast: () => void
  addCustomTheme: (theme: Omit<Theme, 'id'>) => void
  removeCustomTheme: (themeId: string) => void
  getCurrentTheme: () => Theme | undefined
}

const defaultThemes: Theme[] = [
  {
    id: 'light',
    name: 'Light',
    description: 'Clean light theme',
    isDark: false,
    colors: {
      primary: '#ffffff',
      secondary: '#f8f9fa',
      accent: '#007bff',
      background: '#ffffff',
      surface: '#f8f9fa',
      text: '#1f2937',
      textSecondary: '#6b7280',
      border: '#e5e7eb',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444'
    }
  },
  {
    id: 'dark',
    name: 'Dark',
    description: 'Modern dark theme',
    isDark: true,
    colors: {
      primary: '#1a1a1a',
      secondary: '#2a2a2a',
      accent: '#4dabf7',
      background: '#1a1a1a',
      surface: '#2a2a2a',
      text: '#ffffff',
      textSecondary: '#a0a0a0',
      border: '#333333',
      success: '#34d399',
      warning: '#fbbf24',
      error: '#f87171'
    }
  },
  {
    id: 'blue',
    name: 'Ocean Blue',
    description: 'Calming blue theme',
    isDark: false,
    colors: {
      primary: '#f0f8ff',
      secondary: '#e6f3ff',
      accent: '#2563eb',
      background: '#f0f8ff',
      surface: '#e6f3ff',
      text: '#1e3a8a',
      textSecondary: '#475569',
      border: '#bfdbfe',
      success: '#059669',
      warning: '#d97706',
      error: '#dc2626'
    }
  },
  {
    id: 'green',
    name: 'Forest Green',
    description: 'Nature-inspired theme',
    isDark: false,
    colors: {
      primary: '#f0fdf4',
      secondary: '#ecfdf5',
      accent: '#16a34a',
      background: '#f0fdf4',
      surface: '#ecfdf5',
      text: '#14532d',
      textSecondary: '#374151',
      border: '#bbf7d0',
      success: '#059669',
      warning: '#d97706',
      error: '#dc2626'
    }
  },
  {
    id: 'purple',
    name: 'Royal Purple',
    description: 'Elegant purple theme',
    isDark: true,
    colors: {
      primary: '#1a1a2e',
      secondary: '#16213e',
      accent: '#a855f7',
      background: '#1a1a2e',
      surface: '#16213e',
      text: '#ffffff',
      textSecondary: '#cbd5e1',
      border: '#334155',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444'
    }
  },
  {
    id: 'sunset',
    name: 'Sunset',
    description: 'Warm sunset colors',
    isDark: false,
    colors: {
      primary: '#fef7ed',
      secondary: '#fed7aa',
      accent: '#ea580c',
      background: '#fef7ed',
      surface: '#fed7aa',
      text: '#7c2d12',
      textSecondary: '#92400e',
      border: '#fdba74',
      success: '#059669',
      warning: '#d97706',
      error: '#dc2626'
    }
  }
]

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      currentTheme: 'light',
      themes: defaultThemes,
      isHighContrast: false,
      
      setTheme: (themeId: string) => {
        const theme = get().themes.find(t => t.id === themeId)
        if (theme) {
          set({ currentTheme: themeId })
          // Apply theme to document
          document.documentElement.setAttribute('data-theme', themeId)
          document.documentElement.setAttribute('data-dark', theme.isDark.toString())
        }
      },
      
      toggleHighContrast: () => {
        const newValue = !get().isHighContrast
        set({ isHighContrast: newValue })
        document.documentElement.setAttribute('data-contrast', newValue ? 'high' : 'normal')
      },
      
      addCustomTheme: (theme: Omit<Theme, 'id'>) => {
        const newTheme: Theme = {
          ...theme,
          id: `custom-${Date.now()}`
        }
        set(state => ({
          themes: [...state.themes, newTheme]
        }))
      },
      
      removeCustomTheme: (themeId: string) => {
        set(state => ({
          themes: state.themes.filter(t => t.id !== themeId),
          currentTheme: state.currentTheme === themeId ? 'light' : state.currentTheme
        }))
      },
      
      getCurrentTheme: () => {
        return get().themes.find(t => t.id === get().currentTheme)
      }
    }),
    {
      name: 'kairo-theme-storage',
      partialize: (state) => ({ 
        currentTheme: state.currentTheme, 
        themes: state.themes,
        isHighContrast: state.isHighContrast 
      })
    }
  )
)
