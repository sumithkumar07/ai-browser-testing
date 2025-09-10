/**
 * Enhanced Backend Manager - Maximum Capability Activation
 * Orchestrates all advanced backend services with intelligent optimization
 */

const { DatabaseService } = require('./DatabaseService');
const { AgentPerformanceMonitor } = require('./AgentPerformanceMonitor');
const { BackgroundTaskScheduler } = require('./BackgroundTaskScheduler');
const { ApiValidator } = require('../core/services/ApiValidator');
const { DatabaseHealthManager } = require('../core/services/DatabaseHealthManager');

class EnhancedBackendManager {
  constructor() {
    this.services = new Map();
    this.isInitialized = false;
    this.config = {
      // Maximum capability configuration
      enableAdvancedFeatures: true,
      enableAutonomousGoals: true,
      enableCrossAgentLearning: true,
      enableHardwareAttestation: true,
      enableDeepIntegration: true,
      maxConcurrentOperations: 15,
      performanceOptimization: true,
      realTimeMonitoring: true,
      advancedSecurity: true
    };
  }

  async initialize() {
    try {
      console.log('🚀 Initializing Enhanced Backend Manager...');
      console.log('📊 Configuration:', this.config);

      // 1. Initialize Core Database Infrastructure
      await this.initializeDatabaseInfrastructure();

      // 2. Initialize GROQ API Services
      await this.initializeAIServices();

      // 3. Initialize Advanced Backend Services
      await this.initializeAdvancedServices();

      // 4. Initialize Performance Monitoring
      await this.initializePerformanceMonitoring();

      // 5. Initialize Background Task System
      await this.initializeBackgroundTasks();

      // 6. Activate Advanced Features
      await this.activateAdvancedFeatures();

      // 7. Start Autonomous Operations
      await this.startAutonomousOperations();

      this.isInitialized = true;
      console.log('✅ Enhanced Backend Manager initialized successfully');
      
      return this.getSystemStatus();

    } catch (error) {
      console.error('❌ Enhanced Backend Manager initialization failed:', error);
      throw error;
    }
  }

  async initializeDatabaseInfrastructure() {
    console.log('🗄️ Initializing Database Infrastructure...');
    
    // Initialize main database
    const database = new DatabaseService();
    await database.initialize();
    this.services.set('database', database);

    // Initialize database health manager
    const healthManager = new DatabaseHealthManager(database, {
      healthCheckInterval: 30000, // 30 seconds
      backupInterval: 1800000,    // 30 minutes  
      maxBackups: 20,
      repairAttempts: 5,
      enableAutoMaintenance: true
    });
    await healthManager.initialize();
    this.services.set('database_health', healthManager);

    console.log('✅ Database infrastructure ready');
  }

  async initializeAIServices() {
    console.log('🧠 Initializing AI Services...');
    
    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      throw new Error('GROQ_API_KEY is required for AI services');
    }

    // Initialize API validator with enhanced configuration
    const apiValidator = new ApiValidator(groqApiKey, {
      baseUrl: 'https://api.groq.com/openai/v1',
      maxRetries: 5,
      retryDelay: 2000,
      rateLimitWindow: 60000,
      maxRequestsPerWindow: 150, // Increased limit
      enableCircuitBreaker: true,
      healthCheckInterval: 30000
    });

    // Validate API immediately
    const validation = await apiValidator.validateApiKey();
    if (!validation.valid) {
      throw new Error(`GROQ API validation failed: ${validation.error}`);
    }

