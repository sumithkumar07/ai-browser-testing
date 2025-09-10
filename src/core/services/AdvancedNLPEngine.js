// Advanced NLP Engine - Replace Basic Pattern Matching
// Enhanced intent recognition with confidence scoring and context retention

class AdvancedNLPEngine {
  static instance = null;

  static getInstance() {
    if (!AdvancedNLPEngine.instance) {
      AdvancedNLPEngine.instance = new AdvancedNLPEngine();
    }
    return AdvancedNLPEngine.instance;
  }

  constructor() {
    this.intentClassifier = null;
    this.contextMemory = new Map();
    this.conversationHistory = [];
    this.entityExtractor = null;
    this.confidenceThreshold = 0.7;
    this.maxContextHistory = 10;
    this.intentPatterns = new Map();
    this.entityPatterns = new Map();
    this.contextualBindings = new Map();
  }

  async initialize() {
    try {
      console.log('🧠 Initializing Advanced NLP Engine...');
      
      await this.initializeIntentClassifier();
      await this.initializeEntityExtractor();
      await this.initializeContextualBindings();
      
      console.log('✅ Advanced NLP Engine initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Advanced NLP Engine:', error);
      throw error;
    }
  }

  async initializeIntentClassifier() {
    // Advanced intent patterns with confidence scoring
    this.intentPatterns.set('goals_management', {
      patterns: [
        { regex: /(?:show|list|display|view)\s*(?:my\s*)?(?:goals?|objectives?|targets?)(?:\s*and\s*progress)?/i, confidence: 0.95 },
        { regex: /(?:what\s*(?:are\s*)?my|check\s*my)\s*(?:active\s*)?goals?/i, confidence: 0.90 },
        { regex: /(?:goal\s*progress|autonomous\s*goals|planning\s*status)/i, confidence: 0.85 },
        { regex: /(?:create|add|set)\s*(?:a\s*)?(?:new\s*)?goal/i, confidence: 0.88 }
      ],
      entities: ['goal_type', 'priority', 'timeframe'],
      context: ['planning', 'productivity', 'objectives']
    });

    this.intentPatterns.set('performance_analytics', {
      patterns: [
        { regex: /(?:show|display|check)\s*(?:system\s*)?(?:performance|health|status|metrics)/i, confidence: 0.92 },
        { regex: /(?:how\s*(?:is\s*)?(?:the\s*)?system|agent\s*performance|system\s*analytics)/i, confidence: 0.88 },
        { regex: /(?:memory\s*usage|cpu\s*usage|resource\s*usage)/i, confidence: 0.85 }
      ],
      entities: ['metric_type', 'time_range'],
      context: ['system', 'monitoring', 'analytics']
    });

    this.intentPatterns.set('learning_insights', {
      patterns: [
        { regex: /(?:what\s*(?:have\s*)?(?:you\s*)?learned|learning\s*(?:patterns|insights))/i, confidence: 0.90 },
        { regex: /(?:show\s*)?(?:my\s*)?(?:behavior|preferences|patterns)/i, confidence: 0.85 },
        { regex: /(?:memory\s*insights|user\s*patterns|interaction\s*analysis)/i, confidence: 0.88 }
      ],
      entities: ['learning_type', 'agent_scope'],
      context: ['learning', 'memory', 'patterns']
    });

    this.intentPatterns.set('deep_research', {
      patterns: [
        { regex: /(?:research|investigate|explore|analyze)\s*(?:this\s*)?(?:topic|subject)?/i, confidence: 0.85 },
        { regex: /(?:deep\s*search|comprehensive\s*analysis|multi[_\-]source)/i, confidence: 0.92 },
        { regex: /(?:find\s*(?:more\s*)?information|gather\s*data)/i, confidence: 0.80 }
      ],
      entities: ['research_topic', 'depth_level', 'source_types'],
      context: ['research', 'analysis', 'information']
    });

    this.intentPatterns.set('security_analysis', {
      patterns: [
        { regex: /(?:security\s*(?:scan|check|analysis)|check\s*security)/i, confidence: 0.93 },
        { regex: /(?:threat\s*detection|vulnerability|privacy\s*check)/i, confidence: 0.88 },
        { regex: /(?:is\s*(?:this\s*)?(?:site\s*)?safe|security\s*status)/i, confidence: 0.82 }
      ],
      entities: ['scan_type', 'target_url'],
      context: ['security', 'privacy', 'safety']
    });

    this.intentPatterns.set('automation_tasks', {
      patterns: [
        { regex: /(?:automate|schedule|background\s*tasks?)/i, confidence: 0.87 },
        { regex: /(?:create\s*(?:a\s*)?workflow|task\s*automation)/i, confidence: 0.90 },
        { regex: /(?:recurring\s*task|automated\s*process)/i, confidence: 0.85 }
      ],
      entities: ['task_type', 'frequency', 'conditions'],
      context: ['automation', 'scheduling', 'workflow']
    });
  }

