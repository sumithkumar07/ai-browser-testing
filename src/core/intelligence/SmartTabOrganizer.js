/**
 * 🔧 BACKEND INTELLIGENCE UPGRADE #2
 * AI-Driven Smart Tab Organization & Clustering - Replacing Basic Tab Management
 * Intelligent tab grouping, predictive organization, context-aware clustering
 */

const { createLogger } = require('../logger/EnhancedLogger')

class SmartTabOrganizer {
  constructor() {
    this.logger = createLogger('SmartTabOrganizer')
    this.tabs = new Map()
    this.clusters = new Map()
    this.userProfiles = new Map()
    this.accessPatterns = new Map()
    this.mlModel = null
    this.contextEngine = null
    this.organizationRules = new Map()
    this.aiInsights = []
  }

  static getInstance() {
    if (!SmartTabOrganizer.instance) {
      SmartTabOrganizer.instance = new SmartTabOrganizer()
    }
    return SmartTabOrganizer.instance
  }

  async initialize() {
    try {
      this.logger.info('🎯 Initializing Smart Tab Organizer...')
      
      // Initialize ML model for clustering
      await this.initializeMLModel()
      
      // Initialize context understanding engine
      await this.initializeContextEngine()
      
      // Setup organization rules
      this.setupOrganizationRules()
      
      // Start pattern analysis
      this.startPatternAnalysis()
      
      this.logger.info('✅ Smart Tab Organizer initialized successfully')
      return { success: true, message: 'Smart Tab Organization ready' }
    } catch (error) {
      this.logger.error('Failed to initialize Smart Tab Organizer:', error)
      throw error
    }
  }

  async initializeMLModel() {
    try {
      // Initialize clustering model with features
      this.mlModel = {
        features: [
          'url_domain',
          'page_title',
          'content_type',
          'user_interaction_time',
          'access_frequency',
          'creation_time',
          'referrer_context',
          'semantic_content'
        ],
        clusters: new Map(),
        weights: {
          semantic_similarity: 0.3,
          domain_similarity: 0.25,
          temporal_proximity: 0.2,
          usage_pattern: 0.15,
          user_preference: 0.1
        }
      }
      
      this.logger.info('🤖 ML clustering model initialized')
    } catch (error) {
      this.logger.error('Failed to initialize ML model:', error)
    }
  }

  async initializeContextEngine() {
    try {
      this.contextEngine = {
        semanticAnalyzer: new SemanticAnalyzer(),
        intentDetector: new IntentDetector(),
        workflowRecognizer: new WorkflowRecognizer(),
        contentClassifier: new ContentClassifier()
      }
      
      this.logger.info('🧠 Context understanding engine initialized')
    } catch (error) {
      this.logger.error('Failed to initialize context engine:', error)
    }
  }

  setupOrganizationRules() {
    // Rule: Group by project/task context
    this.organizationRules.set('project_grouping', {
      priority: 10,
      condition: (tabs) => this.detectProjectContext(tabs),
      action: (tabs) => this.groupByProject(tabs),
      description: 'Group tabs working on the same project'
    })

    // Rule: Cluster by domain but with intelligent exceptions
    this.organizationRules.set('smart_domain_clustering', {
      priority: 8,
      condition: (tabs) => tabs.some(t => this.getDomainCategory(t.url) !== 'unknown'),
      action: (tabs) => this.clusterBySmartDomain(tabs),
      description: 'Intelligently cluster by domain with context awareness'
    })

    // Rule: Temporal workflow clustering
    this.organizationRules.set('workflow_clustering', {
      priority: 9,
      condition: (tabs) => this.detectWorkflowPattern(tabs),
      action: (tabs) => this.clusterByWorkflow(tabs),
      description: 'Group tabs used in sequential workflows'
    })

    // Rule: Research session grouping
    this.organizationRules.set('research_grouping', {
      priority: 7,
      condition: (tabs) => this.detectResearchSession(tabs),
      action: (tabs) => this.groupResearchTabs(tabs),
      description: 'Group tabs used for research on related topics'
    })

    // Rule: Priority-based organization
    this.organizationRules.set('priority_organization', {
      priority: 6,
      condition: (tabs) => tabs.some(t => t.metadata?.priority),
      action: (tabs) => this.organizByPriority(tabs),
      description: 'Organize tabs by user-defined or AI-inferred priority'
    })
  }

  startPatternAnalysis() {
    // Analyze patterns every 2 minutes
    setInterval(() => {
      this.analyzeAccessPatterns()
      this.updateUserProfiles()
      this.optimizeOrganization()
      this.generateInsights()
    }, 120000)

    this.logger.info('🔄 Pattern analysis started')
  }

