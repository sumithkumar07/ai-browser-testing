// Agent Coordination Service - Inter-Agent Communication and Collaboration
// Enables autonomous agents to communicate, negotiate, and collaborate on complex tasks

import { createLogger } from '../logger/Logger'
import AgentMemoryService from './AgentMemoryService'

const logger = createLogger('AgentCoordinationService')

export interface AgentMessage {
  id: string
  fromAgent: string
  toAgent: string
  type: 'request' | 'response' | 'notification' | 'resource_request' | 'collaboration'
  content: any
  timestamp: number
  priority: number
  requiresResponse: boolean
  expiresAt?: number
}

export interface CollaborationRequest {
  id: string
  requesterId: string
  taskDescription: string
  requiredSkills: string[]
  estimatedDuration: number
  priority: number
  deadline?: number
  resourceRequirements: ResourceRequirement[]
}

export interface ResourceRequirement {
  type: 'computation' | 'memory' | 'network' | 'storage' | 'api_calls'
  amount: number
  duration: number
}

export interface AgentCapability {
  agentId: string
  skills: string[]
  availableResources: Resource[]
  currentLoad: number
  availability: 'available' | 'busy' | 'offline'
  performance: PerformanceMetrics
}

export interface Resource {
  type: string
  available: number
  total: number
  reserved: number
}

export interface PerformanceMetrics {
  successRate: number
  averageResponseTime: number
  taskCompletionRate: number
  userSatisfactionScore: number
  lastUpdated: number
}

export interface AgentTeam {
  id: string
  leadAgent: string
  members: string[]
  goal: string
  status: 'forming' | 'active' | 'completed' | 'disbanded'
  createdAt: number
  completedAt?: number
  sharedContext: Map<string, any>
}

export interface TaskAllocation {
  taskId: string
  assignedAgent: string
  subtasks: SubTaskAllocation[]
  estimatedCompletion: number
  dependencies: string[]
}

export interface SubTaskAllocation {
  subtaskId: string
  assignedAgent: string
  estimatedDuration: number
  dependencies: string[]
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
}

class AgentCoordinationService {
  private static instance: AgentCoordinationService
  private messageQueue: Map<string, AgentMessage[]> = new Map()
  private agentCapabilities: Map<string, AgentCapability> = new Map()
  private activeTeams: Map<string, AgentTeam> = new Map()
  private collaborationRequests: Map<string, CollaborationRequest> = new Map()
  private memoryService: AgentMemoryService
  private isInitialized: boolean = false

  private constructor() {
    this.memoryService = AgentMemoryService.getInstance()
  }

  static getInstance(): AgentCoordinationService {
    if (!AgentCoordinationService.instance) {
      AgentCoordinationService.instance = new AgentCoordinationService()
    }
    return AgentCoordinationService.instance
  }

  async initialize(): Promise<void> {
    try {
      logger.info('Initializing Agent Coordination Service...')
      
      await this.memoryService.initialize()
      
      // Initialize default agent capabilities
      await this.initializeAgentCapabilities()
      
      // Start message processing
      this.startMessageProcessing()
      
      this.isInitialized = true
      logger.info('Agent Coordination Service initialized successfully')
    } catch (error) {
      logger.error('Failed to initialize Agent Coordination Service', error as Error)
      throw error
    }
  }

  // Message Passing System
  async sendMessage(message: Omit<AgentMessage, 'id' | 'timestamp'>): Promise<string> {
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const fullMessage: AgentMessage = {
      id: messageId,
      timestamp: Date.now(),
      ...message
    }

    // Add to recipient's queue
    if (!this.messageQueue.has(message.toAgent)) {
      this.messageQueue.set(message.toAgent, [])
    }
    this.messageQueue.get(message.toAgent)!.push(fullMessage)

    // Log communication for learning
    await this.memoryService.storeMemory(message.fromAgent, {
      type: 'context',
      content: {
        action: 'sent_message',
        recipient: message.toAgent,
        messageType: message.type,
        priority: message.priority
      },
      importance: message.priority,
      tags: ['inter_agent_communication', message.type],
      relatedEntries: []
    })

    logger.debug(`Message sent from ${message.fromAgent} to ${message.toAgent}:`, message.type)
    return messageId
  }

