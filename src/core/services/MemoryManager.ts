/**
 * Memory Manager
 * Comprehensive memory management and cleanup for tabs, agents, and cached data
 */

import { createLogger } from '../logger/Logger'
import { appEvents } from '../utils/EventEmitter'
import { Tab } from '../types'

const logger = createLogger('MemoryManager')

export interface MemoryStats {
  totalTabs: number
  activeTabs: number
  closedTabs: number
  cachedData: number
  memoryUsage: number
  cleanupCount: number
  lastCleanup: number
}

export interface CleanupOptions {
  maxAge?: number // Maximum age in milliseconds
  maxTabs?: number // Maximum number of tabs to keep
  aggressive?: boolean // More aggressive cleanup
}

interface TabMemoryData {
  id: string
  url: string
  title: string
  lastAccessed: number
  memoryUsage: number
  isActive: boolean
  contentCache?: any
  scrollPosition?: number
  formData?: Record<string, any>
}

interface CachedData {
  key: string
  data: any
  timestamp: number
  size: number
  accessCount: number
  lastAccessed: number
}

class MemoryManager {
  private static instance: MemoryManager
  private tabMemoryMap: Map<string, TabMemoryData> = new Map()
  private dataCache: Map<string, CachedData> = new Map()
  private cleanupIntervals: Set<NodeJS.Timeout> = new Set()
  private memoryStats: MemoryStats = {
    totalTabs: 0,
    activeTabs: 0,
    closedTabs: 0,
    cachedData: 0,
    memoryUsage: 0,
    cleanupCount: 0,
    lastCleanup: 0
  }
  private isCleanupRunning = false

  private constructor() {
    this.startPeriodicCleanup()
    this.setupEventListeners()
  }

