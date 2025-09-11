// Bug Detection and Fix System
// Comprehensive bug detection, analysis, and automated fixing system

class BugDetectionAndFixSystem {
  constructor(mainInstance) {
    this.mainInstance = mainInstance
    this.detectedBugs = new Map()
    this.fixAttempts = new Map()
    this.systemHealth = {
      overall: 'unknown',
      components: new Map(),
      lastCheck: Date.now()
    }
    this.monitoring = false
    this.bugPatterns = this.initializeBugPatterns()
  }

  async initialize() {
    try {
      console.log('🔍 Initializing Bug Detection and Fix System...')
      
      // Start continuous monitoring
      this.startBugMonitoring()
      
      // Perform initial system scan
      await this.performSystemScan()
      
      console.log('✅ Bug Detection and Fix System initialized')
      
    } catch (error) {
      console.error('❌ Failed to initialize Bug Detection and Fix System:', error)
      throw error
    }
  }

  initializeBugPatterns() {
    return {
      // Database Issues
      database: [
        {
          pattern: /database.*not.*available|db.*connection.*failed/i,
          severity: 'critical',
          category: 'database',
          autoFix: 'restartDatabaseService'
        },
        {
          pattern: /SQLITE_BUSY|database is locked/i,
          severity: 'high',
          category: 'database',
          autoFix: 'unlockDatabase'
        }
      ],

      // Memory Issues
      memory: [
        {
          pattern: /out of memory|memory exceeded|heap overflow/i,
          severity: 'critical',
          category: 'memory',
          autoFix: 'performMemoryCleanup'
        },
        {
          pattern: /memory leak detected|gc overhead/i,
          severity: 'high',
          category: 'memory',
          autoFix: 'triggerGarbageCollection'
        }
      ],

      // Performance Issues
      performance: [
        {
          pattern: /response time exceeded|timeout|slow query/i,
          severity: 'medium',
          category: 'performance',
          autoFix: 'optimizePerformance'
        },
        {
          pattern: /high cpu usage|cpu spike/i,
          severity: 'high',
          category: 'performance',
          autoFix: 'reduceCpuLoad'
        }
      ],

      // Service Issues
      service: [
        {
          pattern: /service.*not.*responding|service.*crashed/i,
          severity: 'high',
          category: 'service',
          autoFix: 'restartService'
        },
        {
          pattern: /initialization.*failed|service.*unavailable/i,
          severity: 'medium',
          category: 'service',
          autoFix: 'reinitializeService'
        }
      ],

      // AI Integration Issues
      ai: [
        {
          pattern: /api.*key.*invalid|unauthorized.*access|groq.*error/i,
          severity: 'high',
          category: 'ai',
          autoFix: 'validateApiKeys'
        },
        {
          pattern: /rate.*limit.*exceeded|quota.*exceeded/i,
          severity: 'medium',
          category: 'ai',
          autoFix: 'handleRateLimit'
        }
      ],

      // Network Issues
      network: [
        {
          pattern: /network.*error|connection.*refused|dns.*error/i,
          severity: 'medium',
          category: 'network',
          autoFix: 'retryNetworkConnection'
        },
        {
          pattern: /timeout.*error|request.*timeout/i,
          severity: 'low',
          category: 'network',
          autoFix: 'adjustTimeout'
        }
      ]
    }
  }

  async performSystemScan() {
    console.log('🔎 Performing comprehensive system scan...')
    
    const scanResults = {
      timestamp: Date.now(),
      components: {},
      bugsDetected: [],
      overallHealth: 'healthy'
    }

    try {
      // Scan Database Service
      scanResults.components.database = await this.scanDatabaseService()
      
      // Scan Memory Usage
      scanResults.components.memory = await this.scanMemoryUsage()
      
      // Scan Performance Metrics
      scanResults.components.performance = await this.scanPerformanceMetrics()
      
      // Scan AI Services
      scanResults.components.ai = await this.scanAIServices()
      
      // Scan Service Health
      scanResults.components.services = await this.scanServiceHealth()
      
      // Scan Network Connectivity
      scanResults.components.network = await this.scanNetworkConnectivity()

      // Analyze scan results for bugs
      scanResults.bugsDetected = this.analyzeScanResults(scanResults.components)
      
      // Determine overall health
      scanResults.overallHealth = this.calculateOverallHealth(scanResults.components, scanResults.bugsDetected)

      // Store bugs for tracking
      this.storeBugDetections(scanResults.bugsDetected)

      console.log(`🔍 System scan completed: ${scanResults.overallHealth} - ${scanResults.bugsDetected.length} issues detected`)
      
      return scanResults

    } catch (error) {
      console.error('❌ System scan failed:', error)
      scanResults.overallHealth = 'error'
      scanResults.error = error.message
      return scanResults
    }
  }

