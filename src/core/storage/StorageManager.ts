/**
 * Storage Manager
 * Centralized data persistence and caching
 */

import { createLogger } from '../logger/EnhancedLogger'
import { APP_CONSTANTS } from '../utils/Constants'

const logger = createLogger('StorageManager')

export interface StorageOptions {
  encrypt?: boolean
  compress?: boolean
  ttl?: number // Time to live in milliseconds
  namespace?: string
}

export interface StorageItem<T = any> {
  data: T
  timestamp: number
  ttl?: number
  version: string
}

export interface StorageBackend {
  getItem(key: string): Promise<string | null>
  setItem(key: string, value: string): Promise<void>
  removeItem(key: string): Promise<void>
  clear(): Promise<void>
  keys(): Promise<string[]>
}

class LocalStorageBackend implements StorageBackend {
  async getItem(key: string): Promise<string | null> {
    try {
      return localStorage.getItem(key)
    } catch (error) {
      logger.error('LocalStorage getItem failed', error)
      return null
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      localStorage.setItem(key, value)
    } catch (error) {
      logger.error('LocalStorage setItem failed', error)
      throw error
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      logger.error('LocalStorage removeItem failed', error)
    }
  }

  async clear(): Promise<void> {
    try {
      localStorage.clear()
    } catch (error) {
      logger.error('LocalStorage clear failed', error)
    }
  }

  async keys(): Promise<string[]> {
    try {
      return Object.keys(localStorage)
    } catch (error) {
      logger.error('LocalStorage keys failed', error)
      return []
    }
  }
}

class ElectronStorageBackend implements StorageBackend {
  async getItem(key: string): Promise<string | null> {
    try {
      if (window.electronAPI?.storage?.getItem) {
        return await window.electronAPI.storage.getItem(key)
      }
      return null
    } catch (error) {
      logger.error('Electron storage getItem failed', error)
      return null
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      if (window.electronAPI?.storage?.setItem) {
        await window.electronAPI.storage.setItem(key, value)
      }
    } catch (error) {
      logger.error('Electron storage setItem failed', error)
      throw error
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      if (window.electronAPI?.storage?.removeItem) {
        await window.electronAPI.storage.removeItem(key)
      }
    } catch (error) {
      logger.error('Electron storage removeItem failed', error)
    }
  }

  async clear(): Promise<void> {
    try {
      if (window.electronAPI?.storage?.clear) {
        await window.electronAPI.storage.clear()
      }
    } catch (error) {
      logger.error('Electron storage clear failed', error)
    }
  }

  async keys(): Promise<string[]> {
    try {
      if (window.electronAPI?.storage?.keys) {
        return await window.electronAPI.storage.keys()
      }
      return []
    } catch (error) {
      logger.error('Electron storage keys failed', error)
      return []
    }
  }
}

class StorageManager {
  private static instance: StorageManager
  private backend: StorageBackend
  private cache = new Map<string, StorageItem>()
  private version = '1.0.0'

  private constructor() {
    // Use Electron storage if available, fallback to localStorage
    this.backend = window.electronAPI?.storage 
      ? new ElectronStorageBackend()
      : new LocalStorageBackend()
    
    logger.info(`Initialized with backend: ${this.backend.constructor.name}`)
  }

