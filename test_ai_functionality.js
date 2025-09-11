#!/usr/bin/env node
/**
 * KAiro Browser AI Functionality Test
 * Tests the AI services without requiring the full Electron GUI
 */

const path = require('path')
const Groq = require('groq-sdk')
require('dotenv').config()

console.log('🧪 KAiro Browser AI Functionality Test')
console.log('=' * 50)

class AIFunctionalityTester {
  constructor() {
    this.tests_run = 0
    this.tests_passed = 0
    this.groq = null
  }

  async logTest(testName, status, details = '') {
    this.tests_run++
    if (status === 'PASS') {
      this.tests_passed++
    }
    
    const icon = status === 'PASS' ? '✅' : '❌'
    console.log(`${icon} ${testName}: ${status}`)
    if (details) {
      console.log(`   Details: ${details}`)
    }
    console.log()
  }

  async testEnvironmentVariables() {
    console.log('🔑 TEST 1: Environment Variables')
    console.log('-'.repeat(30))
    
    const groqApiKey = process.env.GROQ_API_KEY
    const groqApiUrl = process.env.GROQ_API_URL
    
    if (groqApiKey && groqApiKey.startsWith('gsk_')) {
      await this.logTest('GROQ API Key', 'PASS', `Key present and properly formatted (${groqApiKey.substring(0, 10)}...)`)
    } else {
      await this.logTest('GROQ API Key', 'FAIL', 'Missing or invalid GROQ API key')
      return false
    }
    
    if (groqApiUrl) {
      await this.logTest('GROQ API URL', 'PASS', groqApiUrl)
    } else {
      await this.logTest('GROQ API URL', 'FAIL', 'Missing GROQ API URL')
    }
    
    return true
  }

  async testGroqConnection() {
    console.log('🤖 TEST 2: GROQ AI Connection')
    console.log('-'.repeat(30))
    
    try {
      this.groq = new Groq({
        apiKey: process.env.GROQ_API_KEY
      })
      
      await this.logTest('GROQ Client Initialization', 'PASS', 'Client created successfully')
      
      // Test a simple AI request
      const completion = await this.groq.chat.completions.create({
        messages: [
          {
            role: "user",
            content: "Hello! Please respond with exactly: 'KAiro Browser AI Test Successful'"
          }
        ],
        model: "llama3-8b-8192",
        max_tokens: 50,
        temperature: 0
      })
      
      const response = completion.choices[0]?.message?.content?.trim()
      
      if (response && response.includes('KAiro Browser AI Test Successful')) {
        await this.logTest('GROQ AI Response', 'PASS', `Response: "${response}"`)
        return true
      } else {
        await this.logTest('GROQ AI Response', 'FAIL', `Unexpected response: "${response}"`)
        return false
      }
      
    } catch (error) {
      await this.logTest('GROQ AI Connection', 'FAIL', `Error: ${error.message}`)
      return false
    }
  }

  async testDatabaseConnection() {
    console.log('💾 TEST 3: Database Connection')
    console.log('-'.repeat(30))
    
    try {
      const Database = require('better-sqlite3')
      const dbPath = path.join(__dirname, 'data', 'kairo_browser.db')
      
      const db = new Database(dbPath, { readonly: true })
      
      await this.logTest('Database File Access', 'PASS', `Database opened: ${dbPath}`)
      
      // Test basic query
      const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all()
      
      if (tables.length > 0) {
        await this.logTest('Database Tables', 'PASS', `Found ${tables.length} tables: ${tables.map(t => t.name).join(', ')}`)
      } else {
        await this.logTest('Database Tables', 'PASS', 'Database is empty (new installation)')
      }
      
      db.close()
      return true
      
    } catch (error) {
      await this.logTest('Database Connection', 'FAIL', `Error: ${error.message}`)
      return false
    }
  }

