/**
 * Enhanced Conversation Manager
 * Manages AI conversation quality, context, and memory
 */

import { createLogger } from '../logger/Logger'
import { appEvents } from '../utils/EventEmitter'
import { AIMessage } from '../types'

const logger = createLogger('ConversationManager')

export interface ConversationContext {
  currentUrl: string
  pageTitle: string
  pageContent?: string
  userIntent: string
  conversationHistory: AIMessage[]
  sessionId: string
  timestamp: number
  agentContext?: Record<string, any>
}

export interface ConversationQualityMetrics {
  relevanceScore: number
  helpfulnessScore: number
  contextAwareness: number
  taskCompletion: number
  userSatisfaction: number
  [key: string]: number // Allow dynamic indexing
}

class ConversationManager {
  private static instance: ConversationManager
  private conversations: Map<string, ConversationContext> = new Map()
  private currentSessionId: string | null = null
  private contextMemory: Map<string, any> = new Map()
  private qualityMetrics: ConversationQualityMetrics[] = []
  private maxHistoryLength = 50
  private contextTimeoutMs = 30 * 60 * 1000 // 30 minutes

  private constructor() {
    this.setupEventListeners()
  }

  static getInstance(): ConversationManager {
    if (!ConversationManager.instance) {
      ConversationManager.instance = new ConversationManager()
    }
    return ConversationManager.instance
  }

  private setupEventListeners(): void {
    // Listen for conversation events
    appEvents.on('conversation:started', (data) => {
      logger.info('Conversation started', data)
      this.initializeConversation(data.conversationId)
    })

    appEvents.on('ai:message', (data) => {
      if (this.currentSessionId) {
        this.updateConversationContext(this.currentSessionId, data)
      }
    })

    appEvents.on('conversation:context-updated', (data) => {
      logger.debug('Conversation context updated', data)
      this.updateContextMemory(data.conversationId, data.context)
    })
  }

  async startConversation(sessionId: string, initialContext: Partial<ConversationContext>): Promise<void> {
    try {
      logger.info(`Starting conversation session: ${sessionId}`)
      
      const context: ConversationContext = {
        currentUrl: initialContext.currentUrl || '',
        pageTitle: initialContext.pageTitle || '',
        pageContent: initialContext.pageContent,
        userIntent: '',
        conversationHistory: [],
        sessionId,
        timestamp: Date.now(),
        agentContext: initialContext.agentContext || {}
      }

      this.conversations.set(sessionId, context)
      this.currentSessionId = sessionId

      // Emit conversation started event
      appEvents.emit('conversation:started', { conversationId: sessionId, timestamp: Date.now() })
      
    } catch (error) {
      logger.error('Failed to start conversation', error as Error)
      throw error
    }
  }

  addMessage(sessionId: string, message: AIMessage): void {
    try {
      const context = this.conversations.get(sessionId)
      if (!context) {
        logger.warn(`Conversation context not found for session: ${sessionId}`)
        return
      }

      // Add message to history
      context.conversationHistory.push(message)
      
      // Trim history if too long
      if (context.conversationHistory.length > this.maxHistoryLength) {
        context.conversationHistory = context.conversationHistory.slice(-this.maxHistoryLength)
      }

      // Update context
      context.timestamp = Date.now()

      // Emit message added event
      appEvents.emit('conversation:message-added', { 
        conversationId: sessionId, 
        message 
      })

      logger.debug(`Added message to conversation ${sessionId}`, { 
        messageId: message.id, 
        historyLength: context.conversationHistory.length 
      })

    } catch (error) {
      logger.error('Failed to add message to conversation', error as Error)
    }
  }

  getConversationContext(sessionId: string): ConversationContext | null {
    return this.conversations.get(sessionId) || null
  }

  updateConversationContext(sessionId: string, updates: Partial<ConversationContext>): void {
    try {
      const context = this.conversations.get(sessionId)
      if (!context) {
        logger.warn(`Conversation context not found for session: ${sessionId}`)
        return
      }

      // Merge updates
      Object.assign(context, updates)
      context.timestamp = Date.now()

      logger.debug(`Updated conversation context for session: ${sessionId}`)

    } catch (error) {
      logger.error('Failed to update conversation context', error as Error)
    }
  }

  private initializeConversation(conversationId: string): void {
    // Implementation for conversation initialization
    logger.debug(`Initializing conversation: ${conversationId}`)
  }

  private updateContextMemory(conversationId: string, context: any): void {
    this.contextMemory.set(conversationId, context)
    logger.debug(`Updated context memory for conversation: ${conversationId}`)
  }