  async initializeEntityExtractor() {
    // Enhanced entity extraction patterns
    this.entityPatterns.set('goal_type', [
      { pattern: /(?:optimization|performance|learning|research|monitoring|security)/i, type: 'goal_category' },
      { pattern: /(?:daily|weekly|monthly|quarterly|yearly)/i, type: 'timeframe' },
      { pattern: /(?:high|medium|low|critical|urgent)/i, type: 'priority' }
    ]);

    this.entityPatterns.set('metric_type', [
      { pattern: /(?:memory|cpu|disk|network|response\s*time|error\s*rate)/i, type: 'system_metric' },
      { pattern: /(?:agent|service|overall|individual)/i, type: 'scope' }
    ]);

    this.entityPatterns.set('research_topic', [
      { pattern: /(?:ai|artificial\s*intelligence|machine\s*learning|technology)/i, type: 'tech_category' },
      { pattern: /(?:latest|recent|current|trending|emerging)/i, type: 'recency' }
    ]);
  }

  async initializeContextualBindings() {
    // Context-aware response enhancement
    this.contextualBindings.set('follow_up_questions', [
      'Would you like me to create a goal for this?',
      'Should I set up monitoring for this topic?',
      'Do you want me to schedule regular updates?',
      'Would you like me to analyze this further?'
    ]);

    this.contextualBindings.set('proactive_suggestions', [
      'I can create automated workflows for similar tasks',
      'I noticed patterns in your requests - should I optimize for this?',
      'Based on your usage, I can suggest efficiency improvements',
      'I can set up intelligent monitoring for topics you research frequently'
    ]);
  }

  async processMessage(message, conversationContext = {}) {
    try {
      console.log('🧠 Processing message with advanced NLP:', message.substring(0, 50) + '...');

      // Build comprehensive context
      const context = {
        message: message,
        previousMessages: this.conversationHistory.slice(-this.maxContextHistory),
        userContext: conversationContext,
        timestamp: Date.now()
      };

      // Multi-phase analysis
      const analysis = await this.performMultiPhaseAnalysis(context);
      
      // Update conversation memory
      this.updateConversationMemory(message, analysis);

      console.log(`✅ NLP Analysis complete - Intent: ${analysis.primaryIntent.intent} (${(analysis.primaryIntent.confidence * 100).toFixed(1)}%)`);
      
      return analysis;

    } catch (error) {
      console.error('❌ Advanced NLP processing failed:', error);
      return this.createFallbackAnalysis(message);
    }
  }

  async performMultiPhaseAnalysis(context) {
    const message = context.message.toLowerCase();

    // Phase 1: Intent Classification with Confidence Scoring
    const intentAnalysis = await this.classifyIntentWithConfidence(message, context);

    // Phase 2: Entity Extraction
    const entities = await this.extractEntitiesWithContext(message, intentAnalysis);

    // Phase 3: Context Integration
    const contextualAnalysis = await this.integrateConversationalContext(intentAnalysis, entities, context);

    // Phase 4: Confidence Assessment
    const finalConfidence = this.calculateFinalConfidence(intentAnalysis, entities, contextualAnalysis);

    // Phase 5: Response Strategy Selection
    const responseStrategy = await this.selectResponseStrategy(contextualAnalysis, finalConfidence);

    return {
      primaryIntent: {
        intent: contextualAnalysis.intent,
        confidence: finalConfidence,
        entities: entities,
        context: contextualAnalysis.contextualFactors
      },
      alternativeIntents: intentAnalysis.alternatives,
      extractedEntities: entities,
      conversationalContext: contextualAnalysis.conversationContext,
      responseStrategy: responseStrategy,
      proactiveSuggestions: await this.generateProactiveSuggestions(contextualAnalysis, context),
      executionPlan: await this.createExecutionPlan(contextualAnalysis, entities)
    };
  }

