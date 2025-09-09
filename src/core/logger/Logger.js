// Enhanced Logger System for KAiro Browser
// Provides structured logging with multiple levels and performance monitoring

class Logger {
  constructor(context) {
    this.context = context
    this.logLevel = process.env.NODE_ENV === 'development' ? 'debug' : 'info'
    this.levels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3
    }
  }

  shouldLog(level) {
    return this.levels[level] <= this.levels[this.logLevel]
  }

  formatMessage(level, message, data) {
    const timestamp = new Date().toISOString()
    const contextStr = this.context ? `[${this.context}]` : ''
    const levelStr = level.toUpperCase()
    
    let formattedMessage = `${timestamp} ${levelStr} ${contextStr} ${message}`
    
    if (data) {
      if (data instanceof Error) {
        formattedMessage += ` | Error: ${data.message}`
        if (data.stack && this.shouldLog('debug')) {
          formattedMessage += `\nStack: ${data.stack}`
        }
      } else if (typeof data === 'object') {
        try {
          formattedMessage += ` | Data: ${JSON.stringify(data, null, 2)}`
        } catch (e) {
          formattedMessage += ` | Data: [Object - JSON stringify failed]`
        }
      } else {
        formattedMessage += ` | ${data}`
      }
    }
    
    return formattedMessage
  }

  error(message, error, data) {
    if (this.shouldLog('error')) {
      const formatted = this.formatMessage('error', message, error || data)
      console.error(formatted)
      
      // In production, you might want to send to error tracking service
      if (process.env.NODE_ENV === 'production') {
        this.reportError(message, error, data)
      }
    }
  }

  warn(message, data) {
    if (this.shouldLog('warn')) {
      const formatted = this.formatMessage('warn', message, data)
      console.warn(formatted)
    }
  }

  info(message, data) {
    if (this.shouldLog('info')) {
      const formatted = this.formatMessage('info', message, data)
      console.log(formatted)
    }
  }

  debug(message, data) {
    if (this.shouldLog('debug')) {
      const formatted = this.formatMessage('debug', message, data)
      console.log(formatted)
    }
  }

  reportError(message, error, data) {
    // Placeholder for error reporting service integration
    // Could integrate with services like Sentry, LogRocket, etc.
    try {
      const errorReport = {
        message,
        error: error ? {
          message: error.message,
          stack: error.stack,
          name: error.name
        } : null,
        data,
        context: this.context,
        timestamp: new Date().toISOString(),
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A',
        url: typeof window !== 'undefined' ? window.location.href : 'N/A'
      }
      
      // In a real implementation, send to error tracking service
      console.error('ERROR_REPORT:', errorReport)
    } catch (reportError) {
      console.error('Failed to report error:', reportError)
    }
  }

  performance(label, startTime) {
    if (this.shouldLog('debug')) {
      const duration = Date.now() - startTime
      this.debug(`Performance: ${label} completed in ${duration}ms`)
    }
  }

  startTimer(label) {
    if (this.shouldLog('debug')) {
      const startTime = Date.now()
      return {
        end: () => this.performance(label, startTime)
      }
    }
    return { end: () => {} } // No-op for production
  }
}

// Factory function to create logger instances
function createLogger(context) {
  return new Logger(context)
}

// Export for both CommonJS and ES modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { createLogger, Logger }
} else {
  // ES modules export
  export { createLogger, Logger }
}