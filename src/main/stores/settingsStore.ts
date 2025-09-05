import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface BrowserSettings {
  // General Settings
  defaultSearchEngine: string
  homepage: string
  newTabPage: 'blank' | 'homepage' | 'custom'
  customNewTabUrl: string
  
  // Privacy & Security
  blockAds: boolean
  blockTrackers: boolean
  enableIncognito: boolean
  clearDataOnExit: boolean
  allowCookies: boolean
  
  // Performance
  enableHardwareAcceleration: boolean
  maxTabs: number
  autoCloseInactiveTabs: boolean
  inactiveTabTimeout: number // minutes
  
  // AI Settings
  aiModel: string
  aiTemperature: number
  aiMaxTokens: number
  enableVoiceCommands: boolean
  voiceLanguage: string
  autoSummarizePages: boolean
  
  // Appearance
  showBookmarksBar: boolean
  showTabBar: boolean
  showNavigationBar: boolean
  compactMode: boolean
  fontSize: 'small' | 'medium' | 'large'
  
  // Advanced
  enableExtensions: boolean
  enableDeveloperTools: boolean
  enableLogging: boolean
  customUserAgent: string
  proxySettings: {
    enabled: boolean
    host: string
    port: number
    username?: string
    password?: string
  }
}

export interface SettingsStore {
  settings: BrowserSettings
  isSettingsOpen: boolean
  
  // Actions
  updateSettings: (updates: Partial<BrowserSettings>) => void
  resetSettings: () => void
  toggleSettings: () => void
  openSettings: () => void
  closeSettings: () => void
  
  // Computed
  getDefaultSettings: () => BrowserSettings
  exportSettings: () => string
  importSettings: (settingsJson: string) => boolean
}

const defaultSettings: BrowserSettings = {
  // General Settings
  defaultSearchEngine: 'https://www.google.com/search?q=',
  homepage: 'https://www.google.com',
  newTabPage: 'blank',
  customNewTabUrl: 'https://www.google.com',
  
  // Privacy & Security
  blockAds: true,
  blockTrackers: true,
  enableIncognito: true,
  clearDataOnExit: false,
  allowCookies: true,
  
  // Performance
  enableHardwareAcceleration: true,
  maxTabs: 20,
  autoCloseInactiveTabs: false,
  inactiveTabTimeout: 30,
  
  // AI Settings
  aiModel: 'gemma2-9b-it',
  aiTemperature: 0.7,
  aiMaxTokens: 1000,
  enableVoiceCommands: true,
  voiceLanguage: 'en-US',
  autoSummarizePages: false,
  
  // Appearance
  showBookmarksBar: true,
  showTabBar: true,
  showNavigationBar: true,
  compactMode: false,
  fontSize: 'medium',
  
  // Advanced
  enableExtensions: true,
  enableDeveloperTools: false,
  enableLogging: false,
  customUserAgent: '',
  proxySettings: {
    enabled: false,
    host: '',
    port: 8080,
    username: '',
    password: ''
  }
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,
      isSettingsOpen: false,
      
      updateSettings: (updates) => {
        set(state => ({
          settings: {
            ...state.settings,
            ...updates
          }
        }))
        
        // Apply settings immediately
        get().applySettings(updates)
      },
      
      resetSettings: () => {
        const defaultSettings = get().getDefaultSettings()
        set({ settings: defaultSettings })
        get().applySettings(defaultSettings)
      },
      
      toggleSettings: () => {
        set(state => ({ isSettingsOpen: !state.isSettingsOpen }))
      },
      
      openSettings: () => {
        set({ isSettingsOpen: true })
      },
      
      closeSettings: () => {
        set({ isSettingsOpen: false })
      },
      
      getDefaultSettings: () => {
        return { ...defaultSettings }
      },
      
      exportSettings: () => {
        const settings = get().settings
        return JSON.stringify(settings, null, 2)
      },
      
      importSettings: (settingsJson) => {
        try {
          const settings = JSON.parse(settingsJson)
          set({ settings })
          get().applySettings(settings)
          return true
        } catch (error) {
          console.error('Failed to import settings:', error)
          return false
        }
      },
      
      // Internal method to apply settings
      applySettings: (settings: Partial<BrowserSettings>) => {
        // Apply font size
        if (settings.fontSize) {
          const fontSizeMap = {
            small: '12px',
            medium: '14px',
            large: '16px'
          }
          document.documentElement.style.fontSize = fontSizeMap[settings.fontSize]
        }
        
        // Apply compact mode
        if (settings.compactMode !== undefined) {
          document.body.classList.toggle('compact-mode', settings.compactMode)
        }
        
        // Log settings changes
        if (settings.enableLogging) {
          console.log('Settings applied:', settings)
        }
      }
    }),
    {
      name: 'kairo-settings',
      partialize: (state) => ({ settings: state.settings })
    }
  )
)
