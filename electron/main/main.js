const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')

// Import services
const { AIService } = require('../services/AIService')

// Environment variables
process.env.GROQ_API_KEY = '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'
process.env.DEFAULT_SEARCH_ENGINE = 'https://www.google.com/search?q='
process.env.DEFAULT_HOME_PAGE = 'https://www.google.com'

// Keep a global reference of the window object and services
let mainWindow
let aiService

function createWindow() {
  console.log('Phase 5: Creating Electron window...')

  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../preload/preload.js'),
      webSecurity: true,
      webviewTag: true, // Enable webview tag
      allowRunningInsecureContent: true
    },
    icon: path.join(__dirname, '../../public/icons/icon.svg'),
    title: 'KAiro Browser'
  })

  console.log('Phase 5: Preload script path:', path.join(__dirname, '../preload/preload.js'))

  // Initialize services
  aiService = new AIService()

  // Load the app - use a simple HTML file instead of Vite dev server
  const appPath = path.join(__dirname, '../../dist/index.html')
  console.log('KAiro Browser: Loading app from:', appPath)
  mainWindow.loadFile(appPath)

  // Set up IPC handlers
  setupIPCHandlers()

  // Emitted when the window is closed
  mainWindow.on('closed', () => {
    console.log('KAiro Browser: Window closed')
    mainWindow = null
  })

  console.log('KAiro Browser: Electron window created successfully!')

  // Emitted when the window is closed
  mainWindow.on('closed', () => {
    console.log('Phase 5: Window closed')
    mainWindow = null
  })

  console.log('Phase 5: Electron window created successfully!')
}

function setupIPCHandlers() {
  console.log('Phase 5: Setting up IPC handlers...')

  // Browser handlers
  ipcMain.handle('navigate-to', async (event, url) => {
    console.log('KAiro Browser: IPC navigate-to called with:', url)
    return { success: true, message: 'Navigation handled by WebView' }
  })

  ipcMain.handle('go-back', async () => {
    console.log('KAiro Browser: IPC go-back called')
    return { success: true, message: 'Navigation handled by WebView' }
  })

  ipcMain.handle('go-forward', async () => {
    console.log('KAiro Browser: IPC go-forward called')
    return { success: true, message: 'Navigation handled by WebView' }
  })

  ipcMain.handle('refresh', async () => {
    console.log('KAiro Browser: IPC refresh called')
    return { success: true, message: 'Navigation handled by WebView' }
  })

  ipcMain.handle('get-current-url', async () => {
    console.log('KAiro Browser: IPC get-current-url called')
    return ''
  })

  ipcMain.handle('get-page-title', async () => {
    console.log('KAiro Browser: IPC get-page-title called')
    return ''
  })

  // AI handlers
  ipcMain.handle('send-ai-message', async (event, message, browserContext = '') => {
    console.log('Phase 5: IPC send-ai-message called with:', message)
    console.log('Phase 5: Browser context received:', browserContext)
    try {
      const context = await aiService.getContext()
      const fullContext = browserContext ? `${context} | Browser State: ${browserContext}` : context
      const response = await aiService.sendMessage(message, fullContext)
      return response
    } catch (error) {
      console.error('Phase 5: AI message error:', error)
      return `I'm sorry, I encountered an error: ${error.message}`
    }
  })

  ipcMain.handle('summarize-page', async () => {
    console.log('Phase 5: IPC summarize-page called')
    try {
      const summary = await aiService.summarizePage()
      return summary
    } catch (error) {
      console.error('Phase 5: Page summarization error:', error)
      return `Error generating summary: ${error.message}`
    }
  })

  ipcMain.handle('analyze-content', async () => {
    console.log('Phase 5: IPC analyze-content called')
    try {
      const analysis = await aiService.analyzeContent()
      return analysis
    } catch (error) {
      console.error('Phase 5: Content analysis error:', error)
      return `Error analyzing content: ${error.message}`
    }
  })

  ipcMain.handle('get-ai-context', async () => {
    console.log('Phase 5: IPC get-ai-context called')
    try {
      const context = await aiService.getContext()
      return context
    } catch (error) {
      console.error('Phase 5: Get AI context error:', error)
      return 'Unable to get context'
    }
  })

  // System handlers
  ipcMain.handle('get-version', async () => {
    return app.getVersion()
  })

  ipcMain.handle('get-platform', async () => {
    return process.platform
  })

  ipcMain.handle('open-dev-tools', async () => {
    mainWindow.webContents.openDevTools()
  })

  ipcMain.handle('close-dev-tools', async () => {
    mainWindow.webContents.closeDevTools()
  })

  // Test handler
  ipcMain.handle('test-connection', async () => {
    console.log('KAiro Browser: IPC test-connection called')
    return 'KAiro Browser: IPC connection working! WebView implementation with advanced features fully operational.'
  })

  // Tab management handled by React state
  ipcMain.handle('set-active-tab', async (event, tabId) => {
    console.log('KAiro Browser: IPC set-active-tab called with:', tabId)
    return { success: true, message: 'Tab management handled by React state' }
  })

  ipcMain.handle('create-tab-browser-view', async (event, tabId) => {
    console.log('KAiro Browser: IPC create-tab-browser-view called with:', tabId)
    return { success: true, message: 'Tab management handled by React state' }
  })

  // Sidebar toggle handled by React state
  ipcMain.handle('update-browser-view-bounds', async (event, sidebarCollapsed) => {
    console.log('KAiro Browser: IPC update-browser-view-bounds called, sidebar collapsed:', sidebarCollapsed)
    return { success: true, message: 'Sidebar toggle handled by React state' }
  })

  console.log('Phase 5: All IPC handlers set up successfully')
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  console.log('Phase 5: Electron app ready, creating window...')
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

// Quit when all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

console.log('Phase 5: Electron main process loaded with real services')
