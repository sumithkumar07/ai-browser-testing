// Intelligent Service Manager - Replace Basic Service Management
// Smart service dormancy, predictive loading, and performance optimization

class IntelligentServiceManager {
  static instance = null;

  static getInstance() {
    if (!IntelligentServiceManager.instance) {
      IntelligentServiceManager.instance = new IntelligentServiceManager();
    }
    return IntelligentServiceManager.instance;
  }

  constructor() {
    this.services = new Map();
    this.serviceStates = new Map();
    this.usagePatterns = new Map();
    this.loadPredictions = new Map();
    this.performanceMetrics = new Map();
    this.dormancyThreshold = 5 * 60 * 1000; // 5 minutes
    this.memoryPressureThreshold = 400 * 1024 * 1024; // 400MB
    this.cpuUsageThreshold = 80; // 80%
    this.predictionWindow = 30 * 60 * 1000; // 30 minutes
    this.memoryPool = null;
  }

  async initialize() {
    try {
      console.log('🧠 Initializing Intelligent Service Manager...');
      
      await this.initializeMemoryPool();
      await this.setupPerformanceMonitoring();
      await this.startIntelligentScheduler();
      
      console.log('✅ Intelligent Service Manager initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Intelligent Service Manager:', error);
      throw error;
    }
  }

  async initializeMemoryPool() {
    this.memoryPool = {
      shared: new Map(),
      reserved: new Map(),
      cache: new Map(),
      totalAllocated: 0,
      maxSize: 200 * 1024 * 1024, // 200MB pool
      cleanupThreshold: 150 * 1024 * 1024 // 150MB
    };

    console.log('💾 Shared memory pool initialized');
  }

  async registerService(serviceName, serviceInstance, config = {}) {
    try {
      const serviceConfig = {
        instance: serviceInstance,
        priority: config.priority || 'medium',
        dependencies: config.dependencies || [],
        usagePattern: config.usagePattern || 'on-demand',
        memoryFootprint: config.memoryFootprint || 'medium',
        cpuIntensive: config.cpuIntensive || false,
        canDormant: config.canDormant !== false,
        preloadConditions: config.preloadConditions || []
      };

      this.services.set(serviceName, serviceConfig);
      this.serviceStates.set(serviceName, {
        state: 'inactive',
        lastAccessed: 0,
        accessCount: 0,
        performanceScore: 100,
        memoryUsage: 0,
        cpuUsage: 0,
        errors: 0
      });

      this.usagePatterns.set(serviceName, {
        accessTimes: [],
        peakUsageHours: [],
        averageSessionDuration: 0,
        frequencyPattern: 'irregular'
      });

      console.log(`📝 Service registered: ${serviceName} (Priority: ${serviceConfig.priority})`);
      return true;

    } catch (error) {
      console.error(`❌ Failed to register service ${serviceName}:`, error);
      return false;
    }
  }

  async activateService(serviceName, context = {}) {
    try {
      const service = this.services.get(serviceName);
      const state = this.serviceStates.get(serviceName);

      if (!service || !state) {
        console.warn(`⚠️ Service ${serviceName} not found`);
        return { success: false, error: 'Service not found' };
      }

      // Check system resources before activation
      const resourceCheck = await this.checkSystemResources();
      if (!resourceCheck.canActivate) {
        console.warn(`⚠️ Cannot activate ${serviceName}: ${resourceCheck.reason}`);
        
        // Try to free resources
        await this.optimizeResourceUsage();
        
        // Recheck after optimization
        const recheckResult = await this.checkSystemResources();
        if (!recheckResult.canActivate) {
          return { success: false, error: resourceCheck.reason };
        }
      }

      // Activate service
      if (state.state === 'dormant') {
        await this.wakeUpService(serviceName);
      } else if (state.state === 'inactive') {
        await this.startService(serviceName);
      }

      // Update usage tracking
      this.updateUsagePattern(serviceName);

      // Start predictive pre-loading
      await this.updateLoadPredictions(serviceName, context);

      console.log(`✅ Service activated: ${serviceName}`);
      return { success: true, state: 'active' };

    } catch (error) {
      console.error(`❌ Failed to activate service ${serviceName}:`, error);
      return { success: false, error: error.message };
    }
  }

