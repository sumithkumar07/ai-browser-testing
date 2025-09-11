/**
 * ⚡ ADVANCED UPGRADE: Enhanced Services Index
 * Exports all intelligent services and provides unified initialization
 */

// Import all intelligent services
import IntelligentBrowserManager from './IntelligentBrowserManager'
import IntelligentDataManager from './IntelligentDataManager'
import IntelligentPerformanceOptimizer from './IntelligentPerformanceOptimizer'

// Import remaining services
import { BrowserEngine } from './BrowserEngine'
import { DataStorageService } from './DataStorageService'
import { PerformanceMonitor } from './PerformanceMonitor'
import IntegratedAgentFramework from './IntegratedAgentFramework'
import { StartupOptimizer } from './StartupOptimizer'
import { ErrorRecoveryService } from './ErrorRecoveryService'

// Export intelligent services (preferred)
export { 
  IntelligentBrowserManager,
  IntelligentDataManager, 
  IntelligentPerformanceOptimizer
}

// Export legacy services (for backward compatibility during transition)
export { 
  BrowserEngine,
  DataStorageService,
  PerformanceMonitor,
  IntegratedAgentFramework,
  StartupOptimizer,
  ErrorRecoveryService
}

// Unified intelligent services initializer
export async function initializeIntelligentServices(): Promise<{
  browserManager: IntelligentBrowserManager
  dataManager: IntelligentDataManager
  performanceOptimizer: IntelligentPerformanceOptimizer
  success: boolean
  errors?: string[]
}> {
  const errors: string[] = []
  
  try {
    console.log('🚀 Initializing Intelligent Services Suite...')
    
    // Initialize core intelligent services
    const browserManager = IntelligentBrowserManager.getInstance()
    const dataManager = IntelligentDataManager.getInstance()
    const performanceOptimizer = IntelligentPerformanceOptimizer.getInstance()
    
    // Initialize in optimal order
    await performanceOptimizer.initialize()
    await dataManager.initialize()
    await browserManager.initialize()
    
    console.log('✅ All intelligent services initialized successfully')
    
    return {
      browserManager,
      dataManager,
      performanceOptimizer,
      success: true
    }
    
  } catch (error) {
    const errorMessage = `Intelligent services initialization failed: ${error}`
    console.error('❌', errorMessage)
    errors.push(errorMessage)
    
    // Return fallback instances
    return {
      browserManager: IntelligentBrowserManager.getInstance(),
      dataManager: IntelligentDataManager.getInstance(),
      performanceOptimizer: IntelligentPerformanceOptimizer.getInstance(),
      success: false,
      errors
    }
  }
}

// Legacy services initializer (for backward compatibility)
export async function initializeLegacyServices(): Promise<{
  browserEngine: BrowserEngine
  dataStorage: DataStorageService
  performanceMonitor: PerformanceMonitor
  success: boolean
}> {
  try {
    const browserEngine = BrowserEngine.getInstance()
    const dataStorage = DataStorageService.getInstance()
    const performanceMonitor = PerformanceMonitor.getInstance()
    
    await browserEngine.initialize()
    await dataStorage.initialize()
    await performanceMonitor.initialize()
    
    return {
      browserEngine,
      dataStorage,
      performanceMonitor,
      success: true
    }
  } catch (error) {
    console.error('Legacy services initialization failed:', error)
    return {
      browserEngine: BrowserEngine.getInstance(),
      dataStorage: DataStorageService.getInstance(),
      performanceMonitor: PerformanceMonitor.getInstance(),
      success: false
    }
  }
}

// Service health check
export function checkIntelligentServicesHealth(): {
  browserManager: boolean
  dataManager: boolean
  performanceOptimizer: boolean
  overall: boolean
} {
  const browserManager = IntelligentBrowserManager.getInstance().isReady()
  const dataManager = IntelligentDataManager.getInstance().isReady()
  const performanceOptimizer = IntelligentPerformanceOptimizer.getInstance().isReady()
  
  return {
    browserManager,
    dataManager, 
    performanceOptimizer,
    overall: browserManager && dataManager && performanceOptimizer
  }
}

export default {
  initializeIntelligentServices,
  initializeLegacyServices,
  checkIntelligentServicesHealth,
  IntelligentBrowserManager,
  IntelligentDataManager,
  IntelligentPerformanceOptimizer
}