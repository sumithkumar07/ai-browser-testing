// Phase 2: Agent Browser Control Implementation
export class BrowserController {
  private static instance: BrowserController
  private activeAgentTasks: Map<string, any> = new Map()

  static getInstance(): BrowserController {
    if (!BrowserController.instance) {
      BrowserController.instance = new BrowserController()
    }
    return BrowserController.instance
  }

  async initialize() {
    console.log('🌐 Initializing Browser Controller...')
    
    // Set up agent browser control capabilities
    this.setupAgentControls()
    
    console.log('✅ Browser Controller initialized')
  }

  private setupAgentControls() {
    // Enhance window.electronAPI with agent-specific controls
    if (window.electronAPI) {
      // Add agent browser control methods safely
      try {
        window.electronAPI.createAITab = this.createAITab.bind(this)
        window.electronAPI.extractPageContent = this.extractPageContent.bind(this)
        window.electronAPI.executeAgentTask = this.executeAgentTask.bind(this)
        window.electronAPI.getAgentStatus = this.getAgentStatus.bind(this)
      } catch (error) {
        console.warn('Failed to setup some agent controls:', error)
      }
    }
  }

  async createAITab(title: string, content: string = ''): Promise<any> {
    try {
      // Check if electronAPI is available
      if (!window.electronAPI || !window.electronAPI.createTab) {
        throw new Error('Create tab API not available')
      }

      // Create AI tab through Electron API
      const result = await window.electronAPI.createTab('about:blank', 'ai')
      
      if (result && result.success && result.tabId) {
        // Save AI content to local storage
        await this.saveAIContent(result.tabId, {
          title,
          content,
          type: 'ai',
          createdAt: Date.now(),
          updatedAt: Date.now()
        })
        
        return { success: true, tabId: result.tabId, title }
      }
      
      throw new Error(result?.error || 'Failed to create AI tab')
    } catch (error) {
      console.error('❌ Failed to create AI tab:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async extractPageContent(_tabId?: string): Promise<any> {
    try {
      // Check if electronAPI is available
      if (!window.electronAPI || !window.electronAPI.getCurrentUrl) {
        throw new Error('Page content extraction API not available')
      }

      // Use Electron API to extract content from current or specific tab
      const result = await window.electronAPI.getCurrentUrl()
      
      if (result && result.success && result.url) {
        // In a real implementation, this would extract actual page content
        // For now, we'll simulate content extraction
        const simulatedContent = `Content extracted from: ${result.url}\n\nSimulated page content for demonstration purposes.\n\nThis would contain actual webpage text, images, and structured data in a real implementation.`
        
        return {
          success: true,
          content: simulatedContent,
          url: result.url,
          timestamp: Date.now()
        }
      }
      
      throw new Error('No active tab to extract content from')
    } catch (error) {
      console.error('❌ Content extraction failed:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async executeAgentTask(task: string): Promise<any> {
    try {
      const taskId = `task_${Date.now()}`
      
      // Store agent task
      this.activeAgentTasks.set(taskId, {
        id: taskId,
        description: task,
        status: 'active',
        startTime: Date.now()
      })
      
      // Import and use IntegratedAgentFramework
      const { default: IntegratedAgentFramework } = await import('./IntegratedAgentFramework')
      const agentFramework = IntegratedAgentFramework.getInstance()
      
      const result = await agentFramework.processUserInput(task)
      
      // Update task status
      const agentTask = this.activeAgentTasks.get(taskId)
      if (agentTask) {
        agentTask.status = result.success ? 'completed' : 'failed'
        agentTask.endTime = Date.now()
        agentTask.result = result
      }
      
      return { success: true, taskId, result }
    } catch (error) {
      console.error('❌ Agent task execution failed:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async getAgentStatus(agentId?: string): Promise<any> {
    try {
      if (agentId) {
        const task = this.activeAgentTasks.get(agentId)
        return { success: true, status: task || null }
      }
      
      // Return all active tasks
      const allTasks = Array.from(this.activeAgentTasks.values())
      return { success: true, tasks: allTasks }
    } catch (error) {
      console.error('❌ Failed to get agent status:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  private async saveAIContent(tabId: string, content: any): Promise<void> {
    try {
      // Check if localStorage is available
      if (typeof Storage === "undefined") {
        throw new Error('Local storage not supported')
      }

      // Save to local storage (localStorage for persistence)
      const key = `ai_tab_${tabId}`
      localStorage.setItem(key, JSON.stringify(content))
      
      console.log(`💾 Saved AI content for tab: ${tabId}`)
    } catch (error) {
      console.error('❌ Failed to save AI content:', error)
      throw error
    }
  }

  async loadAIContent(tabId: string): Promise<any> {
    try {
      if (typeof Storage === "undefined") {
        throw new Error('Local storage not supported')
      }

      const key = `ai_tab_${tabId}`
      const stored = localStorage.getItem(key)
      
      if (stored) {
        return JSON.parse(stored)
      }
      
      return null
    } catch (error) {
      console.error('❌ Failed to load AI content:', error)
      return null
    }
  }

  // Multi-tab agent management
  async createMultipleTabs(urls: string[]): Promise<any[]> {
    const results = []
    
    if (!Array.isArray(urls)) {
      return [{ success: false, error: 'Invalid URLs array' }]
    }
    
    for (const url of urls) {
      try {
        if (!window.electronAPI || !window.electronAPI.createTab) {
          throw new Error('Create tab API not available')
        }

        const result = await window.electronAPI.createTab(url, 'browser')
        if (result && result.success) {
          results.push({ success: true, url, tabId: result.tabId })
        } else {
          results.push({ success: false, url, error: result?.error || 'Failed to create tab' })
        }
      } catch (error) {
        results.push({ success: false, url, error: error instanceof Error ? error.message : 'Unknown error' })
      }
    }
    
    return results
  }

  async extractContentFromMultipleTabs(tabIds: string[]): Promise<any[]> {
    const results = []
    
    if (!Array.isArray(tabIds)) {
      return [{ success: false, error: 'Invalid tab IDs array' }]
    }
    
    for (const tabId of tabIds) {
      try {
        if (!window.electronAPI || !window.electronAPI.switchTab) {
          throw new Error('Switch tab API not available')
        }

        // Switch to tab first
        await window.electronAPI.switchTab(tabId)
        
        // Extract content
        const content = await this.extractPageContent(tabId)
        results.push({ tabId, ...content })
      } catch (error) {
        results.push({ tabId, success: false, error: error instanceof Error ? error.message : 'Unknown error' })
      }
    }
    
    return results
  }

  // Cleanup method
  cleanup(): void {
    this.activeAgentTasks.clear()
  }
}