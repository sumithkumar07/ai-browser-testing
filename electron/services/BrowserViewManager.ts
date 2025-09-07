// electron/services/BrowserViewManager.ts
import { BrowserView, BrowserWindow } from 'electron'

export interface BrowserTab {
  id: string
  browserView: BrowserView
  url: string
  title: string
  isLoading: boolean
  canGoBack: boolean
  canGoForward: boolean
  createdAt: number
}

export class BrowserViewManager {
  private static instance: BrowserViewManager
  private mainWindow: BrowserWindow | null = null
  private tabs: Map<string, BrowserTab> = new Map()
  private activeTabId: string | null = null
  private tabCounter: number = 0
  private maxTabs: number = parseInt(process.env.MAX_CONCURRENT_TABS || '10')
  private performanceMetrics = {
    tabsCreated: 0,
    tabsClosed: 0,
    navigationCount: 0,
    averageLoadTime: 0
  }

  private constructor() {}

  static getInstance(): BrowserViewManager {
    if (!BrowserViewManager.instance) {
      BrowserViewManager.instance = new BrowserViewManager()
    }
    return BrowserViewManager.instance
  }

  setMainWindow(mainWindow: BrowserWindow): void {
    this.mainWindow = mainWindow
    
    // Handle window resize to update BrowserView bounds
    mainWindow.on('resize', () => {
      this.updateActiveBrowserViewBounds()
    })
  }

  async createTab(url: string = 'about:blank'): Promise<BrowserTab> {
    if (!this.mainWindow) {
      throw new Error('Main window not set')
    }

    // Performance check: limit concurrent tabs
    if (this.tabs.size >= this.maxTabs) {
      console.warn(`⚠️ Maximum tabs limit reached (${this.maxTabs}), closing oldest tab`)
      const oldestTab = Array.from(this.tabs.values()).sort((a, b) => a.createdAt - b.createdAt)[0]
      await this.closeTab(oldestTab.id)
    }

    const tabId = `tab_${++this.tabCounter}_${Date.now()}`
    const startTime = Date.now()
    
    // Create BrowserView with enhanced security
    const browserView = new BrowserView({
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        webSecurity: true,
        allowRunningInsecureContent: false,
        experimentalFeatures: false,
        sandbox: true, // Enhanced security
        enableRemoteModule: false // Enhanced security
      }
    })

    // Create tab object with performance tracking
    const tab: BrowserTab = {
      id: tabId,
      browserView,
      url,
      title: 'New Tab',
      isLoading: false,
      canGoBack: false,
      canGoForward: false,
      createdAt: Date.now()
    }

    // Store tab
    this.tabs.set(tabId, tab)

    // Set up event listeners
    this.setupBrowserViewListeners(tab)

    // Load URL with performance tracking
    if (url !== 'about:blank') {
      try {
        await browserView.webContents.loadURL(url)
        const loadTime = Date.now() - startTime
        this.updatePerformanceMetrics('load', loadTime)
      } catch (error) {
        console.error(`❌ Failed to load URL: ${url}`, error)
        // Set error state
        tab.title = 'Failed to Load'
      }
    }

    // Set as active tab
    this.setActiveTab(tabId)

    // Update metrics
    this.performanceMetrics.tabsCreated++
    
