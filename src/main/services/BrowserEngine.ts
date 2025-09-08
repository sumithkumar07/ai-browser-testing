// src/main/services/BrowserEngine.ts
export interface BrowserTab {
  id: string
  title: string
  url: string
  isLoading: boolean
  isActive: boolean
  favicon?: string
  canGoBack: boolean
  canGoForward: boolean
}

export interface BrowserState {
  tabs: BrowserTab[]
  activeTabId: string | null
  currentUrl: string
  isLoading: boolean
  error: string | null
}

export interface NavigationOptions {
  replace?: boolean
  reload?: boolean
  timeout?: number
}

export interface BrowserEvent {
  type: 'tab-created' | 'tab-closed' | 'tab-switched' | 'navigation-started' | 'navigation-completed' | 'page-title-updated' | 'error'
  tabId?: string
  url?: string
  title?: string
  loading?: boolean
  error?: any
}

export class BrowserEngine {
  private static instance: BrowserEngine
  private isInitialized: boolean = false
  private state: BrowserState
  private eventListeners: Map<string, ((event: BrowserEvent) => void)[]> = new Map()

  private constructor() {
    this.state = {
      tabs: [],
      activeTabId: null,
      currentUrl: '',
      isLoading: false,
      error: null
    }
  }

  static getInstance(): BrowserEngine {
    if (!BrowserEngine.instance) {
      BrowserEngine.instance = new BrowserEngine()
    }
    return BrowserEngine.instance
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('⚠️ BrowserEngine already initialized')
      return
    }

    console.log('🌐 Initializing Browser Engine...')
    
