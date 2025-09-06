// src/main/components/AISpecialTab.tsx
import React, { useState, useEffect } from 'react'
import { useAI } from '../hooks/useAI'
import { AIMessage } from '../services/AIService'

const AISpecialTab: React.FC = () => {
  const { 
    messages, 
    isLoading, 
    error, 
    context, 
    isInitialized,
    sendMessage, 
    summarizePage, 
    analyzeContent,
    clearMessages,
    testConnection 
  } = useAI()

  const [inputMessage, setInputMessage] = useState('')
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const checkConnection = async () => {
      const connected = await testConnection()
      setIsConnected(connected)
    }
    
    if (isInitialized) {
      checkConnection()
    }
  }, [isInitialized, testConnection])

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const message = inputMessage.trim()
    setInputMessage('')
    
    await sendMessage(message)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleQuickAction = async (action: string) => {
    switch (action) {
      case 'summarize':
        await summarizePage()
        break
      case 'analyze':
        await analyzeContent()
        break
      case 'clear':
        clearMessages()
        break
    }
  }

  return (
    <div className="ai-special-tab">
      <div className="ai-header">
        <div className="ai-status">
          <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
            {isConnected ? '🟢' : '🔴'}
          </div>
          <span className="status-text">
            {isConnected ? 'AI Connected' : 'AI Disconnected'}
          </span>
        </div>
        
        {context && (
          <div className="ai-context">
            <span className="model-info">
              Model: {context.model} | Agents: {context.agentCount}
            </span>
          </div>
        )}
      </div>

      <div className="ai-content">
        <div className="messages-container">
          {messages.length === 0 ? (
            <div className="welcome-message">
              <h2>🤖 AI Assistant</h2>
              <p>Welcome to your AI-powered browsing companion!</p>
              <p>Ask me anything about the current page or request help with browsing tasks.</p>
              
              <div className="quick-actions">
                <button 
                  onClick={() => handleQuickAction('summarize')}
                  disabled={isLoading}
                  className="quick-action-btn"
                >
                  📄 Summarize Page
                </button>
                <button 
                  onClick={() => handleQuickAction('analyze')}
                  disabled={isLoading}
                  className="quick-action-btn"
                >
                  🔍 Analyze Content
                </button>
              </div>
            </div>
          ) : (
            <div className="messages-list">
              {messages.map((message: AIMessage) => (
                <div 
                  key={message.id} 
                  className={`message ${message.isUser ? 'user-message' : 'ai-message'}`}
                >
                  <div className="message-header">
                    <span className="message-sender">
                      {message.isUser ? '👤 You' : '🤖 AI Assistant'}
                    </span>
                    <span className="message-time">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="message-content">
                    {message.content}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="message ai-message loading">
                  <div className="message-header">
                    <span className="message-sender">🤖 AI Assistant</span>
                  </div>
                  <div className="message-content">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {error && (
          <div className="error-message">
            <span>⚠️ {error}</span>
            <button onClick={() => testConnection()}>
              Retry Connection
            </button>
          </div>
        )}

        <div className="input-container">
          <div className="input-wrapper">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about the current page or request help..."
              className="message-input"
              rows={3}
              disabled={isLoading || !isConnected}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading || !isConnected}
              className="send-button"
            >
              {isLoading ? '⏳' : '📤'}
            </button>
          </div>
          
          <div className="input-actions">
            <button 
              onClick={() => handleQuickAction('clear')}
              className="action-btn"
              disabled={messages.length === 0}
            >
              🗑️ Clear Chat
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AISpecialTab
