/**
 * System Initializer - Entry Point for All Enhanced Backend Capabilities
 * Orchestrates the complete activation of all advanced features and bug fixes
 */

import { createLogger } from '../logger/EnhancedLogger'
import { appEvents } from '../utils/EventEmitter'
import ComprehensiveSystemEnhancer from './ComprehensiveSystemEnhancer'
import EnhancedServiceActivator from './EnhancedServiceActivator'

const logger = createLogger('SystemInitializer')

export interface InitializationReport {
  success: boolean
  featuresActivated: string[]
  bugsFixed: string[]
  optimizationsApplied: string[]
  systemScore: number
  capabilities: any
  errors: string[]
  duration: number
  timestamp: number
}

export class SystemInitializer {
  private static instance: SystemInitializer
  private enhancer: ComprehensiveSystemEnhancer
  private serviceActivator: EnhancedServiceActivator
  private isInitialized = false
  private initializationReport: InitializationReport | null = null

  private constructor() {
    this.enhancer = ComprehensiveSystemEnhancer.getInstance()
    this.serviceActivator = EnhancedServiceActivator.getInstance()
  }

  static getInstance(): SystemInitializer {
    if (!SystemInitializer.instance) {
      SystemInitializer.instance = new SystemInitializer()
    }
    return SystemInitializer.instance
  }

  async initializeCompleteSystem(): Promise<InitializationReport> {
    if (this.isInitialized && this.initializationReport) {
      return this.initializationReport
    }

    const startTime = Date.now()
    logger.info('🚀 Starting Complete System Initialization...')

    const report: InitializationReport = {
      success: false,
      featuresActivated: [],
      bugsFixed: [],
      optimizationsApplied: [],
      systemScore: 0,
      capabilities: null,
      errors: [],
      duration: 0,
      timestamp: Date.now()
    }

    try {
      // 1. Display system banner
      this.displaySystemBanner()

      // 2. Perform comprehensive system enhancement
      logger.info('📊 Performing comprehensive system enhancement...')
      const enhancementReport = await this.enhancer.performComprehensiveEnhancement()
      
      report.featuresActivated = enhancementReport.featuresActivated
      report.bugsFixed = enhancementReport.bugsFixed
      report.optimizationsApplied = enhancementReport.optimizationsApplied
      report.systemScore = enhancementReport.systemScore

      // 3. Get final system capabilities
      const capabilities = this.serviceActivator.getSystemCapabilities()
      report.capabilities = capabilities

      // 4. Perform final system check
      const finalCheck = await this.performFinalSystemCheck()
      if (!finalCheck.success) {
        report.errors.push(...finalCheck.errors)
      }

      report.success = report.errors.length === 0
      report.duration = Date.now() - startTime

      this.initializationReport = report
      this.isInitialized = true

      // 5. Display completion summary
      this.displayCompletionSummary(report)

      // 6. Emit initialization complete event
      appEvents.emit('system:initialized', {
        report,
        capabilities,
        timestamp: Date.now()
      })

      logger.info(`✅ Complete System Initialization finished in ${report.duration}ms`)

    } catch (error) {
      report.errors.push(error instanceof Error ? error.message : 'Unknown initialization error')
      report.success = false
      report.duration = Date.now() - startTime
      
      logger.error('❌ System initialization failed:', error)
      this.displayErrorSummary(report, error)
    }

    return report
  }

