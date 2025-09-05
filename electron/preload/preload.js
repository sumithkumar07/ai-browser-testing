const { contextBridge, ipcRenderer } = require('electron')

console.log('Phase 5: Preload script starting...')

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Browser functions
  navigateTo: (url) => ipcRenderer.invoke('navigate-to', url),
  goBack: () => ipcRenderer.invoke('go-back'),
  goForward: () => ipcRenderer.invoke('go-forward'),
  refresh: () => ipcRenderer.invoke('refresh'),
  getCurrentUrl: () => ipcRenderer.invoke('get-current-url'),
  getPageTitle: () => ipcRenderer.invoke('get-page-title'),
  
  // Tab management
  setActiveTab: (tabId) => ipcRenderer.invoke('set-active-tab', tabId),
  createTabBrowserView: (tabId) => ipcRenderer.invoke('create-tab-browser-view', tabId),
  
  // AI functions
  sendAIMessage: (message, browserContext = '') => ipcRenderer.invoke('send-ai-message', message, browserContext),
  getAIContext: () => ipcRenderer.invoke('get-ai-context'),
  summarizePage: () => ipcRenderer.invoke('summarize-page'),
  analyzeContent: () => ipcRenderer.invoke('analyze-content'),
  
  // System functions
  getVersion: () => ipcRenderer.invoke('get-version'),
  getPlatform: () => ipcRenderer.invoke('get-platform'),
  openDevTools: () => ipcRenderer.invoke('open-dev-tools'),
  closeDevTools: () => ipcRenderer.invoke('close-dev-tools'),

  // Browser view management
  updateBrowserViewBounds: (sidebarCollapsed) => ipcRenderer.invoke('update-browser-view-bounds', sidebarCollapsed),

  // Test function
  testConnection: () => ipcRenderer.invoke('test-connection'),
})

console.log('Phase 5: Preload script loaded with browser and AI functions')
console.log('Phase 5: electronAPI exposed to window:', typeof window !== 'undefined' ? 'window exists' : 'no window')
