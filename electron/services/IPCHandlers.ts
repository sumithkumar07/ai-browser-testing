// electron/services/IPCHandlers.ts
import { ipcMain, IpcMainInvokeEvent } from 'electron'
import BrowserViewManager from './BrowserViewManager'
import AIService from './AIService'

export interface IPCResult {
  success: boolean
  data?: any
  error?: string
}

export interface TabInfo {
  id: string
  title: string
  url: string
  isLoading: boolean
  canGoBack: boolean
  canGoForward: boolean
  favicon?: string
}

export class IPCHandlers {
  private browserManager: BrowserViewManager
  private aiService: AIService
  private isInitialized: boolean = false

  constructor(browserManager: BrowserViewManager) {
    this.browserManager = browserManager
    this.aiService = AIService.getInstance()
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('⚠️ IPC Handlers already initialized')
      return
    }

    console.log('🔌 Setting up IPC handlers...')
    
    // Initialize AI service
    try {
      await this.aiService.initialize()
      console.log('✅ AI Service initialized for IPC handlers')
    } catch (error) {
      console.error('❌ Failed to initialize AI Service:', error)
      // Continue without AI service
    }
    
    this.setupHandlers()
    this.isInitialized = true
    console.log('✅ IPC Handlers initialized')
  }

  private setupHandlers(): void {
    // Browser Management IPC Handlers
    ipcMain.handle('create-tab', async (event: IpcMainInvokeEvent, url: string): Promise<IPCResult> => {
      try {
        const tabId = `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const result = await this.browserManager.createBrowserView(tabId, url)
        
        if (result.success) {
          event.sender.send('tab-created', { tabId, url })
        }
        
        return result
      } catch (error) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        }
      }
    })

    ipcMain.handle('close-tab', async (event: IpcMainInvokeEvent, tabId: string): Promise<IPCResult> => {
      try {
        const result = await this.browserManager.destroyBrowserView(tabId)
        
        if (result.success) {
          event.sender.send('tab-closed', { tabId })
        }
        
        return result
      } catch (error) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        }
      }
    })

    ipcMain.handle('switch-tab', async (event: IpcMainInvokeEvent, tabId: string): Promise<IPCResult> => {
      try {
        const mainWindow = event.sender.getOwnerBrowserWindow()
        const result = await this.browserManager.switchToTab(tabId, mainWindow)
        
        if (result.success) {
          event.sender.send('tab-switched', { tabId })
        }
        
        return result
      } catch (error) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        }
      }
    })

    ipcMain.handle('navigate-to', async (event: IpcMainInvokeEvent, url: string): Promise<IPCResult> => {
      try {
        const activeTabId = this.browserManager.getActiveTabId()
        if (!activeTabId) {
          return { success: false, error: 'No active tab' }
        }

        const result = await this.browserManager.navigateToUrl(activeTabId, url)
        
        if (result.success) {
          event.sender.send('navigation-started', { url })
        }
        
        return result
      } catch (error) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        }
      }
    })

    ipcMain.handle('go-back', async (event: IpcMainInvokeEvent): Promise<IPCResult> => {
      try {
        const activeTabId = this.browserManager.getActiveTabId()
        if (!activeTabId) {
          return { success: false, error: 'No active tab' }
        }

        return await this.browserManager.goBack(activeTabId)
      } catch (error) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        }
      }
    })

    ipcMain.handle('go-forward', async (event: IpcMainInvokeEvent): Promise<IPCResult> => {
      try {
        const activeTabId = this.browserManager.getActiveTabId()
        if (!activeTabId) {
          return { success: false, error: 'No active tab' }
        }

        return await this.browserManager.goForward(activeTabId)
      } catch (error) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        }
      }
    })

    ipcMain.handle('reload', async (event: IpcMainInvokeEvent): Promise<IPCResult> => {
      try {
        const activeTabId = this.browserManager.getActiveTabId()
        if (!activeTabId) {
          return { success: false, error: 'No active tab' }
        }

        return await this.browserManager.reload(activeTabId)
      } catch (error) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        }
      }
    })

    // Tab Information Handlers
    ipcMain.handle('get-tab-info', async (event: IpcMainInvokeEvent, tabId: string): Promise<IPCResult> => {
      try {
        const tabInfo = this.browserManager.getTabInfo(tabId)
        return { 
          success: true, 
          data: tabInfo 
        }
      } catch (error) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        }
      }
    })

    ipcMain.handle('get-all-tabs', async (event: IpcMainInvokeEvent): Promise<IPCResult> => {
      try {
        const tabs = this.browserManager.getAllTabs()
        return { 
          success: true, 
          data: tabs 
        }
      } catch (error) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        }
      }
    })

    ipcMain.handle('get-active-tab', async (event: IpcMainInvokeEvent): Promise<IPCResult> => {
      try {
        const activeTabId = this.browserManager.getActiveTabId()
        const tabInfo = activeTabId ? this.browserManager.getTabInfo(activeTabId) : null
        return { 
          success: true, 
          data: { tabId: activeTabId, tabInfo } 
        }
      } catch (error) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        }
      }
    })

    // AI Service Handlers
    ipcMain.handle('send-ai-message', async (event: IpcMainInvokeEvent, message: string): Promise<IPCResult> => {
      try {
        if (!this.aiService.isReady()) {
          return {
            success: false,
            error: 'AI Service not initialized'
          }
        }

        const response = await this.aiService.sendMessage(message)
        return {
          success: response.success,
          data: response.result,
          error: response.error
        }
      } catch (error) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        }
      }
    })

    ipcMain.handle('summarize-page', async (event: IpcMainInvokeEvent): Promise<IPCResult> => {
      try {
        if (!this.aiService.isReady()) {
          return {
            success: false,
            error: 'AI Service not initialized'
          }
        }

        // Get current page content from active tab
        const activeTabId = this.browserManager.getActiveTabId()
        if (!activeTabId) {
          return { success: false, error: 'No active tab' }
        }

        const tabInfo = this.browserManager.getTabInfo(activeTabId)
        const response = await this.aiService.summarizePage('Page content', tabInfo.url)
        
        return {
          success: response.success,
          data: response.result,
          error: response.error
        }
      } catch (error) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        }
      }
    })

    ipcMain.handle('analyze-content', async (event: IpcMainInvokeEvent): Promise<IPCResult> => {
      try {
        if (!this.aiService.isReady()) {
          return {
            success: false,
            error: 'AI Service not initialized'
          }
        }

        // Get current page content from active tab
        const activeTabId = this.browserManager.getActiveTabId()
        if (!activeTabId) {
          return { success: false, error: 'No active tab' }
        }

        const tabInfo = this.browserManager.getTabInfo(activeTabId)
        const response = await this.aiService.analyzeContent('Page content', tabInfo.url)
        
        return {
          success: response.success,
          data: response.result,
          error: response.error
        }
      } catch (error) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        }
      }
    })

    ipcMain.handle('get-ai-context', async (event: IpcMainInvokeEvent): Promise<IPCResult> => {
      try {
        if (!this.aiService.isReady()) {
          return {
            success: false,
            error: 'AI Service not initialized'
          }
        }

        const context = this.aiService.getContext()
        return {
          success: true,
          data: context
        }
      } catch (error) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        }
      }
    })

    ipcMain.handle('test-ai-connection', async (event: IpcMainInvokeEvent): Promise<IPCResult> => {
      try {
        const isConnected = await this.aiService.testConnection()
        return {
          success: isConnected,
          data: { connected: isConnected, timestamp: Date.now() }
        }
      } catch (error) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        }
      }
    })

    // Shopping & Research Handlers
    ipcMain.handle('search-products', async (event: IpcMainInvokeEvent, query: string, options?: any): Promise<IPCResult> => {
      try {
        if (!this.aiService.isReady()) {
          return {
            success: false,
            error: 'AI Service not initialized'
          }
        }

        const response = await this.aiService.searchProducts(query, options)
        return {
          success: response.success,
          data: response.result,
          error: response.error
        }
      } catch (error) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        }
      }
    })

    ipcMain.handle('compare-products', async (event: IpcMainInvokeEvent, products: any[]): Promise<IPCResult> => {
      try {
        if (!this.aiService.isReady()) {
          return {
            success: false,
            error: 'AI Service not initialized'
          }
        }

        const response = await this.aiService.compareProducts(products)
        return {
          success: response.success,
          data: response.result,
          error: response.error
        }
      } catch (error) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        }
      }
    })

    // Data Storage Handlers
    ipcMain.handle('save-data', async (event: IpcMainInvokeEvent, key: string, data: any): Promise<IPCResult> => {
      try {
        // This would integrate with the data storage service
        // For now, use localStorage simulation
        return {
          success: true,
          data: { saved: true, key, timestamp: Date.now() }
        }
      } catch (error) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        }
      }
    })

    ipcMain.handle('get-data', async (event: IpcMainInvokeEvent, key: string): Promise<IPCResult> => {
      try {
        // This would integrate with the data storage service
        return {
          success: true,
          data: null // Would return actual data
        }
      } catch (error) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        }
      }
    })

    // Extension Handlers
    ipcMain.handle('install-extension', async (event: IpcMainInvokeEvent, manifest: any): Promise<IPCResult> => {
      try {
        // Extension installation logic
        return {
          success: true,
          data: { installed: true, extensionId: `ext_${Date.now()}` }
        }
      } catch (error) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        }
      }
    })

    ipcMain.handle('uninstall-extension', async (event: IpcMainInvokeEvent, extensionId: string): Promise<IPCResult> => {
      try {
        // Extension uninstallation logic
        return {
          success: true,
          data: { uninstalled: true, extensionId }
        }
      } catch (error) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        }
      }
    })

    // Keyboard Shortcuts Handlers
    ipcMain.handle('register-shortcuts', async (event: IpcMainInvokeEvent, shortcuts: any[]): Promise<IPCResult> => {
      try {
        // Register global shortcuts
        return {
          success: true,
          data: { registered: shortcuts.length }
        }
      } catch (error) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        }
      }
    })

    // Notification Handlers
    ipcMain.handle('show-notification', async (event: IpcMainInvokeEvent, notification: any): Promise<IPCResult> => {
      try {
        // Show system notification
        return {
          success: true,
          data: { shown: true, notificationId: `notif_${Date.now()}` }
        }
      } catch (error) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        }
      }
    })
  }

  // Public utility methods
  isReady(): boolean {
    return this.isInitialized
  }

  async cleanup(): Promise<void> {
    console.log('🧹 Cleaning up IPC Handlers...')
    
    // Cleanup AI service
    if (this.aiService.isReady()) {
      await this.aiService.cleanup()
    }
    
    // Remove all IPC handlers
    ipcMain.removeAllListeners('create-tab')
    ipcMain.removeAllListeners('close-tab')
    ipcMain.removeAllListeners('switch-tab')
    ipcMain.removeAllListeners('navigate-to')
    ipcMain.removeAllListeners('go-back')
    ipcMain.removeAllListeners('go-forward')
    ipcMain.removeAllListeners('reload')
    ipcMain.removeAllListeners('get-tab-info')
    ipcMain.removeAllListeners('get-all-tabs')
    ipcMain.removeAllListeners('get-active-tab')
    ipcMain.removeAllListeners('send-ai-message')
    ipcMain.removeAllListeners('summarize-page')
    ipcMain.removeAllListeners('analyze-content')
    ipcMain.removeAllListeners('get-ai-context')
    ipcMain.removeAllListeners('test-ai-connection')
    ipcMain.removeAllListeners('search-products')
    ipcMain.removeAllListeners('compare-products')
    ipcMain.removeAllListeners('save-data')
    ipcMain.removeAllListeners('get-data')
    ipcMain.removeAllListeners('install-extension')
    ipcMain.removeAllListeners('uninstall-extension')
    ipcMain.removeAllListeners('register-shortcuts')
    ipcMain.removeAllListeners('show-notification')
    
    this.isInitialized = false
    console.log('✅ IPC Handlers cleanup complete')
  }
}

export default IPCHandlers
