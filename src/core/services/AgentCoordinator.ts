/**
 * Agent Coordination Manager
 * Manages agent collaboration, task handoffs, and workflow orchestration
 */

import { createLogger } from '../logger/Logger'
import { appEvents } from '../utils/EventEmitter'
import { AgentStatus } from '../types'
import IntegratedAgentFramework from '../../main/services/IntegratedAgentFramework'
import ConversationManager from './ConversationManager'

const logger = createLogger('AgentCoordinator')

export interface AgentCollaboration {
  id: string
  primaryAgent: string
  supportingAgents: string[]
  sharedContext: Record<string, any>
  workflowSteps: WorkflowStep[]
  status: 'planning' | 'executing' | 'completed' | 'failed'
  startedAt: number
  completedAt?: number
  results: any[]
}

export interface WorkflowStep {
  id: string
  agentId: string
  action: string
  dependencies: string[]
  status: 'pending' | 'running' | 'completed' | 'failed'
  input?: any
  output?: any
  startedAt?: number
  completedAt?: number
  retryCount: number
}

export interface AgentHandoff {
  fromAgent: string
  toAgent: string
  context: Record<string, any>
  reason: string
  timestamp: number
}

class AgentCoordinator {
  private static instance: AgentCoordinator
  private collaborations: Map<string, AgentCollaboration> = new Map()
  private activeHandoffs: Map<string, AgentHandoff> = new Map()
  private agentFramework: IntegratedAgentFramework
  private conversationManager: ConversationManager
  private workflowTemplates: Map<string, WorkflowStep[]> = new Map()

  private constructor() {
    this.agentFramework = IntegratedAgentFramework.getInstance()
    this.conversationManager = ConversationManager.getInstance()
    this.initializeWorkflowTemplates()
    this.setupEventListeners()
  }

  static getInstance(): AgentCoordinator {
    if (!AgentCoordinator.instance) {
      AgentCoordinator.instance = new AgentCoordinator()
    }
    return AgentCoordinator.instance
  }

  /**
   * Orchestrate a complex task involving multiple agents
   */
  async orchestrateTask(
    task: string,
    sessionId: string,
    options: {
      maxAgents?: number
      timeoutMs?: number
      priority?: 'low' | 'normal' | 'high'
    } = {}
  ): Promise<{ success: boolean; collaborationId?: string; error?: string }> {
    try {
      logger.info('Starting task orchestration', { task, sessionId })

      // Analyze task complexity and determine required agents
      const taskAnalysis = await this.analyzeTaskComplexity(task, sessionId)
      
      if (taskAnalysis.agents.length === 1) {
        // Single agent task - use direct execution
        return await this.executeSingleAgentTask(task, taskAnalysis.agents[0], sessionId)
      }

      // Multi-agent collaboration needed
      const collaborationId = `collab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      const collaboration: AgentCollaboration = {
        id: collaborationId,
        primaryAgent: taskAnalysis.agents[0],
        supportingAgents: taskAnalysis.agents.slice(1),
        sharedContext: {
          originalTask: task,
          sessionId,
          priority: options.priority || 'normal',
          estimatedDuration: taskAnalysis.estimatedDuration
        },
        workflowSteps: await this.generateWorkflowSteps(task, taskAnalysis),
        status: 'planning',
        startedAt: Date.now(),
        results: []
      }

      this.collaborations.set(collaborationId, collaboration)

      // Start workflow execution
      const result = await this.executeWorkflow(collaboration)
      
      return {
        success: result.success,
        collaborationId,
        error: result.error
      }

    } catch (error) {
      logger.error('Task orchestration failed', error as Error, { task, sessionId })
      return { success: false, error: (error as Error).message }
    }
  }

  /**
   * Handle agent handoff when one agent needs to pass control to another
   */
  async handoffToAgent(
    fromAgent: string,
    toAgent: string,
    context: Record<string, any>,
    reason: string
  ): Promise<{ success: boolean; handoffId?: string; error?: string }> {
    try {
      const handoffId = `handoff_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      const handoff: AgentHandoff = {
        fromAgent,
        toAgent,
        context: {
          ...context,
          handoffReason: reason,
          originalAgent: fromAgent
        },
        reason,
        timestamp: Date.now()
      }

      this.activeHandoffs.set(handoffId, handoff)

      logger.info('Agent handoff initiated', { fromAgent, toAgent, reason, handoffId })

      // Execute the handoff by passing enhanced context to the new agent
      const enhancedTask = this.createHandoffTask(handoff)
      const result = await this.agentFramework.processUserInput(enhancedTask)

      if (result.success) {
        // Clean up handoff after successful completion
        this.activeHandoffs.delete(handoffId)
        
        appEvents.emit('agent:handoff-completed', {
          fromAgent,
          toAgent,
          taskId: handoffId
        })
      }

      return {
        success: result.success,
        handoffId,
        error: result.error
      }

    } catch (error) {
      logger.error('Agent handoff failed', error as Error, { fromAgent, toAgent })
      return { success: false, error: (error as Error).message }
    }
  }

