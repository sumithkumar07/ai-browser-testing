// src/main/components/Collaboration.tsx
import React, { useState, useEffect } from 'react'
import { useAI } from '../hooks/useAI'

interface CollaborationSession {
  id: string
  title: string
  participants: string[]
  messages: CollaborationMessage[]
  sharedContent: SharedContent[]
  createdAt: number
  lastActivity: number
  isActive: boolean
}

interface CollaborationMessage {
  id: string
  sender: string
  content: string
  timestamp: number
  type: 'text' | 'file' | 'link' | 'action'
  metadata?: any
}

interface SharedContent {
  id: string
  title: string
  type: 'url' | 'text' | 'file' | 'image'
  content: string
  sharedBy: string
  timestamp: number
  comments: Comment[]
}

interface Comment {
  id: string
  author: string
  content: string
  timestamp: number
}

const Collaboration: React.FC = () => {
  const { sendMessage, isLoading } = useAI()
  const [sessions, setSessions] = useState<CollaborationSession[]>([])
  const [activeSession, setActiveSession] = useState<CollaborationSession | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [sessionTitle, setSessionTitle] = useState('')
  const [isCreatingSession, setIsCreatingSession] = useState(false)
  const [sharedUrl, setSharedUrl] = useState('')
  const [isSharing, setIsSharing] = useState(false)

  useEffect(() => {
    loadCollaborationSessions()
  }, [])

  const loadCollaborationSessions = async () => {
    try {
      const savedSessions = await window.electronAPI?.getData('collaborationSessions') || []
      setSessions(savedSessions)
    } catch (error) {
      console.error('Failed to load collaboration sessions:', error)
    }
  }

  const saveCollaborationSessions = async (updatedSessions: CollaborationSession[]) => {
    try {
      setSessions(updatedSessions)
      await window.electronAPI?.saveData('collaborationSessions', updatedSessions)
    } catch (error) {
      console.error('Failed to save collaboration sessions:', error)
    }
  }

  const createNewSession = async () => {
    if (!sessionTitle.trim()) return

    const newSession: CollaborationSession = {
      id: `collab_${Date.now()}`,
      title: sessionTitle,
      participants: ['You'],
      messages: [],
      sharedContent: [],
      createdAt: Date.now(),
      lastActivity: Date.now(),
      isActive: true
    }

    const updatedSessions = [...sessions, newSession]
    await saveCollaborationSessions(updatedSessions)
    setActiveSession(newSession)
    setSessionTitle('')
    setIsCreatingSession(false)
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeSession) return

    const message: CollaborationMessage = {
      id: `msg_${Date.now()}`,
      sender: 'You',
      content: newMessage,
      timestamp: Date.now(),
      type: 'text'
    }

    const updatedSession = {
      ...activeSession,
      messages: [...activeSession.messages, message],
      lastActivity: Date.now()
    }

    const updatedSessions = sessions.map(s => 
      s.id === activeSession.id ? updatedSession : s
    )

    await saveCollaborationSessions(updatedSessions)
    setActiveSession(updatedSession)
    setNewMessage('')

    // Use AI to generate contextual responses
    try {
      const aiResponse = await sendMessage({
        content: `In the context of collaboration session "${activeSession.title}", respond to: "${newMessage}". Provide helpful insights or suggestions.`,
        context: 'collaboration',
        url: window.location.href
      })

      if (aiResponse.success && aiResponse.result) {
        const aiMessage: CollaborationMessage = {
          id: `msg_${Date.now()}_ai`,
          sender: 'AI Assistant',
          content: aiResponse.result,
          timestamp: Date.now(),
          type: 'text'
        }

        const finalSession = {
          ...updatedSession,
          messages: [...updatedSession.messages, aiMessage],
          lastActivity: Date.now()
        }

        const finalSessions = sessions.map(s => 
          s.id === activeSession.id ? finalSession : s
        )

        await saveCollaborationSessions(finalSessions)
        setActiveSession(finalSession)
      }
    } catch (error) {
      console.error('AI response failed:', error)
    }
  }

  const shareContent = async () => {
    if (!sharedUrl.trim() || !activeSession) return

    setIsSharing(true)
    try {
      // Analyze the shared content with AI
      const analysis = await sendMessage({
        content: `Analyze this shared content: ${sharedUrl}. Provide a summary and key insights.`,
        context: 'content_analysis',
        url: window.location.href
      })

      const sharedContent: SharedContent = {
        id: `content_${Date.now()}`,
        title: `Shared: ${sharedUrl}`,
        type: 'url',
        content: sharedUrl,
        sharedBy: 'You',
        timestamp: Date.now(),
        comments: []
      }

      const updatedSession = {
        ...activeSession,
        sharedContent: [...activeSession.sharedContent, sharedContent],
        lastActivity: Date.now()
      }

      const updatedSessions = sessions.map(s => 
        s.id === activeSession.id ? updatedSession : s
      )

      await saveCollaborationSessions(updatedSessions)
      setActiveSession(updatedSession)
      setSharedUrl('')

      // Add AI analysis as a message
      if (analysis.success && analysis.result) {
        const analysisMessage: CollaborationMessage = {
          id: `msg_${Date.now()}_analysis`,
          sender: 'AI Assistant',
          content: `📊 Analysis of shared content: ${analysis.result}`,
          timestamp: Date.now(),
          type: 'text'
        }

        const finalSession = {
          ...updatedSession,
          messages: [...updatedSession.messages, analysisMessage],
          lastActivity: Date.now()
        }

        const finalSessions = sessions.map(s => 
          s.id === activeSession.id ? finalSession : s
        )

        await saveCollaborationSessions(finalSessions)
        setActiveSession(finalSession)
      }
    } catch (error) {
      console.error('Content sharing failed:', error)
    } finally {
      setIsSharing(false)
    }
  }

  const addComment = (contentId: string, comment: string) => {
    if (!comment.trim() || !activeSession) return

    const newComment: Comment = {
      id: `comment_${Date.now()}`,
      author: 'You',
      content: comment,
      timestamp: Date.now()
    }

    const updatedSession = {
      ...activeSession,
      sharedContent: activeSession.sharedContent.map(content => 
        content.id === contentId 
          ? { ...content, comments: [...content.comments, newComment] }
          : content
      ),
      lastActivity: Date.now()
    }

    const updatedSessions = sessions.map(s => 
      s.id === activeSession.id ? updatedSession : s
    )

    saveCollaborationSessions(updatedSessions)
    setActiveSession(updatedSession)
  }

  const exportSession = (session: CollaborationSession) => {
    const dataStr = JSON.stringify(session, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `collaboration_${session.title.replace(/\s+/g, '_')}.json`
    link.click()
    
    URL.revokeObjectURL(url)
  }

  return (
    <div className="collaboration-container">
      <div className="collaboration-header">
        <h2>🤝 Collaboration</h2>
        <div className="collaboration-actions">
          <button 
            onClick={() => setIsCreatingSession(true)}
            className="create-session-btn"
          >
            ➕ New Session
          </button>
        </div>
      </div>

      {isCreatingSession && (
        <div className="create-session-form">
          <div className="form-group">
            <label>Session Title:</label>
            <input
              type="text"
              value={sessionTitle}
              onChange={(e) => setSessionTitle(e.target.value)}
              placeholder="Enter session title..."
              className="session-title-input"
            />
          </div>
          <div className="form-actions">
            <button 
              onClick={createNewSession}
              disabled={!sessionTitle.trim()}
              className="create-btn"
            >
              Create Session
            </button>
            <button 
              onClick={() => setIsCreatingSession(false)}
              className="cancel-btn"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="collaboration-content">
        <div className="sessions-sidebar">
          <h3>📋 Sessions</h3>
          <div className="sessions-list">
            {sessions.length === 0 ? (
              <div className="empty-state">
                <p>No collaboration sessions</p>
                <p>Create a new session to get started</p>
              </div>
            ) : (
              sessions.map(session => (
                <div 
                  key={session.id} 
                  className={`session-item ${activeSession?.id === session.id ? 'active' : ''}`}
                  onClick={() => setActiveSession(session)}
                >
                  <div className="session-header">
                    <h4>{session.title}</h4>
                    <span className="session-date">
                      {new Date(session.lastActivity).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="session-stats">
                    <span>{session.participants.length} participants</span>
                    <span>{session.messages.length} messages</span>
                    <span>{session.sharedContent.length} shared items</span>
                  </div>
                  <div className="session-actions">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation()
                        exportSession(session)
                      }}
                      className="export-btn"
                    >
                      📄 Export
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="collaboration-workspace">
          {activeSession ? (
            <>
              <div className="workspace-header">
                <h3>{activeSession.title}</h3>
                <div className="workspace-info">
                  <span>{activeSession.participants.length} participants</span>
                  <span>Last activity: {new Date(activeSession.lastActivity).toLocaleString()}</span>
                </div>
              </div>

              <div className="shared-content-section">
                <h4>📎 Shared Content</h4>
                <div className="share-input">
                  <input
                    type="text"
                    value={sharedUrl}
                    onChange={(e) => setSharedUrl(e.target.value)}
                    placeholder="Share a URL or content..."
                    className="share-input-field"
                  />
                  <button 
                    onClick={shareContent}
                    disabled={!sharedUrl.trim() || isSharing}
                    className="share-btn"
                  >
                    {isSharing ? 'Sharing...' : 'Share'}
                  </button>
                </div>

                <div className="shared-content-list">
                  {activeSession.sharedContent.length === 0 ? (
                    <div className="empty-state">
                      <p>No shared content yet</p>
                    </div>
                  ) : (
                    activeSession.sharedContent.map(content => (
                      <div key={content.id} className="shared-content-item">
                        <div className="content-header">
                          <h5>{content.title}</h5>
                          <span className="content-meta">
                            Shared by {content.sharedBy} • {new Date(content.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <div className="content-body">
                          {content.type === 'url' ? (
                            <a href={content.content} target="_blank" rel="noopener noreferrer">
                              {content.content}
                            </a>
                          ) : (
                            <p>{content.content}</p>
                          )}
                        </div>
                        <div className="content-comments">
                          <h6>Comments ({content.comments.length})</h6>
                          {content.comments.map(comment => (
                            <div key={comment.id} className="comment">
                              <strong>{comment.author}:</strong> {comment.content}
                              <span className="comment-time">
                                {new Date(comment.timestamp).toLocaleString()}
                              </span>
                            </div>
                          ))}
                          <div className="add-comment">
                            <input
                              type="text"
                              placeholder="Add a comment..."
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  addComment(content.id, e.currentTarget.value)
                                  e.currentTarget.value = ''
                                }
                              }}
                              className="comment-input"
                            />
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="messages-section">
                <h4>💬 Messages</h4>
                <div className="messages-list">
                  {activeSession.messages.length === 0 ? (
                    <div className="empty-state">
                      <p>No messages yet</p>
                      <p>Start the conversation!</p>
                    </div>
                  ) : (
                    activeSession.messages.map(message => (
                      <div key={message.id} className={`message ${message.sender === 'You' ? 'user' : 'other'}`}>
                        <div className="message-header">
                          <strong>{message.sender}</strong>
                          <span className="message-time">
                            {new Date(message.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <div className="message-content">
                          {message.content}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="message-input">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="message-input-field"
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  />
                  <button 
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || isLoading}
                    className="send-message-btn"
                  >
                    Send
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="empty-workspace">
              <h3>Select a collaboration session</h3>
              <p>Choose a session from the sidebar or create a new one to start collaborating</p>
            </div>
          )}
        </div>
      </div>

      <div className="collaboration-features">
        <h3>🚀 Collaboration Features</h3>
        <div className="features-grid">
          <div className="feature-card">
            <h4>💬 Real-time Chat</h4>
            <p>AI-powered conversations with contextual responses</p>
          </div>
          <div className="feature-card">
            <h4>📎 Content Sharing</h4>
            <p>Share URLs, files, and content with automatic analysis</p>
          </div>
          <div className="feature-card">
            <h4>💭 Comments & Feedback</h4>
            <p>Add comments to shared content for better collaboration</p>
          </div>
          <div className="feature-card">
            <h4>📄 Session Export</h4>
            <p>Export collaboration sessions for record keeping</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Collaboration