  private displaySystemBanner(): void {
    console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║                      🚀 KAiro Browser - Enhanced Backend                     ║
║                          Maximum Capability Activation                       ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  🧠 6-Agent AI System        🔍 Deep Search Engine                          ║
║  🎯 Autonomous Planning      👤 Shadow Workspace                            ║
║  🔐 Advanced Security        🔗 Cross-Platform Integration                  ║
║  📊 Performance Monitoring   🤖 Background Automation                       ║
║  🧩 Service Orchestration    💾 Persistent Memory System                   ║
║                                                                              ║
║  Powered by GROQ LLM • Built with TypeScript • Enhanced for Production     ║
╚══════════════════════════════════════════════════════════════════════════════╝
    `)
  }

  private async performFinalSystemCheck(): Promise<{ success: boolean; errors: string[] }> {
    const errors: string[] = []

    try {
      // Check service activator status
      const serviceStatus = this.serviceActivator.getEnhancedStatus()
      if (!serviceStatus.activated) {
        errors.push('Enhanced services not activated')
      }

      // Check system capabilities
      const capabilities = this.serviceActivator.getSystemCapabilities()
      if (capabilities.systemScore < 70) {
        errors.push(`Low system score: ${capabilities.systemScore}`)
      }

      // Check GROQ API availability
      if (!process.env.GROQ_API_KEY) {
        errors.push('GROQ API key not configured')
      }

      // Check browser compatibility
      if (typeof window !== 'undefined') {
        if (!window.localStorage) {
          errors.push('LocalStorage not available')
        }
        if (!window.fetch) {
          errors.push('Fetch API not available')
        }
      }

      return { success: errors.length === 0, errors }

    } catch (error) {
      errors.push('Final system check failed')
      return { success: false, errors }
    }
  }

  private displayCompletionSummary(report: InitializationReport): void {
    console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║                         🎉 SYSTEM ENHANCEMENT COMPLETE                      ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  ✅ Features Activated: ${report.featuresActivated.length.toString().padEnd(45)} ║
║  🐛 Bugs Fixed: ${report.bugsFixed.length.toString().padEnd(53)} ║
║  ⚡ Optimizations Applied: ${report.optimizationsApplied.length.toString().padEnd(41)} ║
║  📊 System Score: ${report.systemScore.toString().padEnd(49)} ║
║  ⏱️  Duration: ${Math.round(report.duration / 1000).toString().padEnd(52)}s ║
║                                                                              ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                            ACTIVE CAPABILITIES                               ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  🎯 Autonomous Goals: ${report.capabilities?.autonomousGoals || 0}                                           ║
║  🔍 Active Searches: ${report.capabilities?.activeSearches || 0}                                            ║
║  👤 Background Tasks: ${report.capabilities?.backgroundTasks || 0}                                          ║
║  🔗 Platform Connections: ${report.capabilities?.crossPlatformConnections || 0}                            ║
║  🔐 Security Level: ${(report.capabilities?.securityLevel || 'standard').padEnd(47)} ║
║  💾 Memory Utilization: ${(report.capabilities?.memoryUtilization || 0).toString().padEnd(41)}% ║
║  ⚡ Optimization: ${(report.capabilities?.optimizationLevel || 'standard').padEnd(47)} ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
    `)

    if (report.featuresActivated.length > 0) {
      console.log('\n🎯 Features Activated:')
      report.featuresActivated.forEach(feature => {
        console.log(`   ✅ ${feature}`)
      })
    }

    if (report.bugsFixed.length > 0) {
      console.log('\n🐛 Bugs Fixed:')
      report.bugsFixed.forEach(bug => {
        console.log(`   🔧 ${bug}`)
      })
    }

    if (report.optimizationsApplied.length > 0) {
      console.log('\n⚡ Optimizations Applied:')
      report.optimizationsApplied.forEach(optimization => {
        console.log(`   ⚡ ${optimization}`)
      })
    }

