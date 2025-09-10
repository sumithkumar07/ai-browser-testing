// Enhanced Structured Logging System
// Comprehensive logging with levels, persistence, and analytics

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3
}

export interface LogEntry {
  level: LogLevel
  timestamp: number
  message: string
  context?: Record<string, any>
  stack?: string
  category?: string
  userId?: string
  sessionId?: string
}

export interface LoggerConfig {
  level: LogLevel
  enableConsole: boolean
  enablePersistence: boolean
  maxLogEntries: number
  flushInterval: number
}

export class EnhancedLogger {
  private static instance: EnhancedLogger
  private config: LoggerConfig
  private logBuffer: LogEntry[] = []
  private flushTimer?: ReturnType<typeof setInterval>

  private constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      level: LogLevel.INFO,
      enableConsole: true,
      enablePersistence: true,
      maxLogEntries: 1000,
      flushInterval: 30000, // 30 seconds
      ...config
    }

    this.startPeriodicFlush()
  }

  static getInstance(config?: Partial<LoggerConfig>): EnhancedLogger {
    if (!EnhancedLogger.instance) {
      EnhancedLogger.instance = new EnhancedLogger(config)
    }
    return EnhancedLogger.instance
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.config.level
  }

  private createLogEntry(level: LogLevel, message: string, context?: Record<string, any>, stack?: string): LogEntry {
    return {
      level,
      timestamp: Date.now(),
      message,
      context,
      stack,
      category: context?.category || 'general',
      userId: context?.userId,
      sessionId: this.getSessionId()
    }
  }

  private getSessionId(): string {
    // Get or create session ID
    if (typeof window !== 'undefined') {
      let sessionId = sessionStorage.getItem('kairo_session_id')
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        sessionStorage.setItem('kairo_session_id', sessionId)
      }
      return sessionId
    }
    return 'server_session'
  }

  private formatLogMessage(entry: LogEntry): string {
    const timestamp = new Date(entry.timestamp).toISOString()
    const level = LogLevel[entry.level]
    const context = entry.context ? JSON.stringify(entry.context) : ''
    
    return `[${timestamp}] [${level}] [${entry.category}] ${entry.message} ${context}`
  }

  private logToConsole(entry: LogEntry): void {
    if (!this.config.enableConsole) return

    const formattedMessage = this.formatLogMessage(entry)
    
    switch (entry.level) {
      case LogLevel.ERROR:
        console.error(formattedMessage, entry.stack)
        break
      case LogLevel.WARN:
        console.warn(formattedMessage)
        break
      case LogLevel.INFO:
        console.info(formattedMessage)
        break
      case LogLevel.DEBUG:
        console.debug(formattedMessage)
        break
      default:
        console.log(formattedMessage)
    }
  }

  private addToBuffer(entry: LogEntry): void {
    this.logBuffer.push(entry)
    
    // Trim buffer if it exceeds max size
    if (this.logBuffer.length > this.config.maxLogEntries) {
      this.logBuffer = this.logBuffer.slice(-this.config.maxLogEntries)
    }
  }

  private startPeriodicFlush(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer)
    }

    this.flushTimer = setInterval(() => {
      this.flush()
    }, this.config.flushInterval)
  }

  private async persistLogs(entries: LogEntry[]): Promise<void> {
    if (!this.config.enablePersistence || entries.length === 0) return

    try {
      // Store in localStorage for now (could be enhanced to use IndexedDB)
      if (typeof window !== 'undefined') {
        const existingLogs = JSON.parse(localStorage.getItem('kairo_logs') || '[]')
        const allLogs = [...existingLogs, ...entries]
        
        // Keep only last 5000 log entries
        const trimmedLogs = allLogs.slice(-5000)
        localStorage.setItem('kairo_logs', JSON.stringify(trimmedLogs))
      }
    } catch (error) {
      console.error('Failed to persist logs:', error)
    }
  }

  // Public logging methods
  error(message: string, error?: Error, context?: Record<string, any>): void {
    if (!this.shouldLog(LogLevel.ERROR)) return

    const stack = error?.stack || new Error().stack
    const entry = this.createLogEntry(LogLevel.ERROR, message, {
      ...context,
      error: error?.message,
      name: error?.name
    }, stack)

    this.logToConsole(entry)
    this.addToBuffer(entry)
  }

  warn(message: string, context?: Record<string, any>): void {
    if (!this.shouldLog(LogLevel.WARN)) return

    const entry = this.createLogEntry(LogLevel.WARN, message, context)
    this.logToConsole(entry)
    this.addToBuffer(entry)
  }

  info(message: string, context?: Record<string, any>): void {
    if (!this.shouldLog(LogLevel.INFO)) return

    const entry = this.createLogEntry(LogLevel.INFO, message, context)
    this.logToConsole(entry)
    this.addToBuffer(entry)
  }

  debug(message: string, context?: Record<string, any>): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return

    const entry = this.createLogEntry(LogLevel.DEBUG, message, context)
    this.logToConsole(entry)
    this.addToBuffer(entry)
  }

  // Performance logging
  time(label: string): void {
    this.debug(`Timer started: ${label}`, { timerStart: true, label })
  }

  timeEnd(label: string): void {
    this.debug(`Timer ended: ${label}`, { timerEnd: true, label })
  }

  // Metrics logging
  metric(name: string, value: number, unit?: string, context?: Record<string, any>): void {
    this.info(`Metric: ${name}`, {
      ...context,
      metric: true,
      name,
      value,
      unit: unit || 'count'
    })
  }

  // User action logging
  userAction(action: string, context?: Record<string, any>): void {
    this.info(`User action: ${action}`, {
      ...context,
      userAction: true,
      action
    })
  }

  // API call logging
  apiCall(method: string, url: string, status: number, duration: number, context?: Record<string, any>): void {
    const level = status >= 400 ? LogLevel.ERROR : LogLevel.INFO
    const message = `API call: ${method} ${url} - ${status} (${duration}ms)`
    
    const entry = this.createLogEntry(level, message, {
      ...context,
      apiCall: true,
      method,
      url,
      status,
      duration
    })

    this.logToConsole(entry)
    this.addToBuffer(entry)
  }

  // Utility methods
  flush(): void {
    if (this.logBuffer.length > 0) {
      const logsToFlush = [...this.logBuffer]
      this.logBuffer = []
      this.persistLogs(logsToFlush)
    }
  }

  async getLogs(options: {
    level?: LogLevel
    category?: string
    limit?: number
    since?: number
  } = {}): Promise<LogEntry[]> {
    try {
      if (typeof window === 'undefined') return []

      const allLogs: LogEntry[] = JSON.parse(localStorage.getItem('kairo_logs') || '[]')
      let filteredLogs = allLogs

      // Filter by level
      if (options.level !== undefined) {
        filteredLogs = filteredLogs.filter(log => log.level <= options.level!)
      }

      // Filter by category
      if (options.category) {
        filteredLogs = filteredLogs.filter(log => log.category === options.category)
      }

      // Filter by timestamp
      if (options.since) {
        filteredLogs = filteredLogs.filter(log => log.timestamp >= options.since!)
      }

      // Limit results
      if (options.limit) {
        filteredLogs = filteredLogs.slice(-options.limit)
      }

      return filteredLogs
    } catch (error) {
      console.error('Failed to retrieve logs:', error)
      return []
    }
  }

  clearLogs(): void {
    this.logBuffer = []
    if (typeof window !== 'undefined') {
      localStorage.removeItem('kairo_logs')
    }
  }

  // Configuration methods
  setLevel(level: LogLevel): void {
    this.config.level = level
  }

  getConfig(): LoggerConfig {
    return { ...this.config }
  }

  // Cleanup
  shutdown(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer)
      this.flushTimer = undefined
    }
    this.flush()
  }
}

