// KAiro Browser Main Application Component
// Last Updated: Bug Fix Session - Enhanced Error Handling & Performance
import React, { useState, useEffect, useCallback, useMemo } from 'react'
import TabBar from './components/TabBar'
import EnhancedNavigationBar from './components/EnhancedNavigationBar'
import BrowserWindow from './components/BrowserWindow'
import AISidebar from './components/AISidebar'
import EnhancedErrorBoundary from './components/EnhancedErrorBoundary'
import DebugPanel from './components/DebugPanel'
import { Tab, BrowserEvent } from './types/electron'
import { createLogger } from '../core/logger/EnhancedLogger'
import './styles/App.css'
import './styles/EnhancedNavigationBar.css'

const logger = createLogger('App')

const App: React.FC = () => {
  // Core State
  const [tabs, setTabs] = useState<Tab[]>([])
  const [activeTabId, setActiveTabId] = useState<string | null>(null)
  const [isAISidebarOpen, setIsAISidebarOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDebugPanelOpen, setIsDebugPanelOpen] = useState(false)

  // FIXED: Enhanced performance with useMemo for heavy computations
  const activeTab = useMemo(() => 
    tabs.find(tab => tab.id === activeTabId) || null,
    [tabs, activeTabId]
  )

  // FIXED: Enhanced error handling with better user feedback
  const handleError = useCallback((error: Error, context?: string) => {
    const errorMessage = `${context ? context + ': ' : ''}${error.message}`
    logger.error('Application error', error, { context })
    setError(errorMessage)
    
    // Auto-clear error after 8 seconds (increased from 5)
    setTimeout(() => {
      setError(null)
    }, 8000)
  }, [])

  // FIXED: Enhanced initialization with proper error handling
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setIsLoading(true)
        
        // Initialize configuration system
        try {
          const { config } = await import('../core/config/ConfigManager')
          await config.initialize()
          logger.info('Configuration system initialized successfully')
        } catch (configError) {
          logger.warn('Configuration system initialization failed, using defaults', { error: configError })
        }
        
        // Check if Electron API is available
        if (!window.electronAPI) {
          throw new Error('Electron API not available - running outside Electron environment')
        }

        // Create initial tab
        const result = await window.electronAPI.createTab('https://www.google.com')
        if (result && result.success) {
          const initialTab: Tab = {
            id: result.tabId || 'tab-1',
            title: 'Google',
            url: 'https://www.google.com',
            isLoading: false,
            isActive: true,
            type: 'browser'
          }
          
          setTabs([initialTab])
          setActiveTabId(initialTab.id)
        } else {
          throw new Error(result?.error || 'Failed to create initial tab')
        }

        // Test AI connection
        try {
          const aiTest = await window.electronAPI.testConnection()
          if (!aiTest?.success) {
            logger.warn('AI service not available:', aiTest?.error)
          } else {
            logger.info('AI service connected successfully')
          }
        } catch (aiError) {
          logger.warn('AI service test failed:', { error: aiError })
        }

        // Initialize Enhanced Backend Services
        try {
          const { initializeEnhancedBackend } = await import('../core/services/index')
          const backendResult = await initializeEnhancedBackend()
          logger.info('🚀 Enhanced Backend Services initialized:', {
            services: Object.keys(backendResult.services).length,
            health: `${(backendResult.health.overall * 100).toFixed(1)}%`,
            healthyServices: backendResult.health.services.filter((s: any) => s.status === 'healthy').length
          })
        } catch (backendError) {
          logger.warn('Enhanced Backend Services initialization failed, continuing with basic functionality:', { error: backendError })
        }

        setIsLoading(false)
        logger.info('✅ KAiro Browser initialized successfully')
        
      } catch (error) {
        logger.error('Failed to initialize app', error as Error)
        handleError(error as Error, 'Initialization')
        setIsLoading(false)
      }
    }

    initializeApp()
  }, [handleError])

  // FIXED: Enhanced browser event listener with cleanup and performance optimization
  useEffect(() => {
    if (!window.electronAPI?.onBrowserEvent) {
      return
    }

    let eventListenerRef: ((event: BrowserEvent) => void) | null = null

    try {
      const handleBrowserEvent = (event: BrowserEvent) => {
        try {
          logger.debug('Browser event received:', event)
          
          // Use requestAnimationFrame for performance optimization
          requestAnimationFrame(() => {
            switch (event.type) {
              case 'tab-updated':
                if (event.tabId && event.title) {
                  setTabs(prevTabs => 
                    prevTabs.map(tab => 
                      tab.id === event.tabId 
                        ? { ...tab, title: event.title || tab.title, url: event.url || tab.url }
                        : tab
                    )
                  )
                }
                break
              case 'page-loading':
                if (event.tabId) {
                  setTabs(prevTabs =>
                    prevTabs.map(tab =>
                      tab.id === event.tabId
                        ? { ...tab, isLoading: true }
                        : tab
                    )
                  )
                }
                break
              case 'page-loaded':
                if (event.tabId) {
                  setTabs(prevTabs =>
                    prevTabs.map(tab =>
                      tab.id === event.tabId
                        ? { ...tab, isLoading: false }
                        : tab
                    )
                  )
                }
                break
              default:
                logger.debug('Unhandled browser event:', { eventType: event.type })
            }
          })
        } catch (eventError) {
          logger.error('Error handling browser event', eventError as Error)
        }
      }

      eventListenerRef = handleBrowserEvent
      window.electronAPI.onBrowserEvent(handleBrowserEvent)

      // FIXED: Enhanced cleanup with null checks
      return () => {
        try {
          if (eventListenerRef && window.electronAPI?.removeBrowserEventListener) {
            window.electronAPI.removeBrowserEventListener()
          }
          eventListenerRef = null
        } catch (cleanupError) {
          logger.error('Error during event listener cleanup', cleanupError as Error)
        }
      }
    } catch (error) {
      logger.error('Failed to setup browser event listener', error as Error)
    }
  }, [])

  // FIXED: Enhanced tab creation with error handling
  const createTab = useCallback(async (url?: string, type?: 'browser' | 'ai') => {
    try {
      if (type === 'ai') {
        // Create AI tab
        const result = await window.electronAPI.createAITab('AI Chat', '')
        if (result && result.success) {
          const newTab: Tab = {
            id: result.tabId,
            title: result.title || 'AI Chat',
            url: 'ai://chat',
            isLoading: false,
            isActive: false,
            type: 'ai',
            content: ''
          }
          
          setTabs(prevTabs => [...prevTabs, newTab])
          setActiveTabId(newTab.id)
        } else {
          throw new Error(result?.error || 'Failed to create AI tab')
        }
      } else {
        // Create browser tab
        const result = await window.electronAPI.createTab(url)
        if (result && result.success) {
          const newTab: Tab = {
            id: result.tabId,
            title: 'Loading...',
            url: url || 'https://www.google.com',
            isLoading: true,
            isActive: false,
            type: 'browser'
          }
          
          setTabs(prevTabs => [...prevTabs, newTab])
          setActiveTabId(newTab.id)
        } else {
          throw new Error(result?.error || 'Failed to create browser tab')
        }
      }
    } catch (error) {
      handleError(error as Error, 'Tab Creation')
    }
  }, [handleError])

  // FIXED: Enhanced tab closing with cleanup
  const closeTab = useCallback(async (tabId: string) => {
    try {
      const result = await window.electronAPI.closeTab(tabId)
      if (result && result.success) {
        setTabs(prevTabs => {
          const updatedTabs = prevTabs.filter(tab => tab.id !== tabId)
          
          // If we closed the active tab, switch to another tab
          if (activeTabId === tabId && updatedTabs.length > 0) {
            setActiveTabId(updatedTabs[0].id)
          } else if (updatedTabs.length === 0) {
            // Create a new tab if no tabs remain
            createTab()
          }
          
          return updatedTabs
        })
      } else {
        throw new Error(result?.error || 'Failed to close tab')
      }
    } catch (error) {
      handleError(error as Error, 'Tab Closing')
    }
  }, [activeTabId, createTab, handleError])

  // FIXED: Enhanced tab switching
  const switchTab = useCallback(async (tabId: string) => {
    try {
      const result = await window.electronAPI.switchTab(tabId)
      if (result && result.success) {
        setActiveTabId(tabId)
        setTabs(prevTabs =>
          prevTabs.map(tab => ({
            ...tab,
            isActive: tab.id === tabId
          }))
        )
      } else {
        throw new Error(result?.error || 'Failed to switch tab')
      }
    } catch (error) {
      handleError(error as Error, 'Tab Switching')
    }
  }, [handleError])

  // FIXED: Enhanced navigation with validation
  const navigateTo = useCallback(async (url: string) => {
    try {
      // Basic URL validation
      if (!url || url.trim().length === 0) {
        throw new Error('URL cannot be empty')
      }

      const result = await window.electronAPI.navigateTo(url)
      if (result && result.success) {
        // Update active tab URL immediately for better UX
        if (activeTabId) {
          setTabs(prevTabs =>
            prevTabs.map(tab =>
              tab.id === activeTabId
                ? { ...tab, url, isLoading: true }
                : tab
            )
          )
        }
      } else {
        throw new Error(result?.error || 'Navigation failed')
      }
    } catch (error) {
      handleError(error as Error, 'Navigation')
    }
  }, [activeTabId, handleError])

  // FIXED: Enhanced content update handler
  const handleTabContentChange = useCallback(async (tabId: string, content: string) => {
    try {
      if (!tabId || !content) {
        return
      }

      const tab = tabs.find(t => t.id === tabId)
      if (tab && tab.type === 'ai') {
        const result = await window.electronAPI.saveAITabContent(tabId, content)
        if (result && result.success) {
          setTabs(prevTabs =>
            prevTabs.map(t =>
              t.id === tabId ? { ...t, content } : t
            )
          )
        } else {
          logger.warn('Failed to save AI tab content:', result?.error)
        }
      }
    } catch (error) {
      logger.error('Error updating tab content', error as Error)
    }
  }, [tabs])

  // Use the handler in BrowserWindow
  const createAITabHandler = useCallback((title: string, _content: string) => {
    createTab(`ai://tab/${title}`, 'ai')
  }, [createTab])

  // FIXED: Enhanced AI sidebar toggle
  const toggleAISidebar = useCallback(() => {
    setIsAISidebarOpen(prev => {
      logger.debug(`AI Sidebar ${!prev ? 'opened' : 'closed'}`)
      return !prev
    })
  }, [])

  // FIXED: Enhanced error clearing
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Debug panel keyboard shortcut (Ctrl+Shift+D or Cmd+Shift+D)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'D') {
        event.preventDefault()
        setIsDebugPanelOpen(prev => !prev)
        logger.info('Debug panel toggled', { isOpen: !isDebugPanelOpen })
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isDebugPanelOpen])

  // FIXED: Loading screen component
  if (isLoading) {
    return (
      <div className="loading-spinner">
        <div>🚀 Loading KAiro Browser...</div>
      </div>
    )
  }

  // FIXED: Error screen component
  if (error) {
    return (
      <div className="error-container">
        <h2>⚠️ Application Error</h2>
        <p>{error}</p>
        <button onClick={clearError}>Try Again</button>
        <button onClick={() => window.location.reload()}>Reload App</button>
      </div>
    )
  }

  return (
    <EnhancedErrorBoundary onError={(error, errorInfo) => handleError(error, errorInfo.componentStack || 'Unknown context')}>
      <div className="app">
        <div className="app-header">
          <TabBar
            tabs={tabs}
            activeTabId={activeTabId}
            onTabClick={switchTab}
            onTabClose={closeTab}
            onNewTab={() => createTab()}
          />
          <EnhancedNavigationBar
            currentUrl={activeTab?.url || ''}
            onNavigate={navigateTo}
            onGoBack={() => window.electronAPI.goBack()}
            onGoForward={() => window.electronAPI.goForward()}
            onReload={() => window.electronAPI.reload()}
            onToggleAI={toggleAISidebar}
            aiSidebarOpen={isAISidebarOpen}
          />
        </div>
        <div className="app-content">
          <BrowserWindow
            activeTabId={activeTabId}
            tabs={tabs}
            onCreateAITab={createAITabHandler}
            onContentChange={handleTabContentChange}
          />
          {isAISidebarOpen && (
            <AISidebar onClose={() => setIsAISidebarOpen(false)} />
          )}
        </div>
        
        {/* Debug Panel - Only in development */}
        {process.env.NODE_ENV === 'development' && (
          <DebugPanel 
            isOpen={isDebugPanelOpen} 
            onClose={() => setIsDebugPanelOpen(false)} 
          />
        )}
      </div>
    </EnhancedErrorBoundary>
  )
}

export default App