  /**
   * Monitor and coordinate active agent collaborations
   */
  async monitorCollaborations(): Promise<{
    active: number
    completed: number
    failed: number
    avgDuration: number
    issues: string[]
  }> {
    const all = Array.from(this.collaborations.values())
    const active = all.filter(c => c.status === 'executing' || c.status === 'planning').length
    const completed = all.filter(c => c.status === 'completed').length
    const failed = all.filter(c => c.status === 'failed').length
    
    const completedCollabs = all.filter(c => c.completedAt)
    const avgDuration = completedCollabs.length > 0 
      ? completedCollabs.reduce((sum, c) => sum + (c.completedAt! - c.startedAt), 0) / completedCollabs.length
      : 0

    // Identify issues
    const issues = []
    const stalledCollabs = all.filter(c => 
      c.status === 'executing' && (Date.now() - c.startedAt) > 300000
    )
    
    if (stalledCollabs.length > 0) {
      issues.push(`${stalledCollabs.length} collaborations appear stalled`)
    }

    const highFailureRate = failed / Math.max(all.length, 1) > 0.3
    if (highFailureRate) {
      issues.push('High collaboration failure rate detected')
    }

    return {
      active,
      completed,
      failed,
      avgDuration,
      issues
    }
  }

  /**
   * Get shared context between agents for a collaboration
   */
  getSharedContext(collaborationId: string): Record<string, any> | null {
    const collaboration = this.collaborations.get(collaborationId)
    return collaboration ? collaboration.sharedContext : null
  }

  /**
   * Update shared context for a collaboration
   */
  updateSharedContext(
    collaborationId: string, 
    updates: Record<string, any>
  ): boolean {
    const collaboration = this.collaborations.get(collaborationId)
    if (!collaboration) return false

    Object.assign(collaboration.sharedContext, updates)
    
    appEvents.emit('agent:context-updated', {
      agentId: collaborationId,
      context: collaboration.sharedContext
    })

    return true
  }

  /**
   * Cancel a running collaboration
   */
  async cancelCollaboration(collaborationId: string): Promise<boolean> {
    const collaboration = this.collaborations.get(collaborationId)
    if (!collaboration) return false

    try {
      // Cancel all running workflow steps
      for (const step of collaboration.workflowSteps) {
        if (step.status === 'running') {
          // Attempt to cancel the agent task
          await this.agentFramework.cancelTask(step.id)
        }
      }

      collaboration.status = 'failed'
      collaboration.completedAt = Date.now()

      logger.info('Collaboration cancelled', { collaborationId })
      
      appEvents.emit('agent:collaboration-cancelled', { 
        agentIds: collaboration.supportingAgents,
        reason: 'Manual cancellation'
      })
      
      return true

    } catch (error) {
      logger.error('Failed to cancel collaboration', error as Error, { collaborationId })
      return false
    }
  }

  // Private methods

