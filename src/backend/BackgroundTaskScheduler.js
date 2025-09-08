// Background Task Scheduler - ZERO UI IMPACT
// Handles autonomous task execution and scheduling

class BackgroundTaskScheduler {
  constructor(databaseService) {
    this.db = databaseService;
    this.taskTypes = new Map();
    this.schedulerInterval = null;
    this.isRunning = false;
    this.activeTaskCount = 0;
    this.maxConcurrentTasks = 3;
    this.initializeTaskTypes();
  }

  async initialize() {
    try {
      console.log('⏰ Initializing Background Task Scheduler (Backend Only)...');
      
      // Start the scheduler
      await this.startScheduler();
      
      // Resume pending tasks from database
      await this.resumePendingTasks();
      
      console.log('✅ Background Task Scheduler initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Background Task Scheduler:', error);
      throw error;
    }
  }

  initializeTaskTypes() {
    // Autonomous goal execution tasks
    this.taskTypes.set('autonomous_goal_execution', {
      name: 'Autonomous Goal Execution',
      executor: this.executeAutonomousGoal.bind(this),
      defaultMaxRetries: 3,
      estimatedDuration: 300000, // 5 minutes
    });

    // Research monitoring tasks
    this.taskTypes.set('research_monitoring', {
      name: 'Research Monitoring',
      executor: this.executeResearchMonitoring.bind(this),
      defaultMaxRetries: 5,
      estimatedDuration: 120000, // 2 minutes
    });

    // Price monitoring tasks
    this.taskTypes.set('price_monitoring', {
      name: 'Price Monitoring',
      executor: this.executePriceMonitoring.bind(this),
      defaultMaxRetries: 5,
      estimatedDuration: 60000, // 1 minute
    });

    // Data maintenance tasks
    this.taskTypes.set('data_maintenance', {
      name: 'Data Maintenance',
      executor: this.executeDataMaintenance.bind(this),
      defaultMaxRetries: 1,
      estimatedDuration: 30000, // 30 seconds
    });

    // Agent learning tasks
    this.taskTypes.set('agent_learning', {
      name: 'Agent Learning',
      executor: this.executeAgentLearning.bind(this),
      defaultMaxRetries: 2,
      estimatedDuration: 90000, // 1.5 minutes
    });
  }

  async scheduleTask(type, payload, options = {}) {
    const taskType = this.taskTypes.get(type);
    if (!taskType) {
      throw new Error(`Unknown task type: ${type}`);
    }

    const task = {
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      priority: options.priority || 5,
      status: 'pending',
      payload,
      createdAt: Date.now(),
      scheduledFor: options.scheduledFor,
      retryCount: 0,
      maxRetries: options.maxRetries || taskType.defaultMaxRetries,
      agentId: options.agentId
    };

    await this.db.saveBackgroundTask(task);
    
    console.log(`📋 Scheduled ${taskType.name} task: ${task.id} (Priority: ${task.priority})`);
    return task.id;
  }

  async startScheduler() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    
    // Process tasks every 30 seconds
    this.schedulerInterval = setInterval(async () => {
      try {
        await this.processPendingTasks();
      } catch (error) {
        console.error('❌ Task processing cycle failed:', error);
      }
    }, 30000);
    