  static getInstance(): MemoryManager {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager()
    }
    return MemoryManager.instance
  }

  /**
   * Register a tab for memory tracking
   */
  registerTab(tab: Tab): void {
    logger.debug('Registering tab for memory tracking', { tabId: tab.id, url: tab.url })

    const tabMemory: TabMemoryData = {
      id: tab.id,
      url: tab.url,
      title: tab.title,
      lastAccessed: Date.now(),
      memoryUsage: this.estimateTabMemoryUsage(tab),
      isActive: tab.isActive,
      contentCache: tab.content,
      scrollPosition: 0
    }

    this.tabMemoryMap.set(tab.id, tabMemory)
    this.updateMemoryStats()

    logger.info('Tab registered for memory tracking', { 
      tabId: tab.id, 
      estimatedMemory: tabMemory.memoryUsage 
    })
  }

  /**
   * Update tab memory data
   */
  updateTabMemory(tabId: string, updates: Partial<TabMemoryData>): void {
    const tabMemory = this.tabMemoryMap.get(tabId)
    if (tabMemory) {
      Object.assign(tabMemory, updates, { lastAccessed: Date.now() })
      this.updateMemoryStats()

      logger.debug('Tab memory updated', { tabId, updates })
    }
  }

  /**
   * Unregister tab and cleanup its memory
   */
  async unregisterTab(tabId: string): Promise<void> {
    logger.debug('Unregistering tab and cleaning up memory', { tabId })

    const tabMemory = this.tabMemoryMap.get(tabId)
    if (tabMemory) {
      // Clear any cached content
      if (tabMemory.contentCache) {
        tabMemory.contentCache = null
      }

      // Clear form data
      if (tabMemory.formData) {
        tabMemory.formData = {}
      }

      // Remove from tracking
      this.tabMemoryMap.delete(tabId)
      this.memoryStats.closedTabs++

      // Clean up related cached data
      await this.cleanupTabRelatedCache(tabId)

      this.updateMemoryStats()

      logger.info('Tab memory cleaned up', { tabId })
    }
  }

  /**
   * Cache data with automatic cleanup
   */
  cacheData(key: string, data: any, maxAge?: number): void {
    const size = this.estimateDataSize(data)
    
    const cachedItem: CachedData = {
      key,
      data,
      timestamp: Date.now(),
      size,
      accessCount: 1,
      lastAccessed: Date.now()
    }

    this.dataCache.set(key, cachedItem)
    this.memoryStats.cachedData++

    logger.debug('Data cached', { key, size, maxAge })

    // Set expiration if specified
    if (maxAge) {
      setTimeout(() => {
        this.removeFromCache(key)
      }, maxAge)
    }

    this.updateMemoryStats()
  }

  /**
   * Retrieve cached data
   */
  getCachedData(key: string): any | null {
    const cachedItem = this.dataCache.get(key)
    if (cachedItem) {
      cachedItem.accessCount++
      cachedItem.lastAccessed = Date.now()
      
      logger.debug('Cache hit', { key, accessCount: cachedItem.accessCount })
      return cachedItem.data
    }

    logger.debug('Cache miss', { key })
    return null
  }

  /**
   * Remove data from cache
   */
  removeFromCache(key: string): boolean {
    const removed = this.dataCache.delete(key)
    if (removed) {
      this.memoryStats.cachedData--
      this.updateMemoryStats()
      logger.debug('Data removed from cache', { key })
    }
    return removed
  }

  /**
   * Perform comprehensive memory cleanup
   */
  async performCleanup(options: CleanupOptions = {}): Promise<{
    cleanedTabs: number
    cleanedCache: number
    memoryFreed: number
  }> {
    if (this.isCleanupRunning) {
      logger.debug('Cleanup already in progress, skipping')
      return { cleanedTabs: 0, cleanedCache: 0, memoryFreed: 0 }
    }

    this.isCleanupRunning = true
    logger.info('Starting memory cleanup', options)

    try {
      const startMemory = this.getCurrentMemoryUsage()
      let cleanedTabs = 0
      let cleanedCache = 0

      // Cleanup old tab data
      cleanedTabs = await this.cleanupOldTabs(options)

      // Cleanup cached data
      cleanedCache = await this.cleanupOldCache(options)

      // Cleanup browser-specific memory (if available)
      await this.cleanupBrowserMemory()

      // Force garbage collection if available
      await this.forceGarbageCollection()

      const endMemory = this.getCurrentMemoryUsage()
      const memoryFreed = Math.max(0, startMemory - endMemory)

      this.memoryStats.cleanupCount++
      this.memoryStats.lastCleanup = Date.now()
      this.updateMemoryStats()

      logger.info('Memory cleanup completed', {
        cleanedTabs,
        cleanedCache,
        memoryFreed,
        totalCleanups: this.memoryStats.cleanupCount
      })

      // Emit cleanup event
      appEvents.emit('memory:cleanup-complete', {
        cleanedTabs,
        cleanedCache,
        memoryFreed,
        timestamp: Date.now()
      })

      return { cleanedTabs, cleanedCache, memoryFreed }

    } finally {
      this.isCleanupRunning = false
    }
  }

  /**
   * Get current memory statistics
   */
  getMemoryStats(): MemoryStats {
    this.updateMemoryStats()
    return { ...this.memoryStats }
  }

  /**
   * Force immediate cleanup of all memory
   */
  async forceCleanup(): Promise<void> {
    logger.info('Forcing immediate memory cleanup')

    await this.performCleanup({
      maxAge: 0,
      maxTabs: 0,
      aggressive: true
    })

    // Clear all caches
    this.dataCache.clear()
    
    // Reset counters
    this.memoryStats.cachedData = 0
    this.updateMemoryStats()

    logger.info('Force cleanup completed')
  }

  /**
   * Private helper methods
   */
  private async cleanupOldTabs(options: CleanupOptions): Promise<number> {
    const maxAge = options.maxAge ?? (24 * 60 * 60 * 1000) // 24 hours default
    const maxTabs = options.maxTabs ?? 50
    const now = Date.now()
    let cleanedCount = 0

    // Get inactive tabs sorted by last access time
    const inactiveTabs = Array.from(this.tabMemoryMap.values())
      .filter(tab => !tab.isActive)
      .sort((a, b) => a.lastAccessed - b.lastAccessed)

    // Remove old tabs
    for (const tab of inactiveTabs) {
      const age = now - tab.lastAccessed
      const shouldCleanup = age > maxAge || 
                           (this.tabMemoryMap.size > maxTabs && !tab.isActive) ||
                           options.aggressive

      if (shouldCleanup) {
        await this.unregisterTab(tab.id)
        cleanedCount++
      }
    }

    return cleanedCount
  }

  private async cleanupOldCache(options: CleanupOptions): Promise<number> {
    const maxAge = options.maxAge ?? (60 * 60 * 1000) // 1 hour default
    const now = Date.now()
    let cleanedCount = 0

    for (const [key, cachedItem] of this.dataCache.entries()) {
      const age = now - cachedItem.timestamp
      const shouldCleanup = age > maxAge || 
                           (cachedItem.accessCount === 1 && age > 300000) || // 5 min for single access
                           options.aggressive

      if (shouldCleanup) {
        this.dataCache.delete(key)
        cleanedCount++
      }
    }

    this.memoryStats.cachedData = this.dataCache.size
    return cleanedCount
  }

  private async cleanupTabRelatedCache(tabId: string): Promise<void> {
    // Remove any cached data related to this tab
    const keysToRemove: string[] = []
    
    for (const key of this.dataCache.keys()) {
      if (key.includes(tabId)) {
        keysToRemove.push(key)
      }
    }

    for (const key of keysToRemove) {
      this.dataCache.delete(key)
    }

    if (keysToRemove.length > 0) {
      logger.debug('Cleaned up tab-related cache', { tabId, count: keysToRemove.length })
    }
  }

  private async cleanupBrowserMemory(): Promise<void> {
    try {
      // Call Electron API to cleanup browser memory if available
      // Note: cleanupMemory is not currently implemented in electronAPI
      // This is a placeholder for future browser memory cleanup functionality
      logger.debug('Browser memory cleanup requested (not implemented)')
    } catch (error) {
      logger.warn('Browser memory cleanup failed', error as Error)
    }
  }

  private async forceGarbageCollection(): Promise<void> {
    try {
      // Force garbage collection if available
      if ((window as any).gc) {
        (window as any).gc()
        logger.debug('Forced garbage collection')
      }
    } catch (error) {
      logger.debug('Garbage collection not available')
    }
  }

  private startPeriodicCleanup(): void {
    // Cleanup every 5 minutes
    const interval = setInterval(() => {
      this.performCleanup({
        maxAge: 30 * 60 * 1000, // 30 minutes
        maxTabs: 20,
        aggressive: false
      })
    }, 5 * 60 * 1000)

    this.cleanupIntervals.add(interval)

    // Aggressive cleanup every hour
    const aggressiveInterval = setInterval(() => {
      this.performCleanup({
        maxAge: 60 * 60 * 1000, // 1 hour
        maxTabs: 10,
        aggressive: true
      })
    }, 60 * 60 * 1000)

    this.cleanupIntervals.add(aggressiveInterval)

    logger.debug('Periodic cleanup intervals started')
  }

  private setupEventListeners(): void {
    // Listen for tab events
    appEvents.on('tab:created', (data) => {
      // Tab will be registered when actual Tab object is available
    })

    appEvents.on('tab:closed', (data) => {
      this.unregisterTab(data.tabId)
    })

    appEvents.on('tab:switched', (data) => {
      // Update last accessed time for active tab
      this.updateTabMemory(data.tabId, { isActive: true })
      
      // Mark previous tab as inactive
      if (data.previousTabId) {
        this.updateTabMemory(data.previousTabId, { isActive: false })
      }
    })
  }

  private estimateTabMemoryUsage(tab: Tab): number {
    let size = 1000 // Base size for tab metadata
    
    size += (tab.title?.length || 0) * 2 // String size estimation
    size += (tab.url?.length || 0) * 2
    size += (tab.content?.length || 0) * 2
    
    // AI tabs typically use more memory
    if (tab.type === 'ai') {
      size *= 1.5
    }
    
    return Math.round(size)
  }

  private estimateDataSize(data: any): number {
    if (data === null || data === undefined) return 0
    if (typeof data === 'string') return data.length * 2
    if (typeof data === 'number') return 8
    if (typeof data === 'boolean') return 4
    if (typeof data === 'object') {
      return JSON.stringify(data).length * 2
    }
    return 100 // Default estimation
  }

  private getCurrentMemoryUsage(): number {
    try {
      const memInfo = (performance as any).memory
      return memInfo?.usedJSHeapSize || 0
    } catch {
      return 0
    }
  }

  private updateMemoryStats(): void {
    this.memoryStats.totalTabs = this.tabMemoryMap.size
    this.memoryStats.activeTabs = Array.from(this.tabMemoryMap.values())
      .filter(tab => tab.isActive).length
    this.memoryStats.cachedData = this.dataCache.size
    this.memoryStats.memoryUsage = this.getCurrentMemoryUsage()
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    logger.info('Cleaning up Memory Manager')

    // Clear all intervals
    for (const interval of this.cleanupIntervals) {
      clearInterval(interval)
    }
    this.cleanupIntervals.clear()

    // Force cleanup
    await this.forceCleanup()

    // Clear all maps
    this.tabMemoryMap.clear()
    this.dataCache.clear()

    logger.info('Memory Manager cleanup complete')
  }
}

export default MemoryManager