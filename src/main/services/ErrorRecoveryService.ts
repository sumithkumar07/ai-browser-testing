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
        context.component === 'AIService' && error.message.includes('network'),
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
        context.component === 'NavigationAgent' && error.message.includes('navigation'),
      execute: async (_error, context) => {
        if (window.electronAPI) {
          const query = encodeURIComponent(context.url || 'search')
          await window.electronAPI.navigateTo(`https://www.google.com/search?q=${query}`)
          return true
        }
        return false
      },
      maxRetries: 1
    })

    // Tab Recovery
    this.registerStrategy({
      id: 'tab-recreation',
      name: 'Tab Recreation',
      description: 'Recreate failed tabs',
      condition: (error, context) => 
        context.component === 'TabManager' && error.message.includes('tab'),
      execute: async (_error, _context) => {
        if (window.electronAPI) {
          await window.electronAPI.createTab('https://www.google.com')
          return true
        }
        return false
      },
      maxRetries: 2
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
      userAgent: navigator.userAgent,
      url: context.url || window?.location?.href,
      retryCount: context.retryCount || 0,
      ...context
    }

    // Add to error history
    this.addToHistory(fullContext)

    // Log the error
    logger.error('Error occurred, attempting recovery', error, fullContext)

    // Find applicable recovery strategies
    const applicableStrategies = Array.from(this.recoveryStrategies.values())
      .filter(strategy => strategy.condition(error, fullContext))

    for (const strategy of applicableStrategies) {
      if ((fullContext.retryCount || 0) >= strategy.maxRetries) {
        continue
      }

      try {
        logger.info('Attempting recovery strategy', { strategyId: strategy.id })
        const success = await strategy.execute(error, fullContext)
        
        if (success) {
          logger.info('Recovery successful', { strategyId: strategy.id })
          appEvents.emit('error:recovered', { strategyId: strategy.id, error, recovery: strategy.name })
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
    // Global error handler
    window.addEventListener('error', (event) => {
      this.handleError(event.error, {
        component: 'Global',
        action: 'runtime',
        url: event.filename
      })
    })

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(new Error(event.reason), {
        component: 'Promise',
        action: 'rejection'
      })
    })
  }

  clearHistory(): void {
    this.errorHistory = []
    logger.info('Error history cleared')
  }
}

export default ErrorRecoveryService