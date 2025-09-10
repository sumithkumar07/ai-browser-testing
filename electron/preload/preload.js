/**
 * Enhanced Preload Script - Extended with Advanced Capabilities
 * Provides secure API bridge between renderer and main process
 */

const { contextBridge, ipcRenderer } = require('electron')

// Enhanced API with new capabilities
const electronAPI = {
  // Basic tab management
  createTab: (url, type) => ipcRenderer.invoke('create-tab', url, type),
  closeTab: (tabId) => ipcRenderer.invoke('close-tab', tabId),
  switchTab: (tabId) => ipcRenderer.invoke('switch-tab', tabId),
  
  // Navigation
  navigateTo: (url) => ipcRenderer.invoke('navigate-to', url),
  goBack: () => ipcRenderer.invoke('go-back'),
  goForward: () => ipcRenderer.invoke('go-forward'),
  reload: () => ipcRenderer.invoke('reload'),
  getCurrentUrl: () => ipcRenderer.invoke('get-current-url'),
  getPageTitle: () => ipcRenderer.invoke('get-page-title'),
  
  // AI Services
  sendAIMessage: (message) => ipcRenderer.invoke('send-ai-message', message),
  testConnection: () => ipcRenderer.invoke('test-ai-connection'),
  summarizePage: () => ipcRenderer.invoke('summarize-page'),
  analyzeContent: () => ipcRenderer.invoke('analyze-content'),
  getAIContext: () => ipcRenderer.invoke('get-ai-context'),
  
  // Enhanced Navigation & Search
  performDeepSearch: (query, options) => ipcRenderer.invoke('perform-deep-search', query, options),
  getAINavigationSuggestions: (query, currentUrl) => ipcRenderer.invoke('get-ai-navigation-suggestions', query, currentUrl),
  performSecurityScan: (target, scanType) => ipcRenderer.invoke('perform-security-scan', target, scanType),
  getSystemHealth: () => ipcRenderer.invoke('get-system-health'),
  
  // Agent System
  executeAgentTask: (task) => ipcRenderer.invoke('execute-agent-task', task),
  getAgentStatus: (agentId) => ipcRenderer.invoke('get-agent-status', agentId),
  
  // AI Tab Management
  createAITab: (title, content) => ipcRenderer.invoke('create-ai-tab', title, content),
  saveAITabContent: (tabId, content) => ipcRenderer.invoke('save-ai-tab-content', tabId, content),
  loadAITabContent: (tabId) => ipcRenderer.invoke('load-ai-tab-content', tabId),
  
  // Content Management
  extractPageContent: (tabId) => ipcRenderer.invoke('extract-page-content', tabId),
  
  // Enhanced Deep Search API
  executeDeepSearch: (query) => ipcRenderer.invoke('deep-search-execute', query),
  createSearchQuery: (query, options) => ipcRenderer.invoke('deep-search-create-query', query, options),
  getSearchSources: () => ipcRenderer.invoke('deep-search-get-sources'),
  getSearchResults: (queryId) => ipcRenderer.invoke('deep-search-get-results', queryId),
  cancelSearch: (queryId) => ipcRenderer.invoke('deep-search-cancel', queryId),
  
  // Shadow Workspace API
  createShadowTask: (taskConfig) => ipcRenderer.invoke('shadow-workspace-create-task', taskConfig),
  getShadowTasks: () => ipcRenderer.invoke('shadow-workspace-get-tasks'),
  pauseShadowTask: (taskId) => ipcRenderer.invoke('shadow-workspace-pause-task', taskId),
  resumeShadowTask: (taskId) => ipcRenderer.invoke('shadow-workspace-resume-task', taskId),
  cancelShadowTask: (taskId) => ipcRenderer.invoke('shadow-workspace-cancel-task', taskId),
  enableHeadlessMode: () => ipcRenderer.invoke('shadow-workspace-enable-headless'),
  disableHeadlessMode: () => ipcRenderer.invoke('shadow-workspace-disable-headless'),
  getShadowWorkspaceStatus: () => ipcRenderer.invoke('shadow-workspace-get-status'),
  
  // Cross-Platform Integration API
  executeFileOperation: (operation) => ipcRenderer.invoke('cross-platform-file-operation', operation),
  executeAppAutomation: (appId, action, parameters) => ipcRenderer.invoke('cross-platform-app-automation', appId, action, parameters),
  integrateWithService: (serviceId, action, data) => ipcRenderer.invoke('cross-platform-service-integration', serviceId, action, data),
  getInstalledApps: () => ipcRenderer.invoke('cross-platform-get-apps'),
  getAvailableServices: () => ipcRenderer.invoke('cross-platform-get-services'),
  refreshAppDetection: () => ipcRenderer.invoke('cross-platform-refresh-apps'),
  
  // Advanced Security API
  encryptData: (data) => ipcRenderer.invoke('security-encrypt', data),
  decryptData: (encryptedData) => ipcRenderer.invoke('security-decrypt', encryptedData),
  storeCredential: (credential) => ipcRenderer.invoke('security-store-credential', credential),
  retrieveCredential: (credentialId) => ipcRenderer.invoke('security-retrieve-credential', credentialId),
  deleteCredential: (credentialId) => ipcRenderer.invoke('security-delete-credential', credentialId),
  createSecureSession: (userId) => ipcRenderer.invoke('security-create-session', userId),
  validateSession: (sessionId) => ipcRenderer.invoke('security-validate-session', sessionId),
  destroySession: (sessionId) => ipcRenderer.invoke('security-destroy-session', sessionId),
  getSecurityStatus: () => ipcRenderer.invoke('security-get-status'),
  getSecurityAuditLog: (limit) => ipcRenderer.invoke('security-get-audit-log', limit),
  performHardwareAttestation: () => ipcRenderer.invoke('security-hardware-attestation'),
  
  // Enhanced Agent Coordinator API
  createEnhancedTask: (taskConfig) => ipcRenderer.invoke('enhanced-agent-create-task', taskConfig),
  getEnhancedTasks: () => ipcRenderer.invoke('enhanced-agent-get-tasks'),
  cancelEnhancedTask: (taskId) => ipcRenderer.invoke('enhanced-agent-cancel-task', taskId),
  getSystemStatus: () => ipcRenderer.invoke('enhanced-agent-get-system-status'),
  getCapabilityMatrix: () => ipcRenderer.invoke('enhanced-agent-get-capabilities'),
  
  // Document Processing
  analyzeImage: (imageData) => ipcRenderer.invoke('analyze-image', imageData),
  processPDF: (filePath) => ipcRenderer.invoke('process-pdf', filePath),
  processWordDocument: (filePath) => ipcRenderer.invoke('process-word-document', filePath),
  processTextDocument: (filePath) => ipcRenderer.invoke('process-text-document', filePath),
  
  // Shopping & Research
  searchProducts: (query, options) => ipcRenderer.invoke('search-products', query, options),
  monitorPrices: (productIds, options) => ipcRenderer.invoke('monitor-prices', productIds, options),
  executeResearch: (topic, options) => ipcRenderer.invoke('execute-research', topic, options),
  createResearchReport: (data, format) => ipcRenderer.invoke('create-research-report', data, format),
  
  // System Information
  getVersion: () => ipcRenderer.invoke('get-version'),
  getPlatform: () => ipcRenderer.invoke('get-platform'),
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
  
  // Development Tools
  openDevTools: () => ipcRenderer.invoke('open-dev-tools'),
  closeDevTools: () => ipcRenderer.invoke('close-dev-tools'),
  debugBrowserView: () => ipcRenderer.invoke('debug-browser-view'),
  
  // Event Listeners
  onBrowserEvent: (callback) => {
    const wrappedCallback = (event, data) => callback(data)
    ipcRenderer.on('browser-event', wrappedCallback)
    return () => ipcRenderer.removeListener('browser-event', wrappedCallback)
  },
  
  onMenuAction: (callback) => {
    const wrappedCallback = (event, action) => callback(action)
    ipcRenderer.on('menu-action', wrappedCallback)
    return () => ipcRenderer.removeListener('menu-action', wrappedCallback)
  },
  
  onAgentUpdate: (callback) => {
    const wrappedCallback = (event, data) => callback(data)
    ipcRenderer.on('agent-update', wrappedCallback)
    return () => ipcRenderer.removeListener('agent-update', wrappedCallback)
  },
  
  onDeepSearchUpdate: (callback) => {
    const wrappedCallback = (event, data) => callback(data)
    ipcRenderer.on('deep-search-update', wrappedCallback)
    return () => ipcRenderer.removeListener('deep-search-update', wrappedCallback)
  },
  
  onShadowWorkspaceUpdate: (callback) => {
    const wrappedCallback = (event, data) => callback(data)
    ipcRenderer.on('shadow-workspace-update', wrappedCallback)
    return () => ipcRenderer.removeListener('shadow-workspace-update', wrappedCallback)
  },
  
  onCrossPlatformUpdate: (callback) => {
    const wrappedCallback = (event, data) => callback(data)
    ipcRenderer.on('cross-platform-update', wrappedCallback)
    return () => ipcRenderer.removeListener('cross-platform-update', wrappedCallback)
  },
  
  onSecurityUpdate: (callback) => {
    const wrappedCallback = (event, data) => callback(data)
    ipcRenderer.on('security-update', wrappedCallback)
    return () => ipcRenderer.removeListener('security-update', wrappedCallback)
  },
  
  onNotification: (callback) => {
    const wrappedCallback = (event, data) => callback(data)
    ipcRenderer.on('notification', wrappedCallback)
    return () => ipcRenderer.removeListener('notification', wrappedCallback)
  },
  
  // Cleanup function
  removeAllListeners: () => {
    ipcRenderer.removeAllListeners('browser-event')
    ipcRenderer.removeAllListeners('menu-action')
    ipcRenderer.removeAllListeners('agent-update')
    ipcRenderer.removeAllListeners('deep-search-update')
    ipcRenderer.removeAllListeners('shadow-workspace-update')
    ipcRenderer.removeAllListeners('cross-platform-update')
    ipcRenderer.removeAllListeners('security-update')
    ipcRenderer.removeAllListeners('notification')
  }
}

// Expose the enhanced API to the renderer process
contextBridge.exposeInMainWorld('electronAPI', electronAPI)

// Log successful preload initialization
console.log('🔌 Enhanced KAiro Browser preload script loaded successfully')
console.log('📋 Available API methods:', Object.keys(electronAPI).length)

// Security validation
if (process.contextIsolated) {
  console.log('✅ Context isolation enabled - secure communication established')
} else {
  console.warn('⚠️ Context isolation disabled - potential security risk')
}

// Feature detection
const features = {
  deepSearch: true,
  shadowWorkspace: true,
  crossPlatform: true,
  security: true,
  agentCoordination: true,
  documentProcessing: true,
  researchCapabilities: true
}

console.log('🚀 Enhanced capabilities enabled:', features)

// Export for debugging (development only)
if (process.env.NODE_ENV === 'development') {
  window.electronAPIDebug = electronAPI
  console.log('🐛 Debug API exposed for development')
}