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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    if (tab.url.includes('google.com')) return '🔍'
    if (tab.url.includes('github.com')) return '💻'
    if (tab.url.includes('youtube.com')) return '📺'
    if (tab.url.includes('stackoverflow.com')) return '📚'
    
    return '🌐'
  }

  const getTabTitle = (tab: Tab): string => {
    if (tab.type === 'ai') {
      return tab.title
    }
    
    if (tab.isLoading) {
      return 'Loading...'
    }
    
    return tab.title || 'New Tab'
  }

  const getTabClass = (tab: Tab): string => {
    const baseClass = 'tab'
    const activeClass = tab.isActive ? ' active' : ''
    const typeClass = tab.type === 'ai' ? ' ai-tab' : ' browser-tab'
    const loadingClass = tab.isLoading ? ' loading' : ''
    
    return `${baseClass}${activeClass}${typeClass}${loadingClass}`
  }

  return (
    <div className="tab-bar">
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
          >
            ×
          </button>
        </div>
      ))}
      
      <div className="tab-controls">
        <button 
          className="tab-new" 
          onClick={onNewTab}
          title="New browser tab"
        >
          + New Tab
        </button>
        
        <button 
          className="tab-new ai-tab-new" 
          onClick={() => {
            // Create AI tab
            if (window.electronAPI.createAITab) {
              window.electronAPI.createAITab('AI Notes', '# AI Notes\n\nStart your notes here...')
            }
          }}
          title="New AI tab"
        >
          🤖 AI Tab
        </button>
      </div>
    </div>
  )
}

export default TabBar