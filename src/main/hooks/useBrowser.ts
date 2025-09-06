// src/main/hooks/useBrowser.ts
import { useState, useEffect, useCallback } from 'react'
import BrowserEngine, { BrowserTab, BrowserEvent } from '../services/BrowserEngine'

export interface UseBrowserState {
  tabs: BrowserTab[]
  activeTabId: string | null
  currentUrl: string
  isLoading: boolean
  error: string | null
  isInitialized: boolean
}

export interface UseBrowserActions {
  createTab: (url?: string) => Promise<BrowserTab | null>
  closeTab: (tabId: string) => Promise<boolean>
  switchTab: (tabId: string) => Promise<boolean>
  navigateTo: (url: string) => Promise<boolean>
  goBack: () => Promise<boolean>
  goForward: () => Promise<boolean>
  reload: () => Promise<boolean>
  getCurrentUrl: () => Promise<string>
  getPageTitle: () => Promise<string>
  clearError: () => void
}

export const useBrowser = (): UseBrowserState & UseBrowserActions => {
  const [browserEngine] = useState(() => BrowserEngine.getInstance())
  const [state, setState] = useState<UseBrowserState>({
    tabs: [],
    activeTabId: null,
    currentUrl: '',
    isLoading: false,
    error: null,
    isInitialized: false
  })

  // Initialize browser engine
  useEffect(() => {
    const initializeBrowser = async () => {
      try {
        await browserEngine.initialize()
        const engineState = browserEngine.getState()
        setState(prev => ({
          ...prev,
          ...engineState,
          isInitialized: true
        }))
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Failed to initialize browser',
          isInitialized: false
        }))
      }
    }

    initializeBrowser()
  }, [browserEngine])

  // Listen for browser events
  useEffect(() => {
    if (!state.isInitialized) return

    const handleBrowserEvent = (event: BrowserEvent) => {
      console.log('Browser event received:', event.type)
      
      switch (event.type) {
        case 'tab-created':
          setState(prev => {
            const engineState = browserEngine.getState()
            return { ...prev, ...engineState }
          })
          break
        case 'tab-closed':
          setState(prev => {
            const engineState = browserEngine.getState()
            return { ...prev, ...engineState }
          })
          break
        case 'tab-switched':
          setState(prev => {
            const engineState = browserEngine.getState()
            return { ...prev, ...engineState }
          })
          break
        case 'navigation-started':
          setState(prev => ({
            ...prev,
            isLoading: true,
            error: null
          }))
          break
        case 'navigation-completed':
          setState(prev => {
            const engineState = browserEngine.getState()
            return { ...prev, ...engineState, isLoading: false }
          })
          break
        case 'page-title-updated':
          setState(prev => {
            const engineState = browserEngine.getState()
            return { ...prev, ...engineState }
          })
          break
        case 'error':
          setState(prev => ({
            ...prev,
            error: event.error?.description || 'Unknown error',
            isLoading: false
          }))
          break
      }
    }

    // Add event listeners for all event types
    const eventTypes = [
      'tab-created',
      'tab-closed', 
      'tab-switched',
      'navigation-started',
      'navigation-completed',
      'page-title-updated',
      'error'
    ]

    eventTypes.forEach(eventType => {
      browserEngine.addEventListener(eventType, handleBrowserEvent)
    })

    return () => {
      eventTypes.forEach(eventType => {
        browserEngine.removeEventListener(eventType, handleBrowserEvent)
      })
    }
  }, [browserEngine, state.isInitialized])

  const createTab = useCallback(async (url: string = 'about:blank'): Promise<BrowserTab | null> => {
    if (!state.isInitialized) {
      setState(prev => ({ ...prev, error: 'Browser not initialized' }))
      return null
    }

    try {
      const tab = await browserEngine.createTab(url)
      if (tab) {
        const engineState = browserEngine.getState()
        setState(prev => ({ ...prev, ...engineState }))
      }
      return tab
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create tab'
      setState(prev => ({ ...prev, error: errorMessage }))
      return null
    }
  }, [browserEngine, state.isInitialized])

  const closeTab = useCallback(async (tabId: string): Promise<boolean> => {
    if (!state.isInitialized) {
      setState(prev => ({ ...prev, error: 'Browser not initialized' }))
      return false
    }

    try {
      const success = await browserEngine.closeTab(tabId)
      if (success) {
        const engineState = browserEngine.getState()
        setState(prev => ({ ...prev, ...engineState }))
      }
      return success
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to close tab'
      setState(prev => ({ ...prev, error: errorMessage }))
      return false
    }
  }, [browserEngine, state.isInitialized])

  const switchTab = useCallback(async (tabId: string): Promise<boolean> => {
    if (!state.isInitialized) {
      setState(prev => ({ ...prev, error: 'Browser not initialized' }))
      return false
    }

    try {
      const success = await browserEngine.switchTab(tabId)
      if (success) {
        const engineState = browserEngine.getState()
        setState(prev => ({ ...prev, ...engineState }))
      }
      return success
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to switch tab'
      setState(prev => ({ ...prev, error: errorMessage }))
      return false
    }
  }, [browserEngine, state.isInitialized])

  const navigateTo = useCallback(async (url: string): Promise<boolean> => {
    if (!state.isInitialized) {
      setState(prev => ({ ...prev, error: 'Browser not initialized' }))
      return false
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))
      const success = await browserEngine.navigateTo(url)
      
      const engineState = browserEngine.getState()
      setState(prev => ({ ...prev, ...engineState }))
      
      return success
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Navigation failed'
      setState(prev => ({ ...prev, error: errorMessage, isLoading: false }))
      return false
    }
  }, [browserEngine, state.isInitialized])

  const goBack = useCallback(async (): Promise<boolean> => {
    if (!state.isInitialized) return false

    try {
      return await browserEngine.goBack()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to go back'
      setState(prev => ({ ...prev, error: errorMessage }))
      return false
    }
  }, [browserEngine, state.isInitialized])

  const goForward = useCallback(async (): Promise<boolean> => {
    if (!state.isInitialized) return false

    try {
      return await browserEngine.goForward()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to go forward'
      setState(prev => ({ ...prev, error: errorMessage }))
      return false
    }
  }, [browserEngine, state.isInitialized])

  const reload = useCallback(async (): Promise<boolean> => {
    if (!state.isInitialized) return false

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))
      const success = await browserEngine.reload()
      setState(prev => ({ ...prev, isLoading: false }))
      return success
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reload'
      setState(prev => ({ ...prev, error: errorMessage, isLoading: false }))
      return false
    }
  }, [browserEngine, state.isInitialized])

  const getCurrentUrl = useCallback(async (): Promise<string> => {
    if (!state.isInitialized) return state.currentUrl

    try {
      const url = await browserEngine.getCurrentUrl()
      setState(prev => ({ ...prev, currentUrl: url }))
      return url
    } catch (error) {
      console.error('Failed to get current URL:', error)
      return state.currentUrl
    }
  }, [browserEngine, state.isInitialized, state.currentUrl])

  const getPageTitle = useCallback(async (): Promise<string> => {
    if (!state.isInitialized) return 'Untitled'

    try {
      return await browserEngine.getPageTitle()
    } catch (error) {
      console.error('Failed to get page title:', error)
      return 'Untitled'
    }
  }, [browserEngine, state.isInitialized])

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
    browserEngine.clearError()
  }, [browserEngine])

  return {
    ...state,
    createTab,
    closeTab,
    switchTab,
    navigateTo,
    goBack,
    goForward,
    reload,
    getCurrentUrl,
    getPageTitle,
    clearError
  }
}

export default useBrowser
