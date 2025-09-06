// src/main/types/electron.ts

export interface Tab {
  id: string
  title: string
  url: string
  isLoading: boolean
  isActive: boolean
  favicon?: string
  canGoBack?: boolean
  canGoForward?: boolean
  createdAt?: number
}

export interface AIMessage {
  id: string
  content: string
  timestamp: number
  isUser: boolean
  isLoading?: boolean
}

export interface AIResponse {
  success: boolean
  result?: string
  actions?: AIAction[]
  metadata?: any
  error?: string
}

export interface AIAction {
  type: 'navigate' | 'search' | 'analyze' | 'summarize' | 'extract'
  target: string
  params?: any
}

export interface AIContext {
  model: string
  temperature: number
  maxTokens: number
  isInitialized: boolean
  agentCount: number
  platform?: string
}

export interface BrowserEvent {
  type: string
  tabId?: string
  url?: string
  title?: string
  loading?: boolean
  error?: any
  data?: any
}

export interface ElectronAPI {
  // Tab Management
  createTab: (url?: string) => Promise<{ success: boolean; tabId?: string; url?: string; error?: string }>
  closeTab: (tabId: string) => Promise<{ success: boolean; tabId?: string; error?: string }>
  switchTab: (tabId: string) => Promise<{ success: boolean; tabId?: string; url?: string; error?: string }>
  
  // Navigation
  navigateTo: (url: string) => Promise<{ success: boolean; url?: string; error?: string }>
  goBack: () => Promise<{ success: boolean; error?: string }>
  goForward: () => Promise<{ success: boolean; error?: string }>
  reload: () => Promise<{ success: boolean; error?: string }>
  getCurrentUrl: () => Promise<{ success: boolean; url?: string; error?: string }>
  getPageTitle: () => Promise<{ success: boolean; title?: string; error?: string }>
  
  // AI Service
  sendAIMessage: (message: string) => Promise<AIResponse>
  summarizePage: () => Promise<{ success: boolean; data?: string; error?: string }>
  analyzeContent: () => Promise<{ success: boolean; data?: string; error?: string }>
  getAIContext: () => Promise<{ success: boolean; context?: AIContext; error?: string }>
  testConnection: () => Promise<{ success: boolean; data?: any; error?: string }>
  
  // Document Processing
  analyzeImage: (imageData: any) => Promise<{ success: boolean; data?: string; error?: string }>
  processPDF: (filePath: string) => Promise<{ success: boolean; data?: string; error?: string }>
  processWordDocument: (filePath: string) => Promise<{ success: boolean; data?: string; error?: string }>
  processTextDocument: (filePath: string) => Promise<{ success: boolean; data?: string; error?: string }>
  
  // Shopping & Research
  searchProducts: (query: string, options?: any) => Promise<{ success: boolean; data?: any; error?: string }>
  compareProducts: (products: any[]) => Promise<{ success: boolean; data?: any; error?: string }>
  addToCart: (product: any, quantity: number) => Promise<{ success: boolean; data?: any; error?: string }>
  
  // Bookmarks & History
  addBookmark: (bookmark: any) => Promise<{ success: boolean; error?: string }>
  removeBookmark: (bookmarkId: string) => Promise<{ success: boolean; error?: string }>
  searchBookmarks: (options?: any) => Promise<{ success: boolean; data?: any; error?: string }>
  getHistory: (options?: any) => Promise<{ success: boolean; data?: any; error?: string }>
  clearHistory: (options?: any) => Promise<{ success: boolean; error?: string }>
  
  // System Info
  getVersion: () => Promise<string>
  getPlatform: () => Promise<string>
  
  // Dev Tools
  openDevTools: () => Promise<void>
  closeDevTools: () => Promise<void>
  
  // Event Listeners
  onBrowserEvent: (callback: (event: BrowserEvent) => void) => void
  onTabCreated: (callback: (data: any) => void) => void
  onTabClosed: (callback: (data: any) => void) => void
  onTabSwitched: (callback: (data: any) => void) => void
  onNavigationStarted: (callback: (data: any) => void) => void
  onNavigationCompleted: (callback: (data: any) => void) => void
  onPageTitleUpdated: (callback: (data: any) => void) => void
  onAIContentUpdate: (callback: (data: any) => void) => void
  onMenuAction: (callback: (action: string) => void) => void
  
  // Remove Event Listeners
  removeBrowserEventListener: () => void
  removeTabCreatedListener: () => void
  removeTabClosedListener: () => void
  removeTabSwitchedListener: () => void
  removeNavigationStartedListener: () => void
  removeNavigationCompletedListener: () => void
  removePageTitleUpdatedListener: () => void
  removeAIContentUpdateListener: () => void
  removeMenuActionListener: () => void
  
  // AI Tab Management
  saveAITabContent: (content: string) => Promise<{ success: boolean; error?: string }>
  loadAITabContent: () => Promise<{ success: boolean; content?: string; error?: string }>
  
  // Debug
  debugBrowserView: () => Promise<any>
}

// Global declarations
declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

export {}