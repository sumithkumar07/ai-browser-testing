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
            <p className="nlp-first-tagline">Your AI-Powered Browser with <strong>NLP-First Design</strong></p>
            <div className="nlp-intro">
              <h3>💬 Everything Through Conversation</h3>
              <p>No complex menus or hidden features - just talk to your AI assistant!</p>
            </div>
            <div className="quick-actions">
              <button 
                onClick={() => handleNavigation('https://www.google.com')}
                className="quick-action-btn"
              >
                🔍 Start Browsing
              </button>
              <button 
                onClick={() => onCreateAITab('AI Workspace', '# AI Workspace\n\nYour conversational command center...')}
                className="quick-action-btn ai-tab-btn"
              >
                🤖 Open AI Assistant
              </button>
            </div>
            <div className="nlp-philosophy">
              <h4>🎯 NLP-First Philosophy</h4>
              <ul>
                <li>✅ <strong>All features accessible through conversation</strong></li>
                <li>✅ <strong>Clean UI focused on content, not controls</strong></li>
                <li>✅ <strong>Natural language replaces complex interfaces</strong></li>
                <li>✅ <strong>AI handles complexity behind the scenes</strong></li>
              </ul>
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
            // ENHANCED: Use parent handler with comprehensive error handling
            try {
              // Validate content before processing
              if (typeof content !== 'string') {
                console.error('Invalid content type:', typeof content)
                return
              }
              
              // Limit content size to prevent performance issues
              const maxContentSize = 1024 * 1024 // 1MB limit
              if (content.length > maxContentSize) {
                console.warn('Content too large, truncating...')
                const truncatedContent = content.substring(0, maxContentSize) + '\n\n[Content truncated due to size limit]'
                onContentChange?.(activeTab.id, truncatedContent)
                return
              }
              
              // Call parent handler
              onContentChange?.(activeTab.id, content)
              
            } catch (error) {
              console.error('Critical error in AI tab content handling:', error)
              setError('Failed to handle AI tab content. Please try again.')
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