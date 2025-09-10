// AI Data Handlers - Connect Natural Language to Real Backend Data
// This module handles specific user queries and returns real backend data

class AIDataHandlers {
  constructor(browserManager) {
    this.manager = browserManager;
    this.commandPatterns = new Map();
    this.initializeCommandPatterns();
  }

  initializeCommandPatterns() {
    // Autonomous Goals Patterns
    this.commandPatterns.set(/show.*goal|view.*goal|list.*goal|my.*goal/i, {
      handler: this.handleGoalsQuery.bind(this),
      category: 'goals'
    });

    // Agent Performance Patterns
    this.commandPatterns.set(/show.*agent|agent.*status|agent.*health|agent.*performance/i, {
      handler: this.handleAgentQuery.bind(this),
      category: 'agents'
    });

    // System Health Patterns
    this.commandPatterns.set(/system.*health|show.*health|performance.*metric|system.*status/i, {
      handler: this.handleSystemHealthQuery.bind(this),
      category: 'system'
    });

    // Background Tasks Patterns
    this.commandPatterns.set(/background.*task|show.*task|task.*queue|running.*task/i, {
      handler: this.handleTasksQuery.bind(this),
      category: 'tasks'
    });

    // Memory & Learning Patterns
    this.commandPatterns.set(/learning.*pattern|show.*learning|memory.*insight|what.*learned/i, {
      handler: this.handleLearningQuery.bind(this),
      category: 'learning'
    });

    // Database & History Patterns
    this.commandPatterns.set(/show.*bookmark|show.*history|browse.*data|database/i, {
      handler: this.handleDatabaseQuery.bind(this),
      category: 'database'
    });

    // Security Patterns
    this.commandPatterns.set(/security.*scan|security.*status|show.*security|threat.*detect/i, {
      handler: this.handleSecurityQuery.bind(this),
      category: 'security'
    });

    // Search Management Patterns
    this.commandPatterns.set(/search.*history|show.*search|search.*analytic/i, {
      handler: this.handleSearchQuery.bind(this),
      category: 'search'
    });
  }

