// Agent Memory Service - JavaScript Implementation
// Advanced memory management and learning system for agents

class AgentMemoryService {
  static instance = null;

  static getInstance() {
    if (!AgentMemoryService.instance) {
      AgentMemoryService.instance = new AgentMemoryService();
    }
    return AgentMemoryService.instance;
  }

  constructor() {
    this.memories = new Map();
    this.memoryIndex = new Map(); // For fast lookups
    this.learningPatterns = new Map();
    this.taskOutcomes = [];
    this.maxMemories = 10000;
    this.maxTaskOutcomes = 5000;
    this.memoryTypes = ['task', 'outcome', 'learning', 'context', 'goal'];
    this.importanceLevels = [1, 2, 3, 4, 5]; // 1=low, 5=critical
  }

  async initialize() {
    try {
      console.log('🧠 Initializing Agent Memory Service...');
      
      // Initialize memory categories
      this.initializeMemoryCategories();
      
      // Start memory maintenance
      this.startMemoryMaintenance();
      
      // Initialize learning engine
      this.initializeLearningEngine();
      
      console.log('✅ Agent Memory Service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Agent Memory Service:', error);
      throw error;
    }
  }

  initializeMemoryCategories() {
    for (const type of this.memoryTypes) {
      this.memories.set(type, new Map());
      this.memoryIndex.set(type, new Map());
    }
    
    console.log(`📚 Memory categories initialized: ${this.memoryTypes.length} types`);
  }

