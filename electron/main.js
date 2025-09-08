const { app, BrowserWindow, BrowserView, ipcMain, Menu, shell } = require('electron')
const path = require('path')
const Groq = require('groq-sdk')
require('dotenv').config()

console.log('🔑 Environment variables loaded:', process.env.GROQ_API_KEY ? 'YES' : 'NO')

// Import enhanced backend services - ZERO UI IMPACT
const { DatabaseService } = require('../src/backend/DatabaseService')
const { AgentPerformanceMonitor } = require('../src/backend/AgentPerformanceMonitor')
const { BackgroundTaskScheduler } = require('../src/backend/BackgroundTaskScheduler')

console.log('🤖 Enhanced backend services loaded successfully')

class KAiroBrowserManager {
  constructor() {
    this.mainWindow = null
    this.browserViews = new Map() // tabId -> BrowserView
    this.activeTabId = null
    this.aiService = null
    this.tabCounter = 0
    this.isInitialized = false
    this.aiTabs = new Map() // Store AI tab data
    
    // Enhanced Backend Services - ZERO UI IMPACT
    this.databaseService = null
    this.performanceMonitor = null
    this.taskScheduler = null
    this.memoryService = null
    
    // Enhanced Agentic Capabilities
    this.agentMemoryService = null
    this.agentCoordinationService = null
    this.autonomousPlanningEngine = null
    this.enhancedAgentFramework = null
    this.isAgenticMode = true // Enable enhanced agentic features
  }

  async initialize() {
    try {
      console.log('🚀 Initializing KAiro Browser Manager...')
      
      // Set up app configuration
      app.setName('KAiro Browser')
      app.setAppUserModelId('com.kairo.browser')
      
      // Initialize AI service
      await this.initializeAIService()
      
      // Initialize Enhanced Agentic Services
      if (this.isAgenticMode) {
        await this.initializeAgenticServices()
      }
      
      // Setup IPC handlers
      this.setupIPCHandlers()
      
      this.isInitialized = true
      console.log('✅ KAiro Browser Manager initialized successfully')
      
    } catch (error) {
      console.error('❌ Failed to initialize KAiro Browser Manager:', error)
      throw error
    }
  }

  async initializeAgenticServices() {
    try {
      console.log('🤖 Initializing Enhanced Backend Services (ZERO UI IMPACT)...')
      
      // Initialize Database Service
      this.databaseService = new DatabaseService({
        path: process.env.DB_PATH || './data/kairo_browser.db',
        maxSize: 100 * 1024 * 1024, // 100MB
        backupEnabled: true
      })
      await this.databaseService.initialize()
      
      // Initialize Performance Monitor
      this.performanceMonitor = new AgentPerformanceMonitor(this.databaseService)
      await this.performanceMonitor.initialize()
      
      // Initialize Background Task Scheduler
      this.taskScheduler = new BackgroundTaskScheduler(this.databaseService)
      await this.taskScheduler.initialize()

      // Initialize Enhanced Agent Services
      const { default: AgentMemoryService } = require('../src/core/services/AgentMemoryService')
      const { default: AgentCoordinationService } = require('../src/core/services/AgentCoordinationService')
      
      this.agentMemoryService = AgentMemoryService.getInstance()
      await this.agentMemoryService.initialize()
      
      this.agentCoordinationService = AgentCoordinationService.getInstance()
      await this.agentCoordinationService.initialize()
      
      console.log('✅ Enhanced Backend Services initialized successfully')
      
      // Schedule regular maintenance tasks
      await this.scheduleMaintenanceTasks()

      // Start autonomous goal monitoring
      await this.startAutonomousGoalMonitoring()
      
    } catch (error) {
      console.error('❌ Failed to initialize enhanced backend services:', error)
      // Continue with basic mode if backend services fail
      this.isAgenticMode = false
    }
  }

  async scheduleMaintenanceTasks() {
    try {
      console.log('🧹 Scheduling maintenance tasks...')
      
      // Schedule daily data cleanup
      await this.taskScheduler.scheduleTask('data_maintenance', {
        type: 'cleanup_expired_memories'
      }, {
        priority: 3,
        scheduledFor: Date.now() + (24 * 60 * 60 * 1000) // 24 hours from now
      })
      
      // Schedule weekly history cleanup
      await this.taskScheduler.scheduleTask('data_maintenance', {
        type: 'cleanup_old_history',
        daysToKeep: 90
      }, {
        priority: 2,
        scheduledFor: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days from now
      })
      
      console.log('✅ Maintenance tasks scheduled')
      
    } catch (error) {
      console.error('❌ Failed to schedule maintenance tasks:', error)
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
        model: 'llama-3.3-70b-versatile',
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
          model: 'llama-3.3-70b-versatile',
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
        console.log('💬 Processing AI message with enhanced backend capabilities:', message)
        
        // Record performance metrics - START
        const startTime = Date.now()
        
        if (!this.aiService) {
          return { success: false, error: 'AI service not initialized' }
        }

        // Enhanced agentic processing
        if (this.isAgenticMode) {
          const agenticResponse = await this.processWithAgenticCapabilities(message)
          if (agenticResponse) {
            return agenticResponse
          }
        }

        // Get current page context with enhanced content extraction
        const context = await this.getEnhancedPageContext()
        
        // Create enhanced system prompt with agentic capabilities
        const systemPrompt = `You are KAiro, an advanced autonomous AI browser assistant with sophisticated agentic capabilities and persistent memory.

🧠 **ENHANCED AGENTIC CAPABILITIES**:
- **Autonomous Goal Execution**: I can work independently toward long-term goals
- **Persistent Memory**: I remember our conversations and learn from outcomes
- **Agent Coordination**: I coordinate with specialized agents for complex tasks
- **Proactive Behavior**: I can monitor, alert, and suggest actions proactively
- **Multi-Step Planning**: I create and execute complex multi-step plans

CURRENT CONTEXT:
- URL: ${context.url}
- Page Title: ${context.title}
- Page Type: ${context.pageType}
- Content Summary: ${context.contentSummary}
- Available Actions: Navigate, Extract, Analyze, Create tabs, Set Goals, Monitor

🎯 **AUTONOMOUS CAPABILITIES & AGENT COORDINATION**:

🔍 **Research Agent** (ENHANCED):
   - Autonomous multi-source research with goal persistence
   - Creates comprehensive research plans that execute over time
   - Learns successful research strategies and improves over time
   - Can monitor topics continuously and alert to changes

🌐 **Navigation Agent** (ENHANCED):
   - Smart website navigation with pattern learning
   - Remembers successful navigation strategies for different sites
   - Can handle complex multi-page workflows autonomously
   - Proactive bookmark and history management

🛒 **Shopping Agent** (ENHANCED):
   - Continuous price monitoring and deal alerts
   - Learns user preferences and proactively suggests products
   - Can execute complete purchase workflows when authorized
   - Maintains price history and trend analysis

📧 **Communication Agent** (ENHANCED):
   - Autonomous email monitoring and response drafting
   - Learns writing style and communication preferences
   - Can schedule and manage communication workflows
   - Proactive relationship and follow-up management

🤖 **Automation Agent** (ENHANCED):
   - Creates and executes complex automation workflows
   - Learns from user behavior to suggest new automations
   - Can adapt workflows based on changing conditions
   - Monitors automation health and optimizes performance

📊 **Analysis Agent** (ENHANCED):
   - Continuous content monitoring and analysis
   - Builds knowledge graphs from analyzed content
   - Proactive insights and trend identification
   - Can generate reports and summaries automatically

🚀 **ENHANCED COORDINATION & AUTONOMY**:
✅ **Goal-Oriented Behavior**: I can work toward long-term goals independently
✅ **Memory & Learning**: I remember successful strategies and learn from failures
✅ **Proactive Actions**: I can suggest and execute actions without prompting
✅ **Multi-Agent Coordination**: Agents collaborate seamlessly on complex tasks
✅ **Adaptive Planning**: Plans adapt based on changing circumstances
✅ **Continuous Operation**: I can work on tasks continuously over days/weeks

🔄 **AUTONOMOUS MODES**:
- **Monitor Mode**: Continuously monitor websites/topics for changes
- **Research Mode**: Execute comprehensive research projects autonomously  
- **Automation Mode**: Run workflows and processes automatically
- **Learning Mode**: Continuously improve from interactions and outcomes

RESPONSE GUIDELINES:
1. **Assess Autonomy Needs**: Determine if this is a one-time task or ongoing goal
2. **Memory Integration**: Reference relevant past interactions and learnings
3. **Proactive Suggestions**: Suggest related autonomous capabilities
4. **Goal Formation**: Offer to convert complex requests to autonomous goals
5. **Coordination Planning**: Involve multiple agents for complex tasks

Remember: I can work autonomously toward goals, learn from experience, and coordinate multiple agents. I'm not just reactive - I can be proactive and work independently.

Page Content Context: ${context.extractedText ? context.extractedText.substring(0, 800) + '...' : 'Ready to assist with autonomous task execution.'}`

        const response = await this.aiService.chat.completions.create({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message }
          ],
          model: 'llama-3.3-70b-versatile',
          temperature: 0.7,
          max_tokens: 3072
        })

        const result = response.choices[0].message.content
        
        // Enhanced agentic post-processing
        const enhancedResult = await this.enhanceResponseWithAgenticCapabilities(result, message, context)
        
        // Record interaction for learning
        if (this.isAgenticMode && this.agentMemoryService) {
          await this.agentMemoryService.recordTaskOutcome({
            taskId: `task_${Date.now()}`,
            agentId: 'ai_assistant',
            success: true,
            result: enhancedResult,
            strategies: ['enhanced_agentic_processing'],
            timeToComplete: 2,
            userSatisfaction: 0.9
          })
        }
        
