// Enhanced Debug Panel for Development
// Provides debugging tools, performance monitoring, and configuration management

import React, { useState, useEffect, useCallback } from 'react'
import { createLogger, EnhancedLogger, LogLevel } from '../../core/logger/EnhancedLogger'
import { config, AppConfig } from '../../core/config/ConfigManager'

const logger = createLogger('DebugPanel')

interface DebugPanelProps {
  isOpen: boolean
  onClose: () => void
}

interface SystemMemoryInfo {
  usedJSHeapSize: number
  totalJSHeapSize: number  
  jsHeapSizeLimit: number
}

interface SystemMetrics {
  memory: SystemMemoryInfo
  timing: PerformanceTiming
  navigation: PerformanceNavigation
  userAgent: string
  timestamp: number
}

const DebugPanel: React.FC<DebugPanelProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'logs' | 'config' | 'metrics' | 'api'>('logs')
  const [logs, setLogs] = useState<any[]>([])
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null)
  const [appConfig, setAppConfig] = useState<AppConfig | null>(null)
  const [logLevel, setLogLevel] = useState<LogLevel>(LogLevel.INFO)

  // Load initial data
  useEffect(() => {
    if (isOpen) {
      loadLogs()
      loadSystemMetrics()
      loadConfiguration()
    }
  }, [isOpen])

  // Auto-refresh system metrics
  useEffect(() => {
    if (!isOpen) return

    const interval = setInterval(() => {
      loadSystemMetrics()
    }, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [isOpen])

  const loadLogs = useCallback(async () => {
    try {
      const loggerInstance = EnhancedLogger.getInstance()
      const recentLogs = await loggerInstance.getLogs({
        limit: 100,
        level: logLevel
      })
      setLogs(recentLogs)
    } catch (error) {
      logger.error('Failed to load logs', error as Error)
    }
  }, [logLevel])

  const loadSystemMetrics = useCallback(() => {
    try {
      const metrics: SystemMetrics = {
        memory: (performance as any).memory || { usedJSHeapSize: 0, totalJSHeapSize: 0, jsHeapSizeLimit: 0 },
        timing: performance.timing,
        navigation: performance.navigation,
        userAgent: navigator.userAgent,
        timestamp: Date.now()
      }
      setSystemMetrics(metrics)
    } catch (error) {
      logger.error('Failed to load system metrics', error as Error)
    }
  }, [])

  const loadConfiguration = useCallback(async () => {
    try {
      const currentConfig = config.getAll()
      setAppConfig(currentConfig)
    } catch (error) {
      logger.error('Failed to load configuration', error as Error)
    }
  }, [])

  const clearLogs = useCallback(async () => {
    try {
      const loggerInstance = EnhancedLogger.getInstance()
      loggerInstance.clearLogs()
      setLogs([])
      logger.info('Logs cleared successfully')
    } catch (error) {
      logger.error('Failed to clear logs', error as Error)
    }
  }, [])

  const exportLogs = useCallback(async () => {
    try {
      const loggerInstance = EnhancedLogger.getInstance()
      const allLogs = await loggerInstance.getLogs({ limit: 5000 })
      const logData = JSON.stringify(allLogs, null, 2)
      
      // Create download link
      const blob = new Blob([logData], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `kairo-logs-${new Date().toISOString()}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      logger.info('Logs exported successfully')
    } catch (error) {
      logger.error('Failed to export logs', error as Error)
    }
  }, [])

  const testApiConnection = useCallback(async () => {
    try {
      logger.info('Testing AI connection...')
      
      if (window.electronAPI?.testConnection) {
        const result = await window.electronAPI.testConnection()
        if (result?.success) {
          logger.info('AI connection test successful', { response: result })
        } else {
          logger.error('AI connection test failed', undefined, { error: result?.error })
        }
      } else {
        logger.warn('AI connection test not available - Electron API missing')
      }
    } catch (error) {
      logger.error('AI connection test failed', error as Error)
    }
  }, [])

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatLogLevel = (level: LogLevel): string => {
    const levels = ['ERROR', 'WARN', 'INFO', 'DEBUG']
    return levels[level] || 'UNKNOWN'
  }

  const getLogLevelColor = (level: LogLevel): string => {
    const colors = {
      [LogLevel.ERROR]: '#dc3545',
      [LogLevel.WARN]: '#ffc107',
      [LogLevel.INFO]: '#28a745',
      [LogLevel.DEBUG]: '#6c757d'
    }
    return colors[level] || '#6c757d'
  }

  if (!isOpen) return null

  return (
    <div className="debug-panel">
      <div className="debug-panel-header">
        <h3>🔧 Debug Panel</h3>
        <button onClick={onClose} className="debug-close-btn">×</button>
      </div>

      <div className="debug-panel-tabs">
        <button 
          className={`debug-tab ${activeTab === 'logs' ? 'active' : ''}`}
          onClick={() => setActiveTab('logs')}
        >
          📋 Logs
        </button>
        <button 
          className={`debug-tab ${activeTab === 'config' ? 'active' : ''}`}
          onClick={() => setActiveTab('config')}
        >
          ⚙️ Config
        </button>
        <button 
          className={`debug-tab ${activeTab === 'metrics' ? 'active' : ''}`}
          onClick={() => setActiveTab('metrics')}
        >
          📊 Metrics
        </button>
        <button 
          className={`debug-tab ${activeTab === 'api' ? 'active' : ''}`}
          onClick={() => setActiveTab('api')}
        >
          🔌 API
        </button>
      </div>

      <div className="debug-panel-content">
        {activeTab === 'logs' && (
          <div className="debug-logs">
            <div className="debug-logs-header">
              <div className="debug-logs-controls">
                <select 
                  value={logLevel} 
                  onChange={(e) => setLogLevel(Number(e.target.value) as LogLevel)}
                >
                  <option value={LogLevel.ERROR}>Error</option>
                  <option value={LogLevel.WARN}>Warning</option>
                  <option value={LogLevel.INFO}>Info</option>
                  <option value={LogLevel.DEBUG}>Debug</option>
                </select>
                <button onClick={loadLogs}>🔄 Refresh</button>
                <button onClick={clearLogs}>🗑️ Clear</button>
                <button onClick={exportLogs}>💾 Export</button>
              </div>
              <div className="debug-logs-count">
                {logs.length} logs
              </div>
            </div>
            
            <div className="debug-logs-list">
              {logs.map((log, index) => (
                <div key={index} className="debug-log-entry" style={{ borderLeft: `3px solid ${getLogLevelColor(log.level)}` }}>
                  <div className="debug-log-header">
                    <span className="debug-log-level" style={{ color: getLogLevelColor(log.level) }}>
                      {formatLogLevel(log.level)}
                    </span>
                    <span className="debug-log-category">{log.category}</span>
                    <span className="debug-log-time">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="debug-log-message">{log.message}</div>
                  {log.context && (
                    <details className="debug-log-context">
                      <summary>Context</summary>
                      <pre>{JSON.stringify(log.context, null, 2)}</pre>
                    </details>
                  )}
                  {log.stack && (
                    <details className="debug-log-stack">
                      <summary>Stack Trace</summary>
                      <pre>{log.stack}</pre>
                    </details>
                  )}
                </div>
              ))}
              
              {logs.length === 0 && (
                <div className="debug-empty-state">
                  No logs found for the selected level
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'config' && (
          <div className="debug-config">
            <div className="debug-config-header">
              <button onClick={loadConfiguration}>🔄 Refresh</button>
            </div>
            
            {appConfig && (
              <div className="debug-config-content">
                <pre>{JSON.stringify(appConfig, null, 2)}</pre>
              </div>
            )}
          </div>
        )}

        {activeTab === 'metrics' && (
          <div className="debug-metrics">
            <div className="debug-metrics-header">
              <button onClick={loadSystemMetrics}>🔄 Refresh</button>
              <span>Auto-refresh: 5s</span>
            </div>
            
            {systemMetrics && (
              <div className="debug-metrics-content">
                <div className="metric-group">
                  <h4>Memory Usage</h4>
                  <div className="metric-item">
                    <span>Used JS Heap:</span>
                    <span>{formatBytes(systemMetrics.memory.usedJSHeapSize)}</span>
                  </div>
                  <div className="metric-item">
                    <span>Total JS Heap:</span>
                    <span>{formatBytes(systemMetrics.memory.totalJSHeapSize)}</span>
                  </div>
                  <div className="metric-item">
                    <span>JS Heap Limit:</span>
                    <span>{formatBytes(systemMetrics.memory.jsHeapSizeLimit)}</span>
                  </div>
                </div>

                <div className="metric-group">
                  <h4>Performance</h4>
                  <div className="metric-item">
                    <span>Page Load Time:</span>
                    <span>{systemMetrics.timing.loadEventEnd - systemMetrics.timing.navigationStart}ms</span>
                  </div>
                  <div className="metric-item">
                    <span>DOM Ready:</span>
                    <span>{systemMetrics.timing.domContentLoadedEventEnd - systemMetrics.timing.navigationStart}ms</span>
                  </div>
                </div>

                <div className="metric-group">
                  <h4>Browser Info</h4>
                  <div className="metric-item">
                    <span>User Agent:</span>
                    <span className="metric-value-small">{systemMetrics.userAgent}</span>
                  </div>
                  <div className="metric-item">
                    <span>Last Updated:</span>
                    <span>{new Date(systemMetrics.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'api' && (
          <div className="debug-api">
            <div className="debug-api-header">
              <h4>API Testing</h4>
            </div>
            
            <div className="debug-api-content">
              <div className="api-test-group">
                <h5>AI Connection</h5>
                <button onClick={testApiConnection} className="api-test-btn">
                  🧪 Test AI Connection
                </button>
                <p>Tests the connection to GROQ AI service</p>
              </div>

              <div className="api-test-group">
                <h5>Database</h5>
                <button onClick={() => logger.info('Database test not implemented yet')} className="api-test-btn">
                  🧪 Test Database
                </button>
                <p>Tests database connectivity and operations</p>
              </div>

              <div className="api-test-group">
                <h5>Agent System</h5>
                <button onClick={() => logger.info('Agent system test not implemented yet')} className="api-test-btn">
                  🧪 Test Agents
                </button>
                <p>Tests the 6-agent coordination system</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .debug-panel {
          position: fixed;
          top: 50px;
          right: 20px;
          width: 600px;
          height: 70vh;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(225, 229, 233, 0.3);
          border-radius: 12px;
          z-index: 10000;
          display: flex;
          flex-direction: column;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
        }

        .debug-panel-header {
          height: 48px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 16px;
          border-radius: 12px 12px 0 0;
        }

        .debug-panel-header h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
        }

        .debug-close-btn {
          background: none;
          border: none;
          color: white;
          font-size: 20px;
          cursor: pointer;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .debug-close-btn:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .debug-panel-tabs {
          display: flex;
          background: #f8f9fa;
          border-bottom: 1px solid #e1e5e9;
        }

        .debug-tab {
          flex: 1;
          padding: 8px 12px;
          background: none;
          border: none;
          border-right: 1px solid #e1e5e9;
          cursor: pointer;
          font-size: 12px;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .debug-tab:last-child {
          border-right: none;
        }

        .debug-tab:hover {
          background: #e9ecef;
        }

        .debug-tab.active {
          background: white;
          color: #667eea;
          font-weight: 600;
        }

        .debug-panel-content {
          flex: 1;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .debug-logs {
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .debug-logs-header {
          padding: 12px;
          background: #f8f9fa;
          border-bottom: 1px solid #e1e5e9;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .debug-logs-controls {
          display: flex;
          gap: 8px;
        }

        .debug-logs-controls select,
        .debug-logs-controls button {
          padding: 4px 8px;
          border: 1px solid #dee2e6;
          border-radius: 4px;
          font-size: 12px;
          background: white;
          cursor: pointer;
        }

        .debug-logs-controls button:hover {
          background: #e9ecef;
        }

        .debug-logs-count {
          font-size: 12px;
          color: #6c757d;
        }

        .debug-logs-list {
          flex: 1;
          overflow-y: auto;
          padding: 12px;
        }

        .debug-log-entry {
          margin-bottom: 12px;
          padding: 8px 12px;
          background: white;
          border-radius: 6px;
          border: 1px solid #f1f3f4;
        }

        .debug-log-header {
          display: flex;
          gap: 12px;
          font-size: 11px;
          margin-bottom: 4px;
        }

        .debug-log-level {
          font-weight: 600;
          text-transform: uppercase;
        }

        .debug-log-category {
          color: #6c757d;
          background: #f8f9fa;
          padding: 1px 4px;
          border-radius: 3px;
        }

        .debug-log-time {
          color: #6c757d;
          margin-left: auto;
        }

        .debug-log-message {
          font-size: 13px;
          line-height: 1.4;
          color: #212529;
        }

        .debug-log-context,
        .debug-log-stack {
          margin-top: 8px;
        }

        .debug-log-context summary,
        .debug-log-stack summary {
          font-size: 11px;
          color: #6c757d;
          cursor: pointer;
          padding: 2px 0;
        }

        .debug-log-context pre,
        .debug-log-stack pre {
          font-size: 10px;
          background: #f8f9fa;
          padding: 8px;
          border-radius: 4px;
          overflow-x: auto;
          margin-top: 4px;
        }

        .debug-empty-state {
          text-align: center;
          color: #6c757d;
          font-style: italic;
          padding: 40px 20px;
        }

        .debug-config {
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .debug-config-header {
          padding: 12px;
          background: #f8f9fa;
          border-bottom: 1px solid #e1e5e9;
        }

        .debug-config-header button {
          padding: 4px 8px;
          border: 1px solid #dee2e6;
          border-radius: 4px;
          font-size: 12px;
          background: white;
          cursor: pointer;
        }

        .debug-config-content {
          flex: 1;
          overflow: auto;
          padding: 12px;
        }

        .debug-config-content pre {
          font-size: 11px;
          line-height: 1.4;
          color: #212529;
        }

        .debug-metrics {
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .debug-metrics-header {
          padding: 12px;
          background: #f8f9fa;
          border-bottom: 1px solid #e1e5e9;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .debug-metrics-header button {
          padding: 4px 8px;
          border: 1px solid #dee2e6;
          border-radius: 4px;
          font-size: 12px;
          background: white;
          cursor: pointer;
        }

        .debug-metrics-header span {
          font-size: 11px;
          color: #6c757d;
        }

        .debug-metrics-content {
          flex: 1;
          overflow: auto;
          padding: 12px;
        }

        .metric-group {
          margin-bottom: 20px;
          padding: 12px;
          background: white;
          border: 1px solid #f1f3f4;
          border-radius: 6px;
        }

        .metric-group h4 {
          margin: 0 0 12px 0;
          font-size: 14px;
          color: #495057;
        }

        .metric-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 4px 0;
          font-size: 12px;
        }

        .metric-item span:first-child {
          color: #6c757d;
          font-weight: 500;
        }

        .metric-value-small {
          font-size: 10px !important;
          color: #495057 !important;
          max-width: 300px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .debug-api {
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .debug-api-header {
          padding: 12px;
          background: #f8f9fa;
          border-bottom: 1px solid #e1e5e9;
        }

        .debug-api-header h4 {
          margin: 0;
          font-size: 14px;
          color: #495057;
        }

        .debug-api-content {
          flex: 1;
          overflow: auto;
          padding: 12px;
        }

        .api-test-group {
          margin-bottom: 20px;
          padding: 12px;
          background: white;
          border: 1px solid #f1f3f4;
          border-radius: 6px;
        }

        .api-test-group h5 {
          margin: 0 0 8px 0;
          font-size: 13px;
          color: #495057;
        }

        .api-test-btn {
          padding: 6px 12px;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 11px;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .api-test-btn:hover {
          background: #5a6fd8;
        }

        .api-test-group p {
          margin: 8px 0 0 0;
          font-size: 11px;
          color: #6c757d;
          line-height: 1.4;
        }
      `}</style>
    </div>
  )
}

export default DebugPanel