  async deactivateService(serviceName, force = false) {
    try {
      const service = this.services.get(serviceName);
      const state = this.serviceStates.get(serviceName);

      if (!service || !state) return false;

      // Check if service can be deactivated
      if (!force && !this.canDeactivateService(serviceName)) {
        console.log(`⚠️ Cannot deactivate ${serviceName}: has active dependencies`);
        return false;
      }

      // Graceful shutdown
      if (service.instance && typeof service.instance.shutdown === 'function') {
        await service.instance.shutdown();
      }

      state.state = service.canDormant ? 'dormant' : 'inactive';
      state.lastAccessed = Date.now();

      // Free allocated memory
      await this.freeServiceMemory(serviceName);

      console.log(`💤 Service deactivated: ${serviceName} (State: ${state.state})`);
      return true;

    } catch (error) {
      console.error(`❌ Failed to deactivate service ${serviceName}:`, error);
      return false;
    }
  }

  async checkSystemResources() {
    const memoryUsage = process.memoryUsage();
    const totalMemory = memoryUsage.heapUsed + memoryUsage.external;

    // Memory pressure check
    if (totalMemory > this.memoryPressureThreshold) {
      return {
        canActivate: false,
        reason: 'Memory pressure detected',
        memoryUsage: totalMemory,
        recommendation: 'free_memory'
      };
    }

    // Active service count check
    const activeServices = Array.from(this.serviceStates.values())
      .filter(state => state.state === 'active').length;

    if (activeServices > 8) { // Maximum concurrent services
      return {
        canActivate: false,
        reason: 'Too many active services',
        activeCount: activeServices,
        recommendation: 'dormant_unused'
      };
    }

    return { canActivate: true };
  }

  async optimizeResourceUsage() {
    try {
      console.log('⚡ Optimizing system resource usage...');

      // Phase 1: Put unused services to dormant
      await this.dormantUnusedServices();

      // Phase 2: Cleanup shared memory
      await this.cleanupSharedMemory();

      // Phase 3: Garbage collection if available
      if (global.gc) {
        global.gc();
        console.log('🧹 Forced garbage collection');
      }

      // Phase 4: Optimize service priorities
      await this.optimizeServicePriorities();

      console.log('✅ Resource optimization complete');

    } catch (error) {
      console.error('❌ Resource optimization failed:', error);
    }
  }

  async dormantUnusedServices() {
    const now = Date.now();
    const servicesToDormant = [];

    for (const [serviceName, state] of this.serviceStates.entries()) {
      if (state.state === 'active' && 
          (now - state.lastAccessed) > this.dormancyThreshold) {
        
        const service = this.services.get(serviceName);
        if (service && service.canDormant && service.priority !== 'critical') {
          servicesToDormant.push(serviceName);
        }
      }
    }

    for (const serviceName of servicesToDormant) {
      await this.putServiceToDormant(serviceName);
    }

    console.log(`💤 Put ${servicesToDormant.length} services to dormant state`);
  }

  async putServiceToDormant(serviceName) {
    try {
      const service = this.services.get(serviceName);
      const state = this.serviceStates.get(serviceName);

      if (!service || !state) return false;

      // Save service state to memory pool
      await this.saveServiceStateToPool(serviceName);

      // Gracefully pause service
      if (service.instance && typeof service.instance.pause === 'function') {
        await service.instance.pause();
      }

      state.state = 'dormant';
      state.lastAccessed = Date.now();

      console.log(`💤 Service put to dormant: ${serviceName}`);
      return true;

    } catch (error) {
      console.error(`❌ Failed to put service to dormant ${serviceName}:`, error);
      return false;
    }
  }

  async wakeUpService(serviceName) {
    try {
      const service = this.services.get(serviceName);
      const state = this.serviceStates.get(serviceName);

      if (!service || !state || state.state !== 'dormant') return false;

      console.log(`⏰ Waking up service: ${serviceName}`);

      // Restore service state from memory pool
      await this.restoreServiceStateFromPool(serviceName);

      // Resume service
      if (service.instance && typeof service.instance.resume === 'function') {
        await service.instance.resume();
      } else if (service.instance && typeof service.instance.initialize === 'function') {
        await service.instance.initialize();
      }

      state.state = 'active';
      state.lastAccessed = Date.now();

      console.log(`✅ Service awakened: ${serviceName}`);
      return true;

    } catch (error) {
      console.error(`❌ Failed to wake up service ${serviceName}:`, error);
      return false;
    }
  }

