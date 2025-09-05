import React, { useState, useEffect } from 'react'
import { useAI } from '../../hooks/useAI'
import { useVoiceStore } from '../../stores/voiceStore'
import { AIWelcome } from './AIWelcome'
import './AISidebar.css'

export const AISidebar: React.FC = () => {
  const { 
    messages, 
    isTyping, 
    sidebarCollapsed, 
    handleSendMessage, 
    handleToggleSidebar 
  } = useAI()
  
  const { isListening, transcript, startListening, stopListening, clearTranscript } = useVoiceStore()
  const [inputValue, setInputValue] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim()) {
      handleSendMessage(inputValue.trim())
      setInputValue('')
    }
  }

  const handleVoiceCommand = async () => {
    if (isListening) {
      stopListening()
    } else {
      await startListening()
    }
  }

  // Process voice input when transcript changes
  useEffect(() => {
    if (transcript && !isListening) {
      console.log('Voice command received:', transcript)
      handleSendMessage(transcript)
      clearTranscript()
    }
  }, [transcript, isListening, handleSendMessage, clearTranscript])

  if (sidebarCollapsed) {
    return (
      <div className="ai-sidebar-collapsed">
        <button 
          className="toggle-sidebar-btn"
          onClick={handleToggleSidebar}
          title="Expand AI Sidebar"
        >
          →
        </button>
      </div>
    )
  }

  return (
    <div className="ai-sidebar">
      <div className="ai-header">
        <h3>AI Assistant</h3>
        <button 
          className="toggle-sidebar-btn"
          onClick={handleToggleSidebar}
          title="Collapse AI Sidebar"
        >
          ←
        </button>
      </div>
      
      <div className="ai-content">
        {messages.length === 0 ? (
          <AIWelcome />
        ) : (
          <div className="messages">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`message ${message.type}-message`}
              >
                <div className="message-content">
                  {message.content}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="message ai-message typing">
                <div className="typing-indicator">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      <form className="ai-input-container" onSubmit={handleSubmit}>
        <div className="ai-input-wrapper">
          <input
            type="text"
            className="ai-input"
            placeholder="Ask me anything about the current page..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isTyping}
          />
          <button 
            type="button"
            className={`ai-voice-btn ${isListening ? 'listening' : ''}`}
            onClick={handleVoiceCommand}
            title={isListening ? 'Stop listening' : 'Voice command'}
            disabled={isTyping}
          >
            {isListening ? '🔴' : '🎤'}
          </button>
          <button 
            type="submit" 
            className="ai-send-btn"
            disabled={isTyping || !inputValue.trim()}
          >
            →
          </button>
        </div>
      </form>
    </div>
  )
}
