const { BrowserView } = require('electron')
const { CustomRenderer } = require('./CustomRenderer')

class BrowserService {
  constructor(mainWindow) {
    this.browserViews = new Map() // Store BrowserViews by tab ID
    this.mainWindow = mainWindow
    this.activeTabId = null
    this.customRenderer = new CustomRenderer()
    console.log('KAiro Browser: BrowserService initialized with custom renderer')
  }

  createBrowserView(tabId) {
    console.log('KAiro Browser: Creating BrowserView for tab:', tabId)
    
    try {
      // Create BrowserView with minimal options
      const browserView = new BrowserView({
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          webSecurity: true
        }
      })

      console.log('KAiro Browser: BrowserView instance created for tab:', tabId)

      // Set initial bounds (will be updated when window is ready)
      browserView.setBounds({ x: 0, y: 90, width: 1000, height: 600 })
      browserView.setAutoResize({ width: true, height: true })

      // Store the BrowserView
      this.browserViews.set(tabId, browserView)

      console.log('KAiro Browser: BrowserView created and stored for tab:', tabId)
      return browserView
    } catch (error) {
      console.error('KAiro Browser: Error creating BrowserView for tab:', tabId, error)
      return null
    }
  }

  setActiveTab(tabId) {
    console.log('Phase 4: Setting active tab:', tabId)
    
    // Hide all BrowserViews
    this.browserViews.forEach((browserView, id) => {
      this.mainWindow.setBrowserView(null)
    })
    
    // Show the active BrowserView
    const activeBrowserView = this.browserViews.get(tabId)
    if (activeBrowserView) {
      this.mainWindow.setBrowserView(activeBrowserView)
      this.activeTabId = tabId
      console.log('Phase 4: Active BrowserView set for tab:', tabId)
    } else {
      console.log('Phase 4: No BrowserView found for tab:', tabId)
    }
  }

  navigateTo(url, tabId = null) {
    const targetTabId = tabId || this.activeTabId
    
    if (!targetTabId) {
      console.error('KAiro Browser: No tab ID provided for navigation')
      return
    }

    let browserView = this.browserViews.get(targetTabId)
    if (!browserView) {
      console.log('KAiro Browser: Creating BrowserView for navigation')
      browserView = this.createBrowserView(targetTabId)
    }

    // Check if BrowserView was created successfully
    if (!browserView) {
      console.error('KAiro Browser: BrowserView creation failed')
      return
    }

    // Format URL if needed
    const formattedUrl = this.formatUrl(url)
    console.log('KAiro Browser: Navigating to:', formattedUrl)

    // Navigate to URL
    if (browserView.webContents && typeof browserView.webContents.loadURL === 'function') {
      browserView.webContents.loadURL(formattedUrl)
      
      // Setup custom rendering after navigation
      browserView.webContents.once('did-finish-load', async () => {
        console.log('KAiro Browser: Page loaded, setting up custom rendering')
        await this.customRenderer.setupCustomRendering(browserView)
        await this.customRenderer.monitorAndEnforce(browserView)
      })
    } else {
      console.error('KAiro Browser: No navigation method available')
      return
    }
    
    // Update tab information after navigation
    setTimeout(async () => {
      try {
        const currentUrl = await this.getCurrentUrl(targetTabId)
        const pageTitle = await this.getPageTitle(targetTabId)
        console.log('KAiro Browser: Navigation completed - URL:', currentUrl, 'Title:', pageTitle)
      } catch (error) {
        console.error('KAiro Browser: Error getting page info after navigation:', error)
      }
    }, 2000)
  }

  goBack(tabId = null) {
    const targetTabId = tabId || this.activeTabId
    const browserView = this.browserViews.get(targetTabId)
    
    if (browserView && browserView.webContents && browserView.webContents.canGoBack()) {
      console.log('Phase 4: Going back for tab:', targetTabId)
      browserView.webContents.goBack()
    }
  }

  goForward(tabId = null) {
    const targetTabId = tabId || this.activeTabId
    const browserView = this.browserViews.get(targetTabId)
    
    if (browserView && browserView.webContents && browserView.webContents.canGoForward()) {
      console.log('Phase 4: Going forward for tab:', targetTabId)
      browserView.webContents.goForward()
    }
  }

  refresh(tabId = null) {
    const targetTabId = tabId || this.activeTabId
    const browserView = this.browserViews.get(targetTabId)
    
    if (browserView && browserView.webContents) {
      console.log('Phase 4: Refreshing page for tab:', targetTabId)
      browserView.webContents.reload()
    }
  }

  getCurrentUrl(tabId = null) {
    return new Promise((resolve) => {
      const targetTabId = tabId || this.activeTabId
      const browserView = this.browserViews.get(targetTabId)
      
      if (browserView && browserView.webContents) {
        try {
          const url = browserView.webContents.getURL()
          console.log('Phase 4: Current URL for tab', targetTabId, ':', url)
          resolve(url)
        } catch (error) {
          console.error('Phase 4: Error getting URL for tab', targetTabId, ':', error)
          resolve('')
        }
      } else {
        resolve('')
      }
    })
  }

  getPageTitle(tabId = null) {
    return new Promise((resolve) => {
      const targetTabId = tabId || this.activeTabId
      const browserView = this.browserViews.get(targetTabId)
      
      if (browserView && browserView.webContents) {
        try {
          const title = browserView.webContents.getTitle()
          console.log('Phase 4: Page title for tab', targetTabId, ':', title)
          resolve(title)
        } catch (error) {
          console.error('Phase 4: Error getting title for tab', targetTabId, ':', error)
          resolve('')
        }
      } else {
        resolve('')
      }
    })
  }

  getPageContent() {
    return new Promise((resolve) => {
      if (this.browserView) {
        this.browserView.webContents.executeJavaScript(`
          document.body ? document.body.innerText : 'No content available'
        `).then((content) => {
          console.log('Phase 4: Page content extracted')
          resolve(content)
        }).catch(() => {
          resolve('Unable to extract content')
        })
      } else {
        resolve('')
      }
    })
  }

  updateBounds(bounds) {
    if (this.browserView) {
      console.log('Phase 4: Updating BrowserView bounds:', bounds)
      try {
        this.browserView.setBounds(bounds)
        console.log('Phase 4: BrowserView bounds updated successfully')
      } catch (error) {
        console.error('Phase 4: Error updating BrowserView bounds:', error)
      }
    } else {
      console.log('Phase 4: No BrowserView available for bounds update')
    }
  }

  destroy() {
    if (this.browserView) {
      console.log('Phase 4: Destroying BrowserView')
      this.mainWindow.setBrowserView(null)
      this.browserView = null
    }
  }

  formatUrl(url) {
    // If it's not a valid URL, treat it as a search query
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      // Check if it looks like a domain
      if (url.includes('.') && !url.includes(' ')) {
        return `https://${url}`
      } else {
        // Treat as search query
        return `${process.env.DEFAULT_SEARCH_ENGINE}${encodeURIComponent(url)}`
      }
    }
    return url
  }
}

module.exports = { BrowserService }
