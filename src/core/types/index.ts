/**
 * Centralized Type Definitions
 * All TypeScript types and interfaces for KAiro Browser
 */

// Import and re-export types from electron definitions
import type { 
  Tab, 
  AIMessage, 
  AgentStatus, 
  BrowserEvent, 
  AIResponse, 
  AgentAction 
} from '../../main/types/electron.d.ts'

export type { Tab, AIMessage, AgentStatus, BrowserEvent, AIResponse, AgentAction }

// Core Application Types
export interface AppState {
  isInitialized: boolean
  isLoading: boolean
  error: string | null
  currentRoute: string
}

export interface WindowState {
  width: number
  height: number
  isMaximized: boolean
  isMinimized: boolean
  isFullscreen: boolean
}

// Enhanced Tab System
export interface TabMetadata {
  favicon?: string
  loadTime?: number
  lastAccessed: number
  visitCount: number
  scrollPosition: number
}

export interface ExtendedTab extends ElectronTab {
  metadata: TabMetadata
  parentTabId?: string
  groupId?: string
  isPinned: boolean
}

// Agent System Types
export interface AgentCapability {
  id: string
  name: string
  description: string
  category: 'research' | 'analysis' | 'automation' | 'communication'
  requiredPermissions: string[]
  estimatedDuration?: number
}

export interface AgentTask {
  id: string
  title: string
  description: string
  type: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  progress: number
  createdAt: number
  startedAt?: number
  completedAt?: number
  result?: any
  error?: string
  metadata?: Record<string, any>
}

export interface AgentAction {
  type: 'navigate' | 'extract' | 'create_tab' | 'write_content' | 'close_tab'
  target?: string
  data?: any
  tabId?: string
}

// AI System Types
export interface AIConversation {
  id: string
  title: string
  messages: ElectronAIMessage[]
  createdAt: number
  updatedAt: number
  context?: Record<string, any>
}

export interface AIModel {
  id: string
  name: string
  description: string
  maxTokens: number
  supportedFeatures: string[]
  pricing?: {
    inputTokens: number
    outputTokens: number
  }
}


export interface BookmarkFolder {
  id: string
  name: string
  parentId?: string
  children: (Bookmark | BookmarkFolder)[]
  createdAt: number
  updatedAt: number
}

export interface Bookmark {
  id: string
  title: string
  url: string
  favicon?: string
  folderId?: string
  tags: string[]
  createdAt: number
  updatedAt: number
  visitCount: number
}

export interface HistoryEntry {
  id: string
  url: string
  title: string
  visitTime: number
  visitCount: number
  lastVisitTime: number
  favicon?: string
  duration?: number
}

// Extension System Types
export interface Extension {
  id: string
  name: string
  version: string
  description: string
  enabled: boolean
  permissions: string[]
  contentScript?: string
  backgroundScript?: string
  manifestVersion: number
  author: string
  icon?: string
}

// UI Component Types
export interface Theme {
  id: string
  name: string
  type: 'light' | 'dark' | 'auto'
  colors: {
    primary: string
    secondary: string
    background: string
    surface: string
    text: string
    textSecondary: string
    border: string
    error: string
    warning: string
    success: string
  }
  fonts: {
    primary: string
    secondary: string
    monospace: string
  }
  spacing: {
    xs: number
    sm: number
    md: number
    lg: number
    xl: number
  }
}

export interface UIState {
  theme: Theme
  sidebarCollapsed: boolean
  aiSidebarOpen: boolean
  devToolsOpen: boolean
  fullscreen: boolean
  zoomLevel: number
}

// Performance Types
export interface PerformanceMetrics {
  appStartTime: number
  tabSwitchTime: number
  aiResponseTime: number
  memoryUsage: number
  cpuUsage: number
  networkLatency: number
}

// Settings Types
export interface UserSettings {
  general: {
    language: string
    theme: string
    startupBehavior: 'last-session' | 'homepage' | 'blank'
    downloadPrompt: boolean
  }
  privacy: {
    clearDataOnExit: boolean
    enableTracking: boolean
    enableCookies: boolean
    enableLocalStorage: boolean
  }
  ai: {
    enableAI: boolean
    model: string
    temperature: number
    maxTokens: number
    autoSummarize: boolean
  }
  browser: {
    homepage: string
    searchEngine: string
    enableJavaScript: boolean
    enableImages: boolean
    blockPopups: boolean
  }
  shortcuts: Record<string, string>
}

// Error Types
export interface AppError {
  id: string
  type: 'network' | 'ai' | 'browser' | 'system' | 'user'
  code: string
  message: string
  details?: any
  timestamp: number
  resolved: boolean
  stack?: string
}

// API Response Types
export interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  timestamp: number
  requestId?: string
}

// Event Types
export interface AppEvent {
  type: string
  payload?: any
  timestamp: number
  source: 'main' | 'renderer' | 'agent' | 'ai'
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>