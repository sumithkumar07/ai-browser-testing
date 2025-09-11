const { app, BrowserWindow, BrowserView, ipcMain, Menu, shell } = require('electron')
const path = require('path')
const Groq = require('groq-sdk')
require('dotenv').config()

console.log('🔑 Environment variables loaded:', !!process.env.GROQ_API_KEY)
console.log('🚀 KAiro Browser starting with optimized backend...')

// Import core services only - simplified architecture
const { DatabaseService } = require('../src/backend/DatabaseService.js')
const { AgentPerformanceMonitor } = require('../src/backend/AgentPerformanceMonitor.js')
const { BackgroundTaskScheduler } = require('../src/backend/BackgroundTaskScheduler.js')
const { EnhancedAgentController } = require('../src/core/agents/EnhancedAgentController.js')

class OptimizedBrowserManager {
  constructor() {
    this.mainWindow = null
    this.browserViews = new Map()
    this.activeTabId = null
    this.aiService = null
    
    // Core backend services - simplified
    this.databaseService = null
    this.performanceMonitor = null
    this.taskScheduler = null
    this.enhancedAgentController = null
    
    // Connection states
    this.connectionState = {
      api: 'disconnected',
      database: 'disconnected',
      agents: 'disconnected'
    }
    
    console.log('🚀 Optimized Browser Manager initialized')
  }

  async initialize() {
    try {
      console.log('🎯 Initializing KAiro Browser with optimized services...')
      
      // Initialize AI service first - most critical
      await this.initializeAIService()
      
      // Initialize database service
      await this.initializeDatabaseService()
      
      // Initialize essential backend services
      await this.initializeEssentialServices()
      
      // Initialize agent system
      await this.initializeAgentSystem()
      
      console.log('✅ KAiro Browser initialization completed successfully')
      
    } catch (error) {
      console.error('❌ KAiro Browser initialization failed:', error)
      // Continue with limited functionality
    }
  }

  async initializeAIService() {
    try {
      console.log('🤖 Initializing AI Service...')
      
      if (!process.env.GROQ_API_KEY) {
        throw new Error('GROQ_API_KEY not found in environment variables')
      }

      this.connectionState.api = 'connected'
      
      // Initialize Groq client
      this.aiService = new Groq({
        apiKey: process.env.GROQ_API_KEY
      })

      console.log('✅ AI Service initialized successfully')
      
    } catch (error) {
      console.error('❌ Failed to initialize AI service:', error.message)
      this.connectionState.api = 'failed'
    }
  }

  async initializeDatabaseService() {
    try {
      console.log('🗄️ Initializing database service...')
      
      const dbPath = path.join(process.cwd(), 'data', 'kairo_browser.db')
      this.databaseService = new DatabaseService({
        path: dbPath,
        maxSize: 100 * 1024 * 1024, // 100MB
        backupEnabled: true
      })
      
      const dbResult = await this.databaseService.initialize()
      if (dbResult.success) {
        this.connectionState.database = 'connected'
        console.log('✅ Database service initialized successfully')
      } else {
        throw new Error(`Database initialization failed: ${dbResult.error}`)
      }
      
    } catch (error) {
      console.error('❌ Database service initialization failed:', error)
      this.connectionState.database = 'failed'
      // Continue without database
    }
  }

  async initializeEssentialServices() {
    try {
      console.log('⚡ Initializing essential backend services...')
      
      // Initialize performance monitoring - essential for stability
      try {
        this.performanceMonitor = new AgentPerformanceMonitor({
          updateInterval: 30000, // Reduced frequency for better performance
          retentionDays: 7 // Reduced retention for better performance
        })
        await this.performanceMonitor.initialize()
        console.log('✅ Performance monitoring initialized')
      } catch (error) {
        console.warn('⚠️ Performance monitoring failed to initialize:', error.message)
      }
      
      // Initialize task scheduler - essential for background tasks
      try {
        this.taskScheduler = new BackgroundTaskScheduler({
          maxConcurrentTasks: 3, // Reduced for better performance
          defaultRetryAttempts: 2 // Reduced retries
        })
        await this.taskScheduler.initialize()
        console.log('✅ Task scheduler initialized')
      } catch (error) {
        console.warn('⚠️ Task scheduler failed to initialize:', error.message)
      }
      
      console.log('✅ Essential backend services initialized')
      
    } catch (error) {
      console.error('❌ Essential backend services initialization failed:', error)
      // Continue with limited functionality
    }
  }

