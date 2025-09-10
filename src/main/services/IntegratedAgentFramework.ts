/**
 * Integrated Agent Framework - Enhanced with Backend Services
 * Updated to work with existing backend services and eliminate missing dependencies
 */

import { createLogger } from '../../core/logger/Logger'
import { appEvents } from '../../core/utils/EventEmitter'
import { validateAgentTask } from '../../core/utils/Validators'
import ConversationManager from '../../core/services/ConversationManager'

// Define types locally to avoid import issues
export interface AgentCapability {
  id: string
  name: string
  description: string
  category: 'research' | 'analysis' | 'automation' | 'communication'
  requiredPermissions: string[]
  estimatedDuration?: number
}

export interface AgentTask {
  id: string
  title: string
  description: string
  type: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  progress: number
  createdAt: number
  startedAt?: number
  completedAt?: number
  result?: any
  error?: string
  metadata?: Record<string, any>
}

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

      // Register simplified navigation agent
      this.registerAgent(new NavigationAgent())
      
      logger.debug(`Registered ${this.agents.size} agents`)

      // Set up event listeners
      this.setupEventListeners()

      this.isInitialized = true
      logger.info('✅ Integrated Agent Framework initialized successfully')

      // Emit initialization event
      appEvents.emit('app:initialized', { 
        timestamp: Date.now()
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

      // FIXED: Add Electron API safety check before using
      if (!window.electronAPI?.sendAIMessage) {
        throw new Error('AI service not available - Electron API not found')
      }

      // Use Electron API to send message to AI service
      const result = await window.electronAPI.sendAIMessage(input)
      
      if (result.success) {
        // Emit processing event
        appEvents.emit('agent:task-completed', {
          taskId: `task_${Date.now()}`,
          result: result.result
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
   * FIXED: Enhanced cleanup resources method
   */
  async cleanup(): Promise<void> {
    logger.info('Cleaning up Integrated Agent Framework')

    // Clear agents
    this.agents.clear()
    
    // Clear event listeners
    this.eventListeners.clear()
    
    // Cleanup conversation manager
    if (this.conversationManager) {
      try {
        await this.conversationManager.cleanup()
      } catch (error) {
        logger.warn('Failed to cleanup conversation manager:', error)
      }
    }
    
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
      // FIXED: Better URL cleaning and validation
      url = url.trim().replace(/[^\w\-./:?=&%]/g, '')
      
      // Add protocol if missing
      if (!url.startsWith('http')) {
        url = `https://${url}`
      }
      
      // FIXED: Add URL validation
      try {
        new URL(url) // Validate URL format
        
        return {
          type: 'navigation',
          action: 'navigate',
          target: url,
          timestamp: Date.now(),
          confidence: 0.9
        }
      } catch (urlError) {
        throw new Error(`Invalid URL format: ${url}`)
      }
    }
    
    // Fallback: try to extract domain names
    const domainMatch = task.match(/([a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.(?:com|org|net|edu|gov|io|co|ai))/i)
    if (domainMatch) {
      const fallbackUrl = `https://${domainMatch[0]}`
      
      try {
        new URL(fallbackUrl) // Validate URL format
        
        return {
          type: 'navigation',
          action: 'navigate', 
          target: fallbackUrl,
          timestamp: Date.now(),
          confidence: 0.7
        }
      } catch (urlError) {
        throw new Error(`Invalid domain format: ${domainMatch[0]}`)
      }
    }

    throw new Error('No valid URL found in navigation task')
  }
}

export default IntegratedAgentFramework