// 🚀 ENHANCED AI ORCHESTRATOR - Maximum Backend Utilization
// Automatically activates ALL backend services for every user interaction

class EnhancedAIOrchestrator {
  constructor(browserManager) {
    this.manager = browserManager;
    this.services = {
      memory: null,
      planning: null, 
      search: null,
      security: null,
      performance: null,
      tasks: null,
      coordinator: null,
      dataHandlers: null
    };
    this.contextAnalyzer = new ContextAnalyzer();
    this.serviceActivationRules = new Map();
    this.lastInteractionContext = null;
    this.interactionCounter = 0;
  }

  async initialize() {
    console.log('🎯 Initializing Enhanced AI Orchestrator - MAXIMUM UTILIZATION MODE');
    
    await this.connectToServices();
    this.initializeActivationRules();
    this.startProactiveServiceActivation();
    
    console.log('✅ Enhanced AI Orchestrator initialized - ALL services will be automatically utilized');
  }

  async connectToServices() {
    this.services.memory = this.manager.agentMemoryService;
    this.services.planning = this.manager.autonomousPlanningEngine;
    this.services.search = this.manager.deepSearchEngine;
    this.services.security = this.manager.advancedSecurity;
    this.services.performance = this.manager.performanceMonitor;
    this.services.tasks = this.manager.taskScheduler;
    this.services.coordinator = this.manager.enhancedBackendCoordinator;
    this.services.dataHandlers = this.manager.aiDataHandlers;
  }

  initializeActivationRules() {
    // RULE: ALWAYS activate memory learning for every interaction
    this.serviceActivationRules.set('memory_always', {
      condition: () => true, // Always
      services: ['memory'],
      actions: ['store_interaction', 'learn_patterns', 'update_preferences']
    });

    // RULE: Auto-activate planning for goal-related queries
    this.serviceActivationRules.set('auto_planning', {
      condition: (message) => /goal|plan|organize|schedule|automate|manage|optimize|track|monitor|improve|task|todo|reminder|workflow|automation/.test(message.toLowerCase()),
      services: ['planning', 'tasks'],
      actions: ['suggest_goals', 'create_automation', 'schedule_tasks']
    });

    // RULE: Auto-activate deep search for knowledge queries  
    this.serviceActivationRules.set('auto_research', {
      condition: (message) => /what is|how to|explain|research|find|learn|information|details|facts|latest|trends|news|developments|analysis|compare|review/.test(message.toLowerCase()),
      services: ['search', 'memory'],
      actions: ['deep_search', 'cross_reference', 'create_research_goal']
    });

    // RULE: Auto-activate security for any website-related queries
    this.serviceActivationRules.set('auto_security', {
      condition: (message, context) => context.url && context.url !== 'about:blank',
      services: ['security'],
      actions: ['scan_current_site', 'check_reputation', 'security_insights']
    });

    // RULE: Auto-activate shopping intelligence for commerce queries
    this.serviceActivationRules.set('auto_shopping', {
      condition: (message) => /buy|purchase|price|cost|deal|discount|product|shopping|store|market|compare prices|best price|review/.test(message.toLowerCase()),
      services: ['search', 'tasks', 'memory'],
      actions: ['price_research', 'create_monitoring', 'learn_preferences']
    });

    // RULE: Auto-activate performance monitoring for system queries
    this.serviceActivationRules.set('auto_performance', {
      condition: (message) => /slow|fast|performance|speed|optimize|improve|health|status|system|memory|cpu|lag|freeze/.test(message.toLowerCase()),
      services: ['performance', 'coordinator'],
      actions: ['performance_analysis', 'optimization_suggestions']
    });

    // RULE: Proactive service activation based on context
    this.serviceActivationRules.set('contextual_activation', {
      condition: (message, context) => true, // Always run contextual analysis
      services: ['all'],
      actions: ['context_analysis', 'proactive_suggestions']
    });
  }

