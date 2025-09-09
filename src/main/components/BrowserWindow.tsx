// Phase 1: Enhanced BrowserWindow with AI Tab Support
import React, { useEffect, useState } from 'react'
import { Tab } from '../types/electron'
import AITabContent from './AITabContent'
import BrowserEngine from '../services/BrowserEngine'

interface BrowserWindowProps {
  activeTabId: string | null
  tabs: Tab[]
  onCreateAITab: (title: string, content: string) => void
  onContentChange?: (tabId: string, content: string) => void
}

const BrowserWindow: React.FC<BrowserWindowProps> = ({
  activeTabId,
  tabs,
  onCreateAITab,
  onContentChange
}) => {
  const [browserEngine] = useState(() => BrowserEngine.getInstance())
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const activeTab = tabs.find(tab => tab.id === activeTabId)

  useEffect(() => {
    // Initialize browser engine
    browserEngine.initialize().catch(err => {
      console.error('Failed to initialize browser engine:', err)
      setError('Failed to initialize browser')
    })

    // Listen for browser events
    const handleBrowserEvent = (event: any) => {
      if (event.type === 'navigation-started') {
        setIsLoading(true)
        setError(null)
      } else if (event.type === 'navigation-completed') {
        setIsLoading(false)
      } else if (event.type === 'error') {
        setIsLoading(false)
        setError(event.error || 'Navigation error')
      }
    }

    browserEngine.addEventListener('navigation-started', handleBrowserEvent)
    browserEngine.addEventListener('navigation-completed', handleBrowserEvent)
    browserEngine.addEventListener('error', handleBrowserEvent)

    return () => {
      browserEngine.removeEventListener('navigation-started', handleBrowserEvent)
      browserEngine.removeEventListener('navigation-completed', handleBrowserEvent)
      browserEngine.removeEventListener('error', handleBrowserEvent)
    }
  }, [browserEngine])

  const handleNavigation = async (url: string) => {
    if (!activeTabId) return
    
    try {
      setIsLoading(true)
      setError(null)
      await browserEngine.navigateTo(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Navigation failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReload = async () => {
    if (!activeTabId) return
    
    try {
      setIsLoading(true)
      setError(null)
      await browserEngine.reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reload failed')
    } finally {
      setIsLoading(false)
    }
  }

  // Phase 1: Render different content based on tab type
  const renderTabContent = () => {
    if (!activeTab) {
      return (
        <div className="new-tab-container">
          <div className="new-tab-content">
            <h1>🌐 KAiro Browser</h1>
            <p>Welcome to your intelligent browsing experience</p>
            <div className="quick-actions">
              <button 
                onClick={() => handleNavigation('https://www.google.com')}
                className="quick-action-btn"
              >
                🔍 Search Google
              </button>
              <button 
                onClick={() => handleNavigation('https://github.com')}
                className="quick-action-btn"
              >
                💻 GitHub
              </button>
              <button 
                onClick={() => handleNavigation('https://stackoverflow.com')}
                className="quick-action-btn"
              >
                📚 Stack Overflow
              </button>
              <button 
                onClick={() => onCreateAITab('Research Notes', '# Research Notes\n\nStart your research here...')}
                className="quick-action-btn ai-tab-btn"
              >
                🤖 Create AI Tab
              </button>
            </div>
          </div>
        </div>
      )
    }

    if (activeTab.type === 'ai') {
      // AI Tab Content with Enhanced Error Handling
      return (
        <AITabContent 
          tab={activeTab}
          onContentChange={(content) => {
            // ENHANCED: Comprehensive error handling and validation
            try {
              // Validate content before saving
              if (typeof content !== 'string') {
                console.error('Invalid content type:', typeof content)
                return
              }
              
              // Limit content size to prevent performance issues
              const maxContentSize = 1024 * 1024 // 1MB limit
              if (content.length > maxContentSize) {
                console.warn('Content too large, truncating...')
                content = content.substring(0, maxContentSize) + '\n\n[Content truncated due to size limit]'
              }
              
              // ENHANCED: Add Electron API safety check with timeout
              if (window.electronAPI?.saveAITabContent) {
                // Use a timeout to prevent hanging
                const saveTimeout = setTimeout(() => {
                  console.warn('AI tab content save timeout - operation may have failed')
                }, 10000) // 10 second timeout
                
                Promise.resolve(window.electronAPI.saveAITabContent(activeTab.id, content))
                  .then(() => {
                    clearTimeout(saveTimeout)
                    console.log('AI tab content saved successfully')
                  })
                  .catch((error) => {
                    clearTimeout(saveTimeout)
                    console.error('Failed to save AI tab content:', error)
                  })
              } else {
                console.warn('AI tab content saving not available - Electron API not found')
                // Fallback: Try to save to localStorage as backup
                try {
                  const fallbackKey = `ai_tab_backup_${activeTab.id}`
                  localStorage.setItem(fallbackKey, JSON.stringify({
                    content,
                    timestamp: Date.now(),
                    tabId: activeTab.id
                  }))
                  console.log('AI tab content saved to localStorage as fallback')
                } catch (storageError) {
                  console.error('Failed to save to localStorage fallback:', storageError)
                }
              }
            } catch (error) {
              console.error('Critical error in AI tab content saving:', error)
              // Show user-friendly error message without crashing the component
              setError('Failed to save AI tab content. Please try again.')
            }
          }}
        />
      )
    }

    // Render Browser Tab Content
    return (
      <div className="browser-content">
        {isLoading && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
            <span>Loading {activeTab.url}...</span>
          </div>
        )}
        
        {error && (
          <div className="error-overlay">
            <div className="error-message">
              <h3>⚠️ Navigation Error</h3>
              <p>{error}</p>
              <button onClick={() => handleReload()}>
                Retry
              </button>
            </div>
          </div>
        )}

        {/* BrowserView will be attached here by Electron */}
        <div 
          id={`browser-view-${activeTabId}`}
          className="browser-view"
          style={{
            width: '100%',
            height: '100%',
            position: 'relative'
          }}
        />
      </div>
    )
  }

  return (
    <div className="browser-window">
      {renderTabContent()}
    </div>
  )
}

export default BrowserWindow