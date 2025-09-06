// src/main/hooks/useExtensions.ts
import { useState, useEffect, useCallback } from 'react'

export interface Extension {
  id: string
  name: string
  version: string
  description: string
  isEnabled: boolean
  permissions: string[]
  manifest: any
  installDate: number
  lastUpdated: number
}

export interface ExtensionState {
  extensions: Extension[]
  isLoading: boolean
  error: string | null
  isInitialized: boolean
}

export interface ExtensionActions {
  installExtension: (manifest: any) => Promise<boolean>
  uninstallExtension: (extensionId: string) => Promise<boolean>
  enableExtension: (extensionId: string) => Promise<boolean>
  disableExtension: (extensionId: string) => Promise<boolean>
  updateExtension: (extensionId: string) => Promise<boolean>
  getExtensionPermissions: (extensionId: string) => string[]
  clearError: () => void
}

export const useExtensions = (): ExtensionState & ExtensionActions => {
  const [state, setState] = useState<ExtensionState>({
    extensions: [],
    isLoading: false,
    error: null,
    isInitialized: false
  })

  // Initialize extensions system
  useEffect(() => {
    const initializeExtensions = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true }))
        
        // Load installed extensions
        const result = await window.electronAPI.getInstalledExtensions()
        
        if (result.success) {
          setState(prev => ({
            ...prev,
            extensions: result.extensions || [],
            isInitialized: true,
            isLoading: false
          }))
        } else {
          setState(prev => ({
            ...prev,
            error: result.error || 'Failed to load extensions',
            isLoading: false
          }))
        }
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Failed to initialize extensions',
          isLoading: false
        }))
      }
    }

    initializeExtensions()
  }, [])

  const installExtension = useCallback(async (manifest: any): Promise<boolean> => {
    if (!state.isInitialized) {
      setState(prev => ({ ...prev, error: 'Extensions system not initialized' }))
      return false
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))
      
      const result = await window.electronAPI.installExtension(manifest)
      
      if (result.success) {
        // Reload extensions
        const extensionsResult = await window.electronAPI.getInstalledExtensions()
        if (extensionsResult.success) {
          setState(prev => ({
            ...prev,
            extensions: extensionsResult.extensions || prev.extensions,
            isLoading: false
          }))
        }
        return true
      } else {
        setState(prev => ({
          ...prev,
          error: result.error || 'Failed to install extension',
          isLoading: false
        }))
        return false
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Installation failed'
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false
      }))
      return false
    }
  }, [state.isInitialized])

  const uninstallExtension = useCallback(async (extensionId: string): Promise<boolean> => {
    if (!state.isInitialized) {
      setState(prev => ({ ...prev, error: 'Extensions system not initialized' }))
      return false
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))
      
      const result = await window.electronAPI.uninstallExtension(extensionId)
      
      if (result.success) {
        // Remove from local state
        setState(prev => ({
          ...prev,
          extensions: prev.extensions.filter(ext => ext.id !== extensionId),
          isLoading: false
        }))
        return true
      } else {
        setState(prev => ({
          ...prev,
          error: result.error || 'Failed to uninstall extension',
          isLoading: false
        }))
        return false
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Uninstallation failed'
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false
      }))
      return false
    }
  }, [state.isInitialized])

  const enableExtension = useCallback(async (extensionId: string): Promise<boolean> => {
    if (!state.isInitialized) {
      setState(prev => ({ ...prev, error: 'Extensions system not initialized' }))
      return false
    }

    try {
      const result = await window.electronAPI.enableExtension(extensionId)
      
      if (result.success) {
        setState(prev => ({
          ...prev,
          extensions: prev.extensions.map(ext => 
            ext.id === extensionId ? { ...ext, isEnabled: true } : ext
          )
        }))
        return true
      } else {
        setState(prev => ({
          ...prev,
          error: result.error || 'Failed to enable extension'
        }))
        return false
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to enable extension'
      setState(prev => ({ ...prev, error: errorMessage }))
      return false
    }
  }, [state.isInitialized])

  const disableExtension = useCallback(async (extensionId: string): Promise<boolean> => {
    if (!state.isInitialized) {
      setState(prev => ({ ...prev, error: 'Extensions system not initialized' }))
      return false
    }

    try {
      const result = await window.electronAPI.disableExtension(extensionId)
      
      if (result.success) {
        setState(prev => ({
          ...prev,
          extensions: prev.extensions.map(ext => 
            ext.id === extensionId ? { ...ext, isEnabled: false } : ext
          )
        }))
        return true
      } else {
        setState(prev => ({
          ...prev,
          error: result.error || 'Failed to disable extension'
        }))
        return false
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to disable extension'
      setState(prev => ({ ...prev, error: errorMessage }))
      return false
    }
  }, [state.isInitialized])

  const updateExtension = useCallback(async (extensionId: string): Promise<boolean> => {
    if (!state.isInitialized) {
      setState(prev => ({ ...prev, error: 'Extensions system not initialized' }))
      return false
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))
      
      const result = await window.electronAPI.updateExtension(extensionId)
      
      if (result.success) {
        // Reload extensions to get updated info
        const extensionsResult = await window.electronAPI.getInstalledExtensions()
        if (extensionsResult.success) {
          setState(prev => ({
            ...prev,
            extensions: extensionsResult.extensions || prev.extensions,
            isLoading: false
          }))
        }
        return true
      } else {
        setState(prev => ({
          ...prev,
          error: result.error || 'Failed to update extension',
          isLoading: false
        }))
        return false
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Update failed'
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false
      }))
      return false
    }
  }, [state.isInitialized])

  const getExtensionPermissions = useCallback((extensionId: string): string[] => {
    const extension = state.extensions.find(ext => ext.id === extensionId)
    return extension ? extension.permissions : []
  }, [state.extensions])

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  return {
    ...state,
    installExtension,
    uninstallExtension,
    enableExtension,
    disableExtension,
    updateExtension,
    getExtensionPermissions,
    clearError
  }
}

export default useExtensions
