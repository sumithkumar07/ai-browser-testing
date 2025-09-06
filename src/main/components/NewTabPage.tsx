// src/main/components/NewTabPage.tsx
import React from 'react'
import { useBrowser } from '../hooks/useBrowser'

const NewTabPage: React.FC = () => {
  const { navigateTo, isLoading } = useBrowser()

  const handleQuickNavigation = async (url: string) => {
    await navigateTo(url)
  }

  const quickActions = [
    {
      title: '🔍 Search Google',
      url: 'https://www.google.com',
      description: 'Search the web'
    },
    {
      title: '💻 GitHub',
      url: 'https://github.com',
      description: 'Code repositories'
    },
    {
      title: '📚 Stack Overflow',
      url: 'https://stackoverflow.com',
      description: 'Programming help'
    },
    {
      title: '📰 News',
      url: 'https://news.google.com',
      description: 'Latest news'
    },
    {
      title: '🎥 YouTube',
      url: 'https://youtube.com',
      description: 'Videos and tutorials'
    },
    {
      title: '📧 Gmail',
      url: 'https://gmail.com',
      description: 'Email service'
    }
  ]

  return (
    <div className="new-tab-page">
      <div className="new-tab-content">
        <div className="welcome-section">
          <h1>🌐 KAiro Browser</h1>
          <p className="welcome-subtitle">Your intelligent browsing companion</p>
          <p className="welcome-description">
            Experience the future of web browsing with AI-powered assistance
          </p>
        </div>

        <div className="search-section">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search or enter a URL..."
              className="search-input"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  const target = e.target as HTMLInputElement
                  const query = target.value.trim()
                  if (query) {
                    // Check if it's a URL
                    if (query.includes('.') && !query.includes(' ')) {
                      handleQuickNavigation(query.startsWith('http') ? query : `https://${query}`)
                    } else {
                      // Search query
                      handleQuickNavigation(`https://www.google.com/search?q=${encodeURIComponent(query)}`)
                    }
                  }
                }
              }}
            />
            <button className="search-button" disabled={isLoading}>
              {isLoading ? '⏳' : '🔍'}
            </button>
          </div>
        </div>

        <div className="quick-actions-section">
          <h2>Quick Actions</h2>
          <div className="quick-actions-grid">
            {quickActions.map((action, index) => (
              <button
                key={index}
                className="quick-action-card"
                onClick={() => handleQuickNavigation(action.url)}
                disabled={isLoading}
              >
                <div className="action-icon">{action.title.split(' ')[0]}</div>
                <div className="action-content">
                  <h3>{action.title}</h3>
                  <p>{action.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="ai-features-section">
          <h2>🤖 AI Features</h2>
          <div className="ai-features-grid">
            <div className="ai-feature-card">
              <h3>🧠 Smart Search</h3>
              <p>AI-powered search with context understanding</p>
            </div>
            <div className="ai-feature-card">
              <h3>📊 Content Analysis</h3>
              <p>Automatic summarization and key point extraction</p>
            </div>
            <div className="ai-feature-card">
              <h3>🛒 Shopping Assistant</h3>
              <p>Product research and price comparison</p>
            </div>
            <div className="ai-feature-card">
              <h3>📝 Document Processing</h3>
              <p>PDF analysis and text extraction</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NewTabPage