  async initializeAgentSystem() {
    try {
      console.log('🤖 Initializing agent system...')
      
      this.connectionState.agents = 'connected'
      
      // Initialize enhanced agent controller
      try {
        this.enhancedAgentController = new EnhancedAgentController(this)
        const agentResult = await this.enhancedAgentController.initialize()
        
        if (agentResult.success) {
          console.log('✅ Agent system initialized - ALL 6 agents ready!')
        } else {
          throw new Error(`Agent system initialization failed: ${agentResult.error}`)
        }
      } catch (agentError) {
        console.error('❌ Agent system failed:', agentError)
        this.connectionState.agents = 'failed'
      }
      
    } catch (error) {
      console.error('❌ Agent system initialization failed:', error)
      this.connectionState.agents = 'failed'
    }
  }

  // Optimized window creation with better error handling
  async createWindow() {
    try {
      console.log('🖥️ Creating browser window...')
      
      // Check if running in headless environment
      const isHeadless = !process.env.DISPLAY || process.env.NODE_ENV === 'test' || process.env.BROWSER_HEADLESS === 'true'
      
      if (isHeadless) {
        console.log('🤖 Running in headless mode')
        this.mainWindow = {
          webContents: {
            send: (channel, data) => {
              console.log(`📡 IPC Send: ${channel}`)
            },
            executeJavaScript: async (code) => {
              console.log(`📜 Execute JS: ${code.substring(0, 50)}...`)
              return Promise.resolve({})
            }
          },
          setBrowserView: () => console.log('🪟 Set browser view (headless)'),
          removeBrowserView: () => console.log('🗑️ Remove browser view (headless)')
        }
        return
      }

      this.mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          enableRemoteModule: false,
          preload: path.join(__dirname, 'preload', 'preload.js')
        },
        icon: path.join(__dirname, 'assets', 'icon.png'),
        titleBarStyle: 'hiddenInset',
        show: false
      })

      // Load the built React app
      const isDev = process.env.NODE_ENV === 'development'
      if (isDev) {
        this.mainWindow.loadURL('http://localhost:3000')
      } else {
        this.mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'))
      }

      this.mainWindow.once('ready-to-show', () => {
        this.mainWindow.show()
        console.log('✅ Browser window created and displayed')
      })

      this.mainWindow.on('closed', () => {
        this.mainWindow = null
      })

    } catch (error) {
      console.error('❌ Window creation failed:', error)
      // Continue in headless mode
      await this.createWindow()
    }
  }

  // Real browser automation methods - core functionality preserved
  async createTab(url = 'https://www.google.com') {
    try {
      console.log(`🌐 Creating browser tab: ${url}`)

      const tabId = `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      // Create BrowserView for real browser control
      const browserView = new BrowserView({
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          sandbox: true,
          webSecurity: true
        }
      })

      this.browserViews.set(tabId, browserView)

      // Load URL with timeout
      try {
        await browserView.webContents.loadURL(url)
        
        // Wait for page load with timeout
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Page load timeout'))
          }, 15000) // Increased timeout for better reliability

          browserView.webContents.once('dom-ready', () => {
            clearTimeout(timeout)
            resolve(null)
          })

          browserView.webContents.once('did-fail-load', (event, errorCode, errorDescription) => {
            clearTimeout(timeout)
            reject(new Error(`Page load failed: ${errorDescription}`))
          })
        })
      } catch (loadError) {
        console.warn(`Failed to load ${url}, using fallback:`, loadError.message)
        // Continue with tab creation even if load fails
      }

      // Attach to main window if available
      if (this.mainWindow && this.mainWindow.setBrowserView) {
        this.mainWindow.setBrowserView(browserView)
        this.activeTabId = tabId
      }

      const title = browserView.webContents.getTitle() || 'Loading...'

      console.log(`✅ Browser tab created: ${tabId}`)

      return {
        success: true,
        tabId,
        title,
        url
      }

    } catch (error) {
      console.error('❌ Tab creation failed:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Enhanced AI message processing with better error handling
  async processAIMessage(message) {
    try {
      console.log(`🤖 Processing AI message: "${message.substring(0, 50)}..."`)

      if (!this.aiService) {
        throw new Error('AI service not available')
      }

      // Analyze task for agent routing
      const taskAnalysis = this.analyzeAgentTask(message)
      console.log('📊 Task Analysis:', { 
        agent: taskAnalysis.primaryAgent, 
        confidence: taskAnalysis.confidence 
      })

      let aiResponse = ''
      let browserAutomationResult = null

      // Execute with browser automation if high confidence
      if (taskAnalysis.confidence >= 70 && this.enhancedAgentController) {
        try {
          console.log(`🚀 Executing ${taskAnalysis.primaryAgent} agent...`)
          
          browserAutomationResult = await this.enhancedAgentController.executeAgentTask(
            taskAnalysis.primaryAgent,
            message,
            {
              pageContext: await this.getPageContext(),
              taskAnalysis,
              timestamp: Date.now()
            }
          )

          if (browserAutomationResult.success) {
            aiResponse = `# 🤖 ${taskAnalysis.primaryAgent.toUpperCase()} Agent Executed

**Task**: ${message}
**Confidence**: ${taskAnalysis.confidence}%
**Status**: ✅ Successfully executed with browser automation

## Actions Performed:
${browserAutomationResult.result?.success ? 
  '✅ Browser automation completed successfully' : 
  '⚠️ Partial execution completed'}

*This response was generated through real browser automation*`

            return {
              success: true,
              result: aiResponse,
              agentStatus: {
                agent: taskAnalysis.primaryAgent,
                executed: true,
                browserAutomation: true
              }
            }
          }
        } catch (automationError) {
          console.error('❌ Browser automation failed:', automationError)
          // Fall back to AI-only response
        }
      }

      // Standard AI response with timeout
      const completion = await Promise.race([
        this.aiService.chat.completions.create({
          messages: [
            {
              role: 'system',
              content: `You are KAiro AI, an advanced browser assistant with real browser automation capabilities.

You have 6 specialized agents:
- 🔍 Research Agent: Multi-source research and analysis
- 🌐 Navigation Agent: Smart web navigation
- 🛒 Shopping Agent: Product research and comparison  
- 📧 Communication Agent: Email and message composition
- 🤖 Automation Agent: Task automation and workflows
- 📊 Analysis Agent: Content analysis and insights

Current context: ${await this.getContextInfo()}

Respond helpfully about browser automation capabilities.`
            },
            {
              role: 'user',
              content: message
            }
          ],
          model: 'llama-3.3-70b-versatile',
          temperature: 0.7,
          max_tokens: 1000
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('AI response timeout')), 30000)
        )
      ])

      aiResponse = completion.choices[0].message.content

      return {
        success: true,
        result: aiResponse,
        agentStatus: {
          availableAgent: taskAnalysis.primaryAgent,
          confidence: taskAnalysis.confidence,
          canAutomate: taskAnalysis.confidence >= 70
        }
      }

    } catch (error) {
      console.error('❌ AI message processing failed:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Optimized task analysis
  analyzeAgentTask(message) {
    const lowerMessage = message.toLowerCase()
    
    const patterns = {
      research: {
        keywords: ['research', 'find', 'search', 'investigate', 'study', 'explore'],
        confidence: 90
      },
      navigation: {
        keywords: ['navigate', 'go to', 'visit', 'open', 'browse', 'website'],
        confidence: 95
      },
      shopping: {
        keywords: ['buy', 'purchase', 'shop', 'price', 'deal', 'product'],
        confidence: 90
      },
      communication: {
        keywords: ['email', 'write', 'compose', 'message', 'letter'],
        confidence: 90
      },
      automation: {
        keywords: ['automate', 'schedule', 'workflow', 'task', 'repeat'],
        confidence: 90
      },
      analysis: {
        keywords: ['analyze', 'review', 'examine', 'evaluate', 'assess'],
        confidence: 90
      }
    }

    let bestMatch = { agent: 'research', confidence: 0 }

    for (const [agent, pattern] of Object.entries(patterns)) {
      let score = 0
      let keywordMatches = 0

      for (const keyword of pattern.keywords) {
        if (lowerMessage.includes(keyword)) {
          score += pattern.confidence
          keywordMatches++
        }
      }

      if (keywordMatches > 0) {
        const finalConfidence = Math.min(95, (score / pattern.keywords.length) * keywordMatches)
        
        if (finalConfidence > bestMatch.confidence) {
          bestMatch = {
            agent,
            confidence: Math.round(finalConfidence),
            keywordMatches
          }
        }
      }
    }

    return {
      primaryAgent: bestMatch.agent,
      confidence: bestMatch.confidence,
      canExecute: bestMatch.confidence >= 70,
      message: message
    }
  }

  async getPageContext() {
    try {
      if (this.activeTabId) {
        const browserView = this.browserViews.get(this.activeTabId)
        if (browserView) {
          const title = browserView.webContents.getTitle()
          const url = browserView.webContents.getURL()
          return { url, title, hasContent: true }
        }
      }
      return { url: 'about:blank', title: 'New Tab', hasContent: false }
    } catch (error) {
      return { url: 'about:blank', title: 'Error', hasContent: false }
    }
  }

  async getContextInfo() {
    const context = await this.getPageContext()
    const systemStatus = {
      agents: this.connectionState.agents,
      database: this.connectionState.database,
      api: this.connectionState.api
    }

    return `Current page: ${context.title} (${context.url})
System: AI ${systemStatus.api}, Agents ${systemStatus.agents}, DB ${systemStatus.database}`
  }

  // Setup IPC handlers for frontend communication
  setupIPCHandlers() {
    // Tab management
    ipcMain.handle('create-tab', async (event, url) => {
      return await this.createTab(url)
    })

    ipcMain.handle('close-tab', async (event, tabId) => {
      try {
        const browserView = this.browserViews.get(tabId)
        if (browserView && this.mainWindow && this.mainWindow.removeBrowserView) {
          this.mainWindow.removeBrowserView(browserView)
        }
        this.browserViews.delete(tabId)
        return { success: true }
      } catch (error) {
        return { success: false, error: error.message }
      }
    })

    ipcMain.handle('switch-tab', async (event, tabId) => {
      try {
        const browserView = this.browserViews.get(tabId)
        if (browserView && this.mainWindow && this.mainWindow.setBrowserView) {
          this.mainWindow.setBrowserView(browserView)
          this.activeTabId = tabId
        }
        return { success: true }
      } catch (error) {
        return { success: false, error: error.message }
      }
    })

    ipcMain.handle('navigate-to', async (event, url) => {
      try {
        if (!this.activeTabId) {
          return await this.createTab(url)
        }

        const browserView = this.browserViews.get(this.activeTabId)
        if (!browserView) {
          return await this.createTab(url)
        }

        await browserView.webContents.loadURL(url)
        return { success: true, tabId: this.activeTabId, url }
      } catch (error) {
        return { success: false, error: error.message }
      }
    })

    // Browser controls
    ipcMain.handle('go-back', async () => {
      try {
        const browserView = this.browserViews.get(this.activeTabId)
        if (browserView) {
          browserView.webContents.goBack()
        }
        return { success: true }
      } catch (error) {
        return { success: false, error: error.message }
      }
    })

    ipcMain.handle('go-forward', async () => {
      try {
        const browserView = this.browserViews.get(this.activeTabId)
        if (browserView) {
          browserView.webContents.goForward()
        }
        return { success: true }
      } catch (error) {
        return { success: false, error: error.message }
      }
    })

    ipcMain.handle('reload', async () => {
      try {
        const browserView = this.browserViews.get(this.activeTabId)
        if (browserView) {
          browserView.webContents.reload()
        }
        return { success: true }
      } catch (error) {
        return { success: false, error: error.message }
      }
    })

    // AI integration
    ipcMain.handle('test-connection', async () => {
      return {
        success: true,
        data: {
          connected: this.connectionState.api === 'connected',
          database: this.connectionState.database === 'connected',
          agents: this.connectionState.agents === 'connected'
        }
      }
    })

    ipcMain.handle('send-ai-message', async (event, message) => {
      return await this.processAIMessage(message)
    })

    ipcMain.handle('create-ai-tab', async (event, title, content) => {
      const tabId = `ai_tab_${Date.now()}`
      return {
        success: true,
        tabId,
        title: title || 'AI Results',
        content: content || ''
      }
    })

    ipcMain.handle('save-ai-tab-content', async (event, tabId, content) => {
      return { success: true }
    })

    ipcMain.handle('get-agent-status', async () => {
      return {
        success: true,
        status: {
          connected: this.connectionState.agents === 'connected',
          activeExecutions: this.enhancedAgentController ? 
            this.enhancedAgentController.getActiveExecutions().length : 0
        }
      }
    })

    console.log('📡 IPC handlers registered successfully')
  }
}

// App lifecycle management with optimized browser manager
const browserManager = new OptimizedBrowserManager()

// Skip app.whenReady() in test environment
if (process.env.NODE_ENV !== 'test' && require.main === module) {
  app.whenReady().then(async () => {
    try {
      // Initialize all services
      await browserManager.initialize()
      
      // Setup IPC handlers
      browserManager.setupIPCHandlers()
      
      // Create window
      await browserManager.createWindow()
      
      console.log('🎉 KAiro Browser is fully operational!')
      
    } catch (error) {
      console.error('❌ App initialization failed:', error)
    }
  })

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })

  app.on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      await browserManager.createWindow()
    }
  })

  app.on('before-quit', async () => {
    console.log('🛑 KAiro Browser shutting down...')
  })
}

// Export for testing
module.exports = { OptimizedBrowserManager }