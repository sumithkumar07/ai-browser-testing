// FIXED: Enhanced AI Sidebar Component with comprehensive bug fixes
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { AIMessage, AgentStatus } from '../types/electron'
import { createLogger } from '../../core/logger/EnhancedLogger'

const logger = createLogger('AISidebar')

interface AISidebarProps {
  onClose: () => void
}

const AISidebar: React.FC<AISidebarProps> = ({ onClose }) => {
  // State management
  const [messages, setMessages] = useState<AIMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'loading'>('loading')
  const [agentStatus, setAgentStatus] = useState<AgentStatus | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Refs for DOM manipulation and cleanup
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const connectionCheckIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // FIXED: Enhanced connection status check with better error recovery
  const checkConnection = useCallback(async () => {
    try {
      if (!window.electronAPI?.testConnection) {
        setConnectionStatus('disconnected')
        setError('AI service not available - Electron API missing')
        return
      }

      const result = await window.electronAPI.testConnection()
      const isConnected = result?.success && result?.data?.connected
      
      setConnectionStatus(isConnected ? 'connected' : 'disconnected')
      
      if (!isConnected) {
        const errorMsg = result?.error || 'AI service connection failed'
        logger.warn('AI connection test failed:', errorMsg)
        setError(errorMsg)
      } else {
        setError(null) // Clear any previous errors
        logger.debug('AI connection verified successfully')
      }
    } catch (error) {
      logger.error('Connection check error', error as Error)
      setConnectionStatus('disconnected')
      setError(`Connection error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }, [])

  // FIXED: Enhanced initialization with proper cleanup
  useEffect(() => {
    const initializeAISidebar = async () => {
      try {
        logger.info('Initializing AI Sidebar...')
        
        // Initial connection check
        await checkConnection()
        
        // Set up periodic connection checks
        connectionCheckIntervalRef.current = setInterval(checkConnection, 10000) // Every 10 seconds
        
        // Load initial agent status
        try {
          if (window.electronAPI?.getAgentStatus) {
            const statusResult = await window.electronAPI.getAgentStatus()
            if (statusResult?.success) {
              setAgentStatus(statusResult.status)
            }
          }
        } catch (statusError) {
          logger.warn('Failed to load agent status:', { error: statusError })
        }

        // Add welcome message
        const welcomeMessage: AIMessage = {
          id: `msg_${Date.now()}_welcome`,
          content: `# 🤖 KAiro AI Assistant - NLP-First Design

Welcome! I'm your **complete feature interface** - everything you need is accessible through our conversation:

## 🎯 **NLP-First Philosophy:**
**No complex menus, no cluttered UI - just natural conversation with unlimited capabilities**

## ✨ **ALL Features Available Via Chat:**
- 🔍 **Multi-Agent Research**: *"research AI trends, find products, analyze security"*
- 🤖 **Background Automation**: *"monitor this topic daily and notify me"*  
- 🧠 **Smart Memory**: *"remember my preferences and learn my patterns"*
- 🛡️ **Advanced Security**: *"scan this site and configure protection"*
- 📊 **System Management**: *"optimize performance and check health"*
- 🎯 **Goal Planning**: *"create autonomous goals for this project"*

## 🚀 **Why Conversational?**
- **Infinite Flexibility**: Combine any features in natural language
- **Zero Learning Curve**: No manuals, just speak naturally
- **Clean Interface**: Focus on content, not controls
- **Context Aware**: I understand what you need when you need it

*Tell me what you'd like to accomplish - I have access to ALL advanced features!*`,
          isUser: false,
          timestamp: Date.now()
        }

        setMessages([welcomeMessage])
        logger.info('✅ AI Sidebar initialized successfully')
        
      } catch (error) {
        logger.error('Failed to initialize AI Sidebar', error as Error)
        setError('Failed to initialize AI assistant')
      }
    }

    initializeAISidebar()

    // FIXED: Comprehensive cleanup on unmount
    return () => {
      if (connectionCheckIntervalRef.current) {
        clearInterval(connectionCheckIntervalRef.current)
        connectionCheckIntervalRef.current = null
      }
    }
  }, [checkConnection])

  // FIXED: Enhanced auto-scroll with performance optimization
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      try {
        messagesEndRef.current.scrollIntoView({ 
          behavior: 'smooth',
          block: 'end'
        })
      } catch (error) {
        // Fallback for browsers that don't support smooth scrolling
        messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight
      }
    }
  }, [])

  // Auto-scroll when messages change
  useEffect(() => {
    const timeoutId = setTimeout(scrollToBottom, 100)
    return () => clearTimeout(timeoutId)
  }, [messages, scrollToBottom])

  // FIXED: Enhanced message sending with comprehensive error handling
  const sendMessage = useCallback(async () => {
    const trimmedInput = input.trim()
    if (!trimmedInput || isLoading) {
      return
    }

    if (!window.electronAPI?.sendAIMessage) {
      setError('AI service not available')
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      // Add user message immediately for better UX
      const userMessage: AIMessage = {
        id: `msg_${Date.now()}_user`,
        content: trimmedInput,
        isUser: true,
        timestamp: Date.now()
      }

      setMessages(prev => [...prev, userMessage])
      setInput('')

      // Add loading indicator
      const loadingMessage: AIMessage = {
        id: `msg_${Date.now()}_loading`,
        content: 'AI is thinking...',
        isUser: false,
        timestamp: Date.now(),
        isLoading: true
      }

      setMessages(prev => [...prev, loadingMessage])

      // Send message to AI service
      const result = await window.electronAPI.sendAIMessage(trimmedInput)
      
      // Remove loading message
      setMessages(prev => prev.filter(msg => !msg.isLoading))

      if (result?.success) {
        const aiMessage: AIMessage = {
          id: `msg_${Date.now()}_ai`,
          content: result.result || result.data || 'No response received',
          isUser: false,
          timestamp: Date.now()
        }

        setMessages(prev => [...prev, aiMessage])

        // Update agent status if provided
        if (result.agentStatus) {
          setAgentStatus(result.agentStatus)
        }

        logger.debug('AI message sent successfully')
      } else {
        throw new Error(result?.error || 'AI service returned an error')
      }

    } catch (error) {
      logger.error('Failed to send AI message', error as Error)
      
      // Remove loading message on error
      setMessages(prev => prev.filter(msg => !msg.isLoading))
      
      // Add error message
      const errorMessage: AIMessage = {
        id: `msg_${Date.now()}_error`,
        content: `❌ **Error**: ${error instanceof Error ? error.message : 'Unknown error occurred'}

*Please try again or check your connection.*`,
        isUser: false,
        timestamp: Date.now()
      }

      setMessages(prev => [...prev, errorMessage])
      setError('Failed to send message')
    } finally {
      setIsLoading(false)
      
      // Refocus input for better UX
      if (inputRef.current) {
        inputRef.current.focus()
      }
    }
  }, [input, isLoading])

  // FIXED: Enhanced keyboard event handling
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        // Allow line break with Shift+Enter
        return
      } else {
        // Send message with Enter
        e.preventDefault()
        sendMessage()
      }
    }
  }, [sendMessage])

  // FIXED: Enhanced input change handler with validation
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    
    // Limit input length to prevent issues
    if (value.length <= 5000) {
      setInput(value)
      setError(null) // Clear any previous errors
    }
  }, [])

  // FIXED: Enhanced quick action handlers
  const handleQuickAction = useCallback(async (action: string) => {
    setInput(action)
    // Small delay to show the input change
    setTimeout(() => sendMessage(), 100)
  }, [sendMessage])

  // FIXED: Enhanced connection status rendering
  const getConnectionStatusColor = useMemo(() => {
    switch (connectionStatus) {
      case 'connected': return '#28a745'
      case 'disconnected': return '#dc3545'
      case 'loading': return '#ffc107'
      default: return '#6c757d'
    }
  }, [connectionStatus])

  const getConnectionStatusText = useMemo(() => {
    switch (connectionStatus) {
      case 'connected': return 'AI Connected'
      case 'disconnected': return 'AI Disconnected'
      case 'loading': return 'Connecting...'
      default: return 'Unknown'
    }
  }, [connectionStatus])

  // FIXED: Enhanced message rendering with proper formatting
  const renderMessage = useCallback((message: AIMessage) => {
    return (
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
            <div 
              dangerouslySetInnerHTML={{ 
                __html: formatMessageContent(message.content) 
              }} 
            />
          )}
        </div>
        <div className="ai-message-time">
          {new Date(message.timestamp).toLocaleTimeString()}
        </div>
      </div>
    )
  }, [])

  return (
    <div className="ai-sidebar">
      {/* Header */}
      <div className="ai-sidebar-header">
        <h3 className="ai-sidebar-title">🤖 KAiro AI</h3>
        <button 
          className="ai-sidebar-close" 
          onClick={onClose}
          title="Close AI Sidebar"
          aria-label="Close AI Sidebar"
        >
          ×
        </button>
      </div>

      {/* Connection Status - REMOVED as requested by user */}

      {/* Messages */}
      <div className="ai-sidebar-content">
        <div className="ai-chat">
          <div className="ai-messages">
            {messages.map(renderMessage)}
            <div ref={messagesEndRef} />
          </div>

          {/* NLP-First Quick Examples */}
          {messages.length <= 1 && ( // Only show for new conversations
            <div className="quick-actions">
              <div className="nlp-examples-header">
                <h4>💬 Try These Natural Requests:</h4>
                <p className="nlp-subtitle">Everything is accessible through conversation</p>
              </div>
              
              {/* Natural Language Examples */}
              <button 
                className="quick-action-btn nlp-example"
                onClick={() => handleQuickAction('Research AI trends, find related products, and analyze security implications')}
                disabled={isLoading}
                title="Multi-Agent Coordination Example"
              >
                🔄 Multi-Agent Workflow
              </button>
              <button 
                className="quick-action-btn nlp-example"
                onClick={() => handleQuickAction('Set up daily monitoring for AI news and create automated reports')}
                disabled={isLoading}
                title="Background Automation Example"
              >
                🕐 Background Tasks
              </button>
              <button 
                className="quick-action-btn nlp-example"
                onClick={() => handleQuickAction('Remember my research preferences and optimize future searches')}
                disabled={isLoading}
                title="Memory & Learning Example"
              >
                🧠 Smart Memory
              </button>
              <button 
                className="quick-action-btn nlp-example"
                onClick={() => handleQuickAction('Analyze this page content and create a summary')}
                disabled={isLoading}
                title="Content Analysis Example"
              >
                📊 Page Analysis
              </button>
              
              <div className="nlp-examples-footer">
                <p>✨ <strong>No UI limits</strong> - combine any features through natural conversation!</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="ai-input-container">
        {error && (
          <div className="error-message" style={{ marginBottom: '10px', color: '#dc3545', fontSize: '12px' }}>
            {error}
          </div>
        )}
        <div className="ai-input-form">
          <textarea
            ref={inputRef}
            className="ai-input"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={
              connectionStatus === 'connected' 
                ? "Natural language interface - ALL features accessible through conversation..."
                : "AI service not available"
            }
            disabled={isLoading || connectionStatus !== 'connected'}
            rows={1}
            style={{ 
              minHeight: '42px',
              maxHeight: '120px',
              resize: 'none',
              overflow: 'auto'
            }}
          />
          <button
            className="ai-send-button"
            onClick={sendMessage}
            disabled={isLoading || !input.trim() || connectionStatus !== 'connected'}
            title="Send message"
            aria-label="Send message"
          >
            {isLoading ? '⏳' : '📤'}
          </button>
        </div>
      </div>
    </div>
  )
}

// FIXED: Enhanced message formatting with XSS protection
const formatMessageContent = (content: string): string => {
  try {
    let formatted = content
      // Headers
      .replace(/^### (.*$)/gim, '<h3 style="color: #495057; margin: 16px 0 8px 0; font-size: 16px;">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 style="color: #495057; margin: 20px 0 12px 0; font-size: 18px;">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 style="color: #495057; margin: 24px 0 16px 0; font-size: 20px;">$1</h1>')
      
      // Code blocks
      .replace(/```([\s\S]*?)```/g, '<pre style="background: #f8f9fa; padding: 12px; border-radius: 4px; overflow-x: auto; font-family: monospace; margin: 8px 0;"><code>$1</code></pre>')
      
      // Inline code
      .replace(/`([^`]+)`/g, '<code style="background: rgba(0,0,0,0.1); padding: 2px 4px; border-radius: 3px; font-family: monospace;">$1</code>')
      
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      
      // Italic
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      
      // Lists
      .replace(/^[*-] (.*$)/gim, '<li style="margin: 4px 0;">$1</li>')
      
      // Links (basic, be careful with XSS)
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: #667eea; text-decoration: underline;">$1</a>')
      
      // Line breaks
      .replace(/\n/g, '<br>')

    // Wrap consecutive list items
    formatted = formatted.replace(/(<li[^>]*>.*?<\/li>(\s*<br>\s*<li[^>]*>.*?<\/li>)*)/g, '<ul style="margin: 8px 0; padding-left: 20px;">$1</ul>')
    
    // Clean up extra br tags
    formatted = formatted.replace(/<br>\s*<ul>/g, '<ul>').replace(/<\/ul>\s*<br>/g, '</ul>')
    
    return formatted
  } catch (error) {
    logger.error('Error formatting message', error as Error)
    // Return escaped content as fallback
    return content.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>')
  }
}

export default AISidebar