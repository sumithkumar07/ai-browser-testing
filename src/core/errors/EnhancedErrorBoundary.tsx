/**
 * Enhanced Error Boundary with Advanced Recovery
 * Provides comprehensive error handling with graceful degradation
 */

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { createLogger } from '../logger/Logger'
import { appEvents } from '../utils/EventEmitter'
import ErrorRecoveryService from '../../main/services/ErrorRecoveryService'

const logger = createLogger('EnhancedErrorBoundary')

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  isolationLevel?: 'component' | 'feature' | 'page'
  recoveryStrategies?: string[]
  maxRetries?: number
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  retryCount: number
  isRecovering: boolean
  lastRecoveryAttempt: number
}

export class EnhancedErrorBoundary extends Component<Props, State> {
  private recoveryService: ErrorRecoveryService
  private retryTimeout: NodeJS.Timeout | null = null

  constructor(props: Props) {
    super(props)
    
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      isRecovering: false,
      lastRecoveryAttempt: 0
    }

    this.recoveryService = ErrorRecoveryService.getInstance()
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('Component error caught by boundary', error, { errorInfo })
    
    this.setState({
      errorInfo,
      lastRecoveryAttempt: Date.now()
    })

    // Notify error recovery service
    this.handleErrorRecovery(error, errorInfo)
    
    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo)
    
    // Emit error event for global handling
    appEvents.emit('error:boundary-caught', { 
      error, 
      errorInfo, 
      isolationLevel: this.props.isolationLevel || 'component'
    })
  }

  private async handleErrorRecovery(error: Error, errorInfo: ErrorInfo) {
    const { maxRetries = 3 } = this.props
    
    if (this.state.retryCount >= maxRetries) {
      logger.error('Max retry attempts reached', { error, retryCount: this.state.retryCount })
      return
    }

    try {
      this.setState({ isRecovering: true })
      
      // Attempt automatic recovery
      const recovered = await this.recoveryService.handleError(error, {
        component: 'ErrorBoundary',
        action: 'component-recovery',
        retryCount: this.state.retryCount
      })

      if (recovered) {
        logger.info('Automatic recovery successful')
        this.handleRetry()
      } else {
        logger.warn('Automatic recovery failed, manual intervention may be needed')
        this.setState({ isRecovering: false })
      }
    } catch (recoveryError) {
      logger.error('Error during recovery attempt', recoveryError as Error)
      this.setState({ isRecovering: false })
    }
  }

  private handleRetry = () => {
    const { retryCount } = this.state
    const backoffDelay = Math.min(1000 * Math.pow(2, retryCount), 10000) // Max 10s

    logger.info('Scheduling component retry', { retryCount, delay: backoffDelay })

    this.retryTimeout = setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: retryCount + 1,
        isRecovering: false
      })
    }, backoffDelay)
  }

  private handleManualRetry = () => {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout)
    }
    this.handleRetry()
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      isRecovering: false,
      lastRecoveryAttempt: 0
    })
  }

  componentWillUnmount() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout)
    }
  }

  render() {
    const { hasError, error, isRecovering, retryCount } = this.state
    const { children, fallback, maxRetries = 3, isolationLevel = 'component' } = this.props

    if (hasError && error) {
      // Custom fallback UI
      if (fallback) {
        return fallback
      }

      // Default enhanced error UI based on isolation level
      return (
        <div className={`error-boundary error-boundary--${isolationLevel}`}>
          <div className="error-boundary__content">
            <div className="error-boundary__icon">
              {isolationLevel === 'page' ? '📄' : isolationLevel === 'feature' ? '⚙️' : '🧩'}
            </div>
            
            <h3 className="error-boundary__title">
              {isolationLevel === 'page' ? 'Page Error' : 
               isolationLevel === 'feature' ? 'Feature Unavailable' : 
               'Component Error'}
            </h3>
            
            <p className="error-boundary__message">
              {isRecovering ? (
                <>⏳ Attempting automatic recovery...</>
              ) : retryCount >= maxRetries ? (
                <>❌ This {isolationLevel} is temporarily unavailable. The rest of the application continues to work normally.</>
              ) : (
                <>⚠️ A temporary error occurred. We're working to fix it automatically.</>
              )}
            </p>

            {error.message && (
              <details className="error-boundary__details">
                <summary>Technical Details</summary>
                <div className="error-boundary__stack">
                  <strong>Error:</strong> {error.message}
                  <br />
                  <strong>Type:</strong> {error.name}
                  <br />
                  <strong>Retry Count:</strong> {retryCount}/{maxRetries}
                </div>
              </details>
            )}

            <div className="error-boundary__actions">
              {!isRecovering && retryCount < maxRetries && (
                <button 
                  className="error-boundary__button error-boundary__button--primary"
                  onClick={this.handleManualRetry}
                >
                  🔄 Try Again
                </button>
              )}
              
              <button 
                className="error-boundary__button error-boundary__button--secondary"
                onClick={this.handleReset}
              >
                🏠 Reset Component
              </button>
              
              <button 
                className="error-boundary__button error-boundary__button--secondary"
                onClick={() => window.location.reload()}
              >
                ↻ Reload Page
              </button>
            </div>

            {isolationLevel !== 'page' && (
              <div className="error-boundary__reassurance">
                💡 The rest of KAiro Browser continues to work normally
              </div>
            )}
          </div>
        </div>
      )
    }

    return children
  }
}

export default EnhancedErrorBoundary