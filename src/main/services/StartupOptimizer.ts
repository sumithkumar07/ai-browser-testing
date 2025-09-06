/**
 * Startup Optimizer Service
 * Optimizes application startup time and provides smooth initialization
 */

import { createLogger } from '../../core/logger/Logger'
import { appEvents } from '../../core/utils/EventEmitter'

const logger = createLogger('StartupOptimizer')

export interface StartupTask {
  id: string
  name: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  estimatedDuration: number
  execute: () => Promise<void>
  dependencies?: string[]
}

export interface StartupProgress {
  stage: string
  currentTask: string
  completedTasks: number
  totalTasks: number
  progress: number
  timeElapsed: number
  estimatedTimeRemaining: number
}

export class StartupOptimizer {
  private static instance: StartupOptimizer
  private tasks: Map<string, StartupTask> = new Map()
  private completedTasks: Set<string> = new Set()
  private startTime: number = 0
  private isInitialized = false

  static getInstance(): StartupOptimizer {
    if (!StartupOptimizer.instance) {
      StartupOptimizer.instance = new StartupOptimizer()
    }
    return StartupOptimizer.instance
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return

    logger.info('Initializing Startup Optimizer')
    this.startTime = Date.now()
    
    this.registerDefaultTasks()
    this.isInitialized = true
    
    logger.info('Startup Optimizer initialized')
  }

  private registerDefaultTasks(): void {
    // Critical tasks (must complete first)
    this.registerTask({
      id: 'electron-api-check',
      name: 'Verify Electron API',
      priority: 'critical',
      estimatedDuration: 100,
      execute: async () => {
        if (!window.electronAPI) {
          throw new Error('Electron API not available')
        }
        logger.debug('Electron API verified')
      }
    })

    this.registerTask({
      id: 'environment-validation',
      name: 'Validate Environment',
      priority: 'critical',
      estimatedDuration: 50,
      execute: async () => {
        // Check for required environment features
        const requiredFeatures = ['localStorage', 'sessionStorage', 'fetch']
        for (const feature of requiredFeatures) {
          if (!(feature in window)) {
            throw new Error(`Required feature ${feature} not available`)
          }
        }
        logger.debug('Environment validation completed')
      }
    })

    // High priority tasks
    this.registerTask({
      id: 'ai-service-init',
      name: 'Initialize AI Service',
      priority: 'high',
      estimatedDuration: 1000,
      dependencies: ['electron-api-check'],
      execute: async () => {
        try {
          const result = await window.electronAPI.testConnection()
          if (!result.success) {
            logger.warn('AI service connection failed, continuing without AI features')
          }
        } catch (error) {
          logger.warn('AI service initialization failed', error as Error)
        }
      }
    })

    this.registerTask({
      id: 'browser-controller-init',
      name: 'Initialize Browser Controller',
      priority: 'high',
      estimatedDuration: 500,
      dependencies: ['electron-api-check'],
      execute: async () => {
        const { BrowserController } = await import('./BrowserController')
        const controller = BrowserController.getInstance()
        await controller.initialize()
      }
    })

    // Medium priority tasks
    this.registerTask({
      id: 'performance-monitor-init',
      name: 'Start Performance Monitoring',
      priority: 'medium',
      estimatedDuration: 300,
      execute: async () => {
        const PerformanceMonitor = (await import('./PerformanceMonitor')).default
        const monitor = PerformanceMonitor.getInstance()
        await monitor.initialize()
      }
    })

    this.registerTask({
      id: 'error-recovery-init',
      name: 'Initialize Error Recovery',
      priority: 'medium',
      estimatedDuration: 200,
      execute: async () => {
        const ErrorRecoveryService = (await import('./ErrorRecoveryService')).default
        const errorRecovery = ErrorRecoveryService.getInstance()
        await errorRecovery.initialize()
      }
    })

    // Low priority tasks
    this.registerTask({
      id: 'cache-warmup',
      name: 'Warm Up Caches',
      priority: 'low',
      estimatedDuration: 800,
      execute: async () => {
        // Pre-load common resources
        const commonUrls = [
          'https://www.google.com',
          'https://github.com',
          'https://stackoverflow.com'
        ]

        const promises = commonUrls.map(url => 
          fetch(url, { method: 'HEAD', mode: 'no-cors' }).catch(() => {})
        )

        await Promise.allSettled(promises)
        logger.debug('Cache warmup completed')
      }
    })

    this.registerTask({
      id: 'agent-framework-init',
      name: 'Initialize Agent Framework',
      priority: 'low',
      estimatedDuration: 1500,
      dependencies: ['ai-service-init', 'browser-controller-init'],
      execute: async () => {
        try {
          const IntegratedAgentFramework = (await import('./IntegratedAgentFramework')).default
          const framework = IntegratedAgentFramework.getInstance()
          await framework.initialize()
        } catch (error) {
          logger.error('Agent framework initialization failed', error as Error)
          // Don't throw - this is not critical for basic functionality
        }
      }
    })
  }

