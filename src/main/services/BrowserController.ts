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
    // FIXED: Add Electron API safety check
    if (!window.electronAPI) {
      console.warn('⚠️ Electron API not available - agent controls will be limited')
      return
    }

    // Enhance window.electronAPI with agent-specific controls
    try {
      window.electronAPI.createAITab = this.createAITab.bind(this)
      window.electronAPI.extractPageContent = this.extractPageContent.bind(this)
      window.electronAPI.executeAgentTask = this.executeAgentTask.bind(this)
      window.electronAPI.getAgentStatus = this.getAgentStatus.bind(this)
    } catch (error) {
      console.warn('Failed to setup some agent controls:', error)
    }
  }

  async createAITab(title: string, content: string = ''): Promise<any> {
    try {
      // FIXED: Enhanced Electron API safety check
      if (!window.electronAPI?.createTab) {
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
      // FIXED: Enhanced Electron API safety check
      if (!window.electronAPI?.getCurrentUrl) {
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
      
      // FIXED: Use proper dynamic import to avoid circular dependency
      try {
        const IntegratedAgentFrameworkModule = await import('./IntegratedAgentFramework')
        const IntegratedAgentFramework = IntegratedAgentFrameworkModule.default
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
      } catch (importError) {
        // If import fails, handle gracefully
        console.warn('Failed to import IntegratedAgentFramework:', importError)
        return { success: false, error: 'Agent framework not available' }
      }
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
      // FIXED: Enhanced storage safety check
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
      // FIXED: Enhanced storage safety check
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
    
    // FIXED: Enhanced input validation
    if (!Array.isArray(urls) || urls.length === 0) {
      return [{ success: false, error: 'Invalid or empty URLs array' }]
    }
    
    for (const url of urls) {
      try {
        // FIXED: Enhanced Electron API safety check
        if (!window.electronAPI?.createTab) {
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
      
      // FIXED: Add delay to prevent overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    return results
  }

  async extractContentFromMultipleTabs(tabIds: string[]): Promise<any[]> {
    const results = []
    
    // FIXED: Enhanced input validation
    if (!Array.isArray(tabIds) || tabIds.length === 0) {
      return [{ success: false, error: 'Invalid or empty tab IDs array' }]
    }
    
    for (const tabId of tabIds) {
      try {
        // FIXED: Enhanced Electron API safety check
        if (!window.electronAPI?.switchTab) {
          throw new Error('Switch tab API not available')
        }

        // Switch to tab first
        await window.electronAPI.switchTab(tabId)
        
        // FIXED: Add timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Operation timeout')), 30000)
        )
        
        // Extract content with timeout
        const content = await Promise.race([
          this.extractPageContent(tabId),
          timeoutPromise
        ])
        
        results.push({ tabId, ...content })
      } catch (error) {
        results.push({ tabId, success: false, error: error instanceof Error ? error.message : 'Unknown error' })
      }
      
      // FIXED: Add delay between operations
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    
    return results
  }

  // FIXED: Enhanced cleanup method
  cleanup(): void {
    this.activeAgentTasks.clear()
    console.log('🧹 BrowserController cleaned up')
  }
}