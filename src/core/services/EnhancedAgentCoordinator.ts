/**
 * Enhanced Agent Coordinator - Integrated with Advanced Capabilities
 * Coordinates all enhanced services for comprehensive automation
 */

import { createLogger } from '../logger/EnhancedLogger'
import { appEvents } from '../utils/EventEmitter'
import DeepSearchEngine, { SearchQuery, DeepSearchReport } from './DeepSearchEngine'
import ShadowWorkspace, { ShadowTask } from './ShadowWorkspace'
import CrossPlatformIntegration, { FileOperation, IntegrationTask } from './CrossPlatformIntegration'
import AdvancedSecurity from './AdvancedSecurity'

const logger = createLogger('EnhancedAgentCoordinator')

export interface EnhancedAgentTask {
  id: string
  name: string
  description: string
  type: 'research' | 'automation' | 'integration' | 'security' | 'hybrid'
  priority: 'low' | 'medium' | 'high' | 'critical'
  capabilities: string[]
  parameters: Record<string, any>
  status: 'queued' | 'planning' | 'executing' | 'completed' | 'failed' | 'cancelled'
  progress: number
  startTime?: number
  endTime?: number
  subTasks: {
    searchTasks: string[]
    shadowTasks: string[]
    integrationTasks: string[]
    securityTasks: string[]
  }
  results?: {
    searchResults?: DeepSearchReport[]
    automationResults?: any[]
    integrationResults?: any[]
    securityResults?: any[]
    summary: string
    recommendations: string[]
  }
  error?: string
}

export interface AgentCapabilityMatrix {
  deepSearch: boolean
  shadowWorkspace: boolean
  crossPlatform: boolean
  advancedSecurity: boolean
  multiModal: boolean
  realTimeMonitoring: boolean
}

export class EnhancedAgentCoordinator {
  private static instance: EnhancedAgentCoordinator
  private deepSearchEngine: DeepSearchEngine
  private shadowWorkspace: ShadowWorkspace
  private crossPlatformIntegration: CrossPlatformIntegration
  private advancedSecurity: AdvancedSecurity
  private activeTasks: Map<string, EnhancedAgentTask> = new Map()
  private taskQueue: EnhancedAgentTask[] = []
  private capabilityMatrix: AgentCapabilityMatrix
  private isInitialized = false

  private constructor() {
    this.deepSearchEngine = DeepSearchEngine.getInstance()
    this.shadowWorkspace = ShadowWorkspace.getInstance()
    this.crossPlatformIntegration = CrossPlatformIntegration.getInstance()
    this.advancedSecurity = AdvancedSecurity.getInstance()
    
    this.capabilityMatrix = {
      deepSearch: true,
      shadowWorkspace: true,
      crossPlatform: true,
      advancedSecurity: true,
      multiModal: true,
      realTimeMonitoring: true
    }
  }

  static getInstance(): EnhancedAgentCoordinator {
    if (!EnhancedAgentCoordinator.instance) {
      EnhancedAgentCoordinator.instance = new EnhancedAgentCoordinator()
    }
    return EnhancedAgentCoordinator.instance
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return

    logger.info('🚀 Initializing Enhanced Agent Coordinator...')

    try {
      // Initialize all sub-services
      await this.deepSearchEngine.initialize()
      await this.shadowWorkspace.initialize()
      await this.crossPlatformIntegration.initialize()
      await this.advancedSecurity.initialize()

      // Set up event listeners
      this.setupEventListeners()

      // Start task processing
      this.startTaskProcessing()

      this.isInitialized = true
      logger.info('✅ Enhanced Agent Coordinator initialized successfully')

      // Emit initialization event
      appEvents.emit('enhancedAgent:initialized', {
        capabilities: this.capabilityMatrix,
        timestamp: Date.now()
      })

    } catch (error) {
      logger.error('Failed to initialize Enhanced Agent Coordinator', error as Error)
      throw error
    }
  }

