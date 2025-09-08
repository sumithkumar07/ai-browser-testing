/**
 * Enhanced Error Recovery Service for KAiro Browser
 * Provides robust error handling and automatic recovery mechanisms
 */

import { createLogger } from '../../core/logger/Logger'
import { appEvents } from '../../core/utils/EventEmitter'

const logger = createLogger('ErrorRecoveryService')

export interface ErrorContext {
  component: string
  action: string
  error: Error
  timestamp: number
  userAgent?: string
  url?: string
  retryCount?: number
}

export interface RecoveryStrategy {
  id: string
  name: string
  description: string
  condition: (error: Error, context: ErrorContext) => boolean
  execute: (error: Error, context: ErrorContext) => Promise<boolean>
  maxRetries: number
}

export class ErrorRecoveryService {
  private static instance: ErrorRecoveryService
  private recoveryStrategies: Map<string, RecoveryStrategy> = new Map()
  private errorHistory: ErrorContext[] = []
  private maxHistorySize = 100
  private isInitialized = false

  static getInstance(): ErrorRecoveryService {
    if (!ErrorRecoveryService.instance) {
      ErrorRecoveryService.instance = new ErrorRecoveryService()
    }
    return ErrorRecoveryService.instance
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return

    logger.info('Initializing Error Recovery Service')
    
    // Register default recovery strategies
    this.registerDefaultStrategies()
    
    // Set up event listeners
    this.setupEventListeners()
    
    this.isInitialized = true
    logger.info('Error Recovery Service initialized')
  }

  private registerDefaultStrategies(): void {
    // AI Service Recovery
    this.registerStrategy({
      id: 'ai-service-retry',
      name: 'AI Service Retry',
      description: 'Retry AI service calls with exponential backoff',
      condition: (error, context) => 
        context.component === 'AIService' && (
          error.message.includes('network') || 
          error.message.includes('timeout') ||
          error.message.includes('connection')
        ),
      execute: async (_error, context) => {
        const delay = Math.min(1000 * Math.pow(2, context.retryCount || 0), 10000)
        await new Promise(resolve => setTimeout(resolve, delay))
        return true
      },
      maxRetries: 3
    })

    // Navigation Recovery
    this.registerStrategy({
      id: 'navigation-fallback',
      name: 'Navigation Fallback',
      description: 'Fallback to Google search for failed navigation',
      condition: (error, context) => 
        context.component === 'NavigationAgent' && (
          error.message.includes('navigation') ||
          error.message.includes('network') ||
          error.message.includes('dns')
        ),
      execute: async (_error, context) => {
        try {
          if (window.electronAPI && window.electronAPI.navigateTo) {
            const query = encodeURIComponent(context.url || 'search')
            await window.electronAPI.navigateTo(`https://www.google.com/search?q=${query}`)
            return true
          }
          return false
        } catch (recoveryError) {
          logger.error('Navigation fallback failed', recoveryError as Error)
          return false
        }
      },
      maxRetries: 1
    })

    // Tab Recovery
    this.registerStrategy({
      id: 'tab-recreation',
      name: 'Tab Recreation',
      description: 'Recreate failed tabs',
      condition: (error, context) => 
        context.component === 'TabManager' && (
          error.message.includes('tab') ||
          error.message.includes('browser')
        ),
      execute: async (_error, _context) => {
        try {
          if (window.electronAPI && window.electronAPI.createTab) {
            await window.electronAPI.createTab('https://www.google.com')
            return true
          }
          return false
        } catch (recoveryError) {
          logger.error('Tab recreation failed', recoveryError as Error)
          return false
        }
      },
      maxRetries: 2
    })

    // Electron API Recovery
    this.registerStrategy({
      id: 'electron-api-retry',
      name: 'Electron API Retry',
      description: 'Retry Electron API calls after short delay',
      condition: (error, _context) => 
        error.message.includes('electronAPI') || 
        error.message.includes('IPC') ||
        error.message.includes('not available'),
      execute: async (_error, _context) => {
        // Wait for Electron API to be ready
        await new Promise(resolve => setTimeout(resolve, 500))
        return !!window.electronAPI
      },
      maxRetries: 3
    })
  }

