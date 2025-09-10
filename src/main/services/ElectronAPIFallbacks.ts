/**
 * Electron API Fallbacks
 * Provides fallback implementations for missing Electron API methods
 */

import { createLogger } from '../../core/logger/EnhancedLogger'

const logger = createLogger('ElectronAPIFallbacks')

export interface Bookmark {
  id: string
  title: string
  url: string
  createdAt: number
  folder?: string
}

export interface HistoryItem {
  id: string
  title: string
  url: string
  visitedAt: number
  visitCount: number
}

/**
 * Fallback implementations for missing Electron API methods
 */
export class ElectronAPIFallbacks {
  private static instance: ElectronAPIFallbacks
  private bookmarks: Bookmark[] = []
  private history: HistoryItem[] = []
  private settings: Record<string, any> = {}

  private constructor() {
    this.loadFromStorage()
  }

  static getInstance(): ElectronAPIFallbacks {
    if (!ElectronAPIFallbacks.instance) {
      ElectronAPIFallbacks.instance = new ElectronAPIFallbacks()
    }
    return ElectronAPIFallbacks.instance
  }

  // Bookmark Management
  async getBookmarks(): Promise<{ success: boolean; data?: Bookmark[]; error?: string }> {
    try {
      logger.debug('Getting bookmarks (fallback)', { count: this.bookmarks.length })
      return { success: true, data: [...this.bookmarks] }
    } catch (error) {
      logger.error('Failed to get bookmarks', error as Error)
      return { success: false, error: (error as Error).message }
    }
  }

