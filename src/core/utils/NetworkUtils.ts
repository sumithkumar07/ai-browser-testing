/**
 * Enhanced Network Utilities
 * Provides network status monitoring and connection management
 */

export interface NetworkStatus {
  isOnline: boolean
  connectionType: string
  effectiveType?: string
  downlink?: number
  rtt?: number
  saveData?: boolean
}

export interface ConnectionQuality {
  rating: 'excellent' | 'good' | 'fair' | 'poor' | 'offline'
  score: number
  latency: number
  bandwidth: number
}

export class NetworkUtils {
  private static instance: NetworkUtils
  private networkStatus: NetworkStatus
  private listeners: Set<(status: NetworkStatus) => void> = new Set()
  private connectionQuality: ConnectionQuality | null = null
  private lastQualityCheck = 0
  private qualityCheckInterval = 30000 // 30 seconds

  private constructor() {
    this.networkStatus = this.getCurrentNetworkStatus()
    this.setupEventListeners()
  }

  static getInstance(): NetworkUtils {
    if (!NetworkUtils.instance) {
      NetworkUtils.instance = new NetworkUtils()
    }
    return NetworkUtils.instance
  }

  /**
   * Get current network status
   */
  private getCurrentNetworkStatus(): NetworkStatus {
    if (typeof navigator === 'undefined') {
      return {
        isOnline: true,
        connectionType: 'unknown'
      }
    }

    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection

    return {
      isOnline: navigator.onLine,
      connectionType: connection?.type || 'unknown',
      effectiveType: connection?.effectiveType,
      downlink: connection?.downlink,
      rtt: connection?.rtt,
      saveData: connection?.saveData
    }
  }

  /**
   * Setup network event listeners
   */
  private setupEventListeners(): void {
    if (typeof window === 'undefined') return

    window.addEventListener('online', this.handleOnline.bind(this))
    window.addEventListener('offline', this.handleOffline.bind(this))

    // Listen for connection changes
    const connection = (navigator as any).connection
    if (connection) {
      connection.addEventListener('change', this.handleConnectionChange.bind(this))
    }
  }

  private handleOnline(): void {
    this.updateNetworkStatus()
    console.log('🌐 Network connection restored')
  }

  private handleOffline(): void {
    this.updateNetworkStatus()
    console.warn('📵 Network connection lost')
  }

  private handleConnectionChange(): void {
    this.updateNetworkStatus()
  }

  private updateNetworkStatus(): void {
    const oldStatus = this.networkStatus
    this.networkStatus = this.getCurrentNetworkStatus()

    // Notify listeners if status changed
    if (oldStatus.isOnline !== this.networkStatus.isOnline ||
        oldStatus.connectionType !== this.networkStatus.connectionType) {
      this.notifyListeners()
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.networkStatus)
      } catch (error) {
        console.error('Error in network status listener:', error)
      }
    })
  }

  /**
   * Get current network status
   */
  getNetworkStatus(): NetworkStatus {
    return { ...this.networkStatus }
  }

  /**
   * Check if currently online
   */
  isOnline(): boolean {
    return this.networkStatus.isOnline
  }

  /**
   * Check if connection is fast enough for certain operations
   */
  isFastConnection(): boolean {
    const { effectiveType, downlink } = this.networkStatus
    
    if (effectiveType) {
      return effectiveType === '4g' || effectiveType === '3g'
    }
    
    if (downlink) {
      return downlink > 1.5 // > 1.5 Mbps
    }
    
    return true // Assume good connection if we can't determine
  }

  /**
   * Check if user prefers to save data
   */
  shouldSaveData(): boolean {
    return this.networkStatus.saveData || false
  }

  /**
   * Add network status listener
   */
  addNetworkListener(listener: (status: NetworkStatus) => void): void {
    this.listeners.add(listener)
  }

  /**
   * Remove network status listener
   */
  removeNetworkListener(listener: (status: NetworkStatus) => void): void {
    this.listeners.delete(listener)
  }

  /**
   * Test connection quality
   */
  async testConnectionQuality(): Promise<ConnectionQuality> {
    const now = Date.now()
    
    // Use cached result if recent
    if (this.connectionQuality && (now - this.lastQualityCheck) < this.qualityCheckInterval) {
      return this.connectionQuality
    }

    if (!this.isOnline()) {
      this.connectionQuality = {
        rating: 'offline',
        score: 0,
        latency: Infinity,
        bandwidth: 0
      }
      return this.connectionQuality
    }

    try {
      const startTime = performance.now()
      
      // Test with a small image or endpoint
      const testUrl = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
      
      await fetch(testUrl, {
        method: 'GET',
        cache: 'no-store'
      })
      
      const latency = performance.now() - startTime
      
      // Estimate bandwidth from connection info
      const connection = (navigator as any).connection
      const bandwidth = connection?.downlink || this.estimateBandwidth(latency)
      
      const score = this.calculateQualityScore(latency, bandwidth)
      const rating = this.getQualityRating(score)

      this.connectionQuality = {
        rating,
        score,
        latency,
        bandwidth
      }
      
      this.lastQualityCheck = now
      return this.connectionQuality

    } catch (error) {
      console.warn('Connection quality test failed:', error)
      
      this.connectionQuality = {
        rating: 'poor',
        score: 25,
        latency: 2000,
        bandwidth: 0.1
      }
      
      return this.connectionQuality
    }
  }

  private estimateBandwidth(latency: number): number {
    // Rough estimation based on latency
    if (latency < 50) return 10 // Fast connection
    if (latency < 100) return 5  // Good connection
    if (latency < 300) return 2  // Fair connection
    return 0.5 // Slow connection
  }

  private calculateQualityScore(latency: number, bandwidth: number): number {
    // Score from 0-100 based on latency and bandwidth
    const latencyScore = Math.max(0, 100 - (latency / 10))
    const bandwidthScore = Math.min(100, bandwidth * 10)
    
    return Math.round((latencyScore + bandwidthScore) / 2)
  }

  private getQualityRating(score: number): ConnectionQuality['rating'] {
    if (score >= 80) return 'excellent'
    if (score >= 60) return 'good'
    if (score >= 40) return 'fair'
    return 'poor'
  }

  /**
   * Get cached connection quality
   */
  getConnectionQuality(): ConnectionQuality | null {
    return this.connectionQuality
  }

  /**
   * Wait for network to come back online
   */
  async waitForOnline(timeoutMs = 30000): Promise<boolean> {
    if (this.isOnline()) {
      return true
    }

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        this.removeNetworkListener(onlineListener)
        resolve(false)
      }, timeoutMs)

      const onlineListener = (status: NetworkStatus) => {
        if (status.isOnline) {
          clearTimeout(timeout)
          this.removeNetworkListener(onlineListener)
          resolve(true)
        }
      }

      this.addNetworkListener(onlineListener)
    })
  }

  /**
   * Check if specific URL is reachable
   */
  async isUrlReachable(url: string, timeoutMs = 5000): Promise<boolean> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

      const response = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
        cache: 'no-store'
      })

      clearTimeout(timeoutId)
      return response.ok
    } catch (error) {
      return false
    }
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    if (typeof window === 'undefined') return

    window.removeEventListener('online', this.handleOnline.bind(this))
    window.removeEventListener('offline', this.handleOffline.bind(this))

    const connection = (navigator as any).connection
    if (connection) {
      connection.removeEventListener('change', this.handleConnectionChange.bind(this))
    }

    this.listeners.clear()
  }
}

export default NetworkUtils