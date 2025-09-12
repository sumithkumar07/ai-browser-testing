
// 🧠 MEMORY OPTIMIZATION UTILITY
// Manages memory usage across all KAiro Browser services

class MemoryOptimizer {
  constructor() {
    this.memoryStats = new Map();
    this.cleanupTasks = [];
    this.monitoringInterval = null;
  }

  startMonitoring() {
    this.monitoringInterval = setInterval(() => {
      this.collectMemoryStats();
      this.performCleanup();
    }, 300000); // 5 minutes

    console.log('🧠 Memory monitoring started');
  }

  collectMemoryStats() {
    const memUsage = process.memoryUsage();
    this.memoryStats.set(Date.now(), {
      rss: Math.round(memUsage.rss / 1024 / 1024), // MB
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
      external: Math.round(memUsage.external / 1024 / 1024) // MB
    });

    // Keep only last 24 hours of stats
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    for (const [timestamp] of this.memoryStats) {
      if (timestamp < oneDayAgo) {
        this.memoryStats.delete(timestamp);
      }
    }
  }

  performCleanup() {
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }

    // Execute registered cleanup tasks
    this.cleanupTasks.forEach(task => {
      try {
        task();
      } catch (error) {
        console.warn('🚨 Cleanup task failed:', error.message);
      }
    });

    console.log('🧹 Memory cleanup performed');
  }

  registerCleanupTask(task) {
    if (typeof task === 'function') {
      this.cleanupTasks.push(task);
    }
  }

  getMemoryReport() {
    const current = process.memoryUsage();
    return {
      current: {
        rss: Math.round(current.rss / 1024 / 1024) + ' MB',
        heapUsed: Math.round(current.heapUsed / 1024 / 1024) + ' MB',
        heapTotal: Math.round(current.heapTotal / 1024 / 1024) + ' MB'
      },
      history: Array.from(this.memoryStats.entries()).slice(-10)
    };
  }

  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    console.log('🧠 Memory monitoring stopped');
  }
}

module.exports = { MemoryOptimizer };