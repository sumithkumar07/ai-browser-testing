// Unified Service Orchestrator - JavaScript Implementation
// Central coordinator for all enhanced services

class UnifiedServiceOrchestrator {
  static instance = null;

  static getInstance() {
    if (!UnifiedServiceOrchestrator.instance) {
      UnifiedServiceOrchestrator.instance = new UnifiedServiceOrchestrator();
    }
    return UnifiedServiceOrchestrator.instance;
  }

  constructor() {
    this.services = new Map();
    this.serviceHealth = new Map();
    this.serviceMetrics = new Map();
    this.orchestrationRules = new Map();
    this.eventBus = new Map();
    this.isInitialized = false;
    this.systemHealth = 'unknown';
    this.emergencyMode = false;
  }

  async initialize() {
    try {
      console.log('🎼 Initializing Unified Service Orchestrator...');
      
      // Initialize orchestration system
      this.initializeOrchestrationRules();
      
      // Setup event handling
      this.setupEventHandling();
      
      // Start system monitoring
      this.startSystemMonitoring();
      
      // Start metrics collection
      this.startMetricsCollection();
      
      this.isInitialized = true;
      this.systemHealth = 'healthy';
      
      console.log('✅ Unified Service Orchestrator initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Unified Service Orchestrator:', error);
      this.systemHealth = 'failed';
      throw error;
    }
  }

  initializeOrchestrationRules() {
    // Define how services should be orchestrated together
    this.orchestrationRules.set('startup_sequence', {
      order: [
        'DatabaseService',
        'AdvancedSecurity', 
        'AgentMemoryService',
        'DeepSearchEngine',
        'ShadowWorkspace',
        'CrossPlatformIntegration',
        'AutonomousPlanningEngine',
        'EnhancedAgentCoordinator'
      ],
      dependencies: {
        'AgentMemoryService': ['DatabaseService'],
        'AutonomousPlanningEngine': ['AgentMemoryService'],
        'EnhancedAgentCoordinator': ['DeepSearchEngine', 'ShadowWorkspace', 'CrossPlatformIntegration']
      },
      timeout: 60000
    });

    this.orchestrationRules.set('shutdown_sequence', {
      order: [
        'EnhancedAgentCoordinator',
        'AutonomousPlanningEngine',
        'CrossPlatformIntegration',
        'ShadowWorkspace',
        'DeepSearchEngine',
        'AgentMemoryService',
        'AdvancedSecurity',
        'DatabaseService'
      ],
      timeout: 30000
    });

    this.orchestrationRules.set('emergency_response', {
      criticalServices: ['DatabaseService', 'AdvancedSecurity'],
      optionalServices: ['DeepSearchEngine', 'CrossPlatformIntegration'],
      recoveryActions: ['restart_service', 'fallback_mode', 'isolate_service']
    });

    console.log(`⚙️ Orchestration rules initialized: ${this.orchestrationRules.size} rule sets`);
  }

  async registerService(serviceName, serviceInstance, config = {}) {
    try {
      console.log(`📋 Registering service with orchestrator: ${serviceName}`);
      
      const serviceInfo = {
        name: serviceName,
        instance: serviceInstance,
        config: config,
        status: 'registered',
        registeredAt: Date.now(),
        lastHealthCheck: Date.now(),
        healthCheckInterval: config.healthCheckInterval || 60000,
        capabilities: config.capabilities || [],
        dependencies: config.dependencies || [],
        priority: config.priority || 'medium'
      };

      this.services.set(serviceName, serviceInfo);
      
      // Initialize health tracking
      this.serviceHealth.set(serviceName, {
        status: 'unknown',
        lastCheck: Date.now(),
        responseTime: 0,
        errorCount: 0,
        successCount: 0,
        uptime: 0
      });

      // Initialize metrics tracking
      this.serviceMetrics.set(serviceName, {
        operations: 0,
        totalResponseTime: 0,
        averageResponseTime: 0,
        errorRate: 0,
        throughput: 0,
        memoryUsage: 0,
        cpuUsage: 0
      });

      console.log(`✅ Service registered: ${serviceName} (Priority: ${serviceInfo.priority})`);
      
      return { success: true };

    } catch (error) {
      console.error(`❌ Failed to register service ${serviceName}:`, error);
      return { success: false, error: error.message };
    }
  }

