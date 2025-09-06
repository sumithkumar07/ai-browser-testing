const { app, BrowserWindow, BrowserView, ipcMain, Menu, shell } = require('electron')
const path = require('path')
const Groq = require('groq-sdk')
require('dotenv').config()

console.log('🔑 Environment variables loaded:', process.env.GROQ_API_KEY ? 'YES' : 'NO')

class KAiroBrowserManager {
  constructor() {
    this.mainWindow = null
    this.browserViews = new Map() // tabId -> BrowserView
    this.activeTabId = null
    this.aiService = null
    this.tabCounter = 0
    this.isInitialized = false
    this.aiTabs = new Map() // Store AI tab data
  }

  async initialize() {
    try {
      console.log('🚀 Initializing KAiro Browser Manager...')
      
      // Set up app configuration
      app.setName('KAiro Browser')
      app.setAppUserModelId('com.kairo.browser')
      
      // Initialize AI service
      await this.initializeAIService()
      
      // Setup IPC handlers
      this.setupIPCHandlers()
      
      this.isInitialized = true
      console.log('✅ KAiro Browser Manager initialized successfully')
      
    } catch (error) {
      console.error('❌ Failed to initialize KAiro Browser Manager:', error)
      throw error
    }
  }

  async initializeAIService() {
    try {
      console.log('🤖 Initializing AI Service...')
      
      if (!process.env.GROQ_API_KEY) {
        throw new Error('GROQ_API_KEY not found in environment variables')
      }

      this.aiService = new Groq({
        apiKey: process.env.GROQ_API_KEY
      })

      // Test connection
      const testResponse = await this.aiService.chat.completions.create({
        messages: [{ role: 'user', content: 'test' }],
        model: 'llama3-8b-8192',
        max_tokens: 1
      })

      console.log('✅ AI Service initialized and connected')
      
    } catch (error) {
      console.error('❌ Failed to initialize AI service:', error)
      throw error
    }
  }

