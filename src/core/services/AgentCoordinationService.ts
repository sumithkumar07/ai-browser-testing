/**
 * FIXED: Missing AgentCoordinationService.ts
 * This service was referenced but missing, causing integration bugs
 */

import { createLogger } from '../logger/EnhancedLogger'
import { appEvents } from '../utils/EventEmitter'
import AgentMemoryService from './AgentMemoryService'

const logger = createLogger('AgentCoordinationService')

export interface CoordinationTask {
  id: string
  description: string
  assignedAgents: string[]
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  progress: number
  startTime: number
  estimatedCompletion: number
}

class AgentCoordinationService {
  private static instance: AgentCoordinationService
  private memoryService: AgentMemoryService
  private activeTasks: Map<string, CoordinationTask> = new Map()
  private isInitialized = false

  private constructor() {
    this.memoryService = AgentMemoryService.getInstance()
  }

  static getInstance(): AgentCoordinationService {
    if (!AgentCoordinationService.instance) {
      AgentCoordinationService.instance = new AgentCoordinationService()
    }
    return AgentCoordinationService.instance
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      logger.warn('AgentCoordinationService already initialized')
      return
    }

    try {
      logger.info('Initializing Agent Coordination Service...')
      
      await this.memoryService.initialize()
      this.setupEventListeners()
      
      this.isInitialized = true
      logger.info('✅ Agent Coordination Service initialized successfully')
      
    } catch (error) {
      logger.error('Failed to initialize Agent Coordination Service', error as Error)
      throw error
    }
  }

  private setupEventListeners(): void {
    appEvents.on('agent:task-started', (data) => {
      logger.debug('Agent task started', data)
    })

    appEvents.on('agent:task-completed', (data) => {
      logger.debug('Agent task completed', data)
    })
  }

  async monitorGoalProgress(): Promise<{
    activeGoals: number
    averageProgress: number
    completedGoals: number
    failedGoals: number
  }> {
    const tasks = Array.from(this.activeTasks.values())
    const activeGoals = tasks.filter(t => t.status === 'in_progress').length
    const completedGoals = tasks.filter(t => t.status === 'completed').length
    const failedGoals = tasks.filter(t => t.status === 'failed').length
    
    const averageProgress = tasks.length > 0 
      ? tasks.reduce((sum, task) => sum + task.progress, 0) / tasks.length 
      : 0

    return {
      activeGoals,
      averageProgress,
      completedGoals,
      failedGoals
    }
  }

  async createCoordinationTask(
    description: string, 
    assignedAgents: string[]
  ): Promise<string> {
    const taskId = `coord_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const task: CoordinationTask = {
      id: taskId,
      description,
      assignedAgents,
      status: 'pending',
      progress: 0,
      startTime: Date.now(),
      estimatedCompletion: Date.now() + (30 * 60 * 1000) // 30 minutes
    }

    this.activeTasks.set(taskId, task)
    
    appEvents.emit('agent:task-started', {
      taskId,
      description,
      assignedAgents
    })

    logger.info(`Created coordination task ${taskId}`)
    return taskId
  }

  async updateTaskProgress(taskId: string, progress: number): Promise<void> {
    const task = this.activeTasks.get(taskId)
    if (task) {
      task.progress = progress
      
      if (progress >= 100) {
        task.status = 'completed'
        appEvents.emit('agent:task-completed', {
          taskId,
          result: task
        })
      }
    }
  }

  getActiveTasks(): CoordinationTask[] {
    return Array.from(this.activeTasks.values())
      .filter(task => task.status === 'in_progress' || task.status === 'pending')
  }

  async cleanup(): Promise<void> {
    this.activeTasks.clear()
    this.isInitialized = false
    logger.info('Agent Coordination Service cleaned up')
  }
}

export default AgentCoordinationService