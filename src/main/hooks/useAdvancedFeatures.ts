// src/main/hooks/useAdvancedFeatures.ts
import { useState, useEffect, useCallback } from 'react'
import ActionExecutor, { Action, ExecutionContext } from '../services/ActionExecutor'
import IntelligentAgentAssignmentFramework, { AgentContext } from '../services/IntelligentAgentAssignmentFramework'

export interface AdvancedFeature {
  id: string
  name: string
  description: string
  isEnabled: boolean
  category: 'shopping' | 'research' | 'automation' | 'analysis'
  capabilities: string[]
}

export interface AdvancedFeatureState {
  features: AdvancedFeature[]
  isLoading: boolean
  error: string | null
  isInitialized: boolean
  actionExecutor: ActionExecutor | null
  agentFramework: IntelligentAgentAssignmentFramework | null
}

export interface AdvancedFeatureActions {
  enableFeature: (featureId: string) => Promise<boolean>
  disableFeature: (featureId: string) => Promise<boolean>
  executeAdvancedAction: (action: Action, context: ExecutionContext) => Promise<any>
  assignAgent: (task: string, context: AgentContext) => Promise<any>
  getFeatureCapabilities: (featureId: string) => string[]
  clearError: () => void
}

export const useAdvancedFeatures = (): AdvancedFeatureState & AdvancedFeatureActions => {
  const [state, setState] = useState<AdvancedFeatureState>({
    features: [],
    isLoading: false,
    error: null,
    isInitialized: false,
    actionExecutor: null,
    agentFramework: null
  })

  // Initialize advanced features
  useEffect(() => {
    const initializeAdvancedFeatures = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true }))
        
        // Initialize services
        const actionExecutor = ActionExecutor.getInstance()
        const agentFramework = IntelligentAgentAssignmentFramework.getInstance()
        
        await actionExecutor.initialize()
        await agentFramework.initialize()
        
        // Define available features
        const features: AdvancedFeature[] = [
          {
            id: 'shopping_assistant',
            name: 'Shopping Assistant',
            description: 'AI-powered shopping research and price comparison',
            isEnabled: true,
            category: 'shopping',
            capabilities: ['price_comparison', 'review_analysis', 'product_research', 'cart_management']
          },
          {
            id: 'content_analyzer',
            name: 'Content Analyzer',
            description: 'Advanced content analysis and summarization',
            isEnabled: true,
            category: 'analysis',
            capabilities: ['summarization', 'sentiment_analysis', 'keyword_extraction', 'fact_verification']
          },
          {
            id: 'research_assistant',
            name: 'Research Assistant',
            description: 'Comprehensive research and information gathering',
            isEnabled: true,
            category: 'research',
            capabilities: ['source_citation', 'research_notes', 'topic_mapping', 'data_export']
          },
          {
            id: 'task_automation',
            name: 'Task Automation',
            description: 'Automate complex multi-step browsing tasks',
            isEnabled: true,
            category: 'automation',
            capabilities: ['workflow_automation', 'action_coordination', 'task_scheduling', 'progress_tracking']
          },
          {
            id: 'smart_search',
            name: 'Smart Search',
            description: 'Context-aware search with intelligent suggestions',
            isEnabled: true,
            category: 'research',
            capabilities: ['semantic_search', 'search_suggestions', 'search_history', 'personalized_results']
          },
          {
            id: 'document_processor',
            name: 'Document Processor',
            description: 'Process and analyze documents and PDFs',
            isEnabled: true,
            category: 'analysis',
            capabilities: ['pdf_processing', 'text_extraction', 'document_analysis', 'format_conversion']
          },
          {
            id: 'image_analyzer',
            name: 'Image Analyzer',
            description: 'Analyze images and extract visual information',
            isEnabled: true,
            category: 'analysis',
            capabilities: ['image_analysis', 'text_extraction', 'image_description', 'visual_search']
          },
          {
            id: 'translation_service',
            name: 'Translation Service',
            description: 'Translate content between multiple languages',
            isEnabled: true,
            category: 'research',
            capabilities: ['text_translation', 'language_detection', 'content_localization', 'real_time_translation']
          }
        ]
        
        setState(prev => ({
          ...prev,
          features,
          actionExecutor,
          agentFramework,
          isInitialized: true,
          isLoading: false
        }))
        
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Failed to initialize advanced features',
          isLoading: false
        }))
      }
    }

    initializeAdvancedFeatures()
  }, [])

  const enableFeature = useCallback(async (featureId: string): Promise<boolean> => {
    if (!state.isInitialized) {
      setState(prev => ({ ...prev, error: 'Advanced features not initialized' }))
      return false
    }

    try {
      setState(prev => ({
        ...prev,
        features: prev.features.map(feature => 
          feature.id === featureId ? { ...feature, isEnabled: true } : feature
        )
      }))
      return true
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to enable feature'
      setState(prev => ({ ...prev, error: errorMessage }))
      return false
    }
  }, [state.isInitialized])

  const disableFeature = useCallback(async (featureId: string): Promise<boolean> => {
    if (!state.isInitialized) {
      setState(prev => ({ ...prev, error: 'Advanced features not initialized' }))
      return false
    }

    try {
      setState(prev => ({
        ...prev,
        features: prev.features.map(feature => 
          feature.id === featureId ? { ...feature, isEnabled: false } : feature
        )
      }))
      return true
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to disable feature'
      setState(prev => ({ ...prev, error: errorMessage }))
      return false
    }
  }, [state.isInitialized])

  const executeAdvancedAction = useCallback(async (action: Action, context: ExecutionContext): Promise<any> => {
    if (!state.actionExecutor) {
      setState(prev => ({ ...prev, error: 'Action executor not initialized' }))
      return null
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))
      
      const result = await state.actionExecutor.executeAction(action, context)
      
      setState(prev => ({ ...prev, isLoading: false }))
      return result
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Action execution failed'
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false
      }))
      return null
    }
  }, [state.actionExecutor])

  const assignAgent = useCallback(async (task: string, context: AgentContext): Promise<any> => {
    if (!state.agentFramework) {
      setState(prev => ({ ...prev, error: 'Agent framework not initialized' }))
      return null
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))
      
      const assignment = await state.agentFramework.assignAgent(task, context)
      
      if (assignment) {
        const result = await state.agentFramework.executeAssignment(assignment.timestamp.toString())
        setState(prev => ({ ...prev, isLoading: false }))
        return result
      } else {
        setState(prev => ({
          ...prev,
          error: 'No suitable agent found for task',
          isLoading: false
        }))
        return null
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Agent assignment failed'
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false
      }))
      return null
    }
  }, [state.agentFramework])

  const getFeatureCapabilities = useCallback((featureId: string): string[] => {
    const feature = state.features.find(f => f.id === featureId)
    return feature ? feature.capabilities : []
  }, [state.features])

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  return {
    ...state,
    enableFeature,
    disableFeature,
    executeAdvancedAction,
    assignAgent,
    getFeatureCapabilities,
    clearError
  }
}

export default useAdvancedFeatures