  async getMessages(agentId: string, markAsRead: boolean = true): Promise<AgentMessage[]> {
    const messages = this.messageQueue.get(agentId) || []
    
    if (markAsRead) {
      this.messageQueue.set(agentId, [])
    }
    
    return messages.sort((a, b) => b.priority - a.priority)
  }

  // Collaboration System
  async requestCollaboration(request: Omit<CollaborationRequest, 'id'>): Promise<string> {
    const requestId = `collab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const fullRequest: CollaborationRequest = {
      id: requestId,
      ...request
    }

    this.collaborationRequests.set(requestId, fullRequest)

    // Find suitable collaborators
    const suitableAgents = await this.findSuitableCollaborators(fullRequest)
    
    // Send collaboration invites
    for (const agentId of suitableAgents) {
      await this.sendMessage({
        fromAgent: request.requesterId,
        toAgent: agentId,
        type: 'collaboration',
        content: {
          type: 'invitation',
          collaborationRequest: fullRequest
        },
        priority: fullRequest.priority,
        requiresResponse: true,
        expiresAt: Date.now() + (60000 * 30) // 30 minutes
      })
    }

    logger.info(`Collaboration request ${requestId} sent to ${suitableAgents.length} agents`)
    return requestId
  }

  private async findSuitableCollaborators(request: CollaborationRequest): Promise<string[]> {
    const suitable: string[] = []
    
    for (const [agentId, capability] of this.agentCapabilities.entries()) {
      if (agentId === request.requesterId) continue
      if (capability.availability !== 'available') continue
      
      // Check if agent has required skills
      const hasRequiredSkills = request.requiredSkills.some(skill => 
        capability.skills.includes(skill)
      )
      
      if (hasRequiredSkills && capability.currentLoad < 0.8) {
        suitable.push(agentId)
      }
    }

    // Sort by performance and availability
    return suitable.sort((a, b) => {
      const capA = this.agentCapabilities.get(a)!
      const capB = this.agentCapabilities.get(b)!
      return (capB.performance.successRate - capA.performance.successRate) ||
             (capA.currentLoad - capB.currentLoad)
    }).slice(0, 3) // Max 3 collaborators
  }

  // Team Formation and Management
  async formTeam(leadAgent: string, goal: string, memberAgents: string[]): Promise<string> {
    const teamId = `team_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const team: AgentTeam = {
      id: teamId,
      leadAgent,
      members: [leadAgent, ...memberAgents],
      goal,
      status: 'forming',
      createdAt: Date.now(),
      sharedContext: new Map()
    }

    this.activeTeams.set(teamId, team)

    // Notify team members
    for (const memberId of memberAgents) {
      await this.sendMessage({
        fromAgent: leadAgent,
        toAgent: memberId,
        type: 'notification',
        content: {
          type: 'team_formation',
          teamId,
          goal,
          role: 'member'
        },
        priority: 7,
        requiresResponse: false
      })
    }

    logger.info(`Team ${teamId} formed with ${team.members.length} members`)
    return teamId
  }

  async updateTeamStatus(teamId: string, status: AgentTeam['status']): Promise<void> {
    const team = this.activeTeams.get(teamId)
    if (team) {
      team.status = status
      if (status === 'completed' || status === 'disbanded') {
        team.completedAt = Date.now()
      }
      
      // Notify team members of status change
      for (const memberId of team.members) {
        await this.sendMessage({
          fromAgent: 'system',
          toAgent: memberId,
          type: 'notification',
          content: {
            type: 'team_status_update',
            teamId,
            newStatus: status
          },
          priority: 6,
          requiresResponse: false
        })
      }
    }
  }