  async createEnhancedTask(taskConfig: Partial<EnhancedAgentTask>): Promise<EnhancedAgentTask> {
    const task: EnhancedAgentTask = {
      id: `enhanced_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: taskConfig.name || 'Enhanced Task',
      description: taskConfig.description || '',
      type: taskConfig.type || 'hybrid',
      priority: taskConfig.priority || 'medium',
      capabilities: taskConfig.capabilities || [],
      parameters: taskConfig.parameters || {},
      status: 'queued',
      progress: 0,
      subTasks: {
        searchTasks: [],
        shadowTasks: [],
        integrationTasks: [],
        securityTasks: []
      }
    }

    this.taskQueue.push(task)
    this.sortTaskQueue()

    logger.info(`📋 Created enhanced task: ${task.name} (${task.type})`)

    // Emit task creation event
    appEvents.emit('enhancedAgent:taskCreated', {
      taskId: task.id,
      type: task.type,
      capabilities: task.capabilities
    })

    return task
  }

  private sortTaskQueue(): void {
    const priorityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 }
    this.taskQueue.sort((a, b) => {
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
      if (priorityDiff !== 0) return priorityDiff
      return a.startTime || 0 - (b.startTime || 0)
    })
  }

  private startTaskProcessing(): void {
    setInterval(() => {
      this.processTaskQueue()
    }, 5000) // Process every 5 seconds

    logger.info('⚡ Task processing started')
  }

  private async processTaskQueue(): Promise<void> {
    if (this.taskQueue.length === 0) return

    const nextTask = this.taskQueue.shift()
    if (!nextTask) return

    try {
      await this.executeEnhancedTask(nextTask)
    } catch (error) {
      logger.error(`Enhanced task execution failed: ${nextTask.id}`, error as Error)
      nextTask.status = 'failed'
      nextTask.error = error instanceof Error ? error.message : 'Unknown error'
      this.notifyTaskUpdate(nextTask)
    }
  }

  private async executeEnhancedTask(task: EnhancedAgentTask): Promise<void> {
    logger.info(`🚀 Executing enhanced task: ${task.name}`)

    task.status = 'planning'
    task.startTime = Date.now()
    this.activeTasks.set(task.id, task)
    this.notifyTaskUpdate(task)

    try {
      // Phase 1: Task Planning and Decomposition
      await this.planTaskExecution(task)
      
      task.status = 'executing'
      task.progress = 10
      this.notifyTaskUpdate(task)

      // Phase 2: Execute subtasks based on type
      const results: any = {
        searchResults: [],
        automationResults: [],
        integrationResults: [],
        securityResults: [],
        summary: '',
        recommendations: []
      }

      // Execute research tasks if needed
      if (task.capabilities.includes('deep-search') || task.type === 'research') {
        const searchResults = await this.executeSearchTasks(task)
        results.searchResults = searchResults
        task.progress = 30
        this.notifyTaskUpdate(task)
      }

      // Execute shadow workspace tasks if needed
      if (task.capabilities.includes('background-automation') || task.type === 'automation') {
        const automationResults = await this.executeShadowTasks(task)
        results.automationResults = automationResults
        task.progress = 50
        this.notifyTaskUpdate(task)
      }

      // Execute cross-platform integration tasks if needed
      if (task.capabilities.includes('cross-platform') || task.type === 'integration') {
        const integrationResults = await this.executeIntegrationTasks(task)
        results.integrationResults = integrationResults
        task.progress = 70
        this.notifyTaskUpdate(task)
      }

      // Handle security tasks if needed
      if (task.capabilities.includes('security') || task.type === 'security') {
        const securityResults = await this.executeSecurityTasks(task)
        results.securityResults = securityResults
        task.progress = 85
        this.notifyTaskUpdate(task)
      }

      // Phase 3: Consolidate results and generate summary
      results.summary = await this.generateTaskSummary(task, results)
      results.recommendations = this.generateRecommendations(task, results)

      task.results = results
      task.status = 'completed'
      task.progress = 100
      task.endTime = Date.now()

      logger.info(`✅ Enhanced task completed: ${task.name}`)

    } catch (error) {
      task.status = 'failed'
      task.error = error instanceof Error ? error.message : 'Unknown error'
      logger.error(`❌ Enhanced task failed: ${task.name}`, error)
    } finally {
      this.activeTasks.delete(task.id)
      this.notifyTaskUpdate(task)

      // Emit completion event
      appEvents.emit('enhancedAgent:taskCompleted', {
        taskId: task.id,
        status: task.status,
        duration: task.endTime ? task.endTime - (task.startTime || 0) : 0,
        results: task.results
      })
    }
  }

  private async planTaskExecution(task: EnhancedAgentTask): Promise<void> {
    logger.info(`📋 Planning execution for task: ${task.name}`)

    // Analyze task requirements and create execution plan
    const plan = this.analyzeTaskRequirements(task)

    // Create subtasks based on analysis
    if (plan.needsDeepSearch) {
      const searchQuery = await this.deepSearchEngine.createSearchQuery(
        task.parameters.searchQuery || task.description,
        {
          sources: task.parameters.searchSources,
          maxResults: task.parameters.maxResults || 20,
          priority: task.priority
        }
      )
      task.subTasks.searchTasks.push(searchQuery.id)
    }

    if (plan.needsShadowWorkspace) {
      const shadowTask = await this.shadowWorkspace.createShadowTask({
        name: `Shadow: ${task.name}`,
        description: task.description,
        type: task.parameters.shadowType || 'automation',
        priority: task.priority,
        metadata: task.parameters.shadowConfig || {}
      })
      task.subTasks.shadowTasks.push(shadowTask.id)
    }

    if (plan.needsCrossPlatform) {
      // Cross-platform tasks will be created during execution
      task.subTasks.integrationTasks.push('pending')
    }

    if (plan.needsSecurity) {
      // Security tasks will be handled during execution
      task.subTasks.securityTasks.push('pending')
    }

    logger.info(`✅ Task planning completed for: ${task.name}`)
  }

  private analyzeTaskRequirements(task: EnhancedAgentTask): any {
    const description = task.description.toLowerCase()
    const capabilities = task.capabilities

    return {
      needsDeepSearch: 
        capabilities.includes('deep-search') ||
        description.includes('research') ||
        description.includes('search') ||
        description.includes('find'),
      
      needsShadowWorkspace:
        capabilities.includes('background-automation') ||
        description.includes('monitor') ||
        description.includes('automate') ||
        description.includes('background'),
      
      needsCrossPlatform:
        capabilities.includes('cross-platform') ||
        description.includes('file') ||
        description.includes('app') ||
        description.includes('integration'),
      
      needsSecurity:
        capabilities.includes('security') ||
        description.includes('secure') ||
        description.includes('encrypt') ||
        description.includes('credential')
    }
  }

  private async executeSearchTasks(task: EnhancedAgentTask): Promise<DeepSearchReport[]> {
    logger.info(`🔍 Executing search tasks for: ${task.name}`)

    const results: DeepSearchReport[] = []

    for (const searchTaskId of task.subTasks.searchTasks) {
      try {
        // Create search query if needed
        let searchQuery: SearchQuery
        
        if (searchTaskId === 'pending' || !searchTaskId) {
          searchQuery = await this.deepSearchEngine.createSearchQuery(
            task.parameters.searchQuery || task.description
          )
        } else {
          // Use existing search query (implementation would retrieve it)
          searchQuery = await this.deepSearchEngine.createSearchQuery(
            task.parameters.searchQuery || task.description
          )
        }

        const searchResult = await this.deepSearchEngine.executeDeepSearch(searchQuery)
        results.push(searchResult)

      } catch (error) {
        logger.warn(`Search task failed: ${searchTaskId}`, error)
      }
    }

    return results
  }

  private async executeShadowTasks(task: EnhancedAgentTask): Promise<any[]> {
    logger.info(`👤 Executing shadow tasks for: ${task.name}`)

    const results: any[] = []

    for (const shadowTaskId of task.subTasks.shadowTasks) {
      try {
        // Shadow tasks are executed by the ShadowWorkspace
        // We'll monitor their completion
        const shadowTasks = this.shadowWorkspace.getActiveTasks()
        const relevantTask = shadowTasks.find(t => t.id === shadowTaskId)
        
        if (relevantTask) {
          // Wait for completion (simplified)
          while (relevantTask.status === 'running') {
            await this.delay(1000)
          }
          
          results.push(relevantTask.results)
        }

      } catch (error) {
        logger.warn(`Shadow task failed: ${shadowTaskId}`, error)
      }
    }

    return results
  }

  private async executeIntegrationTasks(task: EnhancedAgentTask): Promise<any[]> {
    logger.info(`🔗 Executing integration tasks for: ${task.name}`)

    const results: any[] = []

    // Execute file operations if specified
    if (task.parameters.fileOperations) {
      for (const fileOp of task.parameters.fileOperations) {
        try {
          const result = await this.crossPlatformIntegration.executeFileOperation(fileOp)
          results.push(result)
        } catch (error) {
          logger.warn('File operation failed:', error)
        }
      }
    }

    // Execute app automation if specified
    if (task.parameters.appAutomation) {
      for (const appAuto of task.parameters.appAutomation) {
        try {
          const result = await this.crossPlatformIntegration.executeAppAutomation(
            appAuto.appId,
            appAuto.action,
            appAuto.parameters
          )
          results.push(result)
        } catch (error) {
          logger.warn('App automation failed:', error)
        }
      }
    }

    // Execute service integrations if specified
    if (task.parameters.serviceIntegrations) {
      for (const serviceInt of task.parameters.serviceIntegrations) {
        try {
          const result = await this.crossPlatformIntegration.integrateWithService(
            serviceInt.serviceId,
            serviceInt.action,
            serviceInt.data
          )
          results.push(result)
        } catch (error) {
          logger.warn('Service integration failed:', error)
        }
      }
    }

    return results
  }

  private async executeSecurityTasks(task: EnhancedAgentTask): Promise<any[]> {
    logger.info(`🔐 Executing security tasks for: ${task.name}`)

    const results: any[] = []

    // Handle encryption tasks
    if (task.parameters.encryptData) {
      for (const data of task.parameters.encryptData) {
        try {
          const encrypted = await this.advancedSecurity.encrypt(data)
          results.push({ type: 'encryption', data: encrypted })
        } catch (error) {
          logger.warn('Encryption failed:', error)
        }
      }
    }

    // Handle credential storage
    if (task.parameters.storeCredentials) {
      for (const credential of task.parameters.storeCredentials) {
        try {
          const credentialId = await this.advancedSecurity.storeCredential(credential)
          results.push({ type: 'credential-storage', credentialId })
        } catch (error) {
          logger.warn('Credential storage failed:', error)
        }
      }
    }

    // Perform security assessment
    const securityStatus = this.advancedSecurity.getSecurityStatus()
    results.push({ type: 'security-assessment', status: securityStatus })

    return results
  }

  private async generateTaskSummary(task: EnhancedAgentTask, results: any): Promise<string> {
    try {
      // Generate AI-powered summary if available
      if (window.electronAPI?.sendAIMessage) {
        const prompt = `Generate a comprehensive summary for this enhanced agent task:

Task: ${task.name}
Description: ${task.description}
Type: ${task.type}
Capabilities: ${task.capabilities.join(', ')}

Results Summary:
- Search Results: ${results.searchResults?.length || 0} reports
- Automation Results: ${results.automationResults?.length || 0} tasks
- Integration Results: ${results.integrationResults?.length || 0} operations
- Security Results: ${results.securityResults?.length || 0} actions

Please provide a structured summary of the task execution and key outcomes.`

        const response = await window.electronAPI.sendAIMessage(prompt)
        if (response.success) {
          return response.result || 'Task completed successfully'
        }
      }
    } catch (error) {
      logger.warn('Failed to generate AI summary:', error)
    }

    // Fallback summary
    return `Enhanced task "${task.name}" completed successfully with ${task.capabilities.length} capabilities utilized. Execution time: ${task.endTime ? Math.round((task.endTime - (task.startTime || 0)) / 1000) : 0} seconds.`
  }

  private generateRecommendations(task: EnhancedAgentTask, results: any): string[] {
    const recommendations: string[] = []

    // Analyze results and generate recommendations
    if (results.searchResults?.length > 0) {
      recommendations.push('Consider creating follow-up research tasks based on the findings')
    }

    if (results.automationResults?.length > 0) {
      recommendations.push('Review automation results for optimization opportunities')
    }

    if (results.integrationResults?.length > 0) {
      recommendations.push('Evaluate integration success and consider expanding to additional platforms')
    }

    if (results.securityResults?.length > 0) {
      recommendations.push('Review security operations and ensure compliance with policies')
    }

    if (recommendations.length === 0) {
      recommendations.push('Task completed successfully - consider similar tasks for increased efficiency')
    }

    return recommendations
  }

  private setupEventListeners(): void {
    // Listen for individual service events
    appEvents.on('deepSearch:completed', (data) => {
      this.handleSearchCompletion(data)
    })

    appEvents.on('shadowWorkspace:taskUpdate', (data) => {
      this.handleShadowTaskUpdate(data)
    })

    appEvents.on('crossPlatform:taskUpdate', (data) => {
      this.handleIntegrationTaskUpdate(data)
    })

    appEvents.on('security:auditLog', (data) => {
      this.handleSecurityEvent(data)
    })
  }

  private handleSearchCompletion(data: any): void {
    logger.debug('Search completed:', data)
    // Update related enhanced tasks
  }

  private handleShadowTaskUpdate(data: any): void {
    logger.debug('Shadow task updated:', data)
    // Update related enhanced tasks
  }

  private handleIntegrationTaskUpdate(data: any): void {
    logger.debug('Integration task updated:', data)
    // Update related enhanced tasks
  }

  private handleSecurityEvent(data: any): void {
    logger.debug('Security event:', data)
    // Handle security events
  }

  private notifyTaskUpdate(task: EnhancedAgentTask): void {
    appEvents.emit('enhancedAgent:taskUpdate', {
      taskId: task.id,
      status: task.status,
      progress: task.progress,
      error: task.error
    })
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Public API methods
  public getActiveTasks(): EnhancedAgentTask[] {
    return Array.from(this.activeTasks.values())
  }

  public getQueuedTasks(): EnhancedAgentTask[] {
    return [...this.taskQueue]
  }

  public getCapabilityMatrix(): AgentCapabilityMatrix {
    return { ...this.capabilityMatrix }
  }

  public async cancelTask(taskId: string): Promise<boolean> {
    const activeTask = this.activeTasks.get(taskId)
    const queuedTask = this.taskQueue.find(t => t.id === taskId)

    if (activeTask) {
      activeTask.status = 'cancelled'
      activeTask.error = 'Cancelled by user'
      this.activeTasks.delete(taskId)
      this.notifyTaskUpdate(activeTask)
      return true
    }

    if (queuedTask) {
      queuedTask.status = 'cancelled'
      queuedTask.error = 'Cancelled by user'
      this.taskQueue = this.taskQueue.filter(t => t.id !== taskId)
      this.notifyTaskUpdate(queuedTask)
      return true
    }

    return false
  }

  public getSystemStatus(): any {
    return {
      coordinator: {
        activeTasks: this.activeTasks.size,
        queuedTasks: this.taskQueue.length,
        capabilities: this.capabilityMatrix
      },
      services: {
        deepSearch: this.deepSearchEngine.getSearchSources().length,
        shadowWorkspace: this.shadowWorkspace.getActiveTasks().length,
        crossPlatform: this.crossPlatformIntegration.getInstalledApps().length,
        security: this.advancedSecurity.getSecurityStatus()
      }
    }
  }
}

export default EnhancedAgentCoordinator