  async scanDatabaseService() {
    try {
      if (!this.mainInstance.databaseService) {
        return { status: 'missing', health: 'critical', error: 'Database service not initialized' }
      }

      // Test database connection
      const testResult = await this.mainInstance.databaseService.getAllBookmarks()
      
      // Check database file size and performance
      const dbStats = await this.getDatabaseStats()
      
      return {
        status: 'operational',
        health: 'healthy',
        responseTime: dbStats.responseTime,
        size: dbStats.size,
        connections: dbStats.connections
      }

    } catch (error) {
      return {
        status: 'error',
        health: 'critical',
        error: error.message,
        pattern: this.matchBugPattern(error.message, 'database')
      }
    }
  }

  async scanMemoryUsage() {
    try {
      const memoryUsage = process.memoryUsage()
      const heapUsedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024)
      const heapTotalMB = Math.round(memoryUsage.heapTotal / 1024 / 1024)
      const externalMB = Math.round(memoryUsage.external / 1024 / 1024)

      let health = 'healthy'
      if (heapUsedMB > 500) health = 'warning'
      if (heapUsedMB > 800) health = 'critical'

      return {
        status: 'monitored',
        health: health,
        heapUsed: heapUsedMB,
        heapTotal: heapTotalMB,
        external: externalMB,
        rss: Math.round(memoryUsage.rss / 1024 / 1024)
      }

    } catch (error) {
      return {
        status: 'error',
        health: 'critical',
        error: error.message
      }
    }
  }

  async scanPerformanceMetrics() {
    try {
      let performanceData = { responseTime: 0, throughput: 0, errorRate: 0 }

      // Get performance data from performance monitor if available
      if (this.mainInstance.performanceMonitor) {
        const metrics = this.mainInstance.performanceMonitor.getAggregatedMetrics()
        if (metrics.success && metrics.data) {
          performanceData = {
            responseTime: metrics.data.averageResponseTime || 0,
            throughput: metrics.data.requestsPerSecond || 0,
            errorRate: metrics.data.errorRate || 0
          }
        }
      }

      let health = 'healthy'
      if (performanceData.responseTime > 2000) health = 'warning'
      if (performanceData.responseTime > 5000) health = 'critical'
      if (performanceData.errorRate > 0.05) health = 'warning'
      if (performanceData.errorRate > 0.15) health = 'critical'

      return {
        status: 'monitored',
        health: health,
        ...performanceData
      }

    } catch (error) {
      return {
        status: 'error',
        health: 'warning',
        error: error.message
      }
    }
  }

  async scanAIServices() {
    try {
      if (!this.mainInstance.aiService) {
        return { status: 'missing', health: 'warning', error: 'AI service not initialized' }
      }

      // Test AI service with a simple request
      const testStart = Date.now()
      try {
        const testResponse = await this.mainInstance.aiService.chat.completions.create({
          messages: [{ role: 'user', content: 'Test connection' }],
          model: 'llama-3.3-70b-versatile',
          max_tokens: 10
        })
        
        const responseTime = Date.now() - testStart
        
        return {
          status: 'operational',
          health: 'healthy',
          responseTime: responseTime,
          model: 'llama-3.3-70b-versatile'
        }

      } catch (aiError) {
        return {
          status: 'error',
          health: 'critical',
          error: aiError.message,
          pattern: this.matchBugPattern(aiError.message, 'ai')
        }
      }

    } catch (error) {
      return {
        status: 'error',
        health: 'critical',
        error: error.message
      }
    }
  }

  async scanServiceHealth() {
    try {
      const services = [
        'databaseService',
        'performanceMonitor', 
        'taskScheduler',
        // 'unifiedServiceOrchestrator', // Removed - replaced by enhanced AI orchestrator
        'agentMemoryService',
        'autonomousPlanningEngine',
        'deepSearchEngine',
        'advancedSecurity'
      ]

      const serviceHealth = {}
      let healthyCount = 0

      for (const serviceName of services) {
        const service = this.mainInstance[serviceName]
        if (service) {
          // Check if service has health check method
          if (typeof service.healthCheck === 'function') {
            try {
              await service.healthCheck()
              serviceHealth[serviceName] = 'healthy'
              healthyCount++
            } catch (error) {
              serviceHealth[serviceName] = 'unhealthy'
            }
          } else {
            serviceHealth[serviceName] = 'available'
            healthyCount++
          }
        } else {
          serviceHealth[serviceName] = 'missing'
        }
      }

      const healthRatio = healthyCount / services.length
      let overallHealth = 'healthy'
      if (healthRatio < 0.8) overallHealth = 'warning'
      if (healthRatio < 0.6) overallHealth = 'critical'

      return {
        status: 'monitored',
        health: overallHealth,
        services: serviceHealth,
        healthyCount: healthyCount,
        totalServices: services.length
      }

    } catch (error) {
      return {
        status: 'error',
        health: 'critical',
        error: error.message
      }
    }
  }

  async scanNetworkConnectivity() {
    try {
      // Test basic network connectivity
      const testUrls = [
        'https://api.groq.com',
        'https://www.google.com'
      ]

      const connectivityResults = {}
      let successfulConnections = 0

      for (const url of testUrls) {
        try {
          const startTime = Date.now()
          const response = await fetch(url, { 
            method: 'HEAD', 
            timeout: 5000 
          })
          const responseTime = Date.now() - startTime
          
          connectivityResults[url] = {
            status: response.status,
            responseTime: responseTime,
            success: response.ok
          }
          
          if (response.ok) successfulConnections++

        } catch (error) {
          connectivityResults[url] = {
            success: false,
            error: error.message,
            pattern: this.matchBugPattern(error.message, 'network')
          }
        }
      }

      const connectivityRatio = successfulConnections / testUrls.length
      let health = 'healthy'
      if (connectivityRatio < 0.8) health = 'warning'
      if (connectivityRatio < 0.5) health = 'critical'

      return {
        status: 'monitored',
        health: health,
        connectivity: connectivityResults,
        successfulConnections: successfulConnections,
        totalTests: testUrls.length
      }

    } catch (error) {
      return {
        status: 'error',
        health: 'warning',
        error: error.message
      }
    }
  }

  matchBugPattern(errorMessage, category) {
    const patterns = this.bugPatterns[category] || []
    
    for (const pattern of patterns) {
      if (pattern.pattern.test(errorMessage)) {
        return {
          severity: pattern.severity,
          category: pattern.category,
          autoFix: pattern.autoFix,
          pattern: pattern.pattern.toString()
        }
      }
    }
    
    return null
  }

  analyzeScanResults(components) {
    const bugs = []

    Object.entries(components).forEach(([componentName, componentData]) => {
      if (componentData.health === 'critical' || componentData.health === 'warning') {
        bugs.push({
          id: `bug_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          component: componentName,
          severity: componentData.health === 'critical' ? 'critical' : 'medium',
          description: componentData.error || `${componentName} health degraded`,
          pattern: componentData.pattern,
          detectedAt: Date.now(),
          status: 'detected'
        })
      }
    })

    return bugs
  }

  calculateOverallHealth(components, bugs) {
    if (bugs.some(bug => bug.severity === 'critical')) return 'critical'
    if (bugs.some(bug => bug.severity === 'high')) return 'warning'
    if (bugs.length > 3) return 'warning'
    
    const healthyComponents = Object.values(components).filter(c => c.health === 'healthy').length
    const totalComponents = Object.keys(components).length
    const healthRatio = healthyComponents / totalComponents

    if (healthRatio >= 0.9) return 'excellent'
    if (healthRatio >= 0.8) return 'healthy'
    if (healthRatio >= 0.6) return 'warning'
    return 'critical'
  }

  storeBugDetections(bugs) {
    bugs.forEach(bug => {
      this.detectedBugs.set(bug.id, bug)
    })
  }

  async attemptBugFix(bugId) {
    const bug = this.detectedBugs.get(bugId)
    if (!bug) {
      return { success: false, error: 'Bug not found' }
    }

    console.log(`🔧 Attempting to fix bug: ${bug.description}`)

    try {
      let fixResult = null

      if (bug.pattern && bug.pattern.autoFix) {
        const fixMethod = this[bug.pattern.autoFix]
        if (typeof fixMethod === 'function') {
          fixResult = await fixMethod.call(this, bug)
        }
      } else {
        // Generic fix based on component
        fixResult = await this.attemptGenericFix(bug)
      }

      // Record fix attempt
      const attemptId = `attempt_${Date.now()}`
      this.fixAttempts.set(attemptId, {
        bugId: bugId,
        timestamp: Date.now(),
        success: fixResult?.success || false,
        details: fixResult
      })

      if (fixResult?.success) {
        bug.status = 'fixed'
        bug.fixedAt = Date.now()
        console.log(`✅ Bug fixed successfully: ${bug.description}`)
      } else {
        bug.status = 'fix_failed'
        console.log(`❌ Bug fix failed: ${bug.description}`)
      }

      return fixResult

    } catch (error) {
      console.error(`❌ Bug fix attempt failed: ${bug.description}`, error)
      bug.status = 'fix_error'
      
      return {
        success: false,
        error: error.message
      }
    }
  }

  async attemptGenericFix(bug) {
    switch (bug.component) {
      case 'database':
        return await this.restartDatabaseService(bug)
        
      case 'memory':
        return await this.performMemoryCleanup(bug)
        
      case 'performance':
        return await this.optimizePerformance(bug)
        
      case 'services':
        return await this.restartService(bug)
        
      case 'ai':
        return await this.validateApiKeys(bug)
        
      case 'network':
        return await this.retryNetworkConnection(bug)
        
      default:
        return { success: false, error: 'No generic fix available for this component' }
    }
  }

  // Specific fix methods
  async restartDatabaseService(bug) {
    try {
      if (this.mainInstance.databaseService) {
        // Re-initialize database service
        await this.mainInstance.databaseService.initialize()
        return { success: true, action: 'Database service restarted' }
      }
      return { success: false, error: 'Database service not available' }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  async performMemoryCleanup(bug) {
    try {
      // Force garbage collection if available
      if (global.gc) {
        global.gc()
      }
      
      // Clear any caches
      if (this.mainInstance.agentMemoryService) {
        await this.mainInstance.agentMemoryService.optimizeMemory()
      }
      
      return { success: true, action: 'Memory cleanup performed' }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  async optimizePerformance(bug) {
    try {
      // Create performance optimization goal
      if (this.mainInstance.autonomousPlanningEngine) {
        await this.mainInstance.autonomousPlanningEngine.createAutonomousGoal({
          title: 'Emergency Performance Optimization',
          description: 'Auto-generated fix for performance issue',
          type: 'optimization',
          priority: 'critical',
          targetOutcome: 'Restore optimal performance',
          createdBy: 'bug_fix_system'
        })
      }
      
      return { success: true, action: 'Performance optimization goal created' }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  async restartService(bug) {
    try {
      // Attempt to restart service through orchestrator
      if (this.mainInstance.unifiedServiceOrchestrator) {
        const result = await this.mainInstance.unifiedServiceOrchestrator.executeOrchestrationTask('restart_service', { 
          serviceName: bug.component 
        })
        return { success: result.success, action: 'Service restart attempted' }
      }
      
      return { success: false, error: 'Service orchestrator not available' }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  async validateApiKeys(bug) {
    try {
      // Check if GROQ API key is configured
      const groqKey = process.env.GROQ_API_KEY
      if (!groqKey || groqKey.length < 20) {
        return { success: false, error: 'GROQ API key not properly configured' }
      }
      
      // Test API key with simple request
      if (this.mainInstance.aiService) {
        await this.mainInstance.aiService.chat.completions.create({
          messages: [{ role: 'user', content: 'Test' }],
          model: 'llama-3.3-70b-versatile',
          max_tokens: 1
        })
      }
      
      return { success: true, action: 'API keys validated successfully' }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  async retryNetworkConnection(bug) {
    try {
      // Simple retry mechanism
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Test connectivity again
      const response = await fetch('https://api.groq.com', { 
        method: 'HEAD', 
        timeout: 10000 
      })
      
      return { 
        success: response.ok, 
        action: 'Network connection retried',
        status: response.status
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  startBugMonitoring() {
    if (this.monitoring) return

    this.monitoring = true

    // Perform bug detection every 5 minutes
    setInterval(async () => {
      try {
        await this.performSystemScan()
        
        // Auto-fix critical bugs
        const criticalBugs = Array.from(this.detectedBugs.values()).filter(
          bug => bug.severity === 'critical' && bug.status === 'detected'
        )
        
        for (const bug of criticalBugs) {
          await this.attemptBugFix(bug.id)
        }
        
      } catch (error) {
        console.error('❌ Bug monitoring cycle failed:', error)
      }
    }, 5 * 60 * 1000) // Every 5 minutes

    console.log('👁️ Bug monitoring started')
  }

  async getDatabaseStats() {
    // Placeholder for database statistics
    return {
      responseTime: 50,
      size: 2048,
      connections: 1
    }
  }

  getBugReport() {
    const bugs = Array.from(this.detectedBugs.values())
    const fixAttempts = Array.from(this.fixAttempts.values())

    return {
      timestamp: Date.now(),
      systemHealth: this.systemHealth,
      bugsDetected: bugs.length,
      bugsByCategory: this.getBugsByCategory(bugs),
      bugsBySeverity: this.getBugsBySeverity(bugs),
      fixAttempts: fixAttempts.length,
      successfulFixes: fixAttempts.filter(a => a.success).length,
      bugs: bugs,
      fixHistory: fixAttempts
    }
  }

  getBugsByCategory(bugs) {
    const categories = {}
    bugs.forEach(bug => {
      categories[bug.component] = (categories[bug.component] || 0) + 1
    })
    return categories
  }

  getBugsBySeverity(bugs) {
    const severities = {}
    bugs.forEach(bug => {
      severities[bug.severity] = (severities[bug.severity] || 0) + 1
    })
    return severities
  }

  async shutdown() {
    this.monitoring = false
    console.log('🔍 Bug Detection and Fix System shutdown complete')
  }
}

module.exports = { BugDetectionAndFixSystem }