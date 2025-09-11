// KAiro Browser Main Application Component - Optimized & Robust
// Clean Architecture focused on core functionality
import React, { useState, useEffect, useCallback, useMemo } from 'react'
import TabBar from './components/TabBar'
import EnhancedNavigationBar from './components/EnhancedNavigationBar'
import BrowserWindow from './components/BrowserWindow'
import AISidebar from './components/AISidebar'
import EnhancedErrorBoundary from './components/EnhancedErrorBoundary'
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

  // Performance optimized computed values
  const activeTab = useMemo(() => 
    tabs.find(tab => tab.id === activeTabId) || null,
    [tabs, activeTabId]
  )

  // Enhanced error handling with user feedback
  const handleError = useCallback((error: Error, context?: string) => {
    const errorMessage = `${context ? context + ': ' : ''}${error.message}`
    logger.error('Application error', error, { context })
    setError(errorMessage)
    
    // Auto-clear error after 8 seconds
    setTimeout(() => {
      setError(null)
    }, 8000)
  }, [])

  // Robust initialization with comprehensive error handling
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setIsLoading(true)
        
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

        // Test AI connection with robust error handling
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

        // Initialize core services with fallback handling
        try {
          const { initializeIntelligentServices } = await import('./services/index')
          const intelligentResult = await initializeIntelligentServices()
          if (intelligentResult.success) {
            logger.info('🧠 Intelligent Services Suite initialized successfully:', {
              browserManager: 'AI-powered browser intelligence',
              dataManager: 'Smart caching and data optimization',
              performanceOptimizer: 'Predictive performance monitoring'
            })
          } else {
            logger.warn('Intelligent services initialization had issues:', intelligentResult.errors)
          }
        } catch (intelligentError) {
          logger.warn('Intelligent Services initialization failed, continuing with core functionality:', { error: intelligentError })
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

  // Enhanced browser event listener with cleanup and performance optimization
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

      // Enhanced cleanup with null checks
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

  // Enhanced tab creation with error handling
  const createTab = useCallback(async (url?: string, type?: 'browser' | 'ai') => {
    try {
      if (type === 'ai') {
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

  // Enhanced tab closing with cleanup and intelligent tab switching
  const closeTab = useCallback(async (tabId: string) => {
    try {
      const result = await window.electronAPI.closeTab(tabId)
      if (result && result.success) {
        setTabs(prevTabs => {
          const updatedTabs = prevTabs.filter(tab => tab.id !== tabId)
          
          // Smart tab switching logic
          if (activeTabId === tabId && updatedTabs.length > 0) {
            // Find the next logical tab to switch to
            const currentIndex = prevTabs.findIndex(tab => tab.id === tabId)
            const nextTab = updatedTabs[Math.min(currentIndex, updatedTabs.length - 1)]
            setActiveTabId(nextTab.id)
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

  // Enhanced tab switching with validation
  const switchTab = useCallback(async (tabId: string) => {
    try {
      // Validate tab exists
      const targetTab = tabs.find(tab => tab.id === tabId)
      if (!targetTab) {
        throw new Error(`Tab ${tabId} not found`)
      }

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
  }, [tabs, handleError])

  // Enhanced navigation with comprehensive URL validation and security
  const navigateTo = useCallback(async (url: string) => {
    try {
      // Enhanced URL validation with security checks
      if (!url || url.trim().length === 0) {
        throw new Error('URL cannot be empty')
      }
      
      const trimmedUrl = url.trim()
      
      // Security validation - block dangerous protocols
      const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:']
      if (dangerousProtocols.some(protocol => trimmedUrl.toLowerCase().startsWith(protocol))) {
        throw new Error('Blocked dangerous URL protocol')
      }

      // Enhanced URL processing
      let processedUrl = trimmedUrl
      if (!/^https?:\/\/.+/.test(trimmedUrl) && !trimmedUrl.startsWith('about:')) {
        if (trimmedUrl.includes('.') && !trimmedUrl.includes(' ')) {
          // Looks like a domain
          processedUrl = trimmedUrl.startsWith('www.') ? `https://${trimmedUrl}` : `https://www.${trimmedUrl}`
        } else {
          // Treat as search query
          processedUrl = `https://www.google.com/search?q=${encodeURIComponent(trimmedUrl)}`
        }
      }

      const result = await window.electronAPI.navigateTo(processedUrl)
      if (result && result.success) {
        // Update active tab URL immediately for better UX
        if (activeTabId) {
          setTabs(prevTabs =>
            prevTabs.map(tab =>
              tab.id === activeTabId
                ? { ...tab, url: processedUrl, isLoading: true }
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

  // Enhanced content update handler with validation
  const handleTabContentChange = useCallback(async (tabId: string, content: string) => {
    try {
      if (!tabId || content === undefined) {
        return
      }

      const tab = tabs.find(t => t.id === tabId)
      if (tab && tab.type === 'ai') {
        // Validate content size
        const maxContentSize = 1024 * 1024 // 1MB limit
        let processedContent = content
        
        if (content.length > maxContentSize) {
          logger.warn('Content too large, truncating...')
          processedContent = content.substring(0, maxContentSize) + '\n\n[Content truncated due to size limit]'
        }

        const result = await window.electronAPI.saveAITabContent(tabId, processedContent)
        if (result && result.success) {
          setTabs(prevTabs =>
            prevTabs.map(t =>
              t.id === tabId ? { ...t, content: processedContent } : t
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

  // AI tab creation handler
  const createAITabHandler = useCallback((title: string, _content: string) => {
    createTab(`ai://tab/${title}`, 'ai')
  }, [createTab])

  // Enhanced AI sidebar toggle
  const toggleAISidebar = useCallback(() => {
    setIsAISidebarOpen(prev => {
      logger.debug(`AI Sidebar ${!prev ? 'opened' : 'closed'}`)
      return !prev
    })
  }, [])

  // Error clearing
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Loading screen with better UX
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <h2>🚀 Loading KAiro Browser...</h2>
          <p>Initializing AI-powered browsing experience</p>
        </div>
      </div>
    )
  }

  // Enhanced error screen
  if (error) {
    return (
      <div className="error-container">
        <div className="error-content">
          <h2>⚠️ Application Error</h2>
          <p>{error}</p>
          <div className="error-actions">
            <button onClick={clearError} className="btn btn-primary">Try Again</button>
            <button onClick={() => window.location.reload()} className="btn btn-secondary">Reload App</button>
          </div>
        </div>
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
      </div>
    </EnhancedErrorBoundary>
  )
}

export default App