  async classifyIntentWithConfidence(message, context) {
    const candidates = [];

    // Test against all intent patterns
    for (const [intentName, intentConfig] of this.intentPatterns) {
      for (const pattern of intentConfig.patterns) {
        if (pattern.regex.test(message)) {
          let confidence = pattern.confidence;

          // Context boost
          if (this.hasContextualRelevance(intentConfig.context, context)) {
            confidence += 0.05;
          }

          // Conversation history boost
          if (this.hasRecentSimilarIntent(intentName)) {
            confidence += 0.03;
          }

          candidates.push({
            intent: intentName,
            confidence: Math.min(0.99, confidence),
            matchedPattern: pattern.regex.source,
            contextRelevant: intentConfig.context
          });
        }
      }
    }

    // Sort by confidence and return top candidates
    candidates.sort((a, b) => b.confidence - a.confidence);

    return {
      primary: candidates[0] || this.getDefaultIntent(message),
      alternatives: candidates.slice(1, 3),
      allCandidates: candidates
    };
  }

  async extractEntitiesWithContext(message, intentAnalysis) {
    const entities = {
      explicit: [], // Directly mentioned entities
      implicit: [], // Context-inferred entities
      temporal: [], // Time-related entities
      numerical: [] // Numbers, quantities
    };

    // Extract explicit entities based on intent
    if (intentAnalysis.primary) {
      const intentConfig = this.intentPatterns.get(intentAnalysis.primary.intent);
      if (intentConfig && intentConfig.entities) {
        for (const entityType of intentConfig.entities) {
          const extracted = await this.extractSpecificEntities(message, entityType);
          entities.explicit.push(...extracted);
        }
      }
    }

    // Extract temporal entities
    entities.temporal = this.extractTemporalEntities(message);

    // Extract numerical entities
    entities.numerical = this.extractNumericalEntities(message);

    // Infer implicit entities from context
    entities.implicit = await this.inferImplicitEntities(message, intentAnalysis, entities);

    return entities;
  }

  async integrateConversationalContext(intentAnalysis, entities, context) {
    const conversationContext = {
      recentTopics: this.extractRecentTopics(context.previousMessages),
      userPreferences: await this.getUserPreferences(context),
      sessionTheme: this.identifySessionTheme(context.previousMessages),
      contextualFactors: []
    };

    // Analyze contextual factors
    if (this.isFollowUpQuestion(context.message, context.previousMessages)) {
      conversationContext.contextualFactors.push('follow_up');
      intentAnalysis = await this.adjustIntentForFollowUp(intentAnalysis, context.previousMessages);
    }

    if (this.hasImplicitReference(context.message)) {
      conversationContext.contextualFactors.push('implicit_reference');
      entities = await this.resolveImplicitReferences(entities, context.previousMessages);
    }

    return {
      intent: intentAnalysis.primary.intent,
      confidence: intentAnalysis.primary.confidence,
      conversationContext: conversationContext,
      contextualFactors: conversationContext.contextualFactors
    };
  }

  calculateFinalConfidence(intentAnalysis, entities, contextualAnalysis) {
    let baseConfidence = intentAnalysis.primary.confidence;

    // Entity extraction quality boost
    const entityQuality = this.assessEntityQuality(entities);
    baseConfidence += entityQuality * 0.1;

    // Contextual relevance boost
    if (contextualAnalysis.contextualFactors.length > 0) {
      baseConfidence += 0.05;
    }

    // Conversation coherence boost
    if (this.hasConversationCoherence(contextualAnalysis.conversationContext)) {
      baseConfidence += 0.08;
    }

    return Math.min(0.99, Math.max(0.1, baseConfidence));
  }