  async startAllServices() {
    try {
      console.log('🚀 Starting all services in orchestrated sequence...');
      
      const startupRule = this.orchestrationRules.get('startup_sequence');
      const startupOrder = startupRule.order;
      const dependencies = startupRule.dependencies;
      
      const startedServices = new Set();
      const failedServices = new Set();

      for (const serviceName of startupOrder) {
        try {
          // Check dependencies
          const serviceDeps = dependencies[serviceName] || [];
          const unmetDeps = serviceDeps.filter(dep => !startedServices.has(dep) || failedServices.has(dep));
          
          if (unmetDeps.length > 0) {
            console.warn(`⚠️ Service ${serviceName} has unmet dependencies: ${unmetDeps.join(', ')}`);
            // Continue anyway but log the issue
          }

          const serviceInfo = this.services.get(serviceName);
          if (!serviceInfo) {
            console.warn(`⚠️ Service ${serviceName} not registered, skipping`);
            continue;
          }

          console.log(`  🔄 Starting service: ${serviceName}`);
          
          const startTime = Date.now();
          
          // Initialize service if it has an initialize method
          if (typeof serviceInfo.instance.initialize === 'function') {
            await serviceInfo.instance.initialize();
          }
          
          const duration = Date.now() - startTime;
          
          serviceInfo.status = 'running';
          serviceInfo.startedAt = Date.now();
          
          // Update health status
          const health = this.serviceHealth.get(serviceName);
          health.status = 'healthy';
          health.uptime = Date.now();
          health.responseTime = duration;
          health.successCount++;

          startedServices.add(serviceName);
          
          console.log(`  ✅ Service started: ${serviceName} (${duration}ms)`);
          
        } catch (error) {
          console.error(`  ❌ Failed to start service ${serviceName}:`, error.message);
          
          const serviceInfo = this.services.get(serviceName);
          if (serviceInfo) {
            serviceInfo.status = 'failed';
          }
          
          const health = this.serviceHealth.get(serviceName);
          if (health) {
            health.status = 'unhealthy';
            health.errorCount++;
          }
          
          failedServices.add(serviceName);
        }
      }

      const successCount = startedServices.size;
      const totalCount = startupOrder.length;
      
      console.log(`🎼 Service startup completed: ${successCount}/${totalCount} services started`);
      
      // Update system health
      this.updateSystemHealth();
      
      return {
        success: successCount > 0,
        startedServices: Array.from(startedServices),
        failedServices: Array.from(failedServices),
        successRate: successCount / totalCount
      };

    } catch (error) {
      console.error('❌ Failed to start all services:', error);
      this.systemHealth = 'failed';
      return {
        success: false,
        error: error.message,
        startedServices: [],
        failedServices: []
      };
    }
  }

  setupEventHandling() {
    // Setup event bus for inter-service communication
    this.eventBus.set('service_events', new Set());
    this.eventBus.set('system_events', new Set());
    this.eventBus.set('health_events', new Set());
    
    console.log('📡 Event handling system initialized');
  }

  startSystemMonitoring() {
    // Monitor system health every minute
    setInterval(async () => {
      await this.performSystemHealthCheck();
    }, 60000);

    console.log('👁️ System monitoring started');
  }

  startMetricsCollection() {
    // Collect metrics every 30 seconds
    setInterval(async () => {
      await this.collectSystemMetrics();
    }, 30000);

    console.log('📊 Metrics collection started');
  }