  // Task Allocation and Distribution
  async allocateTask(taskDescription: string, requesterId: string): Promise<TaskAllocation> {
    // Analyze task complexity and requirements
    const taskAnalysis = await this.analyzeTaskComplexity(taskDescription)
    
    // Find best agent for the task
    const bestAgent = await this.findBestAgentForTask(taskAnalysis, requesterId)
    
    // Create subtasks if needed
    const subtasks = await this.decomposeTask(taskDescription, taskAnalysis)
    
    const allocation: TaskAllocation = {
      taskId: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      assignedAgent: bestAgent,
      subtasks,
      estimatedCompletion: Date.now() + (taskAnalysis.estimatedDuration * 1000),
      dependencies: []
    }

    // Notify assigned agent
    await this.sendMessage({
      fromAgent: requesterId,
      toAgent: bestAgent,
      type: 'request',
      content: {
        type: 'task_assignment',
        taskAllocation: allocation,
        taskDescription
      },
      priority: taskAnalysis.priority,
      requiresResponse: true
    })

    return allocation
  }

  private async analyzeTaskComplexity(taskDescription: string): Promise<{
    complexity: 'low' | 'medium' | 'high'
    estimatedDuration: number
    requiredSkills: string[]
    priority: number
    canBeDecomposed: boolean
  }> {
    const lowerTask = taskDescription.toLowerCase()
    
    // Determine complexity based on keywords and length
    let complexity: 'low' | 'medium' | 'high' = 'low'
    let estimatedDuration = 60 // seconds
    let priority = 5
    
    if (lowerTask.length > 100 || lowerTask.includes('comprehensive') || lowerTask.includes('detailed')) {
      complexity = 'high'
      estimatedDuration = 300
      priority = 8
    } else if (lowerTask.length > 50 || lowerTask.includes('analyze') || lowerTask.includes('research')) {
      complexity = 'medium'
      estimatedDuration = 120
      priority = 6
    }

    // Identify required skills
    const requiredSkills: string[] = []
    if (lowerTask.includes('research') || lowerTask.includes('find')) requiredSkills.push('research')
    if (lowerTask.includes('analyze') || lowerTask.includes('summary')) requiredSkills.push('analysis')
    if (lowerTask.includes('shop') || lowerTask.includes('price')) requiredSkills.push('shopping')
    if (lowerTask.includes('navigate') || lowerTask.includes('visit')) requiredSkills.push('navigation')
    if (lowerTask.includes('email') || lowerTask.includes('write')) requiredSkills.push('communication')
    if (lowerTask.includes('automate') || lowerTask.includes('workflow')) requiredSkills.push('automation')

    return {
      complexity,
      estimatedDuration,
      requiredSkills,
      priority,
      canBeDecomposed: complexity !== 'low' && requiredSkills.length > 1
    }
  }

  private async findBestAgentForTask(taskAnalysis: any, requesterId: string): Promise<string> {
    let bestAgent = requesterId // Default fallback
    let bestScore = 0

    for (const [agentId, capability] of this.agentCapabilities.entries()) {
      if (capability.availability !== 'available') continue

      let score = 0
      
      // Skill matching
      const matchingSkills = taskAnalysis.requiredSkills.filter((skill: string) => 
        capability.skills.includes(skill)
      ).length
      score += matchingSkills * 10

      // Performance metrics
      score += capability.performance.successRate * 5
      score += (1 - capability.currentLoad) * 3

      // Availability bonus
      if (capability.currentLoad < 0.5) score += 2

      if (score > bestScore) {
        bestScore = score
        bestAgent = agentId
      }
    }

    return bestAgent
  }

  private async decomposeTask(taskDescription: string, analysis: any): Promise<SubTaskAllocation[]> {
    if (!analysis.canBeDecomposed) return []

    const subtasks: SubTaskAllocation[] = []
    const skills = analysis.requiredSkills

    // Create subtasks based on required skills
    for (let i = 0; i < skills.length; i++) {
      const skill = skills[i]
      const bestAgent = await this.findAgentWithSkill(skill)
      
      if (bestAgent) {
        subtasks.push({
          subtaskId: `subtask_${i}_${Date.now()}`,
          assignedAgent: bestAgent,
          estimatedDuration: Math.floor(analysis.estimatedDuration / skills.length),
          dependencies: i > 0 ? [subtasks[i-1].subtaskId] : [],
          status: 'pending'
        })
      }
    }

    return subtasks
  }

  private async findAgentWithSkill(skill: string): Promise<string | null> {
    for (const [agentId, capability] of this.agentCapabilities.entries()) {
      if (capability.skills.includes(skill) && capability.availability === 'available') {
        return agentId
      }
    }
    return null
  }

