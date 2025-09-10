// Enhanced Navigation Bar with Deep Search and Security Integration
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { createLogger } from '../../core/logger/EnhancedLogger'

const logger = createLogger('EnhancedNavigationBar')

interface NavigationBarProps {
  currentUrl: string
  onNavigate: (url: string) => void
  onGoBack: () => void
  onGoForward: () => void
  onReload: () => void
  onToggleAI: () => void
  aiSidebarOpen: boolean
}

interface SearchSuggestion {
  id: string
  text: string
  type: 'url' | 'search' | 'deep_search' | 'suggestion'
  description?: string
  confidence?: number
  icon: string
}

interface SecurityStatus {
  level: 'safe' | 'warning' | 'dangerous' | 'unknown'
  message: string
  details?: string[]
}

const EnhancedNavigationBar: React.FC<NavigationBarProps> = ({
  currentUrl,
  onNavigate,
  onGoBack,
  onGoForward,
  onReload,
  onToggleAI,
  aiSidebarOpen
}) => {
  // State management
  const [urlInput, setUrlInput] = useState(currentUrl)
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isDeepSearchMode, setIsDeepSearchMode] = useState(false)
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus>({ level: 'unknown', message: 'Not scanned' })
  const [isScanning, setIsScanning] = useState(false)
  const [deepSearchLoading, setDeepSearchLoading] = useState(false)
  const [searchHistory, setSearchHistory] = useState<string[]>([])

  // Refs
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<NodeJS.Timeout>()

  // Update input when currentUrl changes
  useEffect(() => {
    setUrlInput(currentUrl)
    // Check security status for new URLs
    if (currentUrl && currentUrl !== 'about:blank') {
      checkSecurityStatus(currentUrl)
    }
  }, [currentUrl])

  // Enhanced security status checking
  const checkSecurityStatus = useCallback(async (url: string) => {
    try {
      if (!window.electronAPI?.performSecurityScan) {
        setSecurityStatus({ level: 'unknown', message: 'Security scan not available' })
        return
      }

      setIsScanning(true)
      const result = await window.electronAPI.performSecurityScan(url, 'basic')
      
      if (result?.success) {
        const riskLevel = result.riskLevel || 'low'
        const findingsCount = result.findings?.length || 0
        
        let level: 'safe' | 'warning' | 'dangerous' | 'unknown' = 'safe'
        let message = 'Website appears safe'
        
        if (riskLevel === 'high' || findingsCount > 3) {
          level = 'dangerous'
          message = `High risk detected (${findingsCount} issues)`
        } else if (riskLevel === 'medium' || findingsCount > 1) {
          level = 'warning'
          message = `Medium risk (${findingsCount} issues)`
        } else if (findingsCount === 1) {
          level = 'warning'
          message = '1 minor issue detected'
        }
        
        setSecurityStatus({
          level,
          message,
          details: result.findings?.map(f => f.title) || []
        })
      } else {
        setSecurityStatus({ level: 'unknown', message: 'Scan failed' })
      }
    } catch (error) {
      logger.error('Security scan failed', error as Error)
      setSecurityStatus({ level: 'unknown', message: 'Scan error' })
    } finally {
      setIsScanning(false)
    }
  }, [])

  // Enhanced AI-powered suggestions
  const generateSuggestions = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([])
      return
    }

    try {
      const suggestions: SearchSuggestion[] = []

      // URL detection
      if (query.includes('.') && !query.includes(' ')) {
        const url = query.startsWith('http') ? query : `https://${query}`
        suggestions.push({
          id: 'url_' + query,
          text: url,
          type: 'url',
          description: 'Navigate to website',
          icon: '🌐'
        })
      }

      // Deep Search suggestions
      if (isDeepSearchMode) {
        suggestions.push({
          id: 'deep_search_' + query,
          text: `Deep Search: "${query}"`,
          type: 'deep_search',
          description: 'Multi-source AI-powered research',
          confidence: 0.9,
          icon: '🔍'
        })

        // Enhanced research suggestions
        const researchSuggestions = [
          `Latest developments in ${query}`,
          `Comprehensive analysis of ${query}`,
          `${query} trends and insights`,
          `Expert opinions on ${query}`
        ]

        researchSuggestions.forEach((suggestion, index) => {
          suggestions.push({
            id: `research_${index}_${query}`,
            text: suggestion,
            type: 'deep_search',
            description: 'AI-powered research',
            confidence: 0.8 - (index * 0.1),
            icon: '📊'
          })
        })
      } else {
        // Regular search suggestion
        suggestions.push({
          id: 'search_' + query,
          text: `Search: "${query}"`,
          type: 'search',
          description: 'Web search',
          icon: '🔍'
        })
      }

      // AI-powered contextual suggestions
      if (window.electronAPI?.getAINavigationSuggestions) {
        try {
          const aiSuggestions = await window.electronAPI.getAINavigationSuggestions(query, currentUrl)
          if (aiSuggestions?.success && aiSuggestions.suggestions) {
            aiSuggestions.suggestions.forEach((suggestion: any, index: number) => {
              suggestions.push({
                id: `ai_${index}_${query}`,
                text: suggestion.text,
                type: 'suggestion',
                description: suggestion.description || 'AI suggestion',
                confidence: suggestion.confidence || 0.7,
                icon: '🤖'
              })
            })
          }
        } catch (error) {
          logger.debug('AI suggestions not available:', error)
        }
      }

      // History-based suggestions
      const historySuggestions = searchHistory
        .filter(item => item.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 3)
        .map((item, index) => ({
          id: `history_${index}_${query}`,
          text: item,
          type: 'search' as const,
          description: 'From history',
          icon: '🕒'
        }))

      suggestions.push(...historySuggestions)

      setSuggestions(suggestions.slice(0, 8)) // Limit to 8 suggestions
    } catch (error) {
      logger.error('Failed to generate suggestions', error as Error)
      setSuggestions([])
    }
  }, [isDeepSearchMode, currentUrl, searchHistory])

  // Debounced suggestion generation
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setUrlInput(value)
    
    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    
    // Generate suggestions after delay
    debounceRef.current = setTimeout(() => {
      generateSuggestions(value)
      setShowSuggestions(true)
    }, 300)
  }, [generateSuggestions])

  // Enhanced form submission with Deep Search integration
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    const query = urlInput.trim()
    
    if (!query) return

    setShowSuggestions(false)

    try {
      // Add to search history
      if (!searchHistory.includes(query)) {
        setSearchHistory(prev => [query, ...prev.slice(0, 9)]) // Keep last 10
      }

      // Deep Search mode
      if (isDeepSearchMode && !query.includes('.')) {
        setDeepSearchLoading(true)
        
        if (window.electronAPI?.performDeepSearch) {
          const searchResult = await window.electronAPI.performDeepSearch(query, {
            sources: ['web_search', 'academic_papers', 'news_articles'],
            analysisDepth: 'comprehensive'
          })
          
          if (searchResult?.success) {
            // Create AI tab with search results
            if (window.electronAPI?.createAITab) {
              const resultsContent = formatDeepSearchResults(searchResult, query)
              await window.electronAPI.createAITab(`Deep Search: ${query}`, resultsContent)
            }
            setDeepSearchLoading(false)
            return
          }
        }
        setDeepSearchLoading(false)
      }

      // Regular navigation/search
      let url = query
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        if (url.includes('.') && !url.includes(' ')) {
          url = 'https://' + url
        } else {
          // Use enhanced search instead of basic Google
          url = `https://www.google.com/search?q=${encodeURIComponent(url)}` 
        }
      }
      
      onNavigate(url)
    } catch (error) {
      logger.error('Navigation failed', error as Error)
    }
  }, [urlInput, isDeepSearchMode, searchHistory, onNavigate])

  // Handle suggestion selection
  const handleSuggestionClick = useCallback(async (suggestion: SearchSuggestion) => {
    setShowSuggestions(false)
    setUrlInput(suggestion.text)

    if (suggestion.type === 'deep_search') {
      setIsDeepSearchMode(true)
      setDeepSearchLoading(true)
      
      try {
        if (window.electronAPI?.performDeepSearch) {
          const query = suggestion.text.replace('Deep Search: "', '').replace('"', '')
          const searchResult = await window.electronAPI.performDeepSearch(query, {
            sources: ['web_search', 'academic_papers', 'news_articles', 'documentation'],
            analysisDepth: 'comprehensive'
          })
          
          if (searchResult?.success && window.electronAPI?.createAITab) {
            const resultsContent = formatDeepSearchResults(searchResult, query)
            await window.electronAPI.createAITab(`Deep Search: ${query}`, resultsContent)
          }
        }
      } catch (error) {
        logger.error('Deep search failed', error as Error)
      } finally {
        setDeepSearchLoading(false)
      }
    } else if (suggestion.type === 'url') {
      onNavigate(suggestion.text)
    } else {
      // Regular search
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(suggestion.text)}`
      onNavigate(searchUrl)
    }
  }, [onNavigate])

  // Security status styling
  const securityStatusStyle = useMemo(() => {
    const baseStyle = {
      padding: '2px 6px',
      borderRadius: '3px',
      fontSize: '11px',
      fontWeight: 'bold' as const,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.5px'
    }

    switch (securityStatus.level) {
      case 'safe':
        return { ...baseStyle, backgroundColor: '#d4edda', color: '#155724' }
      case 'warning':
        return { ...baseStyle, backgroundColor: '#fff3cd', color: '#856404' }
      case 'dangerous':
        return { ...baseStyle, backgroundColor: '#f8d7da', color: '#721c24' }
      default:
        return { ...baseStyle, backgroundColor: '#e2e3e5', color: '#495057' }
    }
  }, [securityStatus.level])

  // Format deep search results for AI tab
  const formatDeepSearchResults = (searchResult: any, query: string): string => {
    const results = searchResult.results || {}
    const metadata = searchResult.metadata || {}
    
    return `# 🔍 Deep Search Results: "${query}"

## 📊 **Search Summary**
- **Duration**: ${metadata.duration || 0}ms
- **Sources**: ${metadata.sourcesCount || 0} sources analyzed
- **Relevance Score**: ${((metadata.relevanceScore || 0) * 100).toFixed(1)}%

## 🎯 **Primary Results**
${(results.primaryResults || []).map((result: any, index: number) => `
### ${index + 1}. ${result.title}
**Source**: ${result.source} | **Relevance**: ${(result.relevanceScore * 100).toFixed(1)}%
**URL**: [${result.url}](${result.url})

${result.snippet}

---
`).join('')}

## 🔗 **Related Results**
${(results.relatedResults || []).slice(0, 5).map((result: any, index: number) => `
- **[${result.title}](${result.url})** (${result.source})
  ${result.snippet}
`).join('')}

## 💡 **AI Insights**
${(results.insights || []).map((insight: any) => `
- **${insight.type}**: ${insight.description}
`).join('')}

## 🎯 **Recommendations**
${(results.recommendations || []).map((rec: any) => `
### ${rec.title}
${rec.description}
**Action**: ${rec.action}
`).join('')}

---
*Generated by KAiro Deep Search Engine*
`
  }

  // Handle focus and blur events
  const handleInputFocus = useCallback(() => {
    if (urlInput.trim() && suggestions.length > 0) {
      setShowSuggestions(true)
    }
  }, [urlInput, suggestions])

  const handleInputBlur = useCallback(() => {
    // Delay hiding suggestions to allow clicking
    setTimeout(() => setShowSuggestions(false), 200)
  }, [])

  return (
    <div className="enhanced-navigation-bar">
      {/* Main Navigation Controls */}
      <div className="nav-controls">
        <button className="nav-button" onClick={onGoBack} title="Go Back">
          ←
        </button>
        <button className="nav-button" onClick={onGoForward} title="Go Forward">
          →
        </button>
        <button className="nav-button" onClick={onReload} title="Reload">
          ↻
        </button>
      </div>

      {/* Enhanced Address/Search Bar */}
      <div className="address-search-container">
        <form onSubmit={handleSubmit} className="address-form">
          <div className="input-container">
            {/* Deep Search Mode Toggle */}
            <button
              type="button"
              className={`deep-search-toggle ${isDeepSearchMode ? 'active' : ''}`}
              onClick={() => setIsDeepSearchMode(!isDeepSearchMode)}
              title={isDeepSearchMode ? 'Disable Deep Search' : 'Enable Deep Search'}
            >
              {isDeepSearchMode ? '🔍⚡' : '🔍'}
            </button>

            {/* Main Input */}
            <input
              ref={inputRef}
              type="text"
              className={`enhanced-address-bar ${isDeepSearchMode ? 'deep-search-mode' : ''}`}
              value={urlInput}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              placeholder={
                isDeepSearchMode 
                  ? "Deep Search: Multi-source AI research..." 
                  : "Enter URL or search..."
              }
              title={currentUrl}
            />

            {/* Loading Indicators */}
            {(deepSearchLoading || isScanning) && (
              <div className="loading-indicator">
                {deepSearchLoading ? '🔍' : '🛡️'}
              </div>
            )}
          </div>

          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div ref={suggestionsRef} className="suggestions-dropdown">
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className={`suggestion-item ${suggestion.type}`}
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <span className="suggestion-icon">{suggestion.icon}</span>
                  <div className="suggestion-content">
                    <div className="suggestion-text">{suggestion.text}</div>
                    {suggestion.description && (
                      <div className="suggestion-description">{suggestion.description}</div>
                    )}
                  </div>
                  {suggestion.confidence && (
                    <div className="suggestion-confidence">
                      {(suggestion.confidence * 100).toFixed(0)}%
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </form>
      </div>

      {/* Security Status */}
      <div className="security-section">
        <div 
          className="security-status"
          style={securityStatusStyle}
          title={`Security: ${securityStatus.message}${securityStatus.details ? '\n' + securityStatus.details.join('\n') : ''}`}
        >
          {securityStatus.level === 'safe' && '🛡️'}
          {securityStatus.level === 'warning' && '⚠️'}
          {securityStatus.level === 'dangerous' && '🚨'}
          {securityStatus.level === 'unknown' && '❓'}
          {isScanning ? 'SCANNING' : securityStatus.level.toUpperCase()}
        </div>
        
        <button
          className="security-scan-btn"
          onClick={() => checkSecurityStatus(currentUrl)}
          disabled={isScanning || !currentUrl || currentUrl === 'about:blank'}
          title="Run security scan"
        >
          {isScanning ? '⏳' : '🔒'}
        </button>
      </div>

      {/* AI Toggle */}
      <button
        className={`ai-toggle-button ${aiSidebarOpen ? 'active' : ''}`}
        onClick={onToggleAI}
        title={aiSidebarOpen ? 'Hide AI Assistant' : 'Show AI Assistant'}
      >
        🤖
      </button>
    </div>
  )
}

export default EnhancedNavigationBar