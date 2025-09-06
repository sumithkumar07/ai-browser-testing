// Enhanced Type Definitions for KAiro Browser
export interface Tab {
  id: string
  title: string
  url: string
  isLoading: boolean
  isActive: boolean
  type: 'browser' | 'ai' // Added type distinction
  content?: string // For AI tabs
  createdBy?: 'user' | 'agent' // Track creation source
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
}

export interface AITabContent {
  id: string
  title: string
  content: string
  type: 'research' | 'summary' | 'analysis' | 'notes'
  createdAt: number
  updatedAt: number
  tags?: string[]
}

export interface AgentTask {
  id: string
  description: string
  agentType: 'research' | 'shopping' | 'analysis' | 'navigation'
  status: 'pending' | 'active' | 'completed' | 'failed'
  steps: AgentStep[]
  result?: any
}

export interface AgentStep {
  id: string
  description: string
  status: 'pending' | 'active' | 'completed' | 'failed'
  startTime?: number
  endTime?: number
  data?: any
}

// Global window type extension
declare global {
  interface Window {
    electronAPI: {
      // Browser Management
      createTab: (url?: string, type?: 'browser' | 'ai') => Promise<any>
      closeTab: (tabId: string) => Promise<any>
      switchTab: (tabId: string) => Promise<any>
      navigateTo: (url: string) => Promise<any>
      goBack: () => Promise<any>
      goForward: () => Promise<any>
      reload: () => Promise<any>
      getCurrentUrl: () => Promise<any>
      getPageTitle: () => Promise<any>
      
      // AI Service
      sendAIMessage: (message: string) => Promise<AIResponse>
      summarizePage: () => Promise<any>
      analyzeContent: () => Promise<any>
      getAIContext: () => Promise<any>
      testConnection: () => Promise<any>
      
      // Agent System
      executeAgentTask: (task: string) => Promise<any>
      getAgentStatus: (agentId?: string) => Promise<any>
      cancelAgentTask: (taskId: string) => Promise<any>
      
      // Content Management
      extractPageContent: (tabId?: string) => Promise<any>
      saveAITabContent: (tabId: string, content: string) => Promise<any>
      loadAITabContent: (tabId: string) => Promise<any>
      createAITab: (title: string, content?: string) => Promise<any>
      
      // Event Listeners
      onBrowserEvent: (callback: (event: BrowserEvent) => void) => void
      onAgentUpdate: (callback: (status: AgentStatus) => void) => void
      onMenuAction: (callback: (action: string) => void) => void
      
      // Debug
      debugBrowserView: () => Promise<any>
    }
  }
}