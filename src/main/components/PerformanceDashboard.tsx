/**
 * Performance Dashboard Component
 * Displays real-time performance metrics and system health
 */

import React, { useState, useEffect } from 'react'
import PerformanceMonitor, { PerformanceMetric, PerformanceAlert } from '../services/PerformanceMonitor'
import './PerformanceDashboard.css'

interface PerformanceDashboardProps {
  isOpen: boolean
  onClose: () => void
}

const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({ isOpen, onClose }) => {
  const [summary, setSummary] = useState<any>(null)
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([])
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (isOpen) {
      loadPerformanceData()
      const interval = setInterval(loadPerformanceData, 10000) // Update every 10 seconds
      return () => clearInterval(interval)
    }
  }, [isOpen])

  const loadPerformanceData = async () => {
    try {
      const monitor = PerformanceMonitor.getInstance()
      const performanceSummary = monitor.getPerformanceSummary()
      const recentAlerts = monitor.getRecentAlerts(10)
      const recentMetrics = monitor.getMetrics(undefined, 3600000) // Last hour

      setSummary(performanceSummary)
      setAlerts(recentAlerts)
      setMetrics(recentMetrics)
      setIsLoading(false)
    } catch (error) {
      console.error('Failed to load performance data:', error)
      setIsLoading(false)
    }
  }

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatTime = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(1)}s`
  }

  const getHealthStatus = (): { status: 'excellent' | 'good' | 'warning' | 'critical', color: string } => {
    if (!summary) return { status: 'good', color: '#28a745' }

    const { avgMemoryUsage, avgResponseTime, totalAlerts } = summary

    if (avgMemoryUsage > 500 || avgResponseTime > 10000 || totalAlerts > 10) {
      return { status: 'critical', color: '#dc3545' }
    } else if (avgMemoryUsage > 300 || avgResponseTime > 5000 || totalAlerts > 5) {
      return { status: 'warning', color: '#ffc107' }
    } else if (avgMemoryUsage > 200 || avgResponseTime > 3000) {
      return { status: 'good', color: '#17a2b8' }
    } else {
      return { status: 'excellent', color: '#28a745' }
    }
  }

  if (!isOpen) return null

  const healthStatus = getHealthStatus()

  return (
    <div className="performance-dashboard-overlay">
      <div className="performance-dashboard">
        <div className="performance-header">
          <h3>🚀 Performance Dashboard</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {isLoading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <span>Loading performance data...</span>
          </div>
        ) : (
          <div className="performance-content">
            {/* System Health Status */}
            <div className="health-status" style={{ borderColor: healthStatus.color }}>
              <div className="health-indicator" style={{ backgroundColor: healthStatus.color }}></div>
              <div className="health-info">
                <h4>System Health: {healthStatus.status.toUpperCase()}</h4>
                <p>Overall system performance status</p>
              </div>
            </div>

            {/* Performance Metrics */}
            {summary && (
              <div className="metrics-grid">
                <div className="metric-card">
                  <div className="metric-icon">🧠</div>
                  <div className="metric-info">
                    <h5>Memory Usage</h5>
                    <span className="metric-value">{summary.avgMemoryUsage} MB</span>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-icon">⚡</div>
                  <div className="metric-info">
                    <h5>AI Response Time</h5>
                    <span className="metric-value">{formatTime(summary.avgResponseTime)}</span>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-icon">🚨</div>
                  <div className="metric-info">
                    <h5>Total Alerts</h5>
                    <span className="metric-value">{summary.totalAlerts}</span>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-icon">📊</div>
                  <div className="metric-info">
                    <h5>Active Metrics</h5>
                    <span className="metric-value">{metrics.length}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Recent Alerts */}
            <div className="alerts-section">
              <h4>🚨 Recent Alerts</h4>
              {alerts.length === 0 ? (
                <div className="no-alerts">
                  <span>✅ No recent alerts - System running smoothly!</span>
                </div>
              ) : (
                <div className="alerts-list">
                  {alerts.slice(0, 5).map((alert) => (
                    <div key={alert.id} className={`alert-item ${alert.type}`}>
                      <div className="alert-header">
                        <span className="alert-type">
                          {alert.type === 'critical' ? '🔴' : '⚠️'} {alert.type.toUpperCase()}
                        </span>
                        <span className="alert-time">
                          {new Date(alert.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="alert-message">{alert.message}</div>
                      <div className="alert-recommendation">
                        💡 {alert.recommendation}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recommendations */}
            {summary?.recommendations && summary.recommendations.length > 0 && (
              <div className="recommendations-section">
                <h4>💡 Performance Recommendations</h4>
                <div className="recommendations-list">
                  {summary.recommendations.map((rec: string, index: number) => (
                    <div key={index} className="recommendation-item">
                      <span className="recommendation-icon">→</span>
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="quick-actions">
              <h4>⚡ Quick Actions</h4>
              <div className="action-buttons">
                <button
                  className="action-btn"
                  onClick={() => {
                    if (window.gc) {
                      window.gc()
                      loadPerformanceData()
                    }
                  }}
                >
                  🧹 Force Garbage Collection
                </button>
                <button
                  className="action-btn"
                  onClick={() => {
                    PerformanceMonitor.getInstance().clearHistory()
                    loadPerformanceData()
                  }}
                >
                  🗑️ Clear Performance History
                </button>
                <button
                  className="action-btn"
                  onClick={() => window.location.reload()}
                >
                  🔄 Restart Application
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PerformanceDashboard