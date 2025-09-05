declare global {
  interface Window {
    electronAPI: {
      // Browser functions
      navigateTo: (url: string) => Promise<void>
      goBack: () => Promise<void>
      goForward: () => Promise<void>
      refresh: () => Promise<void>
      getCurrentUrl: () => Promise<string>
      getPageTitle: () => Promise<string>
      
      // AI functions
      sendAIMessage: (message: string) => Promise<string>
      getAIContext: () => Promise<string>
      summarizePage: () => Promise<string>
      analyzeContent: () => Promise<string>
      
                   // System functions
             getVersion: () => Promise<string>
             getPlatform: () => Promise<string>
             openDevTools: () => Promise<void>
             closeDevTools: () => Promise<void>

             // Browser view management
             updateBrowserViewBounds: (sidebarCollapsed: boolean) => Promise<{ success: boolean; error?: string }>

             // Test function
             testConnection: () => Promise<string>
    }
  }
}

export {}
