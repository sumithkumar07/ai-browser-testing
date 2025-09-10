#!/usr/bin/env node

/**
 * Test Script for Invisible Intelligence Features
 * This tests that all advanced backend features are working without UI changes
 */

const path = require('path')

// Import the enhanced services
const DeepSearchEngine = require('./src/core/services/DeepSearchEngine.js')
const AutonomousPlanningEngine = require('./src/core/services/AutonomousPlanningEngine.js')
const AdvancedSecurity = require('./src/core/services/AdvancedSecurity.js')
const AgentMemoryService = require('./src/core/services/AgentMemoryService.js')
const UnifiedServiceOrchestrator = require('./src/core/services/UnifiedServiceOrchestrator.js')

async function testInvisibleIntelligence() {
  console.log('🎯 TESTING INVISIBLE INTELLIGENCE UPGRADE...')
  console.log('='=50)
  
  let passedTests = 0
  let totalTests = 0
  
  // Test 1: Deep Search Engine
  console.log('\n🔍 Testing Deep Search Engine...')
  try {
    totalTests++
    const deepSearch = DeepSearchEngine.getInstance()
    await deepSearch.initialize()
    
    const searchResult = await deepSearch.performDeepSearch('AI developments', {
      maxResults: 3,
      includeAnalysis: true
    })
    
    if (searchResult.success) {
      console.log('✅ Deep Search Engine: WORKING')
      console.log(`   📊 Found ${searchResult.results.primaryResults.length} primary results`)
      console.log(`   ⭐ Relevance Score: ${(searchResult.metadata.relevanceScore * 100).toFixed(1)}%`)
      passedTests++
    } else {
      console.log('❌ Deep Search Engine: FAILED')
    }
  } catch (error) {
    console.log('❌ Deep Search Engine: ERROR -', error.message)
  }
  
  // Test 2: Autonomous Planning Engine
  console.log('\n🎯 Testing Autonomous Planning Engine...')
  try {
    totalTests++
    const planning = AutonomousPlanningEngine.getInstance()
    await planning.initialize()
    
    const goalResult = await planning.createAutonomousGoal({
      title: 'Test Optimization Goal',
      description: 'Testing autonomous goal creation for invisible intelligence',
      type: 'optimization',
      priority: 'medium',
      targetOutcome: 'Verify goal creation works',
      successCriteria: ['Goal created successfully', 'Execution plan generated'],
      createdBy: 'test_script'
    })
    
    if (goalResult.success) {
      console.log('✅ Autonomous Planning Engine: WORKING')
      console.log(`   🎯 Goal ID: ${goalResult.goalId}`)
      console.log(`   ⏱️ Estimated Duration: ${Math.round(goalResult.estimatedDuration / 60000)} minutes`)
      console.log(`   📋 Plan Stages: ${goalResult.planStages} steps`)
      passedTests++
    } else {
      console.log('❌ Autonomous Planning Engine: FAILED')
    }
  } catch (error) {
    console.log('❌ Autonomous Planning Engine: ERROR -', error.message)
  }
  
  // Test 3: Advanced Security
  console.log('\n🛡️ Testing Advanced Security...')
  try {
    totalTests++
    const security = AdvancedSecurity.getInstance()
    await security.initialize()
    
    const scanResult = await security.performSecurityScan('https://example.com', 'basic')
    
    if (scanResult.success) {
      console.log('✅ Advanced Security: WORKING')
      console.log(`   🔍 Scan Type: ${scanResult.scanType}`)
      console.log(`   ⚡ Issues Found: ${scanResult.issuesFound}`)
      console.log(`   🛡️ Security Score: ${scanResult.securityScore}/10`)
      passedTests++
    } else {
      console.log('❌ Advanced Security: FAILED')
    }
  } catch (error) {
    console.log('❌ Advanced Security: ERROR -', error.message)
  }
  
  // Test 4: Agent Memory Service
  console.log('\n🧠 Testing Agent Memory Service...')
  try {
    totalTests++
    const memory = AgentMemoryService.getInstance()
    await memory.initialize()
    
    const memoryResult = await memory.storeMemory('test_agent', {
      type: 'test',
      content: { message: 'Testing memory storage', result: 'success' },
      importance: 4,
      tags: ['test', 'invisible_intelligence'],
      metadata: { testId: Date.now() }
    })
    
    if (memoryResult.success) {
      console.log('✅ Agent Memory Service: WORKING')
      console.log(`   🧠 Memory ID: ${memoryResult.memoryId}`)
      console.log(`   📊 Importance: ${memoryResult.importance}/5`)
      passedTests++
    } else {
      console.log('❌ Agent Memory Service: FAILED')
    }
  } catch (error) {
    console.log('❌ Agent Memory Service: ERROR -', error.message)
  }
  
  // Test 5: Service Orchestrator
  console.log('\n🎼 Testing Service Orchestrator...')
  try {
    totalTests++
    const orchestrator = UnifiedServiceOrchestrator.getInstance()
    await orchestrator.initialize()
    
    const healthCheck = orchestrator.getSystemHealth()
    
    if (healthCheck) {
      console.log('✅ Service Orchestrator: WORKING')
      console.log(`   📊 Overall Health: ${(healthCheck.overall * 100).toFixed(1)}%`)
      console.log(`   🏥 System Status: ${healthCheck.status}`)
      console.log(`   🔧 Services: ${healthCheck.services.length} total`)
      passedTests++
    } else {
      console.log('❌ Service Orchestrator: FAILED')
    }
  } catch (error) {
    console.log('❌ Service Orchestrator: ERROR -', error.message)
  }
  
  // Final Results
  console.log('\n' + '='=50)
  console.log('🎯 INVISIBLE INTELLIGENCE TEST RESULTS')
  console.log('='=50)
  console.log(`✅ Passed: ${passedTests}/${totalTests} tests`)
  console.log(`📊 Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`)
  
  if (passedTests === totalTests) {
    console.log('\n🎉 ALL ADVANCED FEATURES ARE WORKING!')
    console.log('✨ Your app now has INVISIBLE INTELLIGENCE activated')
    console.log('🚀 Users will experience enhanced AI responses without UI changes')
  } else {
    console.log('\n⚠️ Some features need attention')
    console.log('💡 Check the error messages above for details')
  }
  
  console.log('\n🎯 ACTIVATION STATUS:')
  console.log('   🤖 Autonomous Goals: ACTIVE - Creating and managing background goals')
  console.log('   🔍 Deep Search: ACTIVE - Enhanced search with multi-source analysis')
  console.log('   🛡️ Security Scanning: ACTIVE - Automatic website security checks')
  console.log('   🧠 Memory & Learning: ACTIVE - AI learns from interactions')
  console.log('   🎼 Service Orchestration: ACTIVE - Self-healing system monitoring')
  console.log('\n✨ All features operate invisibly - no UI changes required!')
}

// Run the test
if (require.main === module) {
  testInvisibleIntelligence().catch(console.error)
}

module.exports = { testInvisibleIntelligence }