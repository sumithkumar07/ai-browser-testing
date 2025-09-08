// Agent Memory Service - Persistent Memory System for Agentic Browser
// Provides long-term memory, learning, and context retention for AI agents

import { createLogger } from '../logger/Logger'
import * as fs from 'fs'
import * as path from 'path'

const logger = createLogger('AgentMemoryService')

export interface AgentMemoryEntry {
  id: string
  agentId: string
  timestamp: number
  type: 'task' | 'outcome' | 'learning' | 'context' | 'goal'
  content: any
  importance: number // 1-10 scale
  tags: string[]
  relatedEntries: string[]
}

export interface AgentKnowledge {
  agentId: string
  domain: string
  knowledge: any
  confidence: number
  lastUpdated: number
  usageCount: number
}

export interface TaskOutcome {
  taskId: string
  agentId: string
  success: boolean
  result: any
  strategies: string[]
  timeToComplete: number
  userSatisfaction?: number
  failureReasons?: string[]
  improvements?: string[]
}

export interface AgentGoal {
  id: string
  agentId: string
  description: string
  type: 'short_term' | 'long_term' | 'continuous'
  status: 'active' | 'completed' | 'paused' | 'failed'
  priority: number
  deadline?: number
  progress: number
  subGoals: string[]
  strategies: string[]
  createdAt: number
  updatedAt: number
}

class AgentMemoryService {
  private static instance: AgentMemoryService
  private memoryPath: string
  private memories: Map<string, AgentMemoryEntry[]> = new Map()
  private knowledge: Map<string, AgentKnowledge[]> = new Map()
  private goals: Map<string, AgentGoal[]> = new Map()
  private isInitialized: boolean = false

  private constructor() {
    this.memoryPath = path.join(process.cwd(), 'agent_memory')
  }

  static getInstance(): AgentMemoryService {
    if (!AgentMemoryService.instance) {
      AgentMemoryService.instance = new AgentMemoryService()
    }
    return AgentMemoryService.instance
  }

  async initialize(): Promise<void> {
    try {
      logger.info('Initializing Agent Memory Service...')
      
      // Ensure memory directory exists
      if (!fs.existsSync(this.memoryPath)) {
        fs.mkdirSync(this.memoryPath, { recursive: true })
      }

      // Load existing memories
      await this.loadAllMemories()
      await this.loadAllKnowledge()
      await this.loadAllGoals()

      this.isInitialized = true
      logger.info('Agent Memory Service initialized successfully')
    } catch (error) {
      logger.error('Failed to initialize Agent Memory Service', error as Error)
      throw error
    }
  }

