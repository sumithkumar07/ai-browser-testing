// src/main/services/ActionExecutor.ts
export interface Action {
  type: string
  target: string
  description: string
  metadata?: any
}

export interface ActionResult {
  success: boolean
  result?: string
  error?: string
  metadata?: any
}

export interface ExecutionContext {
  tabId?: string
  url?: string
  timestamp: number
  userId?: string
}

export class ActionExecutor {
  private static instance: ActionExecutor
  private isInitialized: boolean = false
  private executionHistory: ActionResult[] = []
  private maxHistorySize: number = 100

  private constructor() {}

  static getInstance(): ActionExecutor {
    if (!ActionExecutor.instance) {
      ActionExecutor.instance = new ActionExecutor()
    }
    return ActionExecutor.instance
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('⚠️ ActionExecutor already initialized')
      return
    }

    console.log('⚡ Initializing Action Executor...')
    
    try {
      this.isInitialized = true
      console.log('✅ Action Executor initialized')
    } catch (error) {
      console.error('❌ Action Executor initialization failed:', error)
      throw error
    }
  }

  async executeAction(action: Action, context: ExecutionContext): Promise<ActionResult> {
    try {
      console.log(`⚡ Executing action: ${action.type} - ${action.description}`)
      
      if (!this.isInitialized) {
        throw new Error('ActionExecutor not initialized')
      }

      let result: ActionResult

      switch (action.type) {
        case 'navigate':
          result = await this.executeNavigation(action, context)
          break
        case 'search':
          result = await this.executeSearch(action, context)
          break
        case 'analyze_content':
          result = await this.executeContentAnalysis(action, context)
          break
        case 'summarize':
          result = await this.executeSummarization(action, context)
          break
        case 'search_products':
          result = await this.executeProductSearch(action, context)
          break
        case 'analyze_image':
          result = await this.executeImageAnalysis(action, context)
          break
        case 'process_document':
          result = await this.executeDocumentProcessing(action, context)
          break
        default:
          result = {
            success: false,
            error: `Unknown action type: ${action.type}`
          }
      }

      // Add to execution history
      this.addToHistory(result)

      console.log(`✅ Action executed: ${action.type}`)
      return result
      
    } catch (error) {
      console.error(`❌ Action execution failed: ${action.type}`, error)
      const errorResult: ActionResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
      this.addToHistory(errorResult)
      return errorResult
    }
  }

  async executeActions(actions: Action[], context: ExecutionContext): Promise<ActionResult[]> {
    try {
      console.log(`⚡ Executing ${actions.length} actions...`)
      
      const results: ActionResult[] = []
      
      for (const action of actions) {
        const result = await this.executeAction(action, context)
        results.push(result)
        
        // Stop execution if an action fails
        if (!result.success) {
          console.log(`⚠️ Stopping execution due to failed action: ${action.type}`)
          break
        }
      }

      console.log(`✅ Executed ${results.length} actions`)
      return results
      
    } catch (error) {
      console.error('❌ Batch action execution failed:', error)
      return [{
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }]
    }
  }

  private async executeNavigation(action: Action, context: ExecutionContext): Promise<ActionResult> {
    try {
      const result = await window.electronAPI.navigateTo(action.target)
      return {
        success: result.success,
        result: result.success ? `Navigated to ${action.target}` : undefined,
        error: result.error,
        metadata: { url: action.target, timestamp: Date.now() }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Navigation failed'
      }
    }
  }

  private async executeSearch(action: Action, context: ExecutionContext): Promise<ActionResult> {
    try {
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(action.target)}`
      const result = await window.electronAPI.navigateTo(searchUrl)
      return {
        success: result.success,
        result: result.success ? `Searched for: ${action.target}` : undefined,
        error: result.error,
        metadata: { query: action.target, timestamp: Date.now() }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Search failed'
      }
    }
  }

  private async executeContentAnalysis(action: Action, context: ExecutionContext): Promise<ActionResult> {
    try {
      const result = await window.electronAPI.analyzeContent()
      return {
        success: result.success,
        result: result.analysis,
        error: result.error,
        metadata: { timestamp: Date.now() }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Content analysis failed'
      }
    }
  }

  private async executeSummarization(action: Action, context: ExecutionContext): Promise<ActionResult> {
    try {
      const result = await window.electronAPI.summarizePage()
      return {
        success: result.success,
        result: result.summary,
        error: result.error,
        metadata: { timestamp: Date.now() }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Summarization failed'
      }
    }
  }

  private async executeProductSearch(action: Action, context: ExecutionContext): Promise<ActionResult> {
    try {
      const result = await window.electronAPI.searchProducts(action.target)
      return {
        success: result.success,
        result: result.success ? `Found ${result.products?.length || 0} products` : undefined,
        error: result.error,
        metadata: { query: action.target, productCount: result.products?.length || 0 }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Product search failed'
      }
    }
  }

  private async executeImageAnalysis(action: Action, context: ExecutionContext): Promise<ActionResult> {
    try {
      const result = await window.electronAPI.analyzeImage(action.target)
      return {
        success: result.success,
        result: result.analysis,
        error: result.error,
        metadata: { timestamp: Date.now() }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Image analysis failed'
      }
    }
  }

  private async executeDocumentProcessing(action: Action, context: ExecutionContext): Promise<ActionResult> {
    try {
      const result = await window.electronAPI.processPDF(action.target)
      return {
        success: result.success,
        result: result.content,
        error: result.error,
        metadata: { filePath: action.target, timestamp: Date.now() }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Document processing failed'
      }
    }
  }

  private addToHistory(result: ActionResult): void {
    this.executionHistory.push(result)
    
    // Keep only recent history
    if (this.executionHistory.length > this.maxHistorySize) {
      this.executionHistory = this.executionHistory.slice(-this.maxHistorySize)
    }
  }

  // Public utility methods
  getExecutionHistory(): ActionResult[] {
    return [...this.executionHistory]
  }

  getLastExecution(): ActionResult | null {
    return this.executionHistory.length > 0 
      ? this.executionHistory[this.executionHistory.length - 1] 
      : null
  }

  clearHistory(): void {
    this.executionHistory = []
  }

  getSuccessRate(): number {
    if (this.executionHistory.length === 0) return 0
    
    const successful = this.executionHistory.filter(r => r.success).length
    return (successful / this.executionHistory.length) * 100
  }

  isReady(): boolean {
    return this.isInitialized
  }

  getHistorySize(): number {
    return this.executionHistory.length
  }
}

export default ActionExecutor