  async storeMemory(agentId, memoryData, options = {}) {
    try {
      const memoryId = `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const memory = {
        id: memoryId,
        agentId: agentId,
        type: memoryData.type || 'context',
        content: memoryData.content,
        importance: memoryData.importance || 3,
        tags: memoryData.tags || [],
        createdAt: Date.now(),
        expiresAt: memoryData.expiresAt || null,
        accessCount: 0,
        lastAccessed: Date.now(),
        relatedMemories: [],
        metadata: memoryData.metadata || {}
      };

      // Validate memory data
      if (!this.memoryTypes.includes(memory.type)) {
        throw new Error(`Invalid memory type: ${memory.type}`);
      }

      // Allow importance levels 1-10 (expanded from 1-5 for more granular control)
      if (memory.importance < 1 || memory.importance > 10 || !Number.isInteger(memory.importance)) {
        throw new Error(`Invalid importance level: ${memory.importance}. Must be integer between 1-10`);
      }

      // Store in appropriate category
      const typeMemories = this.memories.get(memory.type);
      typeMemories.set(memoryId, memory);

      // Create index entries for fast lookup
      this.indexMemory(memory);

      // Maintain memory limits
      await this.maintainMemoryLimits(memory.type);

      console.log(`🧠 Memory stored: ${memoryId} (${memory.type}, importance: ${memory.importance})`);
      
      return {
        success: true,
        memoryId: memoryId,
        type: memory.type,
        importance: memory.importance
      };

    } catch (error) {
      console.error('❌ Failed to store memory:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  indexMemory(memory) {
    const typeIndex = this.memoryIndex.get(memory.type);
    
    // Index by agent ID
    if (!typeIndex.has(memory.agentId)) {
      typeIndex.set(memory.agentId, new Set());
    }
    typeIndex.get(memory.agentId).add(memory.id);

    // Index by tags
    memory.tags.forEach(tag => {
      const tagKey = `tag:${tag}`;
      if (!typeIndex.has(tagKey)) {
        typeIndex.set(tagKey, new Set());
      }
      typeIndex.get(tagKey).add(memory.id);
    });

    // Index by importance
    const importanceKey = `importance:${memory.importance}`;
    if (!typeIndex.has(importanceKey)) {
      typeIndex.set(importanceKey, new Set());
    }
    typeIndex.get(importanceKey).add(memory.id);
  }

  async retrieveMemories(agentId, query = {}) {
    try {
      let relevantMemories = [];

      // Get memories by type
      const memoryType = query.type || null;
      const typesToSearch = memoryType ? [memoryType] : this.memoryTypes;

      for (const type of typesToSearch) {
        const typeMemories = this.memories.get(type);
        const typeIndex = this.memoryIndex.get(type);

        // Get agent's memories
        const agentMemoryIds = typeIndex.get(agentId) || new Set();
        
        for (const memoryId of agentMemoryIds) {
          const memory = typeMemories.get(memoryId);
          if (memory && this.matchesQuery(memory, query)) {
            relevantMemories.push(memory);
          }
        }
      }

      // Apply filters
      relevantMemories = this.applyMemoryFilters(relevantMemories, query);

      // Sort by relevance
      relevantMemories = this.sortMemoriesByRelevance(relevantMemories, query);

      // Limit results
      const limit = query.limit || 50;
      if (relevantMemories.length > limit) {
        relevantMemories = relevantMemories.slice(0, limit);
      }

      // Update access count
      relevantMemories.forEach(memory => {
        memory.accessCount++;
        memory.lastAccessed = Date.now();
      });

      console.log(`🔍 Retrieved ${relevantMemories.length} memories for agent ${agentId}`);
      
      return {
        success: true,
        memories: relevantMemories.map(this.sanitizeMemoryForOutput.bind(this)),
        totalFound: relevantMemories.length
      };

    } catch (error) {
      console.error('❌ Failed to retrieve memories:', error);
      return {
        success: false,
        error: error.message,
        memories: []
      };
    }
  }

  matchesQuery(memory, query) {
    // Check importance filter
    if (query.minImportance && memory.importance < query.minImportance) {
      return false;
    }

    if (query.maxImportance && memory.importance > query.maxImportance) {
      return false;
    }

    // Check tags filter
    if (query.tags && query.tags.length > 0) {
      const hasMatchingTag = query.tags.some(tag => memory.tags.includes(tag));
      if (!hasMatchingTag) {
        return false;
      }
    }

    // Check content search
    if (query.contentSearch) {
      const searchTerm = query.contentSearch.toLowerCase();
      const contentStr = JSON.stringify(memory.content).toLowerCase();
      if (!contentStr.includes(searchTerm)) {
        return false;
      }
    }

    // Check time range
    if (query.since && memory.createdAt < query.since) {
      return false;
    }

    if (query.until && memory.createdAt > query.until) {
      return false;
    }

    return true;
  }

  applyMemoryFilters(memories, query) {
    let filtered = memories;

    // Filter expired memories
    const now = Date.now();
    filtered = filtered.filter(memory => !memory.expiresAt || memory.expiresAt > now);

    // Apply custom filters
    if (query.filters) {
      for (const [filterName, filterValue] of Object.entries(query.filters)) {
        filtered = filtered.filter(memory => {
          return memory.metadata[filterName] === filterValue;
        });
      }
    }

    return filtered;
  }

  sortMemoriesByRelevance(memories, query) {
    return memories.sort((a, b) => {
      // Primary sort: importance (higher first)
      if (a.importance !== b.importance) {
        return b.importance - a.importance;
      }

      // Secondary sort: access count (more accessed first)
      if (a.accessCount !== b.accessCount) {
        return b.accessCount - a.accessCount;
      }

      // Tertiary sort: creation time (newer first)
      return b.createdAt - a.createdAt;
    });
  }

  sanitizeMemoryForOutput(memory) {
    return {
      id: memory.id,
      agentId: memory.agentId,
      type: memory.type,
      content: memory.content,
      importance: memory.importance,
      tags: memory.tags,
      createdAt: memory.createdAt,
      accessCount: memory.accessCount,
      lastAccessed: memory.lastAccessed,
      metadata: memory.metadata
    };
  }

  async recordTaskOutcome(outcome) {
    try {
      const outcomeId = `outcome_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const taskOutcome = {
        id: outcomeId,
        taskId: outcome.taskId,
        agentId: outcome.agentId,
        success: outcome.success,
        result: outcome.result,
        strategies: outcome.strategies || [],
        timeToComplete: outcome.timeToComplete,
        userSatisfaction: outcome.userSatisfaction || null,
        errors: outcome.errors || [],
        metadata: outcome.metadata || {},
        timestamp: Date.now()
      };

      this.taskOutcomes.push(taskOutcome);

      // Maintain task outcomes limit
      if (this.taskOutcomes.length > this.maxTaskOutcomes) {
        this.taskOutcomes.shift(); // Remove oldest
      }

      // Learn from the outcome
      await this.learnFromOutcome(taskOutcome);

      // Store as memory if successful
      if (taskOutcome.success) {
        await this.storeMemory(taskOutcome.agentId, {
          type: 'outcome',
          content: {
            taskType: outcome.taskType || 'unknown',
            strategies: taskOutcome.strategies,
            result: taskOutcome.result,
            performance: {
              timeToComplete: taskOutcome.timeToComplete,
              userSatisfaction: taskOutcome.userSatisfaction
            }
          },
          importance: this.calculateOutcomeImportance(taskOutcome),
          tags: ['success', 'learned', ...(taskOutcome.strategies || [])],
          metadata: {
            taskId: taskOutcome.taskId,
            outcomeId: outcomeId,
            performance: taskOutcome.timeToComplete
          }
        });
      }

      console.log(`📊 Task outcome recorded: ${outcomeId} (Success: ${taskOutcome.success})`);
      
      return {
        success: true,
        outcomeId: outcomeId
      };

    } catch (error) {
      console.error('❌ Failed to record task outcome:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  calculateOutcomeImportance(outcome) {
    let importance = 3; // Base importance

    // Increase importance for successful outcomes
    if (outcome.success) importance += 1;

    // Increase importance for high user satisfaction
    if (outcome.userSatisfaction && outcome.userSatisfaction > 0.8) importance += 1;

    // Increase importance for fast completion
    if (outcome.timeToComplete && outcome.timeToComplete < 5000) importance += 1; // < 5 seconds

    // Decrease importance for failures
    if (!outcome.success) importance -= 1;

    // Ensure within valid range
    return Math.max(1, Math.min(5, importance));
  }

  async learnFromOutcome(outcome) {
    try {
      const agentId = outcome.agentId;
      
      if (!this.learningPatterns.has(agentId)) {
        this.learningPatterns.set(agentId, {
          successfulStrategies: new Map(),
          failedStrategies: new Map(),
          performanceHistory: [],
          learningInsights: []
        });
      }

      const patterns = this.learningPatterns.get(agentId);

      // Track strategy success/failure
      outcome.strategies.forEach(strategy => {
        if (outcome.success) {
          const count = patterns.successfulStrategies.get(strategy) || 0;
          patterns.successfulStrategies.set(strategy, count + 1);
        } else {
          const count = patterns.failedStrategies.get(strategy) || 0;
          patterns.failedStrategies.set(strategy, count + 1);
        }
      });

      // Track performance
      patterns.performanceHistory.push({
        timestamp: outcome.timestamp,
        success: outcome.success,
        timeToComplete: outcome.timeToComplete,
        userSatisfaction: outcome.userSatisfaction
      });

      // Maintain performance history limit
      if (patterns.performanceHistory.length > 1000) {
        patterns.performanceHistory.shift();
      }

      // Generate learning insights
      const insights = this.generateLearningInsights(patterns);
      patterns.learningInsights = insights;

      console.log(`🧠 Learning patterns updated for agent ${agentId}`);

    } catch (error) {
      console.error('❌ Failed to learn from outcome:', error);
    }
  }

  generateLearningInsights(patterns) {
    const insights = [];

    // Analyze successful strategies
    const sortedSuccessful = Array.from(patterns.successfulStrategies.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);

    if (sortedSuccessful.length > 0) {
      insights.push({
        type: 'successful_strategies',
        description: 'Most successful strategies identified',
        data: sortedSuccessful.map(([strategy, count]) => ({ strategy, count })),
        confidence: 0.8
      });
    }

    // Analyze failed strategies
    const sortedFailed = Array.from(patterns.failedStrategies.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);

    if (sortedFailed.length > 0) {
      insights.push({
        type: 'problematic_strategies',
        description: 'Strategies that frequently fail',
        data: sortedFailed.map(([strategy, count]) => ({ strategy, count })),
        confidence: 0.7
      });
    }

    // Analyze performance trends
    if (patterns.performanceHistory.length >= 10) {
      const recent = patterns.performanceHistory.slice(-10);
      const older = patterns.performanceHistory.slice(-20, -10);
      
      const recentSuccessRate = recent.filter(p => p.success).length / recent.length;
      const olderSuccessRate = older.length > 0 ? older.filter(p => p.success).length / older.length : 0;

      if (recentSuccessRate > olderSuccessRate + 0.1) {
        insights.push({
          type: 'performance_improvement',
          description: 'Performance is improving over time',
          data: { recentSuccessRate, olderSuccessRate, improvement: recentSuccessRate - olderSuccessRate },
          confidence: 0.9
        });
      } else if (recentSuccessRate < olderSuccessRate - 0.1) {
        insights.push({
          type: 'performance_decline',
          description: 'Performance may be declining',
          data: { recentSuccessRate, olderSuccessRate, decline: olderSuccessRate - recentSuccessRate },
          confidence: 0.8
        });
      }
    }

    return insights;
  }

  async getAgentLearningInsights(agentId) {
    try {
      const patterns = this.learningPatterns.get(agentId);
      
      if (!patterns) {
        return {
          success: true,
          insights: [],
          hasLearningData: false
        };
      }

      const insights = {
        successefulStrategies: Array.from(patterns.successfulStrategies.entries())
          .sort(([,a], [,b]) => b - a)
          .slice(0, 10),
        problematicStrategies: Array.from(patterns.failedStrategies.entries())
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5),
        performanceMetrics: this.calculatePerformanceMetrics(patterns.performanceHistory),
        learningInsights: patterns.learningInsights,
        totalOutcomes: patterns.performanceHistory.length
      };

      return {
        success: true,
        insights: insights,
        hasLearningData: true
      };

    } catch (error) {
      console.error('❌ Failed to get learning insights:', error);
      return {
        success: false,
        error: error.message,
        insights: {}
      };
    }
  }

  calculatePerformanceMetrics(performanceHistory) {
    if (performanceHistory.length === 0) {
      return {
        successRate: 0,
        averageTime: 0,
        averageSatisfaction: 0,
        totalTasks: 0
      };
    }

    const successCount = performanceHistory.filter(p => p.success).length;
    const totalTime = performanceHistory.reduce((sum, p) => sum + (p.timeToComplete || 0), 0);
    const satisfactionScores = performanceHistory.filter(p => p.userSatisfaction !== null);
    const totalSatisfaction = satisfactionScores.reduce((sum, p) => sum + p.userSatisfaction, 0);

    return {
      successRate: successCount / performanceHistory.length,
      averageTime: totalTime / performanceHistory.length,
      averageSatisfaction: satisfactionScores.length > 0 ? totalSatisfaction / satisfactionScores.length : 0,
      totalTasks: performanceHistory.length
    };
  }

  startMemoryMaintenance() {
    // Run memory maintenance every 30 minutes
    setInterval(async () => {
      await this.performMemoryMaintenance();
    }, 30 * 60 * 1000);

    console.log('🧹 Memory maintenance scheduled');
  }

  async performMemoryMaintenance() {
    try {
      console.log('🧹 Performing memory maintenance...');

      let totalCleaned = 0;

      // Clean expired memories
      const now = Date.now();
      for (const [type, typeMemories] of this.memories.entries()) {
        const expiredMemories = [];
        
        for (const [memoryId, memory] of typeMemories.entries()) {
          if (memory.expiresAt && memory.expiresAt <= now) {
            expiredMemories.push(memoryId);
          }
        }

        // Remove expired memories
        expiredMemories.forEach(memoryId => {
          typeMemories.delete(memoryId);
          this.removeFromIndex(type, memoryId);
          totalCleaned++;
        });
      }

      // Clean old task outcomes
      const outcomeAge = 90 * 24 * 60 * 60 * 1000; // 90 days
      const cutoffTime = now - outcomeAge;
      const oldOutcomes = this.taskOutcomes.filter(outcome => outcome.timestamp < cutoffTime);
      this.taskOutcomes = this.taskOutcomes.filter(outcome => outcome.timestamp >= cutoffTime);
      totalCleaned += oldOutcomes.length;

      console.log(`🧹 Memory maintenance completed: ${totalCleaned} items cleaned`);

    } catch (error) {
      console.error('❌ Memory maintenance failed:', error);
    }
  }

  async maintainMemoryLimits(type) {
    const typeMemories = this.memories.get(type);
    const typeLimit = Math.floor(this.maxMemories / this.memoryTypes.length);

    if (typeMemories.size > typeLimit) {
      // Remove least important and least accessed memories
      const memoriesArray = Array.from(typeMemories.values())
        .sort((a, b) => {
          // Sort by importance (ascending) then by access count (ascending)
          if (a.importance !== b.importance) {
            return a.importance - b.importance;
          }
          return a.accessCount - b.accessCount;
        });

      const toRemove = memoriesArray.slice(0, memoriesArray.length - typeLimit);
      toRemove.forEach(memory => {
        typeMemories.delete(memory.id);
        this.removeFromIndex(type, memory.id);
      });

      console.log(`🧹 Removed ${toRemove.length} old memories of type ${type}`);
    }
  }

  removeFromIndex(type, memoryId) {
    const typeIndex = this.memoryIndex.get(type);
    
    // Remove from all index entries
    for (const [indexKey, memorySet] of typeIndex.entries()) {
      memorySet.delete(memoryId);
      
      // Clean up empty sets
      if (memorySet.size === 0) {
        typeIndex.delete(indexKey);
      }
    }
  }

  initializeLearningEngine() {
    console.log('🤖 Learning engine initialized');
  }

  getMemoryStats() {
    const stats = {
      totalMemories: 0,
      memoriesByType: {},
      memoriesByImportance: {},
      totalTaskOutcomes: this.taskOutcomes.length,
      agentsWithLearningData: this.learningPatterns.size
    };

    for (const [type, typeMemories] of this.memories.entries()) {
      stats.memoriesByType[type] = typeMemories.size;
      stats.totalMemories += typeMemories.size;

      // Count by importance
      for (const memory of typeMemories.values()) {
        const importance = memory.importance;
        stats.memoriesByImportance[importance] = (stats.memoriesByImportance[importance] || 0) + 1;
      }
    }

    return stats;
  }

  async shutdown() {
    console.log('🧠 Shutting down Agent Memory Service...');
    
    // Perform final cleanup
    await this.performMemoryMaintenance();
    
    console.log(`📊 Final memory stats: ${this.getMemoryStats().totalMemories} memories stored`);
    
    console.log('✅ Agent Memory Service shutdown complete');
  }
}

module.exports = AgentMemoryService;