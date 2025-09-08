// Autonomous Planning Engine - Multi-Step Task Planning and Goal-Oriented Execution
// Enables agents to create, execute, and adapt complex multi-step plans autonomously

import { createLogger } from '../logger/Logger'
import AgentMemoryService from './AgentMemoryService'
import AgentCoordinationService from './AgentCoordinationService'

const logger = createLogger('AutonomousPlanningEngine')

export interface Goal {
  id: string
  description: string
  type: 'research' | 'analysis' | 'shopping' | 'communication' | 'automation' | 'navigation'
  priority: number
  deadline?: number
  constraints: Constraint[]
  successCriteria: SuccessCriteria[]
  status: 'active' | 'completed' | 'paused' | 'failed'
  progress: number
  createdAt: number
  updatedAt: number
}

export interface Constraint {
  type: 'time' | 'resource' | 'quality' | 'scope'
  value: any
  description: string
}

export interface SuccessCriteria {
  metric: string
  threshold: number
  measurement: 'exact' | 'minimum' | 'maximum'
  description: string
}

export interface ExecutionPlan {
  id: string
  goalId: string
  steps: PlanStep[]
  estimatedDuration: number
  resourceRequirements: ResourceRequirement[]
  contingencyPlans: ContingencyPlan[]
  createdAt: number
  updatedAt: number
  status: 'draft' | 'active' | 'completed' | 'failed' | 'adapted'
}

export interface PlanStep {
  id: string
  description: string
  type: 'action' | 'decision' | 'validation' | 'collaboration'
  assignedAgent: string
  estimatedDuration: number
  dependencies: string[]
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped'
  inputs: any[]
  expectedOutputs: any[]
  actualOutputs?: any[]
  startTime?: number
  endTime?: number
  retryCount: number
  maxRetries: number
}

export interface ResourceRequirement {
  type: 'computation' | 'memory' | 'network' | 'storage' | 'api_calls' | 'time'
  amount: number
  duration: number
  critical: boolean
}

export interface ContingencyPlan {
  id: string
  triggerCondition: string
  alternativeSteps: PlanStep[]
  rollbackSteps: PlanStep[]
  description: string
}

export interface ExecutionContext {
  planId: string
  currentStep: string
  sharedData: Map<string, any>
  executionHistory: ExecutionEvent[]
  startTime: number
  estimatedCompletion: number
}

export interface ExecutionEvent {
  timestamp: number
  stepId: string
  type: 'step_started' | 'step_completed' | 'step_failed' | 'plan_adapted' | 'contingency_triggered'
  data: any
  agentId: string
}

export interface PlanAdaptation {
  reason: string
  changes: PlanChange[]
  confidence: number
  timestamp: number
}

export interface PlanChange {
  type: 'add_step' | 'remove_step' | 'modify_step' | 'reorder_steps' | 'change_agent'
  stepId?: string
  newStep?: PlanStep
  modifications?: Partial<PlanStep>
}

class AutonomousPlanningEngine {
  private static instance: AutonomousPlanningEngine
  private memoryService: AgentMemoryService
  private coordinationService: AgentCoordinationService
  private activePlans: Map<string, ExecutionPlan> = new Map()
  private executionContexts: Map<string, ExecutionContext> = new Map()
  private goals: Map<string, Goal> = new Map()
  private planTemplates: Map<string, ExecutionPlan> = new Map()
  private isInitialized: boolean = false

  private constructor() {
    this.memoryService = AgentMemoryService.getInstance()
    this.coordinationService = AgentCoordinationService.getInstance()
  }

  static getInstance(): AutonomousPlanningEngine {
    if (!AutonomousPlanningEngine.instance) {
      AutonomousPlanningEngine.instance = new AutonomousPlanningEngine()
    }
    return AutonomousPlanningEngine.instance
  }

  async initialize(): Promise<void> {
    try {
      logger.info('Initializing Autonomous Planning Engine...')
      
      await this.memoryService.initialize()
      await this.coordinationService.initialize()
      
      // Load existing goals and plans
      await this.loadGoalsAndPlans()
      
      // Initialize plan templates
      await this.initializePlanTemplates()
      
      // Start execution monitoring
      this.startExecutionMonitoring()
      
      this.isInitialized = true
      logger.info('Autonomous Planning Engine initialized successfully')
    } catch (error) {
      logger.error('Failed to initialize Autonomous Planning Engine', error as Error)
      throw error
    }
  }