    console.log(`✅ Tab created: ${tabId} (${this.tabs.size}/${this.maxTabs} tabs)`)
    return tab
  }

  async closeTab(tabId: string): Promise<boolean> {
    const tab = this.tabs.get(tabId)
    if (!tab) {
      return false
    }

    // Remove from main window if active
    if (tabId === this.activeTabId) {
      this.mainWindow?.setBrowserView(null)
      this.activeTabId = null
    }

    // Destroy BrowserView
    tab.browserView.webContents.destroy()
    
    // Remove from tabs
    this.tabs.delete(tabId)

    console.log(`✅ Tab closed: ${tabId}`)
    return true
  }

  setActiveTab(tabId: string): boolean {
    const tab = this.tabs.get(tabId)
    if (!tab || !this.mainWindow) {
      return false
    }

    // Set BrowserView
    this.mainWindow.setBrowserView(tab.browserView)
    this.activeTabId = tabId

    // Update bounds
    this.updateBrowserViewBounds(tab.browserView)

    console.log(`✅ Active tab set: ${tabId}`)
    return true
  }

  getTab(tabId: string): BrowserTab | undefined {
    return this.tabs.get(tabId)
  }

  getActiveTab(): BrowserTab | null {
    if (!this.activeTabId) {
      return null
    }
    return this.tabs.get(this.activeTabId) || null
  }

  getAllTabs(): BrowserTab[] {
    return Array.from(this.tabs.values())
  }

  getTabCount(): number {
    return this.tabs.size
  }

  private setupBrowserViewListeners(tab: BrowserTab): void {
    const { browserView, id } = tab

    // Navigation events
    browserView.webContents.on('did-start-loading', () => {
      tab.isLoading = true
      this.emitTabEvent('loading-started', id, { loading: true })
    })

    browserView.webContents.on('did-finish-load', () => {
      tab.isLoading = false
      tab.canGoBack = browserView.webContents.canGoBack()
      tab.canGoForward = browserView.webContents.canGoForward()
      this.emitTabEvent('loading-finished', id, { loading: false })
    })

    browserView.webContents.on('did-navigate', (event, url) => {
      tab.url = url
      tab.canGoBack = browserView.webContents.canGoBack()
      tab.canGoForward = browserView.webContents.canGoForward()
      this.emitTabEvent('navigation', id, { url })
    })

    browserView.webContents.on('page-title-updated', (event, title) => {
      tab.title = title
      this.emitTabEvent('title-updated', id, { title })
    })

    browserView.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
      tab.isLoading = false
      this.emitTabEvent('navigation-error', id, { 
        error: { code: errorCode, description: errorDescription, url: validatedURL }
      })
    })

    // Context menu
    browserView.webContents.on('context-menu', (event, params) => {
      // Handle context menu
      this.emitTabEvent('context-menu', id, { params })
    })
  }

  private updateBrowserViewBounds(browserView: BrowserView): void {
    if (!this.mainWindow) return

    const bounds = this.mainWindow.getBounds()
    const headerHeight = 100 // Tab bar + Navigation bar
    const sidebarWidth = Math.floor(bounds.width * 0.3) // 30% for AI sidebar
    const browserWidth = bounds.width - sidebarWidth

    browserView.setBounds({
      x: 0,
      y: headerHeight,
      width: browserWidth,
      height: bounds.height - headerHeight
    })
  }

  private updateActiveBrowserViewBounds(): void {
    if (this.activeTabId) {
      const tab = this.tabs.get(this.activeTabId)
      if (tab) {
        this.updateBrowserViewBounds(tab.browserView)
      }
    }
  }

  private emitTabEvent(eventType: string, tabId: string, data: any): void {
    if (this.mainWindow) {
      this.mainWindow.webContents.send('browser-event', {
        type: eventType,
        tabId,
        ...data
      })
    }
  }

  // Navigation methods
  async navigateTo(url: string, tabId?: string): Promise<boolean> {
    const targetTabId = tabId || this.activeTabId
    if (!targetTabId) return false

    const tab = this.tabs.get(targetTabId)
    if (!tab) return false

    try {
      await tab.browserView.webContents.loadURL(url)
      return true
    } catch (error) {
      console.error('Navigation failed:', error)
      return false
    }
  }

  goBack(tabId?: string): boolean {
    const targetTabId = tabId || this.activeTabId
    if (!targetTabId) return false

    const tab = this.tabs.get(targetTabId)
    if (!tab || !tab.browserView.webContents.canGoBack()) {
      return false
    }

    tab.browserView.webContents.goBack()
    return true
  }

  goForward(tabId?: string): boolean {
    const targetTabId = tabId || this.activeTabId
    if (!targetTabId) return false

    const tab = this.tabs.get(targetTabId)
    if (!tab || !tab.browserView.webContents.canGoForward()) {
      return false
    }

    tab.browserView.webContents.goForward()
    return true
  }

  reload(tabId?: string): boolean {
    const targetTabId = tabId || this.activeTabId
    if (!targetTabId) return false

    const tab = this.tabs.get(targetTabId)
    if (!tab) return false

    tab.browserView.webContents.reload()
    return true
  }

  // Utility methods
  getCurrentUrl(tabId?: string): string {
    const targetTabId = tabId || this.activeTabId
    if (!targetTabId) return ''

    const tab = this.tabs.get(targetTabId)
    return tab ? tab.browserView.webContents.getURL() : ''
  }

  getPageTitle(tabId?: string): string {
    const targetTabId = tabId || this.activeTabId
    if (!targetTabId) return 'New Tab'

    const tab = this.tabs.get(targetTabId)
    return tab ? tab.browserView.webContents.getTitle() : 'New Tab'
  }

  async executeScript(script: string, tabId?: string): Promise<any> {
    const targetTabId = tabId || this.activeTabId
    if (!targetTabId) return null

    const tab = this.tabs.get(targetTabId)
    if (!tab) return null

    try {
      return await tab.browserView.webContents.executeJavaScript(script)
    } catch (error) {
      console.error('Script execution failed:', error)
      return null
    }
  }

  // Cleanup
  destroy(): void {
    for (const tab of this.tabs.values()) {
      try {
        tab.browserView.webContents.destroy()
      } catch (error) {
        console.error('Error destroying BrowserView:', error)
      }
    }
    this.tabs.clear()
    this.activeTabId = null
  }
}

export default BrowserViewManager