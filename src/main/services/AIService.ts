// src/main/services/AIService.ts
export interface AIMessage {
  id: string
  content: string
  timestamp: number
  isUser: boolean
  isLoading?: boolean
}

export interface AIResponse {
  success: boolean
  result?: string
  actions?: any[]
  metadata?: any
  error?: string
}

export interface AIContext {
  model: string
  temperature: number
  maxTokens: number
  isInitialized: boolean
  agentCount: number
}

export class AIService {
  private static instance: AIService
  private isInitialized: boolean = false
  private messages: AIMessage[] = []
  private context: AIContext | null = null

  private constructor() {}

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService()
    }
    return AIService.instance
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('⚠️ AIService already initialized')
      return
    }

    console.log('🤖 Initializing Frontend AI Service...')
    
    try {
      // Test connection to Electron AI service
      const result = await window.electronAPI.testConnection()
      if (result.success) {
        this.isInitialized = true
        console.log('✅ Frontend AI Service initialized')
      } else {
        throw new Error(result.error || 'Failed to connect to AI service')
      }
    } catch (error) {
      console.error('❌ Frontend AI Service initialization failed:', error)
      throw error
    }
  }

  async sendMessage(message: string): Promise<AIResponse> {
    try {
      console.log('💬 Sending AI message:', message)
      
      if (!this.isInitialized) {
        throw new Error('AIService not initialized')
      }

      // Add user message to history
      const userMessage: AIMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        content: message,
        timestamp: Date.now(),
        isUser: true
      }
      this.messages.push(userMessage)

      // Send to Electron AI service
      const result: AIResponse = await window.electronAPI.sendAIMessage(message)
      
      // Add AI response to history
      if (result.success) {
        const aiMessage: AIMessage = {
          id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          content: result.result || 'No response received',
          timestamp: Date.now(),
          isUser: false
        }
        this.messages.push(aiMessage)
      }

      console.log('✅ AI message processed')
      return result
      
    } catch (error) {
      console.error('❌ Failed to send AI message:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  async summarizePage(): Promise<AIResponse> {
    try {
      console.log('📄 Summarizing current page...')
      
      const result = await window.electronAPI.summarizePage()
      console.log('✅ Page summarized')
      return result
      
    } catch (error) {
      console.error('❌ Failed to summarize page:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  async analyzeContent(): Promise<AIResponse> {
    try {
      console.log('🔍 Analyzing page content...')
      
      const result = await window.electronAPI.analyzeContent()
      console.log('✅ Content analyzed')
      return result
      
    } catch (error) {
      console.error('❌ Failed to analyze content:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  async getAIContext(): Promise<AIContext | null> {
    try {
      const result = await window.electronAPI.getAIContext()
      if (result.success) {
        this.context = result.context
        return this.context
      }
      return null
    } catch (error) {
      console.error('❌ Failed to get AI context:', error)
      return null
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const result = await window.electronAPI.testConnection()
      return result.success
    } catch (error) {
      console.error('❌ AI connection test failed:', error)
      return false
    }
  }

  // Message management
  getMessages(): AIMessage[] {
    return [...this.messages]
  }

  addMessage(message: AIMessage): void {
    this.messages.push(message)
  }

  clearMessages(): void {
    this.messages = []
  }

  getLastMessage(): AIMessage | null {
    return this.messages.length > 0 ? this.messages[this.messages.length - 1] : null
  }

  // Public utility methods
  isReady(): boolean {
    return this.isInitialized
  }

  getMessageCount(): number {
    return this.messages.length
  }

  getContext(): AIContext | null {
    return this.context
  }
}

export default AIService
