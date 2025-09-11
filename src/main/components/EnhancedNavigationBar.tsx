// ENHANCED NAVIGATION BAR - Fixed missing component
import React, { useState, useCallback, useEffect } from 'react'
import './EnhancedNavigationBar.css'

interface EnhancedNavigationBarProps {
  currentUrl: string
  onNavigate: (url: string) => void
  onGoBack: () => void
  onGoForward: () => void
  onReload: () => void
  onToggleAI: () => void
  aiSidebarOpen: boolean
}

const EnhancedNavigationBar: React.FC<EnhancedNavigationBarProps> = ({
  currentUrl,
  onNavigate,
  onGoBack,
  onGoForward,
  onReload,
  onToggleAI,
  aiSidebarOpen
}) => {
  const [urlInput, setUrlInput] = useState(currentUrl)
  const [isLoading, setIsLoading] = useState(false)

  // Update URL input when currentUrl changes
  useEffect(() => {
    setUrlInput(currentUrl)
  }, [currentUrl])

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (urlInput.trim()) {
      setIsLoading(true)
      onNavigate(urlInput.trim())
      // Reset loading after a delay
      setTimeout(() => setIsLoading(false), 2000)
    }
  }, [urlInput, onNavigate])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setUrlInput(e.target.value)
  }, [])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e as any)
    }
  }, [handleSubmit])

  return (
    <div className="enhanced-navigation-bar">
      {/* Navigation Controls */}
      <div className="nav-controls">
        <button 
          className="nav-btn"
          onClick={onGoBack}
          title="Go Back"
          aria-label="Go Back"
        >
          ←
        </button>
        <button 
          className="nav-btn"
          onClick={onGoForward}
          title="Go Forward"
          aria-label="Go Forward"
        >
          →
        </button>
        <button 
          className="nav-btn reload-btn"
          onClick={onReload}
          title="Reload"
          aria-label="Reload"
          disabled={isLoading}
        >
          {isLoading ? '⟳' : '⟲'}
        </button>
      </div>

      {/* Address Bar */}
      <form className="address-bar" onSubmit={handleSubmit}>
        <div className="address-input-container">
          <input
            type="text"
            className="address-input"
            value={urlInput}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Search or enter website URL"
            aria-label="Address bar"
          />
          {isLoading && (
            <div className="loading-indicator">
              <div className="loading-spinner"></div>
            </div>
          )}
        </div>
      </form>

      {/* AI Toggle */}
      <div className="ai-controls">
        <button 
          className={`ai-toggle-btn ${aiSidebarOpen ? 'active' : ''}`}
          onClick={onToggleAI}
          title={`${aiSidebarOpen ? 'Close' : 'Open'} AI Assistant`}
          aria-label={`${aiSidebarOpen ? 'Close' : 'Open'} AI Assistant`}
        >
          <span className="ai-icon">🤖</span>
          <span className="ai-text">AI</span>
          {aiSidebarOpen && <span className="active-indicator"></span>}
        </button>
      </div>
    </div>
  )
}

export default EnhancedNavigationBar