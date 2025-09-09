// Compiled JavaScript version of AgentMemoryService for CommonJS compatibility
// This fixes the integration bug between TypeScript services and CommonJS main.js

const fs = require('fs');
const path = require('path');

// Mock logger for standalone operation
const logger = {
  info: (msg, data) => console.log(`[INFO] [AgentMemoryService] ${msg}`, data || ''),
  warn: (msg, data) => console.warn(`[WARN] [AgentMemoryService] ${msg}`, data || ''),
  error: (msg, error, data) => console.error(`[ERROR] [AgentMemoryService] ${msg}`, error, data || ''),
  debug: (msg, data) => console.log(`[DEBUG] [AgentMemoryService] ${msg}`, data || '')
};

class AgentMemoryService {
  constructor() {
    this.memoryPath = path.join(process.cwd(), 'agent_memory');
    this.memories = new Map();
    this.knowledge = new Map();
    this.goals = new Map();
    this.isInitialized = false;
  }

  static getInstance() {
    if (!AgentMemoryService.instance) {
      AgentMemoryService.instance = new AgentMemoryService();
    }
    return AgentMemoryService.instance;
  }

  async initialize() {
    try {
      logger.info('Initializing Agent Memory Service...');
      
      // Ensure memory directory exists
      if (!fs.existsSync(this.memoryPath)) {
        fs.mkdirSync(this.memoryPath, { recursive: true });
      }

      // Load existing memories
      await this.loadAllMemories();
      await this.loadAllKnowledge();
      await this.loadAllGoals();

      this.isInitialized = true;
      logger.info('Agent Memory Service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Agent Memory Service', error);
      throw error;
    }
  }

  // Memory Management
  async storeMemory(agentId, entry) {
    const memoryId = `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const memoryEntry = {
      id: memoryId,
      agentId,
      timestamp: Date.now(),
      ...entry
    };

    if (!this.memories.has(agentId)) {
      this.memories.set(agentId, []);
    }

    this.memories.get(agentId).push(memoryEntry);
    await this.persistMemories(agentId);

    logger.debug(`Stored memory for agent ${agentId}:`, memoryEntry.type);
    return memoryId;
  }

  async getMemories(agentId, filters = {}) {
    const agentMemories = this.memories.get(agentId) || [];
    
    let filtered = agentMemories;
    
    if (filters.type) {
      filtered = filtered.filter(m => m.type === filters.type);
    }
    if (filters.since) {
      filtered = filtered.filter(m => m.timestamp >= filters.since);
    }
    if (filters.tags) {
      filtered = filtered.filter(m => 
        filters.tags.some(tag => m.tags.includes(tag))
      );
    }
    if (filters.minImportance) {
      filtered = filtered.filter(m => m.importance >= filters.minImportance);
    }
    if (filters.limit) {
      filtered = filtered.slice(-filters.limit);
    }

    return filtered.sort((a, b) => b.timestamp - a.timestamp);
  }

  // Knowledge Management
  async storeKnowledge(agentId, knowledge) {
    const knowledgeEntry = {
      agentId,
      lastUpdated: Date.now(),
      usageCount: 0,
      ...knowledge
    };

    if (!this.knowledge.has(agentId)) {
      this.knowledge.set(agentId, []);
    }

    const existingIndex = this.knowledge.get(agentId).findIndex(
      k => k.domain === knowledge.domain
    );

    if (existingIndex >= 0) {
      const existing = this.knowledge.get(agentId)[existingIndex];
      knowledgeEntry.usageCount = existing.usageCount;
      this.knowledge.get(agentId)[existingIndex] = knowledgeEntry;
    } else {
      this.knowledge.get(agentId).push(knowledgeEntry);
    }

    await this.persistKnowledge(agentId);
    logger.debug(`Stored knowledge for agent ${agentId} in domain: ${knowledge.domain}`);
  }

  async getKnowledge(agentId, domain) {
    const agentKnowledge = this.knowledge.get(agentId) || [];
    
    if (domain) {
      return agentKnowledge.filter(k => k.domain === domain);
    }
    
    return agentKnowledge.sort((a, b) => b.confidence - a.confidence);
  }

  // Goal Management
  async storeGoal(agentId, goal) {
    const goalId = `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const goalEntry = {
      id: goalId,
      agentId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      ...goal
    };

    if (!this.goals.has(agentId)) {
      this.goals.set(agentId, []);
    }

    this.goals.get(agentId).push(goalEntry);
    await this.persistGoals(agentId);

    logger.debug(`Stored goal for agent ${agentId}:`, goal.description);
    return goalId;
  }

  async updateGoal(agentId, goalId, updates) {
    const agentGoals = this.goals.get(agentId) || [];
    const goalIndex = agentGoals.findIndex(g => g.id === goalId);
    
    if (goalIndex >= 0) {
      agentGoals[goalIndex] = {
        ...agentGoals[goalIndex],
        ...updates,
        updatedAt: Date.now()
      };
      await this.persistGoals(agentId);
    }
  }

  async getGoals(agentId, status) {
    const agentGoals = this.goals.get(agentId) || [];
    
    if (status) {
      return agentGoals.filter(g => g.status === status);
    }
    
    return agentGoals.sort((a, b) => b.priority - a.priority);
  }

