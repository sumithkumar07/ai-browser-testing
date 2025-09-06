import React, { useState, useEffect, useRef } from 'react'
import { AIMessage, AIResponse } from '../types/electron'

interface AISidebarProps {
  onClose: () => void
  currentUrl: string
}

const AISidebar: React.FC<AISidebarProps> = ({ onClose, currentUrl }) => {
  const [messages, setMessages] = useState<AIMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'loading'>('loading')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    initializeAI()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const initializeAI = async () => {
    try {
      const result = await window.electronAPI.testConnection()
      if (result.success) {
        setConnectionStatus('connected')
        // Get personalized greeting from AI
        const greetingResponse = await window.electronAPI.sendAIMessage('Generate a personalized greeting for the user')
        if (greetingResponse.success && greetingResponse.result) {
          addMessage('assistant', greetingResponse.result)
        } else {
          addMessage('assistant', 'Hello! I\'m your AI assistant. I\'m ready to help you with browsing, research, and intelligent tasks. What would you like to do?')
        }
      } else {
        setConnectionStatus('disconnected')
        addMessage('assistant', 'I\'m currently unable to connect to the AI service. Please check your internet connection and try again.')
      }
    } catch (error) {
      setConnectionStatus('disconnected')
      addMessage('assistant', 'I encountered an error while initializing. Please try refreshing the application or check your connection.')
    }
  }

  const addMessage = (isUser: boolean, content: string, isLoading = false) => {
    const message: AIMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content,
      timestamp: Date.now(),
      isUser,
      isLoading
    }
    setMessages(prev => [...prev, message])
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!inputValue.trim() || isLoading) return

    const userMessage = inputValue.trim()
    setInputValue('')
    setIsLoading(true)

    // Add user message
    addMessage(true, userMessage)

    try {
      // Add loading message
      addMessage(false, '', true)

      // Send to AI service
      const result: AIResponse = await window.electronAPI.sendAIMessage(userMessage)
      
      // Remove loading message
      setMessages(prev => prev.filter(msg => !msg.isLoading))

      if (result.success) {
        addMessage(false, result.result || 'No response received')
        
        // Execute actions if any
        if (result.actions && result.actions.length > 0) {
          for (const action of result.actions) {
            if (action.type === 'navigate') {
              await window.electronAPI.navigateTo(action.target)
            }
          }
        }
      } else {
        addMessage(false, `Error: ${result.error || 'Unknown error occurred'}`)
      }
    } catch (error) {
      // Remove loading message
      setMessages(prev => prev.filter(msg => !msg.isLoading))
      addMessage(false, `Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value)
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  return (
    <div className="ai-sidebar">
      <div className="ai-sidebar-header">
        <h3 className="ai-sidebar-title">AI Assistant</h3>
        <button className="ai-sidebar-close" onClick={onClose}>
          ×
        </button>
      </div>

      <div className={`ai-connection-status ${connectionStatus}`}>
        <div className="ai-connection-indicator"></div>
        <span>
          {connectionStatus === 'connected' && 'Connected'}
          {connectionStatus === 'disconnected' && 'Disconnected'}
          {connectionStatus === 'loading' && 'Connecting...'}
        </span>
      </div>

      <div className="ai-sidebar-content">
        <div className="ai-chat">
          <div className="ai-messages">
            {messages.map(message => (
              <div
                key={message.id}
                className={`ai-message ${message.isUser ? 'user' : 'assistant'}`}
              >
                <div className="ai-message-content">
                  {message.isLoading ? (
                    <div className="ai-loading">
                      <span>AI is thinking</span>
                      <div className="ai-loading-dots">
                        <div className="ai-loading-dot"></div>
                        <div className="ai-loading-dot"></div>
                        <div className="ai-loading-dot"></div>
                      </div>
                    </div>
                  ) : (
                    message.content
                  )}
                </div>
                <div className="ai-message-time">
                  {formatTime(message.timestamp)}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="ai-input-container">
            <form onSubmit={handleSubmit} className="ai-input-form">
              <textarea
                className="ai-input"
                value={inputValue}
                onChange={handleInputChange}
                placeholder="Ask me anything..."
                rows={1}
                disabled={isLoading}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmit(e)
                  }
                }}
              />
              <button
                type="submit"
                className="ai-send-button"
                disabled={!inputValue.trim() || isLoading}
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AISidebar
