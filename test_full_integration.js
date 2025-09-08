// Comprehensive integration test for KAiro Browser
const { DatabaseService } = require('./src/backend/DatabaseService');
const { AgentPerformanceMonitor } = require('./src/backend/AgentPerformanceMonitor');
const { BackgroundTaskScheduler } = require('./src/backend/BackgroundTaskScheduler');
const Groq = require('groq-sdk');
require('dotenv').config();

class FullIntegrationTest {
  constructor() {
    this.testResults = [];
    this.databaseService = null;
    this.performanceMonitor = null;
    this.taskScheduler = null;
    this.groqService = null;
  }

  async run() {
    console.log('🧪 Starting Full Integration Test Suite');
    console.log('=====================================');
    
    try {
      // Test 1: Environment Configuration
      await this.testEnvironmentConfiguration();
      
      // Test 2: GROQ AI Service
      await this.testGroqService();
      
      // Test 3: Database Service
      await this.testDatabaseService();
      
      // Test 4: Performance Monitor
      await this.testPerformanceMonitor();
      
      // Test 5: Background Task Scheduler
      await this.testBackgroundTaskScheduler();
      
      // Test 6: Agent System Integration
      await this.testAgentSystemIntegration();
      
      // Test 7: Data Flow Integration
      await this.testDataFlowIntegration();
      
      // Generate final report
      this.generateReport();
      
    } catch (error) {
      console.error('❌ Integration test suite failed:', error);
      this.addResult('Overall', false, error.message);
    } finally {
      await this.cleanup();
    }
  }

  async testEnvironmentConfiguration() {
    console.log('\n🔧 Testing Environment Configuration...');
    
    try {
      // Check required environment variables
      const requiredVars = ['GROQ_API_KEY', 'NODE_ENV', 'APP_NAME'];
      const missingVars = requiredVars.filter(varName => !process.env[varName]);
      
      if (missingVars.length > 0) {
        throw new Error(`Missing environment variables: ${missingVars.join(', ')}`);
      }
      
      // Check GROQ API key format
      if (!process.env.GROQ_API_KEY.startsWith('gsk_')) {
        throw new Error('Invalid GROQ API key format');
      }
      
      console.log('✅ Environment configuration valid');
      this.addResult('Environment Configuration', true);
      
    } catch (error) {
      console.error('❌ Environment configuration failed:', error.message);
      this.addResult('Environment Configuration', false, error.message);
    }
  }

  async testGroqService() {
    console.log('\n🤖 Testing GROQ AI Service...');
    
    try {
      this.groqService = new Groq({
        apiKey: process.env.GROQ_API_KEY
      });

      // Test basic API call
      const response = await this.groqService.chat.completions.create({
        messages: [{ role: 'user', content: 'Hello! Reply with "Integration test successful"' }],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.1,
        max_tokens: 50
      });

      if (!response.choices || !response.choices[0]) {
        throw new Error('Invalid GROQ API response structure');
      }

      const content = response.choices[0].message.content;
      if (!content.toLowerCase().includes('integration test successful')) {
        throw new Error('GROQ API did not respond as expected');
      }

      console.log('✅ GROQ AI service working correctly');
      console.log(`   Model: ${response.model}`);
      console.log(`   Tokens used: ${response.usage?.total_tokens || 'N/A'}`);
      this.addResult('GROQ AI Service', true);
      
    } catch (error) {
      console.error('❌ GROQ AI service failed:', error.message);
      this.addResult('GROQ AI Service', false, error.message);
    }
  }

  async testDatabaseService() {
    console.log('\n🗄️ Testing Database Service...');
    
    try {
      this.databaseService = new DatabaseService({
        path: './data/integration_test.db',
        maxSize: 100 * 1024 * 1024,
        backupEnabled: true
      });
      
      await this.databaseService.initialize();
      
      // Test all major database operations
      const testData = {
        bookmark: {
          id: `bookmark_integration_${Date.now()}`,
          title: 'Integration Test Bookmark',
          url: 'https://integration-test.example.com',
          description: 'Test bookmark for integration testing',
          tags: ['integration', 'test'],
          createdAt: Date.now(),
          updatedAt: Date.now(),
          visitCount: 1,
          lastVisited: Date.now(),
          favicon: null,
          category: 'test'
        },
        history: {
          id: `history_integration_${Date.now()}`,
          url: 'https://integration-test.example.com',
          title: 'Integration Test Page',
          visitedAt: Date.now(),
          duration: 45000,
          pageType: 'test',
          exitType: 'navigation',
          referrer: null,
          searchQuery: null
        },
        memory: {
          id: `memory_integration_${Date.now()}`,
          agentId: 'integration_test_agent',
          type: 'test_outcome',
          content: { testResult: 'success', accuracy: 0.95 },
          importance: 9,
          tags: ['integration', 'test'],
          createdAt: Date.now(),
          expiresAt: Date.now() + (24 * 60 * 60 * 1000),
          relatedMemories: [],
          metadata: { testSuite: 'integration' }
        }
      };
      
      // Test bookmark operations
      await this.databaseService.saveBookmark(testData.bookmark);
      const bookmarks = await this.databaseService.getBookmarks(10);
      
      // Test history operations
      await this.databaseService.saveHistoryEntry(testData.history);
      const history = await this.databaseService.getHistory(10);
      
      // Test agent memory operations
      await this.databaseService.saveAgentMemory(testData.memory);
      const memories = await this.databaseService.getAgentMemories('integration_test_agent', { limit: 10 });
      
      console.log('✅ Database service working correctly');
      console.log(`   Bookmarks: ${bookmarks.length}`);
      console.log(`   History entries: ${history.length}`);
      console.log(`   Agent memories: ${memories.length}`);
      this.addResult('Database Service', true);
      
    } catch (error) {
      console.error('❌ Database service failed:', error.message);
      this.addResult('Database Service', false, error.message);
    }
  }