  // Enhanced Learning from Outcomes
  async recordTaskOutcome(outcome) {
    await this.storeMemory(outcome.agentId, {
      type: 'outcome',
      content: outcome,
      importance: outcome.success ? 7 : 9,
      tags: ['task_outcome', outcome.success ? 'success' : 'failure'],
      relatedEntries: []
    });

    await this.performAdvancedLearning(outcome);
  }

  async performAdvancedLearning(outcome) {
    // Simplified learning implementation
    if (!outcome.success && outcome.failureReasons) {
      await this.storeKnowledge(outcome.agentId, {
        domain: 'failure_patterns',
        knowledge: {
          taskType: outcome.taskId.split('_')[0],
          failureReasons: outcome.failureReasons,
          context: outcome
        },
        confidence: 0.8
      });
    }

    if (outcome.success && outcome.strategies) {
      await this.storeKnowledge(outcome.agentId, {
        domain: 'successful_strategies',
        knowledge: {
          taskType: outcome.taskId.split('_')[0],
          strategies: outcome.strategies,
          timeToComplete: outcome.timeToComplete,
          userSatisfaction: outcome.userSatisfaction || 0.8
        },
        confidence: 0.9
      });
    }
  }

  // Context Retrieval
  async getRelevantContext(agentId, currentTask, contextType) {
    const memories = await this.getMemories(agentId, {
      tags: [contextType],
      minImportance: 5,
      limit: 10
    });

    const knowledge = await this.getKnowledge(agentId, contextType);
    
    return {
      recentMemories: memories,
      relevantKnowledge: knowledge,
      successStrategies: knowledge.filter(k => k.domain === 'successful_strategies'),
      failurePatterns: knowledge.filter(k => k.domain === 'failure_patterns')
    };
  }

  // Persistence Methods
  async persistMemories(agentId) {
    try {
      const filePath = path.join(this.memoryPath, `${agentId}_memories.json`);
      const memories = this.memories.get(agentId) || [];
      await fs.promises.writeFile(filePath, JSON.stringify(memories, null, 2));
    } catch (error) {
      logger.error(`Failed to persist memories for agent ${agentId}`, error);
    }
  }

  async persistKnowledge(agentId) {
    try {
      const filePath = path.join(this.memoryPath, `${agentId}_knowledge.json`);
      const knowledge = this.knowledge.get(agentId) || [];
      await fs.promises.writeFile(filePath, JSON.stringify(knowledge, null, 2));
    } catch (error) {
      logger.error(`Failed to persist knowledge for agent ${agentId}`, error);
    }
  }

  async persistGoals(agentId) {
    try {
      const filePath = path.join(this.memoryPath, `${agentId}_goals.json`);
      const goals = this.goals.get(agentId) || [];
      await fs.promises.writeFile(filePath, JSON.stringify(goals, null, 2));
    } catch (error) {
      logger.error(`Failed to persist goals for agent ${agentId}`, error);
    }
  }

  async loadAllMemories() {
    try {
      if (!fs.existsSync(this.memoryPath)) return;
      
      const files = await fs.promises.readdir(this.memoryPath);
      const memoryFiles = files.filter(f => f.endsWith('_memories.json'));
      
      for (const file of memoryFiles) {
        const agentId = file.replace('_memories.json', '');
        const filePath = path.join(this.memoryPath, file);
        const data = await fs.promises.readFile(filePath, 'utf-8');
        const memories = JSON.parse(data);
        this.memories.set(agentId, memories);
      }
    } catch (error) {
      logger.warn('No existing memories found, starting fresh');
    }
  }

  async loadAllKnowledge() {
    try {
      if (!fs.existsSync(this.memoryPath)) return;
      
      const files = await fs.promises.readdir(this.memoryPath);
      const knowledgeFiles = files.filter(f => f.endsWith('_knowledge.json'));
      
      for (const file of knowledgeFiles) {
        const agentId = file.replace('_knowledge.json', '');
        const filePath = path.join(this.memoryPath, file);
        const data = await fs.promises.readFile(filePath, 'utf-8');
        const knowledge = JSON.parse(data);
        this.knowledge.set(agentId, knowledge);
      }
    } catch (error) {
      logger.warn('No existing knowledge found, starting fresh');
    }
  }

  async loadAllGoals() {
    try {
      if (!fs.existsSync(this.memoryPath)) return;
      
      const files = await fs.promises.readdir(this.memoryPath);
      const goalFiles = files.filter(f => f.endsWith('_goals.json'));
      
      for (const file of goalFiles) {
        const agentId = file.replace('_goals.json', '');
        const filePath = path.join(this.memoryPath, file);
        const data = await fs.promises.readFile(filePath, 'utf-8');
        const goals = JSON.parse(data);
        this.goals.set(agentId, goals);
      }
    } catch (error) {
      logger.warn('No existing goals found, starting fresh');
    }
  }

  async cleanup() {
    const cutoffTime = Date.now() - (30 * 24 * 60 * 60 * 1000);
    
    for (const [agentId, memories] of this.memories.entries()) {
      const filtered = memories.filter(m => 
        m.timestamp > cutoffTime || m.importance >= 7
      );
      
      if (filtered.length !== memories.length) {
        this.memories.set(agentId, filtered);
        await this.persistMemories(agentId);
        logger.info(`Cleaned up ${memories.length - filtered.length} old memories for agent ${agentId}`);
      }
    }
  }
}

module.exports = { default: AgentMemoryService };