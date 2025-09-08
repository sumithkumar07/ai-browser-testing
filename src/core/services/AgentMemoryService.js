// Agent Memory Service - Enhanced Memory Management for AI Agents
// Provides persistent memory storage and retrieval for agent learning and context

class AgentMemoryService {
  constructor() {
    this.instance = null
    this.isInitialized = false
    this.memoryStore = new Map()
    this.contextWindow = 50 // Number of recent memories to keep in active memory
    this.importanceThreshold = 5 // Minimum importance score to persist
  }

  static getInstance() {
    if (!AgentMemoryService.instance) {
      AgentMemoryService.instance = new AgentMemoryService()
    }
    return AgentMemoryService.instance
  }

  async initialize() {
    try {
      console.log('🧠 Initializing Agent Memory Service...')
      
      // Initialize memory structures
      this.memoryStore.clear()
      
      // Load existing memories from database if available
      await this.loadPersistedMemories()
      
      this.isInitialized = true
      console.log('✅ Agent Memory Service initialized successfully')
    } catch (error) {
      console.error('❌ Failed to initialize Agent Memory Service:', error)
      throw error
    }
  }

  async loadPersistedMemories() {
    try {
      // Load memories from database for each agent
      const agentIds = ['research', 'navigation', 'shopping', 'communication', 'automation', 'analysis']
      
      for (const agentId of agentIds) {
        this.memoryStore.set(agentId, {
          shortTerm: [],
          longTerm: [],
          patterns: new Map(),
          strategies: new Map(),
          lastAccessed: Date.now()
        })
      }

      console.log('📖 Loaded persisted memories for', agentIds.length, 'agents')
    } catch (error) {
      console.warn('⚠️ Could not load persisted memories, starting fresh:', error.message)
    }
  }