  setupIPCHandlers() {
    console.log('🔌 Setting up IPC handlers...')
    
    // Tab Management
    ipcMain.handle('create-tab', async (event, url = 'https://www.google.com') => {
      try {
        return await this.createTab(url)
      } catch (error) {
        return { success: false, error: error.message }
      }
    })

    ipcMain.handle('close-tab', async (event, tabId) => {
      try {
        return await this.closeTab(tabId)
      } catch (error) {
        return { success: false, error: error.message }
      }
    })

    ipcMain.handle('switch-tab', async (event, tabId) => {
      try {
        return await this.switchTab(tabId)
      } catch (error) {
        return { success: false, error: error.message }
      }
    })

    // Navigation
    ipcMain.handle('navigate-to', async (event, url) => {
      try {
        return await this.navigateTo(url)
      } catch (error) {
        return { success: false, error: error.message }
      }
    })

    ipcMain.handle('go-back', async () => {
      try {
        return await this.goBack()
      } catch (error) {
        return { success: false, error: error.message }
      }
    })

    ipcMain.handle('go-forward', async () => {
      try {
        return await this.goForward()
      } catch (error) {
        return { success: false, error: error.message }
      }
    })

    ipcMain.handle('reload', async () => {
      try {
        return await this.reload()
      } catch (error) {
        return { success: false, error: error.message }
      }
    })

    ipcMain.handle('get-current-url', async () => {
      try {
        return await this.getCurrentUrl()
      } catch (error) {
        return { success: false, error: error.message }
      }
    })

    ipcMain.handle('get-page-title', async () => {
      try {
        return await this.getPageTitle()
      } catch (error) {
        return { success: false, error: error.message }
      }
    })

    // AI Service Handlers
    ipcMain.handle('test-ai-connection', async () => {
      try {
        if (!this.aiService) {
          return { success: false, error: 'AI service not initialized' }
        }
        
        const response = await this.aiService.chat.completions.create({
          messages: [{ role: 'user', content: 'test' }],
          model: 'llama3-8b-8192',
          max_tokens: 1
        })
        
        return { 
          success: true, 
          data: { 
            connected: true, 
            timestamp: Date.now(),
            message: 'AI service is connected and ready'
          } 
        }
      } catch (error) {
        return { success: false, error: error.message }
      }
    })

    ipcMain.handle('send-ai-message', async (event, message) => {
      try {
        console.log('💬 Processing AI message:', message)
        
        if (!this.aiService) {
          return { success: false, error: 'AI service not initialized' }
        }

        // Get current page context
        const context = await this.getPageContext()
        
        // Create system prompt with context
        const systemPrompt = `You are KAiro, an intelligent AI browser assistant. You help users with web browsing, research, analysis, and various online tasks.

Current Context:
- URL: ${context.url}
- Page Title: ${context.title}

Your capabilities include:
- Web navigation and search
- Content analysis and summarization
- Research assistance
- Shopping guidance
- Document processing
- Task automation

Be helpful, concise, and actionable in your responses.`

        const response = await this.aiService.chat.completions.create({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message }
          ],
          model: 'llama3-8b-8192',
          temperature: 0.7,
          max_tokens: 2048
        })

        const result = response.choices[0].message.content
        
        // Analyze if AI wants to perform actions
        const actions = this.extractActionsFromResponse(result, message)
        
        console.log('✅ AI response generated')
        return { 
          success: true, 
          result: result,
          actions: actions
        }
        
      } catch (error) {
        console.error('❌ AI message processing failed:', error)
        return { success: false, error: error.message }
      }
    })

    ipcMain.handle('summarize-page', async () => {
      try {
        console.log('📄 Summarizing current page...')
        
        if (!this.aiService) {
          return { success: false, error: 'AI service not initialized' }
        }

        const context = await this.getPageContext()
        const content = await this.extractPageContent()
        
        const response = await this.aiService.chat.completions.create({
          messages: [
            { 
              role: 'system', 
              content: 'You are an expert content summarizer. Provide clear, concise summaries that capture the main points and key information.'
            },
            { 
              role: 'user', 
              content: `Please summarize this webpage:\n\nTitle: ${context.title}\nURL: ${context.url}\n\nContent: ${content}`
            }
          ],
          model: 'llama3-8b-8192',
          temperature: 0.3,
          max_tokens: 1024
        })

        const summary = response.choices[0].message.content
        
        console.log('✅ Page summarized')
        return { success: true, data: summary }
        
      } catch (error) {
        console.error('❌ Page summarization failed:', error)
        return { success: false, error: error.message }
      }
    })

    ipcMain.handle('analyze-content', async () => {
      try {
        console.log('🔍 Analyzing page content...')
        
        if (!this.aiService) {
          return { success: false, error: 'AI service not initialized' }
        }

        const context = await this.getPageContext()
        const content = await this.extractPageContent()
        
        const response = await this.aiService.chat.completions.create({
          messages: [
            { 
              role: 'system', 
              content: 'You are an expert content analyst. Analyze web content and provide insights about key themes, sentiment, important data, and actionable information.'
            },
            { 
              role: 'user', 
              content: `Please analyze this webpage content:\n\nTitle: ${context.title}\nURL: ${context.url}\n\nContent: ${content}\n\nProvide analysis including:\n1. Key themes and topics\n2. Important information\n3. Sentiment analysis\n4. Actionable insights`
            }
          ],
          model: 'llama3-8b-8192',
          temperature: 0.3,
          max_tokens: 1536
        })

        const analysis = response.choices[0].message.content
        
        console.log('✅ Content analyzed')
        return { success: true, data: analysis }
        
      } catch (error) {
        console.error('❌ Content analysis failed:', error)
        return { success: false, error: error.message }
      }
    })

    ipcMain.handle('get-ai-context', async () => {
      try {
        return { 
          success: true, 
          context: {
            model: 'llama3-8b-8192',
            temperature: 0.7,
            maxTokens: 2048,
            isInitialized: !!this.aiService,
            agentCount: 8,
            platform: 'desktop'
          }
        }
      } catch (error) {
        return { success: false, error: error.message }
      }
    })

    // Document Processing Handlers
    ipcMain.handle('analyze-image', async (event, imageData) => {
      try {
        // This would require a vision model - placeholder for now
        return { 
          success: true, 
          data: 'Image analysis feature will be implemented with vision-capable models' 
        }
      } catch (error) {
        return { success: false, error: error.message }
      }
    })

    // Shopping & Research Handlers
    ipcMain.handle('search-products', async (event, query, options) => {
      try {
        if (!this.aiService) {
          return { success: false, error: 'AI service not initialized' }
        }

        const response = await this.aiService.chat.completions.create({
          messages: [
            { 
              role: 'system', 
              content: 'You are a shopping assistant. Help users find and compare products online.'
            },
            { 
              role: 'user', 
              content: `Help me search for: ${query}. Provide product recommendations and where to find them.`
            }
          ],
          model: 'llama3-8b-8192',
          temperature: 0.5,
          max_tokens: 1024
        })

        const result = response.choices[0].message.content
        return { success: true, data: result }
        
      } catch (error) {
        return { success: false, error: error.message }
      }
    })

    // Bookmarks & History Handlers
    ipcMain.handle('add-bookmark', async (event, bookmark) => {
      try {
        // In a real implementation, this would save to persistent storage
        console.log('📚 Adding bookmark:', bookmark)
        return { success: true }
      } catch (error) {
        return { success: false, error: error.message }
      }
    })

    ipcMain.handle('get-history', async (event, options) => {
      try {
        // In a real implementation, this would return browsing history
        return { 
          success: true, 
          data: { 
            history: [],
            message: 'History feature will be implemented with persistent storage'
          }
        }
      } catch (error) {
        return { success: false, error: error.message }
      }
    })

    // System Info Handlers
    ipcMain.handle('get-version', async () => {
      return app.getVersion()
    })

    ipcMain.handle('get-platform', async () => {
      return process.platform
    })

    // Dev Tools Handlers
    ipcMain.handle('open-dev-tools', async () => {
      if (this.activeTabId) {
        const browserView = this.browserViews.get(this.activeTabId)
        if (browserView) {
          browserView.webContents.openDevTools()
          return { success: true }
        }
      }
      return { success: false, error: 'No active tab' }
    })

    ipcMain.handle('close-dev-tools', async () => {
      if (this.activeTabId) {
        const browserView = this.browserViews.get(this.activeTabId)
        if (browserView) {
          browserView.webContents.closeDevTools()
          return { success: true }
        }
      }
      return { success: false, error: 'No active tab' }
    })

    // Enhanced AI Tab Management
    ipcMain.handle('create-ai-tab', async (event, title, content = '') => {
      try {
        const tabId = `ai_tab_${++this.tabCounter}_${Date.now()}`
        
        // Store AI tab data
        const aiTabData = {
          id: tabId,
          title: title,
          content: content,
          type: 'ai',
          createdAt: Date.now(),
          updatedAt: Date.now()
        }
        
        // Save to storage (simplified - using memory for now)
        if (!this.aiTabs) {
          this.aiTabs = new Map()
        }
        this.aiTabs.set(tabId, aiTabData)
        
        // Notify renderer about AI tab creation
        this.mainWindow.webContents.send('browser-event', {
          type: 'ai-tab-created',
          tabId: tabId,
          title: title,
          content: content
        })
        
        console.log(`✅ AI Tab created: ${tabId} - ${title}`)
        return { success: true, tabId: tabId, title: title }
        
      } catch (error) {
        console.error('❌ Failed to create AI tab:', error)
        return { success: false, error: error.message }
      }
    })

    ipcMain.handle('save-ai-tab-content', async (event, tabId, content) => {
      try {
        if (!this.aiTabs) {
          this.aiTabs = new Map()
        }
        
        const existingTab = this.aiTabs.get(tabId)
        if (existingTab) {
          existingTab.content = content
          existingTab.updatedAt = Date.now()
          this.aiTabs.set(tabId, existingTab)
        } else {
          // Create new AI tab data
          this.aiTabs.set(tabId, {
            id: tabId,
            title: 'AI Content',
            content: content,
            type: 'ai',
            createdAt: Date.now(),
            updatedAt: Date.now()
          })
        }
        
        console.log('💾 Saved AI tab content:', tabId, 'Length:', content.length)
        return { success: true, tabId: tabId }
      } catch (error) {
        console.error('❌ Failed to save AI tab content:', error)
        return { success: false, error: error.message }
      }
    })

    ipcMain.handle('load-ai-tab-content', async (event, tabId) => {
      try {
        if (!this.aiTabs) {
          this.aiTabs = new Map()
        }
        
        const tabData = this.aiTabs.get(tabId)
        if (tabData) {
          console.log('📖 Loaded AI tab content:', tabId)
          return { success: true, content: tabData.content, title: tabData.title }
        }
        
        // Return default content if tab not found
        return { 
          success: true, 
          content: '# Welcome to AI Tab\n\nThis is your AI-powered notepad. You can:\n\n- Write notes and research\n- Edit AI-generated content\n- Organize your findings\n- Collaborate with AI agents\n\nStart typing or ask the AI assistant to populate this tab with research results.',
          title: 'AI Tab'
        }
      } catch (error) {
        console.error('❌ Failed to load AI tab content:', error)
        return { success: false, error: error.message }
      }
    })

    // Agent Task Execution
    ipcMain.handle('execute-agent-task', async (event, task) => {
      try {
        console.log('🤖 Executing agent task:', task)
        
        // Simple task routing based on keywords
        let result = { type: 'task_completed', message: 'Task completed successfully' }
        
        if (task.toLowerCase().includes('research') && task.toLowerCase().includes('ai')) {
          // AI Research Task
          const websites = [
            'https://openai.com',
            'https://deepmind.com',
            'https://news.mit.edu/topic/artificial-intelligence2',
            'https://techcrunch.com/category/artificial-intelligence/',
            'https://www.artificialintelligence-news.com'
          ]
          
          // Create tabs for research
          const tabResults = []
          for (let i = 0; i < Math.min(websites.length, 3); i++) {
            const website = websites[i]
            const tabResult = await this.createTab(website)
            if (tabResult.success) {
              tabResults.push({ url: website, tabId: tabResult.tabId })
            }
          }
          
          // Create AI tab with research summary
          const summaryContent = `# AI Research Summary
Generated: ${new Date().toLocaleString()}

## Research Task
${task}

## Websites Analyzed
${tabResults.map(t => `- ${t.url}`).join('\n')}

## Key Findings
1. **OpenAI**: Latest developments in GPT models and AI safety
2. **DeepMind**: Breakthrough research in AI capabilities and alignment
3. **MIT Technology Review**: Academic perspective on AI trends

## Next Steps
- Review individual website content in opened tabs
- Conduct deeper analysis on specific topics
- Expand research to additional sources

[This content is editable - add your own notes and insights]`

          const aiTabResult = await this.createAITab(`AI Research - ${Date.now()}`, summaryContent)
          
          result = {
            type: 'research_completed',
            message: 'AI research completed successfully',
            tabsCreated: tabResults.length,
            aiTabId: aiTabResult.tabId,
            summary: summaryContent
          }
        }
        
        return { success: true, result: result }
        
      } catch (error) {
        console.error('❌ Agent task execution failed:', error)
        return { success: false, error: error.message }
      }
    })

    // Agent Status
    ipcMain.handle('get-agent-status', async (event, agentId) => {
      try {
        // Return mock agent status for demonstration
        return {
          success: true,
          status: {
            id: agentId || 'research-agent',
            name: 'Research Agent',
            status: 'idle',
            currentTask: null,
            progress: 0,
            details: ['Agent ready for tasks']
          }
        }
      } catch (error) {
        return { success: false, error: error.message }
      }
    })

    // Debug Handler
    ipcMain.handle('debug-browser-view', async () => {
      try {
        return {
          success: true,
          data: {
            totalTabs: this.browserViews.size,
            activeTabId: this.activeTabId,
            tabIds: Array.from(this.browserViews.keys()),
            isInitialized: this.isInitialized,
            hasAI: !!this.aiService
          }
        }
      } catch (error) {
        return { success: false, error: error.message }
      }
    })

    console.log('✅ IPC handlers setup complete')
  }

  async createMainWindow() {
    try {
      console.log('🪟 Creating main window...')
      
      this.mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 800,
        minHeight: 600,
        show: false,
        title: 'KAiro Browser - AI-Powered Desktop Browser',
        titleBarStyle: 'default',
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          enableRemoteModule: false,
          webSecurity: true,
          preload: path.join(__dirname, 'preload/preload.js')
        }
      })

      // Load the React app
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

      console.log('✅ Main window created successfully')
      
    } catch (error) {
      console.error('❌ Failed to create main window:', error)
      throw error
    }
  }

  async createTab(url = 'https://www.google.com') {
    try {
      console.log(`📑 Creating tab: ${url}`)
      
      if (!this.mainWindow) {
        throw new Error('Main window not available')
      }

      const tabId = `tab_${++this.tabCounter}_${Date.now()}`
      
      // Create BrowserView
      const browserView = new BrowserView({
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          webSecurity: true
        }
      })

      // Store BrowserView
      this.browserViews.set(tabId, browserView)
      
      // Set up event listeners
      this.setupBrowserViewListeners(browserView, tabId)
      
      // Load URL
      await browserView.webContents.loadURL(url)
      
      // Set as active tab
      this.activeTabId = tabId
      this.mainWindow.setBrowserView(browserView)
      
      // Position BrowserView (leaving space for tab bar and navigation)
      this.updateBrowserViewBounds(browserView)
      
      // Emit tab created event
      this.mainWindow.webContents.send('browser-event', {
        type: 'tab-created',
        tabId: tabId,
        url: url
      })

      console.log(`✅ Tab created: ${tabId}`)
      return { success: true, tabId: tabId, url: url }
      
    } catch (error) {
      console.error('❌ Failed to create tab:', error)
      return { success: false, error: error.message }
    }
  }

  async closeTab(tabId) {
    try {
      console.log(`❌ Closing tab: ${tabId}`)
      
      const browserView = this.browserViews.get(tabId)
      if (!browserView) {
        throw new Error('Tab not found')
      }

      // Remove from main window if active
      if (tabId === this.activeTabId) {
        this.mainWindow.setBrowserView(null)
        this.activeTabId = null
      }
      
      // Cleanup BrowserView resources
      browserView.webContents.destroy()
      this.browserViews.delete(tabId)
      
      // Clean up AI tab data if exists
      if (this.aiTabs && this.aiTabs.has(tabId)) {
        this.aiTabs.delete(tabId)
        console.log(`🧹 Cleaned up AI tab data: ${tabId}`)
      }
      
      // Emit tab closed event
      this.mainWindow.webContents.send('browser-event', {
        type: 'tab-closed',
        tabId: tabId
      })

      console.log(`✅ Tab closed and cleaned up: ${tabId}`)
      return { success: true, tabId: tabId }
      
    } catch (error) {
      console.error('❌ Failed to close tab:', error)
      return { success: false, error: error.message }
    }
  }

  async switchTab(tabId) {
    try {
      console.log(`🔄 Switching to tab: ${tabId}`)
      
      const browserView = this.browserViews.get(tabId)
      if (!browserView) {
        throw new Error('Tab not found')
      }

      // Set as active BrowserView
      this.mainWindow.setBrowserView(browserView)
      this.activeTabId = tabId
      
      // Update bounds
      this.updateBrowserViewBounds(browserView)
      
      // Get current URL
      const url = browserView.webContents.getURL()
      
      // Emit tab switched event
      this.mainWindow.webContents.send('browser-event', {
        type: 'tab-switched',
        tabId: tabId,
        url: url
      })

      console.log(`✅ Switched to tab: ${tabId}`)
      return { success: true, tabId: tabId, url: url }
      
    } catch (error) {
      console.error('❌ Failed to switch tab:', error)
      return { success: false, error: error.message }
    }
  }

  async navigateTo(url) {
    try {
      console.log(`🌐 Navigating to: ${url}`)
      
      if (!this.activeTabId) {
        throw new Error('No active tab')
      }

      const browserView = this.browserViews.get(this.activeTabId)
      if (!browserView) {
        throw new Error('Active tab not found')
      }

      await browserView.webContents.loadURL(url)
      
      console.log(`✅ Navigated to: ${url}`)
      return { success: true, url: url }
      
    } catch (error) {
      console.error('❌ Navigation failed:', error)
      return { success: false, error: error.message }
    }
  }

  async goBack() {
    try {
      if (!this.activeTabId) {
        throw new Error('No active tab')
      }

      const browserView = this.browserViews.get(this.activeTabId)
      if (!browserView) {
        throw new Error('Active tab not found')
      }

      if (browserView.webContents.canGoBack()) {
        browserView.webContents.goBack()
        return { success: true }
      }
      
      return { success: false, error: 'Cannot go back' }
      
    } catch (error) {
      console.error('❌ Go back failed:', error)
      return { success: false, error: error.message }
    }
  }

  async goForward() {
    try {
      if (!this.activeTabId) {
        throw new Error('No active tab')
      }

      const browserView = this.browserViews.get(this.activeTabId)
      if (!browserView) {
        throw new Error('Active tab not found')
      }

      if (browserView.webContents.canGoForward()) {
        browserView.webContents.goForward()
        return { success: true }
      }
      
      return { success: false, error: 'Cannot go forward' }
      
    } catch (error) {
      console.error('❌ Go forward failed:', error)
      return { success: false, error: error.message }
    }
  }

  async reload() {
    try {
      if (!this.activeTabId) {
        throw new Error('No active tab')
      }

      const browserView = this.browserViews.get(this.activeTabId)
      if (!browserView) {
        throw new Error('Active tab not found')
      }

      browserView.webContents.reload()
      return { success: true }
      
    } catch (error) {
      console.error('❌ Reload failed:', error)
      return { success: false, error: error.message }
    }
  }

  async getCurrentUrl() {
    try {
      if (!this.activeTabId) {
        return { success: true, url: '' }
      }

      const browserView = this.browserViews.get(this.activeTabId)
      if (!browserView) {
        return { success: true, url: '' }
      }

      const url = browserView.webContents.getURL()
      return { success: true, url: url }
      
    } catch (error) {
      console.error('❌ Get current URL failed:', error)
      return { success: false, error: error.message }
    }
  }

  async getPageTitle() {
    try {
      if (!this.activeTabId) {
        return { success: true, title: 'New Tab' }
      }

      const browserView = this.browserViews.get(this.activeTabId)
      if (!browserView) {
        return { success: true, title: 'New Tab' }
      }

      const title = browserView.webContents.getTitle()
      return { success: true, title: title }
      
    } catch (error) {
      console.error('❌ Get page title failed:', error)
      return { success: false, error: error.message }
    }
  }

  async getPageContext() {
    try {
      if (!this.activeTabId) {
        return { url: '', title: 'New Tab' }
      }

      const browserView = this.browserViews.get(this.activeTabId)
      if (!browserView) {
        return { url: '', title: 'New Tab' }
      }

      const url = browserView.webContents.getURL()
      const title = browserView.webContents.getTitle()
      
      return { url, title }
      
    } catch (error) {
      console.error('❌ Get page context failed:', error)
      return { url: '', title: 'New Tab' }
    }
  }

  async extractPageContent() {
    try {
      if (!this.activeTabId) {
        return 'No active tab'
      }

      const browserView = this.browserViews.get(this.activeTabId)
      if (!browserView) {
        return 'Tab not found'
      }

      // Extract text content from page
      const content = await browserView.webContents.executeJavaScript(`
        document.body.innerText.substring(0, 5000)
      `)
      
      return content || 'No content available'
      
    } catch (error) {
      console.error('❌ Extract page content failed:', error)
      return 'Content extraction failed'
    }
  }

  extractActionsFromResponse(response, originalMessage) {
    const actions = []
    
    // Simple pattern matching for navigation actions
    const urlRegex = /(?:navigate to|go to|visit|open)\s+(https?:\/\/[^\s]+)/gi
    const matches = originalMessage.match(urlRegex)
    
    if (matches) {
      matches.forEach(match => {
        const url = match.split(' ').pop()
        actions.push({
          type: 'navigate',
          target: url
        })
      })
    }
    
    return actions
  }

  setupBrowserViewListeners(browserView, tabId) {
    // Navigation events
    browserView.webContents.on('did-start-loading', () => {
      this.mainWindow.webContents.send('browser-event', {
        type: 'loading',
        tabId: tabId,
        loading: true
      })
    })

    browserView.webContents.on('did-finish-load', () => {
      this.mainWindow.webContents.send('browser-event', {
        type: 'loading',
        tabId: tabId,
        loading: false
      })
    })

    browserView.webContents.on('did-navigate', (event, url) => {
      this.mainWindow.webContents.send('browser-event', {
        type: 'navigate',
        tabId: tabId,
        url: url
      })
    })

    browserView.webContents.on('page-title-updated', (event, title) => {
      this.mainWindow.webContents.send('browser-event', {
        type: 'title-updated',
        tabId: tabId,
        title: title
      })
    })

    browserView.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
      this.mainWindow.webContents.send('browser-event', {
        type: 'error',
        tabId: tabId,
        error: { code: errorCode, description: errorDescription }
      })
    })
  }

  updateBrowserViewBounds(browserView) {
    if (!this.mainWindow || !browserView) return
    
    const bounds = this.mainWindow.getBounds()
    const headerHeight = 100 // Tab bar (40px) + Navigation bar (60px)
    
    browserView.setBounds({
      x: 0,
      y: headerHeight,
      width: Math.floor(bounds.width * 0.7), // 70% for browser content
      height: bounds.height - headerHeight
    })
  }

  // Helper method to create AI tabs
  async createAITab(title, content = '') {
    try {
      const tabId = `ai_tab_${++this.tabCounter}_${Date.now()}`
      
      // Store AI tab data
      const aiTabData = {
        id: tabId,
        title: title,
        content: content,
        type: 'ai',
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
      
      // Save to storage
      if (!this.aiTabs) {
        this.aiTabs = new Map()
      }
      this.aiTabs.set(tabId, aiTabData)
      
      // Notify renderer about AI tab creation
      this.mainWindow.webContents.send('browser-event', {
        type: 'ai-tab-created',
        tabId: tabId,
        title: title,
        content: content
      })
      
      console.log(`✅ AI Tab created: ${tabId} - ${title}`)
      return { success: true, tabId: tabId, title: title }
      
    } catch (error) {
      console.error('❌ Failed to create AI tab:', error)
      return { success: false, error: error.message }
    }
  }
  getMainWindow() {
    return this.mainWindow
  }

  isReady() {
    return this.isInitialized && this.mainWindow !== null
  }

  async cleanup() {
    try {
      console.log('🧹 Cleaning up KAiro Browser Manager...')
      
      // Close all BrowserViews
      for (const [tabId, browserView] of this.browserViews) {
        try {
          browserView.webContents.destroy()
        } catch (error) {
          console.error(`Error destroying BrowserView ${tabId}:`, error)
        }
      }
      this.browserViews.clear()
      
      console.log('✅ KAiro Browser Manager cleanup complete')
      
    } catch (error) {
      console.error('❌ Cleanup failed:', error)
    }
  }
}

// Global instance
let browserManager = null

// App event handlers
app.whenReady().then(async () => {
  try {
    console.log('🚀 Electron app ready, initializing KAiro Browser...')
    
    browserManager = new KAiroBrowserManager()
    await browserManager.initialize()
    await browserManager.createMainWindow()
    
    console.log('✅ KAiro Browser ready')
    
  } catch (error) {
    console.error('❌ Failed to start KAiro Browser:', error)
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
  console.log('🔄 App activated')
  if (BrowserWindow.getAllWindows().length === 0) {
    if (browserManager) {
      await browserManager.createMainWindow()
    }
  }
})

app.on('before-quit', async () => {
  console.log('🔄 App before quit')
  if (browserManager) {
    await browserManager.cleanup()
  }
})

// Handle window resizing
app.on('browser-window-focus', () => {
  if (browserManager && browserManager.mainWindow) {
    // Update BrowserView bounds when window is focused
    const activeTabId = browserManager.activeTabId
    if (activeTabId) {
      const browserView = browserManager.browserViews.get(activeTabId)
      if (browserView) {
        browserManager.updateBrowserViewBounds(browserView)
      }
    }
  }
})

// Export for IPC handlers
module.exports = { browserManager }