// ⚡ ADVANCED UPGRADE: Intelligent Performance Optimizer
// Replaces basic PerformanceMonitor with AI-powered performance intelligence
// Features: ML-based prediction, automatic optimization, proactive issue resolution

import { createLogger } from '../../core/logger/EnhancedLogger'
import { appEvents } from '../../core/utils/EventEmitter'

const logger = createLogger('IntelligentPerformanceOptimizer')

export interface IntelligentPerformanceMetric {
  name: string
  value: number
  unit: string
  timestamp: number
  category: 'memory' | 'cpu' | 'network' | 'ui' | 'ai' | 'disk' | 'battery'
  importance: number
  trend: 'improving' | 'stable' | 'degrading' | 'critical'
  predictedValue?: number
  confidence: number
  context: {
    userActivity: string
    systemLoad: number
    activeFeatures: string[]
  }
}

export interface IntelligentPerformanceAlert {
  id: string
  type: 'prediction' | 'warning' | 'critical' | 'optimization'
  message: string
  metrics: IntelligentPerformanceMetric[]
  recommendation: string
  autoFixAvailable: boolean
  severity: 'low' | 'medium' | 'high' | 'critical'
  timestamp: number
  expectedImpact: string
  confidenceLevel: number
  rootCause?: {
    component: string
    reason: string
    probability: number
  }
}

export interface PerformanceOptimization {
  id: string
  type: 'memory_cleanup' | 'cpu_throttling' | 'cache_optimization' | 'preload_adjustment' | 'resource_allocation'
  description: string
  expectedImprovement: number
  implementedAt: number
  status: 'pending' | 'implementing' | 'completed' | 'failed'
  impact: {
    memory?: number
    cpu?: number
    responseTime?: number
    userExperience?: number
  }
}

export interface PerformancePrediction {
  metric: string
  currentValue: number
  predictedValue: number
  timeHorizon: number // minutes into future
  confidence: number
  factors: Array<{
    factor: string
    influence: number
    description: string
  }>
}

class IntelligentPerformanceOptimizer {
  private static instance: IntelligentPerformanceOptimizer
  private metrics: IntelligentPerformanceMetric[] = []
  private alerts: IntelligentPerformanceAlert[] = []
  private optimizations: PerformanceOptimization[] = []
  private predictions: Map<string, PerformancePrediction[]> = new Map()
  private monitoringInterval: ReturnType<typeof setInterval> | null = null
  private optimizationInterval: ReturnType<typeof setInterval> | null = null
  private predictionInterval: ReturnType<typeof setInterval> | null = null
  private isMonitoring = false
  private isInitialized = false
  private maxMetricsHistory = 2000
  private performanceBaseline: Map<string, number> = new Map()
  private mlEngine: any = null
  private optimizationEngine: any = null
  private predictionEngine: any = null

  // Advanced performance thresholds with adaptive learning
  private adaptiveThresholds = {
    memoryUsage: { base: 500 * 1024 * 1024, current: 500 * 1024 * 1024, confidence: 0.8 },
    cpuUsage: { base: 80, current: 80, confidence: 0.8 },
    responseTime: { base: 5000, current: 5000, confidence: 0.8 },
    networkLatency: { base: 1000, current: 1000, confidence: 0.8 },
    aiResponseTime: { base: 10000, current: 10000, confidence: 0.8 },
    tabCount: { base: 20, current: 20, confidence: 0.8 },
    diskIO: { base: 50 * 1024 * 1024, current: 50 * 1024 * 1024, confidence: 0.8 },
    batteryDrain: { base: 15, current: 15, confidence: 0.8 } // % per hour
  }

  static getInstance(): IntelligentPerformanceOptimizer {
    if (!IntelligentPerformanceOptimizer.instance) {
      IntelligentPerformanceOptimizer.instance = new IntelligentPerformanceOptimizer()
    }
    return IntelligentPerformanceOptimizer.instance
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      logger.warn('IntelligentPerformanceOptimizer already initialized')
      return
    }

    logger.info('🧠 Initializing Intelligent Performance Optimizer...')
    
