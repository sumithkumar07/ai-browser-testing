// src/main/services/IntelligentAgentAssignmentFramework.ts
export interface Agent {
  id: string
  name: string
  description: string
  capabilities: string[]
  isActive: boolean
  priority: number
  lastUsed: number
  successRate: number
}

export interface AgentAssignment {
  agentId: string
  task: string
  context: any
  timestamp: number
  status: 'pending' | 'in-progress' | 'completed' | 'failed'
  result?: any
  error?: string
}

export interface AgentContext {
  url: string
  pageTitle: string
  pageContent: string
  userIntent: string
  previousActions: any[]
  sessionData: any
}

export class IntelligentAgentAssignmentFramework {
  private static instance: IntelligentAgentAssignmentFramework
  private isInitialized: boolean = false
  private agents: Map<string, Agent> = new Map()
  private assignments: AgentAssignment[] = []
  private maxAssignments: number = 100

  private constructor() {
    this.initializeDefaultAgents()
  }

  static getInstance(): IntelligentAgentAssignmentFramework {
    if (!IntelligentAgentAssignmentFramework.instance) {
      IntelligentAgentAssignmentFramework.instance = new IntelligentAgentAssignmentFramework()
    }
    return IntelligentAgentAssignmentFramework.instance
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('⚠️ Agent Framework already initialized')
      return
    }

    console.log('🤖 Initializing Intelligent Agent Assignment Framework...')
    