  async updateLoadPredictions(serviceName, context) {
    try {
      const pattern = this.usagePatterns.get(serviceName);
      if (!pattern) return;

      // Analyze current context for prediction
      const currentHour = new Date().getHours();
      const dayOfWeek = new Date().getDay();

      // Predict services likely to be needed soon
      const predictions = [];

      // Time-based predictions
      if (pattern.peakUsageHours.includes(currentHour)) {
        predictions.push({
          service: serviceName,
          probability: 0.8,
          reason: 'peak_usage_hour',
          timeWindow: 15 * 60 * 1000 // 15 minutes
        });
      }

      // Context-based predictions
      if (context.intent === 'research' && serviceName === 'DeepSearchEngine') {
        predictions.push({
          service: 'AgentMemoryService',
          probability: 0.7,
          reason: 'research_workflow',
          timeWindow: 10 * 60 * 1000
        });
      }

      // Store predictions
      this.loadPredictions.set(serviceName, predictions);

      // Execute pre-loading for high probability predictions
      for (const prediction of predictions) {
        if (prediction.probability > 0.75) {
          setTimeout(async () => {
            await this.preloadService(prediction.service);
          }, Math.random() * prediction.timeWindow);
        }
      }

    } catch (error) {
      console.error(`❌ Failed to update load predictions for ${serviceName}:`, error);
    }
  }

  async preloadService(serviceName) {
    try {
      const service = this.services.get(serviceName);
      const state = this.serviceStates.get(serviceName);

      if (!service || !state || state.state === 'active') return;

      console.log(`🚀 Preloading service: ${serviceName}`);

      // Check resources before preloading
      const resourceCheck = await this.checkSystemResources();
      if (!resourceCheck.canActivate) {
        console.log(`⚠️ Cannot preload ${serviceName}: ${resourceCheck.reason}`);
        return;
      }

      // Warm up service
      if (state.state === 'dormant') {
        await this.wakeUpService(serviceName);
      } else {
        await this.startService(serviceName);
      }

      console.log(`✅ Service preloaded: ${serviceName}`);

    } catch (error) {
      console.error(`❌ Failed to preload service ${serviceName}:`, error);
    }
  }

  async startService(serviceName) {
    try {
      const service = this.services.get(serviceName);
      const state = this.serviceStates.get(serviceName);

      if (!service || !state) return false;

      // Allocate memory from pool
      await this.allocateServiceMemory(serviceName);

      // Initialize service
      if (service.instance && typeof service.instance.initialize === 'function') {
        await service.instance.initialize();
      }

      state.state = 'active';
      state.lastAccessed = Date.now();
      state.accessCount++;

      return true;

    } catch (error) {
      console.error(`❌ Failed to start service ${serviceName}:`, error);
      state.state = 'error';
      state.errors++;
      return false;
    }
  }

  updateUsagePattern(serviceName) {
    const pattern = this.usagePatterns.get(serviceName);
    if (!pattern) return;

    const now = Date.now();
    const currentHour = new Date().getHours();

    // Update access times
    pattern.accessTimes.push(now);
    if (pattern.accessTimes.length > 100) {
      pattern.accessTimes = pattern.accessTimes.slice(-50);
    }

    // Update peak usage hours
    if (!pattern.peakUsageHours.includes(currentHour)) {
      const hourlyCount = pattern.accessTimes.filter(time => {
        const hour = new Date(time).getHours();
        return hour === currentHour;
      }).length;

      if (hourlyCount >= 3) { // Threshold for peak hour
        pattern.peakUsageHours.push(currentHour);
      }
    }

    // Determine frequency pattern
    const accessCount = pattern.accessTimes.length;
    const timeSpan = now - (pattern.accessTimes[0] || now);
    const frequency = accessCount / (timeSpan / (60 * 60 * 1000)); // accesses per hour

    if (frequency > 10) pattern.frequencyPattern = 'very_frequent';
    else if (frequency > 5) pattern.frequencyPattern = 'frequent';
    else if (frequency > 1) pattern.frequencyPattern = 'regular';
    else pattern.frequencyPattern = 'irregular';
  }

  async setupPerformanceMonitoring() {
    setInterval(async () => {
      await this.collectPerformanceMetrics();
    }, 30000); // Every 30 seconds

    console.log('📊 Performance monitoring started');
  }

  async collectPerformanceMetrics() {
    try {
      const memoryUsage = process.memoryUsage();
      
      for (const [serviceName, state] of this.serviceStates.entries()) {
        if (state.state === 'active') {
          const service = this.services.get(serviceName);
          
          // Estimate service memory usage
          const serviceMemory = this.estimateServiceMemory(serviceName);
          state.memoryUsage = serviceMemory;

          // Calculate performance score
          const performanceScore = this.calculatePerformanceScore(serviceName, state);
          state.performanceScore = performanceScore;

          // Store metrics
          if (!this.performanceMetrics.has(serviceName)) {
            this.performanceMetrics.set(serviceName, []);
          }

          const metrics = this.performanceMetrics.get(serviceName);
          metrics.push({
            timestamp: Date.now(),
            memoryUsage: serviceMemory,
            performanceScore: performanceScore,
            accessCount: state.accessCount,
            errors: state.errors
          });

          // Maintain metrics history
          if (metrics.length > 100) {
            this.performanceMetrics.set(serviceName, metrics.slice(-50));
          }
        }
      }

    } catch (error) {
      console.error('❌ Performance metrics collection failed:', error);
    }
  }

