// src/main/stores/browserStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Tab {
  id: string
  title: string
  url: string
  isLoading: boolean
  canGoBack: boolean
  canGoForward: boolean
  favicon?: string
  isActive: boolean
}

export interface BrowserState {
  tabs: Tab[]
  activeTabId: string | null
  isLoading: boolean
  error: string | null
  isAISidebarOpen: boolean
  currentUrl: string
  canGoBack: boolean
  canGoForward: boolean
}

export interface BrowserActions {
  addTab: (url: string) => void
  closeTab: (tabId: string) => void
  switchTab: (tabId: string) => void
  updateTab: (tabId: string, updates: Partial<Tab>) => void
  navigateTo: (url: string) => void
  goBack: () => void
  goForward: () => void
  reload: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  toggleAISidebar: () => void
  setAISidebarOpen: (open: boolean) => void
  setCurrentUrl: (url: string) => void
  setNavigationState: (canGoBack: boolean, canGoForward: boolean) => void
}

export const useBrowserStore = create<BrowserState & BrowserActions>()(
  persist(
    (set, get) => ({
      // State
      tabs: [],
      activeTabId: null,
      isLoading: false,
      error: null,
      isAISidebarOpen: false,
      currentUrl: '',
      canGoBack: false,
      canGoForward: false,

      // Actions
      addTab: (url: string) => {
        const newTab: Tab = {
          id: `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          title: 'New Tab',
          url: url,
          isLoading: true,
          canGoBack: false,
          canGoForward: false,
          isActive: true
        }

        set((state) => ({
          tabs: state.tabs.map(tab => ({ ...tab, isActive: false })).concat(newTab),
          activeTabId: newTab.id,
          currentUrl: url
        }))
      },

      closeTab: (tabId: string) => {
        set((state) => {
          const remainingTabs = state.tabs.filter(tab => tab.id !== tabId)
          const wasActive = state.activeTabId === tabId
          
          let newActiveTabId = state.activeTabId
          if (wasActive && remainingTabs.length > 0) {
            // Switch to the next available tab
            const currentIndex = state.tabs.findIndex(tab => tab.id === tabId)
            const nextIndex = currentIndex < remainingTabs.length ? currentIndex : remainingTabs.length - 1
            newActiveTabId = remainingTabs[nextIndex].id
            remainingTabs[nextIndex].isActive = true
          } else if (remainingTabs.length === 0) {
            newActiveTabId = null
          }

          return {
            tabs: remainingTabs,
            activeTabId: newActiveTabId,
            currentUrl: newActiveTabId ? remainingTabs.find(tab => tab.id === newActiveTabId)?.url || '' : ''
          }
        })
      },

      switchTab: (tabId: string) => {
        set((state) => ({
          tabs: state.tabs.map(tab => ({
            ...tab,
            isActive: tab.id === tabId
          })),
          activeTabId: tabId,
          currentUrl: state.tabs.find(tab => tab.id === tabId)?.url || ''
        }))
      },

      updateTab: (tabId: string, updates: Partial<Tab>) => {
        set((state) => ({
          tabs: state.tabs.map(tab =>
            tab.id === tabId ? { ...tab, ...updates } : tab
          )
        }))
      },

      navigateTo: (url: string) => {
        const { activeTabId } = get()
        if (activeTabId) {
          set((state) => ({
            tabs: state.tabs.map(tab =>
              tab.id === activeTabId
                ? { ...tab, url, isLoading: true, title: 'Loading...' }
                : tab
            ),
            currentUrl: url,
            isLoading: true,
            error: null
          }))
        }
      },

      goBack: () => {
        const { activeTabId } = get()
        if (activeTabId) {
          set((state) => ({
            tabs: state.tabs.map(tab =>
              tab.id === activeTabId
                ? { ...tab, canGoBack: false, isLoading: true }
                : tab
            ),
            isLoading: true
          }))
        }
      },

      goForward: () => {
        const { activeTabId } = get()
        if (activeTabId) {
          set((state) => ({
            tabs: state.tabs.map(tab =>
              tab.id === activeTabId
                ? { ...tab, canGoForward: false, isLoading: true }
                : tab
            ),
            isLoading: true
          }))
        }
      },

      reload: () => {
        const { activeTabId } = get()
        if (activeTabId) {
          set((state) => ({
            tabs: state.tabs.map(tab =>
              tab.id === activeTabId
                ? { ...tab, isLoading: true }
                : tab
            ),
            isLoading: true,
            error: null
          }))
        }
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },

      setError: (error: string | null) => {
        set({ error, isLoading: false })
      },

      toggleAISidebar: () => {
        set((state) => ({ isAISidebarOpen: !state.isAISidebarOpen }))
      },

      setAISidebarOpen: (open: boolean) => {
        set({ isAISidebarOpen: open })
      },

      setCurrentUrl: (url: string) => {
        set({ currentUrl: url })
      },

      setNavigationState: (canGoBack: boolean, canGoForward: boolean) => {
        set({ canGoBack, canGoForward })
      }
    }),
    {
      name: 'browser-store',
      partialize: (state) => ({
        tabs: state.tabs,
        activeTabId: state.activeTabId,
        isAISidebarOpen: state.isAISidebarOpen
      })
    }
  )
)