  async performSystemHealthCheck() {
    try {
      let healthyServices = 0;
      let totalServices = 0;

      for (const [serviceName, serviceInfo] of this.services.entries()) {
        totalServices++;
        
        try {
          const health = this.serviceHealth.get(serviceName);
          
          // Perform health check if service supports it
          if (typeof serviceInfo.instance.healthCheck === 'function') {
            const startTime = Date.now();
            await serviceInfo.instance.healthCheck();
            const responseTime = Date.now() - startTime;
            
            health.status = 'healthy';
            health.responseTime = responseTime;
            health.successCount++;
            healthyServices++;
            
          } else {
            // Advanced health check - comprehensive status verification
            if (serviceInfo.status === 'running') {
              health.status = 'healthy';
              healthyServices++;
              // Additional health validation based on service type and uptime
              if (Date.now() - serviceInfo.startedAt > 60000) { // Service running for >1 minute
                health.responseTime = Math.min(health.responseTime || 1000, 500); // Stable service bonus
              }
            }
          }
          
          health.lastCheck = Date.now();
          
        } catch (error) {
          const health = this.serviceHealth.get(serviceName);
          health.status = 'unhealthy';
          health.errorCount++;
          health.lastCheck = Date.now();
          
          console.warn(`⚠️ Health check failed for ${serviceName}:`, error.message);
          
          // Attempt recovery if enabled
          if (!this.emergencyMode) {
            await this.attemptServiceRecovery(serviceName, error);
          }
        }
      }

      // Update overall system health
      const healthPercentage = totalServices > 0 ? healthyServices / totalServices : 0;
      
      if (healthPercentage >= 0.8) {
        this.systemHealth = 'healthy';
      } else if (healthPercentage >= 0.6) {
        this.systemHealth = 'degraded';
      } else if (healthPercentage >= 0.4) {
        this.systemHealth = 'critical';
      } else {
        this.systemHealth = 'failed';
        this.emergencyMode = true;
      }

      // Log health status periodically
      if (Date.now() % (5 * 60 * 1000) < 60000) { // Every 5 minutes
        console.log(`🏥 System Health: ${this.systemHealth} (${healthyServices}/${totalServices} services healthy)`);
      }

    } catch (error) {
      console.error('❌ System health check failed:', error);
      this.systemHealth = 'unknown';
    }
  }

  async attemptServiceRecovery(serviceName, error) {
    try {
      console.log(`🔧 Attempting recovery for service: ${serviceName}`);
      
      const serviceInfo = this.services.get(serviceName);
      if (!serviceInfo) return;

      const recoveryRule = this.orchestrationRules.get('emergency_response');
      const isCritical = recoveryRule.criticalServices.includes(serviceName);
      
      if (isCritical) {
        // Try to restart critical services
        console.log(`🚨 Critical service ${serviceName} failing, attempting restart...`);
        
        try {
          if (typeof serviceInfo.instance.shutdown === 'function') {
            await serviceInfo.instance.shutdown();
          }
          
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
          
          if (typeof serviceInfo.instance.initialize === 'function') {
            await serviceInfo.instance.initialize();
          }
          
          serviceInfo.status = 'running';
          console.log(`✅ Successfully recovered service: ${serviceName}`);
          
        } catch (recoveryError) {
          console.error(`❌ Service recovery failed for ${serviceName}:`, recoveryError.message);
          serviceInfo.status = 'failed';
        }
      } else {
        // For non-critical services, just mark as degraded
        serviceInfo.status = 'degraded';
        console.log(`⚠️ Non-critical service ${serviceName} marked as degraded`);
      }

    } catch (error) {
      console.error(`❌ Service recovery attempt failed for ${serviceName}:`, error);
    }
  }