    try {
      // Load agent states from storage
      await this.loadAgentStates()
      
      this.isInitialized = true
      console.log(`✅ Agent Framework initialized with ${this.agents.size} agents`)
    } catch (error) {
      console.error('❌ Agent Framework initialization failed:', error)
      throw error
    }
  }

  private initializeDefaultAgents(): void {
    const defaultAgents: Agent[] = [
      {
        id: 'web_search_agent',
        name: 'Web Search Agent',
        description: 'Handles web searches and navigation tasks',
        capabilities: ['search', 'navigate', 'find_information'],
        isActive: true,
        priority: 1,
        lastUsed: 0,
        successRate: 0
      },
      {
        id: 'content_analysis_agent',
        name: 'Content Analysis Agent',
        description: 'Analyzes and summarizes web page content',
        capabilities: ['summarize', 'extract_key_points', 'analyze_structure'],
        isActive: true,
        priority: 2,
        lastUsed: 0,
        successRate: 0
      },
      {
        id: 'shopping_agent',
        name: 'Shopping Assistant Agent',
        description: 'Helps with product research and shopping tasks',
        capabilities: ['find_products', 'compare_prices', 'analyze_reviews'],
        isActive: true,
        priority: 3,
        lastUsed: 0,
        successRate: 0
      },
      {
        id: 'document_agent',
        name: 'Document Processing Agent',
        description: 'Processes and analyzes documents and PDFs',
        capabilities: ['process_pdf', 'extract_text', 'analyze_document'],
        isActive: true,
        priority: 4,
        lastUsed: 0,
        successRate: 0
      },
      {
        id: 'image_analysis_agent',
        name: 'Image Analysis Agent',
        description: 'Analyzes images and visual content',
        capabilities: ['analyze_image', 'extract_text_from_image', 'describe_image'],
        isActive: true,
        priority: 5,
        lastUsed: 0,
        successRate: 0
      },
      {
        id: 'research_agent',
        name: 'Research Assistant Agent',
        description: 'Conducts comprehensive research on topics',
        capabilities: ['research_topic', 'gather_information', 'synthesize_data'],
        isActive: true,
        priority: 6,
        lastUsed: 0,
        successRate: 0
      },
      {
        id: 'translation_agent',
        name: 'Translation Agent',
        description: 'Translates text and content between languages',
        capabilities: ['translate_text', 'detect_language', 'localize_content'],
        isActive: true,
        priority: 7,
        lastUsed: 0,
        successRate: 0
      },
      {
        id: 'automation_agent',
        name: 'Task Automation Agent',
        description: 'Automates complex multi-step tasks',
        capabilities: ['automate_tasks', 'coordinate_actions', 'manage_workflows'],
        isActive: true,
        priority: 8,
        lastUsed: 0,
        successRate: 0
      }
    ]

    defaultAgents.forEach(agent => {
      this.agents.set(agent.id, agent)
    })
  }

  async assignAgent(task: string, context: AgentContext): Promise<AgentAssignment | null> {
    try {
      console.log(`🤖 Assigning agent for task: ${task}`)
      
      if (!this.isInitialized) {
        throw new Error('Agent Framework not initialized')
      }

      // Analyze task and context to determine best agent
      const bestAgent = this.selectBestAgent(task, context)
      
      if (!bestAgent) {
        console.log('⚠️ No suitable agent found for task')
        return null
      }

      // Create assignment
      const assignment: AgentAssignment = {
        agentId: bestAgent.id,
        task,
        context,
        timestamp: Date.now(),
        status: 'pending'
      }

      // Add to assignments
      this.assignments.push(assignment)
      
      // Keep only recent assignments
      if (this.assignments.length > this.maxAssignments) {
        this.assignments = this.assignments.slice(-this.maxAssignments)
      }

      // Update agent usage
      this.updateAgentUsage(bestAgent.id)

      console.log(`✅ Assigned ${bestAgent.name} for task: ${task}`)
      return assignment
      
    } catch (error) {
      console.error('❌ Failed to assign agent:', error)
      return null
    }
  }

  async executeAssignment(assignmentId: string): Promise<any> {
    try {
      console.log(`🤖 Executing assignment: ${assignmentId}`)
      
      const assignment = this.assignments.find(a => 
        a.timestamp.toString() === assignmentId || 
        a.agentId === assignmentId
      )
      
      if (!assignment) {
        throw new Error('Assignment not found')
      }

      const agent = this.agents.get(assignment.agentId)
      if (!agent) {
        throw new Error('Agent not found')
      }

      // Update assignment status
      assignment.status = 'in-progress'
      
      // Execute task based on agent type
      let result: any
      
      switch (agent.id) {
        case 'web_search_agent':
          result = await this.executeWebSearch(assignment)
          break
        case 'content_analysis_agent':
          result = await this.executeContentAnalysis(assignment)
          break
        case 'shopping_agent':
          result = await this.executeShoppingTask(assignment)
          break
        case 'document_agent':
          result = await this.executeDocumentProcessing(assignment)
          break
        case 'image_analysis_agent':
          result = await this.executeImageAnalysis(assignment)
          break
        case 'research_agent':
          result = await this.executeResearch(assignment)
          break
        case 'translation_agent':
          result = await this.executeTranslation(assignment)
          break
        case 'automation_agent':
          result = await this.executeAutomation(assignment)
          break
        default:
          throw new Error(`Unknown agent type: ${agent.id}`)
      }

      // Update assignment with result
      assignment.status = 'completed'
      assignment.result = result
      
      // Update agent success rate
      this.updateAgentSuccessRate(agent.id, true)

      console.log(`✅ Assignment completed: ${assignmentId}`)
      return result
      
    } catch (error) {
      console.error(`❌ Assignment execution failed: ${assignmentId}`, error)
      
      // Update assignment with error
      const assignment = this.assignments.find(a => 
        a.timestamp.toString() === assignmentId || 
        a.agentId === assignmentId
      )
      
      if (assignment) {
        assignment.status = 'failed'
        assignment.error = error instanceof Error ? error.message : 'Unknown error'
        
        // Update agent success rate
        const agent = this.agents.get(assignment.agentId)
        if (agent) {
          this.updateAgentSuccessRate(agent.id, false)
        }
      }
      
      throw error
    }
  }

  private selectBestAgent(task: string, context: AgentContext): Agent | null {
    const activeAgents = Array.from(this.agents.values())
      .filter(agent => agent.isActive)
      .sort((a, b) => {
        // Sort by priority first, then by success rate, then by last used
        if (a.priority !== b.priority) {
          return a.priority - b.priority
        }
        if (a.successRate !== b.successRate) {
          return b.successRate - a.successRate
        }
        return a.lastUsed - b.lastUsed
      })

    // Simple keyword matching for now
    const taskLower = task.toLowerCase()
    
    for (const agent of activeAgents) {
      for (const capability of agent.capabilities) {
        if (taskLower.includes(capability.replace('_', ' '))) {
          return agent
        }
      }
    }

    // Default to web search agent if no specific match
    return activeAgents.find(agent => agent.id === 'web_search_agent') || null
  }

  private async executeWebSearch(assignment: AgentAssignment): Promise<any> {
    // Delegate to Electron AI service
    const result = await window.electronAPI.sendAIMessage(assignment.task)
    return result
  }

  private async executeContentAnalysis(assignment: AgentAssignment): Promise<any> {
    const result = await window.electronAPI.analyzeContent()
    return result
  }

  private async executeShoppingTask(assignment: AgentAssignment): Promise<any> {
    const result = await window.electronAPI.searchProducts(assignment.task)
    return result
  }

  private async executeDocumentProcessing(assignment: AgentAssignment): Promise<any> {
    const result = await window.electronAPI.processPDF(assignment.context.url)
    return result
  }

  private async executeImageAnalysis(assignment: AgentAssignment): Promise<any> {
    const result = await window.electronAPI.analyzeImage(assignment.context.url)
    return result
  }

  private async executeResearch(assignment: AgentAssignment): Promise<any> {
    const result = await window.electronAPI.sendAIMessage(assignment.task)
    return result
  }

  private async executeTranslation(assignment: AgentAssignment): Promise<any> {
    const result = await window.electronAPI.sendAIMessage(assignment.task)
    return result
  }

  private async executeAutomation(assignment: AgentAssignment): Promise<any> {
    const result = await window.electronAPI.sendAIMessage(assignment.task)
    return result
  }

  private updateAgentUsage(agentId: string): void {
    const agent = this.agents.get(agentId)
    if (agent) {
      agent.lastUsed = Date.now()
    }
  }

  private updateAgentSuccessRate(agentId: string, success: boolean): void {
    const agent = this.agents.get(agentId)
    if (agent) {
      // Simple success rate calculation
      const totalUses = agent.successRate === 0 ? 1 : 10
      const currentSuccesses = agent.successRate * totalUses / 100
      const newSuccesses = success ? currentSuccesses + 1 : currentSuccesses
      agent.successRate = (newSuccesses / totalUses) * 100
    }
  }

  private async loadAgentStates(): Promise<void> {
    // In a real implementation, this would load from persistent storage
    console.log('📊 Loading agent states...')
  }

  // Public utility methods
  getAgents(): Agent[] {
    return Array.from(this.agents.values())
  }

  getActiveAgents(): Agent[] {
    return Array.from(this.agents.values()).filter(agent => agent.isActive)
  }

  getAgent(agentId: string): Agent | null {
    return this.agents.get(agentId) || null
  }

  getAssignments(): AgentAssignment[] {
    return [...this.assignments]
  }

  getRecentAssignments(limit: number = 10): AgentAssignment[] {
    return this.assignments
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit)
  }

  isReady(): boolean {
    return this.isInitialized
  }

  getAgentCount(): number {
    return this.agents.size
  }

  getActiveAgentCount(): number {
    return Array.from(this.agents.values()).filter(agent => agent.isActive).length
  }
}

export default IntelligentAgentAssignmentFramework
