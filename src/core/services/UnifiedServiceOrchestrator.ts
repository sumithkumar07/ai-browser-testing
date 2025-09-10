/**
 * Unified Service Orchestrator - Central Coordination Hub
 * Orchestrates all enhanced backend services with intelligent resource management
 */

import { createLogger } from '../logger/EnhancedLogger'
import { appEvents } from '../utils/EventEmitter'
import AgentMemoryService from './AgentMemoryService'
import AutonomousPlanningEngine from './AutonomousPlanningEngine'
import EnhancedAgentCoordinator from './EnhancedAgentCoordinator'
import DeepSearchEngine from './DeepSearchEngine'
import ShadowWorkspace from './ShadowWorkspace'
import CrossPlatformIntegration from './CrossPlatformIntegration'
import AdvancedSecurity from './AdvancedSecurity'

const logger = createLogger('UnifiedServiceOrchestrator')

export interface ServiceHealth {
  serviceId: string
  name: string
  status: 'healthy' | 'degraded' | 'critical' | 'offline'
  uptime: number
  lastHealthCheck: number
  metrics: {
    responseTime: number
    errorRate: number
    throughput: number
    resourceUsage: number
  }
  dependencies: string[]
  isEssential: boolean
}

export interface OrchestratorConfig {
  healthCheckInterval: number
  autoRecovery: boolean
  loadBalancing: boolean
  resourceMonitoring: boolean
  serviceTimeouts: Record<string, number>
  maxConcurrentOperations: number
  emergencyShutdownThreshold: number
}

export interface SystemMetrics {
  timestamp: number
  totalServices: number
  healthyServices: number
  activeOperations: number
  memoryUsage: number
  cpuUsage: number
  networkActivity: number
  storageUsage: number
  responseTimeAvg: number
  errorRateAvg: number
}

export interface ServiceOperation {
  id: string
  serviceId: string
  operation: string
  parameters: any
  status: 'queued' | 'executing' | 'completed' | 'failed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'critical'
  startTime?: number
  endTime?: number
  result?: any
  error?: string
}

export class UnifiedServiceOrchestrator {
  private static instance: UnifiedServiceOrchestrator
  private services: Map<string, any> = new Map()
  private serviceHealth: Map<string, ServiceHealth> = new Map()
  private operations: Map<string, ServiceOperation> = new Map()
  private operationQueue: ServiceOperation[] = []
  private config: OrchestratorConfig
  private healthCheckInterval: ReturnType<typeof setInterval> | null = null
  private metricsCollectionInterval: ReturnType<typeof setInterval> | null = null
  private systemMetrics: SystemMetrics[] = []
  private isInitialized = false

  private constructor() {
    this.config = this.getDefaultConfig()
  }

  static getInstance(): UnifiedServiceOrchestrator {
    if (!UnifiedServiceOrchestrator.instance) {
      UnifiedServiceOrchestrator.instance = new UnifiedServiceOrchestrator()
    }
    return UnifiedServiceOrchestrator.instance
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return

    logger.info('🎼 Initializing Unified Service Orchestrator...')

    try {
      // Initialize and register all services
      await this.initializeServices()

      // Set up health monitoring
      this.startHealthMonitoring()

      // Set up metrics collection
      this.startMetricsCollection()

      // Set up event listeners
      this.setupEventListeners()

      // Start operation processing
      this.startOperationProcessing()

      this.isInitialized = true
      logger.info('✅ Unified Service Orchestrator initialized successfully')

      // Emit initialization event
      appEvents.emit('orchestrator:initialized', {
        services: this.services.size,
        timestamp: Date.now()
      })

    } catch (error) {
      logger.error('Failed to initialize Unified Service Orchestrator', error as Error)
      throw error
    }
  }

  private getDefaultConfig(): OrchestratorConfig {
    return {
      healthCheckInterval: 30000, // 30 seconds
      autoRecovery: true,
      loadBalancing: true,
      resourceMonitoring: true,
      serviceTimeouts: {
        'agent-memory': 10000,
        'autonomous-planning': 30000,
        'enhanced-coordinator': 20000,
        'deep-search': 45000,
        'shadow-workspace': 60000,
        'cross-platform': 30000,
        'advanced-security': 15000
      },
      maxConcurrentOperations: 10,
      emergencyShutdownThreshold: 0.1 // 10% healthy services
    }
  }

