// Enhanced TabBar with AI Tab Support
import React from 'react'
import { Tab } from '../types/electron'

interface TabBarProps {
  tabs: Tab[]
  activeTabId: string | null
  onTabClick: (tabId: string) => void
  onTabClose: (tabId: string) => void
  onNewTab: () => void
}

const TabBar: React.FC<TabBarProps> = ({
  tabs,
  activeTabId,
  onTabClick,
  onTabClose,
  onNewTab
}) => {
  const getTabIcon = (tab: Tab): string => {
    if (tab.type === 'ai') {
      return '🤖'
    }
    
    if (tab.isLoading) {
      return '⏳'
    }
    
    // Return favicon or default icon based on URL
    try {
      if (tab.url.includes('google.com')) return '🔍'
      if (tab.url.includes('github.com')) return '💻'
      if (tab.url.includes('youtube.com')) return '📺'
      if (tab.url.includes('stackoverflow.com')) return '📚'
      if (tab.url.includes('reddit.com')) return '📱'
      if (tab.url.includes('twitter.com')) return '🐦'
      if (tab.url.includes('linkedin.com')) return '💼'
      if (tab.url.includes('amazon.com')) return '🛒'
    } catch (error) {
      // Fallback if URL parsing fails
    }
    
    return '🌐'
  }

  const getTabTitle = (tab: Tab): string => {
    if (tab.type === 'ai') {
      return tab.title || 'AI Tab'
    }
    
    if (tab.isLoading) {
      return 'Loading...'
    }
    
    // Truncate long titles
    const title = tab.title || 'New Tab'
    return title.length > 20 ? title.substring(0, 20) + '...' : title
  }

  const getTabClass = (tab: Tab): string => {
    const baseClass = 'tab'
    const activeClass = (tab.isActive || tab.id === activeTabId) ? ' active' : ''
    const typeClass = tab.type === 'ai' ? ' ai-tab' : ' browser-tab'
    const loadingClass = tab.isLoading ? ' loading' : ''
    
    return `${baseClass}${activeClass}${typeClass}${loadingClass}`
  }

  const handleNewAITab = async () => {
    try {
      // FIXED: Enhanced Electron API safety check
      if (window.electronAPI?.createAITab) {
        await window.electronAPI.createAITab('AI Notes', '# AI Notes\n\nStart your notes here...')
      } else {
        console.warn('AI tab creation not available - Electron API not found')
      }
    } catch (error) {
      console.error('Failed to create AI tab:', error)
    }
  }

  return (
    <div className="tab-bar">
      <div className="tabs-container">
        {tabs.map(tab => (
          <div
            key={tab.id}
            className={getTabClass(tab)}
            onClick={() => onTabClick(tab.id)}
            title={`${getTabTitle(tab)} - ${tab.type === 'ai' ? 'AI Content' : tab.url}`}
          >
            <span className="tab-icon">
              {getTabIcon(tab)}
            </span>
            <span className="tab-title">
              {getTabTitle(tab)}
            </span>
            {tab.type === 'ai' && (
              <span className="tab-type-indicator" title="AI Generated Content">
                AI
              </span>
            )}
            <button
              className="tab-close"
              onClick={(e) => {
                e.stopPropagation()
                onTabClose(tab.id)
              }}
              title="Close tab"
              aria-label={`Close ${getTabTitle(tab)}`}
            >
              ×
            </button>
          </div>
        ))}
      </div>
      
      <div className="tab-controls">
        <button 
          className="tab-new" 
          onClick={onNewTab}
          title="New browser tab"
          aria-label="New browser tab"
        >
          + New Tab
        </button>
        
        <button 
          className="tab-new ai-tab-new" 
          onClick={handleNewAITab}
          title="New AI tab"
          aria-label="New AI tab"
        >
          🤖 AI Tab
        </button>
      </div>
    </div>
  )
}

export default TabBar