// 🤖 ENHANCED AGENT CONTROLLER
// Gives all 6 AI agents full browser automation control

const { BrowserAutomationEngine } = require('../automation/BrowserAutomationEngine');

class EnhancedAgentController {
  // Agent Performance Optimization
  optimizeAgentPerformance() {
    const performanceConfig = {
      maxConcurrentTasks: 3,
      taskTimeoutMs: 30000,
      retryAttempts: 2,
      memoryCleanupInterval: 600000 // 10 minutes
    };

    this.performanceConfig = performanceConfig;
    
    // Memory cleanup for agents
    setInterval(() => {
      this.agents.forEach((agent, type) => {
        if (agent.clearCache) {
          agent.clearCache();
        }
      });
      console.log('🧹 Agent memory cleanup completed');
    }, performanceConfig.memoryCleanupInterval);

    console.log('⚡ Agent performance optimization applied');
  }
  constructor(browserManager) {
    this.manager = browserManager;
    this.automationEngine = null;
    this.agents = new Map();
    this.activeExecutions = new Map();
    
    this.initializeAgents();
    console.log('🤖 Enhanced Agent Controller initializing with FULL browser control...');
  }

  async initialize() {
    try {
      // Initialize automation engine
      this.automationEngine = new BrowserAutomationEngine(this.manager);
      const automationResult = await this.automationEngine.initialize();
      
      if (!automationResult.success) {
        throw new Error('Failed to initialize automation engine');
      }

      // Initialize all enhanced agents
      await this.initializeAllAgents();
      
      this.optimizeAgentPerformance();
    console.log('✅ Enhanced Agent Controller ready - All 6 agents have FULL browser control!');
      return { success: true };

    } catch (error) {
      console.error('❌ Enhanced Agent Controller initialization failed:', error);
      return { success: false, error: error.message };
    }
  }

  initializeAgents() {
    // Create enhanced agent instances with automation capabilities
    this.agents.set('research', new EnhancedResearchAgent(this));
    this.agents.set('navigation', new EnhancedNavigationAgent(this));
    this.agents.set('shopping', new EnhancedShoppingAgent(this));
    this.agents.set('communication', new EnhancedCommunicationAgent(this));
    this.agents.set('automation', new EnhancedAutomationAgent(this));
    this.agents.set('analysis', new EnhancedAnalysisAgent(this));
  }

  async initializeAllAgents() {
    const initPromises = Array.from(this.agents.entries()).map(async ([name, agent]) => {
      try {
        await agent.initialize();
        console.log(`✅ ${name} agent initialized with browser control`);
        return { name, success: true };
      } catch (error) {
        console.error(`❌ ${name} agent initialization failed:`, error);
        return { name, success: false, error: error.message };
      }
    });

    const results = await Promise.all(initPromises);
    const successful = results.filter(r => r.success).length;
    
    console.log(`🎯 Agent initialization complete: ${successful}/6 agents ready with browser control`);
    return results;
  }

  // 🎯 MAIN METHOD - Execute agent task with full automation
  async executeAgentTask(agentType, task, context = {}) {
    try {
      console.log(`🚀 Executing ${agentType} agent task: "${task}"`);

      const agent = this.agents.get(agentType);
      if (!agent) {
        throw new Error(`Agent not found: ${agentType}`);
      }

      // Create execution plan
      const plan = await agent.createExecutionPlan(task, context);
      if (!plan.success) {
        throw new Error(`Failed to create execution plan: ${plan.error}`);
      }

      // Execute the plan with full browser automation
      const executionId = `exec_${Date.now()}_${agentType}`;
      this.activeExecutions.set(executionId, {
        agentType,
        task,
        plan: plan.plan,
        startTime: Date.now(),
        status: 'executing'
      });

      const result = await this.automationEngine.executeAutomationPlan(plan.plan, {
        ...context,
        agentType,
        executionId
      });

      // Update execution status
      this.activeExecutions.set(executionId, {
        ...this.activeExecutions.get(executionId),
        status: result.success ? 'completed' : 'failed',
        endTime: Date.now(),
        result
      });

      console.log(`✅ ${agentType} agent task completed: ${result.success ? 'SUCCESS' : 'FAILED'}`);

      return {
        success: result.success,
        executionId,
        result,
        agent: agentType,
        task,
        executionTime: result.executionTime
      };

    } catch (error) {
      console.error(`❌ Agent task execution failed: ${agentType}`, error);
      return {
        success: false,
        error: error.message,
        agent: agentType,
        task
      };
    }
  }

