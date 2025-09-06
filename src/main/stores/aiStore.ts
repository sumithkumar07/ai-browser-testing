// src/main/stores/aiStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface AIMessage {
  id: string
  content: string
  timestamp: number
  isUser: boolean
  isLoading?: boolean
  context?: string
  url?: string
}

export interface AIAgent {
  id: string
  name: string
  description: string
  capabilities: string[]
  isActive: boolean
  lastUsed: number
}

export interface AIState {
  messages: AIMessage[]
  isConnected: boolean
  isLoading: boolean
  error: string | null
  currentContext: string
  activeAgent: AIAgent | null
  availableAgents: AIAgent[]
  conversationHistory: AIMessage[]
  isTyping: boolean
}

export interface AIActions {
  addMessage: (message: Omit<AIMessage, 'id' | 'timestamp'>) => void
  updateMessage: (id: string, updates: Partial<AIMessage>) => void
  clearMessages: () => void
  setConnected: (connected: boolean) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setContext: (context: string) => void
  setActiveAgent: (agent: AIAgent | null) => void
  addAgent: (agent: AIAgent) => void
  updateAgent: (id: string, updates: Partial<AIAgent>) => void
  removeAgent: (id: string) => void
  setTyping: (typing: boolean) => void
  saveConversation: () => void
  loadConversation: (conversationId: string) => void
}

export const useAIStore = create<AIState & AIActions>()(
  persist(
    (set, get) => ({
      // State
      messages: [],
      isConnected: false,
      isLoading: false,
      error: null,
      currentContext: '',
      activeAgent: null,
      availableAgents: [
        {
          id: 'youtube_agent',
          name: 'YouTube Entertainment Agent',
          description: 'Handles video search, playlist creation, and recommendations',
          capabilities: ['video_search', 'playlist_creation', 'recommendations'],
          isActive: true,
          lastUsed: Date.now()
        },
        {
          id: 'shopping_agent',
          name: 'Shopping Agent',
          description: 'Product research, price comparison, and cart management',
          capabilities: ['product_research', 'price_comparison', 'cart_management'],
          isActive: true,
          lastUsed: Date.now()
        },
        {
          id: 'research_agent',
          name: 'Research Agent',
          description: 'Information gathering, summarization, and fact-checking',
          capabilities: ['information_gathering', 'summarization', 'fact_checking'],
          isActive: true,
          lastUsed: Date.now()
        },
        {
          id: 'navigation_agent',
          name: 'Navigation Agent',
          description: 'Smart URL handling and bookmark management',
          capabilities: ['url_handling', 'bookmark_management', 'navigation'],
          isActive: true,
          lastUsed: Date.now()
        },
        {
          id: 'content_analysis_agent',
          name: 'Content Analysis Agent',
          description: 'Text extraction, summarization, and key points',
          capabilities: ['text_extraction', 'summarization', 'key_points'],
          isActive: true,
          lastUsed: Date.now()
        },
        {
          id: 'communication_agent',
          name: 'Communication Agent',
          description: 'Email composition and social media interaction',
          capabilities: ['email_composition', 'social_media', 'communication'],
          isActive: true,
          lastUsed: Date.now()
        }
      ],
      conversationHistory: [],
      isTyping: false,

      // Actions
      addMessage: (messageData) => {
        const message: AIMessage = {
          ...messageData,
          id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now()
        }

        set((state) => ({
          messages: [...state.messages, message],
          conversationHistory: [...state.conversationHistory, message]
        }))
      },

      updateMessage: (id, updates) => {
        set((state) => ({
          messages: state.messages.map(msg =>
            msg.id === id ? { ...msg, ...updates } : msg
          ),
          conversationHistory: state.conversationHistory.map(msg =>
            msg.id === id ? { ...msg, ...updates } : msg
          )
        }))
      },

      clearMessages: () => {
        set({ messages: [], conversationHistory: [] })
      },

      setConnected: (connected) => {
        set({ isConnected: connected })
      },

      setLoading: (loading) => {
        set({ isLoading: loading })
      },

      setError: (error) => {
        set({ error, isLoading: false })
      },

      setContext: (context) => {
        set({ currentContext: context })
      },

      setActiveAgent: (agent) => {
        set({ activeAgent: agent })
        if (agent) {
          set((state) => ({
            availableAgents: state.availableAgents.map(a =>
              a.id === agent.id ? { ...a, lastUsed: Date.now() } : a
            )
          }))
        }
      },

      addAgent: (agent) => {
        set((state) => ({
          availableAgents: [...state.availableAgents, agent]
        }))
      },

      updateAgent: (id, updates) => {
        set((state) => ({
          availableAgents: state.availableAgents.map(agent =>
            agent.id === id ? { ...agent, ...updates } : agent
          )
        }))
      },

      removeAgent: (id) => {
        set((state) => ({
          availableAgents: state.availableAgents.filter(agent => agent.id !== id),
          activeAgent: state.activeAgent?.id === id ? null : state.activeAgent
        }))
      },

      setTyping: (typing) => {
        set({ isTyping: typing })
      },

      saveConversation: () => {
        const { conversationHistory } = get()
        const conversationData = {
          id: `conv_${Date.now()}`,
          messages: conversationHistory,
          timestamp: Date.now(),
          agent: get().activeAgent?.name || 'General'
        }

        // Save to storage
        try {
          const savedConversations = JSON.parse(
            localStorage.getItem('ai-conversations') || '[]'
          )
          savedConversations.push(conversationData)
          localStorage.setItem('ai-conversations', JSON.stringify(savedConversations))
        } catch (error) {
          console.error('Failed to save conversation:', error)
        }
      },

      loadConversation: (conversationId) => {
        try {
          const savedConversations = JSON.parse(
            localStorage.getItem('ai-conversations') || '[]'
          )
          const conversation = savedConversations.find((conv: any) => conv.id === conversationId)
          
          if (conversation) {
            set({
              messages: conversation.messages,
              conversationHistory: conversation.messages
            })
          }
        } catch (error) {
          console.error('Failed to load conversation:', error)
        }
      }
    }),
    {
      name: 'ai-store',
      partialize: (state) => ({
        availableAgents: state.availableAgents,
        activeAgent: state.activeAgent,
        conversationHistory: state.conversationHistory.slice(-50) // Keep last 50 messages
      })
    }
  )
)
