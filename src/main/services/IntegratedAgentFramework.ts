/**
 * Integrated Agent Framework
 * Updated to use unified services and enhanced error handling
 */

import { createLogger } from '../../core/logger/Logger'
import { appEvents } from '../../core/utils/EventEmitter'
import { validateAgentTask } from '../../core/utils/Validators'
import EnhancedAgentSystem from '../../core/services/EnhancedAgentSystem'
import UnifiedAIService from '../../core/services/UnifiedAIService'
import MemoryManager from '../../core/services/MemoryManager'
import { AgentStatus, AgentCapability, AgentTask } from '../../core/types'

const logger = createLogger('IntegratedAgentFramework')

export interface Agent {
  id: string
  name: string
  type: string
  capabilities: AgentCapability[]
  execute(task: string): Promise<any>
}

export class IntegratedAgentFramework {
  private static instance: IntegratedAgentFramework
  private agents: Map<string, Agent> = new Map()
  private agentSystem: EnhancedAgentSystem
  private aiService: UnifiedAIService
  private memoryManager: MemoryManager
  private eventListeners: Map<string, Function[]> = new Map()
  private isInitialized = false

  private constructor() {
    this.agentSystem = EnhancedAgentSystem.getInstance()
    this.aiService = UnifiedAIService.getInstance()
    this.memoryManager = MemoryManager.getInstance()
  }

  static getInstance(): IntegratedAgentFramework {
    if (!IntegratedAgentFramework.instance) {
      IntegratedAgentFramework.instance = new IntegratedAgentFramework()
    }
    return IntegratedAgentFramework.instance
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      logger.warn('Agent Framework already initialized')
      return
    }

