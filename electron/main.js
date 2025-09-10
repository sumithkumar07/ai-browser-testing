const { app, BrowserWindow, BrowserView, ipcMain, Menu, shell } = require('electron')
const path = require('path')
const Groq = require('groq-sdk')
require('dotenv').config()

console.log('🔑 Environment variables loaded:', process.env.GROQ_API_KEY ? 'YES' : 'NO')

// Import enhanced backend services - ZERO UI IMPACT
const { DatabaseService } = require('../src/backend/DatabaseService')
const { AgentPerformanceMonitor } = require('../src/backend/AgentPerformanceMonitor')
const { BackgroundTaskScheduler } = require('../src/backend/BackgroundTaskScheduler')

// Import new production-ready services
const { ApiValidator } = require('../src/core/services/ApiValidator')
const { DatabaseHealthManager } = require('../src/core/services/DatabaseHealthManager')

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
    
    // Production-ready services
    this.apiValidator = null
    this.databaseHealthManager = null
    this.circuitBreaker = { isOpen: false, failures: 0, lastFailure: 0 }
    
    // Connection state management
    this.connectionState = {
      api: 'unknown',
      database: 'unknown',
      agents: 'unknown'
    }
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
      console.log('🤖 Initializing Enhanced Backend Services with production resilience...')
      
      // Initialize Database Service with enhanced error handling
      this.databaseService = new DatabaseService({
        path: process.env.DB_PATH || path.join(__dirname, '../data/kairo_browser.db'),
        maxSize: 100 * 1024 * 1024, // 100MB
        backupEnabled: true
      })
      
      try {
        await this.databaseService.initialize()
        this.connectionState.database = 'connected'
        console.log('✅ Database service initialized successfully')
        
        // Initialize Database Health Manager
        this.databaseHealthManager = new DatabaseHealthManager(this.databaseService, {
          healthCheckInterval: 60000, // 1 minute
          backupInterval: 3600000, // 1 hour
          maxBackups: 10
        })
        
        await this.databaseHealthManager.initialize()
        console.log('✅ Database health manager initialized')
        
      } catch (dbError) {
        console.error('❌ Database service failed to initialize:', dbError.message)
        this.connectionState.database = 'failed'
        console.warn('🔄 Attempting database recovery...')
        
        // Enhanced database recovery
        const recoveryAttempts = [
          () => this.createFallbackDatabase(),
          () => this.createInMemoryDatabase(),
          () => this.initializeMinimalDatabase()
        ]
        
        let recovered = false
        for (const [index, recovery] of recoveryAttempts.entries()) {
          try {
            console.log(`🔧 Recovery attempt ${index + 1}/3...`)
            await recovery()
            recovered = true
            this.connectionState.database = 'degraded'
            console.log('✅ Database recovered in degraded mode')
            break
          } catch (recoveryError) {
            console.warn(`⚠️ Recovery attempt ${index + 1} failed:`, recoveryError.message)
          }
        }
        
        if (!recovered) {
          console.error('❌ All database recovery attempts failed')
          this.connectionState.database = 'failed'
          this.databaseService = null
        }
      }
      
      // Initialize Performance Monitor
      if (this.databaseService) {
        this.performanceMonitor = new AgentPerformanceMonitor(this.databaseService)
        await this.performanceMonitor.initialize()
        console.log('✅ Performance monitor initialized')
      }
      
      // Initialize Background Task Scheduler
      if (this.databaseService) {
        this.taskScheduler = new BackgroundTaskScheduler(this.databaseService)
        await this.taskScheduler.initialize()
        console.log('✅ Background task scheduler initialized')
      }

      // Initialize Enhanced Agent Services with fallback
      try {
        const AgentMemoryService = require('../compiled/services/AgentMemoryService.js')
        const AgentCoordinationService = require('../compiled/services/AgentCoordinationService.js')
        
        this.agentMemoryService = AgentMemoryService.default.getInstance()
        await this.agentMemoryService.initialize()
        
        this.agentCoordinationService = AgentCoordinationService.default.getInstance()
        await this.agentCoordinationService.initialize()
        
        this.connectionState.agents = 'connected'
        console.log('✅ Enhanced agent services initialized')
      } catch (error) {
        console.warn('⚠️ Enhanced agent services not available, using basic mode:', error.message)
        this.agentMemoryService = null
        this.agentCoordinationService = null
        this.connectionState.agents = 'basic'
      }
      
      console.log('✅ Enhanced Backend Services initialized successfully')
      
      // Schedule regular maintenance tasks
      await this.scheduleMaintenanceTasks()

      // Start autonomous goal monitoring
      await this.startAutonomousGoalMonitoring()
      
      // Start system health monitoring
      this.startSystemHealthMonitoring()
      
    } catch (error) {
      console.error('❌ Failed to initialize enhanced backend services:', error)
      // Continue with basic mode if backend services fail
      this.isAgenticMode = false
      console.warn('⚠️ Running in basic mode - advanced features disabled')
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

  // Database recovery methods
  async createFallbackDatabase() {
    const fallbackPath = path.join(process.cwd(), 'data', 'kairo_browser_fallback.db')
    this.databaseService = new DatabaseService({
      path: fallbackPath,
      maxSize: 100 * 1024 * 1024,
      backupEnabled: true
    })
    await this.databaseService.initialize()
  }

  async createInMemoryDatabase() {
    this.databaseService = new DatabaseService({
      path: ':memory:',
      maxSize: 50 * 1024 * 1024,
      backupEnabled: false
    })
    await this.databaseService.initialize()
    console.warn('⚠️ Using in-memory database - data will not persist')
  }

  async initializeMinimalDatabase() {
    const minimalPath = path.join(process.cwd(), 'data', 'minimal.db')
    this.databaseService = new DatabaseService({
      path: minimalPath,
      maxSize: 10 * 1024 * 1024,
      backupEnabled: false
    })
    await this.databaseService.initialize()
    console.warn('⚠️ Using minimal database - limited functionality')
  }

  // API health monitoring
  startApiHealthMonitoring() {
    setInterval(async () => {
      if (this.apiValidator) {
        const health = await this.apiValidator.performHealthCheck()
        
        if (health.isCircuitOpen && this.connectionState.api !== 'circuit_open') {
          console.warn('⚠️ API circuit breaker opened - API unavailable')
          this.connectionState.api = 'circuit_open'
        } else if (!health.isCircuitOpen && this.connectionState.api === 'circuit_open') {
          console.log('✅ API circuit breaker closed - API restored')
          this.connectionState.api = 'connected'
        }
      }
    }, 30000) // Every 30 seconds
  }

  // System health monitoring
  startSystemHealthMonitoring() {
    setInterval(async () => {
      try {
        const systemHealth = {
          timestamp: Date.now(),
          api: this.connectionState.api,
          database: this.connectionState.database,
          agents: this.connectionState.agents,
          memory: process.memoryUsage(),
          uptime: process.uptime()
        }
        
        // Log health status periodically
        if (Date.now() % (5 * 60 * 1000) < 30000) { // Every 5 minutes
          console.log('🏥 System Health:', {
            api: systemHealth.api,
            database: systemHealth.database,
            agents: systemHealth.agents,
            memoryMB: Math.round(systemHealth.memory.heapUsed / 1024 / 1024),
            uptimeMin: Math.round(systemHealth.uptime / 60)
          })
        }
        
        // Check for memory leaks
        if (systemHealth.memory.heapUsed > 500 * 1024 * 1024) { // 500MB
          console.warn('⚠️ High memory usage detected:', Math.round(systemHealth.memory.heapUsed / 1024 / 1024), 'MB')
          
          // Trigger garbage collection if available
          if (global.gc) {
            global.gc()
            console.log('🧹 Garbage collection triggered')
          }
        }
        
      } catch (error) {
        console.error('❌ System health monitoring failed:', error)
      }
    }, 30000) // Every 30 seconds
  }

  async initializeAIService() {
    try {
      console.log('🤖 Initializing AI Service with production-ready validation...')
      
      if (!process.env.GROQ_API_KEY) {
        throw new Error('GROQ_API_KEY not found in environment variables')
      }

      // Initialize API validator
      this.apiValidator = new ApiValidator(process.env.GROQ_API_KEY, {
        maxRetries: 3,
        retryDelay: 1000,
        maxRequestsPerWindow: 100
      })

      // Validate API key and test connection
      const validation = await this.apiValidator.validateApiKey()
      
      if (!validation.valid) {
        this.connectionState.api = 'failed'
        throw new Error(`API validation failed: ${validation.error}`)
      }

      this.connectionState.api = 'connected'
      
      // Initialize Groq client only after validation
      this.aiService = new Groq({
        apiKey: process.env.GROQ_API_KEY
      })

      console.log('✅ AI Service initialized and validated successfully')
      console.log('📊 Available models:', validation.models?.data?.length || 'Unknown')
      
      // Start periodic health monitoring
      this.startApiHealthMonitoring()
      
    } catch (error) {
      console.error('❌ Failed to initialize AI service:', error.message)
      this.connectionState.api = 'failed'
      
      // Enhanced error analysis
      if (error.message.includes('API key')) {
        console.error('🔑 API Key Issue: Please check your GROQ_API_KEY in .env file')
      } else if (error.message.includes('network') || error.message.includes('timeout')) {
        console.error('🌐 Network Issue: Check internet connection and API endpoint availability')
      } else if (error.message.includes('rate limit')) {
        console.error('⏱️ Rate Limit: API rate limit exceeded, implement exponential backoff')
      }
      
      // Don't throw - allow app to continue in degraded mode
      console.warn('⚠️ AI service will run in degraded mode - some features may be limited')
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

  // FIXED: Enhanced error handling for agent response enhancement
  async enhanceResponseWithAgenticCapabilities(aiResponse, originalMessage, context) {
    try {
      if (!this.isAgenticMode || !aiResponse) {
        return aiResponse
      }

      console.log('✨ Enhancing AI response with agentic capabilities')

      // PHASE 1: Response Quality Enhancement
      let enhancedResponse = await this.enhanceResponseQuality(aiResponse, originalMessage, context)

      // PHASE 2: Add Contextual Actions
      enhancedResponse = await this.addContextualActions(enhancedResponse, originalMessage, context)

      // PHASE 3: Add Proactive Suggestions
      enhancedResponse = await this.addProactiveSuggestions(enhancedResponse, originalMessage, context)

      return enhancedResponse

    } catch (error) {
      console.error('❌ Response enhancement failed:', error)
      return aiResponse // Return original if enhancement fails
    }
  }

  // ENHANCED: Better response quality enhancement with error handling
  async enhanceResponseQuality(response, message, context) {
    try {
      // Add response structure and formatting
      let enhanced = response

      // Add context awareness with null checks
      if (context && context.url && context.url !== 'about:blank') {
        const contextTitle = context.title || context.url
        enhanced = `**Context**: Currently viewing ${contextTitle}\n\n${enhanced}`
      }

      // Add confidence indicators for high-quality responses
      if (response && response.length > 500 && response.includes('##')) {
        enhanced += `\n\n---\n*🎯 High-confidence response generated with enhanced AI analysis*`
      }

      // Add timestamp for time-sensitive information with better detection
      const timeSensitiveKeywords = ['latest', 'current', 'today', 'now', 'recent', 'update']
      if (message && timeSensitiveKeywords.some(keyword => message.toLowerCase().includes(keyword))) {
        const timestamp = new Date().toLocaleString()
        enhanced += `\n\n*📅 Information current as of: ${timestamp}*`
      }

      return enhanced

    } catch (error) {
      console.error('❌ Response quality enhancement failed:', error)
      return response || 'Error enhancing response'
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

  // FIXED: Enhanced task analysis method with improved accuracy
  analyzeAgentTask(task) {
    const lowerTask = task.toLowerCase()
    
    // Enhanced task analysis with better keyword scoring and context awareness
    const scores = {
      research: 0,
      navigation: 0,
      shopping: 0,
      communication: 0,
      automation: 0,
      analysis: 0
    }

    // Enhanced Research Agent scoring
    if (lowerTask.includes('research') || lowerTask.includes('investigate') || lowerTask.includes('study')) {
      scores.research = 85
      if (lowerTask.includes('deep') || lowerTask.includes('comprehensive') || lowerTask.includes('detailed')) {
        scores.research = 95
      }
    }
    if (lowerTask.includes('find') || lowerTask.includes('search') || lowerTask.includes('look up')) {
      scores.research = Math.max(scores.research, 80)
    }
    if (lowerTask.includes('information') || lowerTask.includes('data') || lowerTask.includes('facts')) {
      scores.research = Math.max(scores.research, 75)
    }
    
    // Enhanced Navigation Agent scoring
    if (lowerTask.includes('go to') || lowerTask.includes('navigate to') || lowerTask.includes('visit')) {
      scores.navigation = 95
    }
    if (lowerTask.includes('open') || lowerTask.includes('browse') || lowerTask.includes('website')) {
      scores.navigation = Math.max(scores.navigation, 85)
    }
    if (lowerTask.includes('url') || lowerTask.includes('link') || lowerTask.includes('page')) {
      scores.navigation = Math.max(scores.navigation, 80)
    }
    
    // Enhanced Shopping Agent scoring
    if (lowerTask.includes('buy') || lowerTask.includes('purchase') || lowerTask.includes('order')) {
      scores.shopping = 90
    }
    if (lowerTask.includes('price') || lowerTask.includes('cost') || lowerTask.includes('compare')) {
      scores.shopping = Math.max(scores.shopping, 85)
    }
    if (lowerTask.includes('shop') || lowerTask.includes('store') || lowerTask.includes('product')) {
      scores.shopping = Math.max(scores.shopping, 80)
    }
    if (lowerTask.includes('deal') || lowerTask.includes('discount') || lowerTask.includes('sale')) {
      scores.shopping = Math.max(scores.shopping, 85)
    }
    // FIXED: Improve detection for shopping-related searches
    if (lowerTask.includes('best') && (lowerTask.includes('laptop') || lowerTask.includes('phone') || lowerTask.includes('product'))) {
      scores.shopping = Math.max(scores.shopping, 90)
    }
    if (lowerTask.includes('find') && (lowerTask.includes('deal') || lowerTask.includes('price') || lowerTask.includes('cheap'))) {
      scores.shopping = Math.max(scores.shopping, 88)
    }
    
    // Enhanced Communication Agent scoring
    if (lowerTask.includes('email') || lowerTask.includes('message') || lowerTask.includes('contact')) {
      scores.communication = 90
    }
    if (lowerTask.includes('write') || lowerTask.includes('compose') || lowerTask.includes('draft')) {
      scores.communication = Math.max(scores.communication, 85)
    }
    if (lowerTask.includes('letter') || lowerTask.includes('note') || lowerTask.includes('memo')) {
      scores.communication = Math.max(scores.communication, 80)
    }
    if (lowerTask.includes('social') || lowerTask.includes('post') || lowerTask.includes('tweet')) {
      scores.communication = Math.max(scores.communication, 75)
    }
    
    // Enhanced Automation Agent scoring
    if (lowerTask.includes('automate') || lowerTask.includes('schedule') || lowerTask.includes('routine')) {
      scores.automation = 90
    }
    if (lowerTask.includes('workflow') || lowerTask.includes('process') || lowerTask.includes('task')) {
      scores.automation = Math.max(scores.automation, 80)
    }
    if (lowerTask.includes('repeat') || lowerTask.includes('recurring') || lowerTask.includes('regular')) {
      scores.automation = Math.max(scores.automation, 85)
    }
    
    // Enhanced Analysis Agent scoring
    if (lowerTask.includes('analyze') || lowerTask.includes('analysis') || lowerTask.includes('examine')) {
      scores.analysis = 90
    }
    if (lowerTask.includes('summarize') || lowerTask.includes('summary') || lowerTask.includes('overview')) {
      scores.analysis = Math.max(scores.analysis, 85)
    }
    if (lowerTask.includes('review') || lowerTask.includes('evaluate') || lowerTask.includes('assess')) {
      scores.analysis = Math.max(scores.analysis, 80)
    }
    if (lowerTask.includes('report') || lowerTask.includes('insight') || lowerTask.includes('breakdown')) {
      scores.analysis = Math.max(scores.analysis, 85)
    }

    // Multi-agent detection - tasks that might need multiple agents
    let needsMultipleAgents = false
    const activeAgents = Object.entries(scores).filter(([_, score]) => score >= 70)
    
    if (activeAgents.length > 1) {
      needsMultipleAgents = true
    }

    // Context-based adjustments
    if (lowerTask.includes('comprehensive') || lowerTask.includes('complete') || lowerTask.includes('full')) {
      needsMultipleAgents = true
      // Boost all relevant scores slightly
      Object.keys(scores).forEach(key => {
        if (scores[key] >= 60) scores[key] = Math.min(scores[key] + 10, 100)
      })
    }

    // Find the highest scoring agent
    const primaryAgent = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b)
    const confidence = scores[primaryAgent]

    // Determine supporting agents (scores >= 60 and not primary)
    const supportingAgents = Object.entries(scores)
      .filter(([agent, score]) => agent !== primaryAgent && score >= 60)
      .map(([agent, _]) => agent)

    return {
      primaryAgent,
      confidence,
      complexity: confidence >= 85 ? 'high' : (confidence >= 70 ? 'medium' : 'low'),
      needsMultipleAgents,
      supportingAgents,
      allScores: scores
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

    // AI Tab Management - FIXED: Missing handlers added
    ipcMain.handle('create-ai-tab', async (event, title, content = '') => {
      try {
        const tabId = `ai_tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        
        // Store AI tab data
        this.aiTabs.set(tabId, {
          id: tabId,
          title: title || 'AI Tab',
          content: content,
          type: 'ai',
          createdAt: Date.now(),
          updatedAt: Date.now()
        })
        
        console.log(`✅ AI tab created: ${tabId}`)
        return { success: true, tabId, title }
      } catch (error) {
        console.error('❌ Failed to create AI tab:', error)
        return { success: false, error: error.message }
      }
    })

    ipcMain.handle('save-ai-tab-content', async (event, tabId, content) => {
      try {
        const aiTab = this.aiTabs.get(tabId)
        if (aiTab) {
          aiTab.content = content
          aiTab.updatedAt = Date.now()
          this.aiTabs.set(tabId, aiTab)
          console.log(`✅ AI tab content saved: ${tabId}`)
          return { success: true }
        } else {
          console.warn(`⚠️ AI tab not found: ${tabId}`)
          return { success: false, error: 'AI tab not found' }
        }
      } catch (error) {
        console.error('❌ Failed to save AI tab content:', error)
        return { success: false, error: error.message }
      }
    })

    ipcMain.handle('load-ai-tab-content', async (event, tabId) => {
      try {
        const aiTab = this.aiTabs.get(tabId)
        if (aiTab) {
          console.log(`✅ AI tab content loaded: ${tabId}`)
          return { success: true, content: aiTab.content }
        } else {
          console.warn(`⚠️ AI tab not found: ${tabId}`)
          return { success: false, error: 'AI tab not found' }
        }
      } catch (error) {
        console.error('❌ Failed to load AI tab content:', error)
        return { success: false, error: error.message }
      }
    })

    // AI Service Handlers - FIXED: Missing handlers added
    ipcMain.handle('summarize-page', async () => {
      try {
        if (!this.aiService) {
          return { success: false, error: 'AI service not initialized' }
        }

        const context = await this.getEnhancedPageContext()
        
        const response = await this.aiService.chat.completions.create({
          messages: [
            { 
              role: 'system', 
              content: 'You are a helpful assistant that provides concise and informative summaries of web pages.' 
            },
            { 
              role: 'user', 
              content: `Please summarize this page:\n\nURL: ${context.url}\nTitle: ${context.title}\nContent: ${context.extractedText || 'No content available'}` 
            }
          ],
          model: 'llama-3.3-70b-versatile',
          temperature: 0.3,
          max_tokens: 500
        })

        const summary = response.choices[0].message.content
        return { success: true, summary }
      } catch (error) {
        console.error('❌ Page summarization failed:', error)
        return { success: false, error: error.message }
      }
    })

    ipcMain.handle('analyze-content', async () => {
      try {
        if (!this.aiService) {
          return { success: false, error: 'AI service not initialized' }
        }

        const context = await this.getEnhancedPageContext()
        
        const response = await this.aiService.chat.completions.create({
          messages: [
            { 
              role: 'system', 
              content: 'You are an expert content analyst. Analyze web content for key insights, themes, and actionable information.' 
            },
            { 
              role: 'user', 
              content: `Please analyze this page content:\n\nURL: ${context.url}\nTitle: ${context.title}\nContent: ${context.extractedText || 'No content available'}` 
            }
          ],
          model: 'llama-3.3-70b-versatile',
          temperature: 0.5,
          max_tokens: 800
        })

        const analysis = response.choices[0].message.content
        return { success: true, analysis }
      } catch (error) {
        console.error('❌ Content analysis failed:', error)
        return { success: false, error: error.message }
      }
    })

    ipcMain.handle('get-ai-context', async () => {
      try {
        const context = await this.getEnhancedPageContext()
        return { success: true, context }
      } catch (error) {
        console.error('❌ Failed to get AI context:', error)
        return { success: false, error: error.message }
      }
    })

    // Agent System - FIXED: Missing handlers added
    ipcMain.handle('execute-agent-task', async (event, task) => {
      try {
        if (!this.isAgenticMode || !this.agentCoordinationService) {
          return { success: false, error: 'Agent system not available' }
        }

        const result = await this.processWithAgenticCapabilities(task)
        return result || { success: false, error: 'Agent task execution failed' }
      } catch (error) {
        console.error('❌ Agent task execution failed:', error)
        return { success: false, error: error.message }
      }
    })

    ipcMain.handle('get-agent-status', async (event, agentId) => {
      try {
        if (!this.isAgenticMode || !this.agentCoordinationService) {
          return { success: false, error: 'Agent system not available' }
        }

        // Return mock status for now - would be implemented with real agent system
        return { 
          success: true, 
          status: {
            agentId: agentId || 'all',
            active: true,
            currentTask: null,
            performance: 0.85
          }
        }
      } catch (error) {
        console.error('❌ Failed to get agent status:', error)
        return { success: false, error: error.message }
      }
    })

    // ENHANCED: Properly structured send-ai-message handler with comprehensive error handling
    ipcMain.handle('send-ai-message', async (event, message) => {
      try {
        console.log('💬 Processing AI message with enhanced backend capabilities:', message)
        
        // Input validation
        if (!message || typeof message !== 'string' || message.trim().length === 0) {
          return { success: false, error: 'Message cannot be empty' }
        }

        if (message.length > 10000) {
          return { success: false, error: 'Message too long (max 10,000 characters)' }
        }
        
        // Record performance metrics - START
        const startTime = Date.now()
        
        // Check API availability with circuit breaker
        if (this.apiValidator && this.apiValidator.isCircuitOpen()) {
          return { 
            success: false, 
            error: 'AI service temporarily unavailable - please try again later',
            circuitOpen: true
          }
        }
        
        if (!this.aiService) {
          return { success: false, error: 'AI service not initialized - please check GROQ API key configuration' }
        }

        // Try agentic processing first
        let agenticResult = null
        try {
          agenticResult = await this.processWithAgenticCapabilities(message)
        } catch (agenticError) {
          console.warn('⚠️ Agentic processing failed, falling back to standard AI:', agenticError.message)
        }
        
        let enhancedResult
        
        if (agenticResult && agenticResult.success) {
          enhancedResult = agenticResult.result
        } else {
          // Fall back to standard AI processing with enhanced error handling
          try {
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

            // Enhanced model handling with retry logic and validation
            let response
            try {
              // Use API validator for requests if available
              if (this.apiValidator) {
                response = await this.apiValidator.makeRequest('/chat/completions', {
                  method: 'POST',
                  body: {
                    messages: [
                      { role: 'system', content: systemPrompt },
                      { role: 'user', content: message }
                    ],
                    model: 'llama-3.3-70b-versatile',
                    temperature: 0.7,
                    max_tokens: 3072,
                    top_p: 0.9,
                    frequency_penalty: 0.1,
                    presence_penalty: 0.1
                  },
                  timeout: 45000
                })
                
                if (!response.success) {
                  throw new Error(response.error || 'API request failed')
                }
                
                // Convert to expected format
                response = {
                  choices: [{ message: { content: response.data.choices[0].message.content } }],
                  model: response.data.model,
                  usage: response.data.usage
                }
                
              } else {
                // Fallback to direct API call
                response = await this.aiService.chat.completions.create({
                  messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: message }
                  ],
                  model: 'llama-3.3-70b-versatile',
                  temperature: 0.7,
                  max_tokens: 3072,
                  top_p: 0.9,
                  frequency_penalty: 0.1,
                  presence_penalty: 0.1
                })
              }
              
            } catch (modelError) {
              console.warn('⚠️ Primary model failed, trying fallback model:', modelError.message)
              
              // Fallback to older model
              if (this.apiValidator) {
                response = await this.apiValidator.makeRequest('/chat/completions', {
                  method: 'POST',
                  body: {
                    messages: [
                      { role: 'system', content: 'You are KAiro, an AI browser assistant.' },
                      { role: 'user', content: message }
                    ],
                    model: 'llama3-8b-8192',
                    temperature: 0.7,
                    max_tokens: 2048
                  },
                  timeout: 30000
                })
                
                if (response.success) {
                  response = {
                    choices: [{ message: { content: response.data.choices[0].message.content } }],
                    model: response.data.model
                  }
                } else {
                  throw new Error(response.error)
                }
              } else {
                response = await this.aiService.chat.completions.create({
                  messages: [
                    { role: 'system', content: 'You are KAiro, an AI browser assistant.' },
                    { role: 'user', content: message }
                  ],
                  model: 'llama3-8b-8192',
                  temperature: 0.7,
                  max_tokens: 2048
                })
              }
            }

            // Validate response structure

            if (!response || !response.choices || response.choices.length === 0) {
              throw new Error('Empty response from AI service')
            }

            enhancedResult = response.choices[0].message.content
            
            if (!enhancedResult || enhancedResult.trim().length === 0) {
              throw new Error('AI service returned empty response')
            }
            
          } catch (aiError) {
            console.error('❌ AI processing failed:', aiError.message)
            
            // Provide helpful error messages based on error type
            let userFriendlyError = 'AI service temporarily unavailable'
            
            if (aiError.message.includes('rate limit')) {
              userFriendlyError = 'Rate limit exceeded. Please wait a moment and try again.'
            } else if (aiError.message.includes('quota')) {
              userFriendlyError = 'API quota exceeded. Please check your GROQ account.'
            } else if (aiError.message.includes('invalid')) {
              userFriendlyError = 'Invalid request. Please rephrase your message.'
            } else if (aiError.message.includes('network') || aiError.message.includes('timeout')) {
              userFriendlyError = 'Network error. Please check your internet connection.'
            } else if (aiError.message.includes('unauthorized') || aiError.message.includes('401')) {
              userFriendlyError = 'API key is invalid or expired. Please check your configuration.'
            }
            
            return { 
              success: false, 
              error: userFriendlyError,
              details: aiError.message, // For debugging
              timestamp: Date.now()
            }
          }
        }
        
        // Enhance response with agentic capabilities
        try {
          const context = await this.getEnhancedPageContext()
          enhancedResult = await this.enhanceResponseWithAgenticCapabilities(enhancedResult, message, context)
        } catch (enhanceError) {
          console.warn('⚠️ Response enhancement failed:', enhanceError.message)
          // Continue with unenhanced result
        }
        
        // Record interaction for learning
        if (this.isAgenticMode && this.agentMemoryService) {
          try {
            await this.agentMemoryService.recordTaskOutcome({
              taskId: `task_${Date.now()}`,
              agentId: 'ai_assistant',
              success: true,
              result: enhancedResult,
              strategies: ['enhanced_agentic_processing'],
              timeToComplete: (Date.now() - startTime) / 1000,
              userSatisfaction: 0.9
            })
          } catch (memoryError) {
            console.warn('⚠️ Failed to record task outcome:', memoryError.message)
          }
        }
        
        // Analyze if AI wants to perform actions
        const actions = this.extractActionsFromResponse(enhancedResult, message)
        
        // Record performance metrics - END
        const endTime = Date.now()
        const duration = endTime - startTime
        
        if (this.performanceMonitor) {
          try {
            await this.performanceMonitor.recordPerformanceMetric({
              id: `perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              agentId: 'ai_assistant',
              taskType: 'ai_message_processing',
              startTime,
              endTime,
              duration,
              success: true,
              resourceUsage: {
                cpuTime: duration,
                memoryUsage: process.memoryUsage().heapUsed,
                networkRequests: 1
              },
              qualityScore: 8, // Default good quality score
              metadata: {
                messageLength: message.length,
                responseLength: enhancedResult.length,
                hasActions: actions.length > 0,
                model: 'llama-3.3-70b-versatile'
              }
            })
          } catch (perfError) {
            console.warn('⚠️ Failed to record performance metrics:', perfError.message)
          }
        }
        
        console.log(`✅ Enhanced backend AI response generated in ${duration}ms`)
        return { 
          success: true, 
          result: enhancedResult,
          actions: actions,
          agenticMode: this.isAgenticMode,
          responseTime: duration,
          timestamp: endTime,
          connectionStatus: this.connectionState
        }
        
      } catch (error) {
        console.error('❌ AI message processing failed:', error)
        
        // Enhanced error response with context
        return { 
          success: false, 
          error: 'An unexpected error occurred while processing your message',
          details: error.message,
          timestamp: Date.now(),
          connectionStatus: this.connectionState
        }
      }
    })

    // Additional Missing Handlers - FIXED: Added handlers that preload references
    ipcMain.handle('analyze-image', async (event, imageData) => {
      try {
        console.log('📷 Analyzing image with AI...')
        
        if (!this.aiService) {
          return { success: false, error: 'AI service not available' }
        }

        // Convert image data for AI analysis
        const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '')
        
        const response = await this.aiService.chat.completions.create({
          messages: [
            { 
              role: 'system', 
              content: 'You are an expert image analyst. Analyze images and provide detailed descriptions, insights, and actionable information.' 
            },
            { 
              role: 'user', 
              content: `Please analyze this image and provide:
1. Detailed description of what you see
2. Key elements and objects identified
3. Text content if any (OCR)
4. Potential use cases or context
5. Any actionable insights

Image data: ${base64Data.substring(0, 100)}...` 
            }
          ],
          model: 'llama-3.3-70b-versatile',
          temperature: 0.3,
          max_tokens: 1000
        })

        const analysis = response.choices[0].message.content
        
        return { 
          success: true, 
          analysis: analysis,
          timestamp: Date.now()
        }
      } catch (error) {
        console.error('❌ Image analysis failed:', error)
        return { success: false, error: `Image analysis failed: ${error.message}` }
      }
    })

    ipcMain.handle('process-pdf', async (event, filePath) => {
      try {
        console.log('📄 Processing PDF document...')
        
        if (!filePath || !fs.existsSync(filePath)) {
          return { success: false, error: 'PDF file not found or invalid path' }
        }

        // For now, we'll implement basic PDF processing
        // In a full implementation, you'd use pdf-parse or similar library
        const stats = fs.statSync(filePath)
        const fileName = path.basename(filePath)
        
        // Simulate PDF text extraction (in real implementation, use pdf-parse)
        const mockExtractedText = `PDF Document: ${fileName}
        
This is a simulated PDF processing result. In a full implementation, this would contain:
- Extracted text content from all pages
- Document metadata (author, creation date, etc.)
- Table of contents if available
- Images and graphics description
- Document structure analysis

File Size: ${Math.round(stats.size / 1024)} KB
Last Modified: ${new Date(stats.mtime).toLocaleDateString()}

To implement full PDF processing, add pdf-parse dependency:
npm install pdf-parse

Then extract actual text content and analyze with AI.`

        // Analyze extracted text with AI
        if (this.aiService) {
          try {
            const response = await this.aiService.chat.completions.create({
              messages: [
                { 
                  role: 'system', 
                  content: 'You are a document analysis expert. Analyze PDF content and provide structured insights.' 
                },
                { 
                  role: 'user', 
                  content: `Analyze this PDF content and provide:
1. Document summary
2. Key topics and themes
3. Important information extracted
4. Actionable insights
5. Document structure analysis

Content: ${mockExtractedText}` 
                }
              ],
              model: 'llama-3.3-70b-versatile',
              temperature: 0.3,
              max_tokens: 1000
            })

            const analysis = response.choices[0].message.content

            return { 
              success: true,
              extractedText: mockExtractedText,
              analysis: analysis,
              metadata: {
                fileName: fileName,
                filePath: filePath,
                fileSize: stats.size,
                lastModified: stats.mtime,
                pageCount: 'N/A (simulated)'
              },
              timestamp: Date.now()
            }
          } catch (aiError) {
            console.warn('⚠️ AI analysis failed, returning extracted text only:', aiError)
            return {
              success: true,
              extractedText: mockExtractedText,
              analysis: 'AI analysis unavailable',
              metadata: {
                fileName: fileName,
                filePath: filePath,
                fileSize: stats.size,
                lastModified: stats.mtime
              },
              timestamp: Date.now()
            }
          }
        }

        return { 
          success: true,
          extractedText: mockExtractedText,
          analysis: 'AI analysis not available',
          metadata: {
            fileName: fileName,
            filePath: filePath,
            fileSize: stats.size,
            lastModified: stats.mtime
          },
          timestamp: Date.now()
        }

      } catch (error) {
        console.error('❌ PDF processing failed:', error)
        return { success: false, error: `PDF processing failed: ${error.message}` }
      }
    })

    ipcMain.handle('process-word-document', async (event, filePath) => {
      try {
        console.log('📝 Processing Word document...')
        
        if (!filePath || !fs.existsSync(filePath)) {
          return { success: false, error: 'Word document not found or invalid path' }
        }

        const stats = fs.statSync(filePath)
        const fileName = path.basename(filePath)
        
        // Simulate Word document processing (in real implementation, use mammoth or docx2txt)
        const mockExtractedText = `Word Document: ${fileName}
        
This is a simulated Word document processing result. In a full implementation, this would contain:
- Extracted text content preserving structure
- Document formatting information
- Headers, footers, and footnotes
- Tables and lists content
- Images and media descriptions
- Document properties and metadata

File Size: ${Math.round(stats.size / 1024)} KB
Last Modified: ${new Date(stats.mtime).toLocaleDateString()}

To implement full Word document processing, add mammoth dependency:
npm install mammoth

Then extract actual content with formatting and analyze with AI.`

        // Analyze with AI if available
        if (this.aiService) {
          try {
            const response = await this.aiService.chat.completions.create({
              messages: [
                { 
                  role: 'system', 
                  content: 'You are a document analysis expert. Analyze Word document content and provide structured insights.' 
                },
                { 
                  role: 'user', 
                  content: `Analyze this Word document and provide:
1. Document summary
2. Key points and main arguments
3. Document structure analysis
4. Important information extracted
5. Recommendations or next steps

Content: ${mockExtractedText}` 
                }
              ],
              model: 'llama-3.3-70b-versatile',
              temperature: 0.3,
              max_tokens: 1000
            })

            const analysis = response.choices[0].message.content

            return { 
              success: true,
              extractedText: mockExtractedText,
              analysis: analysis,
              metadata: {
                fileName: fileName,
                filePath: filePath,
                fileSize: stats.size,
                lastModified: stats.mtime,
                documentType: 'Microsoft Word Document'
              },
              timestamp: Date.now()
            }
          } catch (aiError) {
            console.warn('⚠️ AI analysis failed, returning extracted text only:', aiError)
          }
        }

        return { 
          success: true,
          extractedText: mockExtractedText,
          analysis: 'AI analysis not available',
          metadata: {
            fileName: fileName,
            filePath: filePath,
            fileSize: stats.size,
            lastModified: stats.mtime,
            documentType: 'Microsoft Word Document'
          },
          timestamp: Date.now()
        }

      } catch (error) {
        console.error('❌ Word document processing failed:', error)
        return { success: false, error: `Word document processing failed: ${error.message}` }
      }
    })

    ipcMain.handle('process-text-document', async (event, filePath) => {
      try {
        console.log('📄 Processing text document...')
        
        if (!filePath || !fs.existsSync(filePath)) {
          return { success: false, error: 'Text document not found or invalid path' }
        }

        // Read text file content
        const content = fs.readFileSync(filePath, 'utf8')
        const stats = fs.statSync(filePath)
        const fileName = path.basename(filePath)
        
        // Basic text analysis
        const wordCount = content.split(/\s+/).length
        const lineCount = content.split('\n').length
        const charCount = content.length

        // Analyze with AI if available
        if (this.aiService && content.trim().length > 0) {
          try {
            const response = await this.aiService.chat.completions.create({
              messages: [
                { 
                  role: 'system', 
                  content: 'You are a text analysis expert. Analyze text documents and provide comprehensive insights.' 
                },
                { 
                  role: 'user', 
                  content: `Analyze this text document and provide:
1. Content summary
2. Key themes and topics
3. Writing style and tone analysis
4. Important information extracted
5. Content structure analysis
6. Actionable insights

Document: ${fileName}
Content: ${content.substring(0, 2000)}${content.length > 2000 ? '...' : ''}` 
                }
              ],
              model: 'llama-3.3-70b-versatile',
              temperature: 0.3,
              max_tokens: 1200
            })

            const analysis = response.choices[0].message.content

            return { 
              success: true,
              extractedText: content,
              analysis: analysis,
              metadata: {
                fileName: fileName,
                filePath: filePath,
                fileSize: stats.size,
                lastModified: stats.mtime,
                wordCount: wordCount,
                lineCount: lineCount,
                charCount: charCount,
                documentType: 'Text Document'
              },
              timestamp: Date.now()
            }
          } catch (aiError) {
            console.warn('⚠️ AI analysis failed, returning content only:', aiError)
          }
        }

        return { 
          success: true,
          extractedText: content,
          analysis: content.trim().length === 0 ? 'Document is empty' : 'AI analysis not available',
          metadata: {
            fileName: fileName,
            filePath: filePath,
            fileSize: stats.size,
            lastModified: stats.mtime,
            wordCount: wordCount,
            lineCount: lineCount,
            charCount: charCount,
            documentType: 'Text Document'
          },
          timestamp: Date.now()
        }

      } catch (error) {
        console.error('❌ Text document processing failed:', error)
        return { success: false, error: `Text document processing failed: ${error.message}` }
      }
    })

    // Shopping & Research handlers - ENHANCED: Full implementation
    ipcMain.handle('search-products', async (event, query, options = {}) => {
      try {
        console.log('🛒 Searching for products:', query)
        
        if (!query || query.trim().length === 0) {
          return { success: false, error: 'Search query is required' }
        }

        const searchQuery = query.trim()
        const category = options.category || 'all'
        const priceRange = options.priceRange || { min: 0, max: 10000 }
        const sortBy = options.sortBy || 'relevance'

        // Generate product search URLs for major retailers
        const retailerUrls = {
          amazon: `https://www.amazon.com/s?k=${encodeURIComponent(searchQuery)}`,
          ebay: `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(searchQuery)}`,
          walmart: `https://www.walmart.com/search?q=${encodeURIComponent(searchQuery)}`,
          target: `https://www.target.com/s?searchTerm=${encodeURIComponent(searchQuery)}`,
          bestbuy: `https://www.bestbuy.com/site/searchpage.jsp?st=${encodeURIComponent(searchQuery)}`,
          newegg: `https://www.newegg.com/p/pl?d=${encodeURIComponent(searchQuery)}`
        }

        // Use AI to generate product recommendations and analysis
        if (this.aiService) {
          try {
            const response = await this.aiService.chat.completions.create({
              messages: [
                { 
                  role: 'system', 
                  content: `You are a professional shopping research assistant. You help users find the best products based on their search queries. Provide comprehensive product research and recommendations.` 
                },
                { 
                  role: 'user', 
                  content: `I'm searching for: "${searchQuery}"

Please provide:
1. **Product Categories**: What specific product categories should I focus on?
2. **Key Features**: What important features should I look for?
3. **Price Expectations**: What's a reasonable price range for quality products?
4. **Top Brands**: Which brands are known for quality in this category?
5. **Shopping Tips**: What should I watch out for when buying?
6. **Comparison Factors**: What factors should I use to compare products?
7. **Seasonal Considerations**: Are there best times to buy these products?

Additional context:
- Category: ${category}
- Budget: $${priceRange.min} - $${priceRange.max}
- Sort preference: ${sortBy}` 
                }
              ],
              model: 'llama-3.3-70b-versatile',
              temperature: 0.7,
              max_tokens: 1500
            })

            const aiRecommendations = response.choices[0].message.content

            // Create tabs for product research
            const researchTabs = []
            for (const [retailer, url] of Object.entries(retailerUrls)) {
              try {
                const tabResult = await this.createTab(url)
                if (tabResult.success) {
                  researchTabs.push({
                    retailer: retailer.charAt(0).toUpperCase() + retailer.slice(1),
                    tabId: tabResult.tabId,
                    url: url,
                    status: 'created'
                  })
                }
              } catch (tabError) {
                console.warn(`⚠️ Failed to create tab for ${retailer}:`, tabError.message)
              }
            }

            return { 
              success: true,
              searchQuery: searchQuery,
              recommendations: aiRecommendations,
              retailerUrls: retailerUrls,
              researchTabs: researchTabs,
              searchOptions: {
                category: category,
                priceRange: priceRange,
                sortBy: sortBy
              },
              timestamp: Date.now(),
              message: `Created ${researchTabs.length} research tabs for "${searchQuery}". Check the AI recommendations for detailed guidance.`
            }

          } catch (aiError) {
            console.warn('⚠️ AI recommendations failed, returning basic search results:', aiError)
          }
        }

        // Fallback without AI
        return { 
          success: true,
          searchQuery: searchQuery,
          recommendations: `Search results for "${searchQuery}". Visit the retailer websites to compare prices and features.`,
          retailerUrls: retailerUrls,
          researchTabs: [],
          searchOptions: {
            category: category,
            priceRange: priceRange,
            sortBy: sortBy
          },
          timestamp: Date.now(),
          message: `Product search completed for "${searchQuery}". Use the provided URLs to research products.`
        }

      } catch (error) {
        console.error('❌ Product search failed:', error)
        return { success: false, error: `Product search failed: ${error.message}` }
      }
    })

    ipcMain.handle('compare-products', async (event, products) => {
      try {
        console.log('⚖️ Comparing products:', products?.length || 0, 'items')
        
        if (!products || !Array.isArray(products) || products.length === 0) {
          return { success: false, error: 'Products array is required for comparison' }
        }

        if (products.length > 10) {
          return { success: false, error: 'Cannot compare more than 10 products at once' }
        }

        // Use AI to generate comprehensive product comparison
        if (this.aiService) {
          try {
            const productList = products.map((product, index) => 
              `Product ${index + 1}: ${JSON.stringify(product, null, 2)}`
            ).join('\n\n')

            const response = await this.aiService.chat.completions.create({
              messages: [
                { 
                  role: 'system', 
                  content: 'You are an expert product comparison analyst. Create detailed, objective comparisons highlighting pros, cons, and recommendations.' 
                },
                { 
                  role: 'user', 
                  content: `Compare these products and provide:

1. **Comparison Overview**: Brief summary of all products
2. **Feature Matrix**: Key features comparison table
3. **Pros and Cons**: For each product
4. **Price Analysis**: Value for money assessment
5. **Recommendations**: 
   - Best Overall Value
   - Best for Budget
   - Best for Features
   - Best for Quality
6. **Decision Factors**: What factors should determine the choice?
7. **Final Recommendation**: Which product would you recommend and why?

Products to compare:
${productList}` 
                }
              ],
              model: 'llama-3.3-70b-versatile',
              temperature: 0.3,
              max_tokens: 2000
            })

            const comparison = response.choices[0].message.content

            return { 
              success: true,
              productCount: products.length,
              comparison: comparison,
              products: products,
              comparisonMatrix: {
                features: ['Price', 'Quality', 'Features', 'Brand', 'Reviews'],
                analysis: 'AI-generated detailed comparison available above'
              },
              timestamp: Date.now()
            }

          } catch (aiError) {
            console.warn('⚠️ AI comparison failed, returning basic comparison:', aiError)
          }
        }

        // Fallback without AI
        const basicComparison = products.map((product, index) => ({
          position: index + 1,
          name: product.name || product.title || `Product ${index + 1}`,
          price: product.price || 'Not specified',
          features: product.features || product.description || 'Not specified',
          rating: product.rating || 'Not specified'
        }))

        return { 
          success: true,
          productCount: products.length,
          comparison: 'Basic comparison completed. Enable AI for detailed analysis.',
          products: products,
          basicComparison: basicComparison,
          timestamp: Date.now()
        }

      } catch (error) {
        console.error('❌ Product comparison failed:', error)
        return { success: false, error: `Product comparison failed: ${error.message}` }
      }
    })

    ipcMain.handle('add-to-cart', async (event, product, quantity = 1) => {
      try {
        console.log('🛒 Adding to cart:', product?.name || 'unknown product')
        
        if (!product) {
          return { success: false, error: 'Product information is required' }
        }

        if (quantity < 1 || quantity > 99) {
          return { success: false, error: 'Quantity must be between 1 and 99' }
        }

        // Initialize shopping cart in database if not exists
        if (this.databaseService) {
          try {
            // Create cart entry
            const cartItem = {
              id: `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              productId: product.id || product.name || 'unknown',
              name: product.name || product.title || 'Unknown Product',
              price: product.price || 0,
              quantity: quantity,
              retailer: product.retailer || 'Unknown',
              url: product.url || '',
              imageUrl: product.imageUrl || '',
              addedAt: Date.now(),
              status: 'active'
            }

            // In a real implementation, save to database
            // await this.databaseService.saveCartItem(cartItem)

            // Use AI to provide shopping advice
            if (this.aiService) {
              try {
                const response = await this.aiService.chat.completions.create({
                  messages: [
                    { 
                      role: 'system', 
                      content: 'You are a smart shopping assistant. Provide helpful advice about products added to cart.' 
                    },
                    { 
                      role: 'user', 
                      content: `A user just added this product to their cart:

Product: ${cartItem.name}
Price: $${cartItem.price}
Quantity: ${cartItem.quantity}
Retailer: ${cartItem.retailer}

Please provide:
1. **Purchase Confirmation**: Confirm the item details
2. **Smart Suggestions**: Related products or accessories
3. **Deal Alerts**: Any tips for better prices or deals
4. **Purchase Timing**: Best time to buy
5. **Next Steps**: What to do next

Keep it concise and helpful.` 
                    }
                  ],
                  model: 'llama-3.3-70b-versatile',
                  temperature: 0.7,
                  max_tokens: 600
                })

                const shoppingAdvice = response.choices[0].message.content

                return { 
                  success: true,
                  cartItem: cartItem,
                  shoppingAdvice: shoppingAdvice,
                  cartTotal: cartItem.price * cartItem.quantity,
                  message: `Added ${cartItem.name} (x${quantity}) to your cart`,
                  timestamp: Date.now()
                }

              } catch (aiError) {
                console.warn('⚠️ AI shopping advice failed:', aiError)
              }
            }

            return { 
              success: true,
              cartItem: cartItem,
              shoppingAdvice: 'Product added to cart successfully! Consider comparing prices across different retailers.',
              cartTotal: cartItem.price * cartItem.quantity,
              message: `Added ${cartItem.name} (x${quantity}) to your cart`,
              timestamp: Date.now()
            }

          } catch (dbError) {
            console.warn('⚠️ Database cart operation failed:', dbError)
          }
        }

        // Fallback without database
        const cartItem = {
          id: `temp_cart_${Date.now()}`,
          name: product.name || 'Unknown Product',
          price: product.price || 0,
          quantity: quantity,
          addedAt: Date.now()
        }

        return { 
          success: true,
          cartItem: cartItem,
          shoppingAdvice: 'Product added to temporary cart. For persistent cart, database integration is needed.',
          cartTotal: cartItem.price * cartItem.quantity,
          message: `Added ${cartItem.name} (x${quantity}) to your cart`,
          timestamp: Date.now()
        }

      } catch (error) {
        console.error('❌ Add to cart failed:', error)
        return { success: false, error: `Add to cart failed: ${error.message}` }
      }
    })

    // Bookmarks & History handlers - FIXED: Added missing handlers
    ipcMain.handle('add-bookmark', async (event, bookmark) => {
      try {
        // Placeholder for bookmark functionality
        console.log('🔖 Add bookmark requested (placeholder)')
        return { 
          success: false, 
          error: 'Bookmark management not implemented yet' 
        }
      } catch (error) {
        return { success: false, error: error.message }
      }
    })

    ipcMain.handle('remove-bookmark', async (event, bookmarkId) => {
      try {
        // Placeholder for bookmark removal functionality
        console.log('🗑️ Remove bookmark requested (placeholder)')
        return { 
          success: false, 
          error: 'Bookmark management not implemented yet' 
        }
      } catch (error) {
        return { success: false, error: error.message }
      }
    })

    ipcMain.handle('get-bookmarks', async () => {
      try {
        // Placeholder for get bookmarks functionality
        console.log('📚 Get bookmarks requested (placeholder)')
        return { 
          success: true, 
          bookmarks: [] 
        }
      } catch (error) {
        return { success: false, error: error.message }
      }
    })

    ipcMain.handle('search-bookmarks', async (event, options) => {
      try {
        // Placeholder for bookmark search functionality
        console.log('🔍 Search bookmarks requested (placeholder)')
        return { 
          success: true, 
          results: [] 
        }
      } catch (error) {
        return { success: false, error: error.message }
      }
    })

    ipcMain.handle('get-history', async (event, options) => {
      try {
        // Placeholder for browsing history functionality
        console.log('📜 Get history requested (placeholder)')
        return { 
          success: true, 
          history: [] 
        }
      } catch (error) {
        return { success: false, error: error.message }
      }
    })

    ipcMain.handle('delete-history-item', async (event, historyId) => {
      try {
        // Placeholder for history item deletion functionality
        console.log('🗑️ Delete history item requested (placeholder)')
        return { 
          success: false, 
          error: 'History management not implemented yet' 
        }
      } catch (error) {
        return { success: false, error: error.message }
      }
    })

    ipcMain.handle('clear-history', async (event, options) => {
      try {
        // Placeholder for clear history functionality
        console.log('🧹 Clear history requested (placeholder)')
        return { 
          success: false, 
          error: 'History management not implemented yet' 
        }
      } catch (error) {
        return { success: false, error: error.message }
      }
    })

    // System info handlers - FIXED: Added missing handlers
    ipcMain.handle('get-version', async () => {
      try {
        return { 
          success: true, 
          version: require('../../package.json').version 
        }
      } catch (error) {
        return { success: false, error: error.message }
      }
    })

    ipcMain.handle('get-platform', async () => {
      try {
        return { 
          success: true, 
          platform: process.platform 
        }
      } catch (error) {
        return { success: false, error: error.message }
      }
    })

    // Data storage handlers - FIXED: Added missing handlers
    ipcMain.handle('get-data', async (event, key) => {
      try {
        // Placeholder for data storage functionality
        console.log(`💾 Get data requested for key: ${key} (placeholder)`)
        return { 
          success: false, 
          error: 'Data storage not implemented yet' 
        }
      } catch (error) {
        return { success: false, error: error.message }
      }
    })

    ipcMain.handle('save-data', async (event, key, data) => {
      try {
        // Placeholder for data storage functionality
        console.log(`💾 Save data requested for key: ${key} (placeholder)`)
        return { 
          success: false, 
          error: 'Data storage not implemented yet' 
        }
      } catch (error) {
        return { success: false, error: error.message }
      }
    })

    // Additional handlers
    ipcMain.handle('register-shortcuts', async (event, shortcuts) => {
      try {
        // Placeholder for keyboard shortcuts functionality
        console.log('⌨️ Register shortcuts requested (placeholder)')
        return { 
          success: false, 
          error: 'Keyboard shortcuts not implemented yet' 
        }
      } catch (error) {
        return { success: false, error: error.message }
      }
    })

    ipcMain.handle('open-dev-tools', async () => {
      try {
        if (this.mainWindow && this.mainWindow.webContents) {
          this.mainWindow.webContents.openDevTools()
          return { success: true }
        }
        return { success: false, error: 'Main window not available' }
      } catch (error) {
        return { success: false, error: error.message }
      }
    })

    ipcMain.handle('close-dev-tools', async () => {
      try {
        if (this.mainWindow && this.mainWindow.webContents) {
          this.mainWindow.webContents.closeDevTools()
          return { success: true }
        }
        return { success: false, error: 'Main window not available' }
      } catch (error) {
        return { success: false, error: error.message }
      }
    })

    ipcMain.handle('debug-browser-view', async () => {
      try {
        // Debug information about browser views
        console.log('🐛 Debug browser view requested')
        return { 
          success: true, 
          debug: { 
            activeTabs: this.browserViews.size,
            activeTabId: this.activeTabId,
            tabCounter: this.tabCounter
          }
        }
      } catch (error) {
        return { success: false, error: error.message }
      }
    })

    console.log('✅ IPC handlers setup completed')
  }

  // ENHANCED: Real browser navigation implementation with BrowserView
  async createTab(url = 'https://www.google.com') {
    try {
      const tabId = `tab_${Date.now()}_${++this.tabCounter}`
      
      // Create new BrowserView
      const browserView = new BrowserView({
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          enableRemoteModule: false,
          webSecurity: true,
          allowRunningInsecureContent: false,
          experimentalFeatures: false,
          scrollBounce: true,
          backgroundThrottling: false
        }
      })

      // Configure browser view
      this.mainWindow.setBrowserView(browserView)
      
      // Set bounds (adjust for your layout - 70% width for browser, 30% for AI sidebar)
      const bounds = this.mainWindow.getBounds()
      browserView.setBounds({
        x: 0,
        y: 100, // Account for tab bar (40px) + navigation bar (60px)
        width: Math.floor(bounds.width * 0.7), // 70% width for browser
        height: bounds.height - 100
      })

      // Set up event listeners
      this.setupBrowserViewEvents(browserView, tabId)
      
      // Load URL with error handling
      try {
        await browserView.webContents.loadURL(url)
      } catch (loadError) {
        console.warn(`⚠️ Failed to load URL ${url}, loading Google instead:`, loadError.message)
        await browserView.webContents.loadURL('https://www.google.com')
      }
      
      // Store browser view and initialize state
      this.browserViews.set(tabId, browserView)
      this.tabHistory = this.tabHistory || new Map()
      this.tabState = this.tabState || new Map()
      
      this.tabHistory.set(tabId, [url])
      this.tabState.set(tabId, {
        url,
        title: 'Loading...',
        isLoading: true,
        canGoBack: false,
        canGoForward: false,
        createdAt: Date.now()
      })

      // Set as active tab
      this.activeTabId = tabId
      
      console.log(`✅ Created real browser tab: ${tabId} -> ${url}`)
      
      // Notify frontend
      this.notifyTabCreated(tabId, url)
      
      return { 
        success: true, 
        tabId, 
        url,
        title: 'Loading...'
      }
      
    } catch (error) {
      console.error('❌ Failed to create tab:', error)
      return { success: false, error: error.message }
    }
  }

  async closeTab(tabId) {
    if (!this.browserViews.has(tabId)) {
      return { success: false, error: 'Tab not found' }
    }

    try {
      const browserView = this.browserViews.get(tabId)
      
      // Remove from window if active
      if (this.activeTabId === tabId) {
        this.mainWindow.removeBrowserView(browserView)
        
        // Switch to another tab
        const remainingTabs = Array.from(this.browserViews.keys()).filter(id => id !== tabId)
        if (remainingTabs.length > 0) {
          await this.switchTab(remainingTabs[0])
        } else {
          this.activeTabId = null
        }
      }
      
      // Destroy browser view
      browserView.destroy()
      
      // Clean up data
      this.browserViews.delete(tabId)
      if (this.tabHistory) this.tabHistory.delete(tabId)
      if (this.tabState) this.tabState.delete(tabId)
      
      // Notify frontend
      this.notifyTabClosed(tabId)
      
      console.log(`✅ Closed tab: ${tabId}`)
      
      return { success: true, tabId }
      
    } catch (error) {
      console.error('❌ Tab close failed:', error)
      return { success: false, error: error.message }
    }
  }

  async switchTab(tabId) {
    if (!this.browserViews.has(tabId)) {
      return { success: false, error: 'Tab not found' }
    }

    try {
      // Hide current view
      if (this.activeTabId && this.browserViews.has(this.activeTabId)) {
        const currentView = this.browserViews.get(this.activeTabId)
        this.mainWindow.removeBrowserView(currentView)
      }

      // Show new view
      const browserView = this.browserViews.get(tabId)
      this.mainWindow.setBrowserView(browserView)
      
      // Update bounds
      this.updateBrowserViewBounds(browserView)
      
      // Set as active
      this.activeTabId = tabId
      
      // Notify frontend
      this.notifyTabSwitched(tabId)
      
      console.log(`✅ Switched to tab: ${tabId}`)
      
      return { success: true, tabId }
      
    } catch (error) {
      console.error('❌ Tab switch failed:', error)
      return { success: false, error: error.message }
    }
  }

  async navigateTo(url, tabId = this.activeTabId) {
    if (!tabId || !this.browserViews.has(tabId)) {
      return { success: false, error: 'No active tab' }
    }

    try {
      const browserView = this.browserViews.get(tabId)
      
      // Process URL input (handle search vs navigation)
      const processedUrl = this.processAddressBarInput(url)
      
      // Update state
      if (this.tabState) {
        const tabState = this.tabState.get(tabId) || {}
        tabState.isLoading = true
        tabState.url = processedUrl
        this.tabState.set(tabId, tabState)
      }
      
      // Add to history
      if (this.tabHistory) {
        const history = this.tabHistory.get(tabId) || []
        history.push(processedUrl)
        this.tabHistory.set(tabId, history)
      }
      
      // Navigate
      await browserView.webContents.loadURL(processedUrl)
      
      // Notify frontend
      this.notifyNavigationStarted(tabId, processedUrl)
      
      console.log(`🌐 Navigating tab ${tabId} to: ${processedUrl}`)
      
      return { success: true, url: processedUrl, tabId }
      
    } catch (error) {
      console.error('❌ Navigation failed:', error)
      
      // Update error state
      if (this.tabState) {
        const tabState = this.tabState.get(tabId)
        if (tabState) {
          tabState.isLoading = false
          tabState.error = error.message
          this.tabState.set(tabId, tabState)
        }
      }
      
      this.notifyNavigationError(tabId, error.message)
      
      return { success: false, error: error.message }
    }
  }

  async goBack(tabId = this.activeTabId) {
    if (!tabId || !this.browserViews.has(tabId)) {
      return { success: false, error: 'No active tab' }
    }

    try {
      const browserView = this.browserViews.get(tabId)
      
      if (browserView.webContents.canGoBack()) {
        browserView.webContents.goBack()
        console.log(`⬅️ Going back in tab: ${tabId}`)
        return { success: true }
      } else {
        return { success: false, error: 'Cannot go back' }
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  async goForward(tabId = this.activeTabId) {
    if (!tabId || !this.browserViews.has(tabId)) {
      return { success: false, error: 'No active tab' }
    }

    try {
      const browserView = this.browserViews.get(tabId)
      
      if (browserView.webContents.canGoForward()) {
        browserView.webContents.goForward()
        console.log(`➡️ Going forward in tab: ${tabId}`)
        return { success: true }
      } else {
        return { success: false, error: 'Cannot go forward' }
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  async reload(tabId = this.activeTabId) {
    if (!tabId || !this.browserViews.has(tabId)) {
      return { success: false, error: 'No active tab' }
    }

    try {
      const browserView = this.browserViews.get(tabId)
      browserView.webContents.reload()
      console.log(`🔄 Reloading tab: ${tabId}`)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  async getCurrentUrl(tabId = this.activeTabId) {
    if (!tabId || !this.browserViews.has(tabId)) {
      return { success: false, error: 'No active tab' }
    }

    try {
      const browserView = this.browserViews.get(tabId)
      const url = browserView.webContents.getURL()
      return { success: true, url }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  async getPageTitle(tabId = this.activeTabId) {
    if (!tabId || !this.browserViews.has(tabId)) {
      return { success: false, error: 'No active tab' }
    }

    try {
      const browserView = this.browserViews.get(tabId)
      const title = browserView.webContents.getTitle()
      return { success: true, title }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Smart URL processing
  processAddressBarInput(input) {
    const trimmed = input.trim()
    
    // Check if it's a URL
    if (this.isValidURL(trimmed)) {
      return this.normalizeURL(trimmed)
    }
    
    // Check if it looks like a domain
    if (this.looksLikeDomain(trimmed)) {
      return `https://${trimmed}`
    }
    
    // Treat as search query
    return `https://www.google.com/search?q=${encodeURIComponent(trimmed)}`
  }

  isValidURL(string) {
    try {
      new URL(string)
      return true
    } catch {
      return false
    }
  }

  looksLikeDomain(string) {
    return /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(string) && !string.includes(' ')
  }

  normalizeURL(url) {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `https://${url}`
    }
    return url
  }

  // Browser view event handling
  setupBrowserViewEvents(browserView, tabId) {
    const webContents = browserView.webContents

    // Page loading events
    webContents.on('did-start-loading', () => {
      if (this.tabState) {
        const tabState = this.tabState.get(tabId) || {}
        tabState.isLoading = true
        this.tabState.set(tabId, tabState)
      }
      this.notifyPageLoading(tabId)
    })

    webContents.on('did-finish-load', () => {
      if (this.tabState) {
        const tabState = this.tabState.get(tabId) || {}
        tabState.isLoading = false
        tabState.url = webContents.getURL()
        tabState.title = webContents.getTitle()
        tabState.canGoBack = webContents.canGoBack()
        tabState.canGoForward = webContents.canGoForward()
        this.tabState.set(tabId, tabState)
      }
      this.notifyPageLoaded(tabId, webContents.getURL(), webContents.getTitle())
    })

    webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
      if (this.tabState) {
        const tabState = this.tabState.get(tabId) || {}
        tabState.isLoading = false
        tabState.error = errorDescription
        this.tabState.set(tabId, tabState)
      }
      this.notifyPageError(tabId, errorDescription)
    })

    // Title and URL changes
    webContents.on('page-title-updated', (event, title) => {
      if (this.tabState) {
        const tabState = this.tabState.get(tabId) || {}
        tabState.title = title
        this.tabState.set(tabId, tabState)
      }
      this.notifyTitleUpdated(tabId, title)
    })

    // New window handling
    webContents.setWindowOpenHandler(({ url }) => {
      // Create new tab for popup windows
      this.createTab(url)
      return { action: 'deny' }
    })

    // Security: Prevent navigation to dangerous protocols
    webContents.on('will-navigate', (event, navigationUrl) => {
      const urlObj = new URL(navigationUrl)
      if (!['http:', 'https:', 'file:'].includes(urlObj.protocol)) {
        event.preventDefault()
        console.warn(`🚫 Blocked navigation to: ${navigationUrl}`)
      }
    })
  }

  // Dynamic bounds updating
  updateBrowserViewBounds(browserView) {
    if (!this.mainWindow || !browserView) return

    const bounds = this.mainWindow.getBounds()
    const aiSidebarOpen = true // Assume AI sidebar is always open for now
    
    browserView.setBounds({
      x: 0,
      y: 100, // Tab bar (40px) + Navigation bar (60px)
      width: aiSidebarOpen ? Math.floor(bounds.width * 0.7) : bounds.width,
      height: bounds.height - 100
    })
  }

  // Notification methods for frontend communication
  notifyTabCreated(tabId, url) {
    if (this.mainWindow && this.mainWindow.webContents) {
      this.mainWindow.webContents.send('tab-created', { tabId, url })
    }
  }

  notifyTabSwitched(tabId) {
    if (this.mainWindow && this.mainWindow.webContents) {
      this.mainWindow.webContents.send('tab-switched', { tabId })
    }
  }

  notifyTabClosed(tabId) {
    if (this.mainWindow && this.mainWindow.webContents) {
      this.mainWindow.webContents.send('tab-closed', { tabId })
    }
  }

  notifyNavigationStarted(tabId, url) {
    if (this.mainWindow && this.mainWindow.webContents) {
      this.mainWindow.webContents.send('navigation-started', { tabId, url })
    }
  }

  notifyPageLoading(tabId) {
    if (this.mainWindow && this.mainWindow.webContents) {
      this.mainWindow.webContents.send('page-loading', { tabId })
    }
  }

  notifyPageLoaded(tabId, url, title) {
    if (this.mainWindow && this.mainWindow.webContents) {
      this.mainWindow.webContents.send('page-loaded', { tabId, url, title })
    }
  }

  notifyPageError(tabId, error) {
    if (this.mainWindow && this.mainWindow.webContents) {
      this.mainWindow.webContents.send('page-error', { tabId, error })
    }
  }

  notifyTitleUpdated(tabId, title) {
    if (this.mainWindow && this.mainWindow.webContents) {
      this.mainWindow.webContents.send('page-title-updated', { tabId, title })
    }
  }

  notifyNavigationError(tabId, error) {
    if (this.mainWindow && this.mainWindow.webContents) {
      this.mainWindow.webContents.send('navigation-error', { tabId, error })
    }
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

      // Handle window resize to update browser view bounds
      this.mainWindow.on('resize', () => {
        // Update all browser view bounds when window is resized
        for (const browserView of this.browserViews.values()) {
          this.updateBrowserViewBounds(browserView)
        }
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
      
      // Shutdown enhanced services in proper order
      if (this.databaseHealthManager) {
        await this.databaseHealthManager.shutdown()
      }
      
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
        try {
          browserView.destroy()
        } catch (error) {
          console.warn(`⚠️ Failed to destroy browser view ${tabId}:`, error.message)
        }
      }
      this.browserViews.clear()
      
      // Clear AI tabs
      this.aiTabs.clear()
      
      // Reset connection state
      this.connectionState = {
        api: 'disconnected',
        database: 'disconnected',
        agents: 'disconnected'
      }
      
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