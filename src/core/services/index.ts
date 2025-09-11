/**
 * Enhanced Backend Services Index
 * Central export point for all enhanced backend capabilities
 */

// Core Services (Using JS implementations for Node.js compatibility)
export const AgentMemoryService = require('./AgentMemoryService.js')
export const AutonomousPlanningEngine = require('./AutonomousPlanningEngine.js')
export const DeepSearchEngine = require('./DeepSearchEngine.js')
export const AdvancedSecurity = require('./AdvancedSecurity.js')
export const EnhancedAgentCoordinator = require('./EnhancedAgentCoordinator.js')

// Additional Services (keeping the ones that work with require)
// Enhanced AI orchestration handled by electron main process
// export const UnifiedServiceOrchestrator = require('./UnifiedServiceOrchestrator.js')
export const ShadowWorkspace = require('./ShadowWorkspace.js')
export const CrossPlatformIntegration = require('./CrossPlatformIntegration.js')

// Backend Services (Note: These are Node.js services, not browser services)
// export { DatabaseService } from '../../backend/DatabaseService'
// export { AgentPerformanceMonitor } from '../../backend/AgentPerformanceMonitor'
// export { BackgroundTaskScheduler } from '../../backend/BackgroundTaskScheduler'

// Core Support Services (Commented out due to Node.js compatibility issues)
// export { ApiValidator } from './ApiValidator.js'
// export { DatabaseHealthManager } from './DatabaseHealthManager.js'

// Enhanced Initialization Function
export async function initializeEnhancedBackend(): Promise<{
  services: any
  orchestrator: any
  health: any
}> {
  const { createLogger } = await import('../logger/EnhancedLogger')
  const logger = createLogger('EnhancedBackendInit')

  logger.info('🚀 Initializing Enhanced Backend Services...')

  try {
    // Initialize orchestrator first
    // Enhanced AI orchestration handled by electron main process
    // const orchestrator = UnifiedServiceOrchestrator.getInstance()
    await orchestrator.initialize()

    // Get all initialized services
    const services = {
      memory: AgentMemoryService.getInstance(),
      planning: AutonomousPlanningEngine.getInstance(),
      search: DeepSearchEngine.getInstance(),
      security: AdvancedSecurity.getInstance(),
      coordinator: EnhancedAgentCoordinator.getInstance(),
      shadow: ShadowWorkspace.getInstance(),
      crossPlatform: CrossPlatformIntegration.getInstance()
    }

    // Get system health
    const health = orchestrator.getSystemHealth()

    logger.info(`✅ Enhanced Backend initialized: ${health.services.length} services, ${(health.overall * 100).toFixed(1)}% healthy`)

    return { services, orchestrator, health }

  } catch (error) {
    logger.error('❌ Enhanced Backend initialization failed:', error)
    throw error
  }
}

// Service Status Check
export async function getEnhancedBackendStatus(): Promise<{
  initialized: boolean
  services: any[]
  health: number
  metrics: any
}> {
  const orchestrator = UnifiedServiceOrchestrator.getInstance()
  
  if (!orchestrator) {
    return {
      initialized: false,
      services: [],
      health: 0,
      metrics: null
    }
  }

  const systemHealth = orchestrator.getSystemHealth()
  const metrics = orchestrator.getSystemMetrics(1)[0] // Latest metrics

  return {
    initialized: true,
    services: systemHealth.services,
    health: systemHealth.overall,
    metrics
  }
}