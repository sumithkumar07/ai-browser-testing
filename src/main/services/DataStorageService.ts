// src/main/services/DataStorageService.ts
export interface StorageItem {
  key: string
  value: any
  timestamp: number
  expiresAt?: number
}

export interface StorageOptions {
  expiresIn?: number // milliseconds
  encrypt?: boolean
  compress?: boolean
}

export interface BackupData {
  timestamp: number
  version: string
  data: { [key: string]: any }
  checksum: string
}

export class DataStorageService {
  private static instance: DataStorageService
  private isInitialized: boolean = false
  private storage: Map<string, StorageItem> = new Map()
  private maxStorageSize: number = 10000
  private backupInterval: number = 24 * 60 * 60 * 1000 // 24 hours
  private lastBackup: number = 0

  private constructor() {}

  static getInstance(): DataStorageService {
    if (!DataStorageService.instance) {
      DataStorageService.instance = new DataStorageService()
    }
    return DataStorageService.instance
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('⚠️ DataStorageService already initialized')
      return
    }

    console.log('💾 Initializing Data Storage Service...')
    
    try {
      // Load existing data from localStorage
      await this.loadFromStorage()
      
      // Setup cleanup interval
      this.setupCleanupInterval()
      
      this.isInitialized = true
      console.log('✅ Data Storage Service initialized')
    } catch (error) {
      console.error('❌ Data Storage Service initialization failed:', error)
      throw error
    }
  }

  async setItem(key: string, value: any, options: StorageOptions = {}): Promise<boolean> {
    try {
      console.log(`💾 Storing item: ${key}`)
      
      if (!this.isInitialized) {
        throw new Error('DataStorageService not initialized')
      }

      // Check storage limits
      if (this.storage.size >= this.maxStorageSize) {
        await this.cleanupExpiredItems()
        if (this.storage.size >= this.maxStorageSize) {
          throw new Error('Storage limit exceeded')
        }
      }

      const item: StorageItem = {
        key,
        value: options.compress ? this.compress(value) : value,
        timestamp: Date.now(),
        expiresAt: options.expiresIn ? Date.now() + options.expiresIn : undefined
      }

      this.storage.set(key, item)
      
      // Save to persistent storage
      await this.saveToStorage()
      
      console.log(`✅ Item stored: ${key}`)
      return true
      
    } catch (error) {
      console.error(`❌ Failed to store item ${key}:`, error)
      return false
    }
  }

  async getItem(key: string): Promise<any> {
    try {
      console.log(`💾 Retrieving item: ${key}`)
      
      if (!this.isInitialized) {
        throw new Error('DataStorageService not initialized')
      }

      const item = this.storage.get(key)
      
      if (!item) {
        console.log(`⚠️ Item not found: ${key}`)
        return null
      }

      // Check if item has expired
      if (item.expiresAt && Date.now() > item.expiresAt) {
        console.log(`⚠️ Item expired: ${key}`)
        this.storage.delete(key)
        await this.saveToStorage()
        return null
      }

      const value = this.isCompressed(item.value) ? this.decompress(item.value) : item.value
      console.log(`✅ Item retrieved: ${key}`)
      return value
      
    } catch (error) {
      console.error(`❌ Failed to retrieve item ${key}:`, error)
      return null
    }
  }

  async removeItem(key: string): Promise<boolean> {
    try {
      console.log(`💾 Removing item: ${key}`)
      
      if (!this.isInitialized) {
        throw new Error('DataStorageService not initialized')
      }

      const deleted = this.storage.delete(key)
      
      if (deleted) {
        await this.saveToStorage()
        console.log(`✅ Item removed: ${key}`)
      } else {
        console.log(`⚠️ Item not found for removal: ${key}`)
      }
      
      return deleted
      
    } catch (error) {
      console.error(`❌ Failed to remove item ${key}:`, error)
      return false
    }
  }

  async clear(): Promise<void> {
    try {
      console.log('💾 Clearing all storage...')
      
      if (!this.isInitialized) {
        throw new Error('DataStorageService not initialized')
      }

      this.storage.clear()
      await this.saveToStorage()
      
      console.log('✅ Storage cleared')
      
    } catch (error) {
      console.error('❌ Failed to clear storage:', error)
    }
  }

  async getAllKeys(): Promise<string[]> {
    try {
      return Array.from(this.storage.keys())
    } catch (error) {
      console.error('❌ Failed to get all keys:', error)
      return []
    }
  }

  async getStorageInfo(): Promise<{ size: number; maxSize: number; usage: number }> {
    try {
      const size = this.storage.size
      const maxSize = this.maxStorageSize
      const usage = (size / maxSize) * 100
      
      return { size, maxSize, usage }
    } catch (error) {
      console.error('❌ Failed to get storage info:', error)
      return { size: 0, maxSize: 0, usage: 0 }
    }
  }

  async createBackup(): Promise<BackupData> {
    try {
      console.log('💾 Creating backup...')
      
      const data: { [key: string]: any } = {}
      for (const [key, item] of this.storage) {
        data[key] = item.value
      }
      
      const backup: BackupData = {
        timestamp: Date.now(),
        version: '1.0',
        data,
        checksum: this.calculateChecksum(data)
      }
      
      // Store backup
      await this.setItem(`backup_${backup.timestamp}`, backup)
      this.lastBackup = backup.timestamp
      
      console.log('✅ Backup created')
      return backup
      
    } catch (error) {
      console.error('❌ Failed to create backup:', error)
      throw error
    }
  }

  async restoreBackup(backup: BackupData): Promise<boolean> {
    try {
      console.log('💾 Restoring backup...')
      
      // Verify backup integrity
      if (backup.checksum !== this.calculateChecksum(backup.data)) {
        throw new Error('Backup checksum verification failed')
      }
      
      // Clear current storage
      await this.clear()
      
      // Restore data
      for (const [key, value] of Object.entries(backup.data)) {
        await this.setItem(key, value)
      }
      
      console.log('✅ Backup restored')
      return true
      
    } catch (error) {
      console.error('❌ Failed to restore backup:', error)
      return false
    }
  }

  private async loadFromStorage(): Promise<void> {
    try {
      // In a real implementation, this would load from persistent storage
      // For now, we'll initialize with empty storage
      console.log('💾 Loading data from storage...')
      
      // Load from localStorage if available
      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem('kairo-browser-storage')
        if (stored) {
          const data = JSON.parse(stored)
          for (const [key, item] of Object.entries(data)) {
            this.storage.set(key, item as StorageItem)
          }
        }
      }
      
      console.log(`✅ Loaded ${this.storage.size} items from storage`)
      
    } catch (error) {
      console.error('❌ Failed to load from storage:', error)
    }
  }

  private async saveToStorage(): Promise<void> {
    try {
      // Save to localStorage if available
      if (typeof localStorage !== 'undefined') {
        const data: { [key: string]: StorageItem } = {}
        for (const [key, item] of this.storage) {
          data[key] = item
        }
        localStorage.setItem('kairo-browser-storage', JSON.stringify(data))
      }
    } catch (error) {
      console.error('❌ Failed to save to storage:', error)
    }
  }

  private setupCleanupInterval(): void {
    // Clean up expired items every hour
    setInterval(async () => {
      await this.cleanupExpiredItems()
      
      // Create backup if needed
      if (Date.now() - this.lastBackup > this.backupInterval) {
        try {
          await this.createBackup()
        } catch (error) {
          console.error('❌ Automatic backup failed:', error)
        }
      }
    }, 60 * 60 * 1000) // 1 hour
  }

  private async cleanupExpiredItems(): Promise<void> {
    try {
      const now = Date.now()
      const expiredKeys: string[] = []
      
      for (const [key, item] of this.storage) {
        if (item.expiresAt && now > item.expiresAt) {
          expiredKeys.push(key)
        }
      }
      
      for (const key of expiredKeys) {
        this.storage.delete(key)
      }
      
      if (expiredKeys.length > 0) {
        await this.saveToStorage()
        console.log(`🧹 Cleaned up ${expiredKeys.length} expired items`)
      }
      
    } catch (error) {
      console.error('❌ Failed to cleanup expired items:', error)
    }
  }

  private compress(data: any): string {
    // Simple compression placeholder
    return JSON.stringify(data)
  }

  private decompress(data: string): any {
    // Simple decompression placeholder
    return JSON.parse(data)
  }

  private isCompressed(data: any): boolean {
    return typeof data === 'string'
  }

  private calculateChecksum(data: any): string {
    // Simple checksum calculation
    return JSON.stringify(data).length.toString()
  }

  // Public utility methods
  isReady(): boolean {
    return this.isInitialized
  }

  getStorageSize(): number {
    return this.storage.size
  }

  getMaxStorageSize(): number {
    return this.maxStorageSize
  }

  setMaxStorageSize(size: number): void {
    this.maxStorageSize = Math.max(100, size)
  }
}

export default DataStorageService
