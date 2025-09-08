/**
 * Integrated Agent Framework - Enhanced with Backend Services
 * Updated to work with existing backend services and eliminate missing dependencies
 */

import { createLogger } from '../../core/logger/Logger'
import { appEvents } from '../../core/utils/EventEmitter'
import { validateAgentTask } from '../../core/utils/Validators'
import ConversationManager from '../../core/services/ConversationManager'
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

// Communication Agent Implementation - HIGH PRIORITY
class CommunicationAgent implements Agent {
  id = 'communication-agent'
  name = 'Communication Agent'
  type = 'communication'
  capabilities: AgentCapability[] = [
    {
      id: 'email-composition',
      name: 'Email Composition',
      description: 'Compose professional emails, replies, and follow-ups',
      category: 'communication',
      requiredPermissions: ['content-generation'],
      estimatedDuration: 15000
    },
    {
      id: 'form-filling',
      name: 'Smart Form Filling',
      description: 'Automatically fill web forms with intelligent data extraction',
      category: 'automation',
      requiredPermissions: ['web-interaction', 'content-extraction'],
      estimatedDuration: 20000
    },
    {
      id: 'social-media-interaction',
      name: 'Social Media Management',
      description: 'Create posts, responses, and manage social media interactions',
      category: 'communication',
      requiredPermissions: ['content-generation', 'web-interaction'],
      estimatedDuration: 25000
    },
    {
      id: 'contact-management',
      name: 'Contact Management',
      description: 'Extract and organize contact information from web pages',
      category: 'automation',
      requiredPermissions: ['content-extraction', 'data-organization'],
      estimatedDuration: 15000
    }
  ]

  constructor(private aiService: UnifiedAIService) {}

  async execute(task: string): Promise<any> {
    logger.info('Executing communication task', { task })
    
    const communicationType = this.analyzeCommunicationType(task)
    
    let prompt = ''
    let actionType = ''
    
    switch (communicationType.type) {
      case 'email':
        actionType = 'email_composition'
        prompt = `Compose a professional email based on this request: "${task}". 
        Include:
        1. Appropriate subject line
        2. Professional greeting
        3. Clear and concise body
        4. Appropriate closing
        5. Call to action if needed
        
        Format the response as a structured email with clear sections.`
        break
        
      case 'form':
        actionType = 'form_filling'
        prompt = `Analyze this form-filling request: "${task}". 
        Provide:
        1. Strategy for identifying form fields
        2. Data sources for filling information
        3. Validation steps
        4. Common form types this applies to
        5. Step-by-step filling instructions
        
        Focus on accuracy and data privacy.`
        break
        
      case 'social':
        actionType = 'social_media'
        prompt = `Create social media content for: "${task}".
        Include:
        1. Platform-appropriate content (Twitter, LinkedIn, Facebook)
        2. Engaging and relevant messaging
        3. Appropriate hashtags
        4. Call to action
        5. Audience consideration
        
        Make it engaging and professional.`
        break
        
      case 'contact':
        actionType = 'contact_extraction'
        prompt = `Extract and organize contact information from the current context: "${task}".
        Provide:
        1. Contact extraction strategy
        2. Information validation methods
        3. Organization structure
        4. Data privacy considerations
        5. Export format recommendations`
        break
        
      default:
        actionType = 'general_communication'
        prompt = `Help with this communication task: "${task}". 
        Analyze the request and provide:
        1. Communication strategy
        2. Key messaging points
        3. Appropriate tone and style
        4. Recommended actions
        5. Follow-up suggestions`
    }
    
    const result = await this.aiService.sendMessage(prompt)

    if (result.success) {
      return {
        type: 'communication_completed',
        actionType: actionType,
        content: result.result,
        communicationType: communicationType,
        timestamp: Date.now(),
        confidence: communicationType.confidence
      }
    }

    throw new Error('Failed to process communication request')
  }
  
  private analyzeCommunicationType(task: string): {
    type: 'email' | 'form' | 'social' | 'contact' | 'general'
    confidence: number 
    platform?: string
    details: string[]
  } {
    const lowerTask = task.toLowerCase()
    const details = []
    
    // Email detection
    if (lowerTask.includes('email') || lowerTask.includes('compose') || lowerTask.includes('send') || 
        lowerTask.includes('reply') || lowerTask.includes('message')) {
      details.push('email communication detected')
      return { type: 'email', confidence: 0.9, details }
    }
    
    // Form filling detection
    if (lowerTask.includes('form') || lowerTask.includes('fill') || lowerTask.includes('submit') || 
        lowerTask.includes('application') || lowerTask.includes('registration')) {
      details.push('form filling task detected')
      return { type: 'form', confidence: 0.85, details }
    }
    
    // Social media detection
    const socialPlatforms = ['twitter', 'linkedin', 'facebook', 'instagram', 'social', 'post', 'tweet']
    const platformFound = socialPlatforms.find(platform => lowerTask.includes(platform))
    if (platformFound) {
      details.push(`social media task for ${platformFound}`)
      return { type: 'social', confidence: 0.9, platform: platformFound, details }
    }
    
    // Contact management detection
    if (lowerTask.includes('contact') || lowerTask.includes('address') || lowerTask.includes('phone') || 
        lowerTask.includes('extract') && (lowerTask.includes('info') || lowerTask.includes('details'))) {
      details.push('contact extraction task detected')
      return { type: 'contact', confidence: 0.8, details }
    }
    
    return { type: 'general', confidence: 0.6, details: ['general communication task'] }
  }
}

