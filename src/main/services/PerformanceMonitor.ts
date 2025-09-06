/**
 * Performance Monitoring Service for KAiro Browser
 * Monitors application performance and provides optimization recommendations
 */

import { createLogger } from '../../core/logger/Logger'
import { appEvents } from '../../core/utils/EventEmitter'

const logger = createLogger('PerformanceMonitor')

export interface PerformanceMetric {
  name: string
  value: number
  unit: string
  timestamp: number
  category: 'memory' | 'cpu' | 'network' | 'ui' | 'ai'
}

export interface PerformanceAlert {
  id: string
  type: 'warning' | 'critical'
  message: string
  metric: PerformanceMetric
  recommendation: string
  timestamp: number
  severity: 'low' | 'medium' | 'high'
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: PerformanceMetric[] = []
  private alerts: PerformanceAlert[] = []
  private monitoringInterval: NodeJS.Timeout | null = null
  private isMonitoring = false
  private maxMetricsHistory = 1000

  // Performance thresholds
  private readonly thresholds = {
    memoryUsage: 500 * 1024 * 1024, // 500MB
    cpuUsage: 80, // 80%
    responseTime: 5000, // 5 seconds
    tabCount: 20,
    aiResponseTime: 10000 // 10 seconds
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  async initialize(): Promise<void> {
    logger.info('Initializing Performance Monitor')
    
    this.setupPerformanceObserver()
    this.startMonitoring()
    
    logger.info('Performance Monitor initialized')
  }

  private setupPerformanceObserver(): void {
    // Monitor navigation timing
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          this.recordMetric({
            name: entry.name,
            value: entry.duration,
            unit: 'ms',
            timestamp: Date.now(),
            category: 'network'
          })
        })
      })

      try {
        observer.observe({ entryTypes: ['navigation', 'measure', 'mark'] })
      } catch (error) {
        logger.warn('PerformanceObserver not supported', error as Error)
      }
    }
  }

  startMonitoring(): void {
    if (this.isMonitoring) return

    this.isMonitoring = true
    this.monitoringInterval = setInterval(() => {
      this.collectMetrics()
    }, 30000) // Collect metrics every 30 seconds

    logger.info('Performance monitoring started')
  }

  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = null
    }
    this.isMonitoring = false
    logger.info('Performance monitoring stopped')
  }

  private async collectMetrics(): Promise<void> {
    try {
      // Memory usage
      if ('memory' in performance) {
        const memory = (performance as any).memory
        this.recordMetric({
          name: 'heap_used',
          value: memory.usedJSHeapSize,
          unit: 'bytes',
          timestamp: Date.now(),
          category: 'memory'
        })

        this.recordMetric({
          name: 'heap_total',
          value: memory.totalJSHeapSize,
          unit: 'bytes',
          timestamp: Date.now(),
          category: 'memory'
        })

        // Check memory threshold
        if (memory.usedJSHeapSize > this.thresholds.memoryUsage) {
          this.createAlert({
            type: 'warning',
            message: 'High memory usage detected',
            metric: {
              name: 'heap_used',
              value: memory.usedJSHeapSize,
              unit: 'bytes',
              timestamp: Date.now(),
              category: 'memory'
            },
            recommendation: 'Consider closing unused tabs or restarting the application',
            severity: 'medium'
          })
        }
      }

      // DOM node count
      this.recordMetric({
        name: 'dom_nodes',
        value: document.getElementsByTagName('*').length,
        unit: 'count',
        timestamp: Date.now(),
        category: 'ui'
      })

      // Active tabs count (if available)
      if (window.electronAPI) {
        try {
          const debugInfo = await window.electronAPI.debugBrowserView?.()
          if (debugInfo?.success) {
            this.recordMetric({
              name: 'active_tabs',
              value: debugInfo.data.totalTabs,
              unit: 'count',
              timestamp: Date.now(),
              category: 'ui'
            })

            if (debugInfo.data.totalTabs > this.thresholds.tabCount) {
              this.createAlert({
                type: 'warning',
                message: 'Too many tabs open',
                metric: {
                  name: 'active_tabs',
                  value: debugInfo.data.totalTabs,
                  unit: 'count',
                  timestamp: Date.now(),
                  category: 'ui'
                },
                recommendation: 'Close unused tabs to improve performance',
                severity: 'low'
              })
            }
          }
        } catch (error) {
          // Silently ignore if debug API not available
        }
      }

    } catch (error) {
      logger.error('Failed to collect performance metrics', error as Error)
    }
  }

  recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric)

    // Keep metrics history manageable
    if (this.metrics.length > this.maxMetricsHistory) {
      this.metrics = this.metrics.slice(-this.maxMetricsHistory)
    }

    // Emit metric event
    appEvents.emit('performance:metric', metric)
  }

  private createAlert(alertData: Omit<PerformanceAlert, 'id' | 'timestamp'>): void {
    const alert: PerformanceAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      ...alertData
    }

    this.alerts.push(alert)
    appEvents.emit('performance:alert', alert)

    logger.warn('Performance alert created', alert)
  }

  measureAIResponse(startTime: number): void {
    const duration = Date.now() - startTime
    
    this.recordMetric({
      name: 'ai_response_time',
      value: duration,
      unit: 'ms',
      timestamp: Date.now(),
      category: 'ai'
    })

    if (duration > this.thresholds.aiResponseTime) {
      this.createAlert({
        type: 'warning',
        message: 'Slow AI response detected',
        metric: {
          name: 'ai_response_time',
          value: duration,
          unit: 'ms',
          timestamp: Date.now(),
          category: 'ai'
        },
        recommendation: 'Check network connection or try simpler queries'
      })
    }
  }

  getMetrics(category?: string, timeRange?: number): PerformanceMetric[] {
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

  getRecentAlerts(count = 10): PerformanceAlert[] {
    return this.alerts
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, count)
  }

  getPerformanceSummary(): {
    avgMemoryUsage: number
    avgResponseTime: number
    totalAlerts: number
    recentIssues: string[]
    recommendations: string[]
  } {
    const memoryMetrics = this.getMetrics('memory', 3600000) // Last hour
    const aiMetrics = this.getMetrics('ai', 3600000)
    const recentAlerts = this.getRecentAlerts(5)

    const avgMemoryUsage = memoryMetrics.length > 0
      ? memoryMetrics.reduce((sum, m) => sum + m.value, 0) / memoryMetrics.length
      : 0

    const avgResponseTime = aiMetrics.length > 0
      ? aiMetrics.reduce((sum, m) => sum + m.value, 0) / aiMetrics.length
      : 0

    const recentIssues = recentAlerts.map(alert => alert.message)
    const recommendations = Array.from(new Set(recentAlerts.map(alert => alert.recommendation)))

    return {
      avgMemoryUsage: Math.round(avgMemoryUsage / (1024 * 1024)), // Convert to MB
      avgResponseTime: Math.round(avgResponseTime),
      totalAlerts: this.alerts.length,
      recentIssues,
      recommendations
    }
  }

  clearHistory(): void {
    this.metrics = []
    this.alerts = []
    logger.info('Performance history cleared')
  }

  cleanup(): void {
    this.stopMonitoring()
    this.clearHistory()
    logger.info('Performance Monitor cleaned up')
  }
}

export default PerformanceMonitor