    console.log('⏰ Background task scheduler started (30-second intervals)');
  }

  async resumePendingTasks() {
    // Resume tasks that were running when the system shut down
    const runningTasks = await this.db.getBackgroundTasks('running');
    
    for (const task of runningTasks) {
      // Reset running tasks to pending for retry
      task.status = 'pending';
      await this.db.saveBackgroundTask(task);
      console.log(`🔄 Resumed pending task: ${task.id}`);
    }
  }

  async processPendingTasks() {
    if (this.activeTaskCount >= this.maxConcurrentTasks) {
      return; // Too many active tasks
    }

    const now = Date.now();
    const pendingTasks = await this.db.getBackgroundTasks('pending', 10);
    
    // Filter tasks that are ready to run
    const readyTasks = pendingTasks.filter(task => 
      !task.scheduledFor || task.scheduledFor <= now
    );
    
    if (readyTasks.length === 0) return;
    
    // Sort by priority (higher first) then by creation time
    readyTasks.sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }
      return a.createdAt - b.createdAt;
    });
    
    // Execute as many tasks as we can
    const tasksToExecute = readyTasks.slice(0, this.maxConcurrentTasks - this.activeTaskCount);
    
    for (const task of tasksToExecute) {
      this.executeTask(task).catch(error => {
        console.error(`❌ Task execution failed: ${task.id}`, error);
      });
    }
  }

  async executeTask(task) {
    const taskType = this.taskTypes.get(task.type);
    if (!taskType) {
      console.error(`❌ Unknown task type: ${task.type}`);
      return;
    }

    this.activeTaskCount++;
    
    // Update task status
    task.status = 'running';
    task.startedAt = Date.now();
    await this.db.saveBackgroundTask(task);
    
    console.log(`🚀 Executing ${taskType.name} task: ${task.id}`);
    
    try {
      const result = await taskType.executor(task.payload);
      
      // Task completed
      task.status = result.success ? 'completed' : 'failed';
      task.completedAt = Date.now();
      
      if (!result.success) {
        task.lastError = result.error || 'Unknown error';
        
        // Check if we should retry
        if (task.retryCount < task.maxRetries) {
          task.retryCount++;
          task.status = 'pending';
          task.scheduledFor = Date.now() + (task.retryCount * 60000); // Exponential backoff
          console.log(`🔄 Task ${task.id} failed, scheduling retry ${task.retryCount}/${task.maxRetries}`);
        } else {
          console.log(`❌ Task ${task.id} failed permanently after ${task.maxRetries} retries`);
        }
      } else {
        console.log(`✅ Task ${task.id} completed successfully`);
      }
      
      await this.db.saveBackgroundTask(task);
      
    } catch (error) {
      console.error(`❌ Task execution error: ${task.id}`, error);
      
      task.status = 'failed';
      task.completedAt = Date.now();
      task.lastError = error.message;
      
      // Retry logic
      if (task.retryCount < task.maxRetries) {
        task.retryCount++;
        task.status = 'pending';
        task.scheduledFor = Date.now() + (task.retryCount * 60000);
      }
      
      await this.db.saveBackgroundTask(task);
    } finally {
      this.activeTaskCount--;
    }
  }

  // Task Executors (Backend Only - No UI Impact)

  async executeAutonomousGoal(payload) {
    try {
      console.log('🎯 Executing autonomous goal:', payload.description);
      
      // Simulate autonomous goal execution
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return {
        success: true,
        result: {
          goalId: payload.goalId,
          stepsCompleted: payload.steps?.length || 1,
          status: 'completed'
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async executeResearchMonitoring(payload) {
    try {
      console.log('🔍 Executing research monitoring:', payload.topic);
      
      // Simulate research monitoring
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      return {
        success: true,
        result: {
          topic: payload.topic,
          changes: Math.random() > 0.7, // Simulate finding changes
          timestamp: Date.now()
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async executePriceMonitoring(payload) {
    try {
      console.log('💰 Executing price monitoring:', payload.product);
      
      // Simulate price monitoring
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const priceChanged = Math.random() > 0.8;
      
      return {
        success: true,
        result: {
          product: payload.product,
          priceChanged,
          currentPrice: priceChanged ? payload.previousPrice * (0.9 + Math.random() * 0.2) : payload.previousPrice,
          timestamp: Date.now()
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async executeDataMaintenance(payload) {
    try {
      console.log('🧹 Executing data maintenance:', payload.type);
      
      let cleaned = 0;
      
      switch (payload.type) {
        case 'cleanup_expired_memories':
          cleaned = await this.db.cleanupExpiredMemories();
          break;
        case 'cleanup_old_history':
          cleaned = await this.db.cleanupOldHistory(payload.daysToKeep || 90);
          break;
        default:
          throw new Error(`Unknown maintenance type: ${payload.type}`);
      }
      
      return {
        success: true,
        result: {
          type: payload.type,
          itemsCleaned: cleaned,
          timestamp: Date.now()
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async executeAgentLearning(payload) {
    try {
      console.log('🧠 Executing agent learning:', payload.agentId);
      
      // Simulate agent learning from recent performance data
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return {
        success: true,
        result: {
          agentId: payload.agentId,
          patternsLearned: Math.floor(Math.random() * 5) + 1,
          confidenceImprovement: Math.random() * 0.1,
          timestamp: Date.now()
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getTaskStatus(taskId) {
    const tasks = await this.db.getBackgroundTasks();
    return tasks.find(task => task.id === taskId) || null;
  }

  async getTasksByType(type, limit = 50) {
    const allTasks = await this.db.getBackgroundTasks(undefined, limit * 2);
    return allTasks.filter(task => task.type === type).slice(0, limit);
  }

  async getTaskStats() {
    const allTasks = await this.db.getBackgroundTasks(undefined, 1000);
    
    return {
      pending: allTasks.filter(t => t.status === 'pending').length,
      running: allTasks.filter(t => t.status === 'running').length,
      completed: allTasks.filter(t => t.status === 'completed').length,
      failed: allTasks.filter(t => t.status === 'failed').length,
      totalTasks: allTasks.length
    };
  }

  async shutdown() {
    this.isRunning = false;
    
    if (this.schedulerInterval) {
      clearInterval(this.schedulerInterval);
      this.schedulerInterval = null;
    }
    
    console.log('✅ Background Task Scheduler shut down');
  }
}

module.exports = { BackgroundTaskScheduler };