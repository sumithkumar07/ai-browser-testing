/**
 * Development Tools
 * Utilities for debugging and development
 */

import { createLogger } from '../logger/Logger'
import { appEvents } from '../utils/EventEmitter'
import { APP_CONSTANTS } from '../utils/Constants'

const logger = createLogger('DevTools')

export interface DevToolsInfo {
  environment: string
  version: string
  buildTime: string
  features: string[]
  performance: {
    memoryUsage: number
    uptime: number
    eventListeners: number
  }
}

class DevTools {
  private static instance: DevTools
  private isEnabled: boolean = false
  private performanceObserver?: PerformanceObserver
  private startTime: number = Date.now()

  private constructor() {
    this.isEnabled = process.env.NODE_ENV === 'development'
    if (this.isEnabled) {
      this.initializeDevTools()
    }
  }

  static getInstance(): DevTools {
    if (!DevTools.instance) {
      DevTools.instance = new DevTools()
    }
    return DevTools.instance
  }

  private initializeDevTools(): void {
    logger.info('Development tools initialized')

    // Add to global window for debugging
    if (typeof window !== 'undefined') {
      (window as any).__KAIRO_DEV__ = {
        getInfo: () => this.getInfo(),
        logState: () => this.logApplicationState(),
        clearLogs: () => logger.getInstance().removeAllListeners(),
        triggerError: () => { throw new Error('Test error from DevTools') },
        performance: {
          mark: (name: string) => performance.mark(name),
          measure: (name: string, startMark: string, endMark?: string) => 
            performance.measure(name, startMark, endMark)
        },
        events: {
          emit: (event: string, data: any) => appEvents.emit(event as any, data),
          listenerCount: (event: string) => appEvents.listenerCount(event as any)
        }
      }
    }

    // Set up performance monitoring
    this.setupPerformanceMonitoring()

    // Log startup info
    this.logStartupInfo()
  }

  private setupPerformanceMonitoring(): void {
    if (typeof PerformanceObserver !== 'undefined') {
      this.performanceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 100) { // Log slow operations
            logger.warn(`Slow operation detected: ${entry.name}`, {
              duration: entry.duration,
              type: entry.entryType
            })
          }
        }
      })

      this.performanceObserver.observe({ entryTypes: ['measure', 'navigation'] })
    }
  }

  private logStartupInfo(): void {
    const info = this.getInfo()
    logger.info('KAiro Browser Development Build', info)
  }

  getInfo(): DevToolsInfo {
    const memoryInfo = (performance as any).memory || {}
    
    return {
      environment: process.env.NODE_ENV || 'unknown',
      version: APP_CONSTANTS.APP_VERSION,
      buildTime: new Date().toISOString(),
      features: [
        'AI Integration',
        'Agent Framework',
        'Multi-tab Browsing',
        'Error Boundaries',
        'Performance Monitoring',
        'Development Tools'
      ],
      performance: {
        memoryUsage: memoryInfo.usedJSHeapSize || 0,
        uptime: Date.now() - this.startTime,
        eventListeners: appEvents.eventNames().length
      }
    }
  }

  logApplicationState(): void {
    if (!this.isEnabled) return

    const state = {
      tabs: (window as any).__KAIRO_STATE__?.tabs || [],
      activeTab: (window as any).__KAIRO_STATE__?.activeTabId,
      aiStatus: (window as any).__KAIRO_STATE__?.agentStatus,
      errors: (window as any).__KAIRO_ERRORS__ || []
    }

    logger.info('Current Application State', state)
  }

  measureOperation<T>(name: string, operation: () => T): T {
    if (!this.isEnabled) return operation()

    const startMark = `${name}-start`
    const endMark = `${name}-end`
    
    performance.mark(startMark)
    
    try {
      const result = operation()
      
      performance.mark(endMark)
      performance.measure(name, startMark, endMark)
      
      return result
    } catch (error) {
      performance.mark(endMark)
      performance.measure(`${name}-error`, startMark, endMark)
      throw error
    }
  }

  async measureAsyncOperation<T>(name: string, operation: () => Promise<T>): Promise<T> {
    if (!this.isEnabled) return operation()

    const startMark = `${name}-start`
    const endMark = `${name}-end`
    
    performance.mark(startMark)
    
    try {
      const result = await operation()
      
      performance.mark(endMark)
      performance.measure(name, startMark, endMark)
      
      return result
    } catch (error) {
      performance.mark(endMark)
      performance.measure(`${name}-error`, startMark, endMark)
      throw error
    }
  }

  isDevMode(): boolean {
    return this.isEnabled
  }

  cleanup(): void {
    if (this.performanceObserver) {
      this.performanceObserver.disconnect()
    }

    if (typeof window !== 'undefined') {
      delete (window as any).__KAIRO_DEV__
    }
  }
}

export default DevTools