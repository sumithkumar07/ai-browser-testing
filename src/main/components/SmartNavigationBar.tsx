// Smart Navigation Bar - MINIMAL UI CHANGES (Same Layout, Smarter Features)
// Enhanced with AI-powered suggestions using existing DeepSearchEngine

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { createLogger } from '../../core/logger/EnhancedLogger'

const logger = createLogger('SmartNavigationBar')

interface SmartNavigationBarProps {
  currentUrl: string
  onNavigate: (url: string) => void
  onGoBack: () => void
  onGoForward: () => void
  onReload: () => void
  onToggleAI: () => void
  aiSidebarOpen: boolean
}

interface SmartSuggestion {
  url: string
  title: string
  type: 'history' | 'bookmark' | 'search' | 'ai_suggestion'
  confidence: number
  icon: string
}

const SmartNavigationBar: React.FC<SmartNavigationBarProps> = ({
  currentUrl,
  onNavigate,
  onGoBack,
  onGoForward,
  onReload,
  onToggleAI,
  aiSidebarOpen
}) => {
  const [inputUrl, setInputUrl] = useState(currentUrl)
  const [suggestions, setSuggestions] = useState<SmartSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Update input when currentUrl changes
  useEffect(() => {
    setInputUrl(currentUrl)
  }, [currentUrl])

  // MINIMAL UI IMPACT: Smart suggestions using existing backend services
  const generateSmartSuggestions = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setSuggestions([])
      return
    }

    try {
      setIsLoading(true)
      const smartSuggestions: SmartSuggestion[] = []

      // Get AI-powered suggestions using existing services
      if (window.electronAPI?.getSmartNavigationSuggestions) {
        const result = await window.electronAPI.getSmartNavigationSuggestions(query)
        if (result.success && result.suggestions) {
          smartSuggestions.push(...result.suggestions.map((s: any) => ({
            url: s.url,
            title: s.title,
            type: s.type,
            confidence: s.confidence,
            icon: getIconForSuggestionType(s.type)
          })))
        }
      }

      // Add URL detection for direct navigation
      if (isValidUrl(query)) {
        smartSuggestions.unshift({
          url: formatUrl(query),
          title: `Navigate to ${formatUrl(query)}`,
          type: 'search',
          confidence: 0.9,
          icon: '🌐'
        })
      }

      // Add search suggestion if no exact matches
      if (smartSuggestions.length === 0 || !isValidUrl(query)) {
        smartSuggestions.push({
          url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
          title: `Search for "${query}"`,
          type: 'search',
          confidence: 0.7,
          icon: '🔍'
        })
      }

      // Sort by confidence and limit to top 5
      smartSuggestions.sort((a, b) => b.confidence - a.confidence)
      setSuggestions(smartSuggestions.slice(0, 5))

    } catch (error) {
      logger.error('Smart suggestions failed:', error as Error)
      // Fallback to basic search suggestion
      setSuggestions([{
        url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
        title: `Search for "${query}"`,
        type: 'search',
        confidence: 0.5,
        icon: '🔍'
      }])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Debounced suggestions
  useEffect(() => {
    const timer = setTimeout(() => {
      if (showSuggestions) {
        generateSmartSuggestions(inputUrl)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [inputUrl, showSuggestions, generateSmartSuggestions])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputUrl(value)
    setShowSuggestions(value.length > 0)
  }, [])

  const handleInputFocus = useCallback(() => {
    setShowSuggestions(inputUrl.length > 0)
    generateSmartSuggestions(inputUrl)
  }, [inputUrl, generateSmartSuggestions])

  const handleInputBlur = useCallback(() => {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => setShowSuggestions(false), 200)
  }, [])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleNavigate(inputUrl)
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
      setInputUrl(currentUrl)
    }
  }, [inputUrl, currentUrl])

  const handleNavigate = useCallback((url: string) => {
    const formattedUrl = formatUrl(url)
    onNavigate(formattedUrl)
    setShowSuggestions(false)
    setInputUrl(formattedUrl)
  }, [onNavigate])

  const handleSuggestionClick = useCallback((suggestion: SmartSuggestion) => {
    handleNavigate(suggestion.url)
  }, [handleNavigate])

  // Helper functions
  const isValidUrl = (str: string): boolean => {
    try {
      const url = str.includes('://') ? str : `http://${str}`
      new URL(url)
      return str.includes('.') || str.includes('localhost')
    } catch {
      return false
    }
  }

  const formatUrl = (url: string): string => {
    if (url.includes('://')) return url
    if (url.includes('.') || url.includes('localhost')) return `https://${url}`
    return `https://www.google.com/search?q=${encodeURIComponent(url)}`
  }

  const getIconForSuggestionType = (type: string): string => {
    switch (type) {
      case 'history': return '🕒'
      case 'bookmark': return '⭐'
      case 'search': return '🔍'
      case 'ai_suggestion': return '🤖'
      default: return '🌐'
    }
  }

  const displayUrl = useMemo(() => {
    if (currentUrl === 'about:blank' || currentUrl.startsWith('ai://')) {
      return ''
    }
    return currentUrl
  }, [currentUrl])

  return (
    <div className="navigation-bar">
      <div className="nav-controls">
        <button
          className="nav-button"
          onClick={onGoBack}
          title="Go Back"
          aria-label="Go Back"
        >
          ←
        </button>
        <button
          className="nav-button"
          onClick={onGoForward}
          title="Go Forward"
          aria-label="Go Forward"
        >
          →
        </button>
        <button
          className="nav-button"
          onClick={onReload}
          title="Reload"
          aria-label="Reload"
        >
          ⟳
        </button>
      </div>

      <div className="address-bar-container">
        <div className="address-bar">
          <input
            type="text"
            className="address-input"
            value={inputUrl}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            onKeyDown={handleKeyDown}
            placeholder={displayUrl || "Enter URL or search term..."}
            spellCheck={false}
            autoComplete="off"
          />
          {isLoading && (
            <div className="loading-indicator">⏳</div>
          )}
        </div>

        {/* MINIMAL UI CHANGE: Smart suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="smart-suggestions">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="suggestion-item"
                onClick={() => handleSuggestionClick(suggestion)}
                title={`${suggestion.title} (${Math.round(suggestion.confidence * 100)}% confidence)`}
              >
                <span className="suggestion-icon">{suggestion.icon}</span>
                <div className="suggestion-content">
                  <div className="suggestion-title">{suggestion.title}</div>
                  <div className="suggestion-url">{suggestion.url}</div>
                </div>
                <div className="suggestion-confidence">
                  {Math.round(suggestion.confidence * 100)}%
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="nav-actions">
        <button
          className={`nav-button ai-toggle ${aiSidebarOpen ? 'active' : ''}`}
          onClick={onToggleAI}
          title={aiSidebarOpen ? 'Close AI Assistant' : 'Open AI Assistant'}
          aria-label={aiSidebarOpen ? 'Close AI Assistant' : 'Open AI Assistant'}
        >
          🤖
        </button>
      </div>

      <style jsx>{`
        .navigation-bar {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 16px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          height: 60px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .nav-controls {
          display: flex;
          gap: 4px;
        }

        .nav-button {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          padding: 8px 12px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s ease;
          backdrop-filter: blur(10px);
        }

        .nav-button:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateY(-1px);
        }

        .nav-button.ai-toggle.active {
          background: rgba(255, 255, 255, 0.25);
          box-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
        }

        .address-bar-container {
          flex: 1;
          position: relative;
        }

        .address-bar {
          position: relative;
          display: flex;
          align-items: center;
        }

        .address-input {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 25px;
          background: rgba(255, 255, 255, 0.1);
          color: white;
          font-size: 14px;
          outline: none;
          backdrop-filter: blur(10px);
          transition: all 0.2s ease;
        }

        .address-input::placeholder {
          color: rgba(255, 255, 255, 0.6);
        }

        .address-input:focus {
          border-color: rgba(255, 255, 255, 0.4);
          background: rgba(255, 255, 255, 0.15);
          box-shadow: 0 0 20px rgba(255, 255, 255, 0.1);
        }

        .loading-indicator {
          position: absolute;
          right: 16px;
          font-size: 16px;
        }

        .smart-suggestions {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          max-height: 300px;
          overflow-y: auto;
          z-index: 1000;
          margin-top: 4px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        }

        .suggestion-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          cursor: pointer;
          transition: all 0.2s ease;
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        }

        .suggestion-item:hover {
          background: rgba(102, 126, 234, 0.1);
        }

        .suggestion-item:last-child {
          border-bottom: none;
        }

        .suggestion-icon {
          font-size: 16px;
          min-width: 20px;
        }

        .suggestion-content {
          flex: 1;
          min-width: 0;
        }

        .suggestion-title {
          font-size: 14px;
          font-weight: 500;
          color: #333;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .suggestion-url {
          font-size: 12px;
          color: #666;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-top: 2px;
        }

        .suggestion-confidence {
          font-size: 11px;
          color: #999;
          font-weight: 500;
        }

        .nav-actions {
          display: flex;
          gap: 4px;
        }
      `}</style>
    </div>
  )
}

export default SmartNavigationBar