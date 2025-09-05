import React, { useEffect, useRef } from 'react'
import { useBrowser } from '../../hooks/useBrowser'
import { useAI } from '../../hooks/useAI'
import { useEnvironment } from '../../hooks/useEnvironment'
import { TabBar } from './TabBar'
import { NavigationBar } from './NavigationBar'
import { NewTabPage } from './NewTabPage'
import { AISidebar } from '../ai/AISidebar'
import { SettingsPanel } from './SettingsPanel'
import './BrowserWindow.css'

export const BrowserWindow: React.FC = () => {
  const { tabs, activeTab, handleNewTab } = useBrowser()
  const { sidebarCollapsed } = useAI()
  const { isElectron } = useEnvironment()
  const webviewRef = useRef<any>(null)

  // Debug logging
  console.log('KAiro Browser: BrowserWindow render - isElectron:', isElectron)
  console.log('KAiro Browser: BrowserWindow render - activeTab:', activeTab)
  console.log('KAiro Browser: BrowserWindow render - tabs:', tabs)

  // Create initial tab on component mount
  useEffect(() => {
    if (tabs.length === 0) {
      console.log('KAiro Browser: Creating initial tab')
      handleNewTab()
    }
  }, [tabs.length, handleNewTab])

  // Handle webview load events
  const handleWebviewLoad = (e: any) => {
    console.log('KAiro Browser: Webview loaded:', e.target.src)
    const webview = e.target
    if (webview && webview.getTitle) {
      const title = webview.getTitle()
      console.log('KAiro Browser: Page title:', title)
      
      // Update tab title when page loads
      if (activeTab && title) {
        // Update the tab title in the store
        // This will be handled by the navigation logic
      }
    }
    
    // Inject CSS to hide scrollbars in the webview content
    if (webview && webview.insertCSS) {
      const hideScrollbarsCSS = `
        /* Hide all scrollbars in webview content */
        * {
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
        }
        
        *::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }
        
        *::-webkit-scrollbar-track {
          display: none !important;
        }
        
        *::-webkit-scrollbar-thumb {
          display: none !important;
        }
        
        *::-webkit-scrollbar-corner {
          display: none !important;
        }
        
        /* Hide scrollbars for specific elements */
        html, body, div, section, article, main, aside, nav {
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
        }
        
        html::-webkit-scrollbar,
        body::-webkit-scrollbar,
        div::-webkit-scrollbar,
        section::-webkit-scrollbar,
        article::-webkit-scrollbar,
        main::-webkit-scrollbar,
        aside::-webkit-scrollbar,
        nav::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }
      `
      
      try {
        webview.insertCSS(hideScrollbarsCSS)
        console.log('KAiro Browser: Scrollbar hiding CSS injected')
      } catch (error) {
        console.error('KAiro Browser: Failed to inject scrollbar CSS:', error)
      }
    }
  }

  const handleWebviewError = (e: any) => {
    console.error('KAiro Browser: Webview error:', e)
  }

  const formatUrl = (url: string) => {
    if (!url || url.trim() === '') {
      return ''
    }
    
    // If it's already a valid URL, return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url
    }
    
    // If it looks like a domain (contains dot and no spaces)
    if (url.includes('.') && !url.includes(' ')) {
      return `https://${url}`
    }
    
    // Otherwise, treat as search query
    return `https://www.google.com/search?q=${encodeURIComponent(url)}`
  }

  // Update webview src when activeTab changes
  useEffect(() => {
    if (activeTab && activeTab.url && webviewRef.current) {
      const formattedUrl = formatUrl(activeTab.url)
      console.log('KAiro Browser: Updating webview src to:', formattedUrl)
      
      if (formattedUrl && formattedUrl !== webviewRef.current.src) {
        webviewRef.current.src = formattedUrl
      }
    }
  }, [activeTab?.id, activeTab?.url])

  return (
    <div className="browser-window">
      {/* Browser Section (70% width, expandable to 100% when sidebar collapsed) */}
      <div className={`browser-section ${sidebarCollapsed ? 'expanded' : ''}`}>
        {/* Tab Bar */}
        <TabBar />
        
        {/* Navigation Bar */}
        <NavigationBar />
        
        {/* Content Area */}
        <div className="browser-content">
          {activeTab && activeTab.url ? (
            <div className="web-content-area">
              {isElectron ? (
                // WebView component for Electron
                <webview
                  ref={webviewRef}
                  key={`${activeTab.id}-${activeTab.url}`}
                  src={formatUrl(activeTab.url)}
                  className="webview"
                  allowpopups={true}
                  webpreferences="contextIsolation=yes, nodeIntegration=no"
                  onLoad={handleWebviewLoad}
                  onError={handleWebviewError}
                  onDomReady={() => {
                    console.log('KAiro Browser: Webview DOM ready')
                    // Inject CSS again when DOM is ready
                    if (webviewRef.current && webviewRef.current.insertCSS) {
                      const hideScrollbarsCSS = `
                        /* Hide all scrollbars in webview content */
                        * {
                          scrollbar-width: none !important;
                          -ms-overflow-style: none !important;
                        }
                        
                        *::-webkit-scrollbar {
                          display: none !important;
                          width: 0 !important;
                          height: 0 !important;
                        }
                        
                        *::-webkit-scrollbar-track {
                          display: none !important;
                        }
                        
                        *::-webkit-scrollbar-thumb {
                          display: none !important;
                        }
                        
                        *::-webkit-scrollbar-corner {
                          display: none !important;
                        }
                        
                        /* Hide scrollbars for specific elements */
                        html, body, div, section, article, main, aside, nav {
                          scrollbar-width: none !important;
                          -ms-overflow-style: none !important;
                        }
                        
                        html::-webkit-scrollbar,
                        body::-webkit-scrollbar,
                        div::-webkit-scrollbar,
                        section::-webkit-scrollbar,
                        article::-webkit-scrollbar,
                        main::-webkit-scrollbar,
                        aside::-webkit-scrollbar,
                        nav::-webkit-scrollbar {
                          display: none !important;
                          width: 0 !important;
                          height: 0 !important;
                        }
                      `
                      
                      try {
                        webviewRef.current.insertCSS(hideScrollbarsCSS)
                        console.log('KAiro Browser: Scrollbar hiding CSS injected on DOM ready')
                      } catch (error) {
                        console.error('KAiro Browser: Failed to inject scrollbar CSS on DOM ready:', error)
                      }
                    }
                  }}
                  onDidNavigate={(e: any) => {
                    console.log('KAiro Browser: Webview navigated to:', e.url)
                    // Inject CSS again when page navigates
                    setTimeout(() => {
                      if (webviewRef.current && webviewRef.current.insertCSS) {
                        const hideScrollbarsCSS = `
                          /* Hide all scrollbars in webview content */
                          * {
                            scrollbar-width: none !important;
                            -ms-overflow-style: none !important;
                          }
                          
                          *::-webkit-scrollbar {
                            display: none !important;
                            width: 0 !important;
                            height: 0 !important;
                          }
                          
                          *::-webkit-scrollbar-track {
                            display: none !important;
                          }
                          
                          *::-webkit-scrollbar-thumb {
                            display: none !important;
                          }
                          
                          *::-webkit-scrollbar-corner {
                            display: none !important;
                          }
                          
                          /* Hide scrollbars for specific elements */
                          html, body, div, section, article, main, aside, nav {
                            scrollbar-width: none !important;
                            -ms-overflow-style: none !important;
                          }
                          
                          html::-webkit-scrollbar,
                          body::-webkit-scrollbar,
                          div::-webkit-scrollbar,
                          section::-webkit-scrollbar,
                          article::-webkit-scrollbar,
                          main::-webkit-scrollbar,
                          aside::-webkit-scrollbar,
                          nav::-webkit-scrollbar {
                            display: none !important;
                            width: 0 !important;
                            height: 0 !important;
                          }
                        `
                        
                        try {
                          webviewRef.current.insertCSS(hideScrollbarsCSS)
                          console.log('KAiro Browser: Scrollbar hiding CSS injected on navigation')
                        } catch (error) {
                          console.error('KAiro Browser: Failed to inject scrollbar CSS on navigation:', error)
                        }
                      }
                    }, 1000) // Wait 1 second for page to load
                  }}
                />
              ) : (
                <div className="web-content-placeholder">
                  <div className="placeholder-content">
                    <h3>Web Content</h3>
                    <p>Current URL: {activeTab.url}</p>
                    <p>In web mode, this area would show iframe content</p>
                    <p>KAiro Browser: Web mode with advanced features</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <NewTabPage />
          )}
        </div>
      </div>
      
      {/* AI Sidebar (30% width, collapsible) */}
      <AISidebar />
      
      {/* Settings Panel */}
      <SettingsPanel />
    </div>
  )
}
