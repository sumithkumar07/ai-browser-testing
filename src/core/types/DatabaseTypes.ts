// Database type definitions for KAiro Browser Backend Enhancements
// ZERO UI IMPACT - Pure backend data structures

export interface DatabaseConfig {
  path: string;
  maxSize: number;
  backupEnabled: boolean;
  encryptionKey?: string;
}

export interface BookmarkEntry {
  id: string;
  title: string;
  url: string;
  description?: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
  visitCount: number;
  lastVisited: number;
  favicon?: string;
  category?: string;
}

export interface HistoryEntry {
  id: string;
  url: string;
  title: string;
  visitedAt: number;
  duration: number;
  pageType: string;
  exitType: 'navigation' | 'tab_close' | 'browser_close';
  referrer?: string;
  searchQuery?: string;
}

export interface AgentMemoryEntry {
  id: string;
  agentId: string;
  type: 'interaction' | 'learning' | 'outcome' | 'context';
  content: any;
  importance: number; // 1-10 scale
  tags: string[];
  createdAt: number;
  expiresAt?: number;
  relatedMemories: string[];
  metadata: {
    sessionId?: string;
    taskId?: string;
    outcome?: 'success' | 'failure' | 'partial';
    confidence?: number;
  };
}

export interface AgentPerformanceMetric {
  id: string;
  agentId: string;
  taskType: string;
  startTime: number;
  endTime: number;
  duration: number;
  success: boolean;
  errorMessage?: string;
  resourceUsage: {
    cpuTime: number;
    memoryUsed: number;
    networkRequests: number;
  };
  qualityScore: number; // 1-10 user satisfaction
  metadata: any;
}

export interface BackgroundTask {
  id: string;
  type: string;
  priority: number; // 1-10, higher = more priority
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  payload: any;
  createdAt: number;
  scheduledFor?: number;
  startedAt?: number;
  completedAt?: number;
  retryCount: number;
  maxRetries: number;
  lastError?: string;
  agentId?: string;
}

export interface AgentHealthStatus {
  agentId: string;
  status: 'healthy' | 'degraded' | 'failing' | 'crashed';
  lastHealthCheck: number;
  responseTime: number;
  errorRate: number;
  memoryUsage: number;
  successRate: number;
  diagnostics: {
    lastError?: string;
    consecutiveFailures: number;
    performanceTrend: 'improving' | 'stable' | 'degrading';
  };
}

export interface AgentLearningData {
  id: string;
  agentId: string;
  pattern: string;
  confidence: number;
  usage_count: number;
  success_rate: number;
  last_used: number;
  created_at: number;
  metadata: any;
}

export interface SystemConfiguration {
  key: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'object';
  description: string;
  updatedAt: number;
  category: string;
}