/**
 * ⚡ Optimized Services Index - Core Functionality Only
 * Simplified and robust service initialization
 */

// Import core services
import { BrowserEngine } from './BrowserEngine'
import { DataStorageService } from './DataStorageService'
import { PerformanceMonitor } from './PerformanceMonitor'
import IntegratedAgentFramework from './IntegratedAgentFramework'
import { StartupOptimizer } from './StartupOptimizer'
import { ErrorRecoveryService } from './ErrorRecoveryService'

// Export core services
export { 
  BrowserEngine,
  DataStorageService,
  PerformanceMonitor,
  IntegratedAgentFramework,
  StartupOptimizer,
  ErrorRecoveryService
}

// Simplified intelligent services initializer
export async function initializeIntelligentServices(): Promise<{
  success: boolean
  errors?: string[]
  services: {
    browserEngine: BrowserEngine
    dataStorage: DataStorageService
    performanceMonitor: PerformanceMonitor
  }
}> {
  const errors: string[] = []
  
  try {
    console.log('🚀 Initializing Core Services...')
    
    // Initialize core services with error handling
    let browserEngine: BrowserEngine
    let dataStorage: DataStorageService  
    let performanceMonitor: PerformanceMonitor
    
    try {
      browserEngine = BrowserEngine.getInstance()
      await browserEngine.initialize()
    } catch (error) {
      errors.push(`Browser Engine: ${error}`)
      browserEngine = BrowserEngine.getInstance() // Fallback instance
    }
    
    try {
      dataStorage = DataStorageService.getInstance()
      await dataStorage.initialize()
    } catch (error) {
      errors.push(`Data Storage: ${error}`)
      dataStorage = DataStorageService.getInstance() // Fallback instance
    }
    
    try {
      performanceMonitor = PerformanceMonitor.getInstance()
      await performanceMonitor.initialize()
    } catch (error) {
      errors.push(`Performance Monitor: ${error}`)
      performanceMonitor = PerformanceMonitor.getInstance() // Fallback instance
    }
    
    const success = errors.length === 0
    
    if (success) {
      console.log('✅ All core services initialized successfully')
    } else {
      console.warn('⚠️ Some services initialized with warnings:', errors)
    }
    
    return {
      success,
      errors: errors.length > 0 ? errors : undefined,
      services: {
        browserEngine,
        dataStorage,
        performanceMonitor
      }
    }
    
  } catch (error) {
    const errorMessage = `Core services initialization failed: ${error}`
    console.error('❌', errorMessage)
    errors.push(errorMessage)
    
    // Return fallback instances
    return {
      success: false,
      errors,
      services: {
        browserEngine: BrowserEngine.getInstance(),
        dataStorage: DataStorageService.getInstance(),
        performanceMonitor: PerformanceMonitor.getInstance()
      }
    }
  }
}

// Service health check
export function checkServicesHealth(): {
  browserEngine: boolean
  dataStorage: boolean
  performanceMonitor: boolean
  overall: number
} {
  try {
    const browserEngine = BrowserEngine.getInstance().isReady?.() ?? true
    const dataStorage = DataStorageService.getInstance().isReady?.() ?? true
    const performanceMonitor = PerformanceMonitor.getInstance().isReady?.() ?? true
    
    const healthyCount = [browserEngine, dataStorage, performanceMonitor].filter(Boolean).length
    const overall = healthyCount / 3
    
    return {
      browserEngine,
      dataStorage,
      performanceMonitor,
      overall
    }
  } catch (error) {
    console.error('Health check failed:', error)
    return {
      browserEngine: false,
      dataStorage: false,
      performanceMonitor: false,
      overall: 0
    }
  }
}

export default {
  initializeIntelligentServices,
  checkServicesHealth,
  BrowserEngine,
  DataStorageService,
  PerformanceMonitor
}