// Enhanced AI Sidebar with Agent Integration
import React, { useState, useEffect, useRef } from 'react'
import { AIMessage, AIResponse, AgentStatus } from '../types/electron'

interface AISidebarProps {
  onClose: () => void
  currentUrl: string
  onAgentTask: (task: string) => void
  agentStatus: AgentStatus | null
}

const AISidebar: React.FC<AISidebarProps> = ({ 
  onClose, 
  currentUrl, 
  onAgentTask,
  agentStatus 
}) => {
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

  // Update messages when agent status changes
  useEffect(() => {
    if (agentStatus) {
      updateAgentStatusMessage(agentStatus)
    }
  }, [agentStatus])

  const initializeAI = async () => {
    try {
      const result = await window.electronAPI.testConnection()
      if (result.success) {
        setConnectionStatus('connected')
        addMessage(false, `🤖 Hello! I'm your AI assistant with full browser control.

I can help you with:
• 🔍 Research tasks (find top websites, compare information)  
• 🌐 Navigate to websites and extract content
• 📊 Analyze web pages and create summaries
• 🛒 Shopping research and price comparison
• 📝 Create organized research documents

Try: "research top 5 AI websites and create summary"`)
      } else {
        setConnectionStatus('disconnected')
        addMessage(false, 'I\'m currently unable to connect to the AI service. Please check your internet connection and try again.')
      }
    } catch (error) {
      setConnectionStatus('disconnected')
      addMessage(false, 'I encountered an error while initializing. Please try refreshing the application or check your connection.')
    }
  }

  const addMessage = (isUser: boolean, content: string, isLoading = false, agentStatus?: AgentStatus) => {
    const message: AIMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content,
      timestamp: Date.now(),
      isUser,
      isLoading,
      agentStatus
    }
    setMessages(prev => [...prev, message])
  }

  const updateAgentStatusMessage = (status: AgentStatus) => {
    setMessages(prevMessages => {
      // Remove previous agent status messages
      const filtered = prevMessages.filter(msg => !msg.agentStatus)
      
      // Add new agent status message
      const statusMessage: AIMessage = {
        id: `agent_status_${Date.now()}`,
        content: formatAgentStatus(status),
        timestamp: Date.now(),
        isUser: false,
        agentStatus: status
      }
      
      return [...filtered, statusMessage]
    })
  }

  const formatAgentStatus = (status: AgentStatus): string => {
    const statusEmoji = {
      idle: '⏸️',
      active: '⏳',
      completed: '✅',
      error: '❌'
    }

    let message = `${statusEmoji[status.status]} **${status.name}**: ${status.status.toUpperCase()}`
    
    if (status.currentTask) {
      message += `\n📋 Task: ${status.currentTask}`
    }
    
    if (status.progress !== undefined) {
      message += `\n📊 Progress: ${Math.round(status.progress)}%`
    }
    
    if (status.details && status.details.length > 0) {
      message += '\n\n**Details:**\n' + status.details.map(detail => `• ${detail}`).join('\n')
    }
    
    return message
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
      addMessage(false, '🤖 Processing your request...', true)

      // Send to AI service
      const result: AIResponse = await window.electronAPI.sendAIMessage(userMessage)
      
      // Remove loading message
      setMessages(prev => prev.filter(msg => !msg.isLoading))

      if (result.success) {
        addMessage(false, result.result || 'Task initiated successfully')
        
        // Execute agent task if this is a complex request
        if (shouldExecuteAgentTask(userMessage)) {
          addMessage(false, '🔄 Executing agent task...')
          onAgentTask(userMessage)
        }
        
        // Execute actions if any
        if (result.actions && result.actions.length > 0) {
          for (const action of result.actions) {
            if (action.type === 'navigate') {
              await window.electronAPI.navigateTo(action.target)
            }
          }
        }
      } else {
        addMessage(false, `❌ Error: ${result.error || 'Unknown error occurred'}`)
      }
    } catch (error) {
      // Remove loading message
      setMessages(prev => prev.filter(msg => !msg.isLoading))
      addMessage(false, `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const shouldExecuteAgentTask = (message: string): boolean => {
    const agentKeywords = [
      // Research keywords
      'research', 'find', 'search', 'top', 'best', 'investigate', 'explore',
      // Analysis keywords  
      'analyze', 'analysis', 'summary', 'summarize', 'extract', 'examine',
      // Shopping keywords
      'compare', 'price', 'product', 'buy', 'shop', 'cost', 'deal',
      // Creation keywords
      'create', 'generate', 'make', 'build', 'compile', 'organize',
      // Navigation keywords
      'navigate', 'go to', 'visit', 'open', 'browse',
      // Communication keywords - NEW
      'email', 'send', 'compose', 'write', 'message', 'contact', 'form', 'fill', 'submit', 'social', 'post', 'tweet',
      // Automation keywords - NEW
      'automate', 'automation', 'repeat', 'schedule', 'workflow', 'process', 'sequence', 'steps', 'batch', 'routine',
      // Multi-step keywords
      'websites', 'multiple', 'several', 'list of', 'across'
    ]
    
    const lowerMessage = message.toLowerCase()
    return agentKeywords.some(keyword => lowerMessage.includes(keyword)) ||
           message.length > 50 // Complex queries likely need agents
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

  const renderMessageContent = (message: AIMessage) => {
    if (message.isLoading) {
      return (
        <div className="ai-loading">
          <span>AI is thinking</span>
          <div className="ai-loading-dots">
            <div className="ai-loading-dot"></div>
            <div className="ai-loading-dot"></div>
            <div className="ai-loading-dot"></div>
          </div>
        </div>
      )
    }

    // Render markdown-like content
    const content = message.content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>')

    return (
      <div 
        className="message-content"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    )
  }

  const quickActions = [
    {
      label: '🔍 Research trending topics',
      action: 'research trending AI and technology topics and create summary with key insights'
    },
    {
      label: '📊 Analyze current page',
      action: 'analyze the content of this page and provide key insights and summary'
    },
    {
      label: '🛒 Compare products',
      action: 'help me compare products and find the best deals'
    },
    {
      label: '📝 Research & organize',
      action: 'research this topic across multiple sources and organize findings in an AI tab'
    },
    {
      label: '🌐 Smart navigation',
      action: 'navigate to relevant websites based on current context'
    },
    {
      label: '💡 Generate insights',
      action: 'analyze current content and generate actionable insights and recommendations'
    }
  ]

  return (
    <div className="ai-sidebar">
      <div className="ai-sidebar-header">
        <h3 className="ai-sidebar-title">🤖 AI Assistant</h3>
        <button className="ai-sidebar-close" onClick={onClose}>
          ×
        </button>
      </div>

      <div className={`ai-connection-status ${connectionStatus}`}>
        <div className="ai-connection-indicator"></div>
        <span>
          {connectionStatus === 'connected' && 'Connected & Ready'}
          {connectionStatus === 'disconnected' && 'Disconnected'}
          {connectionStatus === 'loading' && 'Connecting...'}
        </span>
        {agentStatus && (
          <span className="agent-status-indicator">
            Agent: {agentStatus.status}
          </span>
        )}
      </div>

      <div className="ai-sidebar-content">
        <div className="ai-chat">
          <div className="ai-messages">
            {messages.map(message => (
              <div
                key={message.id}
                className={`ai-message ${message.isUser ? 'user' : 'assistant'} ${message.agentStatus ? 'agent-status' : ''}`}
              >
                <div className="ai-message-content">
                  {renderMessageContent(message)}
                </div>
                <div className="ai-message-time">
                  {formatTime(message.timestamp)}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="quick-actions">
            {quickActions.map((action, index) => (
              <button
                key={index}
                className="quick-action-btn"
                onClick={() => setInputValue(action.action)}
                disabled={isLoading}
              >
                {action.label}
              </button>
            ))}
          </div>

          <div className="ai-input-container">
            <form onSubmit={handleSubmit} className="ai-input-form">
              <textarea
                className="ai-input"
                value={inputValue}
                onChange={handleInputChange}
                placeholder="Ask me anything... I can control the browser to help you research, navigate, and analyze content."
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
                {isLoading ? '⏳' : '📤'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AISidebar