// Convenience function to create category-specific loggers
export function createLogger(category: string, config?: Partial<LoggerConfig>): EnhancedLogger {
  const logger = EnhancedLogger.getInstance(config)
  
  // Return a wrapper that automatically adds category context
  return {
    error: (message: string, error?: Error, context?: Record<string, any>) =>
      logger.error(message, error, { ...context, category }),
    warn: (message: string, context?: Record<string, any>) =>
      logger.warn(message, { ...context, category }),
    info: (message: string, context?: Record<string, any>) =>
      logger.info(message, { ...context, category }),
    debug: (message: string, context?: Record<string, any>) =>
      logger.debug(message, { ...context, category }),
    time: (label: string) => logger.time(`${category}:${label}`),
    timeEnd: (label: string) => logger.timeEnd(`${category}:${label}`),
    metric: (name: string, value: number, unit?: string, context?: Record<string, any>) =>
      logger.metric(`${category}:${name}`, value, unit, { ...context, category }),
    userAction: (action: string, context?: Record<string, any>) =>
      logger.userAction(action, { ...context, category }),
    apiCall: (method: string, url: string, status: number, duration: number, context?: Record<string, any>) =>
      logger.apiCall(method, url, status, duration, { ...context, category })
  } as any
}

// Export default instance
export const logger = EnhancedLogger.getInstance()