#!/usr/bin/env node

/**
 * Enhanced Backend Services Test Suite
 * Comprehensive testing of all maximum potential backend features
 */

const path = require('path')
const fs = require('fs')

// Import all enhanced services
const AgentMemoryService = require('./src/core/services/AgentMemoryService.js')
const AutonomousPlanningEngine = require('./src/core/services/AutonomousPlanningEngine.js')
const UnifiedServiceOrchestrator = require('./src/core/services/UnifiedServiceOrchestrator.js')
const DeepSearchEngine = require('./src/core/services/DeepSearchEngine.js')
const ShadowWorkspace = require('./src/core/services/ShadowWorkspace.js')
const CrossPlatformIntegration = require('./src/core/services/CrossPlatformIntegration.js')
const AdvancedSecurity = require('./src/core/services/AdvancedSecurity.js')
const EnhancedAgentCoordinator = require('./src/core/services/EnhancedAgentCoordinator.js')

// Test configuration
const TEST_CONFIG = {
  verbose: true,
  skipLongRunningTests: false,
  testDataPath: './test_data'
}

class EnhancedBackendTester {
  constructor() {
    this.testResults = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      details: []
    }
    this.services = {}
  }

  log(message, type = 'info') {
    if (!TEST_CONFIG.verbose && type === 'debug') return
    
    const timestamp = new Date().toISOString()
    const prefix = {
      info: '💬',
      success: '✅',
      error: '❌',
      warn: '⚠️',
      debug: '🔍'
    }[type] || '💬'
    
    console.log(`${prefix} [${timestamp}] ${message}`)
  }

  async runTest(name, testFn, options = {}) {
    this.testResults.total++
    
    if (options.skip) {
      this.log(`⏭️ SKIPPED: ${name}`, 'warn')
      this.testResults.skipped++
      this.testResults.details.push({ name, status: 'skipped', reason: options.skipReason })
      return
    }

    try {
      this.log(`🧪 TESTING: ${name}`)
      const startTime = Date.now()
      
      await testFn()
      
      const duration = Date.now() - startTime
      this.log(`✅ PASSED: ${name} (${duration}ms)`, 'success')
      this.testResults.passed++
      this.testResults.details.push({ name, status: 'passed', duration })
      
    } catch (error) {
      this.log(`❌ FAILED: ${name} - ${error.message}`, 'error')
      this.testResults.failed++
      this.testResults.details.push({ name, status: 'failed', error: error.message })
    }
  }

  async initializeServices() {
    this.log('🚀 Initializing Enhanced Backend Services for Testing...')
    
    try {
      // Initialize services in dependency order
      this.services.security = AdvancedSecurity.getInstance()
      await this.services.security.initialize()
      
      this.services.memory = AgentMemoryService.getInstance()
      await this.services.memory.initialize()
      
      this.services.search = DeepSearchEngine.getInstance()
      await this.services.search.initialize()
      
      this.services.shadow = ShadowWorkspace.getInstance()
      await this.services.shadow.initialize()
      
      this.services.crossPlatform = CrossPlatformIntegration.getInstance()
      await this.services.crossPlatform.initialize()
      
      this.services.planning = AutonomousPlanningEngine.getInstance()
      await this.services.planning.initialize()
      
      this.services.coordinator = EnhancedAgentCoordinator.getInstance()
      await this.services.coordinator.initialize()
      
      this.services.orchestrator = UnifiedServiceOrchestrator.getInstance()
      await this.services.orchestrator.initialize()
      
      this.log('✅ All Enhanced Backend Services initialized successfully')
      
    } catch (error) {
      this.log(`❌ Service initialization failed: ${error.message}`, 'error')
      throw error
    }
  }

  async testAgentMemoryService() {
    await this.runTest('Agent Memory Service - Store Memory', async () => {
      const memoryId = await this.services.memory.storeMemory('test_agent', {
        type: 'task',
        content: { action: 'test_action', result: 'success' },
        importance: 8,
        tags: ['test', 'memory'],
        relatedEntries: []
      })
      
      if (!memoryId || typeof memoryId !== 'string') {
        throw new Error('Memory ID not returned or invalid')
      }
    })

    await this.runTest('Agent Memory Service - Retrieve Memories', async () => {
      const memories = await this.services.memory.getMemories('test_agent', {
        type: 'task',
        limit: 10
      })
      
      if (!Array.isArray(memories)) {
        throw new Error('Memories not returned as array')
      }
    })

    await this.runTest('Agent Memory Service - Store Knowledge', async () => {
      await this.services.memory.storeKnowledge('test_agent', {
        domain: 'test_domain',
        knowledge: { key: 'value', score: 0.95 },
        confidence: 0.9
      })
    })

    await this.runTest('Agent Memory Service - Get Agent Insights', async () => {
      const insights = await this.services.memory.getAgentInsights('test_agent')
      
      if (!insights || typeof insights !== 'object') {
        throw new Error('Insights not returned or invalid')
      }
      
      if (!insights.performance || !insights.knowledgeDomains !== undefined) {
        throw new Error('Missing required insight fields')
      }
    })
  }

  async testAutonomousPlanningEngine() {
    await this.runTest('Autonomous Planning - Create Goal', async () => {
      const goal = await this.services.planning.createAutonomousGoal({
        title: 'Test Optimization Goal',
        description: 'Test goal for optimization',
        type: 'optimization',
        priority: 'medium',
        targetOutcome: 'Improve test metrics by 20%',
        successCriteria: ['Metric A > 80%', 'Metric B < 2s'],
        constraints: {
          timeframe: 3600000 // 1 hour
        }
      })
      
      if (!goal || !goal.id) {
        throw new Error('Goal not created or missing ID')
      }
      
      if (goal.strategy.decomposition.length === 0) {
        throw new Error('Goal plan not generated')
      }
    })

    await this.runTest('Autonomous Planning - Get Active Goals', async () => {
      const goals = this.services.planning.getActiveGoals()
      
      if (!Array.isArray(goals)) {
        throw new Error('Goals not returned as array')
      }
    })

    await this.runTest('Autonomous Planning - Get Strategic Insights', async () => {
      const insights = this.services.planning.getStrategicInsights()
      
      if (!Array.isArray(insights)) {
        throw new Error('Insights not returned as array')
      }
    })
  }

  async testDeepSearchEngine() {
    await this.runTest('Deep Search - Get Search Sources', async () => {
      const sources = this.services.search.getSearchSources()
      
      if (!Array.isArray(sources) || sources.length === 0) {
        throw new Error('Search sources not available')
      }
    })

    await this.runTest('Deep Search - Create Search Query', async () => {
      const query = await this.services.search.createSearchQuery('artificial intelligence trends', {
        maxResults: 5,
        sources: ['google-scholar', 'arxiv'],
        priority: 'medium'
      })
      
      if (!query || !query.id) {
        throw new Error('Search query not created')
      }
    })

    await this.runTest('Deep Search - Execute Search', async () => {
      const query = await this.services.search.createSearchQuery('machine learning', {
        maxResults: 3,
        timeout: 10000
      })
      
      const report = await this.services.search.executeDeepSearch(query)
      
      if (!report || !report.results) {
        throw new Error('Search report not generated')
      }
      
      if (!report.summary || !report.visualData) {
        throw new Error('Search report missing required fields')
      }
    }, { skip: TEST_CONFIG.skipLongRunningTests, skipReason: 'Long running test disabled' })
  }

  async testShadowWorkspace() {
    await this.runTest('Shadow Workspace - Create Task', async () => {
      const task = await this.services.shadow.createShadowTask({
        name: 'Test Research Task',
        description: 'Test shadow workspace functionality',
        type: 'research',
        priority: 'medium',
        estimatedDuration: 60000,
        metadata: { testMode: true }
      })
      
      if (!task || !task.id) {
        throw new Error('Shadow task not created')
      }
    })

    await this.runTest('Shadow Workspace - Get Active Tasks', async () => {
      const tasks = this.services.shadow.getActiveTasks()
      
      if (!Array.isArray(tasks)) {
        throw new Error('Active tasks not returned as array')
      }
    })

    await this.runTest('Shadow Workspace - Get Queued Tasks', async () => {
      const tasks = this.services.shadow.getQueuedTasks()
      
      if (!Array.isArray(tasks)) {
        throw new Error('Queued tasks not returned as array')
      }
    })
  }

  async testCrossPlatformIntegration() {
    await this.runTest('Cross-Platform - Get Installed Apps', async () => {
      const apps = this.services.crossPlatform.getInstalledApps()
      
      if (!Array.isArray(apps)) {
        throw new Error('Installed apps not returned as array')
      }
    })

    await this.runTest('Cross-Platform - Get Available Services', async () => {
      const services = this.services.crossPlatform.getAvailableServices()
      
      if (!Array.isArray(services) || services.length === 0) {
        throw new Error('Available services not returned or empty')
      }
    })

    await this.runTest('Cross-Platform - Execute File Operation', async () => {
      const result = await this.services.crossPlatform.executeFileOperation({
        type: 'search',
        source: '/tmp',
        pattern: '*.tmp',
        recursive: false
      })
      
      if (!result || typeof result !== 'object') {
        throw new Error('File operation result not returned')
      }
    })
  }

  async testAdvancedSecurity() {
    await this.runTest('Advanced Security - Encrypt Data', async () => {
      const testData = 'This is test data for encryption'
      const encrypted = await this.services.security.encrypt(testData)
      
      if (!encrypted || !encrypted.data || !encrypted.iv || !encrypted.salt) {
        throw new Error('Encryption failed or missing required fields')
      }
    })

    await this.runTest('Advanced Security - Decrypt Data', async () => {
      const testData = 'This is test data for decryption'
      const encrypted = await this.services.security.encrypt(testData)
      const decrypted = await this.services.security.decrypt(encrypted)
      
      if (decrypted !== testData) {
        throw new Error('Decryption failed - data mismatch')
      }
    })

    await this.runTest('Advanced Security - Store Credential', async () => {
      const credentialId = await this.services.security.storeCredential({
        service: 'test_service',
        type: 'api-key',
        data: 'test_api_key_12345',
        metadata: { purpose: 'testing' }
      })
      
      if (!credentialId || typeof credentialId !== 'string') {
        throw new Error('Credential not stored or invalid ID returned')
      }
    })

    await this.runTest('Advanced Security - Get Security Status', async () => {
      const status = this.services.security.getSecurityStatus()
      
      if (!status || typeof status !== 'object') {
        throw new Error('Security status not returned')
      }
      
      if (status.encryptionEnabled === undefined) {
        throw new Error('Security status missing encryption field')
      }
    })
  }

  async testEnhancedAgentCoordinator() {
    await this.runTest('Enhanced Coordinator - Get Capability Matrix', async () => {
      const matrix = this.services.coordinator.getCapabilityMatrix()
      
      if (!matrix || typeof matrix !== 'object') {
        throw new Error('Capability matrix not returned')
      }
      
      const expectedCapabilities = ['deepSearch', 'shadowWorkspace', 'crossPlatform', 'advancedSecurity']
      for (const capability of expectedCapabilities) {
        if (matrix[capability] === undefined) {
          throw new Error(`Missing capability: ${capability}`)
        }
      }
    })

    await this.runTest('Enhanced Coordinator - Create Enhanced Task', async () => {
      const task = await this.services.coordinator.createEnhancedTask({
        name: 'Test Enhanced Task',
        description: 'Test coordination capabilities',
        type: 'hybrid',
        priority: 'medium',
        capabilities: ['deep-search', 'security'],
        parameters: {
          searchQuery: 'test query',
          encryptData: ['sensitive test data']
        }
      })
      
      if (!task || !task.id) {
        throw new Error('Enhanced task not created')
      }
    })

    await this.runTest('Enhanced Coordinator - Get System Status', async () => {
      const status = this.services.coordinator.getSystemStatus()
      
      if (!status || !status.coordinator || !status.services) {
        throw new Error('System status not complete')
      }
    })
  }

  async testUnifiedServiceOrchestrator() {
    await this.runTest('Orchestrator - Get System Health', async () => {
      const health = this.services.orchestrator.getSystemHealth()
      
      if (!health || health.overall === undefined || !health.services) {
        throw new Error('System health not returned or incomplete')
      }
      
      if (!Array.isArray(health.services)) {
        throw new Error('Services health not returned as array')
      }
    })

    await this.runTest('Orchestrator - Get System Metrics', async () => {
      const metrics = this.services.orchestrator.getSystemMetrics(5)
      
      if (!Array.isArray(metrics)) {
        throw new Error('System metrics not returned as array')
      }
    })

    await this.runTest('Orchestrator - Get Active Operations', async () => {
      const operations = this.services.orchestrator.getActiveOperations()
      
      if (!Array.isArray(operations)) {
        throw new Error('Active operations not returned as array')
      }
    })

    await this.runTest('Orchestrator - Get Service List', async () => {
      const services = this.services.orchestrator.getServiceList()
      
      if (!Array.isArray(services) || services.length === 0) {
        throw new Error('Service list not returned or empty')
      }
      
      const requiredFields = ['id', 'name', 'status']
      for (const service of services) {
        for (const field of requiredFields) {
          if (!service[field]) {
            throw new Error(`Service missing required field: ${field}`)
          }
        }
      }
    })
  }

  async testIntegrationScenarios() {
    await this.runTest('Integration - Search with Security', async () => {
      // Create a search query
      const query = await this.services.search.createSearchQuery('secure data handling', {
        maxResults: 2,
        timeout: 5000
      })
      
      // Encrypt the query data
      const encrypted = await this.services.security.encrypt(JSON.stringify(query))
      
      // Store as secure credential
      const credentialId = await this.services.security.storeCredential({
        service: 'search_queries',
        type: 'password',
        data: JSON.stringify(encrypted),
        metadata: { queryId: query.id }
      })
      
      if (!credentialId) {
        throw new Error('Integration scenario failed')
      }
    })

    await this.runTest('Integration - Autonomous Goal with Memory', async () => {
      // Create autonomous goal
      const goal = await this.services.planning.createAutonomousGoal({
        title: 'Memory Integration Test',
        description: 'Test goal with memory integration',
        type: 'learning',
        priority: 'low',
        targetOutcome: 'Validate memory integration',
        successCriteria: ['Memory stored', 'Memory retrieved']
      })
      
      // Store memory about the goal
      const memoryId = await this.services.memory.storeMemory('planning_agent', {
        type: 'goal',
        content: { goalId: goal.id, created: Date.now() },
        importance: 7,
        tags: ['planning', 'integration'],
        relatedEntries: []
      })
      
      if (!memoryId) {
        throw new Error('Memory integration failed')
      }
    })
  }

  async testPerformanceAndReliability() {
    await this.runTest('Performance - Concurrent Memory Operations', async () => {
      const operations = []
      
      for (let i = 0; i < 10; i++) {
        operations.push(
          this.services.memory.storeMemory('perf_test_agent', {
            type: 'task',
            content: { testId: i, timestamp: Date.now() },
            importance: 5,
            tags: ['performance', 'test'],
            relatedEntries: []
          })
        )
      }
      
      const results = await Promise.allSettled(operations)
      const successful = results.filter(r => r.status === 'fulfilled').length
      
      if (successful < 8) {
        throw new Error(`Only ${successful}/10 operations succeeded`)
      }
    })

    await this.runTest('Reliability - Service Health Recovery', async () => {
      const health = this.services.orchestrator.getSystemHealth()
      const healthyServices = health.services.filter(s => s.status === 'healthy').length
      
      if (healthyServices < health.services.length * 0.8) {
        throw new Error(`Only ${healthyServices}/${health.services.length} services healthy`)
      }
    })
  }

  async runAllTests() {
    this.log('🧪 Starting Enhanced Backend Services Test Suite...')
    this.log(`📋 Configuration: verbose=${TEST_CONFIG.verbose}, skipLongRunning=${TEST_CONFIG.skipLongRunningTests}`)
    
    try {
      // Initialize services
      await this.initializeServices()
      
      // Run individual service tests
      await this.testAgentMemoryService()
      await this.testAutonomousPlanningEngine()  
      await this.testDeepSearchEngine()
      await this.testShadowWorkspace()
      await this.testCrossPlatformIntegration()
      await this.testAdvancedSecurity()
      await this.testEnhancedAgentCoordinator()
      await this.testUnifiedServiceOrchestrator()
      
      // Run integration tests
      await this.testIntegrationScenarios()
      
      // Run performance tests
      await this.testPerformanceAndReliability()
      
    } catch (error) {
      this.log(`❌ Test suite failed: ${error.message}`, 'error')
    }
    
    // Generate test report
    this.generateTestReport()
  }

  generateTestReport() {
    this.log('\n📊 Enhanced Backend Services Test Report')
    this.log('=' .repeat(50))
    
    const successRate = this.testResults.total > 0 ? 
      (this.testResults.passed / this.testResults.total * 100).toFixed(1) : 0
    
    this.log(`📈 Overall Success Rate: ${successRate}%`)
    this.log(`✅ Passed: ${this.testResults.passed}`)
    this.log(`❌ Failed: ${this.testResults.failed}`)
    this.log(`⏭️ Skipped: ${this.testResults.skipped}`)
    this.log(`📊 Total: ${this.testResults.total}`)
    
    if (this.testResults.failed > 0) {
      this.log('\n❌ Failed Tests:')
      this.testResults.details
        .filter(test => test.status === 'failed')
        .forEach(test => {
          this.log(`  • ${test.name}: ${test.error}`, 'error')
        })
    }
    
    if (this.testResults.skipped > 0) {
      this.log('\n⏭️ Skipped Tests:')
      this.testResults.details
        .filter(test => test.status === 'skipped')
        .forEach(test => {
          this.log(`  • ${test.name}: ${test.reason}`, 'warn')
        })
    }
    
    this.log('\n🏁 Test Suite Complete!')
    
    // Save detailed results to file
    const reportPath = path.join(__dirname, 'enhanced_backend_test_results.json')
    fs.writeFileSync(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      summary: this.testResults,
      config: TEST_CONFIG
    }, null, 2))
    
    this.log(`📄 Detailed results saved to: ${reportPath}`)
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const tester = new EnhancedBackendTester()
  
  // Parse command line arguments
  const args = process.argv.slice(2)
  if (args.includes('--skip-long')) {
    TEST_CONFIG.skipLongRunningTests = true
  }
  if (args.includes('--quiet')) {
    TEST_CONFIG.verbose = false
  }
  
  tester.runAllTests().catch(error => {
    console.error('❌ Test suite execution failed:', error)
    process.exit(1)
  })
}

module.exports = EnhancedBackendTester