  async addBookmark(bookmark: Omit<Bookmark, 'id' | 'createdAt'>): Promise<{ success: boolean; data?: Bookmark; error?: string }> {
    try {
      const newBookmark: Bookmark = {
        id: `bookmark_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: Date.now(),
        ...bookmark
      }
      
      this.bookmarks.push(newBookmark)
      this.saveToStorage()
      
      logger.debug('Added bookmark (fallback)', { id: newBookmark.id, title: newBookmark.title })
      return { success: true, data: newBookmark }
    } catch (error) {
      logger.error('Failed to add bookmark', error as Error)
      return { success: false, error: (error as Error).message }
    }
  }

  async deleteBookmark(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const index = this.bookmarks.findIndex(b => b.id === id)
      if (index === -1) {
        return { success: false, error: 'Bookmark not found' }
      }

      this.bookmarks.splice(index, 1)
      this.saveToStorage()
      
      logger.debug('Deleted bookmark (fallback)', { id })
      return { success: true }
    } catch (error) {
      logger.error('Failed to delete bookmark', error as Error)
      return { success: false, error: (error as Error).message }
    }
  }

  // History Management
  async getBrowsingHistory(): Promise<{ success: boolean; data?: HistoryItem[]; error?: string }> {
    try {
      logger.debug('Getting browsing history (fallback)', { count: this.history.length })
      return { success: true, data: [...this.history].sort((a, b) => b.visitedAt - a.visitedAt) }
    } catch (error) {
      logger.error('Failed to get browsing history', error as Error)
      return { success: false, error: (error as Error).message }
    }
  }

  async deleteHistoryItem(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const index = this.history.findIndex(h => h.id === id)
      if (index === -1) {
        return { success: false, error: 'History item not found' }
      }

      this.history.splice(index, 1)
      this.saveToStorage()
      
      logger.debug('Deleted history item (fallback)', { id })
      return { success: true }
    } catch (error) {
      logger.error('Failed to delete history item', error as Error)
      return { success: false, error: (error as Error).message }
    }
  }

  async clearBrowsingHistory(): Promise<{ success: boolean; error?: string }> {
    try {
      this.history = []
      this.saveToStorage()
      
      logger.debug('Cleared browsing history (fallback)')
      return { success: true }
    } catch (error) {
      logger.error('Failed to clear browsing history', error as Error)
      return { success: false, error: (error as Error).message }
    }
  }

  // Settings Management
  async getSettings(): Promise<{ success: boolean; data?: Record<string, any>; error?: string }> {
    try {
      logger.debug('Getting settings (fallback)', { keys: Object.keys(this.settings) })
      return { success: true, data: { ...this.settings } }
    } catch (error) {
      logger.error('Failed to get settings', error as Error)
      return { success: false, error: (error as Error).message }
    }
  }

  async saveSettings(settings: Record<string, any>): Promise<{ success: boolean; error?: string }> {
    try {
      this.settings = { ...this.settings, ...settings }
      this.saveToStorage()
      
      logger.debug('Saved settings (fallback)', { keys: Object.keys(settings) })
      return { success: true }
    } catch (error) {
      logger.error('Failed to save settings', error as Error)
      return { success: false, error: (error as Error).message }
    }
  }

  // Data Management
  async clearBrowsingData(): Promise<{ success: boolean; error?: string }> {
    try {
      this.history = []
      this.saveToStorage()
      
      logger.debug('Cleared browsing data (fallback)')
      return { success: true }
    } catch (error) {
      logger.error('Failed to clear browsing data', error as Error)
      return { success: false, error: (error as Error).message }
    }
  }

  async clearCookies(): Promise<{ success: boolean; error?: string }> {
    try {
      logger.debug('Cleared cookies (fallback - no-op)')
      return { success: true }
    } catch (error) {
      logger.error('Failed to clear cookies', error as Error)
      return { success: false, error: (error as Error).message }
    }
  }

  async clearCache(): Promise<{ success: boolean; error?: string }> {
    try {
      logger.debug('Cleared cache (fallback - no-op)')
      return { success: true }
    } catch (error) {
      logger.error('Failed to clear cache', error as Error)
      return { success: false, error: (error as Error).message }
    }
  }

  async clearDownloads(): Promise<{ success: boolean; error?: string }> {
    try {
      logger.debug('Cleared downloads (fallback - no-op)')
      return { success: true }
    } catch (error) {
      logger.error('Failed to clear downloads', error as Error)
      return { success: false, error: (error as Error).message }
    }
  }

  // Shortcut Management
  async registerShortcuts(shortcuts: Record<string, string>): Promise<{ success: boolean; error?: string }> {
    try {
      logger.debug('Registered shortcuts (fallback)', { shortcuts })
      return { success: true }
    } catch (error) {
      logger.error('Failed to register shortcuts', error as Error)
      return { success: false, error: (error as Error).message }
    }
  }

  // Generic Data Storage
  async getData(key: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const data = localStorage.getItem(`kairo_fallback_${key}`)
      const parsedData = data ? JSON.parse(data) : null
      
      logger.debug('Got data (fallback)', { key, hasData: !!parsedData })
      return { success: true, data: parsedData }
    } catch (error) {
      logger.error('Failed to get data', error as Error, { key })
      return { success: false, error: (error as Error).message }
    }
  }

  async saveData(key: string, data: any): Promise<{ success: boolean; error?: string }> {
    try {
      localStorage.setItem(`kairo_fallback_${key}`, JSON.stringify(data))
      
      logger.debug('Saved data (fallback)', { key })
      return { success: true }
    } catch (error) {
      logger.error('Failed to save data', error as Error, { key })
      return { success: false, error: (error as Error).message }
    }
  }

  // Notification System
  onNotification(callback: (data: any) => void): void {
    logger.debug('Set up notification listener (fallback)')
    // In a real implementation, this would set up event listeners
    // For fallback, we can simulate occasional notifications
    setTimeout(() => {
      callback({
        type: 'info',
        message: 'Fallback notification system active',
        timestamp: Date.now()
      })
    }, 1000)
  }

  // Action Execution
  async executeAction(action: any): Promise<{ success: boolean; result?: any; error?: string }> {
    try {
      logger.debug('Executed action (fallback)', { action })
      
      // Basic action handling
      if (action.type === 'navigate') {
        return { success: true, result: `Navigation to ${action.url} (simulated)` }
      } else if (action.type === 'create_tab') {
        return { success: true, result: `Created tab: ${action.title || 'New Tab'} (simulated)` }
      }
      
      return { success: true, result: 'Action executed (simulated)' }
    } catch (error) {
      logger.error('Failed to execute action', error as Error)
      return { success: false, error: (error as Error).message }
    }
  }

  // Add navigation history
  addToHistory(title: string, url: string): void {
    const existingIndex = this.history.findIndex(h => h.url === url)
    if (existingIndex !== -1) {
      // Update existing entry
      this.history[existingIndex].visitedAt = Date.now()
      this.history[existingIndex].visitCount++
    } else {
      // Add new entry
      const historyItem: HistoryItem = {
        id: `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title,
        url,
        visitedAt: Date.now(),
        visitCount: 1
      }
      this.history.push(historyItem)
    }
    
    // Keep only last 1000 items
    if (this.history.length > 1000) {
      this.history = this.history.sort((a, b) => b.visitedAt - a.visitedAt).slice(0, 1000)
    }
    
    this.saveToStorage()
  }

  // Private methods
  private loadFromStorage(): void {
    try {
      const bookmarksData = localStorage.getItem('kairo_fallback_bookmarks')
      if (bookmarksData) {
        this.bookmarks = JSON.parse(bookmarksData)
      }

      const historyData = localStorage.getItem('kairo_fallback_history')
      if (historyData) {
        this.history = JSON.parse(historyData)
      }

      const settingsData = localStorage.getItem('kairo_fallback_settings')
      if (settingsData) {
        this.settings = JSON.parse(settingsData)
      }

      logger.debug('Loaded data from storage', {
        bookmarks: this.bookmarks.length,
        history: this.history.length,
        settings: Object.keys(this.settings).length
      })
    } catch (error) {
      logger.error('Failed to load from storage', error as Error)
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem('kairo_fallback_bookmarks', JSON.stringify(this.bookmarks))
      localStorage.setItem('kairo_fallback_history', JSON.stringify(this.history))
      localStorage.setItem('kairo_fallback_settings', JSON.stringify(this.settings))
    } catch (error) {
      logger.error('Failed to save to storage', error as Error)
    }
  }
}

export default ElectronAPIFallbacks