  registerStrategy(strategy: RecoveryStrategy): void {
    this.recoveryStrategies.set(strategy.id, strategy)
    logger.debug('Recovery strategy registered', { strategyId: strategy.id })
  }

  async handleError(error: Error, context: Partial<ErrorContext>): Promise<boolean> {
    const fullContext: ErrorContext = {
      component: context.component || 'Unknown',
      action: context.action || 'Unknown',
      error,
      timestamp: Date.now(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
      url: context.url || (typeof window !== 'undefined' ? window?.location?.href : undefined),
      retryCount: context.retryCount || 0,
      ...context
    }

    // Add to error history
    this.addToHistory(fullContext)

    // Log the error
    logger.error('Error occurred, attempting recovery', error, fullContext)

    // Find applicable recovery strategies
    const applicableStrategies = Array.from(this.recoveryStrategies.values())
      .filter(strategy => {
        try {
          return strategy.condition(error, fullContext)
        } catch (conditionError) {
          logger.warn('Recovery strategy condition check failed', conditionError as Error)
          return false
        }
      })

    for (const strategy of applicableStrategies) {
      if ((fullContext.retryCount || 0) >= strategy.maxRetries) {
        continue
      }

      try {
        logger.info('Attempting recovery strategy', { strategyId: strategy.id })
        const success = await strategy.execute(error, fullContext)
        
        if (success) {
          logger.info('Recovery successful', { strategyId: strategy.id })
          appEvents.emit('error:recovered', { error, recovery: strategy.name })
          return true
        }
      } catch (recoveryError) {
        logger.error('Recovery strategy failed', recoveryError as Error, { strategyId: strategy.id })
      }
    }

    // If no recovery strategy worked
    logger.error('All recovery strategies failed', error)
    appEvents.emit('error:unrecoverable', { error, context: fullContext.component })
    return false
  }

  private addToHistory(context: ErrorContext): void {
    this.errorHistory.push(context)
    
    // Keep history size manageable
    if (this.errorHistory.length > this.maxHistorySize) {
      this.errorHistory = this.errorHistory.slice(-this.maxHistorySize)
    }
  }

  getErrorStatistics(): {
    totalErrors: number
    recentErrors: number
    commonErrors: { [key: string]: number }
    recoveryRate: number
  } {
    const now = Date.now()
    const oneHour = 60 * 60 * 1000
    
    const recentErrors = this.errorHistory.filter(
      error => now - error.timestamp < oneHour
    )

    const commonErrors: { [key: string]: number } = {}
    this.errorHistory.forEach(error => {
      const key = `${error.component}:${error.error.name}`
      commonErrors[key] = (commonErrors[key] || 0) + 1
    })

    // Calculate recovery rate (simplified)
    const recoveredErrors = this.errorHistory.filter(
      error => error.retryCount && error.retryCount > 0
    )

    return {
      totalErrors: this.errorHistory.length,
      recentErrors: recentErrors.length,
      commonErrors,
      recoveryRate: this.errorHistory.length > 0 
        ? recoveredErrors.length / this.errorHistory.length 
        : 0
    }
  }

  private setupEventListeners(): void {
    try {
      // Global error handler
      if (typeof window !== 'undefined') {
        window.addEventListener('error', (event) => {
          this.handleError(event.error || new Error(event.message), {
            component: 'Global',
            action: 'runtime',
            url: event.filename
          })
        })

        // Unhandled promise rejection handler
        window.addEventListener('unhandledrejection', (event) => {
          const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason))
          this.handleError(error, {
            component: 'Promise',
            action: 'rejection'
          })
        })
      }
    } catch (error) {
      logger.warn('Failed to setup global error listeners', error as Error)
    }
  }

  clearHistory(): void {
    this.errorHistory = []
    logger.info('Error history cleared')
  }

  getRecoveryStrategies(): RecoveryStrategy[] {
    return Array.from(this.recoveryStrategies.values())
  }

  removeStrategy(strategyId: string): boolean {
    return this.recoveryStrategies.delete(strategyId)
  }

  // Cleanup method
  cleanup(): void {
    this.errorHistory = []
    // Keep recovery strategies as they might be reused
    logger.info('Error Recovery Service cleaned up')
  }
}

export default ErrorRecoveryService