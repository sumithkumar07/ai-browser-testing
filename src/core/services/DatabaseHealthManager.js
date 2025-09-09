// Database Health Manager - Production Ready
// Handles database resilience, health checks, and recovery mechanisms

const fs = require('fs');
const path = require('path');

class DatabaseHealthManager {
  constructor(databaseService, options = {}) {
    this.db = databaseService;
    this.options = {
      healthCheckInterval: options.healthCheckInterval || 60000, // 1 minute
      backupInterval: options.backupInterval || 3600000, // 1 hour
      maxBackups: options.maxBackups || 10,
      repairAttempts: options.repairAttempts || 3,
      ...options
    };
    
    this.healthStatus = 'unknown';
    this.lastHealthCheck = 0;
    this.healthCheckInterval = null;
    this.backupInterval = null;
    this.repairAttempts = 0;
  }

  async initialize() {
    try {
      console.log('🏥 Initializing Database Health Manager...');
      
      // Initial health check
      await this.performHealthCheck();
      
      // Start periodic health checks
      this.startHealthChecking();
      
      // Start periodic backups
      this.startPeriodicBackups();
      
      console.log('✅ Database Health Manager initialized successfully');
      
    } catch (error) {
      console.error('❌ Failed to initialize Database Health Manager:', error);
      throw error;
    }
  }

  async performHealthCheck() {
    const startTime = Date.now();
    
    try {
      console.log('🔍 Performing database health check...');
      
      if (!this.db || !this.db.db) {
        throw new Error('Database not initialized');
      }

      // Check database accessibility
      const testQuery = this.db.db.prepare('SELECT 1 as test');
      const result = testQuery.get();
      
      if (!result || result.test !== 1) {
        throw new Error('Database not responding correctly');
      }

      // Check table integrity
      await this.checkTableIntegrity();
      
      // Check disk space
      await this.checkDiskSpace();
      
      // Performance check
      const duration = Date.now() - startTime;
      
      this.healthStatus = 'healthy';
      this.lastHealthCheck = Date.now();
      this.repairAttempts = 0;
      
      console.log(`✅ Database health check passed (${duration}ms)`);
      
      return {
        status: 'healthy',
        duration: duration,
        timestamp: this.lastHealthCheck
      };
      
    } catch (error) {
      console.error('❌ Database health check failed:', error.message);
      
      this.healthStatus = 'unhealthy';
      this.lastHealthCheck = Date.now();
      
      // Attempt repair if possible
      if (this.repairAttempts < this.options.repairAttempts) {
        console.log(`🔧 Attempting database repair (${this.repairAttempts + 1}/${this.options.repairAttempts})...`);
        const repairResult = await this.attemptRepair(error);
        
        if (repairResult.success) {
          return await this.performHealthCheck(); // Re-check after repair
        }
      }
      
      return {
        status: 'unhealthy',
        error: error.message,
        repairAttempts: this.repairAttempts,
        timestamp: this.lastHealthCheck
      };
    }
  }

  async checkTableIntegrity() {
    const requiredTables = [
      'bookmarks', 'history', 'agent_memory', 
      'agent_performance', 'background_tasks', 'agent_health'
    ];
    
    for (const tableName of requiredTables) {
      try {
        const result = this.db.db.prepare(`
          SELECT name FROM sqlite_master 
          WHERE type='table' AND name=?
        `).get(tableName);
        
        if (!result) {
          throw new Error(`Missing table: ${tableName}`);
        }
        
        // Check if table has data structure (not empty)
        const schema = this.db.db.prepare(`PRAGMA table_info(${tableName})`).all();
        if (schema.length === 0) {
          throw new Error(`Table ${tableName} has no schema`);
        }
        
      } catch (error) {
        throw new Error(`Table integrity check failed for ${tableName}: ${error.message}`);
      }
    }
    
    console.log('✅ All required tables verified');
  }

  async checkDiskSpace() {
    try {
      const dbPath = this.db.config?.path;
      if (!dbPath) return;
      
      const stats = fs.statSync(dbPath);
      const dbSize = stats.size;
      
      // Check if database is too large (>500MB by default)
      const maxSize = this.db.config?.maxSize || 500 * 1024 * 1024;
      
      if (dbSize > maxSize) {
        console.warn(`⚠️ Database size (${Math.round(dbSize / 1024 / 1024)}MB) exceeds limit (${Math.round(maxSize / 1024 / 1024)}MB)`);
        
        // Trigger cleanup
        await this.performMaintenance();
      }
      
      console.log(`💾 Database size: ${Math.round(dbSize / 1024 / 1024)}MB`);
      
    } catch (error) {
      console.warn('⚠️ Could not check disk space:', error.message);
    }
  }

  async attemptRepair(error) {
    this.repairAttempts++;
    
    try {
      console.log(`🔧 Attempting database repair for: ${error.message}`);
      
      if (error.message.includes('database is locked')) {
        // Database lock issue
        console.log('🔓 Attempting to unlock database...');
        
        // Close and reopen connection
        if (this.db.db) {
          this.db.db.close();
        }
        
        // Wait a moment
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Reinitialize database
        await this.db.initialize();
        
        return { success: true, method: 'unlock_and_reinitialize' };
        
      } else if (error.message.includes('Missing table')) {
        // Missing table - recreate
        console.log('🏗️ Recreating missing tables...');
        
        await this.db.createTables();
        await this.db.createIndexes();
        
        return { success: true, method: 'recreate_tables' };
        
      } else if (error.message.includes('corruption')) {
        // Database corruption - restore from backup
        console.log('🗂️ Attempting restore from backup...');
        
        const restoreResult = await this.restoreFromBackup();
        return restoreResult;
        
      } else {
        // Generic repair attempt
        console.log('🔨 Attempting VACUUM and integrity check...');
        
        try {
          this.db.db.prepare('VACUUM').run();
          const integrityResult = this.db.db.prepare('PRAGMA integrity_check').get();
          
          if (integrityResult && integrityResult.integrity_check === 'ok') {
            return { success: true, method: 'vacuum_repair' };
          }
        } catch (repairError) {
          console.error('🔨 Repair attempt failed:', repairError.message);
        }
      }
      
      return { success: false, error: 'Repair methods exhausted' };
      
    } catch (repairError) {
      console.error('❌ Database repair failed:', repairError.message);
      return { success: false, error: repairError.message };
    }
  }