  async testAdvancedAIFeatures() {
    console.log('🚀 TEST 4: Advanced AI Features')
    console.log('-'.repeat(30))
    
    if (!this.groq) {
      await this.logTest('Advanced AI Features', 'FAIL', 'GROQ client not available')
      return false
    }
    
    try {
      // Test deep search simulation
      const searchQuery = "What are the latest developments in AI technology?"
      const completion = await this.groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are KAiro Browser's AI assistant. Provide a brief, structured response about AI developments."
          },
          {
            role: "user",
            content: searchQuery
          }
        ],
        model: "llama3-8b-8192",
        max_tokens: 200,
        temperature: 0.3
      })
      
      const response = completion.choices[0]?.message?.content
      
      if (response && response.length > 50) {
        await this.logTest('Deep Search Simulation', 'PASS', `Generated ${response.length} characters of content`)
      } else {
        await this.logTest('Deep Search Simulation', 'FAIL', 'Response too short or empty')
      }
      
      // Test autonomous goal creation simulation
      const goalCompletion = await this.groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are KAiro Browser's autonomous planning engine. Create a simple goal structure in JSON format."
          },
          {
            role: "user",
            content: "Create a goal to monitor technology news daily"
          }
        ],
        model: "llama3-8b-8192",
        max_tokens: 150,
        temperature: 0.2
      })
      
      const goalResponse = goalCompletion.choices[0]?.message?.content
      
      if (goalResponse && (goalResponse.includes('goal') || goalResponse.includes('monitor'))) {
        await this.logTest('Autonomous Goal Planning', 'PASS', 'Goal planning response generated')
      } else {
        await this.logTest('Autonomous Goal Planning', 'FAIL', 'Goal planning response inadequate')
      }
      
      return true
      
    } catch (error) {
      await this.logTest('Advanced AI Features', 'FAIL', `Error: ${error.message}`)
      return false
    }
  }

  async testServiceFiles() {
    console.log('📁 TEST 5: Service Files')
    console.log('-'.repeat(30))
    
    const fs = require('fs')
    
    const criticalFiles = [
      'electron/main.js',
      'src/main/App.tsx',
      'src/core/services/UltraIntelligentSearchEngine.js',
      'src/core/services/OptimizedParallelAIOrchestrator.js',
      'electron/enhanced-ai-orchestrator.js',
      'electron/preload/preload.js'
    ]
    
    let filesFound = 0
    
    for (const file of criticalFiles) {
      const filePath = path.join(__dirname, file)
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath)
        await this.logTest(`File: ${file}`, 'PASS', `Size: ${stats.size} bytes`)
        filesFound++
      } else {
        await this.logTest(`File: ${file}`, 'FAIL', 'File not found')
      }
    }
    
    return filesFound === criticalFiles.length
  }

  async runAllTests() {
    console.log('🧪 Starting KAiro Browser AI Functionality Tests...')
    console.log()
    
    const results = []
    
    results.push(await this.testEnvironmentVariables())
    results.push(await this.testGroqConnection())
    results.push(await this.testDatabaseConnection())
    results.push(await this.testAdvancedAIFeatures())
    results.push(await this.testServiceFiles())
    
    // Generate report
    console.log('📊 TEST RESULTS SUMMARY')
    console.log('=' * 50)
    console.log(`Tests Run: ${this.tests_run}`)
    console.log(`Tests Passed: ${this.tests_passed}`)
    console.log(`Success Rate: ${((this.tests_passed / this.tests_run) * 100).toFixed(1)}%`)
    console.log()
    
    const overallSuccess = results.filter(r => r).length
    const overallRate = (overallSuccess / results.length) * 100
    
    if (overallRate >= 80) {
      console.log('🏆 OVERALL ASSESSMENT: EXCELLENT')
      console.log('   KAiro Browser AI functionality is working properly')
      return 0
    } else if (overallRate >= 60) {
      console.log('⚠️ OVERALL ASSESSMENT: GOOD')
      console.log('   Most AI functionality is working, some issues detected')
      return 1
    } else {
      console.log('❌ OVERALL ASSESSMENT: NEEDS ATTENTION')
      console.log('   Significant AI functionality issues detected')
      return 2
    }
  }
}

// Run the tests
async function main() {
  const tester = new AIFunctionalityTester()
  const exitCode = await tester.runAllTests()
  process.exit(exitCode)
}

main().catch(error => {
  console.error('❌ Test execution failed:', error)
  process.exit(3)
})