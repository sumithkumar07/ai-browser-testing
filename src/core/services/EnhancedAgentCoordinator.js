// Enhanced Agent Coordinator - JavaScript Implementation
// Coordinates all enhanced services and manages complex multi-agent tasks

class EnhancedAgentCoordinator {
  static instance = null;

  static getInstance() {
    if (!EnhancedAgentCoordinator.instance) {
      EnhancedAgentCoordinator.instance = new EnhancedAgentCoordinator();
    }
    return EnhancedAgentCoordinator.instance;
  }

  constructor() {
    this.registeredServices = new Map();
    this.activeTasks = new Map();
    this.taskQueue = [];
    this.serviceHealth = new Map();
    this.coordinationRules = new Map();
    this.taskExecutionHistory = [];
    this.maxConcurrentTasks = 10;
    this.maxTaskHistorySize = 1000;
  }

  async initialize() {
    try {
      console.log('🎯 Initializing Enhanced Agent Coordinator...');
      
      // Initialize coordination rules
      this.initializeCoordinationRules();
      
      // Start service health monitoring
      this.startServiceHealthMonitoring();
      
      // Start task processor
      this.startTaskProcessor();
      
      console.log('✅ Enhanced Agent Coordinator initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Enhanced Agent Coordinator:', error);
      throw error;
    }
  }

  initializeCoordinationRules() {
    // Define how services should coordinate with each other
    this.coordinationRules.set('research_with_search', {
      services: ['DeepSearchEngine', 'AgentMemoryService'],
      coordination: 'sequential',
      dependencies: {
        'AgentMemoryService': ['DeepSearchEngine']
      },
      timeoutMs: 60000
    });

    this.coordinationRules.set('security_with_validation', {
      services: ['AdvancedSecurity', 'input_validation'],
      coordination: 'parallel',
      dependencies: {},
      timeoutMs: 30000
    });

    this.coordinationRules.set('workspace_with_integration', {
      services: ['ShadowWorkspace', 'CrossPlatformIntegration'],
      coordination: 'conditional',
      dependencies: {
        'CrossPlatformIntegration': ['ShadowWorkspace']
      },
      timeoutMs: 120000
    });

    console.log(`⚙️ Coordination rules initialized: ${this.coordinationRules.size} rules`);
  }

  async registerService(serviceName, serviceInstance, capabilities = {}) {
    try {
      console.log(`📋 Registering service: ${serviceName}`);
      
      this.registeredServices.set(serviceName, {
        instance: serviceInstance,
        capabilities: capabilities,
        registeredAt: Date.now(),
        lastHealthCheck: Date.now(),
        status: 'active'
      });

      // Initialize health status
      this.serviceHealth.set(serviceName, {
        status: 'healthy',
        lastCheck: Date.now(),
        responseTime: 0,
        errorCount: 0,
        successCount: 0
      });

      console.log(`✅ Service registered: ${serviceName}`);
      return { success: true };

    } catch (error) {
      console.error(`❌ Failed to register service ${serviceName}:`, error);
      return { success: false, error: error.message };
    }
  }