  // Goal Management
  async createGoal(goalData: Omit<Goal, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'progress'>): Promise<string> {
    const goalId = `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const goal: Goal = {
      id: goalId,
      status: 'active',
      progress: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      ...goalData
    }

    this.goals.set(goalId, goal)
    
    // Store in memory for persistence
    await this.memoryService.storeGoal('planning_engine', {
      description: goal.description,
      type: goal.type as any,
      status: goal.status,
      priority: goal.priority,
      progress: goal.progress,
      subGoals: [],
      strategies: []
    })

    logger.info(`Created goal ${goalId}: ${goal.description}`)
    return goalId
  }

  async updateGoalProgress(goalId: string, progress: number, status?: Goal['status']): Promise<void> {
    const goal = this.goals.get(goalId)
    if (goal) {
      goal.progress = Math.min(Math.max(progress, 0), 100)
      goal.updatedAt = Date.now()
      
      if (status) {
        goal.status = status
      }
      
      if (goal.progress >= 100) {
        goal.status = 'completed'
      }

      await this.memoryService.updateGoal('planning_engine', goalId, {
        progress: goal.progress,
        status: goal.status
      })
    }
  }

  // Plan Creation and Management
  async createExecutionPlan(goalId: string): Promise<string> {
    const goal = this.goals.get(goalId)
    if (!goal) {
      throw new Error(`Goal ${goalId} not found`)
    }

    const planId = `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Check if we have a template for this goal type
    const template = this.planTemplates.get(goal.type)
    let steps: PlanStep[]
    
    if (template) {
      steps = await this.adaptTemplateSteps(template.steps, goal)
    } else {
      steps = await this.generateStepsFromGoal(goal)
    }

    // Estimate duration and resources
    const estimatedDuration = steps.reduce((total, step) => total + step.estimatedDuration, 0)
    const resourceRequirements = await this.calculateResourceRequirements(steps)
    const contingencyPlans = await this.createContingencyPlans(steps)

    const plan: ExecutionPlan = {
      id: planId,
      goalId,
      steps,
      estimatedDuration,
      resourceRequirements,
      contingencyPlans,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      status: 'draft'
    }

    this.activePlans.set(planId, plan)
    
    logger.info(`Created execution plan ${planId} for goal ${goalId} with ${steps.length} steps`)
    return planId
  }

  async executeAutonomously(planId: string): Promise<void> {
    const plan = this.activePlans.get(planId)
    if (!plan) {
      throw new Error(`Plan ${planId} not found`)
    }

    plan.status = 'active'
    
    // Create execution context
    const context: ExecutionContext = {
      planId,
      currentStep: plan.steps[0]?.id || '',
      sharedData: new Map(),
      executionHistory: [],
      startTime: Date.now(),
      estimatedCompletion: Date.now() + (plan.estimatedDuration * 1000)
    }
    
    this.executionContexts.set(planId, context)

    logger.info(`Starting autonomous execution of plan ${planId}`)
    
    try {
      await this.executeStepsSequentially(plan, context)
      
      plan.status = 'completed'
      await this.updateGoalProgress(plan.goalId, 100, 'completed')
      
      logger.info(`Successfully completed plan ${planId}`)
    } catch (error) {
      logger.error(`Plan ${planId} execution failed:`, error)
      
      // Try contingency plans
      const success = await this.executeContingencyPlans(plan, context, error as Error)
      
      if (!success) {
        plan.status = 'failed'
        await this.updateGoalProgress(plan.goalId, context.executionHistory.length / plan.steps.length * 100, 'failed')
      }
    }
  }

