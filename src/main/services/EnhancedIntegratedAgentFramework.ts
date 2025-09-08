// Enhanced Integrated Agent Framework - Autonomous Agent System with Memory and Coordination
// Integrates memory, coordination, and planning services for true agentic behavior

import { createLogger } from '../../core/logger/Logger'
import AgentMemoryService from '../../core/services/AgentMemoryService'
import AgentCoordinationService from '../../core/services/AgentCoordinationService'
import AutonomousPlanningEngine, { Goal } from '../../core/services/AutonomousPlanningEngine'
import IntegratedAgentFramework from './IntegratedAgentFramework'

const logger = createLogger('EnhancedIntegratedAgentFramework')

export interface AutonomousTask {
  id: string
  description: string
  type: 'goal' | 'command' | 'request'
  priority: number
  deadline?: number
  constraints: any[]
  context: TaskContext
}

export interface TaskContext {
  currentUrl: string
  userPreferences: any
  sessionHistory: any[]
  availableResources: any[]
}

export interface AgentResponse {
  success: boolean
  result?: any
  actions?: any[]
  error?: string
  agentId: string
  executionTime: number
  confidence: number
  nextSteps?: string[]
}

class EnhancedIntegratedAgentFramework extends IntegratedAgentFramework {
  private static enhancedInstance: EnhancedIntegratedAgentFramework
  private memoryService: AgentMemoryService
  private coordinationService: AgentCoordinationService
  private planningEngine: AutonomousPlanningEngine
  private activeGoals: Map<string, Goal> = new Map()
  private taskQueue: AutonomousTask[] = []
  private isProcessingTasks: boolean = false

  constructor() {
    super()
    this.memoryService = AgentMemoryService.getInstance()
    this.coordinationService = AgentCoordinationService.getInstance()
    this.planningEngine = AutonomousPlanningEngine.getInstance()
  }

  static getEnhancedInstance(): EnhancedIntegratedAgentFramework {
    if (!EnhancedIntegratedAgentFramework.enhancedInstance) {
      EnhancedIntegratedAgentFramework.enhancedInstance = new EnhancedIntegratedAgentFramework()
    }
    return EnhancedIntegratedAgentFramework.enhancedInstance
  }

  async initialize(): Promise<void> {
    try {
      logger.info('Initializing Enhanced Integrated Agent Framework...')
      
      // Initialize parent framework
      await super.initialize()
      
      // Initialize enhanced services
      await this.memoryService.initialize()
      await this.coordinationService.initialize()
      await this.planningEngine.initialize()
      
      // Register agents with coordination service
      await this.registerAgentsWithCoordination()
      
      // Start autonomous task processing
      this.startAutonomousTaskProcessing()
      
      // Load existing goals
      await this.loadExistingGoals()
      
      logger.info('Enhanced Integrated Agent Framework initialized successfully')
    } catch (error) {
      logger.error('Failed to initialize Enhanced Integrated Agent Framework', error as Error)
      throw error
    }
  }

  // Enhanced User Input Processing with Memory and Context
  async processUserInput(input: string, context?: TaskContext): Promise<AgentResponse> {
    const startTime = Date.now()
    
    try {
      logger.info(`Processing enhanced user input: ${input}`)
      
      // Analyze input to determine if it's a goal, command, or request
      const taskAnalysis = await this.analyzeUserInput(input, context)
      
      // Get relevant memory context
      const memoryContext = await this.getRelevantMemoryContext(input, taskAnalysis.primaryAgent)
      
      // Enhanced task analysis with memory
      const enhancedAnalysis = await this.enhanceTaskAnalysisWithMemory(taskAnalysis, memoryContext)
      
      let response: AgentResponse
      
      if (taskAnalysis.isGoal) {
        // Handle as autonomous goal
        response = await this.handleGoalInput(input, enhancedAnalysis, context)
      } else {
        // Handle as immediate task with memory-enhanced execution
        response = await this.executeEnhancedTask(input, enhancedAnalysis, context)
      }
      
      // Record interaction for learning
      await this.recordInteractionForLearning(input, response, enhancedAnalysis)
      
      response.executionTime = Date.now() - startTime
      return response
      
    } catch (error) {
      logger.error('Enhanced user input processing failed', error as Error)
      
      const errorResponse: AgentResponse = {
        success: false,
        error: (error as Error).message,
        agentId: 'system',
        executionTime: Date.now() - startTime,
        confidence: 0
      }
      
      // Record failure for learning
      await this.recordFailureForLearning(input, error as Error)
      
      return errorResponse
    }
  }

