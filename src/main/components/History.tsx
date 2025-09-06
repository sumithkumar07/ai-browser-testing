// src/main/components/History.tsx
import React, { useState, useEffect } from 'react'
import { useBrowser } from '../hooks/useBrowser'

export interface HistoryItem {
  id: string
  title: string
  url: string
  favicon?: string
  visitTime: number
  visitCount: number
}

const History: React.FC = () => {
  const { navigateTo } = useBrowser()
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTimeRange, setSelectedTimeRange] = useState('All')
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'visits'>('date')

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {
    try {
      setIsLoading(true)
      const result = await window.electronAPI.getBrowsingHistory()
      
      if (result.success) {
        setHistory(result.history || [])
      } else {
        setError(result.error || 'Failed to load history')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load history')
    } finally {
      setIsLoading(false)
    }
  }

  const handleNavigateToHistoryItem = async (url: string) => {
    await navigateTo(url)
  }

  const handleDeleteHistoryItem = async (historyId: string) => {
    try {
      const result = await window.electronAPI.deleteHistoryItem(historyId)
      
      if (result.success) {
        setHistory(prev => prev.filter(item => item.id !== historyId))
      } else {
        setError(result.error || 'Failed to delete history item')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete history item')
    }
  }

  const handleClearHistory = async () => {
    if (!confirm('Are you sure you want to clear all browsing history?')) return

    try {
      const result = await window.electronAPI.clearBrowsingHistory()
      
      if (result.success) {
        setHistory([])
      } else {
        setError(result.error || 'Failed to clear history')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to clear history')
    }
  }

  const filteredHistory = history.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.url.toLowerCase().includes(searchQuery.toLowerCase())
    
    const now = Date.now()
    const itemTime = item.visitTime
    
    let matchesTimeRange = true
    switch (selectedTimeRange) {
      case 'Today':
        matchesTimeRange = itemTime >= now - (24 * 60 * 60 * 1000)
        break
      case 'This Week':
        matchesTimeRange = itemTime >= now - (7 * 24 * 60 * 60 * 1000)
        break
      case 'This Month':
        matchesTimeRange = itemTime >= now - (30 * 24 * 60 * 60 * 1000)
        break
      case 'This Year':
        matchesTimeRange = itemTime >= now - (365 * 24 * 60 * 60 * 1000)
        break
    }
    
    return matchesSearch && matchesTimeRange
  })

  const sortedHistory = [...filteredHistory].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return b.visitTime - a.visitTime
      case 'title':
        return a.title.localeCompare(b.title)
      case 'visits':
        return b.visitCount - a.visitCount
      default:
        return 0
    }
  })

  const getTimeAgo = (timestamp: number): string => {
    const now = Date.now()
    const diff = now - timestamp
    
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (minutes < 60) {
      return `${minutes}m ago`
    } else if (hours < 24) {
      return `${hours}h ago`
    } else if (days < 7) {
      return `${days}d ago`
    } else {
      return new Date(timestamp).toLocaleDateString()
    }
  }

  return (
    <div className="history-container">
      <div className="history-header">
        <h2>🕒 Browsing History</h2>
        <button 
          onClick={handleClearHistory}
          className="clear-history-btn"
          disabled={history.length === 0}
        >
          🗑️ Clear All
        </button>
      </div>

      <div className="history-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search history..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filters">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="time-filter"
          >
            <option value="All">All Time</option>
            <option value="Today">Today</option>
            <option value="This Week">This Week</option>
            <option value="This Month">This Month</option>
            <option value="This Year">This Year</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'title' | 'visits')}
            className="sort-filter"
          >
            <option value="date">Sort by Date</option>
            <option value="title">Sort by Title</option>
            <option value="visits">Sort by Visits</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="error-message">
          ⚠️ {error}
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {isLoading ? (
        <div className="loading">Loading history...</div>
      ) : (
        <div className="history-list">
          {sortedHistory.length === 0 ? (
            <div className="empty-state">
              <p>No history found</p>
              <p>Start browsing to build your history!</p>
            </div>
          ) : (
            sortedHistory.map(item => (
              <div key={item.id} className="history-item">
                <div className="history-content">
                  <div className="history-title" onClick={() => handleNavigateToHistoryItem(item.url)}>
                    {item.favicon && <img src={item.favicon} alt="" className="favicon" />}
                    <span className="title">{item.title}</span>
                  </div>
                  <div className="history-url" onClick={() => handleNavigateToHistoryItem(item.url)}>
                    {item.url}
                  </div>
                  <div className="history-meta">
                    <span className="visit-time">
                      🕒 {getTimeAgo(item.visitTime)}
                    </span>
                    <span className="visit-count">
                      👁️ {item.visitCount} visit{item.visitCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
                <div className="history-actions">
                  <button 
                    onClick={() => handleNavigateToHistoryItem(item.url)}
                    className="action-btn navigate"
                    title="Open page"
                  >
                    🔗
                  </button>
                  <button 
                    onClick={() => handleDeleteHistoryItem(item.id)}
                    className="action-btn delete"
                    title="Delete from history"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <div className="history-stats">
        <p>Total items: {history.length}</p>
        <p>Filtered items: {sortedHistory.length}</p>
      </div>
    </div>
  )
}

export default History