  analyzeConversationQuality(sessionId: string): Promise<ConversationQualityMetrics> {
    return new Promise((resolve) => {
      try {
        const context = this.conversations.get(sessionId)
        if (!context) {
          throw new Error(`Conversation not found: ${sessionId}`)
        }

        const userMessages = context.conversationHistory.filter(m => m.isUser)
        const assistantMessages = context.conversationHistory.filter(m => !m.isUser)

        // Basic quality metrics calculation
        const metrics: ConversationQualityMetrics = {
          relevanceScore: this.calculateRelevanceScore(context),
          helpfulnessScore: this.calculateHelpfulnessScore(assistantMessages),
          contextAwareness: this.calculateContextAwareness(context),
          taskCompletion: this.calculateTaskCompletion(context),
          userSatisfaction: this.calculateUserSatisfaction(userMessages)
        }

        this.qualityMetrics.push(metrics)

        logger.debug(`Analyzed conversation quality for session: ${sessionId}`, metrics)
        resolve(metrics)

      } catch (error) {
        logger.error('Failed to analyze conversation quality', error as Error)
        resolve({
          relevanceScore: 0.5,
          helpfulnessScore: 0.5,
          contextAwareness: 0.5,
          taskCompletion: 0.5,
          userSatisfaction: 0.5
        })
      }
    })
  }

  private calculateRelevanceScore(context: ConversationContext): number {
    // Simple relevance scoring based on context awareness
    if (!context.currentUrl || context.conversationHistory.length === 0) {
      return 0.3
    }

    // Check if AI responses reference current page or context
    const relevantResponses = context.conversationHistory
      .filter(m => !m.isUser)
      .filter(m => m.content.toLowerCase().includes(context.pageTitle.toLowerCase()) ||
                   m.content.toLowerCase().includes('current page') ||
                   m.content.toLowerCase().includes('this page'))

    return Math.min(relevantResponses.length / Math.max(context.conversationHistory.length / 2, 1), 1.0)
  }

  private calculateHelpfulnessScore(assistantMessages: AIMessage[]): number {
    if (assistantMessages.length === 0) return 0.0

    // Score based on message length and structure (longer, structured responses = more helpful)
    const avgLength = assistantMessages.reduce((sum, m) => sum + m.content.length, 0) / assistantMessages.length
    const structuredMessages = assistantMessages.filter(m => 
      m.content.includes('•') || m.content.includes('-') || m.content.includes('1.') || m.content.includes('**')
    )

    const lengthScore = Math.min(avgLength / 200, 1.0) * 0.6
    const structureScore = (structuredMessages.length / assistantMessages.length) * 0.4

    return lengthScore + structureScore
  }

  private calculateContextAwareness(context: ConversationContext): number {
    if (!context.pageContent && !context.currentUrl) return 0.2

    const hasPageContext = !!context.pageContent
    const hasUrlContext = !!context.currentUrl
    const hasAgentContext = !!context.agentContext && Object.keys(context.agentContext).length > 0

    let score = 0
    if (hasPageContext) score += 0.4
    if (hasUrlContext) score += 0.3
    if (hasAgentContext) score += 0.3

    return score
  }

  private calculateTaskCompletion(context: ConversationContext): number {
    // Simple heuristic: if conversation has both user questions and AI responses
    const userMessages = context.conversationHistory.filter(m => m.isUser)
    const aiMessages = context.conversationHistory.filter(m => !m.isUser)

    if (userMessages.length === 0 || aiMessages.length === 0) return 0.0

    // Check for completion indicators
    const completionIndicators = ['completed', 'done', 'finished', 'ready', 'success']
    const hasCompletionIndicators = aiMessages.some(m => 
      completionIndicators.some(indicator => m.content.toLowerCase().includes(indicator))
    )

    return hasCompletionIndicators ? 0.8 : 0.5
  }

  private calculateUserSatisfaction(_userMessages: AIMessage[]): number {
    // Placeholder - in real implementation would analyze user feedback
    return 0.7
  }

  getQualityReport(): object {
    const totalConversations = this.qualityMetrics.length
    const averageQuality: ConversationQualityMetrics = {
      relevanceScore: 0,
      helpfulnessScore: 0,
      contextAwareness: 0,
      taskCompletion: 0,
      userSatisfaction: 0
    }

    if (this.qualityMetrics.length > 0) {
      Object.keys(averageQuality).forEach(key => {
        averageQuality[key as keyof ConversationQualityMetrics] = this.qualityMetrics.reduce((sum, metrics) => 
          sum + metrics[key as keyof ConversationQualityMetrics], 0) / this.qualityMetrics.length
      })
    }

    // Identify issues and suggestions
    const topIssues = []
    const suggestions = []

    if (averageQuality.contextAwareness < 0.7) {
      topIssues.push('Low context awareness')
      suggestions.push('Improve page content extraction and context understanding')
    }

    if (averageQuality.taskCompletion < 0.6) {
      topIssues.push('Low task completion rate')
      suggestions.push('Better agent coordination and task follow-through')
    }

    if (averageQuality.relevanceScore < 0.6) {
      topIssues.push('Low relevance to user context')
      suggestions.push('Enhance contextual understanding and response relevance')
    }

    return {
      summary: {
        totalConversations,
        averageQuality,
        overallScore: Object.values(averageQuality).reduce((sum, score) => sum + score, 0) / Object.keys(averageQuality).length
      },
      insights: {
        topIssues,
        suggestions,
        trends: this.analyzeTrends()
      },
      recommendations: this.generateRecommendations(averageQuality)
    }
  }