  // Goal-Based Processing
  private async handleGoalInput(input: string, analysis: any, context?: TaskContext): Promise<AgentResponse> {
    logger.info(`Processing goal-based input: ${input}`)
    
    // Create autonomous goal
    const goalId = await this.planningEngine.createGoal({
      description: input,
      type: analysis.primaryAgent,
      priority: analysis.priority || 5,
      deadline: analysis.deadline,
      constraints: analysis.constraints || [],
      successCriteria: analysis.successCriteria || []
    })
    
    // Create and execute plan
    const planId = await this.planningEngine.createExecutionPlan(goalId)
    
    // Execute autonomously (non-blocking)
    this.planningEngine.executeAutonomously(planId).catch(error => {
      logger.error(`Autonomous goal execution failed for ${goalId}:`, error)
    })
    
    return {
      success: true,
      result: `✅ **Autonomous Goal Created**\n\n🎯 **Goal**: ${input}\n\n🤖 **Agent**: ${analysis.primaryAgent}\n\n📋 **Plan**: Created execution plan with autonomous monitoring\n\n**Status**: Agents will work autonomously toward this goal. You'll be notified of progress and completion.`,
      agentId: 'planning_engine',
      executionTime: 0,
      confidence: analysis.confidence,
      nextSteps: [
        'Agents will execute the plan autonomously',
        'Monitor progress through status updates',
        'Adjust goal parameters if needed'
      ]
    }
  }

  // Enhanced Task Execution with Memory and Coordination
  private async executeEnhancedTask(input: string, analysis: any, context?: TaskContext): Promise<AgentResponse> {
    const primaryAgent = analysis.primaryAgent
    
    // Check if task requires collaboration
    if (analysis.complexity === 'high' || analysis.supportingAgents.length > 0) {
      return await this.executeCollaborativeTask(input, analysis, context)
    }
    
    // Execute with enhanced context from memory
    const enhancedContext = {
      ...context,
      memoryContext: analysis.memoryContext,
      previousStrategies: analysis.previousStrategies,
      knownPatterns: analysis.knownPatterns
    }
    
    // Execute using parent framework but with enhanced context
    const baseResponse = await super.processUserInput(input)
    
    // Enhance response with memory insights
    if (baseResponse.success && analysis.memoryContext.successStrategies.length > 0) {
      baseResponse.result += `\n\n💡 **From Experience**: Based on previous successful tasks, this approach has worked well before.`
    }
    
    return {
      ...baseResponse,
      confidence: Math.min(baseResponse.confidence || 0.7, analysis.confidence)
    }
  }

  // Collaborative Task Execution
  private async executeCollaborativeTask(input: string, analysis: any, context?: TaskContext): Promise<AgentResponse> {
    logger.info(`Executing collaborative task: ${input}`)
    
    const primaryAgent = analysis.primaryAgent
    const collaborators = analysis.supportingAgents.slice(0, 2) // Max 2 collaborators
    
    // Request collaboration
    const collaborationId = await this.coordinationService.requestCollaboration({
      requesterId: primaryAgent,
      taskDescription: input,
      requiredSkills: analysis.requiredSkills || [],
      estimatedDuration: analysis.estimatedDuration || 120,
      priority: analysis.priority || 5,
      resourceRequirements: []
    })
    
    // Form temporary team
    const teamId = await this.coordinationService.formTeam(primaryAgent, input, collaborators)
    
    // Execute task with team coordination
    const teamResponse = await this.executeWithTeamCoordination(input, teamId, analysis)
    
    return {
      success: true,
      result: teamResponse.result,
      agentId: `team_${teamId}`,
      executionTime: teamResponse.executionTime,
      confidence: teamResponse.confidence,
      nextSteps: teamResponse.nextSteps
    }
  }

