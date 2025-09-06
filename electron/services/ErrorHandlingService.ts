// electron/services/ErrorHandlingService.ts
import { app, dialog, BrowserWindow } from 'electron'
import { writeFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'

export interface ErrorInfo {
  id: string
  timestamp: number
  level: 'error' | 'warning' | 'info'
  message: string
  stack?: string
  context?: string
  userId?: string
  sessionId?: string
  url?: string
  userAgent?: string
  resolved: boolean
}

export interface ErrorReport {
  errors: ErrorInfo[]
  summary: {
    totalErrors: number
    criticalErrors: number
    warnings: number
    resolvedErrors: number
    unresolvedErrors: number
  }
  generatedAt: number
}

export class ErrorHandlingService {
  private static instance: ErrorHandlingService
  private errors: ErrorInfo[] = []
  private isInitialized: boolean = false
  private logDirectory: string
  private maxErrors: number = 1000

  private constructor() {
    this.logDirectory = join(app.getPath('userData'), 'logs')
    this.ensureLogDirectory()
  }

  static getInstance(): ErrorHandlingService {
    if (!ErrorHandlingService.instance) {
      ErrorHandlingService.instance = new ErrorHandlingService()
    }
    return ErrorHandlingService.instance
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('⚠️ Error Handling Service already initialized')
      return
    }

    console.log('🛡️ Initializing Error Handling Service...')
    
    try {
      // Setup global error handlers
      this.setupGlobalErrorHandlers()
      
      // Load existing errors
      await this.loadErrors()
      
      this.isInitialized = true
      console.log('✅ Error Handling Service initialized')
    } catch (error) {
      console.error('❌ Error Handling Service initialization failed:', error)
      throw error
    }
  }

  private ensureLogDirectory(): void {
    if (!existsSync(this.logDirectory)) {
      mkdirSync(this.logDirectory, { recursive: true })
    }
  }

  private setupGlobalErrorHandlers(): void {
    // Handle uncaught exceptions
    process.on('uncaughtException', (error: Error) => {
      this.logError('uncaughtException', error.message, error.stack, 'process')
    })

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
      this.logError('unhandledRejection', String(reason), undefined, 'process')
    })

    // Handle Electron main process errors
    app.on('render-process-gone', (event, webContents, details) => {
      this.logError('render-process-gone', `Render process crashed: ${details.reason}`, undefined, 'electron')
    })

    app.on('child-process-gone', (event, details) => {
      this.logError('child-process-gone', `Child process exited: ${details.reason}`, undefined, 'electron')
    })
  }

  logError(
    message: string, 
    stack?: string, 
    context?: string, 
    level: 'error' | 'warning' | 'info' = 'error'
  ): void {
    const errorInfo: ErrorInfo = {
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      level,
      message,
      stack,
      context,
      resolved: false
    }

    this.errors.push(errorInfo)

    // Keep only the most recent errors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors)
    }

    // Log to console
    console.error(`[${level.toUpperCase()}] ${message}`, stack ? `\n${stack}` : '')

    // Save to file
    this.saveErrorsToFile()

    // Show user notification for critical errors
    if (level === 'error') {
      this.showErrorNotification(errorInfo)
    }
  }

  logWarning(message: string, context?: string): void {
    this.logError(message, undefined, context, 'warning')
  }

  logInfo(message: string, context?: string): void {
    this.logError(message, undefined, context, 'info')
  }

  private showErrorNotification(error: ErrorInfo): void {
    // Show error dialog for critical errors
    const mainWindow = BrowserWindow.getFocusedWindow()
    if (mainWindow) {
      dialog.showErrorBox(
        'Application Error',
        `An error occurred: ${error.message}\n\nThis error has been logged for debugging purposes.`
      )
    }
  }

  async loadErrors(): Promise<void> {
    try {
      const logFile = join(this.logDirectory, 'errors.json')
      if (existsSync(logFile)) {
        const data = require(logFile)
        this.errors = data.errors || []
      }
    } catch (error) {
      console.error('Failed to load errors:', error)
      this.errors = []
    }
  }

  private saveErrorsToFile(): void {
    try {
      const logFile = join(this.logDirectory, 'errors.json')
      const data = {
        errors: this.errors,
        lastUpdated: Date.now()
      }
      writeFileSync(logFile, JSON.stringify(data, null, 2))
    } catch (error) {
      console.error('Failed to save errors:', error)
    }
  }

  getErrors(filter?: {
    level?: 'error' | 'warning' | 'info'
    resolved?: boolean
    context?: string
    since?: number
  }): ErrorInfo[] {
    let filteredErrors = [...this.errors]

    if (filter) {
      if (filter.level) {
        filteredErrors = filteredErrors.filter(error => error.level === filter.level)
      }
      if (filter.resolved !== undefined) {
        filteredErrors = filteredErrors.filter(error => error.resolved === filter.resolved)
      }
      if (filter.context) {
        filteredErrors = filteredErrors.filter(error => error.context === filter.context)
      }
      if (filter.since) {
        filteredErrors = filteredErrors.filter(error => error.timestamp >= filter.since!)
      }
    }

    return filteredErrors.sort((a, b) => b.timestamp - a.timestamp)
  }

  markErrorResolved(errorId: string): boolean {
    const error = this.errors.find(e => e.id === errorId)
    if (error) {
      error.resolved = true
      this.saveErrorsToFile()
      return true
    }
    return false
  }

  markAllErrorsResolved(): number {
    let count = 0
    this.errors.forEach(error => {
      if (!error.resolved) {
        error.resolved = true
        count++
      }
    })
    this.saveErrorsToFile()
    return count
  }

  clearResolvedErrors(): number {
    const initialCount = this.errors.length
    this.errors = this.errors.filter(error => !error.resolved)
    const clearedCount = initialCount - this.errors.length
    this.saveErrorsToFile()
    return clearedCount
  }

  clearAllErrors(): void {
    this.errors = []
    this.saveErrorsToFile()
  }

  generateErrorReport(): ErrorReport {
    const totalErrors = this.errors.length
    const criticalErrors = this.errors.filter(e => e.level === 'error').length
    const warnings = this.errors.filter(e => e.level === 'warning').length
    const resolvedErrors = this.errors.filter(e => e.resolved).length
    const unresolvedErrors = totalErrors - resolvedErrors

    return {
      errors: [...this.errors],
      summary: {
        totalErrors,
        criticalErrors,
        warnings,
        resolvedErrors,
        unresolvedErrors
      },
      generatedAt: Date.now()
    }
  }

  exportErrorReport(): string {
    const report = this.generateErrorReport()
    const reportFile = join(this.logDirectory, `error-report-${Date.now()}.json`)
    writeFileSync(reportFile, JSON.stringify(report, null, 2))
    return reportFile
  }

  getErrorStats(): {
    total: number
    byLevel: Record<string, number>
    byContext: Record<string, number>
    resolved: number
    unresolved: number
  } {
    const stats = {
      total: this.errors.length,
      byLevel: {} as Record<string, number>,
      byContext: {} as Record<string, number>,
      resolved: 0,
      unresolved: 0
    }

    this.errors.forEach(error => {
      // Count by level
      stats.byLevel[error.level] = (stats.byLevel[error.level] || 0) + 1
      
      // Count by context
      const context = error.context || 'unknown'
      stats.byContext[context] = (stats.byContext[context] || 0) + 1
      
      // Count resolved/unresolved
      if (error.resolved) {
        stats.resolved++
      } else {
        stats.unresolved++
      }
    })

    return stats
  }

  // Public utility methods
  isReady(): boolean {
    return this.isInitialized
  }

  getLogDirectory(): string {
    return this.logDirectory
  }

  cleanup(): void {
    console.log('🧹 Cleaning up Error Handling Service...')
    
    // Save final error log
    this.saveErrorsToFile()
    
    this.isInitialized = false
    console.log('✅ Error Handling Service cleanup complete')
  }
}

export default ErrorHandlingService
