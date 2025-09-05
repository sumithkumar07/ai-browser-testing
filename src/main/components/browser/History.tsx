import React, { useState, useEffect } from 'react'
import { useHistoryStore, HistoryItem } from '../../stores/historyStore'
import { useBrowser } from '../../hooks/useBrowser'
import './History.css'

export const History: React.FC = () => {
  const { history, removeHistoryItem, clearHistory, searchHistory } = useHistoryStore()
  const { handleNavigate } = useBrowser()
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredHistory, setFilteredHistory] = useState<HistoryItem[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState<'all' | 'today' | 'week' | 'month'>('all')

  useEffect(() => {
    let filtered = history

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = searchHistory(searchQuery)
    }

    // Apply time period filter
    if (selectedPeriod !== 'all') {
      const now = new Date()
      const periods = {
        today: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
        week: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        month: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      }
      
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.timestamp)
        return itemDate >= periods[selectedPeriod]
      })
    }

    setFilteredHistory(filtered)
  }, [history, searchQuery, selectedPeriod, searchHistory])

  const handleHistoryItemClick = (item: HistoryItem) => {
    handleNavigate(item.url)
  }

  const handleRemoveItem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    removeHistoryItem(id)
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const itemDate = new Date(date)
    const diffTime = Math.abs(now.getTime() - itemDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return 'Today'
    if (diffDays === 2) return 'Yesterday'
    if (diffDays <= 7) return `${diffDays - 1} days ago`
    
    return itemDate.toLocaleDateString()
  }

  const getFavicon = (url: string) => {
    try {
      const domain = new URL(url).hostname
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`
    } catch {
      return '🌐'
    }
  }

  return (
    <div className="history-panel">
      <div className="history-header">
        <h3>📚 Browsing History</h3>
        <div className="history-controls">
          <input
            type="text"
            placeholder="Search history..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="history-search"
          />
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="history-period-select"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
          </select>
          <button
            onClick={clearHistory}
            className="clear-history-btn"
            title="Clear all history"
          >
            🗑️ Clear All
          </button>
        </div>
      </div>

      <div className="history-content">
        {filteredHistory.length === 0 ? (
          <div className="history-empty">
            <span>📚</span>
            <p>No history found</p>
            {searchQuery && <p>Try adjusting your search or time filter</p>}
          </div>
        ) : (
          <div className="history-list">
            {filteredHistory.map((item) => (
              <div
                key={item.id}
                className="history-item"
                onClick={() => handleHistoryItemClick(item)}
              >
                <div className="history-item-content">
                  <img
                    src={getFavicon(item.url)}
                    alt=""
                    className="history-favicon"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                  <div className="history-item-details">
                    <div className="history-item-title">{item.title}</div>
                    <div className="history-item-url">{item.url}</div>
                    <div className="history-item-meta">
                      <span className="history-item-date">{formatDate(item.timestamp)}</span>
                      <span className="history-item-visits">Visited {item.visitCount} time{item.visitCount !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </div>
                <button
                  className="remove-history-btn"
                  onClick={(e) => handleRemoveItem(e, item.id)}
                  title="Remove from history"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="history-footer">
        <span className="history-count">
          {filteredHistory.length} of {history.length} items
        </span>
      </div>
    </div>
  )
}