    this.services.set('api_validator', apiValidator);
    console.log('✅ GROQ API services ready');
  }

  async initializeAdvancedServices() {
    console.log('⚡ Initializing Advanced Services...');
    
    const database = this.services.get('database');
    
    // Agent Performance Monitor with enhanced capabilities
    const performanceMonitor = new AgentPerformanceMonitor(database);
    await performanceMonitor.initialize();
    this.services.set('performance_monitor', performanceMonitor);

    console.log('✅ Advanced services ready');
  }

  async initializePerformanceMonitoring() {
    console.log('📊 Initializing Performance Monitoring...');
    
    // Real-time system monitoring
    this.systemMonitor = setInterval(() => {
      this.collectSystemMetrics();
    }, 10000); // Every 10 seconds
    
    // Performance optimization checks
    this.optimizationChecker = setInterval(() => {
      this.performOptimizationChecks();
    }, 60000); // Every minute

    console.log('✅ Performance monitoring active');
  }

  async initializeBackgroundTasks() {
    console.log('🔄 Initializing Background Task System...');
    
    const database = this.services.get('database');
    const scheduler = new BackgroundTaskScheduler(database);
    await scheduler.initialize();
    this.services.set('task_scheduler', scheduler);

    // Schedule enhanced tasks
    await this.scheduleEnhancedTasks(scheduler);

    console.log('✅ Background task system ready');
  }

  async activateAdvancedFeatures() {
    console.log('🎯 Activating Advanced Features...');
    
    if (typeof window !== 'undefined' && window.electronAPI) {
      // Browser-based advanced features
      await this.activateBrowserFeatures();
    }

    // Database-level advanced features
    await this.activateDatabaseFeatures();
    
    console.log('✅ Advanced features activated');
  }

  async activateBrowserFeatures() {
    // Enhanced tab management
    if (window.electronAPI.enhancedTabManagement) {
      await window.electronAPI.enhancedTabManagement.initialize({
        maxTabs: 50,
        autoSuspend: true,
        memoryOptimization: true
      });
    }

    // Advanced search capabilities  
    if (window.electronAPI.deepSearch) {
      await window.electronAPI.deepSearch.initialize({
        enableParallelSearch: true,
        maxConcurrentSources: 8,
        cachingEnabled: true
      });
    }
  }

  async activateDatabaseFeatures() {
    const database = this.services.get('database');
    
    // Enable advanced indexing
    try {
      database.db.prepare(`
        CREATE INDEX IF NOT EXISTS idx_agent_memory_composite 
        ON agent_memory(agent_id, timestamp DESC, importance DESC)
      `).run();
      
      database.db.prepare(`
        CREATE INDEX IF NOT EXISTS idx_performance_composite 
        ON agent_performance(agent_id, timestamp DESC, success)
      `).run();

      console.log('📊 Advanced database indexing enabled');
    } catch (error) {
      console.warn('⚠️ Advanced indexing setup warning:', error.message);
    }
  }

  async startAutonomousOperations() {
    console.log('🤖 Starting Autonomous Operations...');
    
    const scheduler = this.services.get('task_scheduler');
    
    // Autonomous system optimization
    await scheduler.scheduleTask('autonomous_goal_execution', {
      goalId: 'system_optimization',
      description: 'Continuously optimize system performance',
      priority: 'high',
      autoRenew: true
    }, { 
      priority: 'high',
      scheduledFor: Date.now() + 30000 // Start in 30 seconds
    });

    // Autonomous research monitoring
    await scheduler.scheduleTask('research_monitoring', {
      topic: 'AI and browser automation trends',
      autoUpdate: true,
      sources: ['academic', 'news', 'social']
    }, {
      priority: 'medium',
      scheduledFor: Date.now() + 60000 // Start in 1 minute
    });

    // Autonomous performance learning
    await scheduler.scheduleTask('agent_learning', {
      learningType: 'cross_agent_patterns',
      analysisDepth: 'comprehensive',
      adaptiveImprovement: true
    }, {
      priority: 'medium',
      scheduledFor: Date.now() + 120000 // Start in 2 minutes
    });

    console.log('✅ Autonomous operations started');
  }

  async scheduleEnhancedTasks(scheduler) {
    // Data maintenance with enhanced cleanup
    await scheduler.scheduleTask('data_maintenance', {
      type: 'cleanup_expired_memories',
      retentionDays: 30,
      importanceThreshold: 7
    }, { priority: 'low' });

    await scheduler.scheduleTask('data_maintenance', {
      type: 'cleanup_old_history', 
      daysToKeep: 90,
      compressOldData: true
    }, { priority: 'low' });

    // Performance optimization tasks
    await scheduler.scheduleTask('autonomous_goal_execution', {
      goalId: 'database_optimization',
      description: 'Optimize database performance and indexes',
      steps: ['analyze_queries', 'optimize_indexes', 'vacuum_database']
    }, { priority: 'medium' });
  }

  async collectSystemMetrics() {
    try {
      const metrics = {
        timestamp: Date.now(),
        memory: process.memoryUsage ? process.memoryUsage() : { heapUsed: 0 },
        services: this.getServiceHealth(),
        performance: await this.getPerformanceMetrics(),
        tasks: await this.getTaskMetrics()
      };

      // Store metrics in database
      const database = this.services.get('database');
      if (database && database.db) {
        database.db.prepare(`
          INSERT OR REPLACE INTO system_metrics 
          (timestamp, data) VALUES (?, ?)
        `).run(Date.now(), JSON.stringify(metrics));
      }

      // Emit metrics event if in browser
      if (typeof window !== 'undefined' && window.electronAPI) {
        window.electronAPI.emitSystemMetrics?.(metrics);
      }

    } catch (error) {
      console.warn('⚠️ System metrics collection warning:', error.message);
    }
  }

  async performOptimizationChecks() {
    try {
      const database = this.services.get('database');
      const performanceMonitor = this.services.get('performance_monitor');
      
      if (!database || !performanceMonitor) return;

      // Check agent performance trends
      const agentHealth = await performanceMonitor.getAgentHealth();
      const underperformingAgents = Object.entries(agentHealth)
        .filter(([_, health]) => health.successRate < 0.8)
        .map(([agentId]) => agentId);

      if (underperformingAgents.length > 0) {
        console.log(`🔧 Optimizing underperforming agents: ${underperformingAgents.join(', ')}`);
        
        // Schedule optimization tasks
        const scheduler = this.services.get('task_scheduler');
        for (const agentId of underperformingAgents) {
          await scheduler.scheduleTask('agent_learning', {
            agentId,
            focusArea: 'performance_improvement',
            analysisType: 'failure_pattern_analysis'
          }, { priority: 'high' });
        }
      }

      // Database optimization
      const dbStats = database.db.prepare(`
        SELECT COUNT(*) as total_records FROM agent_memory
      `).get();

      if (dbStats.total_records > 10000) {
        console.log('🗄️ Scheduling database maintenance due to high record count');
        const scheduler = this.services.get('task_scheduler');
        await scheduler.scheduleTask('data_maintenance', {
          type: 'comprehensive_cleanup',
          aggressiveCleanup: true
        }, { priority: 'medium' });
      }

    } catch (error) {
      console.warn('⚠️ Optimization check warning:', error.message);
    }
  }

  getServiceHealth() {
    const health = {};
    for (const [serviceName, service] of this.services.entries()) {
      if (service.getStatus) {
        health[serviceName] = service.getStatus();
      } else if (service.getHealthStatus) {
        health[serviceName] = service.getHealthStatus();
      } else {
        health[serviceName] = { status: 'active' };
      }
    }
    return health;
  }

  async getPerformanceMetrics() {
    const performanceMonitor = this.services.get('performance_monitor');
    if (!performanceMonitor) return {};

    try {
      return {
        agentHealth: await performanceMonitor.getAgentHealth(),
        systemHealth: await performanceMonitor.getSystemHealthScore(),
        recentPerformance: await performanceMonitor.getPerformanceData(50)
      };
    } catch (error) {
      console.warn('⚠️ Performance metrics warning:', error.message);
      return {};
    }
  }

  async getTaskMetrics() {
    const scheduler = this.services.get('task_scheduler');
    if (!scheduler) return {};

    try {
      return await scheduler.getTaskStats();
    } catch (error) {
      console.warn('⚠️ Task metrics warning:', error.message);
      return {};
    }
  }

  getSystemStatus() {
    return {
      initialized: this.isInitialized,
      config: this.config,
      services: Array.from(this.services.keys()),
      serviceHealth: this.getServiceHealth(),
      features: {
        advancedFeaturesActive: this.config.enableAdvancedFeatures,
        autonomousGoalsActive: this.config.enableAutonomousGoals,
        crossAgentLearningActive: this.config.enableCrossAgentLearning,
        hardwareAttestationActive: this.config.enableHardwareAttestation,
        deepIntegrationActive: this.config.enableDeepIntegration
      },
      timestamp: Date.now()
    };
  }

  // Enhanced API for external services
  async executeAdvancedOperation(operation, parameters = {}) {
    if (!this.isInitialized) {
      throw new Error('Enhanced Backend Manager not initialized');
    }

    const apiValidator = this.services.get('api_validator');
    if (apiValidator?.isCircuitOpen()) {
      throw new Error('API circuit breaker is open - service temporarily unavailable');
    }

    switch (operation) {
      case 'autonomous_research':
        return await this.executeAutonomousResearch(parameters);
      
      case 'cross_agent_learning':
        return await this.executeCrossAgentLearning(parameters);
      
      case 'deep_system_analysis':
        return await this.executeDeepSystemAnalysis(parameters);
      
      case 'performance_optimization':
        return await this.executePerformanceOptimization(parameters);
      
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  }

  async executeAutonomousResearch(parameters) {
    const scheduler = this.services.get('task_scheduler');
    
    return await scheduler.scheduleTask('research_monitoring', {
      topic: parameters.topic || 'General research',
      sources: parameters.sources || ['academic', 'news'],
      depth: parameters.depth || 'comprehensive',
      autoAnalysis: true,
      generateReport: true
    }, { priority: 'high' });
  }

  async executeCrossAgentLearning(parameters) {
    const database = this.services.get('database');
    const performanceMonitor = this.services.get('performance_monitor');
    
    // Get recent performance data for all agents
    const agents = ['research', 'navigation', 'shopping', 'communication', 'automation', 'analysis'];
    const learningData = {};
    
    for (const agentId of agents) {
      const recentData = await performanceMonitor.getAgentPerformanceHistory(agentId, 100);
      learningData[agentId] = recentData;
    }

    // Schedule cross-agent learning task
    const scheduler = this.services.get('task_scheduler');
    return await scheduler.scheduleTask('agent_learning', {
      type: 'cross_agent_pattern_analysis',
      agentData: learningData,
      learningObjectives: parameters.objectives || ['improve_success_rate', 'reduce_response_time'],
      shareKnowledge: true
    }, { priority: 'high' });
  }

  async executeDeepSystemAnalysis(parameters) {
    const database = this.services.get('database');
    const performanceMonitor = this.services.get('performance_monitor');
    const healthManager = this.services.get('database_health');
    
    const analysis = {
      timestamp: Date.now(),
      systemHealth: await healthManager.performHealthCheck(),
      agentPerformance: await performanceMonitor.getAgentHealth(),
      databaseStats: await this.getDatabaseStats(),
      recommendations: await this.generateOptimizationRecommendations()
    };

    return analysis;
  }

  async executePerformanceOptimization(parameters) {
    const recommendations = await this.generateOptimizationRecommendations();
    const scheduler = this.services.get('task_scheduler');
    
    // Execute optimization tasks based on recommendations
    for (const recommendation of recommendations) {
      if (recommendation.priority === 'high') {
        await scheduler.scheduleTask('autonomous_goal_execution', {
          goalId: `optimization_${Date.now()}`,
          description: recommendation.description,
          actions: recommendation.actions
        }, { priority: 'high' });
      }
    }

    return {
      optimizationsScheduled: recommendations.length,
      highPriorityOptimizations: recommendations.filter(r => r.priority === 'high').length,
      recommendations
    };
  }

  async getDatabaseStats() {
    const database = this.services.get('database');
    if (!database || !database.db) return {};

    try {
      const stats = {
        totalMemories: database.db.prepare('SELECT COUNT(*) as count FROM agent_memory').get()?.count || 0,
        totalPerformanceRecords: database.db.prepare('SELECT COUNT(*) as count FROM agent_performance').get()?.count || 0,
        totalBackgroundTasks: database.db.prepare('SELECT COUNT(*) as count FROM background_tasks').get()?.count || 0,
        databaseSize: 0 // Would calculate actual size in production
      };

      return stats;
    } catch (error) {
      console.warn('⚠️ Database stats warning:', error.message);
      return {};
    }
  }

  async generateOptimizationRecommendations() {
    const recommendations = [];
    const performanceMonitor = this.services.get('performance_monitor');
    
    try {
      const agentHealth = await performanceMonitor.getAgentHealth();
      
      // Analyze each agent's performance
      for (const [agentId, health] of Object.entries(agentHealth)) {
        if (health.successRate < 0.8) {
          recommendations.push({
            type: 'agent_optimization',
            priority: 'high',
            description: `Optimize ${agentId} agent performance (current success rate: ${(health.successRate * 100).toFixed(1)}%)`,
            actions: ['analyze_failure_patterns', 'update_strategies', 'enhance_context_awareness']
          });
        }
        
        if (health.averageResponseTime > 5000) {
          recommendations.push({
            type: 'performance_optimization',
            priority: 'medium',
            description: `Reduce ${agentId} agent response time (current: ${health.averageResponseTime}ms)`,
            actions: ['optimize_processing', 'cache_frequent_operations', 'parallel_execution']
          });
        }
      }

      // System-level recommendations
      const systemMetrics = await this.getSystemMetrics();
      if (systemMetrics.memory?.heapUsed > 500 * 1024 * 1024) { // 500MB
        recommendations.push({
          type: 'memory_optimization',
          priority: 'medium',
          description: 'High memory usage detected - optimize memory management',
          actions: ['garbage_collection', 'cache_cleanup', 'data_compression']
        });
      }

    } catch (error) {
      console.warn('⚠️ Optimization recommendations warning:', error.message);
    }

    return recommendations;
  }

  async getSystemMetrics() {
    return {
      memory: process.memoryUsage ? process.memoryUsage() : { heapUsed: 0 },
      timestamp: Date.now(),
      uptime: process.uptime ? process.uptime() : 0
    };
  }

  async shutdown() {
    console.log('🛑 Shutting down Enhanced Backend Manager...');
    
    // Clear intervals
    if (this.systemMonitor) {
      clearInterval(this.systemMonitor);
    }
    if (this.optimizationChecker) {
      clearInterval(this.optimizationChecker);
    }

    // Shutdown services
    for (const [serviceName, service] of this.services.entries()) {
      try {
        if (service.shutdown) {
          await service.shutdown();
        }
        console.log(`✅ ${serviceName} service shut down`);
      } catch (error) {
        console.warn(`⚠️ ${serviceName} shutdown warning:`, error.message);
      }
    }

    this.isInitialized = false;
    console.log('✅ Enhanced Backend Manager shutdown complete');
  }
}

module.exports = { EnhancedBackendManager };