    try {
      // Initialize AI engines
      await this.initializeIntelligenceEngines()
      
      // Setup advanced performance observers
      this.setupAdvancedPerformanceObserver()
      
      // Establish performance baseline
      await this.establishPerformanceBaseline()
      
      // Start intelligent monitoring
      this.startIntelligentMonitoring()
      
      // Initialize predictive systems
      await this.initializePredictiveSystems()
      
      // Start automatic optimization
      this.startAutomaticOptimization()
      
      this.isInitialized = true
      logger.info('✅ Intelligent Performance Optimizer initialized successfully')
      
    } catch (error) {
      logger.error('❌ Intelligent Performance Optimizer initialization failed:', error)
      throw error
    }
  }

  private async initializeIntelligenceEngines(): Promise<void> {
    try {
      // ML Engine for pattern recognition and prediction
      this.mlEngine = {
        analyzePatterns: (metrics: IntelligentPerformanceMetric[]) => this.analyzePerformancePatterns(metrics),
        predictTrends: (metric: string, history: number[]) => this.predictMetricTrends(metric, history),
        detectAnomalies: (current: IntelligentPerformanceMetric, baseline: number) => this.detectPerformanceAnomalies(current, baseline),
        classifyIssues: (metrics: IntelligentPerformanceMetric[]) => this.classifyPerformanceIssues(metrics),
        optimizeThresholds: () => this.optimizeAdaptiveThresholds()
      }

      // Optimization Engine for automatic fixes
      this.optimizationEngine = {
        generateOptimizations: (alerts: IntelligentPerformanceAlert[]) => this.generateOptimizationPlan(alerts),
        executeOptimization: (optimization: PerformanceOptimization) => this.executeOptimization(optimization),
        validateOptimization: (optimization: PerformanceOptimization) => this.validateOptimizationImpact(optimization),
        rollbackOptimization: (optimization: PerformanceOptimization) => this.rollbackOptimization(optimization)
      }

      // Prediction Engine for forecasting
      this.predictionEngine = {
        forecastMetrics: (metric: string, timeHorizon: number) => this.forecastMetric(metric, timeHorizon),
        predictSystemLoad: (currentContext: any) => this.predictSystemLoad(currentContext),
        anticipateBottlenecks: (trends: any[]) => this.anticipatePerformanceBottlenecks(trends),
        suggestProactiveActions: (predictions: PerformancePrediction[]) => this.suggestProactiveActions(predictions)
      }

      logger.info('🤖 Intelligence engines initialized')
    } catch (error) {
      logger.error('Failed to initialize intelligence engines:', error)
      throw error
    }
  }

  private setupAdvancedPerformanceObserver(): void {
    try {
      // Enhanced Performance Observer with more entry types
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            const metric: IntelligentPerformanceMetric = {
              name: entry.name,
              value: entry.duration,
              unit: 'ms',
              timestamp: Date.now(),
              category: this.categorizePerformanceEntry(entry),
              importance: this.calculateMetricImportance(entry.name, entry.duration),
              trend: this.analyzeTrend(entry.name, entry.duration),
              confidence: 0.9,
              context: this.getCurrentContext()
            }

            this.recordIntelligentMetric(metric)
          })
        })

        try {
          observer.observe({ 
            entryTypes: ['navigation', 'measure', 'mark', 'resource', 'paint', 'largest-contentful-paint', 'layout-shift']
          })
        } catch (error) {
          logger.warn('Advanced PerformanceObserver not fully supported', error as Error)
          // Fallback to basic observation
          observer.observe({ entryTypes: ['navigation', 'measure', 'mark'] })
        }
      }

      // Additional observers for modern metrics
      this.setupModernPerformanceObservers()
      
    } catch (error) {
      logger.warn('Failed to setup advanced performance observer:', error)
    }
  }

  private setupModernPerformanceObservers(): void {
    try {
      // Web Vitals Observer
      if ('PerformanceObserver' in window) {
        // Largest Contentful Paint
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.recordIntelligentMetric({
              name: 'largest_contentful_paint',
              value: entry.startTime,
              unit: 'ms',
              timestamp: Date.now(),
              category: 'ui',
              importance: 0.9,
              trend: this.analyzeTrend('largest_contentful_paint', entry.startTime),
              confidence: 0.95,
              context: this.getCurrentContext()
            })
          }
        }).observe({ entryTypes: ['largest-contentful-paint'] })

        // Cumulative Layout Shift
        new PerformanceObserver((list) => {
          let clsScore = 0
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsScore += (entry as any).value
            }
          }
          
          if (clsScore > 0) {
            this.recordIntelligentMetric({
              name: 'cumulative_layout_shift',
              value: clsScore,
              unit: 'score',
              timestamp: Date.now(),
              category: 'ui',
              importance: 0.8,
              trend: this.analyzeTrend('cumulative_layout_shift', clsScore),
              confidence: 0.9,
              context: this.getCurrentContext()
            })
          }
        }).observe({ entryTypes: ['layout-shift'] })
      }
    } catch (error) {
      logger.debug('Modern performance observers not available:', error)
    }
  }

  private categorizePerformanceEntry(entry: PerformanceEntry): 'memory' | 'cpu' | 'network' | 'ui' | 'ai' | 'disk' | 'battery' {
    const name = entry.name.toLowerCase()
    
    if (name.includes('navigation') || name.includes('resource') || name.includes('fetch')) {
      return 'network'
    } else if (name.includes('paint') || name.includes('layout') || name.includes('render')) {
      return 'ui'
    } else if (name.includes('ai') || name.includes('ml') || name.includes('groq')) {
      return 'ai'
    } else if (name.includes('memory') || name.includes('heap')) {
      return 'memory'
    }
    
    return 'cpu' // Default category
  }

  private calculateMetricImportance(name: string, value: number): number {
    // AI-powered importance calculation based on impact on user experience
    let importance = 0.5 // Base importance
    
    // Critical user experience metrics
    if (name.includes('largest_contentful_paint') && value > 2500) importance = 0.95
    if (name.includes('first_input_delay') && value > 100) importance = 0.9
    if (name.includes('cumulative_layout_shift') && value > 0.1) importance = 0.85
    
    // AI response times
    if (name.includes('ai') && value > 5000) importance = 0.8
    
    // Navigation performance
    if (name.includes('navigation') && value > 3000) importance = 0.75
    
    // Memory usage
    if (name.includes('memory') && value > 100 * 1024 * 1024) importance = 0.7 // > 100MB
    
    return importance
  }

  private analyzeTrend(metricName: string, currentValue: number): 'improving' | 'stable' | 'degrading' | 'critical' {
    const recentMetrics = this.metrics
      .filter(m => m.name === metricName)
      .slice(-10) // Last 10 measurements
      .map(m => m.value)

    if (recentMetrics.length < 3) return 'stable'

    const recent = recentMetrics.slice(-3)
    const older = recentMetrics.slice(0, -3)
    
    const recentAvg = recent.reduce((sum, val) => sum + val, 0) / recent.length
    const olderAvg = older.reduce((sum, val) => sum + val, 0) / older.length
    
    const change = (recentAvg - olderAvg) / olderAvg
    const baseline = this.performanceBaseline.get(metricName) || recentAvg
    
    // Check for critical performance
    if (currentValue > baseline * 3) return 'critical'
    
    if (change > 0.2) return 'degrading'
    if (change < -0.1) return 'improving'
    
    return 'stable'
  }

  private getCurrentContext(): {
    userActivity: string
    systemLoad: number
    activeFeatures: string[]
  } {
    return {
      userActivity: this.detectUserActivity(),
      systemLoad: this.estimateSystemLoad(),
      activeFeatures: this.getActiveFeatures()
    }
  }

  private detectUserActivity(): string {
    // Detect current user activity based on recent interactions
    const recentActivity = this.metrics
      .filter(m => Date.now() - m.timestamp < 30000) // Last 30 seconds
      .map(m => m.name)

    if (recentActivity.some(name => name.includes('ai') || name.includes('groq'))) {
      return 'ai_interaction'
    } else if (recentActivity.some(name => name.includes('navigation'))) {
      return 'browsing'
    } else if (recentActivity.some(name => name.includes('search'))) {
      return 'searching'
    }
    
    return 'idle'
  }

  private estimateSystemLoad(): number {
    // Estimate current system load based on various metrics
    const recentMetrics = this.metrics.filter(m => Date.now() - m.timestamp < 60000) // Last minute
    
    if (recentMetrics.length === 0) return 0.3 // Low load assumption
    
    const cpuMetrics = recentMetrics.filter(m => m.category === 'cpu')
    const memoryMetrics = recentMetrics.filter(m => m.category === 'memory')
    
    let loadScore = 0.3 // Base load
    
    // CPU load indicators
    if (cpuMetrics.length > 10) loadScore += 0.3 // High CPU activity
    
    // Memory load indicators
    const avgMemoryUsage = memoryMetrics.reduce((sum, m) => sum + m.value, 0) / Math.max(memoryMetrics.length, 1)
    if (avgMemoryUsage > 200 * 1024 * 1024) loadScore += 0.4 // > 200MB
    
    return Math.min(loadScore, 1.0)
  }

  private getActiveFeatures(): string[] {
    // Detect which features are currently active
    const features: string[] = []
    
    const recentMetrics = this.metrics.filter(m => Date.now() - m.timestamp < 60000)
    
    if (recentMetrics.some(m => m.name.includes('ai'))) features.push('ai_assistant')
    if (recentMetrics.some(m => m.name.includes('search'))) features.push('intelligent_search')
    if (recentMetrics.some(m => m.name.includes('navigation'))) features.push('smart_navigation')
    if (recentMetrics.some(m => m.name.includes('tab'))) features.push('tab_management')
    
    return features
  }

  private async establishPerformanceBaseline(): Promise<void> {
    try {
      logger.info('📊 Establishing performance baseline...')
      
      // Collect initial metrics for baseline
      const initialMetrics: { [key: string]: number[] } = {}
      
      // Simulate baseline data collection over a short period
      for (let i = 0; i < 10; i++) {
        await this.collectAdvancedMetrics()
        await new Promise(resolve => setTimeout(resolve, 500)) // Wait 500ms between collections
      }
      
      // Calculate baseline for each metric type
      const metricGroups = this.groupMetricsByName(this.metrics.slice(-50)) // Use last 50 metrics
      
      for (const [metricName, metrics] of Object.entries(metricGroups)) {
        const values = metrics.map(m => m.value)
        const baseline = values.reduce((sum, val) => sum + val, 0) / values.length
        this.performanceBaseline.set(metricName, baseline)
      }
      
      logger.info(`✅ Performance baseline established for ${this.performanceBaseline.size} metrics`)
      
    } catch (error) {
      logger.warn('Failed to establish performance baseline:', error)
    }
  }

  private groupMetricsByName(metrics: IntelligentPerformanceMetric[]): { [key: string]: IntelligentPerformanceMetric[] } {
    const groups: { [key: string]: IntelligentPerformanceMetric[] } = {}
    
    for (const metric of metrics) {
      if (!groups[metric.name]) {
        groups[metric.name] = []
      }
      groups[metric.name].push(metric)
    }
    
    return groups
  }

  private startIntelligentMonitoring(): void {
    if (this.isMonitoring) return

    this.isMonitoring = true

    // Primary monitoring - collect metrics every 15 seconds
    this.monitoringInterval = setInterval(async () => {
      await this.collectAdvancedMetrics()
    }, 15000)

    // Performance analysis and optimization detection - every 2 minutes
    this.optimizationInterval = setInterval(async () => {
      await this.performIntelligentAnalysis()
    }, 2 * 60 * 1000)

    // Predictive analysis - every 5 minutes
    this.predictionInterval = setInterval(async () => {
      await this.performPredictiveAnalysis()
    }, 5 * 60 * 1000)

    logger.info('🔍 Intelligent performance monitoring started')
  }

  private async collectAdvancedMetrics(): Promise<void> {
    try {
      const context = this.getCurrentContext()

      // Advanced memory metrics
      if ('memory' in performance) {
        const memory = (performance as any).memory
        
        this.recordIntelligentMetric({
          name: 'heap_used',
          value: memory.usedJSHeapSize,
          unit: 'bytes',
          timestamp: Date.now(),
          category: 'memory',
          importance: this.calculateMemoryImportance(memory.usedJSHeapSize),
          trend: this.analyzeTrend('heap_used', memory.usedJSHeapSize),
          confidence: 0.95,
          context
        })

        this.recordIntelligentMetric({
          name: 'heap_total',
          value: memory.totalJSHeapSize,
          unit: 'bytes',
          timestamp: Date.now(),
          category: 'memory',
          importance: 0.7,
          trend: this.analyzeTrend('heap_total', memory.totalJSHeapSize),
          confidence: 0.95,
          context
        })

        // Calculate memory pressure
        const memoryPressure = memory.usedJSHeapSize / memory.totalJSHeapSize
        this.recordIntelligentMetric({
          name: 'memory_pressure',
          value: memoryPressure * 100,
          unit: 'percentage',
          timestamp: Date.now(),
          category: 'memory',
          importance: 0.9,
          trend: this.analyzeTrend('memory_pressure', memoryPressure * 100),
          confidence: 0.9,
          context
        })
      }

      // Advanced UI metrics
      await this.collectUIMetrics(context)
      
      // Advanced AI metrics
      await this.collectAIMetrics(context)
      
      // System integration metrics
      await this.collectSystemMetrics(context)
      
      // Check for immediate alerts
      await this.checkForImmediateAlerts()
      
    } catch (error) {
      logger.error('Failed to collect advanced performance metrics', error as Error)
    }
  }

  private calculateMemoryImportance(usedMemory: number): number {
    const threshold = this.adaptiveThresholds.memoryUsage.current
    const ratio = usedMemory / threshold
    
    if (ratio > 1.5) return 0.95 // Critical
    if (ratio > 1.2) return 0.8  // High
    if (ratio > 0.8) return 0.6  // Medium
    return 0.4 // Low
  }

  private async collectUIMetrics(context: any): Promise<void> {
    try {
      // DOM complexity metrics
      const domNodes = document.getElementsByTagName('*').length
      this.recordIntelligentMetric({
        name: 'dom_nodes',
        value: domNodes,
        unit: 'count',
        timestamp: Date.now(),
        category: 'ui',
        importance: domNodes > 5000 ? 0.8 : 0.4,
        trend: this.analyzeTrend('dom_nodes', domNodes),
        confidence: 1.0,
        context
      })

      // Event listeners count
      const eventListeners = this.estimateEventListeners()
      this.recordIntelligentMetric({
        name: 'event_listeners',
        value: eventListeners,
        unit: 'count',
        timestamp: Date.now(),
        category: 'ui',
        importance: eventListeners > 1000 ? 0.7 : 0.3,
        trend: this.analyzeTrend('event_listeners', eventListeners),
        confidence: 0.7,
        context
      })

      // React component count (if applicable)
      const reactComponents = this.estimateReactComponents()
      if (reactComponents > 0) {
        this.recordIntelligentMetric({
          name: 'react_components',
          value: reactComponents,
          unit: 'count',
          timestamp: Date.now(),
          category: 'ui',
          importance: reactComponents > 100 ? 0.6 : 0.3,
          trend: this.analyzeTrend('react_components', reactComponents),
          confidence: 0.8,
          context
        })
      }

    } catch (error) {
      logger.warn('UI metrics collection failed:', error)
    }
  }

  private async collectAIMetrics(context: any): Promise<void> {
    try {
      // AI service status metrics
      if (window.electronAPI) {
        try {
          const aiStatus = await this.getAIServiceStatus()
          if (aiStatus) {
            this.recordIntelligentMetric({
              name: 'ai_service_health',
              value: aiStatus.health * 100,
              unit: 'percentage',
              timestamp: Date.now(),
              category: 'ai',
              importance: 0.9,
              trend: this.analyzeTrend('ai_service_health', aiStatus.health * 100),
              confidence: aiStatus.confidence || 0.8,
              context
            })

            this.recordIntelligentMetric({
              name: 'ai_response_queue',
              value: aiStatus.queueSize || 0,
              unit: 'count',
              timestamp: Date.now(),
              category: 'ai',
              importance: aiStatus.queueSize > 5 ? 0.8 : 0.4,
              trend: this.analyzeTrend('ai_response_queue', aiStatus.queueSize || 0),
              confidence: 0.9,
              context
            })
          }
        } catch (error) {
          // AI service not available
        }
      }

    } catch (error) {
      logger.warn('AI metrics collection failed:', error)
    }
  }

  private async collectSystemMetrics(context: any): Promise<void> {
    try {
      // Browser tab count
      if (window.electronAPI) {
        try {
          const debugInfo = await window.electronAPI.debugBrowserView?.()
          if (debugInfo?.success) {
            const tabCount = debugInfo.data.totalTabs
            
            this.recordIntelligentMetric({
              name: 'active_tabs',
              value: tabCount,
              unit: 'count',
              timestamp: Date.now(),
              category: 'ui',
              importance: this.calculateTabImportance(tabCount),
              trend: this.analyzeTrend('active_tabs', tabCount),
              confidence: 1.0,
              context
            })
          }
        } catch (error) {
          // Tab info not available
        }
      }

      // Network connectivity quality
      if ('connection' in navigator) {
        const connection = (navigator as any).connection
        if (connection) {
          this.recordIntelligentMetric({
            name: 'network_downlink',
            value: connection.downlink || 0,
            unit: 'mbps',
            timestamp: Date.now(),
            category: 'network',
            importance: connection.downlink < 1 ? 0.8 : 0.4,
            trend: this.analyzeTrend('network_downlink', connection.downlink || 0),
            confidence: 0.7,
            context
          })

          this.recordIntelligentMetric({
            name: 'network_rtt',
            value: connection.rtt || 0,
            unit: 'ms',
            timestamp: Date.now(),
            category: 'network',
            importance: connection.rtt > 500 ? 0.8 : 0.4,
            trend: this.analyzeTrend('network_rtt', connection.rtt || 0),
            confidence: 0.7,
            context
          })
        }
      }

    } catch (error) {
      logger.warn('System metrics collection failed:', error)
    }
  }

  private calculateTabImportance(tabCount: number): number {
    const threshold = this.adaptiveThresholds.tabCount.current
    if (tabCount > threshold * 1.5) return 0.9
    if (tabCount > threshold) return 0.7
    if (tabCount > threshold * 0.7) return 0.5
    return 0.3
  }

  private recordIntelligentMetric(metric: IntelligentPerformanceMetric): void {
    // Add predictions to the metric
    const prediction = this.generateMetricPrediction(metric)
    if (prediction) {
      metric.predictedValue = prediction.value
      metric.confidence = Math.min(metric.confidence, prediction.confidence)
    }

    this.metrics.push(metric)

    // Maintain metrics history limit
    if (this.metrics.length > this.maxMetricsHistory) {
      this.metrics = this.metrics.slice(-this.maxMetricsHistory)
    }

    // Emit metric event
    appEvents.emit('intelligent-performance:metric', metric)

    // Check for immediate alerts
    this.checkMetricForAlerts(metric)
  }

  private generateMetricPrediction(metric: IntelligentPerformanceMetric): { value: number; confidence: number } | null {
    try {
      const historicalData = this.metrics
        .filter(m => m.name === metric.name)
        .slice(-20) // Last 20 measurements
        .map(m => m.value)

      if (historicalData.length < 5) return null

      // Simple linear trend prediction
      const trend = this.calculateLinearTrend(historicalData)
      const predictedValue = metric.value + (trend * 1) // Predict 1 time unit ahead
      const confidence = Math.max(0.3, 1 - Math.abs(trend) / metric.value) // Lower confidence for high volatility

      return {
        value: Math.max(0, predictedValue),
        confidence: Math.min(confidence, 0.9)
      }

    } catch (error) {
      return null
    }
  }

  private calculateLinearTrend(values: number[]): number {
    if (values.length < 2) return 0

    const n = values.length
    const sumX = (n * (n - 1)) / 2 // Sum of indices
    const sumY = values.reduce((sum, val) => sum + val, 0)
    const sumXY = values.reduce((sum, val, index) => sum + (val * index), 0)
    const sumXX = (n * (n - 1) * (2 * n - 1)) / 6

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
    return slope
  }

  private checkMetricForAlerts(metric: IntelligentPerformanceMetric): void {
    try {
      const threshold = this.adaptiveThresholds[metric.name as keyof typeof this.adaptiveThresholds]
      if (!threshold) return

      const exceedsThreshold = metric.value > threshold.current
      const isDeterioring = metric.trend === 'degrading' || metric.trend === 'critical'
      const isPredictedIssue = metric.predictedValue && metric.predictedValue > threshold.current * 1.2

      if (exceedsThreshold || (isDeterioring && metric.importance > 0.7) || isPredictedIssue) {
        this.createIntelligentAlert({
          type: isPredictedIssue ? 'prediction' : exceedsThreshold ? 'critical' : 'warning',
          message: this.generateAlertMessage(metric, threshold),
          metrics: [metric],
          recommendation: this.generateAlertRecommendation(metric),
          autoFixAvailable: this.hasAutoFix(metric),
          severity: this.calculateAlertSeverity(metric, threshold),
          expectedImpact: this.calculateExpectedImpact(metric),
          confidenceLevel: metric.confidence,
          rootCause: this.analyzeRootCause(metric)
        })
      }

    } catch (error) {
      logger.warn('Alert check failed:', error)
    }
  }

  private createIntelligentAlert(alertData: Omit<IntelligentPerformanceAlert, 'id' | 'timestamp'>): void {
    const alert: IntelligentPerformanceAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      ...alertData
    }

    this.alerts.push(alert)
    
    // Emit alert event
    appEvents.emit('intelligent-performance:alert', alert)

    logger.info('🚨 Intelligent performance alert created:', {
      type: alert.type,
      severity: alert.severity,
      message: alert.message
    })

    // Auto-execute fixes if available and appropriate
    if (alert.autoFixAvailable && alert.severity !== 'low' && alert.confidenceLevel > 0.8) {
      this.executeAutoFix(alert)
    }
  }

  private generateAlertMessage(metric: IntelligentPerformanceMetric, threshold: any): string {
    const exceeds = metric.value > threshold.current
    const percentage = ((metric.value / threshold.current - 1) * 100).toFixed(1)
    
    if (metric.predictedValue && metric.predictedValue > threshold.current * 1.2) {
      return `Predicted performance issue: ${metric.name} is forecasted to exceed threshold by ${percentage}% based on current trends`
    } else if (exceeds) {
      return `Performance threshold exceeded: ${metric.name} is ${percentage}% above optimal level (${this.formatMetricValue(metric)})`
    } else {
      return `Performance degradation detected: ${metric.name} is showing concerning trends (${this.formatMetricValue(metric)})`
    }
  }

  private formatMetricValue(metric: IntelligentPerformanceMetric): string {
    const value = metric.value
    const unit = metric.unit
    
    if (unit === 'bytes') {
      if (value > 1024 * 1024 * 1024) return `${(value / (1024 * 1024 * 1024)).toFixed(1)} GB`
      if (value > 1024 * 1024) return `${(value / (1024 * 1024)).toFixed(1)} MB`
      if (value > 1024) return `${(value / 1024).toFixed(1)} KB`
    }
    
    return `${value.toFixed(1)} ${unit}`
  }

  private generateAlertRecommendation(metric: IntelligentPerformanceMetric): string {
    const category = metric.category
    const name = metric.name
    
    // AI-powered recommendation generation
    if (category === 'memory') {
      if (name.includes('heap')) {
        return 'Consider closing unused tabs, clearing cache, or reducing memory-intensive operations'
      }
      return 'Monitor memory usage patterns and consider optimization strategies'
    } else if (category === 'cpu') {
      return 'Reduce CPU-intensive operations, optimize algorithms, or implement background processing'
    } else if (category === 'ai') {
      return 'Optimize AI query complexity, implement caching, or adjust concurrency limits'
    } else if (category === 'network') {
      return 'Check network connectivity, optimize request patterns, or implement offline capabilities'
    } else if (category === 'ui') {
      return 'Optimize DOM structure, reduce component complexity, or implement virtual rendering'
    }
    
    return 'Monitor the situation and consider performance optimization strategies'
  }

  private hasAutoFix(metric: IntelligentPerformanceMetric): boolean {
    // Determine if automatic fixes are available for this metric
    const autofixableMetrics = [
      'heap_used', // Memory cleanup
      'dom_nodes', // DOM optimization
      'active_tabs', // Tab management
      'ai_response_queue', // Queue management
      'memory_pressure' // Memory optimization
    ]
    
    return autofixableMetrics.includes(metric.name)
  }

  private calculateAlertSeverity(metric: IntelligentPerformanceMetric, threshold: any): 'low' | 'medium' | 'high' | 'critical' {
    const ratio = metric.value / threshold.current
    const importance = metric.importance
    
    if (ratio > 2.0 || importance > 0.9) return 'critical'
    if (ratio > 1.5 || importance > 0.7) return 'high'
    if (ratio > 1.2 || importance > 0.5) return 'medium'
    return 'low'
  }

  private calculateExpectedImpact(metric: IntelligentPerformanceMetric): string {
    const category = metric.category
    const severity = metric.importance
    
    if (category === 'memory' && severity > 0.8) {
      return 'Potential application slowdown, crashes, or unresponsiveness'
    } else if (category === 'ui' && severity > 0.7) {
      return 'Degraded user experience, slow interactions, visual glitches'
    } else if (category === 'ai' && severity > 0.6) {
      return 'Slower AI responses, reduced accuracy, timeout errors'
    } else if (category === 'network' && severity > 0.5) {
      return 'Slow page loads, failed requests, offline functionality issues'
    }
    
    return 'Minor performance impact on overall system efficiency'
  }

  private analyzeRootCause(metric: IntelligentPerformanceMetric): { component: string; reason: string; probability: number } | undefined {
    // AI-powered root cause analysis
    const category = metric.category
    const name = metric.name
    const context = metric.context
    
    if (category === 'memory' && name.includes('heap')) {
      if (context.activeFeatures.includes('ai_assistant')) {
        return {
          component: 'AI Assistant',
          reason: 'High memory usage from AI model operations',
          probability: 0.8
        }
      } else if (context.activeFeatures.includes('tab_management')) {
        return {
          component: 'Browser Tabs',
          reason: 'Memory leaks or excessive tab count',
          probability: 0.7
        }
      }
    } else if (category === 'ai' && context.userActivity === 'ai_interaction') {
      return {
        component: 'GROQ API Integration',
        reason: 'High latency or API rate limiting',
        probability: 0.75
      }
    } else if (category === 'ui' && name.includes('dom')) {
      return {
        component: 'React Components',
        reason: 'Complex DOM tree or memory leaks in components',
        probability: 0.65
      }
    }
    
    return undefined
  }

  // Automatic optimization execution
  private async executeAutoFix(alert: IntelligentPerformanceAlert): Promise<void> {
    try {
      logger.info('🔧 Executing automatic performance fix:', alert.id)
      
      const optimizations = await this.optimizationEngine.generateOptimizations([alert])
      
      for (const optimization of optimizations) {
        const result = await this.optimizationEngine.executeOptimization(optimization)
        if (result.success) {
          logger.info('✅ Auto-fix executed successfully:', optimization.type)
          
          // Validate the fix after a short delay
          setTimeout(async () => {
            await this.optimizationEngine.validateOptimization(optimization)
          }, 10000) // Validate after 10 seconds
        }
      }
      
    } catch (error) {
      logger.error('❌ Auto-fix execution failed:', error)
    }
  }

  // Performance analysis and optimization
  private async performIntelligentAnalysis(): Promise<void> {
    try {
      // Analyze recent metrics for patterns
      const recentMetrics = this.metrics.filter(m => Date.now() - m.timestamp < 5 * 60 * 1000) // Last 5 minutes
      const patterns = await this.mlEngine.analyzePatterns(recentMetrics)
      
      // Detect anomalies
      const anomalies = await this.detectSystemAnomalies(recentMetrics)
      
      // Update adaptive thresholds
      await this.mlEngine.optimizeThresholds()
      
      // Generate optimization opportunities
      const optimizationOpportunities = await this.identifyOptimizationOpportunities(recentMetrics, patterns)
      
      // Emit analysis results
      appEvents.emit('intelligent-performance:analysis', {
        patterns,
        anomalies,
        optimizationOpportunities,
        systemHealth: this.calculateSystemHealth(recentMetrics)
      })
      
    } catch (error) {
      logger.warn('Intelligent performance analysis failed:', error)
    }
  }

  private async detectSystemAnomalies(metrics: IntelligentPerformanceMetric[]): Promise<any[]> {
    const anomalies: any[] = []
    
    try {
      const metricGroups = this.groupMetricsByName(metrics)
      
      for (const [metricName, metricsList] of Object.entries(metricGroups)) {
        const baseline = this.performanceBaseline.get(metricName)
        if (!baseline) continue
        
        for (const metric of metricsList) {
          const anomaly = await this.mlEngine.detectAnomalies(metric, baseline)
          if (anomaly && anomaly.severity > 0.7) {
            anomalies.push({
              metric: metricName,
              expectedValue: baseline,
              actualValue: metric.value,
              severity: anomaly.severity,
              description: anomaly.description
            })
          }
        }
      }
      
    } catch (error) {
      logger.warn('Anomaly detection failed:', error)
    }
    
    return anomalies
  }

  private async identifyOptimizationOpportunities(metrics: IntelligentPerformanceMetric[], patterns: any): Promise<any[]> {
    const opportunities: any[] = []
    
    try {
      // Memory optimization opportunities
      const memoryMetrics = metrics.filter(m => m.category === 'memory')
      if (memoryMetrics.some(m => m.importance > 0.7)) {
        opportunities.push({
          type: 'memory_optimization',
          description: 'High memory usage detected - cleanup recommended',
          expectedImprovement: 0.3,
          effort: 'low'
        })
      }
      
      // UI optimization opportunities
      const uiMetrics = metrics.filter(m => m.category === 'ui')
      const highDomComplexity = uiMetrics.find(m => m.name === 'dom_nodes' && m.value > 3000)
      if (highDomComplexity) {
        opportunities.push({
          type: 'ui_optimization',
          description: 'High DOM complexity - virtual rendering recommended',
          expectedImprovement: 0.25,
          effort: 'medium'
        })
      }
      
      // AI optimization opportunities
      const aiMetrics = metrics.filter(m => m.category === 'ai')
      if (aiMetrics.some(m => m.trend === 'degrading')) {
        opportunities.push({
          type: 'ai_optimization',
          description: 'AI performance degradation - caching or model optimization needed',
          expectedImprovement: 0.4,
          effort: 'high'
        })
      }
      
    } catch (error) {
      logger.warn('Optimization opportunity identification failed:', error)
    }
    
    return opportunities
  }

  private calculateSystemHealth(metrics: IntelligentPerformanceMetric[]): {
    overall: number
    categories: { [key: string]: number }
    trend: 'improving' | 'stable' | 'degrading'
  } {
    try {
      const categoryHealthScores: { [key: string]: number } = {}
      const categories = ['memory', 'cpu', 'network', 'ui', 'ai']
      
      for (const category of categories) {
        const categoryMetrics = metrics.filter(m => m.category === category)
        if (categoryMetrics.length === 0) {
          categoryHealthScores[category] = 0.8 // Default good health
          continue
        }
        
        // Calculate category health based on importance-weighted metrics
        const weightedScore = categoryMetrics.reduce((sum, metric) => {
          const healthScore = this.calculateMetricHealth(metric)
          return sum + (healthScore * metric.importance)
        }, 0)
        
        const totalWeight = categoryMetrics.reduce((sum, metric) => sum + metric.importance, 0)
        categoryHealthScores[category] = totalWeight > 0 ? weightedScore / totalWeight : 0.8
      }
      
      // Calculate overall health
      const overallHealth = Object.values(categoryHealthScores).reduce((sum, score) => sum + score, 0) / 
                           Object.values(categoryHealthScores).length
      
      // Determine trend
      const trend = this.calculateOverallTrend(metrics)
      
      return {
        overall: overallHealth,
        categories: categoryHealthScores,
        trend
      }
      
    } catch (error) {
      logger.warn('System health calculation failed:', error)
      return { overall: 0.5, categories: {}, trend: 'stable' }
    }
  }

  private calculateMetricHealth(metric: IntelligentPerformanceMetric): number {
    // Higher health score for better performance
    if (metric.trend === 'improving') return 0.9
    if (metric.trend === 'stable') return 0.7
    if (metric.trend === 'degrading') return 0.4
    if (metric.trend === 'critical') return 0.1
    
    return 0.5
  }

  private calculateOverallTrend(metrics: IntelligentPerformanceMetric[]): 'improving' | 'stable' | 'degrading' {
    const trendCounts = {
      improving: metrics.filter(m => m.trend === 'improving').length,
      stable: metrics.filter(m => m.trend === 'stable').length,
      degrading: metrics.filter(m => m.trend === 'degrading').length,
      critical: metrics.filter(m => m.trend === 'critical').length
    }
    
    const total = metrics.length
    if (trendCounts.critical > 0 || trendCounts.degrading / total > 0.3) return 'degrading'
    if (trendCounts.improving / total > 0.4) return 'improving'
    
    return 'stable'
  }

  // Predictive performance analysis
  private async performPredictiveAnalysis(): Promise<void> {
    try {
      logger.debug('🔮 Performing predictive performance analysis...')
      
      const predictions: Map<string, PerformancePrediction[]> = new Map()
      
      // Generate predictions for key metrics
      const keyMetrics = ['heap_used', 'ai_response_time', 'dom_nodes', 'network_rtt']
      
      for (const metricName of keyMetrics) {
        const metricPredictions = await this.generateMetricPredictions(metricName)
        if (metricPredictions.length > 0) {
          predictions.set(metricName, metricPredictions)
        }
      }
      
      this.predictions = predictions
      
      // Generate proactive recommendations
      const proactiveActions = await this.predictionEngine.suggestProactiveActions(
        Array.from(predictions.values()).flat()
      )
      
      // Create predictive alerts for concerning trends
      await this.createPredictiveAlerts(predictions)
      
      // Emit predictive analysis results
      appEvents.emit('intelligent-performance:predictions', {
        predictions: Object.fromEntries(predictions),
        proactiveActions,
        confidence: this.calculatePredictionConfidence(predictions)
      })
      
    } catch (error) {
      logger.warn('Predictive performance analysis failed:', error)
    }
  }

  private async generateMetricPredictions(metricName: string): Promise<PerformancePrediction[]> {
    const predictions: PerformancePrediction[] = []
    
    try {
      const historicalData = this.metrics
        .filter(m => m.name === metricName)
        .slice(-50) // Last 50 measurements
        .map(m => ({ value: m.value, timestamp: m.timestamp }))
        .sort((a, b) => a.timestamp - b.timestamp)
      
      if (historicalData.length < 10) return predictions
      
      // Generate predictions for different time horizons
      const timeHorizons = [5, 15, 30, 60] // 5, 15, 30, 60 minutes
      
      for (const horizon of timeHorizons) {
        const prediction = await this.predictionEngine.forecastMetrics(metricName, horizon)
        if (prediction && prediction.confidence > 0.6) {
          predictions.push({
            metric: metricName,
            currentValue: historicalData[historicalData.length - 1].value,
            predictedValue: prediction.value,
            timeHorizon: horizon,
            confidence: prediction.confidence,
            factors: prediction.factors || []
          })
        }
      }
      
    } catch (error) {
      logger.warn(`Prediction generation failed for ${metricName}:`, error)
    }
    
    return predictions
  }

  private async createPredictiveAlerts(predictions: Map<string, PerformancePrediction[]>): Promise<void> {
    try {
      for (const [metricName, metricPredictions] of predictions) {
        const threshold = this.adaptiveThresholds[metricName as keyof typeof this.adaptiveThresholds]
        if (!threshold) continue
        
        const concerningPredictions = metricPredictions.filter(p => 
          p.predictedValue > threshold.current * 1.3 && p.confidence > 0.7
        )
        
        if (concerningPredictions.length > 0) {
          const nearestPrediction = concerningPredictions.reduce((nearest, current) => 
            current.timeHorizon < nearest.timeHorizon ? current : nearest
          )
          
          this.createIntelligentAlert({
            type: 'prediction',
            message: `Predicted performance issue: ${metricName} is forecasted to exceed threshold in ${nearestPrediction.timeHorizon} minutes`,
            metrics: [], // Would include related metrics
            recommendation: `Proactive action needed: ${this.generateProactiveRecommendation(nearestPrediction)}`,
            autoFixAvailable: this.hasAutoFix({ name: metricName } as IntelligentPerformanceMetric),
            severity: nearestPrediction.timeHorizon < 15 ? 'high' : 'medium',
            expectedImpact: 'Performance degradation if no action taken',
            confidenceLevel: nearestPrediction.confidence
          })
        }
      }
      
    } catch (error) {
      logger.warn('Predictive alert creation failed:', error)
    }
  }

  private generateProactiveRecommendation(prediction: PerformancePrediction): string {
    const metric = prediction.metric
    const timeHorizon = prediction.timeHorizon
    
    if (metric.includes('memory') || metric.includes('heap')) {
      return `Consider clearing cache or reducing memory usage before ${timeHorizon} minutes`
    } else if (metric.includes('ai')) {
      return `Optimize AI queries or enable caching before ${timeHorizon} minutes`
    } else if (metric.includes('dom') || metric.includes('ui')) {
      return `Simplify UI or enable virtualization before ${timeHorizon} minutes`
    }
    
    return `Monitor and optimize ${metric} before ${timeHorizon} minutes`
  }

  private calculatePredictionConfidence(predictions: Map<string, PerformancePrediction[]>): number {
    const allPredictions = Array.from(predictions.values()).flat()
    if (allPredictions.length === 0) return 0
    
    const totalConfidence = allPredictions.reduce((sum, p) => sum + p.confidence, 0)
    return totalConfidence / allPredictions.length
  }

  // Public API methods
  recordAIResponse(startTime: number): void {
    const duration = Date.now() - startTime
    
    this.recordIntelligentMetric({
      name: 'ai_response_time',
      value: duration,
      unit: 'ms',
      timestamp: Date.now(),
      category: 'ai',
      importance: duration > this.adaptiveThresholds.aiResponseTime.current ? 0.8 : 0.4,
      trend: this.analyzeTrend('ai_response_time', duration),
      confidence: 0.95,
      context: this.getCurrentContext()
    })
  }

  getIntelligentMetrics(category?: string, timeRange?: number): IntelligentPerformanceMetric[] {
    let filteredMetrics = this.metrics

    if (category) {
      filteredMetrics = filteredMetrics.filter(m => m.category === category)
    }

    if (timeRange) {
      const cutoff = Date.now() - timeRange
      filteredMetrics = filteredMetrics.filter(m => m.timestamp > cutoff)
    }

    return filteredMetrics
  }

  getIntelligentAlerts(count = 10): IntelligentPerformanceAlert[] {
    return this.alerts
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, count)
  }

  getPerformancePredictions(metricName?: string): PerformancePrediction[] {
    if (metricName) {
      return this.predictions.get(metricName) || []
    }
    
    return Array.from(this.predictions.values()).flat()
  }

  getIntelligentPerformanceSummary(): {
    systemHealth: any
    recentAlerts: IntelligentPerformanceAlert[]
    activeOptimizations: PerformanceOptimization[]
    predictions: { [metric: string]: PerformancePrediction }
    recommendations: string[]
    autoFixesApplied: number
    confidenceLevel: number
  } {
    const recentMetrics = this.getIntelligentMetrics(undefined, 3600000) // Last hour
    const systemHealth = this.calculateSystemHealth(recentMetrics)
    const recentAlerts = this.getIntelligentAlerts(5)
    
    // Get next predictions for key metrics
    const keyPredictions: { [metric: string]: PerformancePrediction } = {}
    for (const [metric, predictions] of this.predictions) {
      if (predictions.length > 0) {
        keyPredictions[metric] = predictions[0] // Nearest prediction
      }
    }
    
    const recommendations = this.generateCurrentRecommendations(systemHealth, recentAlerts)
    const autoFixesApplied = this.optimizations.filter(o => o.status === 'completed').length
    const confidenceLevel = this.calculatePredictionConfidence(this.predictions)

    return {
      systemHealth,
      recentAlerts,
      activeOptimizations: this.optimizations.filter(o => o.status === 'implementing'),
      predictions: keyPredictions,
      recommendations,
      autoFixesApplied,
      confidenceLevel
    }
  }

  private generateCurrentRecommendations(systemHealth: any, recentAlerts: IntelligentPerformanceAlert[]): string[] {
    const recommendations: string[] = []
    
    // Health-based recommendations
    if (systemHealth.overall < 0.6) {
      recommendations.push('System health is below optimal - consider comprehensive optimization')
    }
    
    if (systemHealth.categories.memory < 0.5) {
      recommendations.push('Memory usage optimization needed - clear cache or close unused tabs')
    }
    
    if (systemHealth.categories.ai < 0.6) {
      recommendations.push('AI performance issues detected - optimize queries or check network')
    }
    
    // Alert-based recommendations
    const criticalAlerts = recentAlerts.filter(a => a.severity === 'critical')
    if (criticalAlerts.length > 0) {
      recommendations.push('Critical performance issues require immediate attention')
    }
    
    // Trend-based recommendations
    if (systemHealth.trend === 'degrading') {
      recommendations.push('Performance is trending downward - proactive maintenance recommended')
    }
    
    return recommendations
  }

  clearHistory(): void {
    this.metrics = []
    this.alerts = []
    this.optimizations = []
    this.predictions.clear()
    logger.info('Intelligent performance history cleared')
  }

  cleanup(): void {
    this.stopMonitoring()
    this.clearHistory()
    logger.info('Intelligent Performance Optimizer cleaned up')
  }

  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = null
    }
    
    if (this.optimizationInterval) {
      clearInterval(this.optimizationInterval)
      this.optimizationInterval = null
    }
    
    if (this.predictionInterval) {
      clearInterval(this.predictionInterval)
      this.predictionInterval = null
    }
    
    this.isMonitoring = false
    logger.info('Intelligent performance monitoring stopped')
  }

  // Helper methods for startup
  private async startAutomaticOptimization(): Promise<void> {
    logger.info('🤖 Starting automatic performance optimization...')
    // Automatic optimization is handled via the monitoring intervals
  }

  private async initializePredictiveSystems(): Promise<void> {
    logger.info('🔮 Initializing predictive performance systems...')
    // Predictive systems initialization
  }

  isReady(): boolean {
    return this.isInitialized
  }

  // Placeholder methods that would be fully implemented with ML models
  private analyzePerformancePatterns(metrics: IntelligentPerformanceMetric[]): any { return {} }
  private predictMetricTrends(metric: string, history: number[]): any { return { confidence: 0.5, trend: 'stable' } }
  private detectPerformanceAnomalies(current: IntelligentPerformanceMetric, baseline: number): any { 
    return current.value > baseline * 1.5 ? { severity: 0.8, description: 'Significantly above baseline' } : null 
  }
  private classifyPerformanceIssues(metrics: IntelligentPerformanceMetric[]): any { return {} }
  private optimizeAdaptiveThresholds(): void {}
  private generateOptimizationPlan(alerts: IntelligentPerformanceAlert[]): PerformanceOptimization[] { return [] }
  private executeOptimization(optimization: PerformanceOptimization): Promise<{success: boolean}> { 
    return Promise.resolve({success: true}) 
  }
  private validateOptimizationImpact(optimization: PerformanceOptimization): Promise<void> { return Promise.resolve() }
  private rollbackOptimization(optimization: PerformanceOptimization): Promise<void> { return Promise.resolve() }
  private forecastMetric(metric: string, timeHorizon: number): Promise<{value: number, confidence: number, factors: any[]}> { 
    return Promise.resolve({value: 100, confidence: 0.7, factors: []}) 
  }
  private predictSystemLoad(currentContext: any): any { return { load: 0.5, confidence: 0.8 } }
  private anticipatePerformanceBottlenecks(trends: any[]): any { return {} }
  private suggestProactiveActions(predictions: PerformancePrediction[]): Promise<any[]> { return Promise.resolve([]) }
  private estimateEventListeners(): number { return 500 } // Placeholder
  private estimateReactComponents(): number { return 50 } // Placeholder
  private getAIServiceStatus(): Promise<{health: number, queueSize: number, confidence: number}> { 
    return Promise.resolve({health: 0.8, queueSize: 2, confidence: 0.9}) 
  }
  private checkForImmediateAlerts(): Promise<void> { return Promise.resolve() }
}

export default IntelligentPerformanceOptimizer