  private async analyzeTaskComplexity(task: string, sessionId: string): Promise<{
    complexity: 'simple' | 'moderate' | 'complex'
    agents: string[]
    estimatedDuration: number
    workflowType: string
  }> {
    // Get conversation context to better understand the task
    const intent = await this.conversationManager.analyzeUserIntent(sessionId, task)
    
    const lowerTask = task.toLowerCase()
    const agents = []
    let complexity: 'simple' | 'moderate' | 'complex' = 'simple'
    let estimatedDuration = 30000 // 30 seconds default

    // Multi-keyword detection for complexity
    const complexityIndicators = {
      simple: ['find', 'show', 'what', 'how'],
      moderate: ['compare', 'analyze', 'research', 'create'],
      complex: ['comprehensive', 'detailed', 'multiple', 'across', 'integrate', 'workflow']
    }

    // Determine complexity
    for (const [level, indicators] of Object.entries(complexityIndicators)) {
      const matches = indicators.filter(indicator => lowerTask.includes(indicator)).length
      if (matches > 0) {
        complexity = level as 'simple' | 'moderate' | 'complex'
      }
    }

    // Agent selection based on task content and intent
    if (intent.suggestedAgents.length > 0) {
      agents.push(...intent.suggestedAgents)
    }

    // Additional agent detection
    if (lowerTask.includes('research') || lowerTask.includes('find')) {
      if (!agents.includes('research-agent')) agents.push('research-agent')
    }
    
    if (lowerTask.includes('email') || lowerTask.includes('form') || lowerTask.includes('social')) {
      if (!agents.includes('communication-agent')) agents.push('communication-agent')
    }
    
    if (lowerTask.includes('automate') || lowerTask.includes('workflow') || lowerTask.includes('schedule')) {
      if (!agents.includes('automation-agent')) agents.push('automation-agent')
    }
    
    if (lowerTask.includes('shop') || lowerTask.includes('price') || lowerTask.includes('buy')) {
      if (!agents.includes('shopping-agent')) agents.push('shopping-agent')
    }

    if (lowerTask.includes('analyze') || lowerTask.includes('summarize')) {
      if (!agents.includes('analysis-agent')) agents.push('analysis-agent')
    }

    // Default to research agent if no specific agents detected
    if (agents.length === 0) {
      agents.push('research-agent')
    }

    // Adjust duration based on complexity and agent count
    if (complexity === 'complex') {
      estimatedDuration = 120000 // 2 minutes
    } else if (complexity === 'moderate') {
      estimatedDuration = 60000 // 1 minute
    }

    estimatedDuration += (agents.length - 1) * 15000 // Add 15s per additional agent

    // Determine workflow type
    let workflowType = 'sequential'
    if (lowerTask.includes('compare') || lowerTask.includes('versus')) {
      workflowType = 'parallel-comparison'
    } else if (lowerTask.includes('comprehensive') || lowerTask.includes('detailed')) {
      workflowType = 'hierarchical'
    }

    return {
      complexity,
      agents,
      estimatedDuration,
      workflowType
    }
  }

  private async generateWorkflowSteps(
    _task: string,
    analysis: any
  ): Promise<WorkflowStep[]> {
    const steps: WorkflowStep[] = []
    
    if (analysis.workflowType === 'parallel-comparison') {
      // Create parallel steps for comparison tasks
      analysis.agents.forEach((agentId: string, index: number) => {
        steps.push({
          id: `step_${index + 1}`,
          agentId,
          action: `parallel_${agentId.replace('-agent', '')}_task`,
          dependencies: [],
          status: 'pending',
          retryCount: 0
        })
      })
      
      // Add synthesis step
      steps.push({
        id: `step_synthesis`,
        agentId: analysis.agents[0], // Primary agent handles synthesis
        action: 'synthesize_results',
        dependencies: steps.map(s => s.id),
        status: 'pending',
        retryCount: 0
      })
      
    } else if (analysis.workflowType === 'hierarchical') {
      // Create hierarchical workflow
      steps.push({
        id: 'step_1_planning',
        agentId: analysis.agents[0],
        action: 'plan_comprehensive_task',
        dependencies: [],
        status: 'pending',
        retryCount: 0
      })
      
      analysis.agents.slice(1).forEach((agentId: string, index: number) => {
        steps.push({
          id: `step_${index + 2}_execution`,
          agentId,
          action: 'execute_specialized_task',
          dependencies: ['step_1_planning'],
          status: 'pending',
          retryCount: 0
        })
      })
      
    } else {
      // Default sequential workflow
      analysis.agents.forEach((agentId: string, index: number) => {
        const prevStepId = index > 0 ? `step_${index}` : null
        steps.push({
          id: `step_${index + 1}`,
          agentId,
          action: 'sequential_task',
          dependencies: prevStepId ? [prevStepId] : [],
          status: 'pending',
          retryCount: 0
        })
      })
    }

    return steps
  }