    try {
      logger.info('Initializing Integrated Agent Framework')

      // Initialize AI service
      await this.aiService.initialize()

      // Register built-in agents
      this.registerAgent(new ResearchAgent(this.aiService))
      this.registerAgent(new NavigationAgent())
      this.registerAgent(new AnalysisAgent(this.aiService))
      this.registerAgent(new ShoppingAgent(this.aiService))
      this.registerAgent(new CommunicationAgent(this.aiService))
      this.registerAgent(new AutomationAgent(this.aiService))

      // Set up event listeners
      this.setupEventListeners()

      this.isInitialized = true
      logger.info('Agent Framework initialized successfully')

    } catch (error) {
      logger.error('Failed to initialize Agent Framework', error as Error)
      throw error
    }
  }

  /**
   * Process user input and assign to appropriate agent
   */
  async processUserInput(input: string): Promise<{ success: boolean; taskId?: string; error?: string }> {
    try {
      validateAgentTask(input)
      logger.info('Processing user input', { input })

      // Analyze intent and select agent
      const intentAnalysis = await this.analyzeIntent(input)
      const selectedAgent = this.selectAgent(intentAnalysis)

      logger.debug('Agent selected', { 
        agentId: selectedAgent.id, 
        confidence: intentAnalysis.confidence 
      })

      // Execute task through enhanced agent system
      const result = await this.agentSystem.executeTask(input, {
        timeout: 300000, // 5 minutes
        maxRetries: 2,
        onProgress: (status: AgentStatus) => {
          this.emitEvent('agent-update', status)
        }
      })

      if (result.success) {
        logger.info('Agent task completed', { taskId: result.taskId })
        return { success: true, taskId: result.taskId }
      } else {
        logger.error('Agent task failed', { error: result.error, taskId: result.taskId })
        return { success: false, error: result.error, taskId: result.taskId }
      }

    } catch (error) {
      logger.error('Failed to process user input', error as Error)
      return { success: false, error: (error as Error).message }
    }
  }

  /**
   * Cancel an active task
   */
  async cancelTask(taskId: string): Promise<{ success: boolean; error?: string }> {
    try {
      logger.info('Cancelling task', { taskId })
      return await this.agentSystem.cancelTask(taskId)
    } catch (error) {
      logger.error('Failed to cancel task', error as Error, { taskId })
      return { success: false, error: (error as Error).message }
    }
  }

  /**
   * Get status of all active tasks
   */
  getActiveTasks(): AgentTask[] {
    return this.agentSystem.getActiveTasks()
  }

  /**
   * Get agent metrics
   */
  getMetrics() {
    return this.agentSystem.getMetrics()
  }

  /**
   * Register a new agent
   */
  registerAgent(agent: Agent): void {
    this.agents.set(agent.id, agent)
    logger.info('Agent registered', { agentId: agent.id, name: agent.name })
  }

  /**
   * Get available agents
   */
  getAvailableAgents(): Agent[] {
    return Array.from(this.agents.values())
  }

  /**
   * Event listener management
   */
  addEventListener(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event)!.push(callback)
  }

  removeEventListener(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      const index = listeners.indexOf(callback)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  private emitEvent(event: string, data: any): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          logger.error('Event listener error', error as Error, { event })
        }
      })
    }
  }

  /**
   * Analyze user intent using AI
   */
  private async analyzeIntent(input: string): Promise<{
    intent: string
    confidence: number
    entities: string[]
    agentType: string
  }> {
    try {
      const prompt = `Analyze this user request and determine the intent: "${input}"
      
      Respond with JSON format:
      {
        "intent": "research|navigation|analysis|shopping|general",
        "confidence": 0.0-1.0,
        "entities": ["key", "entities"],
        "agentType": "research|navigation|analysis|shopping"
      }`

      const response = await this.aiService.sendMessage(prompt)
      
      if (response.success && response.result) {
        try {
          const analysis = JSON.parse(response.result)
          return {
            intent: analysis.intent || 'general',
            confidence: analysis.confidence || 0.5,
            entities: analysis.entities || [],
            agentType: analysis.agentType || 'research'
          }
        } catch {
          // Fallback to simple keyword analysis
          return this.simpleIntentAnalysis(input)  
        }
      }

      return this.simpleIntentAnalysis(input)

    } catch (error) {
      logger.warn('Intent analysis failed, using fallback', error as Error)
      return this.simpleIntentAnalysis(input)
    }
  }

  /**
   * Simple keyword-based intent analysis fallback
   */
  private simpleIntentAnalysis(input: string): {
    intent: string
    confidence: number
    entities: string[]
    agentType: string
  } {
    const lowerInput = input.toLowerCase()
    
    // Research keywords - High priority patterns
    const researchKeywords = ['research', 'find', 'search', 'investigate', 'explore', 'discover', 'study', 'examine', 'top', 'best', 'list', 'websites', 'sources']
    const researchScore = researchKeywords.filter(keyword => lowerInput.includes(keyword)).length
    
    // Navigation keywords
    const navigationKeywords = ['navigate', 'go to', 'visit', 'open', 'browse', 'url', 'website', 'site', 'page']
    const navigationScore = navigationKeywords.filter(keyword => lowerInput.includes(keyword)).length
    
    // Analysis keywords
    const analysisKeywords = ['analyze', 'analysis', 'summarize', 'summary', 'extract', 'insights', 'review', 'evaluate', 'assess', 'interpret']
    const analysisScore = analysisKeywords.filter(keyword => lowerInput.includes(keyword)).length
    
    // Shopping keywords - Enhanced detection
    const shoppingKeywords = ['shop', 'shopping', 'buy', 'purchase', 'price', 'cost', 'product', 'compare', 'deal', 'discount', 'sale', 'cheap', 'expensive', 'review', 'rating', 'cart', 'order']
    const shoppingScore = shoppingKeywords.filter(keyword => lowerInput.includes(keyword)).length
    
    // Multi-step/complex task indicators
    const complexKeywords = ['create', 'generate', 'make', 'build', 'compile', 'organize', 'multiple', 'several', 'across', 'comprehensive', 'detailed']
    const complexScore = complexKeywords.filter(keyword => lowerInput.includes(keyword)).length
    
    // Calculate scores
    const scores = {
      research: researchScore + (complexScore * 0.5),
      navigation: navigationScore,
      analysis: analysisScore + (complexScore * 0.3),
      shopping: shoppingScore
    }
    
    // Complex query detection (>50 characters or multiple sentences)
    const isComplexQuery = input.length > 50 || input.includes('.') || input.includes('?') || complexScore > 0
    
    // Determine best agent based on scores
    const maxScore = Math.max(...Object.values(scores))
    const bestAgent = Object.keys(scores).find(key => scores[key] === maxScore)
    
    // Confidence calculation
    let confidence = 0.6 // Base confidence
    if (maxScore >= 2) confidence = 0.8
    if (maxScore >= 3) confidence = 0.9
    if (isComplexQuery) confidence += 0.1
    
    // Extract entities based on detected keywords
    const entities = []
    if (scores.research > 0) entities.push('research')
    if (scores.navigation > 0) entities.push('navigation') 
    if (scores.analysis > 0) entities.push('analysis')
    if (scores.shopping > 0) entities.push('shopping')
    if (isComplexQuery) entities.push('complex')
    
    return {
      intent: bestAgent || 'research',
      confidence: Math.min(confidence, 1.0),
      entities,
      agentType: bestAgent || 'research'
    }
  }

  /**
   * Select appropriate agent based on intent analysis
   */
  private selectAgent(intentAnalysis: any): Agent {
    const preferredType = intentAnalysis.agentType
    const agent = Array.from(this.agents.values()).find(a => a.type === preferredType)
    
    if (agent) {
      return agent
    }
    
    // Fallback to research agent
    return Array.from(this.agents.values())[0]
  }

  /**
   * Set up event listeners
   */
  private setupEventListeners(): void {
    // Listen for memory cleanup events
    appEvents.on('memory:cleanup-complete', (data) => {
      logger.debug('Memory cleanup completed', data)
    })

    // Listen for AI service events
    appEvents.on('ai:message', (data) => {
      logger.debug('AI message processed', data)
    })
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    logger.info('Cleaning up Integrated Agent Framework')

    await this.agentSystem.cleanup()
    await this.aiService.cleanup()

    this.agents.clear()
    this.eventListeners.clear()
    this.isInitialized = false

    logger.info('Agent Framework cleanup complete')
  }
}