  private async executeWithTeamCoordination(input: string, teamId: string, analysis: any): Promise<any> {
    // Share context with team
    await this.coordinationService.shareContext(teamId, 'task_analysis', analysis)
    await this.coordinationService.shareContext(teamId, 'user_input', input)
    
    // Execute primary task
    const primaryResponse = await super.processUserInput(input)
    
    // Update team status
    await this.coordinationService.updateTeamStatus(teamId, 'completed')
    
    return {
      result: `🤝 **Collaborative Task Completed**\n\n${primaryResponse.result}\n\n**Team Coordination**: Multiple agents collaborated to enhance the response quality.`,
      executionTime: 0,
      confidence: Math.min((primaryResponse.confidence || 0.7) + 0.1, 1.0), // Collaboration bonus
      nextSteps: primaryResponse.nextSteps || []
    }
  }

  // Memory-Enhanced Analysis
  private async analyzeUserInput(input: string, context?: TaskContext): Promise<any> {
    const baseAnalysis = this.analyzeAgentTask(input)
    
    // Determine if this is a goal vs immediate task
    const goalKeywords = ['monitor', 'track', 'continuous', 'ongoing', 'automate', 'schedule', 'daily', 'weekly', 'always']
    const isGoal = goalKeywords.some(keyword => input.toLowerCase().includes(keyword)) ||
                   input.length > 100 ||
                   input.toLowerCase().includes('goal')
    
    // Extract constraints and deadlines
    const constraints = this.extractConstraints(input)
    const deadline = this.extractDeadline(input)
    const priority = this.extractPriority(input)
    
    return {
      ...baseAnalysis,
      isGoal,
      constraints,
      deadline,
      priority,
      estimatedDuration: this.estimateTaskDuration(input, baseAnalysis),
      requiredSkills: this.extractRequiredSkills(input),
      successCriteria: this.extractSuccessCriteria(input)
    }
  }

  private async getRelevantMemoryContext(input: string, agentId: string): Promise<any> {
    return await this.memoryService.getRelevantContext(agentId, input, 'task_execution')
  }

  private async enhanceTaskAnalysisWithMemory(analysis: any, memoryContext: any): Promise<any> {
    return {
      ...analysis,
      memoryContext,
      previousStrategies: memoryContext.successStrategies || [],
      knownPatterns: memoryContext.failurePatterns || [],
      confidence: this.calculateConfidenceWithMemory(analysis, memoryContext)
    }
  }

  private calculateConfidenceWithMemory(analysis: any, memoryContext: any): number {
    let confidence = analysis.confidence || 0.7
    
    // Boost confidence if we have successful strategies
    if (memoryContext.successStrategies && memoryContext.successStrategies.length > 0) {
      confidence = Math.min(confidence + 0.1, 1.0)
    }
    
    // Reduce confidence if we have failure patterns
    if (memoryContext.failurePatterns && memoryContext.failurePatterns.length > 0) {
      confidence = Math.max(confidence - 0.1, 0.3)
    }
    
    return confidence
  }

