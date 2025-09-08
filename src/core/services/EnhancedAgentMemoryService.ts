// Enhanced Agent Memory Service - ZERO UI IMPACT
// Provides persistent memory and learning capabilities for all agents

import { DatabaseService } from './DatabaseService';
import { AgentMemoryEntry, AgentLearningData } from '../types/DatabaseTypes';

interface MemoryFilter {
  type?: 'interaction' | 'learning' | 'outcome' | 'context';
  minImportance?: number;
  tags?: string[];
  dateRange?: {
    start: number;
    end: number;
  };
  limit?: number;
}

interface LearningPattern {
  pattern: string;
  confidence: number;
  examples: any[];
  successRate: number;
  usageCount: number;
}

export class EnhancedAgentMemoryService {
  private db: DatabaseService;
  private memoryCache: Map<string, AgentMemoryEntry[]> = new Map();
  private learningCache: Map<string, LearningPattern[]> = new Map();
  private maintenanceInterval: NodeJS.Timeout | null = null;

  constructor(db: DatabaseService) {
    this.db = db;
  }

  async initialize(): Promise<void> {
    try {
      console.log('🧠 Initializing Enhanced Agent Memory Service (Backend Only)...');
      
      // Start memory maintenance
      await this.startMemoryMaintenance();
      
      console.log('✅ Enhanced Agent Memory Service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Enhanced Agent Memory Service:', error);
      throw error;
    }
  }

  // Core Memory Operations