  // Advanced Tab Registration and Tracking
  registerTab(tabData) {
    try {
      const tabId = tabData.id
      const enhancedTab = {
        ...tabData,
        metadata: {
          ...tabData.metadata,
          registeredAt: Date.now(),
          accessCount: 1,
          totalTimeSpent: 0,
          lastAccessed: Date.now(),
          interactionScore: 0,
          contextTags: [],
          clusterId: null,
          aiTags: [],
          semanticVector: null,
          workflowId: null,
          priority: this.inferPriority(tabData)
        }
      }

      // Analyze content and context
      this.analyzeTabContent(enhancedTab)
      
      // Update access patterns
      this.updateAccessPattern(enhancedTab)
      
      // Store tab
      this.tabs.set(tabId, enhancedTab)
      
      // Trigger organization
      this.scheduleOrganization()
      
      this.logger.debug(`📝 Tab registered: ${enhancedTab.title}`)
      return enhancedTab
    } catch (error) {
      this.logger.error('Failed to register tab:', error)
      return tabData
    }
  }

  async analyzeTabContent(tab) {
    try {
      if (!this.contextEngine) return

      // Semantic analysis
      const semanticData = await this.contextEngine.semanticAnalyzer.analyze(tab.title, tab.url, tab.content)
      tab.metadata.semanticVector = semanticData.vector
      tab.metadata.topics = semanticData.topics
      tab.metadata.entities = semanticData.entities

      // Intent detection
      const intent = await this.contextEngine.intentDetector.detectIntent(tab)
      tab.metadata.intent = intent

      // Content classification
      const classification = await this.contextEngine.contentClassifier.classify(tab)
      tab.metadata.contentType = classification.type
      tab.metadata.contentCategory = classification.category

      // AI tagging
      tab.metadata.aiTags = this.generateAITags(tab, semanticData, intent, classification)

      this.logger.debug(`🧠 Content analyzed for tab: ${tab.title}`)
    } catch (error) {
      this.logger.error('Failed to analyze tab content:', error)
    }
  }

  updateAccessPattern(tab) {
    const pattern = this.accessPatterns.get('global') || {
      totalAccesses: 0,
      domainFrequency: new Map(),
      timePatterns: new Map(),
      sequentialPatterns: [],
      contextualPatterns: new Map()
    }

    pattern.totalAccesses++
    
    // Domain frequency
    const domain = this.extractDomain(tab.url)
    pattern.domainFrequency.set(domain, (pattern.domainFrequency.get(domain) || 0) + 1)
    
    // Time patterns
    const hour = new Date().getHours()
    pattern.timePatterns.set(hour, (pattern.timePatterns.get(hour) || 0) + 1)
    
    // Sequential patterns (store last 10 tabs)
    pattern.sequentialPatterns.push({
      tabId: tab.id,
      domain,
      timestamp: Date.now(),
      context: tab.metadata?.intent || 'unknown'
    })
    
    if (pattern.sequentialPatterns.length > 10) {
      pattern.sequentialPatterns = pattern.sequentialPatterns.slice(-10)
    }

    this.accessPatterns.set('global', pattern)
  }

  // Intelligent Organization Methods
  async performSmartOrganization() {
    try {
      const activeTabs = Array.from(this.tabs.values()).filter(tab => !tab.closed)
      
      if (activeTabs.length < 2) {
        return { success: true, clusters: [], message: 'Not enough tabs to organize' }
      }

      // Apply organization rules in priority order
      const sortedRules = Array.from(this.organizationRules.values())
        .sort((a, b) => b.priority - a.priority)

      let bestOrganization = null
      let bestScore = 0

      for (const rule of sortedRules) {
        if (rule.condition(activeTabs)) {
          const organization = rule.action(activeTabs)
          const score = this.evaluateOrganization(organization)
          
          if (score > bestScore) {
            bestScore = score
            bestOrganization = {
              ...organization,
              rule: rule.description,
              score
            }
          }
        }
      }

      if (bestOrganization) {
        await this.applyOrganization(bestOrganization)
        this.logger.info(`✅ Smart organization applied: ${bestOrganization.rule} (score: ${bestScore.toFixed(2)})`)
        return { success: true, organization: bestOrganization }
      }

      // Fallback to ML clustering
      const mlOrganization = await this.performMLClustering(activeTabs)
      await this.applyOrganization(mlOrganization)
      
      return { success: true, organization: mlOrganization }
    } catch (error) {
      this.logger.error('Failed to perform smart organization:', error)
      return { success: false, error: error.message }
    }
  }