// Automation Agent Implementation - MEDIUM PRIORITY
class AutomationAgent implements Agent {
  id = 'automation-agent'
  name = 'Automation Agent'
  type = 'automation'
  capabilities: AgentCapability[] = [
    {
      id: 'task-automation',
      name: 'Task Automation',
      description: 'Automate repetitive browser tasks and workflows',
      category: 'automation',
      requiredPermissions: ['web-interaction', 'workflow-execution'],
      estimatedDuration: 45000
    },
    {
      id: 'workflow-creation',
      name: 'Workflow Creation',
      description: 'Design and implement multi-step automated workflows',
      category: 'automation',
      requiredPermissions: ['workflow-creation', 'process-design'],
      estimatedDuration: 60000
    },
    {
      id: 'scheduled-actions',
      name: 'Scheduled Actions',
      description: 'Set up and manage scheduled browser actions',
      category: 'automation',
      requiredPermissions: ['scheduling', 'task-management'],
      estimatedDuration: 30000
    },
    {
      id: 'multi-step-processes',
      name: 'Multi-Step Processes',
      description: 'Execute complex multi-step browser processes',
      category: 'automation',
      requiredPermissions: ['web-interaction', 'process-execution'],
      estimatedDuration: 90000
    },
    {
      id: 'data-collection',
      name: 'Automated Data Collection',
      description: 'Systematically collect and organize data from multiple sources',
      category: 'automation',
      requiredPermissions: ['web-navigation', 'content-extraction', 'data-organization'],
      estimatedDuration: 120000
    }
  ]

  constructor(private aiService: UnifiedAIService) {}

  async execute(task: string): Promise<any> {
    logger.info('Executing automation task', { task })
    
    const automationType = this.analyzeAutomationType(task)
    const complexity = this.assessAutomationComplexity(task)
    
    let prompt = ''
    let actionType = ''
    
    switch (automationType.type) {
      case 'workflow':
        actionType = 'workflow_creation'
        prompt = `Create an automated workflow for: "${task}".
        Design:
        1. Step-by-step workflow sequence
        2. Decision points and conditions
        3. Error handling and recovery steps
        4. Success criteria and validation
        5. Time estimates for each step
        6. Resource requirements
        
        Make it robust and repeatable with clear instructions.`
        break
        
      case 'repetitive':
        actionType = 'task_automation'
        prompt = `Automate this repetitive task: "${task}".
        Provide:
        1. Task breakdown and analysis
        2. Automation strategy and approach
        3. Required browser interactions
        4. Data handling and validation
        5. Performance optimization tips
        6. Quality assurance steps
        
        Focus on efficiency and accuracy.`
        break
        
      case 'scheduled':
        actionType = 'scheduled_automation'
        prompt = `Set up scheduled automation for: "${task}".
        Include:
        1. Optimal scheduling strategy
        2. Frequency and timing recommendations
        3. Monitoring and alert setup
        4. Failure handling procedures
        5. Resource usage considerations
        6. Maintenance requirements
        
        Ensure reliability and monitoring.`
        break
        
      case 'data_collection':
        actionType = 'data_collection'
        prompt = `Create automated data collection system for: "${task}".
        Design:
        1. Data source identification strategy
        2. Collection methodology and techniques
        3. Data validation and quality checks
        4. Storage and organization structure
        5. Update frequency and maintenance
        6. Export and reporting capabilities
        
        Focus on data accuracy and systematic collection.`
        break
        
      case 'multi_step':
        actionType = 'multi_step_process'
        prompt = `Design multi-step automation for: "${task}".
        Create:
        1. Complete process flow diagram
        2. Step dependencies and prerequisites  
        3. Parallel vs sequential execution plan
        4. Checkpoint and recovery mechanisms
        5. Progress tracking and reporting
        6. Performance metrics and optimization
        
        Ensure robustness and scalability.`
        break
        
      default:
        actionType = 'general_automation'
        prompt = `Analyze this automation request: "${task}".
        Provide:
        1. Automation feasibility assessment
        2. Recommended approach and tools
        3. Implementation strategy
        4. Expected benefits and ROI
        5. Potential challenges and solutions
        6. Maintenance and monitoring needs`
    }
    
    const result = await this.aiService.sendMessage(prompt)

    if (result.success) {
      return {
        type: 'automation_completed',
        actionType: actionType,
        workflow: result.result,
        automationType: automationType,
        complexity: complexity,
        estimatedDuration: complexity.estimatedTime,
        timestamp: Date.now(),
        confidence: automationType.confidence
      }
    }

    throw new Error('Failed to create automation workflow')
  }
  
