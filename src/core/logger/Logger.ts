/**
 * Centralized Logging System
 * Provides consistent logging across the application
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

export interface LogEntry {
  timestamp: number
  level: LogLevel
  category: string
  message: string
  data?: any
  stack?: string
}

class Logger {
  private static instance: Logger
  private logLevel: LogLevel = LogLevel.INFO
  private listeners: ((entry: LogEntry) => void)[] = []

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  setLevel(level: LogLevel): void {
    this.logLevel = level
  }

  addListener(listener: (entry: LogEntry) => void): void {
    this.listeners.push(listener)
  }

  removeListener(listener: (entry: LogEntry) => void): void {
    const index = this.listeners.indexOf(listener)
    if (index > -1) {
      this.listeners.splice(index, 1)
    }
  }

  private log(level: LogLevel, category: string, message: string, data?: any, error?: Error): void {
    if (level < this.logLevel) return

    const entry: LogEntry = {
      timestamp: Date.now(),
      level,
      category,
      message,
      data,
      stack: error?.stack
    }

    // Console output
    const levelName = LogLevel[level]
    const timestamp = new Date(entry.timestamp).toISOString()
    const prefix = `[${timestamp}] [${levelName}] [${category}]`
    
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(prefix, message, data)
        break
      case LogLevel.INFO:
        console.info(prefix, message, data)
        break
      case LogLevel.WARN:
        console.warn(prefix, message, data)
        break
      case LogLevel.ERROR:
        console.error(prefix, message, data, error)
        break
    }

    // Notify listeners
    this.listeners.forEach(listener => {
      try {
        listener(entry)
      } catch (err) {
        console.error('Logger listener error:', err)
      }
    })
  }

  debug(category: string, message: string, data?: any): void {
    this.log(LogLevel.DEBUG, category, message, data)
  }

  info(category: string, message: string, data?: any): void {
    this.log(LogLevel.INFO, category, message, data)
  }

  warn(category: string, message: string, data?: any): void {
    this.log(LogLevel.WARN, category, message, data)
  }

  error(category: string, message: string, error?: Error, data?: any): void {
    this.log(LogLevel.ERROR, category, message, data, error)
  }
}

// Category-specific loggers
export const createLogger = (category: string) => {
  const logger = Logger.getInstance()
  return {
    debug: (message: string, data?: any) => logger.debug(category, message, data),
    info: (message: string, data?: any) => logger.info(category, message, data),
    warn: (message: string, data?: any) => logger.warn(category, message, data),
    error: (message: string, error?: Error, data?: any) => logger.error(category, message, error, data)
  }
}

export default Logger