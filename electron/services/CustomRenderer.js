class CustomRenderer {
  constructor() {
    this.customCSS = this.getCustomCSS()
    this.contentScripts = this.getContentScripts()
  }

  // Custom CSS to force containment and styling
  getCustomCSS() {
    return `
      /* AGGRESSIVE CONTAINMENT - Prevent ALL overflow */
      * {
        max-width: 100% !important;
        max-height: 100% !important;
        overflow-x: hidden !important;
        overflow-y: auto !important;
        box-sizing: border-box !important;
        word-wrap: break-word !important;
        word-break: break-word !important;
      }
      
      /* Body containment - FULL SCREEN */
      body {
        margin: 0 !important;
        padding: 0 !important;
        width: 100% !important;
        height: 100% !important;
        min-height: 100% !important;
        overflow: hidden !important;
        position: relative !important;
      }
      
      /* HTML root containment - FULL SCREEN */
      html {
        width: 100% !important;
        height: 100% !important;
        min-height: 100% !important;
        overflow: hidden !important;
        margin: 0 !important;
        padding: 0 !important;
      }
      
      /* Force ALL containers to respect bounds */
      div, section, article, main, aside, header, footer, nav, ul, li, table, tr, td, th {
        max-width: 100% !important;
        max-height: 100% !important;
        overflow-x: hidden !important;
        overflow-y: auto !important;
        word-wrap: break-word !important;
      }
      
      /* Prevent horizontal scrolling - AGGRESSIVE */
      body, html, * {
        overflow-x: hidden !important;
        scrollbar-width: none !important;
        -ms-overflow-style: none !important;
      }
      
      /* Hide ALL horizontal scrollbars */
      body::-webkit-scrollbar, html::-webkit-scrollbar, *::-webkit-scrollbar {
        display: none !important;
        width: 0 !important;
        height: 0 !important;
      }
      
      /* Force text wrapping */
      p, h1, h2, h3, h4, h5, h6, span, div, td, th {
        word-wrap: break-word !important;
        word-break: break-word !important;
        overflow-wrap: break-word !important;
      }
      
      /* Prevent fixed positioning from breaking containment */
      *[style*="position: fixed"], *[style*="position:fixed"] {
        max-width: 100% !important;
        max-height: 100% !important;
        overflow: hidden !important;
      }
      
      /* Custom KAiro Browser styling */
      body::before {
        content: "KAiro Browser - Custom Rendering Active";
        position: fixed;
        top: 5px;
        right: 5px;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 3px 10px;
        font-size: 11px;
        border-radius: 4px;
        z-index: 999999;
        pointer-events: none;
        opacity: 0.8;
        font-family: monospace;
      }
      
      /* Enhanced focus styles for better UX */
      *:focus {
        outline: 2px solid #3498db !important;
        outline-offset: 2px !important;
      }
      
      /* Smooth scrolling */
      html {
        scroll-behavior: smooth !important;
      }
      
      /* Force viewport containment */
      @viewport {
        width: 100%;
        height: 100%;
      }
      
      /* Prevent any element from exceeding viewport */
      * {
        max-width: 100vw !important;
        max-height: 100vh !important;
      }
    `
  }

  // Content scripts for dynamic control
  getContentScripts() {
    return `
      // KAiro Browser Custom Renderer - AGGRESSIVE CONTAINMENT
      (function() {
        'use strict';
        
        console.log('KAiro Browser: Aggressive custom renderer active');
        
        // Force containment on ALL elements
        function enforceAggressiveContainment() {
          const allElements = document.querySelectorAll('*');
          allElements.forEach(el => {
            if (el.style) {
              el.style.maxWidth = '100%';
              el.style.maxHeight = '100%';
              el.style.overflowX = 'hidden';
              el.style.overflowY = 'auto';
              el.style.boxSizing = 'border-box';
              el.style.wordWrap = 'break-word';
              el.style.wordBreak = 'break-word';
              el.style.overflowWrap = 'break-word';
            }
          });
          
          // Force body and html to full screen
          if (document.body) {
            document.body.style.width = '100%';
            document.body.style.height = '100%';
            document.body.style.minHeight = '100%';
            document.body.style.margin = '0';
            document.body.style.padding = '0';
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'relative';
          }
          
          if (document.documentElement) {
            document.documentElement.style.width = '100%';
            document.documentElement.style.height = '100%';
            document.documentElement.style.minHeight = '100%';
            document.documentElement.style.margin = '0';
            document.documentElement.style.padding = '0';
            document.documentElement.style.overflow = 'hidden';
          }
        }
        
        // Monitor for dynamic content changes - AGGRESSIVE
        const observer = new MutationObserver(function(mutations) {
          mutations.forEach(function(mutation) {
            if (mutation.type === 'childList' || mutation.type === 'attributes') {
              setTimeout(enforceAggressiveContainment, 10);
            }
          });
        });
        
        // Start observing with comprehensive options
        observer.observe(document.body, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['style', 'class']
        });
        
        // Initial enforcement
        enforceAggressiveContainment();
        
        // Handle window resize
        window.addEventListener('resize', enforceAggressiveContainment);
        
        // Override any problematic CSS - AGGRESSIVE
        const style = document.createElement('style');
        style.textContent = \`
          * { 
            max-width: 100% !important; 
            max-height: 100% !important;
            overflow-x: hidden !important; 
            overflow-y: auto !important;
            word-wrap: break-word !important;
            word-break: break-word !important;
          }
          body, html { 
            overflow-x: hidden !important; 
            width: 100% !important;
            height: 100% !important;
            min-height: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          *::-webkit-scrollbar {
            display: none !important;
            width: 0 !important;
            height: 0 !important;
          }
        \`;
        document.head.appendChild(style);
        
        // Periodic enforcement every 2 seconds
        setInterval(enforceAggressiveContainment, 2000);
        
        console.log('KAiro Browser: Aggressive containment enforced');
      })();
    `
  }

  // Inject custom CSS into BrowserView
  async injectCustomCSS(browserView) {
    try {
      console.log('KAiro Browser: Injecting custom CSS')
      await browserView.webContents.insertCSS(this.customCSS)
      console.log('KAiro Browser: Custom CSS injected successfully')
      return true
    } catch (error) {
      console.error('KAiro Browser: CSS injection error:', error)
      return false
    }
  }

  // Inject content scripts into BrowserView
  async injectContentScripts(browserView) {
    try {
      console.log('KAiro Browser: Injecting content scripts')
      await browserView.webContents.executeJavaScript(this.contentScripts)
      console.log('KAiro Browser: Content scripts injected successfully')
      return true
    } catch (error) {
      console.error('KAiro Browser: Script injection error:', error)
      return false
    }
  }

  // Setup custom rendering for a BrowserView
  async setupCustomRendering(browserView) {
    try {
      console.log('KAiro Browser: Setting up custom rendering')
      
      // Wait for page to load
      await new Promise(resolve => {
        browserView.webContents.once('did-finish-load', resolve)
      })
      
      // Inject custom CSS and scripts
      await this.injectCustomCSS(browserView)
      await this.injectContentScripts(browserView)
      
      console.log('KAiro Browser: Custom rendering setup complete')
      return true
    } catch (error) {
      console.error('KAiro Browser: Custom rendering setup error:', error)
      return false
    }
  }

  // Monitor and re-apply containment if needed
  async monitorAndEnforce(browserView) {
    try {
      // Re-apply containment more frequently
      setInterval(async () => {
        try {
          await browserView.webContents.executeJavaScript(`
            // Re-enforce aggressive containment
            document.querySelectorAll('*').forEach(el => {
              if (el.style) {
                el.style.maxWidth = '100%';
                el.style.maxHeight = '100%';
                el.style.overflowX = 'hidden';
                el.style.overflowY = 'auto';
                el.style.wordWrap = 'break-word';
                el.style.wordBreak = 'break-word';
              }
            });
            
            // Force body and html to full screen
            if (document.body) {
              document.body.style.width = '100%';
              document.body.style.height = '100%';
              document.body.style.minHeight = '100%';
              document.body.style.overflow = 'hidden';
            }
            
            if (document.documentElement) {
              document.documentElement.style.width = '100%';
              document.documentElement.style.height = '100%';
              document.documentElement.style.minHeight = '100%';
              document.documentElement.style.overflow = 'hidden';
            }
          `)
        } catch (error) {
          // Ignore errors for monitoring
        }
      }, 3000) // Check every 3 seconds
      
      console.log('KAiro Browser: Aggressive monitoring and enforcement active')
    } catch (error) {
      console.error('KAiro Browser: Monitoring setup error:', error)
    }
  }
}

module.exports = { CustomRenderer }