  async performMLClustering(tabs) {
    try {
      // Extract features for each tab
      const features = tabs.map(tab => this.extractFeatures(tab))
      
      // Perform clustering using similarity matrix
      const similarities = this.calculateSimilarityMatrix(features)
      const clusters = this.clusterBySimilarity(tabs, similarities)
      
      return {
        type: 'ml_clustering',
        clusters,
        metadata: {
          algorithmUsed: 'hierarchical_clustering',
          features: this.mlModel.features,
          clusterCount: clusters.length
        }
      }
    } catch (error) {
      this.logger.error('ML clustering failed:', error)
      return this.fallbackOrganization(tabs)
    }
  }

  extractFeatures(tab) {
    return {
      domain: this.extractDomain(tab.url),
      title: tab.title,
      semanticVector: tab.metadata?.semanticVector || [],
      contentType: tab.metadata?.contentType || 'unknown',
      intent: tab.metadata?.intent || 'unknown',
      accessFrequency: tab.metadata?.accessCount || 1,
      timeSpent: tab.metadata?.totalTimeSpent || 0,
      creationTime: tab.metadata?.registeredAt || Date.now(),
      topics: tab.metadata?.topics || [],
      entities: tab.metadata?.entities || []
    }
  }

  calculateSimilarityMatrix(features) {
    const matrix = []
    
    for (let i = 0; i < features.length; i++) {
      matrix[i] = []
      for (let j = 0; j < features.length; j++) {
        if (i === j) {
          matrix[i][j] = 1.0
        } else {
          matrix[i][j] = this.calculateSimilarity(features[i], features[j])
        }
      }
    }
    
    return matrix
  }

  calculateSimilarity(feature1, feature2) {
    let similarity = 0
    const weights = this.mlModel.weights

    // Domain similarity
    if (feature1.domain === feature2.domain) {
      similarity += weights.domain_similarity
    }

    // Semantic similarity (cosine similarity of vectors)
    if (feature1.semanticVector.length > 0 && feature2.semanticVector.length > 0) {
      const semanticSim = this.cosineSimilarity(feature1.semanticVector, feature2.semanticVector)
      similarity += weights.semantic_similarity * semanticSim
    }

    // Content type similarity
    if (feature1.contentType === feature2.contentType) {
      similarity += weights.domain_similarity * 0.5 // Lower weight than domain
    }

    // Intent similarity
    if (feature1.intent === feature2.intent) {
      similarity += weights.usage_pattern
    }

    // Temporal proximity (tabs created close in time)
    const timeDiff = Math.abs(feature1.creationTime - feature2.creationTime)
    const timeProximity = Math.max(0, 1 - (timeDiff / (60 * 60 * 1000))) // 1 hour window
    similarity += weights.temporal_proximity * timeProximity

    // Topic overlap
    const topicOverlap = this.calculateTopicOverlap(feature1.topics, feature2.topics)
    similarity += weights.semantic_similarity * 0.3 * topicOverlap

    return Math.min(1.0, similarity)
  }

  clusterBySimilarity(tabs, similarities) {
    const clusters = []
    const visited = new Set()
    const threshold = 0.6 // Similarity threshold for clustering

    for (let i = 0; i < tabs.length; i++) {
      if (visited.has(i)) continue

      const cluster = {
        id: `cluster_${Date.now()}_${i}`,
        name: this.generateClusterName(tabs[i]),
        tabs: [tabs[i]],
        type: 'similarity_based',
        confidence: 1.0
      }

      visited.add(i)

      // Find similar tabs
      for (let j = i + 1; j < tabs.length; j++) {
        if (visited.has(j)) continue

        if (similarities[i][j] >= threshold) {
          cluster.tabs.push(tabs[j])
          visited.add(j)
          cluster.confidence = Math.min(cluster.confidence, similarities[i][j])
        }
      }

      // Refine cluster name based on all tabs
      if (cluster.tabs.length > 1) {
        cluster.name = this.generateClusterName(cluster.tabs)
        clusters.push(cluster)
      } else {
        // Single tab - create individual cluster
        cluster.name = tabs[i].title
        cluster.type = 'individual'
        clusters.push(cluster)
      }
    }

    return clusters
  }

