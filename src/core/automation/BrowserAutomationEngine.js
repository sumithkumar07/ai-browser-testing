// 🚀 ADVANCED BROWSER AUTOMATION ENGINE
// Full browser control for all AI agents - Transform from advisor to executor!

const { BrowserView } = require('electron');
const { PageContentAnalyzer } = require('./PageContentAnalyzer');
const { InteractionSimulator } = require('./InteractionSimulator');
const { IntelligentDataExtractor } = require('./IntelligentDataExtractor');
const { ResultCompiler } = require('./ResultCompiler');

class BrowserAutomationEngine {
  constructor(browserManager) {
    this.manager = browserManager;
    this.activeTasks = new Map();
    this.resultTabs = new Map();
    this.automationQueue = [];
    this.isProcessing = false;
    this.extractionCache = new Map();
    
    // Advanced capabilities
    this.pageAnalyzer = new PageContentAnalyzer();
    this.interactionSimulator = new InteractionSimulator();
    this.dataExtractor = new IntelligentDataExtractor();
    this.resultCompiler = new ResultCompiler(browserManager);
    
    console.log('🤖 Advanced Browser Automation Engine initializing...');
  }

  async initialize() {
    try {
      await this.pageAnalyzer.initialize();
      await this.interactionSimulator.initialize();
      await this.dataExtractor.initialize();
      await this.resultCompiler.initialize();
      
      // Start automation processor
      this.startAutomationProcessor();
      
      console.log('✅ Browser Automation Engine ready - AI agents now have FULL browser control!');
      return { success: true };
    } catch (error) {
      console.error('❌ Browser Automation Engine initialization failed:', error);
      return { success: false, error: error.message };
    }
  }