  private analyzeTrends(): string[] {
    const trends = []
    
    if (this.qualityMetrics.length >= 5) {
      const recent = this.qualityMetrics.slice(-5)
      const older = this.qualityMetrics.slice(0, -5)
      
      if (older.length > 0) {
        const recentAvg = recent.reduce((sum, m) => sum + m.relevanceScore, 0) / recent.length
        const olderAvg = older.reduce((sum, m) => sum + m.relevanceScore, 0) / older.length
        
        if (recentAvg > olderAvg + 0.1) {
          trends.push('Improving relevance over time')
        } else if (recentAvg < olderAvg - 0.1) {
          trends.push('Declining relevance trend')
        }
      }
    }

    return trends
  }

  private generateRecommendations(quality: ConversationQualityMetrics): string[] {
    const recommendations = []

    if (quality.contextAwareness < 0.7) {
      recommendations.push('Implement better page content extraction')
      recommendations.push('Enhance context sharing between agents')
    }

    if (quality.helpfulnessScore < 0.6) {
      recommendations.push('Provide more structured and detailed responses')
      recommendations.push('Include actionable steps and next actions')
    }

    if (quality.taskCompletion < 0.6) {
      recommendations.push('Improve agent task coordination')
      recommendations.push('Add task progress tracking and completion confirmation')
    }

    return recommendations
  }

  // Intent Analysis
  analyzeUserIntent(message: string): string {
    const intentPatterns: Record<string, string[]> = {
      research: ['research', 'find', 'search', 'investigate', 'explore', 'discover'],
      shopping: ['buy', 'purchase', 'price', 'compare', 'shop', 'product'],
      automation: ['automate', 'repeat', 'schedule', 'workflow', 'process'],
      communication: ['email', 'message', 'contact', 'send', 'write', 'compose']
    }

    const lowerMessage = message.toLowerCase()
    
    for (const [intent, keywords] of Object.entries(intentPatterns)) {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        return intent
      }
    }

    return 'general'
  }

  // Smart Context Building
  buildSmartContext(sessionId: string): Promise<object> {
    return new Promise(async (resolve) => {
      try {
        const context = this.conversations.get(sessionId)
        if (!context) {
          resolve({})
          return
        }

        const smartContext = {
          session: {
            id: sessionId,
            duration: Date.now() - context.timestamp,
            messageCount: context.conversationHistory.length
          },
          page: {
            url: context.currentUrl,
            title: context.pageTitle,
            hasContent: !!context.pageContent
          },
          conversation: {
            intent: this.analyzeUserIntent(context.conversationHistory.map(m => m.content).join(' ')),
            topics: this.extractTopics(context.conversationHistory),
            lastUserMessage: context.conversationHistory.filter(m => m.isUser).slice(-1)[0]?.content || ''
          },
          agent: context.agentContext || {}
        }

        resolve(smartContext)

      } catch (error) {
        logger.error('Failed to build smart context', error as Error)
        resolve({})
      }
    })
  }

  private extractTopics(messages: AIMessage[]): string[] {
    // Simple topic extraction - in production would use NLP
    const text = messages.map(m => m.content).join(' ').toLowerCase()
    const commonTopics = ['ai', 'research', 'shopping', 'browser', 'automation', 'analysis']
    
    return commonTopics.filter(topic => text.includes(topic))
  }

  // Event handlers for app events
  handlePageLoad(data: { tabId: string; url: string; title: string }): void {
    if (this.currentSessionId) {
      this.updateConversationContext(this.currentSessionId, {
        currentUrl: data.url,
        pageTitle: data.title
      })
    }

    appEvents.emit('page:loaded', { 
      tabId: data.tabId, 
      url: data.url, 
      title: data.title 
    })
  }

  handleContentUpdate(data: { content: string }): void {
    if (this.currentSessionId) {
      this.updateConversationContext(this.currentSessionId, {
        pageContent: data.content
      })
    }
  }

  cleanup(): void {
    try {
      // Clean up old conversations
      const cutoff = Date.now() - this.contextTimeoutMs
      
      for (const [sessionId, context] of this.conversations) {
        if (context.timestamp < cutoff) {
          this.conversations.delete(sessionId)
          logger.debug(`Cleaned up old conversation: ${sessionId}`)
        }
      }

      // Clean up context memory
      this.contextMemory.clear()

      logger.info('Conversation manager cleanup completed')

    } catch (error) {
      logger.error('Failed to cleanup conversation manager', error as Error)
    }
  }
}

export default ConversationManager