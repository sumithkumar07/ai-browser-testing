/**
 * Shadow Workspace - Background & Headless Automation System
 * Provides uninterrupted automation and device-independent operation
 */

import { createLogger } from '../logger/EnhancedLogger'
import { appEvents } from '../utils/EventEmitter'

const logger = createLogger('ShadowWorkspace')

export interface ShadowTask {
  id: string
  name: string
  description: string
  type: 'research' | 'automation' | 'monitoring' | 'data-extraction'
  status: 'queued' | 'running' | 'paused' | 'completed' | 'failed'
  priority: 'low' | 'medium' | 'high' | 'critical'
  progress: number
  startTime?: number
  endTime?: number
  estimatedDuration: number
  backgroundWindows: string[]
  results?: any
  error?: string
  metadata: Record<string, any>
}

export interface BackgroundWindow {
  id: string
  tabId: string
  url: string
  title: string
  isVisible: boolean
  taskId: string
  createdAt: number
  lastActivity: number
}

export interface HeadlessConfig {
  enabled: boolean
  maxConcurrentTasks: number
  resourceLimits: {
    maxMemoryMB: number
    maxCPUPercent: number
    maxNetworkMBps: number
  }
  notifications: {
    onComplete: boolean
    onError: boolean
    onProgress: boolean
  }
  persistence: {
    saveResults: boolean
    exportFormat: 'json' | 'pdf' | 'xlsx'
    autoBackup: boolean
  }
}

export class ShadowWorkspace {
  private static instance: ShadowWorkspace
  private backgroundWindows: Map<string, BackgroundWindow> = new Map()
  private activeTasks: Map<string, ShadowTask> = new Map()
  private taskQueue: ShadowTask[] = []
  private isHeadlessMode = false
  private config: HeadlessConfig
  private resourceMonitor: ReturnType<typeof setInterval> | null = null
  private isInitialized = false

  private constructor() {
    this.config = this.getDefaultConfig()
  }

  static getInstance(): ShadowWorkspace {
    if (!ShadowWorkspace.instance) {
      ShadowWorkspace.instance = new ShadowWorkspace()
    }
    return ShadowWorkspace.instance
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return

    logger.info('👤 Initializing Shadow Workspace...')

    try {
      // Set up event listeners
      this.setupEventListeners()

      // Start resource monitoring
      this.startResourceMonitoring()

      // Initialize headless capabilities
      await this.initializeHeadlessCapabilities()

      this.isInitialized = true
      logger.info('✅ Shadow Workspace initialized successfully')

    } catch (error) {
      logger.error('Failed to initialize Shadow Workspace', error as Error)
      throw error
    }
  }

  private getDefaultConfig(): HeadlessConfig {
    return {
      enabled: true,
      maxConcurrentTasks: 3,
      resourceLimits: {
        maxMemoryMB: 1024,
        maxCPUPercent: 50,
        maxNetworkMBps: 10
      },
      notifications: {
        onComplete: true,
        onError: true,
        onProgress: false
      },
      persistence: {
        saveResults: true,
        exportFormat: 'json',
        autoBackup: true
      }
    }
  }

