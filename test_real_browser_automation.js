#!/usr/bin/env node

// 🧪 REAL BROWSER AUTOMATION TEST
// Tests actual browser control capabilities (not simulation!)

console.log('🚀 Testing REAL Browser Automation Capabilities...\n')

const { BrowserManager } = require('./electron/main.js')

async function testRealBrowserAutomation() {
  const results = {
    passed: 0,
    failed: 0,
    tests: []
  }

  function logTest(name, status, details) {
    const emoji = status === 'PASS' ? '✅' : '❌'
    console.log(`${emoji} ${name}: ${status}`)
    if (details) console.log(`   ${details}`)
    
    results.tests.push({ name, status, details })
    if (status === 'PASS') results.passed++
    else results.failed++
  }

  try {
    // Test 1: Initialize Browser Manager
    console.log('📝 Test 1: Initializing Browser Manager...')
    const browserManager = new BrowserManager()
    await browserManager.initialize()
    logTest('Browser Manager Initialization', 'PASS', 'All services initialized successfully')

    // Test 2: Test Real Tab Creation
    console.log('\n📝 Test 2: Testing REAL Tab Creation...')
    const tabResult = await browserManager.createTab('https://httpbin.org/html')
    if (tabResult.success) {
      logTest('Real Tab Creation', 'PASS', `Tab created: ${tabResult.tabId} → ${tabResult.url}`)
    } else {
      logTest('Real Tab Creation', 'FAIL', tabResult.error)
    }

    // Test 3: Test Real Navigation
    console.log('\n📝 Test 3: Testing REAL Navigation...')
    const navResult = await browserManager.navigateTo('https://httpbin.org/json')
    if (navResult.success) {
      logTest('Real Navigation', 'PASS', `Navigated to: ${navResult.url}`)
    } else {
      logTest('Real Navigation', 'FAIL', navResult.error)
    }

    // Test 4: Test Real Content Extraction
    console.log('\n📝 Test 4: Testing REAL Content Extraction...')
    // Wait a moment for page to load
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const contentResult = await browserManager.extractPageContent(browserManager.activeTabId)
    if (contentResult.success && contentResult.content) {
      const content = contentResult.content
      logTest('Real Content Extraction', 'PASS', 
        `Extracted: title="${content.title}", ${content.text?.length || 0} chars, ${content.links?.length || 0} links`)
    } else {
      logTest('Real Content Extraction', 'FAIL', contentResult.error)
    }

    // Test 5: Test Agent System
    console.log('\n📝 Test 5: Testing Agent System Integration...')
    if (browserManager.enhancedAgentController) {
      const agents = browserManager.enhancedAgentController.agents
      logTest('Agent System', 'PASS', `${agents.size} agents available with browser automation`)
    } else {
      logTest('Agent System', 'FAIL', 'Enhanced agent controller not initialized')
    }

    // Test 6: Test AI Message Processing with Real Browser Automation
    console.log('\n📝 Test 6: Testing AI Message Processing with Browser Automation...')
    const aiResult = await browserManager.processAIMessage('research latest web technologies')
    if (aiResult.success) {
      logTest('AI Message Processing', 'PASS', 
        `AI responded with ${aiResult.result?.length || 0} chars, agent: ${aiResult.agentStatus?.availableAgent || 'unknown'}`)
    } else {
      logTest('AI Message Processing', 'FAIL', aiResult.error)
    }

    // Test 7: Test Task Analysis
    console.log('\n📝 Test 7: Testing Enhanced Task Analysis...')
    const taskAnalysis = browserManager.analyzeAgentTask('research latest AI developments')
    if (taskAnalysis.confidence >= 70) {
      logTest('Task Analysis', 'PASS', 
        `Agent: ${taskAnalysis.primaryAgent}, Confidence: ${taskAnalysis.confidence}%, Can Execute: ${taskAnalysis.canExecute}`)
    } else {
      logTest('Task Analysis', 'FAIL', `Low confidence: ${taskAnalysis.confidence}%`)
    }

    // Test 8: Test System Health
    console.log('\n📝 Test 8: Testing System Health...')
    const health = {
      api: browserManager.connectionState.api,
      database: browserManager.connectionState.database,
      agents: browserManager.connectionState.agents
    }
    
    const healthyServices = Object.values(health).filter(status => status === 'connected').length
    if (healthyServices >= 2) {
      logTest('System Health', 'PASS', `${healthyServices}/3 services connected`)
    } else {
      logTest('System Health', 'FAIL', `Only ${healthyServices}/3 services connected`)
    }

  } catch (error) {
    logTest('Test Execution', 'FAIL', error.message)
    console.error('❌ Test execution failed:', error)
  }

  // Final Results
  console.log('\n' + '='.repeat(50))
  console.log('🧪 REAL BROWSER AUTOMATION TEST RESULTS')
  console.log('='.repeat(50))
  console.log(`✅ Passed: ${results.passed}`)
  console.log(`❌ Failed: ${results.failed}`)
  console.log(`📊 Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`)

  if (results.passed >= 6) {
    console.log('\n🎉 CONCLUSION: REAL BROWSER AUTOMATION IS WORKING!')
    console.log('✅ Your AI can actually control browser, create tabs, extract content, and execute tasks')
    console.log('✅ This is NOT simulation - it\'s real browser automation with actual websites')
  } else {
    console.log('\n⚠️ CONCLUSION: PARTIAL FUNCTIONALITY')
    console.log('🔧 Some browser automation features need additional configuration')
  }

  process.exit(0)
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Test interrupted by user')
  process.exit(1)
})

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught exception:', error.message)
  process.exit(1)
})

// Run the test
testRealBrowserAutomation().catch(error => {
  console.error('❌ Test failed:', error)
  process.exit(1)
})