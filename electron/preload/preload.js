const { contextBridge, ipcRenderer } = require('electron')

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Browser Management
  createTab: (url) => ipcRenderer.invoke('create-tab', url),
  closeTab: (tabId) => ipcRenderer.invoke('close-tab', tabId),
  switchTab: (tabId) => ipcRenderer.invoke('switch-tab', tabId),
  navigateTo: (url) => ipcRenderer.invoke('navigate-to', url),
  goBack: () => ipcRenderer.invoke('go-back'),
  goForward: () => ipcRenderer.invoke('go-forward'),
  reload: () => ipcRenderer.invoke('reload'),
  getCurrentUrl: () => ipcRenderer.invoke('get-current-url'),
  getPageTitle: () => ipcRenderer.invoke('get-page-title'),
  updateBrowserViewBounds: (bounds) => ipcRenderer.invoke('update-browser-view-bounds', bounds),
  
  // AI Service
  sendAIMessage: (message) => ipcRenderer.invoke('send-ai-message', message),
  summarizePage: () => ipcRenderer.invoke('summarize-page'),
  analyzeContent: () => ipcRenderer.invoke('analyze-content'),
  getAIContext: () => ipcRenderer.invoke('get-ai-context'),
  testConnection: () => ipcRenderer.invoke('test-ai-connection'),
  testAIConnection: () => ipcRenderer.invoke('test-ai-connection'),
  
  // Agent System
  executeAgentTask: (task) => ipcRenderer.invoke('execute-agent-task', task),
  getAgentStatus: (agentId) => ipcRenderer.invoke('get-agent-status', agentId),
  
  // AI Tab Management
  createAITab: (title, content) => ipcRenderer.invoke('create-ai-tab', title, content),
  saveAITabContent: (tabId, content) => ipcRenderer.invoke('save-ai-tab-content', tabId, content),
  loadAITabContent: (tabId) => ipcRenderer.invoke('load-ai-tab-content', tabId),
  
  // Advanced Features
  analyzeImage: (imageData) => ipcRenderer.invoke('analyze-image', imageData),
  processPDF: (filePath) => ipcRenderer.invoke('process-pdf', filePath),
  processWordDocument: (filePath) => ipcRenderer.invoke('process-word-document', filePath),
  processTextDocument: (filePath) => ipcRenderer.invoke('process-text-document', filePath),
  
  // Shopping & Research
  searchProducts: (query, options) => ipcRenderer.invoke('search-products', query, options),
  compareProducts: (products) => ipcRenderer.invoke('compare-products', products),
  addToCart: (product, quantity) => ipcRenderer.invoke('add-to-cart', product, quantity),
  
  // Bookmarks & History
  addBookmark: (bookmark) => ipcRenderer.invoke('add-bookmark', bookmark),
  deleteBookmark: (bookmarkId) => ipcRenderer.invoke('remove-bookmark', bookmarkId),
  getBookmarks: () => ipcRenderer.invoke('get-bookmarks'),
  removeBookmark: (bookmarkId) => ipcRenderer.invoke('remove-bookmark', bookmarkId),
  searchBookmarks: (options) => ipcRenderer.invoke('search-bookmarks', options),
  getHistory: (options) => ipcRenderer.invoke('get-history', options),
  getBrowsingHistory: () => ipcRenderer.invoke('get-history', {}),
  deleteHistoryItem: (historyId) => ipcRenderer.invoke('delete-history-item', historyId),
  clearBrowsingHistory: () => ipcRenderer.invoke('clear-history', {}),
  clearHistory: (options) => ipcRenderer.invoke('clear-history', options),
  
  // System Info
  getVersion: () => ipcRenderer.invoke('get-version'),
  getPlatform: () => ipcRenderer.invoke('get-platform'),
  
  // Data Storage Methods
  getData: (key) => ipcRenderer.invoke('get-data', key),
  saveData: (key, data) => ipcRenderer.invoke('save-data', key, data),
  
  // Keyboard Shortcuts
  registerShortcuts: (shortcuts) => ipcRenderer.invoke('register-shortcuts', shortcuts),
  
  // Dev Tools
  openDevTools: () => ipcRenderer.invoke('open-dev-tools'),
  closeDevTools: () => ipcRenderer.invoke('close-dev-tools'),
  
  // Event Listeners
  onBrowserEvent: (callback) => {
    ipcRenderer.on('browser-event', (event, data) => callback(data))
  },
  onTabCreated: (callback) => {
    ipcRenderer.on('tab-created', (event, data) => callback(data))
  },
  onTabClosed: (callback) => {
    ipcRenderer.on('tab-closed', (event, data) => callback(data))
  },
  onTabSwitched: (callback) => {
    ipcRenderer.on('tab-switched', (event, data) => callback(data))
  },
  onNavigationStarted: (callback) => {
    ipcRenderer.on('navigation-started', (event, data) => callback(data))
  },
  onNavigationCompleted: (callback) => {
    ipcRenderer.on('navigation-completed', (event, data) => callback(data))
  },
  onPageTitleUpdated: (callback) => {
    ipcRenderer.on('page-title-updated', (event, data) => callback(data))
  },
  onAIContentUpdate: (callback) => {
    ipcRenderer.on('ai-content-update', (event, data) => callback(data))
  },
  onMenuAction: (callback) => {
    ipcRenderer.on('menu-action', (event, action) => callback(action))
  },
  
  // Remove Event Listeners
  removeBrowserEventListener: () => ipcRenderer.removeAllListeners('browser-event'),
  removeTabCreatedListener: () => ipcRenderer.removeAllListeners('tab-created'),
  removeTabClosedListener: () => ipcRenderer.removeAllListeners('tab-closed'),
  removeTabSwitchedListener: () => ipcRenderer.removeAllListeners('tab-switched'),
  removeNavigationStartedListener: () => ipcRenderer.removeAllListeners('navigation-started'),
  removeNavigationCompletedListener: () => ipcRenderer.removeAllListeners('navigation-completed'),
  removePageTitleUpdatedListener: () => ipcRenderer.removeAllListeners('page-title-updated'),
  removeAIContentUpdateListener: () => ipcRenderer.removeAllListeners('ai-content-update'),
  removeMenuActionListener: () => ipcRenderer.removeAllListeners('menu-action'),
  
  // Debug
  debugBrowserView: () => ipcRenderer.invoke('debug-browser-view')
})

// Security: Prevent the renderer process from accessing Node.js APIs
window.addEventListener('DOMContentLoaded', () => {
  console.log('🔒 Preload script loaded - Electron APIs exposed securely')
})
