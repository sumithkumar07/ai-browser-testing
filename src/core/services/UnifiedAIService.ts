/**
 * Unified AI Service
 * Provides centralized AI functionality for the React frontend
 */

import { createLogger } from '../logger/Logger'
import { AIMessage, AIResponse } from '../types'

const logger = createLogger('UnifiedAIService')

export interface AIServiceConfig {
  model: string
  temperature: number
  maxTokens: number
}

class UnifiedAIService {
  private static instance: UnifiedAIService
  private isInitialized = false
  private config: AIServiceConfig = {
    model: 'llama-3.3-70b-versatile',
    temperature: 0.7,
    maxTokens: 1000
  }
  private messages: AIMessage[] = []

  private constructor() {}

  static getInstance(): UnifiedAIService {
    if (!UnifiedAIService.instance) {
      UnifiedAIService.instance = new UnifiedAIService()
    }
    return UnifiedAIService.instance
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      logger.warn('UnifiedAIService already initialized')
      return
    }

    try {
      logger.info('Initializing Unified AI Service...')
      
      // Test connection to main process AI service
      const isConnected = await this.checkConnection()
      if (!isConnected) {
        throw new Error('Failed to connect to AI service')
      }

      this.isInitialized = true
      logger.info('✅ Unified AI Service initialized successfully')
      
    } catch (error) {
      logger.error('Failed to initialize Unified AI Service', error as Error)
      throw error
    }
  }

  async sendMessage(message: string): Promise<AIResponse> {
    if (!this.isInitialized) {
      throw new Error('AI service not initialized')
    }

    try {
      // Add user message to history
      const userMessage: AIMessage = {
        id: `msg_${Date.now()}_user`,
        content: message,
        isUser: true,
        timestamp: Date.now(),
        agentId: 'user'
      }
      this.messages.push(userMessage)

      // Send to main process via IPC
      const response = await window.electronAPI.sendAIMessage(message)
      
      if (response.success && response.data) {
        // Add AI response to history
        const aiMessage: AIMessage = {
          id: `msg_${Date.now()}_ai`,
          content: response.data.content || response.data,
          isUser: false,
          timestamp: Date.now(),
          agentId: response.data.agentId || 'ai-assistant'
        }
        this.messages.push(aiMessage)

        return {
          success: true,
          data: response.data,
          message: 'Message sent successfully'
        }
      } else {
        return {
          success: false,
          error: response.error || 'Failed to send message'
        }
      }
    } catch (error) {
      logger.error('Failed to send AI message', error as Error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  async summarizePage(): Promise<AIResponse> {
    if (!this.isInitialized) {
      throw new Error('AI service not initialized')
    }

    try {
      const response = await window.electronAPI.summarizePage()
      return response
    } catch (error) {
      logger.error('Failed to summarize page', error as Error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to summarize page'
      }
    }
  }

  async analyzeContent(): Promise<AIResponse> {
    if (!this.isInitialized) {
      throw new Error('AI service not initialized')
    }

    try {
      const response = await window.electronAPI.analyzeContent()
      return response
    } catch (error) {
      logger.error('Failed to analyze content', error as Error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to analyze content'
      }
    }
  }

  async checkConnection(): Promise<boolean> {
    try {
      if (!window.electronAPI) {
        return false
      }
      
      const response = await window.electronAPI.testAIConnection()
      return response.success
    } catch (error) {
      logger.error('Connection check failed', error as Error)
      return false
    }
  }

  async getContext(): Promise<any> {
    if (!this.isInitialized) {
      throw new Error('AI service not initialized')
    }

    return {
      model: this.config.model,
      temperature: this.config.temperature,
      maxTokens: this.config.maxTokens,
      isInitialized: this.isInitialized,
      agentCount: 6
    }
  }

  getMessages(): AIMessage[] {
    return [...this.messages]
  }

  clearMessages(): void {
    this.messages = []
    logger.debug('Messages cleared')
  }
}

export default UnifiedAIService