  // Rule-based Organization Methods
  detectProjectContext(tabs) {
    // Detect if tabs are related to a project/task
    const domains = new Set(tabs.map(t => this.extractDomain(t.url)))
    const topics = new Set(tabs.flatMap(t => t.metadata?.topics || []))
    const entities = new Set(tabs.flatMap(t => t.metadata?.entities || []))

    // High topic or entity overlap suggests project context
    return topics.size < tabs.length * 0.7 || entities.size < tabs.length * 0.8
  }

  groupByProject(tabs) {
    const projects = new Map()

    tabs.forEach(tab => {
      const projectKey = this.inferProjectKey(tab)
      if (!projects.has(projectKey)) {
        projects.set(projectKey, {
          id: `project_${projectKey}`,
          name: this.generateProjectName(projectKey),
          tabs: [],
          type: 'project_based',
          confidence: 0.8
        })
      }
      projects.get(projectKey).tabs.push(tab)
    })

    return {
      type: 'project_grouping',
      clusters: Array.from(projects.values())
    }
  }

  clusterBySmartDomain(tabs) {
    const domainClusters = new Map()

    tabs.forEach(tab => {
      const smartDomain = this.getSmartDomainGroup(tab.url, tab.metadata)
      
      if (!domainClusters.has(smartDomain)) {
        domainClusters.set(smartDomain, {
          id: `domain_${smartDomain}`,
          name: this.formatDomainName(smartDomain),
          tabs: [],
          type: 'smart_domain',
          confidence: 0.7
        })
      }
      
      domainClusters.get(smartDomain).tabs.push(tab)
    })

    return {
      type: 'smart_domain_clustering',
      clusters: Array.from(domainClusters.values()).filter(cluster => cluster.tabs.length > 0)
    }
  }

  detectWorkflowPattern(tabs) {
    // Analyze sequential patterns to detect workflows
    const pattern = this.accessPatterns.get('global')
    if (!pattern || pattern.sequentialPatterns.length < 3) return false

    const sequences = pattern.sequentialPatterns.slice(-5) // Last 5 accesses
    const uniqueDomains = new Set(sequences.map(s => s.domain))
    
    // Workflow detected if we have varied domains accessed in sequence
    return uniqueDomains.size >= 2 && sequences.length >= 3
  }

  clusterByWorkflow(tabs) {
    const workflows = this.identifyWorkflows(tabs)
    
    return {
      type: 'workflow_clustering',
      clusters: workflows.map((workflow, index) => ({
        id: `workflow_${index}`,
        name: workflow.name,
        tabs: workflow.tabs,
        type: 'workflow_based',
        confidence: workflow.confidence,
        sequence: workflow.sequence
      }))
    }
  }

  // Utility Methods
  generateClusterName(tabs) {
    if (!Array.isArray(tabs)) tabs = [tabs]
    
    if (tabs.length === 1) {
      return tabs[0].title
    }

    // Find common themes
    const commonTopics = this.findCommonTopics(tabs.flatMap(t => t.metadata?.topics || []))
    if (commonTopics.length > 0) {
      return `${commonTopics[0]} Research`
    }

    const commonDomain = this.findCommonDomain(tabs.map(t => t.url))
    if (commonDomain) {
      return `${this.formatDomainName(commonDomain)} Tabs`
    }

    return `Tab Group ${Date.now()}`
  }

  async applyOrganization(organization) {
    try {
      // Clear existing clusters
      this.clusters.clear()

      // Apply new clusters
      organization.clusters.forEach((cluster, index) => {
        this.clusters.set(cluster.id, {
          ...cluster,
          createdAt: Date.now(),
          order: index
        })

        // Update tab metadata
        cluster.tabs.forEach(tab => {
          if (this.tabs.has(tab.id)) {
            const existingTab = this.tabs.get(tab.id)
            existingTab.metadata.clusterId = cluster.id
            existingTab.metadata.clusterName = cluster.name
            this.tabs.set(tab.id, existingTab)
          }
        })
      })

      this.logger.info(`📊 Organization applied: ${organization.clusters.length} clusters created`)
    } catch (error) {
      this.logger.error('Failed to apply organization:', error)
    }
  }

  scheduleOrganization() {
    // Debounce organization requests
    if (this.organizationTimeout) {
      clearTimeout(this.organizationTimeout)
    }

    this.organizationTimeout = setTimeout(() => {
      this.performSmartOrganization()
    }, 5000) // 5 second delay
  }

  // Public API
  getOrganizedTabs() {
    const clusters = Array.from(this.clusters.values())
      .sort((a, b) => a.order - b.order)

    return {
      clusters,
      totalTabs: this.tabs.size,
      organized: clusters.reduce((sum, cluster) => sum + cluster.tabs.length, 0),
      lastOrganized: Math.max(...clusters.map(c => c.createdAt || 0))
    }
  }