  // 🎯 MAIN ORCHESTRATION METHOD - Called for every AI interaction
  async orchestrateServices(userMessage, context = {}) {
    this.interactionCounter++;
    console.log(`🎼 Orchestrating services for interaction #${this.interactionCounter}: "${userMessage.substring(0, 50)}..."`);

    const orchestrationResult = {
      activatedServices: [],
      serviceResults: {},
      enhancedResponse: null,
      proactiveActions: [],
      learningData: {}
    };

    try {
      // PHASE 1: Context Analysis
      const enrichedContext = await this.analyzeContext(userMessage, context);
      
      // PHASE 2: Automatic Service Activation
      const activationPlan = this.createActivationPlan(userMessage, enrichedContext);
      
      // PHASE 3: Execute Multiple Services Simultaneously
      const serviceResults = await this.executeServicesInParallel(activationPlan, userMessage, enrichedContext);
      
      // PHASE 4: Synthesize Multi-Service Response
      const enhancedResponse = await this.synthesizeResponse(userMessage, serviceResults, enrichedContext);
      
      // PHASE 5: Proactive Follow-up Actions
      const proactiveActions = await this.executeProactiveActions(userMessage, serviceResults, enrichedContext);
      
      // PHASE 6: Learning and Memory Update
      await this.updateLearningMemory(userMessage, serviceResults, enhancedResponse, enrichedContext);

      return {
        ...orchestrationResult,
        activatedServices: activationPlan.services,
        serviceResults,
        enhancedResponse,
        proactiveActions,
        context: enrichedContext
      };

    } catch (error) {
      console.error('❌ Service orchestration failed:', error);
      return {
        ...orchestrationResult,
        error: error.message
      };
    }
  }

  async analyzeContext(message, context) {
    return {
      ...context,
      messageType: this.contextAnalyzer.classifyMessage(message),
      userIntent: this.contextAnalyzer.extractIntent(message),
      currentDomain: context.url ? this.extractDomain(context.url) : null,
      timeContext: this.getTimeContext(),
      interactionHistory: await this.getRecentInteractionContext(),
      urgencyLevel: this.contextAnalyzer.assessUrgency(message),
      complexityLevel: this.contextAnalyzer.assessComplexity(message)
    };
  }

  createActivationPlan(message, context) {
    const plan = {
      services: new Set(),
      actions: new Set(),
      priority: 'normal'
    };

    // Apply all activation rules
    for (const [ruleName, rule] of this.serviceActivationRules.entries()) {
      if (rule.condition(message, context)) {
        console.log(`✓ Activation rule matched: ${ruleName}`);
        
        if (rule.services.includes('all')) {
          plan.services.add('memory', 'planning', 'search', 'security', 'performance', 'tasks', 'coordinator');
        } else {
          rule.services.forEach(service => plan.services.add(service));
        }
        
        rule.actions.forEach(action => plan.actions.add(action));
      }
    }

    // ALWAYS include memory service
    plan.services.add('memory');

    console.log(`🎯 Activation plan: ${Array.from(plan.services).join(', ')} services, ${Array.from(plan.actions).join(', ')} actions`);
    return plan;
  }

  async executeServicesInParallel(plan, message, context) {
    const servicePromises = [];
    const results = {};

    // Execute each service based on activation plan
    if (plan.services.has('memory')) {
      servicePromises.push(
        this.executeMemoryService(message, context).then(result => results.memory = result)
      );
    }

    if (plan.services.has('planning')) {
      servicePromises.push(
        this.executePlanningService(message, context).then(result => results.planning = result)
      );
    }

    if (plan.services.has('search') && this.shouldExecuteSearch(message)) {
      servicePromises.push(
        this.executeSearchService(message, context).then(result => results.search = result)
      );
    }

    if (plan.services.has('security')) {
      servicePromises.push(
        this.executeSecurityService(message, context).then(result => results.security = result)
      );
    }

    if (plan.services.has('performance')) {
      servicePromises.push(
        this.executePerformanceService(message, context).then(result => results.performance = result)
      );
    }

    if (plan.services.has('tasks')) {
      servicePromises.push(
        this.executeTaskService(message, context).then(result => results.tasks = result)
      );
    }

    // Execute all services in parallel
    await Promise.allSettled(servicePromises);

    console.log(`✅ Executed ${Object.keys(results).length} services in parallel`);
    return results;
  }

