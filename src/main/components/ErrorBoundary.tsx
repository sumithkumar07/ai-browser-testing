/**
 * FIXED: Enhanced Error Boundary Component
 * Provides comprehensive error handling and recovery
 */

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { createLogger } from '../../core/logger/Logger'

const logger = createLogger('ErrorBoundary')

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  errorId: string | null
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errorId = this.state.errorId || `error_${Date.now()}`
    
    logger.error('Error caught by boundary', error, {
      errorId,
      errorInfo,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href
    })

    this.setState({
      errorInfo
    })

    // Call optional error handler
    this.props.onError?.(error, errorInfo)

    // Report to error tracking service if available
    this.reportError(error, errorInfo, errorId)
  }

  private reportError(error: Error, errorInfo: ErrorInfo, errorId: string) {
    try {
      // Check if Electron API is available for error reporting
      if (window.electronAPI?.sendAIMessage) {
        const errorReport = {
          errorId,
          message: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          timestamp: Date.now(),
          userAgent: navigator.userAgent,
          url: window.location.href
        }
        
        // Could send to backend for error analytics
        console.warn('Error report generated:', errorReport)
      }
    } catch (reportError) {
      logger.error('Failed to report error', reportError as Error)
    }
  }

  private handleReload = () => {
    window.location.reload()
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    })
  }

  private handleReportIssue = () => {
    const errorDetails = {
      error: this.state.error?.message,
      stack: this.state.error?.stack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    }
    
    const subject = encodeURIComponent('KAiro Browser Error Report')
    const body = encodeURIComponent(`Error Details:\n${JSON.stringify(errorDetails, null, 2)}`)
    const mailtoUrl = `mailto:support@kairo.com?subject=${subject}&body=${body}`
    
    window.open(mailtoUrl)
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="error-boundary">
          <div className="error-boundary-content">
            <h2>🚫 Something went wrong</h2>
            <p>
              The application encountered an unexpected error. Don't worry, your data is safe.
            </p>
            
            <details className="error-details">
              <summary>Technical Details (Click to expand)</summary>
              <div className="error-stack">
                <strong>Error:</strong> {this.state.error?.message}
                <br />
                <strong>Error ID:</strong> {this.state.errorId}
                <br />
                <strong>Stack Trace:</strong>
                <pre>{this.state.error?.stack}</pre>
                {this.state.errorInfo && (
                  <>
                    <strong>Component Stack:</strong>
                    <pre>{this.state.errorInfo.componentStack}</pre>
                  </>
                )}
              </div>
            </details>

            <div className="error-actions">
              <button 
                className="btn btn-primary" 
                onClick={this.handleReset}
                title="Try to recover without reloading"
              >
                🔄 Try Again
              </button>
              <button 
                className="btn btn-secondary" 
                onClick={this.handleReload}
                title="Reload the entire application"
              >
                🔃 Reload App
              </button>
              <button 
                className="btn btn-secondary" 
                onClick={this.handleReportIssue}
                title="Report this issue to developers"
              >
                📧 Report Issue
              </button>
            </div>

            <div className="error-fallback">
              <p>
                <strong>Quick Recovery Tips:</strong>
              </p>
              <ul>
                <li>Try clicking "Try Again" first</li>
                <li>If that doesn't work, try "Reload App"</li>
                <li>Check your internet connection</li>
                <li>Clear browser cache if issues persist</li>
              </ul>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary