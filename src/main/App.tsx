// KAiro Browser Main Application Component
// Layout Structure: LOCKED - Do not modify layout proportions or structure
import React, { useState, useEffect } from 'react'
import BrowserWindow from './components/BrowserWindow'
import AISidebar from './components/AISidebar'
import TabBar from './components/TabBar'
import NavigationBar from './components/NavigationBar'
import LoadingSpinner from './components/LoadingSpinner'
import ErrorBoundary from '../core/errors/ErrorBoundary'
import IntegratedAgentFramework from './services/IntegratedAgentFramework'
import { BrowserController } from './services/BrowserController'
import { Tab, BrowserEvent, AgentStatus } from '../core/types'
import { createLogger } from '../core/logger/Logger'
import { APP_CONSTANTS } from '../core/utils/Constants'
import { appEvents } from '../core/utils/EventEmitter'
import './styles/App.css'

const logger = createLogger('App')

const App: React.FC = () => {
  const [tabs, setTabs] = useState<Tab[]>([])
  const [activeTabId, setActiveTabId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentUrl, setCurrentUrl] = useState('')
  const [aiSidebarOpen, setAISidebarOpen] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [agentStatus, setAgentStatus] = useState<AgentStatus | null>(null)

  useEffect(() => {
    initializeApp()
  }, [])

  const initializeApp = async () => {
    try {
      setIsLoading(true)
      logger.info('Initializing KAiro Browser Application')
      
      // Check if we're in Electron environment
      if (!window.electronAPI) {
        throw new Error('KAiro Browser requires Electron environment')
      }

      // Initialize Browser Controller
      logger.debug('Initializing Browser Controller')
      const browserController = BrowserController.getInstance()
      await browserController.initialize()

      // Initialize Agent Framework
      logger.debug('Initializing Agent Framework')
      const agentFramework = IntegratedAgentFramework.getInstance()
      await agentFramework.initialize()

      // Set up event listeners
      setupEventListeners()

      // Set up agent event listeners
      agentFramework.addEventListener('agent-update', (status: AgentStatus) => {
        logger.debug('Agent status update received', status)
        setAgentStatus(status)
      })

      // Create initial tab
      await createNewTab(APP_CONSTANTS.BROWSER.DEFAULT_URL)

      // Emit app initialized event
      appEvents.emit('app:initialized', { timestamp: Date.now() })
      
      setIsLoading(false)
      logger.info('KAiro Browser initialized successfully')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown initialization error'
      logger.error('Failed to initialize app', error as Error)
      setError(errorMessage)
      setIsLoading(false)
      appEvents.emit('app:error', { error: error as Error, context: 'initialization' })
    }
  }

  const setupEventListeners = () => {
    // Browser events from main process
    window.electronAPI.onBrowserEvent((event: BrowserEvent) => {
      handleBrowserEvent(event)
    })

    // Menu actions
    window.electronAPI.onMenuAction((action: string) => {
      if (action === 'new-tab') {
        createNewTab()
      }
    })

    // Agent updates (Phase 4 Integration)
    if (window.electronAPI.onAgentUpdate) {
      window.electronAPI.onAgentUpdate((status: AgentStatus) => {
        setAgentStatus(status)
      })
    }
  }

  const handleBrowserEvent = (event: BrowserEvent) => {
    switch (event.type) {
      case 'loading':
        if (event.tabId) {
          setTabs(prevTabs => 
            prevTabs.map(tab => 
              tab.id === event.tabId 
                ? { ...tab, isLoading: event.loading || false }
                : tab
            )
          )
        }
        break

      case 'navigate':
        if (event.tabId && event.url) {
          setTabs(prevTabs => 
            prevTabs.map(tab => 
              tab.id === event.tabId 
                ? { ...tab, url: event.url!, isLoading: false }
                : tab
            )
          )
          if (event.tabId === activeTabId) {
            setCurrentUrl(event.url)
          }
        }
        break

      case 'title-updated':
        if (event.tabId && event.title) {
          setTabs(prevTabs => 
            prevTabs.map(tab => 
              tab.id === event.tabId 
                ? { ...tab, title: event.title! }
                : tab
            )
          )
        }
        break

      case 'tab-switched':
        if (event.tabId) {
          setActiveTabId(event.tabId)
          setCurrentUrl(event.url || '')
        }
        break

      case 'tab-closed':
        if (event.tabId) {
          setTabs(prevTabs => prevTabs.filter(tab => tab.id !== event.tabId))
          if (event.tabId === activeTabId) {
            const remainingTabs = tabs.filter(tab => tab.id !== event.tabId)
            if (remainingTabs.length > 0) {
              setActiveTabId(remainingTabs[0].id)
            } else {
              setActiveTabId(null)
            }
          }
        }
        break

      case 'ai-tab-created':
        // Handle AI tab creation
        if (event.tabId) {
          const newTab: Tab = {
            id: event.tabId,
            title: event.title || 'AI Tab',
            url: 'ai://content',
            isLoading: false,
            isActive: true,
            type: 'ai',
            content: event.content || '',
            createdBy: 'agent'
          }
          
          setTabs(prevTabs => 
            prevTabs.map(tab => ({ ...tab, isActive: false })).concat(newTab)
          )
          setActiveTabId(event.tabId)
        }
        break

      case 'error':
        console.error('Browser error:', event.error)
        setError(`Browser error: ${event.error?.description || 'Unknown error'}`)
        break
    }
  }

  const createNewTab = async (url: string = 'about:blank', type: 'browser' | 'ai' = 'browser') => {
    try {
      logger.debug(`Creating new tab: ${url} (type: ${type})`)
      const result = await window.electronAPI.createTab(url, type)
      if (result.success) {
        if (result.tabId) {
          const newTab: Tab = {
            id: result.tabId,
            title: type === 'ai' ? 'AI Tab' : 'New Tab',
            url: url,
            isLoading: false,
            isActive: true,
            type: type,
            content: type === 'ai' ? '' : undefined,
            createdBy: 'user'
          }
          
          setTabs(prevTabs => 
            prevTabs.map(tab => ({ ...tab, isActive: false })).concat(newTab)
          )
          setActiveTabId(result.tabId)
          
          // Emit tab created event
          appEvents.emit('tab:created', { tabId: result.tabId, url })
        }
        if (type === 'browser') {
          setCurrentUrl(url)
        }
        logger.info(`Tab created successfully: ${result.tabId}`)
      }
    } catch (error) {
      logger.error('Failed to create tab', error as Error)
      setError('Failed to create new tab')
    }
  }

  const createAITab = async (title: string, content: string = '') => {
    try {
      const result = await window.electronAPI.createAITab(title, content)
      if (result.success) {
        const newTab: Tab = {
          id: result.tabId,
          title: title,
          url: 'ai://content',
          isLoading: false,
          isActive: true,
          type: 'ai',
          content: content,
          createdBy: 'agent'
        }
        
        setTabs(prevTabs => 
          prevTabs.map(tab => ({ ...tab, isActive: false })).concat(newTab)
        )
        setActiveTabId(result.tabId)
      }
    } catch (error) {
      console.error('Failed to create AI tab:', error)
      setError('Failed to create AI tab')
    }
  }

  const closeTab = async (tabId: string) => {
    try {
      const result = await window.electronAPI.closeTab(tabId)
      if (result.success) {
        setTabs(prevTabs => prevTabs.filter(tab => tab.id !== tabId))
        if (tabId === activeTabId) {
          const remainingTabs = tabs.filter(tab => tab.id !== tabId)
          if (remainingTabs.length > 0) {
            await switchTab(remainingTabs[0].id)
          } else {
            setActiveTabId(null)
            setCurrentUrl('')
          }
        }
      }
    } catch (error) {
      console.error('Failed to close tab:', error)
      setError('Failed to close tab')
    }
  }

  const switchTab = async (tabId: string) => {
    try {
      const tab = tabs.find(t => t.id === tabId)
      if (!tab) return

      if (tab.type === 'browser') {
        // Switch to browser tab
        const result = await window.electronAPI.switchTab(tabId)
        if (result.success) {
          setTabs(prevTabs => 
            prevTabs.map(tab => ({ ...tab, isActive: tab.id === tabId }))
          )
          setActiveTabId(tabId)
          setCurrentUrl(tab.url)
        }
      } else {
        // Switch to AI tab
        setTabs(prevTabs => 
          prevTabs.map(tab => ({ ...tab, isActive: tab.id === tabId }))
        )
        setActiveTabId(tabId)
        setCurrentUrl('ai://content')
      }
    } catch (error) {
      console.error('Failed to switch tab:', error)
      setError('Failed to switch tab')
    }
  }

  const navigateTo = async (url: string) => {
    try {
      const result = await window.electronAPI.navigateTo(url)
      if (result.success) {
        setCurrentUrl(url)
      } else {
        setError(result.error || 'Navigation failed')
      }
    } catch (error) {
      console.error('Navigation error:', error)
      setError('Navigation failed')
    }
  }

  const goBack = async () => {
    try {
      await window.electronAPI.goBack()
    } catch (error) {
      console.error('Go back error:', error)
    }
  }

  const goForward = async () => {
    try {
      await window.electronAPI.goForward()
    } catch (error) {
      console.error('Go forward error:', error)
    }
  }

  const reload = async () => {
    try {
      await window.electronAPI.reload()
    } catch (error) {
      console.error('Reload error:', error)
    }
  }

  const toggleAISidebar = () => {
    setAISidebarOpen(!aiSidebarOpen)
  }

  // Phase 4: Agent Task Execution Integration
  const handleAgentTask = async (task: string) => {
    try {
      const result = await window.electronAPI.executeAgentTask(task)
      if (result.success) {
        console.log('✅ Agent task completed:', result)
      } else {
        console.error('❌ Agent task failed:', result.error)
        setError(`Agent task failed: ${result.error}`)
      }
    } catch (error) {
      console.error('❌ Agent task execution error:', error)
      setError('Agent task execution failed')
    }
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Reload</button>
      </div>
    )
  }

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        logger.error('React component error', error, { errorInfo })
        appEvents.emit('app:error', { error, context: 'component' })
      }}
    >
      <div className="app">
        {/* LOCKED LAYOUT STRUCTURE - DO NOT MODIFY */}
        <div className="app-header">
          <ErrorBoundary fallback={<div className="error-fallback">Tab bar error</div>}>
            <TabBar 
              tabs={tabs}
              activeTabId={activeTabId}
              onTabClick={switchTab}
              onTabClose={closeTab}
              onNewTab={() => createNewTab()}
            />
          </ErrorBoundary>
          
          {/* Only show navigation bar for browser content */}
          {tabs.find(t => t.id === activeTabId)?.type === 'browser' && (
            <ErrorBoundary fallback={<div className="error-fallback">Navigation error</div>}>
              <NavigationBar
                currentUrl={currentUrl}
                onNavigate={navigateTo}
                onGoBack={goBack}
                onGoForward={goForward}
                onReload={reload}
                onToggleAI={toggleAISidebar}
                aiSidebarOpen={aiSidebarOpen}
              />
            </ErrorBoundary>
          )}
        </div>
        
        <div className="app-content">
          {/* LOCKED: Browser Area (70% width) */}
          <ErrorBoundary fallback={<div className="error-fallback">Browser window error</div>}>
            <BrowserWindow 
              activeTabId={activeTabId}
              tabs={tabs}
              onCreateAITab={createAITab}
            />
          </ErrorBoundary>
          
          {/* LOCKED: AI Assistant Panel (30% width) */}
          {aiSidebarOpen && (
            <ErrorBoundary fallback={<div className="error-fallback">AI sidebar error</div>}>
              <AISidebar
                onClose={() => setAISidebarOpen(false)}
                currentUrl={currentUrl}
                onAgentTask={handleAgentTask}
                agentStatus={agentStatus}
              />
            </ErrorBoundary>
          )}
        </div>
      </div>
    </ErrorBoundary>
  )
}

export default App