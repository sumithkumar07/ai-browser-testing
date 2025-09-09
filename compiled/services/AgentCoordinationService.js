// Compiled JavaScript version of AgentCoordinationService for CommonJS compatibility

const AgentMemoryService = require('./AgentMemoryService');

// Mock logger for standalone operation
const logger = {
  info: (msg, data) => console.log(`[INFO] [AgentCoordinationService] ${msg}`, data || ''),
  warn: (msg, data) => console.warn(`[WARN] [AgentCoordinationService] ${msg}`, data || ''),
  error: (msg, error, data) => console.error(`[ERROR] [AgentCoordinationService] ${msg}`, error, data || ''),
  debug: (msg, data) => console.log(`[DEBUG] [AgentCoordinationService] ${msg}`, data || '')
};

// Mock event emitter
const appEvents = {
  emit: (event, data) => {
    logger.debug(`Event emitted: ${event}`, data);
  },
  on: (event, handler) => {
    logger.debug(`Event listener added: ${event}`);
  }
};

class AgentCoordinationService {
  constructor() {
    this.memoryService = AgentMemoryService.default.getInstance();
    this.activeTasks = new Map();
    this.isInitialized = false;
  }

  static getInstance() {
    if (!AgentCoordinationService.instance) {
      AgentCoordinationService.instance = new AgentCoordinationService();
    }
    return AgentCoordinationService.instance;
  }

  async initialize() {
    if (this.isInitialized) {
      logger.warn('AgentCoordinationService already initialized');
      return;
    }

    try {
      logger.info('Initializing Agent Coordination Service...');
      
      await this.memoryService.initialize();
      this.setupEventListeners();
      
      this.isInitialized = true;
      logger.info('✅ Agent Coordination Service initialized successfully');
      
    } catch (error) {
      logger.error('Failed to initialize Agent Coordination Service', error);
      throw error;
    }
  }

  setupEventListeners() {
    appEvents.on('agent:task-started', (data) => {
      logger.debug('Agent task started', data);
    });

    appEvents.on('agent:task-completed', (data) => {
      logger.debug('Agent task completed', data);
    });
  }

  async monitorGoalProgress() {
    const tasks = Array.from(this.activeTasks.values());
    const activeGoals = tasks.filter(t => t.status === 'in_progress').length;
    const completedGoals = tasks.filter(t => t.status === 'completed').length;
    const failedGoals = tasks.filter(t => t.status === 'failed').length;
    
    const averageProgress = tasks.length > 0 
      ? tasks.reduce((sum, task) => sum + task.progress, 0) / tasks.length 
      : 0;

    return {
      activeGoals,
      averageProgress,
      completedGoals,
      failedGoals
    };
  }

  async createCoordinationTask(description, assignedAgents) {
    const taskId = `coord_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const task = {
      id: taskId,
      description,
      assignedAgents,
      status: 'pending',
      progress: 0,
      startTime: Date.now(),
      estimatedCompletion: Date.now() + (30 * 60 * 1000) // 30 minutes
    };

    this.activeTasks.set(taskId, task);
    
    appEvents.emit('agent:task-started', {
      taskId,
      description,
      assignedAgents
    });

    logger.info(`Created coordination task ${taskId}`);
    return taskId;
  }

  async updateTaskProgress(taskId, progress) {
    const task = this.activeTasks.get(taskId);
    if (task) {
      task.progress = progress;
      
      if (progress >= 100) {
        task.status = 'completed';
        appEvents.emit('agent:task-completed', {
          taskId,
          result: task
        });
      }
    }
  }

  getActiveTasks() {
    return Array.from(this.activeTasks.values())
      .filter(task => task.status === 'in_progress' || task.status === 'pending');
  }

  async cleanup() {
    this.activeTasks.clear();
    this.isInitialized = false;
    logger.info('Agent Coordination Service cleaned up');
  }
}

module.exports = { default: AgentCoordinationService };