  // Memory Management
  async storeMemory(agentId: string, entry: Omit<AgentMemoryEntry, 'id' | 'agentId' | 'timestamp'>): Promise<string> {
    const memoryId = `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const memoryEntry: AgentMemoryEntry = {
      id: memoryId,
      agentId,
      timestamp: Date.now(),
      ...entry
    }

    if (!this.memories.has(agentId)) {
      this.memories.set(agentId, [])
    }

    this.memories.get(agentId)!.push(memoryEntry)
    await this.persistMemories(agentId)

    logger.debug(`Stored memory for agent ${agentId}:`, memoryEntry.type)
    return memoryId
  }

  async getMemories(agentId: string, filters?: {
    type?: string
    since?: number
    tags?: string[]
    minImportance?: number
    limit?: number
  }): Promise<AgentMemoryEntry[]> {
    const agentMemories = this.memories.get(agentId) || []
    
    let filtered = agentMemories
    
    if (filters) {
      if (filters.type) {
        filtered = filtered.filter(m => m.type === filters.type)
      }
      if (filters.since) {
        filtered = filtered.filter(m => m.timestamp >= filters.since!)
      }
      if (filters.tags) {
        filtered = filtered.filter(m => 
          filters.tags!.some(tag => m.tags.includes(tag))
        )
      }
      if (filters.minImportance) {
        filtered = filtered.filter(m => m.importance >= filters.minImportance!)
      }
      if (filters.limit) {
        filtered = filtered.slice(-filters.limit)
      }
    }

    return filtered.sort((a, b) => b.timestamp - a.timestamp)
  }

  // Knowledge Management
  async storeKnowledge(agentId: string, knowledge: Omit<AgentKnowledge, 'agentId' | 'lastUpdated' | 'usageCount'>): Promise<void> {
    const knowledgeEntry: AgentKnowledge = {
      agentId,
      lastUpdated: Date.now(),
      usageCount: 0,
      ...knowledge
    }

    if (!this.knowledge.has(agentId)) {
      this.knowledge.set(agentId, [])
    }

    const existingIndex = this.knowledge.get(agentId)!.findIndex(
      k => k.domain === knowledge.domain
    )

    if (existingIndex >= 0) {
      // Update existing knowledge
      const existing = this.knowledge.get(agentId)![existingIndex]
      knowledgeEntry.usageCount = existing.usageCount
      this.knowledge.get(agentId)![existingIndex] = knowledgeEntry
    } else {
      // Add new knowledge
      this.knowledge.get(agentId)!.push(knowledgeEntry)
    }

    await this.persistKnowledge(agentId)
    logger.debug(`Stored knowledge for agent ${agentId} in domain: ${knowledge.domain}`)
  }

  async getKnowledge(agentId: string, domain?: string): Promise<AgentKnowledge[]> {
    const agentKnowledge = this.knowledge.get(agentId) || []
    
    if (domain) {
      return agentKnowledge.filter(k => k.domain === domain)
    }
    
    return agentKnowledge.sort((a, b) => b.confidence - a.confidence)
  }

  // Goal Management
  async storeGoal(agentId: string, goal: Omit<AgentGoal, 'id' | 'agentId' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const goalId = `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const goalEntry: AgentGoal = {
      id: goalId,
      agentId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      ...goal
    }

    if (!this.goals.has(agentId)) {
      this.goals.set(agentId, [])
    }

    this.goals.get(agentId)!.push(goalEntry)
    await this.persistGoals(agentId)

    logger.debug(`Stored goal for agent ${agentId}:`, goal.description)
    return goalId
  }

  async updateGoal(agentId: string, goalId: string, updates: Partial<AgentGoal>): Promise<void> {
    const agentGoals = this.goals.get(agentId) || []
    const goalIndex = agentGoals.findIndex(g => g.id === goalId)
    
    if (goalIndex >= 0) {
      agentGoals[goalIndex] = {
        ...agentGoals[goalIndex],
        ...updates,
        updatedAt: Date.now()
      }
      await this.persistGoals(agentId)
    }
  }

  async getGoals(agentId: string, status?: string): Promise<AgentGoal[]> {
    const agentGoals = this.goals.get(agentId) || []
    
    if (status) {
      return agentGoals.filter(g => g.status === status)
    }
    
    return agentGoals.sort((a, b) => b.priority - a.priority)
  }

  // Learning from Outcomes
  async recordTaskOutcome(outcome: TaskOutcome): Promise<void> {
    await this.storeMemory(outcome.agentId, {
      type: 'outcome',
      content: outcome,
      importance: outcome.success ? 7 : 9, // Failures are more important to remember
      tags: ['task_outcome', outcome.success ? 'success' : 'failure'],
      relatedEntries: []
    })

    // Extract learnings from outcomes
    if (!outcome.success && outcome.failureReasons) {
      await this.storeKnowledge(outcome.agentId, {
        domain: 'failure_patterns',
        knowledge: {
          taskType: outcome.taskId.split('_')[0],
          failureReasons: outcome.failureReasons,
          context: outcome
        },
        confidence: 0.8
      })
    }

    if (outcome.success && outcome.strategies) {
      await this.storeKnowledge(outcome.agentId, {
        domain: 'successful_strategies',
        knowledge: {
          taskType: outcome.taskId.split('_')[0],
          strategies: outcome.strategies,
          timeToComplete: outcome.timeToComplete
        },
        confidence: 0.9
      })
    }
  }