  getTabInsights() {
    return {
      insights: this.aiInsights.slice(-10),
      patterns: {
        mostUsedDomains: this.getMostUsedDomains(),
        commonWorkflows: this.getCommonWorkflows(),
        timePatterns: this.getTimePatterns()
      },
      recommendations: this.generateRecommendations()
    }
  }

  // Helper methods would be implemented here...
  cosineSimilarity(vector1, vector2) {
    // Simplified cosine similarity implementation
    if (vector1.length !== vector2.length) return 0
    
    const dotProduct = vector1.reduce((sum, val, i) => sum + val * vector2[i], 0)
    const magnitude1 = Math.sqrt(vector1.reduce((sum, val) => sum + val * val, 0))
    const magnitude2 = Math.sqrt(vector2.reduce((sum, val) => sum + val * val, 0))
    
    return magnitude1 && magnitude2 ? dotProduct / (magnitude1 * magnitude2) : 0
  }

  extractDomain(url) {
    try {
      return new URL(url).hostname
    } catch {
      return 'unknown'
    }
  }

  // Cleanup
  cleanup() {
    this.tabs.clear()
    this.clusters.clear()
    this.accessPatterns.clear()
    this.logger.info('🧹 Smart Tab Organizer cleaned up')
  }
}

// Helper Classes (Simplified implementations)
class SemanticAnalyzer {
  async analyze(title, url, content) {
    // Simplified semantic analysis
    return {
      vector: this.generateSemanticVector(title + ' ' + content),
      topics: this.extractTopics(title + ' ' + content),
      entities: this.extractEntities(title + ' ' + content)
    }
  }

  generateSemanticVector(text) {
    // Simplified vector generation
    return text.toLowerCase().split(' ').map(word => this.wordToNumber(word)).slice(0, 50)
  }

  wordToNumber(word) {
    return word.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) / 1000
  }

  extractTopics(text) {
    // Simplified topic extraction
    const topics = []
    const keywords = ['research', 'development', 'design', 'shopping', 'news', 'social', 'work', 'entertainment']
    keywords.forEach(keyword => {
      if (text.toLowerCase().includes(keyword)) {
        topics.push(keyword)
      }
    })
    return topics
  }

  extractEntities(text) {
    // Simplified entity extraction
    const entities = []
    const patterns = [
      /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, // Names
      /\b\d{4}\b/g, // Years
      /\$\d+/g // Prices
    ]
    
    patterns.forEach(pattern => {
      const matches = text.match(pattern)
      if (matches) entities.push(...matches)
    })
    
    return entities
  }
}

class IntentDetector {
  async detectIntent(tab) {
    // Simplified intent detection
    const url = tab.url.toLowerCase()
    const title = tab.title.toLowerCase()
    
    if (url.includes('shop') || url.includes('buy') || url.includes('cart')) return 'shopping'
    if (url.includes('github') || url.includes('stackoverflow')) return 'development'
    if (url.includes('news') || url.includes('blog')) return 'reading'
    if (title.includes('search') || title.includes('results')) return 'research'
    if (url.includes('social') || url.includes('twitter') || url.includes('facebook')) return 'social'
    
    return 'browsing'
  }
}

class WorkflowRecognizer {
  recognizeWorkflow(tabs) {
    // Simplified workflow recognition
    return {
      type: 'sequential',
      confidence: 0.7,
      steps: tabs.map((tab, index) => ({
        step: index + 1,
        action: this.inferAction(tab),
        tab: tab.id
      }))
    }
  }

  inferAction(tab) {
    const intent = tab.metadata?.intent || 'unknown'
    return intent === 'unknown' ? 'browse' : intent
  }
}

class ContentClassifier {
  async classify(tab) {
    // Simplified content classification
    const url = tab.url.toLowerCase()
    const title = tab.title.toLowerCase()
    
    if (url.includes('youtube') || url.includes('video')) {
      return { type: 'video', category: 'media' }
    }
    if (url.includes('pdf') || title.includes('document')) {
      return { type: 'document', category: 'reference' }
    }
    if (url.includes('github') || url.includes('code')) {
      return { type: 'code', category: 'development' }
    }
    if (url.includes('news') || url.includes('article')) {
      return { type: 'article', category: 'information' }
    }
    
    return { type: 'webpage', category: 'general' }
  }
}

module.exports = SmartTabOrganizer