  private async initializeServices(): Promise<void> {
    logger.info('🔧 Initializing all backend services...')

    const serviceInitializers = [
      { id: 'agent-memory', name: 'Agent Memory Service', instance: AgentMemoryService.getInstance(), essential: true },
      { id: 'autonomous-planning', name: 'Autonomous Planning Engine', instance: AutonomousPlanningEngine.getInstance(), essential: true },
      { id: 'enhanced-coordinator', name: 'Enhanced Agent Coordinator', instance: EnhancedAgentCoordinator.getInstance(), essential: true },
      { id: 'deep-search', name: 'Deep Search Engine', instance: DeepSearchEngine.getInstance(), essential: false },
      { id: 'shadow-workspace', name: 'Shadow Workspace', instance: ShadowWorkspace.getInstance(), essential: false },
      { id: 'cross-platform', name: 'Cross Platform Integration', instance: CrossPlatformIntegration.getInstance(), essential: false },
      { id: 'advanced-security', name: 'Advanced Security', instance: AdvancedSecurity.getInstance(), essential: true }
    ]

    for (const service of serviceInitializers) {
      try {
        logger.info(`🚀 Initializing ${service.name}...`)
        
        await service.instance.initialize()
        this.services.set(service.id, service.instance)

        // Initialize health tracking
        this.serviceHealth.set(service.id, {
          serviceId: service.id,
          name: service.name,
          status: 'healthy',
          uptime: Date.now(),
          lastHealthCheck: Date.now(),
          metrics: {
            responseTime: 0,
            errorRate: 0,
            throughput: 0,
            resourceUsage: 0
          },
          dependencies: this.getServiceDependencies(service.id),
          isEssential: service.essential
        })

        logger.info(`✅ ${service.name} initialized successfully`)

      } catch (error) {
        logger.error(`❌ Failed to initialize ${service.name}:`, error)
        
        // Mark service as offline
        this.serviceHealth.set(service.id, {
          serviceId: service.id,
          name: service.name,
          status: 'offline',
          uptime: 0,
          lastHealthCheck: Date.now(),
          metrics: { responseTime: 0, errorRate: 1, throughput: 0, resourceUsage: 0 },
          dependencies: [],
          isEssential: service.essential
        })

        // If essential service fails and auto-recovery is disabled, throw error
        if (service.essential && !this.config.autoRecovery) {
          throw new Error(`Essential service failed to initialize: ${service.name}`)
        }
      }
    }

    const healthyServices = Array.from(this.serviceHealth.values()).filter(s => s.status === 'healthy')
    logger.info(`📊 Service initialization complete: ${healthyServices.length}/${serviceInitializers.length} services healthy`)
  }

  private getServiceDependencies(serviceId: string): string[] {
    const dependencies: Record<string, string[]> = {
      'autonomous-planning': ['agent-memory'],
      'enhanced-coordinator': ['deep-search', 'shadow-workspace', 'cross-platform', 'advanced-security'],
      'deep-search': ['advanced-security'],
      'shadow-workspace': ['agent-memory'],
      'cross-platform': ['advanced-security']
    }
    return dependencies[serviceId] || []
  }

