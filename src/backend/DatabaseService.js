// Data Persistence Layer - ZERO UI IMPACT
// Provides SQLite database functionality for all agent data storage

const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

class DatabaseService {
  constructor(config) {
    this.db = null;
    this.config = config;
  }

  async initialize() {
    try {
      console.log('🗄️ Initializing Database Service (Backend Only)...');
      
      // Ensure data directory exists
      const dbDir = path.dirname(this.config.path);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }

      // Initialize SQLite database
      this.db = new Database(this.config.path);
      this.db.pragma('journal_mode = WAL');
      this.db.pragma('synchronous = NORMAL');
      this.db.pragma('cache_size = 1000');
      this.db.pragma('temp_store = MEMORY');

      // Create all tables
      await this.createTables();
      await this.createIndexes();
      
      console.log('✅ Database Service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Database Service:', error);
      throw error;
    }
  }

  async createTables() {
    if (!this.db) throw new Error('Database not initialized');

    // Bookmarks table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS bookmarks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        url TEXT NOT NULL,
        description TEXT,
        tags TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        visit_count INTEGER DEFAULT 0,
        last_visited INTEGER,
        favicon TEXT,
        category TEXT
      )
    `);

    // History table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS history (
        id TEXT PRIMARY KEY,
        url TEXT NOT NULL,
        title TEXT NOT NULL,
        visited_at INTEGER NOT NULL,
        duration INTEGER DEFAULT 0,
        page_type TEXT,
        exit_type TEXT,
        referrer TEXT,
        search_query TEXT
      )
    `);

    // Agent Memory table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS agent_memory (
        id TEXT PRIMARY KEY,
        agent_id TEXT NOT NULL,
        type TEXT NOT NULL,
        content TEXT NOT NULL,
        importance INTEGER NOT NULL,
        tags TEXT,
        created_at INTEGER NOT NULL,
        expires_at INTEGER,
        related_memories TEXT,
        metadata TEXT
      )
    `);

    // Agent Performance Metrics table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS agent_performance (
        id TEXT PRIMARY KEY,
        agent_id TEXT NOT NULL,
        task_type TEXT NOT NULL,
        start_time INTEGER NOT NULL,
        end_time INTEGER NOT NULL,
        duration INTEGER NOT NULL,
        success INTEGER NOT NULL,
        error_message TEXT,
        resource_usage TEXT,
        quality_score INTEGER,
        metadata TEXT
      )
    `);

    // Background Tasks table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS background_tasks (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        priority INTEGER NOT NULL,
        status TEXT NOT NULL,
        payload TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        scheduled_for INTEGER,
        started_at INTEGER,
        completed_at INTEGER,
        retry_count INTEGER DEFAULT 0,
        max_retries INTEGER DEFAULT 3,
        last_error TEXT,
        agent_id TEXT
      )
    `);

    // Agent Health table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS agent_health (
        agent_id TEXT PRIMARY KEY,
        status TEXT NOT NULL,
        last_health_check INTEGER NOT NULL,
        response_time INTEGER NOT NULL,
        error_rate REAL NOT NULL,
        memory_usage INTEGER NOT NULL,
        success_rate REAL NOT NULL,
        diagnostics TEXT
      )
    `);
  }

  async createIndexes() {
    if (!this.db) throw new Error('Database not initialized');

    // ENHANCED: Additional performance-critical indexes for better query speed
    this.db.exec('CREATE INDEX IF NOT EXISTS idx_bookmarks_url ON bookmarks(url)');
    this.db.exec('CREATE INDEX IF NOT EXISTS idx_bookmarks_title ON bookmarks(title)');
    this.db.exec('CREATE INDEX IF NOT EXISTS idx_bookmarks_category ON bookmarks(category)');
    this.db.exec('CREATE INDEX IF NOT EXISTS idx_bookmarks_updated ON bookmarks(updated_at DESC)');
    this.db.exec('CREATE INDEX IF NOT EXISTS idx_bookmarks_tags ON bookmarks(tags)');
    
    this.db.exec('CREATE INDEX IF NOT EXISTS idx_history_url ON history(url)');
    this.db.exec('CREATE INDEX IF NOT EXISTS idx_history_visited ON history(visited_at DESC)');
    this.db.exec('CREATE INDEX IF NOT EXISTS idx_history_title ON history(title)');
    this.db.exec('CREATE INDEX IF NOT EXISTS idx_history_duration ON history(duration)');
    
    this.db.exec('CREATE INDEX IF NOT EXISTS idx_agent_memory_agent ON agent_memory(agent_id)');
    this.db.exec('CREATE INDEX IF NOT EXISTS idx_agent_memory_type ON agent_memory(type)');
    this.db.exec('CREATE INDEX IF NOT EXISTS idx_agent_memory_importance ON agent_memory(importance DESC)');
    this.db.exec('CREATE INDEX IF NOT EXISTS idx_agent_memory_created ON agent_memory(created_at DESC)');
    this.db.exec('CREATE INDEX IF NOT EXISTS idx_agent_memory_expires ON agent_memory(expires_at)');
    
    this.db.exec('CREATE INDEX IF NOT EXISTS idx_agent_performance_agent ON agent_performance(agent_id)');
    this.db.exec('CREATE INDEX IF NOT EXISTS idx_agent_performance_start ON agent_performance(start_time DESC)');
    this.db.exec('CREATE INDEX IF NOT EXISTS idx_agent_performance_success ON agent_performance(success)');
    this.db.exec('CREATE INDEX IF NOT EXISTS idx_agent_performance_task_type ON agent_performance(task_type)');
    
    this.db.exec('CREATE INDEX IF NOT EXISTS idx_background_tasks_status ON background_tasks(status)');
    this.db.exec('CREATE INDEX IF NOT EXISTS idx_background_tasks_priority ON background_tasks(priority DESC)');
    this.db.exec('CREATE INDEX IF NOT EXISTS idx_background_tasks_scheduled ON background_tasks(scheduled_for)');
    this.db.exec('CREATE INDEX IF NOT EXISTS idx_background_tasks_agent ON background_tasks(agent_id)');
    this.db.exec('CREATE INDEX IF NOT EXISTS idx_background_tasks_type ON background_tasks(type)');
    
    this.db.exec('CREATE INDEX IF NOT EXISTS idx_agent_health_status ON agent_health(status)');
    this.db.exec('CREATE INDEX IF NOT EXISTS idx_agent_health_check ON agent_health(last_health_check DESC)');
    
    // ENHANCED: Add system config table for better data management with data_type support
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS system_config (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        type TEXT NOT NULL,
        data_type TEXT DEFAULT 'string',
        updated_at INTEGER NOT NULL,
        category TEXT DEFAULT 'general'
      )
    `);
    this.db.exec('CREATE INDEX IF NOT EXISTS idx_system_config_category ON system_config(category)');
    this.db.exec('CREATE INDEX IF NOT EXISTS idx_system_config_updated ON system_config(updated_at DESC)');
    
    // CRITICAL FIX: Add data_type column if it doesn't exist (backwards compatibility)
    try {
      this.db.exec('ALTER TABLE system_config ADD COLUMN data_type TEXT DEFAULT "string"');
    } catch (error) {
      // Column already exists, this is expected
    }
  }

  // Enhanced Bookmark Operations with Search
  async searchBookmarks(query, options = {}) {
    if (!this.db) throw new Error('Database not initialized');
    
    const limit = options.limit || 50;
    const category = options.category;
    
    let searchQuery = `
      SELECT * FROM bookmarks 
      WHERE (title LIKE ? OR url LIKE ? OR description LIKE ? OR tags LIKE ?)
    `;
    
    const searchParams = [`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`];
    
    if (category) {
      searchQuery += ' AND category = ?';
      searchParams.push(category);
    }
    
    searchQuery += ' ORDER BY updated_at DESC LIMIT ?';
    searchParams.push(limit);
    
    const stmt = this.db.prepare(searchQuery);
    const rows = stmt.all(...searchParams);
    
    return rows.map(row => ({
      id: row.id,
      title: row.title,
      url: row.url,
      description: row.description,
      tags: JSON.parse(row.tags || '[]'),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      visitCount: row.visit_count,
      lastVisited: row.last_visited,
      favicon: row.favicon,
      category: row.category
    }));
  }
  async saveBookmark(bookmark) {
    if (!this.db) throw new Error('Database not initialized');
    
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO bookmarks 
      (id, title, url, description, tags, created_at, updated_at, visit_count, last_visited, favicon, category)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      bookmark.id,
      bookmark.title,
      bookmark.url,
      bookmark.description,
      JSON.stringify(bookmark.tags || []),
      bookmark.createdAt || Date.now(),
      bookmark.updatedAt || Date.now(),
      bookmark.visitCount || 0,
      bookmark.lastVisited || Date.now(),
      bookmark.favicon || null,
      bookmark.category || 'general'
    );
  }

  async getBookmarks(limit = 100) {
    if (!this.db) throw new Error('Database not initialized');
    
    const stmt = this.db.prepare('SELECT * FROM bookmarks ORDER BY updated_at DESC LIMIT ?');
    const rows = stmt.all(limit);
    
    return rows.map(row => ({
      id: row.id,
      title: row.title,
      url: row.url,
      description: row.description,
      tags: JSON.parse(row.tags || '[]'),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      visitCount: row.visit_count,
      lastVisited: row.last_visited,
      favicon: row.favicon,
      category: row.category
    }));
  }

  // History Operations
  async saveHistoryEntry(entry) {
    if (!this.db) throw new Error('Database not initialized');
    
    const stmt = this.db.prepare(`
      INSERT INTO history 
      (id, url, title, visited_at, duration, page_type, exit_type, referrer, search_query)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      entry.id,
      entry.url,
      entry.title,
      entry.visitedAt,
      entry.duration,
      entry.pageType,
      entry.exitType,
      entry.referrer,
      entry.searchQuery
    );
  }

  async getHistory(limit = 100) {
    if (!this.db) throw new Error('Database not initialized');
    
    const stmt = this.db.prepare('SELECT * FROM history ORDER BY visited_at DESC LIMIT ?');
    const rows = stmt.all(limit);
    
    return rows.map(row => ({
      id: row.id,
      url: row.url,
      title: row.title,
      visitedAt: row.visited_at,
      duration: row.duration,
      pageType: row.page_type,
      exitType: row.exit_type,
      referrer: row.referrer,
      searchQuery: row.search_query
    }));
  }

  // Agent Memory Operations
  async saveAgentMemory(memory) {
    if (!this.db) throw new Error('Database not initialized');
    
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO agent_memory 
      (id, agent_id, type, content, importance, tags, created_at, expires_at, related_memories, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      memory.id,
      memory.agentId,
      memory.type,
      JSON.stringify(memory.content),
      memory.importance,
      JSON.stringify(memory.tags),
      memory.createdAt,
      memory.expiresAt,
      JSON.stringify(memory.relatedMemories),
      JSON.stringify(memory.metadata)
    );
  }

  async getAgentMemories(agentId, options = {}) {
    if (!this.db) throw new Error('Database not initialized');
    
    let query = 'SELECT * FROM agent_memory WHERE agent_id = ?';
    const params = [agentId];
    
    if (options.type) {
      query += ' AND type = ?';
      params.push(options.type);
    }
    
    if (options.minImportance) {
      query += ' AND importance >= ?';
      params.push(options.minImportance);
    }
    
    query += ' ORDER BY importance DESC, created_at DESC';
    
    if (options.limit) {
      query += ' LIMIT ?';
      params.push(options.limit);
    }
    
    const stmt = this.db.prepare(query);
    const rows = stmt.all(...params);
    
    return rows.map(row => ({
      id: row.id,
      agentId: row.agent_id,
      type: row.type,
      content: JSON.parse(row.content),
      importance: row.importance,
      tags: JSON.parse(row.tags || '[]'),
      createdAt: row.created_at,
      expiresAt: row.expires_at,
      relatedMemories: JSON.parse(row.related_memories || '[]'),
      metadata: JSON.parse(row.metadata || '{}')
    }));
  }

  // Performance Operations
  async savePerformanceMetric(metric) {
    if (!this.db) throw new Error('Database not initialized');
    
    const stmt = this.db.prepare(`
      INSERT INTO agent_performance 
      (id, agent_id, task_type, start_time, end_time, duration, success, error_message, resource_usage, quality_score, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      metric.id,
      metric.agentId,
      metric.taskType,
      metric.startTime,
      metric.endTime,
      metric.duration,
      metric.success ? 1 : 0,
      metric.errorMessage,
      JSON.stringify(metric.resourceUsage),
      metric.qualityScore,
      JSON.stringify(metric.metadata)
    );
  }

  async getPerformanceMetrics(agentId, limit = 100) {
    if (!this.db) throw new Error('Database not initialized');
    
    const stmt = this.db.prepare(`
      SELECT * FROM agent_performance 
      WHERE agent_id = ? 
      ORDER BY start_time DESC 
      LIMIT ?
    `);
    const rows = stmt.all(agentId, limit);
    
    return rows.map(row => ({
      id: row.id,
      agentId: row.agent_id,
      taskType: row.task_type,
      startTime: row.start_time,
      endTime: row.end_time,
      duration: row.duration,
      success: row.success === 1,
      errorMessage: row.error_message,
      resourceUsage: JSON.parse(row.resource_usage || '{}'),
      qualityScore: row.quality_score,
      metadata: JSON.parse(row.metadata || '{}')
    }));
  }

  // Background Task Operations
  async saveBackgroundTask(task) {
    if (!this.db) throw new Error('Database not initialized');
    
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO background_tasks 
      (id, type, priority, status, payload, created_at, scheduled_for, started_at, completed_at, retry_count, max_retries, last_error, agent_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      task.id,
      task.type,
      task.priority,
      task.status,
      JSON.stringify(task.payload),
      task.createdAt,
      task.scheduledFor,
      task.startedAt,
      task.completedAt,
      task.retryCount,
      task.maxRetries,
      task.lastError,
      task.agentId
    );
  }

  async getBackgroundTasks(status, limit = 100) {
    if (!this.db) throw new Error('Database not initialized');
    
    let query = 'SELECT * FROM background_tasks';
    const params = [];
    
    if (status) {
      query += ' WHERE status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY priority DESC, created_at ASC LIMIT ?';
    params.push(limit);
    
    const stmt = this.db.prepare(query);
    const rows = stmt.all(...params);
    
    return rows.map(row => ({
      id: row.id,
      type: row.type,
      priority: row.priority,
      status: row.status,
      payload: JSON.parse(row.payload),
      createdAt: row.created_at,
      scheduledFor: row.scheduled_for,
      startedAt: row.started_at,
      completedAt: row.completed_at,
      retryCount: row.retry_count,
      maxRetries: row.max_retries,
      lastError: row.last_error,
      agentId: row.agent_id
    }));
  }

  // Cleanup Operations
  async cleanupExpiredMemories() {
    if (!this.db) throw new Error('Database not initialized');
    
    const now = Date.now();
    const stmt = this.db.prepare('DELETE FROM agent_memory WHERE expires_at IS NOT NULL AND expires_at < ?');
    const result = stmt.run(now);
    
    console.log(`🧹 Cleaned up ${result.changes} expired memories`);
    return result.changes;
  }

  async cleanupOldHistory(daysToKeep = 90) {
    if (!this.db) throw new Error('Database not initialized');
    
    const cutoffTime = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
    const stmt = this.db.prepare('DELETE FROM history WHERE visited_at < ?');
    const result = stmt.run(cutoffTime);
    
    console.log(`🧹 Cleaned up ${result.changes} old history entries`);
    return result.changes;
  }

  // ENHANCED: System Configuration Management with data_type support
  async setSystemConfig(key, value, options = {}) {
    if (!this.db) throw new Error('Database not initialized');
    
    const type = options.type || 'user';
    const category = options.category || 'general';
    const dataType = this.inferDataType(value);
    const serializedValue = this.serializeConfigValue(value, dataType);
    
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO system_config 
      (key, value, type, data_type, updated_at, category)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(key, serializedValue, type, dataType, Date.now(), category);
    
    console.log(`⚙️ System config updated: ${key} = ${serializedValue} (${dataType})`);
  }

  async getSystemConfig(key, defaultValue = null) {
    if (!this.db) throw new Error('Database not initialized');
    
    const stmt = this.db.prepare('SELECT * FROM system_config WHERE key = ?');
    const row = stmt.get(key);
    
    if (!row) {
      return defaultValue;
    }
    
    return this.deserializeConfigValue(row.value, row.data_type || 'string');
  }

  async getAllSystemConfig(category = null) {
    if (!this.db) throw new Error('Database not initialized');
    
    let query = 'SELECT * FROM system_config';
    let params = [];
    
    if (category) {
      query += ' WHERE category = ?';
      params.push(category);
    }
    
    query += ' ORDER BY category, key';
    
    const stmt = this.db.prepare(query);
    const rows = stmt.all(...params);
    
    const config = {};
    rows.forEach(row => {
      config[row.key] = {
        value: this.deserializeConfigValue(row.value, row.data_type || 'string'),
        type: row.type,
        dataType: row.data_type,
        category: row.category,
        updatedAt: row.updated_at
      };
    });
    
    return config;
  }

  async deleteSystemConfig(key) {
    if (!this.db) throw new Error('Database not initialized');
    
    const stmt = this.db.prepare('DELETE FROM system_config WHERE key = ?');
    const result = stmt.run(key);
    
    console.log(`🗑️ System config deleted: ${key}`);
    return result.changes > 0;
  }

  // Helper methods for data type handling
  inferDataType(value) {
    if (typeof value === 'boolean') return 'boolean';
    if (typeof value === 'number') return 'number';
    if (Array.isArray(value)) return 'array';
    if (typeof value === 'object' && value !== null) return 'object';
    return 'string';
  }

  serializeConfigValue(value, dataType) {
    switch (dataType) {
      case 'boolean':
      case 'number':
        return String(value);
      case 'array':
      case 'object':
        return JSON.stringify(value);
      default:
        return String(value);
    }
  }

  deserializeConfigValue(value, dataType) {
    switch (dataType) {
      case 'boolean':
        return value === 'true';
      case 'number':
        return Number(value);
      case 'array':
      case 'object':
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      default:
        return value;
    }
  }

  async close() {
    if (this.db) {
      this.db.close();
      this.db = null;
      console.log('✅ Database connection closed');
    }
  }
}

module.exports = { DatabaseService };