  async storeMemory(agentId: string, entry: Omit<AgentMemoryEntry, 'id' | 'agentId' | 'createdAt'>): Promise<string> {
    const memoryId = `mem_${agentId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const memory: AgentMemoryEntry = {
      id: memoryId,
      agentId,
      createdAt: Date.now(),
      ...entry
    };

    await this.db.saveAgentMemory(memory);
    
    // Update cache
    this.invalidateMemoryCache(agentId);
    
    console.log(`💾 Stored memory for agent ${agentId}: ${entry.type} (importance: ${entry.importance})`);
    return memoryId;
  }

  async getMemories(agentId: string, filters: MemoryFilter = {}): Promise<AgentMemoryEntry[]> {
    // Check cache first
    const cacheKey = `${agentId}_${JSON.stringify(filters)}`;
    
    const memories = await this.db.getAgentMemories(agentId, {
      type: filters.type,
      minImportance: filters.minImportance,
      limit: filters.limit || 50
    });

    // Apply additional filters
    let filteredMemories = memories;

    if (filters.tags && filters.tags.length > 0) {
      filteredMemories = filteredMemories.filter(memory =>
        filters.tags!.some(tag => memory.tags.includes(tag))
      );
    }

    if (filters.dateRange) {
      filteredMemories = filteredMemories.filter(memory =>
        memory.createdAt >= filters.dateRange!.start &&
        memory.createdAt <= filters.dateRange!.end
      );
    }

    return filteredMemories;
  }

  async getRelevantMemories(agentId: string, context: any, limit: number = 10): Promise<AgentMemoryEntry[]> {
    // Get recent high-importance memories
    const recentMemories = await this.getMemories(agentId, {
      minImportance: 7,
      limit: limit * 2
    });

    // Score memories by relevance to current context
    const scoredMemories = recentMemories.map(memory => ({
      memory,
      relevanceScore: this.calculateRelevanceScore(memory, context)
    }));

    // Sort by relevance and return top results
    return scoredMemories
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit)
      .map(item => item.memory);
  }

  private calculateRelevanceScore(memory: AgentMemoryEntry, context: any): number {
    let score = memory.importance; // Base score from importance

    // Boost score if memory type matches context
    if (context.type && memory.type === context.type) {
      score += 2;
    }

    // Boost score for tag matches
    if (context.tags && memory.tags) {
      const tagMatches = context.tags.filter((tag: string) => memory.tags.includes(tag)).length;
      score += tagMatches * 1.5;
    }

    // Boost score for recent memories
    const ageInDays = (Date.now() - memory.createdAt) / (1000 * 60 * 60 * 24);
    if (ageInDays < 7) {
      score += 1;
    }

    // Boost score for successful outcomes
    if (memory.metadata.outcome === 'success') {
      score += 1;
    }

    return score;
  }

  // Learning Operations

  async recordTaskOutcome(outcome: {
    taskId: string;
    agentId: string;
    taskType: string;
    success: boolean;
    strategies: string[];
    timeToComplete: number;
    userSatisfaction?: number;
    errorDetails?: any;
    context?: any;
  }): Promise<void> {
    // Store as memory
    await this.storeMemory(outcome.agentId, {
      type: 'outcome',
      content: {
        taskId: outcome.taskId,
        taskType: outcome.taskType,
        success: outcome.success,
        strategies: outcome.strategies,
        timeToComplete: outcome.timeToComplete,
        userSatisfaction: outcome.userSatisfaction,
        errorDetails: outcome.errorDetails,
        context: outcome.context
      },
      importance: outcome.success ? (outcome.userSatisfaction || 8) : 6,
      tags: ['task_outcome', outcome.taskType, ...(outcome.success ? ['success'] : ['failure'])],
      relatedMemories: [],
      metadata: {
        taskId: outcome.taskId,
        outcome: outcome.success ? 'success' : 'failure',
        confidence: outcome.userSatisfaction ? outcome.userSatisfaction / 10 : 0.5
      }
    });

    // Update learning patterns
    for (const strategy of outcome.strategies) {
      await this.updateLearningPattern(outcome.agentId, strategy, outcome.success, outcome.context);
    }
  }

  private async updateLearningPattern(agentId: string, strategy: string, success: boolean, context: any): Promise<void> {
    // This would be implemented with a more sophisticated learning database
    // For now, we'll create a simple learning record
    
    const learningId = `learn_${agentId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Store learning data (simplified)
    console.log(`📚 Learning: Agent ${agentId} strategy "${strategy}" was ${success ? 'successful' : 'unsuccessful'}`);
  }

  async getSuccessfulStrategies(agentId: string, taskType: string, limit: number = 5): Promise<LearningPattern[]> {
    // Get memories of successful outcomes for this task type
    const successfulMemories = await this.getMemories(agentId, {
      type: 'outcome',
      tags: ['success', taskType],
      minImportance: 7,
      limit: 50
    });

    // Extract strategies and calculate success rates
    const strategyMap = new Map<string, { count: number; successCount: number; examples: any[] }>();

    for (const memory of successfulMemories) {
      const strategies = memory.content.strategies || [];
      for (const strategy of strategies) {
        if (!strategyMap.has(strategy)) {
          strategyMap.set(strategy, { count: 0, successCount: 0, examples: [] });
        }
        const data = strategyMap.get(strategy)!;
        data.count++;
        if (memory.metadata.outcome === 'success') {
          data.successCount++;
        }
        data.examples.push(memory.content);
      }
    }

    // Convert to learning patterns
    const patterns: LearningPattern[] = Array.from(strategyMap.entries())
      .map(([strategy, data]) => ({
        pattern: strategy,
        confidence: data.successCount / data.count,
        examples: data.examples.slice(0, 3), // Keep top 3 examples
        successRate: data.successCount / data.count,
        usageCount: data.count
      }))
      .filter(pattern => pattern.successRate > 0.6) // Only include patterns with >60% success rate
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, limit);

    return patterns;
  }

  // Context Enhancement

  async enhanceContextWithMemories(agentId: string, currentContext: any): Promise<any> {
    const relevantMemories = await this.getRelevantMemories(agentId, currentContext, 5);
    
    const enhancedContext = {
      ...currentContext,
      relevantExperiences: relevantMemories.map(memory => ({
        type: memory.type,
        outcome: memory.metadata.outcome,
        strategies: memory.content.strategies,
        confidence: memory.metadata.confidence,
        timeAgo: Date.now() - memory.createdAt
      })),
      learningInsights: await this.generateLearningInsights(agentId, currentContext)
    };

    return enhancedContext;
  }