  calculatePerformanceScore(serviceName, state) {
    let score = 100;

    // Penalty for errors
    if (state.errors > 0) {
      score -= Math.min(30, state.errors * 5);
    }

    // Penalty for high memory usage
    const memoryMB = state.memoryUsage / (1024 * 1024);
    if (memoryMB > 50) {
      score -= Math.min(20, (memoryMB - 50) * 0.5);
    }

    // Bonus for frequent usage
    const pattern = this.usagePatterns.get(serviceName);
    if (pattern && pattern.frequencyPattern === 'frequent') {
      score += 5;
    }

    return Math.max(0, Math.min(100, score));
  }

  async startIntelligentScheduler() {
    // Main scheduling loop
    setInterval(async () => {
      await this.intelligentSchedulingCycle();
    }, 60000); // Every minute

    console.log('🧠 Intelligent scheduler started');
  }

  async intelligentSchedulingCycle() {
    try {
      // Check for resource optimization opportunities
      await this.checkOptimizationOpportunities();

      // Execute predictive pre-loading
      await this.executePredictiveLoading();

      // Cleanup expired predictions
      this.cleanupExpiredPredictions();

      // Log status periodically
      if (Date.now() % (5 * 60 * 1000) < 60000) { // Every 5 minutes
        this.logSchedulerStatus();
      }

    } catch (error) {
      console.error('❌ Intelligent scheduling cycle failed:', error);
    }
  }

  async checkOptimizationOpportunities() {
    const memoryUsage = process.memoryUsage().heapUsed;
    
    if (memoryUsage > this.memoryPressureThreshold * 0.8) {
      console.log('⚠️ Memory pressure detected, optimizing...');
      await this.optimizeResourceUsage();
    }

    // Check for underperforming services
    for (const [serviceName, state] of this.serviceStates.entries()) {
      if (state.performanceScore < 50 && state.state === 'active') {
        console.log(`⚠️ Service ${serviceName} underperforming, considering restart`);
        await this.restartUnderperformingService(serviceName);
      }
    }
  }

  async executePredictiveLoading() {
    const now = Date.now();
    
    for (const [serviceName, predictions] of this.loadPredictions.entries()) {
      for (const prediction of predictions) {
        const timeWindow = prediction.timeWindow || 300000; // 5 minutes default
        const shouldPreload = Math.random() < prediction.probability && 
                             (now - prediction.createdAt < timeWindow);

        if (shouldPreload) {
          await this.preloadService(prediction.service);
        }
      }
    }
  }

  // Memory management methods
  async allocateServiceMemory(serviceName) {
    const service = this.services.get(serviceName);
    if (!service) return;

    const estimatedSize = this.getEstimatedMemorySize(service.memoryFootprint);
    
    if (this.memoryPool.totalAllocated + estimatedSize > this.memoryPool.maxSize) {
      await this.cleanupSharedMemory();
    }

    this.memoryPool.reserved.set(serviceName, estimatedSize);
    this.memoryPool.totalAllocated += estimatedSize;
  }

  async freeServiceMemory(serviceName) {
    const allocatedSize = this.memoryPool.reserved.get(serviceName) || 0;
    this.memoryPool.reserved.delete(serviceName);
    this.memoryPool.shared.delete(serviceName);
    this.memoryPool.totalAllocated -= allocatedSize;
  }

  async cleanupSharedMemory() {
    if (this.memoryPool.totalAllocated < this.memoryPool.cleanupThreshold) return;

    console.log('🧹 Cleaning up shared memory pool...');

    // Remove cache entries for inactive services
    const inactiveServices = Array.from(this.serviceStates.entries())
      .filter(([_, state]) => state.state !== 'active')
      .map(([name, _]) => name);

    let freedMemory = 0;
    inactiveServices.forEach(serviceName => {
      const cacheSize = this.memoryPool.cache.get(serviceName) || 0;
      this.memoryPool.cache.delete(serviceName);
      freedMemory += cacheSize;
    });

    this.memoryPool.totalAllocated -= freedMemory;
    console.log(`✅ Freed ${Math.round(freedMemory / 1024 / 1024)}MB from memory pool`);
  }

