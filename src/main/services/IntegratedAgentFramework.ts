/**
 * Integrated Agent Framework - Enhanced with Backend Services
 * Updated to work with existing backend services and eliminate missing dependencies
 */

import { createLogger } from '../../core/logger/Logger'
import { appEvents } from '../../core/utils/EventEmitter'
import { validateAgentTask } from '../../core/utils/Validators'
import ConversationManager from '../../core/services/ConversationManager'
import { AgentCapability, AgentTask } from '../../core/types'

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
  private conversationManager: ConversationManager
  private eventListeners: Map<string, Function[]> = new Map()
  private isInitialized = false

  private constructor() {
    this.conversationManager = ConversationManager.getInstance()
  }

  static getInstance(): IntegratedAgentFramework {
    if (!IntegratedAgentFramework.instance) {
      IntegratedAgentFramework.instance = new IntegratedAgentFramework()
    }
    return IntegratedAgentFramework.instance
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      logger.warn('IntegratedAgentFramework already initialized')
      return
    }

    logger.info('Initializing Integrated Agent Framework...')

    try {
      // Initialize conversation manager
      await this.conversationManager.initialize()

      // Register default agents
      this.registerAgent(new NavigationAgent())

      // Set up event listeners
      this.setupEventListeners()

      this.isInitialized = true
      logger.info('✅ Integrated Agent Framework initialized successfully')

      // Emit initialization event
      appEvents.emit('agent-framework:initialized', { 
        timestamp: Date.now(),
        agentCount: this.agents.size 
      })

    } catch (error) {
      logger.error('Failed to initialize Integrated Agent Framework', error as Error)
      throw error
    }
  }

  /**
   * Process user input with enhanced conversation and coordination
   */
  async processUserInput(input: string): Promise<{ success: boolean; result?: any; error?: string }> {
    try {
      if (!this.isInitialized) {
        throw new Error('Agent framework not initialized')
      }

      logger.debug('Processing user input:', input)

      // Validate input
      const validation = validateAgentTask(input)
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error
        }
      }

      // Use Electron API to send message to AI service
      const result = await window.electronAPI.sendAIMessage(input)
      
      if (result.success) {
        // Emit processing event
        appEvents.emit('agent:task-completed', {
          input,
          result: result.result,
          timestamp: Date.now()
        })

        return {
          success: true,
          result: result.result
        }
      } else {
        return {
          success: false,
          error: result.error || 'Unknown error'
        }
      }

    } catch (error) {
      logger.error('Failed to process user input', error as Error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Check if task requires complex coordination
   */
  private isComplexTask(input: string): boolean {
    const complexityIndicators = [
      'comprehensive', 'detailed', 'multiple', 'across', 'integrate', 
      'workflow', 'compare and', 'research and analyze', 'create and send',
      'automate and schedule', 'find and compare', 'analyze and report'
    ]
    
    const lowerInput = input.toLowerCase()
    return complexityIndicators.some(indicator => lowerInput.includes(indicator)) ||
           input.length > 100 // Long requests often need coordination
  }

  /**
   * Cancel an active task
   */
  async cancelTask(taskId: string): Promise<{ success: boolean; error?: string }> {
    logger.info('Task cancellation not implemented', { taskId })
    return { success: false, error: 'Task cancellation not implemented' }
  }

  /**
   * Get status of all active tasks
   */
  getActiveTasks(): AgentTask[] {
    return []
  }

  /**
   * Get agent metrics
   */
  getMetrics() {
    return {
      totalAgents: this.agents.size,
      activeAgents: this.agents.size,
      completedTasks: 0,
      failedTasks: 0
    }
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
   * Analyze user intent using simple keyword analysis
   */
  private async analyzeIntent(input: string): Promise<{
    intent: string
    confidence: number
    entities: string[]
    agentType: string
  }> {
    // Use simple keyword-based analysis since AI service is not available
    return this.simpleIntentAnalysis(input)
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
    
    // Communication keywords - NEW
    const communicationKeywords = ['email', 'send', 'compose', 'write', 'message', 'contact', 'form', 'fill', 'submit', 'social', 'post', 'tweet', 'linkedin', 'facebook', 'reply', 'respond']
    const communicationScore = communicationKeywords.filter(keyword => lowerInput.includes(keyword)).length
    
    // Automation keywords - NEW  
    const automationKeywords = ['automate', 'automation', 'repeat', 'schedule', 'workflow', 'process', 'sequence', 'steps', 'batch', 'bulk', 'routine', 'script', 'macro', 'trigger']
    const automationScore = automationKeywords.filter(keyword => lowerInput.includes(keyword)).length
    
    // Multi-step/complex task indicators
    const complexKeywords = ['create', 'generate', 'make', 'build', 'compile', 'organize', 'multiple', 'several', 'across', 'comprehensive', 'detailed']
    const complexScore = complexKeywords.filter(keyword => lowerInput.includes(keyword)).length
    
    // Calculate scores
    const scores = {
      research: researchScore + (complexScore * 0.5),
      navigation: navigationScore,
      analysis: analysisScore + (complexScore * 0.3),
      shopping: shoppingScore,
      communication: communicationScore,
      automation: automationScore + (complexScore * 0.4) // Automation often involves complex workflows
    }
    
    // Complex query detection (>50 characters or multiple sentences)
    const isComplexQuery = input.length > 50 || input.includes('.') || input.includes('?') || complexScore > 0
    
    // Determine best agent based on scores
    const maxScore = Math.max(...Object.values(scores))
    const bestAgent = Object.keys(scores).find(key => scores[key as keyof typeof scores] === maxScore)
    
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
    if (scores.communication > 0) entities.push('communication')
    if (scores.automation > 0) entities.push('automation')
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

    this.agents.clear()
    this.eventListeners.clear()
    this.isInitialized = false

    logger.info('Agent Framework cleanup complete')
  }
}

// Agent Implementations
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

export default IntegratedAgentFramework