  private async generateLearningInsights(agentId: string, context: any): Promise<string[]> {
    const insights: string[] = [];
    
    // Get successful strategies for similar contexts
    if (context.taskType) {
      const successfulStrategies = await this.getSuccessfulStrategies(agentId, context.taskType, 3);
      
      for (const strategy of successfulStrategies) {
        if (strategy.confidence > 0.8) {
          insights.push(`High-confidence strategy: "${strategy.pattern}" (${Math.round(strategy.confidence * 100)}% success rate)`);
        }
      }
    }

    // Check for common failure patterns
    const failureMemories = await this.getMemories(agentId, {
      type: 'outcome',
      tags: ['failure'],
      limit: 10
    });

    if (failureMemories.length > 0) {
      const commonErrors = this.extractCommonErrors(failureMemories);
      if (commonErrors.length > 0) {
        insights.push(`Avoid common failure patterns: ${commonErrors.slice(0, 2).join(', ')}`);
      }
    }

    return insights;
  }

  private extractCommonErrors(failureMemories: AgentMemoryEntry[]): string[] {
    const errorMap = new Map<string, number>();
    
    for (const memory of failureMemories) {
      if (memory.content.errorDetails) {
        const errorType = memory.content.errorDetails.type || 'unknown';
        errorMap.set(errorType, (errorMap.get(errorType) || 0) + 1);
      }
    }

    return Array.from(errorMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([error]) => error);
  }

  // Memory Maintenance

  private async startMemoryMaintenance(): Promise<void> {
    // Run memory maintenance every hour
    this.maintenanceInterval = setInterval(async () => {
      try {
        await this.performMemoryMaintenance();
      } catch (error) {
        console.error('❌ Memory maintenance failed:', error);
      }
    }, 60 * 60 * 1000);

    console.log('🧹 Memory maintenance started (hourly intervals)');
  }

  private async performMemoryMaintenance(): Promise<void> {
    console.log('🧹 Performing memory maintenance...');
    
    // Clean up expired memories
    const expiredCount = await this.db.cleanupExpiredMemories();
    if (expiredCount > 0) {
      console.log(`🗑️  Cleaned up ${expiredCount} expired memories`);
    }

    // Clear caches to free memory
    this.memoryCache.clear();
    this.learningCache.clear();
    
    console.log('✅ Memory maintenance completed');
  }

  private invalidateMemoryCache(agentId: string): void {
    // Clear cache entries for this agent
    const keysToDelete = Array.from(this.memoryCache.keys())
      .filter(key => key.startsWith(`${agentId}_`));
    
    keysToDelete.forEach(key => this.memoryCache.delete(key));
  }

  // Analytics and Insights

  async getMemoryStats(agentId: string): Promise<{
    totalMemories: number;
    memoryTypes: Record<string, number>;
    averageImportance: number;
    oldestMemory: number;
    learningPatterns: number;
  }> {
    const memories = await this.getMemories(agentId, { limit: 1000 });
    
    const memoryTypes: Record<string, number> = {};
    let totalImportance = 0;
    let oldestMemory = Date.now();

    for (const memory of memories) {
      memoryTypes[memory.type] = (memoryTypes[memory.type] || 0) + 1;
      totalImportance += memory.importance;
      if (memory.createdAt < oldestMemory) {
        oldestMemory = memory.createdAt;
      }
    }

    return {
      totalMemories: memories.length,
      memoryTypes,
      averageImportance: memories.length > 0 ? totalImportance / memories.length : 0,
      oldestMemory,
      learningPatterns: 0 // Would be calculated from learning database
    };
  }

  async shutdown(): Promise<void> {
    if (this.maintenanceInterval) {
      clearInterval(this.maintenanceInterval);
      this.maintenanceInterval = null;
    }
    
    this.memoryCache.clear();
    this.learningCache.clear();
    
    console.log('✅ Enhanced Agent Memory Service shut down');
  }
}