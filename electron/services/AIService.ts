// electron/services/AIService.ts
import Groq from 'groq-sdk'

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
  private groq: Groq | null = null
  private isInitialized: boolean = false
  private context: AIContext | null = null
  private messages: AIMessage[] = []

  private constructor() {}

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService()
    }
    return AIService.instance
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('⚠️ AI Service already initialized')
      return
    }

    console.log('🤖 Initializing AI Service with Groq...')
    
    try {
      // Initialize Groq SDK
      const apiKey = process.env.GROQ_API_KEY
      if (!apiKey) {
        throw new Error('GROQ_API_KEY environment variable is required')
      }

      this.groq = new Groq({
        apiKey: apiKey,
        dangerouslyAllowBrowser: false
      })

      // Test connection
      await this.testConnection()

      // Initialize context
      this.context = {
        model: 'llama-3.1-8b-instant',
        temperature: 0.7,
        maxTokens: 2048,
        isInitialized: true,
        agentCount: 6
      }

      this.isInitialized = true
      console.log('✅ AI Service initialized successfully')
      
    } catch (error) {
      console.error('❌ AI Service initialization failed:', error)
      throw error
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      if (!this.groq) {
        throw new Error('Groq client not initialized')
      }

      // Test with a simple completion
      const completion = await this.groq.chat.completions.create({
        messages: [{ role: 'user', content: 'Hello' }],
        model: 'llama-3.1-8b-instant',
        max_tokens: 10
      })

      return completion.choices.length > 0
    } catch (error) {
      console.error('❌ AI connection test failed:', error)
      return false
    }
  }

  async sendMessage(message: string, context?: string): Promise<AIResponse> {
    try {
      if (!this.isInitialized || !this.groq) {
        throw new Error('AI Service not initialized')
      }

      console.log('💬 Processing AI message:', message)

      // Add user message to history
      const userMessage: AIMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        content: message,
        timestamp: Date.now(),
        isUser: true
      }
      this.messages.push(userMessage)

      // Prepare system prompt based on context
      let systemPrompt = 'You are an intelligent AI assistant integrated into the KAiro Browser. Help users with browsing, research, and intelligent tasks.'
      
      if (context === 'research') {
        systemPrompt = 'You are a research assistant. Provide comprehensive, well-structured research information with clear sources and key points.'
      } else if (context === 'shopping') {
        systemPrompt = 'You are a shopping assistant. Help users find products, compare prices, and make informed purchasing decisions.'
      } else if (context === 'analysis') {
        systemPrompt = 'You are a content analysis assistant. Analyze web pages and provide insights, summaries, and key information.'
      }

      // Prepare messages for Groq
      const groqMessages = [
        { role: 'system', content: systemPrompt },
        ...this.messages.slice(-10).map(msg => ({
          role: msg.isUser ? 'user' : 'assistant',
          content: msg.content
        }))
      ]

      // Call Groq API
      const completion = await this.groq.chat.completions.create({
        messages: groqMessages,
        model: this.context?.model || 'llama-3.1-8b-instant',
        temperature: this.context?.temperature || 0.7,
        max_tokens: this.context?.maxTokens || 2048
      })

      const aiResponse = completion.choices[0]?.message?.content || 'No response received'

      // Add AI response to history
      const aiMessage: AIMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        content: aiResponse,
        timestamp: Date.now(),
        isUser: false
      }
      this.messages.push(aiMessage)

      console.log('✅ AI message processed successfully')

      return {
        success: true,
        result: aiResponse,
        metadata: {
          model: this.context?.model,
          tokens: completion.usage?.total_tokens,
          timestamp: Date.now()
        }
      }

    } catch (error) {
      console.error('❌ Failed to process AI message:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  async summarizePage(content: string, url: string): Promise<AIResponse> {
    try {
      const prompt = `Summarize the following web page content from ${url}:\n\n${content.substring(0, 4000)}`
      return await this.sendMessage(prompt, 'analysis')
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to summarize page'
      }
    }
  }

  async analyzeContent(content: string, url: string): Promise<AIResponse> {
    try {
      const prompt = `Analyze the following web page content from ${url} and provide key insights:\n\n${content.substring(0, 4000)}`
      return await this.sendMessage(prompt, 'analysis')
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to analyze content'
      }
    }
  }

  async searchProducts(query: string, options?: any): Promise<AIResponse> {
    try {
      const prompt = `Help me search for products: ${query}. Provide product recommendations, price comparisons, and buying advice.`
      return await this.sendMessage(prompt, 'shopping')
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to search products'
      }
    }
  }

  async compareProducts(products: any[]): Promise<AIResponse> {
    try {
      const prompt = `Compare these products and provide recommendations: ${JSON.stringify(products)}`
      return await this.sendMessage(prompt, 'shopping')
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to compare products'
      }
    }
  }

  async generateResearchReport(topic: string, findings: any[]): Promise<AIResponse> {
    try {
      const prompt = `Generate a comprehensive research report on "${topic}" based on these findings: ${JSON.stringify(findings)}`
      return await this.sendMessage(prompt, 'research')
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate research report'
      }
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

  // Context management
  getContext(): AIContext | null {
    return this.context
  }

  updateContext(newContext: Partial<AIContext>): void {
    if (this.context) {
      this.context = { ...this.context, ...newContext }
    }
  }

  // Public utility methods
  isReady(): boolean {
    return this.isInitialized
  }

  getMessageCount(): number {
    return this.messages.length
  }

  async cleanup(): Promise<void> {
    console.log('🧹 Cleaning up AI Service...')
    this.messages = []
    this.context = null
    this.isInitialized = false
    console.log('✅ AI Service cleanup complete')
  }
}

export default AIService