    try {
      // Check if electronAPI is available
      if (!window.electronAPI) {
        throw new Error('Electronic API not available. Please run in Electron environment.')
      }

      // Setup event listeners
      this.setupEventListeners()
      
      this.isInitialized = true
      console.log('✅ Browser Engine initialized')
    } catch (error) {
      console.error('❌ Browser Engine initialization failed:', error)
      throw error
    }
  }

  async createTab(url: string = 'about:blank'): Promise<BrowserTab | null> {
    try {
      console.log(`🌐 Creating tab: ${url}`)
      
      if (!this.isInitialized) {
        throw new Error('BrowserEngine not initialized')
      }

      if (!window.electronAPI || !window.electronAPI.createTab) {
        throw new Error('Create tab API not available')
      }

      const result = await window.electronAPI.createTab(url)
      
      if (result && result.success && result.tabId) {
        const tab: BrowserTab = {
          id: result.tabId,
          title: 'New Tab',
          url: url,
          isLoading: false,
          isActive: true,
          canGoBack: false,
          canGoForward: false
        }

        // Update state
        this.state.tabs = this.state.tabs.map(t => ({ ...t, isActive: false })).concat(tab)
        this.state.activeTabId = tab.id
        this.state.currentUrl = url

        // Emit event
        this.emitEvent({
          type: 'tab-created',
          tabId: tab.id,
          url: tab.url
        })

        console.log(`✅ Tab created: ${tab.id}`)
        return tab
      }

      throw new Error(result?.error || 'Failed to create tab')
      
    } catch (error) {
      console.error('❌ Failed to create tab:', error)
      this.state.error = error instanceof Error ? error.message : 'Unknown error'
      return null
    }
  }

  async closeTab(tabId: string): Promise<boolean> {
    try {
      console.log(`🌐 Closing tab: ${tabId}`)
      
      if (!window.electronAPI || !window.electronAPI.closeTab) {
        throw new Error('Close tab API not available')
      }
      
      const result = await window.electronAPI.closeTab(tabId)
      
      if (result && result.success) {
        // Update state
        this.state.tabs = this.state.tabs.filter(tab => tab.id !== tabId)
        
        if (tabId === this.state.activeTabId) {
          const remainingTabs = this.state.tabs
          if (remainingTabs.length > 0) {
            await this.switchTab(remainingTabs[0].id)
          } else {
            this.state.activeTabId = null
            this.state.currentUrl = ''
          }
        }

        // Emit event
        this.emitEvent({
          type: 'tab-closed',
          tabId: tabId
        })

        console.log(`✅ Tab closed: ${tabId}`)
        return true
      }

      throw new Error(result?.error || 'Failed to close tab')
      
    } catch (error) {
      console.error('❌ Failed to close tab:', error)
      this.state.error = error instanceof Error ? error.message : 'Unknown error'
      return false
    }
  }

  async switchTab(tabId: string): Promise<boolean> {
    try {
      console.log(`🌐 Switching to tab: ${tabId}`)
      
      if (!window.electronAPI || !window.electronAPI.switchTab) {
        throw new Error('Switch tab API not available')
      }
      
      const result = await window.electronAPI.switchTab(tabId)
      
      if (result && result.success) {
        // Update state
        this.state.tabs = this.state.tabs.map(tab => ({
          ...tab,
          isActive: tab.id === tabId
        }))
        this.state.activeTabId = tabId
        
        const tab = this.state.tabs.find(t => t.id === tabId)
        if (tab) {
          this.state.currentUrl = tab.url
        }

        // Emit event
        this.emitEvent({
          type: 'tab-switched',
          tabId: tabId,
          url: tab?.url
        })

        console.log(`✅ Switched to tab: ${tabId}`)
        return true
      }

      throw new Error(result?.error || 'Failed to switch tab')
      
    } catch (error) {
      console.error('❌ Failed to switch tab:', error)
      this.state.error = error instanceof Error ? error.message : 'Unknown error'
      return false
    }
  }

  async navigateTo(url: string, _options: NavigationOptions = {}): Promise<boolean> {
    try {
      console.log(`🌐 Navigating to: ${url}`)
      
      if (!window.electronAPI || !window.electronAPI.navigateTo) {
        throw new Error('Navigate API not available')
      }
      
      this.state.isLoading = true
      this.state.error = null

      // TODO: Handle navigation options (timeout, replace) if needed
      // const timeout = options.timeout || 30000
      // const replace = options.replace || false

      // Emit navigation started event
      this.emitEvent({
        type: 'navigation-started',
        url: url
      })

      const result = await window.electronAPI.navigateTo(url)
      
      if (result && result.success) {
        this.state.currentUrl = url
        
        // Update active tab
        if (this.state.activeTabId) {
          this.state.tabs = this.state.tabs.map(tab => 
            tab.id === this.state.activeTabId 
              ? { ...tab, url: url, isLoading: false }
              : tab
          )
        }

        // Emit navigation completed event
        this.emitEvent({
          type: 'navigation-completed',
          url: url
        })

        console.log(`✅ Navigated to: ${url}`)
        return true
      } else {
        this.state.error = result?.error || 'Navigation failed'
        return false
      }
      
    } catch (error) {
      console.error('❌ Navigation failed:', error)
      this.state.error = error instanceof Error ? error.message : 'Unknown error'
      return false
    } finally {
      this.state.isLoading = false
    }
  }

  async goBack(): Promise<boolean> {
    try {
      console.log('🌐 Going back')
      
      if (!window.electronAPI || !window.electronAPI.goBack) {
        throw new Error('Go back API not available')
      }
      
      const result = await window.electronAPI.goBack()
      
      if (result && result.success) {
        console.log('✅ Went back')
        return true
      }

      throw new Error(result?.error || 'Failed to go back')
      
    } catch (error) {
      console.error('❌ Failed to go back:', error)
      return false
    }
  }

  async goForward(): Promise<boolean> {
    try {
      console.log('🌐 Going forward')
      
      if (!window.electronAPI || !window.electronAPI.goForward) {
        throw new Error('Go forward API not available')
      }
      
      const result = await window.electronAPI.goForward()
      
      if (result && result.success) {
        console.log('✅ Went forward')
        return true
      }

      throw new Error(result?.error || 'Failed to go forward')
      
    } catch (error) {
      console.error('❌ Failed to go forward:', error)
      return false
    }
  }

  async reload(): Promise<boolean> {
    try {
      console.log('🌐 Reloading page')
      
      if (!window.electronAPI || !window.electronAPI.reload) {
        throw new Error('Reload API not available')
      }
      
      const result = await window.electronAPI.reload()
      
      if (result && result.success) {
        console.log('✅ Page reloaded')
        return true
      }

      throw new Error(result?.error || 'Failed to reload')
      
    } catch (error) {
      console.error('❌ Failed to reload:', error)
      return false
    }
  }

  async getCurrentUrl(): Promise<string> {
    try {
      if (!window.electronAPI || !window.electronAPI.getCurrentUrl) {
        return this.state.currentUrl
      }

      const result = await window.electronAPI.getCurrentUrl()
      if (result && result.success && result.url) {
        this.state.currentUrl = result.url
        return result.url
      }
      return this.state.currentUrl
    } catch (error) {
      console.error('❌ Failed to get current URL:', error)
      return this.state.currentUrl
    }
  }

  async getPageTitle(): Promise<string> {
    try {
      if (!window.electronAPI || !window.electronAPI.getPageTitle) {
        return 'Untitled'
      }

      const result = await window.electronAPI.getPageTitle()
      if (result && result.success && result.title) {
        // Update active tab title
        if (this.state.activeTabId) {
          this.state.tabs = this.state.tabs.map(tab => 
            tab.id === this.state.activeTabId 
              ? { ...tab, title: result.title! }
              : tab
          )
        }
        return result.title
      }
      return 'Untitled'
    } catch (error) {
      console.error('❌ Failed to get page title:', error)
      return 'Untitled'
    }
  }

  private setupEventListeners(): void {
    try {
      // Browser events from main process
      if (window.electronAPI && window.electronAPI.onBrowserEvent) {
        window.electronAPI.onBrowserEvent((event: import('../types/electron.d.ts').BrowserEvent) => {
          // Convert to our local BrowserEvent type and handle
          const localEvent: BrowserEvent = {
            type: event.type as any, // Type assertion for compatibility
            tabId: event.tabId,
            url: event.url,
            title: event.title,
            loading: event.loading,
            error: event.error
          }
          this.handleBrowserEvent(localEvent)
        })
      }
    } catch (error) {
      console.warn('Failed to setup browser event listeners:', error)
    }
  }

  private handleBrowserEvent(event: BrowserEvent): void {
    console.log('🌐 Browser event:', event.type)

    try {
      switch (event.type) {
        case 'tab-created':
          if (event.tabId && event.url) {
            const tab: BrowserTab = {
              id: event.tabId,
              title: 'New Tab',
              url: event.url,
              isLoading: false,
              isActive: true,
              canGoBack: false,
              canGoForward: false
            }
            this.state.tabs = this.state.tabs.map(t => ({ ...t, isActive: false })).concat(tab)
            this.state.activeTabId = tab.id
            this.state.currentUrl = tab.url
          }
          break

        case 'tab-closed':
          if (event.tabId) {
            this.state.tabs = this.state.tabs.filter(tab => tab.id !== event.tabId)
            if (event.tabId === this.state.activeTabId) {
              const remainingTabs = this.state.tabs
              if (remainingTabs.length > 0) {
                this.state.activeTabId = remainingTabs[0].id
                this.state.currentUrl = remainingTabs[0].url
              } else {
                this.state.activeTabId = null
                this.state.currentUrl = ''
              }
            }
          }
          break

        case 'tab-switched':
          if (event.tabId) {
            this.state.tabs = this.state.tabs.map(tab => ({
              ...tab,
              isActive: tab.id === event.tabId
            }))
            this.state.activeTabId = event.tabId
            if (event.url) {
              this.state.currentUrl = event.url
            }
          }
          break

        case 'navigation-started':
          this.state.isLoading = true
          if (event.url) {
            this.state.currentUrl = event.url
          }
          break

        case 'navigation-completed':
          this.state.isLoading = false
          if (event.url) {
            this.state.currentUrl = event.url
          }
          break

        case 'page-title-updated':
          if (event.tabId && event.title) {
            this.state.tabs = this.state.tabs.map(tab => 
              tab.id === event.tabId 
                ? { ...tab, title: event.title! }
                : tab
            )
          }
          break

        case 'error':
          this.state.error = event.error?.description || 'Unknown error'
          this.state.isLoading = false
          break
      }

      // Emit event to listeners
      this.emitEvent(event)
    } catch (error) {
      console.error('❌ Error handling browser event:', error)
    }
  }

  private emitEvent(event: BrowserEvent): void {
    const listeners = this.eventListeners.get(event.type) || []
    listeners.forEach(listener => {
      try {
        listener(event)
      } catch (error) {
        console.error('❌ Event listener error:', error)
      }
    })
  }

  // Event management
  addEventListener(eventType: string, listener: (event: BrowserEvent) => void): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, [])
    }
    this.eventListeners.get(eventType)!.push(listener)
  }

  removeEventListener(eventType: string, listener: (event: BrowserEvent) => void): void {
    const listeners = this.eventListeners.get(eventType)
    if (listeners) {
      const index = listeners.indexOf(listener)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  // Public utility methods
  getState(): BrowserState {
    return { ...this.state }
  }

  getTabs(): BrowserTab[] {
    return [...this.state.tabs]
  }

  getActiveTab(): BrowserTab | null {
    return this.state.tabs.find(tab => tab.id === this.state.activeTabId) || null
  }

  isLoading(): boolean {
    return this.state.isLoading
  }

  getError(): string | null {
    return this.state.error
  }

  clearError(): void {
    this.state.error = null
  }

  isReady(): boolean {
    return this.isInitialized
  }

  getTabCount(): number {
    return this.state.tabs.length
  }
}

export default BrowserEngine