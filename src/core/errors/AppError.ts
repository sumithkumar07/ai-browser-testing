/**
 * Enhanced Application Error System
 * Provides comprehensive error handling and classification
 */

export enum ErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  API_ERROR = 'API_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  PERMISSION_ERROR = 'PERMISSION_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface ErrorContext {
  userId?: string
  sessionId?: string
  timestamp: number
  userAgent?: string
  url?: string
  action?: string
  additionalData?: Record<string, any>
}

export class AppError extends Error {
  public readonly type: ErrorType
  public readonly severity: ErrorSeverity
  public readonly context: ErrorContext
  public readonly isRetryable: boolean
  public readonly userMessage: string
  public readonly errorCode?: string

  constructor(
    message: string,
    type: ErrorType = ErrorType.UNKNOWN_ERROR,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    context: Partial<ErrorContext> = {},
    isRetryable = false,
    userMessage?: string,
    errorCode?: string
  ) {
    super(message)
    
    this.name = 'AppError'
    this.type = type
    this.severity = severity
    this.context = {
      timestamp: Date.now(),
      ...context
    }
    this.isRetryable = isRetryable
    this.userMessage = userMessage || this.getDefaultUserMessage()
    this.errorCode = errorCode

    // Maintains proper stack trace for where error was thrown (V8 only)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError)
    }
  }

  private getDefaultUserMessage(): string {
    switch (this.type) {
      case ErrorType.NETWORK_ERROR:
        return 'Connection problem. Please check your internet connection and try again.'
      case ErrorType.API_ERROR:
        return 'Service temporarily unavailable. Please try again in a moment.'
      case ErrorType.VALIDATION_ERROR:
        return 'Please check your input and try again.'
      case ErrorType.AUTHENTICATION_ERROR:
        return 'Authentication required. Please log in and try again.'
      case ErrorType.PERMISSION_ERROR:
        return 'You don\'t have permission to perform this action.'
      case ErrorType.NOT_FOUND_ERROR:
        return 'The requested resource was not found.'
      case ErrorType.RATE_LIMIT_ERROR:
        return 'Too many requests. Please wait a moment and try again.'
      case ErrorType.TIMEOUT_ERROR:
        return 'Request timed out. Please try again.'
      default:
        return 'An unexpected error occurred. Please try again.'
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      type: this.type,
      severity: this.severity,
      context: this.context,
      isRetryable: this.isRetryable,
      userMessage: this.userMessage,
      errorCode: this.errorCode,
      stack: this.stack
    }
  }

  static fromError(error: Error, type?: ErrorType, context?: Partial<ErrorContext>): AppError {
    if (error instanceof AppError) {
      return error
    }

    // Try to determine error type from error message/properties
    let detectedType = type || ErrorType.UNKNOWN_ERROR
    let isRetryable = false
    let severity = ErrorSeverity.MEDIUM

    if (error.message.includes('network') || error.message.includes('fetch')) {
      detectedType = ErrorType.NETWORK_ERROR
      isRetryable = true
      severity = ErrorSeverity.HIGH
    } else if (error.message.includes('timeout')) {
      detectedType = ErrorType.TIMEOUT_ERROR
      isRetryable = true
      severity = ErrorSeverity.MEDIUM
    } else if (error.message.includes('404') || error.message.includes('not found')) {
      detectedType = ErrorType.NOT_FOUND_ERROR
      isRetryable = false
      severity = ErrorSeverity.LOW
    } else if (error.message.includes('401') || error.message.includes('unauthorized')) {
      detectedType = ErrorType.AUTHENTICATION_ERROR
      isRetryable = false
      severity = ErrorSeverity.HIGH
    } else if (error.message.includes('403') || error.message.includes('forbidden')) {
      detectedType = ErrorType.PERMISSION_ERROR
      isRetryable = false
      severity = ErrorSeverity.HIGH
    } else if (error.message.includes('429') || error.message.includes('rate limit')) {
      detectedType = ErrorType.RATE_LIMIT_ERROR
      isRetryable = true
      severity = ErrorSeverity.MEDIUM
    }

    return new AppError(
      error.message,
      detectedType,
      severity,
      context,
      isRetryable
    )
  }
}

export default AppError