  async selectResponseStrategy(contextualAnalysis, confidence) {
    if (confidence >= 0.9) {
      return {
        type: 'direct_execution',
        approach: 'confident',
        includeAlternatives: false,
        proactiveLevel: 'high'
      };
    } else if (confidence >= 0.7) {
      return {
        type: 'guided_execution',
        approach: 'clarifying',
        includeAlternatives: true,
        proactiveLevel: 'medium'
      };
    } else {
      return {
        type: 'exploratory',
        approach: 'questioning',
        includeAlternatives: true,
        proactiveLevel: 'low'
      };
    }
  }

  async generateProactiveSuggestions(contextualAnalysis, context) {
    const suggestions = [];

    // Based on intent patterns
    if (contextualAnalysis.intent === 'goals_management') {
      suggestions.push({
        type: 'automation',
        text: 'I can create automated goal tracking and progress updates',
        confidence: 0.8
      });
    }

    if (contextualAnalysis.intent === 'performance_analytics') {
      suggestions.push({
        type: 'monitoring',
        text: 'I can set up real-time performance alerts for critical metrics',
        confidence: 0.85
      });
    }

    // Based on conversation patterns
    if (this.detectRepeatingPattern(context.previousMessages)) {
      suggestions.push({
        type: 'workflow',
        text: 'I notice you ask about this regularly. Should I create an automated workflow?',
        confidence: 0.9
      });
    }

    return suggestions;
  }

  async createExecutionPlan(contextualAnalysis, entities) {
    const plan = {
      primaryAction: null,
      supportingActions: [],
      parallelActions: [],
      followUpActions: [],
      requiredServices: []
    };

    // Map intent to execution plan
    switch (contextualAnalysis.intent) {
      case 'goals_management':
        plan.primaryAction = 'retrieve_goals_data';
        plan.supportingActions = ['analyze_goal_progress', 'identify_optimization_opportunities'];
        plan.requiredServices = ['AutonomousPlanningEngine', 'AgentMemoryService'];
        break;

      case 'performance_analytics':
        plan.primaryAction = 'collect_system_metrics';
        plan.parallelActions = ['analyze_agent_performance', 'check_system_health'];
        plan.requiredServices = ['PerformanceMonitor', 'UnifiedServiceOrchestrator'];
        break;

      case 'deep_research':
        plan.primaryAction = 'execute_deep_search';
        plan.supportingActions = ['analyze_content_quality', 'synthesize_findings'];
        plan.followUpActions = ['create_knowledge_base_entry', 'suggest_related_research'];
        plan.requiredServices = ['DeepSearchEngine', 'AgentMemoryService'];
        break;

      case 'security_analysis':
        plan.primaryAction = 'perform_security_scan';
        plan.parallelActions = ['check_privacy_compliance', 'analyze_threat_landscape'];
        plan.requiredServices = ['AdvancedSecurity'];
        break;
    }

    return plan;
  }

  // Helper methods for context analysis
  hasContextualRelevance(intentContext, conversationContext) {
    if (!conversationContext.previousMessages) return false;
    
    const recentContext = conversationContext.previousMessages
      .slice(-3)
      .join(' ')
      .toLowerCase();

    return intentContext.some(ctx => recentContext.includes(ctx));
  }

  hasRecentSimilarIntent(intentName) {
    return this.conversationHistory
      .slice(-5)
      .some(entry => entry.intent === intentName);
  }

  getDefaultIntent(message) {
    return {
      intent: 'general_assistance',
      confidence: 0.5,
      matchedPattern: 'fallback',
      contextRelevant: ['general']
    };
  }

  extractSpecificEntities(message, entityType) {
    const patterns = this.entityPatterns.get(entityType) || [];
    const extracted = [];

    patterns.forEach(patternConfig => {
      const matches = message.match(patternConfig.pattern);
      if (matches) {
        extracted.push({
          type: entityType,
          value: matches[0],
          subType: patternConfig.type,
          confidence: 0.8
        });
      }
    });

    return extracted;
  }