  // 📊 Get execution status
  getExecutionStatus(executionId) {
    return this.activeExecutions.get(executionId) || null;
  }

  // 📋 Get all active executions
  getActiveExecutions() {
    return Array.from(this.activeExecutions.entries()).map(([id, execution]) => ({
      id,
      ...execution
    }));
  }

  // 🛑 Cancel execution
  async cancelExecution(executionId) {
    const execution = this.activeExecutions.get(executionId);
    if (!execution) {
      return { success: false, error: 'Execution not found' };
    }

    execution.status = 'cancelled';
    execution.endTime = Date.now();

    return { success: true, executionId };
  }
}

// 🔍 ENHANCED RESEARCH AGENT - Full browser automation
class EnhancedResearchAgent {
  constructor(controller) {
    this.controller = controller;
    this.name = 'Research Agent';
    this.capabilities = ['multi_source_search', 'data_extraction', 'analysis', 'report_generation'];
  }

  async initialize() {
    console.log('🔍 Research Agent initializing with browser automation...');
  }

  async createExecutionPlan(task, context) {
    try {
      console.log(`🔍 Creating research execution plan for: "${task}"`);

      // Analyze research requirements
      const researchTopic = this.extractResearchTopic(task);
      const sources = this.identifyResearchSources(task, context);
      const analysisType = this.determineAnalysisType(task);

      const plan = {
        title: `Research: ${researchTopic}`,
        type: 'research',
        topic: researchTopic,
        estimatedDuration: 30000, // 30 seconds
        steps: [
          // Step 1: Open research sources
          ...sources.map(source => ({
            action: 'openTab',
            url: this.buildSearchUrl(source, researchTopic),
            options: { waitForLoad: true },
            delay: 2000
          })),
          
          // Step 2: Extract data from each source
          ...sources.map((source, index) => ({
            action: 'extractPageData',
            tabId: `${source}_tab`, // Will be dynamically assigned
            extractors: ['search_results', 'article'],
            delay: 3000
          })),
          
          // Step 3: Analyze and compare data
          {
            action: 'compareData',
            comparisonRules: {
              relevance: { type: 'numeric', direction: 'higher_better' },
              date: { type: 'date', direction: 'newer_better' },
              credibility: { type: 'numeric', direction: 'higher_better' }
            }
          },
          
          // Step 4: Create comprehensive research report
          {
            action: 'createResultTab',
            title: `Research Report: ${researchTopic}`,
            content: 'COMPILED_RESEARCH_RESULTS', // Will be populated by ResultCompiler
            options: { type: 'research_report' }
          }
        ]
      };

      return { success: true, plan };

    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  extractResearchTopic(task) {
    // Extract main topic from user request
    const cleanTask = task.toLowerCase()
      .replace(/research|find|search|look up|investigate/g, '')
      .trim();
    
    return cleanTask || task;
  }

  identifyResearchSources(task, context) {
    const sources = ['google', 'wikipedia'];
    
    // Add specialized sources based on topic
    if (task.toLowerCase().includes('academic') || task.toLowerCase().includes('paper')) {
      sources.push('scholar');
    }
    
    if (task.toLowerCase().includes('news') || task.toLowerCase().includes('current')) {
      sources.push('news');
    }
    
    if (task.toLowerCase().includes('tech') || task.toLowerCase().includes('programming')) {
      sources.push('github', 'stackoverflow');
    }

    return sources;
  }

  determineAnalysisType(task) {
    if (task.toLowerCase().includes('sentiment')) return 'sentiment';
    if (task.toLowerCase().includes('trend')) return 'trends';
    if (task.toLowerCase().includes('compare')) return 'comparison';
    return 'general';
  }

  buildSearchUrl(source, topic) {
    const encodedTopic = encodeURIComponent(topic);
    
    const searchUrls = {
      google: `https://www.google.com/search?q=${encodedTopic}`,
      wikipedia: `https://en.wikipedia.org/wiki/Special:Search?search=${encodedTopic}`,
      scholar: `https://scholar.google.com/scholar?q=${encodedTopic}`,
      news: `https://news.google.com/search?q=${encodedTopic}`,
      github: `https://github.com/search?q=${encodedTopic}`,
      stackoverflow: `https://stackoverflow.com/search?q=${encodedTopic}`
    };

    return searchUrls[source] || searchUrls.google;
  }
}

// 🌐 ENHANCED NAVIGATION AGENT - Full browser automation
class EnhancedNavigationAgent {
  constructor(controller) {
    this.controller = controller;
    this.name = 'Navigation Agent';
    this.capabilities = ['url_navigation', 'site_exploration', 'content_discovery'];
  }

  async initialize() {
    console.log('🌐 Navigation Agent initializing with browser automation...');
  }

  async createExecutionPlan(task, context) {
    try {
      console.log(`🌐 Creating navigation execution plan for: "${task}"`);

      const urls = this.extractUrls(task);
      const navigationGoal = this.determineNavigationGoal(task);

      const plan = {
        title: `Navigation: ${navigationGoal}`,
        type: 'navigation',
        goal: navigationGoal,
        estimatedDuration: 15000, // 15 seconds
        steps: [
          // Step 1: Navigate to each URL
          ...urls.map(url => ({
            action: 'navigateTo',
            url: url,
            options: { waitForLoad: true },
            delay: 2000
          })),
          
          // Step 2: Analyze page content
          ...urls.map(url => ({
            action: 'analyzeContent',
            tabId: this.getTabIdForUrl(url),
            analysisType: 'general',
            delay: 1000
          })),
          
          // Step 3: Extract key information
          ...urls.map(url => ({
            action: 'extractPageData',
            tabId: this.getTabIdForUrl(url),
            extractors: ['contact', 'article'],
            delay: 1500
          })),
          
          // Step 4: Create navigation summary
          {
            action: 'createResultTab',
            title: `Navigation Summary: ${navigationGoal}`,
            content: 'COMPILED_NAVIGATION_RESULTS',
            options: { type: 'navigation_summary' }
          }
        ]
      };

      return { success: true, plan };

    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  extractUrls(task) {
    // Extract URLs from task or generate based on intent
    const urlRegex = /https?:\/\/[^\s]+/g;
    const explicitUrls = task.match(urlRegex) || [];
    
    if (explicitUrls.length > 0) {
      return explicitUrls;
    }

    // Generate URLs based on navigation intent
    const intent = task.toLowerCase();
    const urls = [];

    if (intent.includes('google')) urls.push('https://www.google.com');
    if (intent.includes('github')) urls.push('https://github.com');
    if (intent.includes('wikipedia')) urls.push('https://en.wikipedia.org');
    if (intent.includes('youtube')) urls.push('https://www.youtube.com');
    if (intent.includes('stackoverflow')) urls.push('https://stackoverflow.com');

    return urls.length > 0 ? urls : ['https://www.google.com'];
  }

  determineNavigationGoal(task) {
    if (task.toLowerCase().includes('explore')) return 'Site Exploration';
    if (task.toLowerCase().includes('find')) return 'Information Discovery';
    if (task.toLowerCase().includes('check')) return 'Site Verification';
    return 'Web Navigation';
  }

  getTabIdForUrl(url) {
    // Generate tab ID based on URL - will be handled by automation engine
    return `tab_${url.replace(/[^a-zA-Z0-9]/g, '_')}`;
  }
}

// 🛒 ENHANCED SHOPPING AGENT - Full browser automation
class EnhancedShoppingAgent {
  constructor(controller) {
    this.controller = controller;
    this.name = 'Shopping Agent';
    this.capabilities = ['product_search', 'price_comparison', 'deal_finding', 'review_analysis'];
  }

  async initialize() {
    console.log('🛒 Shopping Agent initializing with browser automation...');
  }

  async createExecutionPlan(task, context) {
    try {
      console.log(`🛒 Creating shopping execution plan for: "${task}"`);

      const product = this.extractProduct(task);
      const budget = this.extractBudget(task);
      const retailers = this.identifyRetailers(task);

      const plan = {
        title: `Shopping: ${product}`,
        type: 'shopping',
        product: product,
        budget: budget,
        estimatedDuration: 45000, // 45 seconds
        steps: [
          // Step 1: Search each retailer
          ...retailers.map(retailer => ({
            action: 'openTab',
            url: this.buildRetailerSearchUrl(retailer, product),
            options: { waitForLoad: true },
            delay: 3000
          })),
          
          // Step 2: Extract product data from each retailer
          ...retailers.map(retailer => ({
            action: 'extractPageData',
            tabId: `${retailer}_tab`,
            extractors: ['product'],
            delay: 2000
          })),
          
          // Step 3: Compare products across retailers
          {
            action: 'compareData',
            comparisonRules: {
              price: { type: 'numeric', direction: 'lower_better' },
              rating: { type: 'numeric', direction: 'higher_better' },
              reviews: { type: 'numeric', direction: 'higher_better' }
            }
          },
          
          // Step 4: Create shopping analysis report
          {
            action: 'createResultTab',
            title: `Shopping Analysis: ${product}`,
            content: 'COMPILED_SHOPPING_RESULTS',
            options: { type: 'shopping_analysis' }
          }
        ]
      };

      return { success: true, plan };

    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  extractProduct(task) {
    // Remove shopping-related words to get product name
    const cleanTask = task.toLowerCase()
      .replace(/buy|purchase|find|search|shop for|look for|price|cost|deal/g, '')
      .trim();
    
    return cleanTask || 'product';
  }

  extractBudget(task) {
    const budgetMatch = task.match(/under\s*\$?(\d+)|budget\s*\$?(\d+)|max\s*\$?(\d+)/i);
    return budgetMatch ? parseInt(budgetMatch[1] || budgetMatch[2] || budgetMatch[3]) : null;
  }

  identifyRetailers(task) {
    const defaultRetailers = ['amazon', 'ebay', 'walmart'];
    
    // Add specific retailers if mentioned
    const mentionedRetailers = [];
    if (task.toLowerCase().includes('amazon')) mentionedRetailers.push('amazon');
    if (task.toLowerCase().includes('ebay')) mentionedRetailers.push('ebay');
    if (task.toLowerCase().includes('walmart')) mentionedRetailers.push('walmart');
    if (task.toLowerCase().includes('target')) mentionedRetailers.push('target');
    if (task.toLowerCase().includes('best buy')) mentionedRetailers.push('bestbuy');

    return mentionedRetailers.length > 0 ? mentionedRetailers : defaultRetailers;
  }

  buildRetailerSearchUrl(retailer, product) {
    const encodedProduct = encodeURIComponent(product);
    
    const retailerUrls = {
      amazon: `https://www.amazon.com/s?k=${encodedProduct}`,
      ebay: `https://www.ebay.com/sch/i.html?_nkw=${encodedProduct}`,
      walmart: `https://www.walmart.com/search/?query=${encodedProduct}`,
      target: `https://www.target.com/s?searchTerm=${encodedProduct}`,
      bestbuy: `https://www.bestbuy.com/site/searchpage.jsp?st=${encodedProduct}`
    };

    return retailerUrls[retailer] || retailerUrls.amazon;
  }
}

// 📧 ENHANCED COMMUNICATION AGENT - Full browser automation
class EnhancedCommunicationAgent {
  constructor(controller) {
    this.controller = controller;
    this.name = 'Communication Agent';
    this.capabilities = ['email_composition', 'form_filling', 'message_creation'];
  }

  async initialize() {
    console.log('📧 Communication Agent initializing with browser automation...');
  }

  async createExecutionPlan(task, context) {
    try {
      console.log(`📧 Creating communication execution plan for: "${task}"`);

      const communicationType = this.determineCommunicationType(task);
      const content = this.generateContent(task, communicationType);

      const plan = {
        title: `Communication: ${communicationType}`,
        type: 'communication',
        communicationType: communicationType,
        estimatedDuration: 20000, // 20 seconds
        steps: [
          // Step 1: Create content template
          {
            action: 'createResultTab',
            title: `${communicationType} Template`,
            content: content,
            options: { type: 'communication_template', editable: true }
          },
          
          // Step 2: If form filling is needed, navigate to form
          ...(this.needsFormFilling(task) ? [
            {
              action: 'navigateTo',
              url: this.identifyFormUrl(task),
              options: { waitForLoad: true },
              delay: 2000
            },
            {
              action: 'fillForm',
              tabId: 'form_tab',
              formData: this.extractFormData(task),
              delay: 1000
            }
          ] : []),
          
          // Step 3: Create final communication report
          {
            action: 'createResultTab',
            title: `Communication Report: ${communicationType}`,
            content: 'COMPILED_COMMUNICATION_RESULTS',
            options: { type: 'communication_report' }
          }
        ]
      };

      return { success: true, plan };

    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  determineCommunicationType(task) {
    const lowerTask = task.toLowerCase();
    
    if (lowerTask.includes('email')) return 'Email';
    if (lowerTask.includes('message')) return 'Message';
    if (lowerTask.includes('form')) return 'Form';
    if (lowerTask.includes('letter')) return 'Letter';
    if (lowerTask.includes('social')) return 'Social Media Post';
    
    return 'General Communication';
  }

  generateContent(task, type) {
    const templates = {
      'Email': this.generateEmailTemplate(task),
      'Message': this.generateMessageTemplate(task),
      'Form': this.generateFormTemplate(task),
      'Letter': this.generateLetterTemplate(task),
      'Social Media Post': this.generateSocialTemplate(task)
    };

    return templates[type] || templates['General Communication'];
  }

  generateEmailTemplate(task) {
    return `# Email Template

**Subject:** [Enter subject line]

**To:** [Recipient email]

**Body:**

Dear [Recipient Name],

[Your message content here based on: "${task}"]

Best regards,
[Your name]

---
*This template was generated based on your request. Please customize as needed.*`;
  }

  generateMessageTemplate(task) {
    return `# Message Template

**Platform:** [Specify platform - SMS, WhatsApp, etc.]

**Message:**

[Your message content here based on: "${task}"]

---
*This template was generated based on your request. Please customize as needed.*`;
  }

  generateFormTemplate(task) {
    return `# Form Filling Guide

**Form Type:** [Specify form type]

**Fields to fill:**

1. [Field 1]: [Value]
2. [Field 2]: [Value]
3. [Field 3]: [Value]

**Based on your request:** "${task}"

---
*This guide was generated to help you fill forms efficiently.*`;
  }

  generateLetterTemplate(task) {
    return `# Letter Template

**Date:** ${new Date().toLocaleDateString()}

**To:** [Recipient details]

**Subject:** [Letter subject]

**Content:**

Dear [Recipient],

[Your letter content here based on: "${task}"]

Sincerely,
[Your name]

---
*This template was generated based on your request. Please customize as needed.*`;
  }

  generateSocialTemplate(task) {
    return `# Social Media Post Template

**Platform:** [Facebook, Twitter, LinkedIn, etc.]

**Post Content:**

[Your social media content here based on: "${task}"]

**Hashtags:** #[relevant] #[hashtags]

---
*This template was generated based on your request. Please customize as needed.*`;
  }

  needsFormFilling(task) {
    return task.toLowerCase().includes('fill') && 
           (task.toLowerCase().includes('form') || task.toLowerCase().includes('application'));
  }

  identifyFormUrl(task) {
    // Extract URL if provided, otherwise return a placeholder
    const urlMatch = task.match(/https?:\/\/[^\s]+/);
    return urlMatch ? urlMatch[0] : 'https://example.com/form';
  }

  extractFormData(task) {
    // Extract form data from task - simplified implementation
    return {
      name: '[Your Name]',
      email: '[Your Email]',
      message: task
    };
  }
}

// 🤖 ENHANCED AUTOMATION AGENT - Full browser automation
class EnhancedAutomationAgent {
  constructor(controller) {
    this.controller = controller;
    this.name = 'Automation Agent';
    this.capabilities = ['workflow_creation', 'task_scheduling', 'process_automation'];
  }

  async initialize() {
    console.log('🤖 Automation Agent initializing with browser automation...');
  }

  async createExecutionPlan(task, context) {
    try {
      console.log(`🤖 Creating automation execution plan for: "${task}"`);

      const workflowType = this.determineWorkflowType(task);
      const automationSteps = this.generateAutomationSteps(task, workflowType);

      const plan = {
        title: `Automation: ${workflowType}`,
        type: 'automation',
        workflowType: workflowType,
        estimatedDuration: 25000, // 25 seconds
        steps: [
          // Step 1: Create automation workflow
          {
            action: 'createResultTab',
            title: `Automation Workflow: ${workflowType}`,
            content: this.generateWorkflowTemplate(task, workflowType),
            options: { type: 'automation_workflow' }
          },
          
          // Step 2: Execute automation steps if they involve browser actions
          ...automationSteps,
          
          // Step 3: Create automation report
          {
            action: 'createResultTab',
            title: `Automation Report: ${workflowType}`,
            content: 'COMPILED_AUTOMATION_RESULTS',
            options: { type: 'automation_report' }
          }
        ]
      };

      return { success: true, plan };

    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  determineWorkflowType(task) {
    const lowerTask = task.toLowerCase();
    
    if (lowerTask.includes('schedule')) return 'Scheduled Task';
    if (lowerTask.includes('monitor')) return 'Monitoring Workflow';
    if (lowerTask.includes('backup')) return 'Backup Process';
    if (lowerTask.includes('report')) return 'Report Generation';
    if (lowerTask.includes('data')) return 'Data Processing';
    
    return 'Custom Workflow';
  }

  generateAutomationSteps(task, workflowType) {
    // Generate browser automation steps based on workflow type
    const steps = [];

    if (workflowType === 'Monitoring Workflow') {
      steps.push({
        action: 'navigateTo',
        url: this.extractMonitoringUrl(task),
        options: { waitForLoad: true },
        delay: 2000
      });
      
      steps.push({
        action: 'captureContent',
        tabId: 'monitoring_tab',
        captureType: 'full',
        delay: 1000
      });
    }

    return steps;
  }

  generateWorkflowTemplate(task, workflowType) {
    return `# Automation Workflow: ${workflowType}

## Overview
This workflow was created based on your request: "${task}"

## Steps:
1. **Initialize** - Set up the automation environment
2. **Execute** - Run the main automation logic
3. **Monitor** - Track progress and handle errors
4. **Complete** - Finish and report results

## Configuration:
- **Type:** ${workflowType}
- **Created:** ${new Date().toISOString()}
- **Status:** Ready for execution

## Next Steps:
1. Review the workflow configuration
2. Test the automation in a safe environment
3. Schedule for regular execution if needed
4. Monitor results and optimize as necessary

---
*This workflow template was generated automatically. Please review and customize as needed.*`;
  }

  extractMonitoringUrl(task) {
    const urlMatch = task.match(/https?:\/\/[^\s]+/);
    return urlMatch ? urlMatch[0] : 'https://example.com';
  }
}

// 📊 ENHANCED ANALYSIS AGENT - Full browser automation
class EnhancedAnalysisAgent {
  constructor(controller) {
    this.controller = controller;
    this.name = 'Analysis Agent';
    this.capabilities = ['content_analysis', 'data_visualization', 'report_generation'];
  }

  async initialize() {
    console.log('📊 Analysis Agent initializing with browser automation...');
  }

  async createExecutionPlan(task, context) {
    try {
      console.log(`📊 Creating analysis execution plan for: "${task}"`);

      const analysisType = this.determineAnalysisType(task);
      const targetUrl = this.extractAnalysisTarget(task, context);

      const plan = {
        title: `Analysis: ${analysisType}`,
        type: 'analysis',
        analysisType: analysisType,
        estimatedDuration: 30000, // 30 seconds
        steps: [
          // Step 1: Navigate to analysis target
          {
            action: 'navigateTo',
            url: targetUrl,
            options: { waitForLoad: true },
            delay: 2000
          },
          
          // Step 2: Capture full page content
          {
            action: 'captureContent',
            tabId: 'analysis_tab',
            captureType: 'full',
            delay: 1000
          },
          
          // Step 3: Perform detailed analysis
          {
            action: 'analyzeContent',
            tabId: 'analysis_tab',
            analysisType: analysisType.toLowerCase(),
            options: {
              includeImages: true,
              includeLinks: true,
              includeMetadata: true
            },
            delay: 2000
          },
          
          // Step 4: Extract structured data
          {
            action: 'extractPageData',
            tabId: 'analysis_tab',
            extractors: this.getExtractorsForAnalysis(analysisType),
            delay: 1500
          },
          
          // Step 5: Create comprehensive analysis report
          {
            action: 'createResultTab',
            title: `Analysis Report: ${analysisType}`,
            content: 'COMPILED_ANALYSIS_RESULTS',
            options: { type: 'analysis_report' }
          }
        ]
      };

      return { success: true, plan };

    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  determineAnalysisType(task) {
    const lowerTask = task.toLowerCase();
    
    if (lowerTask.includes('sentiment')) return 'Sentiment Analysis';
    if (lowerTask.includes('seo')) return 'SEO Analysis';
    if (lowerTask.includes('content')) return 'Content Analysis';
    if (lowerTask.includes('performance')) return 'Performance Analysis';
    if (lowerTask.includes('security')) return 'Security Analysis';
    if (lowerTask.includes('competitor')) return 'Competitor Analysis';
    
    return 'General Analysis';
  }

  extractAnalysisTarget(task, context) {
    // Extract URL from task or use current page
    const urlMatch = task.match(/https?:\/\/[^\s]+/);
    if (urlMatch) return urlMatch[0];
    
    if (context.url && context.url !== 'about:blank') {
      return context.url;
    }
    
    return 'https://www.google.com'; // Default fallback
  }

  getExtractorsForAnalysis(analysisType) {
    const extractorMap = {
      'Sentiment Analysis': ['article', 'search_results'],
      'SEO Analysis': ['article', 'contact'],
      'Content Analysis': ['article', 'product'],
      'Performance Analysis': ['article'],
      'Security Analysis': ['contact', 'article'],
      'Competitor Analysis': ['product', 'article'],
      'General Analysis': ['article', 'contact']
    };

    return extractorMap[analysisType] || ['article'];
  }
}

module.exports = { EnhancedAgentController };