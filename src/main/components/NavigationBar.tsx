import React, { useState } from 'react'

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onNavigate(urlInput)
  }

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrlInput(e.target.value)
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
      
      <form onSubmit={handleSubmit} style={{ flex: 1 }}>
        <input
          type="text"
          className="nav-url-bar"
          value={urlInput}
          onChange={handleUrlChange}
          placeholder="Enter URL or search..."
        />
      </form>
      
      <button
        className={`nav-ai-toggle ${aiSidebarOpen ? 'active' : ''}`}
        onClick={onToggleAI}
      >
        {aiSidebarOpen ? 'AI Assistant' : 'Show AI'}
      </button>
    </div>
  )
}

export default NavigationBar
