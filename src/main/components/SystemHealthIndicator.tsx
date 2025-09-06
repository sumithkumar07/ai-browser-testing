/**
 * System Health Indicator Component
 * Shows real-time system health status in the UI
 */

import React, { useState, useEffect } from 'react'
import PerformanceMonitor from '../services/PerformanceMonitor'
import ErrorRecoveryService from '../services/ErrorRecoveryService'

interface SystemHealthIndicatorProps {
  position?: 'top-right' | 'bottom-right' | 'bottom-left'
  showDetails?: boolean
}

const SystemHealthIndicator: React.FC<SystemHealthIndicatorProps> = ({
  position = 'bottom-right',
  showDetails = false
}) => {
  const [healthStatus, setHealthStatus] = useState<'excellent' | 'good' | 'warning' | 'critical'>('good')
  const [isExpanded, setIsExpanded] = useState(false)
  const [performanceData, setPerformanceData] = useState<any>(null)
  const [errorStats, setErrorStats] = useState<any>(null)

  useEffect(() => {
    updateHealthStatus()
    const interval = setInterval(updateHealthStatus, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const updateHealthStatus = async () => {
    try {
      const performanceMonitor = PerformanceMonitor.getInstance()
      const errorRecovery = ErrorRecoveryService.getInstance()
      
      const performance = performanceMonitor.getPerformanceSummary()
      const errors = errorRecovery.getErrorStatistics()
      
      setPerformanceData(performance)
      setErrorStats(errors)
      
      // Determine overall health status
      let status: 'excellent' | 'good' | 'warning' | 'critical' = 'excellent'
      
      if (performance.avgMemoryUsage > 500 || performance.avgResponseTime > 10000 || errors.recentErrors > 10) {
        status = 'critical'
      } else if (performance.avgMemoryUsage > 300 || performance.avgResponseTime > 5000 || errors.recentErrors > 5) {
        status = 'warning'
      } else if (performance.avgMemoryUsage > 200 || performance.avgResponseTime > 3000 || errors.recentErrors > 2) {
        status = 'good'
      }
      
      setHealthStatus(status)
    } catch (error) {
      console.error('Failed to update health status:', error)
      setHealthStatus('warning')
    }
  }

  const getStatusColor = () => {
    switch (healthStatus) {
      case 'excellent': return '#28a745'
      case 'good': return '#17a2b8'
      case 'warning': return '#ffc107'
      case 'critical': return '#dc3545'
      default: return '#6c757d'
    }
  }

  const getStatusIcon = () => {
    switch (healthStatus) {
      case 'excellent': return '✅'
      case 'good': return '🔵'
      case 'warning': return '⚠️'
      case 'critical': return '🔴'
      default: return '⚪'
    }
  }

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 MB'
    return `${bytes} MB`
  }

  const formatTime = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(1)}s`
  }

  return (
    <div 
      className={`system-health-indicator ${position}`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="health-status-dot" style={{ backgroundColor: getStatusColor() }}>
        <span className="status-icon">{getStatusIcon()}</span>
      </div>
      
      {(isExpanded || showDetails) && performanceData && (
        <div className="health-details">
          <div className="health-header">
            <h4>System Health</h4>
            <span className="status-text" style={{ color: getStatusColor() }}>
              {healthStatus.toUpperCase()}
            </span>
          </div>
          
          <div className="health-metrics">
            <div className="metric-row">
              <span className="metric-label">🧠 Memory:</span>
              <span className="metric-value">{formatBytes(performanceData.avgMemoryUsage)}</span>
            </div>
            
            <div className="metric-row">
              <span className="metric-label">⚡ Response:</span>
              <span className="metric-value">{formatTime(performanceData.avgResponseTime)}</span>
            </div>
            
            {errorStats && (
              <div className="metric-row">
                <span className="metric-label">🚨 Errors:</span>
                <span className="metric-value">{errorStats.recentErrors}</span>
              </div>
            )}
            
            <div className="metric-row">
              <span className="metric-label">📊 Alerts:</span>
              <span className="metric-value">{performanceData.totalAlerts}</span>
            </div>
          </div>
          
          {performanceData.recommendations && performanceData.recommendations.length > 0 && (
            <div className="health-recommendations">
              <div className="recommendations-header">💡 Recommendations:</div>
              {performanceData.recommendations.slice(0, 2).map((rec: string, index: number) => (
                <div key={index} className="recommendation-item">
                  • {rec}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      <style>{`
        .system-health-indicator {
          position: fixed;
          z-index: 1000;
          user-select: none;
        }
        
        .system-health-indicator.top-right {
          top: 20px;
          right: 20px;
        }
        
        .system-health-indicator.bottom-right {
          bottom: 20px;
          right: 20px;
        }
        
        .system-health-indicator.bottom-left {
          bottom: 20px;
          left: 20px;
        }
        
        .health-status-dot {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          animation: pulse 2s infinite;
          position: relative;
        }
        
        .status-icon {
          font-size: 10px;
        }
        
        .health-details {
          position: absolute;
          bottom: 25px;
          right: 0;
          background: white;
          border: 1px solid #e1e5e9;
          border-radius: 8px;
          padding: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          min-width: 220px;
          font-size: 12px;
        }
        
        .health-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          padding-bottom: 8px;
          border-bottom: 1px solid #e9ecef;
        }
        
        .health-header h4 {
          margin: 0;
          font-size: 14px;
          color: #212529;
        }
        
        .status-text {
          font-size: 10px;
          font-weight: bold;
        }
        
        .health-metrics {
          margin-bottom: 8px;
        }
        
        .metric-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 4px;
        }
        
        .metric-label {
          color: #6c757d;
        }
        
        .metric-value {
          font-weight: 500;
          color: #212529;
        }
        
        .health-recommendations {
          border-top: 1px solid #e9ecef;
          padding-top: 8px;
        }
        
        .recommendations-header {
          font-weight: 500;
          color: #495057;
          margin-bottom: 4px;
        }
        
        .recommendation-item {
          color: #6c757d;
          font-size: 11px;
          margin-bottom: 2px;
        }
        
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.7; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}

export default SystemHealthIndicator