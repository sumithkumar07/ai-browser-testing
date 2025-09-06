import React, { useState, useEffect } from 'react'
import BrowserWindow from './components/BrowserWindow'
import AISidebar from './components/AISidebar'
import TabBar from './components/TabBar'
import NavigationBar from './components/NavigationBar'
import LoadingSpinner from './components/LoadingSpinner'
import './styles/App.css'

interface Tab {
  id: string
  title: string
  url: string
  isLoading: boolean
  isActive: boolean
}

interface BrowserEvent {
  type: string
  tabId?: string
  url?: string
  title?: string
  loading?: boolean
  error?: any
}

const App: React.FC = () => {
  const [tabs, setTabs] = useState<Tab[]>([])
  const [activeTabId, setActiveTabId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentUrl, setCurrentUrl] = useState('')
  const [aiSidebarOpen, setAISidebarOpen] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    initializeApp()
  }, [])

  const initializeApp = async () => {
    try {
      setIsLoading(true)
      
      // Check if we're in Electron environment
      if (!window.electronAPI) {
        throw new Error('KAiro Browser requires Electron environment')
      }

      // Setup event listeners
      setupEventListeners()

      // Create initial tab (don't wait for it to complete)
      createNewTab('https://www.google.com').catch(error => {
        console.error('Failed to create initial tab:', error)
        // Don't fail the entire app if tab creation fails
      })

      // Set loading to false immediately - don't wait for tab creation
      setIsLoading(false)
    } catch (error) {
      console.error('Failed to initialize app:', error)
      setError(error instanceof Error ? error.message : 'Unknown error')
      setIsLoading(false)
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

      case 'error':
        console.error('Browser error:', event.error)
        setError(`Browser error: ${event.error?.description || 'Unknown error'}`)
        break
    }
  }

  const createNewTab = async (url: string = 'about:blank') => {
    try {
      const result = await window.electronAPI.createTab(url)
      if (result.success) {
        if (result.tabId) {
          const newTab: Tab = {
            id: result.tabId,
            title: 'New Tab',
            url: url,
            isLoading: false,
            isActive: true
          }
          
          setTabs(prevTabs => 
            prevTabs.map(tab => ({ ...tab, isActive: false })).concat(newTab)
          )
          setActiveTabId(result.tabId)
        }
        setCurrentUrl(url)
      }
    } catch (error) {
      console.error('Failed to create tab:', error)
      setError('Failed to create new tab')
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
      const result = await window.electronAPI.switchTab(tabId)
      if (result.success) {
        setTabs(prevTabs => 
          prevTabs.map(tab => ({ ...tab, isActive: tab.id === tabId }))
        )
        setActiveTabId(tabId)
        
        const tab = tabs.find(t => t.id === tabId)
        if (tab) {
          setCurrentUrl(tab.url)
        }
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
    <div className="app">
      <div className="app-header">
        <TabBar 
          tabs={tabs}
          activeTabId={activeTabId}
          onTabClick={switchTab}
          onTabClose={closeTab}
          onNewTab={() => createNewTab()}
        />
        <NavigationBar
          currentUrl={currentUrl}
          onNavigate={navigateTo}
          onGoBack={goBack}
          onGoForward={goForward}
          onReload={reload}
          onToggleAI={toggleAISidebar}
          aiSidebarOpen={aiSidebarOpen}
        />
      </div>
      
      <div className="app-content">
        <BrowserWindow 
          activeTabId={activeTabId}
          tabs={tabs}
        />
        
        {aiSidebarOpen && (
          <AISidebar
            onClose={() => setAISidebarOpen(false)}
            currentUrl={currentUrl}
          />
        )}
      </div>
    </div>
  )
}

export default App