    console.log('\n🚀 KAiro Browser is now operating at maximum capability!')
  }

  private displayErrorSummary(report: InitializationReport, error: any): void {
    console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║                         ❌ INITIALIZATION FAILED                            ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  Duration: ${Math.round(report.duration / 1000)}s                                                       ║
║  Errors: ${report.errors.length}                                                         ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
    `)

    if (report.errors.length > 0) {
      console.log('\n❌ Errors encountered:')
      report.errors.forEach(error => {
        console.log(`   • ${error}`)
      })
    }

    console.log('\n📞 For support, please contact the development team.')
  }

  // Utility methods for external use
  async getSystemAnalysis(): Promise<any> {
    if (!this.isInitialized) {
      await this.initializeCompleteSystem()
    }

    return {
      initialized: this.isInitialized,
      report: this.initializationReport,
      enhancementHistory: this.enhancer.getEnhancementHistory(),
      systemStatus: this.enhancer.getSystemStatus(),
      serviceStatus: this.serviceActivator.getEnhancedStatus(),
      timestamp: Date.now()
    }
  }

  async executeSystemOperation(operation: string, parameters: any = {}): Promise<any> {
    if (!this.isInitialized) {
      throw new Error('System not initialized. Call initializeCompleteSystem() first.')
    }

    logger.info(`🔧 Executing system operation: ${operation}`)

    try {
      switch (operation) {
        case 'health_check':
          return await this.performSystemHealthCheck()

        case 'performance_analysis':
          return await this.performPerformanceAnalysis()

        case 'capability_test':
          return await this.performCapabilityTest()

        case 'memory_analysis':
          return await this.performMemoryAnalysis()

        case 'optimization_run':
          return await this.performOptimizationRun()

        case 'feature_status':
          return await this.getFeatureStatus()

        default:
          // Delegate to service activator
          return await this.serviceActivator.executeAdvancedOperation(operation, parameters)
      }

    } catch (error) {
      logger.error(`System operation "${operation}" failed:`, error)
      throw error
    }
  }

  private async performSystemHealthCheck(): Promise<any> {
    const serviceStatus = this.serviceActivator.getEnhancedStatus()
    const capabilities = this.serviceActivator.getSystemCapabilities()
    
    return {
      overall: serviceStatus.systemHealth?.overall || 0,
      services: serviceStatus.services,
      capabilities,
      timestamp: Date.now(),
      healthy: serviceStatus.systemHealth?.overall > 0.8
    }
  }

  private async performPerformanceAnalysis(): Promise<any> {
    const analysis = {
      memory: { usage: 0, limit: 0, percentage: 0 },
      timing: { loadTime: 0, renderTime: 0 },
      services: {},
      recommendations: []
    }

    // Memory analysis
    if (typeof window !== 'undefined' && (window as any).performance?.memory) {
      const memory = (window as any).performance.memory
      analysis.memory = {
        usage: memory.usedJSHeapSize,
        limit: memory.jsHeapSizeLimit,
        percentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
      }
    }

    // Timing analysis
    if (typeof window !== 'undefined' && (window as any).performance?.timing) {
      const timing = (window as any).performance.timing
      analysis.timing = {
        loadTime: timing.loadEventEnd - timing.navigationStart,
        renderTime: timing.domContentLoadedEventEnd - timing.domContentLoadedEventStart
      }
    }

    // Service analysis
    const serviceStatus = this.serviceActivator.getEnhancedStatus()
    analysis.services = serviceStatus.services

    // Generate recommendations
    if (analysis.memory.percentage > 80) {
      analysis.recommendations.push('Consider memory cleanup - usage is high')
    }
    if (analysis.timing.loadTime > 5000) {
      analysis.recommendations.push('Page load time is slow - consider optimization')
    }

    return analysis
  }

  private async performCapabilityTest(): Promise<any> {
    const capabilities = this.serviceActivator.getSystemCapabilities()
    const tests = []

    // Test autonomous goals
    if (capabilities.autonomousGoals > 0) {
      tests.push({ feature: 'Autonomous Goals', status: 'active', count: capabilities.autonomousGoals })
    } else {
      tests.push({ feature: 'Autonomous Goals', status: 'inactive', count: 0 })
    }

    // Test search capabilities
    if (capabilities.activeSearches >= 0) {
      tests.push({ feature: 'Deep Search', status: 'available', count: capabilities.activeSearches })
    }

    // Test background tasks
    if (capabilities.backgroundTasks >= 0) {
      tests.push({ feature: 'Background Tasks', status: 'available', count: capabilities.backgroundTasks })
    }

    // Test security
    tests.push({ 
      feature: 'Security Level', 
      status: capabilities.securityLevel === 'high' ? 'enhanced' : 'standard',
      level: capabilities.securityLevel
    })

    return {
      tests,
      overallScore: capabilities.systemScore || this.initializationReport?.systemScore || 0,
      timestamp: Date.now()
    }
  }

  private async performMemoryAnalysis(): Promise<any> {
    const analysis = {
      browser: {},
      localStorage: {},
      services: {},
      recommendations: []
    }

    // Browser memory
    if (typeof window !== 'undefined' && (window as any).performance?.memory) {
      const memory = (window as any).performance.memory
      analysis.browser = {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
        percentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
      }
    }

    // LocalStorage analysis
    try {
      let totalSize = 0
      let itemCount = 0
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          totalSize += localStorage[key].length
          itemCount++
        }
      }
      analysis.localStorage = { totalSize, itemCount }
    } catch (error) {
      analysis.localStorage = { error: 'Unable to analyze localStorage' }
    }

    // Service memory usage (approximation)
    const serviceStatus = this.serviceActivator.getEnhancedStatus()
    analysis.services = {
      active: Object.keys(serviceStatus.services).length,
      capabilities: serviceStatus.capabilities
    }

    // Recommendations
    if ((analysis.browser as any).percentage > 80) {
      analysis.recommendations.push('High browser memory usage - consider cleanup')
    }
    if ((analysis.localStorage as any).totalSize > 5 * 1024 * 1024) {
      analysis.recommendations.push('Large localStorage usage - consider cleanup')
    }

    return analysis
  }

  private async performOptimizationRun(): Promise<any> {
    logger.info('🔧 Performing optimization run...')
    
    // Trigger comprehensive enhancement again for optimization
    const enhancementReport = await this.enhancer.performComprehensiveEnhancement()
    
    return {
      optimizationsApplied: enhancementReport.optimizationsApplied,
      performanceImprovements: enhancementReport.performanceImprovements,
      newSystemScore: enhancementReport.systemScore,
      timestamp: Date.now()
    }
  }

  private async getFeatureStatus(): Promise<any> {
    const serviceStatus = this.serviceActivator.getEnhancedStatus()
    const capabilities = this.serviceActivator.getSystemCapabilities()
    
    return {
      enhanced: serviceStatus.activated,
      services: serviceStatus.services,
      capabilities,
      config: serviceStatus.config,
      systemHealth: serviceStatus.systemHealth,
      initializationReport: this.initializationReport,
      timestamp: Date.now()
    }
  }

  getInitializationReport(): InitializationReport | null {
    return this.initializationReport
  }

  isSystemInitialized(): boolean {
    return this.isInitialized
  }
}

export default SystemInitializer