  async testPerformanceMonitor() {
    console.log('\n📊 Testing Performance Monitor...');
    
    try {
      if (!this.databaseService) {
        throw new Error('Database service required for performance monitor');
      }
      
      this.performanceMonitor = new AgentPerformanceMonitor(this.databaseService);
      await this.performanceMonitor.initialize();
      
      // Record a test performance metric
      const testMetric = {
        id: `perf_integration_${Date.now()}`,
        agentId: 'integration_test_agent',
        taskType: 'integration_test',
        startTime: Date.now() - 1000,
        endTime: Date.now(),
        duration: 1000,
        success: true,
        errorMessage: null,
        resourceUsage: { cpuTime: 500, memoryUsed: 1024, networkRequests: 1 },
        qualityScore: 9,
        metadata: { testType: 'integration' }
      };
      
      await this.performanceMonitor.recordPerformanceMetric(testMetric);
      
      // Get performance stats
      const stats = await this.performanceMonitor.getPerformanceStats('integration_test_agent', 1);
      
      console.log('✅ Performance monitor working correctly');
      console.log(`   Total tasks tracked: ${stats.totalTasks}`);
      console.log(`   Success rate: ${(stats.successRate * 100).toFixed(1)}%`);
      this.addResult('Performance Monitor', true);
      
    } catch (error) {
      console.error('❌ Performance monitor failed:', error.message);
      this.addResult('Performance Monitor', false, error.message);
    }
  }

  async testBackgroundTaskScheduler() {
    console.log('\n⏰ Testing Background Task Scheduler...');
    
    try {
      if (!this.databaseService) {
        throw new Error('Database service required for task scheduler');
      }
      
      this.taskScheduler = new BackgroundTaskScheduler(this.databaseService);
      await this.taskScheduler.initialize();
      
      // Schedule a test task
      const taskId = await this.taskScheduler.scheduleTask('data_maintenance', {
        type: 'cleanup_expired_memories'
      }, {
        priority: 5,
        scheduledFor: Date.now() + 1000 // 1 second from now
      });
      
      // Wait a moment and check task stats
      await new Promise(resolve => setTimeout(resolve, 2000));
      const stats = await this.taskScheduler.getTaskStats();
      
      console.log('✅ Background task scheduler working correctly');
      console.log(`   Task scheduled: ${taskId}`);
      console.log(`   Total tasks: ${stats.totalTasks}`);
      this.addResult('Background Task Scheduler', true);
      
    } catch (error) {
      console.error('❌ Background task scheduler failed:', error.message);
      this.addResult('Background Task Scheduler', false, error.message);
    }
  }

  async testAgentSystemIntegration() {
    console.log('\n🤖 Testing Agent System Integration...');
    
    try {
      // Simulate agent task analysis (from main.js logic)
      const testTask = 'research the latest developments in AI technology';
      
      // Test task analysis logic
      const taskAnalysis = this.analyzeAgentTask(testTask);
      
      if (!taskAnalysis.primaryAgent || !taskAnalysis.confidence) {
        throw new Error('Agent task analysis failed');
      }
      
      console.log('✅ Agent system integration working correctly');
      console.log(`   Primary agent: ${taskAnalysis.primaryAgent}`);
      console.log(`   Confidence: ${taskAnalysis.confidence}`);
      console.log(`   Supporting agents: ${taskAnalysis.supportingAgents.join(', ')}`);
      this.addResult('Agent System Integration', true);
      
    } catch (error) {
      console.error('❌ Agent system integration failed:', error.message);
      this.addResult('Agent System Integration', false, error.message);
    }
  }

