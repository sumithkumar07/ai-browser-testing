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

    // Performance-critical indexes
    this.db.exec('CREATE INDEX IF NOT EXISTS idx_bookmarks_url ON bookmarks(url)');
    this.db.exec('CREATE INDEX IF NOT EXISTS idx_history_url ON history(url)');
    this.db.exec('CREATE INDEX IF NOT EXISTS idx_history_visited ON history(visited_at)');
    this.db.exec('CREATE INDEX IF NOT EXISTS idx_agent_memory_agent ON agent_memory(agent_id)');
    this.db.exec('CREATE INDEX IF NOT EXISTS idx_agent_performance_agent ON agent_performance(agent_id)');
    this.db.exec('CREATE INDEX IF NOT EXISTS idx_background_tasks_status ON background_tasks(status)');
  }

  // Bookmark Operations
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
      JSON.stringify(bookmark.tags),
      bookmark.createdAt,
      bookmark.updatedAt,
      bookmark.visitCount,
      bookmark.lastVisited,
      bookmark.favicon,
      bookmark.category
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

  async close() {
    if (this.db) {
      this.db.close();
      this.db = null;
      console.log('✅ Database connection closed');
    }
  }
}

module.exports = { DatabaseService };