  // Context Retrieval for Enhanced Decision Making
  async getRelevantContext(agentId: string, currentTask: string, contextType: string): Promise<any[]> {
    const memories = await this.getMemories(agentId, {
      tags: [contextType],
      minImportance: 5,
      limit: 10
    })

    const knowledge = await this.getKnowledge(agentId, contextType)
    
    return {
      recentMemories: memories,
      relevantKnowledge: knowledge,
      successStrategies: knowledge.filter(k => k.domain === 'successful_strategies'),
      failurePatterns: knowledge.filter(k => k.domain === 'failure_patterns')
    }
  }

  // Persistence Methods
  private async persistMemories(agentId: string): Promise<void> {
    try {
      const filePath = path.join(this.memoryPath, `${agentId}_memories.json`)
      const memories = this.memories.get(agentId) || []
      await fs.promises.writeFile(filePath, JSON.stringify(memories, null, 2))
    } catch (error) {
      logger.error(`Failed to persist memories for agent ${agentId}`, error as Error)
    }
  }

  private async persistKnowledge(agentId: string): Promise<void> {
    try {
      const filePath = path.join(this.memoryPath, `${agentId}_knowledge.json`)
      const knowledge = this.knowledge.get(agentId) || []
      await fs.promises.writeFile(filePath, JSON.stringify(knowledge, null, 2))
    } catch (error) {
      logger.error(`Failed to persist knowledge for agent ${agentId}`, error as Error)
    }
  }

  private async persistGoals(agentId: string): Promise<void> {
    try {
      const filePath = path.join(this.memoryPath, `${agentId}_goals.json`)
      const goals = this.goals.get(agentId) || []
      await fs.promises.writeFile(filePath, JSON.stringify(goals, null, 2))
    } catch (error) {
      logger.error(`Failed to persist goals for agent ${agentId}`, error as Error)
    }
  }

  private async loadAllMemories(): Promise<void> {
    try {
      const files = await fs.promises.readdir(this.memoryPath)
      const memoryFiles = files.filter(f => f.endsWith('_memories.json'))
      
      for (const file of memoryFiles) {
        const agentId = file.replace('_memories.json', '')
        const filePath = path.join(this.memoryPath, file)
        const data = await fs.promises.readFile(filePath, 'utf-8')
        const memories = JSON.parse(data) as AgentMemoryEntry[]
        this.memories.set(agentId, memories)
      }
    } catch (error) {
      logger.warn('No existing memories found, starting fresh')
    }
  }

  private async loadAllKnowledge(): Promise<void> {
    try {
      const files = await fs.promises.readdir(this.memoryPath)
      const knowledgeFiles = files.filter(f => f.endsWith('_knowledge.json'))
      
      for (const file of knowledgeFiles) {
        const agentId = file.replace('_knowledge.json', '')
        const filePath = path.join(this.memoryPath, file)
        const data = await fs.promises.readFile(filePath, 'utf-8')
        const knowledge = JSON.parse(data) as AgentKnowledge[]
        this.knowledge.set(agentId, knowledge)
      }
    } catch (error) {
      logger.warn('No existing knowledge found, starting fresh')
    }
  }

  private async loadAllGoals(): Promise<void> {
    try {
      const files = await fs.promises.readdir(this.memoryPath)
      const goalFiles = files.filter(f => f.endsWith('_goals.json'))
      
      for (const file of goalFiles) {
        const agentId = file.replace('_goals.json', '')
        const filePath = path.join(this.memoryPath, file)
        const data = await fs.promises.readFile(filePath, 'utf-8')
        const goals = JSON.parse(data) as AgentGoal[]
        this.goals.set(agentId, goals)
      }
    } catch (error) {
      logger.warn('No existing goals found, starting fresh')
    }
  }

  // Cleanup and Maintenance
  async cleanup(): Promise<void> {
    // Remove old, unimportant memories to prevent bloat
    const cutoffTime = Date.now() - (30 * 24 * 60 * 60 * 1000) // 30 days
    
    for (const [agentId, memories] of this.memories.entries()) {
      const filtered = memories.filter(m => 
        m.timestamp > cutoffTime || m.importance >= 7
      )
      
      if (filtered.length !== memories.length) {
        this.memories.set(agentId, filtered)
        await this.persistMemories(agentId)
        logger.info(`Cleaned up ${memories.length - filtered.length} old memories for agent ${agentId}`)
      }
    }
  }
}

export default AgentMemoryService