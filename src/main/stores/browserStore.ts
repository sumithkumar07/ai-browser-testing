import { create } from 'zustand'

export interface Tab {
  id: string
  title: string
  url: string
  isActive: boolean
  isLoading: boolean
}

interface BrowserStore {
  // State
  tabs: Tab[]
  activeTabId: string | null
  
  // Actions
  addTab: (url?: string) => void
  closeTab: (id: string) => void
  setActiveTab: (id: string) => void
  updateTab: (id: string, updates: Partial<Tab>) => void
  navigateTab: (id: string, url: string) => void
}

export const useBrowserStore = create<BrowserStore>((set) => ({
  // Initial state - start with one default tab
  tabs: [{
    id: 'tab-1',
    title: 'New Tab',
    url: '',
    isActive: true,
    isLoading: false
  }],
  activeTabId: 'tab-1',
  
  // Actions
  addTab: (url = '') => {
    const newTab: Tab = {
      id: `tab-${Date.now()}`,
      title: 'New Tab',
      url: url,
      isActive: true,
      isLoading: false
    }
    
    set((state) => ({
      tabs: state.tabs.map(tab => ({ ...tab, isActive: false })).concat(newTab),
      activeTabId: newTab.id
    }))
  },
  
  closeTab: (id: string) => {
    set((state) => {
      const newTabs = state.tabs.filter(tab => tab.id !== id)
      const wasActive = state.activeTabId === id
      
      let newActiveTabId = state.activeTabId
      if (wasActive && newTabs.length > 0) {
        // Activate the next tab
        const currentIndex = state.tabs.findIndex(tab => tab.id === id)
        const nextTab = newTabs[currentIndex] || newTabs[currentIndex - 1]
        newActiveTabId = nextTab.id
        newTabs.forEach(tab => {
          tab.isActive = tab.id === newActiveTabId
        })
      }
      
      return {
        tabs: newTabs,
        activeTabId: newActiveTabId
      }
    })
  },
  
  setActiveTab: (id: string) => {
    set((state) => ({
      tabs: state.tabs.map(tab => ({
        ...tab,
        isActive: tab.id === id
      })),
      activeTabId: id
    }))
  },
  
  updateTab: (id: string, updates: Partial<Tab>) => {
    set((state) => ({
      tabs: state.tabs.map(tab => 
        tab.id === id ? { ...tab, ...updates } : tab
      )
    }))
  },
  
  navigateTab: (id: string, url: string) => {
    set((state) => ({
      tabs: state.tabs.map(tab => 
        tab.id === id 
          ? { ...tab, url, isLoading: true }
          : tab
      )
    }))
  }
}))
