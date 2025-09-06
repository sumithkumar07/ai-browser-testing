// Electron API types for renderer process
export interface ElectronAPI {
  // Browser Management
  createTab: (url: string) => Promise<{ success: boolean; tabId?: string; error?: string }>
  closeTab: (tabId: string) => Promise<{ success: boolean; error?: string }>
  switchTab: (tabId: string) => Promise<{ success: boolean; error?: string }>
  navigateTo: (url: string) => Promise<{ success: boolean; error?: string }>
  goBack: () => Promise<{ success: boolean; error?: string }>
  goForward: () => Promise<{ success: boolean; error?: string }>
  reload: () => Promise<{ success: boolean; error?: string }>
  getCurrentUrl: () => Promise<{ success: boolean; url?: string; error?: string }>
  getPageTitle: () => Promise<{ success: boolean; title?: string; error?: string }>
  updateBrowserViewBounds: (bounds: any) => Promise<{ success: boolean; error?: string }>
  
  // AI Service
  sendAIMessage: (message: string) => Promise<{ success: boolean; result?: string; error?: string }>
  summarizePage: () => Promise<{ success: boolean; summary?: string; error?: string }>
  analyzeContent: () => Promise<{ success: boolean; analysis?: string; error?: string }>
  getAIContext: () => Promise<{ success: boolean; context?: any; error?: string }>
  testConnection: () => Promise<{ success: boolean; message?: string; error?: string }>
  
  // Advanced Features
  analyzeImage: (imageData: any) => Promise<{ success: boolean; analysis?: string; error?: string }>
  processPDF: (filePath: string) => Promise<{ success: boolean; content?: string; error?: string }>
  processWordDocument: (filePath: string) => Promise<{ success: boolean; content?: string; error?: string }>
  processTextDocument: (filePath: string) => Promise<{ success: boolean; content?: string; error?: string }>
  
  // Shopping & Research
  searchProducts: (query: string, options?: any) => Promise<{ success: boolean; products?: any[]; error?: string }>
  compareProducts: (products: any[]) => Promise<{ success: boolean; comparison?: any; error?: string }>
  addToCart: (product: any, quantity?: number) => Promise<{ success: boolean; error?: string }>
  
  // Bookmarks & History
  addBookmark: (bookmark: any) => Promise<{ success: boolean; bookmark?: any; error?: string }>
  removeBookmark: (bookmarkId: string) => Promise<{ success: boolean; error?: string }>
  searchBookmarks: (options?: any) => Promise<{ success: boolean; bookmarks?: any[]; error?: string }>
  getHistory: (options?: any) => Promise<{ success: boolean; history?: any[]; error?: string }>
  clearHistory: (options?: any) => Promise<{ success: boolean; count?: number; error?: string }>
  
  // System Info
  getVersion: () => Promise<{ success: boolean; version?: string; error?: string }>
  getPlatform: () => Promise<{ success: boolean; platform?: string; error?: string }>
  
  // Dev Tools
  openDevTools: () => Promise<{ success: boolean; error?: string }>
  closeDevTools: () => Promise<{ success: boolean; error?: string }>
  
  // Event Listeners
  onBrowserEvent: (callback: (event: any) => void) => void
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
  debugBrowserView: () => Promise<{ success: boolean; debug?: any; error?: string }>
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

export interface Tab {
  id: string
  title: string
  url: string
  isLoading: boolean
  isActive: boolean
}

export interface BrowserEvent {
  type: string
  tabId?: string
  url?: string
  title?: string
  loading?: boolean
  error?: any
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
  actions?: any[]
  metadata?: any
  error?: string
}

export interface Product {
  id: string
  name: string
  price: number
  currency: string
  image?: string
  description?: string
  rating?: number
  reviews?: number
  availability?: string
  url: string
  source: string
}

export interface Bookmark {
  id: string
  title: string
  url: string
  description?: string
  tags?: string[]
  folder?: string
  createdAt: number
  updatedAt: number
  favicon?: string
  visits?: number
  lastVisited?: number
}

export interface HistoryEntry {
  id: string
  title: string
  url: string
  timestamp: number
  visitCount: number
  favicon?: string
  referrer?: string
  duration?: number
}