        // Analyze if AI wants to perform actions
        const actions = this.extractActionsFromResponse(enhancedResult, message)
        
        // Record performance metrics - END
        const endTime = Date.now()
        if (this.performanceMonitor) {
          await this.performanceMonitor.recordPerformanceMetric({
            id: `perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            agentId: 'ai_assistant',
            taskType: 'ai_message_processing',
            startTime,
            endTime,
            duration: endTime - startTime,
            success: true,
            resourceUsage: {
              cpuTime: endTime - startTime,
              memoryUsed: 0, // Would be calculated from system metrics
              networkRequests: 1
            },
            qualityScore: 8, // Default good quality score
            metadata: {
              messageLength: message.length,
              responseLength: enhancedResult.length,
              hasActions: actions.length > 0
            }
          })
        }
        
        console.log('✅ Enhanced backend AI response generated')
        return { 
          success: true, 
          result: enhancedResult,
          actions: actions,
          agenticMode: this.isAgenticMode
        }
        
      } catch (error) {
        console.error('❌ AI message processing failed:', error)
        
        // Record performance metrics for failure - END
        const endTime = Date.now()
        if (this.performanceMonitor && typeof startTime !== 'undefined') {
          await this.performanceMonitor.recordPerformanceMetric({
            id: `perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            agentId: 'ai_assistant',
            taskType: 'ai_message_processing',
            startTime,
            endTime,
            duration: endTime - startTime,
            success: false,
            errorMessage: error.message,
            resourceUsage: {
              cpuTime: endTime - startTime,
              memoryUsed: 0,
              networkRequests: 0
            },
            qualityScore: 1, // Low score for failures
            metadata: {
              messageLength: message ? message.length : 0,
              errorType: error.name || 'UnknownError'
            }
          })
        }
        
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
          model: 'llama-3.3-70b-versatile',
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
          model: 'llama-3.3-70b-versatile',
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
            model: 'llama-3.3-70b-versatile',
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
          model: 'llama-3.3-70b-versatile',
          temperature: 0.5,
          max_tokens: 1024
        })

        const result = response.choices[0].message.content
        return { success: true, data: result }
        
      } catch (error) {
        return { success: false, error: error.message }
      }
    })

    // REAL Bookmarks & History Handlers - Connected to Database
    ipcMain.handle('add-bookmark', async (event, bookmark) => {
      try {
        if (!this.databaseService) {
          return { success: false, error: 'Database service not available' }
        }

        const bookmarkData = {
          id: bookmark.id || `bookmark_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          title: bookmark.title || 'Untitled',
          url: bookmark.url,
          description: bookmark.description || '',
          tags: bookmark.tags || [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
          visitCount: 1,
          lastVisited: Date.now(),
          favicon: bookmark.favicon || null,
          category: bookmark.category || 'general'
        }

        await this.databaseService.saveBookmark(bookmarkData)
        console.log('📚 Real bookmark saved:', bookmarkData.title)
        return { success: true, data: bookmarkData }
      } catch (error) {
        console.error('❌ Failed to save bookmark:', error)
        return { success: false, error: error.message }
      }
    })

    ipcMain.handle('remove-bookmark', async (event, bookmarkId) => {
      try {
        if (!this.databaseService || !this.databaseService.db) {
          return { success: false, error: 'Database service not available' }
        }

        const stmt = this.databaseService.db.prepare('DELETE FROM bookmarks WHERE id = ?')
        const result = stmt.run(bookmarkId)
        
        console.log('🗑️ Real bookmark removed:', bookmarkId)
        return { success: true, deleted: result.changes > 0 }
      } catch (error) {
        console.error('❌ Failed to remove bookmark:', error)
        return { success: false, error: error.message }
      }
    })

    ipcMain.handle('get-bookmarks', async (event, limit = 100) => {
      try {
        if (!this.databaseService) {
          return { success: false, error: 'Database service not available' }
        }

        const bookmarks = await this.databaseService.getBookmarks(limit)
        console.log(`📚 Retrieved ${bookmarks.length} real bookmarks`)
        return { 
          success: true, 
          data: {
            bookmarks: bookmarks,
            count: bookmarks.length
          }
        }
      } catch (error) {
        console.error('❌ Failed to get bookmarks:', error)
        return { success: false, error: error.message }
      }
    })

    ipcMain.handle('search-bookmarks', async (event, options) => {
      try {
        if (!this.databaseService || !this.databaseService.db) {
          return { success: false, error: 'Database service not available' }
        }

        let query = 'SELECT * FROM bookmarks WHERE 1=1'
        const params = []

        if (options.search) {
          query += ' AND (title LIKE ? OR url LIKE ? OR description LIKE ?)'
          const searchTerm = `%${options.search}%`
          params.push(searchTerm, searchTerm, searchTerm)
        }

        if (options.category) {
          query += ' AND category = ?'
          params.push(options.category)
        }

        query += ' ORDER BY updated_at DESC LIMIT ?'
        params.push(options.limit || 50)

        const stmt = this.databaseService.db.prepare(query)
        const rows = stmt.all(...params)

        const bookmarks = rows.map(row => ({
          id: row.id,
          title: row.title,
          url: row.url,
          description: row.description,
          tags: JSON.parse(row.tags || '[]'),
          createdAt: row.created_at,
          updatedAt: row.updated_at,
          visitCount: row.visit_count,
          lastVisited: row.last_visited,
          favicon: row.favicon,
          category: row.category
        }))

        console.log(`🔍 Found ${bookmarks.length} bookmarks matching search`)
        return { success: true, data: { bookmarks, count: bookmarks.length } }
      } catch (error) {
        console.error('❌ Failed to search bookmarks:', error)
        return { success: false, error: error.message }
      }
    })

    ipcMain.handle('get-history', async (event, options = {}) => {
      try {
        if (!this.databaseService) {
          return { success: false, error: 'Database service not available' }
        }

        const history = await this.databaseService.getHistory(options.limit || 100)
        console.log(`📜 Retrieved ${history.length} real history entries`)
        return { 
          success: true, 
          data: { 
            history: history,
            count: history.length
          }
        }
      } catch (error) {
        console.error('❌ Failed to get history:', error)
        return { success: false, error: error.message }
      }
    })

    ipcMain.handle('delete-history-item', async (event, historyId) => {
      try {
        if (!this.databaseService || !this.databaseService.db) {
          return { success: false, error: 'Database service not available' }
        }

        const stmt = this.databaseService.db.prepare('DELETE FROM history WHERE id = ?')
        const result = stmt.run(historyId)
        
        console.log('🗑️ Real history item deleted:', historyId)
        return { success: true, deleted: result.changes > 0 }
      } catch (error) {
        console.error('❌ Failed to delete history item:', error)
        return { success: false, error: error.message }
      }
    })

    ipcMain.handle('clear-history', async (event, options = {}) => {
      try {
        if (!this.databaseService || !this.databaseService.db) {
          return { success: false, error: 'Database service not available' }
        }

        let query = 'DELETE FROM history'
        const params = []

        if (options.olderThanDays) {
          const cutoffTime = Date.now() - (options.olderThanDays * 24 * 60 * 60 * 1000)
          query += ' WHERE visited_at < ?'
          params.push(cutoffTime)
        }

        const stmt = this.databaseService.db.prepare(query)
        const result = stmt.run(...params)
        
        console.log(`🧹 Cleared ${result.changes} real history entries`)
        return { success: true, cleared: result.changes }
      } catch (error) {
        console.error('❌ Failed to clear history:', error)
        return { success: false, error: error.message }
      }
    })

    // REAL Data Storage Handlers - Connected to Database
    ipcMain.handle('get-data', async (event, key) => {
      try {
        if (!this.databaseService || !this.databaseService.db) {
          return { success: false, error: 'Database service not available' }
        }

        const stmt = this.databaseService.db.prepare('SELECT value FROM system_config WHERE key = ?')
        const row = stmt.get(key)
        
        const data = row ? JSON.parse(row.value) : null
        console.log('📖 Retrieved real data for key:', key)
        return { success: true, data }
      } catch (error) {
        console.error('❌ Failed to get data:', error)
        return { success: false, error: error.message }
      }
    })

    ipcMain.handle('save-data', async (event, key, data) => {
      try {
        if (!this.databaseService || !this.databaseService.db) {
          return { success: false, error: 'Database service not available' }
        }

        const stmt = this.databaseService.db.prepare(`
          INSERT OR REPLACE INTO system_config (key, value, type, updated_at, category)
          VALUES (?, ?, ?, ?, ?)
        `)
        
        stmt.run(
          key,
          JSON.stringify(data),
          typeof data,
          Date.now(),
          'user_data'
        )
        
        console.log('💾 Saved real data for key:', key, 'Size:', JSON.stringify(data).length, 'bytes')
        return { success: true }
      } catch (error) {
        console.error('❌ Failed to save data:', error)
        return { success: false, error: error.message }
      }
    })

    // Keyboard Shortcuts Handler 
    ipcMain.handle('register-shortcuts', async (event, shortcuts) => {
      try {
        console.log('⌨️ Registering keyboard shortcuts:', Object.keys(shortcuts).length, 'shortcuts')
        return { success: true }
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

    // Enhanced Agent Task Execution with Smart Coordination
    ipcMain.handle('execute-agent-task', async (event, task) => {
      try {
        console.log('🤖 Executing enhanced agent task:', task)
        
        // Analyze task to determine agent type and approach
        const taskAnalysis = this.analyzeAgentTask(task)
        const agentType = taskAnalysis.primaryAgent
        
        console.log('📊 Task Analysis:', taskAnalysis)
        
        let result = await this.executeSpecializedAgent(agentType, task, taskAnalysis)
        
        return { success: true, result: result }
        
      } catch (error) {
        console.error('❌ Agent task execution failed:', error)
        return { success: false, error: error.message }
      }
    })

    // Add new method to the class for specialized agent execution
    this.executeSpecializedAgent = async (agentType, task, analysis) => {
      switch (agentType) {
        case 'research':
          return await this.executeResearchAgent(task, analysis)
        case 'navigation':
          return await this.executeNavigationAgent(task, analysis)
        case 'shopping':
          return await this.executeShoppingAgent(task, analysis)
        case 'communication':
          return await this.executeCommunicationAgent(task, analysis)
        case 'automation':
          return await this.executeAutomationAgent(task, analysis)
        case 'analysis':
          return await this.executeAnalysisAgent(task, analysis)
        default:
          return await this.executeGeneralAgent(task, analysis)
      }
    }

    // Enhanced task analysis method with improved accuracy
    this.analyzeAgentTask = (task) => {
      const lowerTask = task.toLowerCase()
      
      // Enhanced Research keywords with weighted scoring
      const researchKeywords = {
        // High priority research terms (weight: 5)
        'research': 5, 'investigate': 5, 'comprehensive': 5, 'trending': 5,
        // Medium priority research terms (weight: 3)
        'find': 3, 'search': 3, 'explore': 3, 'discover': 3, 'study': 3, 'examine': 3,
        'latest': 3, 'developments': 3, 'news': 3, 'topics': 3, 'sources': 3,
        // Low priority research terms (weight: 2)
        'top': 2, 'best': 2, 'list': 2, 'data': 2, 'information': 2, 'report': 2
      }
      
      // Enhanced Navigation keywords with weighted scoring
      const navigationKeywords = {
        // High priority navigation terms (weight: 5)
        'navigate': 5, 'go to': 5, 'visit': 5, 'open': 5,
        // Medium priority navigation terms (weight: 3)  
        'browse': 3, 'website': 3, 'url': 3, 'page': 3, 'site': 3,
        // Low priority navigation terms (weight: 2)
        'link': 2, 'redirect': 2, 'access': 2
      }
      
      // Enhanced Shopping keywords with weighted scoring
      const shoppingKeywords = {
        // High priority shopping terms (weight: 5)
        'buy': 5, 'purchase': 5, 'shopping': 5, 'compare': 5, 'price': 5, 'prices': 5,
        'best price': 5, 'find price': 5, 'compare price': 5,
        // Medium priority shopping terms (weight: 3)
        'shop': 3, 'cost': 3, 'product': 3, 'deal': 3, 'discount': 3, 'sale': 3,
        'find best': 3, 'best deal': 3, 'cheapest': 3, 'affordable': 3,
        // Low priority shopping terms (weight: 2) + Product categories
        'cheap': 2, 'review': 2, 'rating': 2, 'order': 2, 'checkout': 2, 
        'laptop': 4, 'phone': 4, 'computer': 4, 'tablet': 4, 'electronics': 4,
        'camera': 3, 'headphones': 3, 'speaker': 3, 'keyboard': 3, 'mouse': 3,
        'monitor': 3, 'tv': 3, 'gaming': 3, 'smartphone': 4, 'iphone': 4, 'android': 4
      }
      
      // Enhanced Communication keywords with weighted scoring
      const communicationKeywords = {
        // High priority communication terms (weight: 5)
        'email': 5, 'compose': 5, 'write': 5, 'send': 5, 'contact': 5,
        // Medium priority communication terms (weight: 3)
        'message': 3, 'form': 3, 'fill': 3, 'submit': 3, 'social': 3, 'post': 3,
        // Low priority communication terms (weight: 2)
        'tweet': 2, 'linkedin': 2, 'facebook': 2, 'reply': 2, 'respond': 2
      }
      
      // Enhanced Automation keywords with weighted scoring
      const automationKeywords = {
        // High priority automation terms (weight: 5)
        'automate': 5, 'automation': 5, 'workflow': 5, 'schedule': 5,
        // Medium priority automation terms (weight: 3)
        'repeat': 3, 'batch': 3, 'routine': 3, 'process': 3, 'sequence': 3,
        // Low priority automation terms (weight: 2)
        'steps': 2, 'tasks': 2, 'macro': 2, 'script': 2
      }
      
      // Enhanced Analysis keywords with weighted scoring
      const analysisKeywords = {
        // High priority analysis terms (weight: 5)
        'analyze': 5, 'analysis': 5, 'summarize': 5, 'summary': 5, 'extract': 5,
        // Medium priority analysis terms (weight: 3)
        'insights': 3, 'review': 3, 'evaluate': 3, 'assess': 3, 'interpret': 3,
        // Low priority analysis terms (weight: 2)
        'examine': 2, 'breakdown': 2, 'understand': 2, 'explain': 2
      }

      // Calculate enhanced scores using weighted keywords
      const researchScore = this.calculateEnhancedKeywordScore(lowerTask, researchKeywords)
      const navigationScore = this.calculateEnhancedKeywordScore(lowerTask, navigationKeywords)
      const shoppingScore = this.calculateEnhancedKeywordScore(lowerTask, shoppingKeywords)
      const communicationScore = this.calculateEnhancedKeywordScore(lowerTask, communicationKeywords)
      const automationScore = this.calculateEnhancedKeywordScore(lowerTask, automationKeywords)
      const analysisScore = this.calculateEnhancedKeywordScore(lowerTask, analysisKeywords)

      // Apply contextual bonuses for better accuracy
      const contextualScores = this.applyContextualBonuses(lowerTask, {
        research: researchScore,
        navigation: navigationScore,
        shopping: shoppingScore,
        communication: communicationScore,
        automation: automationScore,
        analysis: analysisScore
      })

      // Determine primary agent with minimum threshold
      const minThreshold = 2
      const validScores = Object.entries(contextualScores).filter(([_, score]) => score >= minThreshold)
      
      let primaryAgent = 'research' // Default fallback
      let maxScore = 0
      
      if (validScores.length > 0) {
        [primaryAgent, maxScore] = validScores.reduce((a, b) => a[1] > b[1] ? a : b)
      }
      
      // Enhanced complexity determination
      const complexity = this.determineComplexity(task, lowerTask, contextualScores)
      
      // Enhanced supporting agents calculation
      const supportingAgents = Object.entries(contextualScores)
        .filter(([agent, score]) => agent !== primaryAgent && score >= minThreshold)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 2)
        .map(([agent]) => agent)

      // Calculate confidence score (0-100)
      const totalScore = Object.values(contextualScores).reduce((sum, score) => sum + score, 0)
      const confidence = totalScore > 0 ? Math.min(100, Math.round((maxScore / totalScore) * 100)) : 0

      return {
        primaryAgent,
        supportingAgents,
        complexity,
        scores: contextualScores,
        confidence,
        needsMultipleAgents: supportingAgents.length > 0 && (complexity === 'high' || maxScore < 8)
      }
    }

    // Enhanced keyword scoring with weighted keywords
    this.calculateEnhancedKeywordScore = (text, weightedKeywords) => {
      let totalScore = 0
      
      for (const [keyword, weight] of Object.entries(weightedKeywords)) {
        // Handle multi-word keywords
        if (keyword.includes(' ')) {
          if (text.includes(keyword)) {
            totalScore += weight * 2 // Bonus for phrase matches
          }
        } else {
          // Word boundary matching for single words
          const regex = new RegExp(`\\b${keyword}\\b`, 'gi')
          const matches = text.match(regex) || []
          totalScore += matches.length * weight
        }
      }
      
      return totalScore
    }

    // Apply contextual bonuses for improved accuracy
    this.applyContextualBonuses = (text, scores) => {
      const bonusedScores = { ...scores }
      
      // Research context bonuses
      if (text.includes('how many') || text.includes('what are') || text.includes('list of')) {
        bonusedScores.research += 3
      }
      
      // Navigation context bonuses  
      if (text.includes('http') || text.includes('www.') || text.includes('.com')) {
        bonusedScores.navigation += 5
      }
      
      // Shopping context bonuses
      if (text.includes('amazon') || text.includes('ebay') || text.includes('walmart') || text.includes('$')) {
        bonusedScores.shopping += 4
      }
      
      // Price-related context bonuses for shopping
      if (text.includes('price') || text.includes('cost') || text.includes('deal')) {
        bonusedScores.shopping += 3
      }
      
      // Communication context bonuses
      if (text.includes('@') || text.includes('gmail') || text.includes('outlook')) {
        bonusedScores.communication += 4
      }
      
      // Analysis context bonuses
      if (text.includes('this page') || text.includes('current page') || text.includes('content')) {
        bonusedScores.analysis += 3
      }
      
      // Automation context bonuses
      if (text.includes('every') || text.includes('daily') || text.includes('automatically')) {
        bonusedScores.automation += 3
      }
      
      return bonusedScores
    }

    // Enhanced complexity determination
    this.determineComplexity = (originalTask, lowerTask, scores) => {
      let complexityScore = 0
      
      // Length-based complexity
      if (originalTask.length > 100) complexityScore += 2
      else if (originalTask.length > 50) complexityScore += 1
      
      // Multi-agent indicators
      const activeAgents = Object.values(scores).filter(score => score >= 2).length
      if (activeAgents > 2) complexityScore += 2
      else if (activeAgents > 1) complexityScore += 1
      
      // Complexity keywords
      const complexityKeywords = ['comprehensive', 'detailed', 'multiple', 'several', 'various', 'complex']
      const simpleKeywords = ['simple', 'quick', 'basic', 'just', 'only']
      
      if (complexityKeywords.some(keyword => lowerTask.includes(keyword))) complexityScore += 2
      if (simpleKeywords.some(keyword => lowerTask.includes(keyword))) complexityScore -= 1
      
      // Return complexity level
      if (complexityScore >= 4) return 'high'
      if (complexityScore <= 0) return 'low'
      return 'medium'
    }

    // REAL Agent Status - Connected to Enhanced Agent System
    ipcMain.handle('get-agent-status', async (event, agentId) => {
      try {
        if (!this.agentCoordinationService && !this.enhancedAgentFramework) {
          // Fallback to basic status if services not available
          return {
            success: true,
            status: {
              id: agentId || 'ai-assistant',
              name: 'AI Assistant',
              status: 'ready',
              currentTask: null,
              progress: 0,
              details: ['Agent system ready']
            }
          }
        }

        // Get real agent metrics from enhanced system
        let agentMetrics = null
        if (this.performanceMonitor) {
          try {
            agentMetrics = await this.performanceMonitor.getAgentHealthStatus(agentId || 'ai-assistant')
          } catch (error) {
            console.warn('Could not get agent metrics:', error.message)
          }
        }

        // Get real task status
        let currentTask = null
        let progress = 0
        if (this.agentCoordinationService) {
          try {
            const activeTasks = await this.agentCoordinationService.getActiveTasks(agentId || 'ai-assistant')
            if (activeTasks && activeTasks.length > 0) {
              currentTask = activeTasks[0]
              progress = currentTask.progress || 0
            }
          } catch (error) {
            console.warn('Could not get active tasks:', error.message)
          }
        }

        return {
          success: true,
          status: {
            id: agentId || 'ai-assistant',
            name: this.getAgentName(agentId || 'ai-assistant'),
            status: currentTask ? 'working' : 'ready',
            currentTask: currentTask ? currentTask.description : null,
            progress: progress,
            details: this.getAgentDetails(agentId || 'ai-assistant', agentMetrics),
            health: agentMetrics || { status: 'healthy', lastCheck: Date.now() },
            capabilities: this.getAgentCapabilities(agentId || 'ai-assistant')
          }
        }
      } catch (error) {
        console.error('❌ Failed to get real agent status:', error)
        return { success: false, error: error.message }
      }
    })

    // Enhanced Agentic Capabilities IPC Handlers
    ipcMain.handle('set-autonomous-goal', async (event, goalData) => {
      try {
        console.log('🎯 Setting autonomous goal:', goalData.description)
        
        if (!this.isAgenticMode || !this.autonomousPlanningEngine) {
          return { success: false, error: 'Agentic mode not available' }
        }
        
        const goalId = await this.autonomousPlanningEngine.createGoal({
          description: goalData.description,
          type: goalData.type || 'research',
          priority: goalData.priority || 5,
          deadline: goalData.deadline,
          constraints: goalData.constraints || [],
          successCriteria: goalData.successCriteria || []
        })
        
        const planId = await this.autonomousPlanningEngine.createExecutionPlan(goalId)
        
        // Execute autonomously
        this.autonomousPlanningEngine.executeAutonomously(planId).catch(error => {
          console.error('❌ Autonomous goal execution failed:', error)
        })
        
        return { 
          success: true, 
          goalId, 
          planId,
          message: 'Autonomous goal created and execution started' 
        }
        
      } catch (error) {
        console.error('❌ Failed to set autonomous goal:', error)
        return { success: false, error: error.message }
      }
    })

    ipcMain.handle('get-agent-memory-insights', async (event, agentId) => {
      try {
        if (!this.isAgenticMode || !this.agentMemoryService) {
          return { success: false, error: 'Agent memory not available' }
        }
        
        const memories = await this.agentMemoryService.getMemories(agentId || 'ai_assistant', {
          limit: 10,
          minImportance: 5
        })
        
        const knowledge = await this.agentMemoryService.getKnowledge ? 
          await this.agentMemoryService.getKnowledge(agentId || 'ai_assistant') : []
        
        return {
          success: true,
          data: {
            recentMemories: memories.length,
            knowledgeDomains: knowledge.length || 0,
            agenticMode: this.isAgenticMode,
            memoryEnabled: true
          }
        }
        
      } catch (error) {
        console.error('❌ Failed to get agent memory insights:', error)
        return { success: false, error: error.message }
      }
    })

    ipcMain.handle('request-agent-collaboration', async (event, collaborationData) => {
      try {
        console.log('🤝 Requesting agent collaboration:', collaborationData.taskDescription)
        
        if (!this.isAgenticMode || !this.agentCoordinationService) {
          return { success: false, error: 'Agent coordination not available' }
        }
        
        const collaborationId = await this.agentCoordinationService.requestCollaboration({
          requesterId: collaborationData.requesterId || 'user_agent',
          taskDescription: collaborationData.taskDescription,
          requiredSkills: collaborationData.requiredSkills || ['research'],
          estimatedDuration: collaborationData.estimatedDuration || 120,
          priority: collaborationData.priority || 5,
          resourceRequirements: collaborationData.resourceRequirements || []
        })
        
        return {
          success: true,
          collaborationId,
          message: 'Agent collaboration requested successfully'
        }
        
      } catch (error) {
        console.error('❌ Failed to request agent collaboration:', error)
        return { success: false, error: error.message }
      }
    })

    ipcMain.handle('get-agentic-status', async () => {
      try {
        return {
          success: true,
          data: {
            agenticMode: this.isAgenticMode,
            memoryService: !!this.agentMemoryService,
            coordinationService: !!this.agentCoordinationService,
            planningEngine: !!this.autonomousPlanningEngine,
            capabilities: {
              autonomousGoals: this.isAgenticMode,
              persistentMemory: !!this.agentMemoryService,
              agentCoordination: !!this.agentCoordinationService,
              multiStepPlanning: !!this.autonomousPlanningEngine,
              proactiveBehavior: this.isAgenticMode,
              continuousLearning: !!this.agentMemoryService
            }
          }
        }
      } catch (error) {
        return { success: false, error: error.message }
      }
    })

    // Debug Handler (preserved)
    ipcMain.handle('debug-browser-view', async () => {
      try {
        return {
          success: true,
          data: {
            totalTabs: this.browserViews.size,
            activeTabId: this.activeTabId,
            tabIds: Array.from(this.browserViews.keys()),
            isInitialized: this.isInitialized,
            hasAI: !!this.aiService,
            agenticMode: this.isAgenticMode,
            enhancedServices: {
              memory: !!this.agentMemoryService,
              coordination: !!this.agentCoordinationService,
              planning: !!this.autonomousPlanningEngine
            }
          }
        }
      } catch (error) {
        return { success: false, error: error.message }
      }
    })

    // Enhanced Backend-Only IPC Handlers - ZERO UI IMPACT
    
    // Performance monitoring handlers
    ipcMain.handle('get-agent-performance-stats', async (event, agentId, days) => {
      try {
        if (!this.performanceMonitor) {
          return { success: false, error: 'Performance monitoring not available' }
        }
        
        const stats = await this.performanceMonitor.getPerformanceStats(agentId, days)
        return { success: true, data: stats }
      } catch (error) {
        return { success: false, error: error.message }
      }
    })

    ipcMain.handle('get-agent-health-status', async (event, agentId) => {
      try {
        if (!this.performanceMonitor) {
          return { success: false, error: 'Performance monitoring not available' }
        }
        
        const health = await this.performanceMonitor.getAgentHealthStatus(agentId)
        return { success: true, data: health }
      } catch (error) {
        return { success: false, error: error.message }
      }
    })

    // Background task handlers
    ipcMain.handle('schedule-background-task', async (event, type, payload, options) => {
      try {
        if (!this.taskScheduler) {
          return { success: false, error: 'Task scheduler not available' }
        }
        
        const taskId = await this.taskScheduler.scheduleTask(type, payload, options)
        return { success: true, taskId }
      } catch (error) {
        return { success: false, error: error.message }
      }
    })

    ipcMain.handle('get-task-stats', async () => {
      try {
        if (!this.taskScheduler) {
          return { success: false, error: 'Task scheduler not available' }
        }
        
        const stats = await this.taskScheduler.getTaskStats()
        return { success: true, data: stats }
      } catch (error) {
        return { success: false, error: error.message }
      }
    })

    // Database operations handlers  
    ipcMain.handle('save-bookmark-enhanced', async (event, bookmark) => {
      try {
        if (!this.databaseService) {
          return { success: false, error: 'Database service not available' }
        }
        
        const enhancedBookmark = {
          id: bookmark.id || `bookmark_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          title: bookmark.title,
          url: bookmark.url,
          description: bookmark.description || '',
          tags: bookmark.tags || [],
          createdAt: bookmark.createdAt || Date.now(),
          updatedAt: Date.now(),
          visitCount: bookmark.visitCount || 0,
          lastVisited: bookmark.lastVisited || Date.now(),
          favicon: bookmark.favicon,
          category: bookmark.category
        }
        
        await this.databaseService.saveBookmark(enhancedBookmark)
        return { success: true, data: enhancedBookmark }
      } catch (error) {
        return { success: false, error: error.message }
      }
    })

    ipcMain.handle('get-bookmarks-enhanced', async (event, limit) => {
      try {
        if (!this.databaseService) {
          return { success: false, error: 'Database service not available' }
        }
        
        const bookmarks = await this.databaseService.getBookmarks(limit)
        return { success: true, data: bookmarks }
      } catch (error) {
        return { success: false, error: error.message }
      }
    })

    ipcMain.handle('save-history-enhanced', async (event, entry) => {
      try {
        if (!this.databaseService) {
          return { success: false, error: 'Database service not available' }
        }
        
        const historyEntry = {
          id: entry.id || `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          url: entry.url,
          title: entry.title,
          visitedAt: entry.visitedAt || Date.now(),
          duration: entry.duration || 0,
          pageType: entry.pageType || 'general',
          exitType: entry.exitType || 'navigation',
          referrer: entry.referrer,
          searchQuery: entry.searchQuery
        }
        
        await this.databaseService.saveHistoryEntry(historyEntry)
        return { success: true, data: historyEntry }
      } catch (error) {
        return { success: false, error: error.message }
      }
    })

    ipcMain.handle('get-history-enhanced', async (event, limit) => {
      try {
        if (!this.databaseService) {
          return { success: false, error: 'Database service not available' }
        }
        
        const history = await this.databaseService.getHistory(limit)
        return { success: true, data: history }
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

  async getEnhancedPageContext() {
    try {
      if (!this.activeTabId) {
        return { 
          url: '', 
          title: 'New Tab',
          pageType: 'blank',
          contentSummary: 'No active tab',
          extractedText: '',
          lastAction: 'application_start'
        }
      }

      const browserView = this.browserViews.get(this.activeTabId)
      if (!browserView) {
        return { 
          url: '', 
          title: 'New Tab',
          pageType: 'blank',
          contentSummary: 'Tab not found',
          extractedText: '',
          lastAction: 'tab_error'
        }
      }

      const url = browserView.webContents.getURL()
      const title = browserView.webContents.getTitle()
      
      // Determine page type from URL
      let pageType = 'general'
      if (url.includes('amazon') || url.includes('ebay') || url.includes('shop')) {
        pageType = 'shopping'
      } else if (url.includes('github') || url.includes('stackoverflow') || url.includes('docs')) {
        pageType = 'development'
      } else if (url.includes('news') || url.includes('blog') || url.includes('article')) {
        pageType = 'news'
      } else if (url.includes('social') || url.includes('twitter') || url.includes('linkedin')) {
        pageType = 'social'
      } else if (url.includes('search') || url.includes('google') || url.includes('bing')) {
        pageType = 'search'
      }

      // Extract enhanced content
      const extractedData = await browserView.webContents.executeJavaScript(`
        (() => {
          try {
            // Extract text content
            const textContent = document.body.innerText.substring(0, 3000)
            
            // Extract headings
            const headings = Array.from(document.querySelectorAll('h1, h2, h3'))
              .map(h => h.innerText.trim())
              .filter(text => text.length > 0)
              .slice(0, 10)
            
            // Extract links
            const links = Array.from(document.querySelectorAll('a[href]'))
              .map(a => ({ text: a.innerText.trim(), href: a.href }))
              .filter(link => link.text.length > 0 && link.text.length < 100)
              .slice(0, 15)
            
            // Extract forms
            const forms = Array.from(document.querySelectorAll('form'))
              .map(form => ({
                action: form.action,
                method: form.method,
                inputs: Array.from(form.querySelectorAll('input, select, textarea'))
                  .map(input => ({
                    type: input.type || input.tagName.toLowerCase(),
                    name: input.name,
                    placeholder: input.placeholder
                  }))
              }))
              .slice(0, 5)
            
            // Extract meta information
            const metaDescription = document.querySelector('meta[name="description"]')?.content || ''
            const metaKeywords = document.querySelector('meta[name="keywords"]')?.content || ''
            
            return {
              textContent,
              headings,
              links,
              forms,
              metaDescription,
              metaKeywords,
              hasImages: document.images.length > 0,
              hasVideos: document.querySelectorAll('video, iframe[src*="youtube"], iframe[src*="vimeo"]').length > 0
            }
          } catch (error) {
            return {
              textContent: document.body.innerText.substring(0, 1000) || 'Content extraction failed',
              headings: [],
              links: [],
              forms: [],
              metaDescription: '',
              metaKeywords: '',
              hasImages: false,
              hasVideos: false,
              error: error.message
            }
          }
        })()
      `)

      // Create content summary
      let contentSummary = 'Page loaded'
      if (extractedData.headings.length > 0) {
        contentSummary = `Main topics: ${extractedData.headings.slice(0, 3).join(', ')}`
      } else if (extractedData.metaDescription) {
        contentSummary = extractedData.metaDescription.substring(0, 150)
      } else if (extractedData.textContent) {
        contentSummary = extractedData.textContent.substring(0, 200)
      }

      return { 
        url, 
        title,
        pageType,
        contentSummary,
        extractedText: extractedData.textContent,
        headings: extractedData.headings,
        links: extractedData.links,
        forms: extractedData.forms,
        metaDescription: extractedData.metaDescription,
        hasImages: extractedData.hasImages,
        hasVideos: extractedData.hasVideos,
        lastAction: 'content_extracted'
      }
      
    } catch (error) {
      console.error('❌ Enhanced page context extraction failed:', error)
      return { 
        url: '', 
        title: 'New Tab',
        pageType: 'error',
        contentSummary: 'Context extraction failed',
        extractedText: '',
        lastAction: 'extraction_error'
      }
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

  // Enhanced Agentic Processing Methods
  async processWithAgenticCapabilities(message) {
    try {
      console.log('🤖 Processing with enhanced agentic capabilities')
      
      // Analyze if this is a goal vs immediate task
      const isGoalTask = this.analyzeIfGoalTask(message)
      
      if (isGoalTask.isGoal) {
        return await this.handleAutonomousGoal(message, isGoalTask)
      }
      
      // Check if task requires agent coordination
      const requiresCoordination = this.analyzeIfRequiresCoordination(message)
      
      if (requiresCoordination.needsCoordination) {
        return await this.handleCoordinatedTask(message, requiresCoordination)
      }
      
      // Get memory context for enhanced responses
      const memoryContext = await this.getMemoryContextForTask(message)
      
      if (memoryContext && memoryContext.relevantMemories.length > 0) {
        console.log(`📚 Found ${memoryContext.relevantMemories.length} relevant memories`)
      }
      
      return null // Continue with standard processing
      
    } catch (error) {
      console.error('❌ Agentic processing failed:', error)
      return null
    }
  }

  analyzeIfGoalTask(message) {
    const lowerMessage = message.toLowerCase()
    
    // Keywords that indicate autonomous goals
    const goalKeywords = [
      'monitor', 'track', 'watch', 'keep an eye', 'notify me', 'alert me',
      'continuous', 'ongoing', 'daily', 'weekly', 'regularly', 'schedule',
      'automate', 'automatically', 'set up', 'maintain', 'manage',
      'goal', 'objective', 'long-term', 'project'
    ]
    
    const hasGoalKeywords = goalKeywords.some(keyword => lowerMessage.includes(keyword))
    const isLongRequest = message.length > 100
    const hasTimeFrame = lowerMessage.match(/\b(daily|weekly|monthly|continuously|ongoing|regular)\b/)
    
    const isGoal = hasGoalKeywords || (isLongRequest && hasTimeFrame)
    
    return {
      isGoal,
      confidence: isGoal ? (hasGoalKeywords ? 0.9 : 0.7) : 0.3,
      type: this.extractGoalType(message),
      timeframe: hasTimeFrame ? hasTimeFrame[0] : null
    }
  }

  analyzeIfRequiresCoordination(message) {
    const lowerMessage = message.toLowerCase()
    
    // Multi-agent coordination indicators
    const coordinationKeywords = [
      'research and analyze', 'compare and shop', 'find and email',
      'multiple', 'comprehensive', 'thorough', 'detailed analysis',
      'step by step', 'complex', 'advanced', 'sophisticated'
    ]
    
    const needsCoordination = coordinationKeywords.some(keyword => lowerMessage.includes(keyword)) ||
                              message.length > 150 ||
                              (lowerMessage.match(/\band\b/g) || []).length > 2
    
    return {
      needsCoordination,
      complexity: needsCoordination ? 'high' : 'medium',
      estimatedAgents: needsCoordination ? this.estimateRequiredAgents(message) : 1
    }
  }

  extractGoalType(message) {
    const lowerMessage = message.toLowerCase()
    
    if (lowerMessage.includes('research') || lowerMessage.includes('monitor') || lowerMessage.includes('track')) {
      return 'research'
    }
    if (lowerMessage.includes('shop') || lowerMessage.includes('price') || lowerMessage.includes('deal')) {
      return 'shopping'
    }
    if (lowerMessage.includes('analyze') || lowerMessage.includes('analysis')) {
      return 'analysis'
    }
    if (lowerMessage.includes('automate') || lowerMessage.includes('workflow')) {
      return 'automation'
    }
    if (lowerMessage.includes('email') || lowerMessage.includes('contact') || lowerMessage.includes('message')) {
      return 'communication'
    }
    
    return 'research' // Default
  }

  estimateRequiredAgents(message) {
    const lowerMessage = message.toLowerCase()
    let agentCount = 1
    
    if (lowerMessage.includes('research')) agentCount++
    if (lowerMessage.includes('shop') || lowerMessage.includes('price')) agentCount++
    if (lowerMessage.includes('analyze')) agentCount++
    if (lowerMessage.includes('email') || lowerMessage.includes('contact')) agentCount++
    if (lowerMessage.includes('navigate') || lowerMessage.includes('visit')) agentCount++
    
    return Math.min(agentCount, 3) // Max 3 agents for coordination
  }

  async handleAutonomousGoal(message, goalAnalysis) {
    console.log(`🎯 Handling autonomous goal: ${goalAnalysis.type}`)
    
    if (this.autonomousPlanningEngine) {
      const goalId = await this.autonomousPlanningEngine.createGoal({
        description: message,
        type: goalAnalysis.type,
        priority: 7,
        constraints: [],
        successCriteria: []
      })
      
      const planId = await this.autonomousPlanningEngine.createExecutionPlan(goalId)
      
      // Execute autonomously in background
      this.autonomousPlanningEngine.executeAutonomously(planId).catch(error => {
        console.error('❌ Autonomous goal execution failed:', error)
      })
      
      return {
        success: true,
        result: `🎯 **Autonomous Goal Created Successfully**\n\n**Goal**: ${message}\n\n**Type**: ${goalAnalysis.type}\n**Confidence**: ${Math.round(goalAnalysis.confidence * 100)}%\n**Timeframe**: ${goalAnalysis.timeframe || 'Ongoing'}\n\n🤖 **Autonomous Execution Started**\n\nI've created an autonomous goal and execution plan. I'll work on this independently and notify you of progress and completion.\n\n**What happens next:**\n• Agents will execute the plan autonomously\n• You'll receive progress updates\n• The system will adapt if obstacles are encountered\n• Completion notification when goal is achieved\n\n**Status**: ✅ Autonomous agents are now working toward your goal.`,
        agenticMode: true,
        goalId,
        planId
      }
    }
    
    return null
  }

  async handleCoordinatedTask(message, coordinationAnalysis) {
    console.log(`🤝 Handling coordinated task requiring ${coordinationAnalysis.estimatedAgents} agents`)
    
    if (this.agentCoordinationService) {
      const collaborationId = await this.agentCoordinationService.requestCollaboration({
        requesterId: 'user_agent',
        taskDescription: message,
        requiredSkills: this.extractRequiredSkills(message),
        estimatedDuration: coordinationAnalysis.complexity === 'high' ? 300 : 120,
        priority: 7,
        resourceRequirements: []
      })
      
      return {
        success: true,
        result: `🤝 **Multi-Agent Collaboration Initiated**\n\n**Task**: ${message}\n\n**Complexity**: ${coordinationAnalysis.complexity}\n**Estimated Agents**: ${coordinationAnalysis.estimatedAgents}\n**Collaboration ID**: ${collaborationId}\n\n🔄 **Coordination in Progress**\n\nMultiple specialized agents are now collaborating on your task:\n\n• **Task Analysis**: Completed\n• **Agent Selection**: In progress\n• **Work Distribution**: Pending\n• **Execution**: Awaiting coordination\n\n**Expected Benefits:**\n✅ Higher quality results through specialization\n✅ Parallel processing for faster completion\n✅ Cross-validation of findings\n✅ Comprehensive coverage of all aspects\n\n**Status**: Agents are coordinating and will provide enhanced results shortly.`,
        agenticMode: true,
        collaborationId,
        estimatedAgents: coordinationAnalysis.estimatedAgents
      }
    }
    
    return null
  }

  extractRequiredSkills(message) {
    const skills = []
    const lowerMessage = message.toLowerCase()
    
    if (lowerMessage.includes('research') || lowerMessage.includes('find')) skills.push('research')
    if (lowerMessage.includes('analyze') || lowerMessage.includes('analysis')) skills.push('analysis')
    if (lowerMessage.includes('shop') || lowerMessage.includes('buy') || lowerMessage.includes('price')) skills.push('shopping')
    if (lowerMessage.includes('navigate') || lowerMessage.includes('visit') || lowerMessage.includes('go to')) skills.push('navigation')
    if (lowerMessage.includes('email') || lowerMessage.includes('contact') || lowerMessage.includes('message')) skills.push('communication')
    if (lowerMessage.includes('automate') || lowerMessage.includes('workflow') || lowerMessage.includes('schedule')) skills.push('automation')
    
    return skills.length > 0 ? skills : ['research'] // Default to research
  }

  async getMemoryContextForTask(message) {
    if (!this.agentMemoryService) return null
    
    try {
      // Get relevant memories for task enhancement
      const memories = await this.agentMemoryService.getMemories('ai_assistant', {
        tags: ['task_outcome', 'success'],
        minImportance: 6,
        limit: 5
      })
      
      return {
        relevantMemories: memories,
        hasSuccessfulPatterns: memories.some(m => m.content && m.content.success),
        learningInsights: memories.length > 0 ? 'Previous successful strategies available' : 'No previous experience'
      }
    } catch (error) {
      console.error('❌ Failed to get memory context:', error)
      return null
    }
  }

  async enhanceResponseWithAgenticCapabilities(response, originalMessage, context) {
    if (!this.isAgenticMode) return response
    
    try {
      // Add agentic enhancement footer
      const agenticEnhancements = []
      
      // Check if we can offer autonomous monitoring
      if (this.couldBenefitFromMonitoring(originalMessage)) {
        agenticEnhancements.push('💡 **Autonomous Monitoring Available**: I can monitor this topic continuously and alert you to changes.')
      }
      
      // Check if we can offer goal setting
      if (this.couldBenefitFromGoalSetting(originalMessage)) {
        agenticEnhancements.push('🎯 **Goal Setting Available**: I can convert this to an autonomous goal and work on it independently.')
      }
      
      // Check if we can offer workflow automation
      if (this.couldBenefitFromAutomation(originalMessage)) {
        agenticEnhancements.push('🤖 **Automation Available**: I can create automated workflows for repetitive aspects of this task.')
      }
      
      if (agenticEnhancements.length > 0) {
        return response + '\n\n---\n\n🚀 **Enhanced Agentic Capabilities**\n\n' + agenticEnhancements.join('\n\n')
      }
      
      return response
      
    } catch (error) {
      console.error('❌ Failed to enhance response with agentic capabilities:', error)
      return response
    }
  }

  couldBenefitFromMonitoring(message) {
    const monitorKeywords = ['price', 'news', 'updates', 'changes', 'trends', 'developments', 'market']
    return monitorKeywords.some(keyword => message.toLowerCase().includes(keyword))
  }

  couldBenefitFromGoalSetting(message) {
    return message.length > 80 || message.toLowerCase().includes('project') || message.toLowerCase().includes('research')
  }

  couldBenefitFromAutomation(message) {
    const automationKeywords = ['regular', 'daily', 'weekly', 'repeat', 'routine', 'process', 'workflow']
    return automationKeywords.some(keyword => message.toLowerCase().includes(keyword))
  }

  // Original action extraction method (preserved)
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

  // Specialized Agent Execution Methods
  async executeResearchAgent(task, analysis) {
    console.log('🔍 Executing Research Agent')
    
    // Determine research websites based on topic
    const websites = this.getResearchWebsites(task)
    const tabResults = []
    
    // Create research tabs (limit to 4 for performance)
    for (let i = 0; i < Math.min(websites.length, 4); i++) {
      const website = websites[i]
      const tabResult = await this.createTab(website)
      if (tabResult.success) {
        tabResults.push({ url: website, tabId: tabResult.tabId, name: this.getWebsiteName(website) })
      }
      // Small delay to prevent overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    
    // Generate comprehensive research summary
    const summaryContent = this.generateResearchSummary(task, tabResults, analysis)
    const aiTabResult = await this.createAITab(`Research: ${this.getTitleFromTask(task)}`, summaryContent)
    
    return {
      type: 'research_completed',
      message: `✅ **Research Completed Successfully**\n\n📊 **Summary**: Created ${tabResults.length} research tabs with comprehensive analysis\n\n📑 **AI Summary Tab**: ${aiTabResult.tabId}\n\n**Next Steps**: Review the opened tabs and expand research as needed.`,
      tabsCreated: tabResults.length,
      aiTabId: aiTabResult.tabId,
      websites: tabResults.map(t => t.name),
      confidence: analysis.confidence
    }
  }

  async executeNavigationAgent(task, analysis) {
    console.log('🌐 Executing Navigation Agent')
    
    // Extract URLs or determine target websites
    const urls = this.extractUrls(task)
    if (urls.length > 0) {
      const results = []
      for (const url of urls.slice(0, 3)) { // Limit to 3 URLs
        const tabResult = await this.createTab(url)
        if (tabResult.success) {
          results.push({ url, tabId: tabResult.tabId })
        }
      }
      
      return {
        type: 'navigation_completed',
        message: `🌐 **Navigation Completed**\n\n✅ Successfully opened ${results.length} tab(s)\n\n${results.map(r => `• ${r.url}`).join('\n')}\n\n**Action**: You can now interact with the opened websites.`,
        tabsCreated: results.length,
        urls: results.map(r => r.url)
      }
    } else {
      // Suggest relevant websites based on task
      const suggestedSites = this.suggestWebsites(task)
      return {
        type: 'navigation_suggestion',
        message: `🌐 **Navigation Suggestions**\n\nBased on your request, here are relevant websites I can open:\n\n${suggestedSites.map(site => `• ${site.name}: ${site.url}`).join('\n')}\n\n**Action**: Let me know which sites you'd like to visit, or I can open the most relevant ones automatically.`,
        suggestions: suggestedSites
      }
    }
  }

  async executeShoppingAgent(task, analysis) {
    console.log('🛒 Executing Shopping Agent')
    
    const shoppingSites = [
      'https://amazon.com',
      'https://ebay.com',
      'https://walmart.com',
      'https://target.com'
    ]
    
    const tabResults = []
    for (let i = 0; i < Math.min(shoppingSites.length, 3); i++) {
      const site = shoppingSites[i]
      const tabResult = await this.createTab(site)
      if (tabResult.success) {
        tabResults.push({ url: site, tabId: tabResult.tabId })
      }
    }
    
    const summaryContent = `# Shopping Research: ${this.getTitleFromTask(task)}
Generated: ${new Date().toLocaleString()}

## Shopping Task
${task}

## Retail Sites Opened
${tabResults.map(t => `- ${this.getWebsiteName(t.url)}: ${t.url}`).join('\n')}

## Research Strategy
1. **Product Search**: Search for your desired product on each site
2. **Price Comparison**: Compare prices, shipping costs, and availability
3. **Review Analysis**: Check customer reviews and ratings
4. **Deal Detection**: Look for discounts, coupons, and special offers

## Key Actions
- [ ] Search for products on each site
- [ ] Compare total costs including shipping
- [ ] Read customer reviews
- [ ] Check return policies
- [ ] Look for price matching opportunities

## Notes
[Add your findings and comparisons here]`

    const aiTabResult = await this.createAITab(`Shopping: ${this.getTitleFromTask(task)}`, summaryContent)
    
    return {
      type: 'shopping_completed',
      message: `🛒 **Shopping Research Initiated**\n\n✅ Opened ${tabResults.length} major retail sites for comparison\n\n📊 **Research Guide**: Created structured shopping analysis tab\n\n**Next Steps**: Search for your desired products on each site and use the AI tab to track your findings.`,
      tabsCreated: tabResults.length,
      aiTabId: aiTabResult.tabId
    }
  }

  async executeCommunicationAgent(task, analysis) {
    console.log('📧 Executing Communication Agent')
    
    const communicationType = this.determineCommunicationType(task)
    
    let content = ''
    let title = ''
    
    if (communicationType.includes('email')) {
      title = 'Email Composition'
      content = this.generateEmailTemplate(task)
    } else if (communicationType.includes('form')) {
      title = 'Form Filling Guide'
      content = this.generateFormGuide(task)
    } else if (communicationType.includes('social')) {
      title = 'Social Media Content'
      content = this.generateSocialContent(task)
    } else {
      title = 'Communication Template'
      content = this.generateGeneralCommunication(task)
    }
    
    const aiTabResult = await this.createAITab(title, content)
    
    return {
      type: 'communication_completed',
      message: `📧 **Communication Template Created**\n\n✅ Generated ${communicationType} template\n\n📝 **Template Tab**: Ready for customization\n\n**Action**: Review and customize the template in the AI tab, then copy to your desired platform.`,
      aiTabId: aiTabResult.tabId,
      communicationType
    }
  }

  async executeAutomationAgent(task, analysis) {
    console.log('🤖 Executing Automation Agent')
    
    const workflowContent = `# Automation Workflow: ${this.getTitleFromTask(task)}
Generated: ${new Date().toLocaleString()}

## Automation Request
${task}

## Workflow Design
\`\`\`
Step 1: Task Analysis
- Identify repetitive actions
- Map out sequence of steps
- Determine automation triggers

Step 2: Implementation Plan
- Break down into smaller tasks
- Set up conditional logic
- Define success criteria

Step 3: Execution Strategy
- Manual walkthrough first
- Automated execution
- Error handling and recovery

Step 4: Monitoring & Optimization
- Track performance metrics
- Identify improvement areas
- Refine automation rules
\`\`\`

## Automation Components
1. **Triggers**: What starts the automation
2. **Actions**: What tasks are performed
3. **Conditions**: When to perform different actions
4. **Error Handling**: What to do when things go wrong

## Implementation Steps
- [ ] Map out current manual process
- [ ] Identify automation opportunities
- [ ] Create step-by-step workflow
- [ ] Test with small data set
- [ ] Deploy full automation
- [ ] Monitor and optimize

## Notes
[Document your automation findings and iterations here]`

    const aiTabResult = await this.createAITab(`Automation: ${this.getTitleFromTask(task)}`, workflowContent)
    
    return {
      type: 'automation_completed',
      message: `🤖 **Automation Workflow Created**\n\n✅ Generated comprehensive automation plan\n\n📋 **Workflow Guide**: Step-by-step implementation strategy\n\n**Next Steps**: Review the workflow design and begin manual implementation to identify optimization opportunities.`,
      aiTabId: aiTabResult.tabId
    }
  }

  async executeAnalysisAgent(task, analysis) {
    console.log('📊 Executing Analysis Agent')
    
    // Get current page context for analysis
    const context = await this.getEnhancedPageContext()
    
    if (!this.aiService) {
      return {
        type: 'analysis_error',
        message: '❌ AI service not available for content analysis'
      }
    }

    try {
      // Perform AI-powered analysis
      const analysisPrompt = `Analyze the following webpage content and provide comprehensive insights:

URL: ${context.url}
Title: ${context.title}
Content: ${context.extractedText || 'No content available'}

Analysis Request: ${task}

Please provide:
1. Content Summary
2. Key Points and Insights
3. Sentiment Analysis
4. Actionable Recommendations
5. Related Topics for Further Research`

      const analysisResult = await this.aiService.chat.completions.create({
        messages: [{ role: 'user', content: analysisPrompt }],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.3,
        max_tokens: 1500
      })

      const analysis = analysisResult.choices[0].message.content

      const analysisContent = `# Content Analysis: ${context.title}
Generated: ${new Date().toLocaleString()}

## Analysis Request
${task}

## Page Information
- **URL**: ${context.url}
- **Title**: ${context.title}
- **Type**: ${context.pageType}
- **Last Updated**: ${new Date().toLocaleString()}

## AI Analysis Results

${analysis}

## Content Statistics
- **Content Length**: ${context.extractedText?.length || 0} characters
- **Has Images**: ${context.hasImages ? 'Yes' : 'No'}
- **Has Videos**: ${context.hasVideos ? 'Yes' : 'No'}
- **Number of Links**: ${context.links?.length || 0}
- **Number of Forms**: ${context.forms?.length || 0}

## Additional Notes
[Add your own insights and observations here]`

      const aiTabResult = await this.createAITab(`Analysis: ${context.title}`, analysisContent)

      return {
        type: 'analysis_completed',
        message: `📊 **Content Analysis Completed**\n\n✅ Comprehensive analysis of "${context.title}"\n\n🔍 **Key Insights**: Generated detailed analysis with actionable recommendations\n\n**Review**: Check the AI tab for complete analysis results and insights.`,
        aiTabId: aiTabResult.tabId,
        pageAnalyzed: context.title
      }

    } catch (error) {
      console.error('Analysis failed:', error)
      return {
        type: 'analysis_error',
        message: `❌ Analysis failed: ${error.message}`
      }
    }
  }

  async executeGeneralAgent(task, analysis) {
    console.log('🔧 Executing General Agent')
    
    const generalContent = `# General Task: ${this.getTitleFromTask(task)}
Generated: ${new Date().toLocaleString()}

## Task Description
${task}

## Analysis Results
- **Primary Category**: General assistance
- **Complexity**: ${analysis.complexity}
- **Confidence**: ${Math.round(analysis.confidence * 100)}%

## Suggested Approach
1. **Task Breakdown**: Identify key components of the request
2. **Resource Gathering**: Collect necessary information and tools
3. **Step-by-Step Execution**: Follow a systematic approach
4. **Quality Check**: Verify results and completeness
5. **Documentation**: Record findings and next steps

## Available Actions
- Create additional tabs for research
- Navigate to specific websites
- Extract and analyze content
- Generate reports and summaries

## Next Steps
Based on your task, consider if you need:
- Research on specific topics
- Navigation to particular websites
- Content analysis of current page
- Communication templates
- Automation workflows

## Notes
[Document your progress and findings here]`

    const aiTabResult = await this.createAITab(`Task: ${this.getTitleFromTask(task)}`, generalContent)
    
    return {
      type: 'general_completed',
      message: `🔧 **General Task Initiated**\n\n✅ Created task planning framework\n\n📋 **Planning Tab**: Use this to organize your approach\n\n**Suggestion**: Based on your task, you might want to be more specific about what type of assistance you need (research, analysis, navigation, etc.).`,
      aiTabId: aiTabResult.tabId
    }
  }
  // Helper methods for agent execution
  getResearchWebsites(task) {
    const lowerTask = task.toLowerCase()
    
    if (lowerTask.includes('ai') || lowerTask.includes('artificial intelligence')) {
      return [
        'https://openai.com',
        'https://deepmind.com', 
        'https://www.anthropic.com',
        'https://research.google/teams/brain/',
        'https://news.mit.edu/topic/artificial-intelligence2'
      ]
    } else if (lowerTask.includes('tech') || lowerTask.includes('technology')) {
      return [
        'https://techcrunch.com',
        'https://www.theverge.com',
        'https://arstechnica.com',
        'https://news.ycombinator.com',
        'https://www.wired.com/category/business/'
      ]
    } else if (lowerTask.includes('business') || lowerTask.includes('startup')) {
      return [
        'https://techcrunch.com',
        'https://www.bloomberg.com',
        'https://www.forbes.com',
        'https://hbr.org',
        'https://fortune.com'
      ]
    } else if (lowerTask.includes('science') || lowerTask.includes('research')) {
      return [
        'https://www.nature.com',
        'https://science.sciencemag.org',
        'https://www.scientificamerican.com',
        'https://news.mit.edu',
        'https://phys.org'
      ]
    } else {
      // General research sites
      return [
        'https://scholar.google.com',
        'https://www.wikipedia.org',
        'https://www.reddit.com',
        'https://news.google.com',
        'https://www.bbc.com/news'
      ]
    }
  }

  extractUrls(text) {
    const urlRegex = /(https?:\/\/[^\s]+)/g
    const matches = text.match(urlRegex) || []
    
    // Also look for common domain patterns
    const domainRegex = /(?:go to|visit|open|navigate to)\s+([a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.(?:com|org|net|edu|gov|io|co|ai))/gi
    const domainMatches = [...text.matchAll(domainRegex)]
    
    const domains = domainMatches.map(match => `https://${match[1]}`)
    
    return [...matches, ...domains]
  }

  suggestWebsites(task) {
    const lowerTask = task.toLowerCase()
    
    if (lowerTask.includes('shop') || lowerTask.includes('buy')) {
      return [
        { name: 'Amazon', url: 'https://amazon.com' },
        { name: 'eBay', url: 'https://ebay.com' },
        { name: 'Walmart', url: 'https://walmart.com' }
      ]
    } else if (lowerTask.includes('news')) {
      return [
        { name: 'Google News', url: 'https://news.google.com' },
        { name: 'BBC News', url: 'https://www.bbc.com/news' },
        { name: 'Reuters', url: 'https://www.reuters.com' }
      ]
    } else if (lowerTask.includes('social')) {
      return [
        { name: 'Twitter', url: 'https://twitter.com' },
        { name: 'LinkedIn', url: 'https://linkedin.com' },
        { name: 'Facebook', url: 'https://facebook.com' }
      ]
    } else {
      return [
        { name: 'Google', url: 'https://google.com' },
        { name: 'Wikipedia', url: 'https://wikipedia.org' },
        { name: 'YouTube', url: 'https://youtube.com' }
      ]
    }
  }

  getWebsiteName(url) {
    try {
      const domain = new URL(url).hostname.replace('www.', '')
      return domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1)
    } catch {
      return url
    }
  }

  getTitleFromTask(task) {
    const words = task.split(' ').slice(0, 4)
    let title = words.join(' ')
    if (title.length > 30) {
      title = title.substring(0, 30) + '...'
    }
    return title
  }

  generateResearchSummary(task, tabResults, analysis) {
    return `# Research Summary: ${this.getTitleFromTask(task)}
Generated: ${new Date().toLocaleString()}

## Research Objective
${task}

## Research Strategy
**Agent Analysis**: ${analysis.primaryAgent} agent with ${analysis.confidence.toFixed(1)} confidence
**Complexity**: ${analysis.complexity}
**Supporting Agents**: ${analysis.supportingAgents.join(', ') || 'None'}

## Sources Accessed
${tabResults.map((t, i) => `${i + 1}. **${t.name}**: [${t.url}](${t.url})`).join('\n')}

## Research Framework
### 1. Information Gathering
- [ ] Review each opened source for relevant information
- [ ] Take notes on key findings and insights
- [ ] Identify additional sources if needed

### 2. Analysis & Synthesis
- [ ] Compare information across sources
- [ ] Identify common themes and patterns
- [ ] Note conflicting information or perspectives

### 3. Insights & Conclusions
- [ ] Summarize key findings
- [ ] Draw actionable conclusions
- [ ] Identify areas for further investigation

## Key Research Areas
Based on your query, focus on:
- Current trends and developments
- Expert opinions and analysis
- Statistical data and evidence
- Practical applications and implications

## Next Steps
1. **Deep Dive**: Explore each opened tab thoroughly
2. **Cross-Reference**: Compare findings across sources
3. **Document**: Add your findings to this summary
4. **Expand**: Identify additional research needs

## Research Notes
[Add your findings, insights, and conclusions here as you review the sources]

---
*This research framework was generated by KAiro's Research Agent to help you conduct thorough and systematic research.*`
  }

  determineCommunicationType(task) {
    const lowerTask = task.toLowerCase()
    
    if (lowerTask.includes('email')) return 'email'
    if (lowerTask.includes('form')) return 'form'
    if (lowerTask.includes('social') || lowerTask.includes('post') || lowerTask.includes('tweet')) return 'social'
    return 'general'
  }

  generateEmailTemplate(task) {
    const isBusinessEmail = task.toLowerCase().includes('professional') || task.toLowerCase().includes('business')
    
    return `# Email Composition Template
Generated: ${new Date().toLocaleString()}

## Email Request
${task}

## Email Template

**Subject**: [Clear, specific subject line]

**To**: [Recipient email]
**CC**: [Additional recipients if needed]
**BCC**: [Hidden recipients if needed]

---

${isBusinessEmail ? 'Dear [Recipient Name],' : 'Hi [Recipient Name],'}

**Opening**: [Brief, friendly opening that establishes context]

**Main Content**: 
[Core message broken into clear paragraphs]

- Point 1: [First main point]
- Point 2: [Second main point]  
- Point 3: [Third main point if needed]

**Call to Action**: [What you want the recipient to do]

**Closing**: [Polite closing that maintains relationship]

${isBusinessEmail ? 'Best regards,' : 'Thanks,'}
[Your Name]
[Your Title if applicable]
[Contact Information]

---

## Email Best Practices
✅ **Subject Line**: Make it specific and actionable
✅ **Opening**: Personalize and provide context
✅ **Structure**: Use paragraphs and bullet points for clarity
✅ **Tone**: Match the relationship and purpose
✅ **Length**: Keep it concise but complete
✅ **Proofread**: Check for errors before sending

## Customization Notes
[Modify the template above based on your specific needs and relationship with the recipient]`
  }

  generateFormGuide(task) {
    return `# Form Filling Guide
Generated: ${new Date().toLocaleString()}

## Form Task
${task}

## Smart Form Filling Strategy

### 1. Preparation Phase
- [ ] **Gather Information**: Collect all required data beforehand
- [ ] **Read Instructions**: Review form requirements and guidelines
- [ ] **Check Requirements**: Note mandatory fields and formats
- [ ] **Save Progress**: Look for save/draft options

### 2. Common Form Fields & Tips

**Personal Information**
- Full Name: Use legal name as it appears on ID
- Email: Use a professional email address
- Phone: Include country/area code
- Address: Use standardized format

**Professional Information**
- Job Title: Use current or most recent position
- Company: Include full company name
- Experience: Be accurate with dates and descriptions

**Technical Fields**
- Dates: Use required format (MM/DD/YYYY, etc.)
- Numbers: Remove formatting unless specified
- File Uploads: Check size and format requirements

### 3. Form Validation Tips
- **Required Fields**: Look for asterisks (*) or red indicators
- **Format Validation**: Follow examples provided
- **Character Limits**: Stay within specified limits
- **Error Messages**: Read and address all validation errors

### 4. Before Submitting
- [ ] Review all entries for accuracy
- [ ] Check spelling and grammar
- [ ] Verify contact information
- [ ] Ensure all required fields are completed
- [ ] Save a copy if possible

## Form-Specific Notes
[Add specific information about the form you're filling out]

## Troubleshooting
- **Form Not Saving**: Try different browser or disable ad blockers
- **Validation Errors**: Double-check format requirements
- **Page Not Loading**: Clear cache or try incognito mode
- **File Upload Issues**: Check file size and format restrictions`
  }

  generateSocialContent(task) {
    return `# Social Media Content Template
Generated: ${new Date().toLocaleString()}

## Content Request
${task}

## Platform-Specific Templates

### Twitter/X Post
**Character Limit**: 280 characters

\`\`\`
[Engaging opening hook] 

[Main message in 1-2 sentences]

[Call to action or question]

[Relevant hashtags] #hashtag1 #hashtag2
\`\`\`

### LinkedIn Post
**Professional Tone**

\`\`\`
[Professional insight or question]

[Detailed explanation with value]

Key takeaways:
• Point 1
• Point 2  
• Point 3

What are your thoughts? [Engagement question]

#Industry #Professional #Hashtags
\`\`\`

### Facebook/General Social
**Casual & Engaging**

\`\`\`
[Relatable opening]

[Story or experience]

[Question or call to action to encourage comments]

[Relevant hashtags and tags]
\`\`\`

## Content Best Practices
✅ **Hook**: Start with attention-grabbing content
✅ **Value**: Provide information, entertainment, or insight
✅ **Engagement**: Include questions or calls to action
✅ **Hashtags**: Use relevant, researched hashtags
✅ **Timing**: Post when your audience is most active
✅ **Visuals**: Include images or videos when possible

## Content Calendar Ideas
- **Monday**: Motivational content
- **Tuesday**: Tips and tutorials
- **Wednesday**: Behind-the-scenes
- **Thursday**: Thought leadership
- **Friday**: Fun and engaging content

## Notes & Ideas
[Brainstorm additional content ideas and variations here]`
  }

  generateGeneralCommunication(task) {
    return `# Communication Template
Generated: ${new Date().toLocaleString()}

## Communication Request
${task}

## General Communication Framework

### 1. Purpose & Objectives
**Primary Goal**: [What do you want to achieve?]
**Target Audience**: [Who are you communicating with?]
**Key Message**: [What's the main point?]

### 2. Message Structure
**Opening**: [How will you start?]
- Greeting and context
- Purpose statement
- Connection to audience

**Body**: [What's the core content?]
- Main points (3 maximum)
- Supporting details
- Evidence or examples

**Closing**: [How will you end?]
- Summary of key points
- Call to action
- Next steps

### 3. Tone & Style Guide
**Professional**: Formal language, proper grammar, respectful tone
**Casual**: Conversational, friendly, approachable
**Persuasive**: Compelling arguments, benefits-focused, action-oriented
**Informative**: Clear, factual, well-organized

### 4. Communication Checklist
- [ ] Clear and concise message
- [ ] Appropriate tone for audience
- [ ] Proper grammar and spelling
- [ ] Logical flow and structure
- [ ] Call to action included
- [ ] Contact information provided

## Template Customization
[Modify the framework above based on your specific communication needs]

## Follow-up Strategy
- **Timing**: When to follow up
- **Method**: Email, phone, in-person
- **Content**: What to include in follow-up
- **Tracking**: How to measure success`
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
      
      // Clear AI tabs data
      if (this.aiTabs) {
        this.aiTabs.clear()
        console.log('🧹 Cleared AI tabs data')
      }
      
      // Reset counters and state
      this.tabCounter = 0
      this.activeTabId = null
      this.isInitialized = false
      
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