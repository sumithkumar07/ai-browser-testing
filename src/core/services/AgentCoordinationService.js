// Agent Coordination Service - Multi-Agent Task Coordination and Goal Management
// Handles complex task orchestration across multiple AI agents

class AgentCoordinationService {
  constructor() {
    this.instance = null
    this.isInitialized = false
    this.activeGoals = new Map()
    this.coordinationQueue = []
    this.agentCapabilities = new Map()
    this.taskHistory = []
    this.coordinationStrategies = new Map()
    
    this.initializeAgentCapabilities()
  }

  static getInstance() {
    if (!AgentCoordinationService.instance) {
      AgentCoordinationService.instance = new AgentCoordinationService()
    }
    return AgentCoordinationService.instance
  }

  async initialize() {
    try {
      console.log('🎯 Initializing Agent Coordination Service...')
      
      // Initialize coordination strategies
      this.initializeCoordinationStrategies()
      
      // Start goal monitoring
      this.startGoalMonitoring()
      
      this.isInitialized = true
      console.log('✅ Agent Coordination Service initialized successfully')
    } catch (error) {
      console.error('❌ Failed to initialize Agent Coordination Service:', error)
      throw error
    }
  }

  initializeAgentCapabilities() {
    // Define what each agent can do and their coordination preferences
    this.agentCapabilities.set('research', {
      primaryTasks: ['information_gathering', 'data_analysis', 'source_verification'],
      secondaryTasks: ['content_summarization', 'trend_analysis'],
      coordinationPreference: 'sequential', // Works best after navigation, before analysis
      averageTaskTime: 30000, // 30 seconds
      reliability: 0.9,
      dependencies: ['navigation'], // Often needs navigation agent first
      outputs: ['research_data', 'sources', 'insights']
    })

    this.agentCapabilities.set('navigation', {
      primaryTasks: ['url_navigation', 'tab_management', 'website_interaction'],
      secondaryTasks: ['bookmark_management', 'history_tracking'],
      coordinationPreference: 'parallel', // Can work independently
      averageTaskTime: 5000, // 5 seconds
      reliability: 0.95,
      dependencies: [],
      outputs: ['navigation_state', 'page_content', 'accessibility_info']
    })

    this.agentCapabilities.set('shopping', {
      primaryTasks: ['product_search', 'price_comparison', 'deal_finding'],
      secondaryTasks: ['review_analysis', 'inventory_checking'],
      coordinationPreference: 'sequential', // Needs research and navigation
      averageTaskTime: 45000, // 45 seconds
      reliability: 0.85,
      dependencies: ['research', 'navigation'],
      outputs: ['product_data', 'price_info', 'deals', 'recommendations']
    })

    this.agentCapabilities.set('communication', {
      primaryTasks: ['email_composition', 'form_filling', 'message_creation'],
      secondaryTasks: ['social_media_posting', 'template_generation'],
      coordinationPreference: 'independent', // Usually works alone
      averageTaskTime: 20000, // 20 seconds
      reliability: 0.9,
      dependencies: [],
      outputs: ['composed_content', 'filled_forms', 'communication_templates']
    })

    this.agentCapabilities.set('automation', {
      primaryTasks: ['workflow_creation', 'task_automation', 'process_optimization'],
      secondaryTasks: ['script_generation', 'monitoring_setup'],
      coordinationPreference: 'coordinator', // Often coordinates other agents
      averageTaskTime: 60000, // 60 seconds
      reliability: 0.8,
      dependencies: ['research', 'navigation'],
      outputs: ['workflows', 'automation_scripts', 'process_maps']
    })

    this.agentCapabilities.set('analysis', {
      primaryTasks: ['content_analysis', 'data_interpretation', 'insight_generation'],
      secondaryTasks: ['sentiment_analysis', 'pattern_recognition'],
      coordinationPreference: 'sequential', // Usually works after other agents
      averageTaskTime: 25000, // 25 seconds
      reliability: 0.92,
      dependencies: ['research'], // Often needs research data
      outputs: ['analysis_results', 'insights', 'recommendations']
    })
  }

