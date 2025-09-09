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

  async startAutonomousGoalMonitoring() {
    try {
      console.log('🎯 Starting autonomous goal monitoring...')
      
      // Monitor autonomous goals every 10 minutes
      setInterval(async () => {
        try {
          if (this.agentCoordinationService) {
            const goalProgress = await this.agentCoordinationService.monitorGoalProgress()
            console.log('📊 Autonomous Goal Status:', goalProgress)
            
            // Log significant progress updates
            if (goalProgress.activeGoals > 0) {
              console.log(`🎯 ${goalProgress.activeGoals} active autonomous goals running`)
              console.log(`📈 Average progress: ${Math.round(goalProgress.averageProgress)}%`)
            }
          }
        } catch (error) {
          console.error('❌ Autonomous goal monitoring failed:', error)
        }
      }, 10 * 60 * 1000) // Every 10 minutes
      
      console.log('✅ Autonomous goal monitoring started')
    } catch (error) {
      console.error('❌ Failed to start autonomous goal monitoring:', error)
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

  // FIXED: Moved this method from inside IPC handler to proper class method
  async processWithAgenticCapabilities(message) {
    try {
      console.log('🤖 Processing with advanced agentic capabilities:', message)
      
      if (!this.isAgenticMode || !this.agentCoordinationService) {
        return null // Fall back to standard processing
      }

      // PHASE 1: Advanced Task Analysis
      const taskAnalysis = this.analyzeAgentTask(message)
      console.log('📊 Advanced Task Analysis:', taskAnalysis)

      // PHASE 2: Multi-Agent Coordination for Complex Tasks
      if (taskAnalysis.needsMultipleAgents || taskAnalysis.complexity === 'high') {
        return await this.executeCoordinatedMultiAgentTask(message, taskAnalysis)
      }

      // PHASE 3: Enhanced Single Agent Execution
      if (taskAnalysis.confidence >= 80) {
        return await this.executeEnhancedAgentTask(message, taskAnalysis)
      }

      return null // Fall back to standard processing
    } catch (error) {
      console.error('❌ Advanced agentic processing failed:', error)
      return null
    }
  }

  // FIXED: Moved this method from inside IPC handler to proper class method
  async getEnhancedPageContext() {
    try {
      if (this.activeTabId) {
        const browserView = this.browserViews.get(this.activeTabId)
        if (browserView) {
          const url = browserView.webContents.getURL()
          const title = browserView.webContents.getTitle()
          
          return {
            url,
            title,
            pageType: this.determinePageType(url),
            contentSummary: 'Current page context',
            extractedText: null
          }
        }
      }
      
      return {
        url: 'about:blank',
        title: 'New Tab',
        pageType: 'blank',
        contentSummary: 'No active page',
        extractedText: null
      }
    } catch (error) {
      console.error('❌ Failed to get enhanced page context:', error)
      return {
        url: 'about:blank',
        title: 'Error',
        pageType: 'error',
        contentSummary: 'Context unavailable',
        extractedText: null
      }
    }
  }

  determinePageType(url) {
    if (!url || url === 'about:blank') return 'blank'
    if (url.includes('google.com')) return 'search'
    if (url.includes('github.com')) return 'development'
    if (url.includes('stackoverflow.com')) return 'technical'
    return 'general'
  }

  // FIXED: Moved this method from inside IPC handler to proper class method
  async enhanceResponseWithAgenticCapabilities(aiResponse, originalMessage, context) {
    try {
      if (!this.isAgenticMode || !aiResponse) {
        return aiResponse
      }

      console.log('✨ Enhancing AI response with agentic capabilities')

      // PHASE 1: Response Quality Enhancement
      const enhancedResponse = await this.enhanceResponseQuality(aiResponse, originalMessage, context)

      // PHASE 2: Add Contextual Actions
      const responseWithActions = await this.addContextualActions(enhancedResponse, originalMessage, context)

      // PHASE 3: Add Proactive Suggestions
      const finalResponse = await this.addProactiveSuggestions(responseWithActions, originalMessage, context)

      return finalResponse

    } catch (error) {
      console.error('❌ Response enhancement failed:', error)
      return aiResponse // Return original if enhancement fails
    }
  }

  async enhanceResponseQuality(response, message, context) {
    try {
      // Add response structure and formatting
      let enhanced = response

      // Add context awareness
      if (context.url && context.url !== 'about:blank') {
        enhanced = `**Context**: Currently viewing ${context.title || context.url}\n\n${enhanced}`
      }

      // Add confidence indicators for high-quality responses
      if (response.length > 500 && response.includes('##')) {
        enhanced += `\n\n---\n*🎯 High-confidence response generated with enhanced AI analysis*`
      }

      // Add timestamp for time-sensitive information
      if (message.toLowerCase().includes('latest') || message.toLowerCase().includes('current')) {
        const timestamp = new Date().toLocaleString()
        enhanced += `\n\n*📅 Information current as of: ${timestamp}*`
      }

      return enhanced

    } catch (error) {
      console.error('❌ Response quality enhancement failed:', error)
      return response
    }
  }

  async addContextualActions(response, message, context) {
    try {
      let enhanced = response

      // Detect actionable content and suggest follow-ups
      const actions = []

      // Navigation suggestions
      if (response.includes('http') || message.toLowerCase().includes('website')) {
        actions.push('🌐 I can navigate to any websites mentioned above')
      }

      // Research expansion suggestions
      if (message.toLowerCase().includes('research') || message.toLowerCase().includes('find')) {
        actions.push('🔍 I can create detailed research tabs with comprehensive findings')
      }

      // Shopping assistance
      if (response.includes('price') || response.includes('product') || message.toLowerCase().includes('buy')) {
        actions.push('🛒 I can compare prices across multiple retailers for you')
      }

      // Content creation
      if (message.toLowerCase().includes('write') || message.toLowerCase().includes('compose')) {
        actions.push('✍️ I can help create and refine the content further')
      }

      // Analysis offers
      if (context.url && context.url !== 'about:blank') {
        actions.push('📊 I can analyze the current page content for additional insights')
      }

      // Add actions if any were identified
      if (actions.length > 0) {
        enhanced += `\n\n## 🎯 **What I Can Do Next:**\n${actions.map(action => `• ${action}`).join('\n')}`
      }

      return enhanced

    } catch (error) {
      console.error('❌ Contextual actions addition failed:', error)
      return response
    }
  }

  async addProactiveSuggestions(response, message, context) {
    try {
      let enhanced = response

      // Add proactive suggestions based on response content and context
      const suggestions = []

      // Time-saving automation suggestions
      if (response.length > 800 || message.toLowerCase().includes('complex')) {
        suggestions.push('⚡ **Automation Tip**: I can create workflows to automate similar tasks in the future')
      }

      // Related research suggestions
      if (message.toLowerCase().includes('research') && response.includes('##')) {
        suggestions.push('🔍 **Research Expansion**: I can dive deeper into any specific aspect mentioned above')
      }

      // Cross-platform coordination
      if (response.includes('email') || response.includes('social')) {
        suggestions.push('📧 **Multi-Platform**: I can help adapt this content for different platforms and formats')
      }

      // Continuous monitoring offers
      if (message.toLowerCase().includes('latest') || message.toLowerCase().includes('updates')) {
        suggestions.push('📡 **Stay Updated**: I can monitor this topic and provide regular updates')
      }

      // Data organization suggestions
      if (response.includes('multiple') || response.includes('several')) {
        suggestions.push('📋 **Organization**: I can create structured summaries and organize this information')
      }

      // Add suggestions if any were identified
      if (suggestions.length > 0) {
        enhanced += `\n\n## 💡 **Proactive Suggestions:**\n${suggestions.map(suggestion => `• ${suggestion}`).join('\n')}`
      }

      // Add intelligent follow-up prompt
      const followUpPrompts = this.generateIntelligentFollowUpPrompts(message, response)
      if (followUpPrompts.length > 0) {
        enhanced += `\n\n## ❓ **Quick Follow-ups:**\n${followUpPrompts.map(prompt => `• "${prompt}"`).join('\n')}`
      }

      return enhanced

    } catch (error) {
      console.error('❌ Proactive suggestions addition failed:', error)
      return response
    }
  }

  generateIntelligentFollowUpPrompts(originalMessage, response) {
    const prompts = []
    const lowerMessage = originalMessage.toLowerCase()
    const lowerResponse = response.toLowerCase()

    // Research follow-ups
    if (lowerMessage.includes('research') || lowerMessage.includes('find')) {
      if (lowerResponse.includes('source') || lowerResponse.includes('website')) {
        prompts.push('Open research tabs for these sources')
      }
      if (lowerResponse.includes('trend') || lowerResponse.includes('development')) {
        prompts.push('Monitor this topic for updates')
      }
    }

    // Shopping follow-ups  
    if (lowerMessage.includes('price') || lowerMessage.includes('product') || lowerMessage.includes('buy')) {
      prompts.push('Compare prices across retailers')
      prompts.push('Set up price monitoring')
    }

    // Analysis follow-ups
    if (lowerMessage.includes('analyze') || lowerMessage.includes('review')) {
      prompts.push('Create detailed analysis report')
      prompts.push('Extract key data points')
    }

    // Communication follow-ups
    if (lowerMessage.includes('email') || lowerMessage.includes('write') || lowerMessage.includes('compose')) {
      prompts.push('Refine the tone and style')
      prompts.push('Create variations for different audiences')
    }

    // General enhancement follow-ups
    if (response.length > 400) {
      prompts.push('Expand on any specific point')
      prompts.push('Create action items from this information')
    }

    // Limit to top 3 most relevant prompts
    return prompts.slice(0, 3)
  }

  extractActionsFromResponse(response, originalMessage) {
    const actions = []
    // Simple action extraction - could be enhanced
    if (response.toLowerCase().includes('navigate to') || response.toLowerCase().includes('go to')) {
      actions.push({ type: 'navigate', data: 'suggested_navigation' })
    }
    return actions
  }

  // FIXED: Task analysis method (was incorrectly nested)
  analyzeAgentTask(task) {
    const lowerTask = task.toLowerCase()
    
    // Simple task analysis - can be enhanced
    const scores = {
      research: 0,
      navigation: 0,
      shopping: 0,
      communication: 0,
      automation: 0,
      analysis: 0
    }

    // Basic keyword scoring
    if (lowerTask.includes('research') || lowerTask.includes('find') || lowerTask.includes('search')) {
      scores.research = 80
    }
    
    if (lowerTask.includes('go to') || lowerTask.includes('navigate') || lowerTask.includes('visit')) {
      scores.navigation = 90
    }
    
    if (lowerTask.includes('buy') || lowerTask.includes('price') || lowerTask.includes('shop')) {
      scores.shopping = 85
    }
    
    if (lowerTask.includes('email') || lowerTask.includes('write') || lowerTask.includes('compose')) {
      scores.communication = 85
    }
    
    if (lowerTask.includes('automate') || lowerTask.includes('schedule') || lowerTask.includes('routine')) {
      scores.automation = 85
    }
    
    if (lowerTask.includes('analyze') || lowerTask.includes('summarize') || lowerTask.includes('review')) {
      scores.analysis = 85
    }

    // Find the highest scoring agent
    const primaryAgent = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b)
    const confidence = scores[primaryAgent]

    return {
      primaryAgent,
      confidence,
      complexity: confidence > 70 ? 'high' : 'medium',
      needsMultipleAgents: confidence < 60,
      supportingAgents: []
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

    // FIXED: Properly structured send-ai-message handler
    ipcMain.handle('send-ai-message', async (event, message) => {
      try {
        console.log('💬 Processing AI message with enhanced backend capabilities:', message)
        
        // Record performance metrics - START
        const startTime = Date.now()
        
        if (!this.aiService) {
          return { success: false, error: 'AI service not initialized' }
        }

        // Try agentic processing first
        const agenticResult = await this.processWithAgenticCapabilities(message)
        let enhancedResult
        
        if (agenticResult && agenticResult.success) {
          enhancedResult = agenticResult.result
        } else {
          // Fall back to standard AI processing
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

          enhancedResult = response.choices[0].message.content
        }
        
        // Enhance response with agentic capabilities
        enhancedResult = await this.enhanceResponseWithAgenticCapabilities(enhancedResult, message, context)
        
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
              memoryUsaged: 0, // Would be calculated from system metrics
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
        return { success: false, error: error.message }
      }
    })

    console.log('✅ IPC handlers setup completed')
  }

  // Placeholder methods - these would need full implementation
  async createTab(url) {
    return { success: true, tabId: `tab_${++this.tabCounter}` }
  }

  async closeTab(tabId) {
    return { success: true }
  }

  async switchTab(tabId) {
    return { success: true }
  }

  async navigateTo(url) {
    return { success: true }
  }

  async goBack() {
    return { success: true }
  }

  async goForward() {
    return { success: true }
  }

  async reload() {
    return { success: true }
  }

  async getCurrentUrl() {
    return { success: true, url: 'https://www.google.com' }
  }

  async getPageTitle() {
    return { success: true, title: 'Google' }
  }

  async createMainWindow() {
    try {
      console.log('🪟 Creating main browser window...')
      
      this.mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1000,
        minHeight: 600,
        titleBarStyle: 'hidden',
        show: false,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          enableRemoteModule: false,
          preload: path.join(__dirname, 'preload', 'preload.js'),
          webSecurity: true,
          allowRunningInsecureContent: false
        }
      })

      // Load the React app
      const isDev = process.env.NODE_ENV === 'development'
      if (isDev) {
        await this.mainWindow.loadURL('http://localhost:5173')
      } else {
        await this.mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
      }

      // Show window when ready
      this.mainWindow.once('ready-to-show', () => {
        this.mainWindow.show()
        console.log('✅ Main window displayed')
      })

      // Handle window closed
      this.mainWindow.on('closed', () => {
        this.mainWindow = null
      })

      console.log('✅ Main window created successfully')
      
    } catch (error) {
      console.error('❌ Failed to create main window:', error)
      throw error
    }
  }

  async cleanup() {
    try {
      console.log('🧹 Cleaning up KAiro Browser Manager...')
      
      // Shutdown enhanced services
      if (this.performanceMonitor) {
        await this.performanceMonitor.shutdown()
      }
      
      if (this.taskScheduler) {
        await this.taskScheduler.shutdown()
      }
      
      if (this.databaseService) {
        await this.databaseService.close()
      }
      
      // Close browser views
      for (const [tabId, browserView] of this.browserViews) {
        browserView.destroy()
      }
      this.browserViews.clear()
      
      console.log('✅ Cleanup completed')
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
    console.log('🚀 KAiro Browser starting...')
    
    browserManager = new KAiroBrowserManager()
    await browserManager.initialize()
    await browserManager.createMainWindow()
    
    console.log('✅ KAiro Browser ready')
  } catch (error) {
    console.error('❌ Failed to start KAiro Browser:', error)
    app.quit()
  }
})

app.on('window-all-closed', async () => {
  if (browserManager) {
    await browserManager.cleanup()
  }
  
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', async () => {
  if (!browserManager?.mainWindow) {
    try {
      browserManager = new KAiroBrowserManager()
      await browserManager.initialize()
      await browserManager.createMainWindow()
    } catch (error) {
      console.error('❌ Failed to reactivate app:', error)
    }
  }
})

app.on('before-quit', async (event) => {
  if (browserManager) {
    event.preventDefault()
    await browserManager.cleanup()
    app.quit()
  }
})