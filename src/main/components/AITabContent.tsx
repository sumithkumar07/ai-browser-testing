// AI Tab Content Display Component
import React, { useState, useEffect, useRef } from 'react'
import { Tab } from '../types/electron'

interface AITabContentProps {
  tab: Tab
  onContentChange: (content: string) => void
}

const AITabContent: React.FC<AITabContentProps> = ({ tab, onContentChange }) => {
  const [content, setContent] = useState(tab.content || '')
  const [isEditing, setIsEditing] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    // Load content from local storage if available
    loadTabContent()
  }, [tab.id])

  useEffect(() => {
    // Auto-save content changes
    const saveTimeout = setTimeout(() => {
      if (content !== tab.content) {
        saveContent()
      }
    }, 1000) // Save after 1 second of no changes

    return () => clearTimeout(saveTimeout)
  }, [content])

  const loadTabContent = async () => {
    try {
      if (window.electronAPI.loadAITabContent) {
        const loadedContent = await window.electronAPI.loadAITabContent(tab.id)
        if (loadedContent && loadedContent.content) {
          setContent(loadedContent.content)
        }
      }
    } catch (error) {
      console.error('Failed to load AI tab content:', error)
    }
  }

  const saveContent = async () => {
    try {
      onContentChange(content)
      if (window.electronAPI.saveAITabContent) {
        await window.electronAPI.saveAITabContent(tab.id, content)
        setLastSaved(new Date())
      }
    } catch (error) {
      console.error('Failed to save AI tab content:', error)
    }
  }

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
    if (imageUrl) {
      const imageMarkdown = `\n\n![Image](${imageUrl})\n\n`
      const cursorPos = textareaRef.current?.selectionStart || content.length
      const newContent = content.substring(0, cursorPos) + imageMarkdown + content.substring(cursorPos)
      setContent(newContent)
    }
  }

  const insertTable = () => {
    const tableMarkdown = `\n\n| Column 1 | Column 2 | Column 3 |\n|----------|----------|----------|\n| Row 1    | Data     | Data     |\n| Row 2    | Data     | Data     |\n\n`
    const cursorPos = textareaRef.current?.selectionStart || content.length
    const newContent = content.substring(0, cursorPos) + tableMarkdown + content.substring(cursorPos)
    setContent(newContent)
  }

  const formatLastSaved = () => {
    if (!lastSaved) return 'Never'
    return lastSaved.toLocaleTimeString()
  }

  return (
    <div className="ai-tab-content">
      <div className="ai-tab-header">
        <h2 className="ai-tab-title">{tab.title}</h2>
        <div className="ai-tab-actions">
          <span className="last-saved">Last saved: {formatLastSaved()}</span>
          <button 
            className="toolbar-btn"
            onClick={insertImage}
            title="Insert Image"
          >
            🖼️
          </button>
          <button 
            className="toolbar-btn"
            onClick={insertTable}
            title="Insert Table"
          >
            📊
          </button>
          <button 
            className="toolbar-btn"
            onClick={() => setIsEditing(!isEditing)}
            title="Toggle Edit Mode"
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
- Tables: | col1 | col2 |"
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
          <span>Words: {content.split(/\s+/).filter(w => w.length > 0).length}</span>
          <span>Lines: {content.split('\n').length}</span>
        </div>
        <div className="tab-info">
          <span className="tab-type">AI Content</span>
          <span className="created-by">Created by: {tab.createdBy || 'user'}</span>
        </div>
      </div>
    </div>
  )
}

// Simple markdown renderer
const renderMarkdown = (text: string): string => {
  let html = text
    // Headers
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
    // Images
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; height: auto;" />')
    // Line breaks
    .replace(/\n/g, '<br>')
    // Lists
    .replace(/^- (.*$)/gim, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')

  return html
}

export default AITabContent