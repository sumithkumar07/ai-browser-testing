// FIXED: Enhanced Browser Controller with comprehensive bug fixes
// Phase 2: Agent Browser Controller - Comprehensive Implementation

import { createLogger } from '../../core/logger/Logger'
import { validateUrl, validateTabId } from '../../core/utils/Validators'

const logger = createLogger('BrowserController')

export interface NavigationState {
  canGoBack: boolean
  canGoForward: boolean
  isLoading: boolean
  currentUrl: string
  currentTitle: string
}

export interface BrowserControllerConfig {
  maxHistoryEntries: number
  navigationTimeout: number
  defaultHomepage: string
}

class BrowserController {
  private static instance: BrowserController
  private config: BrowserControllerConfig
  private navigationHistory: string[] = []
  private currentIndex: number = -1
  private isInitialized: boolean = false

  private constructor() {
    this.config = {
      maxHistoryEntries: 100,
      navigationTimeout: 30000,
      defaultHomepage: 'https://www.google.com'
    }
  }

  static getInstance(): BrowserController {
    if (!BrowserController.instance) {
      BrowserController.instance = new BrowserController()
    }
    return BrowserController.instance
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      logger.warn('BrowserController already initialized')
      return
    }

    try {
      logger.info('Initializing Browser Controller...')
      
      // Initialize with default homepage
      this.navigationHistory = [this.config.defaultHomepage]
      this.currentIndex = 0
      
      this.isInitialized = true
      logger.info('✅ Browser Controller initialized successfully')
      
    } catch (error) {
      logger.error('Failed to initialize Browser Controller', error as Error)
      throw error
    }
  }

  // FIXED: Enhanced navigation with proper validation and error handling
  async navigateToUrl(url: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.isInitialized) {
        throw new Error('Browser Controller not initialized')
      }

      // FIXED: Comprehensive URL validation
      const validation = validateUrl(url)
      if (!validation.isValid) {
        return { success: false, error: validation.error }
      }

      // Normalize URL
      let normalizedUrl = url.trim()
      
      // Add protocol if missing
      if (!normalizedUrl.startsWith('http') && !normalizedUrl.startsWith('about:') && !normalizedUrl.startsWith('ai://')) {
        normalizedUrl = `https://${normalizedUrl}`
      }

      // FIXED: Add to navigation history properly
      this.addToHistory(normalizedUrl)

      // FIXED: Use Electron API safely
      if (!window.electronAPI?.navigateTo) {
        throw new Error('Navigation API not available')
      }

      const result = await window.electronAPI.navigateTo(normalizedUrl)
      
      if (result?.success) {
        logger.debug('Navigation successful:', normalizedUrl)
        return { success: true }
      } else {
        throw new Error(result?.error || 'Navigation failed')
      }

    } catch (error) {
      logger.error('Navigation failed', error as Error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown navigation error' 
      }
    }
  }

  // FIXED: Enhanced history management
  private addToHistory(url: string): void {
    try {
      // Remove any forward history if we're not at the end
      if (this.currentIndex < this.navigationHistory.length - 1) {
        this.navigationHistory = this.navigationHistory.slice(0, this.currentIndex + 1)
      }

      // Add new URL
      this.navigationHistory.push(url)
      this.currentIndex = this.navigationHistory.length - 1

      // Limit history size
      if (this.navigationHistory.length > this.config.maxHistoryEntries) {
        this.navigationHistory = this.navigationHistory.slice(-this.config.maxHistoryEntries)
        this.currentIndex = this.navigationHistory.length - 1
      }

      logger.debug('Added to history:', url, `Index: ${this.currentIndex}`)
    } catch (error) {
      logger.error('Failed to add to history', error as Error)
    }
  }

  // FIXED: Enhanced back navigation
  async goBack(): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.isInitialized) {
        throw new Error('Browser Controller not initialized')
      }

      if (!this.canGoBack()) {
        return { success: false, error: 'Cannot go back - no previous pages' }
      }

      this.currentIndex--
      const previousUrl = this.navigationHistory[this.currentIndex]

      if (!window.electronAPI?.goBack) {
        // Fallback: navigate to previous URL
        return await this.navigateToUrl(previousUrl)
      }

      const result = await window.electronAPI.goBack()
      
      if (result?.success) {
        logger.debug('Back navigation successful:', previousUrl)
        return { success: true }
      } else {
        // Restore index on failure
        this.currentIndex++
        throw new Error(result?.error || 'Back navigation failed')
      }

    } catch (error) {
      logger.error('Back navigation failed', error as Error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown back navigation error' 
      }
    }
  }

  // FIXED: Enhanced forward navigation
  async goForward(): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.isInitialized) {
        throw new Error('Browser Controller not initialized')
      }

      if (!this.canGoForward()) {
        return { success: false, error: 'Cannot go forward - no forward pages' }
      }

      this.currentIndex++
      const nextUrl = this.navigationHistory[this.currentIndex]

      if (!window.electronAPI?.goForward) {
        // Fallback: navigate to next URL
        return await this.navigateToUrl(nextUrl)
      }

      const result = await window.electronAPI.goForward()
      
      if (result?.success) {
        logger.debug('Forward navigation successful:', nextUrl)
        return { success: true }
      } else {
        // Restore index on failure
        this.currentIndex--
        throw new Error(result?.error || 'Forward navigation failed')
      }

    } catch (error) {
      logger.error('Forward navigation failed', error as Error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown forward navigation error' 
      }
    }
  }

  // FIXED: Enhanced reload functionality
  async reload(): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.isInitialized) {
        throw new Error('Browser Controller not initialized')
      }

      if (!window.electronAPI?.reload) {
        throw new Error('Reload API not available')
      }

      const result = await window.electronAPI.reload()
      
      if (result?.success) {
        logger.debug('Page reload successful')
        return { success: true }
      } else {
        throw new Error(result?.error || 'Reload failed')
      }

    } catch (error) {
      logger.error('Reload failed', error as Error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown reload error' 
      }
    }
  }

  // FIXED: Enhanced current URL retrieval
  async getCurrentUrl(): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      if (!this.isInitialized) {
        throw new Error('Browser Controller not initialized')
      }

      if (!window.electronAPI?.getCurrentUrl) {
        // Fallback: return from history
        const currentUrl = this.navigationHistory[this.currentIndex] || this.config.defaultHomepage
        return { success: true, url: currentUrl }
      }

      const result = await window.electronAPI.getCurrentUrl()
      
      if (result?.success) {
        return { success: true, url: result.url }
      } else {
        throw new Error(result?.error || 'Failed to get current URL')
      }

    } catch (error) {
      logger.error('Failed to get current URL', error as Error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown URL retrieval error' 
      }
    }
  }

  // FIXED: Enhanced page title retrieval
  async getPageTitle(): Promise<{ success: boolean; title?: string; error?: string }> {
    try {
      if (!this.isInitialized) {
        throw new Error('Browser Controller not initialized')
      }

      if (!window.electronAPI?.getPageTitle) {
        return { success: false, error: 'Page title API not available' }
      }

      const result = await window.electronAPI.getPageTitle()
      
      if (result?.success) {
        return { success: true, title: result.title }
      } else {
        throw new Error(result?.error || 'Failed to get page title')
      }

    } catch (error) {
      logger.error('Failed to get page title', error as Error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown title retrieval error' 
      }
    }
  }

  // FIXED: Enhanced navigation state
  getNavigationState(): NavigationState {
    try {
      return {
        canGoBack: this.canGoBack(),
        canGoForward: this.canGoForward(),
        isLoading: false, // Would need to track this from browser events
        currentUrl: this.navigationHistory[this.currentIndex] || this.config.defaultHomepage,
        currentTitle: 'Loading...' // Would need to get from browser
      }
    } catch (error) {
      logger.error('Failed to get navigation state', error as Error)
      return {
        canGoBack: false,
        canGoForward: false,
        isLoading: false,
        currentUrl: this.config.defaultHomepage,
        currentTitle: 'Error'
      }
    }
  }

  // FIXED: Enhanced navigation capability checks
  canGoBack(): boolean {
    return this.currentIndex > 0
  }

  canGoForward(): boolean {
    return this.currentIndex < this.navigationHistory.length - 1
  }

  // FIXED: Enhanced search functionality
  async performSearch(query: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!query || query.trim().length === 0) {
        return { success: false, error: 'Search query cannot be empty' }
      }

      // Check if query looks like a URL
      const trimmedQuery = query.trim()
      const isUrl = /^https?:\/\//.test(trimmedQuery) || 
                   /^www\./.test(trimmedQuery) || 
                   /\.[a-z]{2,}/.test(trimmedQuery)

      if (isUrl) {
        return await this.navigateToUrl(trimmedQuery)
      } else {
        // Perform search
        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(trimmedQuery)}`
        return await this.navigateToUrl(searchUrl)
      }

    } catch (error) {
      logger.error('Search failed', error as Error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown search error' 
      }
    }
  }

  // FIXED: Enhanced history retrieval
  getNavigationHistory(): { 
    history: string[]
    currentIndex: number
    canGoBack: boolean
    canGoForward: boolean
  } {
    return {
      history: [...this.navigationHistory],
      currentIndex: this.currentIndex,
      canGoBack: this.canGoBack(),
      canGoForward: this.canGoForward()
    }
  }

  // FIXED: Enhanced cleanup
  cleanup(): void {
    try {
      this.navigationHistory = []
      this.currentIndex = -1
      this.isInitialized = false
      logger.info('Browser Controller cleaned up')
    } catch (error) {
      logger.error('Failed to cleanup Browser Controller', error as Error)
    }
  }

  // FIXED: Configuration management
  updateConfig(newConfig: Partial<BrowserControllerConfig>): void {
    try {
      this.config = { ...this.config, ...newConfig }
      logger.debug('Browser Controller config updated', newConfig)
    } catch (error) {
      logger.error('Failed to update config', error as Error)
    }
  }

  getConfig(): BrowserControllerConfig {
    return { ...this.config }
  }
}

export default BrowserController