  registerTask(task: StartupTask): void {
    this.tasks.set(task.id, task)
    logger.debug('Startup task registered', { taskId: task.id, priority: task.priority })
  }

  async executeStartup(): Promise<void> {
    logger.info('Starting application initialization')
    const startTime = Date.now()

    try {
      // Get tasks in execution order
      const orderedTasks = this.getExecutionOrder()
      
      for (const task of orderedTasks) {
        await this.executeTask(task)
      }

      const totalTime = Date.now() - startTime
      logger.info('Application initialization completed', { totalTime })
      
      appEvents.emit('startup:complete', {
        duration: totalTime,
        timestamp: Date.now(),
        tasksCompleted: this.completedTasks.size,
        totalTasks: this.tasks.size
      })

    } catch (error) {
      logger.error('Startup failed', error as Error)
      appEvents.emit('startup:failed', { error: error as Error })
      throw error
    }
  }

  private async executeTask(task: StartupTask): Promise<void> {
    const taskStartTime = Date.now()
    
    try {
      logger.debug('Executing startup task', { taskId: task.id, name: task.name })
      
      // Emit progress update
      this.emitProgress(task.name)
      
      await task.execute()
      
      this.completedTasks.add(task.id)
      const taskDuration = Date.now() - taskStartTime
      
      logger.debug('Startup task completed', { 
        taskId: task.id, 
        duration: taskDuration,
        estimated: task.estimatedDuration 
      })
      
    } catch (error) {
      const taskDuration = Date.now() - taskStartTime
      logger.error('Startup task failed', error as Error, { 
        taskId: task.id, 
        duration: taskDuration 
      })
      
      if (task.priority === 'critical') {
        throw error
      }
      
      // For non-critical tasks, log error but continue
      logger.warn('Non-critical startup task failed, continuing', { taskId: task.id })
    }
  }

  private getExecutionOrder(): StartupTask[] {
    const tasks = Array.from(this.tasks.values())
    const ordered: StartupTask[] = []
    const processed = new Set<string>()

    // Helper function to add task and its dependencies
    const addTask = (task: StartupTask) => {
      if (processed.has(task.id)) return

      // Add dependencies first
      if (task.dependencies) {
        for (const depId of task.dependencies) {
          const depTask = this.tasks.get(depId)
          if (depTask && !processed.has(depId)) {
            addTask(depTask)
          }
        }
      }

      ordered.push(task)
      processed.add(task.id)
    }

    // Sort by priority first
    const priorityOrder = ['critical', 'high', 'medium', 'low']
    const sortedTasks = tasks.sort((a, b) => {
      const aPriority = priorityOrder.indexOf(a.priority)
      const bPriority = priorityOrder.indexOf(b.priority)
      return aPriority - bPriority
    })

    // Add tasks respecting dependencies
    for (const task of sortedTasks) {
      addTask(task)
    }

    return ordered
  }

  private emitProgress(currentTask: string): void {
    const progress: StartupProgress = {
      currentTask,
      completedTasks: this.completedTasks.size,
      totalTasks: this.tasks.size,
      progress: (this.completedTasks.size / this.tasks.size) * 100,
      timeElapsed: Date.now() - this.startTime,
      estimatedTimeRemaining: this.calculateRemainingTime()
    }

    appEvents.emit('startup:progress', progress)
  }

  private calculateRemainingTime(): number {
    const remainingTasks = this.tasks.size - this.completedTasks.size
    if (remainingTasks === 0 || this.completedTasks.size === 0) return 0

    const avgTimePerTask = (Date.now() - this.startTime) / this.completedTasks.size
    return avgTimePerTask * remainingTasks
  }

  getStartupMetrics(): {
    totalTasks: number
    completedTasks: number
    failedTasks: number
    totalTime: number
    averageTaskTime: number
  } {
    const totalTime = Date.now() - this.startTime
    const completedCount = this.completedTasks.size
    const totalCount = this.tasks.size
    
    return {
      totalTasks: totalCount,
      completedTasks: completedCount,
      failedTasks: totalCount - completedCount,
      totalTime,
      averageTaskTime: completedCount > 0 ? totalTime / completedCount : 0
    }
  }

  reset(): void {
    this.completedTasks.clear()
    this.startTime = Date.now()
    logger.debug('Startup optimizer reset')
  }
}

export default StartupOptimizer