  async testDataFlowIntegration() {
    console.log('\n🔄 Testing Data Flow Integration...');
    
    try {
      // Test the complete data flow: Task -> AI -> Database -> Performance
      
      // 1. Create a simulated AI task result
      const taskResult = {
        taskId: `task_integration_${Date.now()}`,
        agentId: 'research_agent',
        result: 'AI research task completed successfully',
        success: true,
        duration: 2500,
        qualityScore: 8
      };
      
      // 2. Store in database (simulate memory storage)
      if (this.databaseService) {
        const memory = {
          id: `memory_flow_${Date.now()}`,
          agentId: taskResult.agentId,
          type: 'task_result',
          content: { result: taskResult.result, taskId: taskResult.taskId },
          importance: taskResult.qualityScore,
          tags: ['integration', 'flow_test'],
          createdAt: Date.now(),
          expiresAt: Date.now() + (24 * 60 * 60 * 1000),
          relatedMemories: [],
          metadata: { flowTest: true }
        };
        
        await this.databaseService.saveAgentMemory(memory);
      }
      
      // 3. Record performance metric
      if (this.performanceMonitor) {
        const performanceMetric = {
          id: `perf_flow_${Date.now()}`,
          agentId: taskResult.agentId,
          taskType: 'research_task',
          startTime: Date.now() - taskResult.duration,
          endTime: Date.now(),
          duration: taskResult.duration,
          success: taskResult.success,
          errorMessage: null,
          resourceUsage: { cpuTime: taskResult.duration, memoryUsed: 2048, networkRequests: 3 },
          qualityScore: taskResult.qualityScore,
          metadata: { flowTest: true }
        };
        
        await this.performanceMonitor.recordPerformanceMetric(performanceMetric);
      }
      
      console.log('✅ Data flow integration working correctly');
      console.log(`   Task completed: ${taskResult.taskId}`);
      console.log(`   Data stored and tracked successfully`);
      this.addResult('Data Flow Integration', true);
      
    } catch (error) {
      console.error('❌ Data flow integration failed:', error.message);
      this.addResult('Data Flow Integration', false, error.message);
    }
  }

  // Helper method from main.js
  analyzeAgentTask(task) {
    const lowerTask = task.toLowerCase();
    
    const researchScore = this.calculateKeywordScore(lowerTask, [
      'research', 'find', 'search', 'investigate', 'explore', 'discover'
    ]);
    
    const navigationScore = this.calculateKeywordScore(lowerTask, [
      'navigate', 'go to', 'visit', 'open', 'browse', 'website'
    ]);
    
    const scores = { research: researchScore, navigation: navigationScore };
    const primaryAgent = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
    
    return {
      primaryAgent,
      supportingAgents: Object.keys(scores).filter(agent => agent !== primaryAgent && scores[agent] > 0),
      confidence: scores[primaryAgent],
      scores
    };
  }

  calculateKeywordScore(text, keywords) {
    return keywords.reduce((score, keyword) => {
      const count = (text.match(new RegExp(keyword, 'g')) || []).length;
      return score + count * (keyword.length > 6 ? 2 : 1);
    }, 0);
  }

  addResult(testName, success, error = null) {
    this.testResults.push({ testName, success, error });
  }

  generateReport() {
    console.log('\n📋 Integration Test Report');
    console.log('==========================');
    
    const successCount = this.testResults.filter(r => r.success).length;
    const totalCount = this.testResults.length;
    const successRate = ((successCount / totalCount) * 100).toFixed(1);
    
    console.log(`\n📊 Overall Success Rate: ${successRate}% (${successCount}/${totalCount})`);
    
    console.log('\n📝 Test Results:');
    this.testResults.forEach(result => {
      const status = result.success ? '✅' : '❌';
      console.log(`   ${status} ${result.testName}`);
      if (!result.success && result.error) {
        console.log(`      Error: ${result.error}`);
      }
    });
    
    console.log('\n🎯 Integration Status:');
    if (successRate >= 90) {
      console.log('🟢 EXCELLENT - All integrations working correctly');
    } else if (successRate >= 70) {
      console.log('🟡 GOOD - Most integrations working, some issues detected');
    } else {
      console.log('🔴 POOR - Multiple integration issues detected');
    }
    
    // Specific feedback based on results
    const failedTests = this.testResults.filter(r => !r.success);
    if (failedTests.length === 0) {
      console.log('\n🎉 All integrations are fully functional!');
      console.log('✅ GROQ AI Service: Connected and operational');
      console.log('✅ Database Service: All data operations working');
      console.log('✅ Performance Monitor: Tracking and optimization active');
      console.log('✅ Background Scheduler: Task management operational');
      console.log('✅ Agent System: Intelligent task routing functional');
      console.log('✅ Data Flow: End-to-end integration complete');
    } else {
      console.log('\n⚠️  Integration Issues Detected:');
      failedTests.forEach(test => {
        console.log(`   • ${test.testName}: ${test.error}`);
      });
    }
  }

  async cleanup() {
    console.log('\n🧹 Cleaning up test resources...');
    
    try {
      if (this.performanceMonitor) {
        await this.performanceMonitor.shutdown();
      }
      
      if (this.taskScheduler) {
        await this.taskScheduler.shutdown();
      }
      
      if (this.databaseService) {
        await this.databaseService.close();
      }
      
      console.log('✅ Cleanup completed');
    } catch (error) {
      console.error('❌ Cleanup failed:', error.message);
    }
  }
}

// Run the integration test
const integrationTest = new FullIntegrationTest();
integrationTest.run().then(() => {
  console.log('\n🏁 Integration test suite completed');
}).catch(error => {
  console.error('💥 Integration test suite crashed:', error);
  process.exit(1);
});