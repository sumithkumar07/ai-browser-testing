/**
 * Enhanced Logger - Creating missing logger that was referenced
 * Advanced logging system with structured output and categorization
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  timestamp: number
  level: LogLevel
  component: string
  message: string
  data?: any
  context?: Record<string, any>
}

class EnhancedLogger {
  private component: string
  private logs: LogEntry[] = []
  private maxLogs: number = 1000

  constructor(component: string) {
    this.component = component
  }

  private log(level: LogLevel, message: string, data?: any, context?: Record<string, any>) {
    const entry: LogEntry = {
      timestamp: Date.now(),
      level,
      component: this.component,
      message,
      data,
      context
    }

    this.logs.push(entry)

    // Keep logs manageable
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs)
    }

    // Output to console with formatting
    const timestamp = new Date(entry.timestamp).toISOString()
    const prefix = `[${timestamp}] [${level.toUpperCase()}] [${this.component}]`
    
    switch (level) {
      case 'error':
        console.error(`${prefix} ${message}`, data || '')
        break
      case 'warn':
        console.warn(`${prefix} ${message}`, data || '')
        break
      case 'info':
        console.info(`${prefix} ${message}`, data || '')
        break
      case 'debug':
        console.debug(`${prefix} ${message}`, data || '')
        break
    }
  }

  debug(message: string, data?: any, context?: Record<string, any>) {
    this.log('debug', message, data, context)
  }

  info(message: string, data?: any, context?: Record<string, any>) {
    this.log('info', message, data, context)
  }

  warn(message: string, data?: any, context?: Record<string, any>) {
    this.log('warn', message, data, context)
  }

  error(message: string, error?: Error | any, context?: Record<string, any>) {
    this.log('error', message, error, context)
  }

  getLogs(level?: LogEntry['level'], limit: number = 100): LogEntry[] {
    let filteredLogs = this.logs
    
    if (level) {
      filteredLogs = this.logs.filter(log => log.level === level)
    }
    
    return filteredLogs.slice(-limit)
  }

  clearLogs() {
    this.logs = []
  }
}

// Factory function
export function createLogger(component: string): EnhancedLogger {
  return new EnhancedLogger(component)
}

export { EnhancedLogger }
export default EnhancedLogger