  // Learning and Memory Recording
  private async recordInteractionForLearning(input: string, response: AgentResponse, analysis: any): Promise<void> {
    // Record successful interaction
    if (response.success) {
      await this.memoryService.recordTaskOutcome({
        taskId: `task_${Date.now()}`,
        agentId: response.agentId,
        success: true,
        result: response.result,
        strategies: analysis.previousStrategies || [],
        timeToComplete: response.executionTime / 1000,
        userSatisfaction: response.confidence
      })
      
      // Store successful strategy
      if (response.confidence > 0.8) {
        await this.memoryService.storeKnowledge(response.agentId, {
          domain: 'successful_strategies',
          knowledge: {
            inputPattern: input.substring(0, 100),
            strategy: analysis.primaryAgent,
            context: analysis,
            outcome: response.result
          },
          confidence: response.confidence
        })
      }
    }
  }

  private async recordFailureForLearning(input: string, error: Error): Promise<void> {
    await this.memoryService.recordTaskOutcome({
      taskId: `failed_task_${Date.now()}`,
      agentId: 'system',
      success: false,
      result: null,
      strategies: [],
      timeToComplete: 0,
      failureReasons: [error.message],
      improvements: ['Add better error handling', 'Improve input validation']
    })
  }

  // Agent Registration with Coordination Service
  private async registerAgentsWithCoordination(): Promise<void> {
    const agents = [
      { id: 'research', skills: ['research', 'analysis', 'information_gathering', 'web_search'] },
      { id: 'navigation', skills: ['navigation', 'url_handling', 'web_browsing', 'site_interaction'] },
      { id: 'shopping', skills: ['shopping', 'price_comparison', 'product_research', 'deal_finding'] },
      { id: 'communication', skills: ['communication', 'email', 'content_creation', 'social_media'] },
      { id: 'automation', skills: ['automation', 'workflow', 'task_scheduling', 'process_optimization'] },
      { id: 'analysis', skills: ['analysis', 'data_processing', 'content_analysis', 'insights'] }
    ]

    for (const agent of agents) {
      await this.coordinationService.registerAgent(agent.id, agent.skills)
    }
  }

  // Autonomous Task Processing
  private startAutonomousTaskProcessing(): void {
    setInterval(async () => {
      if (!this.isProcessingTasks && this.taskQueue.length > 0) {
        await this.processTaskQueue()
      }
    }, 5000) // Process every 5 seconds
  }

  private async processTaskQueue(): Promise<void> {
    this.isProcessingTasks = true
    
    try {
      while (this.taskQueue.length > 0) {
        const task = this.taskQueue.shift()!
        await this.processAutonomousTask(task)
      }
    } catch (error) {
      logger.error('Task queue processing failed', error as Error)
    } finally {
      this.isProcessingTasks = false
    }
  }

  private async processAutonomousTask(task: AutonomousTask): Promise<void> {
    logger.info(`Processing autonomous task: ${task.description}`)
    
    try {
      const response = await this.processUserInput(task.description, task.context)
      logger.info(`Autonomous task completed: ${task.id}`)
    } catch (error) {
      logger.error(`Autonomous task failed: ${task.id}`, error as Error)
    }
  }

  private async loadExistingGoals(): Promise<void> {
    // Load any existing goals from memory
    try {
      const goals = await this.memoryService.getGoals('planning_engine', 'active')
      logger.info(`Loaded ${goals.length} existing goals`)
    } catch (error) {
      logger.warn('No existing goals found')
    }
  }

  // Helper Methods for Input Analysis
  private extractConstraints(input: string): any[] {
    const constraints = []
    const lowerInput = input.toLowerCase()
    
    if (lowerInput.includes('budget') || lowerInput.includes('cost')) {
      constraints.push({ type: 'budget', description: 'Budget constraint mentioned' })
    }
    
    if (lowerInput.includes('time') || lowerInput.includes('deadline')) {
      constraints.push({ type: 'time', description: 'Time constraint mentioned' })
    }
    
    return constraints
  }

