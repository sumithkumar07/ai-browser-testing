// src/main/components/Bookmarks.tsx
import React, { useState, useEffect } from 'react'
import { useBrowser } from '../hooks/useBrowser'

export interface Bookmark {
  id: string
  title: string
  url: string
  favicon?: string
  dateAdded: number
  tags: string[]
  folder: string
}

const Bookmarks: React.FC = () => {
  const { navigateTo } = useBrowser()
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFolder, setSelectedFolder] = useState('All')
  const [showAddForm, setShowAddForm] = useState(false)
  const [newBookmark, setNewBookmark] = useState({
    title: '',
    url: '',
    tags: '',
    folder: 'General'
  })

  useEffect(() => {
    loadBookmarks()
  }, [])

  const loadBookmarks = async () => {
    try {
      setIsLoading(true)
      const result = await window.electronAPI.getBookmarks()
      
      if (result.success) {
        setBookmarks(result.bookmarks || [])
      } else {
        setError(result.error || 'Failed to load bookmarks')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load bookmarks')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddBookmark = async () => {
    if (!newBookmark.title || !newBookmark.url) return

    try {
      const bookmark: Bookmark = {
        id: `bookmark_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: newBookmark.title,
        url: newBookmark.url,
        dateAdded: Date.now(),
        tags: newBookmark.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        folder: newBookmark.folder
      }

      const result = await window.electronAPI.addBookmark(bookmark)
      
      if (result.success) {
        setBookmarks(prev => [...prev, bookmark])
        setNewBookmark({ title: '', url: '', tags: '', folder: 'General' })
        setShowAddForm(false)
      } else {
        setError(result.error || 'Failed to add bookmark')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to add bookmark')
    }
  }

  const handleDeleteBookmark = async (bookmarkId: string) => {
    try {
      const result = await window.electronAPI.deleteBookmark(bookmarkId)
      
      if (result.success) {
        setBookmarks(prev => prev.filter(bookmark => bookmark.id !== bookmarkId))
      } else {
        setError(result.error || 'Failed to delete bookmark')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete bookmark')
    }
  }

  const handleNavigateToBookmark = async (url: string) => {
    await navigateTo(url)
  }

  const filteredBookmarks = bookmarks.filter(bookmark => {
    const matchesSearch = bookmark.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         bookmark.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         bookmark.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesFolder = selectedFolder === 'All' || bookmark.folder === selectedFolder
    
    return matchesSearch && matchesFolder
  })

  const folders = ['All', ...Array.from(new Set(bookmarks.map(b => b.folder)))]

  return (
    <div className="bookmarks-container">
      <div className="bookmarks-header">
        <h2>📚 Bookmarks</h2>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="add-bookmark-btn"
        >
          ➕ Add Bookmark
        </button>
      </div>

      {showAddForm && (
        <div className="add-bookmark-form">
          <div className="form-group">
            <label>Title:</label>
            <input
              type="text"
              value={newBookmark.title}
              onChange={(e) => setNewBookmark(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Bookmark title"
            />
          </div>
          <div className="form-group">
            <label>URL:</label>
            <input
              type="url"
              value={newBookmark.url}
              onChange={(e) => setNewBookmark(prev => ({ ...prev, url: e.target.value }))}
              placeholder="https://example.com"
            />
          </div>
          <div className="form-group">
            <label>Tags (comma-separated):</label>
            <input
              type="text"
              value={newBookmark.tags}
              onChange={(e) => setNewBookmark(prev => ({ ...prev, tags: e.target.value }))}
              placeholder="work, important, reference"
            />
          </div>
          <div className="form-group">
            <label>Folder:</label>
            <select
              value={newBookmark.folder}
              onChange={(e) => setNewBookmark(prev => ({ ...prev, folder: e.target.value }))}
            >
              <option value="General">General</option>
              <option value="Work">Work</option>
              <option value="Personal">Personal</option>
              <option value="Research">Research</option>
            </select>
          </div>
          <div className="form-actions">
            <button onClick={handleAddBookmark} className="save-btn">
              Save
            </button>
            <button onClick={() => setShowAddForm(false)} className="cancel-btn">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="bookmarks-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search bookmarks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="folder-filter">
          <select
            value={selectedFolder}
            onChange={(e) => setSelectedFolder(e.target.value)}
            className="folder-select"
          >
            {folders.map(folder => (
              <option key={folder} value={folder}>{folder}</option>
            ))}
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
        <div className="loading">Loading bookmarks...</div>
      ) : (
        <div className="bookmarks-list">
          {filteredBookmarks.length === 0 ? (
            <div className="empty-state">
              <p>No bookmarks found</p>
              <p>Add your first bookmark to get started!</p>
            </div>
          ) : (
            filteredBookmarks.map(bookmark => (
              <div key={bookmark.id} className="bookmark-item">
                <div className="bookmark-content">
                  <div className="bookmark-title" onClick={() => handleNavigateToBookmark(bookmark.url)}>
                    {bookmark.favicon && <img src={bookmark.favicon} alt="" className="favicon" />}
                    <span className="title">{bookmark.title}</span>
                  </div>
                  <div className="bookmark-url" onClick={() => handleNavigateToBookmark(bookmark.url)}>
                    {bookmark.url}
                  </div>
                  <div className="bookmark-meta">
                    <span className="folder">📁 {bookmark.folder}</span>
                    <span className="date">
                      Added {new Date(bookmark.dateAdded).toLocaleDateString()}
                    </span>
                  </div>
                  {bookmark.tags.length > 0 && (
                    <div className="bookmark-tags">
                      {bookmark.tags.map(tag => (
                        <span key={tag} className="tag">#{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="bookmark-actions">
                  <button 
                    onClick={() => handleNavigateToBookmark(bookmark.url)}
                    className="action-btn navigate"
                    title="Open bookmark"
                  >
                    🔗
                  </button>
                  <button 
                    onClick={() => handleDeleteBookmark(bookmark.id)}
                    className="action-btn delete"
                    title="Delete bookmark"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default Bookmarks
