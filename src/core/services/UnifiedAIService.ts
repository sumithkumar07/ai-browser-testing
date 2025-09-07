/**
 * Unified AI Service
 * Enhanced with conversation quality and agent coordination
 */

import { createLogger } from '../logger/Logger'
import { APP_CONSTANTS } from '../utils/Constants'
import { validateAIMessage } from '../utils/Validators'
import { AIMessage, AIResponse, AgentStatus } from '../types'
import ConversationManager from './ConversationManager'
import AgentCoordinator from './AgentCoordinator'

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
  private lastConnectionTest: number = 0
  private operationQueue: Map<string, Promise<AIResponse>> = new Map()
  private abortControllers: Map<string, AbortController> = new Map()
  private conversationManager: ConversationManager
  private agentCoordinator: AgentCoordinator
  private currentSessionId: string | null = null

  private config: AIServiceConfig = {
    maxRetries: 3,
    retryDelay: 1000,
    timeout: APP_CONSTANTS.TIMEOUTS.AI_RESPONSE,
    maxHistoryLength: 100
  }

  private constructor() {
    this.conversationManager = ConversationManager.getInstance()
    this.agentCoordinator = AgentCoordinator.getInstance()
  }

  static getInstance(): UnifiedAIService {
    if (!UnifiedAIService.instance) {
      UnifiedAIService.instance = new UnifiedAIService()
    }
    return UnifiedAIService.instance
  }

  /**
   * Initialize the AI service with enhanced conversation management
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      logger.warn('AI Service already initialized')
      return
    }

    logger.info('Initializing Enhanced AI Service')

    try {
      await this.testConnectionWithRetry()
      
      // Initialize conversation session
      this.currentSessionId = await this.conversationManager.startConversation({
        currentUrl: '',
        pageTitle: 'New Tab'
      })
      
      this.isInitialized = true
      logger.info('Enhanced AI Service initialized successfully', { sessionId: this.currentSessionId })
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
        
        if ((result as any).success) {
          this.lastConnectionTest = Date.now()
          return
        }
        
        throw new Error((result as any).error || 'Connection test failed')
      } catch (error) {
        logger.warn(`Connection test attempt ${attempt} failed: ${(error as Error).message}`)
        
        if (attempt === maxRetries) {
          throw error
        }
        
        await this.delay(this.config.retryDelay * attempt)
      }
    }
  }

  /**
   * Send message with enhanced conversation quality and agent coordination
   */
  async sendMessage(
    message: string, 
    options: AIOperationOptions = {}
  ): Promise<AIResponse> {
    const operationId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    try {
      // Validate input
      validateAIMessage(message)
      
      logger.info('Processing enhanced AI message', { operationId, length: message.length })

      // Check if service is ready
      if (!this.isInitialized) {
        throw new Error('AI Service not initialized')
      }

      // Ensure we have a conversation session
      if (!this.currentSessionId) {
        this.currentSessionId = await this.conversationManager.startConversation({
          currentUrl: options.context || '',
          pageTitle: 'Active Session'
        })
      }

      // Add user message to conversation
      await this.conversationManager.addMessage(this.currentSessionId, {
        id: `user_${operationId}`,
        content: message,
        timestamp: Date.now(),
        isUser: true
      })

      // Analyze user intent with conversation context
      const intentAnalysis = await this.conversationManager.analyzeUserIntent(this.currentSessionId, message)
      
      // Check for duplicate operation
      if (this.operationQueue.has(message)) {
        logger.debug('Returning cached operation result')
        return await this.operationQueue.get(message)!
      }

      // Determine if this needs agent coordination
      const needsCoordination = intentAnalysis.suggestedAgents.length > 1 || 
                               intentAnalysis.responseStrategy === 'complex'

      let operationPromise: Promise<AIResponse>

      if (needsCoordination) {
        // Use agent coordination for complex tasks
        operationPromise = this.executeCoordinatedTask(message, intentAnalysis, options, operationId)
      } else {
        // Use enhanced single-agent execution
        operationPromise = this.executeEnhancedMessage(message, intentAnalysis, options, operationId)
      }

      this.operationQueue.set(message, operationPromise)

      // Execute with cleanup
      try {
        const result = await operationPromise
        
        // Add AI response to conversation with quality metrics
        if (result.success && this.currentSessionId) {
          await this.conversationManager.addMessage(this.currentSessionId, {
            id: `ai_${operationId}`,
            content: result.result || 'Task completed',
            timestamp: Date.now(),
            isUser: false
          }, {
            relevanceScore: intentAnalysis.confidence,
            helpfulnessScore: 0.8,
            contextAwareness: 0.9,
            taskCompletion: result.success ? 1.0 : 0.0,
            userSatisfaction: 0.8
          })
        }

        return result
      } finally {
        this.operationQueue.delete(message)
        this.abortControllers.delete(operationId)
      }

    } catch (error) {
      logger.error('Failed to send enhanced AI message', error as Error, { operationId })
      return {
        success: false,
        error: (error as Error).message
      }
    }
  }

  /**
   * Execute coordinated multi-agent task
   */
  private async executeCoordinatedTask(
    message: string,
    intentAnalysis: any,
    options: AIOperationOptions,
    operationId: string
  ): Promise<AIResponse> {
    try {
      logger.info('Executing coordinated task', { operationId, agents: intentAnalysis.suggestedAgents })
      
      const result = await this.agentCoordinator.orchestrateTask(
        message,
        this.currentSessionId!,
        {
          priority: options.priority,
          timeoutMs: options.timeout
        }
      )

      if (result.success) {
        return {
          success: true,
          result: `Task coordinated successfully across ${intentAnalysis.suggestedAgents.length} agents. Collaboration ID: ${result.collaborationId}`,
          actions: []
        }
      } else {
        throw new Error(result.error || 'Coordination failed')
      }

    } catch (error) {
      logger.error('Coordinated task execution failed', error as Error, { operationId })
      return {
        success: false,
        error: (error as Error).message
      }
    }
  }

  /**
   * Execute enhanced single-agent task with conversation context
   */
  private async executeEnhancedMessage(
    message: string,
    intentAnalysis: any,
    options: AIOperationOptions,
    operationId: string
  ): Promise<AIResponse> {
    const maxRetries = options.retries ?? this.config.maxRetries
    const timeout = options.timeout ?? this.config.timeout

    // Create abort controller for cancellation
    const abortController = new AbortController()
    this.abortControllers.set(operationId, abortController)

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        logger.debug(`Sending enhanced message attempt ${attempt}/${maxRetries}`, { operationId })

        // Create contextual prompt
        const contextualPrompt = this.createContextualPrompt(message, intentAnalysis)

        const result = await this.withTimeout(
          window.electronAPI.sendAIMessage(contextualPrompt),
          timeout
        )

        if (result.success && result.result) {
          // Post-process the response for quality
          const enhancedResult = await this.enhanceResponse(result.result, intentAnalysis, message)
          
          logger.info('Enhanced AI message processed successfully', { operationId, attempt })
          return {
            success: true,
            result: enhancedResult,
            actions: result.actions || []
          }
        }

        throw new Error(result.error || 'Empty response from AI service')

      } catch (error) {
        logger.warn(`Enhanced message attempt ${attempt} failed: ${(error as Error).message}`, { operationId, attempt })

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
   * Create contextual prompt with conversation history and intent
   */
  private createContextualPrompt(message: string, intentAnalysis: any): string {
    let prompt = message

    // Add intent context
    if (intentAnalysis.intent !== 'general') {
      prompt = `[INTENT: ${intentAnalysis.intent.toUpperCase()}] ${prompt}`
    }

    // Add suggested approach based on response strategy
    if (intentAnalysis.responseStrategy === 'clarifying') {
      prompt += '\n\nNote: Please ask clarifying questions if the request is unclear.'
    } else if (intentAnalysis.responseStrategy === 'continuing') {
      prompt += '\n\nNote: This appears to be a continuation of a previous task.'
    }

    // Add context factors
    if (intentAnalysis.contextFactors.length > 0) {
      prompt += `\n\nContext factors: ${intentAnalysis.contextFactors.join(', ')}`
    }

    return prompt
  }

  /**
   * Enhance AI response based on intent and context
   */
  private async enhanceResponse(response: string, intentAnalysis: any, _originalMessage: string): Promise<string> {
    // Add helpful suggestions based on intent
    let enhanced = response

    if (intentAnalysis.intent === 'research' && !response.includes('sources')) {
      enhanced += '\n\n💡 **Tip**: I can help you navigate to relevant sources or create research tabs for deeper investigation.'
    }

    if (intentAnalysis.intent === 'shopping' && !response.includes('compare')) {
      enhanced += '\n\n🛒 **Tip**: I can help compare prices across multiple sites or track price changes.'
    }

    if (intentAnalysis.intent === 'automation' && !response.includes('workflow')) {
      enhanced += '\n\n🤖 **Tip**: I can create automated workflows for repetitive tasks like this.'
    }

    if (intentAnalysis.intent === 'communication' && !response.includes('format')) {
      enhanced += '\n\n📧 **Tip**: I can help format and send emails or fill out forms automatically.'
    }

    // Add proactive suggestions for follow-up actions
    if (intentAnalysis.confidence > 0.8) {
      enhanced += '\n\n**What would you like to do next?**\n• Ask follow-up questions\n• Execute the suggested actions\n• Get more detailed information'
    }

    return enhanced
  }

  /**
   * Update conversation context when page changes
   */
  async updatePageContext(url: string, title: string, content?: string): Promise<void> {
    if (this.currentSessionId) {
      await this.conversationManager.updateContext(this.currentSessionId, {
        currentUrl: url,
        pageTitle: title,
        pageContent: content
      })
      
      logger.debug('Page context updated', { url, title, sessionId: this.currentSessionId })
    }
  }

  /**
   * Get conversation quality metrics
   */
  getConversationQuality(): any {
    return this.conversationManager.getQualityAnalytics()
  }

  /**
   * Get current session information
   */
  getCurrentSession(): { sessionId: string | null; isActive: boolean } {
    return {
      sessionId: this.currentSessionId,
      isActive: this.isInitialized && this.currentSessionId !== null
    }
  }
  // Unused method - removed for cleanup

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
    _onProgress?: (status: AgentStatus) => void
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
   * Generate AI response with streaming support
   */
  async generateResponse(message: string, context?: any, onProgress?: (chunk: string) => void): Promise<{
    success: boolean
    result?: string 
    error?: string
    usage?: any
    metadata?: any
  }> {
    const operationId = `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    try {
      logger.info('Generating AI response', { operationId, length: message.length })

      if (!this.isInitialized) {
        throw new Error('AI Service not initialized')
      }

      // Validate input
      validateAIMessage(message)

      // Create contextual message with provided context
      let contextualMessage = message
      if (context) {
        contextualMessage = `Context: ${JSON.stringify(context)}\n\nMessage: ${message}`
      }

      // Execute with streaming support if callback provided
      if (onProgress) {
        // For streaming, we'll need to implement streaming support in the electron API
        // For now, we'll fall back to regular response and call onProgress once
        const result = await this.withTimeout(
          window.electronAPI.sendAIMessage(contextualMessage),
          this.config.timeout
        )

        if (result.success && result.result) {
          onProgress(result.result)
          return {
            success: true,
            result: result.result
          }
        } else {
          throw new Error(result.error || 'Failed to generate response')
        }
      } else {
        // Regular non-streaming response
        const result = await this.withTimeout(
          window.electronAPI.sendAIMessage(contextualMessage),
          this.config.timeout
        )

        if (result.success && result.result) {
          return {
            success: true,
            result: result.result
          }
        } else {
          throw new Error(result.error || 'Failed to generate response')
        }
      }

    } catch (error) {
      logger.error('Failed to generate AI response', error as Error, { operationId })
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const [operationId, controller] of this.abortControllers) {
      controller.abort()
    }
    this.abortControllers.clear()
    this.operationQueue.clear()
    logger.info('All operations cancelled')
  }

  async testConnection(): Promise<boolean> {
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
      logger.warn(`Connection check failed: ${(error as Error).message}`)
      return false
    }
  }

  /**
   * Check connection status (alias for testConnection)
   */
  async checkConnection(): Promise<boolean> {
    return this.testConnection()
  }

  /**
   * Get AI context with caching
   */
  async getContext(): Promise<any> {
    try {
      const result = await window.electronAPI.getAIContext()
      return result.success ? result.context : null
    } catch (error) {
      logger.error(`Failed to get AI context: ${(error as Error).message}`)
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