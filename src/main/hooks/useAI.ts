// src/main/hooks/useAI.ts
import { useState, useEffect, useCallback } from 'react'
import UnifiedAIService from '../../core/services/UnifiedAIService'
import { AIMessage, AIResponse } from '../../core/types'

export interface AIContext {
  model: string
  temperature: number
  maxTokens: number
  isInitialized: boolean
  agentCount: number
}

export interface UseAIState {
  messages: AIMessage[]
  isLoading: boolean
  error: string | null
  context: AIContext | null
  isInitialized: boolean
}

export interface UseAIActions {
  sendMessage: (message: string) => Promise<AIResponse>
  summarizePage: () => Promise<AIResponse>
  analyzeContent: () => Promise<AIResponse>
  clearMessages: () => void
  testConnection: () => Promise<boolean>
  refreshContext: () => Promise<void>
}

export const useAI = (): UseAIState & UseAIActions => {
  const [aiService] = useState(() => UnifiedAIService.getInstance())
  const [state, setState] = useState<UseAIState>({
    messages: [],
    isLoading: false,
    error: null,
    context: null,
    isInitialized: false
  })

  // Initialize AI service
  useEffect(() => {
    const initializeAI = async () => {
      try {
        await aiService.initialize()
        const contextResponse = await aiService.getContext()
        setState(prev => ({
          ...prev,
          isInitialized: true,
          context: contextResponse
        }))
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Failed to initialize AI service',
          isInitialized: false
        }))
      }
    }

    initializeAI()
  }, [aiService])

  // Load messages from service
  useEffect(() => {
    if (state.isInitialized) {
      const messages = aiService.getMessages()
      setState(prev => ({ ...prev, messages }))
    }
  }, [state.isInitialized, aiService])

  const sendMessage = useCallback(async (message: string): Promise<AIResponse> => {
    if (!state.isInitialized) {
      return { success: false, error: 'AI service not initialized' }
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const response = await aiService.sendMessage(message)
      
      // Update messages from service
      const messages = aiService.getMessages()
      setState(prev => ({
        ...prev,
        messages,
        isLoading: false
      }))

      return response
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message'
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false
      }))
      return { success: false, error: errorMessage }
    }
  }, [aiService, state.isInitialized])

  const summarizePage = useCallback(async (): Promise<AIResponse> => {
    if (!state.isInitialized) {
      return { success: false, error: 'AI service not initialized' }
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const response = await aiService.summarizePage()
      setState(prev => ({ ...prev, isLoading: false }))
      return response
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to summarize page'
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false
      }))
      return { success: false, error: errorMessage }
    }
  }, [aiService, state.isInitialized])

  const analyzeContent = useCallback(async (): Promise<AIResponse> => {
    if (!state.isInitialized) {
      return { success: false, error: 'AI service not initialized' }
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const response = await aiService.analyzeContent()
      setState(prev => ({ ...prev, isLoading: false }))
      return response
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to analyze content'
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false
      }))
      return { success: false, error: errorMessage }
    }
  }, [aiService, state.isInitialized])

  const clearMessages = useCallback(() => {
    aiService.clearMessages()
    setState(prev => ({ ...prev, messages: [] }))
  }, [aiService])

  const testConnection = useCallback(async (): Promise<boolean> => {
    try {
      return await aiService.checkConnection()
    } catch (error) {
      console.error('Connection test failed:', error)
      return false
    }
  }, [aiService])

  const refreshContext = useCallback(async (): Promise<void> => {
    try {
      const context = await aiService.getContext()
      setState(prev => ({ ...prev, context }))
    } catch (error) {
      console.error('Failed to refresh context:', error)
    }
  }, [aiService])

  return {
    ...state,
    sendMessage,
    summarizePage,
    analyzeContent,
    clearMessages,
    testConnection,
    refreshContext
  }
}

export default useAI