  private async executeWorkflow(
    collaboration: AgentCollaboration
  ): Promise<{ success: boolean; error?: string }> {
    try {
      collaboration.status = 'executing'
      
      // Execute workflow steps based on dependencies
      const completedSteps = new Set<string>()
      const maxIterations = collaboration.workflowSteps.length * 2
      let iterations = 0

      while (completedSteps.size < collaboration.workflowSteps.length && iterations < maxIterations) {
        iterations++
        
        // Find steps ready to execute
        const readySteps = collaboration.workflowSteps.filter(step => 
          step.status === 'pending' &&
          step.dependencies.every(dep => completedSteps.has(dep))
        )

        if (readySteps.length === 0) {
          // Check if we're deadlocked
          const pendingSteps = collaboration.workflowSteps.filter(s => s.status === 'pending')
          if (pendingSteps.length > 0) {
            throw new Error('Workflow deadlock detected')
          }
          break
        }

        // Execute ready steps
        const stepPromises = readySteps.map(step => this.executeWorkflowStep(step, collaboration))
        const stepResults = await Promise.allSettled(stepPromises)

        // Process results
        stepResults.forEach((result, index) => {
          const step = readySteps[index]
          if (result.status === 'fulfilled' && result.value.success) {
            step.status = 'completed'
            step.completedAt = Date.now()
            step.output = result.value.output
            completedSteps.add(step.id)
            collaboration.results.push(result.value.output)
          } else {
            step.status = 'failed'
            step.completedAt = Date.now()
            logger.error('Workflow step failed', new Error(result.status === 'rejected' ? result.reason : 'Unknown error'), {
              stepId: step.id,
              collaborationId: collaboration.id
            })
          }
        })
      }

      // Check final status
      const failedSteps = collaboration.workflowSteps.filter(s => s.status === 'failed')
      if (failedSteps.length > 0) {
        collaboration.status = 'failed'
        return { success: false, error: `${failedSteps.length} workflow steps failed` }
      }

      collaboration.status = 'completed'
      collaboration.completedAt = Date.now()
      
      logger.info('Workflow completed successfully', {
        collaborationId: collaboration.id,
        duration: collaboration.completedAt - collaboration.startedAt
      })

      appEvents.emit('agent:collaboration-completed', {
        agentIds: collaboration.supportingAgents,
        result: collaboration.results
      })

      return { success: true }

    } catch (error) {
      collaboration.status = 'failed'
      collaboration.completedAt = Date.now()
      
      logger.error('Workflow execution failed', error as Error, {
        collaborationId: collaboration.id
      })

      return { success: false, error: (error as Error).message }
    }
  }

  private async executeWorkflowStep(
    step: WorkflowStep,
    collaboration: AgentCollaboration
  ): Promise<{ success: boolean; output?: any; error?: string }> {
    try {
      step.status = 'running'
      step.startedAt = Date.now()

      // Create context-aware task for the agent
      const contextualTask = this.createContextualTask(step, collaboration)
      
      // Execute through agent framework
      const result = await this.agentFramework.processUserInput(contextualTask)
      
      return {
        success: result.success,
        output: result,
        error: result.error
      }

    } catch (error) {
      return {
        success: false,
        error: (error as Error).message
      }
    }
  }