  // 🧠 MEMORY SERVICE EXECUTION (Always Active)
  async executeMemoryService(message, context) {
    if (!this.services.memory) return { status: 'unavailable' };

    try {
      const results = {};

      // Store interaction in memory
      const memoryResult = await this.services.memory.storeMemory('ai_assistant', {
        type: 'context',
        content: {
          userMessage: message,
          timestamp: Date.now(),
          context: context,
          messageType: context.messageType,
          intent: context.userIntent
        },
        importance: this.calculateImportance(message, context),
        tags: this.extractTags(message, context),
        metadata: {
          interactionId: this.interactionCounter,
          domain: context.currentDomain
        }
      });

      results.memoryStored = memoryResult.success;

      // Get relevant memories for context
      const relevantMemories = await this.services.memory.retrieveMemories('ai_assistant', {
        contentSearch: message.toLowerCase(),
        limit: 5,
        minImportance: 3
      });

      results.relevantMemories = relevantMemories.memories || [];

      // Get learning insights
      const learningInsights = await this.services.memory.getAgentLearningInsights('ai_assistant');
      results.learningInsights = learningInsights.insights || {};

      return {
        status: 'success',
        ...results,
        message: `Memory service activated: ${results.relevantMemories.length} relevant memories found`
      };

    } catch (error) {
      console.error('❌ Memory service execution failed:', error);
      return { status: 'error', error: error.message };
    }
  }

  // 🎯 PLANNING SERVICE EXECUTION
  async executePlanningService(message, context) {
    if (!this.services.planning) return { status: 'unavailable' };

    try {
      const results = {};

      // Get active goals
      const activeGoals = await this.services.planning.getAllGoals('executing');
      results.activeGoals = activeGoals.slice(0, 3);

      // Auto-create relevant goals based on message
      if (this.shouldCreateGoal(message, context)) {
        const goalSuggestion = this.generateGoalFromMessage(message, context);
        if (goalSuggestion) {
          const goalResult = await this.services.planning.createAutonomousGoal(goalSuggestion);
          results.goalCreated = goalResult.success;
          results.newGoalId = goalResult.goalId;
        }
      }

      // Get planning statistics
      const planningStats = this.services.planning.getPlanningStats();
      results.planningStats = planningStats;

      return {
        status: 'success',
        ...results,
        message: `Planning service activated: ${results.activeGoals.length} active goals, ${results.goalCreated ? 'new goal created' : 'no new goals'}`
      };

    } catch (error) {
      console.error('❌ Planning service execution failed:', error);
      return { status: 'error', error: error.message };
    }
  }

  // 🔍 SEARCH SERVICE EXECUTION
  async executeSearchService(message, context) {
    if (!this.services.search) return { status: 'unavailable' };

    try {
      const searchQuery = this.extractSearchQuery(message);
      if (!searchQuery) return { status: 'skipped', reason: 'No searchable query found' };

      console.log(`🔍 Executing deep search for: "${searchQuery}"`);
      
      const searchResult = await this.services.search.performDeepSearch(searchQuery, {
        sources: ['web_search', 'academic_papers', 'news_articles'],
        analysisDepth: 'comprehensive',
        limit: 5
      });

      if (searchResult.success) {
        return {
          status: 'success',
          query: searchQuery,
          results: searchResult.results,
          metadata: searchResult.metadata,
          message: `Deep search completed: ${searchResult.results.primaryResults?.length || 0} primary results found`
        };
      } else {
        return { status: 'failed', error: searchResult.error };
      }

    } catch (error) {
      console.error('❌ Search service execution failed:', error);
      return { status: 'error', error: error.message };
    }
  }

  // 🛡️ SECURITY SERVICE EXECUTION
  async executeSecurityService(message, context) {
    if (!this.services.security || !context.url) return { status: 'unavailable' };

    try {
      const results = {};

      // Perform security scan on current URL
      const scanResult = await this.services.security.performSecurityScan(context.url, 'basic');
      results.securityScan = {
        riskLevel: scanResult.riskLevel,
        findings: scanResult.findings?.length || 0,
        safe: scanResult.riskLevel === 'low'
      };

      // Get overall security status
      const securityStatus = this.services.security.getSecurityStatus();
      results.overallSecurity = securityStatus;

      return {
        status: 'success',
        ...results,
        message: `Security scan completed: ${results.securityScan.riskLevel} risk level, ${results.securityScan.findings} findings`
      };

    } catch (error) {
      console.error('❌ Security service execution failed:', error);
      return { status: 'error', error: error.message };
    }
  }

