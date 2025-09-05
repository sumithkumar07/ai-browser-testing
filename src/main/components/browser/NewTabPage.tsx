import React from 'react'
import { useBrowser } from '../../hooks/useBrowser'
import './NewTabPage.css'

export const NewTabPage: React.FC = () => {
  const { handleNavigate } = useBrowser()

  const quickSites = [
    { name: 'Google', url: 'https://google.com', icon: '🔍' },
    { name: 'YouTube', url: 'https://youtube.com', icon: '📺' },
    { name: 'GitHub', url: 'https://github.com', icon: '💻' },
    { name: 'Stack Overflow', url: 'https://stackoverflow.com', icon: '❓' },
    { name: 'Reddit', url: 'https://reddit.com', icon: '🤖' },
    { name: 'Wikipedia', url: 'https://wikipedia.org', icon: '📚' }
  ]

  const handleQuickSiteClick = (url: string) => {
    console.log('KAiro Browser: Navigating to quick site:', url)
    handleNavigate(url)
  }

  const handleSearchSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const target = e.target as HTMLInputElement
      const value = target.value.trim()
      if (value) {
        console.log('KAiro Browser: Search submitted:', value)
        handleNavigate(value)
      }
    }
  }

  return (
    <div className="new-tab-page">
      <div className="new-tab-content">
        <div className="brand-section">
          <div className="brand-logo">
            <div className="logo-circle">
              <span className="logo-text">🚀</span>
            </div>
          </div>
          <h1 className="brand-title">KAiro Browser</h1>
          <p className="brand-subtitle">AI-Powered Web Browsing</p>
          <div className="brand-tagline">
            <p className="tagline-text">Intelligent • Fast • Secure</p>
          </div>
        </div>
        
        <div className="search-section">
          <div className="search-container">
            <div className="search-bar">
              <div className="search-icon">🔍</div>
              <input
                type="text"
                className="search-input"
                placeholder="Search the web or enter a URL"
                onKeyPress={handleSearchSubmit}
              />
              <button className="search-go-btn">Go</button>
            </div>
          </div>
        </div>
        
        <div className="quick-sites-section">
          <h2>Quick Access</h2>
          <div className="quick-sites-grid">
            {quickSites.map((site) => (
              <button
                key={site.name}
                className="quick-site-btn"
                onClick={() => handleQuickSiteClick(site.url)}
                title={site.name}
              >
                <span className="site-icon">{site.icon}</span>
                <span className="site-name">{site.name}</span>
              </button>
            ))}
          </div>
        </div>
        
        <div className="ai-suggestions-section">
          <h2>AI Suggestions</h2>
          <div className="suggestions-grid">
            <div className="suggestion-card">
              <span className="suggestion-icon">🌤️</span>
              <h3>Check Weather</h3>
              <p>Get current weather and forecast</p>
            </div>
            <div className="suggestion-card">
              <span className="suggestion-icon">🍽️</span>
              <h3>Find Restaurants</h3>
              <p>Discover great places to eat</p>
            </div>
            <div className="suggestion-card">
              <span className="suggestion-icon">📰</span>
              <h3>Latest News</h3>
              <p>Stay updated with current events</p>
            </div>
            <div className="suggestion-card">
              <span className="suggestion-icon">🎵</span>
              <h3>Music & Entertainment</h3>
              <p>Listen to music and watch videos</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
