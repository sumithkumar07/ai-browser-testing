// Agent Memory Service - Persistent Memory System for Agentic Browser
// Provides long-term memory, learning, and context retention for AI agents

import { createLogger } from '../logger/EnhancedLogger'
// Note: This service requires Node.js environment for file operations
// Browser-compatible version would use IndexedDB instead

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

  constructor() {
    // Browser-compatible storage path
    this.memoryPath = 'agent_memory'
  }

  static getInstance(): AgentMemoryService {
    if (!AgentMemoryService.instance) {
      AgentMemoryService.instance = new AgentMemoryService()
    }
    return AgentMemoryService.instance
  }

  async initialize(): Promise<void> {
    try {
      logger.info('🧠 Initializing Agent Memory Service...')
      
      // Browser-compatible initialization
      // In Electron, we could use file system, but for browser compatibility
      // we'll use a simple in-memory approach for now
      
      // Load existing memories from localStorage if available
      if (typeof window !== 'undefined' && window.localStorage) {
        await this.loadFromLocalStorage()
      }

      this.isInitialized = true
      logger.info('✅ Agent Memory Service initialized successfully')
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

  // Enhanced Learning from Outcomes with Pattern Recognition
  async recordTaskOutcome(outcome: TaskOutcome): Promise<void> {
    await this.storeMemory(outcome.agentId, {
      type: 'outcome',
      content: outcome,
      importance: outcome.success ? 7 : 9, // Failures are more important to remember
      tags: ['task_outcome', outcome.success ? 'success' : 'failure'],
      relatedEntries: []
    })

    // Advanced Pattern Recognition and Learning
    await this.performAdvancedLearning(outcome)
  }

  // Advanced Learning System with Pattern Recognition
  private async performAdvancedLearning(outcome: TaskOutcome): Promise<void> {
    // 1. Extract and store failure patterns with context
    if (!outcome.success && outcome.failureReasons) {
      await this.storeKnowledge(outcome.agentId, {
        domain: 'failure_patterns',
        knowledge: {
          taskType: outcome.taskId.split('_')[0],
          failureReasons: outcome.failureReasons,
          context: outcome,
          frequency: await this.getFailureFrequency(outcome.agentId, outcome.failureReasons),
          recoveryStrategies: outcome.improvements || []
        },
        confidence: 0.8
      })

      // Learn from similar failures
      await this.identifyFailurePatterns(outcome.agentId, outcome.failureReasons)
    }

    // 2. Store successful strategies with performance metrics
    if (outcome.success && outcome.strategies) {
      await this.storeKnowledge(outcome.agentId, {
        domain: 'successful_strategies',
        knowledge: {
          taskType: outcome.taskId.split('_')[0],
          strategies: outcome.strategies,
          timeToComplete: outcome.timeToComplete,
          userSatisfaction: outcome.userSatisfaction || 0.8,
          successRate: await this.calculateSuccessRate(outcome.agentId, outcome.strategies),
          optimalConditions: await this.identifyOptimalConditions(outcome)
        },
        confidence: 0.9
      })
    }

    // 3. Cross-agent learning - share successful patterns
    await this.shareCrossAgentLearnings(outcome)

    // 4. Adaptive strategy optimization
    await this.optimizeStrategies(outcome.agentId, outcome)
  }

  // Calculate failure frequency for pattern recognition
  private async getFailureFrequency(agentId: string, failureReasons: string[]): Promise<number> {
    const recentFailures = await this.getMemories(agentId, {
      type: 'outcome',
      since: Date.now() - (7 * 24 * 60 * 60 * 1000), // Last 7 days
      tags: ['failure']
    })

    let matchingFailures = 0
    for (const memory of recentFailures) {
      const outcome = memory.content as TaskOutcome
      if (outcome.failureReasons?.some(reason => 
        failureReasons.some(current => current.includes(reason) || reason.includes(current))
      )) {
        matchingFailures++
      }
    }

    return matchingFailures / Math.max(recentFailures.length, 1)
  }

  // Identify recurring failure patterns
  private async identifyFailurePatterns(agentId: string, failureReasons: string[]): Promise<void> {
    const failureKnowledge = await this.getKnowledge(agentId, 'failure_patterns')
    
    // Group similar failures and increase confidence
    for (const knowledge of failureKnowledge) {
      const existing = knowledge.knowledge as any
      if (existing.failureReasons?.some((reason: string) =>
        failureReasons.some(current => current.includes(reason) || reason.includes(current))
      )) {
        // Increase confidence for recurring patterns
        knowledge.confidence = Math.min(1.0, knowledge.confidence + 0.1)
        knowledge.usageCount += 1
        await this.storeKnowledge(agentId, knowledge)
      }
    }
  }

  // Calculate success rate for strategies
  private async calculateSuccessRate(agentId: string, strategies: string[]): Promise<number> {
    const recentOutcomes = await this.getMemories(agentId, {
      type: 'outcome',
      since: Date.now() - (14 * 24 * 60 * 60 * 1000), // Last 14 days
    })

    let totalUses = 0
    let successfulUses = 0

    for (const memory of recentOutcomes) {
      const outcome = memory.content as TaskOutcome
      if (outcome.strategies?.some(strategy =>
        strategies.some(current => current.includes(strategy) || strategy.includes(current))
      )) {
        totalUses++
        if (outcome.success) successfulUses++
      }
    }

    return totalUses > 0 ? successfulUses / totalUses : 0.5
  }

  // Identify optimal conditions for success
  private async identifyOptimalConditions(outcome: TaskOutcome): Promise<any> {
    return {
      timeOfDay: new Date().getHours(),
      taskComplexity: outcome.timeToComplete > 60 ? 'high' : 'low',
      userSatisfaction: outcome.userSatisfaction,
      responseTime: outcome.timeToComplete,
      contextFactors: {
        // Can be expanded based on available context
        hasMultipleSteps: outcome.strategies.length > 1,
        requiresCoordination: outcome.strategies.includes('coordination')
      }
    }
  }

  // Cross-agent learning - share successful patterns between agents
  private async shareCrossAgentLearnings(outcome: TaskOutcome): Promise<void> {
    if (outcome.success && outcome.userSatisfaction && outcome.userSatisfaction > 0.8) {
      // Share high-satisfaction outcomes with related agents
      const relatedAgents = this.getRelatedAgents(outcome.agentId)
      
      for (const relatedAgentId of relatedAgents) {
        await this.storeKnowledge(relatedAgentId, {
          domain: 'cross_agent_learnings',
          knowledge: {
            originalAgent: outcome.agentId,
            taskType: outcome.taskId.split('_')[0],
            strategies: outcome.strategies,
            conditions: await this.identifyOptimalConditions(outcome),
            transferability: this.calculateTransferability(outcome.agentId, relatedAgentId)
          },
          confidence: 0.6 // Lower confidence for cross-agent knowledge
        })
      }
    }
  }

  // Determine related agents for knowledge sharing
  private getRelatedAgents(agentId: string): string[] {
    const agentRelations: { [key: string]: string[] } = {
      'research': ['analysis', 'communication'],
      'navigation': ['research', 'automation'],
      'shopping': ['research', 'analysis', 'communication'],
      'communication': ['research', 'automation'],
      'automation': ['navigation', 'communication'],
      'analysis': ['research', 'shopping']
    }
    
    return agentRelations[agentId] || []
  }

  // Calculate how transferable knowledge is between agents
  private calculateTransferability(sourceAgent: string, targetAgent: string): number {
    const transferabilityMatrix: { [key: string]: { [key: string]: number } } = {
      'research': { 'analysis': 0.8, 'communication': 0.6, 'shopping': 0.7 },
      'analysis': { 'research': 0.8, 'shopping': 0.7 },
      'shopping': { 'research': 0.7, 'analysis': 0.7, 'communication': 0.5 },
      'communication': { 'research': 0.6, 'automation': 0.5 },
      'navigation': { 'research': 0.4, 'automation': 0.6 },
      'automation': { 'navigation': 0.6, 'communication': 0.5 }
    }
    
    return transferabilityMatrix[sourceAgent]?.[targetAgent] || 0.3
  }

  // Continuously optimize strategies based on performance data
  private async optimizeStrategies(agentId: string, outcome: TaskOutcome): Promise<void> {
    // Get successful strategies for this task type
    const successfulStrategies = await this.getKnowledge(agentId, 'successful_strategies')
    const taskTypeStrategies = successfulStrategies.filter(s => 
      (s.knowledge as any).taskType === outcome.taskId.split('_')[0]
    )

    if (taskTypeStrategies.length >= 5) { // Need enough data for optimization
      // Calculate average performance metrics
      const avgPerformance = taskTypeStrategies.reduce((acc, strategy) => {
        const knowledge = strategy.knowledge as any
        return {
          timeToComplete: acc.timeToComplete + knowledge.timeToComplete,
          userSatisfaction: acc.userSatisfaction + knowledge.userSatisfaction,
          successRate: acc.successRate + knowledge.successRate
        }
      }, { timeToComplete: 0, userSatisfaction: 0, successRate: 0 })

      // Normalize averages
      Object.keys(avgPerformance).forEach(key => {
        (avgPerformance as any)[key] /= taskTypeStrategies.length
      })

      // Store optimized strategy recommendations
      await this.storeKnowledge(agentId, {
        domain: 'optimized_strategies',
        knowledge: {
          taskType: outcome.taskId.split('_')[0],
          recommendedStrategies: this.identifyTopStrategies(taskTypeStrategies),
          benchmarkPerformance: avgPerformance,
          optimizationDate: Date.now(),
          sampleSize: taskTypeStrategies.length
        },
        confidence: 0.95
      })
    }
  }

  // Identify top performing strategies
  private identifyTopStrategies(strategies: AgentKnowledge[]): string[] {
    return strategies
      .sort((a, b) => {
        const aKnowledge = a.knowledge as any
        const bKnowledge = b.knowledge as any
        const aScore = (aKnowledge.successRate * 0.4) + 
                      (aKnowledge.userSatisfaction * 0.4) + 
                      ((100 - aKnowledge.timeToComplete) / 100 * 0.2)
        const bScore = (bKnowledge.successRate * 0.4) + 
                      (bKnowledge.userSatisfaction * 0.4) + 
                      ((100 - bKnowledge.timeToComplete) / 100 * 0.2)
        return bScore - aScore
      })
      .slice(0, 3)
      .map(s => (s.knowledge as any).strategies)
      .flat()
  }

  // Get AI-powered insights and recommendations
  async getAgentInsights(agentId: string): Promise<any> {
    const recentOutcomes = await this.getMemories(agentId, {
      type: 'outcome',
      since: Date.now() - (7 * 24 * 60 * 60 * 1000),
      limit: 50
    })

    const knowledge = await this.getKnowledge(agentId)
    const goals = await this.getGoals(agentId, 'active')

    const successRate = recentOutcomes.filter(m => 
      (m.content as TaskOutcome).success
    ).length / Math.max(recentOutcomes.length, 1)

    const avgResponseTime = recentOutcomes.reduce((acc, m) => 
      acc + (m.content as TaskOutcome).timeToComplete, 0
    ) / Math.max(recentOutcomes.length, 1)

    return {
      performance: {
        successRate,
        avgResponseTime,
        totalTasks: recentOutcomes.length,
        trend: this.calculatePerformanceTrend(recentOutcomes)
      },
      knowledgeDomains: knowledge.length,
      activeGoals: goals.length,
      insights: {
        strongAreas: this.identifyStrongAreas(knowledge),
        improvementAreas: this.identifyImprovementAreas(recentOutcomes),
        recommendations: this.generateRecommendations(agentId, recentOutcomes, knowledge)
      },
      learningProgress: {
        patternsIdentified: knowledge.filter(k => k.domain === 'failure_patterns').length,
        strategiesOptimized: knowledge.filter(k => k.domain === 'optimized_strategies').length,
        crossAgentLearnings: knowledge.filter(k => k.domain === 'cross_agent_learnings').length
      }
    }
  }

  // Calculate performance trend
  private calculatePerformanceTrend(outcomes: AgentMemoryEntry[]): 'improving' | 'stable' | 'declining' {
    if (outcomes.length < 10) return 'stable'
    
    const recent = outcomes.slice(-5).map(m => (m.content as TaskOutcome).success ? 1 : 0)
    const earlier = outcomes.slice(-10, -5).map(m => (m.content as TaskOutcome).success ? 1 : 0)
    
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length
    const earlierAvg = earlier.reduce((a, b) => a + b, 0) / earlier.length
    
    if (recentAvg > earlierAvg + 0.1) return 'improving'
    if (recentAvg < earlierAvg - 0.1) return 'declining'
    return 'stable'
  }

  // Identify strong knowledge areas
  private identifyStrongAreas(knowledge: AgentKnowledge[]): string[] {
    return knowledge
      .filter(k => k.confidence > 0.8 && k.usageCount > 3)
      .map(k => k.domain)
      .slice(0, 3)
  }

  // Identify areas needing improvement
  private identifyImprovementAreas(outcomes: AgentMemoryEntry[]): string[] {
    const failedOutcomes = outcomes.filter(m => !(m.content as TaskOutcome).success)
    const failureReasons = failedOutcomes
      .map(m => (m.content as TaskOutcome).failureReasons || [])
      .flat()
    
    // Count failure reason frequency
    const reasonCounts: { [key: string]: number } = {}
    failureReasons.forEach(reason => {
      reasonCounts[reason] = (reasonCounts[reason] || 0) + 1
    })
    
    return Object.entries(reasonCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([reason]) => reason)
  }

  // Generate AI-powered recommendations
  private generateRecommendations(agentId: string, outcomes: AgentMemoryEntry[], knowledge: AgentKnowledge[]): string[] {
    const recommendations: string[] = []
    
    // Performance-based recommendations
    const successRate = outcomes.filter(m => (m.content as TaskOutcome).success).length / Math.max(outcomes.length, 1)
    if (successRate < 0.7) {
      recommendations.push('Focus on analyzing recent failure patterns to improve success rate')
    }
    
    // Knowledge-based recommendations
    if (knowledge.filter(k => k.domain === 'optimized_strategies').length === 0) {
      recommendations.push('Collect more performance data to enable strategy optimization')
    }
    
    // Cross-agent learning recommendations
    const crossLearnings = knowledge.filter(k => k.domain === 'cross_agent_learnings')
    if (crossLearnings.length < 3) {
      recommendations.push('Explore knowledge sharing with related agents to improve capabilities')
    }
    
    return recommendations
  }

  // Context Retrieval for Enhanced Decision Making
  async getRelevantContext(agentId: string, currentTask: string, contextType: string): Promise<any> {
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