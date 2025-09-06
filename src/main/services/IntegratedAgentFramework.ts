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
    }
  ]

  constructor(private aiService: UnifiedAIService) {}

  async execute(task: string): Promise<any> {
    logger.info('Executing research task', { task })
    
    // Use AI service to generate research strategy
    const strategy = await this.aiService.sendMessage(
      `Create a research strategy for: ${task}. List 3-5 specific websites to visit and what to look for.`
    )

    if (strategy.success) {
      return {
        type: 'research_completed',
        strategy: strategy.result,
        timestamp: Date.now()
      }
    }

    throw new Error('Failed to generate research strategy')
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
      requiredPermissions: ['content-extraction']
    }
  ]

  constructor(private aiService: UnifiedAIService) {}

  async execute(task: string): Promise<any> {
    logger.info('Executing analysis task', { task })
    
    const analysis = await this.aiService.analyzeContent()
    
    if (analysis.success) {
      return {
        type: 'analysis_completed',
        analysis: analysis.data,
        timestamp: Date.now()
      }
    }

    throw new Error('Failed to analyze content')
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
      requiredPermissions: ['web-navigation', 'content-extraction']
    }
  ]

  constructor(private aiService: UnifiedAIService) {}

  async execute(task: string): Promise<any> {
    logger.info('Executing shopping task', { task })
    
    const productAnalysis = await this.aiService.sendMessage(
      `Help me with this shopping request: ${task}. Provide product recommendations and shopping advice.`
    )

    if (productAnalysis.success) {
      return {
        type: 'shopping_completed',
        recommendations: productAnalysis.result,
        timestamp: Date.now()
      }
    }

    throw new Error('Failed to process shopping request')
  }
}

export default IntegratedAgentFramework