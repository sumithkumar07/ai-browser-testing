import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useBrowser } from '../../hooks/useBrowser'
import { useBrowserStore } from '../../stores/browserStore'
import { useHistoryStore } from '../../stores/historyStore'
import { useThemeStore } from '../../stores/themeStore'
import { useSettingsStore } from '../../stores/settingsStore'
import { History } from './History'
import { ThemeSelector } from './ThemeSelector'
import './NavigationBar.css'

export const NavigationBar: React.FC = () => {
  const { handleNavigate, handleGoBack, handleGoForward, handleRefresh } = useBrowser()
  const { activeTabId, tabs } = useBrowserStore()
  const { addHistoryItem } = useHistoryStore()
  const { currentTheme } = useThemeStore()
  const { openSettings } = useSettingsStore()
  const [addressBarValue, setAddressBarValue] = useState('')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isBookmarksBarVisible, setIsBookmarksBarVisible] = useState(false)
  const [isIncognitoMode, setIsIncognitoMode] = useState(false)
  const [downloads, setDownloads] = useState<Array<{id: string, name: string, progress: number}>>([])
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  
  const menuRef = useRef<HTMLDivElement>(null)
  const downloadIntervalsRef = useRef<Map<string, NodeJS.Timeout>>(new Map())

  const activeTab = tabs.find(tab => tab.id === activeTabId)

  // Update address bar when active tab changes
  useEffect(() => {
    if (activeTab && activeTab.url) {
      setAddressBarValue(activeTab.url)
    } else {
      setAddressBarValue('')
    }
  }, [activeTab?.id, activeTab?.url])

  const handleAddressBarSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (addressBarValue.trim()) {
      console.log('KAiro Browser: Address bar submitted:', addressBarValue.trim())
      const url = addressBarValue.trim()
      handleNavigate(url)
      // Add to history when navigating
      addHistoryItem(url, 'Navigated to ' + url)
    }
  }

  const handleGoButtonClick = () => {
    if (addressBarValue.trim()) {
      console.log('KAiro Browser: Go button clicked:', addressBarValue.trim())
      const url = addressBarValue.trim()
      handleNavigate(url)
      // Add to history when navigating
      addHistoryItem(url, 'Navigated to ' + url)
    }
  }

  // Menu handlers
  const handleMenuClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setIsMenuOpen(!isMenuOpen)
  }, [isMenuOpen])

  const closeMenu = useCallback(() => setIsMenuOpen(false), [])
  
  // Bookmark handlers
  const handleGoogleClick = useCallback(() => handleNavigate('https://www.google.com'), [handleNavigate])
  const handleYouTubeClick = useCallback(() => handleNavigate('https://www.youtube.com'), [handleNavigate])
  const handleGitHubClick = useCallback(() => handleNavigate('https://github.com'), [handleNavigate])
  const handleStackOverflowClick = useCallback(() => handleNavigate('https://stackoverflow.com'), [handleNavigate])

  const toggleBookmarksBar = () => {
    setIsBookmarksBarVisible(!isBookmarksBarVisible)
  }

  const toggleHistory = () => {
    setIsHistoryOpen(!isHistoryOpen)
    setIsMenuOpen(false) // Close menu when opening history
  }

  const toggleIncognitoMode = () => {
    setIsIncognitoMode(!isIncognitoMode)
  }

  const addToBookmarks = () => {
    if (activeTab && activeTab.url) {
      const bookmark = {
        url: activeTab.url,
        title: activeTab.title || 'Untitled',
        timestamp: new Date()
      }
      const existingBookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]')
      existingBookmarks.push(bookmark)
      localStorage.setItem('bookmarks', JSON.stringify(existingBookmarks))
      console.log('KAiro Browser: Added to bookmarks:', bookmark)
    }
  }

  // Download simulation
  const simulateDownload = useCallback(() => {
    const download = {
      id: Date.now().toString(),
      name: 'sample-file.pdf',
      progress: 0
    }
    setDownloads(prev => [...prev, download])
    
    // Simulate download progress
    const interval = setInterval(() => {
      setDownloads(prev => {
        const updatedDownloads = prev.map(d => 
          d.id === download.id 
            ? { ...d, progress: Math.min(d.progress + 10, 100) }
            : d
        )
        
        // Check if download is complete
        const currentDownload = updatedDownloads.find(d => d.id === download.id)
        if (currentDownload && currentDownload.progress >= 100) {
          // Clear interval and remove from ref
          const intervalRef = downloadIntervalsRef.current.get(download.id)
          if (intervalRef) {
            clearInterval(intervalRef)
            downloadIntervalsRef.current.delete(download.id)
          }
          
          // Remove download after delay
          setTimeout(() => {
            setDownloads(prev => prev.filter(d => d.id !== download.id))
          }, 2000)
          
          return updatedDownloads
        }
        
        return updatedDownloads
      })
    }, 200)
    
    // Store interval reference for cleanup
    downloadIntervalsRef.current.set(download.id, interval)
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+T: New tab
      if (event.ctrlKey && event.key === 't') {
        event.preventDefault()
        const newTabEvent = new CustomEvent('newTab')
        window.dispatchEvent(newTabEvent)
      }
      
      // Ctrl+W: Close tab
      if (event.ctrlKey && event.key === 'w') {
        event.preventDefault()
        const closeTabEvent = new CustomEvent('closeTab')
        window.dispatchEvent(closeTabEvent)
      }
      
      // Ctrl+R: Refresh
      if (event.ctrlKey && event.key === 'r') {
        event.preventDefault()
        handleRefresh()
      }
      
      // Ctrl+L: Focus address bar
      if (event.ctrlKey && event.key === 'l') {
        event.preventDefault()
        const addressInput = document.querySelector('.address-bar') as HTMLInputElement
        if (addressInput) {
          addressInput.focus()
          addressInput.select()
        }
      }
      
      // F5: Refresh
      if (event.key === 'F5') {
        event.preventDefault()
        handleRefresh()
      }
      
      // Escape: Close menu
      if (event.key === 'Escape') {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleRefresh])

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      const menuButton = document.querySelector('.menu-btn')
      
      // Don't close if clicking on the menu button itself
      if (menuButton && menuButton.contains(target)) {
        return
      }
      
      // Don't close if clicking inside the menu
      if (menuRef.current && menuRef.current.contains(target)) {
        return
      }
      
      // Close menu if clicking outside
      setIsMenuOpen(false)
    }

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMenuOpen])

  // Cleanup download intervals on unmount
  useEffect(() => {
    return () => {
      downloadIntervalsRef.current.forEach((interval) => {
        clearInterval(interval)
      })
      downloadIntervalsRef.current.clear()
    }
  }, [])

  return (
    <>
      <div className={`navigation-bar ${isIncognitoMode ? 'incognito' : ''}`}>
        <div className="nav-controls">
          <button 
            className="nav-btn" 
            title="Back"
            onClick={handleGoBack}
          >
            ←
          </button>
          <button 
            className="nav-btn" 
            title="Forward"
            onClick={handleGoForward}
          >
            →
          </button>
          <button 
            className="nav-btn" 
            title="Refresh"
            onClick={handleRefresh}
          >
            ↻
          </button>
        </div>
        
        <form className="address-bar-container" onSubmit={handleAddressBarSubmit}>
          <input
            type="text"
            className="address-bar"
            placeholder="Search or enter address"
            value={addressBarValue}
            onChange={(e) => setAddressBarValue(e.target.value)}
          />
          <button
            type="button"
            className="go-btn"
            onClick={handleGoButtonClick}
          >
            Go
          </button>
          
          {/* Downloads Indicator */}
          {downloads.length > 0 && (
            <button 
              type="button" 
              className="downloads-btn"
              title={`${downloads.length} download(s) in progress`}
            >
              📥
              <span className="download-count">{downloads.length}</span>
            </button>
          )}
          
          <button 
            type="button" 
            className={`menu-btn ${isMenuOpen ? 'active' : ''}`}
            onClick={handleMenuClick}
            title="Menu"
          >
            ☰
          </button>
        </form>
      </div>

      {/* Menu Dropdown */}
      <div className="menu-dropdown" ref={menuRef} style={{display: isMenuOpen ? 'block' : 'none'}}>
        <div className="menu-section">
          <h4 className="menu-section-title">Navigation</h4>
          <button className="menu-item" onClick={toggleBookmarksBar}>
            <span>📚</span>
            <span>Bookmarks Bar</span>
            <span className="menu-status">{isBookmarksBarVisible ? 'Hide' : 'Show'}</span>
          </button>
          <button className="menu-item" onClick={addToBookmarks}>
            <span>⭐</span>
            <span>Add to Bookmarks</span>
          </button>
          <button className="menu-item" onClick={toggleHistory}>
            <span>🕒</span>
            <span>History</span>
            <span>▼</span>
          </button>
        </div>
        
        <div className="menu-section">
          <h4 className="menu-section-title">Privacy</h4>
          <button className="menu-item" onClick={toggleIncognitoMode}>
            {isIncognitoMode ? <span>👁️‍🗨️</span> : <span>👁️</span>}
            <span>Incognito Mode</span>
            <span className="menu-status">{isIncognitoMode ? 'ON' : 'OFF'}</span>
          </button>
        </div>
        
        <div className="menu-section">
          <h4 className="menu-section-title">Appearance</h4>
          <div className="menu-item">
            <ThemeSelector />
          </div>
        </div>
        
        <div className="menu-section">
          <h4 className="menu-section-title">Tools</h4>
          <button className="menu-item" onClick={openSettings}>
            <span>⚙️</span>
            <span>Settings</span>
          </button>
          <button className="menu-item" onClick={simulateDownload}>
            <span>📥</span>
            <span>Test Download</span>
          </button>
        </div>
        
        <div className="menu-section">
          <h4 className="menu-section-title">Keyboard Shortcuts</h4>
          <div className="shortcut-item">
            <span className="shortcut-key">Ctrl+T</span>
            <span className="shortcut-description">New Tab</span>
          </div>
          <div className="shortcut-item">
            <span className="shortcut-key">Ctrl+W</span>
            <span className="shortcut-description">Close Tab</span>
          </div>
          <div className="shortcut-item">
            <span className="shortcut-key">Ctrl+R</span>
            <span className="shortcut-description">Refresh</span>
          </div>
          <div className="shortcut-item">
            <span className="shortcut-key">Ctrl+L</span>
            <span className="shortcut-description">Focus Address Bar</span>
          </div>
          <div className="shortcut-item">
            <span className="shortcut-key">F5</span>
            <span className="shortcut-description">Refresh</span>
          </div>
          <div className="shortcut-item">
            <span className="shortcut-key">Esc</span>
            <span className="shortcut-description">Close Menu</span>
          </div>
        </div>
      </div>

      {/* Bookmarks Bar */}
      {isBookmarksBarVisible && (
        <div className="bookmarks-bar">
          <div className="bookmarks-container">
            <button className="bookmark-item" onClick={handleGoogleClick}>
              <span className="bookmark-icon">🔍</span>
              <span className="bookmark-title">Google</span>
            </button>
            <button className="bookmark-item" onClick={handleYouTubeClick}>
              <span className="bookmark-icon">📺</span>
              <span className="bookmark-title">YouTube</span>
            </button>
            <button className="bookmark-item" onClick={handleGitHubClick}>
              <span className="bookmark-icon">💻</span>
              <span className="bookmark-title">GitHub</span>
            </button>
            <button className="bookmark-item" onClick={handleStackOverflowClick}>
              <span className="bookmark-icon">❓</span>
              <span className="bookmark-title">Stack Overflow</span>
            </button>
          </div>
        </div>
      )}

      {/* History Panel */}
      {isHistoryOpen && (
        <div className="history-overlay" onClick={() => setIsHistoryOpen(false)}>
          <div onClick={(e) => e.stopPropagation()}>
            <History />
          </div>
        </div>
      )}

      {/* Downloads Panel */}
      {downloads.length > 0 && (
        <div className="downloads-panel">
          {downloads.map(download => (
            <div key={download.id} className="download-item">
              <div className="download-info">
                <span>📥</span>
                <span className="download-name">{download.name}</span>
              </div>
              <div className="download-progress">
                <div 
                  className="download-progress-bar" 
                  style={{ width: `${download.progress}%` }}
                ></div>
              </div>
              <span className="download-percentage">{download.progress}%</span>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