  // 📊 PERFORMANCE SERVICE EXECUTION
  async executePerformanceService(message, context) {
    if (!this.services.performance) return { status: 'unavailable' };

    try {
      const results = {};

      // Get system performance stats
      const performanceStats = await this.services.performance.getPerformanceStats('ai_assistant');
      results.performance = performanceStats;

      // Get all agent health statuses
      const agentHealth = await this.services.performance.getAllAgentHealthStatuses();
      results.agentHealth = agentHealth;

      return {
        status: 'success',
        ...results,
        message: `Performance analysis: ${(performanceStats.successRate * 100).toFixed(1)}% success rate, ${performanceStats.averageResponseTime.toFixed(0)}ms avg response`
      };

    } catch (error) {
      console.error('❌ Performance service execution failed:', error);
      return { status: 'error', error: error.message };
    }
  }

  // ⚡ TASK SERVICE EXECUTION
  async executeTaskService(message, context) {
    if (!this.services.tasks) return { status: 'unavailable' };

    try {
      const results = {};

      // Get current task status
      const taskStats = await this.services.tasks.getTaskStats();
      results.taskStats = taskStats;

      // Auto-schedule relevant background tasks
      if (this.shouldScheduleTask(message, context)) {
        const taskSuggestion = this.generateTaskFromMessage(message, context);
        if (taskSuggestion) {
          const taskResult = await this.services.tasks.scheduleTask(
            taskSuggestion.type, 
            taskSuggestion.payload, 
            taskSuggestion.options
          );
          results.taskScheduled = taskResult;
        }
      }

      return {
        status: 'success',
        ...results,
        message: `Task service activated: ${taskStats.pending} pending, ${taskStats.running} running, ${results.taskScheduled ? 'new task scheduled' : 'no new tasks'}`
      };

    } catch (error) {
      console.error('❌ Task service execution failed:', error);
      return { status: 'error', error: error.message };
    }
  }

  // 🎼 RESPONSE SYNTHESIS - Combine all service results
  async synthesizeResponse(originalMessage, serviceResults, context) {
    try {
      let enhancedResponse = '';

      // Add service activation summary
      const activeServices = Object.keys(serviceResults).filter(key => serviceResults[key].status === 'success');
      if (activeServices.length > 0) {
        enhancedResponse += `\n\n## 🤖 **Multi-Service Intelligence Activated**\n`;
        enhancedResponse += `*Automatically engaged ${activeServices.length} backend services for comprehensive assistance:*\n`;
        
        activeServices.forEach(service => {
          const result = serviceResults[service];
          if (result.message) {
            enhancedResponse += `• **${service.charAt(0).toUpperCase() + service.slice(1)} Service**: ${result.message}\n`;
          }
        });
      }

      // Integrate memory insights
      if (serviceResults.memory?.relevantMemories?.length > 0) {
        enhancedResponse += `\n## 🧠 **Based on Your Previous Interactions:**\n`;
        serviceResults.memory.relevantMemories.slice(0, 3).forEach(memory => {
          const content = typeof memory.content === 'object' ? memory.content.userMessage : memory.content;
          if (content) {
            enhancedResponse += `• I remember you were interested in: ${content.substring(0, 100)}...\n`;
          }
        });
      }

      // Integrate search results
      if (serviceResults.search?.results?.primaryResults?.length > 0) {
        enhancedResponse += `\n## 🔍 **Deep Research Results:**\n`;
        serviceResults.search.results.primaryResults.slice(0, 3).forEach((result, index) => {
          enhancedResponse += `${index + 1}. **${result.title}**\n   ${result.snippet}\n   *Source: ${result.source}*\n\n`;
        });
      }

      // Integrate planning insights
      if (serviceResults.planning?.activeGoals?.length > 0) {
        enhancedResponse += `\n## 🎯 **Your Active Goals:**\n`;
        serviceResults.planning.activeGoals.forEach(goal => {
          enhancedResponse += `• **${goal.title}** (${goal.progress || 0}% complete)\n`;
        });
      }

      // Integrate security insights
      if (serviceResults.security?.securityScan) {
        const scan = serviceResults.security.securityScan;
        enhancedResponse += `\n## 🛡️ **Security Status:**\n`;
        enhancedResponse += `• Current site security: **${scan.riskLevel.toUpperCase()}** risk level\n`;
        if (scan.findings > 0) {
          enhancedResponse += `• ${scan.findings} security findings detected\n`;
        }
      }

      // Integrate performance insights
      if (serviceResults.performance?.performance) {
        const perf = serviceResults.performance.performance;
        enhancedResponse += `\n## 📊 **System Performance:**\n`;
        enhancedResponse += `• Success rate: ${(perf.successRate * 100).toFixed(1)}%\n`;
        enhancedResponse += `• Average response time: ${perf.averageResponseTime.toFixed(0)}ms\n`;
      }

      // Add proactive suggestions
      const suggestions = this.generateProactiveSuggestions(serviceResults, context);
      if (suggestions.length > 0) {
        enhancedResponse += `\n## 💡 **Smart Suggestions:**\n`;
        suggestions.forEach(suggestion => {
          enhancedResponse += `• ${suggestion}\n`;
        });
      }

      return enhancedResponse;

    } catch (error) {
      console.error('❌ Response synthesis failed:', error);
      return '\n\n*Service orchestration completed with some limitations*';
    }
  }