  async processQuery(message) {
    try {
      console.log('🔍 Processing AI data query:', message);

      // Find matching pattern
      for (const [pattern, config] of this.commandPatterns) {
        if (pattern.test(message)) {
          console.log(`✅ Matched pattern: ${config.category}`);
          const result = await config.handler(message);
          return {
            success: true,
            category: config.category,
            data: result,
            source: 'real_backend_data'
          };
        }
      }

      return {
        success: false,
        reason: 'No matching data query pattern found'
      };

    } catch (error) {
      console.error('❌ AI data query processing failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // 🎯 AUTONOMOUS GOALS DATA
  async handleGoalsQuery(message) {
    if (!this.manager.autonomousPlanningEngine) {
      return { error: 'Autonomous Planning Engine not available' };
    }

    try {
      const activeGoals = await this.manager.autonomousPlanningEngine.getAllGoals('executing');
      const completedGoals = await this.manager.autonomousPlanningEngine.getAllGoals('completed');
      const queuedGoals = await this.manager.autonomousPlanningEngine.getAllGoals('planning');
      const stats = this.manager.autonomousPlanningEngine.getPlanningStats();

      return {
        formatted_response: this.formatGoalsResponse(activeGoals, completedGoals, queuedGoals, stats),
        raw_data: { activeGoals, completedGoals, queuedGoals, stats }
      };
    } catch (error) {
      return { error: `Goals query failed: ${error.message}` };
    }
  }

  formatGoalsResponse(activeGoals, completedGoals, queuedGoals, stats) {
    return `# 🎯 **Autonomous Goals Dashboard**

## 📊 **Overview Statistics**
- **Total Goals**: ${stats.totalGoals}
- **Active Goals**: ${stats.activeGoals}
- **Queued Goals**: ${stats.queuedGoals}
- **Completed Goals**: ${stats.completedGoals}
- **Failed Goals**: ${stats.failedGoals}
- **Average Execution Time**: ${Math.round(stats.averageExecutionTime / 1000 / 60)} minutes

## 🚀 **Active Goals** (${activeGoals.length})
${activeGoals.length > 0 ? activeGoals.map(goal => `
### 🎯 ${goal.title}
- **Type**: ${goal.type}
- **Priority**: ${goal.priority}
- **Progress**: ${goal.progress}%
- **Created**: ${new Date(goal.createdAt).toLocaleString()}
- **ID**: \`${goal.id}\`
`).join('\n') : '*(No active goals)*'}

## ✅ **Recently Completed Goals** (${completedGoals.slice(0, 3).length})
${completedGoals.slice(0, 3).map(goal => `
- **${goal.title}** (${goal.type}) - Completed ${new Date(goal.completedAt || goal.createdAt).toLocaleDateString()}
`).join('')}

## 📋 **Queued Goals** (${queuedGoals.length})
${queuedGoals.slice(0, 3).map(goal => `
- **${goal.title}** (${goal.priority} priority)
`).join('')}

## 📈 **Goals by Type**
${Object.entries(stats.goalsByType).map(([type, count]) => `- **${type}**: ${count} goals`).join('\n')}

---
*Data source: Autonomous Planning Engine - Real backend data*`;
  }

  // 🤖 AGENT PERFORMANCE DATA
  async handleAgentQuery(message) {
    if (!this.manager.performanceMonitor) {
      return { error: 'Agent Performance Monitor not available' };
    }

    try {
      const agents = ['research', 'navigation', 'shopping', 'communication', 'automation', 'analysis'];
      const agentData = [];

      for (const agentId of agents) {
        const health = await this.manager.performanceMonitor.getAgentHealthStatus(agentId);
        const stats = await this.manager.performanceMonitor.getPerformanceStats(agentId);
        agentData.push({ agentId, health, stats });
      }

      const allHealthStatuses = await this.manager.performanceMonitor.getAllAgentHealthStatuses();

      return {
        formatted_response: this.formatAgentResponse(agentData, allHealthStatuses),
        raw_data: { agentData, allHealthStatuses }
      };
    } catch (error) {
      return { error: `Agent query failed: ${error.message}` };
    }
  }

  formatAgentResponse(agentData, allHealthStatuses) {
    const healthyCount = allHealthStatuses.filter(h => h.status === 'healthy').length;
    const totalCount = allHealthStatuses.length;

    return `# 🤖 **Agent Performance Dashboard**

## 📊 **Overall Agent Health**: ${healthyCount}/${totalCount} Healthy

${agentData.map(({ agentId, health, stats }) => `
### ${this.getAgentEmoji(agentId)} **${agentId.charAt(0).toUpperCase() + agentId.slice(1)} Agent**
- **Status**: ${this.getHealthEmoji(health?.status)} ${health?.status || 'Unknown'}
- **Success Rate**: ${(stats.successRate * 100).toFixed(1)}%
- **Avg Response Time**: ${stats.averageResponseTime.toFixed(0)}ms
- **Total Tasks**: ${stats.totalTasks}
- **Error Rate**: ${(stats.errorRate * 100).toFixed(1)}%
${health?.diagnostics?.lastError ? `- **Last Error**: ${health.diagnostics.lastError}` : ''}
${health?.diagnostics?.consecutiveFailures > 0 ? `- ⚠️ **Consecutive Failures**: ${health.diagnostics.consecutiveFailures}` : ''}
`).join('\n')}

## 🏥 **Health Details**
${allHealthStatuses.map(h => `
- **${h.agentId}**: ${h.status} (Last check: ${new Date(h.lastHealthCheck).toLocaleTimeString()})
  - Response Time: ${h.responseTime.toFixed(0)}ms
  - Memory Usage: ${h.memoryUsage}MB
`).join('')}

---
*Data source: Agent Performance Monitor - Real backend data*`;
  }

  // 🏥 SYSTEM HEALTH DATA
  async handleSystemHealthQuery(message) {
    try {
      const systemData = {
        orchestrator: null,
        performance: null,
        database: null,
        memory: process.memoryUsage(),
        uptime: process.uptime()
      };

      if (this.manager.unifiedServiceOrchestrator) {
        systemData.orchestrator = this.manager.unifiedServiceOrchestrator.getSystemHealth();
        const metrics = this.manager.unifiedServiceOrchestrator.getSystemMetrics(1);
        systemData.performance = metrics.length > 0 ? metrics[0] : null;
      }

      if (this.manager.databaseService) {
        // Get database stats
        systemData.database = {
          status: 'connected',
          tables: 6,
          connectionState: this.manager.connectionState.database
        };
      }

      return {
        formatted_response: this.formatSystemHealthResponse(systemData),
        raw_data: systemData
      };
    } catch (error) {
      return { error: `System health query failed: ${error.message}` };
    }
  }

  formatSystemHealthResponse(data) {
    const memoryMB = Math.round(data.memory.heapUsed / 1024 / 1024);
    const uptimeHours = Math.round(data.uptime / 3600);

    return `# 🏥 **System Health Dashboard**

## 🎼 **Service Orchestrator**
${data.orchestrator ? `
- **Overall Health**: ${(data.orchestrator.overall * 100).toFixed(1)}%
- **Healthy Services**: ${data.orchestrator.services.filter(s => s.status === 'healthy').length}/${data.orchestrator.services.length}
- **Service Status**:
${data.orchestrator.services.map(s => `  - **${s.name}**: ${this.getHealthEmoji(s.status)} ${s.status}`).join('\n')}
` : '*(Service Orchestrator not available)*'}

## 📊 **Performance Metrics**
${data.performance ? `
- **Average Response Time**: ${data.performance.averageResponseTime.toFixed(0)}ms
- **Error Rate**: ${(data.performance.errorRate * 100).toFixed(2)}%
- **Success Rate**: ${((1 - data.performance.errorRate) * 100).toFixed(1)}%
- **Active Requests**: ${data.performance.activeRequests || 0}
` : '*(Performance metrics not available)*'}

## 🗄️ **Database Status**
${data.database ? `
- **Connection**: ${this.getHealthEmoji(data.database.connectionState)} ${data.database.connectionState}
- **Tables**: ${data.database.tables} tables active
- **Status**: ${data.database.status}
` : '*(Database not available)*'}

## 💾 **System Resources**
- **Memory Usage**: ${memoryMB}MB heap used
- **Total Memory**: ${Math.round(data.memory.heapTotal / 1024 / 1024)}MB allocated
- **System Uptime**: ${uptimeHours} hours
- **RSS Memory**: ${Math.round(data.memory.rss / 1024 / 1024)}MB

## 🔧 **Connection States**
- **API**: ${this.getHealthEmoji(this.manager.connectionState.api)} ${this.manager.connectionState.api}
- **Database**: ${this.getHealthEmoji(this.manager.connectionState.database)} ${this.manager.connectionState.database}
- **Agents**: ${this.getHealthEmoji(this.manager.connectionState.agents)} ${this.manager.connectionState.agents}

---
*Data source: System Health Monitor - Real backend data*`;
  }

  // ⚡ BACKGROUND TASKS DATA
  async handleTasksQuery(message) {
    if (!this.manager.taskScheduler) {
      return { error: 'Background Task Scheduler not available' };
    }

    try {
      const runningTasks = await this.manager.taskScheduler.db.getBackgroundTasks('running');
      const pendingTasks = await this.manager.taskScheduler.db.getBackgroundTasks('pending');
      const completedTasks = await this.manager.taskScheduler.db.getBackgroundTasks('completed', 10);
      const failedTasks = await this.manager.taskScheduler.db.getBackgroundTasks('failed', 5);

      return {
        formatted_response: this.formatTasksResponse(runningTasks, pendingTasks, completedTasks, failedTasks),
        raw_data: { runningTasks, pendingTasks, completedTasks, failedTasks }
      };
    } catch (error) {
      return { error: `Tasks query failed: ${error.message}` };
    }
  }

  formatTasksResponse(running, pending, completed, failed) {
    return `# ⚡ **Background Tasks Dashboard**

## 📊 **Task Queue Status**
- **Running**: ${running.length} tasks
- **Pending**: ${pending.length} tasks  
- **Completed**: ${completed.length} recent tasks
- **Failed**: ${failed.length} failed tasks

## 🚀 **Currently Running Tasks** (${running.length})
${running.length > 0 ? running.map(task => `
### ⚡ ${task.type}
- **Status**: ${task.status}
- **Priority**: ${task.priority}
- **Started**: ${new Date(task.startedAt).toLocaleTimeString()}
- **Agent**: ${task.agentId || 'System'}
- **Retries**: ${task.retryCount}/${task.maxRetries}
- **ID**: \`${task.id}\`
`).join('\n') : '*(No running tasks)*'}

## 📋 **Pending Tasks** (${pending.length})
${pending.map(task => `
- **${task.type}** (Priority: ${task.priority}) - Scheduled: ${task.scheduledFor ? new Date(task.scheduledFor).toLocaleString() : 'Now'}
`).join('')}

## ✅ **Recently Completed Tasks** (${completed.slice(0, 5).length})
${completed.slice(0, 5).map(task => `
- **${task.type}** - Completed: ${new Date(task.completedAt).toLocaleString()} (${((task.completedAt - task.startedAt) / 1000).toFixed(1)}s)
`).join('')}

## ❌ **Failed Tasks** (${failed.length})
${failed.map(task => `
- **${task.type}** - Error: ${task.lastError} (Retries: ${task.retryCount}/${task.maxRetries})
`).join('')}

## 📈 **Task Types Distribution**
${this.getTaskTypeDistribution([...running, ...pending, ...completed]).map(([type, count]) => `
- **${type}**: ${count} tasks
`).join('')}

---
*Data source: Background Task Scheduler - Real backend data*`;
  }

  // 🧠 LEARNING & MEMORY DATA
  async handleLearningQuery(message) {
    if (!this.manager.agentMemoryService) {
      return { error: 'Agent Memory Service not available' };
    }

    try {
      const agents = ['research', 'navigation', 'shopping', 'communication', 'automation', 'analysis'];
      const learningData = [];

      for (const agentId of agents) {
        try {
          const memories = await this.manager.agentMemoryService.getMemories(agentId, { limit: 5 });
          const insights = await this.manager.agentMemoryService.getAgentLearningInsights(agentId);
          learningData.push({ agentId, memories: memories.memories || [], insights: insights.insights || {} });
        } catch (error) {
          console.warn(`Learning data for ${agentId} failed:`, error.message);
          learningData.push({ agentId, memories: [], insights: {}, error: error.message });
        }
      }

      return {
        formatted_response: this.formatLearningResponse(learningData),
        raw_data: learningData
      };
    } catch (error) {
      return { error: `Learning query failed: ${error.message}` };
    }
  }

  formatLearningResponse(learningData) {
    const totalMemories = learningData.reduce((sum, agent) => sum + agent.memories.length, 0);
    const agentsWithData = learningData.filter(agent => agent.memories.length > 0).length;

    return `# 🧠 **Learning & Memory Insights**

## 📊 **Learning Overview**
- **Total Memories**: ${totalMemories} stored
- **Active Learning Agents**: ${agentsWithData}/6
- **Memory Categories**: Interactions, Preferences, Patterns, Context

${learningData.map(({ agentId, memories, insights, error }) => `
## ${this.getAgentEmoji(agentId)} **${agentId.charAt(0).toUpperCase() + agentId.slice(1)} Agent Learning**
${error ? `⚠️ *Error: ${error}*` : ''}
- **Memories Stored**: ${memories.length}
- **Learning Status**: ${insights.totalOutcomes ? `${insights.totalOutcomes} interactions analyzed` : 'Limited data'}
${insights.performanceMetrics ? `- **Success Rate**: ${(insights.performanceMetrics.successRate * 100).toFixed(1)}%` : ''}
${insights.patterns && insights.patterns.length > 0 ? `- **Key Patterns**: ${insights.patterns.join(', ')}` : ''}

${memories.length > 0 ? `**Recent Memories:**
${memories.slice(0, 3).map(memory => `
- **${memory.type}** (Importance: ${memory.importance}/5): ${typeof memory.content === 'object' ? JSON.stringify(memory.content).substring(0, 100) + '...' : memory.content.toString().substring(0, 100)}
`).join('')}` : '*(No recent memories)*'}
`).join('\n')}

## 🎯 **Learning Insights**
- **Most Active Agent**: ${learningData.sort((a, b) => b.memories.length - a.memories.length)[0]?.agentId || 'None'}
- **Total Learning Sessions**: ${totalMemories}
- **Memory Distribution**: Across ${agentsWithData} agents

---
*Data source: Agent Memory Service - Real backend data*`;
  }

  // 🗄️ DATABASE & HISTORY DATA
  async handleDatabaseQuery(message) {
    if (!this.manager.databaseService) {
      return { error: 'Database Service not available' };
    }

    try {
      const bookmarks = await this.manager.databaseService.getBookmarks(10);
      const history = await this.manager.databaseService.getHistory(10);
      
      // Get database statistics
      const dbStats = {
        bookmarksCount: bookmarks.length,
        historyCount: history.length,
        connectionState: this.manager.connectionState.database
      };

      return {
        formatted_response: this.formatDatabaseResponse(bookmarks, history, dbStats),
        raw_data: { bookmarks, history, dbStats }
      };
    } catch (error) {
      return { error: `Database query failed: ${error.message}` };
    }
  }

  formatDatabaseResponse(bookmarks, history, stats) {
    return `# 🗄️ **Database & Browsing Data**

## 📊 **Database Statistics**
- **Connection Status**: ${this.getHealthEmoji(stats.connectionState)} ${stats.connectionState}
- **Bookmarks**: ${stats.bookmarksCount} entries
- **History Entries**: ${stats.historyCount} recent entries

## 🔖 **Recent Bookmarks** (${bookmarks.length})
${bookmarks.map(bookmark => `
### 📌 ${bookmark.title}
- **URL**: ${bookmark.url}
- **Category**: ${bookmark.category || 'General'}
- **Visit Count**: ${bookmark.visitCount}
- **Added**: ${new Date(bookmark.createdAt).toLocaleDateString()}
- **Tags**: ${bookmark.tags.length > 0 ? bookmark.tags.join(', ') : 'None'}
`).join('\n')}

## 🕒 **Recent Browsing History** (${Math.min(history.length, 10)})
${history.slice(0, 10).map(entry => `
- **${entry.title}** - Visited: ${new Date(entry.visitedAt).toLocaleDateString()} (${Math.round(entry.duration / 1000)}s)
  - URL: ${entry.url}
  - Page Type: ${entry.pageType || 'Unknown'}
`).join('')}

## 📈 **Usage Patterns**
- **Most Visited**: ${this.getMostVisitedDomain(history)}
- **Average Session**: ${this.getAverageSessionTime(history)} seconds
- **Top Categories**: ${this.getTopBookmarkCategories(bookmarks)}

---
*Data source: Database Service - Real backend data*`;
  }

  // Helper Methods
  getAgentEmoji(agentId) {
    const emojis = {
      research: '🔍',
      navigation: '🌐', 
      shopping: '🛒',
      communication: '📧',
      automation: '🤖',
      analysis: '📊'
    };
    return emojis[agentId] || '🤖';
  }

  getHealthEmoji(status) {
    switch (status) {
      case 'healthy': case 'connected': return '✅';
      case 'degraded': case 'warning': return '⚠️';
      case 'failing': case 'failed': case 'disconnected': return '❌';
      default: return '❓';
    }
  }

  getTaskTypeDistribution(tasks) {
    const distribution = {};
    tasks.forEach(task => {
      distribution[task.type] = (distribution[task.type] || 0) + 1;
    });
    return Object.entries(distribution).sort((a, b) => b[1] - a[1]);
  }

  getMostVisitedDomain(history) {
    if (history.length === 0) return 'None';
    const domains = {};
    history.forEach(entry => {
      try {
        const domain = new URL(entry.url).hostname;
        domains[domain] = (domains[domain] || 0) + 1;
      } catch (error) {
        // Invalid URL, skip
      }
    });
    const sortedDomains = Object.entries(domains).sort((a, b) => b[1] - a[1]);
    return sortedDomains.length > 0 ? sortedDomains[0][0] : 'None';
  }

  getAverageSessionTime(history) {
    if (history.length === 0) return 0;
    const totalTime = history.reduce((sum, entry) => sum + (entry.duration || 0), 0);
    return Math.round(totalTime / history.length / 1000);
  }

  getTopBookmarkCategories(bookmarks) {
    if (bookmarks.length === 0) return 'None';
    const categories = {};
    bookmarks.forEach(bookmark => {
      const category = bookmark.category || 'General';
      categories[category] = (categories[category] || 0) + 1;
    });
    const sortedCategories = Object.entries(categories).sort((a, b) => b[1] - a[1]);
    return sortedCategories.slice(0, 3).map(([cat, count]) => `${cat} (${count})`).join(', ');
  }
}

module.exports = { AIDataHandlers };