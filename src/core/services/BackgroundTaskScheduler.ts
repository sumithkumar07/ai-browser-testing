// Background Task Scheduler - ZERO UI IMPACT
// Handles autonomous task execution and scheduling

import { DatabaseService } from './DatabaseService';
import { BackgroundTask } from '../types/DatabaseTypes';

type TaskExecutor = (payload: any) => Promise<{ success: boolean; result?: any; error?: string }>;

interface TaskType {
  name: string;
  executor: TaskExecutor;
  defaultMaxRetries: number;
  estimatedDuration: number;
  resourceRequirements: {
    cpu: 'low' | 'medium' | 'high';
    memory: 'low' | 'medium' | 'high';
    network: boolean;
  };
}

export class BackgroundTaskScheduler {
  private db: DatabaseService;
  private taskTypes: Map<string, TaskType> = new Map();
  private schedulerInterval: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;
  private activeTaskCount: number = 0;
  private maxConcurrentTasks: number = 3;

  constructor(db: DatabaseService) {
    this.db = db;
    this.initializeTaskTypes();
  }

  async initialize(): Promise<void> {
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

  private initializeTaskTypes(): void {
    // Autonomous goal execution tasks
    this.taskTypes.set('autonomous_goal_execution', {
      name: 'Autonomous Goal Execution',
      executor: this.executeAutonomousGoal.bind(this),
      defaultMaxRetries: 3,
      estimatedDuration: 300000, // 5 minutes
      resourceRequirements: {
        cpu: 'medium',
        memory: 'medium',
        network: true
      }
    });

    // Research monitoring tasks
    this.taskTypes.set('research_monitoring', {
      name: 'Research Monitoring',
      executor: this.executeResearchMonitoring.bind(this),
      defaultMaxRetries: 5,
      estimatedDuration: 120000, // 2 minutes
      resourceRequirements: {
        cpu: 'low',
        memory: 'low',
        network: true
      }
    });

    // Price monitoring tasks
    this.taskTypes.set('price_monitoring', {
      name: 'Price Monitoring',
      executor: this.executePriceMonitoring.bind(this),
      defaultMaxRetries: 5,
      estimatedDuration: 60000, // 1 minute
      resourceRequirements: {
        cpu: 'low',
        memory: 'low',
        network: true
      }
    });

    // Content analysis tasks
    this.taskTypes.set('content_analysis', {
      name: 'Content Analysis',
      executor: this.executeContentAnalysis.bind(this),
      defaultMaxRetries: 2,
      estimatedDuration: 180000, // 3 minutes
      resourceRequirements: {
        cpu: 'high',
        memory: 'medium',
        network: true
      }
    });

    // Data maintenance tasks
    this.taskTypes.set('data_maintenance', {
      name: 'Data Maintenance',
      executor: this.executeDataMaintenance.bind(this),
      defaultMaxRetries: 1,
      estimatedDuration: 30000, // 30 seconds
      resourceRequirements: {
        cpu: 'low',
        memory: 'low',
        network: false
      }
    });

    // Agent learning tasks
    this.taskTypes.set('agent_learning', {
      name: 'Agent Learning',
      executor: this.executeAgentLearning.bind(this),
      defaultMaxRetries: 2,
      estimatedDuration: 90000, // 1.5 minutes
      resourceRequirements: {
        cpu: 'medium',
        memory: 'medium',
        network: false
      }
    });
  }

  async scheduleTask(
    type: string,
    payload: any,
    options: {
      priority?: number;
      scheduledFor?: number;
      maxRetries?: number;
      agentId?: string;
    } = {}
  ): Promise<string> {
    const taskType = this.taskTypes.get(type);
    if (!taskType) {
      throw new Error(`Unknown task type: ${type}`);
    }

    const task: BackgroundTask = {
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

  private async startScheduler(): Promise<void> {
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

  private async resumePendingTasks(): Promise<void> {
    // Resume tasks that were running when the system shut down
    const runningTasks = await this.db.getBackgroundTasks('running');
    
    for (const task of runningTasks) {
      // Reset running tasks to pending for retry
      task.status = 'pending';
      await this.db.saveBackgroundTask(task);
      console.log(`🔄 Resumed pending task: ${task.id}`);
    }
  }

  private async processPendingTasks(): Promise<void> {
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

  private async executeTask(task: BackgroundTask): Promise<void> {
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
      task.lastError = error instanceof Error ? error.message : 'Unknown error';
      
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

  private async executeAutonomousGoal(payload: any): Promise<{ success: boolean; result?: any; error?: string }> {
    try {
      console.log('🎯 Executing autonomous goal:', payload.description);
      
      // Simulate autonomous goal execution
      // In real implementation, this would:
      // - Break down the goal into steps
      // - Execute each step using appropriate agents
      // - Track progress and adapt plan as needed
      // - Report completion or failure
      
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate work
      
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
        error: error instanceof Error ? error.message : 'Goal execution failed'
      };
    }
  }

  private async executeResearchMonitoring(payload: any): Promise<{ success: boolean; result?: any; error?: string }> {
    try {
      console.log('🔍 Executing research monitoring:', payload.topic);
      
      // Simulate research monitoring
      // In real implementation, this would:
      // - Check specified sources for new content
      // - Analyze changes and updates
      // - Compare with previous state
      // - Generate alerts if significant changes found
      
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
        error: error instanceof Error ? error.message : 'Research monitoring failed'
      };
    }
  }

  private async executePriceMonitoring(payload: any): Promise<{ success: boolean; result?: any; error?: string }> {
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
        error: error instanceof Error ? error.message : 'Price monitoring failed'
      };
    }
  }

  private async executeContentAnalysis(payload: any): Promise<{ success: boolean; result?: any; error?: string }> {
    try {
      console.log('📊 Executing content analysis:', payload.url);
      
      // Simulate content analysis
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      return {
        success: true,
        result: {
          url: payload.url,
          sentiment: ['positive', 'negative', 'neutral'][Math.floor(Math.random() * 3)],
          keyTopics: ['AI', 'Technology', 'Innovation'],
          wordCount: Math.floor(Math.random() * 2000) + 500,
          timestamp: Date.now()
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Content analysis failed'
      };
    }
  }

  private async executeDataMaintenance(payload: any): Promise<{ success: boolean; result?: any; error?: string }> {
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
        error: error instanceof Error ? error.message : 'Data maintenance failed'
      };
    }
  }

  private async executeAgentLearning(payload: any): Promise<{ success: boolean; result?: any; error?: string }> {
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
        error: error instanceof Error ? error.message : 'Agent learning failed'
      };
    }
  }

  async getTaskStatus(taskId: string): Promise<BackgroundTask | null> {
    const tasks = await this.db.getBackgroundTasks();
    return tasks.find(task => task.id === taskId) || null;
  }

  async getTasksByType(type: string, limit: number = 50): Promise<BackgroundTask[]> {
    const allTasks = await this.db.getBackgroundTasks(undefined, limit * 2);
    return allTasks.filter(task => task.type === type).slice(0, limit);
  }

  async getTaskStats(): Promise<{
    pending: number;
    running: number;
    completed: number;
    failed: number;
    totalTasks: number;
  }> {
    const allTasks = await this.db.getBackgroundTasks(undefined, 1000);
    
    return {
      pending: allTasks.filter(t => t.status === 'pending').length,
      running: allTasks.filter(t => t.status === 'running').length,
      completed: allTasks.filter(t => t.status === 'completed').length,
      failed: allTasks.filter(t => t.status === 'failed').length,
      totalTasks: allTasks.length
    };
  }

  async shutdown(): Promise<void> {
    this.isRunning = false;
    
    if (this.schedulerInterval) {
      clearInterval(this.schedulerInterval);
      this.schedulerInterval = null;
    }
    
    console.log('✅ Background Task Scheduler shut down');
  }
}