  // 🚀 PROACTIVE ACTIONS
  async executeProactiveActions(message, serviceResults, context) {
    const actions = [];

    try {
      // Create follow-up goals based on interaction
      if (this.shouldCreateFollowupGoal(message, serviceResults)) {
        const followupGoal = this.generateFollowupGoal(message, serviceResults, context);
        if (followupGoal && this.services.planning) {
          const result = await this.services.planning.createAutonomousGoal(followupGoal);
          if (result.success) {
            actions.push(`Created autonomous goal: ${followupGoal.title}`);
          }
        }
      }

      // Schedule monitoring tasks
      if (this.shouldScheduleMonitoring(message, context) && this.services.tasks) {
        const monitoringTask = this.generateMonitoringTask(message, context);
        if (monitoringTask) {
          const result = await this.services.tasks.scheduleTask(
            monitoringTask.type,
            monitoringTask.payload,
            monitoringTask.options
          );
          actions.push(`Scheduled monitoring: ${monitoringTask.type}`);
        }
      }

      // Update learning patterns
      if (this.services.memory) {
        await this.services.memory.recordTaskOutcome({
          taskId: `interaction_${this.interactionCounter}`,
          agentId: 'ai_assistant',
          success: true,
          result: 'Multi-service orchestration completed',
          strategies: Object.keys(serviceResults),
          timeToComplete: Date.now() - context.startTime,
          userSatisfaction: this.estimateUserSatisfaction(message, serviceResults)
        });
        actions.push('Updated learning patterns from interaction');
      }

      return actions;

    } catch (error) {
      console.error('❌ Proactive actions failed:', error);
      return actions;
    }
  }

  // Helper Methods
  shouldExecuteSearch(message) {
    const searchKeywords = ['what is', 'how to', 'explain', 'research', 'find', 'learn about', 'information', 'details', 'latest', 'trends'];
    return searchKeywords.some(keyword => message.toLowerCase().includes(keyword));
  }

  shouldCreateGoal(message, context) {
    const goalKeywords = ['goal', 'plan', 'organize', 'schedule', 'automate', 'manage', 'optimize', 'track', 'monitor', 'improve'];
    return goalKeywords.some(keyword => message.toLowerCase().includes(keyword));
  }

  shouldScheduleTask(message, context) {
    const taskKeywords = ['remind', 'schedule', 'automate', 'monitor', 'track', 'check', 'update'];
    return taskKeywords.some(keyword => message.toLowerCase().includes(keyword));
  }

  extractSearchQuery(message) {
    const cleanedMessage = message.replace(/^(what is|how to|explain|tell me about|research)\s*/i, '');
    return cleanedMessage.split('?')[0].trim();
  }

  calculateImportance(message, context) {
    let importance = 5; // Base importance
    
    if (message.length > 100) importance += 1;
    if (context.urgencyLevel === 'high') importance += 2;
    if (context.complexityLevel === 'high') importance += 1;
    
    return Math.min(10, importance);
  }

