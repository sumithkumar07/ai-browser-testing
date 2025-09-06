/**
 * Unified AI Service
 * Single source of truth for AI functionality with robust error handling
 */

import { createLogger } from '../logger/Logger'
import { APP_CONSTANTS } from '../utils/Constants'
import { validateAIMessage } from '../utils/Validators'
import { AIMessage, AIResponse, AgentStatus } from '../types'

const logger = createLogger('UnifiedAIService')

export interface AIServiceConfig {
  maxRetries: number
  retryDelay: number
  timeout: number
  maxHistoryLength: number
}

export interface AIOperationOptions {
  timeout?: number
  retries?: number
  context?: string
  priority?: 'low' | 'normal' | 'high'
}

class UnifiedAIService {
  private static instance: UnifiedAIService
  private isInitialized: boolean = false
  private messages: AIMessage[] = []
  private connectionRetries: number = 0
  private lastConnectionTest: number = 0
  private operationQueue: Map<string, Promise<AIResponse>> = new Map()
  private abortControllers: Map<string, AbortController> = new Map()

  private config: AIServiceConfig = {
    maxRetries: 3,
    retryDelay: 1000,
    timeout: APP_CONSTANTS.TIMEOUTS.AI_RESPONSE,
    maxHistoryLength: 100
  }

  private constructor() {}

  static getInstance(): UnifiedAIService {
    if (!UnifiedAIService.instance) {
      UnifiedAIService.instance = new UnifiedAIService()
    }
    return UnifiedAIService.instance
  }

  /**
   * Initialize the AI service with robust error handling
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      logger.warn('AI Service already initialized')
      return
    }

    logger.info('Initializing Unified AI Service')

    try {
      await this.testConnectionWithRetry()
      this.isInitialized = true
      logger.info('AI Service initialized successfully')
    } catch (error) {
      logger.error('AI Service initialization failed', error as Error)
      throw new Error(`AI Service initialization failed: ${(error as Error).message}`)
    }
  }

  /**
   * Test connection with retry logic
   */
  private async testConnectionWithRetry(maxRetries: number = 3): Promise<void> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        logger.debug(`Testing AI connection (attempt ${attempt}/${maxRetries})`)
        
        const result = await this.withTimeout(
          window.electronAPI.testConnection(),
          5000
        )
        
        if (result.success) {
          this.connectionRetries = 0
          this.lastConnectionTest = Date.now()
          return
        }
        