  // Helper methods
  canDeactivateService(serviceName) {
    // Check if other services depend on this one
    for (const [otherName, otherService] of this.services.entries()) {
      if (otherName !== serviceName && 
          otherService.dependencies.includes(serviceName)) {
        const otherState = this.serviceStates.get(otherName);
        if (otherState && otherState.state === 'active') {
          return false;
        }
      }
    }
    return true;
  }

  getEstimatedMemorySize(footprint) {
    const sizes = {
      small: 10 * 1024 * 1024,    // 10MB
      medium: 25 * 1024 * 1024,   // 25MB
      large: 50 * 1024 * 1024,    // 50MB
      xlarge: 100 * 1024 * 1024   // 100MB
    };
    return sizes[footprint] || sizes.medium;
  }

  estimateServiceMemory(serviceName) {
    const service = this.services.get(serviceName);
    return service ? this.getEstimatedMemorySize(service.memoryFootprint) : 0;
  }

  logSchedulerStatus() {
    const activeServices = Array.from(this.serviceStates.values())
      .filter(state => state.state === 'active').length;
    
    const dormantServices = Array.from(this.serviceStates.values())
      .filter(state => state.state === 'dormant').length;

    const memoryUsageMB = Math.round(this.memoryPool.totalAllocated / 1024 / 1024);

    console.log(`🧠 Service Manager Status: ${activeServices} active, ${dormantServices} dormant, ${memoryUsageMB}MB allocated`);
  }

  async saveServiceStateToPool(serviceName) {
    const service = this.services.get(serviceName);
    if (service && service.instance && typeof service.instance.getState === 'function') {
      const state = await service.instance.getState();
      this.memoryPool.shared.set(serviceName + '_state', state);
    }
  }

  async restoreServiceStateFromPool(serviceName) {
    const state = this.memoryPool.shared.get(serviceName + '_state');
    const service = this.services.get(serviceName);
    
    if (state && service && service.instance && typeof service.instance.setState === 'function') {
      await service.instance.setState(state);
    }
  }

  async restartUnderperformingService(serviceName) {
    console.log(`🔄 Restarting underperforming service: ${serviceName}`);
    
    await this.deactivateService(serviceName, true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Brief pause
    await this.activateService(serviceName);
  }

  cleanupExpiredPredictions() {
    const now = Date.now();
    
    for (const [serviceName, predictions] of this.loadPredictions.entries()) {
      const validPredictions = predictions.filter(pred => 
        (now - pred.createdAt) < (pred.timeWindow || 300000)
      );
      
      if (validPredictions.length !== predictions.length) {
        this.loadPredictions.set(serviceName, validPredictions);
      }
    }
  }

  // Public API methods
  async getServiceStatus(serviceName) {
    const state = this.serviceStates.get(serviceName);
    const service = this.services.get(serviceName);
    
    if (!state || !service) {
      return { found: false };
    }

    return {
      found: true,
      serviceName: serviceName,
      state: state.state,
      lastAccessed: state.lastAccessed,
      accessCount: state.accessCount,
      performanceScore: state.performanceScore,
      memoryUsage: state.memoryUsage,
      priority: service.priority,
      canDormant: service.canDormant
    };
  }

  async getAllServicesStatus() {
    const status = {
      totalServices: this.services.size,
      activeServices: 0,
      dormantServices: 0,
      inactiveServices: 0,
      totalMemoryUsage: this.memoryPool.totalAllocated,
      averagePerformanceScore: 0,
      services: []
    };

    let totalPerformanceScore = 0;
    let performanceServiceCount = 0;

    for (const [serviceName, state] of this.serviceStates.entries()) {
      const serviceStatus = await this.getServiceStatus(serviceName);
      status.services.push(serviceStatus);

      switch (state.state) {
        case 'active': status.activeServices++; break;
        case 'dormant': status.dormantServices++; break;
        case 'inactive': status.inactiveServices++; break;
      }

      if (state.performanceScore > 0) {
        totalPerformanceScore += state.performanceScore;
        performanceServiceCount++;
      }
    }

    if (performanceServiceCount > 0) {
      status.averagePerformanceScore = totalPerformanceScore / performanceServiceCount;
    }

    return status;
  }

  async shutdown() {
    console.log('🧠 Shutting down Intelligent Service Manager...');
    
    // Deactivate all services
    for (const serviceName of this.services.keys()) {
      await this.deactivateService(serviceName, true);
    }

    // Clear memory pool
    this.memoryPool.shared.clear();
    this.memoryPool.reserved.clear();
    this.memoryPool.cache.clear();
    
    console.log('✅ Intelligent Service Manager shutdown complete');
  }
}

module.exports = IntelligentServiceManager;