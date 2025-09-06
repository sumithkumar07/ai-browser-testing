import React, { useEffect, useState } from 'react'
import { Tab } from '../types/electron'
import BrowserEngine from '../services/BrowserEngine'

interface BrowserWindowProps {
  activeTabId: string | null
  tabs: Tab[]
}

const BrowserWindow: React.FC<BrowserWindowProps> = ({
  activeTabId,
  tabs
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

  return (
    <div className="browser-window">
      {activeTab ? (
        <div className="browser-content">
          {/* Real BrowserView integration - no placeholders */}
          <div className="browser-view-container">
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
        </div>
      ) : (
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
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BrowserWindow
