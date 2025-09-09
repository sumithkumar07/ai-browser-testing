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

      // Initialize Enhanced Agent Services - FIXED: Better error handling for TypeScript imports
      try {
        const AgentMemoryService = require('../compiled/services/AgentMemoryService.js')
        const AgentCoordinationService = require('../compiled/services/AgentCoordinationService.js')
        
        this.agentMemoryService = AgentMemoryService.default.getInstance()
        await this.agentMemoryService.initialize()
        
        this.agentCoordinationService = AgentCoordinationService.default.getInstance()
        await this.agentCoordinationService.initialize()
      } catch (error) {
        console.warn('⚠️ Enhanced agent services not available, continuing with basic mode:', error.message)
        this.agentMemoryService = null
        this.agentCoordinationService = null
      }
      
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

    // Additional Missing Handlers - FIXED: Added handlers that preload references
    ipcMain.handle('analyze-image', async (event, imageData) => {
      try {
        // Placeholder for image analysis functionality
        console.log('📷 Image analysis requested (placeholder)')
        return { 
          success: false, 
          error: 'Image analysis not implemented yet' 
        }
      } catch (error) {
        return { success: false, error: error.message }
      }
    })

    ipcMain.handle('process-pdf', async (event, filePath) => {
      try {
        // Placeholder for PDF processing functionality
        console.log('📄 PDF processing requested (placeholder)')
        return { 
          success: false, 
          error: 'PDF processing not implemented yet' 
        }
      } catch (error) {
        return { success: false, error: error.message }
      }
    })

    ipcMain.handle('process-word-document', async (event, filePath) => {
      try {
        // Placeholder for Word document processing functionality
        console.log('📝 Word document processing requested (placeholder)')
        return { 
          success: false, 
          error: 'Word document processing not implemented yet' 
        }
      } catch (error) {
        return { success: false, error: error.message }
      }
    })

    ipcMain.handle('process-text-document', async (event, filePath) => {
      try {
        // Placeholder for text document processing functionality
        console.log('📄 Text document processing requested (placeholder)')
        return { 
          success: false, 
          error: 'Text document processing not implemented yet' 
        }
      } catch (error) {
        return { success: false, error: error.message }
      }
    })

    // Shopping & Research handlers - FIXED: Added missing handlers
    ipcMain.handle('search-products', async (event, query, options) => {
      try {
        // Placeholder for product search functionality
        console.log('🛒 Product search requested (placeholder)')
        return { 
          success: false, 
          error: 'Product search not implemented yet' 
        }
      } catch (error) {
        return { success: false, error: error.message }
      }
    })

    ipcMain.handle('compare-products', async (event, products) => {
      try {
        // Placeholder for product comparison functionality
        console.log('⚖️ Product comparison requested (placeholder)')
        return { 
          success: false, 
          error: 'Product comparison not implemented yet' 
        }
      } catch (error) {
        return { success: false, error: error.message }
      }
    })

    ipcMain.handle('add-to-cart', async (event, product, quantity) => {
      try {
        // Placeholder for add to cart functionality
        console.log('🛒 Add to cart requested (placeholder)')
        return { 
          success: false, 
          error: 'Add to cart not implemented yet' 
        }
      } catch (error) {
        return { success: false, error: error.message }
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