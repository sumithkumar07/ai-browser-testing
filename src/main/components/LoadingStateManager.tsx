// Loading State Manager - Production Ready
// Centralized loading state management with consistent UI

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'

interface LoadingState {
  [key: string]: boolean
}

interface LoadingContextType {
  loadingStates: LoadingState
  setLoading: (key: string, loading: boolean) => void
  isLoading: (key: string) => boolean
  isAnyLoading: () => boolean
  clearAll: () => void
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

export const useLoading = () => {
  const context = useContext(LoadingContext)
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider')
  }
  return context
}

interface LoadingProviderProps {
  children: ReactNode
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
  const [loadingStates, setLoadingStates] = useState<LoadingState>({})

  const setLoading = useCallback((key: string, loading: boolean) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: loading
    }))
  }, [])

  const isLoading = useCallback((key: string) => {
    return loadingStates[key] || false
  }, [loadingStates])

  const isAnyLoading = useCallback(() => {
    return Object.values(loadingStates).some(loading => loading)
  }, [loadingStates])

  const clearAll = useCallback(() => {
    setLoadingStates({})
  }, [])

  const value = {
    loadingStates,
    setLoading,
    isLoading,
    isAnyLoading,
    clearAll
  }

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  )
}

// Enhanced Loading Spinner Component
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  message?: string
  overlay?: boolean
  className?: string
}

export const EnhancedLoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  message,
  overlay = false,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  const spinner = (
    <div className={`loading-spinner ${className}`} style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1rem'
    }}>
      <div className={`spinner ${sizeClasses[size]}`} style={{
        display: 'inline-block',
        position: 'relative'
      }}>
        <div className="spinner-ring" style={{
          width: '100%',
          height: '100%',
          border: '2px solid rgba(255, 255, 255, 0.1)',
          borderLeft: '2px solid #007bff',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
      </div>
      {message && <p className="loading-message" style={{
        color: '#666',
        fontSize: '0.9rem',
        textAlign: 'center',
        margin: 0
      }}>{message}</p>}
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )

  if (overlay) {
    return (
      <div className="loading-overlay" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        backdropFilter: 'blur(4px)'
      }}>
        {spinner}
      </div>
    )
  }

  return spinner
}

// Loading Hook for async operations
export const useAsyncLoading = () => {
  const { setLoading } = useLoading()

  const withLoading = useCallback(async <T,>(
    key: string,
    asyncOperation: () => Promise<T>,
    onError?: (error: Error) => void
  ): Promise<T | null> => {
    try {
      setLoading(key, true)
      const result = await asyncOperation()
      return result
    } catch (error) {
      console.error(`Async operation '${key}' failed:`, error)
      if (onError) {
        onError(error as Error)
      }
      return null
    } finally {
      setLoading(key, false)
    }
  }, [setLoading])

  return { withLoading }
}

// Component wrapper for loading states
interface LoadingWrapperProps {
  loadingKey: string
  fallback?: ReactNode
  children: ReactNode
}

export const LoadingWrapper: React.FC<LoadingWrapperProps> = ({
  loadingKey,
  fallback,
  children
}) => {
  const { isLoading } = useLoading()

  if (isLoading(loadingKey)) {
    return (
      <>
        {fallback || <EnhancedLoadingSpinner message="Loading..." />}
      </>
    )
  }

  return <>{children}</>
}