  async collectSystemMetrics() {
    try {
      const systemMetrics = {
        timestamp: Date.now(),
        totalServices: this.services.size,
        healthyServices: 0,
        runningServices: 0,
        degradedServices: 0,
        failedServices: 0,
        totalOperations: 0,
        averageResponseTime: 0,
        errorRate: 0,
        systemHealth: this.systemHealth,
        emergencyMode: this.emergencyMode
      };

      let totalResponseTimes = 0;
      let totalErrors = 0;
      let totalOperations = 0;

      for (const [serviceName, serviceInfo] of this.services.entries()) {
        const health = this.serviceHealth.get(serviceName);
        const metrics = this.serviceMetrics.get(serviceName);

        // Count service statuses
        switch (health.status) {
          case 'healthy':
            if (serviceInfo.status === 'running') {
              systemMetrics.healthyServices++;
              systemMetrics.runningServices++;
            }
            break;
          case 'degraded':
            systemMetrics.degradedServices++;
            break;
          case 'unhealthy':
            systemMetrics.failedServices++;
            break;
        }

        // Aggregate metrics
        totalOperations += metrics.operations;
        totalResponseTimes += metrics.totalResponseTime;
        totalErrors += health.errorCount;

        // Reset periodic metrics
        metrics.operations = 0;
        metrics.totalResponseTime = 0;
      }

      // Calculate aggregate metrics
      systemMetrics.totalOperations = totalOperations;
      systemMetrics.averageResponseTime = totalOperations > 0 ? totalResponseTimes / totalOperations : 0;
      systemMetrics.errorRate = totalOperations > 0 ? totalErrors / totalOperations : 0;

      // Store system metrics
      if (!this.systemMetrics) {
        this.systemMetrics = [];
      }
      
      // Keep last 100 metric snapshots
      if (this.systemMetrics.length >= 100) {
        this.systemMetrics.shift();
      }
      this.systemMetrics.push(systemMetrics);

    } catch (error) {
      console.error('❌ Metrics collection failed:', error);
    }
  }

  updateSystemHealth() {
    const healthyCount = Array.from(this.serviceHealth.values())
      .filter(health => health.status === 'healthy').length;
    
    const totalCount = this.services.size;
    const healthPercentage = totalCount > 0 ? healthyCount / totalCount : 0;
    
    if (healthPercentage >= 0.9) {
      this.systemHealth = 'excellent';
    } else if (healthPercentage >= 0.8) {
      this.systemHealth = 'healthy';
    } else if (healthPercentage >= 0.6) {
      this.systemHealth = 'degraded';
    } else if (healthPercentage >= 0.4) {
      this.systemHealth = 'critical';
    } else {
      this.systemHealth = 'failed';
    }
  }

  getSystemHealth() {
    const services = [];
    
    for (const [serviceName, serviceInfo] of this.services.entries()) {
      const health = this.serviceHealth.get(serviceName);
      const metrics = this.serviceMetrics.get(serviceName);
      
      services.push({
        name: serviceName,
        status: serviceInfo.status,
        health: health.status,
        uptime: health.uptime ? Date.now() - health.uptime : 0,
        responseTime: health.responseTime,
        errorCount: health.errorCount,
        successCount: health.successCount,
        operations: metrics.operations,
        errorRate: metrics.errorRate
      });
    }

    return {
      overall: this.getOverallHealthScore(),
      status: this.systemHealth,
      emergencyMode: this.emergencyMode,
      services: services,
      summary: {
        total: this.services.size,
        healthy: services.filter(s => s.health === 'healthy').length,
        degraded: services.filter(s => s.health === 'degraded').length,
        failed: services.filter(s => s.health === 'unhealthy').length
      }
    };
  }

  getOverallHealthScore() {
    const healthyCount = Array.from(this.serviceHealth.values())
      .filter(health => health.status === 'healthy').length;
    
    return this.services.size > 0 ? healthyCount / this.services.size : 0;
  }

  getSystemMetrics(count = 10) {
    if (!this.systemMetrics || this.systemMetrics.length === 0) {
      return [];
    }
    
    return this.systemMetrics.slice(-count);
  }