        throw new Error(result.error || 'Connection test failed')
      } catch (error) {
        logger.warn(`Connection test attempt ${attempt} failed`, error as Error)
        
        if (attempt === maxRetries) {
          throw error
        }
        
        await this.delay(this.config.retryDelay * attempt)
      }
    }
  }

  /**
   * Send message with retry logic and timeout handling
   */
  async sendMessage(
    message: string, 
    options: AIOperationOptions = {}
  ): Promise<AIResponse> {
    const operationId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    try {
      // Validate input
      validateAIMessage(message)
      
      logger.info('Processing AI message', { operationId, length: message.length })

      // Check if service is ready
      if (!this.isInitialized) {
        throw new Error('AI Service not initialized')
      }

      // Check for duplicate operation
      if (this.operationQueue.has(message)) {
        logger.debug('Returning cached operation result')
        return await this.operationQueue.get(message)!
      }

      // Create operation promise
      const operationPromise = this.executeMessageOperation(message, options, operationId)
      this.operationQueue.set(message, operationPromise)

      // Execute with cleanup
      try {
        const result = await operationPromise
        return result
      } finally {
        this.operationQueue.delete(message)
        this.abortControllers.delete(operationId)
      }

    } catch (error) {
      logger.error('Failed to send AI message', error as Error, { operationId })
      return {
        success: false,
        error: (error as Error).message
      }
    }
  }

  /**
   * Execute message operation with retry and timeout
   */
  private async executeMessageOperation(
    message: string,
    options: AIOperationOptions,
    operationId: string
  ): Promise<AIResponse> {
    const maxRetries = options.retries ?? this.config.maxRetries
    const timeout = options.timeout ?? this.config.timeout

    // Create abort controller for cancellation
    const abortController = new AbortController()
    this.abortControllers.set(operationId, abortController)

    // Add user message to history
    const userMessage: AIMessage = {
      id: operationId,
      content: message,
      timestamp: Date.now(),
      isUser: true
    }
    this.addMessageToHistory(userMessage)

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        logger.debug(`Sending message attempt ${attempt}/${maxRetries}`, { operationId })

        const result = await this.withTimeout(
          window.electronAPI.sendAIMessage(message),
          timeout,
          abortController.signal
        )

        if (result.success && result.result) {
          // Add AI response to history
          const aiMessage: AIMessage = {
            id: `ai_${operationId}`,
            content: result.result,
            timestamp: Date.now(),
            isUser: false
          }
          this.addMessageToHistory(aiMessage)

          logger.info('AI message processed successfully', { operationId, attempt })
          return result
        }

        throw new Error(result.error || 'Empty response from AI service')

      } catch (error) {
        logger.warn(`Message attempt ${attempt} failed`, error as Error, { operationId })

        if (attempt === maxRetries) {
          throw error
        }

        // Check if operation was cancelled
        if (abortController.signal.aborted) {
          throw new Error('Operation cancelled')
        }

        // Exponential backoff
        await this.delay(this.config.retryDelay * Math.pow(2, attempt - 1))
      }
    }

    throw new Error('All retry attempts failed')
  }

  /**
   * Summarize page with robust error handling
   */
  async summarizePage(options: AIOperationOptions = {}): Promise<AIResponse> {
    try {
      logger.info('Summarizing current page')

      if (!this.isInitialized) {
        throw new Error('AI Service not initialized')
      }

      const result = await this.withTimeout(
        window.electronAPI.summarizePage(),
        options.timeout ?? this.config.timeout
      )

      logger.info('Page summarized successfully')
      return result

    } catch (error) {
      logger.error('Failed to summarize page', error as Error)
      return {
        success: false,
        error: (error as Error).message
      }
    }
  }

  /**
   * Analyze content with timeout and retry
   */
  async analyzeContent(options: AIOperationOptions = {}): Promise<AIResponse> {
    try {
      logger.info('Analyzing page content')

      if (!this.isInitialized) {
        throw new Error('AI Service not initialized')
      }

      const result = await this.withTimeout(
        window.electronAPI.analyzeContent(),
        options.timeout ?? this.config.timeout
      )

      logger.info('Content analyzed successfully')
      return result

    } catch (error) {
      logger.error('Failed to analyze content', error as Error)
      return {
        success: false,
        error: (error as Error).message
      }
    }
  }

  /**
   * Execute agent task with progress tracking
   */
  async executeAgentTask(
    task: string,
    onProgress?: (status: AgentStatus) => void
  ): Promise<AIResponse> {
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    try {
      logger.info('Executing agent task', { taskId, task })

      if (!this.isInitialized) {
        throw new Error('AI Service not initialized')
      }

      // Start task with timeout
      const result = await this.withTimeout(
        window.electronAPI.executeAgentTask(task),
        APP_CONSTANTS.TIMEOUTS.AGENT_TASK
      )

      logger.info('Agent task completed', { taskId, success: result.success })
      return result

    } catch (error) {
      logger.error('Agent task failed', error as Error, { taskId })
      return {
        success: false,
        error: (error as Error).message
      }
    }
  }

  /**
   * Cancel operation by ID
   */
  cancelOperation(operationId: string): boolean {
    const controller = this.abortControllers.get(operationId)
    if (controller) {
      controller.abort()
      this.abortControllers.delete(operationId)
      logger.info('Operation cancelled', { operationId })
      return true
    }
    return false
  }

  /**
   * Cancel all pending operations
   */
  cancelAllOperations(): void {
    for (const [operationId, controller] of this.abortControllers) {
      controller.abort()
    }
    this.abortControllers.clear()
    this.operationQueue.clear()
    logger.info('All operations cancelled')
  }

  /**
   * Check connection status
   */
  async checkConnection(): Promise<boolean> {
    try {
      // Throttle connection checks
      if (Date.now() - this.lastConnectionTest < 5000) {
        return this.isInitialized
      }

      const result = await this.withTimeout(
        window.electronAPI.testConnection(),
        5000
      )

      this.lastConnectionTest = Date.now()
      return result.success

    } catch (error) {
      logger.warn('Connection check failed', error as Error)
      return false
    }
  }

  /**
   * Get AI context with caching
   */
  async getContext(): Promise<any> {
    try {
      const result = await window.electronAPI.getAIContext()
      return result.success ? result.context : null
    } catch (error) {
      logger.error('Failed to get AI context', error as Error)
      return null
    }
  }

  /**
   * Message history management
   */
  getMessages(): AIMessage[] {
    return [...this.messages]
  }

  private addMessageToHistory(message: AIMessage): void {
    this.messages.push(message)
    
    // Limit history size
    if (this.messages.length > this.config.maxHistoryLength) {
      this.messages = this.messages.slice(-this.config.maxHistoryLength)
    }
  }

  clearMessages(): void {
    this.messages = []
    logger.debug('Message history cleared')
  }

  getLastMessage(): AIMessage | null {
    return this.messages.length > 0 ? this.messages[this.messages.length - 1] : null
  }

  /**
   * Utility methods
   */
  isReady(): boolean {
    return this.isInitialized
  }

  getMessageCount(): number {
    return this.messages.length
  }

  getOperationCount(): number {
    return this.operationQueue.size
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    logger.info('Cleaning up AI Service')
    
    this.cancelAllOperations()
    this.clearMessages()
    this.isInitialized = false
    this.connectionRetries = 0
    this.lastConnectionTest = 0
    
    logger.info('AI Service cleanup complete')
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
        reject(new Error(`Operation timed out after ${timeout}ms`))
      }, timeout)

      // Handle abort signal
      if (signal) {
        signal.addEventListener('abort', () => {
          clearTimeout(timeoutId)
          reject(new Error('Operation was cancelled'))
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

export default UnifiedAIService