  // Agent Capability Management
  async registerAgent(agentId: string, skills: string[]): Promise<void> {
    const capability: AgentCapability = {
      agentId,
      skills,
      availableResources: [
        { type: 'computation', available: 100, total: 100, reserved: 0 },
        { type: 'memory', available: 1000, total: 1000, reserved: 0 },
        { type: 'network', available: 50, total: 50, reserved: 0 }
      ],
      currentLoad: 0,
      availability: 'available',
      performance: {
        successRate: 0.8,
        averageResponseTime: 2000,
        taskCompletionRate: 0.85,
        userSatisfactionScore: 0.8,
        lastUpdated: Date.now()
      }
    }

    this.agentCapabilities.set(agentId, capability)
    logger.info(`Registered agent ${agentId} with skills:`, skills)
  }

  async updateAgentLoad(agentId: string, load: number): Promise<void> {
    const capability = this.agentCapabilities.get(agentId)
    if (capability) {
      capability.currentLoad = Math.min(Math.max(load, 0), 1)
      capability.availability = load > 0.9 ? 'busy' : 'available'
    }
  }

  async updateAgentPerformance(agentId: string, metrics: Partial<PerformanceMetrics>): Promise<void> {
    const capability = this.agentCapabilities.get(agentId)
    if (capability) {
      capability.performance = {
        ...capability.performance,
        ...metrics,
        lastUpdated: Date.now()
      }
    }
  }

  // Shared Context Management
  async shareContext(teamId: string, key: string, value: any): Promise<void> {
    const team = this.activeTeams.get(teamId)
    if (team) {
      team.sharedContext.set(key, value)
      
      // Notify team members about context update
      for (const memberId of team.members) {
        await this.sendMessage({
          fromAgent: 'system',
          toAgent: memberId,
          type: 'notification',
          content: {
            type: 'context_update',
            teamId,
            key,
            value
          },
          priority: 4,
          requiresResponse: false
        })
      }
    }
  }

  async getSharedContext(teamId: string, key?: string): Promise<any> {
    const team = this.activeTeams.get(teamId)
    if (!team) return null

    if (key) {
      return team.sharedContext.get(key)
    }
    
    return Object.fromEntries(team.sharedContext.entries())
  }

  // Initialize Default Agent Capabilities
  private async initializeAgentCapabilities(): Promise<void> {
    const defaultAgents = [
      { id: 'research', skills: ['research', 'analysis', 'information_gathering'] },
      { id: 'navigation', skills: ['navigation', 'url_handling', 'web_browsing'] },
      { id: 'shopping', skills: ['shopping', 'price_comparison', 'product_research'] },
      { id: 'communication', skills: ['communication', 'email', 'content_creation'] },
      { id: 'automation', skills: ['automation', 'workflow', 'task_scheduling'] },
      { id: 'analysis', skills: ['analysis', 'data_processing', 'content_analysis'] }
    ]

    for (const agent of defaultAgents) {
      await this.registerAgent(agent.id, agent.skills)
    }
  }

  // Message Processing Loop
  private startMessageProcessing(): void {
    setInterval(async () => {
      await this.processExpiredMessages()
      await this.processCollaborationRequests()
    }, 5000) // Process every 5 seconds
  }

  private async processExpiredMessages(): Promise<void> {
    const now = Date.now()
    
    for (const [agentId, messages] of this.messageQueue.entries()) {
      const validMessages = messages.filter(msg => 
        !msg.expiresAt || msg.expiresAt > now
      )
      
      if (validMessages.length !== messages.length) {
        this.messageQueue.set(agentId, validMessages)
      }
    }
  }

  private async processCollaborationRequests(): Promise<void> {
    // Process any pending collaboration requests
    for (const [requestId, request] of this.collaborationRequests.entries()) {
      if (request.deadline && request.deadline < Date.now()) {
        // Handle expired requests
        this.collaborationRequests.delete(requestId)
        logger.warn(`Collaboration request ${requestId} expired`)
      }
    }
  }
}

export default AgentCoordinationService