  private async executeStepsSequentially(plan: ExecutionPlan, context: ExecutionContext): Promise<void> {
    for (const step of plan.steps) {
      if (step.status === 'completed' || step.status === 'skipped') {
        continue
      }

      // Check dependencies
      const dependenciesMet = await this.checkDependencies(step, context)
      if (!dependenciesMet) {
        logger.warn(`Dependencies not met for step ${step.id}, skipping for now`)
        continue
      }

      context.currentStep = step.id
      
      // Record step start
      const startEvent: ExecutionEvent = {
        timestamp: Date.now(),
        stepId: step.id,
        type: 'step_started',
        data: { description: step.description },
        agentId: step.assignedAgent
      }
      context.executionHistory.push(startEvent)

      step.status = 'in_progress'
      step.startTime = Date.now()

      try {
        const result = await this.executeStep(step, context)
        
        step.status = 'completed'
        step.endTime = Date.now()
        step.actualOutputs = result.outputs

        // Store outputs in shared data
        if (result.outputs) {
          for (const [key, value] of Object.entries(result.outputs)) {
            context.sharedData.set(`${step.id}_${key}`, value)
          }
        }

        // Record step completion
        const completeEvent: ExecutionEvent = {
          timestamp: Date.now(),
          stepId: step.id,
          type: 'step_completed',
          data: { outputs: result.outputs, duration: step.endTime - step.startTime! },
          agentId: step.assignedAgent
        }
        context.executionHistory.push(completeEvent)

        // Update goal progress
        const completedSteps = plan.steps.filter(s => s.status === 'completed').length
        const progress = (completedSteps / plan.steps.length) * 100
        await this.updateGoalProgress(plan.goalId, progress)

      } catch (error) {
        step.retryCount++
        
        if (step.retryCount < step.maxRetries) {
          logger.warn(`Step ${step.id} failed, retrying (${step.retryCount}/${step.maxRetries})`)
          step.status = 'pending'
          continue
        }

        step.status = 'failed'
        step.endTime = Date.now()

        // Record step failure
        const failEvent: ExecutionEvent = {
          timestamp: Date.now(),
          stepId: step.id,
          type: 'step_failed',
          data: { error: (error as Error).message, retryCount: step.retryCount },
          agentId: step.assignedAgent
        }
        context.executionHistory.push(failEvent)

        // Try to adapt the plan
        const adapted = await this.adaptPlan(plan, step, error as Error)
        if (adapted) {
          logger.info(`Plan ${plan.id} adapted after step failure`)
          continue
        }

        throw error
      }
    }
  }

  private async executeStep(step: PlanStep, context: ExecutionContext): Promise<{ outputs: any }> {
    const agent = step.assignedAgent

    switch (step.type) {
      case 'action':
        return await this.executeActionStep(step, context, agent)
      
      case 'decision':
        return await this.executeDecisionStep(step, context, agent)
      
      case 'validation':
        return await this.executeValidationStep(step, context, agent)
      
      case 'collaboration':
        return await this.executeCollaborationStep(step, context, agent)
      
      default:
        throw new Error(`Unknown step type: ${step.type}`)
    }
  }

  private async executeActionStep(step: PlanStep, context: ExecutionContext, agent: string): Promise<{ outputs: any }> {
    // Get relevant context from shared data
    const inputs = step.inputs.map(input => {
      if (typeof input === 'string' && input.startsWith('$')) {
        const key = input.substring(1)
        return context.sharedData.get(key)
      }
      return input
    })

    // Send task to appropriate agent through coordination service
    const taskResult = await this.coordinationService.allocateTask(step.description, agent)
    
    // Simulate action execution (in real implementation, this would delegate to actual agents)
    await new Promise(resolve => setTimeout(resolve, step.estimatedDuration * 1000))

    return {
      outputs: {
        result: `Action completed: ${step.description}`,
        taskId: taskResult.taskId,
        timestamp: Date.now()
      }
    }
  }

  private async executeDecisionStep(step: PlanStep, context: ExecutionContext, agent: string): Promise<{ outputs: any }> {
    // Get historical data to inform decision
    const relevantContext = await this.memoryService.getRelevantContext(agent, step.description, 'decision_making')
    
    // Make decision based on context and inputs
    const decision = await this.makeInformedDecision(step, context, relevantContext)
    
    return {
      outputs: {
        decision,
        confidence: decision.confidence,
        reasoning: decision.reasoning
      }
    }
  }

  private async executeValidationStep(step: PlanStep, context: ExecutionContext, agent: string): Promise<{ outputs: any }> {
    // Validate previous steps or current state
    const validationResults = await this.validateStepOutputs(step, context)
    
    return {
      outputs: {
        isValid: validationResults.isValid,
        validationDetails: validationResults.details,
        recommendedActions: validationResults.recommendedActions
      }
    }
  }