  async executeCoordinatedTask(taskDefinition, options = {}) {
    try {
      const taskId = `coord_task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      console.log(`🎯 Creating coordinated task: ${taskId}`);
      
      const task = {
        id: taskId,
        definition: taskDefinition,
        options: options,
        status: 'queued',
        priority: options.priority || 5,
        createdAt: Date.now(),
        requiredServices: this.identifyRequiredServices(taskDefinition),
        coordinationStrategy: this.determineCoordinationStrategy(taskDefinition),
        progress: 0,
        results: {},
        errors: []
      };

      // Validate required services are available
      const serviceCheck = this.validateRequiredServices(task.requiredServices);
      if (!serviceCheck.valid) {
        throw new Error(`Required services unavailable: ${serviceCheck.missing.join(', ')}`);
      }

      this.activeTasks.set(taskId, task);
      this.taskQueue.push(task);
      
      // Sort queue by priority
      this.taskQueue.sort((a, b) => b.priority - a.priority);
      
      console.log(`✅ Coordinated task queued: ${taskId} (Strategy: ${task.coordinationStrategy})`);
      
      return {
        success: true,
        taskId: taskId,
        estimatedDuration: this.estimateTaskDuration(task),
        coordinationStrategy: task.coordinationStrategy
      };
      
    } catch (error) {
      console.error('❌ Failed to create coordinated task:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  identifyRequiredServices(taskDefinition) {
    const services = [];
    
    // Analyze task definition to identify required services
    if (taskDefinition.type === 'research_analysis') {
      services.push('DeepSearchEngine', 'AgentMemoryService');
    }
    
    if (taskDefinition.type === 'secure_processing') {
      services.push('AdvancedSecurity', 'ShadowWorkspace');
    }
    
    if (taskDefinition.type === 'cross_platform_automation') {
      services.push('CrossPlatformIntegration', 'ShadowWorkspace');
    }
    
    if (taskDefinition.type === 'comprehensive_analysis') {
      services.push('DeepSearchEngine', 'AdvancedSecurity', 'AgentMemoryService');
    }

    // Add any explicitly required services
    if (taskDefinition.requiredServices) {
      services.push(...taskDefinition.requiredServices);
    }

    return [...new Set(services)]; // Remove duplicates
  }

  determineCoordinationStrategy(taskDefinition) {
    // Determine how services should be coordinated
    if (taskDefinition.coordinationStrategy) {
      return taskDefinition.coordinationStrategy;
    }

    const serviceCount = this.identifyRequiredServices(taskDefinition).length;
    
    if (serviceCount <= 1) return 'single';
    if (serviceCount === 2) return 'sequential';
    if (serviceCount >= 3) return 'orchestrated';
    
    return 'parallel';
  }

  validateRequiredServices(requiredServices) {
    const missing = [];
    const unhealthy = [];
    
    for (const serviceName of requiredServices) {
      if (!this.registeredServices.has(serviceName)) {
        missing.push(serviceName);
      } else {
        const health = this.serviceHealth.get(serviceName);
        if (health.status !== 'healthy') {
          unhealthy.push(serviceName);
        }
      }
    }
    
    return {
      valid: missing.length === 0 && unhealthy.length === 0,
      missing: missing,
      unhealthy: unhealthy
    };
  }

  estimateTaskDuration(task) {
    const baseTime = 30000; // 30 seconds base
    const serviceMultiplier = task.requiredServices.length * 10000; // 10 seconds per service
    
    let strategyMultiplier = 1;
    switch (task.coordinationStrategy) {
      case 'sequential': strategyMultiplier = 1.5; break;
      case 'orchestrated': strategyMultiplier = 2.0; break;
      case 'parallel': strategyMultiplier = 0.8; break;
    }
    
    return Math.floor((baseTime + serviceMultiplier) * strategyMultiplier);
  }

  startTaskProcessor() {
    // Process queued tasks every 15 seconds
    setInterval(async () => {
      await this.processTaskQueue();
    }, 15000);
    
    console.log('⚙️ Enhanced Agent Coordinator task processor started');
  }

  async processTaskQueue() {
    try {
      if (this.taskQueue.length === 0 || this.activeTasks.size >= this.maxConcurrentTasks) {
        return;
      }

      const task = this.taskQueue.shift();
      if (task) {
        await this.executeTask(task);
      }
      
    } catch (error) {
      console.error('❌ Task queue processing failed:', error);
    }
  }

  async executeTask(task) {
    try {
      console.log(`🚀 Executing coordinated task: ${task.id} (${task.coordinationStrategy})`);
      
      task.status = 'running';
      task.startedAt = Date.now();
      
      // Execute based on coordination strategy
      let result;
      switch (task.coordinationStrategy) {
        case 'single':
          result = await this.executeSingleServiceTask(task);
          break;
        case 'sequential':
          result = await this.executeSequentialTask(task);
          break;
        case 'parallel':
          result = await this.executeParallelTask(task);
          break;
        case 'orchestrated':
          result = await this.executeOrchestratedTask(task);
          break;
        default:
          result = await this.executeSequentialTask(task);
      }
      
      task.status = result.success ? 'completed' : 'failed';
      task.completedAt = Date.now();
      task.duration = task.completedAt - task.startedAt;
      task.results = result.data;
      task.progress = 100;
      
      if (!result.success) {
        task.errors.push(result.error);
      }
      
      // Record in history
      this.recordTaskExecution(task);
      
      console.log(`✅ Coordinated task completed: ${task.id} (${task.duration}ms)`);
      
    } catch (error) {
      console.error(`❌ Coordinated task failed: ${task.id}`, error);
      
      task.status = 'failed';
      task.completedAt = Date.now();
      task.duration = task.completedAt - task.startedAt;
      task.errors.push(error.message);
      
      this.recordTaskExecution(task);
    }
  }

  async executeSingleServiceTask(task) {
    try {
      const serviceName = task.requiredServices[0];
      const service = this.registeredServices.get(serviceName);
      
      if (!service) {
        throw new Error(`Service not found: ${serviceName}`);
      }

      // Execute task on single service
      const result = await this.executeServiceOperation(service.instance, task.definition);
      
      return {
        success: true,
        data: {
          serviceName: serviceName,
          result: result
        }
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async executeSequentialTask(task) {
    try {
      const results = {};
      
      for (const serviceName of task.requiredServices) {
        task.progress = (Object.keys(results).length / task.requiredServices.length) * 100;
        
        const service = this.registeredServices.get(serviceName);
        if (!service) {
          throw new Error(`Service not found: ${serviceName}`);
        }
        
        console.log(`  ⚡ Executing on service: ${serviceName}`);
        const result = await this.executeServiceOperation(service.instance, task.definition, results);
        results[serviceName] = result;
      }
      
      return {
        success: true,
        data: results
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async executeParallelTask(task) {
    try {
      const servicePromises = task.requiredServices.map(async (serviceName) => {
        const service = this.registeredServices.get(serviceName);
        if (!service) {
          throw new Error(`Service not found: ${serviceName}`);
        }
        
        console.log(`  ⚡ Executing on service: ${serviceName}`);
        const result = await this.executeServiceOperation(service.instance, task.definition);
        return { serviceName, result };
      });
      
      const results = await Promise.all(servicePromises);
      const resultMap = {};
      results.forEach(({ serviceName, result }) => {
        resultMap[serviceName] = result;
      });
      
      return {
        success: true,
        data: resultMap
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async executeOrchestratedTask(task) {
    try {
      const results = {};
      const executionPlan = this.createExecutionPlan(task.requiredServices);
      
      for (const phase of executionPlan) {
        console.log(`  🎼 Executing phase: ${phase.name}`);
        
        const phasePromises = phase.services.map(async (serviceName) => {
          const service = this.registeredServices.get(serviceName);
          if (!service) {
            throw new Error(`Service not found: ${serviceName}`);
          }
          
          const result = await this.executeServiceOperation(service.instance, task.definition, results);
          return { serviceName, result };
        });
        
        const phaseResults = await Promise.all(phasePromises);
        phaseResults.forEach(({ serviceName, result }) => {
          results[serviceName] = result;
        });
        
        task.progress = (executionPlan.indexOf(phase) + 1) / executionPlan.length * 100;
      }
      
      return {
        success: true,
        data: results
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  createExecutionPlan(services) {
    // Create a simple execution plan
    // In a full implementation, this would analyze dependencies and create optimal execution phases
    
    if (services.length <= 2) {
      return [{ name: 'primary', services: services }];
    }
    
    const midpoint = Math.ceil(services.length / 2);
    return [
      { name: 'phase1', services: services.slice(0, midpoint) },
      { name: 'phase2', services: services.slice(midpoint) }
    ];
  }

  async executeServiceOperation(serviceInstance, taskDefinition, previousResults = {}) {
    try {
      // Check if service has expected methods
      if (typeof serviceInstance.executeTask === 'function') {
        return await serviceInstance.executeTask(taskDefinition, previousResults);
      }
      
      if (typeof serviceInstance.execute === 'function') {
        return await serviceInstance.execute(taskDefinition, previousResults);
      }
      
      // Fallback for services with specific operation names
      const operationType = taskDefinition.operation || taskDefinition.type;
      if (operationType && typeof serviceInstance[operationType] === 'function') {
        return await serviceInstance[operationType](taskDefinition.parameters || taskDefinition, previousResults);
      }
      
      // Generic operation simulation
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      return {
        success: true,
        operation: operationType || 'generic',
        timestamp: Date.now(),
        data: `Operation completed on ${serviceInstance.constructor.name || 'Unknown Service'}`
      };
      
    } catch (error) {
      throw new Error(`Service operation failed: ${error.message}`);
    }
  }

  recordTaskExecution(task) {
    const record = {
      taskId: task.id,
      type: task.definition.type,
      coordinationStrategy: task.coordinationStrategy,
      requiredServices: task.requiredServices,
      status: task.status,
      duration: task.duration,
      completedAt: task.completedAt,
      errorCount: task.errors.length
    };
    
    this.taskExecutionHistory.push(record);
    
    // Maintain history size limit
    if (this.taskExecutionHistory.length > this.maxTaskHistorySize) {
      this.taskExecutionHistory.shift();
    }
  }

  startServiceHealthMonitoring() {
    // Monitor service health every 2 minutes
    setInterval(async () => {
      await this.checkServiceHealth();
    }, 2 * 60 * 1000);
    
    console.log('🏥 Service health monitoring started');
  }

  async checkServiceHealth() {
    for (const [serviceName, serviceInfo] of this.registeredServices.entries()) {
      try {
        const startTime = Date.now();
        
        // Perform health check
        let isHealthy = true;
        let responseTime = 0;
        
        if (typeof serviceInfo.instance.healthCheck === 'function') {
          await serviceInfo.instance.healthCheck();
          responseTime = Date.now() - startTime;
        } else {
          // Basic health check - just verify instance exists
          responseTime = 1;
        }
        
        const health = this.serviceHealth.get(serviceName);
        health.status = isHealthy ? 'healthy' : 'unhealthy';
        health.lastCheck = Date.now();
        health.responseTime = responseTime;
        health.successCount++;
        
      } catch (error) {
        const health = this.serviceHealth.get(serviceName);
        health.status = 'unhealthy';
        health.lastCheck = Date.now();
        health.errorCount++;
        
        console.warn(`⚠️ Service health check failed: ${serviceName}`, error.message);
      }
    }
  }

  getServiceStatus() {
    const services = [];
    
    for (const [serviceName, serviceInfo] of this.registeredServices.entries()) {
      const health = this.serviceHealth.get(serviceName);
      
      services.push({
        name: serviceName,
        status: serviceInfo.status,
        health: health.status,
        registeredAt: serviceInfo.registeredAt,
        lastHealthCheck: health.lastCheck,
        responseTime: health.responseTime,
        errorCount: health.errorCount,
        successCount: health.successCount,
        capabilities: serviceInfo.capabilities
      });
    }
    
    return {
      totalServices: services.length,
      healthyServices: services.filter(s => s.health === 'healthy').length,
      activeServices: services.filter(s => s.status === 'active').length,
      services: services
    };
  }

  getTaskStatus(taskId) {
    const task = this.activeTasks.get(taskId);
    if (!task) {
      return { found: false };
    }

    return {
      found: true,
      id: task.id,
      status: task.status,
      progress: task.progress,
      coordinationStrategy: task.coordinationStrategy,
      requiredServices: task.requiredServices,
      createdAt: task.createdAt,
      startedAt: task.startedAt,
      completedAt: task.completedAt,
      duration: task.duration,
      results: task.results,
      errors: task.errors
    };
  }

  getCoordinationStats() {
    const recentHistory = this.taskExecutionHistory.filter(record => 
      Date.now() - record.completedAt < 24 * 60 * 60 * 1000 // Last 24 hours
    );

    const stats = {
      totalTasks: recentHistory.length,
      completedTasks: recentHistory.filter(r => r.status === 'completed').length,
      failedTasks: recentHistory.filter(r => r.status === 'failed').length,
      averageDuration: 0,
      coordinationStrategies: {},
      activeTasks: this.activeTasks.size,
      queuedTasks: this.taskQueue.length
    };

    if (recentHistory.length > 0) {
      stats.averageDuration = recentHistory.reduce((sum, r) => sum + r.duration, 0) / recentHistory.length;
      
      recentHistory.forEach(record => {
        const strategy = record.coordinationStrategy;
        stats.coordinationStrategies[strategy] = (stats.coordinationStrategies[strategy] || 0) + 1;
      });
    }

    return stats;
  }

  async shutdown() {
    console.log('🎯 Shutting down Enhanced Agent Coordinator...');
    
    // Cancel all active tasks
    for (const [taskId, task] of this.activeTasks.entries()) {
      task.status = 'cancelled';
      console.log(`🚫 Cancelled task: ${taskId}`);
    }
    
    this.activeTasks.clear();
    this.taskQueue = [];
    
    console.log('✅ Enhanced Agent Coordinator shutdown complete');
  }
}

module.exports = EnhancedAgentCoordinator;