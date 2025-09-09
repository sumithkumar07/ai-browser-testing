/**
 * Enhanced Retry Utilities
 * Provides intelligent retry mechanisms with exponential backoff
 */

export interface RetryOptions {
  maxAttempts?: number
  baseDelay?: number
  maxDelay?: number
  exponentialBase?: number
  jitter?: boolean
  retryCondition?: (error: any) => boolean
  onRetry?: (attempt: number, error: any) => void
}

export interface RetryResult<T> {
  result?: T
  success: boolean
  attempts: number
  totalTime: number
  lastError?: any
}

export class RetryUtils {
  /**
   * Retry a function with exponential backoff
   */
  static async withRetry<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<RetryResult<T>> {
    const {
      maxAttempts = 3,
      baseDelay = 1000,
      maxDelay = 30000,
      exponentialBase = 2,
      jitter = true,
      retryCondition = () => true,
      onRetry
    } = options

    const startTime = Date.now()
    let attempts = 0
    let lastError: any

    while (attempts < maxAttempts) {
      attempts++

      try {
        const result = await fn()
        return {
          result,
          success: true,
          attempts,
          totalTime: Date.now() - startTime
        }
      } catch (error) {
        lastError = error

        // Check if we should retry this error
        if (!retryCondition(error)) {
          break
        }

        // If this was our last attempt, don't wait
        if (attempts >= maxAttempts) {
          break
        }

        // Calculate delay with exponential backoff
        const delay = Math.min(
          baseDelay * Math.pow(exponentialBase, attempts - 1),
          maxDelay
        )

        // Add jitter to prevent thundering herd
        const finalDelay = jitter 
          ? delay * (0.5 + Math.random() * 0.5)
          : delay

        // Call retry callback if provided
        if (onRetry) {
          onRetry(attempts, error)
        }

        // Wait before retrying
        await this.sleep(finalDelay)
      }
    }

    return {
      success: false,
      attempts,
      totalTime: Date.now() - startTime,
      lastError
    }
  }

  /**
   * Retry with specific conditions for different error types
   */
  static async withSmartRetry<T>(
    fn: () => Promise<T>,
    options: Partial<RetryOptions> = {}
  ): Promise<RetryResult<T>> {
    return this.withRetry(fn, {
      maxAttempts: 3,
      baseDelay: 1000,
      retryCondition: (error) => {
        // Retry on network errors, timeouts, and 5xx errors
        if (error.message.includes('network') || 
            error.message.includes('timeout') ||
            error.message.includes('fetch') ||
            (error.status && error.status >= 500)) {
          return true
        }

        // Retry on rate limiting with longer delay
        if (error.message.includes('rate limit') || error.status === 429) {
          return true
        }

        // Don't retry on client errors (4xx except 429)
        if (error.status && error.status >= 400 && error.status < 500 && error.status !== 429) {
          return false
        }

        return true
      },
      onRetry: (attempt, error) => {
        console.warn(`Retry attempt ${attempt} after error:`, error.message)
      },
      ...options
    })
  }

  /**
   * Retry specifically for API calls
   */
  static async retryApiCall<T>(
    apiCall: () => Promise<T>,
    options: Partial<RetryOptions> = {}
  ): Promise<T> {
    const result = await this.withSmartRetry(apiCall, {
      maxAttempts: 3,
      baseDelay: 1000,
      maxDelay: 10000,
      ...options
    })

    if (result.success && result.result !== undefined) {
      return result.result
    }

    throw result.lastError || new Error('API call failed after retries')
  }

  /**
   * Retry with circuit breaker pattern
   */
  private static circuitBreakerState = new Map<string, {
    failures: number
    lastFailure: number
    isOpen: boolean
  }>()

  static async withCircuitBreaker<T>(
    key: string,
    fn: () => Promise<T>,
    options: {
      failureThreshold?: number
      resetTimeout?: number
      retryOptions?: RetryOptions
    } = {}
  ): Promise<T> {
    const {
      failureThreshold = 5,
      resetTimeout = 60000,
      retryOptions = {}
    } = options

    const state = this.circuitBreakerState.get(key) || {
      failures: 0,
      lastFailure: 0,
      isOpen: false
    }

    // Check if circuit breaker should be reset
    if (state.isOpen && Date.now() - state.lastFailure > resetTimeout) {
      state.isOpen = false
      state.failures = 0
    }

    // If circuit is open, fail fast
    if (state.isOpen) {
      throw new Error(`Circuit breaker is open for ${key}`)
    }

    try {
      const result = await this.withSmartRetry(fn, retryOptions)
      
      if (result.success && result.result !== undefined) {
        // Reset on success
        state.failures = 0
        this.circuitBreakerState.set(key, state)
        return result.result
      } else {
        throw result.lastError
      }
    } catch (error) {
      state.failures++
      state.lastFailure = Date.now()

      if (state.failures >= failureThreshold) {
        state.isOpen = true
      }

      this.circuitBreakerState.set(key, state)
      throw error
    }
  }

  /**
   * Simple sleep utility
   */
  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Batch retry multiple operations
   */
  static async retryBatch<T>(
    operations: (() => Promise<T>)[],
    options: RetryOptions = {}
  ): Promise<RetryResult<T>[]> {
    const promises = operations.map(op => this.withSmartRetry(op, options))
    return Promise.all(promises)
  }

  /**
   * Retry with timeout
   */
  static async withTimeout<T>(
    fn: () => Promise<T>,
    timeoutMs: number,
    retryOptions: RetryOptions = {}
  ): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs)
    })

    const retryPromise = this.retryApiCall(fn, retryOptions)

    return Promise.race([retryPromise, timeoutPromise])
  }
}

export default RetryUtils