// Agent Implementations
class ResearchAgent implements Agent {
  id = 'research-agent'
  name = 'Research Agent'
  type = 'research'
  capabilities: AgentCapability[] = [
    {
      id: 'web-research',
      name: 'Web Research',
      description: 'Research topics by navigating websites and gathering information',
      category: 'research',
      requiredPermissions: ['web-navigation', 'content-extraction'],
      estimatedDuration: 30000
    },
    {
      id: 'multi-source-research',
      name: 'Multi-Source Research',
      description: 'Comprehensive research across multiple authoritative sources',
      category: 'research',
      requiredPermissions: ['web-navigation', 'content-extraction'],
      estimatedDuration: 60000
    },
    {
      id: 'trend-analysis',
      name: 'Trend Analysis',
      description: 'Analyze trends and developments in specific topics',
      category: 'analysis',
      requiredPermissions: ['web-navigation', 'content-extraction'],
      estimatedDuration: 45000
    }
  ]

  constructor(private aiService: UnifiedAIService) {}

  async execute(task: string): Promise<any> {
    logger.info('Executing research task', { task })
    
    // Enhanced research strategy with complexity detection
    const complexity = this.assessComplexity(task)
    
    let prompt = ''
    if (complexity.level === 'comprehensive') {
      prompt = `Create a comprehensive research strategy for: ${task}. This is a complex topic requiring:
      1. 5-7 authoritative sources to investigate
      2. Key research questions to address
      3. Multiple perspectives to explore
      4. Current trends and developments
      5. Practical applications and implications
      Provide detailed research plan with specific sources and methodology.`
    } else if (complexity.level === 'detailed') {
      prompt = `Create a detailed research strategy for: ${task}. Include:
      1. 3-5 reliable sources to check
      2. Key information to gather
      3. Important aspects to investigate
      4. Recent developments
      Provide structured research approach.`
    } else {
      prompt = `Create a research strategy for: ${task}. List 3-4 specific websites to visit and what to look for. Focus on getting accurate, up-to-date information.`
    }
    
    const strategy = await this.aiService.sendMessage(prompt)

    if (strategy.success) {
      return {
        type: 'research_completed',
        strategy: strategy.result,
        complexity: complexity,
        estimatedDuration: complexity.estimatedTime,
        timestamp: Date.now()
      }
    }

    throw new Error('Failed to generate research strategy')
  }
  