  async createBackup() {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = this.getBackupPath(`backup_${timestamp}.db`);
      
      console.log(`💾 Creating database backup: ${backupPath}`);
      
      // Ensure backup directory exists
      const backupDir = path.dirname(backupPath);
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }
      
      // Create backup using SQLite backup API
      const backupDb = require('better-sqlite3')(backupPath);
      await this.db.db.backup(backupDb);
      backupDb.close();
      
      // Cleanup old backups
      await this.cleanupOldBackups();
      
      console.log('✅ Database backup created successfully');
      
      return {
        success: true,
        backupPath: backupPath,
        timestamp: timestamp
      };
      
    } catch (error) {
      console.error('❌ Database backup failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async restoreFromBackup() {
    try {
      const backups = await this.getAvailableBackups();
      
      if (backups.length === 0) {
        throw new Error('No backups available for restore');
      }
      
      // Use the most recent backup
      const latestBackup = backups[0];
      console.log(`🗂️ Restoring from backup: ${latestBackup.path}`);
      
      // Close current database
      if (this.db.db) {
        this.db.db.close();
      }
      
      // Copy backup to current location
      fs.copyFileSync(latestBackup.path, this.db.config.path);
      
      // Reinitialize database
      await this.db.initialize();
      
      console.log('✅ Database restored from backup successfully');
      
      return {
        success: true,
        backupUsed: latestBackup.path,
        restoredAt: Date.now()
      };
      
    } catch (error) {
      console.error('❌ Database restore failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async performMaintenance() {
    try {
      console.log('🧹 Performing database maintenance...');
      
      // Clean up expired data
      if (this.db.cleanupExpiredMemories) {
        await this.db.cleanupExpiredMemories();
      }
      
      if (this.db.cleanupOldHistory) {
        await this.db.cleanupOldHistory(90); // Keep 90 days
      }
      
      // Optimize database
      this.db.db.prepare('VACUUM').run();
      this.db.db.prepare('ANALYZE').run();
      
      console.log('✅ Database maintenance completed');
      
    } catch (error) {
      console.error('❌ Database maintenance failed:', error.message);
    }
  }

  getBackupPath(filename) {
    const dbDir = path.dirname(this.db.config?.path || '/tmp/kairo.db');
    return path.join(dbDir, 'backups', filename);
  }

  async getAvailableBackups() {
    try {
      const backupDir = path.dirname(this.getBackupPath(''));
      
      if (!fs.existsSync(backupDir)) {
        return [];
      }
      
      const files = fs.readdirSync(backupDir)
        .filter(file => file.endsWith('.db'))
        .map(file => ({
          path: path.join(backupDir, file),
          stats: fs.statSync(path.join(backupDir, file))
        }))
        .sort((a, b) => b.stats.mtime - a.stats.mtime); // Most recent first
      
      return files;
      
    } catch (error) {
      console.warn('⚠️ Could not list backups:', error.message);
      return [];
    }
  }

  async cleanupOldBackups() {
    try {
      const backups = await this.getAvailableBackups();
      
      if (backups.length > this.options.maxBackups) {
        const toDelete = backups.slice(this.options.maxBackups);
        
        for (const backup of toDelete) {
          fs.unlinkSync(backup.path);
          console.log(`🗑️ Deleted old backup: ${path.basename(backup.path)}`);
        }
      }
      
    } catch (error) {
      console.warn('⚠️ Could not cleanup old backups:', error.message);
    }
  }

  startHealthChecking() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    
    this.healthCheckInterval = setInterval(async () => {
      await this.performHealthCheck();
    }, this.options.healthCheckInterval);
    
    console.log(`🏥 Database health checking started (${this.options.healthCheckInterval / 1000}s intervals)`);
  }

  startPeriodicBackups() {
    if (this.backupInterval) {
      clearInterval(this.backupInterval);
    }
    
    this.backupInterval = setInterval(async () => {
      await this.createBackup();
    }, this.options.backupInterval);
    
    console.log(`💾 Periodic database backups started (${this.options.backupInterval / 1000 / 60}min intervals)`);
  }

  async shutdown() {
    console.log('🏥 Shutting down Database Health Manager...');
    
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
    
    if (this.backupInterval) {
      clearInterval(this.backupInterval);
      this.backupInterval = null;
    }
    
    // Create final backup before shutdown
    await this.createBackup();
    
    console.log('✅ Database Health Manager shutdown complete');
  }

  getHealthStatus() {
    return {
      status: this.healthStatus,
      lastHealthCheck: this.lastHealthCheck,
      repairAttempts: this.repairAttempts,
      isHealthy: this.healthStatus === 'healthy'
    };
  }
}

module.exports = { DatabaseHealthManager };