  private async executeCollaborationStep(step: PlanStep, context: ExecutionContext, agent: string): Promise<{ outputs: any }> {
    // Request collaboration for complex tasks
    const collaborationId = await this.coordinationService.requestCollaboration({
      requesterId: agent,
      taskDescription: step.description,
      requiredSkills: step.inputs.filter(i => typeof i === 'string'),
      estimatedDuration: step.estimatedDuration,
      priority: 7,
      resourceRequirements: []
    })

    return {
      outputs: {
        collaborationId,
        status: 'collaboration_initiated',
        expectedCompletion: Date.now() + (step.estimatedDuration * 1000)
      }
    }
  }

  // Plan Adaptation
  private async adaptPlan(plan: ExecutionPlan, failedStep: PlanStep, error: Error): Promise<boolean> {
    try {
      // Analyze failure and determine adaptation strategy
      const adaptation = await this.analyzeFailureAndAdapt(plan, failedStep, error)
      
      if (adaptation.changes.length === 0) {
        return false
      }

      // Apply changes to plan
      for (const change of adaptation.changes) {
        await this.applyPlanChange(plan, change)
      }

      plan.status = 'adapted'
      plan.updatedAt = Date.now()

      // Record adaptation in memory
      await this.memoryService.storeMemory('planning_engine', {
        type: 'learning',
        content: {
          planId: plan.id,
          adaptation,
          originalError: error.message
        },
        importance: 8,
        tags: ['plan_adaptation', 'failure_recovery'],
        relatedEntries: []
      })

      logger.info(`Plan ${plan.id} adapted with ${adaptation.changes.length} changes`)
      return true
      
    } catch (adaptError) {
      logger.error(`Failed to adapt plan ${plan.id}:`, adaptError)
      return false
    }
  }

  private async analyzeFailureAndAdapt(plan: ExecutionPlan, failedStep: PlanStep, error: Error): Promise<PlanAdaptation> {
    const errorMessage = error.message.toLowerCase()
    const changes: PlanChange[] = []

    // Common adaptation strategies
    if (errorMessage.includes('timeout') || errorMessage.includes('slow')) {
      // Increase time allocation
      changes.push({
        type: 'modify_step',
        stepId: failedStep.id,
        modifications: {
          estimatedDuration: failedStep.estimatedDuration * 1.5,
          maxRetries: Math.max(failedStep.maxRetries, 3)
        }
      })
    }

    if (errorMessage.includes('agent') || errorMessage.includes('unavailable')) {
      // Try different agent
      const alternativeAgent = await this.findAlternativeAgent(failedStep.assignedAgent, failedStep.type)
      if (alternativeAgent) {
        changes.push({
          type: 'modify_step',
          stepId: failedStep.id,
          modifications: {
            assignedAgent: alternativeAgent
          }
        })
      }
    }

    if (errorMessage.includes('dependency') || errorMessage.includes('prerequisite')) {
      // Add prerequisite step
      const prerequisiteStep = await this.createPrerequisiteStep(failedStep)
      if (prerequisiteStep) {
        changes.push({
          type: 'add_step',
          newStep: prerequisiteStep
        })
      }
    }

    return {
      reason: `Adapting to failure: ${error.message}`,
      changes,
      confidence: changes.length > 0 ? 0.7 : 0.1,
      timestamp: Date.now()
    }
  }

  private async applyPlanChange(plan: ExecutionPlan, change: PlanChange): Promise<void> {
    switch (change.type) {
      case 'add_step':
        if (change.newStep) {
          plan.steps.push(change.newStep)
        }
        break
      
      case 'remove_step':
        if (change.stepId) {
          plan.steps = plan.steps.filter(s => s.id !== change.stepId)
        }
        break
      
      case 'modify_step':
        if (change.stepId && change.modifications) {
          const stepIndex = plan.steps.findIndex(s => s.id === change.stepId)
          if (stepIndex >= 0) {
            plan.steps[stepIndex] = { ...plan.steps[stepIndex], ...change.modifications }
          }
        }
        break
      
      case 'reorder_steps':
        // Implement step reordering logic
        break
      
      case 'change_agent':
        if (change.stepId && change.modifications?.assignedAgent) {
          const stepIndex = plan.steps.findIndex(s => s.id === change.stepId)
          if (stepIndex >= 0) {
            plan.steps[stepIndex].assignedAgent = change.modifications.assignedAgent
          }
        }
        break
    }
  }

