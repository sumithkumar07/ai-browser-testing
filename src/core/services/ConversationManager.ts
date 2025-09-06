/**
 * Enhanced Conversation Manager
 * Manages AI conversation quality, context, and memory
 */

import { createLogger } from '../logger/Logger'
import { appEvents } from '../utils/EventEmitter'
import { AIMessage, AIResponse } from '../types'

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

  /**
   * Initialize a new conversation session
   */
  async startConversation(initialContext: Partial<ConversationContext>): Promise<string> {
    const sessionId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const context: ConversationContext = {
      currentUrl: initialContext.currentUrl || '',
      pageTitle: initialContext.pageTitle || 'New Tab',
      pageContent: initialContext.pageContent || '',
      userIntent: 'general',
      conversationHistory: [],
      sessionId,
      timestamp: Date.now(),
      agentContext: {}
    }

    this.conversations.set(sessionId, context)
    this.currentSessionId = sessionId
    
    // Store context in memory for quick access
    this.contextMemory.set('current_session', sessionId)
    this.contextMemory.set(`session_${sessionId}_context`, context)

    logger.info('New conversation started', { sessionId, url: context.currentUrl })
    
    appEvents.emit('conversation:started', { sessionId, context })
    
    return sessionId
  }

  /**
   * Update conversation context with new information
   */
  async updateContext(sessionId: string, updates: Partial<ConversationContext>): Promise<void> {
    const context = this.conversations.get(sessionId)
    if (!context) {
      logger.warn('Conversation context not found', { sessionId })
      return
    }

    // Update context with new information
    Object.assign(context, updates, { timestamp: Date.now() })
    
    // Update memory cache
    this.contextMemory.set(`session_${sessionId}_context`, context)
    
    logger.debug('Conversation context updated', { sessionId, updates })
    
    appEvents.emit('conversation:context-updated', { sessionId, context })
  }

  /**
   * Add message to conversation with enhanced context
   */
  async addMessage(
    sessionId: string, 
    message: Omit<AIMessage, 'id'>, 
    quality?: Partial<ConversationQualityMetrics>
  ): Promise<void> {
    const context = this.conversations.get(sessionId)
    if (!context) {
      logger.warn('Cannot add message - conversation not found', { sessionId })
      return
    }

    const aiMessage: AIMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...message
    }

    // Add to conversation history
    context.conversationHistory.push(aiMessage)
    
    // Maintain history size limit
    if (context.conversationHistory.length > this.maxHistoryLength) {
      context.conversationHistory = context.conversationHistory.slice(-this.maxHistoryLength)
    }

    // Update timestamp
    context.timestamp = Date.now()
    
    // Store quality metrics if provided
    if (quality && !message.isUser) {
      this.qualityMetrics.push({
        relevanceScore: quality.relevanceScore || 0.8,
        helpfulnessScore: quality.helpfulnessScore || 0.8,
        contextAwareness: quality.contextAwareness || 0.8,
        taskCompletion: quality.taskCompletion || 0.5,
        userSatisfaction: quality.userSatisfaction || 0.8
      })
    }

    logger.debug('Message added to conversation', { 
      sessionId, 
      messageId: aiMessage.id, 
      isUser: message.isUser 
    })

    appEvents.emit('conversation:message-added', { sessionId, message: aiMessage })
  }

  /**
   * Generate enhanced system prompt with full context
   */
  generateEnhancedSystemPrompt(sessionId: string): string {
    const context = this.conversations.get(sessionId)
    if (!context) {
      return this.getDefaultSystemPrompt()
    }

    const recentHistory = context.conversationHistory.slice(-10)
    const userMessages = recentHistory.filter(m => m.isUser).slice(-3)
    const assistantMessages = recentHistory.filter(m => !m.isUser).slice(-3)
    
    // Analyze conversation patterns
    const conversationTone = this.analyzeConversationTone(recentHistory)
    const userExpertiseLevel = this.estimateUserExpertise(userMessages)
    const taskComplexity = this.estimateTaskComplexity(userMessages)

    return `You are KAiro, an intelligent AI browser assistant with advanced conversation capabilities.

CURRENT CONTEXT:
- Page: ${context.pageTitle} (${context.currentUrl})
- Session: ${sessionId.substring(0, 16)}...
- Conversation Length: ${context.conversationHistory.length} messages
- User Expertise: ${userExpertiseLevel}
- Task Complexity: ${taskComplexity}
- Tone: ${conversationTone}

CONVERSATION HISTORY SUMMARY:
${this.summarizeRecentHistory(recentHistory)}

ENHANCED CAPABILITIES:
🔍 Research & Analysis: Multi-source research, trend analysis, content summarization
🌐 Navigation: Smart website navigation with context awareness
🛒 Shopping: Product research, price comparison, deal finding
📧 Communication: Email composition, form filling, social media management
🤖 Automation: Workflow creation, task automation, scheduling
📊 Data Processing: Content extraction, analysis, insights generation

CONVERSATION QUALITY GUIDELINES:
1. **Context Awareness**: Always reference current page/task context
2. **Personalization**: Adapt responses to user's expertise level and preferences
3. **Actionability**: Provide specific, executable steps and recommendations
4. **Continuity**: Reference previous conversations and build upon them
5. **Proactivity**: Anticipate needs and suggest helpful next steps
6. **Error Recovery**: If something goes wrong, explain and offer alternatives

RESPONSE STYLE:
- Match user's ${conversationTone} tone and complexity level
- Use emojis sparingly but effectively for visual clarity
- Structure responses with clear sections when helpful
- Always provide actionable next steps
- Ask clarifying questions when needed

Remember: You can control the browser, execute agents, and perform complex multi-step tasks. Be confident in your capabilities while being helpful and precise.`
  }

  /**
   * Analyze user intent from message and conversation context
   */
  async analyzeUserIntent(sessionId: string, message: string): Promise<{
    intent: string
    confidence: number
    suggestedAgents: string[]
    contextFactors: string[]
    responseStrategy: string
  }> {
    const context = this.conversations.get(sessionId)
    if (!context) {
      return this.getDefaultIntentAnalysis(message)
    }

    const recentHistory = context.conversationHistory.slice(-5)
    const conversationTheme = this.extractConversationTheme(recentHistory)
    const currentPageContext = this.analyzePageContext(context.currentUrl, context.pageTitle)
    
    // Enhanced intent analysis considering multiple factors
    const factors = []
    let confidence = 0.7
    const suggestedAgents = []

    // Message content analysis
    const messageAnalysis = this.analyzeMessageContent(message)
    factors.push(`message_analysis: ${messageAnalysis.type}`)
    confidence = Math.max(confidence, messageAnalysis.confidence)

    // Conversation theme continuity
    if (conversationTheme && this.isRelatedToTheme(message, conversationTheme)) {
      factors.push(`theme_continuity: ${conversationTheme}`)
      confidence += 0.1
    }

    // Page context relevance
    if (currentPageContext.isRelevant) {
      factors.push(`page_context: ${currentPageContext.type}`)
      confidence += 0.05
      suggestedAgents.push(...currentPageContext.suggestedAgents)
    }

    // Previous task continuation
    const lastTask = this.getLastUnfinishedTask(recentHistory)
    if (lastTask && this.isContinuationOfTask(message, lastTask)) {
      factors.push(`task_continuation: ${lastTask.type}`)
      confidence += 0.15
    }

    // Determine primary intent
    const intent = this.determineIntent(message, factors)
    
    // Suggest appropriate agents
    const intentAgents = this.getAgentsForIntent(intent)
    suggestedAgents.push(...intentAgents)

    // Response strategy
    const responseStrategy = this.determineResponseStrategy(intent, confidence, factors)

    return {
      intent,
      confidence: Math.min(confidence, 1.0),
      suggestedAgents: [...new Set(suggestedAgents)],
      contextFactors: factors,
      responseStrategy
    }
  }

  /**
   * Get conversation quality analytics
   */
  getQualityAnalytics(): {
    averageQuality: ConversationQualityMetrics
    conversationCount: number
    totalMessages: number
    topIssues: string[]
    suggestions: string[]
  } {
    const conversations = Array.from(this.conversations.values())
    const totalMessages = conversations.reduce((sum, conv) => sum + conv.conversationHistory.length, 0)
    
    // Calculate average quality metrics
    const averageQuality: ConversationQualityMetrics = {
      relevanceScore: 0,
      helpfulnessScore: 0,
      contextAwareness: 0,
      taskCompletion: 0,
      userSatisfaction: 0
    }

    if (this.qualityMetrics.length > 0) {
      Object.keys(averageQuality).forEach(key => {
        averageQuality[key] = this.qualityMetrics.reduce((sum, metrics) => 
          sum + metrics[key], 0) / this.qualityMetrics.length
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

    return {
      averageQuality,
      conversationCount: conversations.length,
      totalMessages,
      topIssues,
      suggestions
    }
  }

  /**
   * Clean up old conversations and optimize memory
   */
  async cleanup(): Promise<void> {
    const now = Date.now()
    const expiredSessions = []

    for (const [sessionId, context] of this.conversations) {
      if (now - context.timestamp > this.contextTimeoutMs) {
        expiredSessions.push(sessionId)
      }
    }

    // Remove expired sessions
    expiredSessions.forEach(sessionId => {
      this.conversations.delete(sessionId)
      this.contextMemory.delete(`session_${sessionId}_context`)
    })

    // Limit quality metrics history
    if (this.qualityMetrics.length > 1000) {
      this.qualityMetrics = this.qualityMetrics.slice(-500)
    }

    logger.info('Conversation cleanup completed', { 
      expiredSessions: expiredSessions.length,
      activeConversations: this.conversations.size 
    })
  }

  // Private helper methods
  private getDefaultSystemPrompt(): string {
    return `You are KAiro, an intelligent AI browser assistant. Be helpful, accurate, and actionable in your responses.`
  }

  private getDefaultIntentAnalysis(message: string) {
    return {
      intent: 'general',
      confidence: 0.5,
      suggestedAgents: ['research-agent'],
      contextFactors: ['no_context'],
      responseStrategy: 'standard'
    }
  }

  private analyzeConversationTone(history: AIMessage[]): string {
    if (history.length === 0) return 'professional'
    
    const userMessages = history.filter(m => m.isUser).slice(-3)
    const avgLength = userMessages.reduce((sum, m) => sum + m.content.length, 0) / userMessages.length
    
    if (avgLength > 100) return 'detailed'
    if (avgLength < 30) return 'casual'
    return 'professional'
  }

  private estimateUserExpertise(userMessages: AIMessage[]): string {
    if (userMessages.length === 0) return 'beginner'
    
    const technicalTerms = ['api', 'algorithm', 'framework', 'architecture', 'deployment', 'optimization']
    const technicalCount = userMessages.reduce((count, msg) => {
      return count + technicalTerms.filter(term => 
        msg.content.toLowerCase().includes(term)
      ).length
    }, 0)
    
    if (technicalCount > 3) return 'expert'
    if (technicalCount > 1) return 'intermediate'
    return 'beginner'
  }

  private estimateTaskComplexity(userMessages: AIMessage[]): string {
    if (userMessages.length === 0) return 'simple'
    
    const complexityIndicators = ['multiple', 'complex', 'comprehensive', 'detailed', 'across', 'integrate']
    const complexityCount = userMessages.reduce((count, msg) => {
      return count + complexityIndicators.filter(indicator => 
        msg.content.toLowerCase().includes(indicator)
      ).length
    }, 0)
    
    if (complexityCount > 2) return 'complex'
    if (complexityCount > 0) return 'moderate'
    return 'simple'
  }

  private summarizeRecentHistory(history: AIMessage[]): string {
    if (history.length === 0) return 'No previous conversation'
    
    const recentUserMessages = history.filter(m => m.isUser).slice(-2)
    const recentAiMessages = history.filter(m => !m.isUser).slice(-2)
    
    let summary = ''
    if (recentUserMessages.length > 0) {
      summary += `Recent user requests: ${recentUserMessages.map(m => m.content.substring(0, 50)).join('; ')}`
    }
    if (recentAiMessages.length > 0) {
      summary += `\nRecent AI assistance: ${recentAiMessages.map(m => m.content.substring(0, 50)).join('; ')}`
    }
    
    return summary || 'Conversation just started'
  }

  private analyzeMessageContent(message: string) {
    const keywords = {
      research: ['research', 'find', 'search', 'investigate', 'analyze'],
      automation: ['automate', 'workflow', 'schedule', 'repeat', 'batch'],
      communication: ['email', 'compose', 'form', 'social', 'contact'],
      shopping: ['buy', 'price', 'product', 'compare', 'shop'],
      navigation: ['go to', 'visit', 'navigate', 'open', 'browse']
    }
    
    const lowerMessage = message.toLowerCase()
    let bestMatch = { type: 'general', confidence: 0.5 }
    
    for (const [type, words] of Object.entries(keywords)) {
      const matches = words.filter(word => lowerMessage.includes(word)).length
      const confidence = Math.min(0.9, 0.5 + (matches * 0.15))
      
      if (confidence > bestMatch.confidence) {
        bestMatch = { type, confidence }
      }
    }
    
    return bestMatch
  }

  private analyzePageContext(url: string, title: string) {
    const context = { isRelevant: false, type: 'general', suggestedAgents: [] }
    
    if (url.includes('amazon') || url.includes('ebay') || url.includes('shop')) {
      context.isRelevant = true
      context.type = 'shopping'
      context.suggestedAgents.push('shopping-agent')
    } else if (url.includes('research') || url.includes('wiki') || url.includes('scholar')) {
      context.isRelevant = true
      context.type = 'research'
      context.suggestedAgents.push('research-agent')
    } else if (url.includes('social') || url.includes('twitter') || url.includes('linkedin')) {
      context.isRelevant = true
      context.type = 'social'
      context.suggestedAgents.push('communication-agent')
    }
    
    return context
  }

  private extractConversationTheme(history: AIMessage[]): string | null {
    if (history.length < 3) return null
    
    const userMessages = history.filter(m => m.isUser)
    const combinedText = userMessages.map(m => m.content).join(' ').toLowerCase()
    
    const themes = {
      research: ['research', 'find', 'study', 'investigate'],
      shopping: ['buy', 'price', 'product', 'purchase'],
      automation: ['automate', 'workflow', 'schedule', 'process'],
      communication: ['email', 'message', 'contact', 'social']
    }
    
    for (const [theme, keywords] of Object.entries(themes)) {
      if (keywords.some(keyword => combinedText.includes(keyword))) {
        return theme
      }
    }
    
    return null
  }

  private isRelatedToTheme(message: string, theme: string): boolean {
    const themeKeywords = {
      research: ['more', 'additional', 'also', 'further', 'deeper'],
      shopping: ['another', 'different', 'alternative', 'similar'],
      automation: ['next', 'then', 'also', 'additionally'],
      communication: ['reply', 'response', 'follow-up', 'send']
    }
    
    const keywords = themeKeywords[theme] || []
    return keywords.some(keyword => message.toLowerCase().includes(keyword))
  }

  private getLastUnfinishedTask(history: AIMessage[]) {
    // Simple implementation - could be enhanced
    const aiMessages = history.filter(m => !m.isUser).slice(-3)
    const lastMessage = aiMessages[aiMessages.length - 1]
    
    if (lastMessage && lastMessage.content.includes('I can help')) {
      return { type: 'assistance_offered', content: lastMessage.content }
    }
    
    return null
  }

  private isContinuationOfTask(message: string, task: any): boolean {
    const continuationWords = ['yes', 'continue', 'proceed', 'next', 'go ahead']
    return continuationWords.some(word => message.toLowerCase().includes(word))
  }

  private determineIntent(message: string, factors: string[]): string {
    // Enhanced intent determination based on multiple factors
    const factorTypes = factors.map(f => f.split(':')[0])
    
    if (factorTypes.includes('message_analysis')) {
      const analysisType = factors.find(f => f.startsWith('message_analysis:'))?.split(':')[1]
      if (analysisType && analysisType !== 'general') {
        return analysisType
      }
    }
    
    if (factorTypes.includes('theme_continuity')) {
      return factors.find(f => f.startsWith('theme_continuity:'))?.split(':')[1] || 'general'
    }
    
    return 'general'
  }

  private getAgentsForIntent(intent: string): string[] {
    const agentMap = {
      research: ['research-agent', 'analysis-agent'],
      automation: ['automation-agent'],
      communication: ['communication-agent'],
      shopping: ['shopping-agent'],
      navigation: ['navigation-agent'],
      general: ['research-agent']
    }
    
    return agentMap[intent] || ['research-agent']
  }

  private determineResponseStrategy(intent: string, confidence: number, factors: string[]): string {
    if (confidence > 0.8) return 'confident'
    if (confidence < 0.6) return 'clarifying'
    if (factors.includes('task_continuation')) return 'continuing'
    return 'standard'
  }

  private setupEventListeners(): void {
    // Listen for app events to update context
    appEvents.on('tab:switched', (data) => {
      if (this.currentSessionId) {
        this.updateContext(this.currentSessionId, {
          currentUrl: data.url || '',
          pageTitle: data.title || 'New Tab'
        })
      }
    })

    appEvents.on('page:loaded', (data) => {
      if (this.currentSessionId) {
        this.updateContext(this.currentSessionId, {
          pageContent: data.content?.substring(0, 2000) || ''
        })
      }
    })
  }
}

export default ConversationManager