  initializeCoordinationStrategies() {
    // Define how agents should coordinate for different types of tasks
    
    this.coordinationStrategies.set('simple_task', {
      description: 'Single agent task execution',
      pattern: 'single',
      coordination: (taskType) => {
        return {
          agents: [this.selectBestAgent(taskType)],
          sequence: 'single',
          fallback: true
        }
      }
    })

    this.coordinationStrategies.set('research_task', {
      description: 'Multi-step research workflow',
      pattern: 'sequential',
      coordination: (taskType) => {
        return {
          agents: ['navigation', 'research', 'analysis'],
          sequence: 'sequential',
          dependencies: {
            'research': ['navigation'],
            'analysis': ['research']
          },
          fallback: true
        }
      }
    })

    this.coordinationStrategies.set('shopping_task', {
      description: 'Product research and comparison',
      pattern: 'mixed',
      coordination: (taskType) => {
        return {
          agents: ['navigation', 'research', 'shopping', 'analysis'],
          sequence: 'mixed',
          parallel: [['navigation', 'research']],
          sequential: ['shopping', 'analysis'],
          dependencies: {
            'shopping': ['navigation', 'research'],
            'analysis': ['shopping']
          },
          fallback: true
        }
      }
    })

    this.coordinationStrategies.set('automation_task', {
      description: 'Complex workflow automation',
      pattern: 'hierarchical',
      coordination: (taskType) => {
        return {
          coordinator: 'automation',
          agents: ['navigation', 'research', 'automation'],
          sequence: 'hierarchical',
          dependencies: {
            'automation': ['navigation', 'research']
          },
          fallback: true
        }
      }
    })
  }

  selectBestAgent(taskType) {
    // Select the most appropriate agent for a task
    let bestAgent = 'research' // default
    let bestScore = 0

    for (const [agentId, capabilities] of this.agentCapabilities.entries()) {
      let score = 0
      
      // Primary task match
      if (capabilities.primaryTasks.some(task => taskType.includes(task))) {
        score += 10
      }
      
      // Secondary task match
      if (capabilities.secondaryTasks.some(task => taskType.includes(task))) {
        score += 5
      }
      
      // Reliability factor
      score *= capabilities.reliability
      
      if (score > bestScore) {
        bestScore = score
        bestAgent = agentId
      }
    }

    return bestAgent
  }