  private createContextualTask(step: WorkflowStep, collaboration: AgentCollaboration): string {
    const baseTask = collaboration.sharedContext.originalTask
    const previousResults = collaboration.results
    
    let contextualTask = baseTask

    // Add context from previous steps
    if (previousResults.length > 0) {
      contextualTask += `\n\nContext from previous steps:\n${
        previousResults.map((result, index) => `Step ${index + 1}: ${JSON.stringify(result).substring(0, 200)}`).join('\n')
      }`
    }

    // Add step-specific instructions
    if (step.action === 'synthesize_results') {
      contextualTask = `Synthesize and combine the following research results into a comprehensive summary:\n\n${
        previousResults.map(r => JSON.stringify(r)).join('\n\n')
      }\n\nOriginal request: ${baseTask}`
    } else if (step.action.startsWith('parallel_')) {
      const agentType = step.action.replace('parallel_', '').replace('_task', '')
      contextualTask = `As the ${agentType} specialist, handle this part of the task: ${baseTask}`
    }

    return contextualTask
  }

  private async executeSingleAgentTask(
    task: string,
    _agentId: string,
    _sessionId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await this.agentFramework.processUserInput(task)
      return {
        success: result.success,
        error: result.error
      }
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message
      }
    }
  }

  private createHandoffTask(handoff: AgentHandoff): string {
    return `[AGENT HANDOFF from ${handoff.fromAgent}]
    
Reason for handoff: ${handoff.reason}

Context: ${JSON.stringify(handoff.context, null, 2)}

Please continue with this task using the provided context.`
  }

  private initializeWorkflowTemplates(): void {
    // Initialize common workflow templates
    this.workflowTemplates.set('research-comparison', [
      { id: 'gather', agentId: 'research-agent', action: 'gather_data', dependencies: [], status: 'pending', retryCount: 0 },
      { id: 'analyze', agentId: 'analysis-agent', action: 'analyze_data', dependencies: ['gather'], status: 'pending', retryCount: 0 },
      { id: 'synthesize', agentId: 'research-agent', action: 'synthesize_findings', dependencies: ['analyze'], status: 'pending', retryCount: 0 }
    ])

    this.workflowTemplates.set('shopping-research', [
      { id: 'search', agentId: 'shopping-agent', action: 'search_products', dependencies: [], status: 'pending', retryCount: 0 },
      { id: 'compare', agentId: 'shopping-agent', action: 'compare_options', dependencies: ['search'], status: 'pending', retryCount: 0 },
      { id: 'recommend', agentId: 'analysis-agent', action: 'generate_recommendations', dependencies: ['compare'], status: 'pending', retryCount: 0 }
    ])
  }

  private setupEventListeners(): void {
    // Listen for agent status updates
    appEvents.on('agent:update', (status: AgentStatus) => {
      // Update relevant collaborations
      for (const collaboration of this.collaborations.values()) {
        const relevantStep = collaboration.workflowSteps.find(step => 
          step.agentId === status.id || step.id === status.id
        )
        
        if (relevantStep) {
          this.updateSharedContext(collaboration.id, {
            [`agent_${status.id}_status`]: status,
            [`agent_${status.id}_progress`]: status.progress,
            lastUpdate: Date.now()
          })
        }
      }
    })

    // Cleanup completed collaborations periodically
    setInterval(() => {
      this.cleanupOldCollaborations()
    }, 300000) // 5 minutes
  }

  private cleanupOldCollaborations(): void {
    const now = Date.now()
    const oneHourAgo = now - 3600000

    for (const [id, collaboration] of this.collaborations) {
      if (collaboration.completedAt && collaboration.completedAt < oneHourAgo) {
        this.collaborations.delete(id)
        logger.debug('Cleaned up old collaboration', { collaborationId: id })
      }
    }
  }
}

export default AgentCoordinator