  async storeMemory(agentId, memory) {
    try {
      if (!this.isInitialized) {
        console.warn('Memory service not initialized, skipping memory storage')
        return false
      }

      // Ensure agent memory structure exists
      if (!this.memoryStore.has(agentId)) {
        this.memoryStore.set(agentId, {
          shortTerm: [],
          longTerm: [],
          patterns: new Map(),
          strategies: new Map(),
          lastAccessed: Date.now()
        })
      }

      const agentMemory = this.memoryStore.get(agentId)
      
      // Add to short-term memory
      const memoryEntry = {
        id: `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        content: memory.content,
        type: memory.type || 'general',
        importance: memory.importance || 5,
        context: memory.context || {},
        timestamp: Date.now(),
        accessCount: 0,
        tags: memory.tags || []
      }

      agentMemory.shortTerm.push(memoryEntry)
      agentMemory.lastAccessed = Date.now()

      // Move to long-term if important enough
      if (memoryEntry.importance >= this.importanceThreshold) {
        agentMemory.longTerm.push({...memoryEntry})
      }

      // Cleanup old short-term memories
      if (agentMemory.shortTerm.length > this.contextWindow) {
        agentMemory.shortTerm = agentMemory.shortTerm.slice(-this.contextWindow)
      }

      console.log(`🧠 Stored memory for ${agentId}: ${memory.type} (importance: ${memoryEntry.importance})`)
      return memoryEntry.id
    } catch (error) {
      console.error('❌ Failed to store memory:', error)
      return null
    }
  }

  async getMemories(agentId, options = {}) {
    try {
      if (!this.memoryStore.has(agentId)) {
        return []
      }

      const agentMemory = this.memoryStore.get(agentId)
      let memories = []

      // Get short-term or long-term memories
      if (options.type === 'short') {
        memories = agentMemory.shortTerm
      } else if (options.type === 'long') {
        memories = agentMemory.longTerm
      } else {
        memories = [...agentMemory.shortTerm, ...agentMemory.longTerm]
      }

      // Filter by importance
      if (options.minImportance) {
        memories = memories.filter(mem => mem.importance >= options.minImportance)
      }

      // Filter by tags
      if (options.tags && options.tags.length > 0) {
        memories = memories.filter(mem => 
          mem.tags.some(tag => options.tags.includes(tag))
        )
      }

      // Sort by importance and recency
      memories = memories.sort((a, b) => {
        const importanceDiff = b.importance - a.importance
        if (importanceDiff !== 0) return importanceDiff
        return b.timestamp - a.timestamp
      })

      // Limit results
      if (options.limit) {
        memories = memories.slice(0, options.limit)
      }

      // Update access count
      memories.forEach(mem => mem.accessCount++)

      return memories
    } catch (error) {
      console.error('❌ Failed to get memories:', error)
      return []
    }
  }

  async recordTaskOutcome(outcome) {
    try {
      const memory = {
        content: {
          taskId: outcome.taskId,
          agentId: outcome.agentId,
          success: outcome.success,
          result: outcome.result,
          strategies: outcome.strategies || [],
          timeToComplete: outcome.timeToComplete,
          userSatisfaction: outcome.userSatisfaction || 0.5
        },
        type: 'task_outcome',
        importance: outcome.success ? 7 : 5, // Failed tasks are also important to learn from
        context: {
          timestamp: Date.now(),
          success: outcome.success
        },
        tags: ['task', 'outcome', outcome.success ? 'success' : 'failure']
      }

      await this.storeMemory(outcome.agentId, memory)

      // Learn patterns from successful outcomes
      if (outcome.success && outcome.strategies) {
        await this.updateSuccessPatterns(outcome.agentId, outcome.strategies)
      }

      console.log(`📊 Recorded task outcome for ${outcome.agentId}: ${outcome.success ? 'SUCCESS' : 'FAILURE'}`)
    } catch (error) {
      console.error('❌ Failed to record task outcome:', error)
    }
  }

  async updateSuccessPatterns(agentId, strategies) {
    try {
      if (!this.memoryStore.has(agentId)) return

      const agentMemory = this.memoryStore.get(agentId)
      
      strategies.forEach(strategy => {
        const currentCount = agentMemory.patterns.get(strategy) || 0
        agentMemory.patterns.set(strategy, currentCount + 1)
      })

      console.log(`📈 Updated success patterns for ${agentId}:`, Array.from(agentMemory.patterns.entries()))
    } catch (error) {
      console.error('❌ Failed to update success patterns:', error)
    }
  }

  async getSuccessfulStrategies(agentId, limit = 5) {
    try {
      if (!this.memoryStore.has(agentId)) return []

      const agentMemory = this.memoryStore.get(agentId)
      
      return Array.from(agentMemory.patterns.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([strategy, count]) => ({ strategy, successCount: count }))
    } catch (error) {
      console.error('❌ Failed to get successful strategies:', error)
      return []
    }
  }

  async getMemoryStats(agentId) {
    try {
      if (!this.memoryStore.has(agentId)) {
        return {
          shortTermCount: 0,
          longTermCount: 0,
          totalPatterns: 0,
          lastAccessed: null
        }
      }

      const agentMemory = this.memoryStore.get(agentId)
      
      return {
        shortTermCount: agentMemory.shortTerm.length,
        longTermCount: agentMemory.longTerm.length,
        totalPatterns: agentMemory.patterns.size,
        lastAccessed: agentMemory.lastAccessed
      }
    } catch (error) {
      console.error('❌ Failed to get memory stats:', error)
      return null
    }
  }

  async cleanupOldMemories() {
    try {
      const cutoffTime = Date.now() - (7 * 24 * 60 * 60 * 1000) // 7 days ago
      let cleanedCount = 0

      for (const [agentId, agentMemory] of this.memoryStore.entries()) {
        // Remove old short-term memories
        const oldShortTermCount = agentMemory.shortTerm.length
        agentMemory.shortTerm = agentMemory.shortTerm.filter(mem => mem.timestamp > cutoffTime)
        
        cleanedCount += oldShortTermCount - agentMemory.shortTerm.length
      }

      if (cleanedCount > 0) {
        console.log(`🧹 Cleaned up ${cleanedCount} old memories`)
      }

      return cleanedCount
    } catch (error) {
      console.error('❌ Failed to cleanup old memories:', error)
      return 0
    }
  }

  getAllAgentStats() {
    const stats = {}
    
    for (const [agentId] of this.memoryStore.entries()) {
      stats[agentId] = this.getMemoryStats(agentId)
    }

    return stats
  }

  isReady() {
    return this.isInitialized
  }
}

// Export as both default and named export for compatibility
const instance = AgentMemoryService.getInstance()
module.exports = { default: instance, AgentMemoryService }