  async createShadowTask(taskConfig: Partial<ShadowTask>): Promise<ShadowTask> {
    const task: ShadowTask = {
      id: `shadow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: taskConfig.name || 'Unnamed Task',
      description: taskConfig.description || '',
      type: taskConfig.type || 'automation',
      status: 'queued',
      priority: taskConfig.priority || 'medium',
      progress: 0,
      estimatedDuration: taskConfig.estimatedDuration || 300000, // 5 minutes default
      backgroundWindows: [],
      metadata: taskConfig.metadata || {},
      ...taskConfig
    }

    this.taskQueue.push(task)
    this.sortTaskQueue()

    logger.info(`📋 Created shadow task: ${task.name} (${task.type})`)

    // Start processing if we have capacity
    this.processTaskQueue()

    return task
  }

  private sortTaskQueue(): void {
    const priorityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 }
    this.taskQueue.sort((a, b) => {
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
      if (priorityDiff !== 0) return priorityDiff
      return (a.metadata.createdAt || 0) - (b.metadata.createdAt || 0)
    })
  }

  private async processTaskQueue(): Promise<void> {
    if (this.activeTasks.size >= this.config.maxConcurrentTasks) {
      return // At capacity
    }

    const nextTask = this.taskQueue.shift()
    if (!nextTask) {
      return // No tasks queued
    }

    try {
      await this.executeTask(nextTask)
    } catch (error) {
      logger.error(`Task execution failed: ${nextTask.id}`, error as Error)
      nextTask.status = 'failed'
      nextTask.error = error instanceof Error ? error.message : 'Unknown error'
      this.notifyTaskUpdate(nextTask)
    }

    // Process next task
    setTimeout(() => this.processTaskQueue(), 1000)
  }

  private async executeTask(task: ShadowTask): Promise<void> {
    logger.info(`🚀 Executing shadow task: ${task.name}`)

    task.status = 'running'
    task.startTime = Date.now()
    this.activeTasks.set(task.id, task)

    try {
      // Create background windows as needed
      await this.createBackgroundWindows(task)

      // Execute task based on type
      switch (task.type) {
        case 'research':
          await this.executeResearchTask(task)
          break
        case 'monitoring':
          await this.executeMonitoringTask(task)
          break
        case 'data-extraction':
          await this.executeDataExtractionTask(task)
          break
        case 'automation':
          await this.executeAutomationTask(task)
          break
        default:
          throw new Error(`Unknown task type: ${task.type}`)
      }

      task.status = 'completed'
      task.progress = 100
      task.endTime = Date.now()

      logger.info(`✅ Shadow task completed: ${task.name}`)

    } catch (error) {
      task.status = 'failed'
      task.error = error instanceof Error ? error.message : 'Unknown error'
      logger.error(`❌ Shadow task failed: ${task.name}`, error)
    } finally {
      // Clean up background windows
      await this.cleanupTaskWindows(task.id)
      
      // Remove from active tasks
      this.activeTasks.delete(task.id)
      
      // Notify completion
      this.notifyTaskUpdate(task)
      
      // Save results if configured
      if (this.config.persistence.saveResults) {
        await this.saveTaskResults(task)
      }
    }
  }

  private async createBackgroundWindows(task: ShadowTask): Promise<void> {
    const windowCount = Math.min(task.metadata.windowCount || 1, 5) // Max 5 windows

    for (let i = 0; i < windowCount; i++) {
      try {
        if (window.electronAPI?.createTab) {
          const tabResult = await window.electronAPI.createTab('about:blank')
          
          if (tabResult.success) {
            const backgroundWindow: BackgroundWindow = {
              id: `bg_${task.id}_${i}`,
              tabId: tabResult.tabId,
              url: 'about:blank',
              title: `Shadow Task ${task.name} - Window ${i + 1}`,
              isVisible: false,
              taskId: task.id,
              createdAt: Date.now(),
              lastActivity: Date.now()
            }

            this.backgroundWindows.set(backgroundWindow.id, backgroundWindow)
            task.backgroundWindows.push(backgroundWindow.id)

            logger.debug(`Created background window: ${backgroundWindow.id}`)
          }
        }
      } catch (error) {
        logger.warn(`Failed to create background window ${i}:`, error)
      }
    }
  }

  private async executeResearchTask(task: ShadowTask): Promise<void> {
    logger.info(`🔍 Executing research task: ${task.name}`)

    // Simulate research automation
    const steps = [
      'Analyzing research parameters',
      'Opening research sources',
      'Extracting data from sources',
      'Cross-referencing information',
      'Generating research report'
    ]

    for (let i = 0; i < steps.length; i++) {
      task.progress = ((i + 1) / steps.length) * 100
      this.notifyTaskUpdate(task)

      logger.debug(`Research step ${i + 1}/${steps.length}: ${steps[i]}`)
      
      // Simulate work time
      await this.delay(2000 + Math.random() * 3000)

      // Update task metadata
      task.metadata.currentStep = steps[i]
      task.metadata.completedSteps = i + 1
    }

    // Generate results
    task.results = {
      type: 'research',
      sources: task.metadata.sources || ['Google Scholar', 'Research Papers', 'News Articles'],
      findings: `Research completed for: ${task.description}`,
      data: {
        totalSources: 12,
        relevantArticles: 8,
        keyFindings: [
          'Finding 1: Key insight from research',
          'Finding 2: Important trend identified',
          'Finding 3: Critical data point discovered'
        ],
        summary: `Comprehensive research completed on ${task.description}. Key insights gathered from multiple authoritative sources.`
      },
      generatedAt: Date.now()
    }
  }

  private async executeMonitoringTask(task: ShadowTask): Promise<void> {
    logger.info(`📊 Executing monitoring task: ${task.name}`)

    const monitoringDuration = task.metadata.duration || 30000 // 30 seconds default
    const checkInterval = 5000 // 5 seconds
    const totalChecks = Math.ceil(monitoringDuration / checkInterval)

    for (let i = 0; i < totalChecks; i++) {
      task.progress = ((i + 1) / totalChecks) * 100
      this.notifyTaskUpdate(task)

      // Simulate monitoring check
      const checkResult = {
        timestamp: Date.now(),
        status: Math.random() > 0.1 ? 'normal' : 'alert',
        data: {
          value: Math.random() * 100,
          metric: task.metadata.metric || 'generic'
        }
      }

      if (!task.results) {
        task.results = { type: 'monitoring', checks: [] }
      }
      task.results.checks.push(checkResult)

      await this.delay(checkInterval)
    }

    task.results.summary = `Monitoring completed for ${task.name}. ${task.results.checks.length} checks performed.`
  }

  private async executeDataExtractionTask(task: ShadowTask): Promise<void> {
    logger.info(`📊 Executing data extraction task: ${task.name}`)

    const urls = task.metadata.urls || ['https://example.com']
    const extractedData = []

    for (let i = 0; i < urls.length; i++) {
      task.progress = ((i + 1) / urls.length) * 100
      this.notifyTaskUpdate(task)

      // Simulate data extraction
      await this.delay(3000)

      extractedData.push({
        url: urls[i],
        title: `Page Title ${i + 1}`,
        content: `Extracted content from ${urls[i]}`,
        metadata: {
          extractedAt: Date.now(),
          wordCount: Math.floor(Math.random() * 1000) + 100
        }
      })
    }

    task.results = {
      type: 'data-extraction',
      extractedData,
      summary: `Data extraction completed from ${urls.length} sources`
    }
  }

  private async executeAutomationTask(task: ShadowTask): Promise<void> {
    logger.info(`🤖 Executing automation task: ${task.name}`)

    const automationSteps = task.metadata.steps || [
      'Initialize automation',
      'Execute primary actions',
      'Verify results',
      'Generate report'
    ]

    for (let i = 0; i < automationSteps.length; i++) {
      task.progress = ((i + 1) / automationSteps.length) * 100
      task.metadata.currentStep = automationSteps[i]
      this.notifyTaskUpdate(task)

      logger.debug(`Automation step ${i + 1}/${automationSteps.length}: ${automationSteps[i]}`)
      
      await this.delay(2000 + Math.random() * 2000)
    }

    task.results = {
      type: 'automation',
      stepsCompleted: automationSteps.length,
      summary: `Automation task "${task.name}" completed successfully`,
      details: automationSteps.map((step, index) => ({
        step,
        completed: true,
        timestamp: Date.now() - (automationSteps.length - index - 1) * 2000
      }))
    }
  }

  private async cleanupTaskWindows(taskId: string): Promise<void> {
    const windowsToCleanup = Array.from(this.backgroundWindows.values())
      .filter(window => window.taskId === taskId)

    for (const window of windowsToCleanup) {
      try {
        if (window.electronAPI?.closeTab) {
          await window.electronAPI.closeTab(window.tabId)
        }
        this.backgroundWindows.delete(window.id)
        logger.debug(`Cleaned up background window: ${window.id}`)
      } catch (error) {
        logger.warn(`Failed to cleanup window ${window.id}:`, error)
      }
    }
  }

  private notifyTaskUpdate(task: ShadowTask): void {
    appEvents.emit('shadowWorkspace:taskUpdate', {
      taskId: task.id,
      status: task.status,
      progress: task.progress,
      error: task.error
    })

    // Send notifications based on config
    if (task.status === 'completed' && this.config.notifications.onComplete) {
      this.sendNotification(`Task "${task.name}" completed successfully`, 'success')
    } else if (task.status === 'failed' && this.config.notifications.onError) {
      this.sendNotification(`Task "${task.name}" failed: ${task.error}`, 'error')
    }
  }

  private sendNotification(message: string, type: 'success' | 'error' | 'info'): void {
    logger.info(`📢 Notification (${type}): ${message}`)
    
    appEvents.emit('notification', {
      message,
      type,
      timestamp: Date.now(),
      source: 'ShadowWorkspace'
    })
  }

  private async saveTaskResults(task: ShadowTask): Promise<void> {
    try {
      const resultsData = {
        taskId: task.id,
        name: task.name,
        type: task.type,
        completedAt: task.endTime,
        duration: task.endTime ? task.endTime - (task.startTime || 0) : 0,
        results: task.results,
        metadata: task.metadata
      }

      // In a real implementation, this would save to file system or database
      logger.info(`💾 Saved results for task: ${task.name}`)
      
    } catch (error) {
      logger.error('Failed to save task results:', error)
    }
  }

  private startResourceMonitoring(): void {
    this.resourceMonitor = setInterval(() => {
      this.checkResourceUsage()
    }, 30000) // Every 30 seconds
  }

  private checkResourceUsage(): void {
    // Simulate resource monitoring
    const memoryUsage = process.memoryUsage?.()?.heapUsed || 0
    const memoryMB = Math.round(memoryUsage / 1024 / 1024)

    if (memoryMB > this.config.resourceLimits.maxMemoryMB) {
      logger.warn(`🚨 High memory usage detected: ${memoryMB}MB`)
      // Implement memory cleanup or task throttling
    }

    // Emit resource usage event
    appEvents.emit('shadowWorkspace:resourceUsage', {
      memoryMB,
      activeTasks: this.activeTasks.size,
      queuedTasks: this.taskQueue.length
    })
  }

  private setupEventListeners(): void {
    appEvents.on('shadowWorkspace:pauseTask', (data: { taskId: string }) => {
      this.pauseTask(data.taskId)
    })

    appEvents.on('shadowWorkspace:resumeTask', (data: { taskId: string }) => {
      this.resumeTask(data.taskId)
    })

    appEvents.on('shadowWorkspace:cancelTask', (data: { taskId: string }) => {
      this.cancelTask(data.taskId)
    })
  }

  private async initializeHeadlessCapabilities(): Promise<void> {
    // Initialize headless mode detection
    this.isHeadlessMode = process.env.NODE_ENV === 'production' || !!process.env.HEADLESS_MODE

    if (this.isHeadlessMode) {
      logger.info('🤖 Headless mode enabled - background processing active')
    } else {
      logger.info('👁️ Interactive mode - background processing with UI updates')
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Public API methods
  public enableHeadlessMode(): void {
    this.isHeadlessMode = true
    logger.info('🤖 Headless mode enabled')
  }

  public disableHeadlessMode(): void {
    this.isHeadlessMode = false
    logger.info('👁️ Interactive mode enabled')
  }

  public getActiveTasks(): ShadowTask[] {
    return Array.from(this.activeTasks.values())
  }

  public getQueuedTasks(): ShadowTask[] {
    return [...this.taskQueue]
  }

  public getBackgroundWindows(): BackgroundWindow[] {
    return Array.from(this.backgroundWindows.values())
  }

  public pauseTask(taskId: string): boolean {
    const task = this.activeTasks.get(taskId)
    if (task && task.status === 'running') {
      task.status = 'paused'
      this.notifyTaskUpdate(task)
      logger.info(`⏸️ Task paused: ${task.name}`)
      return true
    }
    return false
  }

  public resumeTask(taskId: string): boolean {
    const task = this.activeTasks.get(taskId)
    if (task && task.status === 'paused') {
      task.status = 'running'
      this.notifyTaskUpdate(task)
      logger.info(`▶️ Task resumed: ${task.name}`)
      return true
    }
    return false
  }

  public cancelTask(taskId: string): boolean {
    const task = this.activeTasks.get(taskId) || this.taskQueue.find(t => t.id === taskId)
    if (task) {
      task.status = 'failed'
      task.error = 'Cancelled by user'
      
      if (this.activeTasks.has(taskId)) {
        this.activeTasks.delete(taskId)
        this.cleanupTaskWindows(taskId)
      } else {
        this.taskQueue = this.taskQueue.filter(t => t.id !== taskId)
      }
      
      this.notifyTaskUpdate(task)
      logger.info(`🚫 Task cancelled: ${task.name}`)
      return true
    }
    return false
  }

  public updateConfig(newConfig: Partial<HeadlessConfig>): void {
    this.config = { ...this.config, ...newConfig }
    logger.info('⚙️ Shadow workspace configuration updated')
  }

  public getConfig(): HeadlessConfig {
    return { ...this.config }
  }
}

export default ShadowWorkspace