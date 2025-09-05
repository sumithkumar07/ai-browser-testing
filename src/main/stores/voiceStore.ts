import { create } from 'zustand'

export interface VoiceCommand {
  id: string
  command: string
  action: string
  description: string
  category: 'navigation' | 'ai' | 'browser' | 'system'
}

export interface VoiceStore {
  isListening: boolean
  transcript: string
  confidence: number
  isSupported: boolean
  commands: VoiceCommand[]
  addCommand: (command: VoiceCommand) => void
  removeCommand: (id: string) => void
  startListening: () => Promise<void>
  stopListening: () => void
  clearTranscript: () => void
  getCommandsByCategory: (category: string) => VoiceCommand[]
}

const defaultCommands: VoiceCommand[] = [
  // Navigation commands
  {
    id: 'go-to',
    command: 'go to',
    action: 'navigate',
    description: 'Navigate to a website',
    category: 'navigation'
  },
  {
    id: 'open',
    command: 'open',
    action: 'navigate',
    description: 'Open a website',
    category: 'navigation'
  },
  {
    id: 'search',
    command: 'search for',
    action: 'search',
    description: 'Search the web',
    category: 'navigation'
  },
  {
    id: 'back',
    command: 'go back',
    action: 'back',
    description: 'Go back to previous page',
    category: 'navigation'
  },
  {
    id: 'forward',
    command: 'go forward',
    action: 'forward',
    description: 'Go forward to next page',
    category: 'navigation'
  },
  {
    id: 'refresh',
    command: 'refresh',
    action: 'refresh',
    description: 'Refresh current page',
    category: 'navigation'
  },
  
  // Browser commands
  {
    id: 'new-tab',
    command: 'new tab',
    action: 'newTab',
    description: 'Open a new tab',
    category: 'browser'
  },
  {
    id: 'close-tab',
    command: 'close tab',
    action: 'closeTab',
    description: 'Close current tab',
    category: 'browser'
  },
  {
    id: 'bookmarks',
    command: 'show bookmarks',
    action: 'toggleBookmarks',
    description: 'Show/hide bookmarks bar',
    category: 'browser'
  },
  {
    id: 'history',
    command: 'show history',
    action: 'showHistory',
    description: 'Show browsing history',
    category: 'browser'
  },
  
  // AI commands
  {
    id: 'ask-ai',
    command: 'ask',
    action: 'askAI',
    description: 'Ask AI assistant a question',
    category: 'ai'
  },
  {
    id: 'summarize',
    command: 'summarize',
    action: 'summarize',
    description: 'Summarize current page',
    category: 'ai'
  },
  {
    id: 'analyze',
    command: 'analyze',
    action: 'analyze',
    description: 'Analyze current page content',
    category: 'ai'
  },
  
  // System commands
  {
    id: 'dark-mode',
    command: 'dark mode',
    action: 'toggleDarkMode',
    description: 'Toggle dark mode',
    category: 'system'
  },
  {
    id: 'light-mode',
    command: 'light mode',
    action: 'toggleLightMode',
    description: 'Toggle light mode',
    category: 'system'
  },
  {
    id: 'high-contrast',
    command: 'high contrast',
    action: 'toggleHighContrast',
    description: 'Toggle high contrast mode',
    category: 'system'
  }
]

export const useVoiceStore = create<VoiceStore>((set, get) => ({
  isListening: false,
  transcript: '',
  confidence: 0,
  isSupported: 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window,
  commands: defaultCommands,
  
  addCommand: (command: VoiceCommand) => {
    set(state => ({
      commands: [...state.commands, command]
    }))
  },
  
  removeCommand: (id: string) => {
    set(state => ({
      commands: state.commands.filter(cmd => cmd.id !== id)
    }))
  },
  
  startListening: async () => {
    if (!get().isSupported) {
      console.error('Speech recognition not supported')
      return
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'
    
    recognition.onstart = () => {
      set({ isListening: true, transcript: '' })
      console.log('Voice recognition started')
    }
    
    recognition.onresult = (event) => {
      let finalTranscript = ''
      let interimTranscript = ''
      let maxConfidence = 0
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        const confidence = event.results[i][0].confidence
        
        if (event.results[i].isFinal) {
          finalTranscript += transcript
        } else {
          interimTranscript += transcript
        }
        
        maxConfidence = Math.max(maxConfidence, confidence)
      }
      
      set({
        transcript: finalTranscript || interimTranscript,
        confidence: maxConfidence
      })
    }
    
    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
      set({ isListening: false })
    }
    
    recognition.onend = () => {
      set({ isListening: false })
      console.log('Voice recognition ended')
    }
    
    try {
      recognition.start()
    } catch (error) {
      console.error('Failed to start speech recognition:', error)
      set({ isListening: false })
    }
  },
  
  stopListening: () => {
    set({ isListening: false })
    // Stop recognition if it's running
    if (window.speechRecognition) {
      window.speechRecognition.stop()
    }
  },
  
  clearTranscript: () => {
    set({ transcript: '', confidence: 0 })
  },
  
  getCommandsByCategory: (category: string) => {
    return get().commands.filter(cmd => cmd.category === category)
  }
}))

// Extend Window interface for speech recognition
declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
    speechRecognition: any
  }
}
