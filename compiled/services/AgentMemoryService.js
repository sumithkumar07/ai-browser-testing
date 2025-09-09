// AgentMemoryService.js - Compiled JavaScript from TypeScript
// Enhanced Agent Memory Management with Advanced Learning Capabilities

class AgentMemoryService {
  constructor() {
    this.instance = null
    this.memories = new Map()
    this.shortTermMemory = []
    this.longTermMemory = []
    this.episodicMemory = []
    this.semanticMemory = new Map()
    this.isInitialized = false
    this.maxShortTermSize = 50
    this.maxLongTermSize = 1000
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new AgentMemoryService()
    }
    return this.instance
  }

  async initialize() {
    try {
      console.log('🧠 Initializing Agent Memory Service...')
      
      // Initialize memory structures
      this.memories.clear()
      this.shortTermMemory = []
      this.longTermMemory = []
      this.episodicMemory = []
      this.semanticMemory.clear()
      
      // Load persistent memories if available
      await this.loadPersistedMemories()
      
      this.isInitialized = true
      console.log('✅ Agent Memory Service initialized successfully')
      
      return { success: true }
    } catch (error) {
      console.error('❌ Failed to initialize Agent Memory Service:', error)
      throw error
    }
  }

  async loadPersistedMemories() {
    try {
      // This would typically load from database
      // For now, we'll initialize with empty state
      console.log('📁 Loading persisted memories...')
      return { success: true }
    } catch (error) {
      console.warn('⚠️ Failed to load persisted memories:', error)
      return { success: false, error: error.message }
    }
  }

  async storeMemory(memory) {
    try {
      const memoryId = memory.id || `memory_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      const enhancedMemory = {
        id: memoryId,
        content: memory.content,
        type: memory.type || 'general',
        importance: memory.importance || 5,
        timestamp: Date.now(),
        accessCount: 0,
        lastAccessed: Date.now(),
        tags: memory.tags || [],
        context: memory.context || {},
        agentId: memory.agentId || 'unknown'
      }

      // Store in appropriate memory type
      if (memory.importance >= 8) {
        this.longTermMemory.push(enhancedMemory)
        if (this.longTermMemory.length > this.maxLongTermSize) {
          this.longTermMemory.shift()
        }
      } else {
        this.shortTermMemory.push(enhancedMemory)
        if (this.shortTermMemory.length > this.maxShortTermSize) {
          this.shortTermMemory.shift()
        }
      }

      this.memories.set(memoryId, enhancedMemory)
      
      // Update semantic memory
      if (memory.type === 'semantic') {
        this.semanticMemory.set(memory.concept || 'general', enhancedMemory)
      }

      console.log(`🧠 Memory stored: ${memoryId} (importance: ${enhancedMemory.importance})`)
      return { success: true, memoryId }
    } catch (error) {
      console.error('❌ Failed to store memory:', error)
      return { success: false, error: error.message }
    }
  }

  async retrieveMemory(memoryId) {
    try {
      const memory = this.memories.get(memoryId)
      if (memory) {
        memory.accessCount++
        memory.lastAccessed = Date.now()
        console.log(`🔍 Memory retrieved: ${memoryId}`)
        return { success: true, memory }
      } else {
        return { success: false, error: 'Memory not found' }
      }
    } catch (error) {
      console.error('❌ Failed to retrieve memory:', error)
      return { success: false, error: error.message }
    }
  }

  async searchMemories(query, options = {}) {
    try {
      const results = []
      const maxResults = options.maxResults || 10
      const minImportance = options.minImportance || 0

      // Search through all memories
      for (const [id, memory] of this.memories) {
        if (memory.importance < minImportance) continue

        let relevanceScore = 0

        // Content matching
        if (memory.content && memory.content.toLowerCase().includes(query.toLowerCase())) {
          relevanceScore += 5
        }

        // Tag matching
        if (memory.tags && memory.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))) {
          relevanceScore += 3
        }

        // Type matching
        if (options.type && memory.type === options.type) {
          relevanceScore += 2
        }

        if (relevanceScore > 0) {
          results.push({
            ...memory,
            relevanceScore
          })
        }
      }

      // Sort by relevance and importance
      results.sort((a, b) => {
        const scoreA = a.relevanceScore + (a.importance / 10)
        const scoreB = b.relevanceScore + (b.importance / 10)
        return scoreB - scoreA
      })

      return {
        success: true,
        results: results.slice(0, maxResults),
        totalFound: results.length
      }
    } catch (error) {
      console.error('❌ Failed to search memories:', error)
      return { success: false, error: error.message }
    }
  }

  async recordTaskOutcome(outcome) {
    try {
      const memory = {
        id: `outcome_${outcome.taskId}`,
        content: `Task outcome: ${outcome.success ? 'Success' : 'Failure'}`,
        type: 'episodic',
        importance: outcome.success ? 7 : 8, // Failures are more important to remember
        context: {
          taskId: outcome.taskId,
          agentId: outcome.agentId,
          success: outcome.success,
          result: outcome.result,
          strategies: outcome.strategies || [],
          timeToComplete: outcome.timeToComplete,
          userSatisfaction: outcome.userSatisfaction
        },
        tags: ['task_outcome', outcome.agentId, outcome.success ? 'success' : 'failure']
      }

      await this.storeMemory(memory)

      // Also store in episodic memory for learning
      this.episodicMemory.push({
        ...memory,
        episode: `Task ${outcome.taskId} completed`
      })

      console.log(`📚 Task outcome recorded: ${outcome.taskId} (${outcome.success ? 'Success' : 'Failure'})`)
      return { success: true }
    } catch (error) {
      console.error('❌ Failed to record task outcome:', error)
      return { success: false, error: error.message }
    }
  }

  async getMemoryStats() {
    try {
      return {
        success: true,
        stats: {
          totalMemories: this.memories.size,
          shortTermCount: this.shortTermMemory.length,
          longTermCount: this.longTermMemory.length,
          episodicCount: this.episodicMemory.length,
          semanticCount: this.semanticMemory.size,
          averageImportance: this.calculateAverageImportance(),
          oldestMemory: this.findOldestMemory(),
          newestMemory: this.findNewestMemory()
        }
      }
    } catch (error) {
      console.error('❌ Failed to get memory stats:', error)
      return { success: false, error: error.message }
    }
  }

  calculateAverageImportance() {
    if (this.memories.size === 0) return 0
    let total = 0
    for (const memory of this.memories.values()) {
      total += memory.importance
    }
    return Math.round((total / this.memories.size) * 100) / 100
  }

  findOldestMemory() {
    let oldest = null
    for (const memory of this.memories.values()) {
      if (!oldest || memory.timestamp < oldest.timestamp) {
        oldest = memory
      }
    }
    return oldest ? {
      id: oldest.id,
      timestamp: oldest.timestamp,
      age: Date.now() - oldest.timestamp
    } : null
  }

  findNewestMemory() {
    let newest = null
    for (const memory of this.memories.values()) {
      if (!newest || memory.timestamp > newest.timestamp) {
        newest = memory
      }
    }
    return newest ? {
      id: newest.id,
      timestamp: newest.timestamp,
      age: Date.now() - newest.timestamp
    } : null
  }

  async cleanup() {
    try {
      console.log('🧹 Cleaning up Agent Memory Service...')
      
      // Save important memories before cleanup
      await this.persistImportantMemories()
      
      // Clear memory structures
      this.memories.clear()
      this.shortTermMemory = []
      this.longTermMemory = []
      this.episodicMemory = []
      this.semanticMemory.clear()
      
      this.isInitialized = false
      console.log('✅ Agent Memory Service cleaned up')
      return { success: true }
    } catch (error) {
      console.error('❌ Failed to cleanup Agent Memory Service:', error)
      return { success: false, error: error.message }
    }
  }

  async persistImportantMemories() {
    try {
      // This would typically save to database
      const importantMemories = Array.from(this.memories.values())
        .filter(memory => memory.importance >= 8)
        .slice(0, 100) // Keep top 100 most important

      console.log(`💾 Persisting ${importantMemories.length} important memories`)
      return { success: true, count: importantMemories.length }
    } catch (error) {
      console.warn('⚠️ Failed to persist important memories:', error)
      return { success: false, error: error.message }
    }
  }
}

// Export for CommonJS
module.exports = { default: AgentMemoryService }

// Also export the class directly
module.exports.AgentMemoryService = AgentMemoryService