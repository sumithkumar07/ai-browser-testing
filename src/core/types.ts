/**
 * Core Application Types
 * Shared type definitions across the application
 */

// Re-export types from other modules to avoid circular imports
export interface AIMessage {
  id: string
  content: string
  timestamp: number
  isUser: boolean
  isLoading?: boolean
  context?: string
  url?: string
  agentStatus?: AgentStatus
}

export interface AgentStatus {
  id: string
  name: string
  status: 'idle' | 'active' | 'processing' | 'completed' | 'error'
  currentTask?: string
  progress?: number
  details?: string[]
  capabilities?: string[]
  confidence?: number
  estimatedCompletionTime?: number
  metrics?: {
    tasksCompleted: number
    averageResponseTime: number
    successRate: number
  }
}

export interface TabInfo {
  id: string
  title: string
  url: string
  isLoading: boolean
  isActive: boolean
  type: 'browser' | 'ai'
  content?: string
  createdBy?: 'user' | 'agent'
  timestamp?: number
}

export interface AIResponse {
  success: boolean
  result?: string
  error?: string
  actions?: AgentAction[]
  agentStatus?: AgentStatus
  data?: any
  metadata?: {
    processTime: number
    model: string
    tokensUsed: number
  }
}

export interface AgentAction {
  type: 'navigate' | 'extract' | 'create_tab' | 'write_content' | 'close_tab' | 'search' | 'analyze'
  target?: string
  data?: any
  tabId?: string
  priority?: 'low' | 'medium' | 'high'
  requiresConfirmation?: boolean
}

export interface ServiceHealth {
  name: string
  status: 'healthy' | 'degraded' | 'unhealthy'
  lastCheck: number
  responseTime?: number
  error?: string
  uptime: number
}

export interface PerformanceMetric {
  name: string
  value: number
  timestamp: number
  category: 'memory' | 'cpu' | 'network' | 'storage'
  severity?: 'normal' | 'warning' | 'critical'
}

export interface ConversationContext {
  currentUrl: string
  pageTitle: string
  pageContent?: string
  userIntent: string
  conversationHistory: AIMessage[]
  sessionId: string
  timestamp: number
  agentContext?: Record<string, any>
}

export interface QualityMetrics {
  relevanceScore: number
  helpfulnessScore: number
  contextAwareness: number
  taskCompletion: number
  userSatisfaction: number
  [key: string]: number
}

export interface DatabaseRecord {
  id: string
  timestamp: number
  type: string
  data: any
  metadata?: Record<string, any>
}

export interface ApiConfiguration {
  baseUrl: string
  apiKey?: string
  timeout: number
  retryAttempts: number
  rateLimit?: {
    requests: number
    window: number
  }
}

export interface ErrorContext {
  component: string
  method: string
  timestamp: number
  userAgent?: string
  url?: string
  additionalData?: any
}

// Event types for type-safe event system
export interface AppEventMap {
  'app:initialized': { timestamp: number }
  'app:error': { error: Error; context?: ErrorContext }
  'tab:created': { tabId: string; url: string }
  'tab:closed': { tabId: string }
  'tab:switched': { tabId: string; previousTabId?: string }
  'ai:message': { message: string; response: string }
  'ai:context-updated': { content: string }
  'agent:task-started': { taskId: string; description: string }
  'agent:task-completed': { taskId: string; result: any }
  'agent:task-failed': { taskId: string; error: string }
  'agent:update': AgentStatus
  'browser:navigate': { tabId: string; url: string }
  'page:loaded': { tabId: string; url: string; title: string }
  'settings:changed': { key: string; value: any }
  'performance:metric': PerformanceMetric
  'conversation:started': { conversationId: string; timestamp: number }
  'conversation:context-updated': { conversationId: string; context: any }
  'conversation:message-added': { conversationId: string; message: AIMessage }
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export type ServiceStatus = 'initializing' | 'ready' | 'error' | 'stopped'

export interface ServiceInfo {
  name: string
  status: ServiceStatus
  health: ServiceHealth
  lastActivity: number
  configuration: Record<string, any>
}

// Configuration interfaces
export interface AppConfig {
  ai: {
    groqApiKey: string
    defaultModel: string
    timeout: number
    maxRetries: number
  }
  browser: {
    defaultHomePage: string
    defaultSearchEngine: string
    enableJavaScript: boolean
    enableImages: boolean
  }
  performance: {
    maxMemoryUsage: number
    maxCpuUsage: number
    cleanupInterval: number
  }
  features: {
    enableAI: boolean
    enableAgents: boolean
    enableAnalytics: boolean
    debugMode: boolean
  }
}

export default {}