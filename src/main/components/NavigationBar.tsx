import React, { useState, useEffect } from 'react'

interface NavigationBarProps {
  currentUrl: string
  onNavigate: (url: string) => void
  onGoBack: () => void
  onGoForward: () => void
  onReload: () => void
  onToggleAI: () => void
  aiSidebarOpen: boolean
}

const NavigationBar: React.FC<NavigationBarProps> = ({
  currentUrl,
  onNavigate,
  onGoBack,
  onGoForward,
  onReload,
  onToggleAI,
  aiSidebarOpen
}) => {
  const [urlInput, setUrlInput] = useState(currentUrl)

  // Update input when currentUrl changes
  useEffect(() => {
    setUrlInput(currentUrl)
  }, [currentUrl])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    let url = urlInput.trim()
    
    // Add protocol if missing
    if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
      // Check if it looks like a URL
      if (url.includes('.') && !url.includes(' ')) {
        url = 'https://' + url
      } else {
        // Treat as search query
        url = `https://www.google.com/search?q=${encodeURIComponent(url)}`
      }
    }
    
    onNavigate(url)
  }

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrlInput(e.target.value)
  }

  const formatDisplayUrl = (url: string) => {
    if (!url) return ''
    return url.replace(/^https?:\/\//, '').replace(/\/$/, '')
  }

  return (
    <div className="navigation-bar">
      <button className="nav-button" onClick={onGoBack} title="Go Back">
        ←
      </button>
      <button className="nav-button" onClick={onGoForward} title="Go Forward">
        →
      </button>
      <button className="nav-button" onClick={onReload} title="Reload">
        ↻
      </button>
      
      <form onSubmit={handleSubmit} style={{ flex: 1, display: 'flex' }}>
        <input
          type="text"
          className="address-bar"
          value={urlInput}
          onChange={handleUrlChange}
          placeholder="Enter URL or search..."
          title={currentUrl}
        />
      </form>
      
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

export default NavigationBar
