// AI Tab Content Display Component
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Tab } from '../types/electron'

interface AITabContentProps {
  tab: Tab
  onContentChange: (content: string) => void
}

const AITabContent: React.FC<AITabContentProps> = ({ tab, onContentChange }) => {
  const [content, setContent] = useState(tab.content || '')
  const [isEditing, setIsEditing] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Load content from local storage if available
    loadTabContent()
  }, [tab.id, loadTabContent])

  useEffect(() => {
    // Auto-save content changes with debouncing
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = setTimeout(() => {
      if (content !== tab.content) {
        saveContent()
      }
    }, 1000) // Save after 1 second of no changes

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [content, tab.content])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

  const loadTabContent = useCallback(async () => {
    try {
      if (window.electronAPI && window.electronAPI.loadAITabContent) {
        const result = await window.electronAPI.loadAITabContent(tab.id)
        if (result && result.success && result.content) {
          setContent(result.content)
        }
      }
    } catch (error) {
      console.error('Failed to load AI tab content:', error)
      setSaveStatus('error')
    }
  }, [tab.id])

  const saveContent = useCallback(async () => {
    try {
      setSaveStatus('saving')
      onContentChange(content)
      
      if (window.electronAPI && window.electronAPI.saveAITabContent) {
        const result = await window.electronAPI.saveAITabContent(tab.id, content)
        if (result && result.success) {
          setLastSaved(new Date())
          setSaveStatus('saved')
        } else {
          setSaveStatus('error')
        }
      }
    } catch (error) {
      console.error('Failed to save AI tab content:', error)
      setSaveStatus('error')
    }
  }, [content, onContentChange, tab.id])

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Handle tab key for indentation
    if (e.key === 'Tab') {
      e.preventDefault()
      const start = e.currentTarget.selectionStart
      const end = e.currentTarget.selectionEnd
      const newContent = content.substring(0, start) + '  ' + content.substring(end)
      setContent(newContent)
      
      // Restore cursor position
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2
        }
      }, 0)
    }
  }

  const insertImage = () => {
    const imageUrl = prompt('Enter image URL:')
    if (imageUrl && imageUrl.trim()) {
      const imageMarkdown = `\n\n![Image](${imageUrl.trim()})\n\n`
      const cursorPos = textareaRef.current?.selectionStart || content.length
      const newContent = content.substring(0, cursorPos) + imageMarkdown + content.substring(cursorPos)
      setContent(newContent)
      
      // Focus back to textarea
      setTimeout(() => {
        textareaRef.current?.focus()
      }, 0)
    }
  }

  const insertTable = () => {
    const tableMarkdown = `\n\n| Column 1 | Column 2 | Column 3 |\n|----------|----------|----------|\n| Row 1    | Data     | Data     |\n| Row 2    | Data     | Data     |\n\n`
    const cursorPos = textareaRef.current?.selectionStart || content.length
    const newContent = content.substring(0, cursorPos) + tableMarkdown + content.substring(cursorPos)
    setContent(newContent)
    
    // Focus back to textarea
    setTimeout(() => {
      textareaRef.current?.focus()
    }, 0)
  }

  const insertCodeBlock = () => {
    const codeMarkdown = `\n\n\`\`\`\n// Your code here\n\`\`\`\n\n`
    const cursorPos = textareaRef.current?.selectionStart || content.length
    const newContent = content.substring(0, cursorPos) + codeMarkdown + content.substring(cursorPos)
    setContent(newContent)
    
    // Focus back to textarea and position cursor inside code block
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus()
        const newPos = cursorPos + 5 // Position after ```\n
        textareaRef.current.selectionStart = textareaRef.current.selectionEnd = newPos
      }
    }, 0)
  }

  const formatLastSaved = () => {
    if (!lastSaved) return 'Never'
    try {
      return lastSaved.toLocaleTimeString()
    } catch (error) {
      return 'Invalid time'
    }
  }

  const getSaveStatusText = () => {
    switch (saveStatus) {
      case 'saving': return 'Saving...'
      case 'error': return 'Save failed'
      case 'saved': return `Last saved: ${formatLastSaved()}`
      default: return 'Not saved'
    }
  }

  const getSaveStatusClass = () => {
    switch (saveStatus) {
      case 'saving': return 'saving'
      case 'error': return 'error'
      case 'saved': return 'saved'
      default: return ''
    }
  }

  const getWordCount = (text: string): number => {
    return text.split(/\s+/).filter(w => w.length > 0).length
  }

  const getLineCount = (text: string): number => {
    return text.split('\n').length
  }

  return (
    <div className="ai-tab-content">
      <div className="ai-tab-header">
        <h2 className="ai-tab-title">{tab.title || 'AI Tab'}</h2>
        <div className="ai-tab-actions">
          <span className={`save-status ${getSaveStatusClass()}`}>
            {getSaveStatusText()}
          </span>
          <button 
            className="toolbar-btn"
            onClick={insertImage}
            title="Insert Image"
            aria-label="Insert Image"
          >
            🖼️
          </button>
          <button 
            className="toolbar-btn"
            onClick={insertTable}
            title="Insert Table"
            aria-label="Insert Table"
          >
            📊
          </button>
          <button 
            className="toolbar-btn"
            onClick={insertCodeBlock}
            title="Insert Code Block"
            aria-label="Insert Code Block"
          >
            💻
          </button>
          <button 
            className="toolbar-btn"
            onClick={() => setIsEditing(!isEditing)}
            title={isEditing ? "Preview Mode" : "Edit Mode"}
            aria-label={isEditing ? "Switch to preview mode" : "Switch to edit mode"}
          >
            {isEditing ? '👁️' : '✏️'}
          </button>
        </div>
      </div>
      
      <div className="ai-tab-body">
        {isEditing ? (
          <textarea
            ref={textareaRef}
            className="ai-content-editor"
            value={content}
            onChange={handleContentChange}
            onKeyDown={handleKeyDown}
            placeholder="Start writing your content here...

You can use:
- **bold text**
- *italic text*
- # Headers
- - Lists
- Links: [text](url)
- Images: ![alt](url)
- Tables: | col1 | col2 |
- Code: ```code```"
          />
        ) : (
          <div className="ai-content-preview">
            <div 
              className="markdown-content"
              dangerouslySetInnerHTML={{ 
                __html: renderMarkdown(content) 
              }}
            />
          </div>
        )}
      </div>
      
      <div className="ai-tab-footer">
        <div className="content-stats">
          <span>Characters: {content.length}</span>
          <span>Words: {getWordCount(content)}</span>
          <span>Lines: {getLineCount(content)}</span>
        </div>
        <div className="tab-info">
          <span className="tab-type">AI Content</span>
          <span className="created-by">Created by: {tab.createdBy || 'user'}</span>
        </div>
      </div>
    </div>
  )
}

// Enhanced markdown renderer with better error handling
const renderMarkdown = (text: string): string => {
  try {
    let html = text
      // Headers
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      // Code blocks
      .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
      // Inline code
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      // Images
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; height: auto;" />')
      // Line breaks
      .replace(/\n/g, '<br>')
      // Lists (basic implementation)
      .replace(/^- (.*$)/gim, '<li>$1</li>')

    // Wrap consecutive list items in ul tags
    html = html.replace(/(<li>.*?<\/li>(\s*<br>\s*<li>.*?<\/li>)*)/g, '<ul>$1</ul>')
    
    // Clean up extra br tags around ul
    html = html.replace(/<br>\s*<ul>/g, '<ul>').replace(/<\/ul>\s*<br>/g, '</ul>')

    return html
  } catch (error) {
    console.error('Markdown rendering error:', error)
    // Return escaped plain text as fallback
    return text.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>')
  }
}

export default AITabContent