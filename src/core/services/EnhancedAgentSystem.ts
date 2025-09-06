/**
 * Enhanced Agent System
 * Robust agent management with timeout handling, retry logic, and progress tracking
 */

import { createLogger } from '../logger/Logger'
import { APP_CONSTANTS } from '../utils/Constants'
import { appEvents } from '../utils/EventEmitter'
import { AgentStatus, AgentTask, AgentAction } from '../types'
import UnifiedAPIClient from './UnifiedAPIClient'

const logger = createLogger('EnhancedAgentSystem')

export interface AgentExecutionOptions {
  timeout?: number
  maxRetries?: number
  priority?: 'low' | 'normal' | 'high'
  onProgress?: (status: AgentStatus) => void
  onComplete?: (result: any) => void
  onError?: (error: Error) => void
}

export interface AgentMetrics {
  totalTasks: number
  completedTasks: number
  failedTasks: number
  averageExecutionTime: number
  activeAgents: number
}

class EnhancedAgentSystem {
  private static instance: EnhancedAgentSystem
  private apiClient: UnifiedAPIClient
  private activeTasks: Map<string, AgentTask> = new Map()
  private taskTimeouts: Map<string, NodeJS.Timeout> = new Map()
  private agentMetrics: AgentMetrics = {
    totalTasks: 0,
    completedTasks: 0,
    failedTasks: 0,
    averageExecutionTime: 0,
    activeAgents: 0
  }
  private maxConcurrentTasks = APP_CONSTANTS.AGENTS.MAX_CONCURRENT_TASKS

  private constructor() {
    this.apiClient = UnifiedAPIClient.getInstance()
  }

  static getInstance(): EnhancedAgentSystem {
    if (!EnhancedAgentSystem.instance) {
      EnhancedAgentSystem.instance = new EnhancedAgentSystem()
    }
    return EnhancedAgentSystem.instance
  }

  /**
   * Execute agent task with comprehensive monitoring
   */
  async executeTask(
    description: string,
    options: AgentExecutionOptions = {}
  ): Promise<{ success: boolean; result?: any; error?: string; taskId: string }> {
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const startTime = Date.now()

    try {
      logger.info('Starting agent task', { taskId, description })

      // Check concurrent task limit
      if (this.activeTasks.size >= this.maxConcurrentTasks) {
        throw new Error(`Maximum concurrent tasks (${this.maxConcurrentTasks}) reached`)
      }

      // Create task object
      const task: AgentTask = {
        id: taskId,
        title: this.generateTaskTitle(description),
        description,
        type: this.classifyTaskType(description),
        status: 'pending',
        progress: 0,
        createdAt: Date.now(),
        metadata: {
          options,
          retryCount: 0,
          startTime
        }
      }

      // Add to active tasks
      this.activeTasks.set(taskId, task)
      this.agentMetrics.totalTasks++
      this.updateActiveAgentsCount()

      // Set up timeout
      const timeout = options.timeout ?? APP_CONSTANTS.TIMEOUTS.AGENT_TASK
      const timeoutId = setTimeout(() => {
        this.handleTaskTimeout(taskId)
      }, timeout)
      this.taskTimeouts.set(taskId, timeoutId)

      // Update task status
      await this.updateTaskStatus(taskId, 'running', 0, ['Initializing agent...'])

      // Emit task started event
      appEvents.emit('agent:task-started', { taskId, description })

      // Execute task with retry logic
      const result = await this.executeTaskWithRetry(task, options)

      // Task completed successfully
      await this.completeTask(taskId, result)

      logger.info('Agent task completed successfully', { 
        taskId, 
        duration: Date.now() - startTime 
      })

      return {
        success: true,
        result: result.result,
        taskId
      }

    } catch (error) {
      await this.failTask(taskId, error as Error)
      
      logger.error('Agent task failed', error as Error, { taskId })

      return {
        success: false,
        error: (error as Error).message,
        taskId
      }
    }
  }