  async createGoal(goalDescription, priority = 5, deadline = null) {
    try {
      const goalId = `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      const goal = {
        id: goalId,
        description: goalDescription,
        priority: priority,
        status: 'active',
        progress: 0,
        createdAt: Date.now(),
        deadline: deadline,
        steps: [],
        assignedAgents: [],
        coordinationStrategy: this.determineCoordinationStrategy(goalDescription),
        results: [],
        metadata: {}
      }

      this.activeGoals.set(goalId, goal)
      
      // Break down goal into coordinated tasks
      await this.planGoalExecution(goalId)
      
      console.log(`🎯 Created goal: ${goalId} - ${goalDescription}`)
      return goalId
    } catch (error) {
      console.error('❌ Failed to create goal:', error)
      return null
    }
  }

  determineCoordinationStrategy(goalDescription) {
    const description = goalDescription.toLowerCase()
    
    if (description.includes('research') || description.includes('find') || description.includes('analyze')) {
      return 'research_task'
    }
    
    if (description.includes('shop') || description.includes('buy') || description.includes('price') || description.includes('product')) {
      return 'shopping_task'
    }
    
    if (description.includes('automate') || description.includes('workflow') || description.includes('process')) {
      return 'automation_task'
    }
    
    return 'simple_task'
  }

  async planGoalExecution(goalId) {
    try {
      const goal = this.activeGoals.get(goalId)
      if (!goal) return

      const strategy = this.coordinationStrategies.get(goal.coordinationStrategy)
      if (!strategy) return

      const coordinationPlan = strategy.coordination(goal.description)
      
      // Create execution steps based on coordination plan
      const steps = []
      let stepIndex = 0

      if (coordinationPlan.sequence === 'single') {
        steps.push({
          id: stepIndex++,
          agentId: coordinationPlan.agents[0],
          task: goal.description,
          status: 'pending',
          dependencies: [],
          estimatedTime: this.agentCapabilities.get(coordinationPlan.agents[0])?.averageTaskTime || 30000
        })
      } else if (coordinationPlan.sequence === 'sequential') {
        coordinationPlan.agents.forEach((agentId, index) => {
          steps.push({
            id: stepIndex++,
            agentId: agentId,
            task: this.createAgentSpecificTask(agentId, goal.description),
            status: 'pending',
            dependencies: index > 0 ? [index - 1] : [],
            estimatedTime: this.agentCapabilities.get(agentId)?.averageTaskTime || 30000
          })
        })
      }

      goal.steps = steps
      goal.assignedAgents = coordinationPlan.agents
      
      console.log(`📋 Planned execution for goal ${goalId}: ${steps.length} steps`)
    } catch (error) {
      console.error('❌ Failed to plan goal execution:', error)
    }
  }

  createAgentSpecificTask(agentId, originalTask) {
    // Create agent-specific task descriptions
    const capabilities = this.agentCapabilities.get(agentId)
    if (!capabilities) return originalTask

    switch (agentId) {
      case 'navigation':
        return `Navigate and prepare resources for: ${originalTask}`
      case 'research':
        return `Research and gather information about: ${originalTask}`
      case 'shopping':
        return `Find products and compare prices for: ${originalTask}`
      case 'communication':
        return `Create communication content for: ${originalTask}`
      case 'automation':
        return `Create automation workflow for: ${originalTask}`
      case 'analysis':
        return `Analyze and provide insights for: ${originalTask}`
      default:
        return originalTask
    }
  }

  async executeGoal(goalId) {
    try {
      const goal = this.activeGoals.get(goalId)
      if (!goal || goal.status !== 'active') return

      goal.status = 'executing'
      
      console.log(`🚀 Executing goal: ${goalId}`)
      
      // Execute steps based on dependencies
      for (const step of goal.steps) {
        // Check if dependencies are complete
        const dependenciesComplete = step.dependencies.every(depIndex => 
          goal.steps[depIndex].status === 'completed'
        )

        if (dependenciesComplete && step.status === 'pending') {
          await this.executeStep(goalId, step.id)
        }
      }

      // Update goal progress
      const completedSteps = goal.steps.filter(step => step.status === 'completed').length
      goal.progress = (completedSteps / goal.steps.length) * 100

      if (goal.progress === 100) {
        goal.status = 'completed'
        console.log(`✅ Goal completed: ${goalId}`)
      }

    } catch (error) {
      console.error('❌ Failed to execute goal:', error)
      const goal = this.activeGoals.get(goalId)
      if (goal) goal.status = 'failed'
    }
  }

  async executeStep(goalId, stepId) {
    try {
      const goal = this.activeGoals.get(goalId)
      const step = goal.steps.find(s => s.id === stepId)
      
      if (!step) return

      step.status = 'executing'
      step.startTime = Date.now()

      console.log(`⚡ Executing step ${stepId} for goal ${goalId}: ${step.agentId}`)

      // Simulate step execution (in real implementation, this would call the actual agent)
      await new Promise(resolve => setTimeout(resolve, Math.min(step.estimatedTime, 5000)))

      step.status = 'completed'
      step.endTime = Date.now()
      step.actualTime = step.endTime - step.startTime

      console.log(`✅ Step ${stepId} completed in ${step.actualTime}ms`)

    } catch (error) {
      console.error(`❌ Failed to execute step ${stepId}:`, error)
      const goal = this.activeGoals.get(goalId)
      const step = goal.steps.find(s => s.id === stepId)
      if (step) step.status = 'failed'
    }
  }

  async monitorGoalProgress() {
    try {
      const activeGoalsList = Array.from(this.activeGoals.values()).filter(g => g.status === 'active' || g.status === 'executing')
      
      return {
        activeGoals: activeGoalsList.length,
        averageProgress: activeGoalsList.length > 0 
          ? activeGoalsList.reduce((sum, goal) => sum + goal.progress, 0) / activeGoalsList.length
          : 0,
        completedToday: this.getCompletedGoalsToday(),
        totalGoals: this.activeGoals.size
      }
    } catch (error) {
      console.error('❌ Failed to monitor goal progress:', error)
      return { activeGoals: 0, averageProgress: 0, completedToday: 0, totalGoals: 0 }
    }
  }

  getCompletedGoalsToday() {
    const today = new Date().toDateString()
    return Array.from(this.activeGoals.values()).filter(goal => 
      goal.status === 'completed' && 
      new Date(goal.createdAt).toDateString() === today
    ).length
  }

  startGoalMonitoring() {
    // Monitor goals every 30 seconds
    setInterval(() => {
      this.processActiveGoals()
    }, 30000)
  }

  async processActiveGoals() {
    try {
      const activeGoals = Array.from(this.activeGoals.values()).filter(g => g.status === 'active')
      
      for (const goal of activeGoals) {
        await this.executeGoal(goal.id)
      }
    } catch (error) {
      console.error('❌ Error processing active goals:', error)
    }
  }

  getGoalStatus(goalId) {
    return this.activeGoals.get(goalId) || null
  }

  getAllGoals() {
    return Array.from(this.activeGoals.values())
  }

  getCoordinationStats() {
    const goals = Array.from(this.activeGoals.values())
    return {
      totalGoals: goals.length,
      activeGoals: goals.filter(g => g.status === 'active').length,
      completedGoals: goals.filter(g => g.status === 'completed').length,
      failedGoals: goals.filter(g => g.status === 'failed').length,
      averageSteps: goals.length > 0 ? goals.reduce((sum, g) => sum + g.steps.length, 0) / goals.length : 0
    }
  }

  isReady() {
    return this.isInitialized
  }
}

// Export as both default and named export for compatibility
const instance = AgentCoordinationService.getInstance()
module.exports = { default: instance, AgentCoordinationService }