  // 🎯 MAIN AUTOMATION METHOD - Called by AI agents
  async executeAutomationPlan(plan, context = {}) {
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      console.log(`🚀 Executing automation plan: ${plan.title}`);
      console.log(`📋 Steps: ${plan.steps.length}, Expected duration: ${plan.estimatedDuration}ms`);

      // Register task
      this.activeTasks.set(taskId, {
        plan,
        context,
        startTime: Date.now(),
        status: 'executing',
        currentStep: 0,
        results: []
      });

      // Execute plan steps
      const results = await this.executePlanSteps(taskId, plan.steps, context);
      
      // Compile results into AI tab
      const resultTab = await this.compileResults(taskId, results, plan);
      
      // Update task status
      this.activeTasks.set(taskId, {
        ...this.activeTasks.get(taskId),
        status: 'completed',
        endTime: Date.now(),
        resultTab: resultTab.tabId
      });

      console.log(`✅ Automation plan completed: ${plan.title} → Result tab created`);
      
      return {
        success: true,
        taskId,
        resultTab,
        results,
        executionTime: Date.now() - this.activeTasks.get(taskId).startTime
      };

    } catch (error) {
      console.error(`❌ Automation plan failed: ${plan.title}`, error);
      
      // Update task status
      if (this.activeTasks.has(taskId)) {
        this.activeTasks.set(taskId, {
          ...this.activeTasks.get(taskId),
          status: 'failed',
          error: error.message,
          endTime: Date.now()
        });
      }

      return {
        success: false,
        taskId,
        error: error.message
      };
    }
  }

  // 🎬 Execute individual plan steps
  async executePlanSteps(taskId, steps, context) {
    const results = [];
    const task = this.activeTasks.get(taskId);

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      
      try {
        console.log(`🔄 Step ${i + 1}/${steps.length}: ${step.action}`);
        
        // Update task progress
        this.activeTasks.set(taskId, {
          ...task,
          currentStep: i,
          status: `executing_step_${i + 1}`
        });

        const stepResult = await this.executeStep(step, context, results);
        results.push({
          stepIndex: i,
          step,
          result: stepResult,
          timestamp: Date.now()
        });

        // Add delay between steps to avoid overwhelming
        if (i < steps.length - 1) {
          await this.delay(step.delay || 1000);
        }

      } catch (stepError) {
        console.error(`❌ Step ${i + 1} failed:`, stepError);
        results.push({
          stepIndex: i,
          step,
          error: stepError.message,
          timestamp: Date.now()
        });
        
        // Continue with next step unless marked as critical
        if (step.critical) {
          throw stepError;
        }
      }
    }

    return results;
  }

  // 🎯 Execute individual automation step
  async executeStep(step, context, previousResults) {
    switch (step.action) {
      case 'openTab':
        return await this.openTab(step.url, step.options);
        
      case 'navigateTo':
        return await this.navigateTo(step.url, step.tabId);
        
      case 'extractPageData':
        return await this.extractPageData(step.tabId, step.extractors);
        
      case 'clickElement':
        return await this.clickElement(step.tabId, step.selector, step.options);
        
      case 'fillForm':
        return await this.fillForm(step.tabId, step.formData, step.options);
        
      case 'captureContent':
        return await this.captureContent(step.tabId, step.captureType, step.options);
        
      case 'analyzeContent':
        return await this.analyzeContent(step.tabId, step.analysisType, step.options);
        
      case 'searchAndExtract':
        return await this.searchAndExtract(step.query, step.sources, step.extractors);
        
      case 'compareData':
        return await this.compareData(previousResults, step.comparisonRules);
        
      case 'createResultTab':
        return await this.createResultTab(step.content, step.title, step.options);
        
      default:
        throw new Error(`Unknown automation action: ${step.action}`);
    }
  }

  // 🌐 BROWSER CONTROL METHODS

  async openTab(url, options = {}) {
    try {
      console.log(`🌐 Opening tab: ${url}`);
      
      const result = await this.manager.mainWindow.webContents.send('automation-open-tab', {
        url,
        options
      });

      // Create BrowserView for this tab
      const browserView = new BrowserView({
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          sandbox: true
        }
      });

      const tabId = `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Store browser view
      this.manager.browserViews.set(tabId, browserView);
      
      // Load URL
      await browserView.webContents.loadURL(url);
      
      // Wait for page load
      await this.waitForPageLoad(browserView.webContents);
      
      console.log(`✅ Tab opened: ${tabId} → ${url}`);
      
      return {
        success: true,
        tabId,
        url,
        title: browserView.webContents.getTitle()
      };

    } catch (error) {
      console.error('❌ Failed to open tab:', error);
      return { success: false, error: error.message };
    }
  }

  async navigateTo(url, tabId) {
    try {
      console.log(`🧭 Navigating tab ${tabId} to: ${url}`);
      
      const browserView = this.manager.browserViews.get(tabId);
      if (!browserView) {
        throw new Error(`Tab ${tabId} not found`);
      }

      await browserView.webContents.loadURL(url);
      await this.waitForPageLoad(browserView.webContents);
      
      console.log(`✅ Navigation completed: ${tabId} → ${url}`);
      
      return {
        success: true,
        tabId,
        url,
        title: browserView.webContents.getTitle()
      };

    } catch (error) {
      console.error('❌ Navigation failed:', error);
      return { success: false, error: error.message };
    }
  }

  async extractPageData(tabId, extractors) {
    try {
      console.log(`📊 Extracting data from tab: ${tabId}`);
      
      const browserView = this.manager.browserViews.get(tabId);
      if (!browserView) {
        throw new Error(`Tab ${tabId} not found`);
      }

      const extractedData = await this.dataExtractor.extractData(
        browserView.webContents, 
        extractors
      );
      
      // Cache extraction results
      const cacheKey = `${tabId}_${Date.now()}`;
      this.extractionCache.set(cacheKey, extractedData);
      
      console.log(`✅ Data extracted: ${Object.keys(extractedData).length} data points`);
      
      return {
        success: true,
        tabId,
        data: extractedData,
        cacheKey,
        extractedAt: Date.now()
      };

    } catch (error) {
      console.error('❌ Data extraction failed:', error);
      return { success: false, error: error.message };
    }
  }

  async clickElement(tabId, selector, options = {}) {
    try {
      console.log(`🖱️ Clicking element: ${selector} in tab ${tabId}`);
      
      const browserView = this.manager.browserViews.get(tabId);
      if (!browserView) {
        throw new Error(`Tab ${tabId} not found`);
      }

      const result = await this.interactionSimulator.clickElement(
        browserView.webContents,
        selector,
        options
      );
      
      // Wait for any resulting page changes
      await this.delay(options.waitAfter || 1000);
      
      console.log(`✅ Element clicked: ${selector}`);
      
      return {
        success: true,
        tabId,
        selector,
        result
      };

    } catch (error) {
      console.error('❌ Element click failed:', error);
      return { success: false, error: error.message };
    }
  }

  async fillForm(tabId, formData, options = {}) {
    try {
      console.log(`📝 Filling form in tab: ${tabId}`);
      
      const browserView = this.manager.browserViews.get(tabId);
      if (!browserView) {
        throw new Error(`Tab ${tabId} not found`);
      }

      const result = await this.interactionSimulator.fillForm(
        browserView.webContents,
        formData,
        options
      );
      
      console.log(`✅ Form filled: ${Object.keys(formData).length} fields`);
      
      return {
        success: true,
        tabId,
        formData,
        result
      };

    } catch (error) {
      console.error('❌ Form filling failed:', error);
      return { success: false, error: error.message };
    }
  }

  async captureContent(tabId, captureType = 'full', options = {}) {
    try {
      console.log(`📸 Capturing content: ${captureType} from tab ${tabId}`);
      
      const browserView = this.manager.browserViews.get(tabId);
      if (!browserView) {
        throw new Error(`Tab ${tabId} not found`);
      }

      let capturedContent;

      switch (captureType) {
        case 'screenshot':
          capturedContent = await browserView.webContents.capturePage();
          break;
          
        case 'html':
          capturedContent = await browserView.webContents.executeJavaScript(`document.documentElement.outerHTML`);
          break;
          
        case 'text':
          capturedContent = await browserView.webContents.executeJavaScript(`document.body.innerText`);
          break;
          
        case 'full':
          capturedContent = {
            html: await browserView.webContents.executeJavaScript(`document.documentElement.outerHTML`),
            text: await browserView.webContents.executeJavaScript(`document.body.innerText`),
            title: browserView.webContents.getTitle(),
            url: browserView.webContents.getURL()
          };
          break;
          
        default:
          throw new Error(`Unknown capture type: ${captureType}`);
      }
      
      console.log(`✅ Content captured: ${captureType}`);
      
      return {
        success: true,
        tabId,
        captureType,
        content: capturedContent,
        capturedAt: Date.now()
      };

    } catch (error) {
      console.error('❌ Content capture failed:', error);
      return { success: false, error: error.message };
    }
  }

  async analyzeContent(tabId, analysisType, options = {}) {
    try {
      console.log(`🔍 Analyzing content: ${analysisType} from tab ${tabId}`);
      
      const contentResult = await this.captureContent(tabId, 'full');
      if (!contentResult.success) {
        throw new Error('Failed to capture content for analysis');
      }

      const analysis = await this.pageAnalyzer.analyzeContent(
        contentResult.content,
        analysisType,
        options
      );
      
      console.log(`✅ Content analyzed: ${analysisType}`);
      
      return {
        success: true,
        tabId,
        analysisType,
        analysis,
        analyzedAt: Date.now()
      };

    } catch (error) {
      console.error('❌ Content analysis failed:', error);
      return { success: false, error: error.message };
    }
  }

  async searchAndExtract(query, sources, extractors) {
    try {
      console.log(`🔍 Multi-source search: "${query}" across ${sources.length} sources`);
      
      const searchResults = [];
      
      for (const source of sources) {
        try {
          // Open search tab
          const searchUrl = this.buildSearchUrl(source, query);
          const tabResult = await this.openTab(searchUrl);
          
          if (tabResult.success) {
            // Extract data from search results
            const extractionResult = await this.extractPageData(tabResult.tabId, extractors);
            
            searchResults.push({
              source,
              tabId: tabResult.tabId,
              url: searchUrl,
              data: extractionResult.data,
              success: true
            });
          }
          
        } catch (sourceError) {
          console.warn(`⚠️ Search failed for source ${source}:`, sourceError);
          searchResults.push({
            source,
            success: false,
            error: sourceError.message
          });
        }
      }
      
      console.log(`✅ Multi-source search completed: ${searchResults.filter(r => r.success).length}/${sources.length} successful`);
      
      return {
        success: true,
        query,
        sources,
        results: searchResults,
        successCount: searchResults.filter(r => r.success).length
      };

    } catch (error) {
      console.error('❌ Multi-source search failed:', error);
      return { success: false, error: error.message };
    }
  }

  async compareData(results, comparisonRules) {
    try {
      console.log(`📊 Comparing data across ${results.length} results`);
      
      const comparison = await this.dataExtractor.compareData(results, comparisonRules);
      
      console.log(`✅ Data comparison completed: ${comparison.comparisons.length} comparisons`);
      
      return {
        success: true,
        comparison,
        comparedAt: Date.now()
      };

    } catch (error) {
      console.error('❌ Data comparison failed:', error);
      return { success: false, error: error.message };
    }
  }

  async createResultTab(content, title, options = {}) {
    try {
      console.log(`📄 Creating result tab: ${title}`);
      
      const resultTab = await this.resultCompiler.createResultTab(content, title, options);
      
      console.log(`✅ Result tab created: ${resultTab.tabId}`);
      
      return {
        success: true,
        resultTab
      };

    } catch (error) {
      console.error('❌ Result tab creation failed:', error);
      return { success: false, error: error.message };
    }
  }

  // 📊 Compile all results into comprehensive AI tab
  async compileResults(taskId, results, plan) {
    try {
      console.log(`📊 Compiling results for task: ${taskId}`);
      
      const compiledContent = await this.resultCompiler.compileResults(results, plan);
      const resultTab = await this.createResultTab(
        compiledContent.content,
        compiledContent.title,
        { type: 'ai', compiled: true }
      );
      
      // Store result tab reference
      this.resultTabs.set(taskId, resultTab);
      
      return resultTab.resultTab;

    } catch (error) {
      console.error('❌ Result compilation failed:', error);
      throw error;
    }
  }

  // 🛠️ UTILITY METHODS

  buildSearchUrl(source, query) {
    const searchUrls = {
      google: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
      bing: `https://www.bing.com/search?q=${encodeURIComponent(query)}`,
      amazon: `https://www.amazon.com/s?k=${encodeURIComponent(query)}`,
      wikipedia: `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(query)}`,
      github: `https://github.com/search?q=${encodeURIComponent(query)}`,
      stackoverflow: `https://stackoverflow.com/search?q=${encodeURIComponent(query)}`
    };
    
    return searchUrls[source] || `https://www.google.com/search?q=${encodeURIComponent(query + ' site:' + source)}`;
  }

  async waitForPageLoad(webContents, timeout = 30000) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('Page load timeout'));
      }, timeout);

      const onLoad = () => {
        clearTimeout(timer);
        webContents.removeListener('dom-ready', onLoad);
        resolve();
      };

      webContents.once('dom-ready', onLoad);
    });
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  startAutomationProcessor() {
    setInterval(async () => {
      if (this.automationQueue.length > 0 && !this.isProcessing) {
        this.isProcessing = true;
        const task = this.automationQueue.shift();
        
        try {
          await this.executeAutomationPlan(task.plan, task.context);
        } catch (error) {
          console.error('❌ Queued automation failed:', error);
        }
        
        this.isProcessing = false;
      }
    }, 1000);
  }

  // 📊 Status and monitoring
  getActiveTasks() {
    return Array.from(this.activeTasks.entries()).map(([id, task]) => ({
      id,
      ...task
    }));
  }

  getTaskStatus(taskId) {
    return this.activeTasks.get(taskId) || null;
  }
}

module.exports = { BrowserAutomationEngine };