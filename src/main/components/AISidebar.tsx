// Enhanced AI Sidebar with Agent Integration
import React, { useState, useEffect, useRef, useMemo } from 'react'
import DOMPurify from 'dompurify'
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

  // Update context when current URL changes
  useEffect(() => {
    if (currentUrl && messages.length > 0) {
      // Add context awareness when URL changes
      console.log('URL context updated:', currentUrl)
    }
  }, [currentUrl, messages.length])

  const initializeAI = async () => {
    try {
      // Check if electronAPI exists first
      if (!window.electronAPI?.testConnection) {
        setConnectionStatus('disconnected')
        addMessage(false, '❌ Electronic API not available. Please ensure you are running in Electron environment.')
        return
      }

      const result = await window.electronAPI.testConnection()
      if (result && result.success) {
        setConnectionStatus('connected')
        addMessage(false, `🤖 **Hello! I'm KAiro, your enhanced AI assistant with intelligent agent coordination.**

## 🎯 **My Enhanced Capabilities**

**🔍 Research Agent**
• Comprehensive multi-source research with trend analysis
• Creates organized research tabs with structured findings
• Identifies authoritative sources and key insights

**🌐 Navigation Agent**  
• Smart website navigation with context awareness
• Automatic URL detection and tab management
• Contextual website recommendations

**🛒 Shopping Agent**
• Multi-retailer price comparison and deal finding
• Product analysis with detailed pros/cons
• Shopping workflow automation across sites

**📧 Communication Agent**
• Professional email composition with proper formatting
• Smart form filling with context awareness
• Social media content creation and optimization

**🤖 Automation Agent**
• Multi-step browser task automation
• Workflow creation with error recovery
• Scheduled actions and process optimization

**📊 Analysis Agent**
• Deep content analysis with sentiment insights
• Data extraction and structured information processing
• Actionable insights and recommendations

## ✨ **What Makes Me Special**
• **Smart Coordination**: I automatically choose the best agent(s) for your task
• **Context Awareness**: I understand your current page and browsing context
• **Quality Focus**: Every response is optimized for helpfulness and accuracy
• **Action-Oriented**: I provide specific, executable steps and recommendations

**Try these enhanced commands:**
• "research trending AI developments"
• "compose professional email about meeting"
• "analyze this page content"
• "automate this repetitive workflow"`)
      } else {
        setConnectionStatus('disconnected')
        addMessage(false, '⚠️ Unable to connect to AI service. Please check your GROQ API key and internet connection.')
      }
    } catch (error) {
      setConnectionStatus('disconnected')
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      addMessage(false, `❌ Connection error: ${errorMessage}. Please try refreshing the application.`)
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

  // FIXED: Memoize formatAgentStatus to prevent unnecessary re-renders
  const formatAgentStatus = useMemo(() => (status: AgentStatus): string => {
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
    
    if (status.progress !== undefined && status.progress !== null) {
      message += `\n📊 Progress: ${Math.round(status.progress)}%`
    }
    
    if (status.details && status.details.length > 0) {
      message += '\n\n**Details:**\n' + status.details.map(detail => `• ${detail}`).join('\n')
    }
    
    return message
  }, [])

  const scrollToBottom = () => {
    try {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    } catch (error) {
      // Fallback for older browsers
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!inputValue.trim() || isLoading || connectionStatus !== 'connected') return

    const userMessage = inputValue.trim()
    setInputValue('')
    setIsLoading(true)

    // Add user message
    addMessage(true, userMessage)

    try {
      // Check if electronAPI exists
      if (!window.electronAPI?.sendAIMessage) {
        throw new Error('AI service not available')
      }

      // Add loading message
      addMessage(false, '🤖 Processing your request...', true)

      // Send to AI service
      const result: AIResponse = await window.electronAPI.sendAIMessage(userMessage)
      
      // Remove loading message
      setMessages(prev => prev.filter(msg => !msg.isLoading))

      if (result && result.success) {
        addMessage(false, result.result || 'Task initiated successfully')
        
        // Execute agent task if this is a complex request
        if (shouldExecuteAgentTask(userMessage)) {
          addMessage(false, '🔄 Executing agent task...')
          try {
            onAgentTask(userMessage)
          } catch (agentError) {
            addMessage(false, `⚠️ Agent task warning: ${agentError instanceof Error ? agentError.message : 'Unknown error'}`)
          }
        }
        
        // Execute actions if any
        if (result.actions && Array.isArray(result.actions) && result.actions.length > 0) {
          for (const action of result.actions) {
            try {
              if (action.type === 'navigate' && action.target && window.electronAPI.navigateTo) {
                await window.electronAPI.navigateTo(action.target)
              }
            } catch (actionError) {
              addMessage(false, `⚠️ Action warning: ${actionError instanceof Error ? actionError.message : 'Action failed'}`)
            }
          }
        }
      } else {
        const errorMsg = result?.error || 'Unknown error occurred'
        addMessage(false, `❌ Error: ${errorMsg}`)
      }
    } catch (error) {
      // Remove loading message
      setMessages(prev => prev.filter(msg => !msg.isLoading))
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      addMessage(false, `❌ Error: ${errorMessage}`)
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
    try {
      return new Date(timestamp).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    } catch (error) {
      return 'Invalid time'
    }
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

    // FIXED: XSS Vulnerability - Sanitize content with DOMPurify
    try {
      const content = message.content
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
        .replace(/\n/g, '<br>')

      // Sanitize the content before rendering
      const sanitizedContent = DOMPurify.sanitize(content, {
        ALLOWED_TAGS: ['strong', 'em', 'code', 'br', 'p', 'div', 'span'],
        ALLOWED_ATTR: []
      })

      return (
        <div 
          className="message-content"
          dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        />
      )
    } catch (error) {
      return (
        <div className="message-content">
          {message.content}
        </div>
      )
    }
  }

  const quickActions = [
    {
      label: '🔍 Research AI developments',
      action: 'research latest AI and artificial intelligence developments with comprehensive analysis'
    },
    {
      label: '📊 Analyze current page',
      action: 'analyze the content of this page and provide detailed insights with key findings'
    },
    {
      label: '🛒 Research shopping deals',
      action: 'help me research products and find the best deals across multiple retailers'
    },
    {
      label: '📧 Compose professional email',
      action: 'help me compose a professional email with proper formatting and business tone'
    },
    {
      label: '🌐 Navigate to tech sites',
      action: 'navigate to top technology and news websites for latest updates'
    },
    {
      label: '🤖 Create automation workflow', 
      action: 'create a comprehensive automation workflow for repetitive browser tasks'
    },
    {
      label: '📝 Generate content template',
      action: 'help me create content templates for social media and communication'
    },
    {
      label: '💼 Business research',
      action: 'research business trends and market analysis with comprehensive findings'
    },
    {
      label: '🎯 Smart task planning',
      action: 'help me plan and organize complex tasks with step-by-step approach'
    }
  ]

  const handleQuickAction = (action: string) => {
    if (!isLoading && connectionStatus === 'connected') {
      setInputValue(action)
    }
  }

  return (
    <div className="ai-sidebar">
      <div className="ai-sidebar-header">
        <h3 className="ai-sidebar-title">🤖 AI Assistant</h3>
        <button className="ai-sidebar-close" onClick={onClose} aria-label="Close AI sidebar">
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
                onClick={() => handleQuickAction(action.action)}
                disabled={isLoading || connectionStatus !== 'connected'}
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
                disabled={isLoading || connectionStatus !== 'connected'}
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
                disabled={!inputValue.trim() || isLoading || connectionStatus !== 'connected'}
                aria-label="Send message"
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