  static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager()
    }
    return StorageManager.instance
  }

  /**
   * Store data
   */
  async set<T>(
    key: string, 
    data: T, 
    options: StorageOptions = {}
  ): Promise<void> {
    const fullKey = this.getFullKey(key, options.namespace)
    
    const item: StorageItem<T> = {
      data,
      timestamp: Date.now(),
      version: this.version,
      ttl: options.ttl
    }

    try {
      const serialized = JSON.stringify(item)
      
      // TODO: Add encryption if needed
      if (options.encrypt) {
        // serialized = encrypt(serialized)
      }
      
      // TODO: Add compression if needed
      if (options.compress) {
        // serialized = compress(serialized)
      }

      await this.backend.setItem(fullKey, serialized)
      this.cache.set(fullKey, item)
      
      logger.debug(`Stored item: ${fullKey}`, { size: serialized.length })
    } catch (error) {
      logger.error(`Failed to store item: ${fullKey}`, error)
      throw error
    }
  }

  /**
   * Retrieve data
   */
  async get<T>(
    key: string, 
    defaultValue?: T, 
    options: StorageOptions = {}
  ): Promise<T | undefined> {
    const fullKey = this.getFullKey(key, options.namespace)
    
    try {
      // Check cache first
      const cached = this.cache.get(fullKey)
      if (cached && this.isValidItem(cached)) {
        logger.debug(`Retrieved from cache: ${fullKey}`)
        return cached.data as T
      }

      // Retrieve from storage
      const serialized = await this.backend.getItem(fullKey)
      if (!serialized) {
        return defaultValue
      }

      // TODO: Handle decompression
      if (options.compress) {
        // serialized = decompress(serialized)
      }
      
      // TODO: Handle decryption
      if (options.encrypt) {
        // serialized = decrypt(serialized)
      }

      const item: StorageItem<T> = JSON.parse(serialized)
      
      // Check if item is expired
      if (!this.isValidItem(item)) {
        await this.remove(key, options)
        return defaultValue
      }

      // Update cache
      this.cache.set(fullKey, item)
      
      logger.debug(`Retrieved from storage: ${fullKey}`)
      return item.data
    } catch (error) {
      logger.error(`Failed to retrieve item: ${fullKey}`, error)
      return defaultValue
    }
  }

  /**
   * Remove data
   */
  async remove(key: string, options: StorageOptions = {}): Promise<void> {
    const fullKey = this.getFullKey(key, options.namespace)
    
    try {
      await this.backend.removeItem(fullKey)
      this.cache.delete(fullKey)
      logger.debug(`Removed item: ${fullKey}`)
    } catch (error) {
      logger.error(`Failed to remove item: ${fullKey}`, error)
    }
  }

  /**
   * Check if key exists
   */
  async has(key: string, options: StorageOptions = {}): Promise<boolean> {
    const fullKey = this.getFullKey(key, options.namespace)
    
    try {
      const item = await this.backend.getItem(fullKey)
      if (!item) return false
      
      const parsed: StorageItem = JSON.parse(item)
      return this.isValidItem(parsed)
    } catch {
      return false
    }
  }

  /**
   * Clear all data
   */
  async clear(namespace?: string): Promise<void> {
    try {
      if (namespace) {
        const keys = await this.backend.keys()
        const namespaceKeys = keys.filter(key => key.startsWith(`${namespace}:`))
        
        for (const key of namespaceKeys) {
          await this.backend.removeItem(key)
          this.cache.delete(key)
        }
        
        logger.debug(`Cleared namespace: ${namespace}`)
      } else {
        await this.backend.clear()
        this.cache.clear()
        logger.debug('Cleared all storage')
      }
    } catch (error) {
      logger.error('Failed to clear storage', error)
    }
  }

  /**
   * Get all keys
   */
  async keys(namespace?: string): Promise<string[]> {
    try {
      const allKeys = await this.backend.keys()
      
      if (namespace) {
        return allKeys
          .filter(key => key.startsWith(`${namespace}:`))
          .map(key => key.substring(namespace.length + 1))
      }
      
      return allKeys
    } catch (error) {
      logger.error('Failed to get keys', error)
      return []
    }
  }

  /**
   * Get storage usage statistics
   */
  async getStats(): Promise<{
    totalKeys: number
    cacheHits: number
    totalSize: number
  }> {
    try {
      const keys = await this.backend.keys()
      let totalSize = 0
      
      for (const key of keys) {
        const item = await this.backend.getItem(key)
        if (item) {
          totalSize += item.length
        }
      }
      
      return {
        totalKeys: keys.length,
        cacheHits: this.cache.size,
        totalSize
      }
    } catch (error) {
      logger.error('Failed to get storage stats', error)
      return { totalKeys: 0, cacheHits: 0, totalSize: 0 }
    }
  }

  /**
   * Clean up expired items
   */
  async cleanup(): Promise<number> {
    let cleaned = 0
    
    try {
      const keys = await this.backend.keys()
      
      for (const key of keys) {
        try {
          const serialized = await this.backend.getItem(key)
          if (!serialized) continue
          
          const item: StorageItem = JSON.parse(serialized)
          
          if (!this.isValidItem(item)) {
            await this.backend.removeItem(key)
            this.cache.delete(key)
            cleaned++
          }
        } catch {
          // Invalid item, remove it
          await this.backend.removeItem(key)
          this.cache.delete(key)
          cleaned++
        }
      }
      
      logger.info(`Cleaned up ${cleaned} expired items`)
    } catch (error) {
      logger.error('Failed to cleanup storage', error)
    }
    
    return cleaned
  }

  private getFullKey(key: string, namespace?: string): string {
    return namespace ? `${namespace}:${key}` : key
  }

  private isValidItem(item: StorageItem): boolean {
    // Check version compatibility
    if (item.version !== this.version) {
      return false
    }
    
    // Check TTL
    if (item.ttl && (Date.now() - item.timestamp) > item.ttl) {
      return false
    }
    
    return true
  }
}

// Convenience functions for app-specific storage
const storage = StorageManager.getInstance()

export const appStorage = {
  // Tabs
  saveTabs: (tabs: any[]) => storage.set(APP_CONSTANTS.STORAGE_KEYS.TABS, tabs),
  loadTabs: () => storage.get(APP_CONSTANTS.STORAGE_KEYS.TABS, []),
  
  // Bookmarks
  saveBookmarks: (bookmarks: any[]) => storage.set(APP_CONSTANTS.STORAGE_KEYS.BOOKMARKS, bookmarks),
  loadBookmarks: () => storage.get(APP_CONSTANTS.STORAGE_KEYS.BOOKMARKS, []),
  
  // History
  saveHistory: (history: any[]) => storage.set(APP_CONSTANTS.STORAGE_KEYS.HISTORY, history),
  loadHistory: () => storage.get(APP_CONSTANTS.STORAGE_KEYS.HISTORY, []),
  
  // Settings
  saveSettings: (settings: any) => storage.set(APP_CONSTANTS.STORAGE_KEYS.SETTINGS, settings),
  loadSettings: () => storage.get(APP_CONSTANTS.STORAGE_KEYS.SETTINGS, {}),
  
  // AI Conversations
  saveConversations: (conversations: any[]) => storage.set(APP_CONSTANTS.STORAGE_KEYS.AI_CONVERSATIONS, conversations),
  loadConversations: () => storage.get(APP_CONSTANTS.STORAGE_KEYS.AI_CONVERSATIONS, [])
}

export default StorageManager