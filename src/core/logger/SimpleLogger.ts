// Simple Logger - Essential logging functionality only
// Replaces complex EnhancedLogger with core features

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3
}

interface LogEntry {
  timestamp: number
  level: LogLevel
  category: string
  message: string
  context?: any
  stack?: string
}

class SimpleLogger {
  private static instances: Map<string, SimpleLogger> = new Map()
  private category: string
  private currentLevel: LogLevel = LogLevel.INFO

  private constructor(category: string) {
    this.category = category
    // Set log level based on environment
    if (process.env.NODE_ENV === 'development') {
      this.currentLevel = LogLevel.DEBUG
    }
  }

  static getInstance(category: string = 'App'): SimpleLogger {
    if (!SimpleLogger.instances.has(category)) {
      SimpleLogger.instances.set(category, new SimpleLogger(category))
    }
    return SimpleLogger.instances.get(category)!
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.currentLevel
  }

  private formatMessage(level: LogLevel, message: string, context?: any): string {
    const timestamp = new Date().toISOString()
    const levelStr = ['ERROR', 'WARN', 'INFO', 'DEBUG'][level]
    let formatted = `[${timestamp}] ${levelStr} [${this.category}] ${message}`
    
    if (context) {
      formatted += ` | Context: ${JSON.stringify(context)}`
    }
    
    return formatted
  }

  error(message: string, error?: Error, context?: any): void {
    if (!this.shouldLog(LogLevel.ERROR)) return
    
    const formatted = this.formatMessage(LogLevel.ERROR, message, context)
    console.error(formatted)
    
    if (error && error.stack) {
      console.error('Stack trace:', error.stack)
    }
  }

  warn(message: string, context?: any): void {
    if (!this.shouldLog(LogLevel.WARN)) return
    
    const formatted = this.formatMessage(LogLevel.WARN, message, context)
    console.warn(formatted)
  }

  info(message: string, context?: any): void {
    if (!this.shouldLog(LogLevel.INFO)) return
    
    const formatted = this.formatMessage(LogLevel.INFO, message, context)
    console.info(formatted)
  }

  debug(message: string, context?: any): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return
    
    const formatted = this.formatMessage(LogLevel.DEBUG, message, context)
    console.debug(formatted)
  }

  setLevel(level: LogLevel): void {
    this.currentLevel = level
  }

  getLevel(): LogLevel {
    return this.currentLevel
  }
}

export function createLogger(category: string): SimpleLogger {
  return SimpleLogger.getInstance(category)
}

export { SimpleLogger }
export default SimpleLogger