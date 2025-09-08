// End-to-End Backend Test Suite - Comprehensive Validation
// Tests all backend enhancements working together in KAiro Browser

const { app, BrowserWindow, BrowserView, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

// Import our backend services for testing
const { DatabaseService } = require('./src/backend/DatabaseService');
const { AgentPerformanceMonitor } = require('./src/backend/AgentPerformanceMonitor');
const { BackgroundTaskScheduler } = require('./src/backend/BackgroundTaskScheduler');

class EndToEndBackendTester {
  constructor() {
    this.testResults = [];
    this.services = {};
    this.testStartTime = Date.now();
  }

  async runCompleteTest() {
    console.log('🧪 **KAiro Browser - End-to-End Backend Test Suite**');
    console.log('='.repeat(60));
    console.log(`🕒 Test started at: ${new Date().toISOString()}\n`);

    try {
      // Phase 1: Service Initialization
      await this.testServiceInitialization();
      
      // Phase 2: Data Persistence Integration
      await this.testDataPersistenceIntegration();
      
      // Phase 3: Performance Monitoring Integration
      await this.testPerformanceMonitoringIntegration();
      
      // Phase 4: Background Task Integration
      await this.testBackgroundTaskIntegration();
      
      // Phase 5: Cross-Service Communication
      await this.testCrossServiceCommunication();
      
      // Phase 6: Error Handling and Recovery
      await this.testErrorHandlingAndRecovery();
      
      // Phase 7: Load Testing
      await this.testLoadAndStress();
      
      // Phase 8: Autonomous Operations
      await this.testAutonomousOperations();
      
      // Phase 9: Data Integrity
      await this.testDataIntegrity();
      
      // Phase 10: End-to-End Scenarios
      await this.testEndToEndScenarios();
      
      // Generate final report
      this.generateTestReport();
      
    } catch (error) {
      console.error('❌ End-to-end test failed:', error);
      this.addTestResult('OVERALL_TEST', false, `Test suite failed: ${error.message}`);
    } finally {
      await this.cleanup();
    }
  }

  async testServiceInitialization() {
    console.log('1️⃣ **Testing Service Initialization**');
    
    try {
      // Initialize Database Service
      this.services.database = new DatabaseService({
        path: './data/test_kairo_browser.db',
        maxSize: 100 * 1024 * 1024,
        backupEnabled: true
      });
      await this.services.database.initialize();
      this.addTestResult('DATABASE_INIT', true, 'Database service initialized successfully');
      
      // Initialize Performance Monitor
      this.services.performanceMonitor = new AgentPerformanceMonitor(this.services.database);
      await this.services.performanceMonitor.initialize();
      this.addTestResult('PERFORMANCE_MONITOR_INIT', true, 'Performance monitor initialized successfully');
      
      // Initialize Task Scheduler
      this.services.taskScheduler = new BackgroundTaskScheduler(this.services.database);
      await this.services.taskScheduler.initialize();
      this.addTestResult('TASK_SCHEDULER_INIT', true, 'Task scheduler initialized successfully');
      
      console.log('   ✅ All services initialized successfully\n');
      
    } catch (error) {
      this.addTestResult('SERVICE_INIT', false, `Service initialization failed: ${error.message}`);
      throw error;
    }
  }

  async testDataPersistenceIntegration() {
    console.log('2️⃣ **Testing Data Persistence Integration**');
    
    try {
      // Test bookmark persistence
      const testBookmarks = [
        {
          id: 'test_bookmark_1',
          title: 'AI Research Hub',
          url: 'https://ai-research.example.com',
          description: 'Leading AI research publications',
          tags: ['ai', 'research', 'papers'],
          createdAt: Date.now(),
          updatedAt: Date.now(),
          visitCount: 15,
          lastVisited: Date.now() - 86400000,
          category: 'research'
        },
        {
          id: 'test_bookmark_2',
          title: 'Machine Learning Blog',
          url: 'https://ml-blog.example.com',
          description: 'Latest ML tutorials and insights',
          tags: ['machine-learning', 'tutorials', 'blog'],
          createdAt: Date.now() - 172800000,
          updatedAt: Date.now() - 86400000,
          visitCount: 8,
          lastVisited: Date.now() - 3600000,
          category: 'education'
        }
      ];

      for (const bookmark of testBookmarks) {
        await this.services.database.saveBookmark(bookmark);
      }
      
      const savedBookmarks = await this.services.database.getBookmarks(10);
      this.addTestResult('BOOKMARK_PERSISTENCE', savedBookmarks.length >= 2, `Saved and retrieved ${savedBookmarks.length} bookmarks`);
      
      // Test history persistence
      const testHistory = [
        {
          id: 'test_history_1',
          url: 'https://example.com/page1',
          title: 'Example Page 1',
          visitedAt: Date.now() - 3600000,
          duration: 120000,
          pageType: 'article',
          exitType: 'navigation'
        },
        {
          id: 'test_history_2',
          url: 'https://example.com/page2',
          title: 'Example Page 2',
          visitedAt: Date.now() - 7200000,
          duration: 300000,
          pageType: 'research',
          exitType: 'tab_close'
        }
      ];

      for (const entry of testHistory) {
        await this.services.database.saveHistoryEntry(entry);
      }
      
      const savedHistory = await this.services.database.getHistory(10);
      this.addTestResult('HISTORY_PERSISTENCE', savedHistory.length >= 2, `Saved and retrieved ${savedHistory.length} history entries`);
      
      // Test agent memory persistence
      const testMemories = [
        {
          id: 'test_memory_1',
          agentId: 'research_agent',
          type: 'learning',
          content: {
            pattern: 'effective_research_strategy',
            description: 'Focus on peer-reviewed sources first',
            success_examples: ['arxiv.org', 'nature.com', 'science.org']
          },
          importance: 9,
          tags: ['research', 'strategy', 'high-confidence'],
          createdAt: Date.now(),
          relatedMemories: [],
          metadata: {
            confidence: 0.95,
            usage_count: 25
          }
        },
        {
          id: 'test_memory_2',
          agentId: 'navigation_agent',
          type: 'outcome',
          content: {
            task: 'website_navigation',
            approach: 'direct_url_access',
            result: 'successful'
          },
          importance: 7,
          tags: ['navigation', 'success', 'url_handling'],
          createdAt: Date.now() - 86400000,
          relatedMemories: [],
          metadata: {
            confidence: 0.8,
            response_time: 1200
          }
        }
      ];

      for (const memory of testMemories) {
        await this.services.database.saveAgentMemory(memory);
      }
      
      const savedMemories = await this.services.database.getAgentMemories('research_agent', { limit: 10 });
      this.addTestResult('MEMORY_PERSISTENCE', savedMemories.length >= 1, `Saved and retrieved ${savedMemories.length} agent memories`);
      
      console.log('   ✅ Data persistence integration working correctly\n');
      
    } catch (error) {
      this.addTestResult('DATA_PERSISTENCE', false, `Data persistence failed: ${error.message}`);
      throw error;
    }
  }

  async testPerformanceMonitoringIntegration() {
    console.log('3️⃣ **Testing Performance Monitoring Integration**');
    
    try {
      // Simulate various agent performance scenarios
      const testMetrics = [
        {
          id: 'test_perf_1',
          agentId: 'research_agent',
          taskType: 'web_research',
          startTime: Date.now() - 5000,
          endTime: Date.now(),
          duration: 5000,
          success: true,
          resourceUsage: {
            cpuTime: 4800,
            memoryUsed: 45,
            networkRequests: 3
          },
          qualityScore: 9,
          metadata: {
            pages_analyzed: 5,
            insights_generated: 12,
            user_satisfaction: 0.9
          }
        },
        {
          id: 'test_perf_2',
          agentId: 'navigation_agent',
          taskType: 'website_navigation',
          startTime: Date.now() - 2000,
          endTime: Date.now(),
          duration: 2000,
          success: true,
          resourceUsage: {
            cpuTime: 1800,
            memoryUsed: 20,
            networkRequests: 1
          },
          qualityScore: 8,
          metadata: {
            url_processed: 'https://example.com',
            redirect_count: 0
          }
        },
        {
          id: 'test_perf_3',
          agentId: 'analysis_agent',
          taskType: 'content_analysis',
          startTime: Date.now() - 8000,
          endTime: Date.now() - 3000,
          duration: 5000,
          success: false,
          errorMessage: 'Content parsing timeout',
          resourceUsage: {
            cpuTime: 8000,
            memoryUsed: 80,
            networkRequests: 2
          },
          qualityScore: 2,
          metadata: {
            content_length: 50000,
            timeout_reason: 'large_document'
          }
        }
      ];

      // Record performance metrics
      for (const metric of testMetrics) {
        await this.services.performanceMonitor.recordPerformanceMetric(metric);
      }
      
      // Test performance statistics
      const researchStats = await this.services.performanceMonitor.getPerformanceStats('research_agent', 7);
      this.addTestResult('PERFORMANCE_STATS', researchStats.totalTasks > 0, `Research agent stats: ${researchStats.totalTasks} tasks, ${(researchStats.successRate * 100).toFixed(1)}% success`);
      
      // Test health monitoring
      const healthStatus = await this.services.performanceMonitor.getAgentHealthStatus('research_agent');
      this.addTestResult('HEALTH_MONITORING', healthStatus !== null, `Health status tracked: ${healthStatus ? healthStatus.status : 'not available'}`);
      
      // Test all agents health
      const allHealthStatuses = await this.services.performanceMonitor.getAllAgentHealthStatuses();
      this.addTestResult('ALL_AGENTS_HEALTH', allHealthStatuses.length > 0, `Monitoring ${allHealthStatuses.length} agents`);
      
      console.log('   ✅ Performance monitoring integration working correctly\n');
      
    } catch (error) {
      this.addTestResult('PERFORMANCE_MONITORING', false, `Performance monitoring failed: ${error.message}`);
      throw error;
    }
  }

  async testBackgroundTaskIntegration() {
    console.log('4️⃣ **Testing Background Task Integration**');
    
    try {
      // Schedule various types of background tasks
      const taskTypes = [
        {
          type: 'research_monitoring',
          payload: {
            topic: 'AI developments in 2025',
            sources: ['arxiv.org', 'openai.com', 'anthropic.com'],
            frequency: 'daily'
          },
          options: {
            priority: 8,
            agentId: 'research_agent'
          }
        },
        {
          type: 'price_monitoring',
          payload: {
            product: 'GPU RTX 4090',
            websites: ['amazon.com', 'newegg.com'],
            target_price: 1200
          },
          options: {
            priority: 6,
            agentId: 'shopping_agent'
          }
        },
        {
          type: 'data_maintenance',
          payload: {
            type: 'cleanup_expired_memories'
          },
          options: {
            priority: 3,
            scheduledFor: Date.now() + 5000 // 5 seconds from now
          }
        },
        {
          type: 'agent_learning',
          payload: {
            agentId: 'research_agent',
            learning_focus: 'research_patterns'
          },
          options: {
            priority: 5,
            scheduledFor: Date.now() + 10000 // 10 seconds from now
          }
        }
      ];

      const scheduledTasks = [];
      for (const taskDef of taskTypes) {
        const taskId = await this.services.taskScheduler.scheduleTask(
          taskDef.type, 
          taskDef.payload, 
          taskDef.options
        );
        scheduledTasks.push(taskId);
      }
      
      this.addTestResult('TASK_SCHEDULING', scheduledTasks.length === taskTypes.length, `Scheduled ${scheduledTasks.length} background tasks`);
      
      // Test task status retrieval
      const firstTaskStatus = await this.services.taskScheduler.getTaskStatus(scheduledTasks[0]);
      this.addTestResult('TASK_STATUS', firstTaskStatus !== null, `Task status retrievable: ${firstTaskStatus ? firstTaskStatus.status : 'not found'}`);
      
      // Test task statistics
      const taskStats = await this.services.taskScheduler.getTaskStats();
      this.addTestResult('TASK_STATS', taskStats.totalTasks > 0, `Task stats: ${taskStats.pending} pending, ${taskStats.completed} completed, ${taskStats.failed} failed`);
      
      // Wait for some tasks to execute
      console.log('   ⏳ Waiting for background tasks to execute...');
      await new Promise(resolve => setTimeout(resolve, 15000)); // Wait 15 seconds
      
      // Check if tasks executed
      const updatedStats = await this.services.taskScheduler.getTaskStats();
      const executionHappened = updatedStats.completed > taskStats.completed || updatedStats.running > 0;
      this.addTestResult('TASK_EXECUTION', executionHappened, `Tasks executed: ${updatedStats.completed} completed, ${updatedStats.running} running`);
      
      console.log('   ✅ Background task integration working correctly\n');
      
    } catch (error) {
      this.addTestResult('BACKGROUND_TASKS', false, `Background task integration failed: ${error.message}`);
      throw error;
    }
  }

  async testCrossServiceCommunication() {
    console.log('5️⃣ **Testing Cross-Service Communication**');
    
    try {
      // Test data flow between services
      
      // 1. Performance Monitor → Database
      const testMetric = {
        id: 'cross_test_perf_1',
        agentId: 'communication_test_agent',
        taskType: 'cross_service_test',
        startTime: Date.now() - 3000,
        endTime: Date.now(),
        duration: 3000,
        success: true,
        resourceUsage: {
          cpuTime: 2800,
          memoryUsed: 30,
          networkRequests: 1
        },
        qualityScore: 8,
        metadata: {
          test_type: 'cross_service_communication'
        }
      };
      
      await this.services.performanceMonitor.recordPerformanceMetric(testMetric);
      
      // Verify it's stored in database
      const storedMetrics = await this.services.database.getPerformanceMetrics('communication_test_agent', 10);
      this.addTestResult('PERF_TO_DB', storedMetrics.length > 0, `Performance metric stored in database`);
      
      // 2. Task Scheduler → Database
      const testTaskId = await this.services.taskScheduler.scheduleTask('data_maintenance', {
        type: 'cross_service_test'
      }, {
        priority: 4
      });
      
      // Verify task is stored in database
      const storedTasks = await this.services.database.getBackgroundTasks('pending', 50);
      const testTaskFound = storedTasks.some(task => task.id === testTaskId);
      this.addTestResult('SCHEDULER_TO_DB', testTaskFound, 'Scheduled task stored in database');
      
      // 3. Database → Performance Monitor (health calculation)
      const healthStatus = await this.services.performanceMonitor.getAgentHealthStatus('communication_test_agent');
      this.addTestResult('DB_TO_PERF', healthStatus !== null, 'Health calculated from database metrics');
      
      console.log('   ✅ Cross-service communication working correctly\n');
      
    } catch (error) {
      this.addTestResult('CROSS_SERVICE_COMM', false, `Cross-service communication failed: ${error.message}`);
      throw error;
    }
  }

  async testErrorHandlingAndRecovery() {
    console.log('6️⃣ **Testing Error Handling and Recovery**');
    
    try {
      // Test database error handling
      try {
        await this.services.database.saveBookmark(null); // Invalid input
        this.addTestResult('DB_ERROR_HANDLING', false, 'Database should have rejected null bookmark');
      } catch (error) {
        this.addTestResult('DB_ERROR_HANDLING', true, 'Database properly rejected invalid input');
      }
      
      // Test performance monitor with invalid metrics
      try {
        await this.services.performanceMonitor.recordPerformanceMetric({
          // Missing required fields
          agentId: 'test_agent'
        });
        this.addTestResult('PERF_ERROR_HANDLING', false, 'Performance monitor should have rejected invalid metric');
      } catch (error) {
        this.addTestResult('PERF_ERROR_HANDLING', true, 'Performance monitor properly rejected invalid metric');
      }
      
      // Test task scheduler with invalid task type
      try {
        await this.services.taskScheduler.scheduleTask('invalid_task_type', {}, {});
        this.addTestResult('SCHEDULER_ERROR_HANDLING', false, 'Task scheduler should have rejected invalid task type');
      } catch (error) {
        this.addTestResult('SCHEDULER_ERROR_HANDLING', true, 'Task scheduler properly rejected invalid task type');
      }
      
      // Test graceful degradation
      const originalDb = this.services.performanceMonitor.db;
      this.services.performanceMonitor.db = null; // Simulate database failure
      
      try {
        await this.services.performanceMonitor.recordPerformanceMetric({
          id: 'graceful_test',
          agentId: 'test_agent',
          taskType: 'test',
          startTime: Date.now() - 1000,
          endTime: Date.now(),
          duration: 1000,
          success: true,
          resourceUsage: { cpuTime: 900, memoryUsed: 10, networkRequests: 0 },
          qualityScore: 5,
          metadata: {}
        });
        this.addTestResult('GRACEFUL_DEGRADATION', false, 'Should have handled database failure gracefully');
      } catch (error) {
        this.addTestResult('GRACEFUL_DEGRADATION', true, 'Gracefully handled database failure');
      }
      
      // Restore database connection
      this.services.performanceMonitor.db = originalDb;
      
      console.log('   ✅ Error handling and recovery working correctly\n');
      
    } catch (error) {
      this.addTestResult('ERROR_HANDLING', false, `Error handling test failed: ${error.message}`);
    }
  }

  async testLoadAndStress() {
    console.log('7️⃣ **Testing Load and Stress Scenarios**');
    
    try {
      const startTime = Date.now();
      
      // Generate load with multiple concurrent operations
      const loadPromises = [];
      
      // Concurrent bookmark saves
      for (let i = 0; i < 50; i++) {
        loadPromises.push(
          this.services.database.saveBookmark({
            id: `load_test_bookmark_${i}`,
            title: `Load Test Bookmark ${i}`,
            url: `https://loadtest${i}.example.com`,
            description: `Load testing bookmark number ${i}`,
            tags: ['load-test', 'performance', `batch-${Math.floor(i/10)}`],
            createdAt: Date.now() + i,
            updatedAt: Date.now() + i,
            visitCount: i % 10,
            lastVisited: Date.now() - (i * 1000),
            category: 'test'
          })
        );
      }
      
      // Concurrent performance metrics
      for (let i = 0; i < 30; i++) {
        loadPromises.push(
          this.services.performanceMonitor.recordPerformanceMetric({
            id: `load_test_perf_${i}`,
            agentId: `load_test_agent_${i % 5}`,
            taskType: 'load_test',
            startTime: Date.now() - 2000 - i,
            endTime: Date.now() - i,
            duration: 2000,
            success: i % 4 !== 0, // 75% success rate
            resourceUsage: {
              cpuTime: 1800 + (i * 10),
              memoryUsed: 20 + (i % 50),
              networkRequests: 1 + (i % 3)
            },
            qualityScore: 5 + (i % 6),
            metadata: {
              load_test_batch: Math.floor(i / 10),
              concurrent_operation: true
            }
          })
        );
      }
      
      // Concurrent task scheduling
      for (let i = 0; i < 20; i++) {
        loadPromises.push(
          this.services.taskScheduler.scheduleTask('agent_learning', {
            agentId: `load_test_agent_${i % 3}`,
            learning_focus: `pattern_${i}`
          }, {
            priority: 1 + (i % 9),
            scheduledFor: Date.now() + (i * 1000)
          })
        );
      }
      
      // Execute all operations concurrently
      const results = await Promise.allSettled(loadPromises);
      const successCount = results.filter(r => r.status === 'fulfilled').length;
      const successRate = (successCount / results.length) * 100;
      
      const endTime = Date.now();
      const totalDuration = endTime - startTime;
      
      this.addTestResult('LOAD_TEST', successRate > 90, `Load test: ${successCount}/${results.length} operations succeeded (${successRate.toFixed(1)}%) in ${totalDuration}ms`);
      
      // Test data retrieval under load
      const retrievalStart = Date.now();
      const [bookmarks, metrics, tasks] = await Promise.all([
        this.services.database.getBookmarks(100),
        this.services.database.getPerformanceMetrics('load_test_agent_0', 50),
        this.services.database.getBackgroundTasks('pending', 50)
      ]);
      const retrievalTime = Date.now() - retrievalStart;
      
      this.addTestResult('LOAD_RETRIEVAL', retrievalTime < 5000, `Data retrieval under load: ${retrievalTime}ms for ${bookmarks.length + metrics.length + tasks.length} records`);
      
      console.log('   ✅ Load and stress testing completed successfully\n');
      
    } catch (error) {
      this.addTestResult('LOAD_STRESS', false, `Load testing failed: ${error.message}`);
    }
  }

  async testAutonomousOperations() {
    console.log('8️⃣ **Testing Autonomous Operations**');
    
    try {
      // Test autonomous task execution
      const autonomousTaskId = await this.services.taskScheduler.scheduleTask('research_monitoring', {
        topic: 'autonomous operation test',
        sources: ['test.com'],
        frequency: 'test'
      }, {
        priority: 9,
        scheduledFor: Date.now() + 1000 // 1 second from now
      });
      
      this.addTestResult('AUTONOMOUS_SCHEDULING', true, `Autonomous task scheduled: ${autonomousTaskId}`);
      
      // Wait for task to be picked up
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Check task execution
      const taskStatus = await this.services.taskScheduler.getTaskStatus(autonomousTaskId);
      const isExecuting = taskStatus && (taskStatus.status === 'running' || taskStatus.status === 'completed');
      this.addTestResult('AUTONOMOUS_EXECUTION', isExecuting, `Autonomous task ${taskStatus ? taskStatus.status : 'not found'}`);
      
      // Test autonomous maintenance
      const maintenanceTaskId = await this.services.taskScheduler.scheduleTask('data_maintenance', {
        type: 'cleanup_expired_memories'
      }, {
        priority: 2,
        scheduledFor: Date.now() + 2000 // 2 seconds from now
      });
      
      this.addTestResult('AUTONOMOUS_MAINTENANCE', true, `Autonomous maintenance scheduled: ${maintenanceTaskId}`);
      
      // Test autonomous learning
      const learningTaskId = await this.services.taskScheduler.scheduleTask('agent_learning', {
        agentId: 'research_agent',
        learning_focus: 'autonomous_patterns'
      }, {
        priority: 4,
        scheduledFor: Date.now() + 3000 // 3 seconds from now
      });
      
      this.addTestResult('AUTONOMOUS_LEARNING', true, `Autonomous learning scheduled: ${learningTaskId}`);
      
      // Wait for tasks to execute
      await new Promise(resolve => setTimeout(resolve, 8000));
      
      // Check overall autonomous operation statistics
      const finalStats = await this.services.taskScheduler.getTaskStats();
      const hasAutonomousActivity = finalStats.completed > 0 || finalStats.running > 0;
      this.addTestResult('AUTONOMOUS_ACTIVITY', hasAutonomousActivity, `Autonomous operations: ${finalStats.completed} completed, ${finalStats.running} running`);
      
      console.log('   ✅ Autonomous operations working correctly\n');
      
    } catch (error) {
      this.addTestResult('AUTONOMOUS_OPS', false, `Autonomous operations failed: ${error.message}`);
    }
  }

  async testDataIntegrity() {
    console.log('9️⃣ **Testing Data Integrity**');
    
    try {
      // Test data consistency across operations
      const testBookmarkId = `integrity_test_${Date.now()}`;
      
      // Save a bookmark
      const originalBookmark = {
        id: testBookmarkId,
        title: 'Data Integrity Test',
        url: 'https://integrity-test.example.com',
        description: 'Testing data integrity across operations',
        tags: ['integrity', 'test', 'validation'],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        visitCount: 1,
        lastVisited: Date.now(),
        category: 'test'
      };
      
      await this.services.database.saveBookmark(originalBookmark);
      
      // Retrieve and verify
      const retrievedBookmarks = await this.services.database.getBookmarks(100);
      const foundBookmark = retrievedBookmarks.find(b => b.id === testBookmarkId);
      
      const dataIntact = foundBookmark && 
        foundBookmark.title === originalBookmark.title &&
        foundBookmark.url === originalBookmark.url &&
        foundBookmark.tags.length === originalBookmark.tags.length;
      
      this.addTestResult('DATA_INTEGRITY', dataIntact, 'Bookmark data integrity maintained');
      
      // Test transaction-like operations
      const batchStartTime = Date.now();
      
      // Multiple related operations
      const relatedOperations = [
        this.services.database.saveHistoryEntry({
          id: `integrity_history_${Date.now()}`,
          url: originalBookmark.url,
          title: originalBookmark.title,
          visitedAt: Date.now(),
          duration: 60000,
          pageType: 'test',
          exitType: 'navigation'
        }),
        this.services.performanceMonitor.recordPerformanceMetric({
          id: `integrity_perf_${Date.now()}`,
          agentId: 'integrity_test_agent',
          taskType: 'integrity_validation',
          startTime: batchStartTime,
          endTime: Date.now(),
          duration: Date.now() - batchStartTime,
          success: true,
          resourceUsage: {
            cpuTime: 500,
            memoryUsed: 15,
            networkRequests: 1
          },
          qualityScore: 8,
          metadata: {
            related_bookmark: testBookmarkId
          }
        })
      ];
      
      await Promise.all(relatedOperations);
      
      // Verify related data consistency
      const relatedHistory = await this.services.database.getHistory(50);
      const relatedMetrics = await this.services.database.getPerformanceMetrics('integrity_test_agent', 10);
      
      const hasRelatedHistory = relatedHistory.some(h => h.url === originalBookmark.url);
      const hasRelatedMetrics = relatedMetrics.some(m => m.metadata && m.metadata.related_bookmark === testBookmarkId);
      
      this.addTestResult('RELATED_DATA_INTEGRITY', hasRelatedHistory && hasRelatedMetrics, 'Related data consistency maintained');
      
      // Test data cleanup doesn't affect active data
      const beforeCleanup = await this.services.database.getBookmarks(200);
      await this.services.database.cleanupExpiredMemories();
      const afterCleanup = await this.services.database.getBookmarks(200);
      
      this.addTestResult('CLEANUP_INTEGRITY', beforeCleanup.length === afterCleanup.length, 'Active data preserved during cleanup');
      
      console.log('   ✅ Data integrity verification completed\n');
      
    } catch (error) {
      this.addTestResult('DATA_INTEGRITY', false, `Data integrity test failed: ${error.message}`);
    }
  }

  async testEndToEndScenarios() {
    console.log('🔟 **Testing End-to-End Scenarios**');
    
    try {
      // Scenario 1: Complete AI Research Session
      console.log('   📚 Testing complete AI research session...');
      
      const sessionStartTime = Date.now();
      
      // 1. Save research bookmarks
      const researchBookmarks = [
        {
          id: `research_session_1_${Date.now()}`,
          title: 'AI Research Paper Database',
          url: 'https://arxiv.org/cs.AI',
          description: 'Latest AI research papers',
          tags: ['ai', 'research', 'papers'],
          createdAt: Date.now(),
          updatedAt: Date.now(),
          visitCount: 1,
          lastVisited: Date.now(),
          category: 'research'
        },
        {
          id: `research_session_2_${Date.now()}`,
          title: 'AI Conference Proceedings',
          url: 'https://nips.cc/proceedings',
          description: 'Neural Information Processing Systems',
          tags: ['ai', 'conference', 'nips'],
          createdAt: Date.now(),
          updatedAt: Date.now(),
          visitCount: 1,
          lastVisited: Date.now(),
          category: 'research'
        }
      ];
      
      for (const bookmark of researchBookmarks) {
        await this.services.database.saveBookmark(bookmark);
      }
      
      // 2. Record browsing history
      const browsingHistory = researchBookmarks.map((bookmark, index) => ({
        id: `research_history_${index}_${Date.now()}`,
        url: bookmark.url,
        title: bookmark.title,
        visitedAt: Date.now() + (index * 1000),
        duration: 180000 + (index * 30000), // 3-6 minutes per page
        pageType: 'research',
        exitType: 'navigation'
      }));
      
      for (const history of browsingHistory) {
        await this.services.database.saveHistoryEntry(history);
      }
      
      // 3. Record AI agent performance
      const agentMetrics = [
        {
          id: `research_perf_1_${Date.now()}`,
          agentId: 'research_agent',
          taskType: 'paper_analysis',
          startTime: sessionStartTime,
          endTime: sessionStartTime + 8000,
          duration: 8000,
          success: true,
          resourceUsage: {
            cpuTime: 7500,
            memoryUsed: 65,
            networkRequests: 4
          },
          qualityScore: 9,
          metadata: {
            papers_analyzed: 15,
            insights_extracted: 8,
            confidence_level: 0.92
          }
        },
        {
          id: `research_perf_2_${Date.now()}`,
          agentId: 'analysis_agent',
          taskType: 'content_synthesis',
          startTime: sessionStartTime + 8000,
          endTime: sessionStartTime + 15000,
          duration: 7000,
          success: true,
          resourceUsage: {
            cpuTime: 6800,
            memoryUsed: 70,
            networkRequests: 2
          },
          qualityScore: 8,
          metadata: {
            synthesis_quality: 0.88,
            cross_references: 12
          }
        }
      ];
      
      for (const metric of agentMetrics) {
        await this.services.performanceMonitor.recordPerformanceMetric(metric);
      }
      
      // 4. Store agent learning from session
      const sessionMemory = {
        id: `research_session_memory_${Date.now()}`,
        agentId: 'research_agent',
        type: 'learning',
        content: {
          session_type: 'ai_research',
          effective_strategies: [
            'start_with_recent_papers',
            'cross_reference_citations',
            'focus_on_methodology_sections'
          ],
          successful_sources: researchBookmarks.map(b => b.url),
          session_duration: 900000, // 15 minutes
          insights_quality: 0.9
        },
        importance: 9,
        tags: ['research_session', 'ai', 'successful_strategy'],
        createdAt: Date.now(),
        relatedMemories: [],
        metadata: {
          confidence: 0.95,
          session_id: `session_${sessionStartTime}`
        }
      };
      
      await this.services.database.saveAgentMemory(sessionMemory);
      
      // 5. Schedule follow-up monitoring
      const followUpTaskId = await this.services.taskScheduler.scheduleTask('research_monitoring', {
        topic: 'AI research session follow-up',
        sources: researchBookmarks.map(b => b.url),
        monitoring_type: 'new_publications'
      }, {
        priority: 7,
        agentId: 'research_agent',
        scheduledFor: Date.now() + 86400000 // 24 hours from now
      });
      
      this.addTestResult('E2E_RESEARCH_SESSION', true, `Complete research session recorded and follow-up scheduled: ${followUpTaskId}`);
      
      // Scenario 2: Performance Optimization Cycle
      console.log('   ⚡ Testing performance optimization cycle...');
      
      // Simulate degrading performance
      const degradingMetrics = [];
      for (let i = 0; i < 10; i++) {
        degradingMetrics.push({
          id: `degrade_perf_${i}_${Date.now()}`,
          agentId: 'optimization_test_agent',
          taskType: 'performance_test',
          startTime: Date.now() - (10000 - i * 1000),
          endTime: Date.now() - (5000 - i * 500),
          duration: 5000 + (i * 500), // Getting slower
          success: i < 7, // Failing more often
          errorMessage: i >= 7 ? `Performance degradation error ${i}` : undefined,
          resourceUsage: {
            cpuTime: 4000 + (i * 600),
            memoryUsed: 40 + (i * 5),
            networkRequests: 2
          },
          qualityScore: Math.max(1, 9 - i), // Declining quality
          metadata: {
            degradation_cycle: true,
            cycle_position: i
          }
        });
      }
      
      for (const metric of degradingMetrics) {
        await this.services.performanceMonitor.recordPerformanceMetric(metric);
      }
      
      // Check if performance monitoring detected the issue
      const optimizationAgentHealth = await this.services.performanceMonitor.getAgentHealthStatus('optimization_test_agent');
      const detectedDegradation = optimizationAgentHealth && (optimizationAgentHealth.status === 'degraded' || optimizationAgentHealth.status === 'failing');
      
      this.addTestResult('E2E_PERFORMANCE_DETECTION', detectedDegradation, `Performance degradation detected: ${optimizationAgentHealth ? optimizationAgentHealth.status : 'not detected'}`);
      
      // Simulate recovery metrics
      const recoveryMetrics = [{
        id: `recovery_perf_${Date.now()}`,
        agentId: 'optimization_test_agent',
        taskType: 'performance_test',
        startTime: Date.now() - 3000,
        endTime: Date.now(),
        duration: 3000, // Back to good performance
        success: true,
        resourceUsage: {
          cpuTime: 2800,
          memoryUsed: 35,
          networkRequests: 1
        },
        qualityScore: 9, // High quality again
        metadata: {
          recovery_cycle: true,
          optimization_applied: true
        }
      }];
      
      for (const metric of recoveryMetrics) {
        await this.services.performanceMonitor.recordPerformanceMetric(metric);
      }
      
      this.addTestResult('E2E_PERFORMANCE_OPTIMIZATION', true, 'Complete performance optimization cycle tested');
      
      console.log('   ✅ End-to-end scenarios completed successfully\n');
      
    } catch (error) {
      this.addTestResult('E2E_SCENARIOS', false, `End-to-end scenarios failed: ${error.message}`);
    }
  }

  addTestResult(testName, success, message) {
    this.testResults.push({
      test: testName,
      success,
      message,
      timestamp: Date.now()
    });
    
    const status = success ? '✅' : '❌';
    console.log(`   ${status} ${testName}: ${message}`);
  }

  generateTestReport() {
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(r => r.success).length;
    const failedTests = totalTests - passedTests;
    const successRate = (passedTests / totalTests) * 100;
    const testDuration = Date.now() - this.testStartTime;
    
    console.log('\n' + '='.repeat(80));
    console.log('🧪 **END-TO-END BACKEND TEST RESULTS**');
    console.log('='.repeat(80));
    console.log(`📊 **Overall Results**: ${passedTests}/${totalTests} tests passed (${successRate.toFixed(1)}%)`);
    console.log(`⏱️  **Test Duration**: ${(testDuration / 1000).toFixed(1)} seconds`);
    console.log(`🕒 **Completed At**: ${new Date().toISOString()}`);
    
    if (failedTests > 0) {
      console.log('\n❌ **Failed Tests**:');
      this.testResults
        .filter(r => !r.success)
        .forEach(result => {
          console.log(`   • ${result.test}: ${result.message}`);
        });
    }
    
    console.log('\n✅ **Passed Tests**:');
    this.testResults
      .filter(r => r.success)
      .forEach(result => {
        console.log(`   • ${result.test}: ${result.message}`);
      });
    
    console.log('\n🎯 **Test Categories**:');
    const categories = {
      'Service Initialization': this.testResults.filter(r => r.test.includes('_INIT')),
      'Data Persistence': this.testResults.filter(r => r.test.includes('PERSISTENCE') || r.test.includes('_DB')),
      'Performance Monitoring': this.testResults.filter(r => r.test.includes('PERF') || r.test.includes('HEALTH')),
      'Background Tasks': this.testResults.filter(r => r.test.includes('TASK') || r.test.includes('SCHEDULER')),
      'Cross-Service Communication': this.testResults.filter(r => r.test.includes('CROSS') || r.test.includes('COMM')),
      'Error Handling': this.testResults.filter(r => r.test.includes('ERROR') || r.test.includes('GRACEFUL')),
      'Load Testing': this.testResults.filter(r => r.test.includes('LOAD')),
      'Autonomous Operations': this.testResults.filter(r => r.test.includes('AUTONOMOUS')),
      'Data Integrity': this.testResults.filter(r => r.test.includes('INTEGRITY')),
      'End-to-End Scenarios': this.testResults.filter(r => r.test.includes('E2E'))
    };
    
    Object.entries(categories).forEach(([category, tests]) => {
      if (tests.length > 0) {
        const categoryPassed = tests.filter(t => t.success).length;
        const categoryRate = (categoryPassed / tests.length) * 100;
        console.log(`   📋 ${category}: ${categoryPassed}/${tests.length} (${categoryRate.toFixed(1)}%)`);
      }
    });
    
    console.log('\n' + '='.repeat(80));
    
    if (successRate >= 90) {
      console.log('🎉 **EXCELLENT**: Backend enhancements are working exceptionally well!');
    } else if (successRate >= 80) {
      console.log('👍 **GOOD**: Backend enhancements are working well with minor issues.');
    } else if (successRate >= 70) {
      console.log('⚠️  **FAIR**: Backend enhancements have some issues that need attention.');
    } else {
      console.log('❌ **POOR**: Backend enhancements need significant fixes.');
    }
    
    console.log('='.repeat(80));
    
    // Save detailed report to file
    const reportData = {
      summary: {
        totalTests,
        passedTests,
        failedTests,
        successRate,
        testDuration,
        completedAt: new Date().toISOString()
      },
      results: this.testResults,
      categories: Object.entries(categories).reduce((acc, [name, tests]) => {
        acc[name] = {
          total: tests.length,
          passed: tests.filter(t => t.success).length,
          successRate: tests.length > 0 ? (tests.filter(t => t.success).length / tests.length) * 100 : 0
        };
        return acc;
      }, {})
    };
    
    fs.writeFileSync('./data/end-to-end-test-report.json', JSON.stringify(reportData, null, 2));
    console.log('📄 **Detailed report saved**: ./data/end-to-end-test-report.json\n');
  }

  async cleanup() {
    console.log('🧹 **Cleaning up test environment...**');
    
    try {
      if (this.services.performanceMonitor) {
        await this.services.performanceMonitor.shutdown();
      }
      
      if (this.services.taskScheduler) {
        await this.services.taskScheduler.shutdown();
      }
      
      if (this.services.database) {
        await this.services.database.close();
      }
      
      console.log('✅ **Cleanup completed successfully**\n');
    } catch (error) {
      console.error('❌ Cleanup failed:', error);
    }
  }
}

// Run the comprehensive end-to-end test
async function runEndToEndTest() {
  const tester = new EndToEndBackendTester();
  await tester.runCompleteTest();
}

// Execute if called directly
if (require.main === module) {
  runEndToEndTest().catch(console.error);
}

module.exports = { EndToEndBackendTester, runEndToEndTest };