  async executeOperation(serviceId: string, operation: string, parameters: any = {}, priority: ServiceOperation['priority'] = 'medium'): Promise<any> {
    const operationId = `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const operationData: ServiceOperation = {
      id: operationId,
      serviceId,
      operation,
      parameters,
      status: 'queued',
      priority
    }

    // Check service health before queuing
    const serviceHealth = this.serviceHealth.get(serviceId)
    if (!serviceHealth || serviceHealth.status === 'offline') {
      throw new Error(`Service unavailable: ${serviceId}`)
    }

    // Queue operation
    this.operations.set(operationId, operationData)
    this.operationQueue.push(operationData)
    this.sortOperationQueue()

    logger.info(`📋 Queued operation: ${serviceId}.${operation} (${priority})`)

    // Wait for operation completion
    return new Promise((resolve, reject) => {
      const checkCompletion = () => {
        const op = this.operations.get(operationId)
        if (!op) {
          reject(new Error('Operation not found'))
          return
        }

        if (op.status === 'completed') {
          resolve(op.result)
        } else if (op.status === 'failed') {
          reject(new Error(op.error || 'Operation failed'))
        } else if (op.status === 'cancelled') {
          reject(new Error('Operation cancelled'))
        } else {
          setTimeout(checkCompletion, 1000) // Check again in 1 second
        }
      }

      checkCompletion()
    })
  }

  private sortOperationQueue(): void {
    const priorityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 }
    this.operationQueue.sort((a, b) => {
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
      if (priorityDiff !== 0) return priorityDiff
      return (a.startTime || 0) - (b.startTime || 0)
    })
  }

  private startOperationProcessing(): void {
    setInterval(() => {
      this.processOperationQueue()
    }, 1000) // Process every second

    logger.info('⚡ Operation processing started')
  }

  private async processOperationQueue(): Promise<void> {
    const executingOperations = Array.from(this.operations.values())
      .filter(op => op.status === 'executing')

    if (executingOperations.length >= this.config.maxConcurrentOperations) {
      return // At capacity
    }

    const availableSlots = this.config.maxConcurrentOperations - executingOperations.length
    const operationsToExecute = this.operationQueue
      .filter(op => op.status === 'queued')
      .filter(op => this.isServiceAvailable(op.serviceId))
      .slice(0, availableSlots)

    for (const operation of operationsToExecute) {
      this.executeQueuedOperation(operation).catch(error => {
        logger.error(`Operation execution failed: ${operation.id}`, error)
      })
    }
  }

  private isServiceAvailable(serviceId: string): boolean {
    const health = this.serviceHealth.get(serviceId)
    return health?.status === 'healthy' || health?.status === 'degraded'
  }

  private async executeQueuedOperation(operation: ServiceOperation): Promise<void> {
    const service = this.services.get(operation.serviceId)
    if (!service) {
      operation.status = 'failed'
      operation.error = 'Service not found'
      return
    }

    operation.status = 'executing'
    operation.startTime = Date.now()

    const timeout = this.config.serviceTimeouts[operation.serviceId] || 30000

    try {
      // Execute with timeout
      const result = await Promise.race([
        this.callServiceMethod(service, operation.operation, operation.parameters),
        this.createTimeoutPromise(timeout)
      ])

      operation.status = 'completed'
      operation.result = result
      operation.endTime = Date.now()

      // Update service health metrics
      this.updateServiceMetrics(operation.serviceId, true, operation.endTime - operation.startTime!)

    } catch (error) {
      operation.status = 'failed'
      operation.error = error instanceof Error ? error.message : 'Unknown error'
      operation.endTime = Date.now()

      // Update service health metrics
      this.updateServiceMetrics(operation.serviceId, false, operation.endTime - operation.startTime!)

      logger.error(`❌ Operation failed: ${operation.serviceId}.${operation.operation}`, error)
    } finally {
      // Remove from queue
      this.operationQueue = this.operationQueue.filter(op => op.id !== operation.id)
    }
  }

  private async callServiceMethod(service: any, method: string, parameters: any): Promise<any> {
    // Dynamic method invocation based on operation name
    if (typeof service[method] === 'function') {
      return await service[method](parameters)
    } else {
      throw new Error(`Method not found: ${method}`)
    }
  }

  private createTimeoutPromise(timeout: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Operation timeout after ${timeout}ms`))
      }, timeout)
    })
  }

  private updateServiceMetrics(serviceId: string, success: boolean, responseTime: number): void {
    const health = this.serviceHealth.get(serviceId)
    if (!health) return

    // Update metrics with exponential moving average
    const alpha = 0.1 // Smoothing factor
    health.metrics.responseTime = health.metrics.responseTime * (1 - alpha) + responseTime * alpha
    health.metrics.errorRate = health.metrics.errorRate * (1 - alpha) + (success ? 0 : 1) * alpha
    health.metrics.throughput += 1

    health.lastHealthCheck = Date.now()
  }

  private startHealthMonitoring(): void {
    this.healthCheckInterval = setInterval(async () => {
      await this.performHealthChecks()
    }, this.config.healthCheckInterval)

    logger.info(`🏥 Health monitoring started (${this.config.healthCheckInterval / 1000}s intervals)`)
  }

  private async performHealthChecks(): Promise<void> {
    logger.debug('🔍 Performing health checks...')

    const healthPromises = Array.from(this.serviceHealth.keys()).map(serviceId => 
      this.checkServiceHealth(serviceId)
    )

    await Promise.allSettled(healthPromises)

    // Check system-wide health
    await this.assessSystemHealth()
  }

  private async checkServiceHealth(serviceId: string): Promise<void> {
    const health = this.serviceHealth.get(serviceId)
    const service = this.services.get(serviceId)

    if (!health || !service) return

    try {
      // Perform health check based on service type
      const healthResult = await this.performServiceHealthCheck(service, serviceId)
      
      if (healthResult.healthy) {
        if (health.status === 'offline') {
          health.uptime = Date.now()
          logger.info(`🟢 Service recovered: ${health.name}`)
        }
        health.status = healthResult.degraded ? 'degraded' : 'healthy'
      } else {
        health.status = 'critical'
        logger.warn(`🔴 Service critical: ${health.name}`)
      }

    } catch (error) {
      health.status = 'offline'
      logger.error(`❌ Health check failed for ${health.name}:`, error)

      // Attempt auto-recovery if enabled
      if (this.config.autoRecovery && health.isEssential) {
        await this.attemptServiceRecovery(serviceId)
      }
    }

    health.lastHealthCheck = Date.now()
  }

  private async performServiceHealthCheck(service: any, serviceId: string): Promise<{ healthy: boolean; degraded: boolean }> {
    // Generic health check - each service type would have specific checks
    try {
      const health = this.serviceHealth.get(serviceId)
      if (!health) return { healthy: false, degraded: false }

      // Check response time and error rate
      const degraded = health.metrics.responseTime > 5000 || health.metrics.errorRate > 0.1
      const healthy = health.metrics.errorRate < 0.5

      return { healthy, degraded }

    } catch (error) {
      return { healthy: false, degraded: false }
    }
  }

  private async attemptServiceRecovery(serviceId: string): Promise<void> {
    logger.info(`🔄 Attempting recovery for service: ${serviceId}`)

    try {
      const service = this.services.get(serviceId)
      if (service && typeof service.initialize === 'function') {
        await service.initialize()
        logger.info(`✅ Service recovered: ${serviceId}`)
      }
    } catch (error) {
      logger.error(`❌ Service recovery failed: ${serviceId}`, error)
    }
  }

  private async assessSystemHealth(): Promise<void> {
    const healthyServices = Array.from(this.serviceHealth.values())
      .filter(s => s.status === 'healthy').length
    const totalServices = this.serviceHealth.size

    const healthPercentage = totalServices > 0 ? healthyServices / totalServices : 0

    if (healthPercentage < this.config.emergencyShutdownThreshold) {
      logger.error(`🚨 CRITICAL: System health below threshold (${(healthPercentage * 100).toFixed(1)}%)`)
      
      // Emit emergency event
      appEvents.emit('orchestrator:emergency', {
        healthPercentage,
        healthyServices,
        totalServices,
        timestamp: Date.now()
      })
    }
  }

  private startMetricsCollection(): void {
    this.metricsCollectionInterval = setInterval(() => {
      this.collectSystemMetrics()
    }, 60000) // Every minute

    logger.info('📊 Metrics collection started')
  }

  private collectSystemMetrics(): void {
    const healthyServices = Array.from(this.serviceHealth.values())
      .filter(s => s.status === 'healthy').length

    const activeOperations = Array.from(this.operations.values())
      .filter(op => op.status === 'executing').length

    const responseTimeAvg = Array.from(this.serviceHealth.values())
      .reduce((sum, s) => sum + s.metrics.responseTime, 0) / this.serviceHealth.size

    const errorRateAvg = Array.from(this.serviceHealth.values())
      .reduce((sum, s) => sum + s.metrics.errorRate, 0) / this.serviceHealth.size

    const metrics: SystemMetrics = {
      timestamp: Date.now(),
      totalServices: this.serviceHealth.size,
      healthyServices,
      activeOperations,
      memoryUsage: process.memoryUsage?.()?.heapUsed || 0,
      cpuUsage: 0, // Would implement actual CPU monitoring
      networkActivity: 0, // Would implement actual network monitoring
      storageUsage: 0, // Would implement actual storage monitoring
      responseTimeAvg,
      errorRateAvg
    }

    this.systemMetrics.push(metrics)

    // Limit metrics storage
    if (this.systemMetrics.length > 1440) { // 24 hours of minute-level data
      this.systemMetrics = this.systemMetrics.slice(-720) // Keep 12 hours
    }

    // Emit metrics event
    appEvents.emit('orchestrator:metrics', metrics)
  }

  private setupEventListeners(): void {
    // Listen for service-specific events
    appEvents.on('service:health', (data: { serviceId: string; status: string }) => {
      this.handleServiceHealthEvent(data)
    })

    appEvents.on('service:restart', (data: { serviceId: string }) => {
      this.restartService(data.serviceId)
    })

    appEvents.on('orchestrator:shutdown', () => {
      this.gracefulShutdown()
    })
  }

  private handleServiceHealthEvent(data: { serviceId: string; status: string }): void {
    const health = this.serviceHealth.get(data.serviceId)
    if (health) {
      health.status = data.status as ServiceHealth['status']
      logger.info(`📡 Service health updated: ${data.serviceId} -> ${data.status}`)
    }
  }

  private async restartService(serviceId: string): Promise<void> {
    logger.info(`🔄 Restarting service: ${serviceId}`)

    try {
      const service = this.services.get(serviceId)
      if (service) {
        // Cleanup if available
        if (typeof service.cleanup === 'function') {
          await service.cleanup()
        }

        // Reinitialize
        await service.initialize()

        // Update health status
        const health = this.serviceHealth.get(serviceId)
        if (health) {
          health.status = 'healthy'
          health.uptime = Date.now()
        }

        logger.info(`✅ Service restarted: ${serviceId}`)
      }
    } catch (error) {
      logger.error(`❌ Service restart failed: ${serviceId}`, error)
    }
  }

  // Public API methods
  public getSystemHealth(): { overall: number; services: ServiceHealth[] } {
    const services = Array.from(this.serviceHealth.values())
    const healthyCount = services.filter(s => s.status === 'healthy').length
    const overall = services.length > 0 ? healthyCount / services.length : 0

    return { overall, services }
  }

  public getSystemMetrics(limit: number = 60): SystemMetrics[] {
    return this.systemMetrics.slice(-limit)
  }

  public getActiveOperations(): ServiceOperation[] {
    return Array.from(this.operations.values())
      .filter(op => op.status === 'executing' || op.status === 'queued')
  }

  public getServiceList(): Array<{ id: string; name: string; status: string }> {
    return Array.from(this.serviceHealth.values()).map(s => ({
      id: s.serviceId,
      name: s.name,
      status: s.status
    }))
  }

  public async cancelOperation(operationId: string): Promise<boolean> {
    const operation = this.operations.get(operationId)
    if (operation && (operation.status === 'queued' || operation.status === 'executing')) {
      operation.status = 'cancelled'
      operation.endTime = Date.now()
      this.operationQueue = this.operationQueue.filter(op => op.id !== operationId)
      return true
    }
    return false
  }

  public updateConfig(newConfig: Partial<OrchestratorConfig>): void {
    this.config = { ...this.config, ...newConfig }
    
    // Restart monitoring with new intervals if changed
    if (newConfig.healthCheckInterval && this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval)
      this.startHealthMonitoring()
    }

    logger.info('⚙️ Orchestrator configuration updated')
  }

  public async gracefulShutdown(): Promise<void> {
    logger.info('🛑 Initiating graceful shutdown...')

    // Stop monitoring
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval)
      this.healthCheckInterval = null
    }

    if (this.metricsCollectionInterval) {
      clearInterval(this.metricsCollectionInterval)
      this.metricsCollectionInterval = null
    }

    // Cancel queued operations
    this.operationQueue.forEach(op => {
      op.status = 'cancelled'
      op.error = 'System shutdown'
    })

    // Wait for executing operations to complete (with timeout)
    const executingOps = Array.from(this.operations.values())
      .filter(op => op.status === 'executing')

    if (executingOps.length > 0) {
      logger.info(`⏳ Waiting for ${executingOps.length} operations to complete...`)
      
      const timeout = 30000 // 30 seconds
      const startTime = Date.now()

      while (executingOps.some(op => op.status === 'executing') && 
             (Date.now() - startTime) < timeout) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    // Shutdown all services
    for (const [serviceId, service] of this.services.entries()) {
      try {
        if (typeof service.cleanup === 'function') {
          await service.cleanup()
        }
        logger.info(`✅ Service shutdown: ${serviceId}`)
      } catch (error) {
        logger.error(`❌ Service shutdown failed: ${serviceId}`, error)
      }
    }

    logger.info('✅ Graceful shutdown completed')
  }
}

export default UnifiedServiceOrchestrator