import { create } from 'zustand'

export interface AIMessage {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
}

interface AIStore {
  // State
  messages: AIMessage[]
  isTyping: boolean
  sidebarCollapsed: boolean
  
  // Actions
  addMessage: (message: Omit<AIMessage, 'id' | 'timestamp'>) => void
  setTyping: (isTyping: boolean) => void
  toggleSidebar: () => void
  clearMessages: () => void
}

export const useAIStore = create<AIStore>((set) => ({
  // Initial state
  messages: [],
  isTyping: false,
  sidebarCollapsed: false,
  
  // Actions
  addMessage: (message) => {
    const newMessage: AIMessage = {
      ...message,
      id: `msg-${Date.now()}`,
      timestamp: new Date()
    }
    
    set((state) => ({
      messages: [...state.messages, newMessage]
    }))
  },
  
  setTyping: (isTyping) => {
    set({ isTyping })
  },
  
  toggleSidebar: () => {
    set((state) => ({
      sidebarCollapsed: !state.sidebarCollapsed
    }))
  },
  
  clearMessages: () => {
    set({ messages: [] })
  }
}))