  // Helper Methods
  private async generateStepsFromGoal(goal: Goal): Promise<PlanStep[]> {
    const steps: PlanStep[] = []
    
    // Generate steps based on goal type
    switch (goal.type) {
      case 'research':
        steps.push(...await this.generateResearchSteps(goal))
        break
      case 'shopping':
        steps.push(...await this.generateShoppingSteps(goal))
        break
      case 'analysis':
        steps.push(...await this.generateAnalysisSteps(goal))
        break
      default:
        steps.push(...await this.generateGenericSteps(goal))
    }

    return steps
  }

  private async generateResearchSteps(goal: Goal): Promise<PlanStep[]> {
    return [
      {
        id: `step_1_${Date.now()}`,
        description: `Define research scope for: ${goal.description}`,
        type: 'decision',
        assignedAgent: 'research',
        estimatedDuration: 30,
        dependencies: [],
        status: 'pending',
        inputs: [goal.description],
        expectedOutputs: ['research_scope', 'key_questions'],
        retryCount: 0,
        maxRetries: 2
      },
      {
        id: `step_2_${Date.now()}`,
        description: `Gather information sources`,
        type: 'action',
        assignedAgent: 'research',
        estimatedDuration: 120,
        dependencies: [`step_1_${Date.now()}`],
        status: 'pending',
        inputs: ['$research_scope'],
        expectedOutputs: ['sources', 'raw_data'],
        retryCount: 0,
        maxRetries: 3
      },
      {
        id: `step_3_${Date.now()}`,
        description: `Analyze and synthesize findings`,
        type: 'collaboration',
        assignedAgent: 'analysis',
        estimatedDuration: 180,
        dependencies: [`step_2_${Date.now()}`],
        status: 'pending',
        inputs: ['$raw_data', '$sources'],
        expectedOutputs: ['analysis_report', 'key_insights'],
        retryCount: 0,
        maxRetries: 2
      }
    ]
  }

  private async generateShoppingSteps(goal: Goal): Promise<PlanStep[]> {
    return [
      {
        id: `step_1_${Date.now()}`,
        description: `Define product requirements`,
        type: 'decision',
        assignedAgent: 'shopping',
        estimatedDuration: 30,
        dependencies: [],
        status: 'pending',
        inputs: [goal.description],
        expectedOutputs: ['product_criteria', 'budget_range'],
        retryCount: 0,
        maxRetries: 2
      },
      {
        id: `step_2_${Date.now()}`,
        description: `Search multiple retailers`,
        type: 'action',
        assignedAgent: 'shopping',
        estimatedDuration: 180,
        dependencies: [`step_1_${Date.now()}`],
        status: 'pending',
        inputs: ['$product_criteria'],
        expectedOutputs: ['product_options', 'price_comparisons'],
        retryCount: 0,
        maxRetries: 3
      }
    ]
  }

  private async generateAnalysisSteps(goal: Goal): Promise<PlanStep[]> {
    return [
      {
        id: `step_1_${Date.now()}`,
        description: `Collect data for analysis`,
        type: 'action',
        assignedAgent: 'analysis',
        estimatedDuration: 60,
        dependencies: [],
        status: 'pending',
        inputs: [goal.description],
        expectedOutputs: ['dataset', 'data_quality_report'],
        retryCount: 0,
        maxRetries: 2
      }
    ]
  }

  private async generateGenericSteps(goal: Goal): Promise<PlanStep[]> {
    return [
      {
        id: `step_1_${Date.now()}`,
        description: `Execute task: ${goal.description}`,
        type: 'action',
        assignedAgent: 'research', // Default agent
        estimatedDuration: 120,
        dependencies: [],
        status: 'pending',
        inputs: [goal.description],
        expectedOutputs: ['task_result'],
        retryCount: 0,
        maxRetries: 2
      }
    ]
  }

  private async checkDependencies(step: PlanStep, context: ExecutionContext): Promise<boolean> {
    for (const depId of step.dependencies) {
      const hasOutput = context.sharedData.has(`${depId}_result`)
      if (!hasOutput) {
        return false
      }
    }
    return true
  }

  private async calculateResourceRequirements(steps: PlanStep[]): Promise<ResourceRequirement[]> {
    const totalDuration = steps.reduce((sum, step) => sum + step.estimatedDuration, 0)
    
    return [
      {
        type: 'computation',
        amount: steps.length * 10,
        duration: totalDuration,
        critical: true
      },
      {
        type: 'memory',
        amount: steps.length * 50,
        duration: totalDuration,
        critical: false
      },
      {
        type: 'network',
        amount: steps.filter(s => s.type === 'action').length * 5,
        duration: totalDuration,
        critical: true
      }
    ]
  }