  extractTemporalEntities(message) {
    const temporalPatterns = [
      { pattern: /(?:today|now|currently)/i, value: 'present', type: 'relative' },
      { pattern: /(?:yesterday|last\s+\w+)/i, value: 'past', type: 'relative' },
      { pattern: /(?:tomorrow|next\s+\w+)/i, value: 'future', type: 'relative' },
      { pattern: /\d{1,2}\/\d{1,2}\/\d{2,4}/i, value: 'date', type: 'absolute' },
      { pattern: /(?:in\s+)?(\d+)\s+(minute|hour|day|week|month)s?/i, value: 'duration', type: 'relative' }
    ];

    const extracted = [];
    temporalPatterns.forEach(pattern => {
      const matches = message.match(pattern.pattern);
      if (matches) {
        extracted.push({
          type: 'temporal',
          value: matches[0],
          subType: pattern.type,
          confidence: 0.85
        });
      }
    });

    return extracted;
  }

  extractNumericalEntities(message) {
    const numericalPatterns = [
      { pattern: /\d+%/g, type: 'percentage' },
      { pattern: /\$\d+(?:\.\d{2})?/g, type: 'currency' },
      { pattern: /\d+(?:\.\d+)?\s*(?:mb|gb|tb|kb)/gi, type: 'data_size' },
      { pattern: /\b\d+\b/g, type: 'number' }
    ];

    const extracted = [];
    numericalPatterns.forEach(pattern => {
      const matches = message.match(pattern.pattern);
      if (matches) {
        matches.forEach(match => {
          extracted.push({
            type: 'numerical',
            value: match,
            subType: pattern.type,
            confidence: 0.9
          });
        });
      }
    });

    return extracted;
  }

  updateConversationMemory(message, analysis) {
    const entry = {
      message: message,
      intent: analysis.primaryIntent.intent,
      confidence: analysis.primaryIntent.confidence,
      entities: analysis.extractedEntities,
      timestamp: Date.now()
    };

    this.conversationHistory.push(entry);

    // Maintain memory limit
    if (this.conversationHistory.length > this.maxContextHistory * 2) {
      this.conversationHistory = this.conversationHistory.slice(-this.maxContextHistory);
    }
  }

  createFallbackAnalysis(message) {
    return {
      primaryIntent: {
        intent: 'general_assistance',
        confidence: 0.3,
        entities: [],
        context: []
      },
      alternativeIntents: [],
      extractedEntities: { explicit: [], implicit: [], temporal: [], numerical: [] },
      conversationalContext: { recentTopics: [], userPreferences: {}, sessionTheme: 'general' },
      responseStrategy: { type: 'exploratory', approach: 'questioning' },
      proactiveSuggestions: [],
      executionPlan: { primaryAction: 'provide_general_assistance', requiredServices: [] }
    };
  }

  // Additional helper methods
  isFollowUpQuestion(message, previousMessages) {
    const followUpIndicators = [
      /^(?:and|also|what about|how about)/i,
      /^(?:can you|could you|will you)/i,
      /\b(?:that|this|it)\b/i
    ];

    return followUpIndicators.some(pattern => pattern.test(message)) && previousMessages.length > 0;
  }

  hasImplicitReference(message) {
    return /\b(?:that|this|it|them|those|these)\b/i.test(message);
  }

  detectRepeatingPattern(previousMessages) {
    if (previousMessages.length < 3) return false;

    const recentIntents = previousMessages.slice(-3).map(msg => 
      msg.intent || 'unknown'
    );

    // Check if user asks about same thing repeatedly
    const uniqueIntents = new Set(recentIntents);
    return uniqueIntents.size <= 2;
  }

  assessEntityQuality(entities) {
    const totalEntities = Object.values(entities).flat().length;
    const highConfidenceEntities = Object.values(entities)
      .flat()
      .filter(entity => entity.confidence > 0.8).length;

    if (totalEntities === 0) return 0;
    return highConfidenceEntities / totalEntities;
  }

  hasConversationCoherence(conversationContext) {
    return conversationContext.sessionTheme !== 'general' && 
           conversationContext.recentTopics.length > 0;
  }

  async shutdown() {
    console.log('🧠 Shutting down Advanced NLP Engine...');
    this.conversationHistory = [];
    this.contextMemory.clear();
    console.log('✅ Advanced NLP Engine shutdown complete');
  }
}

module.exports = AdvancedNLPEngine;