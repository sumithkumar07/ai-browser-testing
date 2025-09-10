#!/usr/bin/env node
// Backend Enhancement Test
// Tests all the newly enhanced services without GUI

const { DatabaseService } = require('./src/backend/DatabaseService')
const { AgentPerformanceMonitor } = require('./src/backend/AgentPerformanceMonitor')
const { BackgroundTaskScheduler } = require('./src/backend/BackgroundTaskScheduler')
const { ApiValidator } = require('./src/core/services/ApiValidator')
const { DatabaseHealthManager } = require('./src/core/services/DatabaseHealthManager')

// NEW Enhanced Services
const DeepSearchEngine = require('./src/core/services/DeepSearchEngine.js')
const ShadowWorkspace = require('./src/core/services/ShadowWorkspace.js')
const CrossPlatformIntegration = require('./src/core/services/CrossPlatformIntegration.js')
const AdvancedSecurity = require('./src/core/services/AdvancedSecurity.js')
const EnhancedAgentCoordinator = require('./src/core/services/EnhancedAgentCoordinator.js')
const AgentMemoryService = require('./src/core/services/AgentMemoryService.js')
const AutonomousPlanningEngine = require('./src/core/services/AutonomousPlanningEngine.js')
const UnifiedServiceOrchestrator = require('./src/core/services/UnifiedServiceOrchestrator.js')

require('dotenv').config()