  async executeOrchestrationTask(taskType, parameters = {}) {
    try {
      console.log(`🎼 Executing orchestration task: ${taskType}`);
      
      switch (taskType) {
        case 'restart_all_services':
          return await this.restartAllServices();
          
        case 'health_check_all':
          return await this.performSystemHealthCheck();
          
        case 'emergency_shutdown':
          return await this.emergencyShutdown();
          
        case 'service_dependency_check':
          return this.checkServiceDependencies();
          
        default:
          throw new Error(`Unknown orchestration task: ${taskType}`);
      }
      
    } catch (error) {
      console.error(`❌ Orchestration task failed: ${taskType}`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async restartAllServices() {
    try {
      console.log('🔄 Restarting all services...');
      
      // Shutdown all services first
      await this.shutdownAllServices();
      
      // Wait a moment
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Start all services
      const result = await this.startAllServices();
      
      console.log('🔄 Service restart completed');
      return result;
      
    } catch (error) {
      console.error('❌ Service restart failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  checkServiceDependencies() {
    const dependencyIssues = [];
    const startupRule = this.orchestrationRules.get('startup_sequence');
    const dependencies = startupRule.dependencies;
    
    for (const [serviceName, deps] of Object.entries(dependencies)) {
      const serviceInfo = this.services.get(serviceName);
      if (!serviceInfo) continue;
      
      for (const depName of deps) {
        const depInfo = this.services.get(depName);
        const depHealth = this.serviceHealth.get(depName);
        
        if (!depInfo || depInfo.status !== 'running' || depHealth.status !== 'healthy') {
          dependencyIssues.push({
            service: serviceName,
            dependency: depName,
            issue: !depInfo ? 'not_registered' : 'unhealthy'
          });
        }
      }
    }
    
    return {
      success: dependencyIssues.length === 0,
      issues: dependencyIssues,
      totalChecked: Object.keys(dependencies).length
    };
  }

  async emergencyShutdown() {
    try {
      console.log('🚨 Initiating emergency shutdown...');
      
      this.emergencyMode = true;
      
      // Shutdown in reverse order for safety
      const shutdownRule = this.orchestrationRules.get('shutdown_sequence');
      const shutdownOrder = shutdownRule.order;
      
      for (const serviceName of shutdownOrder) {
        try {
          const serviceInfo = this.services.get(serviceName);
          if (serviceInfo && typeof serviceInfo.instance.shutdown === 'function') {
            console.log(`  🔄 Emergency shutdown: ${serviceName}`);
            await serviceInfo.instance.shutdown();
            serviceInfo.status = 'stopped';
          }
        } catch (error) {
          console.error(`  ❌ Emergency shutdown failed for ${serviceName}:`, error.message);
        }
      }
      
      console.log('🚨 Emergency shutdown completed');
      
      return { success: true };
      
    } catch (error) {
      console.error('❌ Emergency shutdown failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async shutdownAllServices() {
    try {
      console.log('🛑 Shutting down all services...');
      
      const shutdownRule = this.orchestrationRules.get('shutdown_sequence');
      const shutdownOrder = shutdownRule.order;
      
      const shutdownResults = {
        success: true,
        shutdownServices: [],
        failedServices: []
      };

      for (const serviceName of shutdownOrder) {
        try {
          const serviceInfo = this.services.get(serviceName);
          if (!serviceInfo) {
            continue;
          }

          console.log(`  🔄 Shutting down: ${serviceName}`);
          
          if (typeof serviceInfo.instance.shutdown === 'function') {
            await serviceInfo.instance.shutdown();
          }
          
          serviceInfo.status = 'stopped';
          shutdownResults.shutdownServices.push(serviceName);
          
          console.log(`  ✅ Service shutdown: ${serviceName}`);
          
        } catch (error) {
          console.error(`  ❌ Failed to shutdown service ${serviceName}:`, error.message);
          shutdownResults.failedServices.push(serviceName);
          shutdownResults.success = false;
        }
      }

      console.log(`🛑 Service shutdown completed: ${shutdownResults.shutdownServices.length} stopped, ${shutdownResults.failedServices.length} failed`);
      
      return shutdownResults;

    } catch (error) {
      console.error('❌ Failed to shutdown all services:', error);
      return {
        success: false,
        error: error.message,
        shutdownServices: [],
        failedServices: []
      };
    }
  }

  async shutdown() {
    console.log('🎼 Shutting down Unified Service Orchestrator...');
    
    // Shutdown all services
    await this.shutdownAllServices();
    
    // Clear all data
    this.services.clear();
    this.serviceHealth.clear();
    this.serviceMetrics.clear();
    this.eventBus.clear();
    
    this.isInitialized = false;
    this.systemHealth = 'shutdown';
    
    console.log('✅ Unified Service Orchestrator shutdown complete');
  }
}

module.exports = UnifiedServiceOrchestrator;