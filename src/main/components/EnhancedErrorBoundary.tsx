// Enhanced Error Boundary - Production Ready
// Provides comprehensive error handling and recovery for React components

import { Component, ReactNode, ErrorInfo } from 'react'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  errorId: string
  retryCount: number
}

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  maxRetries?: number
  resetKeys?: Array<string | number>
  resetOnPropsChange?: boolean
}

class EnhancedErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private resetTimeoutId: number | null = null

  constructor(props: ErrorBoundaryProps) {
    super(props)
    
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      retryCount: 0
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Generate unique error ID for tracking
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    console.error('🚨 Error Boundary caught error:', error)
    
    return {
      hasError: true,
      error,
      errorId
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError } = this.props
    
    this.setState({
      errorInfo
    })

    // Log error with enhanced context
    this.logError(error, errorInfo)
    
    // Notify parent component
    if (onError) {
      onError(error, errorInfo)
    }

    // Send error to monitoring service if available
    this.reportError(error, errorInfo)
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetKeys, resetOnPropsChange } = this.props
    const { hasError } = this.state
    
    if (hasError && prevProps.resetKeys !== resetKeys) {
      if (resetKeys && resetKeys.length > 0) {
        this.resetErrorBoundary()
      }
    }
    
    if (hasError && resetOnPropsChange && prevProps.children !== this.props.children) {
      this.resetErrorBoundary()
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId)
    }
  }

  logError = (error: Error, errorInfo: ErrorInfo) => {
    const { errorId } = this.state
    
    console.group(`🚨 Enhanced Error Boundary [${errorId}]`)
    console.error('Error:', error)
    console.error('Error Info:', errorInfo)
    console.error('Stack:', error.stack)
    console.error('Component Stack:', errorInfo.componentStack)
    console.error('Error Boundary Props:', this.props)
    console.error('Error Boundary State:', this.state)
    console.groupEnd()
  }

  reportError = async (error: Error, errorInfo: ErrorInfo) => {
    try {
      // Log error details
      console.error('Error Boundary caught error:', {
        errorId: this.state.errorId,
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        userSettings: {
          language: navigator.language,
          platform: navigator.platform
        }
      })
    } catch (reportError) {
      console.warn('⚠️ Failed to report error to main process:', reportError)
    }
  }

  resetErrorBoundary = () => {
    const { retryCount } = this.state
    const { maxRetries = 3 } = this.props
    
    if (retryCount >= maxRetries) {
      console.warn(`⚠️ Max retries (${maxRetries}) reached for error boundary`)
      return
    }
    
    console.log(`🔄 Resetting error boundary (attempt ${retryCount + 1}/${maxRetries})`)
    
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      retryCount: retryCount + 1
    })
  }

  handleRetry = () => {
    this.resetErrorBoundary()
  }

  handleReload = () => {
    window.location.reload()
  }

  handleReport = async () => {
    const { error, errorInfo } = this.state
    
    if (error && errorInfo) {
      try {
        // Create detailed error report
        const errorReport = {
          error: {
            message: error.message,
            stack: error.stack,
            name: error.name
          },
          errorInfo: {
            componentStack: errorInfo.componentStack
          },
          context: {
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            viewport: {
              width: window.innerWidth,
              height: window.innerHeight
            }
          }
        }
        
        // Copy to clipboard
        await navigator.clipboard.writeText(JSON.stringify(errorReport, null, 2))
        alert('Error report copied to clipboard!')
        
      } catch (clipboardError) {
        console.error('Failed to copy error report:', clipboardError)
        alert('Failed to copy error report to clipboard')
      }
    }
  }

  renderErrorFallback = () => {
    const { error, errorInfo, errorId, retryCount } = this.state
    const { maxRetries = 3 } = this.props
    
    const canRetry = retryCount < maxRetries
    
    return (
      <div className="error-boundary-container">
        <div className="error-boundary-content">
          <div className="error-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          
          <h2 className="error-title">Something went wrong</h2>
          
          <p className="error-description">
            An unexpected error occurred in this component. This might be due to a temporary issue.
          </p>
          
          <div className="error-details">
            <details>
              <summary>Error Details</summary>
              <div className="error-content">
                <p><strong>Error ID:</strong> {errorId}</p>
                <p><strong>Message:</strong> {error?.message || 'Unknown error'}</p>
                <p><strong>Retry Count:</strong> {retryCount}/{maxRetries}</p>
                {error?.stack && (
                  <div>
                    <strong>Stack Trace:</strong>
                    <pre className="error-stack">{error.stack}</pre>
                  </div>
                )}
              </div>
            </details>
          </div>
          
          <div className="error-actions">
            {canRetry && (
              <button 
                onClick={this.handleRetry}
                className="btn btn-primary"
              >
                Try Again ({maxRetries - retryCount} attempts left)
              </button>
            )}
            
            <button 
              onClick={this.handleReload}
              className="btn btn-secondary"
            >
              Reload Page
            </button>
            
            <button 
              onClick={this.handleReport}
              className="btn btn-outline"
            >
              Copy Error Report
            </button>
          </div>
        </div>
        
        <style jsx>{`
          .error-boundary-container {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 400px;
            padding: 2rem;
            background: linear-gradient(135deg, rgba(255, 0, 0, 0.1), rgba(255, 100, 100, 0.05));
            border-radius: 12px;
            border: 1px solid rgba(255, 0, 0, 0.2);
            backdrop-filter: blur(10px);
            margin: 1rem;
          }
          
          .error-boundary-content {
            text-align: center;
            max-width: 600px;
            color: #333;
          }
          
          .error-icon {
            color: #ff4444;
            margin-bottom: 1rem;
          }
          
          .error-title {
            font-size: 1.5rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
            color: #333;
          }
          
          .error-description {
            color: #666;
            margin-bottom: 1.5rem;
            line-height: 1.5;
          }
          
          .error-details {
            margin-bottom: 2rem;
            text-align: left;
          }
          
          .error-details summary {
            cursor: pointer;
            padding: 0.5rem;
            background: rgba(0, 0, 0, 0.05);
            border-radius: 4px;
            margin-bottom: 0.5rem;
          }
          
          .error-content {
            padding: 1rem;
            background: rgba(0, 0, 0, 0.02);
            border-radius: 4px;
            font-size: 0.9rem;
          }
          
          .error-stack {
            background: #f5f5f5;
            padding: 0.5rem;
            border-radius: 4px;
            overflow: auto;
            font-size: 0.8rem;
            margin-top: 0.5rem;
          }
          
          .error-actions {
            display: flex;
            gap: 1rem;
            justify-content: center;
            flex-wrap: wrap;
          }
          
          .btn {
            padding: 0.75rem 1.5rem;
            border-radius: 6px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
            border: none;
            text-decoration: none;
          }
          
          .btn-primary {
            background: #007bff;
            color: white;
          }
          
          .btn-primary:hover {
            background: #0056b3;
          }
          
          .btn-secondary {
            background: #6c757d;
            color: white;
          }
          
          .btn-secondary:hover {
            background: #545b62;
          }
          
          .btn-outline {
            background: transparent;
            color: #007bff;
            border: 1px solid #007bff;
          }
          
          .btn-outline:hover {
            background: #007bff;
            color: white;
          }
          
          @media (max-width: 600px) {
            .error-boundary-container {
              padding: 1rem;
              margin: 0.5rem;
            }
            
            .error-actions {
              flex-direction: column;
            }
          }
        `}</style>
      </div>
    )
  }

  render() {
    const { hasError } = this.state
    const { children, fallback } = this.props
    
    if (hasError) {
      // Use custom fallback if provided, otherwise use default
      return fallback || this.renderErrorFallback()
    }
    
    return children
  }
}

export default EnhancedErrorBoundary