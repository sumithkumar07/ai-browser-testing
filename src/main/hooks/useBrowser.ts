import { useBrowserStore } from '../stores/browserStore'
import { useEnvironment } from './useEnvironment'

export const useBrowser = () => {
  const { 
    tabs, 
    activeTabId, 
    addTab, 
    closeTab, 
    setActiveTab, 
    updateTab, 
    navigateTab 
  } = useBrowserStore()
  
  const { isElectron } = useEnvironment()

  const activeTab = tabs.find(tab => tab.id === activeTabId)

  const handleNewTab = async () => {
    console.log('Phase 4: Creating new tab')
    addTab()
    
    // Create BrowserView for new tab in Electron
    if (isElectron && window.electronAPI) {
      try {
        // Get the newly created tab ID
        const newTabId = `tab-${Date.now()}`
        await window.electronAPI.createTabBrowserView(newTabId)
        console.log('Phase 4: BrowserView created for new tab:', newTabId)
      } catch (error) {
        console.error('Phase 4: Error creating BrowserView for new tab:', error)
      }
    }
  }

  const handleCloseTab = (id: string) => {
    console.log('Phase 4: Closing tab:', id)
    closeTab(id)
  }

  const handleTabClick = async (id: string) => {
    console.log('Phase 4: Switching to tab:', id)
    setActiveTab(id)
    
    // Switch BrowserView in Electron
    if (isElectron && window.electronAPI) {
      try {
        await window.electronAPI.setActiveTab(id)
        console.log('Phase 4: BrowserView switched to tab:', id)
      } catch (error) {
        console.error('Phase 4: Error switching BrowserView:', error)
      }
    }
  }

  const handleNavigate = async (url: string) => {
    if (activeTabId) {
      console.log('KAiro Browser: Navigating to:', url)
      
      // Update the tab immediately with the new URL
      navigateTab(activeTabId, url)
      updateTab(activeTabId, {
        title: 'Loading...',
        isLoading: true
      })
      
      // In Electron mode, the WebView will handle the actual navigation
      // The webview src will be updated by the useEffect in BrowserWindow
      if (isElectron && window.electronAPI) {
        try {
          await window.electronAPI.navigateTo(url)
        } catch (error) {
          console.error('KAiro Browser: Navigation error:', error)
          updateTab(activeTabId, {
            title: 'Navigation failed',
            isLoading: false
          })
        }
      } else {
        // Web mode - just update the state
        updateTab(activeTabId, {
          title: 'Web Mode - Navigation',
          isLoading: false
        })
      }
    }
  }

  const handleGoBack = async () => {
    if (isElectron && window.electronAPI) {
      try {
        await window.electronAPI.goBack()
        console.log('Phase 4: Went back')
      } catch (error) {
        console.error('Phase 4: Go back error:', error)
      }
    }
  }

  const handleGoForward = async () => {
    if (isElectron && window.electronAPI) {
      try {
        await window.electronAPI.goForward()
        console.log('Phase 4: Went forward')
      } catch (error) {
        console.error('Phase 4: Go forward error:', error)
      }
    }
  }

  const handleRefresh = async () => {
    if (isElectron && window.electronAPI) {
      try {
        await window.electronAPI.refresh()
        console.log('Phase 4: Refreshed page')
      } catch (error) {
        console.error('Phase 4: Refresh error:', error)
      }
    }
  }

  return {
    tabs,
    activeTab,
    activeTabId,
    handleNewTab,
    handleCloseTab,
    handleTabClick,
    handleNavigate,
    handleGoBack,
    handleGoForward,
    handleRefresh,
    updateTab
  }
}
