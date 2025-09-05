import { useAIStore } from '../stores/aiStore'
import { useEnvironment } from './useEnvironment'
import { useBrowser } from './useBrowser'

export const useAI = () => {
  const { 
    messages, 
    isTyping, 
    sidebarCollapsed, 
    addMessage, 
    setTyping, 
    toggleSidebar, 
    clearMessages 
  } = useAIStore()
  
  const { isElectron } = useEnvironment()
  const { tabs, activeTab, handleNavigate, handleNewTab, handleCloseTab, handleTabClick } = useBrowser()

  const handleSendMessage = async (content: string) => {
    console.log('Phase 5: Sending AI message:', content)
    console.log('Phase 5: Environment check:')
    console.log('  - isElectron:', isElectron)
    console.log('  - window.electronAPI exists:', typeof window !== 'undefined' && typeof window.electronAPI !== 'undefined')
    console.log('  - window.electronAPI value:', typeof window !== 'undefined' ? window.electronAPI : 'no window')
    
    // Add user message
    addMessage({ type: 'user', content })
    
    setTyping(true)
    
    try {
      let response: string
      
      if (isElectron && window.electronAPI) {
        console.log('Phase 5: Using Electron API for AI communication')
        
        // Get browser context for AI
        const browserContext = getBrowserContext()
        console.log('Phase 5: Browser context:', browserContext)
        
        // Check if this is a browser command FIRST
        const browserAction = await handleBrowserCommand(content)
        if (browserAction) {
          response = browserAction
        } else {
          // Use Electron API for AI communication with browser context
          const browserContextStr = JSON.stringify(browserContext)
          response = await window.electronAPI.sendAIMessage(content, browserContextStr)
          console.log('Phase 5: AI response received:', response)
        }
      } else {
        console.log('Phase 5: Using web mode placeholder response')
        // Web mode - simulate AI response
        response = `I received your message: "${content}". This is a placeholder response for Phase 5. In Electron mode, I'll connect to the real Groq API with advanced features.`
      }
      
      addMessage({ 
        type: 'ai', 
        content: response
      })
    } catch (error) {
      console.error('Phase 5: AI message error:', error)
      addMessage({ 
        type: 'ai', 
        content: `I'm sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
    } finally {
      setTyping(false)
    }
  }

  const getBrowserContext = () => {
    const context = {
      currentTab: activeTab,
      totalTabs: tabs.length,
      isElectron: isElectron,
      currentUrl: activeTab?.url || '',
      currentTitle: activeTab?.title || '',
      isLoading: activeTab?.isLoading || false
    }
    return context
  }

  const handleBrowserCommand = async (message: string): Promise<string | null> => {
    const lowerMessage = message.toLowerCase()
    console.log('Phase 5: Checking for browser command in:', lowerMessage)
    
    // Navigation commands - more flexible matching
    if (lowerMessage.includes('go to') || lowerMessage.includes('navigate to') || lowerMessage.includes('open') || lowerMessage.includes('visit')) {
      const urlMatch = message.match(/(?:go to|navigate to|open|visit)\s+(.+)/i)
      if (urlMatch) {
        const url = urlMatch[1].trim()
        const formattedUrl = formatUrl(url)
        console.log('Phase 5: AI navigation command detected:', formattedUrl)
        await handleNavigate(formattedUrl)
        return `I'm navigating to ${formattedUrl} for you! 🚀`
      }
    }
    
    // Search commands
    if (lowerMessage.includes('search for') || lowerMessage.includes('search')) {
      const searchMatch = message.match(/(?:search for|search)\s+(.+)/i)
      if (searchMatch) {
        const query = searchMatch[1].trim()
        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`
        console.log('Phase 5: AI search command:', searchUrl)
        await handleNavigate(searchUrl)
        return `I'm searching for "${query}" for you! 🔍`
      }
    }
    
    // Tab management commands
    if (lowerMessage.includes('new tab') || lowerMessage.includes('open new tab')) {
      console.log('Phase 5: AI new tab command')
      await handleNewTab()
      return `I've opened a new tab for you! 📑`
    }
    
    if (lowerMessage.includes('close tab') || lowerMessage.includes('close current tab')) {
      if (activeTab) {
        console.log('Phase 5: AI close tab command')
        await handleCloseTab(activeTab.id)
        return `I've closed the current tab! ✂️`
      }
    }
    
    // Browser info commands
    if (lowerMessage.includes('current page') || lowerMessage.includes('what page') || lowerMessage.includes('where am i')) {
      if (activeTab) {
        return `You're currently on: **${activeTab.title || 'Loading...'}**\nURL: ${activeTab.url || 'No URL'}\nTab ${tabs.findIndex(t => t.id === activeTab.id) + 1} of ${tabs.length}`
      }
    }
    
    if (lowerMessage.includes('tabs') || lowerMessage.includes('how many tabs')) {
      return `You have ${tabs.length} tab${tabs.length !== 1 ? 's' : ''} open. ${tabs.length > 0 ? `Current tab: ${activeTab?.title || 'Loading...'}` : ''}`
    }
    
    console.log('Phase 5: No browser command detected')
    // No browser command detected
    return null
  }

  const formatUrl = (input: string): string => {
    // If it's already a URL, return as is
    if (input.startsWith('http://') || input.startsWith('https://')) {
      return input
    }
    
    // If it looks like a domain, add https://
    if (input.includes('.') && !input.includes(' ')) {
      return `https://${input}`
    }
    
    // Otherwise, treat as a search query
    return `https://www.google.com/search?q=${encodeURIComponent(input)}`
  }

  const handleSummarizePage = async () => {
    console.log('Phase 5: Summarizing current page')
    
    if (isElectron && window.electronAPI) {
      try {
        const summary = await window.electronAPI.summarizePage()
        addMessage({ 
          type: 'ai', 
          content: `**Page Summary:**\n\n${summary}`
        })
      } catch (error) {
        console.error('Phase 5: Page summarization error:', error)
        addMessage({ 
          type: 'ai', 
          content: `Error generating summary: ${error instanceof Error ? error.message : 'Unknown error'}`
        })
      }
    } else {
      addMessage({ 
        type: 'ai', 
        content: 'Page summarization is only available in Electron mode with advanced AI features.'
      })
    }
  }

  const handleAnalyzeContent = async () => {
    console.log('Phase 5: Analyzing page content')
    
    if (isElectron && window.electronAPI) {
      try {
        const analysis = await window.electronAPI.analyzeContent()
        addMessage({ 
          type: 'ai', 
          content: `**Content Analysis:**\n\n${analysis}`
        })
    } catch (error) {
        console.error('Phase 5: Content analysis error:', error)
        addMessage({ 
          type: 'ai', 
          content: `Error analyzing content: ${error instanceof Error ? error.message : 'Unknown error'}`
        })
      }
    } else {
      addMessage({ 
        type: 'ai', 
        content: 'Content analysis is only available in Electron mode with advanced AI features.'
      })
    }
  }

  const handleToggleSidebar = () => {
    console.log('Phase 5: Toggling AI sidebar')
    toggleSidebar()
    
    // Update BrowserView bounds when sidebar toggles (Electron only)
    if (isElectron && window.electronAPI && window.electronAPI.updateBrowserViewBounds) {
      const newCollapsedState = !sidebarCollapsed
      window.electronAPI.updateBrowserViewBounds(newCollapsedState)
        .then((result) => {
          if (result.success) {
            console.log('Phase 5: BrowserView bounds updated successfully')
          } else {
            console.error('Phase 5: Failed to update BrowserView bounds:', result.error)
          }
        })
        .catch((error) => {
          console.error('Phase 5: Error updating BrowserView bounds:', error)
        })
    }
  }

  const testAIConnection = async () => {
    if (isElectron && window.electronAPI) {
      try {
        const result = await window.electronAPI.testConnection()
        console.log('Phase 5: AI connection test result:', result)
        return result
    } catch (error) {
        console.error('Phase 5: AI connection test failed:', error)
        return 'Connection test failed'
      }
    } else {
      return 'Not in Electron mode'
    }
  }

  return {
    messages,
    isTyping,
    sidebarCollapsed,
    handleSendMessage,
    handleSummarizePage,
    handleAnalyzeContent,
    handleToggleSidebar,
    clearMessages,
    testAIConnection
  }
}
