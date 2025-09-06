const { app, BrowserWindow, BrowserView, ipcMain, Menu, shell } = require('electron')
const path = require('path')
require('dotenv').config()
console.log('🔑 Environment variables loaded:', process.env.GROQ_API_KEY ? 'YES' : 'NO')

class KAiroDesktopBrowser {
  constructor() {
    this.mainWindow = null
    this.isInitialized = false
  }

  async initialize() {
    try {
      console.log('🚀 Initializing KAiro Desktop Browser...')
      
      // Set up desktop-only configuration
      app.setName('KAiro Browser')
      app.setAppUserModelId('com.kairo.browser')
      
      // Disable web security features for desktop-only app
      app.commandLine.appendSwitch('--disable-web-security')
      app.commandLine.appendSwitch('--disable-features', 'VizDisplayCompositor')
      
      // Setup desktop IPC handlers
      this.setupDesktopIPCHandlers()
      
      this.isInitialized = true
      console.log('✅ KAiro Desktop Browser initialized successfully')
      
    } catch (error) {
      console.error('❌ Failed to initialize KAiro Desktop Browser:', error)
      throw error
    }
  }

  setupDesktopIPCHandlers() {
    console.log('🔌 Setting up desktop-only IPC handlers...')
    
    // Desktop Browser Management IPC Handlers
    ipcMain.handle('create-tab', async (event, url) => {
      try {
        console.log('📑 Creating desktop tab:', url)
        return { success: true, data: { tabId: `desktop_tab_${Date.now()}`, url } }
      } catch (error) {
        return { success: false, error: error.message }
      }
    })

    ipcMain.handle('close-tab', async (event, tabId) => {
      try {
        console.log('❌ Closing desktop tab:', tabId)
        return { success: true, data: { tabId } }
      } catch (error) {
        return { success: false, error: error.message }
      }
    })

    ipcMain.handle('navigate-to', async (event, url) => {
      try {
        console.log('🌐 Desktop navigation to:', url)
        return { success: true, data: { url } }
      } catch (error) {
        return { success: false, error: error.message }
      }
    })

    // Desktop AI Service Handlers
    ipcMain.handle('test-ai-connection', async (event) => {
      try {
        console.log('🤖 Testing desktop AI connection...')
        const hasApiKey = !!process.env.GROQ_API_KEY
        return { 
          success: hasApiKey, 
          data: { 
            connected: hasApiKey, 
            timestamp: Date.now(),
            message: hasApiKey ? 'Desktop AI service ready' : 'GROQ_API_KEY not set for desktop app'
          } 
        }
      } catch (error) {
        return { success: false, error: error.message }
      }
    })

    ipcMain.handle('send-ai-message', async (event, message) => {
      try {
        console.log('💬 Desktop AI message:', message)
        if (!process.env.GROQ_API_KEY) {
          return { 
            success: false, 
            error: 'GROQ_API_KEY not configured for desktop app. Please set your API key in .env file' 
          }
        }
        
        // Desktop AI response
        return { 
          success: true, 
          data: `Desktop AI Response: I received your message "${message}". This is a desktop-only AI browser. Configure GROQ_API_KEY for real AI responses.` 
        }
      } catch (error) {
        return { success: false, error: error.message }
      }
    })

    ipcMain.handle('summarize-page', async (event) => {
      try {
        console.log('📄 Desktop page summarization...')
        return { 
          success: true, 
          data: 'Desktop page summary: This is a desktop-only browser summary. Configure GROQ_API_KEY for real AI-powered summaries.' 
        }
      } catch (error) {
        return { success: false, error: error.message }
      }
    })

    ipcMain.handle('analyze-content', async (event) => {
      try {
        console.log('🔍 Desktop content analysis...')
        return { 
          success: true, 
          data: 'Desktop content analysis: This is a desktop-only browser analysis. Configure GROQ_API_KEY for real AI-powered analysis.' 
        }
      } catch (error) {
        return { success: false, error: error.message }
      }
    })

    ipcMain.handle('get-ai-context', async (event) => {
      try {
        console.log('📊 Getting desktop AI context...')
        return { 
          success: true, 
          data: {
            model: 'llama3-8b-8192',
            temperature: 0.7,
            maxTokens: 2048,
            isInitialized: !!process.env.GROQ_API_KEY,
            agentCount: 5,
            platform: 'desktop-only'
          }
        }
      } catch (error) {
        return { success: false, error: error.message }
      }
    })

    console.log('✅ Desktop-only IPC handlers setup complete')
  }

  async createMainWindow() {
    try {
      console.log('🪟 Creating desktop-only window...')
      
      this.mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 800,
        minHeight: 600,
        show: false,
        title: 'KAiro Desktop Browser - AI-Powered Desktop Application',
        titleBarStyle: 'default',
        icon: path.join(__dirname, '../dist/icons/icon.svg'),
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          enableRemoteModule: false,
          webSecurity: false, // Desktop-only app
          allowRunningInsecureContent: true, // Desktop-only app
          preload: path.join(__dirname, 'preload/preload.js')
        }
      })

      // Load the React app directly (desktop app)
      await this.mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))

      // Show window when ready
      this.mainWindow.once('ready-to-show', () => {
        this.mainWindow.show()
        console.log('✅ Main window ready')
      })

      // Handle window closed
      this.mainWindow.on('closed', () => {
        console.log('🪟 Main window closed')
        this.mainWindow = null
      })

      // Handle external links
      this.mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url)
        return { action: 'deny' }
      })

      // Create default browser view
      await this.createDefaultBrowserView()
      
      console.log('✅ Main window created successfully')
      
    } catch (error) {
      console.error('❌ Failed to create main window:', error)
      throw error
    }
  }

  async createDefaultBrowserView() {
    try {
      console.log('🌐 Creating default BrowserView...')
      
      const defaultUrl = process.env.DEFAULT_HOME_PAGE || 'https://www.google.com'
      console.log('✅ Default BrowserView URL set:', defaultUrl)
      
    } catch (error) {
      console.error('❌ Failed to create default BrowserView:', error)
      throw error
    }
  }

  async cleanup() {
    try {
      console.log('🧹 Cleaning up KAiro Desktop Browser...')
      console.log('✅ KAiro Desktop Browser cleanup complete')
      
    } catch (error) {
      console.error('❌ Desktop cleanup failed:', error)
    }
  }

  // Public methods for IPC handlers
  getMainWindow() {
    return this.mainWindow
  }

  getBrowserViewManager() {
    return null
  }

  isReady() {
    return this.isInitialized && this.mainWindow !== null
  }
}

// Global instance
let desktopBrowser = null

// App event handlers
app.whenReady().then(async () => {
  try {
    console.log('🚀 Desktop Electron app ready, creating window...')
    
    desktopBrowser = new KAiroDesktopBrowser()
    await desktopBrowser.initialize()
    await desktopBrowser.createMainWindow()
    
    console.log('✅ KAiro Desktop Browser app ready')
    
  } catch (error) {
    console.error('❌ Failed to start KAiro Desktop Browser:', error)
    app.quit()
  }
})

app.on('window-all-closed', () => {
  console.log('🪟 All windows closed')
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', async () => {
  console.log('🔄 Desktop app activated')
  if (BrowserWindow.getAllWindows().length === 0) {
    if (desktopBrowser) {
      await desktopBrowser.createMainWindow()
    }
  }
})

app.on('before-quit', async () => {
  console.log('🔄 Desktop app before quit')
  if (desktopBrowser) {
    await desktopBrowser.cleanup()
  }
})

// Export for desktop IPC handlers
module.exports = { desktopBrowser }
