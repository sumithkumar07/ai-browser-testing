/**
 * Unified API Client
 * Centralized API communication with error handling and retry logic
 */

import { createLogger } from '../logger/Logger'
import { APP_CONSTANTS } from '../utils/Constants'
import { APIResponse } from '../types'

const logger = createLogger('UnifiedAPIClient')

export interface APIClientConfig {
  baseURL?: string
  timeout: number
  maxRetries: number
  retryDelay: number
  headers?: Record<string, string>
}

export interface RequestOptions {
  timeout?: number
  retries?: number
  headers?: Record<string, string>
  signal?: AbortSignal
}

class UnifiedAPIClient {
  private static instance: UnifiedAPIClient
  private config: APIClientConfig
  private requestQueue: Map<string, Promise<any>> = new Map()

  private constructor() {
    this.config = {
      timeout: APP_CONSTANTS.TIMEOUTS.NAVIGATION,
      maxRetries: 3,
      retryDelay: 1000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': `${APP_CONSTANTS.APP_NAME}/${APP_CONSTANTS.APP_VERSION}`
      }
    }
  }

  static getInstance(): UnifiedAPIClient {
    if (!UnifiedAPIClient.instance) {
      UnifiedAPIClient.instance = new UnifiedAPIClient()
    }
    return UnifiedAPIClient.instance
  }

  /**
   * Browser Management APIs
   */
  async createTab(url?: string, type?: 'browser' | 'ai'): Promise<APIResponse> {
    return this.executeElectronAPI('createTab', { url, type })
  }

  async closeTab(tabId: string): Promise<APIResponse> {
    return this.executeElectronAPI('closeTab', { tabId })
  }

  async switchTab(tabId: string): Promise<APIResponse> {
    return this.executeElectronAPI('switchTab', { tabId })
  }

  async navigateTo(url: string): Promise<APIResponse> {
    return this.executeElectronAPI('navigateTo', { url })
  }

  async goBack(): Promise<APIResponse> {
    return this.executeElectronAPI('goBack')
  }

  async goForward(): Promise<APIResponse> {
    return this.executeElectronAPI('goForward')
  }

  async reload(): Promise<APIResponse> {
    return this.executeElectronAPI('reload')
  }

  async getCurrentUrl(): Promise<APIResponse> {
    return this.executeElectronAPI('getCurrentUrl')
  }

  async getPageTitle(): Promise<APIResponse> {
    return this.executeElectronAPI('getPageTitle')
  }

  /**
   * AI Service APIs
   */
  async sendAIMessage(message: string): Promise<APIResponse> {
    return this.executeElectronAPI('sendAIMessage', { message })
  }

  async summarizePage(): Promise<APIResponse> {
    return this.executeElectronAPI('summarizePage')
  }

  async analyzeContent(): Promise<APIResponse> {
    return this.executeElectronAPI('analyzeContent')
  }

  async testAIConnection(): Promise<APIResponse> {
    return this.executeElectronAPI('testConnection')
  }

  async getAIContext(): Promise<APIResponse> {
    return this.executeElectronAPI('getAIContext')
  }

  /**
   * Agent System APIs
   */
  async executeAgentTask(task: string): Promise<APIResponse> {
    return this.executeElectronAPI('executeAgentTask', { task })
  }

  async getAgentStatus(agentId?: string): Promise<APIResponse> {
    return this.executeElectronAPI('getAgentStatus', { agentId })
  }

  async cancelAgentTask(taskId: string): Promise<APIResponse> {
    return this.executeElectronAPI('cancelAgentTask', { taskId })
  }

  /**
   * Content Management APIs
   */
  async createAITab(title: string, content?: string): Promise<APIResponse> {
    return this.executeElectronAPI('createAITab', { title, content })
  }

  async saveAITabContent(tabId: string, content: string): Promise<APIResponse> {
    return this.executeElectronAPI('saveAITabContent', { tabId, content })
  }

  async loadAITabContent(tabId: string): Promise<APIResponse> {
    return this.executeElectronAPI('loadAITabContent', { tabId })
  }

  async extractPageContent(tabId?: string): Promise<APIResponse> {
    return this.executeElectronAPI('extractPageContent', { tabId })
  }

  /**
   * System APIs
   */
  async getVersion(): Promise<APIResponse> {
    return this.executeElectronAPI('getVersion')
  }

  async getPlatform(): Promise<APIResponse> {
    return this.executeElectronAPI('getPlatform')
  }

  async openDevTools(): Promise<APIResponse> {
    return this.executeElectronAPI('openDevTools')
  }

  async closeDevTools(): Promise<APIResponse> {
    return this.executeElectronAPI('closeDevTools')
  }

  /**
   * Execute Electron API with error handling and retry logic
   */
  private async executeElectronAPI(
    method: string,
    params?: any,
    options: RequestOptions = {}
  ): Promise<APIResponse> {
    const requestId = `${method}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const cacheKey = `${method}_${JSON.stringify(params)}`

    try {
      logger.debug(`Executing API call: ${method}`, { requestId, params })

      // Check if we're in Electron environment
      if (!window.electronAPI) {
        throw new Error('Electron API not available')
      }

      // Check for duplicate request
      if (this.requestQueue.has(cacheKey)) {
        logger.debug(`Returning cached request: ${method}`)
        return await this.requestQueue.get(cacheKey)!
      }

      // Create request promise
      const requestPromise = this.executeWithRetry(method, params, options, requestId)
      this.requestQueue.set(cacheKey, requestPromise)

      // Execute with cleanup
      try {
        const result = await requestPromise
        return result
      } finally {
        this.requestQueue.delete(cacheKey)
      }

    } catch (error) {
      logger.error(`API call failed: ${method} - ${(error as Error).message}`, { requestId })
      return {
        success: false,
        error: (error as Error).message,
        timestamp: Date.now(),
        requestId
      }
    }
  }

  /**
   * Execute API call with retry logic
   */
  private async executeWithRetry(
    method: string,
    params: any,
    options: RequestOptions,
    requestId: string
  ): Promise<APIResponse> {
    const maxRetries = options.retries ?? this.config.maxRetries
    const timeout = options.timeout ?? this.config.timeout

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        logger.debug(`API attempt ${attempt}/${maxRetries}: ${method}`, { requestId })

        // Get the API method
        const apiMethod = (window.electronAPI as any)[method]
        if (!apiMethod) {
          throw new Error(`API method not found: ${method}`)
        }

        // Execute with timeout
        const result = await this.withTimeout(
          params ? apiMethod(params) : apiMethod(),
          timeout,
          options.signal
        )

        // Normalize response
        const normalizedResult: APIResponse = {
          success: (result as any)?.success ?? true,
          data: (result as any)?.data || result,
          error: (result as any)?.error,
          timestamp: Date.now(),
          requestId
        }

        if (normalizedResult.success !== false) {
          logger.debug(`API call succeeded: ${method}`, { requestId, attempt })
          return normalizedResult
        }

        throw new Error(normalizedResult.error || 'API call returned success: false')

      } catch (error) {
        logger.warn(`API attempt ${attempt} failed: ${method} - ${(error as Error).message}`, { requestId })

        if (attempt === maxRetries) {
          throw error
        }

        // Check if operation was cancelled
        if (options.signal?.aborted) {
          throw new Error('Operation was cancelled')
        }

        // Exponential backoff
        await this.delay(this.config.retryDelay * Math.pow(2, attempt - 1))
      }
    }

    throw new Error('All retry attempts failed')
  }

  /**
   * Batch API calls
   */
  async batch(calls: Array<{ method: string; params?: any }>): Promise<APIResponse[]> {
    const promises = calls.map(call => 
      this.executeElectronAPI(call.method, call.params)
    )

    try {
      const results = await Promise.allSettled(promises)
      return results.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value
        } else {
          return {
            success: false,
            error: result.reason.message,
            timestamp: Date.now(),
            requestId: `batch_${index}`
          }
        }
      })
    } catch (error) {
      logger.error(`Batch API call failed: ${(error as Error).message}`)
      throw error
    }
  }

  /**
   * Get request statistics
   */
  getStats(): {
    pendingRequests: number
    totalRequests: number
    config: APIClientConfig
  } {
    return {
      pendingRequests: this.requestQueue.size,
      totalRequests: 0, // Could be tracked if needed
      config: { ...this.config }
    }
  }

  /**
   * Cancel all pending requests
   */
  cancelAllRequests(): void {
    this.requestQueue.clear()
    logger.info('All pending requests cancelled')
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<APIClientConfig>): void {
    this.config = { ...this.config, ...newConfig }
    logger.info('API client configuration updated', newConfig)
  }

  /**
   * Private utility methods
   */
  private async withTimeout<T>(
    promise: Promise<T>,
    timeout: number,
    signal?: AbortSignal
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Request timed out after ${timeout}ms`))
      }, timeout)

      // Handle abort signal
      if (signal) {
        signal.addEventListener('abort', () => {
          clearTimeout(timeoutId)
          reject(new Error('Request was cancelled'))
        })
      }

      promise
        .then(resolve)
        .catch(reject)
        .finally(() => clearTimeout(timeoutId))
    })
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

export default UnifiedAPIClient