  private assessComplexity(task: string): {
    level: 'basic' | 'detailed' | 'comprehensive'
    estimatedTime: number
    factors: string[]
  } {
    const complexityIndicators = {
      comprehensive: ['comprehensive', 'detailed', 'in-depth', 'thorough', 'complete', 'extensive', 'analysis', 'trends', 'developments', 'multiple', 'across', 'compare'],
      detailed: ['research', 'find', 'investigate', 'explore', 'study', 'examine', 'top', 'best', 'latest', 'current'],
      basic: ['what', 'how', 'when', 'where', 'simple', 'quick', 'basic']
    }
    
    const lowerTask = task.toLowerCase()
    const factors = []
    
    let comprehensiveScore = 0
    let detailedScore = 0
    let basicScore = 0
    
    for (const indicator of complexityIndicators.comprehensive) {
      if (lowerTask.includes(indicator)) {
        comprehensiveScore++
        factors.push(`comprehensive: ${indicator}`)
      }
    }
    
    for (const indicator of complexityIndicators.detailed) {
      if (lowerTask.includes(indicator)) {
        detailedScore++
        factors.push(`detailed: ${indicator}`)
      }
    }
    
    for (const indicator of complexityIndicators.basic) {
      if (lowerTask.includes(indicator)) {
        basicScore++
        factors.push(`basic: ${indicator}`)
      }
    }
    
    // Length-based complexity
    if (task.length > 100) comprehensiveScore++
    if (task.length > 50) detailedScore++
    
    // Multiple sentences indicate complexity
    if (task.includes('.') || task.includes('?') || task.includes('!')) {
      comprehensiveScore++
    }
    
    if (comprehensiveScore >= 2) {
      return { level: 'comprehensive', estimatedTime: 60000, factors }
    } else if (detailedScore >= 1 || comprehensiveScore >= 1) {
      return { level: 'detailed', estimatedTime: 30000, factors }
    } else {
      return { level: 'basic', estimatedTime: 15000, factors }
    }
  }
}

class NavigationAgent implements Agent {
  id = 'navigation-agent'
  name = 'Navigation Agent'
  type = 'navigation'
  capabilities: AgentCapability[] = [
    {
      id: 'web-navigation',
      name: 'Web Navigation',
      description: 'Navigate to websites and perform actions',
      category: 'automation',
      requiredPermissions: ['web-navigation'],
      estimatedDuration: 5000
    }
  ]