  /**
   * Execute task with retry logic
   */
  private async executeTaskWithRetry(
    task: AgentTask,
    options: AgentExecutionOptions
  ): Promise<any> {
    const maxRetries = options.maxRetries ?? 3
    let lastError: Error | null = null

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        logger.debug(`Task execution attempt ${attempt}/${maxRetries}`, { taskId: task.id })

        // Update progress
        const taskProgress = Math.floor((attempt - 1) / maxRetries * 50) // Up to 50% for attempts
        await this.updateTaskStatus(
          task.id, 
          'running', 
          taskProgress,
          [`Attempt ${attempt}/${maxRetries}`, 'Executing task...']
        )

        // Execute the actual task
        const result = await this.apiClient.executeAgentTask(task.description)

        if (result.success) {
          return result
        }

        throw new Error(result.error || 'Task execution failed')

      } catch (error) {
        lastError = error as Error
        logger.warn(`Task attempt ${attempt} failed`, error as Error, { taskId: task.id })

        // Update metadata
        if (task.metadata) {
          task.metadata.retryCount = attempt
          task.metadata.lastError = (error as Error).message
        }

        // If not the last attempt, wait before retrying
        if (attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000) // Exponential backoff, max 10s
          logger.debug(`Retrying task in ${delay}ms`, { taskId: task.id })
          
          await this.updateTaskStatus(
            task.id,
            'running',
            taskProgress,
            [`Attempt ${attempt} failed`, `Retrying in ${delay / 1000}s...`]
          )

          await this.delay(delay)
        }
      }
    }

    throw lastError || new Error('All retry attempts failed')
  }

  /**
   * Cancel a running task
   */
  async cancelTask(taskId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const task = this.activeTasks.get(taskId)
      if (!task) {
        return { success: false, error: 'Task not found' }
      }

      logger.info('Cancelling agent task', { taskId })

      // Clear timeout
      const timeoutId = this.taskTimeouts.get(taskId)
      if (timeoutId) {
        clearTimeout(timeoutId)
        this.taskTimeouts.delete(taskId)
      }

      // Update task status
      task.status = 'cancelled'
      task.completedAt = Date.now()

      // Try to cancel the task on the backend
      await this.apiClient.cancelAgentTask(taskId)

      // Clean up
      this.activeTasks.delete(taskId)
      this.updateActiveAgentsCount()

      // Emit event
      appEvents.emit('agent:task-failed', { taskId, error: 'Task cancelled by user' })

      logger.info('Agent task cancelled', { taskId })

      return { success: true }

    } catch (error) {
      logger.error('Failed to cancel task', error as Error, { taskId })
      return { success: false, error: (error as Error).message }
    }
  }

  /**
   * Get task status
   */
  getTaskStatus(taskId: string): AgentTask | null {
    return this.activeTasks.get(taskId) || null
  }

  /**
   * Get all active tasks
   */
  getActiveTasks(): AgentTask[] {
    return Array.from(this.activeTasks.values())
  }

  /**
   * Get agent metrics
   */
  getMetrics(): AgentMetrics {
    return { ...this.agentMetrics }
  }

  /**
   * Cancel all running tasks
   */
  async cancelAllTasks(): Promise<void> {
    logger.info('Cancelling all active tasks')

    const cancelPromises = Array.from(this.activeTasks.keys()).map(taskId =>
      this.cancelTask(taskId)
    )

    await Promise.allSettled(cancelPromises)

    logger.info('All tasks cancelled')
  }

  /**
   * Private helper methods
   */
  private async updateTaskStatus(
    taskId: string,
    status: AgentTask['status'],
    progress?: number,
    details?: string[]
  ): Promise<void> {
    const task = this.activeTasks.get(taskId)
    if (!task) return

    task.status = status
    if (progress !== undefined) task.progress = progress
    if (details) task.metadata = { ...task.metadata, details }

    // Create agent status for events
    const agentStatus: AgentStatus = {
      id: taskId,
      name: task.title,
      status: status === 'running' ? 'active' : status === 'completed' ? 'completed' : 
              status === 'failed' ? 'error' : 'idle',
      currentTask: task.description,
      progress: task.progress,
      details: details || []
    }

    // Emit update event
    appEvents.emit('agent:update', agentStatus)

    logger.debug('Task status updated', { taskId, status, progress })
  }

  private async completeTask(taskId: string, result: any): Promise<void> {
    const task = this.activeTasks.get(taskId)
    if (!task) return

    const executionTime = Date.now() - task.createdAt

    // Update task
    task.status = 'completed'
    task.progress = 100
    task.completedAt = Date.now()
    task.result = result

    // Update metrics
    this.agentMetrics.completedTasks++
    this.updateAverageExecutionTime(executionTime)

    // Clear timeout
    const timeoutId = this.taskTimeouts.get(taskId)
    if (timeoutId) {
      clearTimeout(timeoutId)
      this.taskTimeouts.delete(timeoutId)
    }

    // Update final status
    await this.updateTaskStatus(taskId, 'completed', 100, ['Task completed successfully'])

    // Clean up
    this.activeTasks.delete(taskId)
    this.updateActiveAgentsCount()

    // Emit completion event
    appEvents.emit('agent:task-completed', { taskId, result })
  }

  private async failTask(taskId: string, error: Error): Promise<void> {
    const task = this.activeTasks.get(taskId)
    if (!task) return

    // Update task
    task.status = 'failed'
    task.completedAt = Date.now()
    task.error = error.message

    // Update metrics
    this.agentMetrics.failedTasks++

    // Clear timeout
    const timeoutId = this.taskTimeouts.get(taskId)
    if (timeoutId) {
      clearTimeout(timeoutId)
      this.taskTimeouts.delete(taskId)
    }

    // Update final status
    await this.updateTaskStatus(taskId, 'failed', task.progress, [`Error: ${error.message}`])

    // Clean up
    this.activeTasks.delete(taskId)
    this.updateActiveAgentsCount()

    // Emit failure event
    appEvents.emit('agent:task-failed', { taskId, error: error.message })
  }

  private handleTaskTimeout(taskId: string): void {
    logger.warn('Task timeout reached', { taskId })
    this.failTask(taskId, new Error('Task timeout reached'))
  }

  private generateTaskTitle(description: string): string {
    const words = description.split(' ').slice(0, 5)
    return words.join(' ') + (words.length === 5 ? '...' : '')
  }

  private classifyTaskType(description: string): string {
    const desc = description.toLowerCase()
    if (desc.includes('research') || desc.includes('find') || desc.includes('search')) {
      return 'research'
    } else if (desc.includes('analyze') || desc.includes('analysis')) {
      return 'analysis'
    } else if (desc.includes('shop') || desc.includes('buy') || desc.includes('price')) {
      return 'shopping'
    } else if (desc.includes('navigate') || desc.includes('go to') || desc.includes('visit')) {
      return 'navigation'
    } else if (desc.includes('email') || desc.includes('compose') || desc.includes('form') || desc.includes('social')) {
      return 'communication'
    } else if (desc.includes('automate') || desc.includes('workflow') || desc.includes('schedule') || desc.includes('repeat')) {
      return 'automation'
    }
    return 'general'
  }

  private updateActiveAgentsCount(): void {
    this.agentMetrics.activeAgents = this.activeTasks.size
  }

  private updateAverageExecutionTime(newTime: number): void {
    const total = this.agentMetrics.completedTasks
    const current = this.agentMetrics.averageExecutionTime
    this.agentMetrics.averageExecutionTime = ((current * (total - 1)) + newTime) / total
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    logger.info('Cleaning up Enhanced Agent System')

    await this.cancelAllTasks()

    // Clear all timeouts
    for (const timeoutId of this.taskTimeouts.values()) {
      clearTimeout(timeoutId)
    }
    this.taskTimeouts.clear()

    // Reset metrics
    this.agentMetrics = {
      totalTasks: 0,
      completedTasks: 0,
      failedTasks: 0,
      averageExecutionTime: 0,
      activeAgents: 0
    }

    logger.info('Enhanced Agent System cleanup complete')
  }
}

export default EnhancedAgentSystem