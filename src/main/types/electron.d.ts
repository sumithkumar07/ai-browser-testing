/**
 * Electron API Type Definitions
 * Comprehensive type definitions for window.electronAPI
 */

export interface Tab {
  id: string
  title: string
  url: string
  isLoading: boolean
  isActive: boolean
  type: 'browser' | 'ai'
  content?: string
  createdBy?: 'user' | 'agent'
}

export interface AIMessage {
  id: string
  content: string
  timestamp: number
  isUser: boolean
  isLoading?: boolean
  agentStatus?: AgentStatus
}

export interface AgentStatus {
  id: string
  name: string
  status: 'idle' | 'active' | 'completed' | 'error'
  currentTask?: string
  progress?: number
  details?: string[]
}

export interface AIResponse {
  success: boolean
  result?: string
  error?: string
  actions?: AgentAction[]
  agentStatus?: AgentStatus
  data?: any
}

export interface AgentAction {
  type: 'navigate' | 'extract' | 'create_tab' | 'write_content' | 'close_tab'
  target?: string
  data?: any
  tabId?: string
}

export interface BrowserEvent {
  type: string
  tabId?: string
  url?: string
  title?: string
  loading?: boolean
  error?: any
  content?: string
}

export interface ElectronAPI {
  // Tab Management
  createTab: (url?: string, type?: 'browser' | 'ai') => Promise<any>
  closeTab: (tabId: string) => Promise<any>
  switchTab: (tabId: string) => Promise<any>
  
  // Navigation
  navigateTo: (url: string) => Promise<any>
  goBack: () => Promise<any>
  goForward: () => Promise<any>
  reload: () => Promise<any>
  getCurrentUrl: () => Promise<any>
  getPageTitle: () => Promise<any>
  
  // AI Services
  sendAIMessage: (message: string) => Promise<AIResponse>
  testConnection: () => Promise<any>
  summarizePage: () => Promise<any>
  analyzeContent: () => Promise<any>
  getAIContext: () => Promise<any>
  
  // Enhanced Navigation & Search
  performDeepSearch: (query: string, options?: any) => Promise<any>
  getAINavigationSuggestions: (query: string, currentUrl?: string) => Promise<any>
  performSecurityScan: (target: string, scanType?: string) => Promise<any>
  getSystemHealth: () => Promise<any>
  
  // Agent System
  executeAgentTask: (task: string) => Promise<any>
  getAgentStatus: (agentId?: string) => Promise<any>
  cancelAgentTask: (taskId: string) => Promise<any>
  
  // AI Tab Management
  createAITab: (title: string, content?: string) => Promise<any>
  saveAITabContent: (tabId: string, content: string) => Promise<any>
  loadAITabContent: (tabId: string) => Promise<any>
  
  // Content Management
  extractPageContent: (tabId?: string) => Promise<any>
  
  // System Information
  getVersion: () => Promise<string>
  getPlatform: () => Promise<string>
  
  // Development Tools
  openDevTools: () => Promise<any>
  closeDevTools: () => Promise<any>
  debugBrowserView: () => Promise<any>
  
  // Event Listeners
  onBrowserEvent: (callback: (event: BrowserEvent) => void) => void
  removeBrowserEventListener?: () => void
  onMenuAction: (callback: (action: string) => void) => void
  onAgentUpdate?: (callback: (status: AgentStatus) => void) => void
  
  // Optional/Fallback Methods for Missing Components
  getBookmarks?: () => Promise<any>
  addBookmark?: (bookmark: any) => Promise<any>
  deleteBookmark?: (id: string) => Promise<any>
  getBrowsingHistory?: () => Promise<any>
  deleteHistoryItem?: (id: string) => Promise<any>
  clearBrowsingHistory?: () => Promise<any>
  getSettings?: () => Promise<any>
  saveSettings?: (settings: any) => Promise<any>
  clearBrowsingData?: () => Promise<any>
  clearCookies?: () => Promise<any>
  clearCache?: () => Promise<any>
  clearDownloads?: () => Promise<any>
  registerShortcuts?: (shortcuts: any) => Promise<any>
  getData?: (key: string) => Promise<any>
  saveData?: (key: string, data: any) => Promise<any>
  onNotification?: (callback: (data: any) => void) => void
  executeAction?: (action: any) => Promise<any>
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

export {}