  async execute(task: string): Promise<any> {
    logger.info('Executing navigation task', { task })
    
    // Enhanced URL extraction with better patterns
    const urlPatterns = [
      /(?:go to|visit|navigate to|open|browse)\s+((?:https?:\/\/)?[^\s]+)/i,
      /(?:website|site|url):\s*((?:https?:\/\/)?[^\s]+)/i,
      /((?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*(?:\/[^\s]*)?)/i
    ]
    
    let url = null
    for (const pattern of urlPatterns) {
      const match = task.match(pattern)
      if (match) {
        url = match[1] || match[0]
        break
      }
    }
    
    // Smart URL processing
    if (url) {
      // Clean up the URL
      url = url.replace(/[^\w\-\.\/\:]/g, '')
      
      // Add protocol if missing
      if (!url.startsWith('http')) {
        url = `https://${url}`
      }
      
      return {
        type: 'navigation',
        action: 'navigate',
        target: url,
        timestamp: Date.now(),
        confidence: 0.9
      }
    }
    
    // Fallback: try to extract domain names
    const domainMatch = task.match(/([a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.(?:com|org|net|edu|gov|io|co|ai))/i)
    if (domainMatch) {
      return {
        type: 'navigation',
        action: 'navigate', 
        target: `https://${domainMatch[0]}`,
        timestamp: Date.now(),
        confidence: 0.7
      }
    }

    throw new Error('No valid URL found in navigation task')
  }
}

class AnalysisAgent implements Agent {
  id = 'analysis-agent'
  name = 'Analysis Agent'
  type = 'analysis'
  capabilities: AgentCapability[] = [
    {
      id: 'content-analysis',
      name: 'Content Analysis',
      description: 'Analyze web page content and provide insights',
      category: 'analysis',
      requiredPermissions: ['content-extraction'],
      estimatedDuration: 15000
    },
    {
      id: 'sentiment-analysis',
      name: 'Sentiment Analysis',
      description: 'Analyze sentiment and tone of content',
      category: 'analysis', 
      requiredPermissions: ['content-extraction'],
      estimatedDuration: 10000
    },
    {
      id: 'data-extraction',
      name: 'Data Extraction', 
      description: 'Extract structured data and key information',
      category: 'analysis',
      requiredPermissions: ['content-extraction'],
      estimatedDuration: 20000
    }
  ]

  constructor(private aiService: UnifiedAIService) {}

  async execute(task: string): Promise<any> {
    logger.info('Executing analysis task', { task })
    
    // Determine analysis type from task
    const analysisType = this.determineAnalysisType(task)
    
    let analysisResult
    if (analysisType.includes('sentiment')) {
      analysisResult = await this.performSentimentAnalysis(task)
    } else if (analysisType.includes('extract')) {
      analysisResult = await this.performDataExtraction(task)
    } else {
      analysisResult = await this.performContentAnalysis(task)
    }
    
    if (analysisResult.success) {
      return {
        type: 'analysis_completed',
        analysisType: analysisType,
        analysis: analysisResult.data,
        insights: analysisResult.insights,
        timestamp: Date.now()
      }
    }

    throw new Error('Failed to analyze content')
  }
  
  private determineAnalysisType(task: string): string[] {
    const lowerTask = task.toLowerCase()
    const types = []
    
    if (lowerTask.includes('sentiment') || lowerTask.includes('tone') || lowerTask.includes('feeling')) {
      types.push('sentiment')
    }
    if (lowerTask.includes('extract') || lowerTask.includes('data') || lowerTask.includes('information')) {
      types.push('extract')
    }
    if (lowerTask.includes('analyze') || lowerTask.includes('insights') || lowerTask.includes('summary')) {
      types.push('content')
    }
    
    return types.length > 0 ? types : ['content']
  }
  
  private async performContentAnalysis(task: string): Promise<any> {
    const analysis = await this.aiService.analyzeContent()
    
    if (analysis.success) {
      // Enhanced analysis with additional AI insights
      const insights = await this.aiService.sendMessage(
        `Based on this content analysis request: "${task}", provide additional insights, key takeaways, and actionable recommendations.`
      )
      
      return {
        success: true,
        data: analysis.data,
        insights: insights.success ? insights.result : 'Additional insights unavailable'
      }
    }
    
    return analysis
  }
  
  private async performSentimentAnalysis(task: string): Promise<any> {
    const sentimentAnalysis = await this.aiService.sendMessage(
      `Analyze the sentiment and emotional tone of the current page content. Provide: 1) Overall sentiment (positive/negative/neutral), 2) Key emotional indicators, 3) Tone analysis, 4) Context interpretation. Task context: ${task}`
    )
    
    return {
      success: sentimentAnalysis.success,
      data: sentimentAnalysis.result,
      insights: sentimentAnalysis.success ? 'Sentiment analysis completed' : 'Analysis failed'
    }
  }
  
  private async performDataExtraction(task: string): Promise<any> {
    const extraction = await this.aiService.sendMessage(
      `Extract structured data and key information from the current page. Focus on: 1) Important facts and figures, 2) Key entities (people, companies, dates), 3) Main topics and themes, 4) Actionable information. Task context: ${task}`
    )
    
    return {
      success: extraction.success,
      data: extraction.result,
      insights: extraction.success ? 'Data extraction completed' : 'Extraction failed'
    }
  }
}

class ShoppingAgent implements Agent {
  id = 'shopping-agent'
  name = 'Shopping Agent'
  type = 'shopping'
  capabilities: AgentCapability[] = [
    {
      id: 'product-research',
      name: 'Product Research',
      description: 'Research products and compare prices',
      category: 'research',
      requiredPermissions: ['web-navigation', 'content-extraction'],
      estimatedDuration: 45000
    },
    {
      id: 'price-comparison',
      name: 'Price Comparison',
      description: 'Compare prices across multiple retailers',
      category: 'analysis',
      requiredPermissions: ['web-navigation', 'content-extraction'],
      estimatedDuration: 30000
    },
    {
      id: 'deal-finder',
      name: 'Deal Finder',
      description: 'Find deals, discounts, and best offers',
      category: 'research',
      requiredPermissions: ['web-navigation'],
      estimatedDuration: 25000
    }
  ]

  constructor(private aiService: UnifiedAIService) {}

  async execute(task: string): Promise<any> {
    logger.info('Executing shopping task', { task })
    
    // Enhanced shopping task processing
    const shoppingIntent = this.analyzeShoppingIntent(task)
    
    let prompt = ''
    if (shoppingIntent.type === 'comparison') {
      prompt = `Compare prices and features for: ${task}. Provide detailed comparison with pros/cons, pricing, and recommendations.`
    } else if (shoppingIntent.type === 'research') {
      prompt = `Research products for: ${task}. Find the best options with detailed analysis, ratings, and where to buy.`
    } else if (shoppingIntent.type === 'deals') {
      prompt = `Find the best deals and discounts for: ${task}. Include current sales, coupon codes, and money-saving tips.`
    } else {
      prompt = `Help me with this shopping request: ${task}. Provide comprehensive shopping advice, product recommendations, and buying guidance.`
    }
    
    const productAnalysis = await this.aiService.sendMessage(prompt)

    if (productAnalysis.success) {
      return {
        type: 'shopping_completed',
        intent: shoppingIntent,
        recommendations: productAnalysis.result,
        confidence: shoppingIntent.confidence,
        timestamp: Date.now()
      }
    }

    throw new Error('Failed to process shopping request')
  }
  
  private analyzeShoppingIntent(task: string): {
    type: 'comparison' | 'research' | 'deals' | 'general'
    confidence: number
    products: string[]
  } {
    const lowerTask = task.toLowerCase()
    
    // Product extraction
    const productWords = task.split(' ').filter(word => 
      word.length > 3 && !['price', 'cheap', 'best', 'compare', 'buy'].includes(word.toLowerCase())
    )
    
    if (lowerTask.includes('compare') || lowerTask.includes('vs') || lowerTask.includes('versus')) {
      return { type: 'comparison', confidence: 0.9, products: productWords }
    }
    
    if (lowerTask.includes('deal') || lowerTask.includes('discount') || lowerTask.includes('sale') || lowerTask.includes('cheap')) {
      return { type: 'deals', confidence: 0.8, products: productWords }
    }
    
    if (lowerTask.includes('best') || lowerTask.includes('top') || lowerTask.includes('review')) {
      return { type: 'research', confidence: 0.8, products: productWords }
    }
    
    return { type: 'general', confidence: 0.7, products: productWords }
  }
}

export default IntegratedAgentFramework