  private analyzeAutomationType(task: string): {
    type: 'workflow' | 'repetitive' | 'scheduled' | 'data_collection' | 'multi_step' | 'general'
    confidence: number
    details: string[]
  } {
    const lowerTask = task.toLowerCase()
    const details = []
    
    // Workflow creation
    if (lowerTask.includes('workflow') || lowerTask.includes('process') || lowerTask.includes('sequence') ||
        (lowerTask.includes('create') && (lowerTask.includes('flow') || lowerTask.includes('steps')))) {
      details.push('workflow creation task')
      return { type: 'workflow', confidence: 0.9, details }
    }
    
    // Repetitive task automation
    if (lowerTask.includes('repeat') || lowerTask.includes('automate') || lowerTask.includes('routine') ||
        lowerTask.includes('same') || lowerTask.includes('multiple times')) {
      details.push('repetitive task automation')
      return { type: 'repetitive', confidence: 0.85, details }
    }
    
    // Scheduled automation
    if (lowerTask.includes('schedule') || lowerTask.includes('daily') || lowerTask.includes('weekly') ||
        lowerTask.includes('hourly') || lowerTask.includes('regular') || lowerTask.includes('cron')) {
      details.push('scheduled automation task')
      return { type: 'scheduled', confidence: 0.8, details }
    }
    
    // Data collection
    if ((lowerTask.includes('collect') || lowerTask.includes('gather') || lowerTask.includes('scrape')) &&
        (lowerTask.includes('data') || lowerTask.includes('information') || lowerTask.includes('content'))) {
      details.push('automated data collection')
      return { type: 'data_collection', confidence: 0.85, details }
    }
    
    // Multi-step process
    if (lowerTask.includes('steps') || lowerTask.includes('multiple') || lowerTask.includes('sequence') ||
        lowerTask.includes('then') || lowerTask.includes('after') || lowerTask.includes('complex')) {
      details.push('multi-step process automation')
      return { type: 'multi_step', confidence: 0.75, details }
    }
    
    return { type: 'general', confidence: 0.6, details: ['general automation request'] }
  }
  
  private assessAutomationComplexity(task: string): {
    level: 'simple' | 'moderate' | 'complex' | 'advanced'
    estimatedTime: number
    factors: string[]
  } {
    const complexityIndicators = {
      advanced: ['multiple websites', 'complex workflow', 'decision trees', 'ai integration', 'api calls', 'database'],
      complex: ['multi-step', 'conditional', 'parallel', 'scheduling', 'error handling', 'validation'],
      moderate: ['several pages', 'form filling', 'data extraction', 'file handling', 'notifications'],
      simple: ['single page', 'click', 'fill', 'basic', 'simple', 'one step']
    }
    
    const lowerTask = task.toLowerCase()
    const factors = []
    
    let advancedScore = 0
    let complexScore = 0
    let moderateScore = 0
    let simpleScore = 0
    
    // Score each complexity level
    for (const indicator of complexityIndicators.advanced) {
      if (lowerTask.includes(indicator)) {
        advancedScore++
        factors.push(`advanced: ${indicator}`)
      }
    }
    
    for (const indicator of complexityIndicators.complex) {
      if (lowerTask.includes(indicator)) {
        complexScore++
        factors.push(`complex: ${indicator}`)
      }
    }
    
    for (const indicator of complexityIndicators.moderate) {
      if (lowerTask.includes(indicator)) {
        moderateScore++
        factors.push(`moderate: ${indicator}`)
      }
    }
    
    for (const indicator of complexityIndicators.simple) {
      if (lowerTask.includes(indicator)) {
        simpleScore++
        factors.push(`simple: ${indicator}`)
      }
    }
    
    // Length and structure based complexity
    if (task.length > 150) advancedScore++
    if (task.length > 100) complexScore++
    if (task.length > 50) moderateScore++
    
    // Multiple sentences or questions indicate complexity
    const sentences = task.split(/[.!?]/).filter(s => s.trim().length > 0).length
    if (sentences > 3) advancedScore++
    if (sentences > 2) complexScore++
    
    // Determine complexity level and time estimate
    if (advancedScore >= 2) {
      return { level: 'advanced', estimatedTime: 120000, factors } // 2 minutes
    } else if (complexScore >= 2 || advancedScore >= 1) {
      return { level: 'complex', estimatedTime: 90000, factors } // 1.5 minutes
    } else if (moderateScore >= 1 || complexScore >= 1) {
      return { level: 'moderate', estimatedTime: 45000, factors } // 45 seconds
    } else {
      return { level: 'simple', estimatedTime: 30000, factors } // 30 seconds
    }
  }
}

export default IntegratedAgentFramework