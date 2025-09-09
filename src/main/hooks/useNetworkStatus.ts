// Network Status Hook - Production Ready
// Real-time network connectivity monitoring

import { useState, useEffect, useCallback } from 'react'

interface NetworkStatus {
  isOnline: boolean
  isSlowConnection: boolean
  connectionType: string
  lastOnline: Date | null
  lastOffline: Date | null
}

interface NetworkStatusHook extends NetworkStatus {
  checkConnection: () => Promise<boolean>
  connectionHistory: Array<{ timestamp: Date; online: boolean }>
}

export const useNetworkStatus = (): NetworkStatusHook => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isOnline: navigator.onLine,
    isSlowConnection: false,
    connectionType: 'unknown',
    lastOnline: navigator.onLine ? new Date() : null,
    lastOffline: !navigator.onLine ? new Date() : null
  })
  
  const [connectionHistory, setConnectionHistory] = useState<Array<{ timestamp: Date; online: boolean }>>([])

  // Check connection speed
  const checkConnectionSpeed = useCallback(async (): Promise<boolean> => {
    try {
      const startTime = performance.now()
      
      // Try to fetch a small resource to test speed
      await fetch('/favicon.ico', {
        method: 'GET',
        cache: 'no-cache'
      })
      
      const endTime = performance.now()
      const duration = endTime - startTime
      
      // Consider connection slow if it takes more than 2 seconds
      return duration > 2000
    } catch {
      return true // Assume slow if test fails
    }
  }, [])

  // Enhanced connection check
  const checkConnection = useCallback(async (): Promise<boolean> => {
    try {
      // Try multiple endpoints to verify connectivity
      const endpoints = [
        'https://www.google.com/favicon.ico',
        'https://httpbin.org/status/200',
        'https://api.github.com'
      ]
      
      const promises = endpoints.map(url => 
        fetch(url, { 
          method: 'HEAD', 
          mode: 'no-cors',
          cache: 'no-cache',
          signal: AbortSignal.timeout(5000)
        })
      )
      
      // At least one should succeed
      const results = await Promise.allSettled(promises)
      const hasConnection = results.some(result => result.status === 'fulfilled')
      
      return hasConnection
    } catch {
      return false
    }
  }, [])

  // Get connection type information
  const getConnectionType = useCallback((): string => {
    const connection = (navigator as any).connection || 
                     (navigator as any).mozConnection || 
                     (navigator as any).webkitConnection
    
    if (connection) {
      if (connection.effectiveType) {
        return connection.effectiveType // '4g', '3g', '2g', 'slow-2g'
      }
      if (connection.type) {
        return connection.type // 'wifi', 'cellular', etc.
      }
    }
    
    return 'unknown'
  }, [])

  // Update network status
  const updateNetworkStatus = useCallback(async (online: boolean) => {
    const now = new Date()
    const connectionType = getConnectionType()
    const isSlowConnection = online ? await checkConnectionSpeed() : false
    
    setNetworkStatus(prev => ({
      ...prev,
      isOnline: online,
      isSlowConnection,
      connectionType,
      lastOnline: online ? now : prev.lastOnline,
      lastOffline: !online ? now : prev.lastOffline
    }))
    
    // Update connection history
    setConnectionHistory(prev => {
      const newEntry = { timestamp: now, online }
      const updated = [...prev, newEntry]
      
      // Keep only last 50 entries
      return updated.slice(-50)
    })
    
    // Log network status changes
    console.log(`🌐 Network status changed: ${online ? 'online' : 'offline'}`, {
      connectionType,
      isSlowConnection,
      timestamp: now.toISOString()
    })
    
    // Notify main process if available
    try {
      if (window.electronAPI) {
        await window.electronAPI.updateNetworkStatus({
          isOnline: online,
          isSlowConnection,
          connectionType,
          timestamp: now.getTime()
        })
      }
    } catch (error) {
      console.warn('Failed to notify main process of network status:', error)
    }
  }, [getConnectionType, checkConnectionSpeed])

  // Handle online event
  const handleOnline = useCallback(() => {
    updateNetworkStatus(true)
  }, [updateNetworkStatus])

  // Handle offline event
  const handleOffline = useCallback(() => {
    updateNetworkStatus(false)
  }, [updateNetworkStatus])

  // Periodic connection verification
  useEffect(() => {
    const verifyConnection = async () => {
      if (navigator.onLine) {
        const actuallyOnline = await checkConnection()
        if (!actuallyOnline && networkStatus.isOnline) {
          // Navigator says online but we can't actually connect
          updateNetworkStatus(false)
        }
      }
    }
    
    const interval = setInterval(verifyConnection, 30000) // Check every 30 seconds
    
    return () => clearInterval(interval)
  }, [checkConnection, networkStatus.isOnline, updateNetworkStatus])

  // Set up event listeners
  useEffect(() => {
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    // Also listen for connection type changes
    const connection = (navigator as any).connection
    if (connection) {
      const handleConnectionChange = () => {
        const newConnectionType = getConnectionType()
        setNetworkStatus(prev => ({
          ...prev,
          connectionType: newConnectionType
        }))
      }
      
      connection.addEventListener('change', handleConnectionChange)
      
      return () => {
        window.removeEventListener('online', handleOnline)
        window.removeEventListener('offline', handleOffline)
        connection.removeEventListener('change', handleConnectionChange)
      }
    }
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [handleOnline, handleOffline, getConnectionType])

  // Initial connection check
  useEffect(() => {
    updateNetworkStatus(navigator.onLine)
  }, [updateNetworkStatus])

  return {
    ...networkStatus,
    checkConnection,
    connectionHistory
  }
}