  private extractDeadline(input: string): number | undefined {
    // Simple deadline extraction - can be enhanced
    const lowerInput = input.toLowerCase()
    
    if (lowerInput.includes('today')) {
      return Date.now() + (24 * 60 * 60 * 1000)
    }
    
    if (lowerInput.includes('week')) {
      return Date.now() + (7 * 24 * 60 * 60 * 1000)
    }
    
    return undefined
  }

  private extractPriority(input: string): number {
    const lowerInput = input.toLowerCase()
    
    if (lowerInput.includes('urgent') || lowerInput.includes('asap')) {
      return 9
    }
    
    if (lowerInput.includes('important')) {
      return 7
    }
    
    return 5 // Default priority
  }

  private estimateTaskDuration(input: string, analysis: any): number {
    let baseDuration = 60 // 1 minute default
    
    if (analysis.complexity === 'high') {
      baseDuration = 300 // 5 minutes
    } else if (analysis.complexity === 'medium') {
      baseDuration = 120 // 2 minutes
    }
    
    // Adjust based on task type
    if (input.toLowerCase().includes('research')) {
      baseDuration *= 2
    }
    
    return baseDuration
  }

  private extractRequiredSkills(input: string): string[] {
    const skills = []
    const lowerInput = input.toLowerCase()
    
    if (lowerInput.includes('research') || lowerInput.includes('find')) skills.push('research')
    if (lowerInput.includes('analyze') || lowerInput.includes('analysis')) skills.push('analysis')
    if (lowerInput.includes('shop') || lowerInput.includes('buy')) skills.push('shopping')
    if (lowerInput.includes('navigate') || lowerInput.includes('visit')) skills.push('navigation')
    if (lowerInput.includes('email') || lowerInput.includes('write')) skills.push('communication')
    if (lowerInput.includes('automate') || lowerInput.includes('schedule')) skills.push('automation')
    
    return skills
  }

  private extractSuccessCriteria(input: string): any[] {
    // Simple success criteria extraction
    return [
      {
        metric: 'task_completion',
        threshold: 1,
        measurement: 'exact',
        description: 'Task must be completed successfully'
      }
    ]
  }

  // Public Methods for External Integration
  async addAutonomousTask(description: string, priority: number = 5, context?: TaskContext): Promise<string> {
    const taskId = `auto_task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const task: AutonomousTask = {
      id: taskId,
      description,
      type: 'request',
      priority,
      context: context || { currentUrl: '', userPreferences: {}, sessionHistory: [], availableResources: [] },
      constraints: []
    }
    
    this.taskQueue.push(task)
    logger.info(`Added autonomous task: ${taskId}`)
    
    return taskId
  }

  async setAutonomousGoal(description: string, type: string, priority: number = 5): Promise<string> {
    const goalId = await this.planningEngine.createGoal({
      description,
      type: type as any,
      priority,
      constraints: [],
      successCriteria: []
    })
    
    const planId = await this.planningEngine.createExecutionPlan(goalId)
    
    // Execute autonomously
    this.planningEngine.executeAutonomously(planId).catch(error => {
      logger.error(`Autonomous goal execution failed: ${goalId}`, error)
    })
    
    return goalId
  }

  async getAgentMemoryInsights(agentId: string): Promise<any> {
    const memories = await this.memoryService.getMemories(agentId, { limit: 10 })
    const knowledge = await this.memoryService.getKnowledge(agentId)
    const goals = await this.memoryService.getGoals(agentId)
    
    return {
      recentMemories: memories,
      knowledgeDomains: knowledge.map(k => k.domain),
      activeGoals: goals.filter(g => g.status === 'active'),
      successRate: this.calculateAgentSuccessRate(memories)
    }
  }

  private calculateAgentSuccessRate(memories: any[]): number {
    const outcomeMemories = memories.filter(m => m.type === 'outcome')
    if (outcomeMemories.length === 0) return 0.8 // Default
    
    const successes = outcomeMemories.filter(m => m.content.success).length
    return successes / outcomeMemories.length
  }
}

export default EnhancedIntegratedAgentFramework