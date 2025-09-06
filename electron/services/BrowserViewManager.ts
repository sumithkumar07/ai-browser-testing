// electron/services/BrowserViewManager.ts
import { BrowserView, WebContents } from 'electron'

export interface TabInfo {
  id: string
  title: string
  url: string
  isLoading: boolean
  canGoBack: boolean
  canGoForward: boolean
  favicon?: string
}

export interface BrowserViewResult {
  success: boolean
  tabId?: string
  error?: string
}

export class BrowserViewManager {
  private browserViews: Map<string, BrowserView> = new Map()
  private activeTabId: string | null = null
  private isInitialized: boolean = false
  private tabInfo: Map<string, TabInfo> = new Map()

  constructor() {
    this.browserViews = new Map()
    this.activeTabId = null
    this.isInitialized = false
    this.tabInfo = new Map()
  }

  async initialize(): Promise<void> {
    try {
      console.log('🌐 Initializing BrowserView Manager...')
      this.isInitialized = true
      console.log('✅ BrowserView Manager initialized')
    } catch (error) {
      console.error('❌ Failed to initialize BrowserView Manager:', error)
      throw error
    }
  }

  async createBrowserView(tabId: string, url: string): Promise<BrowserViewResult> {
    try {
      console.log(`🌐 Creating BrowserView for tab: ${tabId}`)
      
      const browserView = new BrowserView({
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          webSecurity: true,
          preload: require('path').join(__dirname, '../preload/preload.js')
        }
      })

      this.browserViews.set(tabId, browserView)
      
      // Initialize tab info
      this.tabInfo.set(tabId, {
        id: tabId,
        title: 'New Tab',
        url: url,
        isLoading: true,
        canGoBack: false,
        canGoForward: false
      })
      
      // Navigate to URL
      await browserView.webContents.loadURL(url)
      
      // Setup event listeners
      this.setupBrowserViewEvents(tabId, browserView.webContents)
      
      console.log(`✅ BrowserView created for tab: ${tabId}`)
      return { success: true, tabId }
      
    } catch (error) {
      console.error(`❌ Failed to create BrowserView for tab ${tabId}:`, error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async destroyBrowserView(tabId: string): Promise<BrowserViewResult> {
    try {
      console.log(`🗑️ Destroying BrowserView for tab: ${tabId}`)
      
      const browserView = this.browserViews.get(tabId)
      if (browserView) {
        browserView.webContents.destroy()
        this.browserViews.delete(tabId)
        this.tabInfo.delete(tabId)
        
        if (this.activeTabId === tabId) {
          this.activeTabId = null
        }
        
        console.log(`✅ BrowserView destroyed for tab: ${tabId}`)
        return { success: true, tabId }
      } else {
        console.log(`⚠️ BrowserView not found for tab: ${tabId}`)
        return { success: false, error: 'BrowserView not found' }
      }
      
    } catch (error) {
      console.error(`❌ Failed to destroy BrowserView for tab ${tabId}:`, error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async switchToTab(tabId: string, mainWindow: any): Promise<BrowserViewResult> {
    try {
      console.log(`🔄 Switching to tab: ${tabId}`)
      
      const browserView = this.browserViews.get(tabId)
      if (browserView) {
        mainWindow.setBrowserView(browserView)
        this.activeTabId = tabId
        
        // Resize browser view to fit window
        const bounds = mainWindow.getBounds()
        browserView.setBounds({
          x: 0,
          y: 80, // Account for tab bar and navigation
          width: bounds.width,
          height: bounds.height - 80
        })
        
        console.log(`✅ Switched to tab: ${tabId}`)
        return { success: true, tabId }
      } else {
        console.log(`⚠️ BrowserView not found for tab: ${tabId}`)
        return { success: false, error: 'BrowserView not found' }
      }
      
    } catch (error) {
      console.error(`❌ Failed to switch to tab ${tabId}:`, error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async navigateToUrl(tabId: string, url: string): Promise<BrowserViewResult> {
    try {
      console.log(`🌐 Navigating tab ${tabId} to: ${url}`)
      
      const browserView = this.browserViews.get(tabId)
      if (browserView) {
        await browserView.webContents.loadURL(url)
        
        // Update tab info
        const tabInfo = this.tabInfo.get(tabId)
        if (tabInfo) {
          tabInfo.url = url
          tabInfo.isLoading = true
          this.tabInfo.set(tabId, tabInfo)
        }
        
        console.log(`✅ Navigated tab ${tabId} to: ${url}`)
        return { success: true, tabId }
      } else {
        console.log(`⚠️ BrowserView not found for tab: ${tabId}`)
        return { success: false, error: 'BrowserView not found' }
      }
      
    } catch (error) {
      console.error(`❌ Failed to navigate tab ${tabId} to ${url}:`, error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async goBack(tabId: string): Promise<BrowserViewResult> {
    try {
      const browserView = this.browserViews.get(tabId)
      if (browserView && browserView.webContents.canGoBack()) {
        browserView.webContents.goBack()
        return { success: true, tabId }
      }
      return { success: false, error: 'Cannot go back' }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async goForward(tabId: string): Promise<BrowserViewResult> {
    try {
      const browserView = this.browserViews.get(tabId)
      if (browserView && browserView.webContents.canGoForward()) {
        browserView.webContents.goForward()
        return { success: true, tabId }
      }
      return { success: false, error: 'Cannot go forward' }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async reload(tabId: string): Promise<BrowserViewResult> {
    try {
      const browserView = this.browserViews.get(tabId)
      if (browserView) {
        browserView.webContents.reload()
        return { success: true, tabId }
      }
      return { success: false, error: 'BrowserView not found' }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  getTabInfo(tabId: string): TabInfo | null {
    return this.tabInfo.get(tabId) || null
  }

  getAllTabs(): TabInfo[] {
    return Array.from(this.tabInfo.values())
  }

  getActiveTabId(): string | null {
    return this.activeTabId
  }

  private setupBrowserViewEvents(tabId: string, webContents: WebContents): void {
    webContents.on('did-start-loading', () => {
      const tabInfo = this.tabInfo.get(tabId)
      if (tabInfo) {
        tabInfo.isLoading = true
        this.tabInfo.set(tabId, tabInfo)
      }
    })

    webContents.on('did-finish-load', () => {
      const tabInfo = this.tabInfo.get(tabId)
      if (tabInfo) {
        tabInfo.isLoading = false
        tabInfo.title = webContents.getTitle()
        tabInfo.url = webContents.getURL()
        tabInfo.canGoBack = webContents.canGoBack()
        tabInfo.canGoForward = webContents.canGoForward()
        this.tabInfo.set(tabId, tabInfo)
      }
    })

    webContents.on('page-title-updated', (event, title) => {
      const tabInfo = this.tabInfo.get(tabId)
      if (tabInfo) {
        tabInfo.title = title
        this.tabInfo.set(tabId, tabInfo)
      }
    })

    webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
      console.error(`❌ Failed to load page for tab ${tabId}:`, errorDescription)
      const tabInfo = this.tabInfo.get(tabId)
      if (tabInfo) {
        tabInfo.isLoading = false
        this.tabInfo.set(tabId, tabInfo)
      }
    })
  }

  // Public utility methods
  isReady(): boolean {
    return this.isInitialized
  }

  getTabCount(): number {
    return this.browserViews.size
  }

  hasTab(tabId: string): boolean {
    return this.browserViews.has(tabId)
  }

  cleanup(): void {
    console.log('🧹 Cleaning up BrowserView Manager...')
    
    for (const [tabId, browserView] of this.browserViews) {
      try {
        browserView.webContents.destroy()
      } catch (error) {
        console.error(`❌ Failed to destroy BrowserView for tab ${tabId}:`, error)
      }
    }
    
    this.browserViews.clear()
    this.tabInfo.clear()
    this.activeTabId = null
    this.isInitialized = false
    
    console.log('✅ BrowserView Manager cleanup complete')
  }
}

export default BrowserViewManager
