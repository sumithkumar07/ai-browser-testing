/**
 * Enhanced Navigation Bar with improved UI/UX
 * Includes better URL validation, loading states, and quick actions
 */

import React, { useState, useEffect, useRef } from 'react'

interface EnhancedNavigationBarProps {
  currentUrl: string
  onNavigate: (url: string) => void
  onGoBack: () => void
  onGoForward: () => void
  onReload: () => void
  onToggleAI: () => void
  aiSidebarOpen: boolean
  isLoading?: boolean
  canGoBack?: boolean
  canGoForward?: boolean
  onOpenPerformanceDashboard?: () => void
}

const EnhancedNavigationBar: React.FC<EnhancedNavigationBarProps> = ({
  currentUrl,
  onNavigate,
  onGoBack,
  onGoForward,
  onReload,
  onToggleAI,
  aiSidebarOpen,
  isLoading = false,
  canGoBack = true,
  canGoForward = true,
  onOpenPerformanceDashboard
}) => {
  const [urlInput, setUrlInput] = useState(currentUrl)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isSecure, setIsSecure] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Popular websites for quick access
  const quickSites = [
    { name: 'Google', url: 'https://www.google.com', icon: '🔍' },
    { name: 'GitHub', url: 'https://github.com', icon: '💻' },
    { name: 'Stack Overflow', url: 'https://stackoverflow.com', icon: '📚' },
    { name: 'YouTube', url: 'https://youtube.com', icon: '📺' },
    { name: 'Twitter', url: 'https://twitter.com', icon: '🐦' },
    { name: 'Reddit', url: 'https://reddit.com', icon: '🤖' }
  ]

  useEffect(() => {
    setUrlInput(currentUrl)
    setIsSecure(currentUrl.startsWith('https://'))
  }, [currentUrl])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    let url = urlInput.trim()
    
    if (!url) return

    // Add protocol if missing
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      // Check if it looks like a URL
      if (url.includes('.') && !url.includes(' ') && url.split('.').length >= 2) {
        url = 'https://' + url
      } else {
        // Treat as search query
        url = `https://www.google.com/search?q=${encodeURIComponent(url)}`
      }
    }
    
    setShowSuggestions(false)
    onNavigate(url)
  }

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setUrlInput(value)
    
    // Generate suggestions
    if (value.length > 1) {
      const matchingSites = quickSites
        .filter(site => 
          site.name.toLowerCase().includes(value.toLowerCase()) ||
          site.url.toLowerCase().includes(value.toLowerCase())
        )
        .map(site => site.url)
      
      setSuggestions(matchingSites)
      setShowSuggestions(matchingSites.length > 0)
    } else {
      setShowSuggestions(false)
    }
  }

  const handleFocus = () => {
    if (inputRef.current) {
      inputRef.current.select()
    }
  }

  const handleBlur = () => {
    // Delay hiding suggestions to allow clicking
    setTimeout(() => setShowSuggestions(false), 200)
  }

  const selectSuggestion = (url: string) => {
    setUrlInput(url)
    setShowSuggestions(false)
    onNavigate(url)
  }

  const formatDisplayUrl = (url: string) => {
    if (!url) return ''
    return url.replace(/^https?:\/\//, '').replace(/\/$/, '')
  }

  const getSecurityIcon = () => {
    if (!currentUrl) return '🌐'
    if (currentUrl.startsWith('https://')) return '🔒'
    if (currentUrl.startsWith('http://')) return '⚠️'
    return '🌐'
  }

  return (
    <div className="enhanced-navigation-bar">
      <div className="nav-controls">
        <button 
          className={`nav-button ${!canGoBack ? 'disabled' : ''}`}
          onClick={onGoBack} 
          disabled={!canGoBack}
          title="Go Back"
        >
          ←
        </button>
        <button 
          className={`nav-button ${!canGoForward ? 'disabled' : ''}`}
          onClick={onGoForward} 
          disabled={!canGoForward}
          title="Go Forward"
        >
          →
        </button>
        <button 
          className={`nav-button ${isLoading ? 'loading' : ''}`}
          onClick={onReload} 
          title={isLoading ? 'Loading...' : 'Reload'}
        >
          {isLoading ? '⏳' : '↻'}
        </button>
      </div>
      
      <div className="address-bar-container">
        <div className="security-indicator" title={isSecure ? 'Secure Connection' : 'Insecure Connection'}>
          {getSecurityIcon()}
        </div>
        
        <form onSubmit={handleSubmit} className="address-form">
          <input
            ref={inputRef}
            type="text"
            className="enhanced-address-bar"
            value={urlInput}
            onChange={handleUrlChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder="Enter URL or search..."
            title={currentUrl}
          />
        </form>

        {showSuggestions && (
          <div className="url-suggestions">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="suggestion-item"
                onClick={() => selectSuggestion(suggestion)}
              >
                <span className="suggestion-icon">🌐</span>
                <span className="suggestion-url">{formatDisplayUrl(suggestion)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="nav-actions">
        {/* Quick Sites Dropdown */}
        <div className="quick-sites-dropdown">
          <button className="nav-button" title="Quick Sites">
            ⭐
          </button>
          <div className="quick-sites-menu">
            {quickSites.map((site, index) => (
              <button
                key={index}
                className="quick-site-btn"
                onClick={() => onNavigate(site.url)}
                title={site.name}
              >
                <span className="site-icon">{site.icon}</span>
                <span className="site-name">{site.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Performance Dashboard Button */}
        {onOpenPerformanceDashboard && (
          <button
            className="nav-button performance-btn"
            onClick={onOpenPerformanceDashboard}
            title="Performance Dashboard"
          >
            📊
          </button>
        )}

        {/* AI Toggle */}
        <button
          className={`ai-toggle-button ${aiSidebarOpen ? 'active' : ''}`}
          onClick={onToggleAI}
          title={aiSidebarOpen ? 'Hide AI Assistant' : 'Show AI Assistant'}
        >
          🤖
        </button>
      </div>
    </div>
  )
}

export default EnhancedNavigationBar