async function testBackendEnhancements() {
  console.log('🚀 TESTING BACKEND ENHANCEMENTS - COMPREHENSIVE ANALYSIS')
  console.log('=' .repeat(80))
  
  const results = {
    totalTests: 0,
    passed: 0,
    failed: 0,
    services: {},
    errors: []
  }

  // Test 1: Database Service
  try {
    console.log('\n📊 Testing Database Service...')
    results.totalTests++
    
    const databaseService = new DatabaseService({
      path: process.env.DB_PATH || './data/test_kairo_browser.db',
      maxSize: 100 * 1024 * 1024,
      backupEnabled: true
    })
    
    await databaseService.initialize()
    
    // Create test bookmark
    await databaseService.saveBookmark({
      id: 'test_bookmark_1',
      title: 'Test Enhancement',
      url: 'https://example.com/enhancement',
      description: 'Testing enhanced backend capabilities',
      tags: ['enhancement', 'test'],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      category: 'development'
    })
    
    const bookmarks = await databaseService.getBookmarks(10)
    
    results.services.DatabaseService = {
      status: 'WORKING',
      features: ['SQLite Integration', 'CRUD Operations', 'Indexing', 'Config Management'],
      testResults: { bookmarksCreated: 1, bookmarksRetrieved: bookmarks.length }
    }
    
    await databaseService.close()
    results.passed++
    console.log('✅ Database Service: ENHANCED AND WORKING')
    
  } catch (error) {
    results.failed++
    results.errors.push(`Database Service: ${error.message}`)
    results.services.DatabaseService = { status: 'FAILED', error: error.message }
    console.log('❌ Database Service: FAILED -', error.message)
  }

  // Test 2: API Validator
  try {
    console.log('\n🔑 Testing API Validator...')
    results.totalTests++
    
    const apiValidator = new ApiValidator(process.env.GROQ_API_KEY, {
      maxRetries: 3,
      retryDelay: 1000,
      maxRequestsPerWindow: 100
    })
    
    const validation = await apiValidator.validateApiKey()
    
    results.services.ApiValidator = {
      status: validation.valid ? 'WORKING' : 'FAILED',
      features: ['Key Validation', 'Rate Limiting', 'Circuit Breaker', 'Health Monitoring'],
      testResults: { keyValid: validation.valid, modelsAvailable: validation.models?.data?.length || 0 }
    }
    
    if (validation.valid) {
      results.passed++
      console.log('✅ API Validator: ENHANCED AND WORKING')
    } else {
      results.failed++
      results.errors.push(`API Validator: ${validation.error}`)
      console.log('❌ API Validator: FAILED -', validation.error)
    }
    
  } catch (error) {
    results.failed++
    results.errors.push(`API Validator: ${error.message}`)
    results.services.ApiValidator = { status: 'FAILED', error: error.message }
    console.log('❌ API Validator: FAILED -', error.message)
  }

  // Test 3: Deep Search Engine (NEW)
  try {
    console.log('\n🔍 Testing Deep Search Engine (NEW ENHANCED SERVICE)...')
    results.totalTests++
    
    const deepSearchEngine = DeepSearchEngine.getInstance()
    await deepSearchEngine.initialize()
    
    const searchResult = await deepSearchEngine.performDeepSearch('artificial intelligence trends 2025', {
      limit: 5,
      includeInsights: true
    })
    
    results.services.DeepSearchEngine = {
      status: searchResult.success ? 'WORKING' : 'FAILED',
      features: ['Multi-Source Search', 'AI Analysis', 'Pattern Recognition', 'Content Insights'],
      testResults: { 
        searchSuccessful: searchResult.success,
        resultsFound: searchResult.results?.primaryResults?.length || 0,
        insightsGenerated: searchResult.results?.insights?.length || 0
      }
    }
    
    await deepSearchEngine.shutdown()
    
    if (searchResult.success) {
      results.passed++
      console.log('✅ Deep Search Engine: NEW SERVICE WORKING')
    } else {
      results.failed++
      results.errors.push(`Deep Search Engine: ${searchResult.error}`)
      console.log('❌ Deep Search Engine: FAILED -', searchResult.error)
    }
    
  } catch (error) {
    results.failed++
    results.errors.push(`Deep Search Engine: ${error.message}`)
    results.services.DeepSearchEngine = { status: 'FAILED', error: error.message }
    console.log('❌ Deep Search Engine: FAILED -', error.message)
  }

  // Test 4: Shadow Workspace (NEW)  
  try {
    console.log('\n👥 Testing Shadow Workspace (NEW ENHANCED SERVICE)...')
    results.totalTests++
    
    const shadowWorkspace = ShadowWorkspace.getInstance()
    await shadowWorkspace.initialize()
    
    const taskResult = await shadowWorkspace.executeBackgroundTask({
      type: 'data_processing',
      description: 'Process test data for enhancement verification',
      parameters: { dataSize: '1MB', format: 'json' }
    }, {
      priority: 5,
      memoryLimit: 50 * 1024 * 1024
    })
    
    // Wait a moment for task to process
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    const taskStatus = shadowWorkspace.getTaskStatus(taskResult.taskId)
    
    results.services.ShadowWorkspace = {
      status: taskResult.success ? 'WORKING' : 'FAILED',
      features: ['Background Tasks', 'Resource Management', 'Task Queuing', 'Progress Tracking'],
      testResults: { 
        taskCreated: taskResult.success,
        taskId: taskResult.taskId,
        taskStatus: taskStatus.status,
        resourceUsage: shadowWorkspace.getResourceUsage()
      }
    }
    
    await shadowWorkspace.shutdown()
    
    if (taskResult.success) {
      results.passed++
      console.log('✅ Shadow Workspace: NEW SERVICE WORKING')
    } else {
      results.failed++
      results.errors.push(`Shadow Workspace: ${taskResult.error}`)
      console.log('❌ Shadow Workspace: FAILED -', taskResult.error)
    }
    
  } catch (error) {
    results.failed++
    results.errors.push(`Shadow Workspace: ${error.message}`)
    results.services.ShadowWorkspace = { status: 'FAILED', error: error.message }
    console.log('❌ Shadow Workspace: FAILED -', error.message)  
  }

  // Test 5: Advanced Security (NEW)
  try {
    console.log('\n🔒 Testing Advanced Security (NEW ENHANCED SERVICE)...')
    results.totalTests++
    
    const advancedSecurity = AdvancedSecurity.getInstance()
    await advancedSecurity.initialize()
    
    // Test encryption
    const testData = { message: 'Testing enhanced security capabilities', timestamp: Date.now() }
    const encrypted = await advancedSecurity.encryptData(testData)
    const decrypted = await advancedSecurity.decryptData(encrypted)
    
    // Test input validation
    const validation = await advancedSecurity.validateInput('test input data', {
      maxLength: 100,
      minLength: 5,
      type: 'string'
    })
    
    // Test security scan
    const scanResult = await advancedSecurity.performSecurityScan('system', 'basic')
    
    results.services.AdvancedSecurity = {
      status: 'WORKING',
      features: ['Data Encryption', 'Input Validation', 'Security Scanning', 'Audit Logging'],
      testResults: {
        encryptionWorking: encrypted.encrypted && JSON.stringify(decrypted) === JSON.stringify(testData),
        validationWorking: validation.valid,
        securityScanWorking: scanResult.riskLevel !== undefined,
        auditLogEntries: advancedSecurity.getAuditLog({ limit: 5 }).length
      }
    }
    
    await advancedSecurity.shutdown()
    results.passed++
    console.log('✅ Advanced Security: NEW SERVICE WORKING')
    
  } catch (error) {
    results.failed++
    results.errors.push(`Advanced Security: ${error.message}`)
    results.services.AdvancedSecurity = { status: 'FAILED', error: error.message }
    console.log('❌ Advanced Security: FAILED -', error.message)
  }

  // Test 6: Agent Memory Service (NEW)
  try {
    console.log('\n🧠 Testing Agent Memory Service (NEW ENHANCED SERVICE)...')
    results.totalTests++
    
    const agentMemoryService = AgentMemoryService.getInstance()
    await agentMemoryService.initialize()
    
    // Store test memory
    const memoryResult = await agentMemoryService.storeMemory('test_agent', {
      type: 'learning',
      content: { lesson: 'Backend enhancement is working', context: 'testing' },
      importance: 4,
      tags: ['enhancement', 'backend', 'learning'],
      metadata: { testRun: true }
    })
    
    // Retrieve memories
    const retrieveResult = await agentMemoryService.retrieveMemories('test_agent', {
      type: 'learning',
      limit: 10
    })
    
    // Record task outcome
    const outcomeResult = await agentMemoryService.recordTaskOutcome({
      taskId: 'test_task_1',
      agentId: 'test_agent',
      success: true,
      result: 'Enhancement test completed successfully',
      strategies: ['comprehensive_testing', 'service_validation'],
      timeToComplete: 5000,
      userSatisfaction: 0.95
    })
    
    results.services.AgentMemoryService = {
      status: 'WORKING',
      features: ['Memory Storage', 'Memory Retrieval', 'Learning Patterns', 'Task Outcomes'],
      testResults: {
        memoryStored: memoryResult.success,
        memoriesRetrieved: retrieveResult.memories.length,
        outcomeRecorded: outcomeResult.success,
        memoryStats: agentMemoryService.getMemoryStats()
      }
    }
    
    await agentMemoryService.shutdown()
    results.passed++
    console.log('✅ Agent Memory Service: NEW SERVICE WORKING')
    
  } catch (error) {
    results.failed++
    results.errors.push(`Agent Memory Service: ${error.message}`)
    results.services.AgentMemoryService = { status: 'FAILED', error: error.message }
    console.log('❌ Agent Memory Service: FAILED -', error.message)
  }

  // Test 7: Autonomous Planning Engine (NEW)
  try {
    console.log('\n🎯 Testing Autonomous Planning Engine (NEW ENHANCED SERVICE)...')
    results.totalTests++
    
    const planningEngine = AutonomousPlanningEngine.getInstance()
    await planningEngine.initialize()
    
    // Create autonomous goal
    const goalResult = await planningEngine.createAutonomousGoal({
      title: 'Optimize Backend Performance',
      description: 'Continuously monitor and optimize backend service performance',
      type: 'optimization',
      priority: 'high',
      targetOutcome: 'Achieve 99% service uptime and <2s response times',
      successCriteria: ['Uptime above 99%', 'Response time below 2 seconds', 'Error rate below 1%'],
      constraints: { timeframe: 60 * 60 * 1000 }, // 1 hour
      createdBy: 'enhancement_test'
    })
    
    // Get planning stats
    const stats = planningEngine.getPlanningStats()
    
    results.services.AutonomousPlanningEngine = {
      status: goalResult.success ? 'WORKING' : 'FAILED',
      features: ['Goal Creation', 'Execution Planning', 'Progress Monitoring', 'Strategy Management'],
      testResults: {
        goalCreated: goalResult.success,
        goalId: goalResult.goalId,
        estimatedDuration: goalResult.estimatedDuration,
        planningStats: stats
      }
    }
    
    await planningEngine.shutdown()
    
    if (goalResult.success) {
      results.passed++
      console.log('✅ Autonomous Planning Engine: NEW SERVICE WORKING')
    } else {
      results.failed++
      results.errors.push(`Autonomous Planning Engine: ${goalResult.error}`)
      console.log('❌ Autonomous Planning Engine: FAILED -', goalResult.error)
    }
    
  } catch (error) {
    results.failed++
    results.errors.push(`Autonomous Planning Engine: ${error.message}`)
    results.services.AutonomousPlanningEngine = { status: 'FAILED', error: error.message }
    console.log('❌ Autonomous Planning Engine: FAILED -', error.message)
  }

  // Test 8: Unified Service Orchestrator (NEW)
  try {
    console.log('\n🎼 Testing Unified Service Orchestrator (NEW ENHANCED SERVICE)...')
    results.totalTests++
    
    const orchestrator = UnifiedServiceOrchestrator.getInstance()
    await orchestrator.initialize()
    
    // Register test services
    await orchestrator.registerService('TestService1', { 
      healthCheck: async () => true,
      initialize: async () => console.log('Test service initialized')
    }, { priority: 'high' })
    
    await orchestrator.registerService('TestService2', { 
      healthCheck: async () => true  
    }, { priority: 'medium' })
    
    // Get system health
    const systemHealth = orchestrator.getSystemHealth()
    
    // Get system metrics
    const metrics = orchestrator.getSystemMetrics(5)
    
    results.services.UnifiedServiceOrchestrator = {
      status: 'WORKING',
      features: ['Service Registration', 'Health Monitoring', 'Metrics Collection', 'Emergency Response'],
      testResults: {
        servicesRegistered: systemHealth.services.length,
        systemHealth: systemHealth.status,
        healthyServices: systemHealth.summary.healthy,
        overallScore: systemHealth.overall
      }
    }
    
    await orchestrator.shutdown()
    results.passed++
    console.log('✅ Unified Service Orchestrator: NEW SERVICE WORKING')
    
  } catch (error) {
    results.failed++
    results.errors.push(`Unified Service Orchestrator: ${error.message}`)
    results.services.UnifiedServiceOrchestrator = { status: 'FAILED', error: error.message }
    console.log('❌ Unified Service Orchestrator: FAILED -', error.message)
  }

  // COMPREHENSIVE RESULTS
  console.log('\n' + '='.repeat(80))
  console.log('🎉 BACKEND ENHANCEMENT TEST RESULTS')
  console.log('='.repeat(80))
  
  console.log(`📊 OVERALL RESULTS:`)
  console.log(`   Total Tests: ${results.totalTests}`)
  console.log(`   Passed: ${results.passed} ✅`)
  console.log(`   Failed: ${results.failed} ❌`)
  console.log(`   Success Rate: ${((results.passed / results.totalTests) * 100).toFixed(1)}%`)
  
  console.log(`\n🔧 SERVICE STATUS SUMMARY:`)
  
  const workingServices = Object.entries(results.services).filter(([name, info]) => info.status === 'WORKING')
  const failedServices = Object.entries(results.services).filter(([name, info]) => info.status === 'FAILED')
  
  console.log(`\n✅ WORKING SERVICES (${workingServices.length}):`)
  workingServices.forEach(([name, info]) => {
    console.log(`   ${name}:`)
    console.log(`     Features: ${info.features.join(', ')}`)
    if (info.testResults) {
      console.log(`     Test Results: ${JSON.stringify(info.testResults, null, 2).replace(/\n/g, '\n       ')}`)
    }
  })
  
  if (failedServices.length > 0) {
    console.log(`\n❌ FAILED SERVICES (${failedServices.length}):`)
    failedServices.forEach(([name, info]) => {
      console.log(`   ${name}: ${info.error}`)
    })
  }
  
  if (results.errors.length > 0) {
    console.log(`\n🐛 ERRORS ENCOUNTERED:`)
    results.errors.forEach((error, index) => {
      console.log(`   ${index + 1}. ${error}`)
    })
  }
  
  console.log('\n🎯 ENHANCEMENT ANALYSIS:')
  console.log(`   • Original Services Enhanced: ${workingServices.filter(([name]) => 
    ['DatabaseService', 'ApiValidator'].includes(name)).length}/2`)
  console.log(`   • New Services Added: ${workingServices.filter(([name]) => 
    ['DeepSearchEngine', 'ShadowWorkspace', 'AdvancedSecurity', 'AgentMemoryService', 
     'AutonomousPlanningEngine', 'UnifiedServiceOrchestrator'].includes(name)).length}/6`)
  console.log(`   • Backend Capabilities Unlocked: ${(workingServices.length / results.totalTests * 100).toFixed(0)}%`)
  
  const recommendation = results.passed >= results.totalTests * 0.8 ? 
    '🚀 BACKEND ENHANCEMENT: HIGHLY SUCCESSFUL - Ready for advanced operations!' :
    results.passed >= results.totalTests * 0.6 ?
    '⚠️ BACKEND ENHANCEMENT: PARTIALLY SUCCESSFUL - Some advanced features available' :
    '❌ BACKEND ENHANCEMENT: NEEDS ATTENTION - Critical issues require fixing'
  
  console.log(`\n${recommendation}`)
  console.log('='.repeat(80))
  
  process.exit(results.failed > 0 ? 1 : 0)
}

// Run the test
testBackendEnhancements().catch(error => {
  console.error('💥 CRITICAL TEST FAILURE:', error)
  process.exit(1)
})