  extractTags(message, context) {
    const tags = ['ai_interaction'];
    
    if (context.messageType) tags.push(context.messageType);
    if (context.currentDomain) tags.push(context.currentDomain);
    if (context.userIntent) tags.push(context.userIntent);
    
    return tags;
  }

  generateProactiveSuggestions(serviceResults, context) {
    const suggestions = [];

    if (serviceResults.search?.results) {
      suggestions.push('I can create autonomous goals to monitor developments in this topic');
    }

    if (serviceResults.security?.securityScan?.findings > 0) {
      suggestions.push('I can set up security monitoring for sites you frequently visit');
    }

    if (serviceResults.planning?.planningStats?.activeGoals < 3) {
      suggestions.push('Based on your interests, I can suggest additional optimization goals');
    }

    return suggestions;
  }

  estimateUserSatisfaction(message, serviceResults) {
    let satisfaction = 0.8; // Base satisfaction
    
    const successfulServices = Object.values(serviceResults).filter(result => result.status === 'success').length;
    satisfaction += (successfulServices * 0.1);
    
    return Math.min(1.0, satisfaction);
  }

  startProactiveServiceActivation() {
    // Continuously optimize and learn
    setInterval(async () => {
      try {
        await this.performBackgroundOptimization();
      } catch (error) {
        console.error('❌ Background optimization failed:', error);
      }
    }, 10 * 60 * 1000); // Every 10 minutes
  }

  async performBackgroundOptimization() {
    console.log('🔧 Performing background service optimization...');
    
    // Optimize memory usage
    if (this.services.memory) {
      await this.services.memory.performMemoryMaintenance();
    }

    // Create optimization goals
    if (this.services.planning) {
      const stats = this.services.planning.getPlanningStats();
      if (stats.activeGoals < 2) {
        await this.services.planning.createAutonomousGoal({
          title: 'System Optimization Monitoring',
          description: 'Continuously monitor and optimize system performance',
          type: 'optimization',
          priority: 'low',
          targetOutcome: 'Maintain optimal system performance',
          createdBy: 'proactive_orchestrator'
        });
      }
    }
  }

  async getRecentInteractionContext() {
    if (!this.services.memory) return [];
    
    const recentMemories = await this.services.memory.retrieveMemories('ai_assistant', {
      limit: 5,
      minImportance: 3
    });
    
    return recentMemories.memories || [];
  }

  getTimeContext() {
    const now = new Date();
    return {
      hour: now.getHours(),
      dayOfWeek: now.getDay(),
      timeOfDay: this.getTimeOfDay(now.getHours())
    };
  }

  getTimeOfDay(hour) {
    if (hour < 6) return 'night';
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  }

  extractDomain(url) {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return null;
    }
  }
}

// Context Analysis Helper
class ContextAnalyzer {
  classifyMessage(message) {
    const lower = message.toLowerCase();
    
    if (/what is|explain|define/.test(lower)) return 'question';
    if (/how to|tutorial|guide/.test(lower)) return 'instruction';
    if (/find|search|research/.test(lower)) return 'research';
    if (/goal|plan|organize/.test(lower)) return 'planning';
    if (/buy|price|shopping/.test(lower)) return 'commerce';
    if (/security|safe|protect/.test(lower)) return 'security';
    
    return 'general';
  }

  extractIntent(message) {
    const lower = message.toLowerCase();
    
    if (/learn|understand|know/.test(lower)) return 'learning';
    if (/help|assist|support/.test(lower)) return 'assistance';
    if (/automate|schedule|organize/.test(lower)) return 'automation';
    if (/analyze|evaluate|compare/.test(lower)) return 'analysis';
    
    return 'general';
  }

  assessUrgency(message) {
    const urgentKeywords = ['urgent', 'asap', 'quickly', 'now', 'immediately', 'emergency'];
    return urgentKeywords.some(keyword => message.toLowerCase().includes(keyword)) ? 'high' : 'normal';
  }

  assessComplexity(message) {
    const complexKeywords = ['complex', 'detailed', 'comprehensive', 'thorough', 'deep', 'advanced'];
    const wordCount = message.split(' ').length;
    
    if (wordCount > 20 || complexKeywords.some(keyword => message.toLowerCase().includes(keyword))) {
      return 'high';
    }
    
    return 'normal';
  }
}

module.exports = { EnhancedAIOrchestrator };