  private async createContingencyPlans(steps: PlanStep[]): Promise<ContingencyPlan[]> {
    return [
      {
        id: `contingency_${Date.now()}`,
        triggerCondition: 'agent_unavailable',
        alternativeSteps: steps.map(step => ({
          ...step,
          assignedAgent: 'research', // Fallback agent
          id: `alt_${step.id}`
        })),
        rollbackSteps: [],
        description: 'Fallback to research agent if assigned agent unavailable'
      }
    ]
  }

  private async executeContingencyPlans(plan: ExecutionPlan, context: ExecutionContext, error: Error): Promise<boolean> {
    for (const contingency of plan.contingencyPlans) {
      if (this.shouldTriggerContingency(contingency, error)) {
        logger.info(`Triggering contingency plan: ${contingency.description}`)
        
        try {
          // Execute alternative steps
          for (const altStep of contingency.alternativeSteps) {
            await this.executeStep(altStep, context)
          }
          return true
        } catch (contingencyError) {
          logger.warn(`Contingency plan failed:`, contingencyError)
        }
      }
    }
    return false
  }

  private shouldTriggerContingency(contingency: ContingencyPlan, error: Error): boolean {
    const errorMessage = error.message.toLowerCase()
    return errorMessage.includes(contingency.triggerCondition.toLowerCase())
  }

  private async makeInformedDecision(step: PlanStep, context: ExecutionContext, relevantContext: any): Promise<any> {
    // Simple decision making logic - can be enhanced with ML
    return {
      decision: `Proceed with ${step.description}`,
      confidence: 0.8,
      reasoning: 'Based on historical data and current context'
    }
  }

  private async validateStepOutputs(step: PlanStep, context: ExecutionContext): Promise<any> {
    return {
      isValid: true,
      details: 'Outputs meet expected criteria',
      recommendedActions: []
    }
  }

  private async findAlternativeAgent(currentAgent: string, stepType: string): Promise<string | null> {
    // Logic to find alternative agent with similar capabilities
    const alternatives = {
      'research': ['analysis', 'navigation'],
      'shopping': ['research', 'analysis'],
      'analysis': ['research'],
      'navigation': ['research'],
      'communication': ['research'],
      'automation': ['research']
    }
    
    return alternatives[currentAgent]?.[0] || 'research'
  }

  private async createPrerequisiteStep(failedStep: PlanStep): Promise<PlanStep | null> {
    return {
      id: `prereq_${Date.now()}`,
      description: `Prepare prerequisites for ${failedStep.description}`,
      type: 'action',
      assignedAgent: 'research',
      estimatedDuration: 60,
      dependencies: [],
      status: 'pending',
      inputs: [],
      expectedOutputs: ['prerequisites_ready'],
      retryCount: 0,
      maxRetries: 2
    }
  }

  private async loadGoalsAndPlans(): Promise<void> {
    // Load from memory service - implementation depends on storage format
    try {
      const goals = await this.memoryService.getGoals('planning_engine')
      for (const goal of goals) {
        // Convert to internal format if needed
      }
    } catch (error) {
      logger.warn('No existing goals found, starting fresh')
    }
  }

  private async initializePlanTemplates(): Promise<void> {
    // Initialize common plan templates for different goal types
    // Templates help create consistent and optimized plans
    logger.info('Plan templates initialized')
  }

  private startExecutionMonitoring(): void {
    // Monitor active plans and adapt as needed
    setInterval(async () => {
      for (const [planId, context] of this.executionContexts.entries()) {
        await this.monitorPlanExecution(planId, context)
      }
    }, 10000) // Check every 10 seconds
  }

  private async monitorPlanExecution(planId: string, context: ExecutionContext): Promise<void> {
    const plan = this.activePlans.get(planId)
    if (!plan || plan.status !== 'active') return

    // Check if plan is behind schedule
    const now = Date.now()
    const elapsed = now - context.startTime
    const expectedProgress = elapsed / (plan.estimatedDuration * 1000)
    const actualProgress = context.executionHistory.filter(e => e.type === 'step_completed').length / plan.steps.length

    if (actualProgress < expectedProgress * 0.8) {
      logger.warn(`Plan ${planId} is behind schedule, considering adaptation`)
      // Could trigger plan adaptation here
    }
  }
}

export default AutonomousPlanningEngine